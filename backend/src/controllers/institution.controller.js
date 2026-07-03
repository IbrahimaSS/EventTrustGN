const InstitutionReference = require('../models/InstitutionReference');
const Institution = require('../models/Institution');
const InstitutionAccessRequest = require('../models/InstitutionAccessRequest');
const Log = require('../models/Log');
const User = require('../models/User');

// @desc    Rechercher une institution dans le répertoire national
// @route   GET /api/institutions/search?q=motcle
// @access  Public
const searchInstitutions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Le paramètre de recherche 'q' est requis." });
    }

    // Recherche par texte (nécessite l'index 'text' dans le modèle)
    const references = await InstitutionReference.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(references);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la recherche.", error: error.message });
  }
};

// @desc    Réclamer une institution existante dans le répertoire
// @route   POST /api/institutions/claim-reference/:referenceId
// @access  Private
const claimInstitutionReference = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const { fullName, function: userFunction, phone, email, message } = req.body;

    const reference = await InstitutionReference.findById(referenceId);
    if (!reference) {
      return res.status(404).json({ message: "Institution non trouvée dans le répertoire." });
    }

    if (reference.eventTrustInstitutionId) {
      return res.status(400).json({ message: "Cette institution a déjà été réclamée et est active sur EventTrust GN." });
    }

    // Créer la demande d'accès (qui devra être validée par le Super Admin)
    const accessRequest = await InstitutionAccessRequest.create({
      institutionReferenceId: reference._id,
      requesterId: req.user._id,
      fullName,
      function: userFunction,
      phone,
      email,
      message,
      status: 'pending'
    });

    res.status(201).json({ 
      message: "Demande de réclamation envoyée avec succès. Elle sera étudiée par nos administrateurs.",
      request: accessRequest
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la réclamation.", error: error.message });
  }
};

// @desc    Créer une institution manuellement (hors répertoire)
// @route   POST /api/institutions/create-manual
// @access  Private
const createManualInstitution = async (req, res) => {
  try {
    const { name, acronym, type, city, address, eventTrustPageSlug, description } = req.body;

    const existingSlug = await Institution.findOne({ eventTrustPageSlug });
    if (existingSlug) {
      return res.status(400).json({ message: "Ce slug (lien personnalisé) est déjà pris." });
    }

    const institution = await Institution.create({
      name,
      acronym,
      type,
      city,
      address,
      eventTrustPageSlug,
      description,
      status: 'pending', // Doit être validé par un Super Admin
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Institution créée et en attente de validation.",
      institution
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'institution.", error: error.message });
  }
};

// @desc    Approuver une demande d'accès (Création d'institution depuis référence)
// @route   PATCH /api/institutions/request/:id/approve
// @access  Private (Super Admin)
const approveAccessRequest = async (req, res) => {
  try {
    const request = await InstitutionAccessRequest.findById(req.params.id).populate('institutionReferenceId');
    
    if (!request) {
      return res.status(404).json({ message: "Demande non trouvée." });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: "Cette demande a déjà été traitée." });
    }

    // Créer la véritable institution basée sur la référence
    const ref = request.institutionReferenceId;
    const institution = await Institution.create({
      referenceId: ref._id,
      name: ref.name,
      acronym: ref.acronym,
      type: ref.type,
      city: ref.city,
      status: 'active',
      isVerified: true,
      createdBy: request.requesterId,
      approvedBy: req.user._id,
      approvedAt: Date.now()
    });

    // Lier la référence à l'institution
    ref.eventTrustInstitutionId = institution._id;
    await ref.save();

    // Mettre à jour la demande
    request.status = 'approved';
    request.institutionId = institution._id;
    request.approvedBy = req.user._id;
    request.approvedAt = Date.now();
    await request.save();

    // Mettre à jour l'utilisateur avec le rôle Admin Institution
    const user = await User.findById(request.requesterId);
    user.role = 'Admin Institution';
    user.institutionId = institution._id;
    await user.save();

    res.json({ message: "Demande approuvée. L'institution est maintenant active.", institution });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'approbation.", error: error.message });
  }
};

// @desc    Lister toutes les institutions (publiques)
// @route   GET /api/institutions
// @access  Public
const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({ status: 'active' })
      .select('-approvedBy -createdBy')
      .lean();

    const enriched = [];
    for (const inst of institutions) {
      const eventsCount = await Event.countDocuments({ institutionId: inst._id, status: 'published' });
      enriched.push({
        ...inst,
        eventsCount
      });
    }

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Récupérer les détails d'une institution (publique)
// @route   GET /api/institutions/:slug
// @access  Public
const getInstitutionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let institution = await Institution.findOne({ eventTrustPageSlug: slug, status: 'active' }).lean();
    
    // Fallback to _id if slug not found (just in case)
    if (!institution && slug.match(/^[0-9a-fA-F]{24}$/)) {
      institution = await Institution.findOne({ _id: slug, status: 'active' }).lean();
    }

    if (!institution) {
      return res.status(404).json({ message: "Institution introuvable." });
    }

    const events = await Event.find({ institutionId: institution._id, status: 'published' })
      .select('title slug startDate type registrationType city coverUrl')
      .sort({ startDate: 1 });

    res.json({
      ...institution,
      events
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Récupérer le profil de l'institution de l'utilisateur connecté
// @route   GET /api/institutions/me
// @access  Private (Admin Institution)
const getMyInstitutionProfile = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes lié à aucune institution." });
    }
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: "Institution introuvable." });
    }
    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Mettre à jour le profil de l'institution de l'utilisateur connecté
// @route   PUT /api/institutions/me
// @access  Private (Admin Institution)
const updateMyInstitutionProfile = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes lié à aucune institution." });
    }

    const {
      name, acronym, type, description, email, phone, websiteUrl, address, logoUrl, settings
    } = req.body;

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: "Institution introuvable." });
    }

    // Snapshot old values for comparison
    const oldValues = {
      name: institution.name,
      acronym: institution.acronym,
      type: institution.type,
      description: institution.description,
      email: institution.email,
      phone: institution.phone,
      websiteUrl: institution.websiteUrl,
      address: institution.address,
      logoUrl: institution.logoUrl,
      settings: JSON.stringify(institution.settings)
    };

    if (name) institution.name = name;
    if (acronym !== undefined) institution.acronym = acronym;
    if (type) institution.type = type;
    if (description !== undefined) institution.description = description;
    if (email !== undefined) institution.email = email;
    if (phone !== undefined) institution.phone = phone;
    if (websiteUrl !== undefined) institution.websiteUrl = websiteUrl;
    if (address !== undefined) institution.address = address;
    if (logoUrl !== undefined) institution.logoUrl = logoUrl;
    
    if (settings) {
      institution.settings = { ...institution.settings, ...settings };
    }

    await institution.save();

    // Detect only fields that actually changed
    const changes = [];
    if (name && name !== oldValues.name) changes.push('nom');
    if (acronym !== undefined && acronym !== oldValues.acronym) changes.push('sigle');
    if (type && type !== oldValues.type) changes.push('type');
    if (description !== undefined && description !== oldValues.description) changes.push('description');
    if (email !== undefined && email !== oldValues.email) changes.push('email');
    if (phone !== undefined && phone !== oldValues.phone) changes.push('téléphone');
    if (websiteUrl !== undefined && websiteUrl !== oldValues.websiteUrl) changes.push('site web');
    if (address !== undefined && address !== oldValues.address) changes.push('adresse');
    if (logoUrl !== undefined && logoUrl !== oldValues.logoUrl) changes.push('logo');
    if (settings && JSON.stringify(institution.settings) !== oldValues.settings) changes.push('paramètres');

    if (changes.length > 0) {
      await Log.create({
        userId: req.user._id,
        institutionId: institutionId,
        action: `Mise à jour : ${changes.join(', ')}`,
        description: `Champs modifiés : ${changes.join(', ')}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Inconnue'
      });
    }

    res.json({ message: "Profil mis à jour avec succès", institution });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour.", error: error.message });
  }
};

// @desc    Get institution logs
// @route   GET /api/institutions/me/logs
// @access  Private (Admin Institution)
const getMyInstitutionLogs = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes pas associé à une institution." });
    }

    const logs = await Log.find({ institutionId })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 logs

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des logs." });
  }
};

// @desc    Clear institution logs
// @route   DELETE /api/institutions/me/logs
// @access  Private (Admin Institution)
const clearMyInstitutionLogs = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes pas associé à une institution." });
    }

    await Log.deleteMany({ institutionId });

    // Optional: Log the fact that logs were cleared! (This will be the only log left)
    await Log.create({
      userId: req.user._id,
      institutionId: institutionId,
      action: "Suppression du journal d'audit",
      description: "L'utilisateur a vidé l'historique complet des logs.",
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Inconnue'
    });

    res.json({ message: "Logs effacés avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression des logs." });
  }
};

const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Lister toutes les institutions (Super Admin)
// @route   GET /api/institutions/admin/all
// @access  Private (Super Admin)
const getAllInstitutionsAdmin = async (req, res) => {
  try {
    const institutions = await Institution.find()
      .select('name acronym type city address email phone logoUrl websiteUrl status isVerified createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = [];
    for (const inst of institutions) {
      const eventsCount = await Event.countDocuments({ institutionId: inst._id });
      const eventIds = await Event.find({ institutionId: inst._id }).select('_id');
      const ids = eventIds.map(e => e._id);
      const registrationsCount = await Registration.countDocuments({ eventId: { $in: ids } });

      enriched.push({
        ...inst,
        sigle: inst.acronym || inst.name.substring(0, 4).toUpperCase(),
        eventsCount,
        registrationsCount
      });
    }

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Changer le statut d'une institution (approuver, suspendre)
// @route   PATCH /api/institutions/admin/:id/status
// @access  Private (Super Admin)
const updateInstitutionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution introuvable." });
    }

    institution.status = status;
    if (status === 'active') {
      institution.isVerified = true;
      institution.approvedBy = req.user._id;
      institution.approvedAt = Date.now();

      // Assign the creator as Admin Institution if not already
      if (institution.createdBy) {
        const creator = await User.findById(institution.createdBy);
        if (creator && creator.role === 'Participant') {
          creator.role = 'Admin Institution';
          creator.institutionId = institution._id;
          await creator.save();
        }
      }
    }

    await institution.save();

    res.json({ message: `Institution mise à jour : ${status}`, institution });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { 
  searchInstitutions, 
  claimInstitutionReference, 
  createManualInstitution, 
  approveAccessRequest,
  getInstitutions,
  getInstitutionBySlug,
  getMyInstitutionProfile,
  updateMyInstitutionProfile,
  getMyInstitutionLogs,
  clearMyInstitutionLogs,
  getAllInstitutionsAdmin,
  updateInstitutionStatus
};

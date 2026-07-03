const Event = require('../models/Event');
const Institution = require('../models/Institution');
const Log = require('../models/Log');
const { generateUniqueCode } = require('../utils/generateCode');
const { generateEventQRCode } = require('../services/qrcode.service');
const Registration = require('../models/Registration');

// @desc    Créer un événement (Brouillon)
// @route   POST /api/events
// @access  Private (Admin Institution, Responsable Communication)
const createEvent = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes rattaché à aucune institution." });
    }

    const { 
      title, description, city, location, startDate, endDate, 
      startTime, endTime, categoryId, maxParticipants, 
      registrationRequired, registrationType, price, currency,
      posterUrl, conditions
    } = req.body;

    // Génération d'un slug de base basé sur le titre (à améliorer plus tard avec une vraie lib slugify)
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    // Mongoose expects an ObjectId for categoryId, but frontend sends strings like 'tech'.
    // For now, if categoryId is not a valid ObjectId (length 24), we set it to null or undefined.
    let validCategoryId = undefined;
    if (categoryId && categoryId.length === 24) {
      validCategoryId = categoryId;
    }

    const event = await Event.create({
      institutionId,
      categoryId: validCategoryId,
      title,
      slug: baseSlug,
      description,
      city,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      maxParticipants,
      registrationRequired,
      registrationType,
      price,
      currency,
      paymentRequired: registrationType === 'paid',
      imageUrl: posterUrl,
      conditions,
      status: 'draft',
      createdBy: req.user._id
    });

    // Audit log
    await Log.create({
      userId: req.user._id,
      institutionId: institutionId,
      eventId: event._id,
      action: `Création événement "${title}"`,
      description: `Nouvel événement créé en brouillon`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Inconnue'
    });

    res.status(201).json({ message: "Événement créé en tant que brouillon.", event });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création.", error: error.message });
  }
};

// @desc    Publier officiellement un événement
// @route   PATCH /api/events/:id/publish
// @access  Private (Admin Institution, Responsable Communication)
const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    if (event.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé à modifier cet événement." });
    }

    if (event.status === 'published') {
      return res.status(400).json({ message: "L'événement est déjà publié." });
    }

    // Génération du code unique de publication (ex: EVT-ABC12-XYZ)
    const publicationCode = generateUniqueCode('EVT');
    event.publicationCode = publicationCode;
    
    // Génération du QR Code
    const qrCodeDataURI = await generateEventQRCode(publicationCode);
    event.qrCodeData = qrCodeDataURI;

    event.status = 'published';
    event.publishedAt = Date.now();
    event.updatedBy = req.user._id;

    await event.save();

    // Audit log
    await Log.create({
      userId: req.user._id,
      institutionId: event.institutionId,
      eventId: event._id,
      action: `Publication événement "${event.title}"`,
      description: `Événement publié avec code: ${publicationCode}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Inconnue'
    });

    res.json({ message: "Événement publié officiellement avec succès !", event });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la publication.", error: error.message });
  }
};

// @desc    Récupérer les détails d'un événement (Public)
// @route   GET /api/events/code/:code
// @access  Public
const getEventByCode = async (req, res) => {
  try {
    const event = await Event.findOne({ publicationCode: req.params.code })
                             .populate('institutionId', 'name acronym logoUrl eventTrustPageSlug city isVerified')
                             .populate('categoryId', 'name icon');

    if (!event) {
      return res.status(404).json({ message: "L'événement n'existe pas ou le code est invalide." });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération.", error: error.message });
  }
};

// @desc    Récupérer les détails d'un événement par slug (Public)
// @route   GET /api/events/slug/:slug
// @access  Public
const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug })
                             .populate('institutionId', 'name acronym logoUrl eventTrustPageSlug city isVerified')
                             .populate('categoryId', 'name icon');

    if (!event) {
      return res.status(404).json({ message: "L'événement n'existe pas." });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération.", error: error.message });
  }
};

// @desc    Lister les événements publics
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' })
                              .populate('institutionId', 'name logoUrl city')
                              .populate('categoryId', 'name')
                              .sort('-publishedAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération.", error: error.message });
  }
};

// @desc    Lister les événements de l'institution connectée
// @route   GET /api/events/institution
// @access  Private (Admin Institution, Responsable Communication)
const getInstitutionEvents = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes rattaché à aucune institution." });
    }

    const events = await Event.find({ institutionId })
                              .populate('categoryId', 'name')
                              .sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des événements.", error: error.message });
  }
};
// @desc    Récupérer un événement par ID (pour édition)
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('institutionId', 'name logoUrl city')
      .populate('categoryId', 'name');
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération.", error: error.message });
  }
};

// @desc    Mettre à jour un événement
// @route   PUT /api/events/:id
// @access  Private (Admin Institution, Responsable Communication)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    if (event.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé à modifier cet événement." });
    }

    const { 
      title, description, city, location, startDate, endDate, 
      startTime, endTime, maxParticipants, 
      registrationType, price, posterUrl, conditions
    } = req.body;

    // Update fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (city) event.city = city;
    if (location) event.location = location;
    if (startDate) event.startDate = startDate;
    if (endDate !== undefined) event.endDate = endDate;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (registrationType) event.registrationType = registrationType;
    if (price !== undefined) event.price = price;
    if (posterUrl !== undefined) event.imageUrl = posterUrl;
    if (conditions !== undefined) event.conditions = conditions;

    event.paymentRequired = (registrationType || event.registrationType) === 'paid';
    event.updatedBy = req.user._id;

    await event.save();

    res.json({ message: "Événement mis à jour avec succès.", event });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour.", error: error.message });
  }
};

// @desc    Lister tous les événements (Super Admin)
// @route   GET /api/events/admin/all
// @access  Private (Super Admin)
const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('institutionId', 'name acronym city')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const formattedEvents = [];
    for (const ev of events) {
      const participantsCount = await Registration.countDocuments({ eventId: ev._id });
      
      // Map status for frontend
      let mappedStatus = ev.status;
      if (ev.status === 'published') mappedStatus = 'active';
      else if (ev.status === 'draft') mappedStatus = 'pending';

      formattedEvents.push({
        id: ev._id,
        title: ev.title,
        institution: ev.institutionId ? (ev.institutionId.acronym || ev.institutionId.name) : 'Inconnu',
        date: ev.startDate ? new Date(ev.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        time: ev.startTime ? `${ev.startTime} - ${ev.endTime || ''}` : '—',
        location: ev.location || ev.city || 'Non défini',
        participants: participantsCount,
        maxParticipants: ev.maxParticipants || 100,
        status: mappedStatus,
        type: ev.categoryId ? ev.categoryId.name : 'Divers',
        price: ev.paymentRequired ? `${ev.price} ${ev.currency || 'GNF'}` : 'Gratuit'
      });
    }

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Changer le statut d'un événement (Super Admin)
// @route   PATCH /api/events/admin/:id/status
// @access  Private (Super Admin)
const updateEventStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Événement introuvable." });
    }

    // Map frontend status to backend status
    let dbStatus = status;
    if (status === 'active') dbStatus = 'published';
    else if (status === 'pending') dbStatus = 'draft';
    else if (status === 'suspended') dbStatus = 'suspended';

    event.status = dbStatus;
    event.updatedBy = req.user._id;
    await event.save();

    // Audit log
    await Log.create({
      userId: req.user._id,
      institutionId: event.institutionId,
      eventId: event._id,
      action: `Modification statut événement`,
      description: `Le Super Admin a changé le statut de "${event.title}" à ${dbStatus}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Inconnue'
    });

    res.json({ message: `Statut de l'événement mis à jour : ${status}`, event });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { createEvent, publishEvent, getEventByCode, getEventBySlug, getEvents, getInstitutionEvents, getEventById, updateEvent, getAllEventsAdmin, updateEventStatusAdmin };

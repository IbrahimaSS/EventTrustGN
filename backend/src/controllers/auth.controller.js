const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Log = require('../models/Log');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "Veuillez fournir tous les champs requis." });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: "L'utilisateur avec cet email ou téléphone existe déjà." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: role || 'Participant'
    });

    let institution = null;
    if (role === 'Admin Institution') {
      const Institution = require('../models/Institution');
      institution = await Institution.create({
        name: req.body.institutionName || 'À configurer',
        type: req.body.institutionType || 'Autre',
        city: req.body.city || 'Conakry',
        email: req.body.officialEmail || email,
        phone: req.body.officialPhone || phone,
        status: 'pending',
        createdBy: user._id
      });
      user.institutionId = institution._id;
      await user.save();
    }

    if (user) {
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: institution ? { status: institution.status, _id: institution._id } : null,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: "Données utilisateur invalides." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de l'inscription.", error: error.message });
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId peut être email ou téléphone

    const user = await User.findOne({ 
      $or: [{ email: loginId }, { phone: loginId }] 
    }).populate('institutionId', 'status name logoUrl');

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      user.lastLoginAt = new Date();
      await user.save();

      // Audit log for login
      if (user.institutionId) {
        await Log.create({
          userId: user._id,
          institutionId: user.institutionId._id,
          action: 'Connexion réussie',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Inconnue'
        });
      }

      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: user.institutionId ? { status: user.institutionId.status, _id: user.institutionId._id, name: user.institutionId.name, logoUrl: user.institutionId.logoUrl } : null,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Identifiants invalides." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la connexion.", error: error.message });
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').populate('institutionId', 'status name logoUrl');
    
    // Formater la réponse pour correspondre au login
    const userResponse = user.toObject();
    if (userResponse.institutionId) {
      userResponse.institution = {
        _id: userResponse.institutionId._id,
        status: userResponse.institutionId.status,
        name: userResponse.institutionId.name,
        logoUrl: userResponse.institutionId.logoUrl
      };
      delete userResponse.institutionId;
    }
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du profil." });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const { fullName, phone, avatar, academicInstitution, studyLevel, city } = req.body;

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar; // Allow null to clear avatar
    if (academicInstitution !== undefined) user.academicInstitution = academicInstitution;
    if (studyLevel !== undefined) user.studyLevel = studyLevel;
    if (city !== undefined) user.city = city;

    await user.save();

    res.json({
      _id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      academicInstitution: user.academicInstitution,
      studyLevel: user.studyLevel,
      city: user.city,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil." });
  }
};

// @desc    Modifier le mot de passe
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Veuillez fournir l'actuel et le nouveau mot de passe." });
    }

    const user = await User.findById(req.user._id);

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Le mot de passe actuel est incorrect." });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du mot de passe." });
  }
};

// @desc    Lister tous les utilisateurs (Super Admin)
// @route   GET /api/auth/admin/users
// @access  Private (Super Admin)
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select('fullName email phone role institutionId city isActive createdAt lastLoginAt')
      .populate('institutionId', 'sigle name acronym')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Changer le statut d'un utilisateur (actif/suspendu)
// @route   PATCH /api/auth/admin/users/:id/status
// @access  Private (Super Admin)
const updateUserStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    
    // Empêcher de suspendre le super admin principal
    if (user.email === 'africode230@gmail.com' && status === 'suspended') {
       return res.status(403).json({ message: "Action non autorisée sur ce compte." });
    }

    user.isActive = status === 'active';
    await user.save();
    
    res.json({ message: `Statut mis à jour : ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { register, login, getMe, updateMe, updatePassword, getAllUsersAdmin, updateUserStatusAdmin };

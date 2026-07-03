const User = require('../models/User');

// @desc    Lister les utilisateurs (Super Admin)
// @route   GET /api/users
// @access  Private (Super Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').populate('institutionId', 'name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Obtenir un utilisateur
// @route   GET /api/users/:id
// @access  Private (Super Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash').populate('institutionId', 'name');
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Modifier le rôle d'un utilisateur
// @route   PATCH /api/users/:id/role
// @access  Private (Super Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: "Rôle mis à jour avec succès", user: { _id: user._id, fullName: user.fullName, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Modifier le statut d'un utilisateur (actif/inactif)
// @route   PATCH /api/users/:id/status
// @access  Private (Super Admin)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({ message: `Le compte est maintenant ${isActive ? 'actif' : 'inactif'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUserRole, updateUserStatus };

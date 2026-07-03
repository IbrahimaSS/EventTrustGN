const Category = require('../models/Category');

// @desc    Lister toutes les catégories actives
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Créer une nouvelle catégorie
// @route   POST /api/categories
// @access  Private (Super Admin)
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Une catégorie avec ce slug existe déjà." });
    }

    const category = await Category.create({ name, slug, description, icon });
    res.status(201).json({ message: "Catégorie créée.", category });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création.", error: error.message });
  }
};

module.exports = { getCategories, createCategory };

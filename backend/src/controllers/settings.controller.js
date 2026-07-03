const PlatformSettings = require('../models/PlatformSettings');

// @desc    Get Platform Settings
// @route   GET /api/settings
// @access  Private (Super Admin)
const getSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des paramètres.", error: error.message });
  }
};

// @desc    Update Platform Settings
// @route   PATCH /api/settings
// @access  Private (Super Admin)
const updateSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    const { general, branding, aiAssistant, betaFeatures, customization, security } = req.body;

    if (general) settings.general = { ...settings.general, ...general };
    if (branding) settings.branding = { ...settings.branding, ...branding };
    if (aiAssistant) {
      settings.aiAssistant = { 
        ...settings.aiAssistant, 
        ...aiAssistant,
        features: {
          ...settings.aiAssistant.features,
          ...(aiAssistant.features || {})
        }
      };
    }
    if (betaFeatures) settings.betaFeatures = { ...settings.betaFeatures, ...betaFeatures };
    if (customization) settings.customization = { ...settings.customization, ...customization };
    if (security) settings.security = { ...settings.security, ...security };

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres.", error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};

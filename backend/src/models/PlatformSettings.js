const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  // Informations Globales
  general: {
    platformName: { type: String, default: 'EventTrust GN' },
    supportEmail: { type: String, default: 'support@eventtrust.gn' },
    phone: { type: String, default: '+224 600 00 00 00' },
    website: { type: String, default: 'www.eventtrust.gn' },
    address: { type: String, default: 'Conakry, Guinée' },
    timezone: { type: String, default: 'Africa/Conakry (GMT+0)' },
    language: { type: String, default: 'Français' }
  },

  // Logo
  branding: {
    logoUrl: { type: String, default: null },
    showLogoText: { type: Boolean, default: true }
  },

  // Assistant IA
  aiAssistant: {
    name: { type: String, default: 'ARIA' },
    role: { type: String, default: "Je suis ARIA, l'assistante intelligente d'EventTrust GN. Je vous aide à gérer vos événements, vérifier vos tickets et naviguer sur la plateforme." },
    tone: { type: String, default: 'pro' },
    features: {
      qna: { type: Boolean, default: true },
      ticket: { type: Boolean, default: true },
      suggest: { type: Boolean, default: true },
      mod: { type: Boolean, default: false },
      fraud: { type: Boolean, default: true },
      report: { type: Boolean, default: false }
    }
  },

  // Beta Features
  betaFeatures: {
    globalAi: { type: Boolean, default: true },
    darkModeForced: { type: Boolean, default: false },
    pushNotifs: { type: Boolean, default: true },
    offlineScan: { type: Boolean, default: false },
    weeklyReports: { type: Boolean, default: true },
    publicApi: { type: Boolean, default: false }
  },

  // Personnalisation (Customization)
  customization: {
    primaryColor: { type: String, default: '#3b82f6' },
    secondaryColor: { type: String, default: '#f59e0b' },
    accentColor: { type: String, default: '#8b5cf6' },
    successColor: { type: String, default: '#22c55e' },
    dangerColor: { type: String, default: '#ef4444' },
    neutralColor: { type: String, default: '#6b7280' },
    
    useGradient: { type: Boolean, default: false },
    selectedGradientId: { type: Number, default: 1 },
    
    selectedFont: { type: String, default: 'Inter' },
    fontSize: { type: Number, default: 16 },
    fontWeight: { type: String, default: '400' },
    
    density: { type: String, default: 'standard' },
    borderRadius: { type: Number, default: 8 },
    darkMode: { type: Boolean, default: false },
    sidebarPos: { type: String, default: 'left' },
    
    selectedTheme: { type: String, default: 'defaut' }
  },

  // Sécurité
  security: {
    twoFaSuperAdmin: { type: Boolean, default: true },
    twoFaPremium: { type: Boolean, default: true },
    twoFaAll: { type: Boolean, default: false },
    twoFaMethod: { type: String, default: 'app' },
    sessionDuration: { type: String, default: '8h' },
    autoLogout: { type: Boolean, default: true },
    inactivityTimeout: { type: String, default: '30min' },
    
    passwordLength: { type: Number, default: 12 },
    passCaps: { type: Boolean, default: true },
    passNums: { type: Boolean, default: true },
    passSpecial: { type: Boolean, default: true },
    passRecent: { type: Boolean, default: true },
    passExpiry: { type: String, default: '90j' },

    ipRestriction: { type: Boolean, default: false },
    allowedIps: { type: [String], default: ['197.234.x.x'] },
    blockVpn: { type: Boolean, default: false },
    alertNewCountry: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Shield, Settings2, Database, Palette, Globe, 
  Upload, Trash2, Bot, Sun, Moon, Maximize, RefreshCw, 
  Check, Eye, Type, Layout, Image as ImageIcon, Brush, CheckCircle2,
  Key, Lock, ShieldAlert, Copy, Plus, XCircle, AlertOctagon, Activity, EyeOff, LockKeyhole,
  CreditCard, Banknote, Building2, TrendingUp, AlertTriangle,
  HardDrive, Clock, Download, RotateCcw, Loader2, Bell, Mail, UserCircle, UserPlus, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSettings, gradients } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const fontsList = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 
  'Lato', 'Nunito', 'Raleway', 'Source Sans Pro', 'Ubuntu', 
  'Playfair Display', 'Merriweather', 'Libre Baskerville', 'Josefin Sans', 'Quicksand', 
  'Comfortaa', 'Space Grotesk', 'DM Sans', 'Outfit', 'Plus Jakarta Sans'
];

const predefinedThemes = [
  { id: 'defaut', name: 'EventTrust Défaut', primary: '#3b82f6', secondary: '#f59e0b', font: 'Inter', density: 'standard', color1: '#3b82f6', color2: '#f59e0b' },
  { id: 'guinee', name: 'Guinée Classique', primary: '#22c55e', secondary: '#fbbf24', font: 'Merriweather', density: 'spacieux', color1: '#22c55e', color2: '#fbbf24' },
  { id: 'tech', name: 'Tech Moderne', primary: '#8b5cf6', secondary: '#06b6d4', font: 'Space Grotesk', density: 'compact', color1: '#8b5cf6', color2: '#06b6d4' },
  { id: 'inst', name: 'Institutionnel', primary: '#1e3a8a', secondary: '#64748b', font: 'Playfair Display', density: 'spacieux', color1: '#1e3a8a', color2: '#64748b' },
  { id: 'min', name: 'Minimaliste', primary: '#0f172a', secondary: '#e2e8f0', font: 'DM Sans', density: 'compact', color1: '#0f172a', color2: '#e2e8f0' },
  { id: 'afrique', name: 'Afrique Vibrante', primary: '#f97316', secondary: '#ef4444', font: 'Poppins', density: 'standard', color1: '#f97316', color2: '#ef4444' }
];

// ==================== SOUS-COMPOSANT PROFIL ====================
const ProfileTab = ({ item }) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    role: '',
    avatar: null
  });
  const [saving, setSaving] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Charger les données réelles de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        role: user.role || '',
        avatar: user.avatar || null
      });
    }
  }, [user]);

  // Charger la liste des admins depuis le backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoadingAdmins(true);
        const res = await api.get('/auth/admin/users');
        // Filtrer pour ne garder que les admins (pas les participants)
        const admins = res.data.filter(u => u.role !== 'Participant');
        setAdminList(admins);
      } catch (err) {
        console.error('Erreur chargement admins:', err);
      } finally {
        setLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      const res = await api.put('/auth/me', {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        city: profileForm.city,
        avatar: profileForm.avatar
      });
      // Mettre à jour le contexte global
      updateUser({ ...user, ...res.data });
      toast.success('Profil mis à jour avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La taille de l\'image ne doit pas dépasser 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(p => ({ ...p, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Jamais';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div variants={item} className="space-y-6">
      
      {/* Profil Actuel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><UserCircle className="w-5 h-5 text-blue-500"/> Mon Profil SuperAdmin</h3>
            <p className="text-xs text-slate-500 mt-1">Gérez vos informations personnelles.</p>
          </div>
          <button 
            onClick={handleProfileSave} 
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center text-white text-4xl font-black bg-cover bg-center overflow-hidden"
                style={{
                  background: profileForm.avatar ? `url(${profileForm.avatar}) center/cover` : 'var(--gradient-primary)'
                }}
              >
                {!profileForm.avatar && getInitials(profileForm.fullName)}
              </div>
              <div className="text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer mb-2 block w-full"
                >
                  Changer la photo
                </button>
                <p className="text-sm font-bold text-slate-900">{profileForm.fullName}</p>
                <p className="text-xs text-slate-500">{profileForm.role}</p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nom complet</label>
                  <input 
                    type="text" 
                    value={profileForm.fullName} 
                    onChange={(e) => setProfileForm(p => ({...p, fullName: e.target.value}))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Adresse Email</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-500 cursor-not-allowed" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">L'email ne peut pas être modifié.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Numéro de téléphone</label>
                  <input 
                    type="tel" 
                    value={profileForm.phone} 
                    onChange={(e) => setProfileForm(p => ({...p, phone: e.target.value}))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rôle principal</label>
                  <input type="text" value={profileForm.role} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ville</label>
                  <input 
                    type="text" 
                    value={profileForm.city} 
                    onChange={(e) => setProfileForm(p => ({...p, city: e.target.value}))}
                    placeholder="Ex: Conakry"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Équipe d'Administration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-purple-500"/> Équipe d'Administration</h3>
            <p className="text-xs text-slate-500 mt-1">Tous les administrateurs et gestionnaires de la plateforme.</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{adminList.length} membre{adminList.length > 1 ? 's' : ''}</span>
        </div>
        {loadingAdmins ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-slate-500">Chargement...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm custom-admin-table min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-4 pl-6">Utilisateur</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Dernière connexion</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((admin) => (
                  <tr key={admin._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${admin._id === user?._id ? 'bg-gradient-to-tr from-blue-600 to-blue-400' : 'bg-slate-400'}`}>
                          {getInitials(admin.fullName)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{admin.fullName}</p>
                          <p className="text-xs text-slate-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{admin.role}</td>
                    <td className="p-4 text-xs text-slate-500 font-medium">{formatLastLogin(admin.lastLoginAt)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${admin.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {admin.isActive !== false ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {admin._id === user?._id ? (
                        <span className="text-slate-400 text-xs italic">(Vous)</span>
                      ) : (
                        <button 
                          onClick={() => toast.success(`Gestion de ${admin.fullName} à venir !`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold cursor-pointer"
                        >
                          Gérer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {adminList.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-400 text-sm">Aucun administrateur trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
};

const SuperAdminSettings = () => {
  const { fetchSettings: fetchGlobalSettings, settings: globalSettings, applyTheme } = useSettings();
  // General State
  const [activeTab, setActiveTab] = useState('general');
  
  // Customization State
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const [successColor, setSuccessColor] = useState('#22c55e');
  const [dangerColor, setDangerColor] = useState('#ef4444');
  const [neutralColor, setNeutralColor] = useState('#6b7280');
  
  const [useGradient, setUseGradient] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(gradients[0]);
  
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState('400');
  const [lineHeight, setLineHeight] = useState(1.6);
  
  const [density, setDensity] = useState('standard');
  const [borderRadius, setBorderRadius] = useState(8);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarPos, setSidebarPos] = useState('left');
  
  const [selectedTheme, setSelectedTheme] = useState('defaut');

  // General tab state
  const [platformName, setPlatformName] = useState('EventTrust GN');
  const [supportEmail, setSupportEmail] = useState('support@eventtrust.gn');
  const [phone, setPhone] = useState('+224 600 00 00 00');
  const [website, setWebsite] = useState('www.eventtrust.gn');
  const [address, setAddress] = useState('Conakry, Guinée');
  const [timezone, setTimezone] = useState('Africa/Conakry (GMT+0)');
  const [language, setLanguage] = useState('Français');

  const [logoUrl, setLogoUrl] = useState(null);
  const [showLogoText, setShowLogoText] = useState(true);
  const [assistantName, setAssistantName] = useState('ARIA');
  const [assistantRole, setAssistantRole] = useState("Je suis ARIA, l'assistante intelligente d'EventTrust GN. Je vous aide à gérer vos événements, vérifier vos tickets et naviguer sur la plateforme.");
  const [assistantTone, setAssistantTone] = useState('pro');
  
  const [betaFeatures, setBetaFeatures] = useState({
    globalAi: true, darkModeForced: false, pushNotifs: true, offlineScan: false, weeklyReports: true, publicApi: false
  });
  
  const [aiFeatures, setAiFeatures] = useState({
    qna: true, ticket: true, suggest: true, mod: false, fraud: true, report: false
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch Settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const data = response.data;
        if (data) {
          if (data.general) {
            setPlatformName(data.general.platformName || 'EventTrust GN');
            setSupportEmail(data.general.supportEmail || 'support@eventtrust.gn');
            setPhone(data.general.phone || '+224 600 00 00 00');
            setWebsite(data.general.website || 'www.eventtrust.gn');
            setAddress(data.general.address || 'Conakry, Guinée');
            setTimezone(data.general.timezone || 'Africa/Conakry (GMT+0)');
            setLanguage(data.general.language || 'Français');
          }
          if (data.branding) {
            setLogoUrl(data.branding.logoUrl);
            setShowLogoText(data.branding.showLogoText !== false);
          }
          if (data.aiAssistant) {
            setAssistantName(data.aiAssistant.name || 'ARIA');
            setAssistantRole(data.aiAssistant.role || "Je suis ARIA...");
            setAssistantTone(data.aiAssistant.tone || 'pro');
            if (data.aiAssistant.features) setAiFeatures(data.aiAssistant.features);
          }
          if (data.betaFeatures) {
            setBetaFeatures(data.betaFeatures);
          }
          // Load Customization
          if (data.customization) {
            setPrimaryColor(data.customization.primaryColor || '#3b82f6');
            setSecondaryColor(data.customization.secondaryColor || '#f59e0b');
            setAccentColor(data.customization.accentColor || '#8b5cf6');
            setSuccessColor(data.customization.successColor || '#22c55e');
            setDangerColor(data.customization.dangerColor || '#ef4444');
            setNeutralColor(data.customization.neutralColor || '#6b7280');
            setUseGradient(data.customization.useGradient || false);
            const foundGradient = gradients.find(g => g.id === data.customization.selectedGradientId);
            if (foundGradient) setSelectedGradient(foundGradient);
            setSelectedFont(data.customization.selectedFont || 'Inter');
            setFontSize(data.customization.fontSize || 16);
            setFontWeight(data.customization.fontWeight || '400');
            setDensity(data.customization.density || 'standard');
            setBorderRadius(data.customization.borderRadius !== undefined ? data.customization.borderRadius : 8);
            setDarkMode(data.customization.darkMode || false);
            setSidebarPos(data.customization.sidebarPos || 'left');
            setSelectedTheme(data.customization.selectedTheme || 'defaut');
          }

          // Load Security
          if (data.security) {
            setTwoFaSuperAdmin(data.security.twoFaSuperAdmin !== false);
            setTwoFaPremium(data.security.twoFaPremium !== false);
            setTwoFaAll(data.security.twoFaAll || false);
            setTwoFaMethod(data.security.twoFaMethod || 'app');
            setSessionDuration(data.security.sessionDuration || '8h');
            setAutoLogout(data.security.autoLogout !== false);
            setInactivityTimeout(data.security.inactivityTimeout || '30min');
            setPasswordLength(data.security.passwordLength || 12);
            setPassCaps(data.security.passCaps !== false);
            setPassNums(data.security.passNums !== false);
            setPassSpecial(data.security.passSpecial !== false);
            setPassRecent(data.security.passRecent !== false);
            setPassExpiry(data.security.passExpiry || '90j');
            setIpRestriction(data.security.ipRestriction || false);
            if (data.security.allowedIps) setAllowedIps(data.security.allowedIps);
            setBlockVpn(data.security.blockVpn || false);
            setAlertNewCountry(data.security.alertNewCountry !== false);
          }
        }
      } catch (error) {
        toast.error("Erreur de chargement des paramètres");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // --- LIVE PREVIEW EFFECTS ---
  useEffect(() => {
    if (!isLoading) {
      applyTheme({
        customization: {
          primaryColor, secondaryColor, accentColor, selectedFont, darkMode, borderRadius,
          useGradient, selectedGradientId: selectedGradient.id, neutralColor
        },
        betaFeatures
      });
    }
  }, [primaryColor, secondaryColor, accentColor, selectedFont, darkMode, borderRadius, useGradient, selectedGradient, neutralColor, betaFeatures, isLoading]);

  const globalSettingsRef = useRef(globalSettings);
  useEffect(() => {
    globalSettingsRef.current = globalSettings;
  }, [globalSettings]);

  useEffect(() => {
    return () => {
      if (globalSettingsRef.current) {
        applyTheme(globalSettingsRef.current);
      }
    };
  }, [applyTheme]);
  // ----------------------------

  const saveGeneralSettings = async () => {
    try {
      await api.patch('/settings', {
        general: { platformName, supportEmail, phone, website, address, timezone, language },
        branding: { logoUrl, showLogoText },
        aiAssistant: { name: assistantName, role: assistantRole, tone: assistantTone, features: aiFeatures },
        betaFeatures: betaFeatures
      });
      toast.success('Paramètres enregistrés avec succès !');
      fetchGlobalSettings();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const saveCustomizationSettings = async () => {
    try {
      await api.patch('/settings', {
        customization: {
          primaryColor, secondaryColor, accentColor, successColor, dangerColor, neutralColor,
          useGradient, selectedGradientId: selectedGradient.id,
          selectedFont, fontSize, fontWeight,
          density, borderRadius, darkMode, sidebarPos, selectedTheme
        }
      });
      toast.success('Personnalisation enregistrée avec succès !');
      fetchGlobalSettings();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la personnalisation");
    }
  };

  const saveSecuritySettings = async () => {
    try {
      await api.patch('/settings', {
        security: {
          twoFaSuperAdmin, twoFaPremium, twoFaAll, twoFaMethod,
          sessionDuration, autoLogout, inactivityTimeout,
          passwordLength, passCaps, passNums, passSpecial, passRecent, passExpiry,
          ipRestriction, allowedIps, blockVpn, alertNewCountry
        }
      });
      toast.success('Paramètres de sécurité enregistrés !');
      fetchGlobalSettings();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la sécurité");
    }
  };

  // Sidebar state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("EventTrust GN est en maintenance. Nous serons de retour dans quelques minutes.");
  const [maintenanceDuration, setMaintenanceDuration] = useState('1h');

  // Security State
  const [twoFaSuperAdmin, setTwoFaSuperAdmin] = useState(true);
  const [twoFaPremium, setTwoFaPremium] = useState(true);
  const [twoFaAll, setTwoFaAll] = useState(false);
  const [twoFaMethod, setTwoFaMethod] = useState('app');
  const [sessionDuration, setSessionDuration] = useState('8h');
  const [autoLogout, setAutoLogout] = useState(true);
  const [inactivityTimeout, setInactivityTimeout] = useState('30min');
  
  const [passwordLength, setPasswordLength] = useState(12);
  const [passCaps, setPassCaps] = useState(true);
  const [passNums, setPassNums] = useState(true);
  const [passSpecial, setPassSpecial] = useState(true);
  const [passRecent, setPassRecent] = useState(true);
  const [passExpiry, setPassExpiry] = useState('90j');

  const [ipRestriction, setIpRestriction] = useState(false);
  const [allowedIps, setAllowedIps] = useState(['197.234.x.x']);
  const [newIp, setNewIp] = useState('');
  const [blockVpn, setBlockVpn] = useState(false);
  const [alertNewCountry, setAlertNewCountry] = useState(true);

  const [showApiKey1, setShowApiKey1] = useState(false);
  const [showApiKey2, setShowApiKey2] = useState(false);
  const [showLockdownModal, setShowLockdownModal] = useState(false);
  const [lockdownText, setLockdownText] = useState('');

  const handleAddIp = () => {
    if (newIp && !allowedIps.includes(newIp)) {
      setAllowedIps([...allowedIps, newIp]);
      setNewIp('');
    }
  };

  // Payment State
  const [omActive, setOmActive] = useState(true);
  const [mtnActive, setMtnActive] = useState(true);
  const [bankActive, setBankActive] = useState(true);
  const [stripeActive, setStripeActive] = useState(false);
  const [showOmMerchant, setShowOmMerchant] = useState(false);
  const [showOmApi, setShowOmApi] = useState(false);
  const [showMtnMerchant, setShowMtnMerchant] = useState(false);
  const [showMtnApi, setShowMtnApi] = useState(false);
  const [lengoActive, setLengoActive] = useState(true);
  const [showLengoMerchant, setShowLengoMerchant] = useState(false);
  const [showLengoApi, setShowLengoApi] = useState(false);
  const [mainCurrency, setMainCurrency] = useState('GNF');
  const [platformCommission, setPlatformCommission] = useState(2.5);
  const [minAmount, setMinAmount] = useState('10000');
  const [maxAmount, setMaxAmount] = useState('5000000');
  
  const [paymentSandbox, setPaymentSandbox] = useState(false);
  const [autoRefund, setAutoRefund] = useState(true);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);

  // Backup State
  const [backupAuto, setBackupAuto] = useState(true);
  const [backupFreq, setBackupFreq] = useState('daily');
  const [backupTime, setBackupTime] = useState('02:00');
  const [backupRetention, setBackupRetention] = useState('30');
  const [backupDest, setBackupDest] = useState('local');
  const [backupItems, setBackupItems] = useState({db:true,files:true,configs:true,logs:true,transactions:true,qrcodes:true});
  const [manualItems, setManualItems] = useState({db:true,files:true,configs:true,logs:false});
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [notifFail, setNotifFail] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [notifSpace, setNotifSpace] = useState(true);
  const [notifEmail, setNotifEmail] = useState('support@eventtrust.gn');

  const startManualBackup = () => {
    setBackupRunning(true); setBackupProgress(0);
    const steps = [20,45,67,85,100];
    steps.forEach((p,i) => setTimeout(() => {
      setBackupProgress(p);
      if(p===100) { setTimeout(()=>{setBackupRunning(false);toast.success('Sauvegarde terminée avec succès !');},500); }
    }, (i+1)*1200));
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  // Helper toggle function
  const toggleBeta = (key) => setBetaFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAi = (key) => setAiFeatures(prev => ({ ...prev, [key]: !prev[key] }));

  const handleApplyTheme = (theme) => {
    setSelectedTheme(theme.id);
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setSelectedFont(theme.font);
    setDensity(theme.density);
    toast.success(`Thème "${theme.name}" appliqué !`);
  };

  const getBorderRadiusLabel = (val) => {
    if (val === 0) return "Carré";
    if (val <= 4) return "Légèrement arrondi";
    if (val <= 8) return "Arrondi";
    if (val <= 16) return "Très arrondi";
    return "Pilule";
  };

  const getFontSizeLabel = (val) => {
    if (val <= 12) return "Petit";
    if (val <= 14) return "Normal";
    if (val === 16) return "Standard";
    if (val <= 18) return "Grand";
    return "XL";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Paramètres de la Plateforme</h2>
        <p className="text-slate-500 text-sm mt-1">Configuration globale et personnalisation de l'identité visuelle EventTrust GN.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {[
          { id: 'general', icon: Settings2, label: 'Général' },
          { id: 'profile', icon: UserCircle, label: 'Mon Profil & Équipe' },
          { id: 'customization', icon: Palette, label: 'Personnalisation' },
          { id: 'security', icon: Shield, label: 'Sécurité & Accès' },
          { id: 'payment', icon: Globe, label: 'Passerelles de paiement' },
          { id: 'backup', icon: Database, label: 'Sauvegardes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* ==================== ONGLET GÉNÉRAL ==================== */}
          {activeTab === 'general' && (
            <motion.div variants={item} className="space-y-6">
              
              {/* SECTION 1: Logo */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-blue-500"/> Logo de la Plateforme</h3></div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                    <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-slate-300" />}
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex gap-3">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/svg+xml" 
                          className="hidden" 
                          id="logoUpload" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error('L\'image dépasse 2MB');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoUrl(reader.result);
                                toast.success('Logo chargé ! Pensez à enregistrer.');
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                        <button onClick={() => document.getElementById('logoUpload').click()} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"><Upload className="w-4 h-4"/> Changer le logo</button>
                        <button onClick={() => setLogoUrl(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Formats acceptés : PNG, SVG, JPG — Max 2MB.</p>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox" checked={showLogoText} onChange={() => setShowLogoText(!showLogoText)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Afficher le nom texte à côté du logo</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-900 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-6 h-6 object-cover" /> : <Shield className="w-5 h-5 text-blue-400" />}
                    </div>
                    {showLogoText && <span className="text-white font-black tracking-tight">EventTrust<span className="text-blue-400">GN</span></span>}
                    <span className="ml-auto text-xs text-slate-400">Aperçu Navbar</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Infos Globales */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Informations Globales</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">Nom de la Plateforme</label><input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Email Support</label><input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Téléphone</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Site web officiel</label><input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Adresse</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Fuseau horaire</label><select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"><option>Africa/Conakry (GMT+0)</option></select></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Langue par défaut</label><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"><option>Français</option><option>Anglais</option></select></div>
                </div>
              </div>

              {/* SECTION 3: Personnalisation IA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Bot className="w-5 h-5 text-purple-600"/> Mon Assistant IA</h3>
                  <p className="text-xs text-slate-500 mt-1">Personnalisez l'assistant IA intégré à votre plateforme.</p>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nom de l'assistant</label>
                      <input type="text" value={assistantName} onChange={e => setAssistantName(e.target.value)} placeholder="Ex: ARIA..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Rôle / Description</label>
                      <textarea value={assistantRole} onChange={e => setAssistantRole(e.target.value)} rows="3" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Ton de communication</label>
                      <div className="flex flex-wrap gap-3">
                        {['pro', 'amical', 'formel', 'concis'].map(t => (
                          <label key={t} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tone" checked={assistantTone === t} onChange={() => setAssistantTone(t)} className="text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm font-medium capitalize">{t === 'pro' ? 'Professionnel' : t === 'amical' ? 'Amical' : t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Fonctionnalités IA actives</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {Object.entries({qna: 'Q&A Événements', ticket: 'Aide Billets', suggest: 'Suggestions', mod: 'Modération Auto', fraud: 'Détection Fraude', report: 'Rapports Auto'}).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={aiFeatures[key]} onChange={() => toggleAi(key)} className="rounded text-purple-600 focus:ring-purple-500" /> {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Preview Widget */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-end min-h-[250px]">
                    <p className="text-xs font-bold text-center text-slate-400 mb-4 uppercase tracking-wider">Aperçu du Widget</p>
                    <div className="bg-white rounded-2xl rounded-br-sm shadow-sm border border-slate-100 p-4 w-4/5 ml-auto relative">
                      <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm">
                        {assistantName.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-sm text-slate-700 font-medium">Bonjour ! {assistantRole}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Beta Features */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings2 className="w-5 h-5 text-blue-500"/> Fonctionnalités Système & Bêta</h3></div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'globalAi', label: 'Assistant IA Global', desc: 'Activer l\'IA pour tous' },
                    { key: 'darkModeForced', label: 'Mode sombre forcé', desc: 'Imposer le thème sombre' },
                    { key: 'pushNotifs', label: 'Notifications Push', desc: 'Notifs navigateur natives' },
                    { key: 'offlineScan', label: 'Scan hors ligne', desc: 'Validation sans internet' },
                    { key: 'weeklyReports', label: 'Rapports auto.', desc: 'Emails hebdos admins' },
                    { key: 'publicApi', label: 'API Publique', desc: 'Accès développeurs tiers' },
                  ].map(({key, label, desc}) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">{label}</p><p className="text-xs text-slate-500">{desc}</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={betaFeatures[key]} onChange={() => toggleBeta(key)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={saveGeneralSettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer">
                  <Save className="w-4 h-4"/> Enregistrer Général
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== ONGLET PERSONNALISATION ==================== */}
          {activeTab === 'customization' && (
            <motion.div variants={item} className="space-y-6">
              
              {/* SOUS-SECTION A: Couleurs */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Palette className="w-5 h-5 text-pink-500"/> Palette de couleurs</h3>
                  <p className="text-xs text-slate-500 mt-1">Choisissez les couleurs pour personnaliser l'identité visuelle de l'app.</p>
                </div>
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: 'Primaire', val: primaryColor, set: setPrimaryColor },
                      { label: 'Secondaire', val: secondaryColor, set: setSecondaryColor },
                      { label: 'Accent', val: accentColor, set: setAccentColor },
                      { label: 'Succès', val: successColor, set: setSuccessColor },
                      { label: 'Danger', val: dangerColor, set: setDangerColor },
                      { label: 'Neutre', val: neutralColor, set: setNeutralColor },
                    ].map((c, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500">{c.label}</label>
                        <div className="flex items-center gap-2">
                          <label className="w-8 h-8 rounded-full border-2 border-slate-200 cursor-pointer shadow-sm overflow-hidden shrink-0">
                            <input type="color" value={c.val} onChange={(e) => c.set(e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                            <div className="w-full h-full" style={{ backgroundColor: c.val }}></div>
                          </label>
                          <input type="text" value={c.val} onChange={(e) => c.set(e.target.value)} className="w-full p-1.5 text-xs font-mono border border-slate-200 rounded uppercase" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-slate-100" />

                  {/* Gradients */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900">Dégradés prédéfinis</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm font-bold text-slate-600">Utiliser un dégradé</span>
                        <input type="checkbox" checked={useGradient} onChange={() => setUseGradient(!useGradient)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all relative"></div>
                      </label>
                    </div>
                    {useGradient && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {gradients.map(g => (
                          <div 
                            key={g.id} 
                            onClick={() => setSelectedGradient(g)}
                            className={`h-16 rounded-xl p-2 cursor-pointer flex items-end justify-start shadow-sm border-2 transition-all ${selectedGradient.id === g.id ? 'border-slate-900 scale-105' : 'border-transparent hover:scale-105'}`}
                            style={{ background: g.style }}
                          >
                            <span className="text-[10px] font-black text-white bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm truncate">{g.name}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Realtime Preview Block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 relative overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 absolute top-2 right-3">APERÇU EN TEMPS RÉEL</p>
                    <div className="w-full h-12 rounded-lg flex items-center px-4 shadow-sm" style={{ background: useGradient ? selectedGradient.style : primaryColor }}>
                      <span className="text-white font-black text-sm">Navbar Preview</span>
                      <div className="ml-auto flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20"></div>
                        <div className="w-6 h-6 rounded-full bg-white/20"></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <button className="px-4 py-2 text-white text-sm font-bold rounded-lg shadow-sm" style={{ background: useGradient ? selectedGradient.style : primaryColor }}>Bouton Principal</button>
                      <span className="px-3 py-1 text-white text-xs font-bold rounded-full shadow-sm" style={{ backgroundColor: secondaryColor }}>Badge Secondaire</span>
                      <span className="px-3 py-1 text-white text-xs font-bold rounded-full shadow-sm" style={{ backgroundColor: dangerColor }}>Alerte</span>
                      <span className="px-3 py-1 text-white text-xs font-bold rounded-full shadow-sm" style={{ backgroundColor: successColor }}>Succès</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOUS-SECTION B: Typographie */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Type className="w-5 h-5 text-blue-500"/> Typographie</h3>
                  <p className="text-xs text-slate-500 mt-1">Choisissez parmi 20 polices disponibles et ajustez la taille.</p>
                </div>
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {fontsList.map(font => (
                      <div 
                        key={font} 
                        onClick={() => setSelectedFont(font)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedFont === font ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                        <p className="text-xs text-slate-400 font-bold mb-1 truncate">{font}</p>
                        <p className="text-sm" style={{ fontFamily: font, color: 'var(--text-primary)' }}>Aa EventTrust</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">Taille de base</label>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{fontSize}px ({getFontSizeLabel(fontSize)})</span>
                      </div>
                      <input type="range" min="12" max="20" step="1" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-blue-600" />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 px-1">
                        <span>12</span><span>14</span><span>16</span><span>18</span><span>20</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Graisse (Poids)</label>
                      <div className="flex flex-col gap-1.5">
                        {[{v:'300',l:'Léger'},{v:'400',l:'Normal'},{v:'500',l:'Moyen'},{v:'600',l:'Gras'}].map(w => (
                          <label key={w.v} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="radio" name="weight" checked={fontWeight === w.v} onChange={() => setFontWeight(w.v)} className="text-blue-600 focus:ring-blue-500" /> <span style={{fontWeight: w.v}}>{w.l} ({w.v})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-center text-center">
                    <p style={{ fontFamily: selectedFont, fontSize: `${fontSize}px`, fontWeight: fontWeight, lineHeight: lineHeight }} className="text-slate-800 transition-all">
                      Voici un exemple de texte EventTrust GN avec la typographie sélectionnée. <br/> La lisibilité est la priorité numéro un.
                    </p>
                  </div>
                </div>
              </div>

              {/* SOUS-SECTION C: Format & Mise en page */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Layout className="w-5 h-5 text-indigo-500"/> Format & Mise en page</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Densité d'affichage</label>
                    <div className="flex gap-3">
                      {['compact', 'standard', 'spacieux'].map(d => (
                        <button 
                          key={d} 
                          onClick={() => setDensity(d)}
                          className={`flex-1 py-3 px-2 rounded-xl border-2 text-xs font-bold capitalize transition-colors ${density === d ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                          {d} {density === d && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700">Arrondi des bordures (Border Radius)</label>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{borderRadius}px ({getBorderRadiusLabel(borderRadius)})</span>
                    </div>
                    <input type="range" min="0" max="20" step="2" value={borderRadius} onChange={e => setBorderRadius(parseInt(e.target.value))} className="w-full accent-indigo-600 mb-4" />
                    <button className="w-full py-2 bg-indigo-600 text-white font-bold transition-all shadow-md" style={{ borderRadius: `${borderRadius}px` }}>
                      Aperçu Bouton
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Position Menu Latéral (Sidebar)</label>
                    <div className="flex gap-4">
                      {['left', 'right', 'top'].map(p => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <input type="radio" checked={sidebarPos === p} onChange={() => setSidebarPos(p)} className="text-indigo-600 focus:ring-indigo-500" /> {p === 'left' ? 'Gauche' : p === 'right' ? 'Droite' : 'Haut'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Mode d'affichage</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit">
                      <button onClick={()=>setDarkMode(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!darkMode ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}><Sun className="w-4 h-4"/> Clair</button>
                      <button onClick={()=>setDarkMode(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${darkMode ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}><Moon className="w-4 h-4"/> Sombre</button>
                    </div>
                  </div>

                </div>
              </div>

              {/* SOUS-SECTION D: Thèmes */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Brush className="w-5 h-5 text-emerald-500"/> Thèmes prêts à l'emploi</h3>
                  <p className="text-xs text-slate-500 mt-1">Applique instantanément un thème complet (couleurs + police + format).</p>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {predefinedThemes.map(theme => (
                    <div key={theme.id} className={`p-4 rounded-xl border-2 transition-all ${selectedTheme === theme.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex h-12 rounded-lg overflow-hidden mb-3 shadow-sm border border-slate-100">
                        <div className="flex-1" style={{backgroundColor: theme.color1}}></div>
                        <div className="flex-1" style={{backgroundColor: theme.color2}}></div>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center justify-between">
                        {theme.name} {selectedTheme === theme.id && <CheckCircle2 className="w-4 h-4 text-emerald-500"/>}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mb-3">{theme.font} • {theme.density}</p>
                      <button onClick={() => handleApplyTheme(theme)} className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                        {selectedTheme === theme.id ? 'Actif' : 'Appliquer ce thème'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button onClick={() => toast.success('Aperçu plein écran activé (simulation)')} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Maximize className="w-4 h-4"/> Aperçu plein écran
                </button>
                <button onClick={() => {handleApplyTheme(predefinedThemes[0]); toast('Réinitialisé', {icon:'🔄'});}} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <RefreshCw className="w-4 h-4"/> Réinitialiser
                </button>
                <button onClick={saveCustomizationSettings} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Save className="w-4 h-4"/> Enregistrer la personnalisation
                </button>
              </div>

            </motion.div>
          )}



          {/* ==================== ONGLET SÉCURITÉ ==================== */}
          {activeTab === 'security' && (
            <motion.div variants={item} className="space-y-6">
              
              {/* SECTION 1: Authentification */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-500"/> Authentification</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">Authentification à deux facteurs (2FA)</p><p className="text-xs text-slate-500">Obligatoire pour tous les Super Admins</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={twoFaSuperAdmin} onChange={() => setTwoFaSuperAdmin(!twoFaSuperAdmin)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">2FA obligatoire institutions Premium</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={twoFaPremium} onChange={() => setTwoFaPremium(!twoFaPremium)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">2FA recommandé tous utilisateurs</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={twoFaAll} onChange={() => setTwoFaAll(!twoFaAll)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Méthode 2FA</label>
                      <div className="flex flex-col gap-2">
                        {[{v:'app', l:'Application Authenticator (Google Auth, Authy)'}, {v:'sms', l:'SMS au numéro enregistré'}, {v:'email', l:'Email de vérification'}].map(m => (
                          <label key={m.v} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input type="radio" checked={twoFaMethod === m.v} onChange={() => setTwoFaMethod(m.v)} className="text-indigo-600 focus:ring-indigo-500" /> {m.l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Durée de session</label>
                      <select value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500">
                        <option value="1h">1 heure</option><option value="4h">4 heures</option><option value="8h">8 heures</option><option value="24h">24 heures</option><option value="7j">7 jours</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">Déconnexion auto. après inactivité</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoLogout} onChange={() => setAutoLogout(!autoLogout)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    {autoLogout && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Délai inactivité : <span className="text-indigo-600">{inactivityTimeout}</span></label>
                        <input type="range" min="0" max="3" step="1" value={['15min','30min','1h','2h'].indexOf(inactivityTimeout)} onChange={e => setInactivityTimeout(['15min','30min','1h','2h'][e.target.value])} className="w-full accent-indigo-600" />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1"><span>15m</span><span>30m</span><span>1h</span><span>2h</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Password Policy */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Key className="w-5 h-5 text-amber-500"/> Politique de mot de passe</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">Longueur minimale</label>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{passwordLength} caractères</span>
                      </div>
                      <input type="range" min="6" max="20" step="1" value={passwordLength} onChange={e => setPasswordLength(parseInt(e.target.value))} className="w-full accent-amber-500" />
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: 'passCaps', label: 'Majuscules obligatoires', val: passCaps, set: setPassCaps },
                        { key: 'passNums', label: 'Chiffres obligatoires', val: passNums, set: setPassNums },
                        { key: 'passSpecial', label: 'Caractères spéciaux obligatoires', val: passSpecial, set: setPassSpecial },
                        { key: 'passRecent', label: 'Interdire mots de passe récents (5 derniers)', val: passRecent, set: setPassRecent },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="font-bold text-sm text-slate-900">{item.label}</p>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={item.val} onChange={() => item.set(!item.val)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Expiration du mot de passe</label>
                    <select value={passExpiry} onChange={e => setPassExpiry(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500">
                      <option value="jamais">Jamais</option><option value="30j">30 jours</option><option value="60j">60 jours</option><option value="90j">90 jours</option><option value="6m">6 mois</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: IP Access Control */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-500"/> Contrôle d'accès IP</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">Restriction par adresse IP</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={ipRestriction} onChange={() => setIpRestriction(!ipRestriction)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    {ipRestriction && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                        <div className="flex gap-2">
                          <input type="text" value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="Ex: 192.168.1.1" className="flex-1 p-2 bg-white border border-emerald-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                          <button onClick={handleAddIp} className="px-3 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"><Plus className="w-4 h-4"/> Ajouter</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {allowedIps.map(ip => (
                            <span key={ip} className="inline-flex items-center gap-1 bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded text-xs font-bold shadow-sm">
                              {ip} <button onClick={() => setAllowedIps(allowedIps.filter(i => i !== ip))} className="hover:text-red-500"><XCircle className="w-3 h-3"/></button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">Bloquer VPN et proxies détectés</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={blockVpn} onChange={() => setBlockVpn(!blockVpn)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">Alerter si connexion de nouveau pays</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={alertNewCountry} onChange={() => setAlertNewCountry(!alertNewCountry)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Security Log */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/> Journal d'activité sécurité</h3>
                  <button className="text-blue-600 text-sm font-bold hover:underline cursor-pointer">Voir tout le journal</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[600px] custom-admin-table">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                        <th className="p-4 pl-6">Utilisateur</th><th className="p-4">IP</th><th className="p-4">Localisation</th><th className="p-4">Date</th><th className="p-4 pr-6 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { u: 'Ibrahima Sory', ip: '197.234.x.x', loc: 'Conakry, GN', date: "Aujourd'hui 08:32", status: 'success' },
                        { u: 'Ibrahima Sory', ip: '197.234.x.x', loc: 'Conakry, GN', date: 'Hier 22:14', status: 'success' },
                        { u: 'Inconnu', ip: '45.76.x.x', loc: 'Lagos, NG', date: 'Hier 18:05', status: 'blocked' },
                        { u: 'Ibrahima Sory', ip: '197.234.x.x', loc: 'Conakry, GN', date: '22 Juin 09:47', status: 'success' },
                        { u: 'Inconnu', ip: '103.x.x.x', loc: 'Pékin, CN', date: '21 Juin 03:12', status: 'blocked' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-900">{row.u}</td>
                          <td className="p-4 text-slate-500 font-mono text-xs">{row.ip}</td>
                          <td className="p-4 text-slate-600 font-medium">{row.loc}</td>
                          <td className="p-4 text-slate-500 text-xs">{row.date}</td>
                          <td className="p-4 pr-6 text-right">
                            {row.status === 'success' 
                              ? <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Succès</span>
                              : <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Bloqué</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: API Keys */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings2 className="w-5 h-5 text-slate-500"/> Gestion des clés API</h3>
                    <p className="text-xs text-slate-500 mt-1">Accès programmatique à l'API EventTrust GN</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"><Plus className="w-4 h-4"/> Générer une clé API</button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { n: 'Clé Production', key: 'evt_live_8f92k3...9dj2', date: '01 Jan 2026', used: "Aujourd'hui", type: 'live', show: showApiKey1, setShow: setShowApiKey1 },
                    { n: 'Clé Test', key: 'evt_test_2k3j4...1md9', date: '15 Mar 2026', used: "Jamais", type: 'test', show: showApiKey2, setShow: setShowApiKey2 }
                  ].map((k, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{k.n}</p>
                          {k.type === 'live' 
                            ? <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Active</span>
                            : <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Test</span>}
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded-md w-fit">
                          <span className="font-mono text-xs text-slate-600">{k.show ? k.key : '••••••••••••••••••••••••'}</span>
                          <button onClick={() => k.setShow(!k.show)} className="text-slate-400 hover:text-blue-500 cursor-pointer"><Eye className="w-3.5 h-3.5"/></button>
                          <button onClick={() => {toast.success('Clé copiée !');}} className="text-slate-400 hover:text-blue-500 cursor-pointer"><Copy className="w-3.5 h-3.5"/></button>
                        </div>
                        <p className="text-[10px] text-slate-500">Créée le {k.date} • Dernière utilisation : {k.used}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {toast.success('Clé copiée !');}} className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0">Copier</button>
                        <button className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0">Révoquer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={saveSecuritySettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer">
                  <Save className="w-4 h-4"/> Enregistrer la sécurité
                </button>
              </div>

              {/* Lockdown Modal */}
              <AnimatePresence>
                {showLockdownModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowLockdownModal(false)}></div>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-red-200">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto"><LockKeyhole className="w-6 h-6 text-red-600" /></div>
                      <h3 className="text-xl font-black text-center text-slate-900 mb-2">Verrouillage d'urgence</h3>
                      <p className="text-sm text-center text-slate-600 mb-6">Cette action bloquera immédiatement TOUS les accès à la plateforme pour tous les utilisateurs non-admins. Tapez <strong className="text-red-600">CONFIRMER VERROUILLAGE</strong> pour valider.</p>
                      <input type="text" value={lockdownText} onChange={e => setLockdownText(e.target.value)} placeholder="CONFIRMER VERROUILLAGE" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-center mb-4 outline-none focus:border-red-500" />
                      <div className="flex gap-3">
                        <button onClick={() => {setShowLockdownModal(false); setLockdownText('');}} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">Annuler</button>
                        <button disabled={lockdownText !== 'CONFIRMER VERROUILLAGE'} onClick={() => {toast.error('Plateforme verrouillée !'); setShowLockdownModal(false);}} className={`flex-1 py-2.5 font-bold rounded-xl transition-all shadow-md ${lockdownText === 'CONFIRMER VERROUILLAGE' ? 'bg-red-600 text-white cursor-pointer hover:bg-red-700' : 'bg-red-200 text-white cursor-not-allowed'}`}>Verrouiller</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}



          {/* ==================== ONGLET PAIEMENT ==================== */}
          {activeTab === 'payment' && (
            <motion.div variants={item} className="space-y-6">
              
              {/* SECTION 1: Passerelles Actives */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500"/>
                  <h3 className="text-lg font-bold text-slate-900">Passerelles actives</h3>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Orange Money */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${omActive ? 'border-orange-500 bg-orange-50/20' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FF7900] flex items-center justify-center text-white font-black text-xs shadow-sm">OM</div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">Orange Money Guinée</h4>
                          {omActive ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded"><Check className="w-3 h-3"/> Connecté</span> : <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Désactivé</span>}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={omActive} onChange={() => setOmActive(!omActive)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    {omActive && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Merchant ID</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-slate-900">{showOmMerchant ? 'OM_MERCHANT_9842X' : 'OM_MERCHANT_••••'}</span>
                              <button onClick={() => setShowOmMerchant(!showOmMerchant)} className="text-slate-400 hover:text-orange-500"><Eye className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Clé API</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-slate-900">{showOmApi ? 'ok_live_f89j...d2k' : '•••••••••••••'}</span>
                              <button onClick={() => setShowOmApi(!showOmApi)} className="text-slate-400 hover:text-orange-500"><Eye className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Comm.</p><p className="font-black text-slate-900">2.5%</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Volume</p><p className="font-black text-slate-900">12.4M</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Transact.</p><p className="font-black text-slate-900">847</p></div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={()=>toast.success('Test réussi ! Connexion Orange Money OK.')} className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors cursor-pointer">Tester la connexion</button>
                          <button className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer">Configurer</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MTN MoMo */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${mtnActive ? 'border-yellow-400 bg-yellow-50/30' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFCC00] flex items-center justify-center text-[#000000] font-black text-[10px] shadow-sm">MTN</div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">MTN MoMo Guinée</h4>
                          {mtnActive ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded"><Check className="w-3 h-3"/> Connecté</span> : <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Désactivé</span>}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={mtnActive} onChange={() => setMtnActive(!mtnActive)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    {mtnActive && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Merchant ID</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-slate-900">{showMtnMerchant ? 'MTN_MERCHANT_44' : 'MTN_MERCHANT_••'}</span>
                              <button onClick={() => setShowMtnMerchant(!showMtnMerchant)} className="text-slate-400 hover:text-yellow-600"><Eye className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Clé API</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-slate-900">{showMtnApi ? 'mtn_live_29d...3kf' : '•••••••••••••'}</span>
                              <button onClick={() => setShowMtnApi(!showMtnApi)} className="text-slate-400 hover:text-yellow-600"><Eye className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Comm.</p><p className="font-black text-slate-900">2.5%</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Volume</p><p className="font-black text-slate-900">4.8M</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Transact.</p><p className="font-black text-slate-900">312</p></div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={()=>toast.success('Test réussi ! Connexion MTN MoMo OK.')} className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors cursor-pointer">Tester la connexion</button>
                          <button className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer">Configurer</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lengo Pay */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${lengoActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white font-black text-[10px] shadow-sm">LP</div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">Lengo Pay</h4>
                          {lengoActive ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded"><Check className="w-3 h-3"/> Connecté</span> : <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Désactivé</span>}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={lengoActive} onChange={() => setLengoActive(!lengoActive)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    {lengoActive && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Merchant ID</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-slate-900">{showLengoMerchant ? 'LENGO_MERCHANT_90' : 'LENGO_MERCHANT_••'}</span>
                              <button onClick={() => setShowLengoMerchant(!showLengoMerchant)} className="text-slate-400 hover:text-emerald-600"><Eye className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Clé API</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-slate-900">{showLengoApi ? 'lengo_live_abc...123' : '•••••••••••••'}</span>
                              <button onClick={() => setShowLengoApi(!showLengoApi)} className="text-slate-400 hover:text-emerald-600"><Eye className="w-3.5 h-3.5"/></button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Comm.</p><p className="font-black text-slate-900">2.5%</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Volume</p><p className="font-black text-slate-900">2.1M</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Transact.</p><p className="font-black text-slate-900">145</p></div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={()=>toast.success('Test réussi ! Connexion Lengo Pay OK.')} className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors cursor-pointer">Tester la connexion</button>
                          <button className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer">Configurer</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Virement Bancaire */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${bankActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm"><Building2 className="w-5 h-5"/></div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">Virement Bancaire (Manuel)</h4>
                          {bankActive ? <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Manuel</span> : <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Désactivé</span>}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={bankActive} onChange={() => setBankActive(!bankActive)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    {bankActive && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <p className="text-xs font-bold text-slate-500">Banques partenaires :</p>
                          <p className="text-sm font-medium text-slate-900">BCRG, UBA, Ecobank</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Comm.</p><p className="font-black text-slate-900">1%</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Volume</p><p className="font-black text-slate-900">1.3M</p></div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2"><p className="text-slate-500">Transact.</p><p className="font-black text-slate-900">24</p></div>
                        </div>
                        <div className="pt-2">
                          <button className="w-full py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer">Configurer les coordonnées bancaires</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stripe */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${stripeActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#635BFF] flex items-center justify-center text-white font-black text-lg shadow-sm">S</div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">Stripe (Cartes intl.)</h4>
                          <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded mt-1">Non configuré</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={stripeActive} onChange={() => setStripeActive(!stripeActive)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Pour les institutions et paiements hors Guinée. Nécessite un compte Stripe vérifié.</p>
                    <div className="pt-2">
                      <button className="w-full py-2 bg-[#635BFF] text-white hover:bg-[#5249ea] font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md">Configurer Stripe</button>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 2: Configuration Globale */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings2 className="w-5 h-5 text-slate-500"/> Configuration globale des paiements</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Devise principale</label>
                      <select value={mainCurrency} onChange={e => setMainCurrency(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500">
                        <option value="GNF">GNF — Franc Guinéen</option>
                        <option value="USD" disabled className="text-slate-400">USD — Dollar US (Non recommandé)</option>
                        <option value="EUR" disabled className="text-slate-400">EUR — Euro (Non recommandé)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <label className="block text-sm font-bold text-slate-700">Commission globale plateforme</label>
                          <p className="text-[10px] text-slate-500">Prélevée automatiquement sur chaque transaction</p>
                        </div>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{platformCommission.toFixed(1)}%</span>
                      </div>
                      <input type="range" min="0" max="10" step="0.5" value={platformCommission} onChange={e => setPlatformCommission(parseFloat(e.target.value))} className="w-full accent-blue-600" />
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-blue-500 shrink-0"/>
                        <p className="text-xs font-bold text-slate-700">Aperçu : Pour 500 000 GNF → EventTrust perçoit <span className="text-blue-600">{(500000 * (platformCommission/100)).toLocaleString()} GNF</span></p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Montant min.</label>
                        <div className="relative">
                          <input type="text" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 pr-10" />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">GNF</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Montant max.</label>
                        <div className="relative">
                          <input type="text" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 pr-10" />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">GNF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'sandbox', label: 'Paiements en sandbox (mode test)', val: paymentSandbox, set: setPaymentSandbox, color: 'orange' },
                      { key: 'refund', label: 'Remboursements automatiques si événement annulé', val: autoRefund, set: setAutoRefund, color: 'blue' },
                      { key: 'invoice', label: 'Factures PDF automatiques', val: autoInvoice, set: setAutoInvoice, color: 'blue' },
                      { key: 'sms', label: 'Notifications SMS paiement confirmé', val: smsNotifs, set: setSmsNotifs, color: 'blue' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold text-sm text-slate-900">{item.label}</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.val} onChange={() => item.set(!item.val)} className="sr-only peer" />
                          <div className={`w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${item.color === 'orange' ? 'peer-checked:bg-orange-500' : 'peer-checked:bg-blue-600'}`}></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Historique récent */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500"/> Historique des transactions récentes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[700px] custom-admin-table">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        <th className="p-4 pl-6">Date</th><th className="p-4">Institution</th><th className="p-4">Méthode</th><th className="p-4">Montant</th><th className="p-4">Commission</th><th className="p-4 pr-6 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { d: '01 Déc', i: 'UGANC', m: 'Orange Money', a: '500 000 GNF', c: '12 500', s: 'Succès' },
                        { d: '28 Nov', i: 'ISMGB', m: 'Virement', a: '500 000 GNF', c: '5 000', s: 'Succès' },
                        { d: '15 Nov', i: 'UNILABE', m: 'MTN MoMo', a: '250 000 GNF', c: '6 250', s: 'Succès' },
                        { d: '10 Nov', i: 'ENAG', m: 'Orange Money', a: '250 000 GNF', c: '6 250', s: 'Échec' },
                        { d: '05 Nov', i: 'IPG', m: '—', a: '0 GNF', c: '0', s: 'Gratuit' },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 text-slate-500 font-bold text-xs">{row.d}</td>
                          <td className="p-4 font-bold text-slate-900">{row.i}</td>
                          <td className="p-4 text-slate-600 text-xs font-medium">{row.m}</td>
                          <td className="p-4 font-black text-slate-900">{row.a}</td>
                          <td className="p-4 font-mono text-slate-500 text-xs">{row.c}</td>
                          <td className="p-4 pr-6 text-right">
                            {row.s === 'Succès' && <span className="inline-flex bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Succès</span>}
                            {row.s === 'Échec' && <span className="inline-flex bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Échec</span>}
                            {row.s === 'Gratuit' && <span className="inline-flex bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Gratuit</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 text-center">
                  <button className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">Voir toutes les transactions dans l'onglet Abonnements</button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => toast.success('Configuration des paiements enregistrée !')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer">
                  <Save className="w-4 h-4"/> Enregistrer les passerelles
                </button>
              </div>

            </motion.div>
          )}

          {/* ==================== ONGLET SAUVEGARDES ==================== */}
          {activeTab === 'backup' && (
            <motion.div variants={item} className="space-y-6">

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dernière sauvegarde</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Succès</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">Il y a 2h</p>
                  <p className="text-xs text-slate-500 mt-1">25 Juin 2026 à 14h32</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taille totale</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Stockage</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">4.7 GB</p>
                  <p className="text-xs text-slate-500 mt-1">6 sauvegardes conservées</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prochaine auto</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">Planifiée</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">Dans 22h</p>
                  <p className="text-xs text-slate-500 mt-1">Demain à 02h00 (GMT+0)</p>
                </div>
              </div>

              {/* SECTION 2: Auto backup config */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500"/> Sauvegardes automatiques</h3></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div><p className="font-bold text-sm text-slate-900">Sauvegardes automatiques activées</p><p className="text-xs text-slate-500">Planification récurrente</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={backupAuto} onChange={() => setBackupAuto(!backupAuto)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fréquence</label>
                      <div className="flex flex-col gap-2">
                        {[{v:'daily',l:'Quotidienne (recommandé)'},{v:'12h',l:'Toutes les 12 heures'},{v:'6h',l:'Toutes les 6 heures'},{v:'weekly',l:'Hebdomadaire'}].map(f=>(
                          <label key={f.v} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <input type="radio" checked={backupFreq===f.v} onChange={()=>setBackupFreq(f.v)} className="text-blue-600 focus:ring-blue-500"/>{f.l}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Heure de sauvegarde</label>
                      <input type="time" value={backupTime} onChange={e=>setBackupTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"/>
                      <p className="text-[10px] text-slate-500 mt-1">Heure locale Conakry (GMT+0)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Rétention</label>
                      <select value={backupRetention} onChange={e=>setBackupRetention(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500">
                        <option value="7">7 jours</option><option value="14">14 jours</option><option value="30">30 jours</option><option value="60">60 jours</option><option value="90">90 jours</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Éléments sauvegardés</label>
                      <div className="space-y-2">
                        {[{k:'db',l:'Base de données complète (PostgreSQL)'},{k:'files',l:'Fichiers uploadés (images, PDFs)'},{k:'configs',l:'Configurations de la plateforme'},{k:'logs',l:'Logs système'},{k:'transactions',l:'Données des transactions'},{k:'qrcodes',l:'QR Codes générés'}].map(el=>(
                          <label key={el.k} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <input type="checkbox" checked={backupItems[el.k]} onChange={()=>setBackupItems(p=>({...p,[el.k]:!p[el.k]}))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>{el.l}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Destination</label>
                      <div className="flex flex-col gap-2">
                        {[{v:'local',l:'Serveur local (défaut)'},{v:'gdrive',l:'Google Drive (configurer)'},{v:'s3',l:'Amazon S3 (configurer)'},{v:'dropbox',l:'Dropbox (configurer)'}].map(d=>(
                          <label key={d.v} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <input type="radio" checked={backupDest===d.v} onChange={()=>setBackupDest(d.v)} className="text-blue-600 focus:ring-blue-500"/>{d.l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Database className="w-5 h-5 text-indigo-500"/> Sauvegardes disponibles</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[800px] custom-admin-table">
                    <thead><tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4 pl-6">Date</th><th className="p-4">Taille</th><th className="p-4">Type</th><th className="p-4">Durée</th><th className="p-4">Statut</th><th className="p-4 pr-6 text-right">Actions</th>
                    </tr></thead>
                    <tbody>
                      {[
                        {d:'25 Juin 2026 14:32',s:'4.7 GB',t:'Automatique',dur:'3min 42s',st:'success'},
                        {d:'24 Juin 2026 14:31',s:'4.6 GB',t:'Automatique',dur:'3min 38s',st:'success'},
                        {d:'23 Juin 2026 14:35',s:'4.6 GB',t:'Automatique',dur:'3min 51s',st:'success'},
                        {d:'22 Juin 2026 14:30',s:'4.5 GB',t:'Automatique',dur:'3min 29s',st:'success'},
                        {d:'20 Juin 2026 09:15',s:'4.5 GB',t:'Manuelle',dur:'3min 44s',st:'success'},
                        {d:'15 Juin 2026 14:33',s:'4.3 GB',t:'Automatique',dur:'3min 12s',st:'failed'},
                      ].map((row,idx)=>(
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-900 text-xs">{row.d}</td>
                          <td className="p-4 font-bold text-slate-700">{row.s}</td>
                          <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.t==='Manuelle'?'bg-blue-100 text-blue-700':'bg-slate-100 text-slate-600'}`}>{row.t}</span></td>
                          <td className="p-4 text-slate-500 text-xs font-medium">{row.dur}</td>
                          <td className="p-4">{row.st==='success'?<span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><Check className="w-3 h-3"/>Succès</span>:<span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold"><XCircle className="w-3 h-3"/>Échoué</span>}</td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-1">
                              {row.st==='success'?(
                                <>
                                  <button onClick={()=>{setRestoreTarget(row.d);setShowRestoreModal(true);}} className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Restaurer</button>
                                  <button onClick={()=>toast.success(`Téléchargement ${row.d}...`)} className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Télécharger</button>
                                </>
                              ):(
                                <button onClick={()=>toast.loading('Nouvelle tentative...',{duration:2000})} className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Réessayer</button>
                              )}
                              <button onClick={()=>{if(window.confirm('Supprimer cette sauvegarde ?'))toast.success('Sauvegarde supprimée.');}} className="px-2.5 py-1 bg-red-50 text-red-500 hover:bg-red-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Supprimer</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: Manual backup */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><HardDrive className="w-5 h-5 text-slate-500"/> Sauvegarde manuelle</h3></div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Éléments à inclure :</p>
                    <div className="flex flex-wrap gap-4">
                      {[{k:'db',l:'Base de données'},{k:'files',l:'Fichiers'},{k:'configs',l:'Configs'},{k:'logs',l:'Logs'}].map(el=>(
                        <label key={el.k} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                          <input type="checkbox" checked={manualItems[el.k]} onChange={()=>setManualItems(p=>({...p,[el.k]:!p[el.k]}))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>{el.l}
                        </label>
                      ))}
                    </div>
                  </div>
                  {backupRunning ? (
                    <div className="space-y-4">
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="h-3 bg-blue-600 rounded-full transition-all duration-700" style={{width:`${backupProgress}%`}}></div>
                      </div>
                      <p className="text-sm font-bold text-blue-600 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Sauvegarde en cours... {backupProgress}%</p>
                      <div className="flex flex-wrap gap-3 text-xs font-bold">
                        <span className={backupProgress>=20?'text-emerald-600':'text-slate-400'}>{backupProgress>=20?'✓':'○'} Connexion établie</span>
                        <span className={backupProgress>=45?'text-emerald-600':'text-slate-400'}>{backupProgress>=45?'✓':'○'} BD exportée</span>
                        <span className={backupProgress>=67?'text-emerald-600':backupProgress>=45?'text-blue-600':'text-slate-400'}>{backupProgress>=67?'✓':backupProgress>=45?'⟳':'○'} Fichiers</span>
                        <span className={backupProgress>=85?'text-emerald-600':'text-slate-400'}>{backupProgress>=85?'✓':'○'} Compression</span>
                        <span className={backupProgress>=100?'text-emerald-600':'text-slate-400'}>{backupProgress>=100?'✓':'○'} Finalisation</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button onClick={startManualBackup} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2">
                        💾 Lancer une sauvegarde maintenant
                      </button>
                      <p className="text-xs text-slate-500 text-center mt-2">Durée estimée : 3 à 5 minutes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Restore Modal */}
              <AnimatePresence>
                {showRestoreModal && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={()=>{setShowRestoreModal(false);setRestoreText('');}}></div>
                    <motion.div initial={{scale:0.95}} animate={{scale:1}} className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-amber-200">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 mx-auto"><AlertTriangle className="w-6 h-6 text-amber-600"/></div>
                      <h3 className="text-xl font-black text-center text-slate-900 mb-2">Restaurer la sauvegarde</h3>
                      <p className="text-xs text-center text-slate-500 mb-1">{restoreTarget}</p>
                      <p className="text-sm text-center text-slate-600 mb-6">⚠ <strong>Attention</strong> — Restaurer cette sauvegarde remplacera <strong className="text-red-600">TOUTES les données actuelles</strong> de la plateforme. Cette action est irréversible.</p>
                      <input type="text" value={restoreText} onChange={e=>setRestoreText(e.target.value)} placeholder="CONFIRMER LA RESTAURATION" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-center mb-4 outline-none focus:border-amber-500"/>
                      <div className="flex gap-3">
                        <button onClick={()=>{setShowRestoreModal(false);setRestoreText('');}} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">Annuler</button>
                        <button disabled={restoreText!=='CONFIRMER LA RESTAURATION'} onClick={()=>{toast.success('Restauration lancée !');setShowRestoreModal(false);setRestoreText('');}} className={`flex-1 py-2.5 font-bold rounded-xl transition-all shadow-md ${restoreText==='CONFIRMER LA RESTAURATION'?'bg-red-600 text-white cursor-pointer hover:bg-red-700':'bg-red-200 text-white cursor-not-allowed'}`}>Restaurer</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-2">
                <button onClick={()=>toast.success('Configuration des sauvegardes enregistrée !')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer">
                  <Save className="w-4 h-4"/> Enregistrer la configuration
                </button>
              </div>

            </motion.div>
          )}

          {/* ==================== ONGLET PROFIL ==================== */}
          {activeTab === 'profile' && (
            <ProfileTab item={item} />
          )}

        </div>

        {/* ==================== SIDEBAR DROITE ==================== */}
        <div className="lg:col-span-1 space-y-6">

          {activeTab === 'payment' && (
            <motion.div variants={item} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-emerald-50 border-b border-emerald-100 p-5">
                  <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-1"><TrendingUp className="w-5 h-5" /> Résumé financier du mois</h3>
                  <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">Mois en cours</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-500">Total encaissé</p>
                    <p className="text-lg font-black text-slate-900">18.5M GNF</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-500">Commissions perçues</p>
                    <p className="text-base font-black text-emerald-600">462 500 GNF</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-500">Remboursements</p>
                    <p className="text-sm font-bold text-slate-400">0 GNF</p>
                  </div>
                  <hr className="border-slate-100"/>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-500">Transact. réussies</p>
                    <p className="text-sm font-bold text-slate-900">1 183</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-500">Taux de succès</p>
                    <p className="text-sm font-bold text-emerald-500">98.2%</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-slate-500" /> Test de connexion rapide</h3>
                <div className="space-y-3">
                  <button onClick={() => {toast.loading('Test Orange Money...', {id:'om'}); setTimeout(()=>{toast.success('Orange Money opérationnel', {id:'om'});},1500)}} className="w-full py-2 bg-[#FF7900] text-white hover:bg-[#e66c00] rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Tester Orange Money</button>
                  <button onClick={() => {toast.loading('Test MTN MoMo...', {id:'mtn'}); setTimeout(()=>{toast.success('MTN MoMo opérationnel', {id:'mtn'});},1500)}} className="w-full py-2 bg-[#FFCC00] text-black hover:bg-[#e6b800] rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Tester MTN MoMo</button>
                  <button onClick={() => {toast.loading('Test Lengo Pay...', {id:'lengo'}); setTimeout(()=>{toast.success('Lengo Pay opérationnel', {id:'lengo'});},1500)}} className="w-full py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer">Tester Lengo Pay</button>
                </div>
                <div className="mt-4 p-3 bg-white border border-slate-100 rounded-lg">
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3"/> Orange Money opérationnel</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'security' && (
            <motion.div variants={item} className="bg-white rounded-2xl border border-red-300 overflow-hidden shadow-sm">
              <div className="bg-red-600 p-5">
                <h3 className="font-black text-white flex items-center gap-2 mb-1"><AlertOctagon className="w-5 h-5" /> Zone Dangereuse</h3>
                <p className="text-xs text-red-100 font-medium">Actions irréversibles. Soyez prudent.</p>
              </div>
              <div className="p-5 space-y-3">
                <button onClick={() => {if(window.confirm('Êtes-vous sûr de vouloir réinitialiser TOUS les mots de passe utilisateurs ?')) toast.success('Mots de passe réinitialisés avec succès.');}} className="w-full py-2.5 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer">Réinitialiser mots de passe</button>
                <button onClick={() => {if(window.confirm('Êtes-vous sûr de vouloir révoquer TOUTES les sessions actives ?')) toast.success('Toutes les sessions ont été révoquées.');}} className="w-full py-2.5 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer">Révoquer sessions actives</button>
                <div className="pt-2">
                  <button onClick={() => setShowLockdownModal(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"><LockKeyhole className="w-4 h-4" /> Verrouillage d'urgence</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'backup' && (
            <motion.div variants={item} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-blue-500"/> Espace de stockage</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">4.7 GB utilisés</span>
                    <span className="text-slate-500">50 GB total</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-2.5 bg-blue-600 rounded-full" style={{width:'9.4%'}}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-right">45.3 GB disponibles</p>
                </div>
                <button className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  Augmenter le stockage
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-amber-500"/> Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-bold text-xs text-slate-900">Email si échec</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifFail} onChange={()=>setNotifFail(!notifFail)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-bold text-xs text-slate-900">Email confirmation</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifSuccess} onChange={()=>setNotifSuccess(!notifSuccess)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-bold text-xs text-slate-900">Alerte espace {'<'} 10%</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifSpace} onChange={()=>setNotifSpace(!notifSpace)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email de destination</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"/>
                      <input type="email" value={notifEmail} onChange={e=>setNotifEmail(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"/>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={item} className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
            <div className="bg-red-50 p-5 border-b border-red-100">
              <h3 className="font-bold text-red-600 flex items-center gap-2 mb-1"><Shield className="w-5 h-5" /> Mode Maintenance</h3>
              <p className="text-xs text-red-800/70 font-medium">Bloque l'accès public à la plateforme.</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message affiché aux utilisateurs :</label>
                <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} rows="3" className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none resize-none focus:border-red-300"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Durée estimée :</label>
                <select value={maintenanceDuration} onChange={e => setMaintenanceDuration(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-300">
                  <option value="15min">15 minutes</option><option value="30min">30 minutes</option><option value="1h">1 heure</option><option value="2h">2 heures</option><option value="indefinite">Indéfinie</option>
                </select>
              </div>
              <button onClick={() => {setMaintenanceMode(!maintenanceMode); toast(maintenanceMode ? 'Maintenance désactivée' : 'Maintenance activée', {icon: maintenanceMode ? '✅' : '🚨'});}} className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer flex justify-center items-center gap-2 ${maintenanceMode ? 'bg-slate-900 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                {maintenanceMode ? 'Désactiver la maintenance' : 'Activer la maintenance'}
              </button>
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1"><Database className="w-4 h-4 text-slate-500" /> Sauvegarde Système</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Dernière sauvegarde</p>
            <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4 shadow-sm">
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3"/> Succès</p>
              <p className="text-xs text-slate-600 mt-0.5">Il y a 2 heures — 25 Juin 2026 à 14h32</p>
            </div>
            <button onClick={() => {toast.loading('Sauvegarde en cours...', {duration:2000}); setTimeout(()=>toast.success('Sauvegarde terminée !'),2000);}} className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm">
              Sauvegarder maintenant
            </button>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default SuperAdminSettings;

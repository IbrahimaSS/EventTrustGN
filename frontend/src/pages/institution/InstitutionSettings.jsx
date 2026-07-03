import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  Building2, Mail, Phone, MapPin, 
  Globe, Camera, Shield, Bell, 
  Save, AlertCircle, CreditCard,
  Activity, CheckCircle2, Download,
  Key, Smartphone, Laptop, Clock,
  Palette, Type, SunMoon, Languages, Plus, Trash2
} from 'lucide-react';

const InstitutionSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    type: 'university',
    description: '',
    email: '',
    phone: '',
    websiteUrl: '',
    address: '',
    logoUrl: '',
    settings: {
      theme: 'Système',
      primaryColor: '#0d6efd',
      font: 'inter',
      uiSize: 'Normal',
      language: 'fr',
      dateFormat: 'eu',
      timeFormat: '24h',
      notifications: {
        emailRegistrations: true,
        emailBilling: true,
        emailSecurity: true,
        emailReports: false,
        smsAlerts: true,
        smsQuota: true,
      }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Payment Methods State (Mock)
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Orange Money', number: '**** 11 22', providerCode: 'OM', color: 'bg-orange-500', isDefault: true }
  ]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ provider: 'MTN Mobile Money', number: '' });

  // Security State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, os: 'Windows', browser: 'Chrome', isCurrent: true, ip: '197.149.20.45', loc: 'Conakry, Guinée', icon: Laptop },
    { id: 2, os: 'iOS', browser: 'Safari', isCurrent: false, ip: '41.205.10.12', loc: 'Conakry, Guinée', icon: Smartphone }
  ]);

  // Logs State
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await api.get('/institutions/me/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/institutions/me');
      setFormData({
        name: res.data.name || '',
        acronym: res.data.acronym || '',
        type: res.data.type || 'university',
        description: res.data.description || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        websiteUrl: res.data.websiteUrl || '',
        address: res.data.address || '',
        logoUrl: res.data.logoUrl || '',
        settings: {
          theme: res.data.settings?.theme || 'Système',
          primaryColor: res.data.settings?.primaryColor || '#0d6efd',
          font: res.data.settings?.font || 'inter',
          uiSize: res.data.settings?.uiSize || 'Normal',
          language: res.data.settings?.language || 'fr',
          dateFormat: res.data.settings?.dateFormat || 'eu',
          timeFormat: res.data.settings?.timeFormat || '24h',
          notifications: {
            emailRegistrations: res.data.settings?.notifications?.emailRegistrations ?? true,
            emailBilling: res.data.settings?.notifications?.emailBilling ?? true,
            emailSecurity: res.data.settings?.notifications?.emailSecurity ?? true,
            emailReports: res.data.settings?.notifications?.emailReports ?? false,
            smsAlerts: res.data.settings?.notifications?.smsAlerts ?? true,
            smsQuota: res.data.settings?.notifications?.smsQuota ?? true,
          }
        }
      });
    } catch (error) {
      toast.error('Erreur lors du chargement du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Real-time preview of settings
  useEffect(() => {
    if (isLoading) return; // Prevent flickering by not applying default theme before data loads
    if (formData.settings) {
      const { primaryColor, font } = formData.settings;
      if (primaryColor) document.documentElement.style.setProperty('--sidebar-bg', primaryColor);
      
      const fontMap = {
        inter: "'Inter', sans-serif",
        roboto: "'Roboto', sans-serif",
        poppins: "'Poppins', sans-serif",
        outfit: "'Outfit', sans-serif",
        montserrat: "'Montserrat', sans-serif"
      };
      if (font && fontMap[font]) {
        document.documentElement.style.setProperty('--app-font', fontMap[font]);
      }
    }
  }, [formData.settings]);

  const handleSettingChange = (field, value) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [field]: value
      }
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (Max 2MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationToggle = (key) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        notifications: {
          ...formData.settings.notifications,
          [key]: !formData.settings.notifications[key]
        }
      }
    });
  };

  const handleAddPaymentMethod = () => {
    if (!newPayment.number.trim()) {
      toast.error('Veuillez entrer un numéro valide.');
      return;
    }
    
    let color = 'bg-yellow-500';
    let code = 'MTN';
    
    if (newPayment.provider === 'Orange Money') {
      color = 'bg-orange-500';
      code = 'OM';
    } else if (newPayment.provider === 'Visa') {
      color = 'bg-blue-600';
      code = 'VISA';
    } else if (newPayment.provider === 'Mastercard') {
      color = 'bg-slate-900';
      code = 'MC';
    }

    const maskedNumber = '**** ' + newPayment.number.slice(-4).padStart(4, '0');

    setPaymentMethods([...paymentMethods, {
      id: Date.now(),
      type: newPayment.provider,
      number: maskedNumber,
      providerCode: code,
      color: color,
      isDefault: paymentMethods.length === 0
    }]);
    
    setShowPaymentForm(false);
    setNewPayment({ provider: 'MTN Mobile Money', number: '' });
    toast.success('Moyen de paiement ajouté.');
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await api.put('/institutions/me', formData);
      toast.success('Profil mis à jour avec succès.');
      setTimeout(() => window.location.reload(), 1500); // Recharge pour actualiser le logo dans la navbar
    } catch (error) {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  // Security Handlers
  const handlePasswordChange = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Veuillez remplir tous les champs de mot de passe.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    toast.success('Mot de passe mis à jour avec succès.');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    if (!is2FAEnabled) {
      toast.success('L\'authentification à deux facteurs est maintenant activée.');
    } else {
      toast.success('L\'authentification à deux facteurs a été désactivée.');
    }
  };

  const handleDisconnectSession = (id) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
    toast.success('Session déconnectée avec succès.');
  };

  // Audit Logs Handler
  const handleDownloadLogs = () => {
    toast.success('Téléchargement du rapport d\'audit en cours...');
    // Simulation du téléchargement
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(logs, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = "audit_logs.json";
      document.body.appendChild(element);
      element.click();
    }, 1000);
  };

  const handleClearLogs = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider TOUT l'historique d'audit ? Cette action est irréversible.")) {
      try {
        await api.delete('/institutions/me/logs');
        toast.success('Journal d\'audit vidé avec succès.');
        fetchLogs(); // Reload logs
      } catch (error) {
        toast.error('Erreur lors de la suppression des logs.');
      }
    }
  };

  const mockInvoices = [
    { id: 'INV-2026-12-01', date: '01 Décembre 2026', amount: '500 000 GNF', status: 'paid', plan: 'Plan Premium' },
    { id: 'INV-2026-11-01', date: '01 Novembre 2026', amount: '500 000 GNF', status: 'paid', plan: 'Plan Premium' },
    { id: 'INV-2026-10-01', date: '01 Octobre 2026', amount: '500 000 GNF', status: 'paid', plan: 'Plan Premium' },
  ];

  const handleNotImplemented = () => {
    toast.error('Cette fonctionnalité sera disponible dans la prochaine mise à jour.');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Paramètres de l'Institution</h2>
        <p className="text-slate-500 text-sm mt-1">Gérez le profil de votre organisation, vos préférences et la sécurité.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {[
          { id: 'profile', icon: Building2, label: 'Profil Public' },
          { id: 'contact', icon: MapPin, label: 'Contact & Adresse' },
          { id: 'customization', icon: Palette, label: 'Personnalisation' },
          { id: 'notifications', icon: Bell, label: 'Notifications' },
          { id: 'billing', icon: CreditCard, label: 'Facturation' },
          { id: 'audit', icon: Activity, label: 'Audit (Logs)' },
          { id: 'security', icon: Shield, label: 'Sécurité' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-[#0A1F44] text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Informations de base</h3>
                <p className="text-sm text-slate-500">Ces informations seront visibles publiquement sur la page de vos événements.</p>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Logo Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden relative">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-slate-400" />
                      )}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id="logo-upload"
                      />
                    </div>
                    <label htmlFor="logo-upload" className="cursor-pointer absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm transition-colors">
                      <Camera className="w-4 h-4" />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Logo de l'institution</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3 max-w-xs">Format recommandé : carré, au moins 400x400px. JPG ou PNG, max 2MB.</p>
                    <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                      Changer le logo
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom de l'Institution</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Sigle / Abréviation</label>
                    <input 
                      type="text" 
                      name="acronym"
                      value={formData.acronym}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Type d'Institution</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="cursor-pointer w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="university">Université Publique</option>
                      <option value="private_university">Université Privée</option>
                      <option value="institute">Institut Supérieur</option>
                      <option value="enterprise">Entreprise / Société</option>
                      <option value="ong">ONG / Association</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description détaillée</label>
                    <textarea 
                      rows="4"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="cursor-pointer px-6 py-2.5 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Coordonnées</h3>
                <p className="text-sm text-slate-500">Où et comment les participants peuvent-ils vous joindre ?</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email de contact public</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Téléphone public</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Site Web</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse Physique</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea 
                        rows="3"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="cursor-pointer px-6 py-2.5 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Mise à jour...' : 'Mettre à jour les contacts'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB: CUSTOMIZATION */}
          {activeTab === 'customization' && (
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Personnalisation de l'Espace</h3>
                <p className="text-sm text-slate-500">Adaptez l'apparence de votre tableau de bord selon vos préférences.</p>
              </div>
              <div className="p-6 space-y-8">
                
                {/* Theme & Colors */}
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <SunMoon className="w-5 h-5 text-orange-500" /> Thème et Couleurs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mode d'affichage</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['Clair', 'Sombre', 'Système'].map((theme, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSettingChange('theme', theme)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${formData.settings.theme === theme ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Couleur principale</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { bg: '#0d6efd', label: 'Bleu' },
                          { bg: '#10b981', label: 'Émeraude' },
                          { bg: '#f59e0b', label: 'Orange' },
                          { bg: '#8b5cf6', label: 'Violet' },
                          { bg: '#ec4899', label: 'Rose' },
                          { bg: '#0A1F44', label: 'Marine' },
                        ].map((color, i) => (
                          <button 
                            key={i} 
                            title={color.label}
                            onClick={() => handleSettingChange('primaryColor', color.bg)}
                            className={`cursor-pointer w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${formData.settings.primaryColor === color.bg ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`} 
                            style={{ background: color.bg }}
                          ></button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Typography */}
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5 text-indigo-500" /> Typographie
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Police d'écriture</label>
                      <select 
                        value={formData.settings.font}
                        onChange={(e) => handleSettingChange('font', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="inter">Inter (Défaut)</option>
                        <option value="roboto">Roboto</option>
                        <option value="poppins">Poppins</option>
                        <option value="outfit">Outfit</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="lato">Lato</option>
                        <option value="opensans">Open Sans</option>
                        <option value="nunito">Nunito</option>
                        <option value="raleway">Raleway</option>
                        <option value="ubuntu">Ubuntu</option>
                        <option value="quicksand">Quicksand</option>
                        <option value="firasans">Fira Sans</option>
                        <option value="playfair">Playfair Display (Serif)</option>
                        <option value="merriweather">Merriweather (Serif)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Taille de l'interface</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['Compact', 'Normal', 'Large'].map((size, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSettingChange('uiSize', size)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${formData.settings.uiSize === size ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Localization */}
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Languages className="w-5 h-5 text-emerald-500" /> Langue et Formats
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Langue de l'interface</label>
                      <select 
                        value={formData.settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="fr">Français (France)</option>
                        <option value="en">English (US)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Format de Date / Heure</label>
                      <select 
                        value={formData.settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer mb-3"
                      >
                        <option value="eu">JJ/MM/AAAA (ex: 25/12/2026)</option>
                        <option value="us">MM/JJ/AAAA (ex: 12/25/2026)</option>
                      </select>
                      <select 
                        value={formData.settings.timeFormat}
                        onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="24h">24 Heures (ex: 14:30)</option>
                        <option value="12h">12 Heures (ex: 02:30 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="cursor-pointer px-6 py-2.5 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Enregistrement...' : 'Sauvegarder l\'apparence'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB: BILLING */}
          {activeTab === 'billing' && (
            <motion.div variants={item} className="space-y-6">
              {/* Current Plan */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Plan Premium</h3>
                    <p className="text-sm text-slate-500 mt-1">Facturation mensuelle. Prochain prélèvement le 01 Jan 2027.</p>
                  </div>
                  <span className="text-2xl font-black text-[#0d6efd]">500 000 <span className="text-sm text-slate-500 font-bold">GNF/mois</span></span>
                </div>
                <div className="mt-6 flex gap-3 relative z-10">
                  <button onClick={handleNotImplemented} className="cursor-pointer px-4 py-2 bg-[#0A1F44] text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
                    Changer d'abonnement
                  </button>
                  <button onClick={handleNotImplemented} className="cursor-pointer px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                    Annuler l'abonnement
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Moyens de paiement</h3>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-8 ${pm.color} rounded flex items-center justify-center text-white text-xs font-black`}>{pm.providerCode}</div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{pm.type}</p>
                          <p className="text-xs text-slate-500">{pm.number}</p>
                        </div>
                      </div>
                      {pm.isDefault ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Par défaut</span>
                      ) : (
                        <button 
                          onClick={() => handleSetDefaultPayment(pm.id)}
                          className="cursor-pointer text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm hover:border-blue-200 hover:bg-blue-50"
                        >
                          Rendre par défaut
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {showPaymentForm ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Ajouter un nouveau moyen de paiement</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Fournisseur</label>
                        <select 
                          value={newPayment.provider}
                          onChange={(e) => setNewPayment({...newPayment, provider: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="MTN Mobile Money">MTN Mobile Money</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="Visa">Carte Visa</option>
                          <option value="Mastercard">Mastercard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Numéro (Mobile ou Carte)</label>
                        <input 
                          type="text" 
                          value={newPayment.number}
                          onChange={(e) => setNewPayment({...newPayment, number: e.target.value})}
                          placeholder="Ex: 622 00 11 22 ou 4242 ****"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <button onClick={() => setShowPaymentForm(false)} className="cursor-pointer px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        Annuler
                      </button>
                      <button onClick={handleAddPaymentMethod} className="cursor-pointer px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                        Ajouter
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button onClick={() => setShowPaymentForm(true)} className="cursor-pointer mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Ajouter un moyen de paiement
                  </button>
                )}
              </div>

              {/* Billing History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Historique de facturation</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Plan</th>
                      <th className="p-4 font-bold">Montant</th>
                      <th className="p-4 font-bold">Statut</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInvoices.map((inv, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-900 font-medium">{inv.date}</td>
                        <td className="p-4 text-slate-600">{inv.plan}</td>
                        <td className="p-4 font-bold text-slate-900">{inv.amount}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Payé
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={handleNotImplemented} className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors" title="Télécharger">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: AUDIT (LOGS) */}
          {activeTab === 'audit' && (
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Journal d'audit (Logs)</h3>
                  <p className="text-sm text-slate-500">Historique des actions récentes effectuées sur ce compte.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleClearLogs} className="cursor-pointer p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors" title="Vider l'historique">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleDownloadLogs} className="cursor-pointer p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors" title="Télécharger (.json)">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                      <th className="p-4 pl-6 border-r border-slate-200">Date / Heure</th>
                      <th className="p-4 border-r border-slate-200">Action effectuée</th>
                      <th className="p-4 border-r border-slate-200">Adresse IP</th>
                      <th className="p-4 pr-6">Appareil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingLogs ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500">Chargement des logs...</td></tr>
                    ) : logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 border-r border-slate-200">
                            <p className="font-medium text-slate-600 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </td>
                          <td className="p-4 border-r border-slate-200">
                            <p className={`font-bold ${log.action.includes('échouée') ? 'text-red-500' : 'text-slate-900'}`}>{log.action}</p>
                            {log.userId && <p className="text-xs text-slate-500">Par: {log.userId.fullName}</p>}
                          </td>
                          <td className="p-4 border-r border-slate-200 text-slate-500 font-mono text-xs">{log.ipAddress || 'Non spécifiée'}</td>
                          <td className="p-4 pr-6 text-slate-500">Système</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500">Aucun log trouvé.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <motion.div variants={item} className="space-y-6">
              
              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#0d6efd]" /> Mot de passe
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe actuel</label>
                    <input 
                      type="password" 
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                      <input 
                        type="password" 
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button onClick={handlePasswordChange} className="cursor-pointer px-6 py-2.5 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all">
                    Mettre à jour
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-slate-600" /> Authentification à deux facteurs (2FA)
                  </h3>
                  <p className="text-sm text-slate-500">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                </div>
                <button 
                  onClick={handleToggle2FA}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 border rounded-xl text-sm font-bold transition-colors ${is2FAEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                >
                  {is2FAEnabled ? '2FA Activé' : 'Activer 2FA'}
                </button>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Sessions actives</h3>
                  <p className="text-sm text-slate-500 mt-1">Déconnectez-vous des autres appareils si vous remarquez une activité suspecte.</p>
                </div>
                <div className="p-6 space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className={`flex items-center justify-between p-4 border rounded-xl ${session.isCurrent ? 'border-blue-100 bg-blue-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <session.icon className={`w-8 h-8 ${session.isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-bold text-slate-900">{session.os} / {session.browser} {session.isCurrent && '(Cet appareil)'}</p>
                          <p className="text-xs text-slate-500">{session.loc} • {session.ip}</p>
                        </div>
                      </div>
                      {session.isCurrent ? (
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">Actif</span>
                      ) : (
                        <button onClick={() => handleDisconnectSession(session.id)} className="cursor-pointer text-xs font-bold text-red-500 hover:text-red-700 transition-colors bg-white border border-red-100 px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-50">
                          Déconnecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Préférences de notifications</h3>
                <p className="text-sm text-slate-500">Choisissez comment et quand vous souhaitez être informé.</p>
              </div>
              <div className="p-6 space-y-8">
                
                {/* Email Notifications */}
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-500" /> Notifications par Email
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailRegistrations', title: "Nouvelles inscriptions", desc: "Recevoir un email lorsqu'un participant s'inscrit à un événement." },
                      { key: 'emailBilling', title: "Paiements et Factures", desc: "Reçus, rappels de paiement et alertes d'abonnement." },
                      { key: 'emailSecurity', title: "Alertes de sécurité", desc: "Nouvelles connexions, changements de mot de passe." },
                      { key: 'emailReports', title: "Rapport analytique hebdomadaire", desc: "Un résumé des statistiques de vos événements chaque lundi." },
                    ].map((notif, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.settings.notifications?.[notif.key] || false}
                            onChange={() => handleNotificationToggle(notif.key)} 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d6efd]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS & Push Notifications */}
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Smartphone className="w-5 h-5 text-emerald-500" /> SMS & Push (In-App)
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'smsAlerts', title: "Alertes scans & accès", desc: "Alerte en temps réel si un badge falsifié ou refusé est détecté (Push)." },
                      { key: 'smsQuota', title: "Quota SMS bas", desc: "Alerte quand le crédit de SMS pour vos participants est presque épuisé." },
                    ].map((notif, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.settings.notifications?.[notif.key] || false}
                            onChange={() => handleNotificationToggle(notif.key)} 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="cursor-pointer px-6 py-2.5 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* Sidebar Status/Info */}
        <div className="space-y-6">
          <motion.div variants={item} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-blue-500" /> État du compte
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Statut</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Vérifié</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Plan actuel</span>
                <span className="font-bold text-[#0A1F44]">Premium</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Membre depuis</span>
                <span className="font-semibold text-slate-700">Septembre 2026</span>
              </div>
            </div>
            <hr className="my-4 border-slate-200" />
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Quota d'événements (Mensuel)</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 text-right">8 / 20 événements créés</p>
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <h3 className="font-bold text-red-600 mb-2 relative z-10">Zone de danger</h3>
            <p className="text-xs text-slate-600 mb-4 relative z-10">
              La suppression de votre compte institution est irréversible. Toutes vos données d'événements et d'inscriptions seront effacées.
            </p>
            <button className="cursor-pointer w-full px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors relative z-10">
              Supprimer le compte
            </button>
          </motion.div>
        </div>

      </div>

    </motion.div>
  );
};

export default InstitutionSettings;

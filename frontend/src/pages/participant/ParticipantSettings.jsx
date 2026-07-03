import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Bell, Shield, Eye, EyeOff, Globe, Download, 
  Trash2, Smartphone, Key, History, Mail, AlertTriangle, Languages, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const loginHistoryMock = [
  { device: 'Chrome on Windows (v114.0)', ip: '197.234.34.89', location: 'Conakry, GN', date: 'Aujourd\'hui à 15:42', current: true },
  { device: 'Safari on iPhone 13', ip: '197.234.34.12', location: 'Conakry, GN', date: 'Hier à 09:12', current: false },
  { device: 'Firefox on macOS', ip: '102.64.12.98', location: 'Kamsar, GN', date: '12 Déc 2026 à 18:24', current: false }
];

const ParticipantSettings = () => {
  const [activeTab, setActiveTab] = useState('security'); // security, notifications, privacy, general
  const [loading, setLoading] = useState(false);
  
  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [twoFactor, setTwoFactor] = useState(() => JSON.parse(localStorage.getItem('twoFactor') || 'false'));

  // Notifications state
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notifications')) || {
    emailInscriptions: true,
    emailBadges: true,
    emailReminders: true,
    emailPartners: false,
    pushInscriptions: true,
    pushBadges: true,
    smsAlerts: false
  });

  // Privacy state
  const [privacy, setPrivacy] = useState(() => JSON.parse(localStorage.getItem('privacy')) || {
    publicProfile: true,
    showBadges: true,
    showParticipations: false,
    blockchainVerification: true
  });

  // General state
  const [general, setGeneral] = useState(() => JSON.parse(localStorage.getItem('general')) || {
    language: 'fr',
    theme: 'light',
  });

  React.useEffect(() => {
    localStorage.setItem('twoFactor', JSON.stringify(twoFactor));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('privacy', JSON.stringify(privacy));
    localStorage.setItem('general', JSON.stringify(general));
    window.dispatchEvent(new Event('preferencesUpdated'));
  }, [twoFactor, notifications, privacy, general]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas !');
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Mot de passe changé avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (stateName, key, label) => {
    const setters = {
      notifications: setNotifications,
      privacy: setPrivacy
    };
    
    setters[stateName](prev => {
      const nextVal = !prev[key];
      toast.success(`${label} : ${nextVal ? 'Activé' : 'Désactivé'}`);
      return { ...prev, [key]: nextVal };
    });
  };

  const handleExportData = () => {
    toast.loading('Génération de l\'archive de données...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Archive prête ! Le téléchargement va commencer.');
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl dark:text-white">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Centre de Configuration</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Configurez votre compte, gérez votre sécurité et personnalisez vos préférences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0A1F44] py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 overflow-hidden">
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left py-3 rounded-r-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'security' 
                ? 'border-l-4 border-[#0d6efd] bg-blue-50/30 dark:bg-white/10 text-[#0A1F44] dark:text-white pl-3.5' 
                : 'border-l-4 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white pl-4'
            }`}
          >
            <Lock className={`w-4 h-4 ${activeTab === 'security' ? 'text-[#0d6efd]' : 'text-slate-400'}`} /> Sécurité & Accès
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left py-3 rounded-r-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'notifications' 
                ? 'border-l-4 border-[#0d6efd] bg-blue-50/30 text-[#0A1F44] pl-3.5' 
                : 'border-l-4 border-transparent text-slate-500 hover:bg-slate-50/50 hover:text-slate-800 pl-4'
            }`}
          >
            <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-[#0d6efd]' : 'text-slate-400'}`} /> Notifications
          </button>
          
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left py-3 rounded-r-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'privacy' 
                ? 'border-l-4 border-[#0d6efd] bg-blue-50/30 text-[#0A1F44] pl-3.5' 
                : 'border-l-4 border-transparent text-slate-500 hover:bg-slate-50/50 hover:text-slate-800 pl-4'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'privacy' ? 'text-[#0d6efd]' : 'text-slate-400'}`} /> Confidentialité & Données
          </button>
          
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left py-3 rounded-r-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'general' 
                ? 'border-l-4 border-[#0d6efd] bg-blue-50/30 text-[#0A1F44] pl-3.5' 
                : 'border-l-4 border-transparent text-slate-500 hover:bg-slate-50/50 hover:text-slate-800 pl-4'
            }`}
          >
            <Globe className={`w-4 h-4 ${activeTab === 'general' ? 'text-[#0d6efd]' : 'text-slate-400'}`} /> Préférences Générales
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* TABS 1: SECURITY */}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Password Form */}
                <div className="bg-white dark:bg-[#0A1F44] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Key className="w-5 h-5 text-slate-400" /> Modifier mon mot de passe
                  </h3>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe actuel</label>
                      <div className="relative">
                        <input 
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwords.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nouveau mot de passe</label>
                        <div className="relative">
                          <input 
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirmer le nouveau</label>
                        <div className="relative">
                          <input 
                            type={showPassword.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-[#0A1F44] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                      >
                        {loading ? 'Modification...' : 'Modifier le mot de passe'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2FA Option */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-slate-400" /> Double Authentification (2FA)
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Sécurisez votre compte en demandant un code supplémentaire envoyé par SMS lors de vos connexions.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setTwoFactor(!twoFactor);
                        toast.success(`Authentification à deux facteurs : ${!twoFactor ? 'Activée' : 'Désactivée'}`);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                        twoFactor ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                    </button>
                  </div>
                </div>

                {/* Login History */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" /> Historique des connexions récents
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {loginHistoryMock.map((log, index) => (
                      <div key={index} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {log.device}
                            {log.current && <span className="bg-blue-50 text-[#0d6efd] text-[9px] px-2 py-0.5 rounded-full font-bold">Actuel</span>}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.ip} • {log.location}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{log.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 2: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-400" /> Préférences d'alertes
                </h3>

                <div className="space-y-6">
                  {/* Email Channel */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Mail className="w-4 h-4" /> Alertes par Email</h4>
                    
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Inscriptions d'événements</p>
                        <p className="text-xs text-slate-500 font-medium">Notification et récapitulatifs d'inscription à un événement.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('notifications', 'emailInscriptions', 'Emails d\'inscriptions')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          notifications.emailInscriptions ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Délivrance de badges</p>
                        <p className="text-xs text-slate-500 font-medium">Alertes immédiates lorsqu'un badge blockchain vous est attribué.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('notifications', 'emailBadges', 'Emails de badges')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          notifications.emailBadges ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Rappels de calendrier</p>
                        <p className="text-xs text-slate-500 font-medium">Alertes de rappel 24h et 1h avant le début de l'événement.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('notifications', 'emailReminders', 'Rappels email')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          notifications.emailReminders ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>
                  </div>

                  {/* SMS Channel */}
                  <div className="space-y-4 border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Smartphone className="w-4 h-4" /> Alertes SMS</h4>
                    
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Alertes critiques par SMS</p>
                        <p className="text-xs text-slate-500 font-medium">Recevez vos codes d'inscriptions et rappels urgents directement sur mobile.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('notifications', 'smsAlerts', 'Alertes SMS')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          notifications.smsAlerts ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TABS 3: PRIVACY */}
            {activeTab === 'privacy' && (
              <motion.div 
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#0A1F44] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" /> Visibilité & Blockchain
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Profil Public</p>
                        <p className="text-xs text-slate-500 font-medium">Permettre aux recruteurs de voir vos badges officiels via votre page profil.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('privacy', 'publicProfile', 'Profil public')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          privacy.publicProfile ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Afficher mes badges blockchain</p>
                        <p className="text-xs text-slate-500 font-medium">Rendre visibles vos compétences validées sur les registres décentralisés.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('privacy', 'showBadges', 'Affichage des badges')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          privacy.showBadges ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Vérification décentralisée permanente</p>
                        <p className="text-xs text-slate-500 font-medium">Autorise la vérification cryptographique instantanée des attestations.</p>
                      </div>
                      <button 
                        onClick={() => handleToggle('privacy', 'blockchainVerification', 'Vérification Blockchain')}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                          privacy.blockchainVerification ? 'bg-[#0d6efd] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Export & Account Deletion */}
                <div className="bg-white dark:bg-[#0A1F44] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Gestion des Données (RGPD)</h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Exporter mes données</p>
                      <p className="text-xs text-slate-400 font-medium">Télécharger toutes vos participations, inscriptions et badges certifiés en format JSON.</p>
                    </div>
                    <button 
                      onClick={handleExportData}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <Download className="w-4 h-4" /> Exporter (JSON)
                    </button>
                  </div>

                  <div className="border-t border-rose-100 bg-rose-50/50 p-4 rounded-xl space-y-4 mt-6">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-rose-900">Zone de danger : Supprimer mon compte</p>
                        <p className="text-[11px] text-rose-700/80 font-medium mt-0.5">Cette action est irréversible. Toutes vos inscriptions seront révoquées et vos badges non blockchain seront définitivement supprimés.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte EventTrust GN ?");
                        if (confirm) toast.error("Suppression simulée.");
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer définitivement le compte
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 4: GENERAL PREFERENCES */}
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-slate-400" /> Préférences d'affichage
                </h3>

                <div className="space-y-6">
                  {/* Language */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Languages className="w-4 h-4 text-slate-400" /> Langue de la plateforme</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Configurez votre langue par défaut.</p>
                    </div>
                    <select 
                      value={general.language}
                      onChange={(e) => {
                        setGeneral(prev => ({ ...prev, language: e.target.value }));
                        toast.success(`Langue changée en : ${e.target.value === 'fr' ? 'Français' : 'English'}`);
                      }}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="fr">Français (FR)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </div>

                  {/* Theme */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Sun className="w-4 h-4 text-slate-400" /> Thème d'affichage</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Basculez entre le mode clair et le mode sombre.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button 
                        onClick={() => {
                          setGeneral(prev => ({ ...prev, theme: 'light' }));
                          toast.success("Mode clair activé.");
                        }}
                        className={`p-1.5 rounded-md ${general.theme === 'light' ? 'bg-white shadow text-amber-500' : 'text-slate-400'}`}
                      >
                        <Sun className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setGeneral(prev => ({ ...prev, theme: 'dark' }));
                          toast.success("Mode sombre activé.");
                        }}
                        className={`p-1.5 rounded-md ${general.theme === 'dark' ? 'bg-white shadow text-indigo-500' : 'text-slate-400'}`}
                      >
                        <Moon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default ParticipantSettings;

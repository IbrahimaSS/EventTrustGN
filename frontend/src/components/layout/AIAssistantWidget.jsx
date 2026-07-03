import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Loader2, RotateCcw, Copy, Check, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

// ============================================================
// ACTIONS MAP — Routes et actions que TrustAI peut exécuter
// ============================================================
const PARTICIPANT_ACTIONS = [
  { keywords: ['dashboard', 'tableau de bord', 'accueil', 'page principale'], route: '/participant/dashboard', label: 'Tableau de bord' },
  { keywords: ['événement', 'evenement', 'mes événements', 'mes evenements', 'events'], route: '/participant/events', label: 'Mes événements' },
  { keywords: ['inscription', 'mes inscriptions', 'demandes'], route: '/participant/inscriptions', label: 'Mes inscriptions' },
  { keywords: ['badge', 'mes badges', 'badges', 'blockchain', 'distinction'], route: '/participant/badges', label: 'Mes badges' },
  { keywords: ['profil', 'mon profil', 'informations personnelles', 'modifier profil'], route: '/participant/profile', label: 'Mon profil' },
  { keywords: ['paramètre', 'paramètres', 'réglages', 'settings', 'mot de passe', 'sécurité', 'mode sombre'], route: '/participant/settings', label: 'Paramètres' },
];

const INSTITUTION_ACTIONS = [
  { keywords: ['dashboard', 'tableau de bord', 'accueil'], route: '/institution/dashboard', label: 'Tableau de bord' },
  { keywords: ['événement', 'evenement', 'mes événements', 'liste événements'], route: '/institution/events', label: 'Événements' },
  { keywords: ['créer événement', 'creer evenement', 'nouveau événement', 'nouvel événement', 'créer un événement'], route: '/institution/events/create', label: 'Créer un événement' },
  { keywords: ['inscription', 'inscriptions', 'demandes inscription', 'valider inscription'], route: '/institution/registrations', label: 'Inscriptions' },
  { keywords: ['participant', 'participants', 'liste participants'], route: '/institution/participants', label: 'Participants' },
  { keywords: ['badge', 'badges', 'qr code', 'qr'], route: '/institution/badges', label: 'Badges & QR' },
  { keywords: ['scan', 'scanner', 'scans', 'accès', 'contrôle accès'], route: '/institution/scans', label: 'Scans & Accès' },
  { keywords: ['analytique', 'analytics', 'statistique', 'stats', 'performance'], route: '/institution/analytics', label: 'Analytiques' },
  { keywords: ['paramètre', 'paramètres', 'réglages', 'settings'], route: '/institution/settings', label: 'Paramètres' },
];

const SUPERADMIN_ACTIONS = [
  { keywords: ['dashboard', 'tableau de bord', 'accueil'], route: '/admin/dashboard', label: 'Vue d\'ensemble' },
  { keywords: ['institution', 'institutions', 'liste des institutions', 'écoles', 'universités'], route: '/admin/institutions', label: 'Institutions' },
  { keywords: ['événement', 'evenement', 'événements', 'liste des événements'], route: '/admin/events', label: 'Événements globaux' },
  { keywords: ['utilisateur', 'utilisateurs', 'membres', 'participants'], route: '/admin/users', label: 'Utilisateurs' },
  { keywords: ['finance', 'finances', 'abonnements', 'paiements', 'revenus'], route: '/admin/finance', label: 'Finances & Abonnements' },
  { keywords: ['paramètre', 'paramètres', 'réglages', 'settings', 'configuration', 'personnalisation'], route: '/admin/settings', label: 'Paramètres système' },
];

const PUBLIC_ACTIONS = [
  { keywords: ['connexion', 'se connecter', 'login'], route: '/login', label: 'Connexion' },
  { keywords: ['inscription', 's\'inscrire', 'register', 'créer un compte'], route: '/register', label: 'Inscription' },
  { keywords: ['événements', 'evenements', 'découvrir'], route: '/events', label: 'Événements Publics' },
];

// Détecte si le message demande une action de navigation
const detectAction = (text, variant) => {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Si c'est clairement une question, on ne navigue pas (on laisse l'IA répondre)
  const isQuestion = text.includes('?') || 
                     lower.includes('comment') || 
                     lower.includes('pourquoi') || 
                     lower.includes('quel') || 
                     lower.includes('est-ce') || 
                     lower.includes('peux-tu') ||
                     lower.includes('c\'est quoi');
                     
  if (isQuestion) return null;

  let actions = PARTICIPANT_ACTIONS;
  if (variant === 'institution') actions = INSTITUTION_ACTIONS;
  if (variant === 'superadmin') actions = SUPERADMIN_ACTIONS;
  if (variant === 'public') actions = PUBLIC_ACTIONS;

  // Mots-clés d'intention d'action directs
  const actionIntents = [
    'ouvre', 'ouvrir', 'affiche', 'afficher', 'montre', 'montrer', 'va', 'aller',
    'emmene', 'emmène', 'emmener', 'dirige', 'diriger', 'navigue', 'naviguer',
    'amene', 'amène', 'amener', 'redirige', 'rediriger', 'conduis', 'conduire',
    'voir', 'acceder', 'accéder', 'consulter', 'rejoindre', 'page'
  ];

  const hasActionIntent = actionIntents.some(intent => lower.includes(intent));

  // Chercher la meilleure correspondance
  let bestMatch = null;
  let bestScore = 0;

  for (const action of actions) {
    for (const kw of action.keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(kwNorm)) {
        // On vérifie que le mot clé correspond bien et n'est pas juste un bout de mot (sauf si c'est voulu)
        const score = kwNorm.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = action;
        }
      }
    }
  }

  // On ne navigue que si l'intention d'action est détectée
  // OU si c'est une commande directe ultra courte (ex: "connexion", "dashboard")
  if (bestMatch && (hasActionIntent || text.trim().split(' ').length <= 2)) {
    return bestMatch;
  }

  return null;
};

const AIAssistantWidget = ({ variant = 'participant' }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const isInstitution = variant === 'institution';
  const isSuperAdmin = variant === 'superadmin';
  const isPublic = variant === 'public';

  const aiName = settings?.aiAssistant?.name || 'TrustAI';

  let quickPrompts = [];
  if (isSuperAdmin) {
    quickPrompts = [
      { icon: '🏫', text: 'Gérer les institutions' },
      { icon: '💰', text: 'Voir les revenus' },
      { icon: '👥', text: 'Liste des utilisateurs' },
      { icon: '⚙️', text: 'Paramètres globaux' },
    ];
  } else if (isInstitution) {
    quickPrompts = [
      { icon: '📋', text: 'Ouvre les inscriptions' },
      { icon: '📊', text: 'Affiche les analytiques' },
      { icon: '✍️', text: 'Créer un événement' },
      { icon: '🔍', text: 'Ouvre le scanner' },
    ];
  } else if (isPublic) {
    quickPrompts = [
      { icon: '🎫', text: 'Découvrir les événements' },
      { icon: '🔒', text: 'Se connecter' },
      { icon: '📝', text: 'Créer un compte' },
      { icon: '❓', text: 'Comment ça marche ?' },
    ];
  } else {
    quickPrompts = [
      { icon: '🎫', text: 'Affiche mes événements' },
      { icon: '🏅', text: 'Ouvre mes badges' },
      { icon: '📝', text: 'Voir mes inscriptions' },
      { icon: '⚙️', text: 'Ouvre les paramètres' },
    ];
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message
  useEffect(() => {
    const firstName = user?.fullName?.split(' ')[0] || 'là';
    let welcomeMsg = '';
    
    if (isSuperAdmin) {
      welcomeMsg = `Bonjour Patron ! 👋 Je suis **${aiName}**, votre assistant Gouvernance.\n\nJe peux vous diriger rapidement :\n- 🏫 *"Ouvre les institutions"*\n- 💰 *"Affiche les finances"*\n- ⚙️ *"Paramètres système"*\n\nOu posez-moi n'importe quelle question globale !`;
    } else if (isInstitution) {
      welcomeMsg = `Bonjour ! 👋 Je suis **${aiName}**, votre assistant EventTrust GN.\n\nJe peux **exécuter des actions** pour vous :\n- 📋 *"Ouvre les inscriptions"*\n- ✍️ *"Créer un événement"*\n- 🔍 *"Lance le scanner"*\n- 📊 *"Affiche les analytiques"*\n\nOu posez-moi n'importe quelle question !`;
    } else if (isPublic) {
      welcomeMsg = `Bonjour ! 👋 Je suis **${aiName}**, le guide officiel d'EventTrust GN.\n\nJe suis là pour vous aider à :\n- 🎫 *"Découvrir nos événements"*\n- 🔒 *"Vous connecter ou créer un compte"*\n- ❓ *"Comprendre comment ça marche"*\n\nPosez-moi n'importe quelle question !`;
    } else {
      welcomeMsg = `Salut ${firstName} ! 👋 Je suis **${aiName}**, votre assistant EventTrust GN.\n\nJe peux **naviguer pour vous** :\n- 🎫 *"Affiche mes événements"*\n- 🏅 *"Ouvre mes badges"*\n- ⚙️ *"Va aux paramètres"*\n\nOu posez-moi n'importe quelle question !`;
    }

    setMessages([{ role: 'assistant', content: welcomeMsg }]);
  }, [variant, user, aiName, isInstitution, isSuperAdmin, isPublic]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Markdown renderer
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:4px;font-size:10px;">$1</code>')
      .replace(/^- (.*)/gm, '<div style="display:flex;align-items:flex-start;gap:6px;margin:2px 0;"><span style="color:#3b82f6;">•</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.*)/gm, '<div style="display:flex;align-items:flex-start;gap:6px;margin:2px 0;"><span style="color:#3b82f6;font-weight:700;">$1.</span><span>$2</span></div>')
      .replace(/\n/g, '<br/>');
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    const firstName = user?.fullName?.split(' ')[0] || 'là';
    setMessages([{
      role: 'assistant',
      content: `Conversation réinitialisée ! 🔄 Comment puis-je vous aider${(!isInstitution && !isSuperAdmin && !isPublic) ? ', ' + firstName : ''} ?`
    }]);
  };

  const handleSend = async (text) => {
    const msg = text || inputValue;
    if (!msg.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInputValue('');
    setLoading(true);

    // ========== 1. Détecter si c'est une ACTION de navigation ==========
    const action = detectAction(msg, variant);

    if (action) {
      // Vérifier si on est déjà sur la bonne page
      const alreadyThere = location.pathname === action.route;

      setTimeout(() => {
        if (alreadyThere) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Vous êtes déjà sur la page **${action.label}** ! Y a-t-il autre chose que je peux faire ?`,
            isAction: true
          }]);
        } else {
          navigate(action.route);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `⚡ **Action exécutée !**\n\nJe vous ai redirigé vers **${action.label}**.\n\nBesoin d'autre chose ?`,
            isAction: true
          }]);
        }
        setLoading(false);
      }, 600);
      return;
    }

    // ========== 2. Sinon, appeler l'IA Groq pour une réponse intelligente ==========
    try {
      const res = await api.post('/ai/chat', { message: msg });
      const reply = res.data.response || "Je n'ai pas pu générer de réponse.";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        simulated: res.data.simulated || false
      }]);
    } catch (error) {
      const status = error.response?.status;
      const errMsg = error.response?.data?.message || "Erreur de connexion au service IA.";

      if (status === 429) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "⚠️ **Limite atteinte.** Trop de messages envoyés. Patientez quelques secondes."
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ **Erreur :** ${errMsg}\n\nVeuillez réessayer.`
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.fullName?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="fixed bottom-6 right-6 z-[90] font-sans">

      {/* ===== Floating Trigger Button ===== */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all duration-300 ${
          isOpen
            ? 'bg-slate-900 text-white'
            : 'bg-gradient-to-br from-[#0A1F44] via-[#0d6efd] to-[#6366f1] text-white hover:shadow-blue-500/30 hover:shadow-2xl'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <div className="relative">
            <Sparkles className="w-6 h-6" />
            <span className="absolute -top-3 -right-3 bg-emerald-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border-2 border-white tracking-wider">
              IA
            </span>
            <span className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          </div>
        )}
      </motion.button>

      {/* ===== Chat Panel ===== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[370px] sm:w-[420px] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0A1F44] via-[#0B3D91] to-[#0d6efd] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold flex items-center gap-2">
                      {aiName}
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                    </h4>
                    <p className="text-[10px] text-white/60 font-semibold">Assistant IA • Propulsé par Groq</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={clearChat} title="Réinitialiser" className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm ${
                      msg.isAction
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}>
                      {msg.isAction ? <Zap className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  <div className="group relative max-w-[78%]">
                    <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#0d6efd] to-[#0A1F44] text-white rounded-br-md'
                        : msg.isAction
                          ? 'bg-emerald-50 border border-emerald-200/80 text-slate-700 rounded-bl-md shadow-sm'
                          : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-md shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      ) : msg.content}
                    </div>

                    {msg.role === 'assistant' && index > 0 && (
                      <button
                        onClick={() => copyText(msg.content, index)}
                        className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white border border-slate-200 rounded-md p-1 shadow-sm transition-all hover:bg-slate-50"
                      >
                        {copiedIdx === index
                          ? <Check className="w-3 h-3 text-emerald-500" />
                          : <Copy className="w-3 h-3 text-slate-400" />
                        }
                      </button>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-slate-700 shrink-0 mt-0.5 font-black text-[9px]">
                      {initials}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-white border border-slate-200/80 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">{aiName} réfléchit...</span>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && !loading && (
              <div className="px-4 pb-3 space-y-2 bg-white border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">⚡ Actions rapides</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.text)}
                      className="text-left px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/60 rounded-xl text-[10px] font-bold transition-all leading-tight cursor-pointer"
                    >
                      <span className="mr-1">{prompt.icon}</span> {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 bg-white border-t border-slate-200/60 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: Ouvre mes badges, ou posez une question..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all disabled:opacity-50 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="w-10 h-10 bg-gradient-to-br from-[#0d6efd] to-[#0A1F44] hover:from-blue-600 hover:to-[#0B3D91] text-white rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistantWidget;

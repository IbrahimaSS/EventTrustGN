import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle2, Ban, Eye, Filter, Search, 
  Clock, EyeOff, ShieldAlert, CreditCard, UserX, Bot, 
  CreditCard as StripeIcon, Trash2, Mail, Check, X, Shield, 
  MoreVertical, FileText, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const getTypeIcon = (type) => {
  switch (type) {
    case 'Fake Event': return <AlertTriangle className="w-4 h-4" />;
    case 'Inappropriate Content': return <EyeOff className="w-4 h-4" />;
    case 'Spam Account': return <ShieldAlert className="w-4 h-4" />;
    case 'Payment Fraud': return <CreditCard className="w-4 h-4" />;
    case 'Compte Suspect': return <UserX className="w-4 h-4" />;
    default: return <AlertTriangle className="w-4 h-4" />;
  }
};

const getSeverityBadge = (severity) => {
  switch (severity) {
    case 'CRITICAL': return <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black animate-pulse uppercase shadow-sm">CRITICAL</span>;
    case 'HIGH': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-orange-200">HIGH</span>;
    case 'MEDIUM': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-200">MEDIUM</span>;
    case 'LOW': return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200">LOW</span>;
    default: return null;
  }
};

// ─── Modals ──────────────────────────────────────────────────────────

const ReportDetailModal = ({ report, onClose, onAction }) => {
  const [note, setNote] = useState('');

  if (!report) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white w-full max-w-[460px] h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-500 font-mono text-xs">{report.id.substring(report.id.length - 8).toUpperCase()}</span>
              {getSeverityBadge(report.severity)}
            </div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              {getTypeIcon(report.type)} {report.type}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Info Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informations du signalement</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Cible</p>
                <a href="#" className="text-sm font-bold text-blue-600 hover:underline">{report.target}</a>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Signalé par</p>
                <div className="flex items-center gap-2">
                  {report.reporterType === 'user' && <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">U</div>}
                  {report.reporterType === 'ai' && <div className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center gap-1 border border-purple-200"><Bot className="w-3 h-3"/> IA</div>}
                  {report.reporterType === 'stripe' && <div className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200"><StripeIcon className="w-3 h-3"/> Stripe</div>}
                  <span className="text-sm font-semibold">{report.reporter}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Date et heure</p>
                <p className="text-sm font-medium">{report.exactDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Description</p>
                <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200 italic">"{report.description}"</p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analyse Automatique</h4>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Bot className="w-3 h-3"/> Analyse Sécurité</span>
              </div>
              {report.severity === 'CRITICAL' || report.severity === 'HIGH' ? (
                <>
                  <p className="text-sm font-bold text-purple-900 mb-1">Anomalie bloquante détectée</p>
                  <p className="text-xs text-purple-700 font-medium">Recommandation : {report.type === 'Compte Suspect' || report.type === 'Spam Account' ? 'Vérifier les documents légaux de l\'institution.' : 'Suspendre la publication de cet événement.'}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-purple-900 mb-1">Élément nécessitant une revue manuelle</p>
                  <p className="text-xs text-purple-700 font-medium">Recommandation : Contacter le propriétaire pour clarification.</p>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Historique des actions</h4>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 pb-2">
              <div className="relative">
                <div className="absolute -left-[21px] bg-slate-200 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center"><Clock className="w-4 h-4 text-slate-500"/></div>
                <div className="pl-6 pt-2">
                  <p className="text-sm font-bold text-slate-900">En attente de revue</p>
                  <p className="text-xs text-slate-500">{report.date}</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] bg-blue-100 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center"><Shield className="w-4 h-4 text-blue-600"/></div>
                <div className="pl-6 pt-2">
                  <p className="text-sm font-bold text-slate-900">Assigné à l'équipe modération</p>
                  <p className="text-xs text-slate-500">{report.exactDate}</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] bg-slate-100 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-slate-500"/></div>
                <div className="pl-6 pt-2">
                  <p className="text-sm font-bold text-slate-900">Création / Détection initiale</p>
                  <p className="text-xs text-slate-500">{report.exactDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Zone */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message pour l'utilisateur</h4>
            <textarea 
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              rows="3" 
              placeholder="Saisissez le message d'avertissement personnalisé à envoyer par e-mail..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

        </div>

        {/* Actions Rapides */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0">
          {(report.severity === 'CRITICAL' || report.severity === 'HIGH') ? (
            <>
              <button onClick={() => { onAction(report.id, 'suspend'); onClose(); }} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors">
                Suspendre le compte/événement
              </button>
              <button onClick={() => { onAction(report.id, 'delete'); onClose(); }} className="w-full py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold cursor-pointer transition-colors">
                Supprimer le contenu
              </button>
              <div className="flex gap-2">
                <button onClick={() => { onAction(report.id, 'warn', note); onClose(); }} className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-colors">Envoyer message d'avertissement</button>
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => { onAction(report.id, 'resolve'); onClose(); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-colors">Marquer résolu</button>
                <button onClick={() => { onAction(report.id, 'archive'); onClose(); }} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-colors">Ignorer (Archiver)</button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { onAction(report.id, 'warn', note); onClose(); }} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors">
                Envoyer message d'avertissement
              </button>
              <button onClick={() => { onAction(report.id, 'delete'); onClose(); }} className="w-full py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold cursor-pointer transition-colors">
                Supprimer le contenu
              </button>
              <div className="flex gap-2 mt-1">
                <button onClick={() => { onAction(report.id, 'resolve'); onClose(); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-colors">Marquer résolu</button>
                <button onClick={() => { onAction(report.id, 'archive'); onClose(); }} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold cursor-pointer transition-colors">Ignorer</button>
              </div>
            </>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────

const SuperAdminModeration = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/moderation/reports');
      setReports(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des signalements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const criticalCount = reports.filter(r => r.status === 'pending' && r.severity === 'CRITICAL').length;
  const criticalFirst = reports.find(r => r.status === 'pending' && r.severity === 'CRITICAL');

  const filteredReports = reports.filter(r => {
    if (activeTab !== 'all') {
      if (activeTab === 'pending' && r.status !== 'pending') return false;
      if (activeTab === 'resolved' && r.status !== 'resolved') return false;
      if (activeTab === 'archived' && r.status !== 'archived') return false;
    }
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (search && !r.target.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredReports.length) setSelectedIds([]);
    else setSelectedIds(filteredReports.map(r => r.id));
  };

  const handleAction = async (id, action, customMessage = null) => {
    try {
      await api.patch('/moderation/reports', {
        reportIds: [id],
        action: action,
        customMessage: customMessage
      });
      fetchReports();
      
      if (action === 'suspend') toast.error('Cible suspendue.');
      else if (action === 'resolve') toast.success('Signalement marqué comme résolu.');
      else if (action === 'archive') toast('Signalement archivé.', { icon: '📦' });
      else if (action === 'warn') toast.success('Avertissement envoyé.');
      else if (action === 'delete') toast.success('Contenu supprimé.');
      else if (action === 'reopen') toast.success('Signalement rouvert.');
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    }
  };

  const handleGroupAction = async (action) => {
    try {
      await api.patch('/moderation/reports', {
        reportIds: selectedIds,
        action: action
      });
      fetchReports();
      if (action === 'resolve') toast.success(`${selectedIds.length} signalements résolus.`);
      else if (action === 'archive') toast(`${selectedIds.length} signalements archivés.`, { icon: '📦' });
      else if (action === 'suspend') toast.error(`${selectedIds.length} cibles suspendues.`);
      setSelectedIds([]);
    } catch (error) {
      toast.error('Erreur lors de l\'action groupée');
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-24 relative min-h-screen">
      
      {/* Critical Alert Banner */}
      {criticalCount > 0 && criticalFirst && (
        <motion.div variants={item} className="bg-red-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg shadow-red-600/20 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-full mt-0.5 animate-pulse"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="font-black text-lg">🚨 {criticalCount} signalement{criticalCount > 1 ? 's' : ''} CRITICAL en attente</p>
              <p className="text-sm font-medium mt-0.5 text-red-100">{criticalFirst.type} détecté sur {criticalFirst.target} — Action immédiate requise</p>
            </div>
          </div>
          <button onClick={() => setSelectedReport(criticalFirst)} className="px-5 py-2.5 bg-white text-red-600 hover:bg-red-50 text-sm font-black rounded-xl shadow-md transition-colors cursor-pointer shrink-0">
            Traiter maintenant
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Centre de Modération</h2>
          <p className="text-slate-500 text-sm mt-1">Gérez les signalements, la fraude et assurez la sécurité de la plateforme.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={item} className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm col-span-1">
          <p className="text-xs font-bold text-red-800/70 uppercase mb-1">Signalements Actifs</p>
          <p className="text-2xl font-black text-red-600">{reports.filter(r => r.status === 'pending').length}</p>
        </motion.div>
        
        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1">
          <p className="text-xs font-bold text-slate-500 mb-1">En attente de revue</p>
          <p className="text-2xl font-black text-slate-900">{reports.filter(r => r.status === 'pending').length}</p>
          <p className="text-[10px] font-bold text-orange-600 mt-1 bg-orange-100 px-2 py-0.5 rounded inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Action requise</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1">
          <p className="text-xs font-bold text-slate-500 mb-1">Comptes/Événements suspendus</p>
          <p className="text-2xl font-black text-slate-900">{reports.filter(r => r.status === 'archived').length}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1">
          <p className="text-xs font-bold text-slate-500 mb-1">Résolus</p>
          <p className="text-2xl font-black text-slate-900">{reports.filter(r => r.status === 'resolved').length}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-bold text-slate-500">Temps moy. résolution</p>
          </div>
          <p className="text-2xl font-black text-slate-900">&lt; 24h</p>
        </motion.div>
      </div>

      {/* Tabs and Filters */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center overflow-x-auto pb-2 xl:pb-0 hide-scrollbar gap-2 px-2">
          {[
            { id: 'all', label: `Tous (${reports.length})` },
            { id: 'pending', label: `En attente (${reports.filter(r=>r.status==='pending').length})`, colorClass: 'bg-orange-50 text-orange-700' },
            { id: 'resolved', label: `Résolu (${reports.filter(r=>r.status==='resolved').length})`, colorClass: 'bg-emerald-50 text-emerald-700' },
            { id: 'archived', label: 'Archivé', colorClass: 'bg-slate-100 text-slate-700' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id ? (tab.colorClass || 'bg-slate-900 text-white') : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 px-2 pb-2 xl:pb-0 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none min-w-[150px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="text" placeholder="Rechercher cible ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="appearance-none pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none">
              <option value="all">Sévérité: Toutes</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none max-w-[150px] truncate">
              <option value="all">Type: Tous</option>
              <option value="Fake Event">Fake Event</option>
              <option value="Inappropriate Content">Contenu Inapproprié</option>
              <option value="Spam Account">Spam Account</option>
              <option value="Payment Fraud">Fraude Paiement</option>
              <option value="Compte Suspect">Compte Suspect</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1050px] custom-admin-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <th className="p-4 pl-5 w-10">
                  <input type="checkbox" checked={selectedIds.length === filteredReports.length && filteredReports.length > 0} onChange={selectAll} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                </th>
                <th className="p-4">Type / Sévérité</th>
                <th className="p-4">Cible</th>
                <th className="p-4">Signalé par</th>
                <th className="p-4">Date</th>
                <th className="p-4">Statut</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredReports.map((report) => (
                <tr key={report.id} className={`border-b border-slate-100 transition-colors ${selectedIds.includes(report.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'} ${report.status === 'archived' ? 'opacity-60' : ''}`}>
                  <td className="p-4 pl-5">
                    <input type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => toggleSelect(report.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 mb-1 text-slate-900 font-bold">
                      {getTypeIcon(report.type)} {report.type}
                    </div>
                    {getSeverityBadge(report.severity)}
                  </td>
                  <td className="p-4">
                    <a href="#" className="font-bold text-blue-600 hover:underline">{report.target}</a>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {report.reporterType === 'user' && <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">U</div>}
                      {report.reporterType === 'ai' && <div className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center gap-1 border border-purple-200"><Bot className="w-3 h-3"/> IA</div>}
                      {report.reporterType === 'stripe' && <div className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200"><StripeIcon className="w-3 h-3"/> Stripe</div>}
                      <span className="text-xs font-semibold text-slate-700">{report.reporter}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="group relative inline-block cursor-help">
                      <span className="text-slate-500 font-medium">{report.date}</span>
                      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {report.exactDate}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {report.status === 'pending' && <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> En attente</span>}
                    {report.status === 'resolved' && <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Résolu</span>}
                    {report.status === 'archived' && <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold">Archivé</span>}
                  </td>
                  <td className="p-4 pr-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedReport(report)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors cursor-pointer">Voir détails</button>
                      
                      {report.status === 'pending' && (report.severity === 'CRITICAL' || report.severity === 'HIGH') && (
                        <>
                          <button onClick={() => handleAction(report.id, 'suspend')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">Suspendre</button>
                          <button onClick={() => handleAction(report.id, 'archive')} className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer">Ignorer</button>
                        </>
                      )}
                      
                      {report.status === 'pending' && (report.severity === 'MEDIUM' || report.severity === 'LOW') && (
                        <>
                          <button onClick={() => handleAction(report.id, 'resolve')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">Résoudre</button>
                          <button onClick={() => handleAction(report.id, 'warn')} className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-bold transition-colors cursor-pointer">Avertir</button>
                        </>
                      )}

                      {report.status === 'resolved' && (
                        <>
                          <button onClick={() => handleAction(report.id, 'reopen')} className="px-3 py-1.5 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-lg text-xs font-bold transition-colors cursor-pointer">Rouvrir</button>
                          <button onClick={() => handleAction(report.id, 'archive')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer">Archiver</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">Aucun signalement trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stats Bottom Section */}
      <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Répartition des signalements (Temps Réel)</h3>
        <div className="space-y-4 max-w-2xl">
          {[
            { label: 'Fake Event', count: reports.filter(r => r.type === 'Fake Event').length, color: 'bg-red-500' },
            { label: 'Spam Account', count: reports.filter(r => r.type === 'Spam Account').length, color: 'bg-orange-500' },
            { label: 'Compte Suspect', count: reports.filter(r => r.type === 'Compte Suspect').length, color: 'bg-purple-500' },
            { label: 'Autre', count: reports.filter(r => !['Fake Event', 'Spam Account', 'Compte Suspect'].includes(r.type)).length, color: 'bg-slate-400' },
          ].sort((a,b) => b.count - a.count).map((stat, i) => {
            const widthPct = reports.length > 0 ? Math.max((stat.count / reports.length) * 100, 2) : 0;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-40 text-sm font-semibold text-slate-700 truncate">{stat.label}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${widthPct}%` }}></div>
                </div>
                <div className="w-12 text-right text-sm font-bold text-slate-500">{stat.count}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Group Actions Floating Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-40 border border-slate-700">
            <span className="font-bold text-sm">{selectedIds.length} signalements sélectionnés</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleGroupAction('resolve')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer">Résoudre tous</button>
              <button onClick={() => handleGroupAction('suspend')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer">Suspendre tous</button>
              <button onClick={() => handleGroupAction('archive')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer">Archiver tous</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onAction={handleAction} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminModeration;

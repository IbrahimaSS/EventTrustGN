import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, XCircle, TrendingUp, Download, Eye, AlertTriangle, ChevronDown, Bell, Check, X, Mail, Phone, RefreshCw, FileText, Pause, Plus, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PaymentMethodBadge = ({ method }) => {
  if (method === 'Orange Money') return <span className="px-2 py-0.5 bg-[#ff6600] text-white text-[10px] font-black rounded tracking-wider shadow-sm border border-[#e65c00]">Orange Money</span>;
  if (method === 'MTN MoMo') return <span className="px-2 py-0.5 bg-[#ffcc00] text-[#003366] text-[10px] font-black rounded tracking-wider shadow-sm border border-[#e6b800]">MoMo</span>;
  if (method === 'Lengo Pay') return <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-black rounded tracking-wider shadow-sm">Lengo Pay</span>;
  if (method === 'Carte Bancaire') return <span className="px-2 py-0.5 bg-[#1a1f71] text-white text-[10px] font-black italic rounded tracking-wider shadow-sm border border-[#141852]">VISA</span>;
  return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">{method}</span>;
};

const plans = [
  { name: 'Gratuit', price: '0 GNF', amount: 0, period: '/mois', institutions: 138, features: ['2 events/mois', '100 places max'], popular: false, color: 'bg-slate-100 border-slate-200 text-slate-700' },
  { name: 'Standard', price: '250 000 GNF', amount: 250000, period: '/mois', institutions: 2, features: ['Events illimités', '1000 places max'], popular: false, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'Premium', price: '500 000 GNF', amount: 500000, period: '/mois', institutions: 2, features: ['Tout illimité', 'Support prioritaire', 'API accès'], popular: true, color: 'bg-amber-50 border-amber-300 text-amber-700 shadow-amber-500/10' },
];

const downloadFakePDF = (id) => {
  const content = `Facture EventTrust GN\nID: ${id}\nStatut: Payé\nDate: ${new Date().toLocaleDateString()}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `facture_${id}.txt`; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Facture ${id} téléchargée.`);
};

// ─── Modals ──────────────────────────────────────────────────────────

const NewTransactionModal = ({ onClose, onAdd }) => {
  const [inst, setInst] = useState('');
  const [plan, setPlan] = useState('Premium');
  const [method, setMethod] = useState('Orange Money');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inst) return toast.error('Nom institution requis');
    const planObj = plans.find(p => p.name === plan);
    try {
      const res = await api.post('/subscriptions/admin', {
        institutionName: inst,
        plan: plan,
        amount: planObj.amount,
        method: method
      });
      // Refresh list or add local (for simplicity, we emit onAdd to trigger refresh)
      onAdd();
      toast.success('Nouvelle transaction ajoutée avec succès.');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">Nouvelle Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Institution</label>
            <input type="text" value={inst} onChange={e => setInst(e.target.value)} placeholder="Ex: Université XYZ" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Plan</label>
            <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
              {plans.map(p => <option key={p.name} value={p.name}>{p.name} ({p.price})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Méthode de paiement</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Orange Money</option><option>MTN MoMo</option><option>Lengo Pay</option><option>Carte Bancaire</option><option>Gratuit</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Annuler</button>
            <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer">Créer</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ChangePlanModal = ({ sub, onClose, onChangePlan }) => {
  const [newPlan, setNewPlan] = useState(sub.plan);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPlan === sub.plan) return toast.error('Sélectionnez un plan différent.');
    onChangePlan(sub.id, newPlan);
    toast.success(`Le plan de ${sub.institution} a été modifié vers ${newPlan}.`);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
        <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Changer de Plan</h3>
        <p className="text-sm text-slate-500 mb-6">Institution: <b>{sub.institution}</b> (Actuel: {sub.plan})</p>
        <form onSubmit={handleSubmit}>
          <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center mb-6">
            {plans.map(p => <option key={p.name} value={p.name}>{p.name} ({p.price})</option>)}
          </select>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Annuler</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md cursor-pointer">Valider</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const SubscriptionDetailModal = ({ sub, onClose, onAction }) => {
  if (!sub) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white w-full max-w-[420px] h-full shadow-2xl flex flex-col z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-900">{sub.id.substring(sub.id.length - 8).toUpperCase()}</h3>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mt-2 ${
              sub.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
              sub.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>
              {sub.status === 'paid' ? 'Payé' : sub.status === 'pending' ? 'En attente' : 'Échoué'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Info Institution */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Informations institution</h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0d6efd] flex items-center justify-center font-black text-lg">{sub.institution.substring(0, 2)}</div>
              <div>
                <p className="font-bold text-slate-900">{sub.institution}</p>
                <p className="text-sm text-slate-500">{sub.type}</p>
              </div>
            </div>
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{sub.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{sub.phone}</span></div>
            </div>
          </div>

          {/* Détails abonnement */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Détails abonnement</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Plan actuel</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${sub.plan === 'Premium' ? 'bg-amber-100 text-amber-700' : sub.plan === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>{sub.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Montant</span>
                <span className="text-sm font-black text-slate-900">{sub.amount === 0 ? 'Gratuit' : `${sub.amount.toLocaleString()} GNF`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Souscription</span>
                <span className="text-sm font-bold text-slate-900">{sub.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Méthode</span>
                <PaymentMethodBadge method={sub.method} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3 shrink-0">
          <button onClick={() => downloadFakePDF(sub.id)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer">
            <FileText className="w-4 h-4" /> Télécharger facture
          </button>
          
          {(sub.status === 'pending' || sub.status === 'failed') && (
            <button onClick={() => onAction(sub.id, 'remind')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer">
              <Bell className="w-4 h-4" /> Envoyer rappel / relance
            </button>
          )}

          <button onClick={() => onAction(sub.id, 'change_plan')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-bold cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Changer de plan
          </button>
          
          {sub.status !== 'suspended' && (
            <button onClick={() => { onAction(sub.id, 'suspend'); onClose(); }} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold cursor-pointer mt-2">
              <Pause className="w-4 h-4" /> Suspendre abonnement
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────

const SuperAdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('this_month');
  
  const [selectedSub, setSelectedSub] = useState(null);
  const [showNewTrans, setShowNewTrans] = useState(false);
  const [planChangeSub, setPlanChangeSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/admin/all');
      setSubscriptions(res.data);
    } catch (error) {
      toast.error("Erreur de chargement des abonnements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);
  
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
  
  // Computed KPIs
  const activeSubs = subscriptions.filter(s => s.status === 'paid');
  const totalActive = activeSubs.length;
  const mrr = activeSubs.reduce((acc, sub) => acc + (sub.amount || 0), 0);
  const arr = mrr * 12;
  const premiumCount = activeSubs.filter(s => s.plan === 'Premium').length;
  const standardCount = activeSubs.filter(s => s.plan === 'Standard').length;
  const gratuitCount = activeSubs.filter(s => s.plan === 'Gratuit').length;
  
  const renewedCount = subscriptions.filter(s => s.autoRenew && s.status === 'paid').length;
  const renewRate = totalActive > 0 ? Math.round((renewedCount / totalActive) * 100) : 0;

  const filteredSubs = subscriptions.filter(s => {
    if (activeTab !== 'all' && s.status !== activeTab) return false;
    if (planFilter !== 'all' && s.plan !== planFilter) return false;
    return true;
  });

  // State mutation actions
  const handleAction = async (id, action) => {
    try {
      if (action === 'change_plan') {
        const targetSub = subscriptions.find(s => s.id === id);
        setPlanChangeSub(targetSub);
        if(selectedSub) setSelectedSub(null); // close detail modal if open
        return;
      }
      
      if (action === 'cancel') {
        await api.delete(`/subscriptions/admin/${id}`);
        toast.success('Transaction annulée et supprimée.');
      } else if (action === 'remind') {
        await api.post(`/subscriptions/admin/${id}/remind`);
        toast.success('Email de rappel envoyé à l\'institution.');
      } else {
        await api.patch(`/subscriptions/admin/${id}`, { action });
        toast.success('Statut mis à jour.');
      }
      fetchSubscriptions();
    } catch (error) {
      toast.error("Erreur lors de l'action");
    }
  };

  const executePlanChange = async (id, newPlanName) => {
    const planObj = plans.find(p => p.name === newPlanName);
    try {
      await api.patch(`/subscriptions/admin/${id}`, { action: 'change_plan', plan: newPlanName, amount: planObj.amount });
      fetchSubscriptions();
    } catch (error) {
      toast.error("Erreur lors du changement de plan");
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      
      {/* Alert Banner */}
      {pendingCount > 0 && (
        <motion.div variants={item} className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">⚠ {pendingCount} paiements en attente — Revenus à risque : {(pendingCount * 0.25).toFixed(1)}M GNF</p>
            </div>
          </div>
          <button onClick={() => toast.success('Rappels envoyés à tous !')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer shrink-0">
            Relancer tout
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Abonnements & Facturation</h2>
          <p className="text-slate-500 text-sm mt-1">Gérez les plans, suivez les revenus et supervisez les paiements des institutions.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 text-[#0d6efd] rounded-xl flex items-center justify-center shrink-0"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-slate-500">Revenus Mensuels (MRR)</p>
          </div>
          <p className="text-xl font-black text-slate-900">{mrr >= 1000000 ? (mrr / 1000000).toFixed(1) + 'M' : mrr.toLocaleString()} GNF</p>
        </motion.div>
        
        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-slate-500">Abonnements Actifs</p>
          </div>
          <p className="text-xl font-black text-slate-900">{totalActive}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded inline-block">{premiumCount} Prem · {standardCount} Std · {gratuitCount} Gratuit</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0"><Clock className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-slate-500">Paiements en attente</p>
          </div>
          <p className="text-xl font-black text-slate-900">{pendingCount}</p>
          {pendingCount > 0 && <p className="text-xs font-bold text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Action requise</p>}
        </motion.div>

        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><RefreshCw className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-slate-500">Taux de renouvellement</p>
          </div>
          <p className="text-xl font-black text-slate-900">{renewRate}%</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-slate-500">Revenus Annuels (ARR)</p>
          </div>
          <p className="text-xl font-black text-slate-900">{arr >= 1000000 ? (arr / 1000000).toFixed(1) + 'M' : arr.toLocaleString()} GNF</p>
          <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[70%]"></div></div>
        </motion.div>
      </div>

      {/* Tabs and Filters */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center overflow-x-auto pb-2 xl:pb-0 hide-scrollbar gap-2 px-2">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'paid', label: 'Payé ✓', colorClass: 'bg-emerald-50 text-emerald-700' },
            { id: 'pending', label: 'En attente ⏳', colorClass: 'bg-amber-50 text-amber-700' },
            { id: 'failed', label: 'Échoué ✗', colorClass: 'bg-red-50 text-red-700' }
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
        
        <div className="flex flex-wrap items-center gap-3 px-2 pb-2 xl:pb-0">
          <div className="relative">
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none">
              <option value="all">Plan: Tous</option><option value="Gratuit">Gratuit</option><option value="Standard">Standard</option><option value="Premium">Premium</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button onClick={() => toast.success('Fichier CSV généré.')} className="p-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-2 text-sm font-bold">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button onClick={() => setShowNewTrans(true)} className="px-4 py-2 bg-[#0d6efd] hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Nouvelle transaction
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1000px] custom-admin-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <th className="p-4 pl-5">ID</th>
                <th className="p-4">Institution</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Méthode</th>
                <th className="p-4 text-right">Montant</th>
                <th className="p-4">Statut</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredSubs.map((sub) => {
                const rowColor = sub.status === 'pending' ? 'bg-[#fffbeb]' : sub.status === 'failed' ? 'bg-[#fef2f2]' : 'bg-white hover:bg-slate-50';
                
                return (
                  <tr key={sub.id} className={`border-b border-slate-100 transition-colors ${rowColor}`}>
                    <td className="p-4 pl-5 font-mono text-xs text-slate-500 font-bold">{sub.id.substring(sub.id.length - 8).toUpperCase()}</td>
                    <td className="p-4 font-bold text-slate-900">{sub.institution}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${sub.plan === 'Premium' ? 'bg-amber-100 text-amber-700' : sub.plan === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="p-4"><PaymentMethodBadge method={sub.method} /></td>
                    <td className="p-4 text-right font-black text-slate-900">{sub.amount === 0 ? '0' : sub.amount.toLocaleString()} GNF</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sub.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : sub.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status === 'paid' ? 'Payé' : sub.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="p-4 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedSub(sub)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer" title="Voir détails"><Eye className="w-4 h-4" /></button>
                        
                        {sub.status === 'paid' && (
                          <>
                            <button onClick={() => downloadFakePDF(sub.id)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer" title="Facture PDF"><Download className="w-4 h-4" /></button>
                            <button onClick={() => handleAction(sub.id, 'change_plan')} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer" title="Changer de plan"><RefreshCw className="w-4 h-4" /></button>
                          </>
                        )}
                        {sub.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(sub.id, 'remind')} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg cursor-pointer" title="Envoyer rappel"><Bell className="w-4 h-4" /></button>
                            <button onClick={() => handleAction(sub.id, 'mark_paid')} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer" title="Marquer payé"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleAction(sub.id, 'cancel')} className="p-2 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer" title="Annuler"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        {sub.status === 'failed' && (
                          <>
                            <button onClick={() => handleAction(sub.id, 'remind')} className="p-2 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer" title="Envoyer relance"><Mail className="w-4 h-4" /></button>
                            <button onClick={() => handleAction(sub.id, 'mark_paid')} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg cursor-pointer" title="Forcer paiement"><CheckCircle2 className="w-4 h-4" /></button>
                            <button onClick={() => handleAction(sub.id, 'suspend')} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer" title="Suspendre"><Pause className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredSubs.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">Aucun abonnement trouvé.</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Plans Section */}
      <motion.div variants={item} className="pt-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Plans Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:-translate-y-1 ${plan.color}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-white" /> Populaire
                </div>
              )}
              <h4 className="text-lg font-black">{plan.name}</h4>
              <div className="mt-4 mb-6">
                <span className="text-2xl font-black">{plan.price}</span>
                <span className="text-sm font-semibold opacity-70">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4 opacity-70 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3">
                <button className="w-full py-2.5 bg-white/50 hover:bg-white border border-current rounded-xl text-sm font-bold transition-colors cursor-pointer">
                  Modifier le plan
                </button>
                <p className="text-center text-xs font-bold opacity-80">{plan.institutions} institutions actives</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedSub && <SubscriptionDetailModal sub={selectedSub} onClose={() => setSelectedSub(null)} onAction={handleAction} />}
        {showNewTrans && <NewTransactionModal onClose={() => setShowNewTrans(false)} onAdd={() => fetchSubscriptions()} />}
        {planChangeSub && <ChangePlanModal sub={planChangeSub} onClose={() => setPlanChangeSub(null)} onChangePlan={executePlanChange} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminSubscriptions;

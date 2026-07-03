import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Building2, Eye, Ban, CheckCircle2, X, Users, CalendarDays, MapPin, Mail, Phone, Globe, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DetailModal = ({ inst, onClose }) => {
  if (!inst) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex flex-col items-center p-8 border-b border-slate-100 bg-slate-50 relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
          
          {inst.logoUrl ? (
            <img src={inst.logoUrl} alt={inst.sigle} className="w-20 h-20 object-contain bg-white rounded-2xl shadow-md p-2 mb-3" />
          ) : (
            <div translate="no" className="w-20 h-20 rounded-2xl bg-blue-50 text-[#0d6efd] flex items-center justify-center text-2xl font-black mb-3 shadow-md">{inst.sigle?.slice(0,2) || 'IN'}</div>
          )}
          
          <h3 className="text-xl font-bold text-slate-900 text-center">{inst.sigle}</h3>
          <p className="text-sm text-slate-500 text-center">{inst.name}</p>
          <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${inst.status === 'active' ? 'bg-emerald-50 text-emerald-600' : inst.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>{inst.status === 'active' ? 'Actif' : inst.status === 'suspended' ? 'Suspendu' : 'En attente'}</span>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100"><p className="text-xs text-slate-500 font-semibold">Événements</p><p className="text-lg font-black text-slate-900">{inst.eventsCount || 0}</p></div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100"><p className="text-xs text-slate-500 font-semibold">Inscriptions</p><p className="text-lg font-black text-slate-900">{inst.registrationsCount || 0}</p></div>
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100"><p className="text-xs text-slate-500 font-semibold">Type</p><p className="text-sm font-black text-[#0d6efd]">{inst.type || '—'}</p></div>
          </div>
          <div className="space-y-2.5">
            {inst.email && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Mail className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{inst.email}</p></div>}
            {inst.phone && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{inst.phone}</p></div>}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{inst.address ? `${inst.address}, ${inst.city || ''}` : (inst.city || 'Non renseigné')}</p></div>
            {inst.websiteUrl && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Globe className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-blue-600">{inst.websiteUrl}</p></div>}
          </div>
          
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-48 w-full bg-slate-100 shrink-0 relative group">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">Chargement de la carte...</div>
            <iframe 
              title="Google Map"
              width="100%" 
              height="100%" 
              style={{ border: 0, position: 'relative', zIndex: 10 }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(inst.address ? `${inst.name}, ${inst.address}, ${inst.city || ''}, Guinée` : `${inst.name}, ${inst.city || ''}, Guinée`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
            
            {/* Cercle bleu animé centré sur l'adresse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20px] z-20 pointer-events-none">
              <div className="w-12 h-12 bg-blue-500/30 rounded-full animate-ping absolute -inset-2"></div>
              <div className="w-8 h-8 border-[3px] border-blue-600 rounded-full shadow-lg bg-blue-500/20 flex items-center justify-center backdrop-blur-md">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ConfirmationModal = ({ action, onClose, onConfirm, isProcessing }) => {
  if (!action) return null;
  const isApprove = action.type === 'approve';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-inner relative overflow-hidden ${isApprove ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`absolute inset-0 animate-pulse ${isApprove ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}></div>
          {isApprove ? <CheckCircle2 className="w-8 h-8 text-emerald-500 relative z-10" /> : <AlertTriangle className="w-8 h-8 text-red-500 relative z-10" />}
        </div>
        
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {isApprove ? 'Approuver l\'institution ?' : 'Suspendre l\'institution ?'}
        </h3>
        <p className="text-sm text-slate-500 font-medium mt-2 mb-1">
          Vous êtes sur le point de {isApprove ? 'valider' : 'suspendre'} :
        </p>
        <p className="text-sm font-bold text-slate-900 bg-slate-50 py-2 rounded-lg mb-6 border border-slate-100">
          {action.inst.sigle} - {action.inst.name}
        </p>
        
        <div className="flex gap-3 w-full">
          <button onClick={onClose} disabled={isProcessing} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer">
            Annuler
          </button>
          <button onClick={() => onConfirm(action)} disabled={isProcessing} className={`flex-1 py-3 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${isApprove ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}>
            {isProcessing ? '...' : 'Confirmer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SuperAdminInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institutions/admin/all');
      setInstitutions(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des institutions.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = institutions.filter(i => {
    const s = i.name.toLowerCase().includes(search.toLowerCase()) || (i.sigle || '').toLowerCase().includes(search.toLowerCase());
    const f = statusFilter === 'all' || i.status === statusFilter;
    return s && f;
  });

  const handleConfirmAction = async (action) => {
    const newStatus = action.type === 'approve' ? 'active' : 'suspended';
    setIsProcessing(true);
    
    try {
      await api.patch(`/institutions/admin/${action.inst._id}/status`, { status: newStatus });
      
      // Update local state
      setInstitutions(prev => prev.map(inst => 
        inst._id === action.inst._id ? { ...inst, status: newStatus, isVerified: newStatus === 'active' } : inst
      ));
      
      toast.success(action.type === 'approve' 
        ? `${action.inst.sigle || action.inst.name} a été approuvée avec succès.`
        : `${action.inst.sigle || action.inst.name} a été suspendue.`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Gestion des Institutions</h2><p className="text-slate-500 text-sm mt-1">Supervisez, approuvez ou suspendez les institutions sur la plateforme.</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 text-[#0d6efd] rounded-xl flex items-center justify-center shrink-0"><Building2 className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">Total</p><p className="text-2xl font-black text-slate-900">{institutions.length}</p></div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">Actives</p><p className="text-2xl font-black text-slate-900">{institutions.filter(i => i.status === 'active').length}</p></div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0"><Building2 className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">En attente</p><p className="text-2xl font-black text-slate-900">{institutions.filter(i => i.status === 'pending').length}</p></div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0"><Ban className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">Suspendues</p><p className="text-2xl font-black text-slate-900">{institutions.filter(i => i.status === 'suspended').length}</p></div></div>
      </div>

      <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
        <div className="relative w-full sm:w-auto"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-48 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"><option value="all">Tous les statuts</option><option value="active">Actives</option><option value="pending">En attente</option><option value="suspended">Suspendues</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
      </motion.div>

      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm custom-admin-table">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold"><th className="p-4 pl-5">Institution</th><th className="p-4">Type</th><th className="p-4 text-center">Événements</th><th className="p-4 text-center">Inscriptions</th><th className="p-4">Statut</th><th className="p-4 pr-5 text-right">Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center"><div className="flex justify-center items-center py-8"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></td></tr>
              ) : filtered.length > 0 ? filtered.map(inst => (
                <tr key={inst._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 pl-5">
                    <div className="flex items-center gap-3">
                      {inst.logoUrl ? (
                        <img src={inst.logoUrl} alt={inst.sigle} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div translate="no" className="w-9 h-9 rounded-lg bg-blue-50 text-[#0d6efd] flex items-center justify-center font-bold text-xs shrink-0">{(inst.sigle || 'IN').slice(0,2)}</div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{inst.sigle || inst.acronym}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{inst.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{inst.type || '—'}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{inst.eventsCount || 0}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{inst.registrationsCount || 0}</td>
                  <td className="p-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${inst.status === 'active' ? 'bg-emerald-50 text-emerald-600' : inst.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>{inst.status === 'active' ? 'Actif' : inst.status === 'suspended' ? 'Suspendu' : 'En attente'}</span></td>
                  <td className="p-4 pr-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {(inst.status === 'pending' || inst.status === 'suspended') && (
                        <button onClick={() => setConfirmAction({ type: 'approve', inst })} className="cursor-pointer w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors" title="Approuver"><CheckCircle2 className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => setSelected(inst)} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Détails"><Eye className="w-4 h-4" /></button>
                      {inst.status === 'active' && (
                        <button onClick={() => setConfirmAction({ type: 'suspend', inst })} className="cursor-pointer w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors" title="Suspendre"><Ban className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Aucune institution trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && <DetailModal inst={selected} onClose={() => setSelected(null)} />}
        {confirmAction && <ConfirmationModal action={confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleConfirmAction} isProcessing={isProcessing} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminInstitutions;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, CalendarDays, MapPin, Users, Eye, Ban, CheckCircle2, X, AlertTriangle, Clock, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;
  
  const percentage = Math.round((event.participants / event.maxParticipants) * 100) || 0;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex flex-col items-center p-8 border-b border-slate-100 bg-slate-50 relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
          
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${event.status === 'active' ? 'bg-emerald-100 text-emerald-600' : event.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'}`}>
            <CalendarDays className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 text-center">{event.title}</h3>
          <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2">{event.institution}</p>
          <span className={`mt-3 text-xs font-bold px-3 py-1 rounded-full ${event.status === 'active' ? 'bg-emerald-50 text-emerald-600' : event.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : event.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {event.status === 'active' ? 'Actif' : event.status === 'pending' ? 'En attente' : event.status === 'suspended' ? 'Suspendu' : 'Annulé'}
          </span>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div><p className="text-xs text-slate-500 font-semibold">{event.date}</p><p className="text-sm font-bold text-slate-900">{event.time}</p></div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div><p className="text-xs text-slate-500 font-semibold">Lieu</p><p className="text-sm font-bold text-slate-900 truncate" title={event.location}>{event.location.split(',')[0]}</p></div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> Inscriptions</p>
              <p className="text-sm font-black text-slate-900">{event.participants} / <span className="text-slate-400">{event.maxParticipants}</span></p>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${percentage >= 90 ? 'bg-red-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }}></div>
            </div>
            <p className="text-right text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{percentage}% Rempli</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"><p className="text-xs text-slate-500 font-semibold mb-0.5">Type</p><p className="text-sm font-bold text-slate-900">{event.type}</p></div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"><p className="text-xs text-slate-500 font-semibold mb-0.5">Tarif</p><p className="text-sm font-bold text-emerald-600">{event.price}</p></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ConfirmationModal = ({ action, onClose, onConfirm }) => {
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
          {isApprove ? 'Activer l\'événement ?' : 'Suspendre l\'événement ?'}
        </h3>
        <p className="text-sm text-slate-500 font-medium mt-2 mb-1">
          Vous êtes sur le point de {isApprove ? 'valider' : 'suspendre'} :
        </p>
        <p className="text-sm font-bold text-slate-900 bg-slate-50 py-2 px-3 rounded-lg mb-6 border border-slate-100 line-clamp-2">
          {action.event.title} ({action.event.institution})
        </p>
        
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer">
            Annuler
          </button>
          <button onClick={() => onConfirm(action)} className={`flex-1 py-3 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${isApprove ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}>
            Confirmer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SuperAdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/admin/all');
      setEvents(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements.');
    } finally {
      setLoading(false);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const filtered = events.filter(e => {
    const s = e.title.toLowerCase().includes(search.toLowerCase()) || e.institution.toLowerCase().includes(search.toLowerCase());
    const f = statusFilter === 'all' || e.status === statusFilter;
    return s && f;
  });

  const handleConfirmAction = async (action) => {
    if (isProcessing) return;
    const newStatus = action.type === 'approve' ? 'active' : 'suspended';
    
    try {
      setIsProcessing(true);
      await api.patch(`/events/admin/${action.event.id}/status`, { status: newStatus });
      setEvents(events.map(ev => 
        ev.id === action.event.id ? { ...ev, status: newStatus } : ev
      ));
      
      if (action.type === 'approve') {
        toast.success(`L'événement a été validé et activé.`);
      } else {
        toast.error(`L'événement a été suspendu par l'administration.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Supervision des Événements</h2><p className="text-slate-500 text-sm mt-1">Surveillez tous les événements créés par les institutions sur la plateforme.</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: events.length, icon: CalendarDays, color: 'bg-blue-50 text-[#0d6efd]' },
          { label: 'Actifs', value: events.filter(e => e.status === 'active').length, icon: CalendarDays, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'En attente', value: events.filter(e => e.status === 'pending').length, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Suspendus/Annulés', value: events.filter(e => e.status === 'cancelled' || e.status === 'suspended').length, icon: Ban, color: 'bg-red-50 text-red-500' },
        ].map((k, i) => (
          <motion.div key={i} variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}><k.icon className="w-6 h-6" /></div>
            <div><p className="text-sm font-semibold text-slate-500">{k.label}</p><p className="text-2xl font-black text-slate-900">{k.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Rechercher un événement ou institution..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
        <div className="relative w-full sm:w-auto"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-48 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option value="all">Tous les statuts</option><option value="active">Actifs</option><option value="pending">En attente</option><option value="suspended">Suspendus</option><option value="cancelled">Annulés</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
      </motion.div>

      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse min-w-[800px] custom-admin-table">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold"><th className="p-4 pl-5">Événement</th><th className="p-4">Institution</th><th className="p-4">Date</th><th className="p-4 text-center">Participants</th><th className="p-4">Statut</th><th className="p-4 pr-5 text-right">Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filtered.map(ev => (
                <tr key={ev.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 pl-5"><div><p className="font-bold text-slate-900 truncate max-w-[250px]">{ev.title}</p><p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {ev.location.split(',')[0]}</p></div></td>
                  <td className="p-4"><span className="text-xs font-bold text-[#0d6efd] bg-blue-50 px-2.5 py-1 rounded-md">{ev.institution}</span></td>
                  <td className="p-4 text-slate-600 font-medium">{ev.date}</td>
                  <td className="p-4 text-center"><div className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900"><Users className="w-3.5 h-3.5 text-slate-400" /> {ev.participants} <span className="text-[10px] text-slate-400">/ {ev.maxParticipants}</span></div></td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ev.status === 'active' ? 'bg-emerald-50 text-emerald-600' : ev.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : ev.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      {ev.status === 'active' ? 'Actif' : ev.status === 'pending' ? 'En attente' : ev.status === 'suspended' ? 'Suspendu' : 'Annulé'}
                    </span>
                  </td>
                  <td className="p-4 pr-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {(ev.status === 'pending' || ev.status === 'suspended') && (
                        <button onClick={() => setConfirmAction({ type: 'approve', event: ev })} disabled={isProcessing} className="cursor-pointer w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50" title="Activer l'événement"><CheckCircle2 className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => setSelected(ev)} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Voir les détails"><Eye className="w-4 h-4" /></button>
                      {ev.status === 'active' && (
                        <button onClick={() => setConfirmAction({ type: 'suspend', event: ev })} disabled={isProcessing} className="cursor-pointer w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50" title="Suspendre l'événement"><Ban className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Aucun événement trouvé.</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && <EventDetailModal event={selected} onClose={() => setSelected(null)} />}
        {confirmAction && <ConfirmationModal action={confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleConfirmAction} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminEvents;

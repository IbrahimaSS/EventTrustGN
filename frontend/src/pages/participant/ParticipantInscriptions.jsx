import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Clock, CheckCircle2, XCircle, 
  CreditCard, Search, Filter, AlertCircle, FileText, ArrowUpRight
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const ParticipantInscriptions = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/me');
      const formatted = res.data.map(reg => {
        if (!reg.eventId) return null;
        return {
          id: reg.registrationNumber || reg._id.substring(0, 8).toUpperCase(),
          eventId: reg.eventId._id,
          eventTitle: reg.eventId.title,
          institution: reg.eventId.institutionId?.name || 'Institution',
          dateApplied: new Date(reg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: reg.status === 'accepted' ? 'confirmed' : reg.status,
          price: reg.eventId.registrationType === 'paid' ? `${reg.eventId.price} GNF` : 'Gratuit',
        };
      }).filter(Boolean);
      
      setInscriptions(formatted);
    } catch (error) {
      toast.error('Erreur lors du chargement de vos inscriptions.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInscriptions = inscriptions.filter(ins => {
    if (filterStatus !== 'all' && ins.status !== filterStatus) return false;
    if (searchQuery && !ins.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) && !ins.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'confirmed':
        return { label: 'Confirmée', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 };
      case 'pending':
        return { label: 'En attente', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock };
      case 'payment_required':
        return { label: 'À Payer', color: 'bg-blue-50 text-[#0d6efd] border-blue-200', icon: CreditCard };
      case 'rejected':
        return { label: 'Refusée', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle };
      default:
        return { label: 'Inconnu', color: 'bg-slate-50 text-slate-600 border-slate-200', icon: AlertCircle };
    }
  };

  // Metrics calculation
  const metrics = {
    total: inscriptions.length,
    confirmed: inscriptions.filter(i => i.status === 'confirmed').length,
    pending: inscriptions.filter(i => i.status === 'pending').length,
    payment: inscriptions.filter(i => i.status === 'payment_required').length,
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tableau des Inscriptions</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Gérez l'état de vos demandes et finalisez vos paiements.</p>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider mb-1">Confirmées</p>
            <p className="text-2xl font-black text-emerald-700">{metrics.confirmed}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-200/50 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600/80 uppercase tracking-wider mb-1">En attente</p>
            <p className="text-2xl font-black text-amber-700">{metrics.pending}</p>
          </div>
          <div className="w-10 h-10 bg-amber-200/50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">À Payer</p>
            <p className="text-2xl font-black text-[#0d6efd]">{metrics.payment}</p>
          </div>
          <div className="w-10 h-10 bg-blue-200/50 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#0d6efd]" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher une inscription..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] w-full sm:w-80 shadow-sm"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d6efd] shadow-sm cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmées</option>
            <option value="pending">En attente</option>
            <option value="payment_required">Paiement requis</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 whitespace-nowrap">N° Inscription</th>
                <th className="p-4">Événement</th>
                <th className="p-4">Date demande</th>
                <th className="p-4">Tarif</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500 font-medium">Chargement des inscriptions...</td>
                  </tr>
                ) : filteredInscriptions.length > 0 ? (
                  filteredInscriptions.map((ins) => {
                    const StatusIcon = getStatusDisplay(ins.status).icon;
                    return (
                      <motion.tr 
                        key={ins.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {ins.id}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{ins.eventTitle}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{ins.institution}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">
                          {ins.dateApplied}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700">
                          {ins.price}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusDisplay(ins.status).color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {getStatusDisplay(ins.status).label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {ins.status === 'confirmed' && (
                            <Link 
                              to={`/participant/events/${ins.eventId}`} 
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                            >
                              Pass <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {ins.status === 'payment_required' && (
                            <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0d6efd] text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md transition-all group-hover:-translate-y-0.5">
                              Payer Lengo
                            </button>
                          )}
                          {ins.status === 'pending' && (
                            <span className="text-xs font-medium text-slate-400 italic">En révision</span>
                          )}
                          {ins.status === 'rejected' && (
                            <span className="text-xs font-medium text-slate-400 italic">Clôturé</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ClipboardList className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Aucune inscription trouvée</p>
                      <p className="text-xs text-slate-500 mt-1">Essayez de modifier vos filtres.</p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ParticipantInscriptions;

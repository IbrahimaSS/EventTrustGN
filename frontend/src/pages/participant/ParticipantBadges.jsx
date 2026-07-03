import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Calendar, QrCode, Download, Share2, 
  Search, Filter, CheckCircle2, ShieldAlert, ShieldCheck, X 
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const ParticipantBadges = () => {
  const [filterType, setFilterType] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/badges/me');
      const formatted = res.data.map(badge => ({
        id: badge.badgeCode,
        rawId: badge._id,
        title: 'Participant', // Can be customized based on event type
        description: `Certificat de participation pour l'événement ${badge.eventId?.title || 'inconnu'}.`,
        event: badge.eventId?.title || 'Événement',
        institution: badge.eventId?.institutionId?.name || 'Institution',
        dateIssued: new Date(badge.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: badge.status === 'active' ? 'valid' : badge.status,
        color: 'from-[#0A1F44] to-[#1E3E75]',
        accentColor: 'border-blue-400 text-blue-400',
        type: 'Standard',
      }));
      setBadges(formatted);
    } catch (error) {
      toast.error('Erreur lors du chargement de vos badges.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (filterType !== 'all' && badge.status !== filterType) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return { label: 'Valide', class: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'used':
        return { label: 'Utilisé', class: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'expired':
        return { label: 'Expiré', class: 'bg-red-50 text-red-600 border-red-200' };
      default:
        return { label: 'Inconnu', class: 'bg-slate-50 text-slate-400' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mes Badges Numériques</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Vos distinctions et compétences certifiées sur la blockchain.</p>
        </div>

        {/* Filter Tab */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-[#0A1F44] text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilterType('valid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'valid' ? 'bg-[#0A1F44] text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Valides
          </button>
          <button 
            onClick={() => setFilterType('used')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterType === 'used' ? 'bg-[#0A1F44] text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Utilisés
          </button>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-slate-500 py-12">Chargement de vos badges...</div>
        ) : filteredBadges.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-12 bg-slate-50 rounded-2xl border border-slate-100">Aucun badge trouvé.</div>
        ) : filteredBadges.map((badge) => (
          <motion.div 
            key={badge.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group transition-all duration-300"
          >
            {/* Header Badge style (Colored top section with gradient) */}
            <div className={`p-6 bg-gradient-to-r ${badge.color} text-white relative overflow-hidden`}>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest bg-white/5 border ${badge.accentColor} px-2.5 py-0.5 rounded-full`}>
                  {badge.type}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300`}>
                  {badge.id.split('-').pop()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-tight">{badge.title}</h3>
                  <p className="text-[11px] text-white/80 font-medium mt-0.5">{badge.institution}</p>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {badge.description}
                </p>
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="text-slate-400">Événement :</span>
                    <span className="text-slate-800 line-clamp-1 max-w-[150px]">{badge.event}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="text-slate-400">Délivré le :</span>
                    <span className="text-slate-800">{badge.dateIssued}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(badge.status).class}`}>
                  {getStatusBadge(badge.status).label}
                </span>
                
                <button 
                  onClick={() => setSelectedBadge(badge)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0d6efd] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                >
                  <QrCode className="w-4 h-4" /> Détails & QR
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badge QR Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 border border-slate-100"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 z-20 text-white/75 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badge Preview Design */}
              <div className={`p-6 bg-gradient-to-r ${selectedBadge.color} text-white text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black tracking-tight">{selectedBadge.title}</h3>
                <p className="text-xs text-white/80 font-medium mt-1">{selectedBadge.institution}</p>
              </div>

              {/* QR and Code info */}
              <div className="p-6 text-center">
                <p className="text-xs text-slate-500 mb-6 font-medium">Présentez ce QR Code pour justifier de vos acquis auprès d'une autre institution.</p>
                
                {/* QR Container */}
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 inline-block shadow-sm mb-6">
                  <div className="w-36 h-36 flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-slate-900" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Identifiant Unique</p>
                    <p className="text-sm font-mono font-bold text-slate-800">{selectedBadge.id}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all">
                      <Share2 className="w-4 h-4" /> Partager
                    </button>
                    <a 
                      href={`${api.defaults.baseURL}/badges/${selectedBadge.rawId}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0d6efd] text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ParticipantBadges;

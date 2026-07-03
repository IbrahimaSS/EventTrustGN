import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, MapPin, 
  MoreVertical, Edit2, Eye, Trash2, CheckCircle2,
  AlertCircle, ExternalLink, X, Rocket
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const InstitutionEvents = () => {
  // We use a fragment (<>) because we now have a modal outside the main motion.div
  // The return wraps everything in <>
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishingId, setPublishingId] = useState(null);
  const [confirmPublishId, setConfirmPublishId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/events/institution');
      setEvents(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (eventId) => {
    setConfirmPublishId(null);
    setPublishingId(eventId);
    const toastId = toast.loading('Publication en cours...');
    
    try {
      const response = await api.patch(`/events/${eventId}/publish`);
      toast.success(response.data.message || 'Événement publié avec succès !', { id: toastId });
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la publication', { id: toastId });
    } finally {
      setPublishingId(null);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des événements</h2>
          <p className="text-slate-500 text-sm mt-1">Créez, publiez et suivez vos événements académiques.</p>
        </div>
        <Link 
          to="/institution/events/create" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d6efd] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#0d6efd]/25"
        >
          <Plus className="w-5 h-5" />
          Nouvel événement
        </Link>
      </div>

      {/* Filters and Search */}
      <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
      </motion.div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const headerGradient = event.status === 'published' && event.registrationType === 'paid'
              ? 'from-blue-600 to-indigo-700'
              : event.status === 'published' && event.registrationType === 'free'
              ? 'from-emerald-500 to-teal-600'
              : event.registrationType === 'paid'
              ? 'from-amber-500 to-orange-600'
              : 'from-slate-500 to-slate-600';

            const progressColor = (event.participants || 0) / (event.maxParticipants || 1) > 0.8
              ? 'bg-amber-500'
              : event.status === 'published' && event.registrationType === 'paid'
              ? 'bg-blue-500'
              : event.status === 'published'
              ? 'bg-emerald-500'
              : 'bg-blue-500';

            return (
            <motion.div key={event._id} variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group">
              
              {/* Colored Header Band */}
              <div className={`bg-gradient-to-r ${headerGradient} px-5 py-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-8 w-16 h-16 bg-white/5 rounded-full translate-y-8"></div>
                <div className="flex items-center gap-2 mb-2.5 relative z-10">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                    event.status === 'published' 
                      ? 'bg-white/25 text-white' 
                      : 'bg-black/15 text-white/90'
                  }`}>
                    {event.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                    {event.registrationType === 'free' ? 'Gratuit' : `${event.price} GNF`}
                  </span>
                </div>
                <h3 className="font-bold text-white leading-tight text-[15px] relative z-10">{event.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {event.startDate ? new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date à définir'}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {event.location || event.city}
                </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-500 font-medium">Inscriptions</span>
                  <span className="font-bold text-slate-900">{event.participants} <span className="text-slate-400 font-medium">/ {event.maxParticipants}</span></span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${progressColor} transition-all duration-500`} 
                    style={{ width: `${Math.min(((event.participants || 0) / (event.maxParticipants || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link 
                to={`/institution/events/edit/${event._id}`}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Editer
              </Link>
              {event.status === 'draft' ? (
                <button 
                  onClick={() => setConfirmPublishId(event._id)}
                  disabled={publishingId === event._id}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors ${publishingId === event._id ? 'opacity-50' : ''}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> {publishingId === event._id ? 'Publication...' : 'Publier'}
                </button>
              ) : (
                <Link to={`/events/${event.slug}`} target="_blank" className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" /> Voir page
                </Link>
              )}
            </div>
            
          </motion.div>
          );
        })}
      </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun événement trouvé</h3>
          <p className="text-slate-500 max-w-md mb-6">Vous n'avez pas d'événement correspondant ou vous n'en avez pas encore créé.</p>
          <Link to="/institution/events/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d6efd] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
            <Plus className="w-5 h-5" />
            Créer un événement
          </Link>
        </div>
      )}

    </motion.div>

    {/* Custom Publish Confirmation Modal */}
    <AnimatePresence>
      {confirmPublishId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmPublishId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Publier cet événement ?</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm text-center leading-relaxed mb-6">
                Une fois publié, votre événement sera <span className="font-bold text-slate-900">visible par tout le monde</span> sur la plateforme.
                Un <span className="font-bold text-emerald-600">QR Code unique</span> et un <span className="font-bold text-emerald-600">code de publication</span> seront générés automatiquement.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmPublishId(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handlePublish(confirmPublishId)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Publier
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default InstitutionEvents;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Clock, CalendarDays, 
  ChevronRight, Star, Tag, Download
} from 'lucide-react';
import AttestationModal from './AttestationModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ParticipantEvents = () => {
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForAttestation, setSelectedEventForAttestation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/me');
      // Format the data
      const formattedEvents = res.data.map(reg => {
        if (!reg.eventId) return null;
        const isPast = new Date(reg.eventId.startDate) < new Date();
        return {
          id: reg.eventId._id,
          title: reg.eventId.title,
          institution: reg.eventId.institutionId?.name || 'Institution', // Needs population if not populated
          date: reg.eventId.startDate,
          time: reg.eventId.startTime || '',
          location: reg.eventId.location || '',
          status: isPast ? 'past' : 'upcoming',
          category: reg.eventId.categoryId?.name || 'Événement',
          isFavorite: false, // Feature to add later
          registrationStatus: reg.status
        };
      }).filter(Boolean);
      
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Erreur lors du chargement de vos événements.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    // Tab filter
    if (activeTab === 'upcoming' && event.status !== 'upcoming') return false;
    if (activeTab === 'past' && event.status !== 'past') return false;
    if (activeTab === 'favorites' && !event.isFavorite) return false;

    // Search filter
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && !event.institution.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 inline-flex">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-[#0A1F44] text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            À venir
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'past' 
                ? 'bg-[#0A1F44] text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Passés
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'favorites' 
                ? 'bg-[#0A1F44] text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            Favoris
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredEvents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {loading ? (
                <div className="p-8 text-center text-slate-500">Chargement de vos événements...</div>
              ) : filteredEvents.map((event) => {
                const evtDate = new Date(event.date);
                const displayDate = evtDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                const displayTime = event.time || evtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    
                    {/* Date Badge */}
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:bg-white transition-colors">
                      <span className="text-xs font-bold text-blue-600 uppercase">{displayDate.split(' ')[1]?.substring(0,3)}</span>
                      <span className="text-xl font-extrabold text-slate-900 leading-none">{displayDate.split(' ')[0]}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {event.category}
                        </span>
                        {event.isFavorite && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
                        {event.registrationStatus === 'pending' && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">En attente</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{event.title}</h3>
                      <div className="text-sm font-medium text-slate-500">{event.institution}</div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" /> {displayTime}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          <MapPin className="w-3.5 h-3.5" /> {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 mt-4 sm:mt-0">
                      {activeTab === 'past' ? (
                        <button 
                          onClick={() => setSelectedEventForAttestation(event)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <Download className="w-4 h-4" /> Attestation
                        </button>
                      ) : (
                        <Link 
                          to={`/participant/events/${event.id}`} 
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all group-hover:-translate-y-0.5"
                        >
                          Voir détails <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun événement</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Vous n'avez pas d'événements dans cette catégorie. Découvrez de nouveaux événements et participez !
            </p>
            <Link to="/events" className="inline-block mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
              Explorer les événements
            </Link>
          </div>
        )}
      </div>

      {/* Attestation Modal */}
      <AttestationModal 
        isOpen={!!selectedEventForAttestation} 
        onClose={() => setSelectedEventForAttestation(null)} 
        event={selectedEventForAttestation} 
      />

    </div>
  );
};

export default ParticipantEvents;

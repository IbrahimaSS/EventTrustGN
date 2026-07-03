import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, Building2, Filter, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Assets
import EventForum from '../../assets/event_forum.png';
import EventConcours from '../../assets/event_concours.png';
import EventBootcamp from '../../assets/event_bootcamp.png';
import EventTournoi from '../../assets/event_tournoi.png';

const EventsPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const title = event.title || '';
    const instName = event.institutionId?.name || '';
    const loc = event.location || event.city || '';
    
    const matchSearch = searchTerm === '' || 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Assuming type might be related to category or if it's free/paid. We can just ignore complex type filtering for now or use category name.
    const catName = event.categoryId?.name || '';
    const matchType = selectedType === '' || catName === selectedType;
    
    const matchStatus = selectedStatus === '' || event.status === selectedStatus || (selectedStatus === 'Inscriptions ouvertes' && event.status === 'published');

    return matchSearch && matchType && matchStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">Publié</div>;
    }
    if (status === 'archived') {
      return <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">Archivé</div>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white pb-12">
      
      {/* Premium Header */}
      <section className="relative pt-[72px] pb-12 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white border-b border-slate-200">
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-[44px] font-serif font-bold text-slate-900 tracking-tight mb-4 leading-[1.15]"
          >
            Événements <span className="text-primary-600">Officiels</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Découvrez, vérifiez et participez aux concours, soutenances, et conférences certifiés par les institutions guinéennes.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Search & Filters (Lifted up to overlap header) */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-12 flex flex-col gap-4 relative">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un événement (titre, institution, lieu)..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-slate-700"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-6 py-3.5 border rounded-xl font-semibold transition-colors ${
                  isFilterOpen ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" /> Filtres
              </button>
            </div>
          </div>
          
          {/* Expanded Filters Section */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-slate-100 mt-2"
              >
                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type d'événement</label>
                    <select 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 font-medium"
                    >
                      <option value="">Tous les types</option>
                      <option value="Concours">Concours</option>
                      <option value="Soutenance">Soutenance</option>
                      <option value="Formation / Bootcamp">Formation / Bootcamp</option>
                      <option value="Forum / Conférence">Forum / Conférence</option>
                      <option value="Compétition">Compétition</option>
                    </select>
                  </div>
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 font-medium"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="Inscriptions ouvertes">Inscriptions ouvertes</option>
                      <option value="Bientôt disponible">Bientôt disponible</option>
                      <option value="Complet">Complet</option>
                    </select>
                  </div>
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Période</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 font-medium">
                      <option>Toutes les dates</option>
                      <option>Ce mois-ci</option>
                      <option>Le mois prochain</option>
                      <option>Cette année</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center">Chargement des événements...</div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => {
              const isPaid = event.registrationType === 'paid';
              const maxP = event.maxParticipants || 0;
              const currentP = event.participants || 0;
              const isFull = maxP > 0 && currentP >= maxP;

              return (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img 
                    src={event.imageUrl || EventForum} 
                    alt={event.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isFull ? 'grayscale-[30%]' : ''}`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {isFull ? (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">Complet</div>
                  ) : (
                    getStatusBadge(event.status)
                  )}
                  <div className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider ${isPaid ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {isPaid ? 'Payant' : 'Gratuit'}
                  </div>
                </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-primary-600 transition-colors duration-300 line-clamp-2" title={event.title}>
                  {event.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3 flex items-center" title={event.institutionId?.name}>
                  <Building2 className="h-3.5 w-3.5 mr-1.5 text-primary-500 shrink-0" />
                  <span className="truncate">{event.institutionId?.name || 'Institution inconnue'}</span>
                </p>
                
                <div className={`flex items-center text-xs font-semibold w-fit px-2.5 py-1.5 rounded mb-4 ${
                  isFull ? 'text-red-700 bg-red-50' : 'text-slate-700 bg-slate-100'
                }`}>
                  <Users className={`h-3.5 w-3.5 mr-1.5 ${isFull ? 'text-red-500' : 'text-slate-500'}`} /> 
                  {currentP} / {maxP === 0 ? '∞' : maxP} places
                </div>
                
                <div className="flex flex-col gap-2 text-xs text-slate-600 mb-6">
                  <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" /> {event.startDate ? new Date(event.startDate).toLocaleDateString('fr-FR') : 'Date non définie'}</span>
                  <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" /> <span className="truncate">{event.city || 'Lieu non défini'}</span></span>
                </div>

                <Link to={`/events/${event.slug}`} className="mt-auto w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold py-2.5 rounded-lg flex justify-center items-center group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300">
                  {isFull ? 'Voir l\'archive' : 'Voir le détail'} 
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
            );
          })
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-slate-500">Essayez de modifier vos critères de recherche ou vos filtres.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedType(''); setSelectedStatus(''); }}
                className="mt-6 text-primary-600 font-bold hover:underline"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
        
        {/* Pagination placeholder */}
        {filteredEvents.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 cursor-not-allowed">
                &lt;
              </button>
              <button className="w-10 h-10 rounded-lg bg-primary-600 text-white font-bold flex items-center justify-center shadow-md">
                1
              </button>
              <button className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50 transition-colors">
                2
              </button>
              <button className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                &gt;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EventsPage;

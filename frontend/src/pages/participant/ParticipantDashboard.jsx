import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  CalendarDays, ClipboardList, Award, TrendingUp,
  Clock, MapPin, ArrowRight, ChevronRight, Star, Users, Eye
} from 'lucide-react';

// Default mock data structure as fallback
const defaultStats = [
  { label: 'Événements inscrits', value: '0', icon: CalendarDays, color: 'bg-blue-50 text-blue-600', trend: '' },
  { label: 'Inscriptions actives', value: '0', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600', trend: '' },
  { label: 'Badges obtenus', value: '0', icon: Award, color: 'bg-amber-50 text-amber-600', trend: '' },
  { label: 'Participations', value: '0', icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: '' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: defaultStats,
    upcomingEvents: [],
    recentBadges: [],
    recommendedEvents: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/participant');
      
      const st = res.data.stats;
      const formattedStats = [
        { label: 'Événements inscrits', value: st.totalRegistrations || '0', icon: CalendarDays, color: 'bg-blue-50 text-blue-600', trend: 'Global' },
        { label: 'Inscriptions actives', value: st.pendingRegistrations || '0', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600', trend: 'En attente' },
        { label: 'Badges obtenus', value: st.totalBadges || '0', icon: Award, color: 'bg-amber-50 text-amber-600', trend: 'Sécurisés' },
        { label: 'Participations', value: st.totalParticipations || '0', icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: 'Total cumulé' },
      ];

      setData({
        stats: formattedStats,
        upcomingEvents: res.data.upcomingEvents || [],
        recentBadges: res.data.recentBadges || [],
        recommendedEvents: res.data.recommendedEvents || []
      });
    } catch (error) {
      toast.error("Erreur lors de la récupération des données du tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Chargement de votre espace...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* Welcome Banner */}
      <motion.div variants={item} className="bg-gradient-to-r from-[#0A1F44] to-[#0d6efd] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-24 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Bonjour, {user?.fullName?.split(' ')[0] || 'Participant'}</h2>
          <div className="text-blue-100 font-medium max-w-lg">
            Vous avez <span className="text-white font-bold">{data.upcomingEvents.length} événement(s) à venir</span>.
            Consultez vos inscriptions et préparez vos badges !
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/participant/events" className="inline-flex items-center gap-2 bg-white text-[#0A1F44] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-md">
              <CalendarDays className="w-4 h-4" /> Mes événements
            </Link>
            <Link to="/participant/events" className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors border border-white/20">
              <Eye className="w-4 h-4" /> Explorer
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${stat.color.split(' ')[0]} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
            <div className="text-sm font-semibold text-slate-500 mt-1">{stat.label}</div>
            <div className="text-xs text-slate-400 mt-2 font-medium">{stat.trend}</div>
          </div>
        ))}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Events - 2/3 */}
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Événements à venir</h3>
            <Link to="/participant/events" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <div className="px-6 pb-6 space-y-3 min-w-[500px] lg:min-w-0">
              {data.upcomingEvents.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">Aucun événement à venir.</div>
              ) : (
                data.upcomingEvents.map((event) => {
                  const evtDate = new Date(event.date);
                  const displayDate = evtDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                  const displayTime = evtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={event.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-colors group cursor-pointer">
                      {/* Date Block */}
                      <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-blue-600 uppercase">{displayDate.split(' ')[1]?.substring(0, 3)}</span>
                        <span className="text-lg font-extrabold text-slate-900 leading-none">{displayDate.split(' ')[0]}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{event.title}</h4>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{event.institution}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" /> {displayTime}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" /> {event.location?.split(' - ')[1] || event.location || 'Lieu non défini'}
                          </span>
                        </div>
                      </div>

                      {/* Status + Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${event.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                          }`}>
                          {event.status === 'accepted' ? 'Confirmé' : 'En attente'}
                        </span>
                        <Link to={`/participant/events/${event.id}`} className="hidden sm:flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Badges - 1/3 */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Mes badges</h3>
            <Link to="/participant/badges" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {data.recentBadges.length === 0 ? (
              <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">Aucun badge obtenu.</div>
            ) : (
              data.recentBadges.map((badge) => (
                <div key={badge.id} className="p-4 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.status === 'valid'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                      }`}>
                      {badge.status === 'valid' ? 'Valide' : 'Utilisé'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{badge.event}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-1">{badge.code}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(badge.date).toLocaleDateString('fr-FR')}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recommended Events */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Événements recommandés</h3>
            <div className="text-sm text-slate-400 font-medium mt-0.5">Basé sur vos centres d'intérêt</div>
          </div>
          <Link to="/participant/events" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
            Explorer tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.recommendedEvents.length === 0 ? (
            <div className="col-span-full text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center">Aucun événement disponible pour le moment.</div>
          ) : (
            data.recommendedEvents.map((event) => {
              const evtDate = new Date(event.date);
              const displayDate = evtDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <div key={event.id} className="group p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">{event.category}</span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Users className="w-3 h-3" /> {event.spots} places</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                  <div className="text-sm text-slate-500 font-medium mt-1">{event.institution}</div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {displayDate}</span>
                    <Link to={`/participant/events/${event.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      S'inscrire <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParticipantDashboard;

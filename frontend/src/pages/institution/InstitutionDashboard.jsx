import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Users, Award, DollarSign,
  ChevronRight, Plus, BarChart3,
  CalendarCheck, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// SVG Donut Chart Component
const DonutChart = ({ data, size = 180, strokeWidth = 28 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900">0</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Événements</span>
        </div>
      </div>
    );
  }
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {data.map((segment, i) => {
          if (segment.value === 0) return null;
          const segmentLength = (segment.value / total) * circumference;
          const gapSize = 4;
          const dashLength = Math.max(segmentLength - gapSize, 1);
          const offset = cumulativeOffset;
          cumulativeOffset += segmentLength;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900">{total}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Événements</span>
      </div>
    </div>
  );
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/events/institution');
      setEvents(res.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute real stats from events
  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const draftEvents = events.filter(e => e.status === 'draft').length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.participants || 0), 0);

  const stats = [
    { label: 'Total événements', value: totalEvents, icon: CalendarDays, color: 'bg-blue-50 text-blue-600' },
    { label: 'Événements publiés', value: publishedEvents, icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Brouillons', value: draftEvents, icon: Award, color: 'bg-amber-50 text-amber-600' },
    { label: 'Inscriptions totales', value: totalRegistrations, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  const donutData = [
    { label: 'Publiés', value: publishedEvents, color: '#10b981' },
    { label: 'Brouillons', value: draftEvents, color: '#94a3b8' },
  ];

  const institutionName = user?.institution?.name || 'Mon Institution';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* Welcome Banner */}
      <motion.div variants={item} className="bg-gradient-to-r from-[#0A1F44] to-[#1E3E75] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-32 w-40 h-40 bg-blue-500/10 rounded-full translate-y-1/2"></div>
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-400/20">Institution vérifiée</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{institutionName}</h2>
            <p className="text-blue-200 font-medium max-w-lg text-sm">
              Vous avez <span className="text-white font-bold">{totalEvents} événement{totalEvents > 1 ? 's' : ''}</span> dont <span className="text-white font-bold">{draftEvents} brouillon{draftEvents > 1 ? 's' : ''}</span> à finaliser.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/institution/events/create" className="inline-flex items-center gap-2 bg-white text-[#0A1F44] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-md">
                <Plus className="w-4 h-4" /> Créer un événement
              </Link>
              <Link to="/institution/events" className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors border border-white/20">
                <CalendarDays className="w-4 h-4" /> Voir mes événements
              </Link>
            </div>
          </div>
          {/* Institution Logo / Initial */}
          <div className="hidden md:flex items-center justify-center shrink-0">
            <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 flex items-center justify-center p-3 shadow-lg overflow-hidden">
              {user?.institution?.logoUrl ? (
                <img src={user.institution.logoUrl} alt="Institution Logo" className="w-full h-full object-contain drop-shadow-md rounded-xl" />
              ) : (
                <span className="text-4xl font-black text-white/80">{institutionName.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${stat.color.split(' ')[0]} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Donut Chart + Recent Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Donut Chart - 2/5 */}
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Répartition des événements</h3>
          <div className="flex flex-col items-center">
            <DonutChart data={donutData} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 w-full max-w-[280px]">
              {donutData.map((d, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700">{d.label}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{d.value} événement{d.value > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Events - 3/5 */}
        <motion.div variants={item} className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Derniers événements
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{events.length}</span>
            </h3>
            <Link to="/institution/events" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {events.length > 0 ? (
            <div className="px-6 pb-6 space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event._id} className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 hover:bg-blue-50/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${event.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                      {event.title?.charAt(0) || 'E'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{event.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date à définir'} • {event.city}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    event.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {event.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 pb-6 text-center py-8">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Aucun événement créé pour le moment</p>
              <Link to="/institution/events/create" className="text-sm text-blue-600 font-bold mt-2 inline-block hover:underline">
                Créer votre premier événement →
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions Bar */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/institution/events/create" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center group">
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-700">Nouvel événement</span>
          </Link>
          <Link to="/institution/badges" className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center group">
            <div className="w-10 h-10 bg-amber-100 group-hover:bg-amber-200 rounded-xl flex items-center justify-center transition-colors">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-slate-700">Émettre un badge</span>
          </Link>
          <Link to="/institution/scans" className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center group">
            <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-700">Scanner QR Codes</span>
          </Link>
          <Link to="/institution/analytics" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center group">
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-slate-700">Voir les stats</span>
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default InstitutionDashboard;

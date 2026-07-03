import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, CalendarDays, CreditCard, 
  TrendingUp, Activity, Shield, CheckCircle2, Clock, Eye,
  Zap, Globe, Server, Database, Mail, Smartphone, Radio,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/super-admin');
      setDashData(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  const formatRevenue = (amount) => {
    if (!amount || amount === 0) return '0 GNF';
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M GNF`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K GNF`;
    return `${amount} GNF`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('fr-FR');
  };

  const health = [
    { label: 'API Backend', uptime: '99.98%', icon: Server },
    { label: 'Base de données', uptime: '99.99%', icon: Database },
    { label: 'Service IA', uptime: '98.5%', icon: Zap },
    { label: 'CDN / Assets', uptime: '100%', icon: Globe },
    { label: 'Service Email', uptime: '99.7%', icon: Mail },
    { label: 'Paiement Mobile', uptime: '98.2%', icon: Smartphone },
  ];

  const colorMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    slate: 'bg-slate-500'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!dashData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">Impossible de charger les données.</p>
          <button onClick={fetchDashboard} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 cursor-pointer">Réessayer</button>
        </div>
      </div>
    );
  }

  const { kpis, topInstitutions, pendingItems, activeEvents, activityFeed } = dashData;

  const kpiCards = [
    { label: 'Institutions', value: formatNumber(kpis.totalInstitutions), icon: Building2, color: 'bg-blue-50 text-[#0d6efd]' },
    { label: 'Utilisateurs', value: formatNumber(kpis.totalUsers), icon: Users, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Événements', value: formatNumber(kpis.totalEvents), icon: CalendarDays, color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenus (Total)', value: formatRevenue(kpis.totalRevenue), icon: CreditCard, color: 'bg-yellow-50 text-yellow-600' },
  ];

  const firstName = user?.fullName?.split(' ')[0] || 'Admin';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item} className="relative bg-secondary-900 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl border border-secondary-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary-500" />
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Gouvernance Centrale</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Bienvenue, {firstName}</h2>
          <p className="text-sm text-[var(--color-neutral,#94a3b8)] max-w-xl leading-relaxed">Contrôle absolu sur la plateforme EventTrust GN. Surveillez les institutions, gérez les flux financiers et assurez la sécurité globale du système.</p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <motion.div key={i} variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}><k.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-0.5">{k.label}</p>
              <p className="text-2xl font-black text-slate-900">{k.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Active Events and Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Events */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Événements en cours
          </h3>
          {activeEvents.length > 0 ? (
            <div className="space-y-5">
              {activeEvents.map((ev, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ev.title}</p>
                      <p className="text-xs text-slate-500">{ev.institution}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0d6efd]">{ev.percent}%</p>
                      <p className="text-[10px] text-slate-500 font-medium">{ev.registrations} / {ev.maxParticipants} inscrits</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${ev.percent}%` }} 
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${ev.percent >= 70 ? 'bg-emerald-500' : 'bg-[#0d6efd]'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Aucun événement actif pour le moment.</p>
            </div>
          )}
        </motion.div>

        {/* Pending */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-500" /> En attente</h3>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">{pendingItems.length}</span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-64">
            {pendingItems.length > 0 ? pendingItems.map((a, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'Institution' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {a.type === 'Institution' ? <Building2 className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.type} • {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={a.type === 'Institution' ? '/admin/institutions' : '/admin/events'} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Voir">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-medium">Aucun élément en attente 🎉</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Row 2: System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-emerald-500" /> Santé du Système</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {health.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <s.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-600">{s.uptime}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-amber-500" /> Activité Récente</h3>
          {activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${colorMap[act.color] || 'bg-slate-500'}`}></div>
                    {i < activityFeed.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{act.text}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">{act.timeLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Aucune activité récente.</p>
          )}
        </motion.div>
      </div>

      {/* Row 3: Top Institutions */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-[#0d6efd]" /> Institutions Actives</h3>
          <Link to="/admin/institutions" className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Voir tout →</Link>
        </div>
        {topInstitutions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm custom-admin-table">
              <thead><tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="p-4 pl-5">Institution</th>
                <th className="p-4 text-center">Événements</th>
                <th className="p-4 text-center">Inscriptions</th>
                <th className="p-4 text-right pr-5">Ville</th>
              </tr></thead>
              <tbody>
                {topInstitutions.map((inst, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        {inst.logoUrl ? (
                          <img src={inst.logoUrl} alt={inst.acronym} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div translate="no" className="w-9 h-9 rounded-lg bg-blue-50 text-[#0d6efd] flex items-center justify-center font-bold text-xs shrink-0">
                            {inst.acronym?.slice(0, 2) || 'IN'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{inst.acronym || inst.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[220px]">{inst.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-900">{inst.eventsCount}</td>
                    <td className="p-4 text-center font-bold text-slate-900">{inst.registrationsCount}</td>
                    <td className="p-4 text-right pr-5 text-sm text-slate-600 font-medium">{inst.city || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Aucune institution active pour le moment.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SuperAdminDashboard;

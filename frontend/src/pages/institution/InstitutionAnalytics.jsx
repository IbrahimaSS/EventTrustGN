import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Calendar, QrCode, 
  Download, BarChart3, PieChart, Activity, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Simple Bar Chart component
const BarChart = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-600">{d.value}</span>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="w-full rounded-t-lg" 
            style={{ 
              minHeight: '4px',
              background: `linear-gradient(to top, #0A1F44, #0d6efd)`
            }}
          ></motion.div>
          <span className="text-[10px] font-medium text-slate-500 mt-1">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// Donut Chart component
const DonutChart = ({ segments, size = 160 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={(size - 24) / 2} fill="none" stroke="#e2e8f0" strokeWidth={24} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">0</span>
          <span className="text-xs text-slate-500 font-medium">Aucun scan</span>
        </div>
      </div>
    );
  }

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          if (seg.value === 0) return null;
          const dash = (seg.value / total) * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900">{total}</span>
        <span className="text-xs text-slate-500 font-medium">Total</span>
      </div>
    </div>
  );
};

const InstitutionAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/registrations/institution/analytics');
      setAnalytics(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des analytiques.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!analytics) return;

    const lines = [
      '=== RAPPORT ANALYTIQUE EVENTTRUST GN ===',
      `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      '--- INDICATEURS CLÉS ---',
      `Événements créés: ${analytics.totalEvents}`,
      `Inscriptions totales: ${analytics.totalRegistrations}`,
      `Badges générés: ${analytics.totalBadges}`,
      `Taux de présence: ${analytics.presenceRate}%`,
      '',
      '--- INSCRIPTIONS MENSUELLES ---',
      ...analytics.monthlyRegistrations.map(m => `${m.label}: ${m.value}`),
      '',
      '--- RÉSULTATS DES SCANS ---',
      ...analytics.scanResults.map(s => `${s.label}: ${s.value}`),
      '',
      '--- TOP 5 ÉVÉNEMENTS ---',
      ...analytics.topEvents.map((e, i) => `${i + 1}. ${e.name} — ${e.participants} inscrits`),
      '',
      '--- RÉPARTITION DES ÉVÉNEMENTS ---',
      ...analytics.eventsByCategory.map(c => `${c.label}: ${c.value}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport_analytique_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rapport exporté avec succès !');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500">Impossible de charger les analytiques.</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Événements créés', value: analytics.totalEvents, icon: Calendar, color: 'blue' },
    { label: 'Inscriptions totales', value: analytics.totalRegistrations.toLocaleString('fr-FR'), icon: Users, color: 'emerald' },
    { label: 'Badges générés', value: analytics.totalBadges.toLocaleString('fr-FR'), icon: QrCode, color: 'purple' },
    { label: 'Taux de présence', value: `${analytics.presenceRate}%`, icon: Activity, color: 'yellow' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-[#0d6efd]',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytique</h2>
          <p className="text-slate-500 text-sm mt-1">Suivez les performances de vos événements et l'engagement des participants.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportReport} className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Rapport
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[kpi.color]}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-0.5">{kpi.label}</p>
              <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart - Monthly Registrations */}
        <motion.div variants={item} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0d6efd]" />
                Inscriptions mensuelles
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Évolution sur les 12 derniers mois</p>
            </div>
          </div>
          <BarChart data={analytics.monthlyRegistrations} />
        </motion.div>

        {/* Donut - Scan Results */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#0d6efd]" />
              Résultats des scans
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Répartition des vérifications</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <DonutChart segments={analytics.scanResults} />
            <div className="w-full space-y-2 mt-2">
              {analytics.scanResults.map((seg, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                    <span className="text-sm font-medium text-slate-600">{seg.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Events + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Events */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0d6efd]" />
            Top 5 Événements
          </h3>
          {analytics.topEvents.length > 0 ? (
            <div className="space-y-4">
              {analytics.topEvents.map((evt, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center">{i + 1}</span>
                      {evt.name}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{evt.participants}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${evt.fill}%` }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      className="h-2 rounded-full" 
                      style={{ 
                        background: evt.fill > 80 ? '#f59e0b' : 'linear-gradient(to right, #0A1F44, #0d6efd)' 
                      }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Aucun événement avec des inscriptions pour le moment.</p>
          )}
        </motion.div>

        {/* Events by Category */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0d6efd]" />
            Répartition des événements
          </h3>
          <div className="space-y-4">
            {analytics.eventsByCategory.map((cat, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                  <span className="text-lg font-black" style={{ color: cat.color }}>{cat.value}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{cat.label}</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analytics.totalEvents > 0 ? (cat.value / analytics.totalEvents) * 100 : 0}%` }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      className="h-1.5 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default InstitutionAnalytics;

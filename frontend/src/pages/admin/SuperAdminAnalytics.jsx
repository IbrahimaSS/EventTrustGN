import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Building2, CalendarDays, CreditCard, TrendingUp, Palette, X, Target } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell,
} from 'recharts';

// ─── Palettes & Constants ────────────────────────────────
const PALETTE = ['#3b82f6','#8b5cf6','#22c55e','#f59e0b','#ef4444','#ec4899'];

const PERIODS = {
  week: { label: 'Semaine', key: 'week' },
  month: { label: 'Mois', key: 'month' },
  year: { label: 'Année', key: 'year' },
};

// ─── Data Sets by Period ─────────────────────────────────
const inscriptionsData = {
  week: [
    { name: 'Lun', value: 42 }, { name: 'Mar', value: 58 }, { name: 'Mer', value: 35 },
    { name: 'Jeu', value: 72 }, { name: 'Ven', value: 64 }, { name: 'Sam', value: 28 }, { name: 'Dim', value: 16 },
  ],
  month: [
    { name: 'Jan', value: 220 }, { name: 'Fév', value: 480 }, { name: 'Mar', value: 360 },
    { name: 'Avr', value: 720 }, { name: 'Mai', value: 560 }, { name: 'Jun', value: 800 },
    { name: 'Jul', value: 450 }, { name: 'Aoû', value: 340 }, { name: 'Sep', value: 1100 },
    { name: 'Oct', value: 623 }, { name: 'Nov', value: 712 }, { name: 'Déc', value: 845 },
  ],
  year: [
    { name: '2024', value: 3200 }, { name: '2025', value: 7850 }, { name: '2026', value: 12847 },
  ],
};

const croissanceData = {
  week: [
    { name: 'Lun', value: 12 }, { name: 'Mar', value: 18 }, { name: 'Mer', value: 8 },
    { name: 'Jeu', value: 25 }, { name: 'Ven', value: 20 }, { name: 'Sam', value: 9 }, { name: 'Dim', value: 4 },
  ],
  month: [
    { name: 'Sep', value: 1204 }, { name: 'Oct', value: 623 }, { name: 'Nov', value: 712 }, { name: 'Déc', value: 845 },
  ],
  year: [
    { name: '2024', value: 3200 }, { name: '2025', value: 4650 }, { name: '2026', value: 4997 },
  ],
};

const baseGeoData = [
  { prefecture: 'Conakry', institutions: 0, events: 0, users: 0 },
];

import api from '../../services/api';

// ─── Hooks ───────────────────────────────────────────────
const usePersistentColor = (key, defaultColor) => {
  const [color, setColor] = useState(() => {
    try { return localStorage.getItem(key) || defaultColor; } catch { return defaultColor; }
  });
  useEffect(() => { try { localStorage.setItem(key, color); } catch {} }, [key, color]);
  return [color, setColor];
};

// ─── Small UI Components ─────────────────────────────────
const ColorPicker = ({ color, setColor, show, setShow }) => (
  <div className="relative">
    <button onClick={() => setShow(!show)} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200" title="Changer la couleur">
      <Palette className="w-4 h-4" style={{ color }} />
    </button>
    {show && (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-10 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 flex gap-2">
        {PALETTE.map(c => (
          <button key={c} onClick={() => { setColor(c); setShow(false); }} className="cursor-pointer w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shadow-sm" style={{ backgroundColor: c, borderColor: c === color ? '#0f172a' : 'transparent' }} />
        ))}
      </motion.div>
    )}
  </div>
);

const ChartTypeSwitcher = ({ chartType, setChartType }) => (
  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
    {[{ key: 'bar', label: 'Barres' }, { key: 'line', label: 'Courbe' }, { key: 'area', label: 'Aires' }].map(t => (
      <button key={t.key} onClick={() => setChartType(t.key)} className={`cursor-pointer px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${chartType === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
    ))}
  </div>
);

const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-bold">
        <p className="text-slate-400 mb-0.5">{label}</p>
        <p>{payload[0].value.toLocaleString()}{suffix}</p>
      </div>
    );
  }
  return null;
};

// ─── Flexible Chart Renderer ─────────────────────────────
const FlexibleChart = ({ data, chartType, color, horizontal = false }) => {
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
            {data.map((_, i) => <Cell key={i} fill={color} fillOpacity={0.8 + (i * 0.04)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  const commonProps = { data, margin: { top: 5, right: 10, left: -20, bottom: 5 } };
  const xProps = { dataKey: 'name', tick: { fontSize: 11, fontWeight: 600, fill: '#94a3b8' }, axisLine: false, tickLine: false };
  const yProps = { tick: { fontSize: 10, fill: '#cbd5e1' }, axisLine: false, tickLine: false };
  const tooltipProps = { content: <CustomTooltip /> };

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart {...commonProps}>
          <XAxis {...xProps} /><YAxis {...yProps} />
          <Tooltip {...tooltipProps} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart {...commonProps}>
          <defs><linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
          <XAxis {...xProps} /><YAxis {...yProps} />
          <Tooltip {...tooltipProps} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#grad-${color.replace('#','')})`} dot={{ r: 3, fill: color, strokeWidth: 2, stroke: '#fff' }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  // default: bar
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart {...commonProps}>
        <XAxis {...xProps} /><YAxis {...yProps} />
        <Tooltip {...tooltipProps} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={data.length > 7 ? 24 : 36}>
          {data.map((_, i) => <Cell key={i} fill={color} fillOpacity={0.75 + (i * 0.02)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Donut Chart (Revenue & Roles) ───────────────────────
const InteractiveDonut = ({ segments, size = 180 }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments} cx="50%" cy="50%"
              innerRadius={55} outerRadius={80}
              paddingAngle={4} dataKey="value" stroke="none"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {segments.map((seg, i) => (
                <Cell key={i} fill={seg.color} fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.3} className="transition-all duration-300 cursor-pointer" />
              ))}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
              <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-bold">
                <p>{payload[0].name}</p>
                <p>{payload[0].value.toLocaleString()}</p>
              </div>
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
          <span className="text-lg font-black text-slate-900">{total >= 1000000 ? (total / 1000000).toFixed(1) + 'M' : total.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {segments.map((seg, i) => {
          const pct = ((seg.value / total) * 100).toFixed(1);
          return (
            <div key={i} onClick={() => setActiveIndex(activeIndex === i ? null : i)} className="flex items-center justify-between cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: seg.color, opacity: activeIndex === null || activeIndex === i ? 1 : 0.3 }}></span>
                <span className="text-sm font-semibold text-slate-700">{seg.label}</span>
                <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {seg.value >= 1000000 ? (seg.value / 1000000).toFixed(1) + 'M' : seg.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Chart Card Wrapper ──────────────────────────────────
const ChartCard = ({ title, icon: Icon, iconColor = '#3b82f6', children, className = '', colorKey, showTypeSwitcher = false }) => {
  const [color, setColor] = usePersistentColor(colorKey || title, '#3b82f6');
  const [showPalette, setShowPalette] = useState(false);
  const [chartType, setChartType] = useState('bar');

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-5 gap-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Icon className="w-5 h-5 shrink-0" style={{ color: iconColor }} /> {title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {showTypeSwitcher && <ChartTypeSwitcher chartType={chartType} setChartType={setChartType} />}
          <ColorPicker color={color} setColor={setColor} show={showPalette} setShow={setShowPalette} />
        </div>
      </div>
      {typeof children === 'function' ? children({ color, chartType }) : children}
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════
const SuperAdminAnalytics = () => {
  const [period, setPeriod] = useState('month');
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/super-admin/analytics');
        setData(res.data);
      } catch (error) {
        console.error('Erreur de chargement des analytiques', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const revenueSegments = data?.revenueSegments || [];
  const roleSegments = data?.roleSegments || [];
  const topEventsData = data?.topEvents || [];
  const geoDataList = data?.geoData || baseGeoData;
  const maxGeoUsers = Math.max(...geoDataList.map(g => g.users), 1);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Intelligence & Données</h2>
          <p className="text-slate-500 text-sm mt-1">Métriques de performance et insights en temps réel — EventTrust GN</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {Object.values(PERIODS).map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === p.key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Utilisateurs & Inscrits', value: (data?.totalUsers || 0).toLocaleString(), icon: Users, color: 'bg-blue-50 text-[#0d6efd]' },
          { label: 'Institutions', value: (data?.totalInstitutions || 0).toLocaleString(), icon: Building2, color: 'bg-purple-50 text-purple-600' },
          { label: 'Événements', value: (data?.totalEvents || 0).toLocaleString(), icon: CalendarDays, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Revenus totaux', value: `${((data?.totalRevenue || 0) / 1000000).toFixed(1)}M GNF`, icon: CreditCard, color: 'bg-amber-50 text-amber-600' },
          { label: 'Taux de présence', value: '73%', icon: Target, color: 'bg-rose-50 text-rose-600' },
        ].map((k, i) => (
          <motion.div key={i} variants={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}><k.icon className="w-6 h-6" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 mb-0.5 truncate">{k.label}</p>
              <p className="text-xl font-black text-slate-900 leading-tight">{k.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── ROW 1 : Inscriptions (50%) + Revenus Donut (50%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Inscriptions mensuelles" icon={BarChart3} iconColor="#3b82f6" colorKey="analytics-inscriptions" showTypeSwitcher>
          {({ color, chartType }) => (
            <FlexibleChart data={inscriptionsData[period]} chartType={chartType} color={color} />
          )}
        </ChartCard>

        <ChartCard title="Revenus par plan d'abonnement" icon={CreditCard} iconColor="#8b5cf6" colorKey="analytics-revenus">
          {() => <InteractiveDonut segments={revenueSegments} />}
        </ChartCard>
      </div>

      {/* ── ROW 2 : Croissance (50%) + Répartition Rôles (50%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Croissance mensuelle des utilisateurs" icon={TrendingUp} iconColor="#22c55e" colorKey="analytics-croissance" showTypeSwitcher>
          {({ color, chartType }) => (
            <div className="space-y-4">
              <FlexibleChart data={croissanceData[period]} chartType={chartType === 'bar' ? 'area' : chartType} color={color} />
              {period === 'month' && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {croissanceData.month.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">{m.name} 2026</span>
                      <span className="text-xs font-black text-emerald-600">+{m.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Répartition des utilisateurs par rôle" icon={Users} iconColor="#3b82f6" colorKey="analytics-roles">
          {() => <InteractiveDonut segments={roleSegments} />}
        </ChartCard>
      </div>

      {/* ── ROW 3 : Top Événements (60%) + Couverture Géo (40%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard title="Top 5 événements par participation" icon={CalendarDays} iconColor="#8b5cf6" colorKey="analytics-top-events" className="lg:col-span-3">
          {({ color }) => (
            <FlexibleChart data={topEventsData} chartType="bar" color={color} horizontal />
          )}
        </ChartCard>

        <motion.div variants={item} className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-amber-500" /> Couverture géographique en Guinée
          </h3>
          <div className="space-y-0">
            <div className="grid grid-cols-4 gap-2 pb-3 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <span>Préfecture</span><span className="text-center">Inst.</span><span className="text-center">Évén.</span><span className="text-right">Users</span>
            </div>
            {geoDataList.map((row, i) => {
              const barWidth = (row.users / maxGeoUsers) * 100;
              return (
                <div key={i} className="grid grid-cols-4 gap-2 py-3 border-b border-slate-50 items-center group hover:bg-slate-50 transition-colors rounded-lg">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{row.prefecture}</span>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden w-full">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${barWidth}%` }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 text-center">{row.institutions}</span>
                  <span className="text-sm font-bold text-slate-700 text-center">{row.events}</span>
                  <span className="text-sm font-black text-slate-900 text-right">{row.users.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SuperAdminAnalytics;

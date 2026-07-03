import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CalendarDays, BarChart3,
  Settings, LogOut, Menu, X, Bell, Search, ShieldCheck,
  CreditCard, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import LogoP from '../../assets/LogoP.png';
import AIAssistantWidget from './AIAssistantWidget';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Vue d\'ensemble', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Institutions', icon: Building2, path: '/admin/institutions' },
  { label: 'Utilisateurs', icon: Users, path: '/admin/users' },
  { label: 'Événements', icon: CalendarDays, path: '/admin/events' },
  { label: 'Analytique', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Abonnements', icon: CreditCard, path: '/admin/subscriptions' },
  { label: 'Modération', icon: AlertTriangle, path: '/admin/moderation' },
];

const SuperAdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user, logout } = useAuth();

  const platformName = settings?.general?.platformName || 'EventTrust GN';
  const logoUrl = settings?.branding?.logoUrl || LogoP;
  const showLogoText = settings?.branding?.showLogoText !== false;

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie !');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentPage = navItems.find(item => location.pathname.startsWith(item.path)) || { label: 'Paramètres' };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      
      {/* ==================== TOP NAVIGATION BAR (SUPER ADMIN) ==================== */}
      <header className="bg-secondary-900 border-b border-secondary-800 sticky top-0 z-40 shadow-lg">
        {/* Top Header Row */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Role Badge */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5">
                <img src={logoUrl} alt={platformName} className="h-9 object-contain" />
                {showLogoText && (
                  <span className="text-2xl font-extrabold text-white tracking-tight hidden sm:block">
                    {platformName.split(' ')[0] || 'EventTrust'} <span className="text-primary-500">{platformName.split(' ').slice(1).join(' ') || 'GN'}</span>
                  </span>
                )}
              </Link>
              
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span className="text-[11px] font-bold text-primary-500 uppercase tracking-widest">Super Admin</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-neutral,#94a3b8)]" />
                <input 
                  type="text" 
                  placeholder="Recherche globale..." 
                  className="w-64 bg-secondary-800 border border-secondary-700 text-white text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-[var(--color-neutral,#94a3b8)]"
                />
              </div>

              <button className="relative p-2.5 bg-secondary-800 hover:bg-secondary-700 rounded-full transition-colors cursor-pointer border border-secondary-700">
                <Bell className="w-5 h-5 text-[var(--color-neutral,#94a3b8)]" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-secondary-900"></span>
              </button>

              <Link to="/admin/settings" className="p-2.5 bg-secondary-800 hover:bg-secondary-700 rounded-full transition-colors cursor-pointer border border-secondary-700 hidden sm:block">
                <Settings className="w-5 h-5 text-[var(--color-neutral,#94a3b8)]" />
              </Link>

              <div className="h-8 w-px bg-secondary-700 hidden sm:block mx-1"></div>

              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-3 pl-2">
                <div className="text-right">
                  <p className="text-sm font-bold text-white leading-none">{user?.fullName || 'Super Admin'}</p>
                  <p className="text-[11px] font-medium text-primary-500 mt-1">{user?.role || 'Gouvernance'}</p>
                </div>
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-md transition-all cursor-pointer border-2 border-secondary-800 bg-cover bg-center"
                  style={{ 
                    background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--gradient-primary)',
                  }}
                >
                  {!user?.avatar && getInitials(user?.fullName)}
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2 text-[var(--color-neutral,#94a3b8)] hover:bg-secondary-800 rounded-xl transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Row (Desktop) */}
        <div className="hidden lg:block border-t border-secondary-800 bg-secondary-900/50 backdrop-blur-md">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'text-white shadow-md' 
                        : 'text-[var(--color-neutral,#94a3b8)] hover:text-white hover:bg-secondary-800'
                    }`
                  }
                  style={({ isActive }) => isActive ? { background: 'var(--gradient-primary)' } : {}}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ==================== MOBILE MENU ==================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-secondary-900 border-b border-secondary-800 overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? 'text-white' : 'text-[var(--color-neutral,#94a3b8)] hover:text-white hover:bg-secondary-800'
                    }`
                  }
                  style={({ isActive }) => isActive ? { background: 'var(--gradient-primary)' } : {}}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left mt-2 border-t border-slate-800 pt-5"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header Area */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{currentPage.label}</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Panneau de contrôle global EventTrust GN</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Système Opérationnel</span>
          </div>
        </div>

        {/* Render Page Content */}
        <Outlet />
      </main>

      {/* ==================== LOGOUT CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div key="logout-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 border border-slate-100 p-8 text-center"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-inner">
                <LogOut className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Fin de session</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 px-2">
                Êtes-vous sûr de vouloir quitter le centre de gouvernance ?
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Oui, me déconnecter
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer border border-slate-200 shadow-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== AI ASSISTANT WIDGET ==================== */}
      <AIAssistantWidget variant="superadmin" />
    </div>
  );
};

export default SuperAdminLayout;

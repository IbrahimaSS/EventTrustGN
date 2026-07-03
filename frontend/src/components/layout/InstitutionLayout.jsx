import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Award, BarChart3,
  Settings, LogOut, Menu, X, Bell, Search, Building2,
  ClipboardList, QrCode, UserPlus, MessageSquare, AlertCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import LogoP from '../../assets/LogoP.png';
import AIAssistantWidget from './AIAssistantWidget';

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/institution/dashboard' },
  { label: 'Événements', icon: CalendarDays, path: '/institution/events' },
  { label: 'Inscriptions', icon: ClipboardList, path: '/institution/registrations' },
  { label: 'Participants', icon: Users, path: '/institution/participants' },
  { label: 'Badges & QR', icon: Award, path: '/institution/badges' },
  { label: 'Scans & Accès', icon: QrCode, path: '/institution/scans' },
  { label: 'Analytique', icon: BarChart3, path: '/institution/analytics' },
  { label: 'Paramètres', icon: Settings, path: '/institution/settings' },
];

const InstitutionLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const currentPage = navItems.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentPage?.label || 'Tableau de bord';
  const isPending = !user?.institution || user?.institution?.status === 'pending';

  useEffect(() => {
    if (user?.institution?.settings) {
      const { primaryColor, font } = user.institution.settings;
      if (primaryColor) document.documentElement.style.setProperty('--sidebar-bg', primaryColor);
      
      // Map font selections to actual CSS fonts
      const fontMap = {
        inter: "'Inter', sans-serif",
        roboto: "'Roboto', sans-serif",
        poppins: "'Poppins', sans-serif",
        outfit: "'Outfit', sans-serif",
        montserrat: "'Montserrat', sans-serif"
      };
      if (font && fontMap[font]) {
        document.documentElement.style.setProperty('--app-font', fontMap[font]);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f1f5f9]" style={{ fontFamily: 'var(--app-font, "Inter", sans-serif)' }}>

      {/* ==================== SIDEBAR (Desktop) ==================== */}
      <aside className="hidden lg:flex flex-col w-[270px] min-h-screen fixed left-0 top-0 z-40 transition-colors duration-500" style={{ backgroundColor: 'var(--sidebar-bg, #0A1F44)' }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={LogoP} alt="EventTrust GN Logo" className="h-8" />
            <span className="text-xl font-extrabold text-white tracking-tight">
              EventTrust <span className="text-blue-400">GN</span>
            </span>
          </Link>
          <div className="mt-3 px-3 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-lg inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Espace Institution</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`
              }
              onClick={(e) => isPending && e.preventDefault()}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="px-3 pb-6 mt-auto">
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.fullName?.charAt(0) || 'I'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.institution?.name || user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">Admin Institution</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MOBILE SIDEBAR ==================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 w-[280px] min-h-full p-4 shadow-2xl flex flex-col justify-between transition-colors duration-500" style={{ backgroundColor: 'var(--sidebar-bg, #0A1F44)' }}>
            <div>
              <div className="flex items-center justify-between mb-6 px-2">
                <Link to="/" className="flex items-center gap-2">
                  <img src={LogoP} alt="EventTrust GN Logo" className="h-8" />
                  <span className="text-lg font-extrabold text-white">EventTrust <span className="text-blue-400">GN</span></span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4 px-2">
                <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-lg inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Espace Institution</span>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      if (isPending) e.preventDefault();
                      else setMobileMenuOpen(false);
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      } ${isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2 mt-auto">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.fullName?.charAt(0) || 'I'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.institution?.name || user?.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">Admin Institution</p>
                </div>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="lg:ml-[270px]">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                {user?.institution?.logoUrl ? (
                  <img src={user.institution.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-sm hidden sm:block" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 shadow-sm hidden sm:flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{isPending ? 'En attente' : pageTitle}</h1>
                  <p className="text-xs text-slate-400 font-medium hidden sm:block">{user?.institution?.name || 'Institution'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm rounded-xl transition-colors font-medium">
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Rechercher...</span>
              </button>

              <button className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>

              <div className="lg:hidden w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.fullName?.charAt(0) || 'I'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8">
          {isPending ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-8 border-amber-100/50">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Compte en cours de validation</h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Bienvenue sur <span className="font-bold text-slate-700">EventTrust GN</span> ! Votre compte Institution a bien été créé. Notre équipe Super Admin vérifie actuellement vos informations d'accréditation.
              </p>
              <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Délai de traitement estimé</h4>
                  <p className="text-sm text-slate-500">24 à 48 heures ouvrées. Vous serez notifié par email.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

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
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 border border-slate-100 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                <LogOut className="w-8 h-8 text-red-500 relative z-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Se déconnecter ?</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2 px-2">
                Êtes-vous sûr de vouloir vous déconnecter de l'espace d'administration de votre institution ?
              </p>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg shadow-red-500/10 hover:shadow-red-500/25 transition-all cursor-pointer"
                >
                  Oui, me déconnecter
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/40"
                >
                  Rester connecté
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ==================== AI ASSISTANT WIDGET ==================== */}
      <AIAssistantWidget variant="institution" />
    </div>
  );
};

export default InstitutionLayout;

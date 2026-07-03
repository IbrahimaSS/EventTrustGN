import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarDays, ClipboardList, Award, 
  UserCircle, Settings, LogOut, ShieldCheck, Menu, X, Bell, Search, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import LogoP from '../../assets/LogoP.png';
import AIAssistantWidget from './AIAssistantWidget';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/participant/dashboard' },
  { label: 'Mes événements', icon: CalendarDays, path: '/participant/events' },
  { label: 'Inscriptions', icon: ClipboardList, path: '/participant/inscriptions' },
  { label: 'Mes badges', icon: Award, path: '/participant/badges' },
  { label: 'Profil', icon: UserCircle, path: '/participant/profile' },
  { label: 'Paramètres', icon: Settings, path: '/participant/settings' },
];

const ParticipantLayout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false);
    toast.success('Déconnexion réussie !');
    navigate('/login');
  };

  // Get current page title
  const currentPage = navItems.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentPage?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans">
      
      {/* ==================== SIDEBAR (Desktop) ==================== */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#0A1F44] min-h-screen fixed left-0 top-0 z-40">
        
        {/* Logo */}
        <div className="px-6 pt-7 pb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={LogoP} alt="EventTrust GN Logo" className="h-8" />
            <span className="text-xl font-extrabold text-white tracking-tight">
              EventTrust <span className="text-blue-400">GN</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-lg shadow-black/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="px-3 pb-6 mt-auto">
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.substring(0, 2).toUpperCase() || 'P'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user?.fullName || 'Participant'}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email || ''}</div>
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
          <aside className="absolute left-0 top-0 w-[280px] bg-[#0A1F44] min-h-full p-4 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8 px-2">
                <Link to="/" className="flex items-center gap-2">
                  <img src={LogoP} alt="EventTrust GN Logo" className="h-8" />
                  <span className="text-lg font-extrabold text-white">EventTrust <span className="text-blue-400">GN</span></span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="border-t border-white/10 pt-4 space-y-2 mt-auto">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.substring(0, 2).toUpperCase() || 'P'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.fullName || 'Participant'}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email || ''}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
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
      <div className="lg:ml-[260px]">
        
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
                <div className="text-xs text-slate-400 font-medium hidden sm:block">Bienvenue dans votre espace participant</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm rounded-xl transition-colors font-medium">
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Rechercher...</span>
              </button>
              
              {/* Notifications */}
              <button className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">3</span>
              </button>
              
              {/* User Avatar (Mobile) */}
              <div className="lg:hidden w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.substring(0, 2).toUpperCase() || 'P'
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Agent Widget */}
      <AIAssistantWidget />

      {/* ==================== LOGOUT CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div key="logout-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 border border-slate-100 p-6 text-center"
            >
              {/* Glowing Red Icon Box */}
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                <LogOut className="w-8 h-8 text-red-500 relative z-10" />
              </div>

              {/* Title & Info */}
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Se déconnecter ?</h3>
              <div className="text-xs text-slate-500 font-semibold leading-relaxed mt-2 px-2">
                Êtes-vous sûr de vouloir vous déconnecter de votre espace EventTrust GN ?
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-6">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg shadow-red-500/10 hover:shadow-red-500/25 transition-all cursor-pointer"
                >
                  Oui, me déconnecter
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/40"
                >
                  Rester connecté
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipantLayout;

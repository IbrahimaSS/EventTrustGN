import React, { useState } from 'react';
import { User, PlusCircle, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LogoP from '../../assets/LogoP.png';
import { useAuth } from '../../context/AuthContext';

import { useSettings } from '../../context/SettingsContext';

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const platformName = settings?.general?.platformName || 'EventTrust GN';
  const logoUrl = settings?.branding?.logoUrl || LogoP;
  const showLogoText = settings?.branding?.showLogoText !== false;

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'Super Admin') return '/admin/dashboard';
    if (user.role === 'Participant') return '/participant/dashboard';
    return '/institution/dashboard'; // Admin Institution & Responsable Communication
  };

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/events', label: 'Événements' },
    { to: '/institutions', label: 'Institutions' },
    { to: '/verify', label: 'Vérification' },
    { to: '/about', label: 'À propos' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0">
            <img src={logoUrl} alt={platformName} className="h-10 w-auto object-contain" />
            {showLogoText && (
              <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold text-secondary-500 tracking-tight">
                  {platformName}
                </span>
                <span className="text-[11px] text-text-secondary font-medium mt-0.5">
                  Événements institutionnels vérifiés
                </span>
              </div>
            )}
          </Link>

          {/* Center Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-600 bg-accent'
                    : 'text-text-secondary hover:text-primary-600 hover:bg-accent/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Mon Espace
                </Link>
                <button onClick={logout} className="flex items-center text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center text-text-secondary border border-border hover:bg-background px-4 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  <User className="h-4 w-4 mr-2" /> Connexion
                </Link>
                <Link to="/login" className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Publier un événement
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-text-secondary">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-border shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold ${
                  isActive(link.to) ? 'text-primary-600 bg-accent' : 'text-text-secondary hover:bg-background'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-border space-y-3">
              {user ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block w-full text-center bg-primary-50 text-primary-600 border border-primary-100 px-4 py-3 rounded-lg text-sm font-bold">
                    Mon Espace
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-center border border-border px-4 py-3 rounded-lg text-sm font-semibold text-slate-500">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center border border-border px-4 py-3 rounded-lg text-sm font-semibold text-text-secondary">
                    Connexion
                  </Link>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center bg-primary-600 text-white px-4 py-3 rounded-lg text-sm font-semibold">
                    Publier un événement
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

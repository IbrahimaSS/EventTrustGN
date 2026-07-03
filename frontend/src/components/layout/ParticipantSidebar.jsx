import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarDays, ClipboardList, Award, 
  UserCircle, Settings, LogOut, ShieldCheck
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/participant/dashboard' },
  { label: 'Mes événements', icon: CalendarDays, path: '/participant/events' },
  { label: 'Inscriptions', icon: ClipboardList, path: '/participant/inscriptions' },
  { label: 'Mes badges', icon: Award, path: '/participant/badges' },
  { label: 'Profil', icon: UserCircle, path: '/participant/profile' },
  { label: 'Paramètres', icon: Settings, path: '/participant/settings' },
];

const ParticipantSidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#0A1F44] min-h-screen fixed left-0 top-0 z-40">
      
      {/* Logo */}
      <div className="px-6 pt-7 pb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
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
                  ? 'bg-white/10 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 mt-auto">
        <div className="border-t border-white/10 pt-4">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ParticipantSidebar;

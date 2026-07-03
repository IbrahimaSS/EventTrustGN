import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';
import ParticipantLayout from './components/layout/ParticipantLayout';
import InstitutionLayout from './components/layout/InstitutionLayout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';

// Pages
import LandingPage from './pages/public/LandingPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import VerificationPage from './pages/public/VerificationPage';
import InstitutionsPage from './pages/public/InstitutionsPage';
import InstitutionDetailPage from './pages/public/InstitutionDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterParticipant from './pages/auth/RegisterParticipant';
import RegisterInstitution from './pages/auth/RegisterInstitution';

import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import ParticipantEvents from './pages/participant/ParticipantEvents';
import ParticipantEventDetails from './pages/participant/ParticipantEventDetails';
import ParticipantInscriptions from './pages/participant/ParticipantInscriptions';
import ParticipantBadges from './pages/participant/ParticipantBadges';
import ParticipantProfile from './pages/participant/ParticipantProfile';
import ParticipantSettings from './pages/participant/ParticipantSettings';

import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import InstitutionEvents from './pages/institution/InstitutionEvents';
import CreateEvent from './pages/institution/CreateEvent';
import InstitutionInscriptions from './pages/institution/InstitutionInscriptions';
import InstitutionParticipants from './pages/institution/InstitutionParticipants';
import InstitutionBadges from './pages/institution/InstitutionBadges';
import InstitutionScans from './pages/institution/InstitutionScans';
import InstitutionAnalytics from './pages/institution/InstitutionAnalytics';
import InstitutionSettings from './pages/institution/InstitutionSettings';

import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import SuperAdminInstitutions from './pages/admin/SuperAdminInstitutions';
import SuperAdminUsers from './pages/admin/SuperAdminUsers';
import SuperAdminEvents from './pages/admin/SuperAdminEvents';
import SuperAdminAnalytics from './pages/admin/SuperAdminAnalytics';
import SuperAdminSubscriptions from './pages/admin/SuperAdminSubscriptions';
import SuperAdminModeration from './pages/admin/SuperAdminModeration';
import SuperAdminSettings from './pages/admin/SuperAdminSettings';

import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

const PublicLayout = () => (
  <>
    <Navbar />
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  </>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

import { SettingsProvider } from './context/SettingsContext';

function App() {
  React.useEffect(() => {
    const handlePreferences = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('general'));
        if (stored) {
          // Apply theme
          if (stored.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          // Apply language
          if (stored.language) {
            document.documentElement.lang = stored.language;
            
            // Google Translate Integration
            const targetLang = stored.language === 'en' ? 'en' : 'fr';
            const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
            const currentCookieValue = currentCookie ? currentCookie.split('=')[1] : null;
            
            if (targetLang === 'en' && currentCookieValue !== '/fr/en') {
               document.cookie = `googtrans=/fr/en; path=/; domain=${window.location.hostname}`;
               document.cookie = `googtrans=/fr/en; path=/`;
               window.location.reload();
            } else if (targetLang === 'fr' && currentCookieValue === '/fr/en') {
               document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
               document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
               window.location.reload();
            }
          }
        }
      } catch (e) {
        // Ignore error
      }
    };

    handlePreferences();
    // Listen for storage changes from other tabs or same tab updates
    window.addEventListener('storage', handlePreferences);
    
    // Custom event for same-tab updates
    window.addEventListener('preferencesUpdated', handlePreferences);

    return () => {
      window.removeEventListener('storage', handlePreferences);
      window.removeEventListener('preferencesUpdated', handlePreferences);
    };
  }, []);

  return (
    <SettingsProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: '20px',
              padding: '16px',
              maxWidth: '500px',
              fontWeight: '500',
              borderRadius: '12px',
            },
            success: {
              style: {
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#ecfdf5',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes with Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/verify/event/:code" element={<VerificationPage type="event" />} />
            <Route path="/verify/badge/:code" element={<VerificationPage type="badge" />} />
            <Route path="/institutions" element={<InstitutionsPage />} />
            <Route path="/institutions/:slug" element={<InstitutionDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/participant" element={<RegisterParticipant />} />
            <Route path="/register/institution" element={<RegisterInstitution />} />
          </Route>

          {/* Participant Dashboard Routes */}
          <Route path="/participant" element={<ProtectedRoute allowedRoles={['Participant']}><ParticipantLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<ParticipantDashboard />} />
            <Route path="events" element={<ParticipantEvents />} />
            <Route path="events/:id" element={<ParticipantEventDetails />} />
            <Route path="inscriptions" element={<ParticipantInscriptions />} />
            <Route path="badges" element={<ParticipantBadges />} />
            <Route path="profile" element={<ParticipantProfile />} />
            <Route path="settings" element={<ParticipantSettings />} />
          </Route>

          {/* Institution Dashboard Routes */}
          <Route path="/institution" element={<ProtectedRoute allowedRoles={['Admin Institution', 'Super Admin']}><InstitutionLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<InstitutionDashboard />} />
            <Route path="events" element={<InstitutionEvents />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/edit/:id" element={<CreateEvent />} />
            <Route path="registrations" element={<InstitutionInscriptions />} />
            <Route path="participants" element={<InstitutionParticipants />} />
            <Route path="badges" element={<InstitutionBadges />} />
            <Route path="scans" element={<InstitutionScans />} />
            <Route path="analytics" element={<InstitutionAnalytics />} />
            <Route path="settings" element={<InstitutionSettings />} />
          </Route>

          {/* SuperAdmin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Super Admin']}><SuperAdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="institutions" element={<SuperAdminInstitutions />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="events" element={<SuperAdminEvents />} />
            <Route path="analytics" element={<SuperAdminAnalytics />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="moderation" element={<SuperAdminModeration />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="min-h-screen pt-24 flex items-center justify-center text-2xl font-bold text-slate-800">404 - Page Introuvable</div>} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;

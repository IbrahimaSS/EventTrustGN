import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CalendarDays, MapPin, Clock, Tag, User, 
  CheckCircle2, Download, ExternalLink, QrCode, Ticket
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ParticipantEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      // Fetch the event
      const eventRes = await api.get(`/events/${id}`);
      setEvent(eventRes.data);

      // Fetch my registrations to see if I am registered
      const regRes = await api.get('/registrations/me');
      const myRegistration = regRes.data.find(reg => reg.eventId._id === id || reg.eventId === id);
      if (myRegistration) {
        setRegistration(myRegistration);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des détails de l'événement.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const res = await api.post(`/registrations/event/${id}`);
      toast.success(res.data.message || 'Inscription réussie !');
      // Refresh the registration
      fetchEventDetails();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'inscription.';
      toast.error(errorMsg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Chargement des détails...</div>;
  }

  if (!event) {
    return <div className="p-12 text-center text-slate-500 font-medium">Événement introuvable.</div>;
  }

  const evtDate = new Date(event.startDate);
  const displayDate = evtDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const displayTime = event.startTime ? `${event.startTime} - ${event.endTime || 'Fin non spécifiée'}` : evtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      {/* Back Button */}
      <Link to="/participant/events" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour à mes événements
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Banner */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-[#0A1F44] to-[#0d6efd] relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 right-24 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
          
          <div className="absolute inset-0 bg-black/10"></div>
          {registration ? (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur rounded-lg shadow-sm flex items-center gap-2">
              {registration.status === 'accepted' ? (
                <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-sm font-bold text-slate-800">Inscription Confirmée</span></>
              ) : registration.status === 'pending' ? (
                <><Clock className="w-4 h-4 text-amber-500" /> <span className="text-sm font-bold text-slate-800">En attente</span></>
              ) : registration.status === 'payment_required' ? (
                <><Ticket className="w-4 h-4 text-blue-500" /> <span className="text-sm font-bold text-slate-800">Paiement requis</span></>
              ) : (
                <span className="text-sm font-bold text-slate-800">Inscription Refusée</span>
              )}
            </div>
          ) : null}
        </div>

        <div className="p-6 sm:p-8 relative">
          
          {/* Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-4 border-white rounded-xl shadow-md flex items-center justify-center text-xl font-black text-[#0d6efd] absolute -top-10 sm:-top-12 left-6 sm:left-8 overflow-hidden">
            {event.institutionId?.logoUrl ? (
              <img src={event.institutionId.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              event.institutionId?.name?.substring(0, 2).toUpperCase() || 'IN'
            )}
          </div>

          <div className="mt-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-blue-50 text-[#0d6efd] rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  {event.categoryId?.name || 'Divers'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{event.title}</h1>
                <p className="text-lg font-medium text-slate-600">{event.institutionId?.name || 'Institution'}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {!registration && (
                  <button 
                    onClick={handleRegister}
                    disabled={registering}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-colors disabled:opacity-70"
                  >
                    {registering ? 'Inscription...' : 'S\'inscrire maintenant'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-slate-100">
              
              {/* Left Column - Details */}
              <div className="md:col-span-2 space-y-8">
                
                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50/50 rounded-lg flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-[#0d6efd]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                      <p className="text-sm font-bold text-slate-900">{displayDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50/50 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-[#0d6efd]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Heure</p>
                      <p className="text-sm font-bold text-slate-900">{displayTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="w-10 h-10 bg-blue-50/50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#0d6efd]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lieu</p>
                      <p className="text-sm font-bold text-slate-900">{event.location}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">À propos de l'événement</h3>
                  <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {event.description || 'Aucune description disponible pour cet événement.'}
                  </p>
                </div>
              </div>

              {registration ? (
                <div className="space-y-4">
                  {/* Ticket Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
                    <div className="h-2 w-full bg-[#0d6efd]"></div>
                    
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <QrCode className="w-6 h-6 text-[#0d6efd]" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">Pass d'Accès</h4>
                      <p className="text-xs text-slate-500 mb-6 font-medium">Présentez ce code à l'entrée</p>
                      
                      <div className="bg-white p-3 rounded-xl border-2 border-slate-100 inline-block mb-6 shadow-sm">
                        <div className="w-32 h-32 flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-slate-900" />
                        </div>
                      </div>
                      
                      <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t-2 border-dashed border-slate-200"></div>
                        <div className="absolute w-4 h-4 bg-[#f1f5f9] rounded-full -left-8"></div>
                        <div className="absolute w-4 h-4 bg-[#f1f5f9] rounded-full -right-8"></div>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">N° d'inscription</p>
                        <p className="text-sm font-mono font-bold text-slate-800 bg-slate-50 py-1.5 px-3 rounded-lg inline-block border border-slate-100">{registration.registrationNumber || registration._id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  {registration.status === 'accepted' && (
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0d6efd] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                      <Download className="w-4 h-4" /> Télécharger (PDF)
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                  <Ticket className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Non Inscrit</h3>
                  <p className="text-sm text-slate-500 mb-6">Vous devez vous inscrire pour obtenir votre pass d'accès à cet événement.</p>
                  <button 
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A1F44] text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md transition-all disabled:opacity-70"
                  >
                    {registering ? 'Inscription...' : 'M\'inscrire à l\'événement'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantEventDetails;

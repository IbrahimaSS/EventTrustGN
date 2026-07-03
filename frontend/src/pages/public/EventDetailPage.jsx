import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Building2, ShieldCheck, Info, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
const EventDetailPage = () => {
  const { slug } = useParams();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/slug/${slug}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Erreur de récupération:", err);
        setError("Événement introuvable.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  if (isLoading) {
    return <div className="min-h-screen pt-24 pb-12 text-center text-slate-500 font-bold text-xl">Chargement des détails...</div>;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pt-24 pb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Oups !</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <Link to="/events" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold">Retour aux événements</Link>
      </div>
    );
  }

  const isPaid = event.registrationType === 'paid';
  const priceDisplay = isPaid ? `${event.price} ${event.currency || 'GNF'}` : 'Gratuit';
  const currentP = event.participants || 0;
  const maxP = event.maxParticipants || 0;
  const spotsLeft = maxP > 0 ? maxP - currentP : 'Illimité';
  const eventType = event.categoryId?.name || 'Événement';
  const isFull = maxP > 0 && currentP >= maxP;

  const handleRegister = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour vous inscrire.");
      navigate('/login');
      return;
    }
    if (user.role !== 'Participant') {
      toast.error("Seuls les participants peuvent s'inscrire aux événements.");
      return;
    }

    setIsRegistering(true);
    try {
      const res = await api.post(`/registrations/event/${event._id}`);
      toast.success(res.data.message || "Inscription réussie !");
      // Mettre à jour virtuellement les places
      setEvent(prev => ({ ...prev, participants: prev.participants + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/events" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux événements
        </Link>

        {/* Official Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-3xl p-4 flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="h-6 w-6 mr-2" />
          <span className="font-semibold">Publication Officielle Vérifiée</span>
          <span className="mx-4 opacity-50">|</span>
          <span className="font-mono bg-white/20 px-2 py-1 rounded text-sm">{event.publicationCode}</span>
        </div>

        <div className="bg-white rounded-b-3xl shadow-sm border border-t-0 border-slate-100 p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Left Content */}
            <div className="flex-1">
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="w-full h-auto rounded-2xl mb-8 shadow-md" />
              )}
              <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                {eventType}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                {event.title}
              </h1>
              
              <div className="flex items-center text-slate-700 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Building2 className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <div className="font-semibold">{event.institutionId?.name}</div>
                  {event.institutionId?.isVerified && (
                    <div className="text-sm text-emerald-600 flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1" /> Institution Certifiée
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">À propos de l'événement</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description || "Aucune description fournie."}</p>
              </div>

              {event.conditions && (
                <div className="prose prose-slate max-w-none mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Conditions spécifiques</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.conditions}</p>
                </div>
              )}

              {event.requiredDocuments && event.requiredDocuments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Documents requis</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    {event.requiredDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Map Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-primary-600" />
                  Localisation exacte
                </h3>
                <div className="w-full h-[350px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((event.location ? event.location + ', ' : '') + (event.city || 'Guinée'))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    title="Google Map"
                    className="w-full h-full"
                  ></iframe>
                </div>
                <p className="mt-3 text-sm text-slate-500 font-medium px-1 flex items-center">
                  <Info className="h-4 w-4 mr-1.5 shrink-0" />
                  Le point sur la carte indique la zone approximative ou exacte de l'événement.
                </p>
              </div>
            </div>

            {/* Right Sidebar (Info Card) */}
            <div className="md:w-80">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 sticky top-28">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">Informations Pratiques</h3>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center shrink-0 mr-4">
                      <Calendar className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 font-medium">Date & Heure</div>
                      <div className="font-semibold text-slate-900">{event.startDate ? new Date(event.startDate).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                      {(event.startTime || event.endTime) && (
                        <div className="text-slate-600 text-sm">
                          {event.startTime ? event.startTime : ''} {event.endTime ? `- ${event.endTime}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-4">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 font-medium">Lieu</div>
                      <div className="font-semibold text-slate-900">{event.location || event.city || 'Non défini'}</div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 mr-4">
                      <Info className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 font-medium">Tarif</div>
                      <div className="font-semibold text-slate-900">{priceDisplay}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="text-center mb-4">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isFull ? 'text-red-600 bg-red-50' : 'text-primary-600 bg-primary-50'}`}>
                      {isFull ? 'Complet' : (maxP > 0 ? `${spotsLeft} places restantes` : 'Accès libre')}
                    </span>
                  </div>
                  <button 
                    disabled={isFull || isRegistering}
                    onClick={handleRegister}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center ${
                      isFull || isRegistering ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isRegistering ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Inscription en cours...</>
                    ) : isFull ? 'Inscriptions closes' : 'S\'inscrire maintenant'}
                  </button>
                  <div className="mt-4 text-center text-xs text-slate-500 flex justify-center items-center">
                    <QrCode className="h-4 w-4 mr-1" /> Badge numérique inclus
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;

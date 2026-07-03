import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, QrCode, Calendar, Clock, MapPin,
  Building2, Users, CheckCircle2, ChevronRight, GraduationCap,
  BookOpen, Trophy, Medal, Mic, CheckCircle,
  FileCheck, History, Lock, Quote, Building
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LogoP from '../../assets/LogoP.png';
import HeroImage from '../../assets/HeroImageCommunity.png';
import EventForum from '../../assets/event_forum.png';
import EventConcours from '../../assets/event_concours.png';
import EventBootcamp from '../../assets/event_bootcamp.png';
import EventTournoi from '../../assets/event_tournoi.png';
import AIAssistantWidget from '../../components/layout/AIAssistantWidget';

const LandingPage = () => {
  const navigate = useNavigate();

  // State for fetched events
  const [latestEvents, setLatestEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Hero Carousel Logic
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const heroImages = [HeroImage, EventForum, EventConcours, EventBootcamp];

  useEffect(() => {
    // Fetch latest events
    const fetchLatestEvents = async () => {
      try {
        const res = await api.get('/events');
        setLatestEvents(res.data.slice(0, 4)); // Get the top 4 events
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchLatestEvents();

    // Carousel timer
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-500 selection:text-white pb-0">

      {/* Hero Section */}
      <section className="relative pt-[72px] overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50">
        <div className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">

            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-4xl lg:text-[44px] font-serif text-slate-800 tracking-tight mb-6 leading-[1.15]"
              >
                Publiez, vérifiez et participez aux événements officiels <span className="text-primary-600">en toute confiance.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Créez votre événement, générez des tickets QR Code, et contrôlez vos entrées en temps réel.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              >
                <Link to="/events" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-lg font-bold transition-all shadow-md flex items-center justify-center">
                  <Calendar className="h-5 w-5 mr-2" /> Découvrir les événements
                </Link>
                <Link to="/register?type=institution" className="w-full sm:w-auto bg-white border-2 border-primary-100 text-primary-700 hover:border-primary-200 px-6 py-3.5 rounded-lg font-bold transition-all flex items-center justify-center">
                  <Building2 className="h-5 w-5 mr-2" /> Créer un espace institutionnel
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 text-sm font-semibold text-slate-500"
              >
                <div className="flex items-center"><QrCode className="h-4 w-4 mr-1.5 text-slate-400" /> QR Code</div>
                <div className="flex items-center"><Clock className="h-4 w-4 mr-1.5 text-slate-400" /> Horodatage</div>
                <div className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-1.5 text-slate-400" /> Inscriptions</div>
                <div className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1.5 text-slate-400" /> Badges numériques</div>
              </motion.div>
            </div>

            {/* Right Mockup (Community + UI Overlay) */}
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none hidden md:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Decorative blob behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-blue-200/40 rounded-full blur-[80px] -z-10"></div>

                {/* Community Photo with elegant frame (Carousel) */}
                <div className="relative z-10 w-full aspect-[4/3] lg:aspect-[5/4] rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-hidden border-8 border-white bg-slate-100">
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={currentHeroImage}
                      src={heroImages[currentHeroImage]}
                      alt="EventTrust GN Community"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Floating UI Badge overlaying the photo */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
                    className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2.5 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-0.5">Vérification QR Code</p>
                        <p className="text-[15px] font-bold text-slate-900">Accès Autorisé</p>
                      </div>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <QrCode className="h-7 w-7 text-slate-400" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">250</div>
              <div className="text-sm font-medium text-slate-500">Institutions</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">55</div>
              <div className="text-sm font-medium text-slate-500">Événements publiés</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">520</div>
              <div className="text-sm font-medium text-slate-500">Inscriptions</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">98%</div>
              <div className="text-sm font-medium text-slate-500">Taux de confiance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories d'événements */}
      <section className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-3">Catégories d'<span className="text-primary-600">événements</span></h2>
          <p className="text-slate-500 font-medium">Une seule plateforme pour centraliser les annonces officielles.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <GraduationCap className="h-10 w-10 text-blue-500 mb-3" />
            <span className="font-bold text-slate-800 text-sm">Soutenances</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <BookOpen className="h-10 w-10 text-green-500 mb-3" />
            <span className="font-bold text-slate-800 text-sm">Formations</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <Users className="h-10 w-10 text-purple-500 mb-3" />
            <span className="font-bold text-slate-800 text-sm">Forums</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <Trophy className="h-10 w-10 text-yellow-500 mb-3" />
            <span className="font-bold text-slate-800 text-sm">Concours</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <Medal className="h-10 w-10 text-red-500 mb-3" />
            <span className="font-bold text-slate-800 text-sm">Compétitions</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <Mic className="h-10 w-10 text-teal-500 mb-3" />
            <span className="font-bold text-slate-800 text-sm">Conférences</span>
          </div>
        </div>
      </section>

      {/* Comment ça marche ? */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-4">Comment ça <span className="text-primary-600">marche ?</span></h2>
            <p className="text-slate-500 max-w-xl mx-auto">Un processus simple en 4 étapes pour publier, gérer et vérifier vos événements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Ligne de connexion (Desktop) */}
            <div className="hidden lg:block absolute top-16 left-[15%] right-[15%] h-[3px] bg-gradient-to-r from-primary-200 via-emerald-200 via-purple-200 to-orange-200 z-0 rounded-full"></div>

            {/* Étape 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative z-10 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300 shrink-0">
                  <Building2 className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ring-4 ring-primary-100">1</div>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">L'institution crée son espace</h3>
              <p className="text-sm text-slate-500 leading-relaxed">L'institution s'inscrit sur la plateforme et crée son espace officiel vérifié.</p>
            </motion.div>

            {/* Étape 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative z-10 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300 shrink-0">
                  <Calendar className="h-7 w-7 text-emerald-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ring-4 ring-emerald-100">2</div>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Elle publie un événement horodaté</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Chaque publication est automatiquement horodatée et sécurisée par la plateforme.</p>
            </motion.div>

            {/* Étape 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative z-10 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-300 shrink-0">
                  <Users className="h-7 w-7 text-purple-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="w-9 h-9 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ring-4 ring-purple-100">3</div>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Le public consulte et s'inscrit</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Les utilisateurs découvrent les événements vérifiés et s'inscrivent en un clic.</p>
            </motion.div>

            {/* Étape 4 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative z-10 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300 shrink-0">
                  <QrCode className="h-7 w-7 text-orange-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ring-4 ring-orange-100">4</div>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Le QR Code permet la vérification</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Le QR Code garantit l'authenticité de l'événement à tout moment.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Événements à la une */}
      <section className="py-20 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">Événements à <span className="text-primary-600">la une</span></h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingEvents ? (
            <div className="col-span-4 text-center py-10 text-slate-500">Chargement des événements...</div>
          ) : latestEvents.length === 0 ? (
            <div className="col-span-4 text-center py-10 text-slate-500">Aucun événement à la une pour le moment.</div>
          ) : (
            latestEvents.map((event) => {
              const isPaid = event.registrationType === 'paid';
              return (
                <motion.div
                  key={event._id}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group cursor-pointer"
                >
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img
                      src={event.imageUrl || EventForum}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md ${isPaid ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                      {isPaid ? 'Payant' : 'Gratuit'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight group-hover:text-primary-600 transition-colors duration-300 line-clamp-2" title={event.title}>
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2 truncate" title={event.institutionId?.name}>
                      {event.institutionId?.name || 'Institution inconnue'}
                    </p>
                    <div className="flex items-center text-xs font-semibold text-slate-700 bg-slate-100 w-fit px-2 py-1 rounded mb-4">
                      <Users className="h-3 w-3 mr-1.5 text-slate-500" /> {event.participants || 0} / {event.maxParticipants || '∞'} places
                    </div>
                    <div className="flex items-center text-xs text-slate-600 mb-6 space-x-4">
                      <span className="flex items-center truncate max-w-[50%]"><Calendar className="h-3 w-3 mr-1 shrink-0" /> {new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
                      <span className="flex items-center truncate max-w-[50%]"><MapPin className="h-3 w-3 mr-1 shrink-0" /> {event.city || 'Non défini'}</span>
                    </div>
                    <button className="mt-auto w-full bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-lg flex justify-center items-center hover:bg-primary-700 transition-colors group-hover:shadow-md">
                      Voir le détail <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Verification Box */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 flex flex-col md:flex-row items-center gap-8">

            <div className="flex-1 border-r border-slate-100 pr-0 md:pr-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="h-20 w-20 text-slate-800" />
              </div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Vérifier une invitation ou un badge</h3>
                <p className="text-sm text-slate-500 mb-4">Scannez le QR Code ou saisissez le code unique pour consulter la version officielle.</p>
                <div className="text-sm font-medium text-slate-700 mb-2">Ou saisissez le code unique</div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ex: EVT-2026-00452" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500" />
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold">Vérifier</button>
                </div>
              </div>
            </div>

            <div className="flex-1 pl-0 md:pl-4 w-full">
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-500 text-white rounded-full p-1"><CheckCircle className="h-5 w-5" /></div>
                  <h4 className="text-lg font-bold text-emerald-800">Publication authentique</h4>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                    <span className="text-slate-500">Institution</span>
                    <span className="font-semibold text-slate-900 text-right">Université de Conakry</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                    <span className="text-slate-500">Événement</span>
                    <span className="font-semibold text-slate-900 text-right">Forum de l'Innovation Numérique 2026</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                    <span className="text-slate-500">Date de publication</span>
                    <span className="font-semibold text-slate-900 text-right">20 Mai 2026 à 10:32</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Statut</span>
                    <span className="bg-emerald-200 text-emerald-800 px-3 py-0.5 rounded-full font-bold text-xs">Valide</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pourquoi choisir EventTrust GN */}
      <section className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">Pourquoi choisir <span className="text-primary-600">EventTrust GN ?</span></h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-0">
            <ShieldCheck className="h-10 w-10 text-primary-600 lg:mb-4 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Publication officielle</h3>
              <p className="text-sm text-slate-500">Chaque événement est publié depuis un espace institutionnel vérifié.</p>
            </div>
          </div>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-0">
            <History className="h-10 w-10 text-emerald-600 lg:mb-4 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Traçabilité complète</h3>
              <p className="text-sm text-slate-500">Horodatage, historique est suivi de chaque action en toute transparence.</p>
            </div>
          </div>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-0">
            <FileCheck className="h-10 w-10 text-purple-600 lg:mb-4 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Badges numériques</h3>
              <p className="text-sm text-slate-500">Générez des badges uniques avec QR Code pour chaque participant.</p>
            </div>
          </div>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-0">
            <Lock className="h-10 w-10 text-orange-600 lg:mb-4 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Archivage sécurisé</h3>
              <p className="text-sm text-slate-500">Vos événements sont archivés et protégés dans le temps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-4">Une tarification simple et <span className="text-primary-600">transparente</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Pas de surprises cachées. Commencez gratuitement et évoluez avec vos besoins.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Gratuit */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl">Recommandé au lancement</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gratuit</h3>
              <p className="text-slate-500 text-sm mb-6">Pour les institutions qui démarrent et veulent tester.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">0 FG</span>
                <span className="text-slate-500 font-medium"> / pour toujours</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0" /> <span className="text-sm text-slate-700">Création d'espace institutionnel</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0" /> <span className="text-sm text-slate-700">Publication d'événements illimitée</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0" /> <span className="text-sm text-slate-700">Inscriptions et gestion de base</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0" /> <span className="text-sm text-slate-700">Génération de QR Codes standards</span></li>
              </ul>
              <Link to="/register?type=institution" className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center">
                Créer un compte gratuit
              </Link>
            </div>

            {/* Plan Premium */}
            <div className="bg-secondary-500 rounded-3xl p-8 border border-slate-800 shadow-lg text-white">
              <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
              <p className="text-blue-200 text-sm mb-6">Pour les besoins avancés et un accompagnement sur mesure.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">Sur devis</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary-400 mr-3 shrink-0" /> <span className="text-sm text-blue-100">Tout ce qui est dans le plan Gratuit</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary-400 mr-3 shrink-0" /> <span className="text-sm text-blue-100">QR Codes personnalisés avec votre logo</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary-400 mr-3 shrink-0" /> <span className="text-sm text-blue-100">Export avancé des données (PDF/Excel)</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary-400 mr-3 shrink-0" /> <span className="text-sm text-blue-100">Support prioritaire et Intégration API</span></li>
              </ul>
              <Link to="/contact" className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors border border-white/20 flex items-center justify-center">
                Contacter l'équipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ils peuvent l'utiliser + Testimonial */}
      <section className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-8 text-center lg:text-left">Ils peuvent l'<span className="text-primary-600">utiliser</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Université</span>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight px-1">Gérez vos soutenances et cérémonies</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <span className="font-semibold text-sm text-slate-800">ONG</span>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight px-1">Organisez vos forums et ateliers publics</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Entreprise</span>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight px-1">Planifiez vos séminaires internes</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Centre de<br />formation</span>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight px-1">Certifiez vos sessions de formation</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <Quote className="h-10 w-10 text-slate-300 mb-4" />
            <p className="text-lg text-slate-700 italic font-medium mb-6">
              « EventTrust GN nous permet de publier nos événements officiels et de gagner la confiance de notre communauté. La vérification par QR Code est un vrai plus. »
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-300 rounded-full mr-4"></div>
              <div>
                <div className="font-bold text-slate-900">Mariama Camara</div>
                <div className="text-sm text-slate-500">Responsable Communication<br />Université de Conakry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-secondary-500 rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="flex items-center mb-8 md:mb-0 relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mr-6 shrink-0 border border-white/20">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Prêt à centraliser vos annonces officielles ?</h2>
              <p className="text-blue-200">Créez votre espace institutionnel et publiez vos événements avec confiance.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <button className="bg-white text-primary-900 font-bold px-6 py-3 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
              Commencer maintenant <ChevronRight className="h-5 w-5 ml-1" />
            </button>
            <button className="bg-transparent border border-white/40 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-white border-b-4 border-b-transparent mr-2"></span>
              Voir une démo
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-secondary-500 text-blue-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8 border-b border-white/10 pb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                  <img src={LogoP} alt="Logo" className="h-8 w-auto" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    EventTrust <span className="text-blue-300">GN</span>
                  </span>
                </div>
              </div>
              <p className="text-sm max-w-sm">Plateforme institutionnelle de publication, inscription et vérification des événements.</p>
              <div className="flex space-x-4 mt-4">
                {/* Social icons placeholder */}
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-600 cursor-pointer text-xs">fb</div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-600 cursor-pointer text-xs">in</div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-600 cursor-pointer text-xs">tw</div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary-600 cursor-pointer text-xs">yt</div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Démo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs">
            © 2026 EventTrust GN — Tous droits réservés
          </div>
        </div>
      </footer>

      {/* ==================== AI ASSISTANT WIDGET ==================== */}
      <AIAssistantWidget variant="public" />
    </div>
  );
};

export default LandingPage;

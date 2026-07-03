import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, ShieldCheck, Mail, Phone, Globe, Calendar, ArrowLeft, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const InstitutionDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/institutions/${slug}`);
        setInstitution(res.data);
      } catch (err) {
        setError("Impossible de charger les informations de l'institution.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstitution();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{error || "Institution introuvable"}</h2>
        <button onClick={() => navigate('/institutions')} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold">Retour aux institutions</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/institutions')}
          className="flex items-center text-slate-500 hover:text-primary-600 font-medium mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour aux institutions
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-primary-900 to-primary-700 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
                {institution.logoUrl ? (
                  <img src={institution.logoUrl} alt={`Logo ${institution.name}`} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center text-4xl font-bold">
                    {institution.acronym || institution.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-extrabold text-slate-900">{institution.name}</h1>
                  {institution.isVerified && (
                    <ShieldCheck className="h-7 w-7 text-emerald-500" title="Institution certifiée" />
                  )}
                </div>
                <div className="text-lg font-semibold text-slate-500">
                  {institution.acronym} • {institution.type}
                </div>
              </div>
            </div>

            <p className="text-slate-600 max-w-3xl text-lg leading-relaxed mb-8">
              {institution.description || "Aucune description fournie pour le moment."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center text-slate-600">
                <MapPin className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm">{institution.city || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Globe className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                {institution.websiteUrl ? (
                  <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary-600 transition-colors truncate">Site Web</a>
                ) : (
                  <span className="text-sm">Non renseigné</span>
                )}
              </div>
              <div className="flex items-center text-slate-600">
                <Phone className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-sm">{institution.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Mail className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                {institution.email ? (
                  <a href={`mailto:${institution.email}`} className="text-sm hover:text-primary-600 transition-colors truncate">{institution.email}</a>
                ) : (
                  <span className="text-sm">Non renseigné</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          
          {/* Events Section */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Calendar className="mr-3 h-6 w-6 text-primary-600" /> 
              Événements Officiels ({institution.events?.length || 0})
            </h2>

            {institution.events && institution.events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institution.events.map((event, index) => (
                  <motion.div 
                    key={event._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-xs font-bold">
                        {event.type}
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${event.registrationType === 'paid' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {event.registrationType === 'paid' ? 'Payant' : 'Gratuit'}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 flex-1">
                      <Link to={`/events/${event.slug}`} className="hover:text-primary-600 transition-colors">
                        {event.title}
                      </Link>
                    </h3>
                    <div className="text-sm text-slate-500 mb-4 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    </div>
                    <Link to={`/events/${event.slug}`} className="text-primary-600 text-sm font-semibold hover:text-primary-800 transition-colors">
                      Voir les détails &rarr;
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Aucun événement publié pour le moment.</p>
              </div>
            )}
          </section>

          {/* Location & Map Section */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Map className="mr-3 h-6 w-6 text-primary-600" />
              Localisation & Accès
            </h2>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              <div className="p-8 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-primary-100">
                  <MapPin className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Adresse Principale</h3>
                <p className="text-slate-700 text-lg mb-1 font-medium">{institution.address || 'Non renseigné'}</p>
                <p className="text-slate-500">{institution.city}</p>
                {institution.phone && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-2">Besoin d'aide pour trouver ?</p>
                    <a href={`tel:${institution.phone.replace(/\s+/g, '')}`} className="inline-flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors">
                      <Phone className="h-4 w-4 mr-2" /> Appeler l'accueil
                    </a>
                  </div>
                )}
              </div>
              
              <div className="md:w-2/3 h-80 md:h-auto min-h-[400px] relative bg-slate-100">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent((institution.address ? institution.address + ', ' : '') + institution.city + ' Guinée')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Carte de localisation de ${institution.name}`}
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default InstitutionDetailPage;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, MapPin, ShieldCheck, Filter, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Logos
import LogoISAVF from '../../assets/logos/ISAVF.jpg';
import LogoLabe from '../../assets/logos/Labé.png';
import LogoIST from '../../assets/logos/LogIST.jpg';
import LogoMCI from '../../assets/logos/MCI.jpg';
import LogoMEPFP from '../../assets/logos/MEPFP.png';
import LogoUGANC from '../../assets/logos/UGANC.png';
import LogoUJNK from '../../assets/logos/UJNK.jpg';
import LogoUKAG from '../../assets/logos/UKAG.png';
import LogoUKindia from '../../assets/logos/UKindia.png';

const InstitutionsPage = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        // Fetch from API instead of mock
        const res = await api.get('/institutions');
        setInstitutions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  const filteredInstitutions = institutions.filter(inst => {
    const matchSearch = searchTerm === '' || 
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.acronym && inst.acronym.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inst.city && inst.city.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchType = selectedType === '' || inst.type === selectedType;
    const matchCity = selectedCity === '' || inst.city === selectedCity;

    return matchSearch && matchType && matchCity;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white pb-12">
      
      {/* Premium Header */}
      <section className="relative pt-[72px] pb-12 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white border-b border-slate-200">
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-[44px] font-serif font-bold text-slate-900 tracking-tight mb-4 leading-[1.15]"
          >
            Institutions <span className="text-primary-600">Partenaires</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Découvrez les universités, ministères, ONG et entreprises qui utilisent EventTrust GN pour sécuriser leurs publications officielles.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Search & Filters (Lifted up to overlap header) */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-12 flex flex-col gap-4 relative">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une institution (nom, sigle, ville)..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-slate-700"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-6 py-3.5 border rounded-xl font-semibold transition-colors ${
                  isFilterOpen ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" /> Filtres
              </button>
            </div>
          </div>
          
          {/* Expanded Filters Section */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-slate-100 mt-2"
              >
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type d'institution</label>
                    <select 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 font-medium"
                    >
                      <option value="">Tous les types</option>
                      <option value="Université">Université</option>
                      <option value="Institut">Institut</option>
                      <option value="Ministère">Ministère</option>
                      <option value="Entreprise">Entreprise</option>
                      <option value="ONG / Association">ONG / Association</option>
                    </select>
                  </div>
                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Ville</label>
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 font-medium"
                    >
                      <option value="">Toutes les villes</option>
                      <option value="Conakry">Conakry</option>
                      <option value="Kindia">Kindia</option>
                      <option value="Kankan">Kankan</option>
                      <option value="Labé">Labé</option>
                      <option value="Mamou">Mamou</option>
                      <option value="Faranah">Faranah</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Institutions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInstitutions.length > 0 ? (
            filteredInstitutions.map((inst, index) => (
              <motion.div 
                key={inst._id}
                onClick={() => navigate(`/institutions/${inst.eventTrustPageSlug || inst._id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                {inst.logoUrl ? (
                  <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm">
                    <img src={inst.logoUrl} alt={`Logo ${inst.name}`} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-bold text-xl bg-blue-50 text-blue-600 border-blue-100`}>
                    {inst.acronym || inst.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                {inst.isVerified && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full flex items-center shadow-sm">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Vérifié</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                {inst.name}
              </h3>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center text-slate-600 text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                  {inst.city || 'Non renseigné'}
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                  <Building2 className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                  {inst.type || 'Institution'}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg font-semibold border border-slate-100">
                  <span className="text-primary-600 font-bold">{inst.eventsCount}</span> événements
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-colors border border-slate-100 group-hover:border-primary-600">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune institution trouvée</h3>
              <p className="text-slate-500">Essayez de modifier vos critères de recherche ou vos filtres.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedType(''); setSelectedCity(''); }}
                className="mt-6 text-primary-600 font-bold hover:underline"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {filteredInstitutions.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400 cursor-not-allowed">
                &lt;
              </button>
              <button className="w-10 h-10 rounded-lg bg-primary-600 text-white font-bold flex items-center justify-center shadow-md">
                1
              </button>
              <button className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                &gt;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstitutionsPage;

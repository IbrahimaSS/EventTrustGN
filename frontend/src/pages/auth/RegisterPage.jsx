import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, ChevronRight, Home } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center py-20 px-4 relative">
      
      {/* Header - Positioned absolutely at top so it's never hidden */}
      <div className="absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-10 max-w-7xl mx-auto right-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            EventTrust <span className="text-blue-600">GN</span>
          </span>
        </Link>
        <Link to="/" className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md">
          <Home className="h-4 w-4 mr-2" /> Retour à l'accueil
        </Link>
      </div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-14 mt-8"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Inscription</h1>
          <p className="text-slate-500 font-medium mb-1">Quel type de compte souhaitez-vous créer ?</p>
          <p className="text-sm text-slate-400">Choisissez l'option qui correspond à votre profil pour continuer.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Participant Card */}
          <div 
            onClick={() => navigate('/register/participant')}
            className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col hover:border-blue-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
              <User className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center group-hover:text-blue-700 transition-colors">Participant</h3>
            <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed flex-grow">
              Je veux participer à des événements, m'inscrire et recevoir mes badges.
            </p>
            <button className="mt-auto w-full flex items-center justify-between bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md group-hover:shadow-lg">
              <span className="flex-1 text-center">Créer un compte participant</span>
              <ChevronRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Institution Card */}
          <div 
            onClick={() => navigate('/register/institution')}
            className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col hover:border-blue-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
              <Building2 className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center group-hover:text-blue-700 transition-colors">Institution</h3>
            <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed flex-grow">
              Je représente une institution ou une organisation et je veux publier des événements.
            </p>
            <button className="mt-auto w-full flex items-center justify-between bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md group-hover:shadow-lg">
              <span className="flex-1 text-center">Créer un espace institutionnel</span>
              <ChevronRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-slate-500 text-sm">
            Déjà un compte ? <Link to="/login" className="font-bold text-[#0d6efd] hover:text-blue-800 transition-colors hover:underline">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

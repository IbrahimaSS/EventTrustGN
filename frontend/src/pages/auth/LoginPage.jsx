import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight, CheckCircle2, QrCode, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Appel à la fonction de connexion (qui contacte le backend)
      const user = await login(formData.email, formData.password);
      toast.success('Connexion réussie !');
      
      // Redirection dynamique selon le rôle renvoyé par le backend
      if (user.role === 'Super Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Admin Institution') {
        navigate('/institution/dashboard');
      } else {
        navigate('/participant/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Identifiants invalides ou erreur serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white flex pt-[72px]">
      
      {/* Left Panel - Branding & Info (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-secondary-900 z-0"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary-600/20 rounded-full blur-[120px] z-0"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-secondary-600/20 rounded-full blur-[120px] z-0"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <div className="flex flex-col leading-none mb-12">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                EventTrust <span className="text-blue-400">GN</span>
              </span>
            </div>
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">
              Bienvenue sur votre espace de confiance.
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Connectez-vous pour gérer vos événements officiels, suivre vos inscriptions et générer des badges sécurisés.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <ShieldCheck className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Sécurité maximale</h3>
            <p className="text-sm text-slate-300">Vos données et événements sont cryptés et protégés.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <QrCode className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-white font-bold mb-2">Technologie QR</h3>
            <p className="text-sm text-slate-300">Authentification instantanée via notre système natif.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="absolute top-8 left-6 lg:hidden">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              EventTrust <span className="text-primary-600">GN</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Connexion</h2>
              <p className="text-slate-500">Accédez à votre tableau de bord EventTrust GN.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Adresse Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="exemple@institution.gn" 
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-slate-700 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                  <a href="#" className="text-xs font-bold text-primary-600 hover:text-primary-700">Mot de passe oublié ?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-slate-700 shadow-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center mt-4 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'}`}
              >
                {isLoading ? 'Connexion en cours...' : (
                  <>Se connecter <ChevronRight className="h-5 w-5 ml-2" /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200 text-center">
              <p className="text-slate-600">
                Vous n'avez pas encore de compte ?{' '}
                <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Créer un compte
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

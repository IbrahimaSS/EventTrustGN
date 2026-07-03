import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, ChevronRight, ChevronLeft,
  CheckCircle2, Eye, EyeOff, Home, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import EventConcours from '../../assets/event_concours.png';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RegisterParticipant = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const steps = [
    { num: 1, label: 'Informations' },
    { num: 2, label: 'Vérification' },
    { num: 3, label: 'Confirmation' },
  ];

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleStep1Submit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      return toast.error("Veuillez remplir tous les champs");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }
    if (!acceptTerms) {
      return toast.error("Veuillez accepter les conditions d'utilisation");
    }
    
    setIsSendingOtp(true);
    try {
      await api.post('/otp/send', { contact: formData.email, purpose: 'registration' });
      toast.success('Code envoyé sur votre adresse email !');
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du code OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegistration = async () => {
    const code = otpValues.join('');
    if (code.length !== 6) {
      return toast.error("Veuillez entrer le code à 6 chiffres");
    }

    setIsLoading(true);
    try {
      // 1. Vérifier le code
      await api.post('/otp/verify', { contact: formData.email, code, purpose: 'registration' });
      
      // 2. Si c'est bon, on crée le compte
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      toast.success('Inscription réussie !');
      setCurrentStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Code invalide ou erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pt-24 pb-12 px-4 sm:px-8">
      
      {/* Header / Top Navigation */}
      <div className="absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            EventTrust <span className="text-blue-600">GN</span>
          </span>
        </Link>
        <Link to="/register" className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md">
           Retour au choix
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* Horizontal Stepper */}
        <div className="mb-10 w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {/* Steps */}
            {steps.map((step, i) => (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                  currentStep > step.num ? 'bg-emerald-500 text-white scale-100' :
                  currentStep === step.num ? 'bg-blue-600 text-white scale-110 shadow-blue-200 shadow-lg' : 
                  'bg-white text-slate-400 border-2 border-slate-200'
                }`}>
                  {currentStep > step.num ? <CheckCircle2 className="h-5 w-5" /> : step.num}
                </div>
                <p className={`absolute -bottom-7 text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentStep >= step.num ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Split Container */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
          
          {/* Left Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col relative bg-white z-10">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Créer un compte</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">Rejoignez la communauté EventTrust GN.</p>

                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Nom complet</label>
                      <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Entrez votre nom complet" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="exemple@email.com" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Numéro de téléphone</label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shrink-0">
                          🇬🇳 +224
                        </div>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="620 12 34 56" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Mot de passe" className="w-full px-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Confirmer</label>
                        <div className="relative">
                          <input type={showConfirm ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirmer" className="w-full px-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer mt-4">
                      <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <span className="text-sm text-slate-600 font-medium">J'accepte les <a href="#" className="text-blue-600 font-bold hover:underline">conditions d'utilisation</a></span>
                    </label>

                    <button 
                      onClick={handleStep1Submit}
                      disabled={isSendingOtp}
                      className={`w-full mt-6 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center group ${isSendingOtp ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0d6efd] hover:bg-blue-700 hover:shadow-lg'}`}
                    >
                      {isSendingOtp ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Envoi du code...</> : <><ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /> Continuer</>}
                    </button>
                  </div>

                  <div className="mt-8 pt-6 text-center">
                    <p className="text-slate-500 text-sm font-medium">Déjà un compte ? <Link to="/login" className="font-bold text-blue-600 hover:underline">Se connecter</Link></p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col justify-center">
                  <button onClick={() => setCurrentStep(1)} className="text-slate-400 hover:text-slate-600 mb-8 flex items-center text-sm font-medium self-start bg-slate-50 px-3 py-1.5 rounded-lg">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Revenir
                  </button>

                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Phone className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Vérification OTP</h2>
                    <p className="text-slate-500">Code envoyé par email à <span className="font-bold text-slate-700">{formData.email}</span></p>
                  </div>

                  <div className="flex justify-center gap-3 mb-8">
                    {otpValues.map((val, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="w-14 h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    ))}
                  </div>

                  <button 
                    onClick={handleRegistration}
                    disabled={isLoading}
                    className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0d6efd] hover:bg-blue-700'}`}
                  >
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Création du compte...</> : 'Valider le numéro'}
                  </button>

                  <p className="text-center text-sm text-slate-500 mt-6">
                    Vous n'avez rien reçu ? <button className="text-blue-600 font-bold hover:underline">Renvoyer (45s)</button>
                  </p>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Compte créé avec succès !</h2>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Félicitations ! Votre compte participant a été créé. Vous pouvez maintenant découvrir les événements certifiés et obtenir vos badges.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <Link to="/" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm text-center">
                      Retourner à l'accueil
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-[#0d6efd] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center group">
                      Se connecter <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Visual Side - Hidden on Mobile */}
          <div className="hidden md:block w-1/2 bg-slate-50 relative border-l border-slate-100">
            <div className="w-full flex items-start justify-center pt-24 pb-12 sticky top-8">
               {/* Decorative Background Elements */}
               <div className="absolute top-12 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2"></div>
               <div className="absolute top-64 right-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2"></div>
               
               {/* The Circular Image */}
               <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] border-[12px] border-white z-10 group">
                  <img 
                    src={EventConcours} 
                    alt="Participant Community" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent"></div>
               </div>

               {/* Floating badge */}
               <div className="absolute top-[320px] left-12 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20 animate-bounce" style={{animationDuration: '3.5s'}}>
                  <div className="bg-blue-100 p-2 rounded-full"><User className="w-6 h-6 text-blue-600"/></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Communauté</p>
                    <p className="font-bold text-slate-900 text-sm">Participez !</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterParticipant;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, MapPin, Calendar, Clock, 
  Users, DollarSign, FileText, Image as ImageIcon,
  CheckCircle2, AlertCircle, UploadCloud, Maximize2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const isEditMode = Boolean(eventId);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({ color: 'bleu', font: 'moderne' });

  const handleGeneratePoster = () => {
    setShowAIModal(false);
    const toastId = toast.loading("Création de l'affiche par l'IA...");
    setTimeout(() => {
      // On demande formellement une illustration de FOND sans aucun texte
      const promptText = `A stunning background illustration for a tech event, theme: "${formData.title}", dominant color: ${aiPrompt.color}, style: ${aiPrompt.font}, highly detailed, concept art, NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY, clean background, 8k resolution`;
      const keywords = encodeURIComponent(promptText);
      setFormData(prev => ({ ...prev, posterUrl: `https://image.pollinations.ai/prompt/${keywords}?width=800&height=600&nologo=true` }));
      toast.success("Affiche générée avec succès !", { id: toastId });
    }, 2000);
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'tech', // Mock categories later
    description: '',
    city: 'Conakry',
    location: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    registrationType: 'free',
    price: '',
    conditions: '',
    posterUrl: ''
  });

  // Load event data in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoadingEvent(true);
      api.get(`/events/${eventId}`)
        .then(res => {
          const e = res.data;
          setFormData({
            title: e.title || '',
            categoryId: e.categoryId || 'tech',
            description: e.description || '',
            city: e.city || 'Conakry',
            location: e.location || '',
            startDate: e.startDate ? e.startDate.substring(0, 10) : '',
            endDate: e.endDate ? e.endDate.substring(0, 10) : '',
            startTime: e.startTime || '',
            endTime: e.endTime || '',
            maxParticipants: e.maxParticipants || '',
            registrationType: e.registrationType || 'free',
            price: e.price || '',
            conditions: e.conditions || '',
            posterUrl: e.imageUrl || ''
          });
        })
        .catch(() => toast.error('Impossible de charger les données.'))
        .finally(() => setIsLoadingEvent(false));
    }
  }, [eventId, isEditMode]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error("L'image est trop volumineuse (max 5 Mo).");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, posterUrl: reader.result }));
        toast.success("Image chargée localement !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate time logic
      if (formData.endDate && formData.startDate > formData.endDate) {
        toast.error("La date de fin ne peut pas être avant la date de début.");
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        ...formData,
        price: formData.registrationType === 'paid' ? Number(formData.price) : 0,
        currency: 'GNF',
        registrationRequired: true
      };

      if (isEditMode) {
        await api.put(`/events/${eventId}`, payload);
        toast.success('Événement mis à jour avec succès !');
      } else {
        await api.post('/events', payload);
        toast.success('Événement créé avec succès (Brouillon) !');
      }
      navigate('/institution/events');
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'événement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variants for tab transitions
  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/institution/events" className="p-2 bg-white text-slate-500 hover:text-slate-900 rounded-xl border border-slate-200 shadow-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Modifier l\'\u00e9v\u00e9nement' : 'Cr\u00e9er un \u00e9v\u00e9nement'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isEditMode ? 'Modifiez les informations puis enregistrez.' : 'Les \u00e9v\u00e9nements cr\u00e9\u00e9s sont d\'abord enregistr\u00e9s comme brouillons.'}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
          
          {[
            { step: 1, label: 'Informations générales' },
            { step: 2, label: 'Date & Lieu' },
            { step: 3, label: 'Inscriptions & Tarifs' }
          ].map((item) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                currentStep > item.step ? 'bg-blue-600 text-white' : 
                currentStep === item.step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                'bg-white text-slate-400 border-2 border-slate-200'
              }`}>
                {currentStep > item.step ? <CheckCircle2 className="w-5 h-5" /> : item.step}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${currentStep >= item.step ? 'text-slate-900' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Informations Générales */}
            {currentStep === 1 && (
              <motion.div key="step1" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Titre de l'événement <span className="text-red-500">*</span></label>
                    <input 
                      type="text" name="title" required
                      value={formData.title} onChange={handleChange}
                      placeholder="Ex: Conférence sur l'IA, Remise de diplômes..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-700">Description complète <span className="text-red-500">*</span></label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (!formData.title) {
                            return toast.error("Veuillez d'abord saisir un titre d'événement.");
                          }
                          const toastId = toast.loading("Génération par l'IA en cours...");
                          try {
                            const payload = {
                              title: formData.title,
                              type: formData.categoryId,
                              date: formData.startDate,
                              location: formData.location || formData.city
                            };
                            const res = await api.post('/ai/event/generate-description', payload);
                            setFormData(prev => ({ ...prev, description: res.data.description }));
                            toast.success('Description générée !', { id: toastId });
                          } catch (err) {
                            toast.error(err.response?.data?.message || "Erreur de l'IA.", { id: toastId });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 hover:from-blue-500/20 hover:to-purple-500/20 rounded-lg text-xs font-bold transition-all border border-blue-200/50"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 11.5L20.2461 9.80806L18.5 9L20.2461 8.19194L21 6.5L21.7539 8.19194L23.5 9L21.7539 9.80806L21 11.5Z" fill="currentColor"/>
                          <path d="M10 20.5L7.73836 15.4242L2.5 13L7.73836 10.5758L10 5.5L12.2616 10.5758L17.5 13L12.2616 15.4242L10 20.5Z" fill="currentColor"/>
                          <path d="M18 23L17.2461 21.3081L15.5 20.5L17.2461 19.6919L18 18L18.7539 19.6919L20.5 20.5L18.7539 21.3081L18 23Z" fill="currentColor"/>
                        </svg>
                        Générer avec l'IA
                      </button>
                    </div>
                    <textarea 
                      name="description" required rows="5"
                      value={formData.description} onChange={handleChange}
                      placeholder="Décrivez l'événement, le programme, les intervenants..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Catégorie</label>
                    <select 
                      name="categoryId"
                      value={formData.categoryId} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="tech">Technologie & IT</option>
                      <option value="science">Sciences & Recherche</option>
                      <option value="culture">Culture & Arts</option>
                      <option value="sport">Sport Universitaire</option>
                      <option value="ceremony">Cérémonie Officielle</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-700">Image d'affiche (Optionnel)</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!formData.title) {
                            return toast.error("Saisissez un titre pour générer une affiche.");
                          }
                          setShowAIModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 hover:from-blue-500/20 hover:to-purple-500/20 rounded-lg text-xs font-bold transition-all border border-blue-200/50"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 11.5L20.2461 9.80806L18.5 9L20.2461 8.19194L21 6.5L21.7539 8.19194L23.5 9L21.7539 9.80806L21 11.5Z" fill="currentColor"/>
                          <path d="M10 20.5L7.73836 15.4242L2.5 13L7.73836 10.5758L10 5.5L12.2616 10.5758L17.5 13L12.2616 15.4242L10 20.5Z" fill="currentColor"/>
                          <path d="M18 23L17.2461 21.3081L15.5 20.5L17.2461 19.6919L18 18L18.7539 19.6919L20.5 20.5L18.7539 21.3081L18 23Z" fill="currentColor"/>
                        </svg>
                        Générer avec l'IA
                      </button>
                    </div>
                    {formData.posterUrl ? (
                      <div className="relative w-full h-40 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden group">
                        <img src={formData.posterUrl} alt="Affiche générée" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button type="button" onClick={() => setShowPosterPreview(true)} className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-slate-100 flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5" /> Voir
                          </button>
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, posterUrl: '' }))} className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-red-50 flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5" /> Supprimer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-12 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-2 text-slate-500 cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <UploadCloud className="w-5 h-5" />
                        <span className="text-sm font-medium">Cliquez pour uploader (JPG, PNG)</span>
                      </label>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Date & Lieu */}
            {currentStep === 2 && (
              <motion.div key="step2" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Dates */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date de début <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="date" name="startDate" required
                        value={formData.startDate} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date de fin (Optionnel)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="date" name="endDate"
                        value={formData.endDate} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Heures */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Heure de début</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="time" name="startTime"
                        value={formData.startTime} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Heure de fin</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="time" name="endTime"
                        value={formData.endTime} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Lieu */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ville</label>
                    <input 
                      type="text"
                      name="city"
                      list="cityOptions"
                      value={formData.city} onChange={handleChange}
                      placeholder="Sélectionnez ou tapez une ville..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                    <datalist id="cityOptions">
                      <option value="Conakry" />
                      <option value="Kindia" />
                      <option value="Labé" />
                      <option value="Kankan" />
                      <option value="Mamou" />
                      <option value="Boké" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Lieu exact (Amphi, Salle...) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" name="location" required
                        value={formData.location} onChange={handleChange}
                        placeholder="Ex: Amphithéâtre Gamal"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 3: Inscriptions & Tarifs */}
            {currentStep === 3 && (
              <motion.div key="step3" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Capacité maximale</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="number" name="maxParticipants" min="0"
                        value={formData.maxParticipants} onChange={handleChange}
                        placeholder="Ex: 150 (Laissez vide si illimité)"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-4">Type de billetterie</label>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.registrationType === 'free' ? 'border-blue-500 bg-white shadow-sm' : 'border-slate-200 bg-transparent opacity-60 hover:opacity-100'}`}>
                      <input 
                        type="radio" name="registrationType" value="free" 
                        checked={formData.registrationType === 'free'} onChange={handleChange}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500" 
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">Événement Gratuit</span>
                        <span className="text-xs text-slate-500 font-medium">Accès libre sur inscription</span>
                      </div>
                    </label>

                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.registrationType === 'paid' ? 'border-amber-500 bg-white shadow-sm' : 'border-slate-200 bg-transparent opacity-60 hover:opacity-100'}`}>
                      <input 
                        type="radio" name="registrationType" value="paid" 
                        checked={formData.registrationType === 'paid'} onChange={handleChange}
                        className="w-5 h-5 text-amber-500 focus:ring-amber-500" 
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">Événement Payant</span>
                        <span className="text-xs text-slate-500 font-medium">Achat de ticket obligatoire</span>
                      </div>
                    </label>
                  </div>

                  {formData.registrationType === 'paid' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Prix du ticket</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="number" name="price" required={formData.registrationType === 'paid'}
                            value={formData.price} onChange={handleChange}
                            placeholder="Ex: 50000"
                            className="w-full pl-10 pr-16 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-slate-900"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">GNF</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">Conditions spécifiques (Optionnel)</label>
                    <button 
                      type="button" 
                      onClick={async () => {
                        if (!formData.title) return toast.error("Veuillez d'abord saisir le titre de l'événement.");
                        const toastId = toast.loading('Génération des conditions...');
                        try {
                          const res = await api.post('/ai/chat', { message: `Génère une liste courte (3-4 tirets max) de conditions spécifiques obligatoires ou recommandées pour participer à cet événement: "${formData.title}". Ne fais pas d'intro ni de conclusion. Exemples: Venir avec son PC, Être étudiant. Sois direct.` });
                          setFormData(prev => ({ ...prev, conditions: res.data.response }));
                          toast.success('Conditions générées !', { id: toastId });
                        } catch (err) {
                          toast.error("Erreur de l'IA.", { id: toastId });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 hover:from-blue-500/20 hover:to-purple-500/20 rounded-lg text-xs font-bold transition-all border border-blue-200/50"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5L20.2461 9.80806L18.5 9L20.2461 8.19194L21 6.5L21.7539 8.19194L23.5 9L21.7539 9.80806L21 11.5Z" fill="currentColor"/>
                        <path d="M10 20.5L7.73836 15.4242L2.5 13L7.73836 10.5758L10 5.5L12.2616 10.5758L17.5 13L12.2616 15.4242L10 20.5Z" fill="currentColor"/>
                        <path d="M18 23L17.2461 21.3081L15.5 20.5L17.2461 19.6919L18 18L18.7539 19.6919L20.5 20.5L18.7539 21.3081L18 23Z" fill="currentColor"/>
                      </svg>
                      Générer avec l'IA
                    </button>
                  </div>
                  <textarea 
                    name="conditions" rows="3"
                    value={formData.conditions} onChange={handleChange}
                    placeholder="Ex: Être étudiant en L3, Venir avec son PC..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 resize-none"
                  ></textarea>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
          >
            Précédent
          </button>
          
          {/* Rendering both buttons and hiding them via CSS prevents React DOM removal crashes */}
          <div className="flex">
            <button
              type="button"
              onClick={handleNext}
              className={`px-6 py-2.5 bg-[#0A1F44] hover:bg-[#1E3E75] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 ${currentStep < 3 ? 'block' : 'hidden'}`}
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-[#0d6efd] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 ${currentStep === 3 ? 'block' : 'hidden'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className={isSubmitting ? "hidden" : "flex items-center gap-2"}>
                <Save className="w-4 h-4" /> {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer comme brouillon'}
              </span>
              <span className={isSubmitting ? "inline" : "hidden"}>
                {isEditMode ? 'Mise à jour...' : 'Enregistrement...'}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Custom AI Generation Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Studio Créatif IA</h3>
                  <p className="text-blue-100 text-sm font-medium">Générateur d'affiches sur mesure</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="text-lg">🎨</span> Couleur dominante souhaitée
                  </label>
                  <input
                    type="text"
                    value={aiPrompt.color}
                    onChange={(e) => setAiPrompt(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Ex: bleu nuit, rouge vif, sombre, clair..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="text-lg">✍️</span> Style de conception / Thème
                  </label>
                  <input
                    type="text"
                    value={aiPrompt.font}
                    onChange={(e) => setAiPrompt(prev => ({ ...prev, font: e.target.value }))}
                    placeholder="Ex: moderne, minimaliste, classique, cyberpunk..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePoster}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  Générer maintenant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPosterPreview && formData.posterUrl && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowPosterPreview(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setShowPosterPreview(false)} className="p-2 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                <img src={formData.posterUrl} alt="Aperçu HD" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-lg" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Extracted ArrowRight to avoid missing import
const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default CreateEvent;

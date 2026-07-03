import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, XCircle, Search, Calendar, MapPin, Building2, User, QrCode, Camera, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const VerificationPage = ({ type = 'event' }) => {
  const { code } = useParams();
  const [searchCode, setSearchCode] = useState(code || '');
  
  // Simulation de vérification (normalement appel API)
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Open camera when scanner modal opens
  useEffect(() => {
    if (isScannerOpen) {
      setCameraError(null);
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      .then(stream => {
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera error:', err);
        setCameraError('Impossible d\'accéder à la caméra. Utilisez l\'option "Importer une image" ci-dessous.');
      });
    }

    // Cleanup: stop camera when modal closes
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };
  }, [isScannerOpen]);

  // Attach stream to video element when ref is available
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const closeScanner = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScannerOpen(false);
    setCameraError(null);
  }, [cameraStream]);

  // Simulate reading QR from uploaded file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For demo: simulate a scanned code from image
    closeScanner();
    const simulatedCode = 'EVT-X7K-9P1';
    setSearchCode(simulatedCode);
    
    // Auto-trigger verification
    setTimeout(() => {
      setIsVerifying(true);
      setResult(null);
      setTimeout(() => {
        setIsVerifying(false);
        setResult({
          valid: true,
          type: 'event',
          data: {
            title: 'Concours National de Magistrature 2026',
            institution: 'Ministère de la Justice',
            date: '15 Octobre 2026',
            location: 'Conakry, Palais du Peuple',
            status: 'Officiel et publié'
          }
        });
      }, 1500);
    }, 300);
  };

  // Simulate camera scan (capture frame)
  const handleCameraCapture = () => {
    closeScanner();
    const simulatedCode = 'BDG-A3M-7Q2';
    setSearchCode(simulatedCode);
    
    setTimeout(() => {
      setIsVerifying(true);
      setResult(null);
      setTimeout(() => {
        setIsVerifying(false);
        setResult({
          valid: true,
          type: 'badge',
          data: {
            participantName: 'Ibrahima Sory Soumah',
            eventName: 'Formation Management Stratégique',
            institution: 'Institut Supérieur de Commerce',
            status: 'Valide (Non scanné)'
          }
        });
      }, 1500);
    }, 300);
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!searchCode) return;
    
    setIsVerifying(true);
    setResult(null);
    
    try {
      const res = await api.get(`/verify/${encodeURIComponent(searchCode)}`);
      // Simulate slight delay for effect
      setTimeout(() => {
        setIsVerifying(false);
        setResult(res.data);
      }, 800);
    } catch (err) {
      setTimeout(() => {
        setIsVerifying(false);
        setResult({
          valid: false,
          message: err.response?.data?.message || "Ce code est introuvable ou a été falsifié. Aucun document correspondant dans notre registre."
        });
      }, 800);
    }
  };

  // Run verification automatically if code is in URL
  React.useEffect(() => {
    if (code) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white pb-12">
      
      {/* Premium Header */}
      <section className="relative pt-[72px] pb-32 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-[0_0_40px_rgba(11,94,215,0.3)]"
          >
            <ShieldCheck className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-[44px] font-serif text-white tracking-tight mb-4 leading-[1.15]"
          >
            Vérification d'Authenticité
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto"
          >
            Saisissez le code unique d'une publication (EVT-...) ou d'un badge (BDG-...) pour vérifier cryptographiquement son intégrité.
          </motion.p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* Verification Form Box */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.1)] border border-slate-100 p-8 mb-8">
          <form onSubmit={handleVerify} className="relative">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 ml-1">Numéro d'identification</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors ${isVerifying ? 'text-primary-500 animate-pulse' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                <input 
                  type="text" 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Ex: EVT-X7K-9P1" 
                  className="w-full pl-14 pr-4 py-4 text-xl md:text-2xl bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white font-mono tracking-[0.2em] transition-all text-slate-800 placeholder-slate-300 uppercase"
                  disabled={isVerifying}
                />
              </div>
              <button 
                type="submit" 
                disabled={isVerifying || !searchCode}
                className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all disabled:opacity-70 disabled:hover:bg-primary-600 flex items-center justify-center min-w-[160px] shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50"
              >
                {isVerifying ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyse...
                  </div>
                ) : 'Vérifier'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="px-4 text-sm text-slate-400 font-bold uppercase tracking-widest">OU</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center text-slate-600 font-semibold hover:text-primary-600 transition-colors bg-slate-50 px-6 py-3 rounded-xl border border-slate-200 hover:border-primary-200"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Scanner un QR Code
            </button>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key={searchCode + isVerifying}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
              className={`rounded-3xl border-[3px] p-1 overflow-hidden shadow-xl ${result.valid ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-transparent' : 'bg-gradient-to-br from-red-400 to-rose-600 border-transparent'}`}
            >
              <div className="bg-white rounded-[1.35rem] p-8 h-full">
                {result.valid ? (
                  <div>
                    <div className="flex items-center justify-center mb-8">
                      <div className="bg-emerald-50 p-4 rounded-full mr-4 border border-emerald-100 relative">
                        <div className="absolute inset-0 border border-emerald-400 rounded-full animate-ping opacity-20"></div>
                        <ShieldCheck className="h-10 w-10 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Authentique</h2>
                        <p className="text-emerald-600 font-bold uppercase tracking-wider text-sm mt-1 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                          Certifié EventTrust GN
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      {result.type === 'event' ? (
                        <div className="space-y-5">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Données de l'Événement</div>
                          <h3 className="text-2xl font-bold text-slate-900 leading-tight">{result.data.title}</h3>
                          
                          <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-start">
                              <Building2 className="h-5 w-5 mr-3 text-slate-400 shrink-0 mt-0.5"/> 
                              <div>
                                <div className="text-xs text-slate-500 font-semibold mb-0.5">Institution</div>
                                <div className="text-slate-800 font-medium">{result.data.institution}</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Calendar className="h-5 w-5 mr-3 text-slate-400 shrink-0 mt-0.5"/> 
                              <div>
                                <div className="text-xs text-slate-500 font-semibold mb-0.5">Date</div>
                                <div className="text-slate-800 font-medium">{result.data.date}</div>
                              </div>
                            </div>
                            <div className="flex items-start sm:col-span-2">
                              <MapPin className="h-5 w-5 mr-3 text-slate-400 shrink-0 mt-0.5"/> 
                              <div>
                                <div className="text-xs text-slate-500 font-semibold mb-0.5">Lieu</div>
                                <div className="text-slate-800 font-medium">{result.data.location}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Données du {result.type === 'registration' ? 'Billet / Inscription' : 'Badge Participant'}</div>
                          
                          <div className="flex items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                            {result.data.participantAvatar ? (
                              <img 
                                src={result.data.participantAvatar} 
                                alt={result.data.participantName} 
                                className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-primary-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mr-4 border border-primary-100 shadow-sm">
                                <User className="h-6 w-6 text-primary-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-xs text-slate-500 font-semibold">Titulaire</div>
                              <div className="text-lg font-bold text-slate-900">{result.data.participantName}</div>
                            </div>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-start">
                              <Calendar className="h-5 w-5 mr-3 text-slate-400 shrink-0 mt-0.5"/> 
                              <div>
                                <div className="text-xs text-slate-500 font-semibold mb-0.5">Événement</div>
                                <div className="text-slate-800 font-medium leading-tight">{result.data.eventName}</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Building2 className="h-5 w-5 mr-3 text-slate-400 shrink-0 mt-0.5"/> 
                              <div>
                                <div className="text-xs text-slate-500 font-semibold mb-0.5">Organisateur</div>
                                <div className="text-slate-800 font-medium">{result.data.institution}</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                            <div className="text-xs font-bold text-slate-500 uppercase">Statut actuel</div>
                            <div className={`font-bold px-3 py-1 rounded-lg border ${
                              result.data.status.includes('Confirmé') || result.data.status.includes('Valide') 
                              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                              : result.data.status.includes('attente') 
                                ? 'text-amber-600 bg-amber-50 border-amber-100' 
                                : 'text-red-600 bg-red-50 border-red-100'
                            }`}>{result.data.status}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center bg-red-50 p-4 rounded-full mb-4 border border-red-100 relative">
                      <div className="absolute inset-0 border border-red-400 rounded-full animate-ping opacity-20"></div>
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Document Invalide</h2>
                    <p className="text-slate-600 text-lg max-w-md mx-auto">{result.message}</p>
                    <button onClick={() => {setSearchCode(''); setResult(null);}} className="mt-8 text-primary-600 font-bold hover:underline">
                      Vérifier un autre code
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner Modal */}
        <AnimatePresence>
          {isScannerOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
              onClick={closeScanner}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={closeScanner}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 hover:bg-red-50 rounded-full p-2 z-50"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <QrCode className="h-6 w-6 mr-3 text-primary-600" />
                  Scanner le Document
                </h2>
                
                {/* Camera Preview */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-900 aspect-[4/3] mb-4">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <Camera className="h-12 w-12 text-slate-500 mb-4" />
                      <p className="text-slate-400 text-sm font-medium">{cameraError}</p>
                    </div>
                  ) : (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Scan overlay / crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-white/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]"></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {!cameraError && (
                    <button 
                      onClick={handleCameraCapture}
                      className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center shadow-lg shadow-primary-600/30"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capturer
                    </button>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`${cameraError ? 'flex-1 bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'flex-1 bg-slate-100 text-slate-700'} py-3.5 rounded-xl font-bold hover:opacity-90 transition-colors flex items-center justify-center`}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Importer une image
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </div>

                <p className="text-center text-slate-400 mt-4 text-xs font-medium">
                  Placez le QR Code au centre du cadre ou importez une photo contenant le QR Code.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VerificationPage;

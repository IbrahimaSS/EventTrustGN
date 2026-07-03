import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShieldCheck, Printer } from 'lucide-react';
import LogoP from '../../assets/LogoP.png';

const AttestationModal = ({ isOpen, onClose, event }) => {
  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && event && (
        <motion.div key="attestation-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Aperçu de l'attestation</h3>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Certificate Container (Scrollable) */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-200/50">
            
            {/* THE CERTIFICATE (A4 Landscape) */}
            <div className="relative mx-auto w-full min-w-[800px] max-w-[1000px] aspect-[1.414/1] bg-white shadow-xl flex flex-col justify-between overflow-hidden group">
              
              {/* Background Patterns */}
              <div className="absolute inset-0 border-[16px] border-[#0A1F44] opacity-10 pointer-events-none"></div>
              <div className="absolute inset-0 border-2 border-[#0A1F44] m-4 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#0d6efd] opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0A1F44] opacity-5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

              {/* Top Section */}
              <div className="relative z-10 flex items-start justify-between px-16 pt-16">
                <div className="flex items-center gap-3">
                  <img src={LogoP} alt="EventTrust GN" className="h-10 opacity-90" />
                  <div className="h-8 border-l-2 border-slate-200 mx-2"></div>
                  <span className="text-sm font-bold tracking-widest text-slate-500 uppercase">
                    Certification Officielle
                  </span>
                </div>
                <div className="w-20 h-20 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-xl font-black text-[#0d6efd] shadow-sm bg-white">
                  {/* Mock Institution Logo */}
                  {event.institution.substring(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Middle Section (Content) */}
              <div className="relative z-10 text-center px-16 flex-1 flex flex-col justify-center">
                <h1 className="text-5xl sm:text-6xl font-black text-[#0A1F44] tracking-tight mb-2 font-serif">
                  CERTIFICAT
                </h1>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#0d6efd] tracking-widest uppercase mb-10">
                  De Participation
                </h2>

                <p className="text-slate-500 font-medium mb-4 text-lg">Ceci certifie que</p>
                <p className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 italic" style={{ fontFamily: 'Georgia, serif' }}>
                  Ibrahima Sory
                </p>

                <p className="text-slate-600 font-medium max-w-2xl mx-auto text-lg leading-relaxed mb-6">
                  a participé avec succès et a satisfait à toutes les exigences de l'événement organisé par <span className="font-bold text-slate-900">{event.institution}</span> :
                </p>

                <p className="text-2xl font-bold text-[#0A1F44] mb-2">{event.title}</p>
                
                <div className="flex items-center justify-center gap-6 mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0d6efd]"></span> {event.date.split(' ')[0]}</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0d6efd]"></span> {event.location.split('-')[0].trim()}</span>
                </div>
              </div>

              {/* Bottom Section (Signatures) */}
              <div className="relative z-10 flex items-end justify-between px-20 pb-16">
                
                {/* Signature 1 */}
                <div className="text-center">
                  <div className="w-40 border-b-2 border-slate-800 mb-3 relative">
                    {/* Fake signature image could go here, using a stylish font for now */}
                    <span className="absolute bottom-2 left-0 right-0 text-3xl text-slate-800" style={{ fontFamily: "'Brush Script MT', cursive" }}>Direction</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Direction Générale</p>
                  <p className="text-xs text-slate-500">{event.institution}</p>
                </div>

                {/* Badge/Seal */}
                <div className="w-32 h-32 relative flex items-center justify-center -mb-4">
                  <div className="absolute inset-0 border-[6px] border-amber-400 rounded-full border-dashed opacity-50 animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute inset-2 bg-amber-400 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-12 h-12 text-white" />
                  </div>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                    <path id="curve" d="M 50 50 m -35 0 a 35 35 0 1 1 70 0 a 35 35 0 1 1 -70 0" fill="none" />
                    <text className="text-[10.5px] font-bold fill-white uppercase tracking-widest">
                      <textPath href="#curve" startOffset="50%" textAnchor="middle">
                        • EVENTTRUST GN VERIFIED •
                      </textPath>
                    </text>
                  </svg>
                </div>

                {/* Signature 2 */}
                <div className="text-center">
                  <div className="w-40 border-b-2 border-[#0d6efd] mb-3 relative">
                    <span className="absolute bottom-2 left-0 right-0 text-3xl text-[#0d6efd]" style={{ fontFamily: "'Brush Script MT', cursive" }}>EventTrust</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Certification Officielle</p>
                  <p className="text-xs text-slate-500">EventTrust GN</p>
                </div>

              </div>

              {/* Verification Code */}
              <div className="absolute bottom-4 left-6 text-[10px] text-slate-400 font-mono">
                ID: AT-{event.id}-2026-{Math.floor(1000 + Math.random() * 9000)} | VERIFY AT EVENTTRUST.GN
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Fermer
            </button>
            <button className="px-6 py-2.5 rounded-xl font-bold text-[#0d6efd] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2">
              <Printer className="w-4 h-4" /> Imprimer
            </button>
            <button className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0d6efd] hover:bg-blue-700 shadow-md transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Télécharger le PDF
            </button>
          </div>

        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttestationModal;

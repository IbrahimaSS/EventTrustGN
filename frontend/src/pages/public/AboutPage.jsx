import React from 'react';
import { ShieldCheck, Target, Globe, Building2, Award, MessageCircle, Phone, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white pb-20">
      
      {/* Premium Header */}
      <section className="relative pt-[72px] pb-24 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white border-b border-slate-200">
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-[44px] font-serif font-bold text-slate-900 tracking-tight mb-4 leading-[1.15]"
          >
            À Propos d'<span className="text-primary-600">EventTrust GN</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            La plateforme de confiance pour la publication et la vérification des événements officiels en Guinée.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Mission & Vision Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden h-full flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-10"></div>
            
            <h2 className="text-3xl font-serif text-slate-900 mb-6 flex items-center">
              <span className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mr-4 border border-primary-100">
                <Target className="h-6 w-6" />
              </span>
              Notre Mission
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              EventTrust GN est né d'un constat simple : la prolifération des fausses annonces et la difficulté pour le grand public de vérifier l'authenticité d'un événement institutionnel (concours, soutenances, recrutements, etc.).
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-primary-500">
              <p className="text-lg text-slate-800 font-semibold leading-relaxed">
                Fournir un espace numérique inviolable où chaque institution peut publier de manière sécurisée, et où chaque citoyen peut vérifier l'information d'un simple scan.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-full"
          >
            <div className="h-full relative flex items-center">
              {/* Decorative background element */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-400 to-primary-600 rounded-[2.5rem] transform rotate-3 opacity-10"></div>
              
              <div className="relative w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 flex flex-col items-center justify-center text-center overflow-hidden h-full">
                {/* Blur Orbs */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-secondary-100 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary-100 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mb-8 relative z-20 shadow-inner border border-white">
                  <Award className="h-12 w-12 text-primary-600" />
                </div>
                
                <h3 className="text-3xl font-serif text-slate-900 mb-6 relative z-20">La Vision</h3>
                <p className="text-lg text-slate-600 leading-relaxed relative z-20">
                  Devenir la norme nationale en matière de publication officielle et de billetterie institutionnelle en Guinée.
                </p>
                <p className="text-slate-500 mt-4 relative z-20">
                  En intégrant des technologies modernes telles que les <strong className="text-slate-700">QR Codes inviolables</strong>, l'<strong className="text-slate-700">intelligence artificielle</strong> pour l'analyse des données, et le paiement mobile.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-slate-900 mb-4">Nos Piliers Fondamentaux</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Ce qui garantit la qualité et l'intégrité de notre écosystème national.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: ShieldCheck, title: "Sécurité & Intégrité", desc: "Technologie de hachage cryptographique et QR codes uniques pour prévenir absolument toute falsification de document.", bg: "bg-primary-50", text: "text-primary-600", border: "border-primary-100" },
            { icon: Building2, title: "Fiabilité Institutionnelle", desc: "Chaque institution présente sur la plateforme est scrupuleusement vérifiée et validée manuellement par nos équipes.", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
            { icon: Globe, title: "Accessibilité Nationale", desc: "Une interface claire, rapide et pensée pour tous les Guinéens, accessible sur téléphone mobile partout dans le pays.", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" }
          ].map((val, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${val.bg} ${val.text} ${val.border} group-hover:scale-110 transition-transform duration-300`}>
                <val.icon className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">{val.title}</h3>
              <p className="text-slate-600 leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats / Trust Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/20 rounded-full blur-[80px]"></div>
          
          <h2 className="text-3xl font-serif text-white mb-12 relative z-10">L'Écosystème EventTrust</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">100%</div>
              <div className="text-slate-300 font-medium uppercase tracking-wider text-sm">Sécurisé</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</div>
              <div className="text-slate-300 font-medium uppercase tracking-wider text-sm">Vérification</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">0</div>
              <div className="text-slate-300 font-medium uppercase tracking-wider text-sm">Faux Billets</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">GN</div>
              <div className="text-slate-300 font-medium uppercase tracking-wider text-sm">Fait en Guinée</div>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 mb-12 text-center"
        >
          <h2 className="text-3xl font-serif text-slate-900 mb-4">Un projet ? Une question ?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">Notre équipe est à votre disposition pour vous accompagner. Contactez-nous via le canal de votre choix.</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* WhatsApp */}
            <a href="https://wa.me/224629021634" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-[1.5rem] border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                <MessageCircle className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-lg">WhatsApp</h3>
              <p className="text-emerald-600 font-medium text-sm">Discutons en direct</p>
            </a>

            {/* Téléphone */}
            <a href="tel:+224629021634" className="bg-white p-6 rounded-[1.5rem] border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                <Phone className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-lg">Téléphone</h3>
              <p className="text-blue-600 font-medium text-sm">Appelez-nous</p>
            </a>

            {/* Email */}
            <a href="mailto:contact@eventtrust.gn" className="bg-white p-6 rounded-[1.5rem] border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                <Mail className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-lg">Email</h3>
              <p className="text-purple-600 font-medium text-sm">Écrivez-nous</p>
            </a>

            {/* SMS */}
            <a href="sms:+224629021634" className="bg-white p-6 rounded-[1.5rem] border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                <MessageSquare className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-lg">SMS</h3>
              <p className="text-orange-600 font-medium text-sm">Envoyez un message</p>
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutPage;

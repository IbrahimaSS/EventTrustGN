import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, ChevronDown, Mail, 
  Phone, Eye, Users, Star, Activity, X, Calendar, MapPin, CheckCircle2, Send, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api';

const ImportCSVModal = ({ onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [events, setEvents] = useState([]);

  React.useEffect(() => {
    api.get('/events/institution').then(res => setEvents(res.data)).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    if (lines.length < 2) return [];
    
    // Attente: Prénom, Nom, Email, Téléphone
    const participants = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length >= 3) {
        participants.push({
          firstName: parts[0]?.replace(/"/g, '').trim(),
          lastName: parts[1]?.replace(/"/g, '').trim(),
          email: parts[2]?.replace(/"/g, '').trim(),
          phoneNumber: parts[3]?.replace(/"/g, '').trim() || ''
        });
      }
    }
    return participants;
  };

  const handleImport = () => {
    if (!selectedEventId) {
      toast.error('Veuillez sélectionner un événement.');
      return;
    }
    if (!file) {
      toast.error('Veuillez sélectionner un fichier CSV.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const participants = parseCSV(text);
      
      if (participants.length === 0) {
        toast.error('Le fichier CSV est vide ou mal formaté.');
        setIsUploading(false);
        return;
      }

      try {
        const res = await api.post('/registrations/institution/bulk', {
          eventId: selectedEventId,
          participants
        });
        toast.success(`Import terminé : ${res.data.results.added} ajouts.`);
        onImportSuccess();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erreur lors de l\'importation.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Importer des inscriptions</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">1. Sélectionner l'événement</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Choisir un événement...</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">2. Fichier CSV</label>
            <p className="text-xs text-slate-500 mb-2">Format attendu : Prénom, Nom, Email, Téléphone</p>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={isUploading} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            Annuler
          </button>
          <button onClick={handleImport} disabled={isUploading} className="px-6 py-2.5 bg-[#0d6efd] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all cursor-pointer">
            {isUploading ? 'Import...' : 'Importer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ParticipantDetailModal = ({ participant, onClose }) => {
  if (!participant) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Header Profile */}
        <div className="flex flex-col items-center p-8 border-b border-slate-100 bg-slate-50 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative mb-4">
            {participant.avatar ? (
              <img src={participant.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-white" />
            ) : (
              <div translate="no" className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black shadow-md ${participant.status === 'vip' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-[#0d6efd]'}`}>
                {participant.firstName?.[0]}{participant.lastName?.[0]}
              </div>
            )}
            {participant.status === 'vip' && (
              <div className="absolute bottom-0 right-0 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Star className="w-4 h-4 fill-white" />
              </div>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-900 text-center">{participant.firstName} {participant.lastName}</h3>
          <p className="text-sm font-medium text-slate-500 text-center">ID: {participant._id.substring(0,8).toUpperCase()}</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-semibold text-slate-500 mb-1">Événements</p>
              <p className="text-xl font-black text-[#0d6efd]">{participant.eventsCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-semibold text-slate-500 mb-1">Dernière activité</p>
              <p className="text-sm font-bold text-slate-900">{new Date(participant.lastActive).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Mail className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">{participant.email}</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">{participant.phone}</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">{participant.location || 'Guinée'}</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">Inscrit depuis le {new Date(participant.joinDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SendEmailModal = ({ participant, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!participant) return null;

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir le sujet et le message.');
      return;
    }
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      onSend(participant.email);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#0d6efd]" /> Envoyer un Email
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              À : <span className="font-bold text-slate-700">{participant.firstName} {participant.lastName}</span> ({participant.email})
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer self-start">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Sujet de l'email</label>
            <input 
              type="text" 
              placeholder="Ex: Mise à jour concernant l'événement..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Message</label>
            <textarea 
              rows="6"
              placeholder="Bonjour..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} disabled={isSending} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            Annuler
          </button>
          <button 
            onClick={handleSend} 
            disabled={isSending}
            className="px-6 py-2.5 bg-[#0d6efd] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-4 h-4" /> Envoyer l'email
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};


const InstitutionParticipants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [emailParticipant, setEmailParticipant] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  React.useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await api.get('/registrations/institution/participants');
      setParticipants(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des participants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSend = (email) => {
    toast.success(`Email envoyé avec succès à ${email}`);
    setEmailParticipant(null);
  };

  const filteredParticipants = participants.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVip = participants.filter(p => p.status === 'vip').length;
  // Let's consider active if last active was in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const totalActive = participants.filter(p => new Date(p.lastActive) >= thirtyDaysAgo).length;

  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) {
      toast.error('Aucune donnée à exporter.');
      return;
    }

    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Événements participés', 'Statut', 'Dernière Activité', 'Date Inscription'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => [
        p._id,
        `"${p.firstName || ''}"`,
        `"${p.lastName || ''}"`,
        p.email,
        p.phoneNumber || '',
        p.eventsCount,
        p.status,
        new Date(p.lastActive).toLocaleDateString('fr-FR'),
        new Date(p.joinDate).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV réussi !');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Annuaire des Participants</h2>
          <p className="text-slate-500 text-sm mt-1">Gérez la base de données des personnes ayant participé à vos événements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            Importer CSV
          </button>
          <button onClick={handleExportCSV} className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-[#0d6efd] rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Total Participants</p>
            <p className="text-2xl font-black text-slate-900">{participants.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Participants VIP</p>
            <p className="text-2xl font-black text-slate-900">{totalVip}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Actifs (30j)</p>
            <p className="text-2xl font-black text-slate-900">{totalActive}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">Tous les types</option>
            <option value="active">Réguliers</option>
            <option value="vip">Fidèles (VIP)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Participants Table */}
      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <th className="p-4 pl-6 border-r border-slate-200">Profil</th>
                <th className="p-4 border-r border-slate-200">Contact</th>
                <th className="p-4 border-r border-slate-200 text-center">Inscriptions</th>
                <th className="p-4 border-r border-slate-200">Dernière Activité</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-200">
                    <td className="p-4 pl-6 border-r border-slate-200">
                      <div className="flex items-center gap-3">
                        {p.avatar ? (
                          <img src={p.avatar} alt="Avatar" className={`w-10 h-10 rounded-full object-cover shrink-0 ${p.status === 'vip' ? 'border-2 border-yellow-400' : 'border border-slate-200'}`} />
                        ) : (
                          <div translate="no" className={`w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${p.status === 'vip' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-[#0d6efd]'}`}>
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {p.firstName} {p.lastName}
                            {p.status === 'vip' && <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" title="Participant Fidèle" />}
                          </p>
                          <p className="text-xs text-slate-500">ID: {p._id.substring(0,8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email}
                        </p>
                        <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phoneNumber || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                        {p.eventsCount}
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <p className="text-sm text-slate-600 font-medium">{new Date(p.lastActive).toLocaleDateString('fr-FR')}</p>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEmailParticipant(p)} className="cursor-pointer w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors" title="Envoyer un email">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSelectedParticipant(p)} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Voir le profil complet">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Aucun participant trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {selectedParticipant && (
          <ParticipantDetailModal 
            participant={selectedParticipant} 
            onClose={() => setSelectedParticipant(null)} 
          />
        )}
        {emailParticipant && (
          <SendEmailModal 
            participant={emailParticipant} 
            onClose={() => setEmailParticipant(null)} 
            onSend={handleEmailSend}
          />
        )}
        {isImportModalOpen && (
          <ImportCSVModal 
            onClose={() => setIsImportModalOpen(false)}
            onImportSuccess={() => {
              setIsImportModalOpen(false);
              fetchParticipants();
            }}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default InstitutionParticipants;

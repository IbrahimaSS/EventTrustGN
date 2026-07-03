import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, CheckCircle2, XCircle, 
  Clock, Download, ChevronDown, Eye, X, User, Calendar, CreditCard, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api';

const ImportCSVModal = ({ onClose, onImportSuccess, events }) => {
  const [file, setFile] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'accepted':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Validée</span>;
    case 'pending':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600"><Clock className="w-3.5 h-3.5" /> En attente</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600"><XCircle className="w-3.5 h-3.5" /> Rejetée</span>;
    default:
      return null;
  }
};

const RegistrationDetailModal = ({ reg, onClose }) => {
  if (!reg) return null;
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
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Détails de l'inscription</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">ID: {reg.id}</p>
            <StatusBadge status={reg.status} />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              {reg.participantId?.avatar ? (
                <img src={reg.participantId.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {reg.participantId?.firstName?.[0] || 'U'}{reg.participantId?.lastName?.[0] || ''}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900">{reg.participantId?.firstName} {reg.participantId?.lastName}</p>
                <p className="text-sm text-slate-500">{reg.participantId?.email}</p>
                <p className="text-sm text-slate-500">{reg.participantId?.phoneNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Événement</p>
                  <p className="text-sm font-bold text-slate-900">{reg.eventId?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Date d'inscription</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(reg.registeredAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Paiement</p>
                  <p className="text-sm font-bold text-slate-900">
                    {reg.paymentStatus === 'not_required' ? 'Gratuit' : (reg.paymentStatus === 'paid' ? 'Payé' : 'En attente de paiement')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer">
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ActionConfirmModal = ({ actionData, onClose, onConfirm }) => {
  if (!actionData) return null;
  const isApprove = actionData.type === 'approve';
  
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
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6"
      >
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isApprove ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {isApprove ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {isApprove ? 'Valider l\'inscription ?' : 'Rejeter l\'inscription ?'}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Êtes-vous sûr de vouloir {isApprove ? 'valider' : 'rejeter'} l'inscription de <span className="font-bold text-slate-700">{actionData.name}</span> ?
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer">
            Annuler
          </button>
          <button onClick={() => onConfirm(actionData.id)} className={`px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-md cursor-pointer ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            Oui, {isApprove ? 'Valider' : 'Rejeter'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InstitutionInscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  
  const [selectedReg, setSelectedReg] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  React.useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/registrations/institution');
      setRegistrations(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des inscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveConfirm = async (id) => {
    try {
      await api.patch(`/registrations/${id}/status`, { status: 'accepted' });
      toast.success(`Inscription validée avec succès !`);
      setRegistrations(prev => prev.map(r => r._id === id ? { ...r, status: 'accepted' } : r));
    } catch (error) {
      toast.error('Erreur lors de la validation.');
    }
    setActionConfirm(null);
  };

  const handleRejectConfirm = async (id) => {
    try {
      await api.patch(`/registrations/${id}/status`, { status: 'rejected' });
      toast.success(`Inscription rejetée.`);
      setRegistrations(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      toast.error('Erreur lors du rejet.');
    }
    setActionConfirm(null);
  };

  const uniqueEvents = [...new Set(registrations.map(r => r.eventId?.title).filter(Boolean))];

  const filteredRegistrations = registrations.filter(reg => {
    const participantName = `${reg.participantId?.firstName} ${reg.participantId?.lastName}`.toLowerCase();
    const matchesSearch = participantName.includes(searchTerm.toLowerCase()) || reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || reg.eventId?.title === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const totalAccepted = registrations.filter(r => r.status === 'accepted').length;
  const totalPending = registrations.filter(r => r.status === 'pending').length;
  const totalRejected = registrations.filter(r => r.status === 'rejected').length;

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast.error('Aucune donnée à exporter.');
      return;
    }

    const headers = ['ID Inscription', 'Événement', 'Prénom', 'Nom', 'Email', 'Date Inscription', 'Statut', 'Paiement'];
    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map(r => [
        r.registrationNumber,
        `"${r.eventId?.title || ''}"`,
        `"${r.participantId?.firstName || ''}"`,
        `"${r.participantId?.lastName || ''}"`,
        r.participantId?.email,
        new Date(r.registeredAt).toLocaleDateString('fr-FR'),
        r.status,
        r.paymentStatus === 'not_required' ? 'Gratuit' : (r.paymentStatus === 'paid' ? 'Payé' : 'En attente')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inscriptions_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h2 className="text-2xl font-bold text-slate-900">Gestion des inscriptions</h2>
          <p className="text-slate-500 text-sm mt-1">Validez ou rejetez les demandes de participation à vos événements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Importer CSV
          </button>
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Inscriptions</p>
          <p className="text-2xl font-black text-slate-900">{registrations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Validées</p>
          <p className="text-2xl font-black text-emerald-600 relative z-10">{totalAccepted}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">En attente</p>
          <p className="text-2xl font-black text-amber-600 relative z-10">{totalPending}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full"></div>
          <p className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Rejetées</p>
          <p className="text-2xl font-black text-red-500 relative z-10">{totalRejected}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un participant ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <select 
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full sm:w-64 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer truncate"
            >
              <option value="all">Tous les événements</option>
              {uniqueEvents.map((evt, idx) => (
                <option key={idx} value={evt}>{evt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Validées</option>
              <option value="rejected">Rejetées</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Registrations Table */}
      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <th className="p-4 pl-6 border-r border-slate-200">Participant</th>
                <th className="p-4 border-r border-slate-200">Événement</th>
                <th className="p-4 border-r border-slate-200">Date & Ticket</th>
                <th className="p-4 border-r border-slate-200">Statut</th>
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
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-200">
                    <td className="p-4 pl-6 border-r border-slate-200">
                      <div className="flex items-center gap-3">
                        {reg.participantId?.avatar ? (
                          <img src={reg.participantId.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div translate="no" className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            {reg.participantId?.firstName?.[0] || 'U'}{reg.participantId?.lastName?.[0] || ''}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{reg.participantId?.firstName} {reg.participantId?.lastName}</p>
                          <p className="text-xs text-slate-500">{reg.participantId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{reg.eventId?.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{reg.registrationNumber}</p>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(reg.registeredAt).toLocaleDateString('fr-FR')}</p>
                      <div className="mt-1">
                        {reg.paymentStatus !== 'not_required' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-md">Payant</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">Gratuit</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {reg.status === 'pending' && (
                          <>
                            <button onClick={() => setActionConfirm({ type: 'approve', id: reg._id, name: `${reg.participantId?.firstName} ${reg.participantId?.lastName}` })} className="cursor-pointer w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors" title="Valider">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setActionConfirm({ type: 'reject', id: reg._id, name: `${reg.participantId?.firstName} ${reg.participantId?.lastName}` })} className="cursor-pointer w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors" title="Rejeter">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedRegistration({ ...reg, id: reg.registrationNumber })} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors" title="Voir détails">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Aucune inscription trouvée pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {selectedRegistration && (
          <RegistrationDetailModal 
            reg={selectedRegistration} 
            onClose={() => setSelectedRegistration(null)} 
          />
        )}
        {isImportModalOpen && (
          <ImportCSVModal 
            onClose={() => setIsImportModalOpen(false)}
            onImportSuccess={() => {
              setIsImportModalOpen(false);
              fetchRegistrations(); // Refresh data
            }}
            events={registrations.reduce((acc, current) => {
              if (current.eventId && !acc.find(item => item._id === current.eventId._id)) {
                acc.push(current.eventId);
              }
              return acc;
            }, [])}
          />
        )}
        {actionConfirm && (
          <ActionConfirmModal 
            actionData={actionConfirm} 
            onClose={() => setActionConfirm(null)} 
            onConfirm={(id) => actionConfirm.type === 'approve' ? handleApproveConfirm(id) : handleRejectConfirm(id)} 
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default InstitutionInscriptions;

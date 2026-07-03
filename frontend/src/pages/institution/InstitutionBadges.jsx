import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, ChevronDown, QrCode, 
  CheckCircle2, XCircle, Clock, X, 
  Printer, Shield, AlertTriangle, User, Calendar, MapPin
} from 'lucide-react';

import api from '../../services/api';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'valid':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Valide</span>;
    case 'used':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600"><Shield className="w-3.5 h-3.5" /> Utilisé</span>;
    case 'cancelled':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600"><XCircle className="w-3.5 h-3.5" /> Annulé</span>;
    default:
      return null;
  }
};

// Deterministic QR code grid generator from badge code string
const generateQRGrid = (code) => {
  const size = 9;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Corner finder patterns (3x3)
  const setFinder = (r, c) => {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        grid[r + i][c + j] = true;
    grid[r + 1][c + 1] = false; // center hole
  };
  setFinder(0, 0);
  setFinder(0, 6);
  setFinder(6, 0);

  // Data area: seeded from the code string
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash + code.charCodeAt(i)) | 0;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) continue;
      hash = ((hash * 1103515245 + 12345) & 0x7fffffff);
      grid[r][c] = (hash % 3) !== 0; // ~66% fill for data area
    }
  }
  return grid;
};

const MiniQRCode = ({ code, size = 36 }) => {
  const grid = generateQRGrid(code);
  const cellSize = size / grid.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0A1F44"
            />
          ) : null
        )
      )}
    </svg>
  );
};

// Large QR for the modal
const LargeQRCode = ({ code }) => {
  const grid = generateQRGrid(code);
  const cellSize = 16;
  const svgSize = grid.length * cellSize;
  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} xmlns="http://www.w3.org/2000/svg" className="mx-auto">
      <rect width={svgSize} height={svgSize} fill="white" rx="8" />
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0A1F44"
              rx="1"
            />
          ) : null
        )
      )}
    </svg>
  );
};

// Badge Detail Modal
const BadgeDetailModal = ({ badge, onClose }) => {
  React.useEffect(() => {
    if (badge) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [badge]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key="badge-detail-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Détail du Badge</h3>
              <button onClick={onClose} className="cursor-pointer p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* QR Code */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3">
                <LargeQRCode code={badge.badgeCode} />
                <p translate="no" className="font-mono text-sm font-bold text-slate-800 tracking-wider mt-2">{badge.badgeCode}</p>
                <StatusBadge status={badge.status} />
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <User className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{badge.participant.name}</p>
                    <p className="text-xs text-slate-500">{badge.participant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{badge.event}</p>
                    <p className="text-xs text-slate-500">{badge.eventDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-700">{badge.eventLocation}</p>
                </div>
                {badge.usedAt && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-sm font-semibold text-blue-700">Scanné le {badge.usedAt}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button onClick={onClose} className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
                Fermer
              </button>
              <button className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0d6efd] hover:bg-blue-700 shadow-md transition-all flex items-center gap-2">
                <Printer className="w-4 h-4" /> Imprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InstitutionBadges = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await api.get('/registrations/institution');
      // On ne crée des badges que pour les inscriptions validées ou annulées
      const validRegistrations = res.data.filter(reg => reg.status === 'accepted' || reg.status === 'cancelled');
      
      const mappedBadges = validRegistrations.map(reg => ({
        id: reg._id,
        badgeCode: reg.registrationNumber,
        participant: { 
          name: `${reg.participantId?.firstName} ${reg.participantId?.lastName}`, 
          email: reg.participantId?.email, 
          avatar: `${reg.participantId?.firstName?.[0] || 'U'}${reg.participantId?.lastName?.[0] || ''}` 
        },
        event: reg.eventId?.title || 'Événement inconnu',
        eventDate: reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString('fr-FR') : 'N/A',
        eventLocation: reg.eventId?.location || 'N/A',
        generatedAt: new Date(reg.registeredAt).toLocaleDateString('fr-FR'),
        status: reg.presence ? 'used' : (reg.status === 'cancelled' ? 'cancelled' : 'valid'),
        usedAt: reg.scannedAt ? new Date(reg.scannedAt).toLocaleTimeString('fr-FR') : null
      }));
      setBadges(mappedBadges);
    } catch (error) {
      toast.error('Erreur lors du chargement des badges.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBadge = async (badgeId) => {
    if (!window.confirm('Voulez-vous vraiment annuler ce badge ? Cette action est irréversible.')) return;
    try {
      await api.patch(`/registrations/${badgeId}/status`, { status: 'cancelled' });
      toast.success('Badge annulé avec succès.');
      fetchBadges();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation du badge.');
    }
  };

  const uniqueEvents = [...new Set(badges.map(b => b.event))];

  const filteredBadges = badges.filter(b => {
    const matchesSearch = b.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.badgeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || b.event === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const validCount = badges.filter(b => b.status === 'valid').length;
  const usedCount = badges.filter(b => b.status === 'used').length;
  const cancelledCount = badges.filter(b => b.status === 'cancelled').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Badges & QR Codes</h2>
          <p className="text-slate-500 text-sm mt-1">Visualisez et gérez les badges générés pour vos événements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Printer className="w-4 h-4" />
            Imprimer tout
          </button>
          <button className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Total Badges</p>
            <p className="text-2xl font-black text-slate-900">{badges.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full"></div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Valides</p>
            <p className="text-2xl font-black text-emerald-600">{validCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full"></div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
            <Shield className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Utilisés</p>
            <p className="text-2xl font-black text-blue-600">{usedCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full"></div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 relative z-10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Annulés</p>
            <p className="text-2xl font-black text-red-500">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou code badge..."
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
              className="w-full sm:w-44 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="valid">Valides</option>
              <option value="used">Utilisés</option>
              <option value="cancelled">Annulés</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Badges Table */}
      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <th className="p-4 pl-6 border-r border-slate-200">Badge</th>
                <th className="p-4 border-r border-slate-200">Participant</th>
                <th className="p-4 border-r border-slate-200">Événement</th>
                <th className="p-4 border-r border-slate-200">Statut</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBadges.length > 0 ? (
                filteredBadges.map((badge) => (
                  <tr key={badge.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-200">
                    <td className="p-4 pl-6 border-r border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          <MiniQRCode code={badge.badgeCode} size={36} />
                        </div>
                        <div>
                          <p translate="no" className="font-mono text-xs font-bold text-slate-900">{badge.badgeCode}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{badge.generatedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <div className="flex items-center gap-3">
                        <div translate="no" className="w-9 h-9 rounded-full bg-blue-100 text-[#0d6efd] font-bold text-xs flex items-center justify-center shrink-0">
                          {badge.participant.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{badge.participant.name}</p>
                          <p className="text-xs text-slate-500">{badge.participant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{badge.event}</p>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <StatusBadge status={badge.status} />
                      {badge.usedAt && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {badge.usedAt}
                        </p>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedBadge(badge)} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors" title="Voir le QR Code">
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button onClick={() => window.print()} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Imprimer le badge">
                          <Printer className="w-4 h-4" />
                        </button>
                        {badge.status === 'valid' && (
                          <button onClick={() => handleCancelBadge(badge.id)} className="cursor-pointer w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors" title="Annuler le badge">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Aucun badge trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Badge Detail Modal */}
      <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />

    </motion.div>
  );
};

export default InstitutionBadges;

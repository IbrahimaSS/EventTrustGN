import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, ChevronDown, ScanLine, 
  CheckCircle2, XCircle, AlertTriangle, Clock, 
  Shield, UserX, CalendarX
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const ScanResultBadge = ({ result }) => {
  const config = {
    valid: { icon: CheckCircle2, label: 'Accès OK', cls: 'bg-emerald-50 text-emerald-600' },
    already_used: { icon: Shield, label: 'Déjà scanné', cls: 'bg-amber-50 text-amber-600' },
    cancelled: { icon: XCircle, label: 'Annulé', cls: 'bg-red-50 text-red-600' },
    invalid: { icon: AlertTriangle, label: 'Invalide', cls: 'bg-red-50 text-red-600' },
    wrong_event: { icon: CalendarX, label: 'Mauvais événement', cls: 'bg-orange-50 text-orange-600' }
  };
  const c = config[result] || config.invalid;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${c.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {c.label}
    </span>
  );
};

const ScannerModal = ({ onClose, onScanComplete, events }) => {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, success, error
  const [selectedEventId, setSelectedEventId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const startScan = async () => {
    if (!selectedEventId) {
      toast.error('Veuillez sélectionner l\'événement à contrôler.');
      return;
    }
    if (!manualCode.trim()) {
      toast.error('Veuillez saisir le code du badge.');
      return;
    }

    setScanState('scanning');
    
    try {
      const res = await api.post('/registrations/scan', {
        eventId: selectedEventId,
        badgeCode: manualCode.trim()
      });
      
      const resultLog = res.data;
      setScanResult(resultLog);
      setScanState(resultLog.result === 'valid' ? 'success' : 'error');
      if (onScanComplete) onScanComplete();
    } catch (error) {
      toast.error('Erreur lors du scan.');
      setScanState('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-[#0A1F44]" /> Mode Scanner
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {scanState === 'idle' && (
            <div className="w-full space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Événement à contrôler</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Sélectionner un événement...</option>
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Saisir le Code Badge ou Scanner</label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="ex: REG-A1B2C3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && startScan()}
                />
              </div>
            </div>
          )}

          {/* Camera Viewport Mockup */}
          <div className="relative w-64 h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {scanState === 'idle' && (
              <button onClick={startScan} className="cursor-pointer px-6 py-3 bg-[#0d6efd] text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors z-10">
                Scanner
              </button>
            )}
            
            {scanState === 'scanning' && (
              <>
                <div className="absolute inset-0 bg-slate-800 opacity-50"></div>
                {/* Scanning line animation */}
                <motion.div 
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] z-10"
                />
                {/* Target brackets */}
                <div className="absolute inset-8 border-2 border-white/30 border-dashed rounded-xl"></div>
                <p className="absolute bottom-4 text-white text-xs font-bold animate-pulse">Analyse en cours...</p>
              </>
            )}

            {scanState === 'success' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center z-10">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-bold text-center px-4">{scanResult?.message || 'Accès Autorisé'}</p>
                <p className="text-emerald-300 text-xs mt-1 text-center">
                  {scanResult?.participantId ? `${scanResult.participantId.firstName} ${scanResult.participantId.lastName}` : manualCode}
                </p>
              </motion.div>
            )}

            {scanState === 'error' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center z-10">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-bold text-center px-4">Accès Refusé</p>
                <p className="text-red-300 text-xs mt-1 text-center px-4">{scanResult?.message || 'Erreur'}</p>
              </motion.div>
            )}
          </div>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-500">
              {scanState === 'idle' ? 'Placez le QR code au centre du cadre.' : 
               scanState === 'scanning' ? 'Maintenez l\'appareil stable...' : 
               scanState === 'success' ? 'Le participant peut entrer.' : 'Veuillez vérifier avec l\'administrateur.'}
            </p>
            {(scanState === 'success' || scanState === 'error') && (
              <button onClick={() => { setScanState('idle'); setManualCode(''); setScanResult(null); }} className="cursor-pointer px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                Scanner un autre badge
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InstitutionScans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scans, setScans] = useState([]);
  const [events, setEvents] = useState([]);

  React.useEffect(() => {
    fetchScans();
    fetchEvents();
  }, []);

  const fetchScans = async () => {
    try {
      const res = await api.get('/registrations/institution/scans');
      const mappedScans = res.data.map(log => ({
        id: log._id.substring(log._id.length - 6).toUpperCase(), // Short ID
        badgeCode: log.badgeCode,
        participant: { 
          name: log.participantId ? `${log.participantId.firstName} ${log.participantId.lastName}` : 'Inconnu', 
          avatar: log.participantId ? `${log.participantId.firstName?.[0] || 'U'}${log.participantId.lastName?.[0] || ''}` : '??' 
        },
        event: log.eventId?.title || 'Événement inconnu',
        agent: log.agentId ? `${log.agentId.firstName} ${log.agentId.lastName}` : 'Agent Inconnu',
        scannedAt: new Date(log.createdAt).toLocaleString('fr-FR'),
        result: log.result,
        message: log.message
      }));
      setScans(mappedScans);
    } catch (err) {
      toast.error('Erreur lors du chargement des scans.');
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/institution');
      setEvents(res.data);
    } catch (err) {}
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const uniqueEvents = [...new Set(scans.map(s => s.event))];

  const filteredScans = scans.filter(s => {
    const matchesSearch = s.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.badgeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResult = resultFilter === 'all' || s.result === resultFilter;
    const matchesEvent = eventFilter === 'all' || s.event === eventFilter;
    return matchesSearch && matchesResult && matchesEvent;
  });

  const validScans = scans.filter(s => s.result === 'valid').length;
  const failedScans = scans.filter(s => s.result !== 'valid').length;

  const handleExportCSV = () => {
    if (filteredScans.length === 0) {
      toast.error('Aucun scan à exporter.');
      return;
    }

    const headers = ['ID Scan', 'Horodatage', 'Participant', 'Code Badge', 'Événement', 'Agent', 'Résultat', 'Message'];
    const csvContent = [
      headers.join(','),
      ...filteredScans.map(s => [
        s.id,
        `"${s.scannedAt}"`,
        `"${s.participant.name}"`,
        s.badgeCode,
        `"${s.event}"`,
        `"${s.agent}"`,
        s.result,
        `"${s.message}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scans_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h2 className="text-2xl font-bold text-slate-900">Journal des Scans</h2>
          <p className="text-slate-500 text-sm mt-1">Historique en temps réel des vérifications de badges à l'entrée de vos événements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button onClick={() => setIsScanning(true)} className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d6efd] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
            <ScanLine className="w-4 h-4" />
            Scanner un badge
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Total Scans</p>
            <p className="text-2xl font-black text-slate-900">{scans.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full"></div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Accès autorisés</p>
            <p className="text-2xl font-black text-emerald-600">{validScans}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full"></div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 relative z-10">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-0.5">Refusés / Alertes</p>
            <p className="text-2xl font-black text-red-500">{failedScans}</p>
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
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full sm:w-48 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Tous les résultats</option>
              <option value="valid">Accès autorisé</option>
              <option value="already_used">Déjà scanné</option>
              <option value="cancelled">Annulé</option>
              <option value="invalid">Invalide</option>
              <option value="wrong_event">Mauvais événement</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Scans Table */}
      <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <th className="p-4 pl-6 border-r border-slate-200">Horodatage</th>
                <th className="p-4 border-r border-slate-200">Participant</th>
                <th className="p-4 border-r border-slate-200">Code Badge</th>
                <th className="p-4 border-r border-slate-200">Agent</th>
                <th className="p-4 border-r border-slate-200">Résultat</th>
                <th className="p-4 pr-6">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50 transition-colors border-b border-slate-200">
                    <td className="p-4 pl-6 border-r border-slate-200">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {scan.scannedAt}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{scan.id}</p>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div translate="no" className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${scan.result === 'invalid' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#0d6efd]'}`}>
                          {scan.participant.avatar}
                        </div>
                        <p className="font-bold text-sm text-slate-900">{scan.participant.name}</p>
                      </div>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <p translate="no" className="font-mono text-xs font-bold text-slate-700">{scan.badgeCode}</p>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <p className="text-sm font-medium text-slate-600">{scan.agent}</p>
                    </td>
                    <td className="p-4 border-r border-slate-200">
                      <ScanResultBadge result={scan.result} />
                    </td>
                    <td className="p-4 pr-6">
                      <p className="text-sm text-slate-600">{scan.message}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Aucun scan trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isScanning && (
          <ScannerModal 
            onClose={() => setIsScanning(false)} 
            onScanComplete={fetchScans}
            events={events}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default InstitutionScans;

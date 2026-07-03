import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Users, Eye, Ban, Shield, X, Mail, Phone, MapPin, Calendar, PieChart as PieChartIcon, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Computed dynamically inside the component

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const roleBadge = (role) => {
  const c = { 'Participant': 'bg-blue-50 text-blue-600', 'Admin Institution': 'bg-purple-50 text-purple-600', 'Super Admin': 'bg-red-50 text-red-600', 'Responsable Communication': 'bg-indigo-50 text-indigo-600' };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c[role] || 'bg-slate-50 text-slate-600'}`}>{role}</span>;
};

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex flex-col items-center p-8 border-b border-slate-100 bg-slate-50 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
          {user.avatar && user.avatar.startsWith('data:') ? (
            <img src={user.avatar} alt={user.fullName} className="w-20 h-20 rounded-full object-cover shadow-md mb-3" />
          ) : (
            <div translate="no" className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-md mb-3 ${user.role === 'Super Admin' ? 'bg-red-100 text-red-600' : user.role === 'Admin Institution' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-[#0d6efd]'}`}>{getInitials(user.fullName)}</div>
          )}
          <h3 className="text-xl font-bold text-slate-900">{user.fullName}</h3>
          <div className="mt-1">{roleBadge(user.role)}</div>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Mail className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{user.email}</p></div>
          {user.phone && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{user.phone}</p></div>}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{user.city || 'Guinée'}</p></div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Calendar className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p></div>
          {user.institutionId && <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><Shield className="w-4 h-4 text-slate-400 shrink-0" /><p className="text-sm font-semibold text-slate-700">{user.institutionId.name}</p></div>}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (isProcessing) return;
    const newStatus = user.isActive ? 'suspended' : 'active';
    const confirmMsg = user.isActive 
      ? `Voulez-vous vraiment suspendre le compte de ${user.fullName} ?` 
      : `Voulez-vous réactiver le compte de ${user.fullName} ?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsProcessing(true);
      await api.patch(`/auth/admin/users/${user._id}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === user._id ? { ...u, isActive: newStatus === 'active' } : u));
      toast.success(newStatus === 'active' ? "Utilisateur réactivé." : "Utilisateur suspendu.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const filtered = users.filter(u => {
    const s = (u.fullName || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const f = roleFilter === 'all' || u.role === roleFilter;
    return s && f;
  });

  const getDynamicChartData = () => {
    const dataMap = { 'Indépendants': 0 };
    users.forEach(u => {
      if (u.institutionId && u.institutionId.sigle) {
        if (!dataMap[u.institutionId.sigle]) dataMap[u.institutionId.sigle] = 0;
        dataMap[u.institutionId.sigle]++;
      } else {
        dataMap['Indépendants']++;
      }
    });
    const colors = ['#0d6efd', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e', '#64748b'];
    return Object.entries(dataMap)
      .sort((a, b) => b[1] - a[1]) // Sort by count desc
      .slice(0, 7) // Top 7 max
      .map(([name, value], i) => ({ name, value, color: name === 'Indépendants' ? '#64748b' : colors[i % colors.length] }));
  };

  const usersByInstitution = getDynamicChartData();

  // Custom tooltips for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
          <p className="font-bold text-slate-900">{payload[0].name}</p>
          <p className="text-sm font-medium text-slate-500">{payload[0].value.toLocaleString()} utilisateurs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
        <p className="text-slate-500 text-sm mt-1">Consultez, filtrez et gérez tous les comptes utilisateurs de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 text-[#0d6efd] rounded-xl flex items-center justify-center shrink-0"><Users className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">Total</p><p className="text-2xl font-black text-slate-900">{users.length}</p></div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0"><Shield className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">Admins Inst.</p><p className="text-2xl font-black text-slate-900">{users.filter(u => u.role === 'Admin Institution').length}</p></div></div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><CheckCircle className="w-6 h-6" /></div><div><p className="text-sm font-semibold text-slate-500">Actifs</p><p className="text-2xl font-black text-slate-900">{users.filter(u => u.isActive).length}</p></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de Gauche : Graphique de répartition */}
        <motion.div variants={item} className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[480px]">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
            <PieChartIcon className="w-5 h-5 text-amber-500" /> Répartition
          </h3>
          <p className="text-xs text-slate-500 mb-6">Utilisateurs par institution de rattachement</p>
          
          <div className="flex-1 w-full min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersByInstitution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {usersByInstitution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Centre du graphique (texte) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
              <span className="text-xl font-black text-slate-900 leading-none mt-0.5">{users.length}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {usersByInstitution.map((inst, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: inst.color }}></span>
                  <span className="font-semibold text-slate-700">{inst.name}</span>
                </div>
                <span className="font-black text-slate-900">{inst.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Colonne de Droite : Tableau des Utilisateurs */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="relative w-full sm:w-auto">
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full sm:w-48 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                <option value="all">Tous les rôles</option>
                <option value="Participant">Participants</option>
                <option value="Admin Institution">Admins Institution</option>
                <option value="Super Admin">Super Admin</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm border-collapse min-w-[700px] custom-admin-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                    <th className="p-4 pl-5">Utilisateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                  ) : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(u => (
                    <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="p-4 pl-5">
                        <div className="flex items-center gap-3">
                          {u.avatar && u.avatar.startsWith('data:') ? (
                            <img src={u.avatar} alt={u.fullName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div translate="no" className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${u.role === 'Super Admin' ? 'bg-red-100 text-red-600' : u.role === 'Admin Institution' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-[#0d6efd]'}`}>{getInitials(u.fullName)}</div>
                          )}
                          <p className="font-bold text-slate-900 whitespace-nowrap">{u.fullName}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 truncate max-w-[150px]">{u.email}</td>
                      <td className="p-4">{roleBadge(u.role)}</td>
                      <td className="p-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{u.isActive ? 'Actif' : 'Suspendu'}</span></td>
                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity opacity-100 lg:opacity-0">
                          <button onClick={() => setSelected({ ...u, name: u.fullName })} className="cursor-pointer w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Détails"><Eye className="w-4 h-4" /></button>
                          {u.role !== 'Super Admin' && (
                            <button onClick={() => handleToggleStatus(u)} className={`cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`} title={u.isActive ? 'Suspendre' : 'Réactiver'}>
                              {u.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">Aucun utilisateur trouvé.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filtered.length)} sur {filtered.length} utilisateurs
                </span>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 w-8 text-center">{currentPage}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>{selected && <UserDetailModal user={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminUsers;

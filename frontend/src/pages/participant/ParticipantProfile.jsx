import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Building, GraduationCap, MapPin, Camera, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ParticipantProfile = () => {
  const { user, updateUser } = useAuth(); // We use updateUser to avoid page refresh
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institution: '',
    studyLevel: '',
    city: '',
    avatar: null
  });

  useEffect(() => {
    if (user) {
      const names = user.fullName ? user.fullName.split(' ') : [];
      setProfile(prev => ({
        ...prev,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        institution: user.academicInstitution || '',
        studyLevel: user.studyLevel || '',
        city: user.city || '',
        avatar: user.avatar || null
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("La photo est trop volumineuse (max 2 Mo).");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      const res = await api.put('/auth/me', {
        fullName,
        phone: profile.phone,
        avatar: profile.avatar,
        academicInstitution: profile.institution,
        studyLevel: profile.studyLevel,
        city: profile.city
      });
      
      
      // Update local context to reflect changes instantly without reloading
      if (res.data) {
        updateUser({
          ...user,
          fullName: res.data.fullName,
          phone: res.data.phone,
          avatar: res.data.avatar,
          academicInstitution: res.data.academicInstitution,
          studyLevel: res.data.studyLevel,
          city: res.data.city
        });
      }
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mon Profil</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Gérez vos informations personnelles et universitaires.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full text-center relative overflow-hidden">
            <label className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer block">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full shadow-md border-4 border-slate-100" />
              ) : (
                <div className="w-full h-full bg-[#0A1F44] text-white rounded-full flex items-center justify-center text-4xl font-extrabold shadow-md border-4 border-slate-100 uppercase">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </label>
            
            <h3 className="text-lg font-bold text-slate-900">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Participant Certifié</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{profile.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Fields */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Informations de base</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prénom</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom de famille</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none transition-all text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-4">Cursus académique</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Université / Établissement d'enseignement</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  name="institution"
                  value={profile.institution}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Niveau d'études / Titre</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="studyLevel"
                    value={profile.studyLevel}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ville de résidence</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d6efd] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : (
                <>
                  <Save className="w-4 h-4" /> Enregistrer les modifications
                </>
              )}
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default ParticipantProfile;

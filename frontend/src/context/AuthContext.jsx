import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Permet d'attendre la vérification du token au 1er chargement

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté en regardant le localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Vérifie auprès du backend si le token actuel est toujours valide
  const verifyToken = async (storedToken) => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      // Si le token n'est plus valide (ex: expiré), on déconnecte
      console.warn("Token invalide ou expiré, déconnexion.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (loginId, password) => {
    const res = await api.post('/auth/login', { loginId, password });
    
    if (res.data && res.data.token) {
      const userData = {
        _id: res.data._id,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        institution: res.data.institution || null
      };
      
      setUser(userData);
      setToken(res.data.token);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return res.data; // Utile pour récupérer le rôle et faire la redirection dans LoginPage
    }
  };

  // Fonction d'inscription générique
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    
    if (res.data && res.data.token) {
      const uData = {
        _id: res.data._id,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        institution: res.data.institution || null
      };
      
      setUser(uData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(uData));
      
      return res.data;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const gradients = [
  { id: 1, name: 'Océan Guinée', from: '#1e40af', to: '#06b6d4', style: 'linear-gradient(to right, #1e40af, #06b6d4)' },
  { id: 2, name: 'Coucher Conakry', from: '#f59e0b', to: '#ef4444', style: 'linear-gradient(to right, #f59e0b, #ef4444)' },
  { id: 3, name: 'Forêt Guinéenne', from: '#065f46', to: '#22c55e', style: 'linear-gradient(to right, #065f46, #22c55e)' },
  { id: 4, name: 'Nuit Africaine', from: '#1e1b4b', to: '#7c3aed', style: 'linear-gradient(to right, #1e1b4b, #7c3aed)' },
  { id: 5, name: 'Or de Guinée', from: '#92400e', to: '#fbbf24', style: 'linear-gradient(to right, #92400e, #fbbf24)' },
  { id: 6, name: 'Aube Rosée', from: '#9d174d', to: '#f472b6', style: 'linear-gradient(to right, #9d174d, #f472b6)' },
  { id: 7, name: 'Ciel Futuriste', from: '#0c4a6e', to: '#818cf8', style: 'linear-gradient(to right, #0c4a6e, #818cf8)' },
  { id: 8, name: 'Terre Rouge', from: '#7f1d1d', to: '#f97316', style: 'linear-gradient(to right, #7f1d1d, #f97316)' }
];

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      applyTheme(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (data) => {
    if (!data) return;
    const { customization, betaFeatures } = data;
    
    if (customization) {
      const root = document.documentElement;
      
      if (customization.primaryColor) {
        root.style.setProperty('--color-primary', customization.primaryColor);
        root.style.setProperty('--color-primary-500', customization.primaryColor);
        root.style.setProperty('--color-primary-600', customization.primaryColor);
        root.style.setProperty('--color-primary-800', customization.primaryColor);
        root.style.setProperty('--color-primary-900', customization.primaryColor);
        
        // Also update text color so it affects text-primary-xxx classes immediately
        root.style.setProperty('--text-primary', customization.primaryColor);
      }
      
      if (customization.secondaryColor) {
        root.style.setProperty('--color-secondary', customization.secondaryColor);
        root.style.setProperty('--color-secondary-500', customization.secondaryColor);
        root.style.setProperty('--color-secondary-600', customization.secondaryColor);
        root.style.setProperty('--color-secondary-800', customization.secondaryColor);
        root.style.setProperty('--color-secondary-900', customization.secondaryColor);
        // Force background for secondary elements
        root.style.setProperty('--bg-secondary', customization.secondaryColor);
      }
      
      if (customization.accentColor) {
        root.style.setProperty('--color-accent', customization.accentColor);
      }
      
      if (customization.neutralColor) {
        root.style.setProperty('--color-neutral', customization.neutralColor);
      }

      // Handle Gradient
      if (customization.useGradient) {
        const style = customization.selectedGradientStyle || gradients.find(g => g.id === customization.selectedGradientId)?.style;
        if (style) root.style.setProperty('--gradient-primary', style);
        else root.style.setProperty('--gradient-primary', customization.primaryColor);
      } else {
        root.style.setProperty('--gradient-primary', customization.primaryColor);
      }
      
      if (customization.selectedFont) {
        root.style.setProperty('--font-family', customization.selectedFont);
        document.body.style.fontFamily = `"${customization.selectedFont}", sans-serif`;
      }
      
      if (customization.borderRadius !== undefined) {
        root.style.setProperty('--radius-sm', `${Math.max(0, customization.borderRadius - 4)}px`);
        root.style.setProperty('--radius-md', `${Math.max(0, customization.borderRadius - 2)}px`);
        root.style.setProperty('--radius-lg', `${customization.borderRadius}px`);
        root.style.setProperty('--radius-xl', `${customization.borderRadius + 4}px`);
        root.style.setProperty('--radius-2xl', `${customization.borderRadius + 8}px`);
        root.style.setProperty('--radius-3xl', `${customization.borderRadius + 16}px`);
      }
      
      // Handle Dark Mode dynamically
      const isDarkMode = customization.darkMode || (betaFeatures && betaFeatures.darkModeForced);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, isLoading, applyTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

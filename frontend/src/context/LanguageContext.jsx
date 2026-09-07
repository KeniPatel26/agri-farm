import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agri_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agri_language', language);
  }, [language]);

  // Translate helper function resolving nested dot paths (e.g., 'nav.home')
  const t = (path) => {
    try {
      const keys = path.split('.');
      let result = translations[language];
      for (const key of keys) {
        result = result[key];
      }
      return result || path;
    } catch {
      return path;
    }
  };

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

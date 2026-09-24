import React, { createContext, useContext, useMemo, useState } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

// To add a new language: import its JSON file above and add one entry here.
// No component code needs to change.
export const LOCALES = {
  en: { label: 'English', dict: en },
  hi: { label: 'हिन्दी', dict: hi },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('csap_lang') || 'en');

  const t = useMemo(() => {
    const dict = LOCALES[lang]?.dict || LOCALES.en.dict;
    return (key) => dict[key] || LOCALES.en.dict[key] || key;
  }, [lang]);

  const changeLang = (next) => {
    setLang(next);
    localStorage.setItem('csap_lang', next);
  };

  const value = useMemo(() => ({ lang, setLang: changeLang, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

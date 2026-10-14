import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../locales/en.json';
import knDict from '../locales/kn.json';
import hiDict from '../locales/hi.json';
import mrDict from '../locales/mr.json';
import bnDict from '../locales/bn.json';
import taDict from '../locales/ta.json';
import teDict from '../locales/te.json';
import mlDict from '../locales/ml.json';
import guDict from '../locales/gu.json';
import paDict from '../locales/pa.json';
import orDict from '../locales/or.json';
import asDict from '../locales/as.json';

// To add a new language: import its JSON file above and add one entry here.
// Order = order in the dropdown (English, then Kannada as priority 2). Missing keys fall back to English.
export const LOCALES = {
  en: { label: 'English', dict: en },
  kn: { label: 'ಕನ್ನಡ', dict: knDict },
  hi: { label: 'हिन्दी', dict: hiDict },
  mr: { label: 'मराठी', dict: mrDict },
  bn: { label: 'বাংলা', dict: bnDict },
  ta: { label: 'தமிழ்', dict: taDict },
  te: { label: 'తెలుగు', dict: teDict },
  ml: { label: 'മലയാളം', dict: mlDict },
  gu: { label: 'ગુજરાતી', dict: guDict },
  pa: { label: 'ਪੰਜਾਬੀ', dict: paDict },
  or: { label: 'ଓଡ଼ିଆ', dict: orDict },
  as: { label: 'অসমীয়া', dict: asDict },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('csap_lang') || 'en');

  const t = useMemo(() => {
    const dict = LOCALES[lang]?.dict || LOCALES.en.dict;
    return (key) => dict[key] || LOCALES.en.dict[key] || key;
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
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

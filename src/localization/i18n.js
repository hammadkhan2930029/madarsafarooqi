import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import en from './locales/en';
import ur from './locales/ur';
import { isRTL } from './direction';
import {
  getDeviceLanguage,
  loadLanguage,
  saveLanguage,
  SUPPORTED_LANGUAGES,
} from './languageStorage';

const resources = { en, ur };
const LocalizationContext = createContext(null);

const resolveKey = (source, key) =>
  key.split('.').reduce((value, part) => value?.[part], source);
const interpolate = (value, params = {}) =>
  String(value).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);

/** @param {{ children: React.ReactNode, fallback?: React.ReactNode }} props */
export const LocalizationProvider = ({ children, fallback = null }) => {
  const [language, setLanguageState] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await loadLanguage();
      const initial = saved || getDeviceLanguage();
      if (!saved) await saveLanguage(initial);
      if (mounted) {
        setLanguageState(initial);
        setReady(true);
      }
    })().catch(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback(async nextLanguage => {
    const safeLanguage = SUPPORTED_LANGUAGES.includes(nextLanguage)
      ? nextLanguage
      : 'en';
    setLanguageState(safeLanguage);
    await saveLanguage(safeLanguage);
  }, []);

  const t = useCallback(
    (key, params) => {
      const value =
        resolveKey(resources[language], key) ??
        resolveKey(resources.en, key) ??
        key;
      return interpolate(value, params);
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, isRTL: isRTL(language), ready }),
    [language, setLanguage, t, ready],
  );
  return (
    <LocalizationContext.Provider value={value}>
      {ready ? children : fallback}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LocalizationContext);
  if (!context)
    throw new Error('useTranslation must be used inside LocalizationProvider.');
  return context;
};

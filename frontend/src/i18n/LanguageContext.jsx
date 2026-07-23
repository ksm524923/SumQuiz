/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const STORAGE_KEY = "hwv-language";
const supported = ["ko", "en", "ja"];
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return supported.includes(saved) ? saved : "ko";
  });

  function setLanguage(nextLanguage) {
    const normalized = supported.includes(nextLanguage) ? nextLanguage : "ko";
    localStorage.setItem(STORAGE_KEY, normalized);
    document.documentElement.lang = normalized;
    setLanguageState(normalized);
  }

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key) => translations[language]?.[key] ?? translations.ko[key] ?? key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function getSavedLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return supported.includes(saved) ? saved : "ko";
}

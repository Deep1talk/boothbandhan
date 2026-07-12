"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLanguage = window.localStorage.getItem("bb-language");
    return savedLanguage === "hi" ? "hi" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    if (nextLanguage !== "hi" && nextLanguage !== "en") {
      return;
    }

    setLanguageState(nextLanguage);
    window.localStorage.setItem("bb-language", nextLanguage);
    document.documentElement.lang = nextLanguage === "hi" ? "hi" : "en";
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "hi" ? "en" : "hi");
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

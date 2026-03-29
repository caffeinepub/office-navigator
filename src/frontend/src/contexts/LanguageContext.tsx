import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  LANGUAGE_NAMES,
  type LangCode,
  type TranslationKey,
  translations,
} from "../i18n/translations";

const STORAGE_KEY = "wc_language";

interface LanguageContextValue {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: TranslationKey) => string;
  languageNames: typeof LANGUAGE_NAMES;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): LangCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && stored in LANGUAGE_NAMES) return stored;
  } catch {
    // ignore
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>(getInitialLanguage);

  const setLanguage = useCallback((lang: LangCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    // Handle RTL for Arabic
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, []);

  // Set dir on mount
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const langTranslations = translations[language];
      if (langTranslations && key in langTranslations) {
        return langTranslations[key];
      }
      // Fallback to English
      return translations.en[key] ?? key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, languageNames: LANGUAGE_NAMES }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

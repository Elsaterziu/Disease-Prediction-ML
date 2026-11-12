import { useCallback, useEffect, useMemo, useState } from "react";
import { LANGUAGES, LanguageContext } from "./languageContext";
import { MESSAGES } from "./messages";

const STORAGE_KEY = "symptom2disease-language";

// The language choice is a per-viewer convenience, so localStorage is enough.
// Storage can be unavailable (private mode), so every access is guarded.
function readSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.includes(saved) ? saved : "en";
  } catch {
    return "en";
  }
}

// "Hello {name}" + { name: "Ana" } -> "Hello Ana"
const interpolate = (text, vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`)) : text;

function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readSavedLanguage);

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved; the choice still applies for this visit.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, vars) => interpolate(MESSAGES[lang][key] ?? MESSAGES.en[key] ?? key, vars);
    return { lang, setLang, t };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export default LanguageProvider;

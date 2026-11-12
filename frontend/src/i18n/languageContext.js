import { createContext, useContext } from "react";

export const LANGUAGES = ["en", "sq"];

export const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

// { lang, setLang, t } for the current interface language.
export const useLanguage = () => useContext(LanguageContext);

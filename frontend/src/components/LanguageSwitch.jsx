import { Languages } from "lucide-react";
import { useLanguage } from "../i18n/languageContext";

function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label={t("lang.label")}>
      <Languages size={15} aria-hidden="true" />
      {[
        ["sq", "SQ", t("lang.sq")],
        ["en", "EN", t("lang.en")],
      ].map(([code, short, name]) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={lang === code ? "active" : ""}
          aria-pressed={lang === code}
          aria-label={name}
          title={name}
          onClick={() => setLang(code)}
        >
          {short}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitch;

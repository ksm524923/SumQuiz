import { Globe2 } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import "./LanguageSelector.css";

const options = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
];

function LanguageSelector({ compact = false }) {
  const detailsRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();

  function chooseLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <details ref={detailsRef} className={`language-selector${compact ? " language-selector--compact" : ""}`}>
      <summary aria-label={t("language")} title={t("language")}><Globe2 aria-hidden="true" /></summary>
      <div className="language-selector__menu">
        {options.map((option) => (
          <button key={option.value} type="button" className={language === option.value ? "language-selector__option--active" : ""} onClick={() => chooseLanguage(option.value)}>
            {option.label}<span>{language === option.value ? "✓" : ""}</span>
          </button>
        ))}
      </div>
    </details>
  );
}

export default LanguageSelector;

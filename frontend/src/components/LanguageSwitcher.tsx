import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "ky", label: "KG" },
  { code: "ru", label: "RU" },
];

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();

  return (
    <div className={`flex items-center gap-1 rounded-lg bg-ink-50 p-1 ${className || ""}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 ${
            i18n.language === lang.code
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-400 hover:text-ink-700"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
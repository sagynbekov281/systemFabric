import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface OvalDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const OvalDropdown: React.FC<OvalDropdownProps> = ({ value, onChange, options, placeholder, className }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className || ""}`} ref={containerRef}>
      <button
        type="button"
        className="select-pill flex items-center justify-between gap-3"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate text-left">{selectedOption?.label || placeholder || t("common.select")}</span>
        <span
          className={`text-ink-400 text-xs transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-ink-100 bg-white py-1.5 shadow-soft"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setOpen(false);
                  }
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
                  option.disabled
                    ? "cursor-not-allowed text-ink-400/60"
                    : "cursor-pointer text-ink-700 hover:bg-milk-50"
                } ${isSelected ? "bg-milk-50 font-semibold text-milk-700" : ""}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <span className="shrink-0 text-milk-500">✓</span>}
              </button>
            );
          })}
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-ink-400">{t("common.noOptions")}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default OvalDropdown;
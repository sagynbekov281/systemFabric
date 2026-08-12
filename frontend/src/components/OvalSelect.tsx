import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface OvalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const OvalSelect: React.FC<OvalSelectProps> = ({ value, onChange, options, placeholder, className }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
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
      >
        <span className="truncate text-left">{selectedOption?.label || placeholder || t("common.select")}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-3xl border border-ink-50 bg-white shadow-soft">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              disabled={option.disabled}
              className={`w-full px-5 py-3 text-left text-sm text-ink-700 transition-colors duration-150 hover:bg-ink-50 ${
                option.value === value ? "bg-milk-50" : ""
              } ${option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OvalSelect;
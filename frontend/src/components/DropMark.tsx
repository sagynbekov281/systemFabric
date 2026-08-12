import React from "react";
import logoIcon from "../assets/favicon.icon.png";

/**
 * Фирменный знак: иконка логотипа "Мыйзам" (горы + капля).
 * Используется в сайдбаре, мобильной шапке и как decorative watermark.
 */
const DropMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => (
  <img
    src={logoIcon}
    alt="Мыйзам"
    width={size}
    height={size}
    className={className}
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);

export default DropMark;
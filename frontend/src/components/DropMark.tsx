import React from "react";

/**
 * Фирменный знак: капля молока в фирменном зелёном градиенте.
 * Используется в сайдбаре, на странице входа и как decorative watermark.
 */
const DropMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="dropGradient" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2E9E5B" />
        <stop offset="55%" stopColor="#1D8049" />
        <stop offset="100%" stopColor="#124D2D" />
      </linearGradient>
    </defs>
    <path
      d="M16 2.5C16 2.5 6 14.5 6 21C6 26.5228 10.4772 30 16 30C21.5228 30 26 26.5228 26 21C26 14.5 16 2.5 16 2.5Z"
      fill="url(#dropGradient)"
    />
    <ellipse cx="12" cy="19" rx="2.4" ry="3.2" fill="white" fillOpacity="0.35" />
  </svg>
);

export default DropMark;
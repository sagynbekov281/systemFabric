/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#FAFAF9",
          100: "#F1F1EE",
          200: "#E4E4DF",
        },
        ink: {
          50: "#F2F4F3",
          100: "#E3E7E5",
          400: "#66716D",
          500: "#3F4A46",
          700: "#212B27",
          900: "#121815",
        },
        milk: {
          50: "#EAF6EE",
          100: "#CDEBD7",
          200: "#9AD4AC",
          400: "#2E9E5B",
          500: "#1D8049",
          600: "#166339",
          700: "#124D2D",
        },
        // Accent + sidebar gradient scale
        sprout: {
          50: "#EAFBF1",
          100: "#CFF5DE",
          200: "#98E6B8",
          300: "#5BD190",
          400: "#2CB874",
          500: "#16A05F",
          600: "#0E8049",
          700: "#0B6339",
          800: "#0A4E2E",
          900: "#082E1C",
        },
        gold: {
          50: "#FDF3E0",
          100: "#F8DFA8",
          400: "#E0A526",
          500: "#BD8814",
          600: "#966B0D",
        },
        plum: {
          50: "#EDEFFA",
          400: "#6367B5",
          500: "#4B4F94",
          600: "#3A3E76",
        },
        clay: {
          50: "#FCEAE8",
          100: "#F7D2CC",
          400: "#E15C4B",
          500: "#C63F2D",
          600: "#9E3122",
        },
      },
      borderRadius: {
        "4xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,24,21,0.04), 0 6px 16px -8px rgba(18,24,21,0.10)",
        "card-hover": "0 14px 28px -10px rgba(11,99,57,0.25)",
        popover: "0 4px 12px rgba(18,24,21,0.08), 0 16px 32px -12px rgba(18,24,21,0.14)",
        focus: "0 0 0 3px rgba(29,128,73,0.16)",
        "focus-sprout": "0 0 0 3px rgba(22,160,95,0.16)",
        "btn-glow": "0 1px 2px rgba(11,99,57,.15), 0 4px 12px -4px rgba(11,99,57,.35)",
        "btn-glow-hover": "0 6px 16px -4px rgba(11,99,57,.45)",
        "fab": "0 8px 20px -6px rgba(11,99,57,.5)",
        "fab-hover": "0 12px 26px -6px rgba(11,99,57,.6)",
        "sidebar-active": "0 4px 14px -4px rgba(0,0,0,.35)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-300px 0" },
          "100%": { backgroundPosition: "300px 0" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(22,160,95,0.35)" },
          "100%": { boxShadow: "0 0 0 10px rgba(22,160,95,0)" },
        },
        bounceDot: {
          "0%, 80%, 100%": { opacity: "0.25", transform: "translateY(0)" },
          "40%": { opacity: "1", transform: "translateY(-3px)" },
        },
        floatY: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-4px)" },
  },
      },
      animation: {
  "fade-up": "fadeUp .5s ease forwards",
  "slide-down": "slideDown .4s ease forwards",
  "slide-in-right": "slideInRight .35s ease forwards",
  "pop-in": "popIn .3s cubic-bezier(.34,1.56,.64,1) forwards",
  shimmer: "shimmer 1.6s ease-in-out infinite",
  "pulse-ring": "pulseRing 2.4s infinite",
  "bounce-dot": "bounceDot 1.2s infinite ease-in-out",
  float: "floatY 3.5s ease-in-out infinite",
  "float-fast": "floatY 1.6s ease-in-out infinite",
},
    },
  },
  plugins: [],
}
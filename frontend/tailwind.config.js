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
        // Primary — natural dairy green, the one consistent brand color
        milk: {
          50: "#EAF6EE",
          100: "#CDEBD7",
          200: "#9AD4AC",
          400: "#2E9E5B",
          500: "#1D8049",
          600: "#166339",
          700: "#124D2D",
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
        // A single consistent elevation used everywhere — cards, dropdowns, modals
        card: "0 1px 2px rgba(18,24,21,0.04), 0 6px 16px -8px rgba(18,24,21,0.10)",
        popover: "0 4px 12px rgba(18,24,21,0.08), 0 16px 32px -12px rgba(18,24,21,0.14)",
        focus: "0 0 0 3px rgba(29,128,73,0.16)",
      },
    },
  },
  plugins: [],
}
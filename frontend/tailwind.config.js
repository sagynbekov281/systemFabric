/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#F7F1E6",
          200: "#EFE5D2",
        },
        ink: {
          50: "#F3F5F4",
          400: "#7A8A87",
          500: "#5C6E6A",
          700: "#2C3A38",
          900: "#1B2624",
        },
        milk: {
          50: "#EEF6F2",
          100: "#DAEBE2",
          200: "#B3D6C4",
          400: "#3E8E75",
          500: "#1F6F5C",
          600: "#195B4B",
          700: "#123F34",
        },
        gold: {
          50: "#FDF6E7",
          100: "#FAEAC2",
          400: "#EFB84A",
          500: "#E0A428",
          600: "#BC8619",
        },
        plum: {
          50: "#F5F0F6",
          400: "#9B7AAB",
          500: "#7C5C8C",
          600: "#674A73",
        },
        clay: {
          50: "#FBEFEC",
          400: "#D0685A",
          500: "#C0453A",
          600: "#A3382F",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,38,36,0.04), 0 12px 28px -10px rgba(27,38,36,0.12)",
        softer: "0 1px 2px rgba(27,38,36,0.03), 0 6px 16px -6px rgba(27,38,36,0.08)",
        glow: "0 8px 30px -6px rgba(31,111,92,0.35)",
      },
      backgroundImage: {
        "wave-cream": "radial-gradient(120% 120% at 100% 0%, #EFE5D2 0%, #FDFBF7 55%)",
      },
    },
  },
  plugins: [],
}

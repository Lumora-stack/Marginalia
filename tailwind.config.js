/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0C0C0D',
        paper: '#F7F5F1',
        accent: '#D4AF37',
        'accent-light': '#E8C84A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        blob: "blob 12s infinite",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        'spin-slow': "spin 25s linear infinite",
        glow: "glow 3s ease-in-out infinite",
        'fade-up': "fadeUp 0.7s ease-out forwards",
        'bounce-slow': "bounce 2s infinite",
      },
      keyframes: {
        blob: {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(30px, -50px) scale(1.15)" },
          "66%":  { transform: "translate(-20px, 20px) scale(0.85)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-16px)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,175,55,0.2)" },
          "50%":      { boxShadow: "0 0 40px rgba(212,175,55,0.5)" },
        },
      },
    },
  },
  plugins: [],
}

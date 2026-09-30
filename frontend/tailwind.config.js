/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        surface: "#0e131f",
        "surface-raised": "#151c2e",
        "surface-card": "#1a233a",
        border: "#242e47",
        "border-glow": "#334166",
        accent: "#f97316",
        "accent-hover": "#fb923c",
        "accent-dim": "#c2410c",
        "flame-red": "#ef4444",
        "flame-orange": "#f97316",
        "flame-gold": "#eab308",
        "cyber-cyan": "#06b6d4",
        "cyber-emerald": "#10b981",
        "cyber-purple": "#8b5cf6",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "flame-gradient": "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)",
        "dark-gradient": "linear-gradient(180deg, #0e131f 0%, #080b11 100%)",
      },
      boxShadow: {
        "flame-glow": "0 0 35px -5px rgba(249, 115, 22, 0.35)",
        "flame-glow-sm": "0 0 15px -3px rgba(249, 115, 22, 0.25)",
        "card-glow": "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flame-flicker": "flicker 2s ease-in-out infinite alternate",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: 0.9, filter: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.6))" },
          "50%": { opacity: 1, filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))" },
        },
      },
    },
  },
  plugins: [],
};

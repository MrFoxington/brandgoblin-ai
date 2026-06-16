import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        goblin: {
          bg: "#0b0a14",
          panel: "#13111f",
          border: "#241f38",
          purple: {
            DEFAULT: "#8b5cf6",
            light: "#a78bfa",
            dark: "#6d28d9",
          },
          emerald: {
            DEFAULT: "#34d399",
            light: "#6ee7b7",
            dark: "#059669",
          },
        },
      },
      backgroundImage: {
        "goblin-glow":
          "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.25), transparent 60%), radial-gradient(circle at 80% 80%, rgba(52,211,153,0.15), transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 25px rgba(139,92,246,0.45)",
        "glow-emerald": "0 0 25px rgba(52,211,153,0.35)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 15px rgba(139,92,246,0.4)" },
          "50%": { opacity: "1", boxShadow: "0 0 35px rgba(139,92,246,0.8)" },
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

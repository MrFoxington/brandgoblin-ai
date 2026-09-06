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
        bg: "#0a0a0f",
        surface: "rgba(15,15,26,0.8)",
        border: "rgba(45,45,78,0.8)",
        primary: {
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
        },
        secondary: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        muted: "#94a3b8",
        faint: "#64748b",
        // ── Brand Maturity P4 (Sept 2026) — the grown-up marketing palette ──
        // Warm off-white paper, ink text, goblin green as THE action colour,
        // gold in small doses. Purple (#7C3AED) is Nix's personal colour and is
        // only allowed where Nix himself appears (see `nix`).
        paper: {
          DEFAULT: "#FAF7F2",
          2: "#F3EEE6",
          3: "#ECE5DA",
        },
        ink: {
          DEFAULT: "#141518",
          2: "#2A2C31",
          muted: "#575A62",
          faint: "#8B8E96",
        },
        goblin: {
          DEFAULT: "#2E7D5B",
          dark: "#256649",
          light: "#DCEDE4",
          tint: "#EEF6F1",
        },
        gold: {
          DEFAULT: "#FBBF24",
          dark: "#9A6B00",
          tint: "#FFF6DC",
        },
        nix: "#7C3AED",
        line: {
          DEFAULT: "#E6DFD3",
          2: "#D9D0C2",
        },
      },
      fontFamily: {
        // Resolved through CSS variables so the marketing scope can swap the
        // whole type system without touching a single component class
        // (defaults live on `body`, overrides on `.theme-marketing` in globals.css).
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(180deg, #0d0d1a 0%, #0a0a0f 100%)",
        "hero-mesh":
          "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)",
        "cta-gradient":
          "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
        "text-gradient":
          "linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #10b981 100%)",
        "section-alt":
          "linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 100%)",
      },
      boxShadow: {
        glow: "0 0 28px rgba(124,58,237,0.45)",
        "glow-lg": "0 0 48px rgba(124,58,237,0.75)",
        "glow-green": "0 0 28px rgba(16,185,129,0.35)",
        card: "0 0 30px rgba(124,58,237,0.15)",
        "studio-glow": "0 0 12px rgba(251,191,36,0.45), 0 0 24px rgba(251,191,36,0.2)",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        shimmer: "shimmer 2.8s ease-in-out infinite",
        particle: "particle 6s ease-in-out infinite",
        "studio-glow": "studio-glow 2s ease-in-out infinite",
        "conjure-pulse": "conjure-pulse 2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 28px rgba(255,107,53,0.45)" },
          "50%": { boxShadow: "0 0 48px rgba(255,107,53,0.7)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        particle: {
          "0%, 100%": { transform: "translateY(0px)", opacity: "0.3" },
          "50%": { transform: "translateY(-30px)", opacity: "0.8" },
        },
        "studio-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(251,191,36,0.4), 0 0 16px rgba(251,191,36,0.2)" },
          "50%":       { boxShadow: "0 0 16px rgba(251,191,36,0.7), 0 0 32px rgba(251,191,36,0.35)" },
        },
        "conjure-pulse": {
          "0%, 100%": { boxShadow: "0 0 16px rgba(255,107,53,0.45), 0 0 32px rgba(255,107,53,0.2)" },
          "50%":       { boxShadow: "0 0 28px rgba(255,107,53,0.7), 0 0 56px rgba(255,107,53,0.35)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

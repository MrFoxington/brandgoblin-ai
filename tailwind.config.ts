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
        // ── Creator Studio Phase A (Sept 6, 2026): the dark studio ──
        // Warm ink surfaces, paper text. `primary` is now goblin GREEN so every
        // existing border-primary/20, bg-primary/5, text-primary-light tint in
        // the app turns green in one move. Purple lives only in `nix`.
        bg: "#141518",
        surface: "#1B1D22",
        raised: "#22252B",
        border: "rgba(250,247,242,0.08)",
        primary: {
          DEFAULT: "#2E7D5B",
          light: "#8FD9B3",
        },
        secondary: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        // THE SPARK — the one orange action per screen (create / buy).
        spark: {
          DEFAULT: "#FF6B35",
          hover: "#FF7A48",
        },
        muted: "rgba(250,247,242,0.62)",
        faint: "rgba(250,247,242,0.42)",
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
        // Ink-era values: one soft tint at most, no multi-stop purple washes.
        "hero-gradient":
          "linear-gradient(180deg, #17191E 0%, #141518 100%)",
        "hero-mesh":
          "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(46,125,91,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(251,191,36,0.06) 0%, transparent 60%)",
        "cta-gradient":
          "linear-gradient(135deg, #2E7D5B 0%, #2E7D5B 100%)",
        "text-gradient":
          "linear-gradient(135deg, #8FD9B3 0%, #8FD9B3 100%)",
        "section-alt":
          "linear-gradient(180deg, #141518 0%, #17191E 100%)",
      },
      boxShadow: {
        // "glow" is now a quiet green ring, not a purple halo.
        glow: "0 0 0 1px rgba(46,125,91,0.35), 0 12px 32px -20px rgba(46,125,91,0.4)",
        "glow-lg": "0 0 0 1px rgba(46,125,91,0.5), 0 20px 48px -24px rgba(46,125,91,0.5)",
        "glow-green": "0 0 0 1px rgba(16,185,129,0.35), 0 12px 32px -20px rgba(16,185,129,0.4)",
        card: "0 12px 32px -20px rgba(0,0,0,0.6)",
        "studio-glow": "0 0 0 1px rgba(251,191,36,0.35), 0 12px 28px -18px rgba(251,191,36,0.35)",
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
          "0%, 100%": { boxShadow: "0 10px 24px -12px rgba(255,107,53,0.55)" },
          "50%": { boxShadow: "0 12px 28px -12px rgba(255,107,53,0.7)" },
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
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(251,191,36,0.3)" },
          "50%":       { boxShadow: "0 0 0 1px rgba(251,191,36,0.55)" },
        },
        "conjure-pulse": {
          "0%, 100%": { boxShadow: "0 10px 24px -12px rgba(255,107,53,0.55)" },
          "50%":       { boxShadow: "0 12px 28px -12px rgba(255,107,53,0.7)" },
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

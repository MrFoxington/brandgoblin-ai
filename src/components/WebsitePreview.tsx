"use client";

// ── Website Preview ───────────────────────────────────────────────────────────
// Renders the brand kit's REAL website copy + palette as a live homepage
// mockup. Zero AI cost — it's the user's existing kit data, made visible.
// Built July 10, 2026, live on camera (founder build session #1). 🎬
//
// Design notes:
// - Colors come from the kit's own palette hexes via inline styles (Tailwind
//   can't do runtime colors). We pick: darkest swatch = background, brightest
//   = accent, and derive readable text colors.
// - Everything degrades gracefully — old kits without features/faqs/footer
//   fields still render a complete-looking page.

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BrandKit } from "@/types";

// Perceived luminance (0 dark → 255 light) for picking readable colors
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 128;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function pickColors(kit: BrandKit) {
  const swatches = (kit.colorPalette ?? [])
    .filter((s) => /^#?[0-9a-fA-F]{6}$/.test((s.hex ?? "").replace("#", "").padEnd(6, "").slice(0, 6)) && s.hex)
    .map((s) => ({ ...s, hex: s.hex.startsWith("#") ? s.hex : `#${s.hex}` }));

  if (swatches.length === 0) {
    return { bg: "#0f0f17", accent: "#7C5CFF", accentText: "#ffffff", text: "#ffffff", subtext: "rgba(255,255,255,0.72)", card: "rgba(255,255,255,0.06)" };
  }

  const sorted = [...swatches].sort((a, b) => luminance(a.hex) - luminance(b.hex));
  const bgSwatch = sorted[0]; // darkest = page background
  // Accent = most saturated-looking mid/bright swatch that isn't the background
  const accentSwatch = sorted.slice(1).sort((a, b) => luminance(b.hex) - luminance(a.hex))[Math.min(1, sorted.length - 2)] ?? sorted[sorted.length - 1];

  const bgIsDark = luminance(bgSwatch.hex) < 128;
  return {
    bg: bgSwatch.hex,
    accent: accentSwatch.hex,
    accentText: luminance(accentSwatch.hex) < 140 ? "#ffffff" : "#111111",
    text: bgIsDark ? "#ffffff" : "#111111",
    subtext: bgIsDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)",
    card: bgIsDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
  };
}

export default function WebsitePreview({
  kit,
  isOpen,
  onClose,
}: {
  kit: BrandKit;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const w = kit.websiteCopy;
  const c = pickColors(kit);
  const name = kit.recommendedName;
  const features: { title: string; description: string }[] =
    w.features && w.features.length > 0
      ? w.features.slice(0, 6)
      : (w.featureBullets ?? []).slice(0, 6).map((b) => ({ title: b, description: "" }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              🌐 <span className="hidden sm:inline">Website Preview —</span> built from your brand kit
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">
                Mockup
              </span>
            </p>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {/* Browser frame */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mb-4 flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/15 shadow-2xl min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 bg-[#1b1b24] px-4 py-2.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <div className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-white/50">
                {name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com
              </div>
            </div>

            {/* The rendered homepage */}
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: c.bg, color: c.text }}>

              {/* Site nav */}
              <div className="flex items-center justify-between px-6 sm:px-10 py-5">
                <p className="font-display text-lg font-black tracking-tight">{name}</p>
                <span
                  className="rounded-full px-4 py-1.5 text-xs font-bold"
                  style={{ backgroundColor: c.accent, color: c.accentText }}
                >
                  {w.ctaText}
                </span>
              </div>

              {/* Hero */}
              <div className="px-6 sm:px-10 pt-10 pb-14 text-center max-w-3xl mx-auto">
                <h1 className="font-display text-3xl sm:text-5xl font-black leading-tight">
                  {w.heroHeadline}
                </h1>
                <p className="mt-4 text-base sm:text-lg" style={{ color: c.subtext }}>
                  {w.subheadline}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <span
                    className="rounded-xl px-6 py-3 text-sm font-bold shadow-lg"
                    style={{ backgroundColor: c.accent, color: c.accentText }}
                  >
                    {w.ctaText}
                  </span>
                  {w.secondaryCtaText && (
                    <span
                      className="rounded-xl border px-6 py-3 text-sm font-semibold"
                      style={{ borderColor: c.subtext, color: c.text }}
                    >
                      {w.secondaryCtaText}
                    </span>
                  )}
                </div>
                {kit.taglines?.[0] && (
                  <p className="mt-6 text-xs italic" style={{ color: c.subtext }}>
                    &ldquo;{kit.taglines[0]}&rdquo;
                  </p>
                )}
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="px-6 sm:px-10 pb-14 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f, i) => (
                      <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: c.card }}>
                        <p className="text-sm font-bold">{f.title}</p>
                        {f.description && (
                          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: c.subtext }}>
                            {f.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              <div className="px-6 sm:px-10 pb-14 max-w-2xl mx-auto text-center">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: c.accent }}>
                  About {name}
                </p>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: c.subtext }}>
                  {w.aboutSection}
                </p>
              </div>

              {/* Email capture */}
              {w.emailCaptureHeadline && (
                <div className="px-6 sm:px-10 pb-14 max-w-xl mx-auto">
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: c.card }}>
                    <p className="font-display text-lg font-bold">{w.emailCaptureHeadline}</p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <span
                        className="flex-1 max-w-[220px] rounded-lg border px-3 py-2 text-left text-xs"
                        style={{ borderColor: c.subtext, color: c.subtext }}
                      >
                        you@email.com
                      </span>
                      <span
                        className="rounded-lg px-4 py-2 text-xs font-bold"
                        style={{ backgroundColor: c.accent, color: c.accentText }}
                      >
                        Sign up
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div
                className="px-6 sm:px-10 py-8 text-center text-xs"
                style={{ backgroundColor: "rgba(0,0,0,0.25)", color: c.subtext }}
              >
                <p className="font-display text-sm font-bold" style={{ color: c.text }}>{name}</p>
                {w.footerTagline && <p className="mt-1.5 italic">{w.footerTagline}</p>}
                <p className="mt-3 opacity-70">© {new Date().getFullYear()} {name} · Made with BrandGoblin AI 🧌</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

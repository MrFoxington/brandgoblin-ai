"use client";

// ── Website Preview v2 ────────────────────────────────────────────────────────
// v1 verdict (Fox, July 10 2026): "flat, empty, worse than not showing it."
// v2 principles:
//   1. LIGHT — layered radial glows from the brand's own palette, never flat paint.
//   2. THEIR ART — official logo in the nav, product art as the hero visual,
//      mascot at the email capture. Pulled live from their Studio creations.
//   3. BIG TYPE — hero speaks at 7xl with a gradient accent, not a whisper.
//   4. MOTION — sections reveal as you scroll, like the rest of BrandGoblin.
//   5. LAUNCHPAD — "Copy website prompt" turns the preview into their next step.

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { BrandKit } from "@/types";
import { trackEvent } from "@/lib/analytics";

interface StudioJobLite {
  id: string;
  status: string;
  brand_id: string | null;
  image_type: string | null;
  job_type: string | null;
  output_url: string | null;
  official_logo?: boolean;
  archived?: boolean;
}

// ── Color engine ──────────────────────────────────────────────────────────────
function parseHex(hex?: string): string | null {
  if (!hex) return null;
  const h = hex.trim().replace("#", "");
  return /^[0-9a-fA-F]{6}$/.test(h) ? `#${h.toLowerCase()}` : null;
}
function rgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}
function luminance(hex: string): number {
  const { r, g, b } = rgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function chroma(hex: string): number {
  const { r, g, b } = rgb(hex);
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function buildTheme(kit: BrandKit) {
  const swatches = (kit.colorPalette ?? [])
    .map((s) => parseHex(s.hex))
    .filter((h): h is string => !!h);

  // Fallback: BrandGoblin-ish night theme
  if (swatches.length === 0) {
    return {
      bg: "#0b0b13", accent: "#7C5CFF", accent2: "#2CE5A7",
      text: "#ffffff", subtext: "rgba(255,255,255,0.72)",
      card: "rgba(255,255,255,0.06)", accentText: "#ffffff",
    };
  }

  const byLum = [...swatches].sort((a, b) => luminance(a) - luminance(b));
  const bg = byLum[0];
  // Most vivid non-background colors carry the energy
  const vivid = swatches
    .filter((h) => h !== bg)
    .sort((a, b) => chroma(b) - chroma(a));
  const accent = vivid[0] ?? byLum[byLum.length - 1];
  const accent2 = vivid[1] ?? accent;

  const bgIsDark = luminance(bg) < 128;
  return {
    bg,
    accent,
    accent2,
    accentText: luminance(accent) < 140 ? "#ffffff" : "#111111",
    text: bgIsDark ? "#ffffff" : "#15151d",
    subtext: bgIsDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)",
    card: bgIsDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
  };
}

// Split the headline so the last 1-2 words get the gradient treatment
function splitHeadline(headline: string): { plain: string; gradient: string } {
  const words = headline.trim().split(/\s+/);
  if (words.length < 3) return { plain: "", gradient: headline };
  const take = words.length > 5 ? 2 : 1;
  return {
    plain: words.slice(0, words.length - take).join(" ") + " ",
    gradient: words.slice(words.length - take).join(" "),
  };
}

// A paste-ready brief for any AI website builder (Airo, Framer, Lovable, v0…)
function buildSitePrompt(kit: BrandKit): string {
  const w = kit.websiteCopy;
  const colors = (kit.colorPalette ?? [])
    .map((c) => `${c.name} ${c.hex}${c.usage ? ` (${c.usage})` : ""}`)
    .join("; ");
  const traits = kit.brandVoice?.personalityTraits?.join(", ") ?? "";
  const features = (w.features && w.features.length > 0
    ? w.features.map((f) => `- ${f.title}: ${f.description}`)
    : (w.featureBullets ?? []).map((b) => `- ${b}`)
  ).join("\n");
  const faqs = (w.faqs ?? []).map((q) => `- ${q.question} → ${q.answer}`).join("\n");

  return [
    `Build a polished one-page website for my brand "${kit.recommendedName}".`,
    ``,
    `HERO`,
    `Headline: ${w.heroHeadline}`,
    `Subheadline: ${w.subheadline}`,
    `Primary button: ${w.ctaText}${w.secondaryCtaText ? ` · Secondary button: ${w.secondaryCtaText}` : ""}`,
    kit.taglines?.[0] ? `Tagline: ${kit.taglines[0]}` : ``,
    ``,
    `ABOUT`,
    w.aboutSection,
    ``,
    features ? `FEATURES\n${features}\n` : ``,
    faqs ? `FAQ\n${faqs}\n` : ``,
    w.emailCaptureHeadline ? `EMAIL SIGNUP: ${w.emailCaptureHeadline}` : ``,
    w.footerTagline ? `FOOTER TAGLINE: ${w.footerTagline}` : ``,
    ``,
    `DESIGN DIRECTION`,
    colors ? `Colors: ${colors}` : ``,
    traits ? `Brand personality: ${traits}` : ``,
    `Style: modern, premium, generous white space, large confident typography, subtle gradients and depth. Mobile-first. No stock-photo clichés.`,
    kit.websiteCopy.seoTitle ? `SEO title: ${kit.websiteCopy.seoTitle}` : ``,
    kit.websiteCopy.metaDescription ? `Meta description: ${kit.websiteCopy.metaDescription}` : ``,
  ].filter((l) => l !== ``).join("\n");
}

export default function WebsitePreview({
  kit,
  brandId,
  isOpen,
  onClose,
}: {
  kit: BrandKit;
  brandId?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<{ logo?: string; hero?: string; mascot?: string }>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Pull the brand's real Studio art (logo / product art / mascot) once opened
  useEffect(() => {
    if (!isOpen || assetsLoaded || !brandId) return;
    fetch("/api/studio/jobs")
      .then((r) => r.json())
      .then((d: { jobs?: StudioJobLite[] }) => {
        const done = (d.jobs ?? []).filter(
          (j) => j.status === "completed" && j.brand_id === brandId && j.output_url && !j.archived
        );
        const firstOf = (pred: (j: StudioJobLite) => boolean) => done.find(pred)?.output_url ?? undefined;
        setAssets({
          logo:
            firstOf((j) => !!j.official_logo) ??
            firstOf((j) => j.image_type === "logo_concept"),
          hero:
            firstOf((j) => j.image_type === "product_art") ??
            firstOf((j) => j.image_type === "social_graphic"),
          mascot: firstOf((j) => j.image_type === "mascot"),
        });
      })
      .catch(() => null)
      .finally(() => setAssetsLoaded(true));
  }, [isOpen, assetsLoaded, brandId]);

  const w = kit.websiteCopy;
  const t = useMemo(() => buildTheme(kit), [kit]);
  const name = kit.recommendedName;
  const headline = splitHeadline(w.heroHeadline);
  const features: { title: string; description: string }[] =
    w.features && w.features.length > 0
      ? w.features.slice(0, 6)
      : (w.featureBullets ?? []).slice(0, 6).map((b) => ({ title: b, description: "" }));
  const domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(buildSitePrompt(kit));
      setCopied(true);
      trackEvent("website_prompt_copied", {});
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const reveal = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, ease: "easeOut" as const },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white flex items-center gap-2 min-w-0">
              🌐 <span className="hidden sm:inline truncate">Website Preview — built from your brand kit</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70 shrink-0">
                Concept
              </span>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyPrompt}
                className="rounded-lg border border-primary/50 bg-primary/20 px-3 py-1.5 text-sm font-semibold text-primary-light hover:bg-primary/30 hover:text-white transition-colors"
                title="Copy a paste-ready brief for GoDaddy Airo, Framer, or any AI website builder"
              >
                {copied ? "✓ Copied!" : "✨ Copy website prompt"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Browser frame */}
          <motion.div
            initial={{ y: 26, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
            className="mx-auto mb-4 flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/15 shadow-2xl min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 bg-[#1b1b24] px-4 py-2.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <div className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-white/50">
                {domain}
              </div>
            </div>

            {/* The rendered homepage */}
            <div
              className="relative flex-1 overflow-y-auto"
              style={{ backgroundColor: t.bg, color: t.text }}
            >
              {/* Layered palette glows — the "alive" light */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: [
                    `radial-gradient(600px 420px at 15% -5%, ${t.accent}40, transparent 62%)`,
                    `radial-gradient(700px 480px at 95% 12%, ${t.accent2}33, transparent 65%)`,
                    `radial-gradient(900px 540px at 50% 118%, ${t.accent}2e, transparent 60%)`,
                  ].join(", "),
                }}
              />

              <div className="relative">
                {/* Site nav */}
                <div className="flex items-center justify-between px-6 sm:px-10 py-5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {assets.logo && (
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: t.card }}>
                        <Image src={assets.logo} alt={`${name} logo`} fill className="object-contain" sizes="36px" unoptimized />
                      </span>
                    )}
                    <p className="font-display text-lg font-black tracking-tight truncate">{name}</p>
                  </div>
                  <span
                    className="rounded-full px-4 py-1.5 text-xs font-bold shrink-0"
                    style={{ backgroundColor: t.accent, color: t.accentText, boxShadow: `0 4px 24px ${t.accent}59` }}
                  >
                    {w.ctaText}
                  </span>
                </div>

                {/* Hero */}
                <div className="px-6 sm:px-10 pt-10 sm:pt-16 pb-12 text-center max-w-4xl mx-auto">
                  {kit.taglines?.[0] && (
                    <motion.p
                      {...reveal}
                      className="mx-auto mb-6 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide"
                      style={{ borderColor: `${t.accent}66`, color: t.text, backgroundColor: `${t.accent}1a` }}
                    >
                      ✦ {kit.taglines[0]}
                    </motion.p>
                  )}
                  <motion.h1
                    {...reveal}
                    className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight"
                  >
                    {headline.plain}
                    <span
                      style={{
                        backgroundImage: `linear-gradient(100deg, ${t.accent}, ${t.accent2})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {headline.gradient}
                    </span>
                  </motion.h1>
                  <motion.p {...reveal} className="mt-6 text-base sm:text-xl max-w-2xl mx-auto" style={{ color: t.subtext }}>
                    {w.subheadline}
                  </motion.p>
                  <motion.div {...reveal} className="mt-9 flex flex-wrap items-center justify-center gap-3">
                    <span
                      className="rounded-xl px-7 py-3.5 text-sm sm:text-base font-bold"
                      style={{ backgroundColor: t.accent, color: t.accentText, boxShadow: `0 10px 44px ${t.accent}73` }}
                    >
                      {w.ctaText}
                    </span>
                    {w.secondaryCtaText && (
                      <span
                        className="rounded-xl border px-7 py-3.5 text-sm sm:text-base font-semibold backdrop-blur"
                        style={{ borderColor: `${t.accent}55`, color: t.text, backgroundColor: t.card }}
                      >
                        {w.secondaryCtaText}
                      </span>
                    )}
                  </motion.div>

                  {/* Their actual Studio art as the hero visual */}
                  {assets.hero && (
                    <motion.div
                      initial={{ opacity: 0, y: 44, rotate: -1.5 }}
                      whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="relative mx-auto mt-12 aspect-square w-full max-w-md overflow-hidden rounded-3xl border"
                      style={{ borderColor: `${t.accent}44`, boxShadow: `0 30px 90px ${t.accent}4d, 0 10px 40px rgba(0,0,0,0.5)` }}
                    >
                      <Image src={assets.hero} alt={`${name} artwork`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 448px" unoptimized />
                    </motion.div>
                  )}
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="px-6 sm:px-10 pb-16 max-w-4xl mx-auto">
                    <motion.p {...reveal} className="text-xs font-bold uppercase tracking-widest mb-5 text-center" style={{ color: t.accent }}>
                      Why {name}
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {features.map((f, i) => (
                        <motion.div
                          key={i}
                          {...reveal}
                          transition={{ ...reveal.transition, delay: (i % 3) * 0.08 }}
                          className="rounded-2xl border p-6"
                          style={{ backgroundColor: t.card, borderColor: `${t.accent}26` }}
                        >
                          <span
                            className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                            style={{ backgroundColor: `${t.accent}26`, color: t.accent }}
                          >
                            {i + 1}
                          </span>
                          <p className="text-sm font-bold leading-snug">{f.title}</p>
                          {f.description && (
                            <p className="mt-2 text-xs leading-relaxed" style={{ color: t.subtext }}>
                              {f.description}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About */}
                <div className="px-6 sm:px-10 pb-16 max-w-2xl mx-auto text-center">
                  <motion.p {...reveal} className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t.accent }}>
                    About {name}
                  </motion.p>
                  <motion.p {...reveal} className="text-sm sm:text-lg leading-relaxed" style={{ color: t.subtext }}>
                    {w.aboutSection}
                  </motion.p>
                </div>

                {/* Email capture — mascot cameo if they've generated one */}
                {w.emailCaptureHeadline && (
                  <div className="px-6 sm:px-10 pb-16 max-w-2xl mx-auto">
                    <motion.div
                      {...reveal}
                      className="relative rounded-3xl border p-7 sm:p-9 text-center overflow-visible"
                      style={{
                        backgroundColor: t.card,
                        borderColor: `${t.accent}40`,
                        boxShadow: `0 18px 70px ${t.accent}2e`,
                      }}
                    >
                      {assets.mascot && (
                        <span className="absolute -top-14 -right-3 h-28 w-24 sm:-right-8 sm:h-32 sm:w-28 pointer-events-none drop-shadow-xl">
                          <Image src={assets.mascot} alt={`${name} mascot`} fill className="object-contain object-bottom" sizes="112px" unoptimized />
                        </span>
                      )}
                      <p className="font-display text-xl sm:text-2xl font-black">{w.emailCaptureHeadline}</p>
                      <div className="mt-5 flex gap-2 justify-center">
                        <span
                          className="flex-1 max-w-[240px] rounded-xl border px-4 py-3 text-left text-xs"
                          style={{ borderColor: `${t.accent}40`, color: t.subtext, backgroundColor: "rgba(0,0,0,0.15)" }}
                        >
                          you@email.com
                        </span>
                        <span
                          className="rounded-xl px-5 py-3 text-xs font-bold"
                          style={{ backgroundColor: t.accent, color: t.accentText, boxShadow: `0 6px 28px ${t.accent}59` }}
                        >
                          Sign up
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 sm:px-10 py-10 text-center text-xs" style={{ backgroundColor: "rgba(0,0,0,0.3)", color: t.subtext }}>
                  <p className="font-display text-base font-black" style={{ color: t.text }}>{name}</p>
                  {w.footerTagline && <p className="mt-2 italic">{w.footerTagline}</p>}
                  <p className="mt-4 opacity-70">
                    © {new Date().getFullYear()} {name} · Made with BrandGoblin AI 🧌
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

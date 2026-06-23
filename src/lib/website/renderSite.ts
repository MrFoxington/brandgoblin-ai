// Single source of truth for the "Preview as a Live Webpage" feature.
// renderBrandSiteHTML(kit) returns ONE complete, self-contained HTML document (inline <style>,
// no external deps). The preview route shows this exact string in an <iframe srcDoc>, and the
// PreviewActions "Download HTML" / "Copy HTML" buttons hand the user this exact same string —
// so the preview is byte-identical to the file they ship (WYSIWYG, one renderer).
//
// THEME ROBUSTNESS: pickTheme() derives a contrast-safe palette from the brand's own colors using
// WCAG relative luminance + contrast ratios. It must read well for a DARK brand (e.g. REPLICATE)
// AND a LIGHT brand (e.g. skincare) — never low-contrast / unreadable text.

import type { BrandKit, ColorSwatch } from "@/types";

// ── Color math ────────────────────────────────────────────────────────────────

interface Rgb { r: number; g: number; b: number; }

function parseHex(hex: string): Rgb | null {
  if (!hex) return null;
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// WCAG relative luminance (0 = black, 1 = white).
function luminance({ r, g, b }: Rgb): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// WCAG contrast ratio between two colors (1 = identical, 21 = black-on-white).
function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// HSL saturation, used to find the most "vivid" swatch for the accent.
function saturation({ r, g, b }: Rgb): number {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  if (max === min) return 0;
  const l = (max + min) / 2;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  };
}

const BLACK: Rgb = { r: 10, g: 10, b: 15 };       // near-black (matches app bg vibe)
const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const NEAR_WHITE: Rgb = { r: 248, g: 250, b: 252 };

export interface SiteTheme {
  bg: string;          // page background
  surface: string;     // slightly elevated panels (nav, cards, bands)
  text: string;        // primary readable text (>= 4.5:1 on bg)
  muted: string;       // secondary text (still readable)
  accent: string;      // vivid brand color for buttons / highlights
  accentText: string;  // readable text color to sit ON the accent
  accentOnBg: string;  // accent used as text/icon on bg (contrast-guaranteed)
  border: string;      // hairline borders
  isDark: boolean;
}

// Contrast-safe theme derived from the brand palette. Falls back to a clean dark theme
// if the palette is missing or unparseable, so it never produces unreadable output.
export function pickTheme(colors: ColorSwatch[] | undefined): SiteTheme {
  const swatches = (colors ?? [])
    .map((c) => parseHex(c.hex))
    .filter((c): c is Rgb => c !== null);

  if (swatches.length === 0) {
    // Default dark theme.
    return {
      bg: "#0a0a0f", surface: "#16161f", text: "#f8fafc", muted: "rgba(248,250,252,0.66)",
      accent: "#7c3aed", accentText: "#ffffff", accentOnBg: "#a78bfa",
      border: "rgba(248,250,252,0.12)", isDark: true,
    };
  }

  const sorted = [...swatches].sort((a, b) => luminance(a) - luminance(b));
  const darkest = sorted[0];
  const lightest = sorted[sorted.length - 1];
  const avgLum = swatches.reduce((s, c) => s + luminance(c), 0) / swatches.length;

  // Decide page mode: dark page if the palette has a genuinely dark anchor, else light page.
  const isDark = luminance(darkest) < 0.16 || avgLum < 0.4;

  let bgRgb: Rgb;
  let textRgb: Rgb;
  if (isDark) {
    // Anchor on the darkest swatch, but ensure it is dark enough to be a readable base.
    bgRgb = luminance(darkest) < 0.12 ? darkest : mix(darkest, BLACK, 0.6);
    textRgb = NEAR_WHITE;
  } else {
    // Anchor on the lightest swatch, but ensure it is light enough.
    bgRgb = luminance(lightest) > 0.88 ? lightest : mix(lightest, WHITE, 0.7);
    textRgb = BLACK;
  }

  // Guarantee primary text clears WCAG AA (4.5:1); fall back to pure white/black if not.
  if (contrast(textRgb, bgRgb) < 4.5) textRgb = isDark ? WHITE : { r: 0, g: 0, b: 0 };

  const surfaceRgb = isDark ? mix(bgRgb, WHITE, 0.07) : mix(bgRgb, BLACK, 0.05);
  const mutedRgb = mix(textRgb, bgRgb, 0.4); // pull text toward bg for a softer secondary tone

  // Accent: the most saturated swatch in a usable mid-luminance band.
  const accentCandidates = [...swatches]
    .filter((c) => luminance(c) > 0.06 && luminance(c) < 0.82)
    .sort((a, b) => saturation(b) - saturation(a));
  let accentRgb = accentCandidates[0] ?? mix(isDark ? lightest : darkest, isDark ? WHITE : BLACK, 0.1);

  // If even the chosen accent is washed out, nudge it so buttons read as a deliberate color.
  if (saturation(accentRgb) < 0.08) accentRgb = { r: 124, g: 58, b: 237 }; // brand purple fallback

  // Text color that sits ON the accent (filled buttons) — pick whichever is more readable.
  const accentText = contrast(WHITE, accentRgb) >= contrast(BLACK, accentRgb) ? "#ffffff" : "#0a0a0f";

  // Accent used as text/icon directly on the page bg must itself clear ~3:1; otherwise use text color.
  const accentOnBg = contrast(accentRgb, bgRgb) >= 3 ? toHex(accentRgb) : toHex(textRgb);

  return {
    bg: toHex(bgRgb),
    surface: toHex(surfaceRgb),
    text: toHex(textRgb),
    muted: toHex(mutedRgb),
    accent: toHex(accentRgb),
    accentText,
    accentOnBg,
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
    isDark,
  };
}

// ── HTML escaping ───────────────────────────────────────────────────────────────

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Site renderer ────────────────────────────────────────────────────────────────

export function renderBrandSiteHTML(kit: BrandKit): string {
  const w = kit.websiteCopy ?? ({} as BrandKit["websiteCopy"]);
  const name = kit.recommendedName || "Your Brand";
  const t = pickTheme(kit.colorPalette);

  const title = w.seoTitle?.trim() || name;
  const metaDesc = w.metaDescription?.trim() || w.subheadline?.trim() || "";

  const hasFeatures = Array.isArray(w.features) && w.features.length > 0;
  const hasBullets = Array.isArray(w.featureBullets) && w.featureBullets.length > 0;
  const hasFaqs = Array.isArray(w.faqs) && w.faqs.length > 0;

  // ── Sections (only rendered when their data exists) ──
  const nav = `
    <header class="nav">
      <div class="container nav-inner">
        <span class="brand">${esc(name)}</span>
        ${w.secondaryCtaText ? `<a class="nav-cta" href="#about">${esc(w.secondaryCtaText)}</a>` : ""}
      </div>
    </header>`;

  const hero = `
    <section class="hero">
      <div class="container hero-inner">
        ${w.heroHeadline ? `<h1>${esc(w.heroHeadline)}</h1>` : `<h1>${esc(name)}</h1>`}
        ${w.subheadline ? `<p class="sub">${esc(w.subheadline)}</p>` : ""}
        <div class="cta-row">
          ${w.ctaText ? `<a class="btn btn-primary" href="#email">${esc(w.ctaText)}</a>` : ""}
          ${w.secondaryCtaText ? `<a class="btn btn-secondary" href="#about">${esc(w.secondaryCtaText)}</a>` : ""}
        </div>
      </div>
    </section>`;

  const about = w.aboutSection
    ? `
    <section id="about" class="section">
      <div class="container narrow">
        <h2>About ${esc(name)}</h2>
        <p class="lead">${esc(w.aboutSection)}</p>
      </div>
    </section>`
    : "";

  let features = "";
  if (hasFeatures) {
    features = `
    <section class="section">
      <div class="container">
        <h2 class="center">Why ${esc(name)}</h2>
        <div class="grid">
          ${w.features!
            .map(
              (f) => `<div class="card">
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.description)}</p>
          </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
  } else if (hasBullets) {
    features = `
    <section class="section">
      <div class="container narrow">
        <h2 class="center">Why ${esc(name)}</h2>
        <ul class="bullets">
          ${w.featureBullets!.map((b) => `<li>${esc(b)}</li>`).join("")}
        </ul>
      </div>
    </section>`;
  }

  const faq = hasFaqs
    ? `
    <section class="section alt">
      <div class="container narrow">
        <h2 class="center">Frequently asked questions</h2>
        <div class="faq">
          ${w.faqs!
            .map(
              (q) => `<div class="faq-item">
            <p class="q">${esc(q.question)}</p>
            <p class="a">${esc(q.answer)}</p>
          </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`
    : "";

  const emailCapture = w.emailCaptureHeadline
    ? `
    <section id="email" class="section band">
      <div class="container narrow center">
        <h2>${esc(w.emailCaptureHeadline)}</h2>
        <form class="email-form" onsubmit="return false;">
          <input type="email" placeholder="you@example.com" aria-label="Email address" />
          <button type="submit" class="btn btn-primary">${esc(w.ctaText || "Sign up")}</button>
        </form>
      </div>
    </section>`
    : "";

  const footer = `
    <footer class="footer">
      <div class="container center">
        ${w.footerTagline ? `<p class="footer-tagline">${esc(w.footerTagline)}</p>` : ""}
        <p class="footer-name">${esc(name)}</p>
        <p class="footer-credit">Made with BrandGoblin</p>
      </div>
    </footer>`;

  const styles = `
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: ${t.bg};
      color: ${t.text};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
    .narrow { max-width: 760px; }
    .center { text-align: center; }
    h1, h2, h3 { line-height: 1.2; margin: 0 0 0.5em; }
    h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.02em; }
    h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; }
    h3 { font-size: 1.15rem; font-weight: 700; }
    p { margin: 0 0 1rem; }
    a { color: inherit; }

    .nav { border-bottom: 1px solid ${t.border}; background: ${t.surface}; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; padding-bottom: 16px; }
    .brand { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.01em; }
    .nav-cta { color: ${t.accentOnBg}; font-weight: 600; text-decoration: none; font-size: 0.95rem; }

    .hero { padding: clamp(64px, 12vw, 140px) 0; }
    .hero-inner { max-width: 820px; }
    .hero .sub { font-size: clamp(1.05rem, 2vw, 1.35rem); color: ${t.muted}; max-width: 640px; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }

    .btn { display: inline-block; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 1rem; text-decoration: none; border: 1px solid transparent; cursor: pointer; }
    .btn-primary { background: ${t.accent}; color: ${t.accentText}; }
    .btn-secondary { background: transparent; color: ${t.text}; border-color: ${t.border}; }

    .section { padding: clamp(48px, 8vw, 88px) 0; }
    .section.alt { background: ${t.surface}; }
    .section.band { background: ${t.accent}; color: ${t.accentText}; }
    .lead { font-size: 1.1rem; color: ${t.muted}; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 36px; }
    .card { background: ${t.surface}; border: 1px solid ${t.border}; border-radius: 16px; padding: 24px; }
    .card p { color: ${t.muted}; margin: 0; }

    .bullets { list-style: none; padding: 0; margin: 32px 0 0; display: grid; gap: 12px; }
    .bullets li { position: relative; padding-left: 28px; color: ${t.muted}; }
    .bullets li::before { content: "✓"; position: absolute; left: 0; color: ${t.accentOnBg}; font-weight: 800; }

    .faq { margin-top: 32px; display: grid; gap: 16px; }
    .faq-item { border: 1px solid ${t.border}; border-radius: 14px; padding: 20px 22px; background: ${t.bg}; }
    .faq .q { font-weight: 700; margin: 0 0 6px; }
    .faq .a { color: ${t.muted}; margin: 0; }

    .email-form { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 24px; }
    .email-form input { flex: 1; min-width: 240px; max-width: 360px; padding: 14px 16px; border-radius: 12px; border: 1px solid ${t.border}; font-size: 1rem; }

    .footer { border-top: 1px solid ${t.border}; padding: 48px 0; background: ${t.surface}; }
    .footer-tagline { font-size: 1.1rem; font-weight: 600; margin: 0 0 8px; }
    .footer-name { font-weight: 800; margin: 0 0 4px; }
    .footer-credit { color: ${t.muted}; font-size: 0.85rem; margin: 0; }

    @media (max-width: 640px) {
      .nav-cta { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
    }`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
${metaDesc ? `<meta name="description" content="${esc(metaDesc)}" />` : ""}
<style>${styles}</style>
</head>
<body>
${nav}
${hero}
${about}
${features}
${faq}
${emailCapture}
${footer}
</body>
</html>`;
}

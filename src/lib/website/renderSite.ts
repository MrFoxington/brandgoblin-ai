// Single source of truth for the "Preview as a Live Webpage" feature.
// renderBrandSiteHTML(kit) returns ONE complete, self-contained HTML document (inline <style>,
// no external deps). The preview route shows this exact string in an <iframe srcDoc>, and the
// PreviewActions "Download HTML" / "Copy HTML" buttons hand the user this exact same string —
// so the preview is byte-identical to the file they ship (WYSIWYG, one renderer).
//
// DESIGN GOAL: the auto-template must look *designed* — premium/editorial, not a Web-1.0 page with
// a loud solid button. Thin wide-tracked type + kicker, an OUTLINED glowing accent CTA (never a
// solid block), a faint hero glow, hairline dividers, a clean features grid, static-accordion FAQ,
// and a minimal footer. It must look intentional on BOTH a dark palette and a light pastel one.
//
// THEME ROBUSTNESS: pickTheme() derives a contrast-safe palette from the brand's own colors using
// WCAG relative luminance + contrast ratios. The accent is used ONLY for borders/text/tints/glow,
// never as a giant solid fill, and is nudged until it stays readable on the chosen background.

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

function triplet({ r, g, b }: Rgb): string {
  return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
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
const NEAR_WHITE: Rgb = { r: 240, g: 240, b: 239 };

export interface SiteTheme {
  bg: string;          // page background
  bg2: string;         // near-bg neutral for subtle gradients / section tints
  text: string;        // primary readable text (>= 4.5:1 on bg)
  muted: string;       // secondary text (rgba of text, still readable)
  accent: string;      // vivid brand color, nudged readable — for text / borders / CTA outline
  accentRgb: string;   // vivid accent "r, g, b" triplet, for rgba() tints + the hero glow ONLY
  border: string;      // hairline dividers (text at ~10% alpha)
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
      bg: "#0a0a0f", bg2: "#13131c", text: "#f4f4f6", muted: "rgba(244,244,246,0.68)",
      accent: "#a78bfa", accentRgb: "124, 58, 237",
      border: "rgba(244,244,246,0.10)", isDark: true,
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

  // bg2: a subtle companion to bg for gentle gradients/tints. Prefer a real near-bg neutral from
  // the palette (low saturation, same side as bg), else nudge bg slightly toward white/black.
  let bg2Rgb = isDark ? mix(bgRgb, WHITE, 0.06) : mix(bgRgb, BLACK, 0.04);
  const neutral = swatches.find(
    (c) =>
      saturation(c) < 0.35 &&
      (isDark ? luminance(c) < 0.32 : luminance(c) > 0.7) &&
      Math.abs(luminance(c) - luminance(bgRgb)) > 0.015
  );
  if (neutral) bg2Rgb = mix(bgRgb, neutral, 0.5); // kept subtle by only going halfway

  // Accent: the most saturated swatch in a usable mid-luminance band (vivid hue for tints/glow).
  const accentCandidates = [...swatches]
    .filter((c) => luminance(c) > 0.06 && luminance(c) < 0.82)
    .sort((a, b) => saturation(b) - saturation(a));
  let accentVivid = accentCandidates[0] ?? mix(isDark ? lightest : darkest, isDark ? WHITE : BLACK, 0.1);

  // If even the chosen accent is washed out, nudge it so it reads as a deliberate color.
  if (saturation(accentVivid) < 0.08) accentVivid = { r: 124, g: 58, b: 237 }; // brand purple fallback

  // Accent used as TEXT / borders / CTA outline must stay readable on bg. Nudge toward the text
  // pole (lighten on dark, darken on light) until it clears AA, preserving the hue. The vivid
  // version is kept separately for low-alpha tints + the hero glow (where contrast is irrelevant).
  let accentText = accentVivid;
  for (let i = 0; i < 28 && contrast(accentText, bgRgb) < 4.5; i++) {
    accentText = mix(accentText, isDark ? WHITE : BLACK, 0.07);
  }

  const tA = isDark ? 0.68 : 0.62; // muted alpha — keeps secondary text comfortably readable
  return {
    bg: toHex(bgRgb),
    bg2: toHex(bg2Rgb),
    text: toHex(textRgb),
    muted: `rgba(${triplet(textRgb)}, ${tA})`,
    accent: toHex(accentText),
    accentRgb: triplet(accentVivid),
    border: `rgba(${triplet(textRgb)}, 0.10)`,
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
  const hasEmail = !!w.emailCaptureHeadline?.trim();
  const hasAbout = !!w.aboutSection?.trim();

  // Kicker: a short, tag-like editorial label above the hero headline. Prefer the shortest tagline
  // (reads like a category/tag), else the footer tagline; omit entirely if nothing short enough.
  const tagPool = (kit.taglines ?? []).filter((s) => typeof s === "string" && s.trim());
  const shortestTag = [...tagPool].sort((a, b) => a.length - b.length)[0];
  let kicker = "";
  if (shortestTag && shortestTag.trim().length <= 42) kicker = shortestTag.trim();
  else if (w.footerTagline && w.footerTagline.trim().length <= 42) kicker = w.footerTagline.trim();

  const primaryHref = hasEmail ? "#email" : hasAbout ? "#about" : "#";

  // ── Sections (only rendered when their data exists) ──
  const nav = `
    <header class="nav">
      <div class="container nav-inner">
        <span class="brand">${esc(name)}</span>
        ${w.secondaryCtaText ? `<a class="nav-cta" href="${hasAbout ? "#about" : primaryHref}">${esc(w.secondaryCtaText)}</a>` : ""}
      </div>
    </header>`;

  const hero = `
    <section class="hero">
      <div class="container hero-inner">
        ${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ""}
        <h1>${esc(w.heroHeadline || name)}</h1>
        ${w.subheadline ? `<p class="sub">${esc(w.subheadline)}</p>` : ""}
        ${
          w.ctaText || w.secondaryCtaText
            ? `<div class="cta-row">
          ${w.ctaText ? `<a class="btn-primary" href="${primaryHref}">${esc(w.ctaText)}</a>` : ""}
          ${w.secondaryCtaText ? `<a class="cta-secondary" href="${hasAbout ? "#about" : primaryHref}">${esc(w.secondaryCtaText)} <span class="arrow">&rarr;</span></a>` : ""}
        </div>`
            : ""
        }
      </div>
    </section>`;

  const about = hasAbout
    ? `
    <section id="about" class="section">
      <div class="container narrow">
        <p class="eyebrow">About</p>
        <h2>${esc(name)}</h2>
        <p class="lead">${esc(w.aboutSection)}</p>
      </div>
    </section>`
    : "";

  let features = "";
  if (hasFeatures) {
    features = `
    <section class="section">
      <div class="container">
        <p class="eyebrow">Features</p>
        <h2>Why ${esc(name)}</h2>
        <div class="feature-grid">
          ${w.features!
            .map(
              (f, i) => `<div class="feature">
            <span class="marker">${String(i + 1).padStart(2, "0")}</span>
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
      <div class="container">
        <p class="eyebrow">Features</p>
        <h2>Why ${esc(name)}</h2>
        <ul class="bullet-grid">
          ${w.featureBullets!.map((b) => `<li class="bullet">${esc(b)}</li>`).join("")}
        </ul>
      </div>
    </section>`;
  }

  const faq = hasFaqs
    ? `
    <section class="section">
      <div class="container narrow">
        <p class="eyebrow">FAQ</p>
        <h2>Frequently asked questions</h2>
        <div class="faq">
          ${w.faqs!
            .map(
              (q) => `<div class="faq-item">
            <p class="q">${esc(q.question)} <span class="plus">+</span></p>
            <p class="a">${esc(q.answer)}</p>
          </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`
    : "";

  const emailCapture = hasEmail
    ? `
    <section id="email" class="section">
      <div class="container narrow">
        <div class="cta-panel">
          <h2>${esc(w.emailCaptureHeadline)}</h2>
          <form class="email-form" onsubmit="return false;">
            <input type="email" placeholder="you@example.com" aria-label="Email address" />
            <button type="submit" class="btn-primary">${esc(w.ctaText || "Sign up")}</button>
          </form>
        </div>
      </div>
    </section>`
    : "";

  const footer = `
    <footer class="footer">
      <div class="container footer-inner">
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
      background-image: linear-gradient(180deg, ${t.bg2} 0%, ${t.bg} 640px);
      background-repeat: no-repeat;
      color: ${t.text};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
    .narrow { max-width: 760px; }
    h1, h2, h3 { margin: 0; }
    a { color: inherit; }
    p { margin: 0; }

    .eyebrow {
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase;
      color: ${t.accent}; margin: 0 0 16px;
    }

    /* Nav — refined wordmark + ghost pill CTA */
    .nav { position: relative; z-index: 2; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; }
    .brand { font-weight: 500; font-size: 1.15rem; letter-spacing: 0.02em; }
    .nav-cta {
      font-size: 0.85rem; font-weight: 500; text-decoration: none; color: ${t.text};
      border: 1px solid ${t.border}; padding: 9px 18px; border-radius: 999px;
      transition: border-color .2s ease, color .2s ease, background .2s ease;
    }
    .nav-cta:hover { border-color: ${t.accent}; color: ${t.accent}; background: rgba(${t.accentRgb}, 0.06); }

    /* Hero — thin tracked display type, kicker, faint accent glow */
    .hero { position: relative; overflow: hidden; padding: clamp(72px, 13vw, 168px) 0 clamp(56px, 9vw, 116px); }
    .hero::before {
      content: ""; position: absolute; top: -18%; left: 50%; transform: translateX(-50%);
      width: min(960px, 130%); height: 580px;
      background: radial-gradient(ellipse at center, rgba(${t.accentRgb}, 0.16), transparent 62%);
      pointer-events: none; z-index: 0;
    }
    .hero-inner { position: relative; z-index: 1; max-width: 880px; }
    .kicker {
      display: inline-block; font-size: 0.74rem; font-weight: 600; letter-spacing: 0.28em;
      text-transform: uppercase; color: ${t.accent}; margin-bottom: 26px;
    }
    .hero h1 {
      font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 300; line-height: 1.04;
      letter-spacing: -0.02em; max-width: 20ch; margin: 0 0 26px;
    }
    .hero .sub {
      font-size: clamp(1.05rem, 1.7vw, 1.3rem); line-height: 1.7; color: ${t.muted};
      max-width: 54ch; margin: 0 0 38px;
    }
    .cta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 26px; }

    /* CTA — outlined accent with faint tint + soft glow (never a solid block) */
    .btn-primary {
      display: inline-block; padding: 15px 32px; border-radius: 999px;
      font-size: 0.95rem; font-weight: 600; letter-spacing: 0.01em; text-decoration: none;
      color: ${t.accent}; border: 1px solid ${t.accent}; background: rgba(${t.accentRgb}, 0.07);
      box-shadow: 0 0 26px rgba(${t.accentRgb}, 0.18);
      transition: background .25s ease, box-shadow .25s ease, transform .15s ease;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: rgba(${t.accentRgb}, 0.14); box-shadow: 0 10px 44px rgba(${t.accentRgb}, 0.34);
      transform: translateY(-1px);
    }
    .cta-secondary {
      display: inline-flex; align-items: center; gap: 9px; font-size: 0.95rem; font-weight: 500;
      color: ${t.text}; text-decoration: none; transition: color .2s ease, gap .2s ease;
    }
    .cta-secondary .arrow { color: ${t.accent}; transition: transform .2s ease; }
    .cta-secondary:hover { color: ${t.accent}; gap: 13px; }

    /* Sections — hairline dividers + generous rhythm */
    .section { position: relative; padding: clamp(64px, 9vw, 120px) 0; border-top: 1px solid ${t.border}; }
    .section h2 { font-size: clamp(1.6rem, 3.2vw, 2.5rem); font-weight: 300; letter-spacing: -0.01em; line-height: 1.12; margin: 0 0 26px; }
    .lead { font-size: 1.12rem; line-height: 1.75; color: ${t.muted}; max-width: 62ch; }

    /* Features — clean 2-col grid with accent-tinted numbered markers */
    .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(30px, 4vw, 56px); margin-top: 50px; }
    .feature .marker {
      display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px;
      border-radius: 10px; font-size: 0.8rem; font-weight: 600; color: ${t.accent};
      background: rgba(${t.accentRgb}, 0.10); border: 1px solid rgba(${t.accentRgb}, 0.45);
      margin-bottom: 20px;
    }
    .feature h3 { font-size: 1.18rem; font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; margin: 0 0 9px; }
    .feature p { color: ${t.muted}; font-size: 0.98rem; line-height: 1.7; }

    .bullet-grid { list-style: none; padding: 0; margin: 44px 0 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px 44px; }
    .bullet { position: relative; padding-left: 28px; color: ${t.muted}; line-height: 1.65; }
    .bullet::before { content: ""; position: absolute; left: 0; top: 9px; width: 8px; height: 8px; border-radius: 2px; background: ${t.accent}; }

    /* FAQ — static accordion look with hairline separators */
    .faq { margin-top: 44px; }
    .faq-item { padding: 24px 0; border-bottom: 1px solid ${t.border}; }
    .faq-item:first-child { border-top: 1px solid ${t.border}; }
    .faq .q { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; font-size: 1.06rem; font-weight: 500; line-height: 1.4; }
    .faq .q .plus { color: ${t.accent}; font-weight: 300; font-size: 1.45rem; line-height: 1; flex-shrink: 0; }
    .faq .a { color: ${t.muted}; line-height: 1.7; margin: 13px 0 0; max-width: 64ch; }

    /* Email capture — a tinted, glowing panel (not a solid accent band) */
    .cta-panel {
      position: relative; overflow: hidden; text-align: center;
      border: 1px solid rgba(${t.accentRgb}, 0.38); background: rgba(${t.accentRgb}, 0.06);
      border-radius: 24px; padding: clamp(40px, 6vw, 72px) clamp(24px, 5vw, 56px);
    }
    .cta-panel::before {
      content: ""; position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse at 50% 0%, rgba(${t.accentRgb}, 0.16), transparent 70%);
    }
    .cta-panel > * { position: relative; }
    .cta-panel h2 { margin: 0 0 26px; }
    .email-form { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .email-form input {
      flex: 1; min-width: 220px; max-width: 320px; padding: 14px 18px; border-radius: 999px;
      border: 1px solid ${t.border}; background: ${t.bg}; color: ${t.text}; font-size: 0.95rem;
    }
    .email-form input::placeholder { color: ${t.muted}; }

    /* Footer — minimal, hairline top */
    .footer { border-top: 1px solid ${t.border}; padding: 52px 0; }
    .footer-inner { display: flex; flex-direction: column; gap: 5px; }
    .footer-tagline { font-size: 1.05rem; color: ${t.text}; max-width: 50ch; }
    .footer-name { font-weight: 500; letter-spacing: 0.02em; margin-top: 8px; }
    .footer-credit { color: ${t.muted}; font-size: 0.8rem; margin-top: 2px; }

    @media (max-width: 720px) {
      .feature-grid { grid-template-columns: 1fr; }
      .bullet-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .nav-cta { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      * { transition: none !important; }
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

// Goblin Studio — brand font library (Saved Brand Fonts feature, July 2026)
//
// One source of truth for:
//   • the curated, license-friendly Google Font list shown in every picker
//   • the house default font pair (used when a brand has none saved)
//   • turning a brand's saved fonts into wording injected into image prompts
//   • loading the right web fonts in the browser for previews
//
// This module is framework-neutral (no server-only or client-only imports) so
// both API routes and React components can import it.

import type { BrandTypography } from "@/types";

export type FontCategory = "display" | "serif" | "sans";

export interface FontMeta {
  family: string;             // exact Google Font family name
  category: FontCategory;
  weights: number[];          // weights we support for this family
  hasItalic: boolean;         // whether an italic cut exists
  defaultHeadlineWeight?: number; // sensible heavy weight when used as a headline
}

// ── Curated catalog, grouped by feel ────────────────────────────────────────
// Every family here is a Google Font under the SIL Open Font License (free for
// commercial use). Grouped exactly the way the picker displays them.
export const FONT_GROUPS: { label: string; hint: string; fonts: FontMeta[] }[] = [
  {
    label: "Display",
    hint: "Bold headline / title fonts",
    fonts: [
      { family: "Jost",          category: "display", weights: [400, 500, 700, 900], hasItalic: true,  defaultHeadlineWeight: 700 },
      { family: "Anton",         category: "display", weights: [400],                hasItalic: false, defaultHeadlineWeight: 400 },
      { family: "Bebas Neue",    category: "display", weights: [400],                hasItalic: false, defaultHeadlineWeight: 400 },
      { family: "Oswald",        category: "display", weights: [400, 500, 600, 700], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Archivo Black", category: "display", weights: [400],                hasItalic: false, defaultHeadlineWeight: 400 },
      { family: "Montserrat",    category: "display", weights: [400, 600, 700, 800, 900], hasItalic: true, defaultHeadlineWeight: 800 },
      { family: "Poppins",       category: "display", weights: [400, 500, 600, 700, 800], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Space Grotesk", category: "display", weights: [400, 500, 600, 700], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Teko",             category: "display", weights: [400, 500, 600, 700], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Fjalla One",       category: "display", weights: [400],                hasItalic: false, defaultHeadlineWeight: 400 },
      { family: "Barlow Condensed", category: "display", weights: [400, 500, 600, 700], hasItalic: true,  defaultHeadlineWeight: 700 },
      { family: "Kanit",            category: "display", weights: [400, 500, 600, 700, 800], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Sora",             category: "display", weights: [400, 500, 600, 700, 800], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Titan One",        category: "display", weights: [400],                hasItalic: false, defaultHeadlineWeight: 400 },
    ],
  },
  {
    label: "Serif / editorial",
    hint: "Classic, premium, editorial",
    fonts: [
      { family: "Lora",             category: "serif", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 600 },
      { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800, 900], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Cormorant",        category: "serif", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 600 },
      { family: "DM Serif Display", category: "serif", weights: [400],                hasItalic: true, defaultHeadlineWeight: 400 },
      { family: "Libre Baskerville",category: "serif", weights: [400, 700],           hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Merriweather",     category: "serif", weights: [400, 700, 900],      hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "PT Serif",         category: "serif", weights: [400, 700],           hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Bitter",           category: "serif", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "EB Garamond",      category: "serif", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 600 },
      { family: "Spectral",         category: "serif", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 600 },
    ],
  },
  {
    label: "Body sans",
    hint: "Clean, readable body text",
    fonts: [
      { family: "Inter",        category: "sans", weights: [400, 500, 600, 700, 800, 900], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Work Sans",    category: "sans", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Nunito Sans",  category: "sans", weights: [400, 600, 700, 800], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Source Sans 3",category: "sans", weights: [400, 600, 700], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Roboto",       category: "sans", weights: [400, 500, 700, 900], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Open Sans",    category: "sans", weights: [400, 600, 700, 800], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Lato",         category: "sans", weights: [400, 700, 900], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "DM Sans",      category: "sans", weights: [400, 500, 700], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "Manrope",      category: "sans", weights: [400, 500, 600, 700, 800], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Rubik",        category: "sans", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 700 },
    ],
  },
  {
    label: "Script / handwritten",
    hint: "Casual, personal, bold",
    fonts: [
      { family: "Pacifico",         category: "display", weights: [400], hasItalic: false, defaultHeadlineWeight: 400 },
      { family: "Caveat",           category: "display", weights: [400, 700], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Dancing Script",   category: "display", weights: [400, 700], hasItalic: false, defaultHeadlineWeight: 700 },
      { family: "Permanent Marker", category: "display", weights: [400], hasItalic: false, defaultHeadlineWeight: 400 },
      { family: "Satisfy",          category: "display", weights: [400], hasItalic: false, defaultHeadlineWeight: 400 },
    ],
  },
  {
    label: "Monospace",
    hint: "Techy, code-style",
    fonts: [
      { family: "Space Mono",     category: "sans", weights: [400, 700], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "JetBrains Mono", category: "sans", weights: [400, 700, 800], hasItalic: true, defaultHeadlineWeight: 700 },
      { family: "IBM Plex Mono",  category: "sans", weights: [400, 500, 600, 700], hasItalic: true, defaultHeadlineWeight: 600 },
    ],
  },
];

// Flat lookup: family name → metadata.
export const FONT_CATALOG: Record<string, FontMeta> = FONT_GROUPS.reduce(
  (acc, g) => {
    for (const f of g.fonts) acc[f.family] = f;
    return acc;
  },
  {} as Record<string, FontMeta>
);

// Every curated family name (for validation / dropdowns).
export const ALL_FONT_FAMILIES: string[] = Object.keys(FONT_CATALOG);

// ── House default pair ──────────────────────────────────────────────────────
// Used whenever a brand has no typography saved. Chosen to match the BrandGoblin
// house style (Jost display + Lora accent) so unset brands still look intentional
// and never error. Any brand can override this from Studio or the Brand Kit view.
export const DEFAULT_TYPOGRAPHY: Required<BrandTypography> = {
  headlineFont: "Jost",
  bodyFont: "Lora",
  headlineFontWeight: 700,
  headlineUppercase: true,
  bodyItalic: true,
};

// Fill every missing field from the default pair. Safe to call on undefined /
// old brands — always returns a complete, usable typography object.
export function resolveTypography(t?: BrandTypography | null): Required<BrandTypography> {
  const headlineFont = (t?.headlineFont ?? "").trim() || DEFAULT_TYPOGRAPHY.headlineFont;
  const bodyFont = (t?.bodyFont ?? "").trim() || DEFAULT_TYPOGRAPHY.bodyFont;
  return {
    headlineFont,
    bodyFont,
    headlineFontWeight:
      typeof t?.headlineFontWeight === "number"
        ? t.headlineFontWeight
        : FONT_CATALOG[headlineFont]?.defaultHeadlineWeight ?? DEFAULT_TYPOGRAPHY.headlineFontWeight,
    headlineUppercase: t?.headlineUppercase ?? DEFAULT_TYPOGRAPHY.headlineUppercase,
    bodyItalic: t?.bodyItalic ?? DEFAULT_TYPOGRAPHY.bodyItalic,
  };
}

// ── Validation / sanitizing (custom font names go straight into prompts) ─────
// Allow letters, numbers, spaces and hyphens only; cap length. Blocks quotes,
// newlines, and prompt-injection punctuation.
export function sanitizeFontName(name: string): string {
  return (name ?? "").replace(/[^\p{L}\p{N} \-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

export function isKnownFont(family: string): boolean {
  return !!FONT_CATALOG[family];
}

// Accept a curated family as-is; otherwise sanitize (supports the "custom font"
// option where the user types any Google Font name). Empty → "".
export function normalizeFontChoice(family?: string | null): string {
  const raw = (family ?? "").trim();
  if (!raw) return "";
  if (isKnownFont(raw)) return raw;
  return sanitizeFontName(raw);
}

// Validate + normalize an incoming typography patch (used by the save endpoint
// and the Studio override). Drops empty/invalid fields; never throws.
export function normalizeTypography(input?: Partial<BrandTypography> | null): BrandTypography {
  const out: BrandTypography = {};
  const h = normalizeFontChoice(input?.headlineFont);
  const b = normalizeFontChoice(input?.bodyFont);
  if (h) out.headlineFont = h;
  if (b) out.bodyFont = b;
  if (typeof input?.headlineFontWeight === "number") {
    const w = Math.round(input.headlineFontWeight);
    if (w >= 100 && w <= 900) out.headlineFontWeight = w;
  }
  if (typeof input?.headlineUppercase === "boolean") out.headlineUppercase = input.headlineUppercase;
  if (typeof input?.bodyItalic === "boolean") out.bodyItalic = input.bodyItalic;
  return out;
}

// ── Prompt wording ───────────────────────────────────────────────────────────
function headlineWeightWord(weight: number): string {
  if (weight >= 900) return "black heavy weight";
  if (weight >= 800) return "extra-bold weight";
  if (weight >= 700) return "bold heavy weight";
  if (weight >= 600) return "semibold weight";
  if (weight >= 500) return "medium weight";
  return "regular weight";
}

// Turn a brand's saved (or overridden) fonts into a prompt clause. Only inject
// this when the image is actually going to render text — a no-text image should
// never receive font wording (models may paint the font name otherwise).
export function buildFontPromptClause(t?: BrandTypography | null): string {
  const r = resolveTypography(t);
  const caseWord = r.headlineUppercase ? ", in all uppercase" : "";
  const bodyStyle = r.bodyItalic ? " italic" : "";
  return (
    `TYPOGRAPHY: set all headline and title lettering in the "${r.headlineFont}" typeface ` +
    `(${headlineWeightWord(r.headlineFontWeight)}${caseWord}); ` +
    `set any secondary, quote, or supporting line in the "${r.bodyFont}"${bodyStyle} typeface. ` +
    `Match those exact typefaces and do NOT substitute any other font.`
  );
}

// ── Web font loading (browser previews + pickers) ────────────────────────────
// Build a Google Fonts CSS2 href that loads the given families (with italics
// where available) so a live preview shows the real letterforms.
export function googleFontsHref(families: string[]): string {
  const uniq = Array.from(new Set(families.filter(Boolean)));
  if (uniq.length === 0) return "";
  const parts = uniq.map((fam) => {
    const meta = FONT_CATALOG[fam];
    const famParam = fam.replace(/ /g, "+");
    if (meta) {
      const weights = meta.weights.join(";");
      return meta.hasItalic
        ? `family=${famParam}:ital,wght@0,${meta.weights.map((w) => w).join(";0,")};1,400`
        : `family=${famParam}:wght@${weights}`;
    }
    // Custom family — request a safe spread of weights.
    return `family=${famParam}:wght@400;700`;
  });
  return `https://fonts.googleapis.com/css2?${parts.join("&")}&display=swap`;
}

// CSS font-family stack with a category-appropriate fallback.
export function fontFamilyStack(family: string): string {
  const meta = FONT_CATALOG[family];
  const fallback =
    meta?.category === "serif" ? "Georgia, serif" : meta?.category === "display" ? "system-ui, sans-serif" : "system-ui, sans-serif";
  return `"${family}", ${fallback}`;
}

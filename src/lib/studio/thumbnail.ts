// Goblin Studio — Thumbnail makers (July 2026).
// Composes a final, exact-size branded thumbnail from a generated background (or
// an uploaded photo): resize to the exact platform size, draw the title with the
// brand font (accent word in the brand color), add a readability scrim, and
// stamp the logo inside the platform safe zone.
//
// YouTube  → 1280×720 (16:9)   Short-form → 1080×1920 (9:16)

import sharp from "sharp";
import { renderTextImage } from "./text-overlay";
import { hasRealTransparency, stripLogoBackground } from "./logo-overlay";

export type ThumbFormat = "youtube" | "short";
export type LogoPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

// Stored on the job row (overlay_spec) so the completion step can render it.
export interface ThumbnailOverlaySpec {
  format: ThumbFormat;
  title: string;
  accentWord?: string;
  subtitle?: string;        // optional secondary line (body font, italic)
  headlineFont: string;
  headlineWeight: number;
  uppercase: boolean;
  bodyFont: string;
  bodyItalic: boolean;
  textColor: string;        // hex, light
  accentColor: string;      // hex, brand accent
  logoShow: boolean;
  logoPosition: LogoPosition;
  scrim: boolean;
}

export const THUMBNAIL_OUTPUT: Record<ThumbFormat, { w: number; h: number }> = {
  youtube: { w: 1280, h: 720 },
  short:   { w: 1080, h: 1920 },
};

// Title safe-zone box (px) per platform.
//  YouTube: left two-thirds, ~6% margins, clear of the bottom-right duration stamp.
//  Short:   centered, upper-middle third, clear of top 10% / bottom 20% / right edge.
function titleBox(fmt: ThumbFormat): { x: number; y: number; width: number; height: number } {
  const { w, h } = THUMBNAIL_OUTPUT[fmt];
  if (fmt === "youtube") {
    const m = Math.round(w * 0.06);
    return { x: m, y: Math.round(h * 0.14), width: Math.round(w * 0.62), height: Math.round(h * 0.5) };
  }
  const mx = Math.round(w * 0.09);
  return { x: mx, y: Math.round(h * 0.17), width: w - mx * 2, height: Math.round(h * 0.30) };
}

// Pick a vivid accent hex from the brand palette (skip near-white / near-black).
export function pickAccentColor(palette?: Array<{ hex?: string }>): string {
  const hexes = (palette ?? [])
    .map((c) => c.hex)
    .filter((h): h is string => typeof h === "string" && /^#?[0-9a-fA-F]{6}$/.test(h.trim()));
  const score = (hex: string): number => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lum = (max + min) / 2;
    const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255) || 1);
    // Prefer saturated, mid-luminance colors.
    return sat * 100 - Math.abs(lum - 128) * 0.5;
  };
  let best = "#C8A24B"; // warm gold fallback
  let bestScore = -Infinity;
  for (const h of hexes) {
    const hx = h.startsWith("#") ? h : `#${h}`;
    const s = score(hx);
    if (s > bestScore) { bestScore = s; best = hx; }
  }
  return best;
}

// Build the background scene prompt (NO text — the overlay draws all lettering).
export function buildThumbnailScenePrompt(opts: {
  videoAbout?: string;
  oneThing?: string;
  colorWords?: string;
  styleNote?: string;
  peopleMode?: "none" | "silhouette" | "real_photo";
  format: ThumbFormat;
}): string {
  const people =
    opts.peopleMode === "silhouette"
      ? "Include a single anonymous dark silhouette of a person as a bold compositional element, with no facial detail."
      : "No people, faces, or human figures at all.";
  const shape = opts.format === "youtube" ? "wide 16:9 cinematic composition" : "tall 9:16 vertical composition";
  return [
    `A premium, cinematic ${shape} background for a video thumbnail about: ${opts.videoAbout || "the topic"}.`,
    opts.oneThing ? `The mood and energy should convey: ${opts.oneThing}.` : "",
    opts.styleNote ? `Art style: ${opts.styleNote}.` : "",
    opts.colorWords ? `Use the brand colors: ${opts.colorWords}.` : "",
    people,
    "Bold high-contrast focal subject with strong depth. Leave clean, uncluttered negative space where a large title will be added later.",
    "ABSOLUTELY NO text, letters, words, numbers, logos, wordmarks, captions, or watermarks anywhere in the image — all text is added separately.",
  ].filter(Boolean).join(" ");
}

// Prepare a logo buffer: resize + strip a white/near-white background so it
// reads as a clean watermark (mirrors the official-logo overlay behavior).
async function prepLogo(logoBuf: Buffer, targetW: number): Promise<Buffer> {
  const resized = await sharp(logoBuf, { failOn: "none" }).resize({ width: targetW, withoutEnlargement: false }).png().toBuffer();
  if (await hasRealTransparency(resized)) return resized;
  try {
    const stripped = await stripLogoBackground(resized);
    if (await hasRealTransparency(stripped)) return stripped;
  } catch { /* keep the opaque logo */ }
  return resized;
}

// Compose the final thumbnail. `baseBuf` is the generated scene or the uploaded
// photo; `logoBuf` is the brand's official logo (optional).
export async function renderThumbnail(
  baseBuf: Buffer,
  spec: ThumbnailOverlaySpec,
  logoBuf?: Buffer | null
): Promise<Buffer> {
  const { w, h } = THUMBNAIL_OUTPUT[spec.format];
  const box = titleBox(spec.format);
  const align: "left" | "centre" = spec.format === "short" ? "centre" : "left";
  const composites: Array<{ input: Buffer; top: number; left: number }> = [];

  // Readability scrim behind the title band.
  if (spec.scrim) {
    const bandTop = Math.max(0, box.y - Math.round(h * 0.03));
    const bandH = Math.round(box.height + h * 0.10);
    const scrimSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#000" stop-opacity="0"/>` +
        `<stop offset="0.5" stop-color="#000" stop-opacity="0.5"/>` +
        `<stop offset="1" stop-color="#000" stop-opacity="0"/>` +
        `</linearGradient></defs>` +
        `<rect x="0" y="${bandTop}" width="${w}" height="${bandH}" fill="url(#g)"/></svg>`
    );
    composites.push({ input: scrimSvg, top: 0, left: 0 });
  }

  // Title (headline font, accent word colored).
  const title = await renderTextImage({
    text: spec.title,
    family: spec.headlineFont,
    weight: spec.headlineWeight,
    uppercase: spec.uppercase,
    color: spec.textColor,
    accentWord: spec.accentWord,
    accentColor: spec.accentColor,
    boxWidth: box.width,
    boxHeight: box.height,
    align,
  });
  const titleLeft = spec.format === "short" ? Math.round((w - title.width) / 2) : box.x;
  composites.push({ input: title.buffer, top: box.y, left: Math.max(0, titleLeft) });

  // Optional secondary line (body font, italic).
  if (spec.subtitle && spec.subtitle.trim()) {
    const sub = await renderTextImage({
      text: spec.subtitle,
      family: spec.bodyFont,
      weight: 400,
      italic: spec.bodyItalic,
      color: spec.textColor,
      boxWidth: box.width,
      boxHeight: Math.round(h * 0.07),
      align,
    });
    const subTop = box.y + title.height + Math.round(h * 0.02);
    const subLeft = spec.format === "short" ? Math.round((w - sub.width) / 2) : box.x;
    composites.push({ input: sub.buffer, top: Math.min(subTop, h - sub.height), left: Math.max(0, subLeft) });
  }

  // Logo, inside the platform safe zone.
  if (spec.logoShow && logoBuf) {
    const logoW = Math.round(w * (spec.format === "short" ? 0.20 : 0.13));
    const logo = await prepLogo(logoBuf, logoW);
    const lm = await sharp(logo).metadata();
    const lw = lm.width ?? logoW;
    const lh = lm.height ?? logoW;
    const margin = Math.round(w * 0.035);
    // Short-form keeps the logo above the bottom ~20% caption/controls area.
    const bottomInset = spec.format === "short" ? Math.round(h * 0.22) : margin;
    const left = spec.logoPosition.endsWith("right") ? w - lw - margin : margin;
    const top = spec.logoPosition.startsWith("top") ? margin : h - lh - bottomInset;
    composites.push({ input: logo, top: Math.max(0, top), left: Math.max(0, left) });
  }

  return sharp(baseBuf, { failOn: "none" })
    .resize(w, h, { fit: "cover", position: "attention" })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toBuffer();
}

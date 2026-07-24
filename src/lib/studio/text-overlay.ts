// Goblin Studio — real text renderer (Saved Brand Fonts / Thumbnails, July 2026).
//
// V2 — VECTOR OUTLINES (July 24). The original renderer asked Pango to draw
// text, and Pango depends on fontconfig — which is broken/absent on the Vercel
// serverless image, so every glyph rendered as a tofu box no matter which font
// file we supplied (three hardening rounds proved this empirically: colors and
// layout applied, glyph shapes never did).
//
// This version REMOVES the OS font stack from the loop entirely:
//   1. we already download the brand's real .ttf (font-files.ts, verified);
//   2. opentype.js (pure JS) reads the glyph OUTLINES straight from that file;
//   3. we lay the words out ourselves (wrap, auto-fit, accent-word color) and
//      emit plain SVG <path> shapes;
//   4. sharp rasterizes shapes — no fonts needed at raster time. The logo badge
//      and scrim SVGs already prove this pipeline works in production.
//
// Same public API as v1; src/lib/studio/thumbnail.ts is the only caller.

import sharp from "sharp";
import { promises as fs } from "fs";
import { getFontFile } from "./font-files";

export interface TextImageOpts {
  text: string;
  family: string;
  weight?: number;          // 400..900
  italic?: boolean;
  uppercase?: boolean;
  color: string;            // hex, e.g. "#FFFFFF"
  accentWord?: string;
  accentColor?: string;     // hex for the accent word
  boxWidth: number;         // wrap width in px
  boxHeight: number;        // max height in px
  align?: "left" | "centre" | "right";
}

// ── Font loading (parsed-font cache per process) ────────────────────────────

// opentype.js is CJS with bundled types that don't always match runtime usage;
// keep it behind a narrow any-typed dynamic import so the Vercel build can
// never fail on a typings mismatch.
/* eslint-disable @typescript-eslint/no-explicit-any */
let opentypeMod: any | null = null;
async function opentype(): Promise<any> {
  if (!opentypeMod) {
    const m: any = await import("opentype.js");
    // CJS/ESM interop: depending on the bundler the API surface lives on the
    // namespace itself OR under .default. Pick whichever actually has parse().
    opentypeMod = typeof m?.parse === "function" ? m : m?.default;
  }
  return opentypeMod;
}

const parsedFonts = new Map<string, any>();

async function loadParsedFont(
  family: string,
  weight: number,
  italic: boolean
): Promise<any | null> {
  const tryOne = async (fam: string, w: number, it: boolean): Promise<any | null> => {
    const resolved = await getFontFile(fam, w, it);
    if (!resolved) return null;
    if (parsedFonts.has(resolved.path)) return parsedFonts.get(resolved.path);
    try {
      const buf = await fs.readFile(resolved.path);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const font = (await opentype()).parse(ab);
      // Sanity: the font must produce a real outline for a capital letter.
      const probe = font.getPath("A", 0, 0, 64).toPathData(1);
      if (!probe || probe.length < 8) return null;
      parsedFonts.set(resolved.path, font);
      return font;
    } catch {
      return null;
    }
  };
  return (
    (await tryOne(family, weight, italic)) ??
    (await tryOne(family, weight, false)) ??
    (await tryOne("Jost", 700, false))
  );
}

// ── Layout ──────────────────────────────────────────────────────────────────

interface Word { text: string; accent: boolean }

function wrapLines(
  font: any,
  words: Word[],
  size: number,
  maxWidth: number
): { lines: Word[][]; maxLineWidth: number } {
  const spaceW = Math.max(font.getAdvanceWidth(" ", size) || 0, size * 0.24);
  const lines: Word[][] = [];
  let line: Word[] = [];
  let lineW = 0;
  let maxLineWidth = 0;

  for (const w of words) {
    const ww = font.getAdvanceWidth(w.text, size);
    const cand = line.length === 0 ? ww : lineW + spaceW + ww;
    if (line.length > 0 && cand > maxWidth) {
      lines.push(line);
      maxLineWidth = Math.max(maxLineWidth, lineW);
      line = [w];
      lineW = ww;
    } else {
      line = [...line, w];
      lineW = cand;
    }
  }
  if (line.length > 0) {
    lines.push(line);
    maxLineWidth = Math.max(maxLineWidth, lineW);
  }
  return { lines, maxLineWidth };
}

// ── Renderer ────────────────────────────────────────────────────────────────

const LINE_HEIGHT = 1.16;

export async function renderTextImage(
  o: TextImageOpts
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const shown = (o.uppercase ? o.text.toUpperCase() : o.text).trim();
  const boxW = Math.max(8, Math.round(o.boxWidth));
  const boxH = Math.max(8, Math.round(o.boxHeight));

  const font = await loadParsedFont(o.family, o.weight ?? 700, !!o.italic);
  if (!font || !shown) {
    // Absolute last resort: a transparent 1×1 so composition never crashes.
    const empty = await sharp({
      create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).png().toBuffer();
    return { buffer: empty, width: 1, height: 1 };
  }

  const accentTarget = (o.accentWord ?? "").trim().toLowerCase();
  const words: Word[] = shown
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => ({ text: t, accent: !!accentTarget && t.toLowerCase() === accentTarget }));

  // Auto-fit: largest size whose wrapped layout fits both box dimensions.
  // Binary search over font size (wrapping re-computed per candidate size).
  let lo = 8;
  let hi = boxH;
  let best = { size: lo, ...wrapLines(font, words, lo, boxW) };
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const layout = wrapLines(font, words, mid, boxW);
    const totalH = layout.lines.length * mid * LINE_HEIGHT;
    if (layout.maxLineWidth <= boxW && totalH <= boxH) {
      best = { size: mid, ...layout };
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const size = best.size;
  const lineH = size * LINE_HEIGHT;
  const ascent = (size * (font.ascender ?? 800)) / (font.unitsPerEm ?? 1000);
  const height = Math.ceil(best.lines.length * lineH);
  const spaceW = Math.max(font.getAdvanceWidth(" ", size) || 0, size * 0.24);

  // Emit one <path> per word — pure shapes, zero font-system involvement.
  const paths: string[] = [];
  best.lines.forEach((line, li) => {
    const lineWidth =
      line.reduce((acc, w) => acc + font.getAdvanceWidth(w.text, size), 0) +
      spaceW * (line.length - 1);
    let x =
      o.align === "centre" ? (boxW - lineWidth) / 2 :
      o.align === "right" ? boxW - lineWidth : 0;
    const baseline = li * lineH + ascent;
    for (const w of line) {
      const d = font.getPath(w.text, x, baseline, size).toPathData(2);
      const fill = w.accent ? (o.accentColor ?? o.color) : o.color;
      if (d) paths.push(`<path d="${d}" fill="${fill}"/>`);
      x += font.getAdvanceWidth(w.text, size) + spaceW;
    }
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${height}" ` +
    `viewBox="0 0 ${boxW} ${height}">${paths.join("")}</svg>`;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width ?? boxW, height: meta.height ?? height };
}

// Goblin Studio — real text renderer (Saved Brand Fonts / Thumbnails, July 2026).
//
// Renders a block of text into a transparent RGBA image using the brand's REAL
// font, so titles come out crisp and correctly spelled instead of hoping the
// image model draws letters. Built on sharp's native text (Pango) so it loads a
// specific .ttf via `fontfile` and supports per-word color via Pango markup —
// the same sharp the official-logo overlay already uses in production.
//
// This is the shared primitive; src/lib/studio/thumbnail.ts composes these
// blocks onto a generated background with safe-zone placement + a logo stamp.

import sharp from "sharp";
import { getFontFilePath } from "./font-files";

// Escape text for Pango markup (only these three are special).
export function escapePango(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Build Pango markup, coloring one accent word if given.
function buildMarkup(text: string, color: string, accentWord?: string, accentColor?: string): string {
  if (!accentWord || !accentWord.trim()) {
    return `<span foreground="${color}">${escapePango(text)}</span>`;
  }
  const target = accentWord.trim().toLowerCase();
  return text
    .split(/(\s+)/)
    .map((tok) =>
      tok.trim() && tok.toLowerCase() === target
        ? `<span foreground="${accentColor ?? color}">${escapePango(tok)}</span>`
        : `<span foreground="${color}">${escapePango(tok)}</span>`
    )
    .join("");
}

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
  boxHeight: number;        // max height in px (sharp auto-fits the size)
  align?: "left" | "centre" | "right";
}

// Render the text and return the RGBA PNG plus its actual pixel size.
export async function renderTextImage(
  o: TextImageOpts
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const shown = o.uppercase ? o.text.toUpperCase() : o.text;
  const markup = buildMarkup(shown, o.color, o.accentWord, o.accentColor);
  const fontfile = (await getFontFilePath(o.family, o.weight ?? 700, !!o.italic)) ?? undefined;
  // Pango font description — family, optional style, then an EXPLICIT trailing
  // size. The explicit size is required so Pango does not misread a font family
  // that ends in a number (e.g. "Baloo 2", "Source Sans 3") as a 2pt/3pt size.
  // sharp auto-scales to the box because width + height are set, so this size is
  // only a base and the family always parses correctly.
  const fontDesc = `${o.family}${o.italic ? " Italic" : ""} 40`;

  const textInput: Record<string, unknown> = {
    text: markup,
    font: fontDesc,
    width: Math.max(1, Math.round(o.boxWidth)),
    height: Math.max(1, Math.round(o.boxHeight)),
    align: o.align ?? "left",
    rgba: true,
  };
  if (fontfile) textInput.fontfile = fontfile;

  const buffer = await sharp({ text: textInput as never }).png().toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width ?? 0, height: meta.height ?? 0 };
}

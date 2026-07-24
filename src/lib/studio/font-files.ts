// Goblin Studio — runtime font-file loader for the text overlay (July 2026).
//
// The overlay draws real text with the brand's font, which means sharp/Pango
// needs an actual .ttf on disk. This resolves a family+weight+italic to a font
// file, in priority order:
//   1. a bundled file in /public/fonts (best — zero network)
//   2. a previously-downloaded copy in the OS temp cache
//   3. a fresh download from Google Fonts (server has network; cached after)
//
// TOFU-BOX HARDENING (July 24): the serverless image has ZERO system fonts, so
// a bad font file silently renders every glyph as □. Three defenses now:
//   • the Google css2 response can contain multiple per-script subsets — we
//     pick the /* latin */ block (falling back to the last block, Google's
//     latin-by-convention position), never blindly the first URL.
//   • every file (downloaded OR cache-hit) is verified with inspectTtf() to
//     actually contain A–Z glyphs; failures are discarded and re-fetched, and
//     a file that can't be verified is never returned.
//   • we return the family name THE FILE ITSELF declares, so Pango is always
//     asked for a name that exists in the file (static per-weight cuts often
//     carry style-suffixed names that don't match the API family).
// Callers fall back to the house font when this returns null — see
// text-overlay.ts.

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { inspectTtf } from "./ttf-inspect";

const CACHE_DIR = path.join(os.tmpdir(), "bg-font-cache");

export interface ResolvedFont {
  path: string;
  // The family name to hand to Pango — the file's own internal name when it
  // has one, otherwise the requested family.
  family: string;
}

const memo = new Map<string, ResolvedFont | null>();

// A deliberately old User-Agent makes the Google Fonts CSS API return .ttf
// (truetype) rather than .woff2, which sharp/Pango loads directly.
const TTF_UA = "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1";

function safeName(family: string): string {
  return family.replace(/[^\w-]/g, "");
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

// Verify a font file has real Latin glyphs; return the ResolvedFont or null.
async function verifyFile(p: string, requestedFamily: string): Promise<ResolvedFont | null> {
  try {
    const buf = await fs.readFile(p);
    const info = inspectTtf(buf);
    if (!info.hasLatinCaps) return null;
    return { path: p, family: info.family ?? requestedFamily };
  } catch {
    return null;
  }
}

// Look for a bundled TTF in /public/fonts using conventional names.
async function tryBundled(family: string, italic: boolean): Promise<ResolvedFont | null> {
  const dir = path.join(process.cwd(), "public", "fonts");
  const bare = family.replace(/\s+/g, "");
  const names = italic
    ? [`${bare}-Italic.ttf`, `${bare}Italic.ttf`]
    : [`${bare}.ttf`, `${bare}-Regular.ttf`];
  for (const n of names) {
    const full = path.join(dir, n);
    if (await fileExists(full)) {
      const ok = await verifyFile(full, family);
      if (ok) return ok;
    }
  }
  return null;
}

// Pick the best TrueType URL from a css2 response. The response may hold
// several @font-face blocks, one per script subset, each preceded by a comment
// like /* latin */ — a non-Latin subset has NO Latin glyphs at all, which is
// exactly the tofu bug. Prefer the latin block; fall back to the last block.
//
// JULY 24 PROD FINDING (font-debug ground truth): the old matcher required the
// URL to literally end in ".ttf", but the live lambda's css2 response can
// carry its TrueType URL without that extension — so ttfUrl came back null,
// every family (including the Jost fallback) resolved to null, and titles
// rendered as an invisible 1×1. Match on format('truetype'/'opentype') OR a
// .ttf/.otf extension, and never accept woff/woff2 (opentype.js can't parse
// woff2).
export function pickTtfUrlFromCss(css: string): string | null {
  const re =
    /\/\*\s*([\w-]+)\s*\*\/|url\((https:\/\/[^)\s'"]+)\)(?:\s*format\(\s*['"]?([\w-]+)['"]?\s*\))?/gi;
  let currentSubset: string | null = null;
  let latinUrl: string | null = null;
  let lastUrl: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    if (m[1]) {
      currentSubset = m[1].toLowerCase();
      continue;
    }
    const url = m[2];
    if (!url) continue;
    const fmt = (m[3] ?? "").toLowerCase();
    const looksWoff = /\.woff2?($|\?)/i.test(url) || fmt === "woff" || fmt === "woff2";
    const looksTtf = /\.(ttf|otf)($|\?)/i.test(url) || fmt === "truetype" || fmt === "opentype";
    if (looksWoff || !looksTtf) continue;
    lastUrl = url;
    if (currentSubset === "latin" && !latinUrl) latinUrl = url;
  }
  return latinUrl ?? lastUrl;
}

export async function getFontFile(
  family: string,
  weight = 700,
  italic = false
): Promise<ResolvedFont | null> {
  const fam = (family ?? "").trim();
  if (!fam) return null;
  const key = `${fam}:${weight}:${italic ? 1 : 0}`;
  if (memo.has(key)) return memo.get(key) ?? null;

  // 1. bundled (verified)
  const bundled = await tryBundled(fam, italic);
  if (bundled) { memo.set(key, bundled); return bundled; }

  // 2. temp cache — VERIFIED on every first use per process; a bad cached
  //    file (the pre-fix downloads) is deleted and re-fetched.
  const cacheFile = path.join(CACHE_DIR, `${safeName(fam)}-${weight}${italic ? "i" : ""}.ttf`);
  if (await fileExists(cacheFile)) {
    const ok = await verifyFile(cacheFile, fam);
    if (ok) { memo.set(key, ok); return ok; }
    try { await fs.unlink(cacheFile); } catch { /* ignore */ }
  }

  // 3. download from Google Fonts. Try the exact weight/italic first, then fall
  //    back to looser requests so single-weight display fonts (Bangers, etc.)
  //    and fonts without an italic cut still resolve instead of failing.
  try {
    const famParam = fam.replace(/ /g, "+");
    const candidates = italic
      ? [
          `:ital,wght@1,${weight}`,
          `:ital@1`,
          `:wght@${weight}`,
          ``,
        ]
      : [
          `:wght@${weight}`,
          ``,
        ];

    for (const axis of candidates) {
      try {
        const cssUrl = `https://fonts.googleapis.com/css2?family=${famParam}${axis}&display=swap`;
        const cssRes = await fetch(cssUrl, { headers: { "User-Agent": TTF_UA } });
        if (!cssRes.ok) continue;
        const ttfUrl = pickTtfUrlFromCss(await cssRes.text());
        if (!ttfUrl) continue;

        const ttfRes = await fetch(ttfUrl);
        if (!ttfRes.ok) continue;
        const buf = Buffer.from(await ttfRes.arrayBuffer());

        // Reject files without real A–Z glyphs — try the next, looser variant.
        const info = inspectTtf(buf);
        if (!info.hasLatinCaps) continue;

        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(cacheFile, buf);
        const resolved: ResolvedFont = { path: cacheFile, family: info.family ?? fam };
        memo.set(key, resolved);
        return resolved;
      } catch { /* try the next, looser request */ }
    }
    throw new Error("no verifiable latin ttf in any css variant");
  } catch (err) {
    console.error(`[font-files] could not load "${fam}" (${weight}${italic ? "i" : ""}):`, err);
    memo.set(key, null);
    return null;
  }
}

// Back-compat wrapper (path only).
export async function getFontFilePath(
  family: string,
  weight = 700,
  italic = false
): Promise<string | null> {
  const r = await getFontFile(family, weight, italic);
  return r?.path ?? null;
}

// Goblin Studio — runtime font-file loader for the text overlay (July 2026).
//
// The overlay draws real text with the brand's font, which means sharp/Pango
// needs an actual .ttf on disk. This resolves a family+weight+italic to a font
// file path, in priority order:
//   1. a bundled file in /public/fonts (best — zero network)
//   2. a previously-downloaded copy in the OS temp cache
//   3. a fresh download from Google Fonts (server has network; cached after)
// Returns null if nothing can be resolved — the caller then falls back to a
// generic system font so a thumbnail never fails to render.

import { promises as fs } from "fs";
import path from "path";
import os from "os";

const CACHE_DIR = path.join(os.tmpdir(), "bg-font-cache");
const memo = new Map<string, string | null>();

// A deliberately old User-Agent makes the Google Fonts CSS API return .ttf
// (truetype) rather than .woff2, which sharp/Pango loads directly.
const TTF_UA = "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1";

function safeName(family: string): string {
  return family.replace(/[^\w-]/g, "");
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

// Look for a bundled TTF in /public/fonts using conventional names.
async function tryBundled(family: string, italic: boolean): Promise<string | null> {
  const dir = path.join(process.cwd(), "public", "fonts");
  const bare = family.replace(/\s+/g, "");
  const names = italic
    ? [`${bare}-Italic.ttf`, `${bare}Italic.ttf`]
    : [`${bare}.ttf`, `${bare}-Regular.ttf`];
  for (const n of names) {
    const full = path.join(dir, n);
    if (await fileExists(full)) return full;
  }
  return null;
}

export async function getFontFilePath(
  family: string,
  weight = 700,
  italic = false
): Promise<string | null> {
  const fam = (family ?? "").trim();
  if (!fam) return null;
  const key = `${fam}:${weight}:${italic ? 1 : 0}`;
  if (memo.has(key)) return memo.get(key) ?? null;

  // 1. bundled
  const bundled = await tryBundled(fam, italic);
  if (bundled) { memo.set(key, bundled); return bundled; }

  // 2. temp cache
  const cacheFile = path.join(CACHE_DIR, `${safeName(fam)}-${weight}${italic ? "i" : ""}.ttf`);
  if (await fileExists(cacheFile)) { memo.set(key, cacheFile); return cacheFile; }

  // 3. download from Google Fonts
  try {
    const famParam = fam.replace(/ /g, "+");
    const axis = italic ? `:ital,wght@1,${weight}` : `:wght@${weight}`;
    const cssUrl = `https://fonts.googleapis.com/css2?family=${famParam}${axis}&display=swap`;
    const cssRes = await fetch(cssUrl, { headers: { "User-Agent": TTF_UA } });
    if (!cssRes.ok) throw new Error(`css ${cssRes.status}`);
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((https:\/\/[^)]+?\.ttf)\)/i);
    if (!match) throw new Error("no ttf url in css");
    const ttfRes = await fetch(match[1]);
    if (!ttfRes.ok) throw new Error(`ttf ${ttfRes.status}`);
    const buf = Buffer.from(await ttfRes.arrayBuffer());
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cacheFile, buf);
    memo.set(key, cacheFile);
    return cacheFile;
  } catch (err) {
    console.error(`[font-files] could not load "${fam}" (${weight}${italic ? "i" : ""}):`, err);
    memo.set(key, null);
    return null;
  }
}

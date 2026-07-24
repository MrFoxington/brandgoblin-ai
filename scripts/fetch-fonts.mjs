#!/usr/bin/env node
// BrandGoblin — one-time font pack builder (July 2026).
//
// Downloads every font family the Studio pickers offer (see src/lib/studio/
// fonts.ts) straight from Google Fonts, verifies each file actually parses
// and contains real A–Z letter shapes, saves them into public/fonts/, and
// writes src/lib/studio/font-manifest.json so the server-side text renderer
// uses the bundled files and never depends on Google at runtime again.
//
// Run it from the repo root on a machine with normal internet:
//   node scripts/fetch-fonts.mjs
// Then commit public/fonts and src/lib/studio/font-manifest.json.
//
// Italic cuts are only fetched at weight 400 — the thumbnail renderer only
// ever uses italics for the body/subtitle line, which renders at 400.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "fonts");
const MANIFEST_PATH = path.join(ROOT, "src", "lib", "studio", "font-manifest.json");

// Old UA → Google serves single-file woff/ttf css (modern UAs get woff2,
// which the server-side parser cannot read).
const UA = "Mozilla/5.0 (Windows NT 5.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1";

// Mirror of the curated catalog in src/lib/studio/fonts.ts (family, weights,
// hasItalic). If you add a family there, add it here and re-run this script.
const CATALOG = [
  ["Jost", [400, 500, 700, 900], true],
  ["Anton", [400], false],
  ["Bebas Neue", [400], false],
  ["Oswald", [400, 500, 600, 700], false],
  ["Archivo Black", [400], false],
  ["Montserrat", [400, 600, 700, 800, 900], true],
  ["Poppins", [400, 500, 600, 700, 800], true],
  ["Space Grotesk", [400, 500, 600, 700], false],
  ["Teko", [400, 500, 600, 700], false],
  ["Fjalla One", [400], false],
  ["Barlow Condensed", [400, 500, 600, 700], true],
  ["Kanit", [400, 500, 600, 700, 800], true],
  ["Sora", [400, 500, 600, 700, 800], false],
  ["Titan One", [400], false],
  ["Lora", [400, 500, 600, 700], true],
  ["Playfair Display", [400, 500, 600, 700, 800, 900], true],
  ["Cormorant", [400, 500, 600, 700], true],
  ["DM Serif Display", [400], true],
  ["Libre Baskerville", [400, 700], true],
  ["Merriweather", [400, 700, 900], true],
  ["PT Serif", [400, 700], true],
  ["Bitter", [400, 500, 600, 700], true],
  ["EB Garamond", [400, 500, 600, 700], true],
  ["Spectral", [400, 500, 600, 700], true],
  ["Inter", [400, 500, 600, 700, 800, 900], true],
  ["Work Sans", [400, 500, 600, 700], true],
  ["Nunito Sans", [400, 600, 700, 800], true],
  ["Source Sans 3", [400, 600, 700], true],
  ["Roboto", [400, 500, 700, 900], true],
  ["Open Sans", [400, 600, 700, 800], true],
  ["Lato", [400, 700, 900], true],
  ["DM Sans", [400, 500, 700], true],
  ["Manrope", [400, 500, 600, 700, 800], false],
  ["Rubik", [400, 500, 600, 700], true],
  ["Raleway", [400, 500, 600, 700, 800], true],
  ["Nunito", [400, 600, 700, 800], true],
  ["Bangers", [400], false],
  ["Luckiest Guy", [400], false],
  ["Bowlby One", [400], false],
  ["Baloo 2", [400, 500, 600, 700, 800], false],
  ["Alfa Slab One", [400], false],
  ["Passion One", [400, 700, 900], false],
  ["Paytone One", [400], false],
  ["Staatliches", [400], false],
  ["Righteous", [400], false],
  ["Changa One", [400, 700], false],
  ["Bricolage Grotesque", [400, 500, 600, 700, 800], false],
  ["Unbounded", [400, 500, 700, 900], false],
  ["Gabarito", [400, 500, 600, 700, 800, 900], false],
  ["Hanken Grotesk", [400, 500, 600, 700, 800], true],
  ["Onest", [400, 500, 600, 700, 800], false],
  ["Fraunces", [400, 500, 600, 700, 900], true],
  ["Instrument Serif", [400], true],
  ["Pacifico", [400], false],
  ["Caveat", [400, 700], false],
  ["Dancing Script", [400, 700], false],
  ["Permanent Marker", [400], false],
  ["Satisfy", [400], false],
  ["Space Mono", [400, 700], true],
  ["JetBrains Mono", [400, 700, 800], true],
  ["IBM Plex Mono", [400, 500, 600, 700], true],
];

// ── Verification: parse with the repo's own opentype.js when available ──────
let opentype = null;
try {
  const require = createRequire(import.meta.url);
  const m = require("opentype.js");
  opentype = typeof m?.parse === "function" ? m : m?.default;
} catch {
  console.warn("! opentype.js not found in node_modules — falling back to signature checks only");
}

function verify(buf) {
  if (buf.length < 1000) return false;
  const sig = buf.readUInt32BE(0);
  const knownSig = sig === 0x00010000 || sig === 0x4f54544f || sig === 0x74727565 || sig === 0x774f4646; // ttf / OTTO / true / wOFF
  if (!knownSig) return false;
  if (!opentype) return true;
  try {
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const font = opentype.parse(ab);
    for (const ch of ["A", "R", "Z", "a", "g"]) {
      const d = font.getPath(ch, 0, 0, 64).toPathData(1);
      if (!d || d.length < 8) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ── css2 helpers (same logic as src/lib/studio/font-files.ts) ───────────────
function pickFontUrlFromCss(css) {
  const re = /\/\*\s*([\w-]+)\s*\*\/|url\((https:\/\/[^)\s'"]+)\)(?:\s*format\(\s*['"]?([\w-]+)['"]?\s*\))?/gi;
  let subset = null;
  const found = [];
  let m;
  while ((m = re.exec(css)) !== null) {
    if (m[1]) { subset = m[1].toLowerCase(); continue; }
    const url = m[2];
    if (!url) continue;
    const fmt = (m[3] ?? "").toLowerCase();
    if (/\.woff2($|\?)/i.test(url) || fmt === "woff2") continue;
    const ttf = /\.(ttf|otf)($|\?)/i.test(url) || fmt === "truetype" || fmt === "opentype";
    const woff = /\.woff($|\?)/i.test(url) || fmt === "woff";
    if (!ttf && !woff) continue;
    found.push({ url, ttf, latin: subset === "latin" || subset === null });
  }
  const pick = (list) => (list.find((f) => f.latin) ?? list[list.length - 1])?.url ?? null;
  return pick(found.filter((f) => f.ttf)) ?? pick(found.filter((f) => !f.ttf));
}

function extFromUrl(url) {
  const m = url.match(/\.(ttf|otf|woff)($|\?)/i);
  return m ? m[1].toLowerCase() : "woff";
}

async function fetchOne(family, weight, italic) {
  const famParam = family.replace(/ /g, "+");
  const axes = italic
    ? [`:ital,wght@1,${weight}`, `:ital@1`, `:wght@${weight}`, ``]
    : [`:wght@${weight}`, ``];
  for (const axis of axes) {
    try {
      const cssRes = await fetch(
        `https://fonts.googleapis.com/css2?family=${famParam}${axis}&display=swap`,
        { headers: { "User-Agent": UA } }
      );
      if (!cssRes.ok) continue;
      const url = pickFontUrlFromCss(await cssRes.text());
      if (!url) continue;
      const fontRes = await fetch(url);
      if (!fontRes.ok) continue;
      const buf = Buffer.from(await fontRes.arrayBuffer());
      if (!verify(buf)) continue;
      return { buf, ext: extFromUrl(url) };
    } catch { /* try next axis */ }
  }
  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────
const manifest = {};
let okCount = 0;
const failures = [];

await fs.mkdir(OUT_DIR, { recursive: true });

for (const [family, weights, hasItalic] of CATALOG) {
  const bare = family.replace(/\s+/g, "");
  const jobs = weights.map((w) => [w, false]);
  if (hasItalic) jobs.push([400, true]); // italics only ever render at 400
  for (const [w, ital] of jobs) {
    const got = await fetchOne(family, w, ital);
    const label = `${family} ${w}${ital ? " italic" : ""}`;
    if (!got) {
      failures.push(label);
      console.log(`  FAIL  ${label}`);
      continue;
    }
    const fileName = `${bare}-${w}${ital ? "i" : ""}.${got.ext}`;
    await fs.writeFile(path.join(OUT_DIR, fileName), got.buf);
    manifest[family] = manifest[family] ?? {};
    manifest[family][`${w}${ital ? "i" : ""}`] = fileName;
    okCount++;
    console.log(`  ok    ${label}  ->  ${fileName} (${Math.round(got.buf.length / 1024)} KB)`);
  }
}

await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

console.log(`\nDone: ${okCount} files in public/fonts, manifest written.`);
if (failures.length) console.log(`Could not fetch (${failures.length}): ${failures.join(", ")}`);

if (!manifest["Jost"]?.["700"]) {
  console.error("\nERROR: the house font (Jost 700) is missing from the pack — do not ship this. Re-run the script or check your internet connection.");
  process.exit(1);
}
console.log("\nNext: git add public/fonts src/lib/studio/font-manifest.json && commit && push.");

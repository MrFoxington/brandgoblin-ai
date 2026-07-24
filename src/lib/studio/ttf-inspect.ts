// Goblin Studio — minimal TTF/OTF inspector (July 2026, tofu-box fix).
//
// Thumbnails were rendering titles as tofu boxes (□□□□). The serverless image
// has ZERO system fonts, so if the downloaded font file is unusable — a subset
// without Latin glyphs, a corrupt download, or a file whose INTERNAL family
// name doesn't match the name we hand to Pango — every glyph silently renders
// as .notdef. This inspector lets the font loader verify a file before trusting
// it, and read the file's own family name so Pango is always asked for a name
// that actually exists in the file.
//
// Deliberately dependency-free: parses just the table directory, cmap (formats
// 4 + 12), and name table. Anything unexpected → nulls, never throws.

export interface TtfInfo {
  // Family name embedded in the file (nameID 16, falling back to nameID 1).
  family: string | null;
  // True when the file maps real glyphs for every A–Z codepoint.
  hasLatinCaps: boolean;
}

function u16(buf: Buffer, off: number): number { return buf.readUInt16BE(off); }
function u32(buf: Buffer, off: number): number { return buf.readUInt32BE(off); }

interface TableRecord { tag: string; offset: number; length: number }

function readTables(buf: Buffer): Map<string, TableRecord> | null {
  if (buf.length < 12) return null;
  const version = u32(buf, 0);
  // 0x00010000 = TrueType, 'OTTO' = CFF OpenType, 'true' = older TrueType.
  if (version !== 0x00010000 && version !== 0x4f54544f && version !== 0x74727565) return null;
  const numTables = u16(buf, 4);
  if (numTables === 0 || numTables > 512) return null;
  const tables = new Map<string, TableRecord>();
  for (let i = 0; i < numTables; i++) {
    const base = 12 + i * 16;
    if (base + 16 > buf.length) return null;
    const tag = buf.toString("latin1", base, base + 4);
    const offset = u32(buf, base + 8);
    const length = u32(buf, base + 12);
    if (offset + length > buf.length) continue; // skip malformed record
    tables.set(tag, { tag, offset, length });
  }
  return tables;
}

// ── cmap: does the font map a real glyph for this codepoint? ────────────────

function glyphInFormat4(buf: Buffer, sub: number, cp: number): boolean {
  const segCountX2 = u16(buf, sub + 6);
  const segCount = segCountX2 / 2;
  const endBase = sub + 14;
  const startBase = endBase + segCountX2 + 2; // +2 reservedPad
  const deltaBase = startBase + segCountX2;
  const rangeBase = deltaBase + segCountX2;
  for (let i = 0; i < segCount; i++) {
    const end = u16(buf, endBase + i * 2);
    if (cp > end) continue;
    const start = u16(buf, startBase + i * 2);
    if (cp < start) return false; // segments are sorted; cp falls in a gap
    const idRangeOffset = u16(buf, rangeBase + i * 2);
    if (idRangeOffset === 0) {
      const delta = u16(buf, deltaBase + i * 2);
      return ((cp + delta) & 0xffff) !== 0;
    }
    const glyphAddr = rangeBase + i * 2 + idRangeOffset + (cp - start) * 2;
    if (glyphAddr + 2 > buf.length) return false;
    return u16(buf, glyphAddr) !== 0;
  }
  return false;
}

function glyphInFormat12(buf: Buffer, sub: number, cp: number): boolean {
  const nGroups = u32(buf, sub + 12);
  for (let i = 0; i < nGroups; i++) {
    const g = sub + 16 + i * 12;
    if (g + 12 > buf.length) return false;
    const startChar = u32(buf, g);
    const endChar = u32(buf, g + 4);
    if (cp < startChar) return false; // groups are sorted
    if (cp <= endChar) return u32(buf, g + 8) + (cp - startChar) !== 0;
  }
  return false;
}

function cmapHasCodepoint(buf: Buffer, cmap: TableRecord, cp: number): boolean {
  const base = cmap.offset;
  const numSubtables = u16(buf, base + 2);
  for (let i = 0; i < numSubtables; i++) {
    const rec = base + 4 + i * 8;
    const platformID = u16(buf, rec);
    const encodingID = u16(buf, rec + 2);
    const subOff = u32(buf, rec + 4);
    const sub = base + subOff;
    if (sub + 4 > buf.length) continue;
    // Unicode-capable subtables only.
    const unicodeish =
      platformID === 0 || (platformID === 3 && (encodingID === 1 || encodingID === 10));
    if (!unicodeish) continue;
    const format = u16(buf, sub);
    if (format === 4 && glyphInFormat4(buf, sub, cp)) return true;
    if (format === 12 && glyphInFormat12(buf, sub, cp)) return true;
  }
  return false;
}

// ── name table: the family name the font itself declares ────────────────────

function readName(buf: Buffer, name: TableRecord, wantedId: number): string | null {
  const base = name.offset;
  const count = u16(buf, base + 2);
  const stringOffset = base + u16(buf, base + 4);
  let best: string | null = null;
  for (let i = 0; i < count; i++) {
    const rec = base + 6 + i * 12;
    if (rec + 12 > buf.length) break;
    const platformID = u16(buf, rec);
    const nameID = u16(buf, rec + 6);
    const length = u16(buf, rec + 8);
    const offset = u16(buf, rec + 10);
    if (nameID !== wantedId) continue;
    const start = stringOffset + offset;
    if (start + length > buf.length) continue;
    if (platformID === 3 || platformID === 0) {
      // UTF-16BE
      const raw = buf.subarray(start, start + length);
      let s = "";
      for (let j = 0; j + 1 < raw.length; j += 2) s += String.fromCharCode(raw.readUInt16BE(j));
      best = s.trim() || best;
    } else if (platformID === 1 && !best) {
      best = buf.toString("latin1", start, start + length).trim() || best;
    }
  }
  return best;
}

// ── Public API ──────────────────────────────────────────────────────────────

export function inspectTtf(buf: Buffer): TtfInfo {
  try {
    const tables = readTables(buf);
    if (!tables) return { family: null, hasLatinCaps: false };

    const cmap = tables.get("cmap");
    let hasLatinCaps = false;
    if (cmap) {
      hasLatinCaps = true;
      for (let cp = 0x41; cp <= 0x5a; cp++) { // 'A'..'Z'
        if (!cmapHasCodepoint(buf, cmap, cp)) { hasLatinCaps = false; break; }
      }
    }

    const name = tables.get("name");
    let family: string | null = null;
    if (name) {
      // 16 = typographic family ("Baloo 2"); 1 = font family (may carry a
      // style suffix like "Baloo 2 ExtraBold" on static per-weight cuts).
      family = readName(buf, name, 16) ?? readName(buf, name, 1);
    }

    return { family, hasLatinCaps };
  } catch {
    return { family: null, hasLatinCaps: false };
  }
}

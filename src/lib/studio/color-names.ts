// Goblin Studio — palette → plain-words helper.
// CRITICAL: image models (FLUX, Seedream) render any hex code or "#" they see in
// the prompt as LITERAL TEXT printed on the artwork (e.g. "#D41208" showing up on
// a coffee bag). We must never pass raw hex codes into an image prompt. This maps
// a hex value to a plain-English color word so prompts stay clean.

const NAMED: Array<[string, [number, number, number]]> = [
  ["black",     [17, 17, 17]],
  ["charcoal",  [45, 45, 50]],
  ["gray",      [128, 128, 128]],
  ["silver",    [200, 200, 205]],
  ["white",     [245, 245, 245]],
  ["red",       [220, 40, 40]],
  ["crimson",   [150, 20, 40]],
  ["maroon",    [110, 30, 35]],
  ["orange",    [255, 140, 40]],
  ["amber",     [255, 176, 0]],
  ["gold",      [212, 175, 55]],
  ["yellow",    [240, 220, 40]],
  ["olive",     [128, 128, 40]],
  ["green",     [40, 160, 70]],
  ["emerald",   [20, 160, 110]],
  ["lime",      [140, 200, 50]],
  ["teal",      [20, 150, 140]],
  ["cyan",      [40, 200, 220]],
  ["blue",      [40, 90, 210]],
  ["navy",      [20, 30, 90]],
  ["sky blue",  [120, 180, 235]],
  ["indigo",    [75, 0, 130]],
  ["purple",    [140, 50, 180]],
  ["violet",    [150, 90, 220]],
  ["magenta",   [210, 40, 160]],
  ["pink",      [240, 130, 170]],
  ["brown",     [120, 72, 40]],
  ["tan",       [200, 170, 120]],
  ["beige",     [225, 210, 180]],
  ["cream",     [245, 235, 210]],
];

// Returns a plain color word for a hex value (e.g. "#D41208" → "deep red"),
// or null if the input is not a parseable 6-digit hex.
export function hexToColorName(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  let best = NAMED[0][0];
  let bestD = Infinity;
  for (const [name, [nr, ng, nb]] of NAMED) {
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
    if (d < bestD) { bestD = d; best = name; }
  }

  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum < 0.22 && !["black", "charcoal", "navy", "maroon"].includes(best)) return `deep ${best}`;
  if (lum > 0.82 && !["white", "cream", "beige", "silver"].includes(best)) return `light ${best}`;
  return best;
}

// Turns a brand palette into a plain-words phrase, e.g. "deep red, charcoal, gold".
// Never emits hex codes. Falls back to a swatch's own name if its hex is unparseable.
export function paletteToWords(
  palette: Array<{ hex?: string; name?: string }> | undefined,
  max = 4
): string {
  if (!palette?.length) return "";
  const words = palette
    .slice(0, max)
    .map((c) => (c.hex ? hexToColorName(c.hex) : null) ?? c.name ?? null)
    .filter((w): w is string => Boolean(w));
  return Array.from(new Set(words)).join(", ");
}

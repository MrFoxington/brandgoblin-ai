# Build Brief — Make the Webpage Preview Template look *designed*, not generic

### The copy is great; the auto-template flattens the vibe. Upgrade `renderBrandSiteHTML()` so any brand's
### preview feels premium/editorial — not a Web-1.0 page with a loud solid button.
> Touches ONLY `src/lib/website/renderSite.ts` (the `renderBrandSiteHTML` + `pickTheme` renderer).
> No copy/prompt/schema changes. Preview (iframe srcDoc) and Download stay one source → both improve together.
> Additive; tsc + `npm run build` clean; commit; HOLD for review before push.

---

## WHY
On REPLICATE (a brand with a strong cold/minimal aesthetic) the live preview takes excellent copy and
renders it plainly — the biggest offender is a **solid bright-accent CTA button** that reads like a generic
web button, not a designed site. The template must raise the floor so EVERY brand's preview looks
intentional, on both dark and light palettes.

## DESIGN UPGRADES (all in `renderBrandSiteHTML`)
1. **Typography (the biggest lift):** headings in a lighter weight (~200–300) with generous letter-spacing
   and tight line-height; hero scales with `clamp()` large. Add a small uppercase, wide-tracked **kicker
   label** above the hero headline (e.g. the brand category or a short tag) in the accent color. Body text
   in a comfortable max-width measure, muted color, line-height ~1.7.
2. **CTA — stop the loud solid fill.** Primary CTA = **outlined/bordered** in the accent with accent-colored
   text and a faint accent tint + soft glow (premium on any palette). Secondary CTA = plain text link with
   an arrow. (This single change fixes most of the "cheap" feeling.)
3. **Depth & rhythm:** a faint radial glow behind the hero using the accent at low opacity; hairline
   dividers between sections (text color at ~8–10% alpha); generous vertical spacing; consistent section
   max-width. If the palette has a second dark/light neutral, use a *subtle* gradient between it and the bg
   instead of a flat fill.
3b. **Nav:** brand name as a refined wordmark (medium weight, slight tracking); secondary CTA as a ghost
   button on the right.
4. **Features:** clean grid (2-col desktop / 1-col mobile); each item = a small accent-tinted marker + bold
   title + muted one-line description (use `features[]` if present, else `featureBullets`).
5. **FAQ:** static accordion look — question in medium weight, answer muted, hairline separators.
6. **Footer:** minimal, hairline top border, muted text, small "Made with BrandGoblin".

## `pickTheme` refinements
- Return: `bg`, `text` (high-contrast), `muted` (text at ~65–72% alpha), `accent` (a vivid mid-luminance
  swatch), and optionally `bg2` (a near-bg neutral for subtle gradients/section tints).
- Use the accent for **borders, text, tints, and the hero glow — never as a giant solid block.**
- Keep WCAG-contrast guarantees for `text`/`muted` on `bg`; verify on a DARK palette (REPLICATE:
  #050508/#F0F0EF/#00C8FF) AND a LIGHT pastel palette (readable + premium on both).

## ACCEPTANCE
- The REPLICATE preview now feels cinematic/minimal: thin tracked type, outlined glowing CTA (not solid
  cyan block), kicker label, hero glow, hairline sections.
- A light-palette brand also looks premium and readable.
- Preview iframe == downloaded HTML (single renderer unchanged).
- `prefers-reduced-motion` respected; text still escaped; conditional sections still omit missing data.
- tsc + build clean; commit; HOLD for review before push. Update `CLAUDE_HANDOFF.md`.

*Created June 22, 2026. Same copy, same renderer, dramatically better-looking output.*

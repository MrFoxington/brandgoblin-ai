# Nix Zone — free Nix goodies (the brand-affinity + distribution surface)

### A free in-app "Nix" section: wallpapers, a sticker pack, and Nix images/clips — given away to build
### fandom and SPREAD the brand. This is distribution + affinity, NOT a paid store (that comes later,
### once there's demand). Every Nix sticker/wallpaper out in the world = a free impression.
> Build spec for Claude Code. Additive — no energy/Stripe/trial/generation changes. From Fox, June 21.

---

## NORTH STAR
**Nix is the moat.** No competitor can copy a beloved mascot. Free Nix goodies turn users into fans
and walking billboards — which serves our #1 constraint: **distribution/acquisition.** Frame it as
"Nix, the spreadable brand asset," not a store. The paid physical merch (hoodies, dolls, etc.) is a
LATER phase, only once a fanbase is asking for it.

---

## ⛔ HARD RULE — NEVER GENERATE NIX ART
All Nix art comes from Fox (he generates poses in ChatGPT from the master sheet and drops the files).
Claude Code builds the SURFACE around whatever assets exist — it must NOT generate, fabricate, or
AI-create any Nix imagery. Quality check before placing any Nix asset: green skin, purple hair,
pointed ears, purple "NIX" hoodie with gold trim. If an asset folder is empty, the section renders a
graceful "coming soon" empty state — never a placeholder Nix.

---

## ASSET WORKFLOW (how Fox adds goodies)
- Wallpapers → `/public/nix/wallpapers/` (desktop + phone variants)
- Stickers → `/public/nix/stickers/` (transparent-bg PNGs)
- Gallery clips/images → `/public/nix/gallery/`
- Build reads these from a simple **manifest** (`src/lib/nix-assets.ts` — arrays listing each asset's
  file path + name + type/size). Adding a new goodie = drop the file + one manifest line. (Or, if
  cleaner, read the folders at build time — but a manifest keeps names/metadata tidy.)

---

## FEATURE A — The Nix Zone page + nav entry
- New page (e.g. `/dashboard/nix` or `/nix`), linked from the **top header** next to Dashboard/Studio
  (a fun, glowing-but-not-orange entry — orange is reserved for the primary create CTA). A happy/
  waving Nix greets you.
- **Access: FREE to all logged-in users** (no Pro gate, no energy) — the whole point is reach.
  (Consider making it fully public later for max viral spread; v1 = logged-in is fine.)
- **Naming:** build with a single renamable label. Default "✨ Nix" — fun on-brand options for Fox to
  pick: **"Nix Zone," "Nix's Stash," "Hang with Nix," "Goblin Goodies," "Nixville."**

## FEATURE B — Wallpapers
- A gallery of Nix wallpapers with **Download** buttons; offer desktop + phone sizes where provided.
- Next.js `<Image>` for previews; the download serves the full-res file.

## FEATURE C — Sticker pack
- A grid of Nix stickers (transparent PNGs) with individual **Download** + a **"Download all"** (zip)
  if feasible.
- v1 is downloadable sticker images (people add them to WhatsApp/Telegram/Discord) + a short
  "how to add these to your messenger" note. NOTE: a true iMessage/Chrome sticker pack needs its own
  iOS app / browser extension + store approval — OUT OF SCOPE for v1; just downloadable PNGs now.

## FEATURE D — Nix gallery (images + clips)
- A fun wall of "Nix doing cool stuff" images/short clips for viewing + sharing. Each has a Share /
  Download. Great social content that spreads the brand.

## DISTRIBUTION HOOK (the whole point)
- Lightly brand each downloadable so it carries the brand when it spreads — a small
  **"Nix · brandgoblinai.com"** mark on wallpapers, and the share text includes BrandGoblin. Tasteful,
  not a watermark slapped across the art. Every download that gets used = free acquisition.
- Reuse the existing Share flow (`lib/studio/share.ts`) + the share celebration where it fits.

---

## ACCEPTANCE / GUARDRAILS
- NEVER generates Nix art — only displays/serves assets Fox placed in `/public/nix/*`; graceful empty
  states when a folder is empty.
- Free, no Pro/energy gate; nav entry added; one renamable section label.
- Downloads work; wallpapers offer the sizes provided; stickers downloadable (+ optional zip).
- Light brand mark / share text so goodies spread the brand. Reuse existing Share flow.
- Additive only; Next.js `<Image>`; `prefers-reduced-motion` respected; `tsc` + `npm run build` clean;
  commit as one phase; don't push until reviewed. Update `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md`.

## LATER (Phase 2 — only when a fanbase is asking)
Paid physical merch: the purple NIX hoodie, beanies, tees, Nix dolls/figurines/toys — via
print-on-demand first (no inventory) to test demand before any real manufacturing. Build it when
people are literally asking "where do I buy the Nix hoodie?" — not before.

*Created June 21, 2026. Digital-first, free, distribution-focused. Physical store deferred until
demand is proven. Nix art is provided by Fox — never AI-generated.*

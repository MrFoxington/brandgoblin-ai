# The Creator Studio Plan (Sept 6, 2026)
### Making the inside of BrandGoblin premium, creative, and a place people spend hours in every day

Companion to `BRAND_MATURITY_PLAN.md` (marketing) and the July 16 "Feel Plan" brief.
Old look preserved as git tag `design-v1-dark-purple` (commit `a427ac9`).

## Fox's decisions (Sept 6, one question at a time)

1. **Dark studio.** The app stays dark and becomes the same brand as the marketing pages.
   Showroom by day (warm paper outside), studio after hours (deep ink inside).
2. **Their own work first.** The home screen opens on what the user made: latest creation
   big and beautiful, gallery, one clear Create button. Pride first, then tools.
3. **Canvas first, tools in a rail.** The Studio puts the creation in the middle, always the
   biggest thing on screen. Brand, type, prompt, style, fonts, engine live in an easy-to-see
   tool panel. Save and Share sit on the canvas. A gallery section inside the Studio holds
   ALL creative assets. Short pop-up tips walk first-timers to their first image and product
   art. The whole thing should feel smooth, almost liquid. Brand colors stay alive inside.

## The design system inside (same tokens as marketing, dark surfaces)

| Role | Value | Notes |
|---|---|---|
| Base | ink `#141518`, ink-2 `#1B1D22` (cards), `#22252B` (raised) | Warm near-black. Retires the blue-black `#0a0a0f` and purple-tinted cards. |
| Text | paper `#FAF7F2`, paper/70 body, paper/45 faint | Warm white on ink, never pure white on pure black. |
| Action | goblin green `#2E7D5B` (hover `#3A9A70`) | THE button color. Orange retires everywhere. |
| Studio / energy | gold `#FBBF24` | Energy meter, Studio signature, "Nix Pick", badges. Small doses. |
| Live / success | emerald `#10B981` | Job done, generated, live states only. |
| Nix | purple `#7C3AED` | Only where Nix appears (aura, avatar, toasts, loading). |
| Lines | paper/8 hairlines, paper/14 hover | No glowing borders. Depth comes from surface steps, not glows. |
| Type | Fraunces (display), Hanken Grotesk (UI), JetBrains Mono (hex, labels) | Flip the body defaults in `globals.css`; every `font-display` heading changes at once. |
| Motion | 180-260ms ease-out, spring on reveals, reduced-motion respected | "Liquid": things slide and settle, they never pop or pulse. |

Kills: emoji as UI icons (keep ✓/✕ and the ⚡ energy glyph), multi-stop gradients, pulse
glows on buttons, four-color nav pills, "Powered by NIX ✨" sparkle inside the app.
Keeps: reveal feed, celebrations + sounds, Trophy Shelf, Print Pro, style chips, the prompt
box as a creative surface, the one allowed magic moment (LoadingScreen).

## Phases (each one ships on its own)

### Phase A: the skin (1 session, low risk)
Flip `body` font defaults to Fraunces/Hanken; move app tokens (bg, surface, border, primary
button) to the ink/paper/green system; retire orange; replace nav pills with one quiet
segmented nav (Vault · Studio · Nix · Labs) plus a single green Create button; emoji purge
on in-app chrome. No layout changes. Done when: every app page reads as one brand with the
marketing, `grep` finds no `#FF6B35` / `from-primary` / gradient buttons in the app.

### Phase B: the Vault (1-2 sessions)
Dashboard becomes work-first: hero = latest creation (Studio art or brand kit card) at full
width; masonry gallery of everything (brand kits + Studio art + thumbnails, filter chips by
brand/type); one green "Create" entry that opens a small chooser (Brand kit / Studio /
Thumbnail); energy, streak, Trophy Shelf move to a quiet right rail (desktop) or a compact
strip (phone). Quick Creates (the eight text types) fold into the Creator Pro page.
Done when: a new user with one brand sees their kit big, not a button grid.

### Phase C: the Studio canvas (2-3 sessions, the heart)
Three-column desktop: left tool rail (Brand · What to make · Prompt · Style · Fonts · Engine,
collapsible sections, current choices visible at a glance) · center canvas (the working
creation, big; generating state = Nix cooking ON the canvas; result lands in place with the
existing celebration) · right strip (recent creations for this brand, tap to swap onto the
canvas). Save / Share / Remove BG / Upscale / Variation as a floating toolbar under the
canvas. Phone: canvas on top, tool rail as a bottom sheet, gallery as a swipe row.
The Studio gallery = ALL assets (uploads, logos, art, thumbnails) with Favorites, Hidden,
and per-brand filters. Existing archive/favorite/official-logo logic reused as-is.
Done when: from opening the Studio to a finished product-art image is three taps with no
scrolling on desktop, and the result is never below the fold.

### Phase D: first-timer tips + the daily loop (1-2 sessions)
Tips: a six-step coach for the first visit (pick a brand → pick Product Art → name the
product → Conjure → Save → Share), one short sentence per tip, anchored to the control it
points at, dismissable, never shown again once the step is done (localStorage + the
existing badge stats). Daily loop: "Today in the Studio" card (one suggested creation per
brand per day, from the existing idea engine), streak visible on the Vault rail, badge
progress inline. Share: one-tap share card (the creation on a branded frame) to the
native share sheet, existing Share Celebration fires. Done when: a brand-new account reaches
its first shared image without reading anything longer than a sentence.

## Guardrails
- Never generate or alter Nix. Purple only where he is.
- Energy gates creation, never possession (the CapCut law). Save/Share are always free.
- Honest states only: no fake progress, no fake counts, no "Coming soon" tiles for things
  that don't exist (Labs stays admin-gated until video ships).
- Every phase must pass on a phone first (Fox tests on iPhone).
- Old look is one command away: `git checkout design-v1-dark-purple -- <paths>`.

## Order in the roadmap
Phase A can go now. B and C are the "make it amazing" work. P7 (one website, Airo dies)
should land before or alongside B so all traffic hits the new front door. Labs video comes
after C, and gets the Studio canvas for free (a video is just a creation on the canvas).

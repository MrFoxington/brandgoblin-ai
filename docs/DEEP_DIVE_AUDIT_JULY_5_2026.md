# Deep Dive Audit — July 5, 2026
Live in-browser walkthrough of brandgoblinai.com + app.brandgoblinai.com on Fox's logged-in
Pro account, plus the full Bring Your Own Logo live test. Zero energy spent (uploads are free).

---

## LANDING PAGE (brandgoblinai.com)

### Verified working
- Sign In links to app.brandgoblinai.com/login (both nav locations) — the July 2 bug is fixed.
- The 3 Goblin Studio images all load: Fossil Fuel coffee bag, Velour serum, Juicy Hazy surfboard.
- Legal footer links live: /privacy, /terms, /refund. Contact goes to support@brandgoblinai.com.
- FAQ is freemium-correct (no Agency tier), pricing section matches the app.
- Hero, Nix art, idea-spark grid, showcase, and all CTAs (all point to app signup) look right.
- Footer brand column already has a small "Powered by Nix" line and the full tagline.

### Bugs / open items
1. React hydration error (#418) fires in the console on page load. It's the Airo-built site,
   so options are limited, but it is real and reproducible on every load.
2. Footer social icons (Twitter, GitHub, LinkedIn) still link to "#" — dead since June.
3. "Already have a brand?" line for Bring Your Own Logo is STILL missing — the July 4 feature
   remains half-shipped on the marketing side.
4. Header has no "Powered by NIX" statement — fix written, see
   docs/AIRO_POWERED_BY_NIX_PASTEINS.md (Block A header, Block B footer).

---

## APP (app.brandgoblinai.com)

### Verified working
- /dashboard: console CLEAN. Greeting, streak (3 days), 8 brands, XP bar, Today's Idea,
  Quick Creates, Studio banner all render correctly.
- /dashboard/creator-pro: console CLEAN. Energy widget reads sane: "37% remaining, 368 / 1,000"
  with the capacity breakdown box. Recent Generations dates render without hydration errors.
- /dashboard/studio: loads clean, brand kit selector works, prompt auto-cook works.
- /pricing: console clean, "Bring your own logo" listed under Creator Pro. Free/Pro copy correct.

### Bugs / open items (all minor)
1. app.brandgoblinai.com/studio (bare path) is a 404 — worth a redirect to /dashboard/studio
   since it's a guessable URL.
2. App pricing page still says "Top up energy anytime for $19" while the refill modal defaults
   to the $49 Best Value pack — leftover copy mismatch.
3. App footer shows "Sign In / Sign Up" links even when logged in.

---

## BRING YOUR OWN LOGO — LIVE TEST (the July 4 open item) ✅ PASSED

Tested on the Juicy Hazy brand as Pro:
1. Rights gate: with the checkbox unticked the upload button reads "Confirm you own the rights
   first" and won't open the picker. Ticked, it becomes "Upload logo". ✅
2. Real upload (brandgoblin-logo.png, 2.4MB PNG, 1536x1024): succeeded — "✓ Logo uploaded and
   set as your official logo!", card appears tagged "⤴ Uploaded · Your file · no energy used"
   on the checkerboard backdrop, Remove BG + Upscale chips enabled, gold "✓ Official logo"
   state ON, hover shows "✕ Remove official logo". Stored file verified byte-identical. ✅
3. Oversize file (6.2MB PNG): clean inline error "Logo must be 5MB or smaller." ✅
4. Fake image (text renamed .png): clean inline error "That file doesn't look like a valid
   image." (sharp metadata check working). ✅

NOT tested: the free-account locked panel (only Fox's Pro account was available in-browser) and
a stamped product-art generation (stamping was already live-verified July 3; skipped to save
energy).

Cleanup done during the test: the test upload auto-replaced Juicy Hazy's official logo (by
design), so afterward the official logo was RESTORED to the transparent BG-removed Juicy Hazy
sun/wave mark. The uploaded BrandGoblin-logo card is still sitting in the Juicy Hazy gallery —
harmless, ignore or clear whenever.

Cosmetic note: the uploaded 2.4MB PNG tile showed as blank checkerboard for a good while before
the image decoded (signed Supabase URL + big PNG). It loads correctly; if users complain about
"blank uploads," this is why. A low-priority fix would be compressing uploads server-side or
adding a loading shimmer on upload cards.

---

## "BrandGoblin - Powered by NIX" — rollout status
- APP (code, this session): Navbar now shows a "BrandGoblin / POWERED BY NIX ✨" lockup next to
  the logo; footer brand line upgraded to "BrandGoblin - Powered by NIX ✨" (semibold gold);
  bottom copyright line now includes "Powered by NIX". tsc exit 0. Needs push + deploy.
- LANDING (Airo): two paste-in blocks ready in docs/AIRO_POWERED_BY_NIX_PASTEINS.md.

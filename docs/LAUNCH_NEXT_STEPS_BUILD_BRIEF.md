# Build Brief — "Now What? → Launch Your Brand" in-app guide (+ downloadable fact sheet)

### Closes the #1 activation gap: users get their kit and think "…now what?" This adds a dead-simple,
### in-app next-steps guide right where that confusion hits, plus a printable/downloadable version.
> Content source: `docs/LAUNCH_YOUR_BRAND_NEXT_STEPS.md` (use that copy verbatim, Nix's voice).
> Additive only — no energy/Stripe/auth/trial changes. NO affiliate links in v1. tsc + build clean.
> Commit as one phase; HOLD for review before push. Update `CLAUDE_HANDOFF.md`.

---

## WHY
Beta feedback: a user loved her brand kit but didn't know how to get a website, use the copy, or make
the logo. The kit is the "wow"; the "now what?" is the drop-off. This guide catches that moment in-app.

## CONTENT (from `docs/LAUNCH_YOUR_BRAND_NEXT_STEPS.md` — keep it tiny + plain-English)
4 steps, Nix's warm voice:
1. **Put up your website** — easiest path: an AI website builder (GoDaddy Airo / Wix / Squarespace /
   Hostinger), paste your BrandGoblin website copy. Even easier: **Preview as Webpage → Download HTML →
   drag onto Netlify Drop (free)**. Plus a one-line "what's a domain" explainer.
2. **Get your logo** — use your logo prompt in Goblin Studio (or any AI image tool).
3. **Set up socials** — paste the generated bios + launch posts.
4. **Follow your 7-day launch plan.**
Close with a friendly "stuck? ask Nix" + a soft Creator Pro mention. NO affiliate links (keep the free
Netlify path visible).

## BUILD
### 1. Component
`src/components/launch/LaunchNextSteps.tsx` — renders the 4-step guide. Clean, scannable, Nix avatar,
brand-purple accents. Accepts optional `brandId` so it can deep-link the user's own actions:
- Step 1 "Even easier" → link to `/brand/[brandId]/preview` (the Preview-as-Webpage feature).
- Step 2 → link to Goblin Studio.
If no `brandId`, render the same steps with generic links.

### 2. In-app placement (the high-impact part)
In `BrandKitView.tsx`, in the post-reveal `phase === "done"` block (near `ShareCard` / `ContinueBuilding`,
~line 430), add a prominent **"🚀 Now what? → Launch your brand"** card that expands inline or links to
the full guide route. This must be visible right after the kit reveal — that's where the drop-off happens.

### 3. Guide route + downloadable/printable fact sheet (one source of truth)
`src/app/launch-guide/page.tsx` (optionally also `/brand/[id]/launch` to personalize):
- Renders `<LaunchNextSteps />` full-page, branded.
- A **"⤓ Save as PDF / Print"** button → `window.print()`, with clean `@media print` styles (white bg,
  black text, no nav/buttons, fits one page) so the printed/saved PDF IS the fact sheet — always current,
  no separate file to maintain.

### 4. Entry points
- The post-reveal card in `BrandKitView` (above).
- A link in the dashboard / nav ("Launch Guide") so users can return to it anytime.

## ACCEPTANCE / GUARDRAILS
- Additive; no energy/auth/Stripe changes. Works with or without a `brandId`.
- Plain-English copy, Nix's voice, from the content doc. NO affiliate links in v1; keep the free
  (Netlify Drop + Download HTML) path visible.
- Print styles produce a clean one-page fact sheet.
- `prefers-reduced-motion` respected; Next.js `<Image>` for the Nix avatar; `tsc` + `npm run build` clean.
- Commit as one phase, HOLD for review before push. Update `CLAUDE_HANDOFF.md` and `PRODUCT_ROADMAP.md`
  (note: affiliate links = future, only on vetted tools, with disclosure).

*Created June 22, 2026. Turns the kit reveal into a clear runway: "here's exactly what to do next."*

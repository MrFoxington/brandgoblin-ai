# Goblin Studio — Phase 1.6 Brief (on-brand quality, the orange button, and the deeper loop)

### Phase 1.5 made Studio useful + delightful and it's LIVE. 1.6 fixes the off-brand quality tiers,
### makes the Conjure button magnetic, and extends the "one more" loop into the gallery + sharing.
> Build spec for Claude Code. Additive to Phase 1/1.5 — do NOT touch the atomic energy reservation,
> Stripe, trial, or grant logic. Existing Nix PNGs only. Next.js `<Image>`. `tsc` + `npm run build`
> clean; commit as one phase; don't push until reviewed. From Fox's live Phase-1.5 feedback (June 21).

---

## NORTH STAR (unchanged)
**Bring out people's creative energy** — make creating so easy, fast, and rewarding they can't stop.
Energy is fuel, never a price. Every item below either removes friction, deepens the loop, or makes
the magic feel more *theirs*.

---

## ⭐ FEATURE A — On-brand quality tiers (fix the #1 issue Fox flagged)

**Problem:** switching Standard / Artistic / Premium redesigns the whole image and drifts off-brand
(wrong palette, different feel). **Root cause:** the three "quality" tiers are three *different models*
(Standard=`flux_schnell`, Artistic=`seedream_v45`, Premium=`flux_pro_v1`). Each reinterprets the
prompt with its own aesthetic, and each run uses a fresh random seed — so "quality" actually
re-imagines the brand instead of refining it. Seedream is the biggest outlier (why "Artistic" feels
most off).

**Fix (three parts):**
1. **Pin the seed across quality-only changes.** When the user changes ONLY the quality tier (same
   brand, type, prompt), reuse the same seed so composition/subject stays and only fidelity changes.
   Generate + store a seed per "creative intent"; pass it to fal; new seed only on "Try a variation"
   / "Make another" / prompt edit.
2. **Keep Standard + Premium in the same model family.** `flux_schnell` (Standard) and `flux_pro_v1`
   (Premium) are both FLUX — consistent look, pro just higher fidelity. **Relabel the Seedream tier**
   from a "quality" step to an explicit **style choice** (e.g. a separate "Art style: Default /
   Painterly" toggle, or label it "Artistic (different art engine)") so a different look is a
   deliberate user choice, never a surprise. Premium must read as "same brand, better quality."
3. **Harden the palette-lock in Nix's cooked prompt.** In `cook-prompt`, instruct the model to stay
   strictly within the brand's exact hex palette and style, and add a **negative prompt** (passed to
   fal where supported) discouraging off-brand colors / photorealism drift. All tiers should honor the
   brand more tightly.

Acceptance: bumping Standard → Premium keeps the same subject, composition, and palette — just
sharper/higher quality. Choosing the art-style alternative is clearly labeled as a different look.

---

## ⭐ FEATURE B — The glowing orange Conjure button (data-backed conversion win)

The Conjure button is the repeat-action engine; it should be the most magnetic thing on the page.
Research (Baymard/CXL/Hotjar 2026): red-orange hybrid CTAs convert highest (~9.7% vs 6.1% cool tones),
orange/red get ~2.1x the CTR of blue/gray, and **animated high-contrast buttons lift conversion +52%**
(61% in e-commerce). Contrast beats hue — and the UI is cool purple/dark, so warm orange = max pop.

- Restyle the **Conjure button** to a **vibrant red-orange gradient** (~`#FF6B35` → `#FF8C42`) with a
  soft **glow + gentle pulse** (respect `prefers-reduced-motion`: static glow, no pulse).
- It must be **distinct from the purple "+ Generate"** button and be the **only orange element on the
  Studio page** so it stays isolated and magnetic.
- Keep the energy cost on it as fuel ("⚡ Conjure for 4 energy").
- Apply the same magnetic treatment to the post-reveal **"Make another"/"Try a variation"** CTAs so the
  loop's repeat actions all pull the eye.

---

## FEATURE C — "More like this" on gallery creations (the come-back loop)

Extend the "one more" dopamine to the user's whole history, so returning to the gallery re-sparks
creating.
- Add a **"✨ More like this"** button to each card in "Your Creations."
- Clicking re-rolls a NEW generation using **that job's stored prompt + model + image type** (new
  seed), via the normal `POST /api/studio/jobs` (energy reserved as usual). The job's `prompt` is
  already stored, so this is straightforward.
- Surface the result through the same reveal celebration. This turns the gallery from a file list into
  a "I want one more like that" engine — especially powerful on a return visit the next day.

---

## FEATURE D — Wire up Remove BG + Upscale for real (they're stubbed, not vaporware)

The card actions "Remove BG · ⚡6" and "Upscale · ⚡34" show "coming soon" but the endpoints are REAL
and already in the model registry (`bg_removal` = fal `imageutils/rembg`; `clarity_upscaler` = fal
`clarity-upscaler`). Wire them to the backend:
- New action route(s) under `/api/studio/...` (or extend the jobs route with an `operation` field) that
  take an existing creation's stored asset, run the fal op, **reserve energy first** (same atomic
  reservation path — these cost energy per the registry), store the result, and refund on failure.
- Replace the "coming soon" tooltips with working buttons showing the real energy cost.
- Upscale is per-MP of input — confirm the cost math on the actual stored size before charging.
- Same guardrails as generation: Pro-gated, atomic reservation, moderation/refund on failure.

---

## FEATURE E — Share button (the free-acquisition viral loop)

Pride spreads the brand. Add a **Share** button next to **Download** on each creation.
- Reuse the existing share-card system. One tap to share/copy a link or a share-card image of the
  creation (optionally lightly branded "Made with BrandGoblin" to drive acquisition).
- Make it feel like flexing, not marketing — proud creators sharing = free top-of-funnel.
- Keep it simple for 1.6: share/copy + download. (Deep per-platform publishing stays out of scope.)

---

## FEATURE F — Brand-scoped gallery (quick fix)

Right now "Your Creations" shows ALL of a user's creations regardless of which brand is selected, so
different brands (e.g. Shroomadu + Spinaway) get mixed in one feed. Each brand should have its own
dedicated gallery so brands don't bleed together.
- Filter "Your Creations" to the **currently-selected brand** (`studio_jobs.brand_id ===
  selectedBrandId`). When the brand dropdown changes, the gallery updates to that brand's creations only.
- Handle creations with no brand (`brand_id` null) sensibly — e.g. show them only under a "No brand /
  Freeform" selection, never under a real brand's gallery.
- `studio_jobs` already stores `brand_id`, so this is a filter on fetch/render (no schema change).
  Update `listUserJobs` (or the client filter) to scope by brand.

---

## BUILD ORDER (Phase 1.6)
1. **Orange Conjure button** (Feature B) — fast, high-impact, no backend.
2. **Brand-scoped gallery** (Feature F) — quick fix, stops brands mixing.
3. **On-brand quality tiers** (Feature A) — seed pinning + FLUX-family alignment + palette-lock + art-
   style relabel. The most important correctness fix.
4. **"More like this"** (Feature C) — gallery re-roll loop.
5. **Wire up Remove BG + Upscale** (Feature D) — real energy-metered ops.
6. **Share button** (Feature E) — viral loop.

## ACCEPTANCE / GUARDRAILS
- Quality tiers stay on-brand (same seed/family/palette); the different-art-style option is explicitly
  labeled. Conjure button is vibrant orange, isolated, animated (reduced-motion respected).
- "More like this", Remove BG, Upscale all go through the **existing atomic energy reservation** and
  refund-on-failure path. No changes to reservation/Stripe/trial/grant logic.
- Share reuses the existing share-card system; no fabricated metrics.
- Nix from existing PNGs only; `prefers-reduced-motion` respected; `tsc` + `npm run build` clean;
  commit as one phase; don't push until reviewed. Update `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md`.

## LATER (Phase 1.7+, not now)
- Multi-variation "gacha" spread (generate 2–4 at once, pick a favorite).
- Deeper gamification: creation milestones/achievements, richer streak surface, levels tied to output.
- Short-form video (the original Phase 2 — Wan 2.6 / Kling 3.0).

*Created June 21, 2026 from Fox's live Phase-1.5 feedback. Supersedes the §8 Phase-1.6 stub in
GOBLIN_STUDIO_PHASE_1_5_BRIEF.md. Button-color guidance verified against 2026 CTA conversion research.*

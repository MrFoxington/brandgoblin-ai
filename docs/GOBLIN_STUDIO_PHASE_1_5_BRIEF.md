# Goblin Studio — Phase 1.5 Brief (make it useful + magical)

### Phase 1 ships images, but they're generic. Phase 1.5 makes Nix generate the user's ACTUAL brand,
### perform while he cooks, and makes the Studio button impossible to miss.
> Build spec for Claude Code. Additive to Phase 1 — do NOT touch the atomic energy reservation,
> Stripe, trial, or grant logic. Use existing Nix PNGs only (never generate Nix art). Next.js
> `<Image>`. `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed.

---

## NORTH STAR — read this first
**Bring out people's creative energy.** BrandGoblin exists to make people *want* to create — to get
excited, addicted to making new things, to dream more and build bigger. "Creative Energy" isn't a
paywall, it's literally the thing we're unlocking in them. Every decision below serves one goal:
**make creating so easy, fast, and rewarding that they can't stop.** Energy is *fuel*, never a price
tag — frame it that way everywhere.

---

## 0. WHY (the problem with Phase 1)

Studio works end-to-end, but (a) the generator throws a lazy template at fal
(`"a branded social graphic for {name}, colors X"`) → generic stock images with the name attached,
NOT the brand Nix designed ("completely useless"); and (b) it has none of the loop mechanics that
make creating addictive. Phase 1.5 fixes utility AND builds the dopamine loop.

Phase 1.5 features, in priority order:
1. **Nix cooks the prompt** from the real brand kit (makes Studio *useful*). ⭐ make-or-break
2. **The "make another" loop + default to cheap/abundant** (makes it *addictive*). ⭐ the engine
3. **Nix performs + the reveal payoff (XP/streak)** (makes it *rewarding*).
4. **Idea sparks for the blank-mind user** (makes them *dream more*).
5. **Glow up the Studio button** (makes it *discoverable*).

Heavier follow-ups (multi-variation gacha spread, share-to-grow virality, deeper gamification) are
scoped to **Phase 1.6** at the bottom — don't build them now.

---

## 1. ⭐ FEATURE A — Nix cooks the prompt (the make-or-break)

**Principle:** never send a raw template or the user's raw text straight to fal. Nix (a cheap Claude
call) turns the brand kit + the user's intent into a proper, on-brand image-generation prompt first.
That synthesis IS the magic.

### New endpoint: `POST /api/studio/cook-prompt`
- Pro-gated (paid Pro only, same `plan === "pro"` check as the job route).
- Input: `{ brandId, imageType ('logo_concept'|'social_graphic'|'product_art'), userNote? }`.
- Loads the brand kit (`brand_generations.output_data`) and pulls the rich fields: recommended name,
  tagline, brand story, brand voice/vibe, color palette (hex), and the existing **logo direction**
  (`logoPrompt`).
- Calls **Claude Haiku** with a system prompt that says: *you are an expert image-prompt writer;
  given this brand's identity and the requested asset type, write ONE vivid, concrete image-
  generation prompt (subject, composition, style, palette, mood) optimized for a text-to-image model
  (FLUX/Seedream). Visual description only — no marketing copy. Stay true to the brand's palette and
  vibe.* Include the user's `userNote` if provided (e.g. "make it minimal," or a pasted brand prompt).
- Returns `{ prompt }` (and optionally a short `negativePrompt`).
- **Cost: FREE** — it's a text operation, and text stays unlimited. Do NOT charge energy for cooking;
  energy is only spent on the actual image generation. Add a light per-user rate limit (e.g. reuse the
  existing rate-limit pattern, ~20/min) to prevent abuse.

### UI changes in `StudioImageGenerator`
- Add an **editable "Prompt" textarea** between the content-type/quality selectors and the Conjure
  button. It is the source of truth for what gets generated.
- **Auto-cook on selection:** when a brand + image type are chosen (debounced ~400ms), call
  `cook-prompt` and pre-fill the textarea with Nix's cooked prompt. Show a tiny "✨ Nix is cooking
  your prompt…" state while it loads.
- The user can **edit it freely or paste their own** brand prompt (this satisfies Fox's copy/paste
  ask — they can drop the logo/brand prompt from their dashboard right in).
- Add a small **"✨ Re-cook" button** so Nix can rewrite the prompt (free).
- On **Conjure**, send the textarea's final prompt to `POST /api/studio/jobs`.

### Job route change (`POST /api/studio/jobs`)
- Accept the final `prompt` from the client and use it **directly** for fal — remove/skip the old
  template-building block (keep it only as a fallback if `prompt` is empty).
- Server-side guard: cap prompt length (e.g. 2,000 chars), trim, basic sanitize. The image still runs
  through fal's `enable_safety_checker` + our moderation, so unsafe output is still blocked + refunded.
- Energy, reservation, concurrency — all unchanged.

> Net effect: pick "Shroomadu → Product Art," Nix instantly writes a prompt grounded in Shroomadu's
> palette, story, and vibe, the user tweaks if they want, hits Conjure, and gets THEIR brand — not
> stock art with a name on it.

**Non-blocking:** auto-cooking must NOT gate the Conjure button. The textarea is editable and
generation works the instant a prompt exists — never make the user wait on cooking before they can
act. (If cooking is still loading, they can still type and generate.)

---

## 2. ⭐ FEATURE B — the "make another" loop + cheap-by-default (the addiction engine)

This is the engine of "addicted to creating." The reward isn't the image — it's the pull toward the
*next* one. Two parts:

### B1. Default to the cheap, abundant option
- **Default the quality selector to Standard (≈4 energy), NOT Premium (≈45).** Frequency builds the
  habit; defaulting to the expensive option makes the first action feel costly and drains energy 11x
  faster, so people create *less*. Cheap-and-abundant first; Premium is the deliberate upsell for a
  hero shot. Keep the 3-tier anchoring (Standard / Artistic / Premium) — just don't pre-select the
  pricey one.

### B2. The post-reveal "make another" moment (highest-leverage surface in the app)
- The instant an image reveals, surface a **prominent, celebratory set of next actions** — not a tiny
  icon row. Big, inviting: **"✨ Make another," "🎨 Try a variation" (same prompt, new seed),
  "🪄 New style" (re-cook with a twist).** This is where the loop lives — make it the most obvious
  thing on screen at the peak of excitement.
- Each costs energy (that's the loop = engagement = revenue, perfectly aligned). Show the energy cost
  on each as fuel ("⚡4").
- "Try a variation" = same cooked prompt, regenerate (new result every time — variable reward,
  inherently addictive). "New style" = re-cook the prompt with a stylistic twist, then generate.
- Keep Download/Save available too, but the *creative* next-step CTAs lead.

---

## 3. FEATURE C — Nix performs + the reveal payoff (the reward)

Make the generation wait a delight, not a spinner. While a job is generating (pending/running):
- Show **animated Nix** cycling the existing poses (thinking → working → conjuring → celebrating on
  done). Existing PNGs only.
- **Rotating playful status lines** (cycle every ~2.5s), e.g.:
  `"Let me cook that up for you…"` → `"Stirring in your color palette…"` →
  `"Ooh, this is smelling good…"` → `"Adding a pinch of magic…"` → `"Almost there…"` →
  `"Boom — done! ✨"` (final line on completion).
- A little **wave** on hover and on completion (subtle transform on the existing PNG).
- Reuse the existing reveal/sparkle animation for the finished image. Respect
  `prefers-reduced-motion` (show final state instantly, no looping animation).
- Keep it lightweight — text array + existing PNGs + Framer Motion already in the project. No new art.

(Optional later: tailor the lines to the brand's voice mode. Not required for 1.5.)

### The reveal payoff (the reward climax — don't under-build this)
Completion is the dopamine peak; make it *land*, not just drop a file:
- **Celebrating Nix + sparkle burst + the level-up sound** (reuse the existing sound system /
  `RefillCelebration` pattern; respect global mute), the image animating in.
- **Tie into the existing XP / streak system:** each creation earns XP and feeds the daily streak.
  Surface it on the reveal ("+10 XP ✨ · 3-day streak"). This is the "build bigger" hit.
- **"Your Creations" gallery = a trophy case, not a file list.** Make it feel like something they're
  building and collecting (count, recency, pride), so the wall itself pulls them back.

---

## 4. FEATURE D — idea sparks for the blank-mind user ("dream more")

People won't always arrive with intent — and "dream more" is half the North Star. Bring the landing
page's idea-spark mechanic *into* Studio:
- A small row of clickable sparks above/near the prompt box, e.g. **"Not sure? Try: a moody hero
  shot · a playful mascot scene · a minimalist logo card · a bold product flatlay."**
- Clicking a spark sets the image type + drops a cooked prompt in (via `cook-prompt` with that note)
  and they're one click from creating. Turns a hesitant browser into a creator.
- Keep the sparks short, visual, and inviting — this is the on-ramp for the uninspired.

---

## 5. FEATURE E — Glow up the Studio button (discoverability)

The Studio nav button is currently invisible against the purple UI. Make the eye go to it.
- **Amber/gold glow** on the Studio button (warm-on-cool = highest-contrast attention; also ties to
  Nix's gold hoodie trim, so it's on-brand). A soft outer glow via box-shadow in an amber tone.
- **Subtle pulse** animation (gentle, ~2s loop) — novelty + motion is what actually draws eyes.
  Respect `prefers-reduced-motion` (no pulse, keep the static glow).
- A small **"NEW" badge** on the button.
- Apply the same warm treatment to a **Studio entry card/button on `/dashboard` and
  `/dashboard/creator-pro`** so it's discoverable from the main surfaces too.
- Guardrail: it should stand out, but for launch it's fine for Studio to be the standout. Keep
  "+ Generate" as-is; just make Studio clearly the new, glowing thing. (We can dial the glow down
  later once adoption is established.)
- (Orange is the louder, higher-urgency alternative to amber if Fox wants max pop — amber-gold is the
  on-brand default.)

---

## 6. BUILD ORDER (Phase 1.5)
1. **Prompt-cooking** (Feature A) — `cook-prompt` endpoint + editable, auto-pre-filled, non-blocking
   prompt textarea + job-route change to use the client prompt. (The make-or-break — do first.)
2. **The loop** (Feature B) — default to Standard quality + the post-reveal "make another / variation
   / new style" CTAs. (The addiction engine — do second.)
3. **Nix performs + reveal payoff** (Feature C) — animated poses + rotating lines + wave + the
   celebrating-Nix/sparkle/sound reveal + XP/streak surfaced + gallery-as-trophy-case.
4. **Idea sparks** (Feature D) — clickable sparks that set type + drop a cooked prompt in.
5. **Button glow** (Feature E) — amber glow + pulse + NEW badge + dashboard/Creator-Pro Studio cards.

## 7. ACCEPTANCE / GUARDRAILS
- Generated images visibly reflect the brand kit (palette, vibe, logo direction) — not generic stock.
- Quality defaults to **Standard** (cheap/abundant); Premium is opt-in. Auto-cook never blocks Conjure.
- Post-reveal "make another / variation / new style" CTAs are prominent; each shows its energy cost.
- Prompt-cooking is free (text), Pro-gated, rate-limited; image generation still costs energy via the
  Phase-1 reservation path (unchanged). Energy framed as fuel, never a price.
- Client-supplied prompt is length-capped + sanitized server-side; fal safety checker + moderation
  still run; blocked images still refund.
- Nix animated from existing PNGs only; `prefers-reduced-motion` respected everywhere.
- Additive — no changes to energy reservation, Stripe, trial, or grant logic.
- `npx tsc --noEmit` + `npm run build` clean. Commit as one phase. Don't push until reviewed.
- Update `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md` after.

## 8. PHASE 1.6 (next, NOT now — keep 1.5 shippable)
- **Multi-variation "gacha" spread:** generate 2–4 variations at once and let the user pick a
  favorite — a powerful engagement + energy-spend driver (loot-box psychology, done honestly).
- **Share-to-grow virality:** one-tap share/download of a creation (reuse the share-card system) so
  proud creators spread the brand → free acquisition.
- **Deeper gamification:** creation milestones/achievements, a richer streak surface, a "creations
  this week" stat, maybe levels tied to Studio output.
These amplify the loop but aren't required for 1.5 to deliver. Ship 1.5 first, measure, then build 1.6.

## 9. THE NORTH STAR (the moment we're building)
A Pro user opens Studio, picks their brand and "Product Art," watches Nix instantly write a prompt
that's unmistakably *their* brand, hits Conjure (cheap, by default), and Nix performs — "stirring in
your palette… almost there… boom!" — then a celebrating reveal: their image, +10 XP, a 3-day streak,
and three glowing buttons begging them to **make another.** They do. And again. That's bringing out
their creative energy.

*Created June 21, 2026; expanded with conversion/gaming audit same day. Phase 1.5 — follows
GOBLIN_STUDIO_BRIEF.md (Phase 1 shipped + live). Phase 1.6 scoped at §8.*

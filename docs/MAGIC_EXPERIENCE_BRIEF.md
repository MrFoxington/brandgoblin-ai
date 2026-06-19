# BrandGoblin AI — The "Magical Creator" Experience Brief
> Build spec for the generation, reveal, and retention experience.
> Hand this to Claude Code. Build in the **phase order** at the bottom — not all at once.

---

## 0. ROLE & MISSION

You are a world-class UX designer, product designer, animation designer, and conversion
optimization expert. Transform BrandGoblin AI from a text generator into a **magical creator
experience**.

Two feelings, in this exact order:
1. **"Holy crap."** (the reveal)
2. **"I want to come back tomorrow."** (the daily loop)

The vibe is **Pixar + Duolingo + Canva + ChatGPT + Pokémon progression** — but never at the
expense of the output looking professional. The journey is playful; the **deliverable is
premium**. A founder is using this to look credible to *their* customers.

### Hard rules (do not break)
- **DO NOT redesign Nix.** Existing PNG assets are sacred. **Animate existing PNGs only** —
  never generate or fabricate new Nix art.
- Use **Framer Motion** for all animation.
- Use the **Next.js `<Image>`** component — never `<img>`.
- Build **reusable primitives**, not bespoke animation per section (see §10).
- Everything must respect **`prefers-reduced-motion`** and run smoothly on a mid-tier phone.

---

## 1. THE TWO-MODE PRINCIPLE (read first — this shapes everything)

Every experience below has a **first-run** version and a **returning** version. The cinematic
treatment is for the *first* time a user sees it. Power users generating their 5th brand need
**speed**, or the magic becomes a hostage situation.

- **First-run:** full cinematic stagger, all messages, the works.
- **Returning:** fast stagger, condensed copy, instant skip.
- A **"Skip ✨ / Reveal all"** control is **always visible** during any animated sequence.
- Persist a `hasSeenReveal` flag per user so the app knows which mode to use.

> Golden rule: **delight must be skippable.** Magic you can't escape becomes friction.

---

## 2. THE GENERATION EXPERIENCE

Animate Nix through poses **driven by real progress, not a fake timer**:
`thinking → working → conjuring(magic wand) → celebrating`.

**Honesty rule:** tie the animation and messages to **actual streaming progress**. Do NOT
fake-delay to play out all the messages if the model returns fast. As real sections come back,
have them *pop in* as Nix "finishes" each one — appearing content is more magical than a
spinner, and it's honest.

Rotating messages (advance on real progress milestones, not a fixed clock):
- "Hmm… this idea has potential."
- "Conjuring brand magic…"
- "Thinking like your future customers."
- "Ooooh, I found one I really like."
- "This one might be special."

Ambient delight: sparkles, slow floating particles, soft micro-animations, smooth transitions.
Keep particle counts modest and pause them when off-screen (perf).

**Error state stays in character.** If generation fails: working/thinking Nix + "The goblin
dropped the scroll — let's try that again." Never a raw error. The magic must survive failure.

---

## 3. THE "HOLY CRAP" REVEAL

Headline moment: **"WELCOME TO YOUR NEW BRAND"** with a staggered card reveal. Each section
feels like unwrapping a present.

**Pacing (critical):**
- Stagger **50–80ms** between cards (first-run) — fast enough to feel alive, not a slideshow.
- **Returning users:** ~30ms or near-instant.
- **Skip / Reveal-all** button always on screen.
- Optional: a soft **sparkle chime** as each card lands (see §8 Sound).

Sections to reveal (each its own card, beautiful, copy-on-tap):
Brand Name · ⭐ Goblin's Favorite Pick · Tagline · Brand Story · Color Palette · Fonts ·
Mascot Concept · Website Headline · Website Hero Text · Instagram Bio · Launch Post ·
Domain Suggestions · Mission Statement · Brand Values · Target Audience · Mood · Voice ·
**Logo Direction** (see note).

> **"Logo Prompt" → rename to "Logo Direction."** Don't show users a raw AI prompt — it breaks
> the illusion ("why am I being handed homework?"). Present it as art direction (style,
> symbolism, palette) with a "Generate this logo in Goblin Studio →" hook for later.

### Closure before the open loop (important)
After the reveal completes, give a clear **finish-line moment**: a celebrating-Nix beat +
"✅ Your brand kit is complete." This is the pride/dopamine hit. *Then* invite expansion
(§6). Pokémon works because you catch one and feel complete — then want more. Don't skip the
"complete."

### The conversion moment lives HERE
The reveal is the single best free→Pro moment — peak delight. Let free users feel the **entire**
"holy crap," then, at the moment they hit a limit or tap a locked builder, land the ask while
they're glowing: *"Nix can build all 10 of these for you →"*. Never bounce them to a cold
pricing page mid-magic.

### The share moment (new — growth)
At peak delight, offer a **screenshot-ready "Share your brand reveal" card** (brand name,
palette, tagline, Nix). One tap to download/share. People who just felt "holy crap" want to
show someone — this is free distribution *and* another delight peak. Make it genuinely
beautiful.

---

## 4. GOBLIN'S FAVORITE PICK

Podium for the name options: 🥇 First ⭐ · 🥈 Second · 🥉 Third.

**Calibrate Nix's voice — this is what makes him believable.** Do NOT praise everything equally;
universal praise is a participation trophy and stops landing. Nix has **one clear favorite with
a specific, concrete reason**, and is allowed to be merely lukewarm on the rest.
- Good: "I'd launch with this one — the short vowels make it stick in your head."
- Avoid vague superlatives and **overclaiming** ("Humans would remember this" = a promise he
  can't keep). Specificity beats hype.

Per-pick actions: **Copy · Favorite · Save · Regenerate.** Each with a satisfying micro-response
(favorite = a little pop + optional sound).

---

## 5. BRAND DNA (scores must be REAL)

Animated score bars: Creativity · Memorability · Professionalism · Luxury · Playfulness ·
Virality · Expandability · Audience Match · Visual Strength · Story Potential.

**Trust rule (non-negotiable):** these must be **deterministic and defensible**, not random.
Have the generation model **output each score with a one-line justification**, derived from the
actual brand. If a user regenerates the same brand and the bars jump randomly, the whole
experience reads as theater and trust collapses. Each bar gets a short "why this score"
explanation on tap.

Animate bars filling on reveal (respect reduced-motion: show final state instantly).

---

## 6. CONTINUE BUILDING (the open loop — after closure)

Beautiful builder cards: 🚀 Social Media · 🌐 Website · 📧 Emails · 📰 Blog Posts · 🎥 Videos ·
📦 Packaging · 🛒 Products · 🎙 Podcast · 🎁 Merchandise · 📈 Ads.

- Appears **after** the "complete" moment, framed as *expansion*, not unfinished work.
- Locked builders for free users show the **upgrade hook** in-context.
- Each card previews what Nix could make ("5 Instagram posts in your brand voice →").
- Never overwhelm: surface a **"Nix recommends starting with…"** to avoid decision paralysis.

---

## 7. DAILY CREATOR DASHBOARD + THE RETENTION LOOP

The reveal earns "holy crap." **This** section earns "come back tomorrow." Be explicit about the
hook loop — wire it to the **existing Creative Energy system**.

- **"Good Morning, Joseph 👋"** + today's **Creative Energy** (already built — surface it here).
- **A reason to return that is NEW each day:** "Nix has an idea for you today →" — a fresh,
  specific daily prompt/challenge tied to their brand ("Today, let's write a launch-week email").
- **Streaks:** consecutive-day creating, with gentle, non-guilt-trippy nudges.
- **Energy refresh** is the daily resource heartbeat — make its reset visible and satisfying.
- Quick-launch tiles: Instagram posts · Blog article · Email newsletter · Video ideas ·
  Promotions · Hashtags · Product ideas.
- Nix greeting line: "Let's build something today." (vary it.)

> If the dashboard doesn't give a concrete, novel reason to open the app at 9am, it's
> decoration. The streak + daily Nix idea + energy reset *are* the product's habit engine.

---

## 8. SOUND DESIGN (new — ~half of "wow")

Pixar/Duolingo delight is heavily audio. Add subtle, **muteable** sound (use Tone.js, already
available). Default on for first-run, remembered preference after.
- Soft sparkle/chime as reveal cards land.
- Satisfying "pop" on favorite/copy.
- A small Nix celebration cue at the "complete" moment + level-ups.
- Keep it tasteful and quiet; never loud or repetitive. One global mute toggle.

---

## 9. LEVEL SYSTEM & MICRO-DELIGHTS

**Creator Wizard levels:** XP bar, achievements, level-up celebrations (confetti + Nix
celebrating + sound). Keep gamification **adjacent to** the work, never blocking the premium
feel of the output. Let users dismiss/minimize celebratory UI.

**Micro-delight Nix quotes** (rotate, keep calibrated — not on *every* action):
"Magic complete!" · "I've got a good feeling about this." · "I'd buy from this brand." ·
"This makes me smile." · "I can see customers loving this."

---

## 10. ENGINEERING & ACCESSIBILITY GUARDRAILS

- **Reusable primitives** (build these first, use everywhere):
  - `<Reveal>` — staggered entrance wrapper (respects reduced-motion + skip).
  - `<Sparkles>` / `<Particles>` — perf-aware ambient effects (pause off-screen).
  - `<Nix pose="thinking|working|conjuring|celebrating|sleeping" />` — animated PNG wrapper.
  - `<ScoreBar>` — animated, reduced-motion-safe.
  - `<SoundFx>` — muteable cue player.
- **`prefers-reduced-motion`:** every animation has a no-motion fallback (show final state).
- **Performance budget:** smooth on a mid-tier phone. Cap particle counts; lazy-mount heavy
  effects; never block content paint on animation.
- **Two-mode flag:** `hasSeenReveal` (and per-section seen flags if useful) drive first-run vs
  returning pacing.

---

## 11. MEASURE THE MAGIC (so we know it's working)

Instrument the funnel — vibes need verification:
- Time-to-first-"wow" (request → first card revealed).
- **Reveal skip rate** (high = animation too slow → shorten).
- Free→Pro conversion **at the reveal moment** specifically.
- Share-card usage rate.
- **D1 / D7 return rate** and streak length (the real "come back tomorrow" metric).

---

## 12. BUILD ORDER (do NOT build all at once)

One mega-prompt produces six half-built systems. Sequence it:

1. **Reusable primitives** (§10) — `<Reveal>`, `<Sparkles>`, `<Nix>`, `<ScoreBar>`, `<SoundFx>`.
2. **The Reveal** (§3) incl. two-mode pacing, skip, closure moment, Logo Direction rename.
3. **Generation experience** (§2) — progress-driven Nix + honest streaming.
4. **Goblin's Favorite + Brand DNA** (§4, §5) — calibrated voice, real scores.
5. **Conversion moment + Share card** (§3) — the money + growth peaks.
6. **Continue Building** (§6).
7. **Daily dashboard + retention loop** (§7) — wire to existing energy system.
8. **Sound, levels, micro-delights** (§8, §9) — the final polish layer.
9. **Instrumentation** (§11).

Ship and feel each phase before the next. Nail the reveal first — it's the highest-impact moment
in the entire product.

---

## PRIORITIZE
Emotion · Delight · Wonder · Smoothness · Beauty · Fun — **without ever making the user wait,
cheapening the deliverable, or breaking trust.** Make users fall in love with BrandGoblin.

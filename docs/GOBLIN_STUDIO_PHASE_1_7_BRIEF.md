# Goblin Studio — Phase 1.7 Brief: "Juice & Sound" (the honest dopamine pass)

### Make creating *feel* incredible — anticipation, satisfying sound, escalating celebration — so the
### loop is irresistible. Take the JUICE from great games. Skip the deceptive casino tricks.
> Build spec for Claude Code. Additive to Phase 1/1.5/1.6. Do NOT touch energy reservation, Stripe,
> trial, or grant logic. Nix from existing PNGs only. `prefers-reduced-motion` + mute respected.
> `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed. From Fox, June 21.

---

## NORTH STAR + THE HONEST LINE (read first)
**Bring out people's creative energy — joyfully.** We want the excitement and "one more" pull of the
best games, NOT a casino. The research is explicit about which slot techniques are manipulative —
**we deliberately do NOT build these:**
- ❌ **No "losses disguised as wins"** — never dress up a non-result as a win.
- ❌ **No "near-miss" deception** — never fake an almost-win to bait another spend.
- ❌ **No manufactured loss-chasing** — energy is REAL money (refills); we will not engineer
  compulsive spending. That breeds refund regret, chargebacks, and broken trust.

**Why we don't need them:** in BrandGoblin **every conjure is a genuine win** — the user always gets a
real image they keep. There's no loss to disguise. So we celebrate REAL wins to the max. That's the
honest version, it's on-brand, and it ages well. The juice below is all legit game-feel craft.

---

## FEATURE A — A real on-brand sound pack (replace the synth beeps)

Today `src/components/primitives/SoundFx.tsx` synthesizes thin Web Audio tones — functional but
unexciting, and it defaults to muted. Upgrade to a real, layered, magical SFX set.

- Keep the existing `useSoundFx()` API + mute toggle + `prefers-reduced-motion` respect; swap the
  *sound source* from raw oscillators to **real audio files** (or richer Tone.js synthesis if a file
  isn't a good fit). Preload on first user gesture; resume `AudioContext` on gesture (already handled).
- **On-brand = magical/goblin, not casino:** shimmers, sparkles, a warm "conjure" whoosh, a satisfying
  chime — Nix's world, not coins-and-bells.
- Cues to design (map to existing trigger points):
  - **Button press** — a soft, satisfying tactile click/tick (Conjure, Make another, sparks).
  - **Conjure / spin start** — a "whoosh + rising shimmer" that kicks off anticipation.
  - **Anticipation loop** — a subtle rising/pulsing bed *while Nix cooks/generates* (the highest-
    dopamine moment — the wait should build, not feel dead). Loops cleanly, fades on completion.
  - **Reveal** — an escalating **sparkle-burst + warm chord** that lands bigger than today's chime.
  - **Streak / combo** — when the user keeps creating, a chime that **rises in pitch with the streak**
    (real momentum on a real streak — not a fake one).
  - **Refill celebration** — keep/upgrade the existing level-up fanfare.
- Volume sane and pleasant (not startling); everything gated by the mute toggle.

## FEATURE B — Default sound to a friendly ON (with an obvious, easy mute)

Right now it persists muted, so the magic is silent by default and most users never discover it.
- **Default to ON** for new users (no saved preference), at a gentle volume, with the mute toggle
  clearly visible (and a tiny one-time "🔊 sound on — tap to mute" hint is fine). Respect a saved
  preference if one exists. Honor `prefers-reduced-motion` users with a calmer/no-loop variant.
- Rationale: the juice only works if people actually hear it. Keep it easy and respectful to silence.

## FEATURE C — Anticipation build during generation (the dopamine peak)

Pair the anticipation sound bed with escalating *visual* juice while a job runs:
- Nix's cooking animation + the rotating lines already exist — add a **building shimmer / particle
  swell** that intensifies as it nears completion, then **pops** on reveal.
- The reveal celebration escalates with the streak (bigger sparkle burst at higher streaks) — real
  reward for real momentum.

## FEATURE D — Loop momentum (honest "one more")

Make the post-reveal "Make another / Try a variation / New style" CTAs *feel* like one-more — the
orange-button magnetism (1.6) + a satisfying press sound + the quick path back to creating. The pull
comes from real outputs and genuine momentum, never fabricated wins or pressure.

---

## ASSET SOURCING (like the Nix PNG workflow — files must be provided)
Claude Code can wire/sequence audio but cannot create sound files. Source a **royalty-free / CC0**
pack (licensed for commercial use), drop the files in `/public/sounds/`, and CC maps them to the cues.
Recommended sources (verify license per file before shipping):
- **Kenney.nl** — game audio packs, **CC0** (free, commercial OK) — "Interface Sounds", "UI Audio".
- **Freesound.org** — filter to **CC0** license; huge library of shimmers/whooshes/chimes.
- **Pixabay Sound Effects** — royalty-free, commercial OK.
- **Mixkit** — free SFX, commercial-friendly (check terms).
- (Optional) commission a small custom set for a fully unique, on-brand signature.
Keep each file small (web-optimized), prefer short clips; lazy/preload sensibly so they don't bloat load.

---

## BUILD ORDER (Phase 1.7)
1. **Sound pack wiring** (Feature A) — swap synth → real files via the existing `useSoundFx` API, all
   cues mapped, mute + reduced-motion respected. (Needs the audio files dropped in `/public/sounds/`.)
2. **Default-on + visible mute** (Feature B).
3. **Anticipation build** sound bed + visual swell during generation (Feature C).
4. **Escalating reveal + streak-scaled celebration** (Feature C).
5. **Loop momentum polish** on the repeat CTAs (Feature D).

## ACCEPTANCE / GUARDRAILS
- NO losses-disguised-as-wins, NO near-miss deception, NO manufactured loss-chasing. Celebrate only
  real outputs. (Hard rule.)
- Real SFX pack wired through the existing `useSoundFx()` API; mute toggle works; default-on respects
  saved prefs; `prefers-reduced-motion` gets a calm variant; volume pleasant, not startling.
- Audio files are licensed for commercial use (CC0/royalty-free) and live in `/public/sounds/`.
- Additive only — no changes to energy/Stripe/trial/grant logic. Nix from existing PNGs only.
- `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed. Update
  `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md`.

## THE FEELING WE'RE AFTER
You type an idea, hit a glowing orange Conjure, hear a whoosh as Nix gets to work, a shimmer builds
while he cooks, then a sparkle-burst lands as YOUR image appears — +XP, streak chime rising — and
three buttons beg you to make another. It feels amazing because you actually *made something great*.
That's the honest dopamine: real wins, celebrated hard.

*Created June 21, 2026. Phase 1.7 — "Juice & Sound." Honest-dopamine guardrails per Fox + Claude.
Audio asset sourcing required (CC0/royalty-free).*

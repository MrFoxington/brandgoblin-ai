# Goblin Studio — Share Celebration ("create → share → grow → build" loop)

### Right now sharing is a quiet "✓ Copied" toast. Make SHARING a rewarding, exciting moment — sound +
### Nix cheering you on + a nudge to keep building — so the loop becomes create → share → grow → repeat.
> Build spec for Claude Code. Additive to Phase 1.6 (the Share button) + Phase 1.7 (sound). Do NOT
> touch energy reservation, Stripe, trial, or generation logic. Nix from existing PNGs only.
> `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed. From Fox, June 21.

---

## NORTH STAR
**Bring out people's creative energy — and help them GROW.** Sharing is the growth action: pride +
free acquisition. Celebrate it as warmly as creating, then loop them straight back into building.
Honest-dopamine rule still applies: reward a REAL action (an actual successful share/copy), encourage
more — never nag, never fake, never pressure.

---

## FEATURE — Turn the Share action into a celebration

### Trigger (only on a REAL share)
- The Share button already exists on each creation (Phase 1.6: Web Share API → clipboard fallback).
- Fire the celebration ONLY when the share actually succeeds: `navigator.share()` promise resolves
  (not on cancel/reject), or the clipboard copy succeeds on the fallback path. Never celebrate a
  cancelled share.

### What happens on a successful share
1. **A rewarding sound** — a distinct, celebratory cue (`playShare()` → `/sounds/share.mp3`). Wire it
   through the existing `useSoundFx()` player: mute-gated, graceful silent fallback if the file is
   missing, primed on first gesture like the others. (A dedicated "share" sound — cheer/applause/win
   feel — so it's distinct from the reveal and level-up. Until the file is dropped in, it's silently
   graceful; can temporarily reuse `level-up.mp3` if desired.)
2. **An encouraging message from Nix** — a small celebratory overlay/toast with a happy/celebrating
   Nix pose + a rotating encouraging line, e.g.:
   - "Congrats — it looks amazing! 🎉"
   - "You just put your brand into the world. Let's keep building."
   - "Looking good! What do you want to create next?"
   - "That's how brands grow — one share at a time. 🚀"
   Keep it warm, proud, a little cheeky (Nix's voice). Respect `prefers-reduced-motion` (no big
   animation — show the message, skip the burst).
3. **A "keep building" nudge (the loop-back)** — a clear, inviting CTA right in/under the celebration:
   **"✨ Create something new"** / **"🎨 Make another"** that returns them to the generator (scroll to
   it / reset to a fresh create state). This is what closes the loop: share → "what's next?" → create.

### Honest-dopamine guardrails (hard rules)
- Celebrate ONLY a genuine successful share. No fake "you almost shared!" prompts.
- No pressure, FOMO timers, guilt, or nagging to share. It's an invitation, not a demand.
- Don't spam the sound/animation — one celebration per successful share.

---

## ACCEPTANCE / GUARDRAILS
- Celebration fires only on a real successful share/copy; cancelled shares do nothing.
- `playShare()` added to the SoundFx API (mute-gated, graceful fallback, primed on gesture).
- Nix message + "keep building" CTA appear; CTA returns the user to creating.
- `prefers-reduced-motion` respected; volume pleasant; one celebration per share (no spam).
- Additive only — no energy/Stripe/trial/generation changes. Nix existing PNGs only.
- `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed. Update
  `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md`.

## THE FEELING
You make something you love → hit Share → Nix throws confetti and a chime: "Congrats, it looks
amazing! What's next?" → and the create button is right there, glowing. You came to make one thing.
You leave having made five and shared three. That's the growth loop.

*Created June 21, 2026. Needs one dedicated share sound (CC0/royalty-free) in /public/sounds/share.mp3
— graceful until then. Follows Phase 1.6 (Share button) + 1.7 (sound system).*

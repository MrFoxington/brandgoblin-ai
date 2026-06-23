# Goblin Studio — Favorites + Prominent Share (complete the keep → share → grow loop)

### People create a LOT. Let them ⭐ the ones they love (so they don't scroll through 1,000 images),
### give favorites their own section in Studio AND the dashboard, and make the Share action a bold,
### glowing CTA that pulls them to post — then the share celebration loops them back to building.
> Build spec for Claude Code. Additive to Phase 1.6 (JobCard, brand gallery) + the Share Celebration.
> Do NOT touch energy reservation, Stripe, trial, or generation logic. Nix existing PNGs only.
> `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed. From Fox, June 21.

---

## NORTH STAR
**Bring out creative energy — then help them keep + grow it.** Favoriting = pride + easy retrieval of
the best work. Prominent sharing = growth + free acquisition. Together they close the loop:
create → ⭐ keep the gems → 🧡 share them → 🎉 celebrate → build more.

---

## FEATURE A — Favorite / star a creation

- **DB:** add `favorite BOOLEAN NOT NULL DEFAULT false` to `studio_jobs` (additive migration — Fox runs
  it in Supabase SQL editor before this goes live).
- **Toggle on every creation card** (`JobCard`): a star/heart icon (top corner of the image). Tap to
  favorite/unfavorite. Optimistic UI + a tiny satisfying confirmation (reuse `playButtonPress()` or a
  soft cue). Persists via a small API: `POST /api/studio/favorite { jobId, favorite }` (Pro-gated,
  ownership-checked).
- Keep it lightweight and delightful — a gold star that "pops" when set is perfect (goblin gold).

## FEATURE B — A Favorites section (in Studio AND the dashboard)

So nobody scrolls through a thousand images to find the keepers.
- **In Studio:** add a **"⭐ Favorites" filter/tab** to "Your Creations" — toggles the gallery to show
  only favorited items (works alongside the existing brand-scoped filter).
- **On the dashboard (`/dashboard`):** add a **Favorites section** showing the user's starred Studio
  creations (most recent first, capped, with a "view all in Studio" link). Make it feel like a
  trophy case / treasure stash.
- **NAMING (Fox to pick — build with a clear default, easy to rename):** functional default is
  **"⭐ Favorites,"** but the on-brand fun name is better — suggestions: **"Your Hoard," "Gems,"
  "Goblin Gold," "The Vault."** Use one consistent label everywhere; make it trivial to swap.

## FEATURE C — Action-button hierarchy + color system (make wanted actions OBVIOUS)

**The problem (live):** the actions we most want — Share, More like this — are the LEAST visible
(faint gray). Visual weight must match behavioral value. Apply this hierarchy on every creation card,
using only TWO bold colors so it stays magnetic, not a rainbow:

- **🟠 Share / Post → ORANGE, bold, gently glowing.** The #1 growth action (free acquisition); orange
  is the highest-CTR CTA color. Most prominent action on the card. Copy: "Share it ✨ / Post this."
  (A touch quieter than the main Conjure button so it invites, not screams.)
- **🟢 More like this → GREEN, clearly visible.** The #1 engagement+revenue action (more energy spent).
  Green = "go again." Solid, easy to see — not a faint outline.
- **⭐ Favorite → gold star** (Feature A) in the image corner — the "keep" action.
- **⬇ Download → neutral/subtle.** Useful but it ends the loop; don't glamorize it.
- **✂️ Remove BG · ⤴ Upscale → quiet utility chips.** Paid upsells — visible but must NOT compete
  with Share/More-like-this for attention.

Rule: only Share (orange) + More-like-this (green) get bold color; everything else is neutral/quiet.
On share success → fire the **Share Celebration** (already built): applause + Nix + keep-building CTA.

## FEATURE D — Surface Share at the REVEAL (the highest-intent moment — biggest lever)

Pride peaks the instant the image lands — that's when share intent is highest, NOT later in a gallery
of 18 images. So in the post-reveal celebration (which already has "Make another / Try a variation /
New style"), add a prominent **"📣 Share it"** action, with a Nix line like **"Love it? Show the
world 🌍."**
- Two glowing paths at peak emotion: **Share (orange)** and **Make another (create-color)** — both
  prominent, color-coded per Feature C.
- Sharing from the reveal runs the same share flow (real-share-only) → Share Celebration.
- This is the single highest-impact conversion change in this build: catch the share at maximum
  emotional intent, every time someone creates.

---

## HONEST-DOPAMINE GUARDRAILS (hard rules)
- Favoriting and sharing are real, user-initiated actions — reward them, never fake or pressure them.
- No nagging to favorite/share, no FOMO, no guilt. Inviting, not demanding.
- Share celebration fires only on a genuine successful share (handled in the Share Celebration build).

## ACCEPTANCE / GUARDRAILS
- `favorite` flag added (additive migration); star toggle works + persists; ownership-checked API.
- Favorites filter in Studio + Favorites section on the dashboard; one consistent label (renamable).
- **Button hierarchy live:** Share = orange/glowing, More like this = green, both clearly visible;
  Download neutral; Remove BG/Upscale quiet. Only those two get bold color.
- **Share surfaced at the reveal** — a prominent "📣 Share it" in the post-reveal celebration next to
  "Make another," with a Nix invite line. Shares from there run the same real-share-only flow.
- Additive only — no energy/Stripe/trial/generation changes. Nix existing PNGs only.
- `prefers-reduced-motion` respected; `tsc` + `npm run build` clean; commit as one phase; don't push
  until reviewed. Update `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md`. Note the DB migration to run.

## THE FEELING
You conjure ten logos, ⭐ your three favorites with a satisfying gold-star pop, and they drop into
"Your Hoard." You hit the glowing **Share** on the best one → applause, Nix cheers, "what's next?" →
and you're already typing your next idea. Create → keep → share → grow → repeat.

*Created June 21, 2026. Pairs with the Share Celebration brief (the post-share reward). Needs a small
`studio_jobs.favorite` migration. Naming to be finalized by Fox.*

# Phase 2 — Reverse Trial (7-Day Auto-Pro)
### The biggest conversion lever. Give everyone the partner, then let them feel the loss.
> Build-ready spec. Additive only. Reuses the existing energy + checkout code; does not rebuild them.
> Start only after Phase 1 is committed. One commit for this phase.

---

## THE STRATEGY (why this works)
Plain freemium converts at 2–5%. A **reverse trial** — full Pro automatically for 7 days, **no card
required**, then drop to Free — routinely converts 2–3× better, because the user *experiences* the
partnership and then feels its absence. This is how you manufacture the real
"I-don't-want-to-lose-my-creative-partner" feeling. No dark patterns: full value, honest countdown,
graceful downgrade.

---

## KEY DESIGN DECISION: app-managed trial, NOT a Stripe trial
A Stripe trial subscription requires a card up front — which kills the no-friction magic. So the
trial is **managed in our DB**, with **no Stripe involvement until the user actually converts**
(then it flows through the existing hardened checkout). This keeps friction at zero and reuses
everything already built.

---

## WHAT EXISTS TODAY (anchor — reuse, don't duplicate)
- `users`: `plan ('free'|'pro'|'agency')`, `credits`, `stripe_customer_id`. A `handle_new_user`
  trigger creates each row as `plan='free', credits=3` on signup.
- Energy: `grantMonthlyEnergy(userId, periodStart, periodEnd)` and `revokeEnergy(userId)` in
  `@/lib/energy`. `checkEnergyForGeneration` treats `plan==='free'` as `not_pro`.
- Feature gates check `plan==='pro'` (e.g. `/api/generate/creator` returns 403 for free).
- Hardened checkout at `/api/stripe/checkout`; webhook grants real Pro on `checkout.session.completed`.

---

## PART A — Schema (additive, idempotent migration)
`supabase/migrations/<date>_reverse_trial.sql`:
```sql
alter table public.users add column if not exists trial_ends_at   timestamptz;
alter table public.users add column if not exists is_trial        boolean not null default false;
alter table public.users add column if not exists has_used_trial  boolean not null default false;
```
- `is_trial` + `trial_ends_at` = an active trial window.
- `has_used_trial` prevents re-trialing (one trial per account, ever).
- No RLS change (service-role writes; user reads own row via existing policy).

---

## PART B — Start the trial at signup (full power during the magic)
Begin the trial immediately on signup so the user has the *entire* Pro experience during their
first "holy crap." Implement in the **signup flow / first authenticated load** (server-side), NOT
by flipping the DB trigger to grant Pro blindly:

On first authenticated session for a brand-new user where `has_used_trial = false`:
1. Set `is_trial=true`, `has_used_trial=true`, `trial_ends_at = now() + interval '7 days'`.
2. Grant trial energy: call `grantMonthlyEnergy(userId, now, trial_ends_at)` (reuses existing
   bucket logic; period end = trial end).
3. Leave `plan='free'` in the DB. **Access is decided by `getEffectivePlan()` (Part C)** — keep the
   `plan` column meaning "paid plan" so paid-vs-trial never gets muddled.

> Do this in app code (idempotent, guarded by `has_used_trial`), not the SQL trigger — so the trial
> can't silently re-grant and can't fight the webhook.

---

## PART C — One source of truth for access: `getEffectivePlan()`
Add `src/lib/access.ts`:
```ts
// returns "pro" if paid OR within an active trial window; else "free"
export function getEffectivePlan(u: { plan: string; is_trial: boolean; trial_ends_at: string | null }) {
  if (u.plan === "pro" || u.plan === "agency") return "pro";
  if (u.is_trial && u.trial_ends_at && new Date(u.trial_ends_at) > new Date()) return "pro";
  return "free";
}
export function isTrialing(u): boolean { /* is_trial && not expired && plan!=='pro' */ }
```
**Wire every feature/energy gate to `getEffectivePlan()` instead of raw `plan === 'pro'`:**
- `checkEnergyForGeneration` (the `not_pro` check).
- `/api/generate/creator` 403 gate.
- Any dashboard "Pro feature" gate.

This is the only change to gating logic, and it's centralized — low risk, easy to audit.

---

## PART D — Expire the trial (lazy + scheduled backstop)
1. **Lazy enforcement (primary):** in `getEffectivePlan` the window check already denies access
   after `trial_ends_at`. Additionally, on any gated server call, if `is_trial && trial_ends_at < now
   && plan !== 'pro'`: set `is_trial=false` and call `revokeEnergy(userId)`. Idempotent.
2. **Scheduled sweep (backstop + emails):** a daily job (you already have scheduled tasks) that
   finds expired trials, finalizes `is_trial=false` + `revokeEnergy`, and triggers lifecycle email
   (Part F). Keeps state clean for users who don't return.

> A user who never comes back stays flagged until the sweep runs — harmless, they consume nothing.

---

## PART E — The experience (this is where conversion happens)
- **Trial badge / countdown:** persistent, friendly — "✨ 5 days building with Nix." Gentle, not a
  pressure timer. Nix-styled.
- **Mid-trial nudge (day ~5):** Nix shows what they've built ("Look at everything we made — keep
  it going for $19/mo"). CTA → existing checkout (annual default once Phase 3 ships).
- **Trial-end moment (the conversion peak):** a warm screen, NOT a lockout — "Your 7 days with Nix
  are up. Your brand & library are saved forever. Want to keep building together?" Show their own
  created work as the loss-aversion anchor. One-click upgrade (existing checkout).
- **After downgrade:** Free experience stays delightful; the upgrade prompt rides the natural
  limits (energy empty / locked builders). Never punish — invite.

---

## PART F — Lifecycle emails (cheap, high-impact)
Triggered by the scheduled sweep / trial state (any basic email provider):
- Day 0: welcome + "you've got 7 days of full Pro."
- Day 5: "2 days left — here's what you've built."
- Day 7 (expiry): "Keep your creative partner" + 1-click upgrade.
- Day 10 (win-back): a small, honest founding-member offer.

---

## PART G — Convert cleanly (reconcile trial → paid)
- Upgrade goes through the **existing** `/api/stripe/checkout` (no changes needed).
- In `checkout.session.completed` (webhook), when granting paid Pro, also set
  `is_trial=false` (clear the trial flag) so state is unambiguous. (Small addition to existing case;
  do not touch refill/energy logic.)

---

## ACCEPTANCE CRITERIA
- New signup immediately has **full Pro access + trial energy**, no card asked.
- `getEffectivePlan` returns `pro` during the window, `free` after — verified at every gate.
- At expiry: access drops to Free, energy revoked, library/brands **retained**, upgrade screen shown.
- Upgrading mid- or post-trial via existing checkout → real Pro, `is_trial=false`, energy granted.
- `has_used_trial` blocks a second trial.
- Migration idempotent; no change to checkout/refill/idempotency/energy internals beyond the
  centralized `getEffectivePlan` wiring + the two flag writes. Typecheck passes. Verified in test mode.

---

## TEST PLAN
1. Fresh signup → assert Pro features + energy, `is_trial=true`, `trial_ends_at ≈ +7d`, no card.
2. Manually set `trial_ends_at` to the past → hit a gated route → assert downgrade to Free + energy
   revoked + brands/library intact + upgrade screen.
3. Upgrade via checkout (test card `4242…`) → assert real Pro, `is_trial=false`, energy granted.
4. Attempt second trial on same account → blocked by `has_used_trial`.
5. Confirm scheduled sweep expires a stale trial and fires the day-7 email.

---

## GUARDRAILS
- Don't change refill, idempotency, or energy bucket math. Reuse `grantMonthlyEnergy`/`revokeEnergy`.
- All access decisions go through `getEffectivePlan()` — no scattered `plan === 'pro'` checks left.
- Trial is app-managed; Stripe is only involved at actual conversion.
- Commit as one phase: `"Phase 2: reverse trial — 7-day auto-Pro + effective-plan gating"`.
```

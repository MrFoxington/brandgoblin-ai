# Phase 1 — Recover Failed-Payment Churn (Dunning)
### Smallest change, fastest money. ~1 day. Likely +5–10% MRR.
> Build-ready spec. Additive only. Extends the EXISTING Stripe webhook — does not rebuild it.
> Do NOT start until Claude Code has finished the Magic build and committed. One commit for this phase.

---

## WHY THIS FIRST
20–40% of subscription churn isn't people quitting — it's **expired/declined cards** (involuntary
churn). Today your webhook downgrades these users to free on `past_due`/`unpaid` and they're gone,
silently, even though most would happily keep paying with a working card. Recovering them is the
highest-ROI, lowest-risk change available, and it sits right on top of code you already hardened.

---

## WHAT EXISTS TODAY (anchor — do not duplicate or rebuild)
- `src/app/api/stripe/webhook/route.ts` — verified signature handling; cases for
  `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
  It currently **downgrades immediately** when `sub.status` is `canceled | unpaid | past_due`.
- `users` table: `plan`, `credits`, `stripe_customer_id` (+ energy via `user_energy_balances`).
- `getStripe()` lazy client + `createAdminClient()` are already in the file. Reuse them.
- `revokeEnergy` / `grantMonthlyEnergy` from `@/lib/energy`. Do not change energy logic.

---

## PART A — Turn on Stripe-native recovery (config, ~15 min, no code)
In the **Stripe Dashboard** (do in test mode first, then live):
1. **Billing → Automatic collection / Smart Retries:** enable Smart Retries (Stripe's ML-timed
   re-attempts on failed invoices).
2. **Customer emails:** enable "Send emails when card payments fail" + "...about expiring cards."
3. **Revenue Recovery → set the retry window** (e.g. retry over ~2 weeks, then cancel).
4. Confirm the **Customer Portal** is enabled with **"update payment method"** allowed
   (Billing → Customer portal). We link users here to fix their card.

This alone recovers a chunk of churn with zero code. The code below makes the in-app experience
match and prevents premature downgrades.

---

## PART B — Stop downgrading on the FIRST failed payment (code)

**Problem:** `past_due` currently triggers immediate downgrade. But `past_due` means "a payment
failed and we're retrying" — NOT "this user quit." Downgrading here throws away users Stripe is
about to recover.

**Change in `customer.subscription.updated`:**
- **Remove `past_due` from the immediate-downgrade condition.** A `past_due` user keeps Pro access
  during the retry grace window, but gets flagged (Part C). Keep `canceled` and `unpaid` as
  downgrade triggers (`unpaid` = retries exhausted).
- Net new downgrade condition: `sub.status === "canceled" || sub.status === "unpaid"`.
- Leave `active`/`trialing` re-grant logic exactly as-is.

> Rationale: let Smart Retries do its job. Only downgrade when Stripe gives up (`unpaid`) or the
> user truly cancels (`canceled`/`subscription.deleted`).

---

## PART C — Track payment state + drive the recovery prompt (code)

1. **Migration** `supabase/migrations/<date>_payment_state.sql` (idempotent, additive):
   ```sql
   alter table public.users
     add column if not exists payment_status text not null default 'active';
     -- values: active | past_due | canceled
   alter table public.users
     add column if not exists payment_issue_at timestamptz;
   ```
   No RLS change needed (users table already has its policies); these are read by the user, written
   by the service-role webhook only.

2. **Webhook updates** (same file, reuse `createAdminClient`):
   - On `invoice.payment_failed` (ADD this event case): set `payment_status='past_due'`,
     `payment_issue_at=now()` for that `stripe_customer_id`. Do **not** downgrade plan/energy.
   - On `invoice.payment_succeeded` (ADD): set `payment_status='active'`, clear `payment_issue_at`.
     (Covers recovery — card fixed, retry succeeded.)
   - On `customer.subscription.deleted` / `unpaid`: set `payment_status='canceled'` alongside the
     existing downgrade.
   - **Enable these events** in the Stripe webhook endpoint config: `invoice.payment_failed`,
     `invoice.payment_succeeded` (in addition to the ones already enabled).
   - Keep all changes idempotent and inside the existing `switch`. Don't refactor working cases.

3. **In-app recovery banner** (`PaymentRecoveryBanner.tsx`):
   - Shows only when `users.payment_status === 'past_due'`.
   - Warm, in-character, non-shaming: *"Nix noticed your card needs a quick update — let's keep
     your momentum going."* Single CTA → **Stripe Customer Portal** (update payment method).
   - Add a small server route `POST /api/stripe/portal` that creates a
     `stripe.billingPortal.sessions.create({ customer, return_url })` and returns the URL. Reuse
     `getStripe()` + the user's `stripe_customer_id`.

---

## PART D — Save-the-cancel (lightweight, optional within this phase)
When a user clicks cancel in the portal, Stripe handles it — but add an **in-app intercept** before
sending them there:
- A small modal: Nix + "Your brand library stays forever. Want to **pause for a month** instead?"
- "Pause" → Stripe subscription pause (`pause_collection`) for one cycle, keep access per your call.
- If they still cancel, let them through to the portal. Keep this simple; don't over-build.

---

## ACCEPTANCE CRITERIA
- A `past_due` user (test via Stripe test clock / failed test card `4000 0000 0000 0341`) **keeps
  Pro access** and sees the recovery banner — is **not** downgraded.
- After updating to a good card, Smart Retries succeeds → `invoice.payment_succeeded` →
  `payment_status` returns to `active`, banner disappears, Pro intact.
- Retries exhausted → `unpaid`/`subscription.deleted` → user downgraded to free + energy revoked
  (existing behavior) + `payment_status='canceled'`.
- Portal link opens Stripe's update-card flow for the correct customer.
- Migration re-runs cleanly (idempotent). No change to checkout, refill, or energy logic.
- Typecheck passes. Verified in Stripe **test mode** before live.

---

## TEST PLAN (test mode)
1. Subscribe a test user (card `4242…`). Confirm Pro + energy.
2. Use a **failing renewal card** (`4000 0000 0000 0341`) via a Stripe **test clock** to force
   `invoice.payment_failed` → assert: still Pro, banner shows, `payment_status='past_due'`.
3. Update to `4242…` in the portal; advance the clock → `invoice.payment_succeeded` → assert
   `payment_status='active'`, banner gone.
4. Force retries to exhaust → `unpaid` → assert downgrade to free + energy revoked.

---

## GUARDRAILS
- Do not touch `checkout`, `addRefillEnergy`, the idempotency code, or energy buckets.
- All webhook edits live inside the existing `switch`, reusing existing helpers.
- Ship behind test-mode verification; commit as a single phase: 
  `"Phase 1: dunning — grace window on past_due + recovery banner + portal"`.
```

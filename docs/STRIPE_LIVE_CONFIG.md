# BrandGoblin AI — Live Mode Config (source of truth)
> The complete, correct setup for Stripe + Vercel + Supabase in LIVE mode.
> Work through this to make sure nothing is left in test mode. Every Stripe value below
> must come from Stripe with the **Test mode toggle OFF**.

---

## THE GOLDEN RULE
Stripe **test mode** and **live mode** are completely separate worlds — separate keys,
separate products/prices, separate webhooks, separate signing secrets. A value from test mode
will NOT work in live mode. The "energy didn't credit" bug was caused by a **test-mode webhook
secret** sitting in a live deployment. So: every Stripe value must be a LIVE value.

**How to tell test vs live at a glance:**
- Secret key: `sk_live_…` ✅   ·   `sk_test_…` ❌
- Publishable key: `pk_live_…` ✅   ·   `pk_test_…` ❌
- Price IDs (`price_…`) and webhook secrets (`whsec_…`) look the same in both modes — you must
  confirm they were created/copied with the **Test mode toggle OFF**.

---

## 1. STRIPE (do everything with Test mode OFF / Live)

### a) API keys — Developers → API keys
- **Secret key** → must be `sk_live_…`  → goes in Vercel as `STRIPE_SECRET_KEY`
- **Publishable key** → `pk_live_…` → Vercel as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### b) Products & prices — Product catalogue (create these in LIVE mode if missing)
- **Creator Pro** — recurring, **$19.00/month** → copy its **Price ID** (`price_…`)
  → Vercel as `STRIPE_PRICE_ID_PRO`
- **Creative Energy Refill** — **one-time**, **$19.00** (NOT recurring) → copy its **Price ID**
  → Vercel as `STRIPE_PRICE_ID_ENERGY_REFILL`
- ⚠️ If you only created these in test mode, recreate them in live mode and copy the new IDs.

### c) Webhook endpoint — Developers → Webhooks (LIVE)
- There should be exactly **ONE** endpoint:
  - **URL:** `https://app.brandgoblinai.com/api/stripe/webhook`
  - **Status:** Active
- **Delete any other endpoints** (e.g. the old `your-vercel-domain.vercel.app` placeholder).
- **Events — must list ALL FIVE** (Edit destination → add any missing):
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.payment_succeeded`
- **Signing secret** → reveal it → goes in Vercel as `STRIPE_WEBHOOK_SECRET`
  - ⚠️ Never commit the actual `whsec_…` value here — it lives only in Vercel env vars.
    (The previous value was leaked and rotated on June 20, 2026.)

---

## 2. VERCEL — Settings → Environment Variables (Production)
Set/verify every one of these. Stripe values must be the LIVE ones from §1.

| Variable | Correct value / source |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` (Stripe API keys, live) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `STRIPE_PRICE_ID_PRO` | live `price_…` for Creator Pro $19/mo recurring |
| `STRIPE_PRICE_ID_ENERGY_REFILL` | live `price_…` for the $19 one-time refill |
| `STRIPE_WEBHOOK_SECRET` | live `whsec_…` from the webhook endpoint (set in Vercel only — never commit) |
| `NEXT_PUBLIC_APP_URL` | `https://app.brandgoblinai.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | (unchanged — same for test/live) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (unchanged) |
| `SUPABASE_SERVICE_ROLE_KEY` | (unchanged) |
| `ANTHROPIC_API_KEY` | (unchanged) |
| `CRON_SECRET` | (your trial-sweep secret, if set) |

After ANY change here → **Redeploy** (Deployments → latest → ⋯ → Redeploy). Env changes only
take effect on a fresh deploy.

---

## 3. SUPABASE (not affected by Stripe test/live — just confirm these are correct)
- Auth → URL Configuration → **Site URL** = `https://app.brandgoblinai.com`
- Redirect URLs include `https://app.brandgoblinai.com/**`
- Auth → Confirm email = ON
- Auth → Emails → SMTP = Resend (smtp.resend.com / 465 / resend / your API key)

---

## 4. AFTER FIXING — verify end to end
1. Redeploy Vercel (so the live secret is live).
2. Stripe → that failed `checkout.session.completed` refill event → click **Resend** → it should
   return **200** now, and your energy credits (recovers the $19 already paid).
3. Do one fresh **live** refill on your own account → confirm energy bar fills → refund yourself.
4. Confirm a fresh **live** subscription grants Pro + energy.

## 5. SECURITY (do once everything works)
- The webhook signing secret was shared in chat. Tidy it up later: Stripe webhook → **Roll
  secret** → update `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy. Low priority; fix the mismatch first.

---

## ROOT CAUSE (for the record)
Charges worked (live secret key + live prices were set), but `STRIPE_WEBHOOK_SECRET` held a
**test-mode** secret, so every live webhook failed signature verification (400) and no
post-payment action ran — energy never credited, dunning never fired. Fix = use the live
endpoint's signing secret + subscribe the endpoint to all 5 events.

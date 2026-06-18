# BrandGoblin AI — Launch Checklist

> The honest gap between "built" and "taking money." The code is ready. These are the
> steps only you (Fox) can do, because they need your accounts and keys.
> Work top to bottom. Don't skip the test purchase.

Last updated: June 18, 2026

---

## The one-sentence status

The product generates brand kits and enforces free limits correctly. It **cannot take a
single dollar** until the steps below are done, because Stripe keys aren't set and the app
isn't pointed at a public domain.

---

## STEP 1 — Switch on Stripe (≈30 min)

You need a Stripe account in **live mode** (or test mode first to rehearse).

1. **Create the product + price**
   - Stripe Dashboard → Product catalogue → **+ Add product**
   - Name: `Creator Pro`, Description: `Unlimited brand kits + Creator Pro content engine`
   - Pricing: **Recurring**, **$19.00 USD**, billing period **Monthly**
   - Save, then copy the **Price ID** (looks like `price_1ABC...`). This is `STRIPE_PRICE_ID_PRO`.

2. **Grab your API keys**
   - Stripe Dashboard → Developers → API keys
   - Copy the **Secret key** (`sk_live_...` or `sk_test_...`). This is `STRIPE_SECRET_KEY`.

3. **Create the webhook endpoint** (do this AFTER Step 2 deploy gives you a real URL)
   - Stripe Dashboard → Developers → Webhooks → **+ Add endpoint**
   - Endpoint URL: `https://YOUR-DOMAIN/api/stripe/webhook`
   - Events to send: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`
   - Save, then copy the **Signing secret** (`whsec_...`). This is `STRIPE_WEBHOOK_SECRET`.

---

## STEP 2 — Confirm a real production deployment (≈15 min)

The current `NEXT_PUBLIC_APP_URL` is `http://localhost:3000`, which means Stripe would try
to send paying customers back to your laptop. Fix that.

1. Confirm the app is deployed on Vercel with a real public domain (e.g.
   `brandgoblin.ai` or `brandgoblin.vercel.app`). Visit it in an incognito window.
2. In **Vercel → Project → Settings → Environment Variables**, set these for **Production**:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_APP_URL` | your real `https://` domain (no trailing slash) |
   | `STRIPE_SECRET_KEY` | from Step 1.2 |
   | `STRIPE_PRICE_ID_PRO` | from Step 1.1 |
   | `STRIPE_WEBHOOK_SECRET` | from Step 1.3 |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | your `pk_...` key |
   | `NEXT_PUBLIC_SUPABASE_URL` | (already set) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (already set) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (already set — required for the webhook) |
   | `ANTHROPIC_API_KEY` | (already set) |

3. Redeploy so the new env vars take effect.

> Note: the checkout route now **refuses to run** if `NEXT_PUBLIC_APP_URL` still contains
> `localhost`, so a misconfigured deploy fails loudly instead of sending customers to your laptop.

---

## STEP 3 — Run the database migration (≈2 min) — DO NOT SKIP

There was a latent bug: the `users` table had no `stripe_customer_id` column, so a
successful payment could not be written back — the customer would pay and stay on Free.
A migration now fixes this. Apply it:

- Supabase Dashboard → SQL Editor → paste the contents of
  `supabase/migrations/20260618_add_stripe_customer_id.sql` → Run.
- Verify: Table editor → `users` → confirm a `stripe_customer_id` column now exists.

---

## STEP 4 — Test purchase end-to-end (≈10 min) — THE PROOF

Do this in Stripe **test mode** first (use test keys + a test webhook endpoint).

1. Sign up as a brand-new user in an incognito window.
2. Generate brand kits until you hit the free limit (3) — confirm the upgrade prompt appears.
3. Click **Upgrade to Creator Pro** → you should land on Stripe Checkout.
4. Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.
5. Confirm you're redirected to `/settings?upgraded=1`.
6. In Supabase, confirm that user's row now shows `plan = pro`, `credits = 999999`, and a
   populated `stripe_customer_id`.
7. Generate again — confirm it no longer blocks you.
8. In Stripe, cancel the test subscription → confirm the webhook downgrades the row back to
   `plan = free`, `credits = 3`.

If all 8 pass, repeat once in **live mode** with a real card (you can refund yourself). You
are now able to take money.

---

## STEP 5 — Minimum credible launch (not code — distribution)

Payments working ≠ a business. Before/alongside promoting it:

- [ ] Replace the 6 placeholder testimonials with **one real quote** from a real user.
- [ ] Upload favicon + OG image (social shares currently look broken).
- [ ] Get the first 3–5 real users through the full flow and watch where they drop off.
- [ ] Pick the **single** most-requested next feature. Ignore the 6-product ecosystem roadmap
      until Creator Pro has paying users.

---

## What's already done for you (code side)

- ✅ Checkout route hardened: fails loudly on missing keys/localhost, reuses Stripe customers.
- ✅ Webhook hardened: re-grants Pro on renewal/recovery, clean downgrade on cancel.
- ✅ Migration written for the missing `stripe_customer_id` column (the silent payment-failure bug).
- ✅ Free-tier credit enforcement verified working.

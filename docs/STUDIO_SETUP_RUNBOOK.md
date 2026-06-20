# Goblin Studio — External Setup Runbook

### The accounts, keys, and Stripe prices YOU set up so Claude Code can build Phase 1 with zero blockers.
> These are human steps (they need your logins + billing). Do them, paste the resulting keys/IDs into
> the env table at the bottom, and Claude Code takes it from there. Work in **LIVE** mode for Stripe
> (the app is already live). Created June 20, 2026.

---

## A. fal.ai (PRIMARY generation provider)

1. Sign up at **fal.ai** with the BrandGoblin email. Pure pay-as-you-go — no subscription.
2. Add a payment method / top up a small starting balance (e.g. $20) under **Billing**.
3. **Set a spend limit / budget alert** (e.g. $50/day) under Billing. This protects you from a *bug*
   running up cost — the user-pays model protects you from normal usage, this protects you from us.
4. Create an API key: **Dashboard → Keys → Create key**. Copy it.
   - Env var: **`FAL_KEY`** (this is fal's SDK convention — the kickoff prompt called it
     `FAL_API_KEY`; tell Claude Code to use `FAL_KEY`, they're the same thing).
5. ⚠️ **Verify per-model commercial license before enabling each model** (see §E). Don't enable a
   model we haven't cleared.

---

## B. Replicate (FALLBACK provider)

1. Sign up at **replicate.com** (BrandGoblin email).
2. Add billing under **Account → Billing** and set a **spend limit**.
3. Create a token: **Account → API tokens → Create token**. Copy it.
   - Env var: **`REPLICATE_API_TOKEN`** (Replicate SDK convention).
4. Lower priority than fal — it's redundancy — but set it up now so the abstraction layer has a real
   fallback to test against.

---

## C. Stripe — three one-time refill prices (LIVE mode)

Goal: the tiered packs from the brief. **You already have the $19/1,000 price**
(`STRIPE_PRICE_ID_ENERGY_REFILL`) — keep and reuse it; just add metadata. Create the other two new.

### Recommended structure
One Product, three one-time Prices. Toggle Stripe to **LIVE** first (top-left test/live switch).

1. **Products → (find or create) "⚡ Creative Energy Refill".**
2. **Edit the existing $19 price** → add metadata (you can't change a price's amount, but metadata is
   editable): key `energy_amount` = `1000`, key `pack` = `starter`.
3. **Add price → One-time → $49.00 USD.** Metadata: `energy_amount` = `3000`, `pack` = `value`.
   Copy the new `price_…` ID.
4. **Add price → One-time → $99.00 USD.** Metadata: `energy_amount` = `7000`, `pack` = `creator`.
   Copy the new `price_…` ID.

### Why metadata
Tell Claude Code to **read the granted energy from the price's `energy_amount` metadata** in the
webhook, instead of hardcoding a price→energy map. Adding a future pack then needs zero code — just a
new price with metadata. (This replaces the current flat `REFILL_AMOUNT` grant for refills.)

### Pack economics (sanity check — all profitable)
| Pack | Price | Energy | ¢/energy | Note |
|---|---|---|---|---|
| Starter | $19 | 1,000 | 1.90¢ | existing price, reused |
| Value | $49 | 3,000 | 1.63¢ | "Best value" badge in UI |
| Creator | $99 | 7,000 | 1.41¢ | for heavy creators |

Volume discount is intentional — it nudges bigger purchases while every tier still nets margin after
Stripe fees.

---

## D. Supabase Storage (where generated media lives)

1. Supabase → **Storage → New bucket** named **`studio-assets`**.
2. Set it **private**; Claude Code will serve assets via signed URLs (don't make it public — these are
   paid customer assets).
3. That's it — Claude Code will wire the upload/signing + any RLS in code.

---

## E. ⚠️ Per-model commercial-license checks (do before enabling each)

This is the "only enable models whose terms we've verified" discipline. Key gotcha:

- **FLUX.1 [dev] is NON-COMMERCIAL** — do NOT use it for customer output. For images use a
  commercially-licensed model: **FLUX.1 [schnell]** (Apache-2.0), **FLUX.1 [pro]** (commercial via
  API), **Seedream**, or **Qwen-Image**. Confirm on fal's model page for each.
- **Video** (Kling / Wan / Veo / Hailuo via fal): confirm commercial use is permitted for the
  specific endpoint before enabling. Note human-likeness limits if we ever generate real faces.
- Record the cleared models + their live USD cost so Claude Code can map cost → energy.

Give Claude Code only the **green-lit model list** — it must not enable anything else.

---

## F. ENV VAR TABLE — paste values here, then add to BOTH `.env.local` and Vercel (Production)

| Env var | What / where to get it | Status |
|---|---|---|
| `FAL_KEY` | fal.ai → Dashboard → Keys | ✅ set (local + Vercel); $20 prepaid ceiling, concurrency 10, Log Privacy private |
| `REPLICATE_API_TOKEN` | replicate.com → Account → API tokens | ✅ set (local + Vercel, redeployed); prepaid credit, auto-reload OFF |
| `STRIPE_PRICE_ID_ENERGY_REFILL` | EXISTING $19/1,000 price (already set) — leave as is | ✅ |
| `STRIPE_PRICE_ID_ENERGY_3000` | $49/3,000 → `price_1TkSswA0mkPIl5SAazRNw19t` | ✅ local + Vercel |
| `STRIPE_PRICE_ID_ENERGY_7000` | $99/7,000 → `price_1TkSuaA0mkPIl5SA2ocmqkUS` | ✅ local + Vercel |
| `ENERGY_MARKUP_MULTIPLIER` | `10` (locked markup) | ✅ local + Vercel |

> After filling these in: add each to Vercel (Settings → Environment Variables → Production) AND your
> local `.env.local` so Claude Code can build/test. Claude Code's kickoff prompt already tells it to
> scaffold behind these names and stub live calls if a key is missing — so it won't be blocked while
> you finish, but Phase 1 can't go *live* until the table is complete and the models in §E are cleared.

---

## HAND-OFF CHECKLIST (when all boxes above are ticked)
- [x] `FAL_KEY` set (local + Vercel); $20 prepaid ceiling, concurrency 10, Log Privacy private
- [x] Green-lit model list + energy pricing → see `STUDIO_MODEL_COST_MAP.md` (default image = FLUX.1 schnell, NOT dev)
- [x] `REPLICATE_API_TOKEN` set (local + Vercel); prepaid credit, auto-reload OFF
- [x] $49 + $99 Stripe prices created; IDs in .env.local — ⚠️ still add both to Vercel
- [x] $19 price has `energy_amount=1000` metadata added
- [x] $49/$99 prices created with `energy_amount` metadata (3000 / 7000)
- [x] `studio-assets` Supabase bucket created (private, 50 MB, image/png+jpeg+webp + video/mp4)
- [x] `ENERGY_MARKUP_MULTIPLIER=10` set (local) — ⚠️ add to Vercel
- [x] Spend ceilings set: fal prepaid $20 + concurrency 10; Replicate prepaid, auto-reload off

*Companion to `GOBLIN_STUDIO_BRIEF.md`. Once this runbook is complete, Claude Code can build Phase 1
end-to-end and flip it live.*

---

## ✅ SETUP COMPLETE — June 20, 2026
All external setup done: fal.ai (key + prepaid ceiling + concurrency 10 + private logs), Replicate
(token + prepaid, auto-reload off), Stripe (3 refill packs w/ `energy_amount` metadata, vars in
local + Vercel), `studio-assets` private bucket, model cost map green-lit. **Claude Code is unblocked
to build Phase 1.** Only re-verify live model prices/licenses (per `STUDIO_MODEL_COST_MAP.md`) before
flipping Studio live to real users.

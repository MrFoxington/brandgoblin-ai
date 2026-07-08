# Build Brief — App Freemium Conversion (kill the 7-day trial + Agency tier)

### Move the APP from "7-day full-Pro trial → revoke" to a **lasting free tier**: free brand kits + a
### one-time Goblin Studio energy taste (250) + free Nix goodies, with **Creator Pro ($19/mo)** to grow and
### **$19 energy top-ups** for anyone. Remove the **Agency Edition** tier entirely. This is the app-side
### pair to the Airo V4 landing brief — they must ship together, app first.
> ⚠️ This touches ACCESS + BILLING + Stripe. CC: read the code, produce a careful plan, PRESERVE existing
> paying users, make the grant tunable, and HOLD for review before pushing. Supersedes/absorbs
> `docs/STUDIO_FREE_TASTE_AND_UPSELL_BRIEF.md` for the app build.

---

## CONTEXT (verified in code)
- `src/lib/trial.ts` — `startTrialIfEligible()` grants a **7-day full-Pro trial + monthly energy**;
  `expireTrialIfNeeded()` flips `is_trial=false` and **revokes energy** at day 7.
- Trial UI: `TrialCountdownBanner.tsx`, `TrialEndScreen.tsx`; API `src/app/api/trial/expire/route.ts`;
  Stripe webhook + `src/lib/access.ts` / `energy.ts` reference trial + plan.
- Pricing: `src/app/page.tsx` (landing PLANS), `src/app/pricing/page.tsx`, `HeroInteractive.tsx`
  ("7 days of everything" badge + CTA), plus an **Agency Edition** tier + `AgencyWaitlistModal.tsx`.
- `plan` values: `"free" | "pro" | "agency"`.

## TARGET MODEL
- **Free tier (no time clock):** create brand kits (keep existing free brand-gen limit), **try Goblin
  Studio with a ONE-TIME 250 Creative Energy grant** (tunable `FREE_STUDIO_STARTER_ENERGY`, default 250),
  free Nix stickers + wallpapers. No 7-day Pro trial, no day-7 lockout.
- **Creator Pro ($19/mo):** unchanged — unlimited brands, content engine, monthly Creative Energy, top-ups.
- **$19 energy top-up:** available to FREE users too (reuse existing `STRIPE_PRICE_ID_ENERGY_REFILL`).

## CHANGES
### 1. Billing / access (the careful part)
- **Stop granting the 7-day Pro trial on signup.** Replace `startTrialIfEligible()` behavior: instead of a
  7-day Pro window + monthly energy, grant a **one-time 250 Studio starter energy** to a new free user.
  KEEP the anti-abuse guards (email verified, one-per-normalized-email, IP limit) so the free energy can't
  be farmed. Set a `has_received_free_studio_grant` (or reuse `has_used_trial`) flag so it's once-per-user.
- **Stop the day-7 revoke.** `expireTrialIfNeeded()` should no longer revoke a free user's energy. Free
  users simply keep whatever energy they have (it doesn't refill); when it hits 0 they see the upsell.
- **Stripe webhook:** Pro upgrade still grants monthly energy; Pro cancel drops to the free tier WITHOUT a
  harsh revoke-to-zero or re-trial. Verify upgrade + cancel paths.
- **⚠️ PRESERVE EXISTING USERS:** current Pro/paying users unaffected. Existing free/expired users get the
  one-time 250 grant once (via the flag). Don't strand anyone or double-grant. Call out the migration plan.
- Make it reversible: gate the new behavior so it's clearly the one place the model is defined.

### 2. Retire / soften trial UI
- Remove or neutralize `TrialCountdownBanner` (no countdown — there's no clock).
- Convert `TrialEndScreen` from a hard lockout into a positive **"You're out of Creative Energy — upgrade
  to Creator Pro or top up $19 to keep creating"** nudge (or remove if unused after the model change).
- Keep `src/app/api/trial/expire/route.ts` / cron only if still meaningful; otherwise retire safely.

### 3. Remove the Agency Edition tier
- Delete the Agency tier from `page.tsx` PLANS and `pricing/page.tsx`; remove `AgencyWaitlistModal` usage.
- Leave just **Free + Creator Pro**. (The `"agency"` plan value can remain in types for safety, but no UI.)

### 4. Copy — match the Airo V4 framing (no "7 days", no "unlimited images")
- `HeroInteractive.tsx`: badge "✦ 7 days of everything — free, no card" → **"Create your brand free — no
  credit card"**; CTA "Start free — 7 days of everything" → **"Start Creating — Free"**.
- Landing `page.tsx` + `pricing/page.tsx`: rewrite to the V4 columns —
  **FREE ($0):** Generate your brand (names, story, voice, colors, logo direction); Try Goblin Studio free
  — real logos, social graphics & product art (Creative Energy included); Free Nix stickers & wallpapers;
  No credit card ever. Button "Start Creating — Free".
  **CREATOR PRO ($19/mo, Most Popular):** Unlimited brand generations; Full content engine (social, blogs,
  emails, ad copy); Monthly Creative Energy for Goblin Studio; Ongoing marketing ideas; Top up energy
  anytime. Button "Upgrade to Creator Pro".
- FAQ: replace "What happens after the free trial?" with the V4 "Is it really free? What's the catch?" Q&A.
- Remove ALL remaining "7 days / 7-day trial / days of everything" strings across the app.
- Do NOT claim "unlimited images" — Studio runs on Creative Energy.

### 5. Keep free
- Nix stickers + wallpapers stay ungated for all users.

## ACCEPTANCE / GUARDRAILS
- New free signup: no 7-day Pro trial; gets a one-time 250 Studio energy grant; can create brand kits +
  use Studio until energy runs out, then sees Upgrade/Top-up. No day-7 lockout anywhere.
- Existing Pro users unaffected; existing free users get the grant once; no double-grants.
- Agency tier gone from all UI; only Free + Pro shown.
- All "7 days" copy removed; no "unlimited images" claims; Nix goodies free.
- Energy reservation/refund + moderation reused; grant tunable via `FREE_STUDIO_STARTER_ENERGY`.
- tsc + `npm run build` clean. **Plan + diff summary first; HOLD for review before push.** Update
  `CLAUDE_HANDOFF.md`. After merge, TEST: new signup, free-out-of-energy upsell, Pro upgrade, Pro cancel→free.

## SHIP ORDER
1. This app conversion ships + verified live.
2. THEN publish the Airo V4 landing copy (`docs/GODADDY_LANDING_BRIEF_V4_FREEMIUM.md`) so site + app match.

*Created June 24, 2026. One coherent freemium switch — careful because it touches money.*

# BrandGoblin AI — Anti-Abuse & Real-User Brief
### Keep signup frictionless for real humans — close it to fakes, bots, and trial farmers.
> Build-ready spec. Additive only. Does NOT change Stripe/energy/refill logic.
> Some layers are config (Supabase/Cloudflare dashboards) — those are marked 🔧 and are YOURS to do.

---

## THE PROBLEM (verified)
Today you can sign up with a made-up address (`goosymickdoocy@hotmail.com`) and immediately get
free generations. Root cause: **email confirmation is OFF in Supabase Auth** — the system never
verifies the person owns the inbox. Combined with the upcoming **reverse trial (7 days full Pro)**,
this becomes a serious exposure: fake email → free Pro → repeat infinitely.

## THE GOAL
Real humans create for free with **near-zero friction**; fakes/bots/farmers are blocked.
The star move (Layer 2) actually *reduces* friction while *increasing* authenticity.

## CURRENT BLAST RADIUS (context — don't panic, but fix before scaling traffic)
A fake FREE account is capped at **3 brand generations** (the `credits` system) = a few cents of
Haiku. Bounded. The real risks are (a) **trial farming** for unlimited free Pro, and (b) **bots at
scale** running up the Anthropic bill / polluting data. Priority reflects that.

---

## LAYER 1 — Email verification (foundational) 🔧 + code
**🔧 Supabase:** Authentication → Providers → Email → enable **"Confirm email."**
Now a made-up address can't proceed — the confirmation link lands in an inbox the faker doesn't own.

**Code — preserve the "create free instantly" magic with a smart gate:**
- Let an unverified user still **experience the full brand reveal** (the "holy crap" — zero friction).
- Require a **verified email** before they can: **save** a brand, **continue building**, or **start
  the trial**. Gate the *value*, not the first taste.
- Add a friendly "Check your inbox to unlock saving & keep building" state with a resend button.
- Server-side: gate the save/continue/trial actions on `auth.user.email_confirmed_at != null`.

---

## LAYER 2 — "Sign in with Google" (the highest-leverage move) 🔧 + code
One-click, no password to invent → **lower friction than email/password**, AND it guarantees a
real, verified, hard-to-fake email. Improves conversion *and* authenticity simultaneously.
- **🔧 Supabase:** Authentication → Providers → enable **Google**; add OAuth credentials from
  Google Cloud Console (create OAuth client, set redirect to your Supabase callback URL).
- **Code:** add a "Continue with Google" button on `/login` and `/signup` (Supabase
  `signInWithOAuth({ provider: 'google' })`). Make it the **primary** path; email/password secondary.
- Google accounts skip Layer 1 verification (already verified by Google).

---

## LAYER 3 — Invisible bot protection (CAPTCHA) 🔧 + code
Stops automated account creation without annoying humans.
- Use **Cloudflare Turnstile** (free, privacy-friendly, usually invisible).
- **🔧 Supabase:** Authentication → Settings → enable CAPTCHA protection → choose Turnstile →
  paste the Turnstile site secret. **🔧 Cloudflare:** create a Turnstile widget (free) for your domain.
- **Code:** render the Turnstile widget on signup/login and pass the token to Supabase auth calls.

---

## LAYER 4 — Trial-farming guards (SHIP WITH PHASE 2 — non-negotiable)
The reverse trial is the biggest prize for abusers. Without these, one person mints infinite trials.
- **One trial per normalized email.** Normalize before the `has_used_trial` check: lowercase, and
  for Gmail strip dots and everything after `+` (`joe.smith+1@gmail.com` → `joesmith@gmail.com`).
  Store a `normalized_email` column; enforce **one trial per normalized email**, not per raw row.
- **Email must be verified to start a trial** (Layer 1 dependency).
- **Soft device/IP signal:** record a hashed IP / signup fingerprint on trial start; flag/deny when
  many trials originate from one IP in a short window. Keep it soft (flag, don't hard-block real
  shared networks like offices/universities).
- Keep the trial **card-free** — do NOT require a card (that kills the magic). Layers 1+3 + one-per-
  normalized-email is enough to stop casual farming.
- **Fold this section into `docs/PHASE2_REVERSE_TRIAL_BRIEF.md`** so trial + guards ship together.

---

## LAYER 5 — Rate limiting (defense regardless of identity) — code
- Cap **signups per IP** (e.g. N/hour) and **generations per account + per IP** per hour.
- Apply to `/api/generate`, `/api/generate/creator`, and auth endpoints.
- Implement with a lightweight store (Supabase table or Upstash Redis if available). Return a
  friendly Nix-styled "slow down a moment" message, not a raw 429.

---

## LAYER 6 — Disposable-email blocklist (cheap) — code
- On signup, reject known throwaway domains (mailinator, temp-mail, guerrillamail, etc.) with a
  small maintained blocklist. One check; stops the laziest abuse. Allow a friendly error.

---

## SEQUENCING
1. **Before driving real traffic:** Layers **1, 2, 3** (90% of protection, minimal friction).
2. **With Phase 2 trial:** Layer **4** (must ship together — fold into the Phase 2 brief).
3. **Anytime hardening:** Layers **5, 6**.

## SCHEMA (additive, idempotent)
```sql
alter table public.users add column if not exists normalized_email text;
alter table public.users add column if not exists signup_ip_hash   text;
-- backfill normalized_email for existing rows; index for the trial-farming check
create index if not exists users_normalized_email_idx on public.users (normalized_email);
```
RLS unchanged (service-role writes these). Never expose raw IPs — store a hash only.

## GUARDRAILS
- Additive only. Do NOT touch Stripe checkout/webhook/refill/energy math.
- Preserve frictionless first-taste: the brand reveal stays open to unverified users; only
  save/continue/trial require verification.
- Friendly, in-character errors everywhere (Nix voice) — never raw 400/429.
- Run `npx tsc --noEmit`; verify; commit as one phase:
  `"Anti-abuse: email verification + Google sign-in + Turnstile + trial guards + rate limits"`.

## WHAT YOU (FOX) DO — the 🔧 dashboard items
1. Supabase: enable **Confirm email**.
2. Supabase + Google Cloud: enable **Google** provider (+ OAuth credentials).
3. Cloudflare + Supabase: create **Turnstile** widget, enable CAPTCHA in Auth settings.
Claude Code does all the code; these three toggles are yours.

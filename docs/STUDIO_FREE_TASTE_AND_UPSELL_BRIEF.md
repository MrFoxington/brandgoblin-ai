# Build Brief — Free Studio Taste + Upsell (free→paid conversion)

### Let free users TASTE Goblin Studio (the "wow"), hit the wall, and convert — via Pro upgrade OR a $19
### energy top-up. The Studio is the best part of the app; free users should experience it. This is the
### REVENUE lever. ⚠️ Free generations cost real money (fal/Replicate) — the free grant is capped CAC spend.
> Touches the energy economy + upsell UI. Reuse existing reserve/refund + moderation. tsc + build clean.
> Commit; HOLD for review before push. Key files: `src/lib/energy-config.ts`, energy grant/balance logic,
> Studio entry components, brand dashboard / kit view.

---

## 1. SMALL, CAPPED FREE ENERGY GRANT
- Give each free user a **one-time** starter Studio energy grant. **Default 250** — enough for a few real
  creations to feel the magic, not enough to satisfy. MUST be a single tunable env/config constant
  (e.g. `FREE_STUDIO_STARTER_ENERGY=250`) so the number can be changed live without a code edit.
- **One-time per user** (not recurring) — set a flag when granted so it can't be farmed. New free signups
  get it; existing free users get it once on first Studio visit.
- Reuse the EXISTING `reserve_energy()` / refund-on-failure / moderation path — free users go through the
  same atomic reservation, just with a smaller balance. No new generation path.
- ⚠️ COST GUARDRAIL: this grant is a marketing expense. Confirm `grant × expected_free_users` is an
  affordable CAC before turning it on; keep it capped + one-time; never let free users top up the *grant*
  itself for free.

## 2. NIX "CREATE IN STUDIO" CTA (the entry hook)
- On the **brand dashboard / right after the kit reveal**, add a Nix pop: "Let's cook it up in the Studio!"
  with a glowing **orange CTA**. Highest-intent moment — they just got their brand, now "make it real."
- **Stage the CTA by energy state:**
  - Free user with grant remaining → "✨ Try Goblin Studio — free" (emphasize free).
  - Out of energy → switch to the upsell (below).
- Wording: lead with the free taste; don't show "upgrade" until they've felt the value.

## 3. DUAL MONETIZATION AT THE WALL
When a free user runs out of energy (or tries an action they can't afford), show an upsell with TWO paths:
- **Upgrade to Creator Pro** (subscription) — primary CTA.
- **Top up energy — $19** (one-time) — so even non-subscribers can pay and keep creating. Reuse the
  existing Stripe energy top-up prices/flow.
Frame it positively ("keep creating") with Nix, not a hard paywall.

## 4. ALWAYS-FREE NIX GOODIES
- Nix **stickers + wallpapers** stay 100% free/ungated for all users (goodwill + distribution). Confirm the
  Nix Zone is reachable by free users with no energy gate.

## ACCEPTANCE / GUARDRAILS
- Free users can enter the Studio and make 1–2 real creations from a one-time capped grant, then hit a
  positive upsell (Upgrade OR $19 top-up). Grant is one-time, tunable, and never free-refillable.
- Existing energy reservation/refund + moderation reused (no new generation path; no double-grant).
- Nix stickers/wallpapers remain free. No Stripe price/auth/trial logic changed beyond wiring the existing
  top-up into the wall.
- CTA wording staged by state (free taste first, upsell only after value felt).
- tsc + build clean; commit; HOLD for review. Update `CLAUDE_HANDOFF.md`.

## ⚠️ DECISIONS TO CONFIRM WITH FOX BEFORE BUILD
- Free grant size = **250** (set, tunable via `FREE_STUDIO_STARTER_ENERGY`); per-free-user cost ≈ $0.45 max
  (250 × $0.0018), only if fully spent — acceptable CAC.
- Whether existing free users get the one-time grant retroactively (recommend yes, once).

*The free taste is the conversion engine; the cost cap is what keeps it from becoming a money leak.*

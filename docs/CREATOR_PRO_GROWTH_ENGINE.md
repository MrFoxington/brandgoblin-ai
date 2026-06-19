# BrandGoblin AI — Creator Pro Growth Engine
### The plan to help 100,000 people build their dream — and reach $10k+/month, profitably.
> Strategy + build spec. Anchored to what's already shipped (energy system, Stripe, Supabase).
> Additive only — never breaks the payment/energy code already in production.

---

## 0. THE HONEST MATH (so this is a plan, not a wish)

$10,000 MRR at $19/mo = **~527 active paying subscribers.** That's it. That's the whole goal.

Three numbers decide whether you hit it. Everything in this doc moves one of them:

1. **Activation** — % of signups who reach the "holy crap" moment. Target **>60%**.
2. **Free → Paid conversion** — industry freemium is 2–5%. Target **4%**.
3. **Retention (M1 → M3)** — the silent killer. Target **>70% monthly** retention on Pro.

At 4% conversion, **527 payers needs ~13,000 active free users.** To reach your 100,000-creator
mission, even at 3% you'd have ~3,000 payers ≈ **$57k MRR**. So the mission *overshoots* the
revenue goal — which means **the constraint is never your costs. It's acquisition + conversion +
retention.** Build only things that move those three.

**Cost reality (your margins are not the problem):** a full brand kit on Haiku is a few cents of
tokens; the energy system already caps abuse. Gross margin on a $19 sub is ~95%+. You can afford
to be generous in the free "wow" and still print money. Spend the generosity where it converts.

---

## 1. THE REPOSITION THAT FIXES EVERYTHING

**The trap (from the old prompts):** selling a *daily* subscription to *idea-stage* people who
mostly use it once. That mismatch = brutal churn.

**The fix — sell the LAUNCH, then the MOMENTUM.** People at the idea stage don't need "daily
content forever." They need to get *unstuck and live* in their first 90 days. Position Creator Pro
as **"Your launch partner for the first 90 days — and your momentum engine after."** Now the
subscription maps to a real need with a real beginning.

Then capture BOTH kinds of buyer with a 3-rung value ladder (don't force monthly on a one-timer):

| Rung | Offer | Price | For |
|---|---|---|---|
| **Free** | 1 stunning brand reveal, watermarked share card, library read-only | $0 | The hook. "Your brand is alive ✨" |
| **Creator Pro** | The launch partner — unlimited* building, daily/weekly momentum, full library | **$19/mo or $190/yr** | The dreamer who's *acting* |
| **Launch Kit** | One-time: brand + 30-day content pack + assets, exported | **$49 one-time** | The one-timer who won't subscribe (capture them anyway) |

\*"Unlimited" = generous Creative Energy (already built). Keep the metered system; just make the
Pro allowance feel limitless for normal use. Never advertise literal "unlimited" — it collides
with your energy engine and invites abuse.

**Why this wins:** the one-time **Launch Kit converts the 80% who'd never sub** (found money,
near-zero extra cost), while Pro + annual captures the actors. Annual upfront crushes churn and
funds acquisition.

---

## 2. THE CONVERSION ENGINE (today's best practices, applied)

### a) Reverse trial — the single highest-leverage change
On signup, give every user a **7-day full Pro experience automatically** (no card), then drop to
Free. They taste the partner, feel the loss, and convert to keep it. Reverse trials routinely beat
plain freemium conversion by 2–3×. The "don't want to lose my creative partner" feeling the old
prompt wanted — *this* is how you actually manufacture it.

### b) The paywall lands at peak emotion, never cold
Free users get the **entire** brand reveal (the "holy crap"). The upgrade ask appears the instant
they reach for "build more" — while glowing: *"Nix is just getting started. Keep building together →"*
Map every upgrade prompt to an emotional high or a natural limit. Kill all cold pricing-page bounces.

### c) Annual-first pricing page
Show **annual as the default toggle** ("$190/yr — 2 months free"), monthly secondary. Anchor with
the $49 Launch Kit beside it so $19/mo reads as the obvious deal. Add a faint, *true* "Founding
Creator" badge for early subscribers (real, time-boxed, honest scarcity — not fake countdowns).

### d) Recover involuntary churn (free money most founders ignore)
20–40% of SaaS churn is *failed payments*, not real cancels. Turn on **Stripe Smart Retries +
dunning emails** and a card-update flow. This is a config + one webhook handler on top of code you
already have — likely +5–10% MRR for a day's work. **Highest ROI line item in this whole doc.**

### e) Save-the-cancel flow
On cancel: Nix appears ("Before you go — your brand library stays forever"). Offer a one-click
**pause** (skip a month) or a **downgrade to a cheaper "keep my library" tier ($5/mo)** instead of
losing them entirely. Recovers a meaningful slice of churn.

### f) Honest urgency only
Founding-member pricing with a *real* end date, real "X spots left," real seasonal launches.
Never fake timers. Trust is your moat; one cheap trick and the partnership illusion dies.

---

## 3. ACTIVATION — engineer the "holy crap" fast

You can't convert someone who never felt the magic. Optimize **time-to-wow**:
- **Zero-friction first generation:** ask the *minimum* to produce a stunning kit. Every extra
  field before the reveal bleeds activation.
- **Onboarding = the reveal**, not a tour. The product sells itself in the first 90 seconds (see
  `MAGIC_EXPERIENCE_BRIEF.md`).
- **First-session goal:** every new user must hit one finished brand + one shared/saved artifact.
  Instrument it. If activation < 60%, fix the front door before anything else.

---

## 4. RETENTION — momentum, not a content firehose

Daily "generate 10 posts" is overwhelm, not value. Replace it with **outcome-driven momentum**:

- **The 90-Day Launch Plan:** on upgrade, Nix lays out a personalized week-by-week plan (name →
  socials → first email → launch post → first offer). Each return has an obvious *next step*. This
  is the real reason they open the app in week 4.
- **Weekly focus, not daily firehose:** "This week: nail your launch email." One meaningful goal
  beats ten unused outputs.
- **Streaks tied to action**, computed from existing `generation_usage_logs` timestamps (no new
  tables). Gentle, never guilt-trippy.
- **Energy as the heartbeat:** the monthly refresh is a built-in reason to return — surface its
  reset as a small event.
- **Lifecycle email** (cheap, automated): Day 0 welcome, Day 3 "here's your next step," trial-end,
  win-back, monthly "look what you built." Email is your #1 retention/reactivation channel and
  costs almost nothing.

---

## 5. LOW-COST ACQUISITION — the loops that make 100k reachable

Paid ads are not how a bootstrapper hits 100k. **Build loops that grow themselves:**

1. **The Share Card (viral):** every reveal produces a gorgeous, screenshot-ready brand card with
   a subtle "Made with BrandGoblin" + link. Free users' cards are watermarked. Every share is a
   free ad at the user's proudest moment. (Spec'd in the Magic brief.)
2. **Public brand pages (programmatic SEO):** opt-in, a shareable public page per brand
   (`/brand/[slug]`) — beautiful, indexable, "Make yours free." Thousands of brands = thousands of
   long-tail landing pages pulling organic traffic at $0 CAC.
3. **Referral = gift energy:** "Give a friend a free brand kit, get bonus energy." Two-sided,
   on-brand, cheap. Ties to the energy system you already have.
4. **Creator showcase / wall of brands:** social proof + SEO + community. Real brands replace the
   placeholder testimonials (which you still need to kill before launch).

---

## 6. THE PRODUCT MOAT — 10 great workflows, not 60 shallow ones

ChatGPT does 60 generic things. You win on **brand-aware, finished, editable** outputs. Ship a
**curated 10** that are excellent and *remember the brand* (via `brand-context.ts` in
`COFOUNDER_LITE_BRIEF.md`):

Instagram set · Launch email · Sales/landing copy · Blog article (SEO) · Ad set · Brand bio/about ·
Content calendar (week) · Product/offer descriptions · Hashtag+caption packs · "Next step" coach.

Each must: pull the user's saved voice/colors/audience automatically, be **editable in-app**, and
be **one-click exportable/copyable**. Quality + memory is the only durable edge. Add workflows only
when one is *demonstrably* excellent — never for the grid.

---

## 7. NIX'S VOICE — partnership through honesty (the real differentiator)

Calibrated, specific, occasionally honest — never a sycophant. A partner who praises *everything*
is worth nothing. Nix has favorites with reasons, and will gently flag a weaker option. Excitement
stays, but anchored in real craft ("the short vowels make this name stick"), never empty hype or
unverifiable claims. This honesty is *why* people trust the partnership enough to pay for it.

**Ethical guardrail:** the "dream bigger" excitement must include a thread of constructive realism.
We help people *act*, we don't sell false hope to vulnerable dreamers. That's both right and
better business (disappointment = refunds + chargebacks).

---

## 8. COST CONTROL (keep margins fat at scale)

- **Haiku by default** for content; reserve Sonnet for the flagship brand reveal only.
- **Energy caps** already gate abuse — keep them.
- **Cache** brand context per session; don't re-fetch per generation.
- **Cap generation size** and rate-limit per user.
- **Model-route by value:** cheap tasks → cheap model. Margin stays ~95%.

---

## 9. THE 5 METRICS (your whole dashboard)

Track only what predicts the goal: **Activation %**, **Free→Paid %**, **M3 retention %**,
**MRR**, **CAC payback** (≈ $0 if loops work). Build a tiny admin view; instrument the funnel.
Vibes don't scale — these do.

---

## 10. SEQUENCED ROLLOUT (no collisions, fastest ROI first)

Do these *after* Claude Code finishes the current Magic build and commits. One phase at a time,
commit between each.

1. **Dunning + Smart Retries + save-the-cancel** — fastest MRR, pure additive to your Stripe code.
2. **Reverse trial** (7-day auto Pro) — biggest conversion lift. Uses existing plan/energy fields.
3. **Annual plan + $49 Launch Kit** — new Stripe prices, ladder live. (Reuse hardened checkout.)
4. **Share card + public brand pages + referral** — the acquisition loops.
5. **90-Day Launch Plan + lifecycle emails** — retention engine.
6. **Brand-aware 10 workflows** (from Cofounder Lite brief) — the moat.

Each phase is small, additive, and measurable. **Phase 1 alone likely pays for the others.**

---

## EXPLICITLY DROPPED (the traps from the old prompt)
- ❌ "Unlimited" as a literal promise (collides with energy engine; invites abuse).
- ❌ 60-workflow feature grid (shallow; loses to ChatGPT on its own turf).
- ❌ Free-form "Creator OS" chat with full memory (months-long v3; schema-dangerous now).
- ❌ Always-on flattery from Nix (kills trust).
- ❌ Selling hope to people not taking action (ethical + churn/refund risk).

## THE NORTH STAR
Turn **"I have an idea"** into **"Holy crap… I can actually do this"** — for 100,000 real people —
by being the partner that gets them *launched and moving*, priced so the ones who act stay, and the
ones who don't still get value. Margins are already great. Win on activation, conversion, retention.

# Goblin Studio — Build Brief

### One studio inside BrandGoblin where users CREATE the real assets (images + video) from the brand
### kit Nix already gave them — never leaving the app, never a third-party subscription, and never a
### cent of AI cost landing on us. Users pay for generation through Creative Energy; we profit on top.

> Build spec for Claude Code. Anchored to what's already shipped: the Creative Energy system
> (`src/lib/energy.ts`, `energy-config.ts`), the brand-kit generate flow (`api/generate/route.ts`),
> the 7-day reverse trial, Stripe refills, and Nix PNG animation. **Additive only** — do not touch
> Stripe / energy-grant / trial logic except to add atomic reservation (spec'd below).
> RULE: animate existing Nix PNGs only — never generate Nix art. Use Next.js `<Image>`.

---

## 0. STRATEGIC NORTH STAR (read first)

BrandGoblin already gives users a **logo direction**, **social copy**, **color palette**, and a
**launch plan** — as words. Then they have to leave to make any of it real. Goblin Studio closes that
gap: it turns the words into actual **images and short-form video**, all branded automatically
because Studio already knows their kit. That's not a new product line — **it's the depth of the core
loop.** ChatGPT can't do this (no brand memory, no native short-form video, you do the prompting).
Our moat is NOT "we have image gen too" — anyone resells the same models. Our moat is **brand memory
+ zero prompts + Nix being more fun than a chat box.** Lean the entire Studio pitch there.

**Positioning guardrail:** We just deleted the "suite of six Goblin products" from the marketing
site on purpose. Do NOT re-publish a suite story. Studio is **magic users discover inside Creator
Pro**, not a separately advertised SKU. Public pitch stays singular.

**✅ POSITIONING DECISION (LOCKED, June 20):** **Text content stays effectively unlimited** — it's
cheap, and "unlimited content" is a promise we keep. **Media generation (images + video) is sold as
"⚡ Creative Energy powers your images and videos" — a fun resource, NEVER a "limit" or a paywall.**
Two clearly separate worlds in the user's mind. Energy is the playful fuel of the magic, not a cap.
Never use limit/quota language for media; always frame as powering creation.

---

## 1. ⛔ PREREQUISITE — supply + legal (settle BEFORE writing Studio code)

**✅ DECIDED (June 20, 2026): multi-provider, NOT Higgsfield-only.** Higgsfield is itself largely a
reseller/UX layer wrapping the same open models (Kling, Veo, Wan, Flux) — buying its credits means
paying a middleman markup on supply we can hit directly cheaper. Single-sourcing it also bets the
whole product on one vendor's ToS/uptime/pricing. So:

- **Primary: fal.ai.** Pure pay-as-you-go (no monthly seat, no minimum) → cost scales exactly with
  usage, ideal for "user pays per generation." ~30–50% cheaper than Replicate on video, 600+ models,
  clean per-image / per-second USD pricing. Built for commercial app use.
- **Fallback: Replicate.** Free tier, strong on images, gives redundancy if fal drops a model/outages.
- **Optional premium: Higgsfield**, kept in back pocket ONLY for specific viral-effect presets if
  users demand those exact looks and the markup is worth it. Not the backbone.

Build a thin **provider-abstraction layer** and route each job to the cheapest *compliant* model.

**Legal findings & action items:**
- Commercial license is **per-model** (e.g. some Flux endpoints have license nuances; free tiers
  often lack commercial rights). The abstraction layer must **only enable models whose commercial
  terms we've verified** — same discipline as "only enable mapped-cost models."
- fal/Replicate are pay-as-you-go with no resale-blocking seat requirement, but confirm per-model
  commercial + redistribution terms before enabling each one.
- Decide training-data opt-out per provider (we likely want customer assets opted out).
- If we ever wire Higgsfield for premium effects: its API/resale rights live only on its top
  (Studio/Business) tier — the consumer Pro plan can't be resold or scaled.

---

## 2. 💰 THE COST MODEL (the heart of this brief)

**Principle: every generation is paid for by the user's energy, at a markup, so cost is never on us.**

### Real backend costs (verified June 20, 2026)
With fal.ai / Replicate we pay **real USD per image / per second of video** — even cleaner than
Higgsfield's credit abstraction. Reference rates:

| Generation | Provider cost (fal.ai class) |
|---|---|
| Image (Flux / Seedream class) | ~$0.025–0.05 |
| Cheap video (Wan 2.6, ~5s @ $0.05/s) | ~$0.25 |
| Mid video (Kling 3.0, ~5s @ $0.10/s) | ~$0.50 |
| Premium video (Veo class, ~5s) | ~$1.50–3.75 |

### The conversion rule
**Peg energy directly to USD cost, then mark it up.** 1 refill energy nets us **~$0.018** (refill is
$19/1,000, after Stripe ~2.9%+$0.30). So:

> `energy_charged = ceil( (provider_USD_cost / 0.018) × MARKUP_MULTIPLIER )`

Default **MARKUP = 10** (locked). Never enable a model whose cost isn't mapped — an unmapped model is
an uncovered cost hole. Worked out at 10×:

| Generation | Our cost | Energy charged | We collect | Profit |
|---|---|---|---|---|
| Image | $0.03 | ~20 | $0.36 | ~$0.33 |
| Cheap video (5s) | $0.25 | ~140 | $2.52 | ~$2.27 |
| Mid video (5s) | $0.50 | ~280 | $5.04 | ~$4.54 |
| Premium video (5s) | $2.50 | ~1,390 | $25 | ~$22.50 |

Profit is consistently **multiples of cost on every generation** — the markup is applied to the true
USD cost, so we can never lose money on a mapped model regardless of which provider/model runs it.
(Note: premium video gets expensive in energy — gate it as a deliberate "premium" choice and show the
cost up front. Default the UI to cheap/mid models.) MARKUP can be dialed to 12–15 for fatter margin;
never below ~8. The legacy "Higgsfield credit ×10" framing still applies if we ever route through
Higgsfield — just substitute its credit cost for the USD cost.

### Implementation
- Replace the flat Studio stubs in `energy-config.ts`
  (`image_generation:150`, `video_generation:500`, etc.) with a **model→credits map** + a single
  `MARKUP_MULTIPLIER`, and compute energy at runtime: `energy = credits[model] * MARKUP`.
- Add an env-tunable `ENERGY_MARKUP_MULTIPLIER` (default 10) and `HIGGSFIELD_CREDIT_USD` (for margin
  dashboards), so pricing can be tuned without code changes (same pattern as existing energy envs).
- Keep the existing cheap text costs (10–100) untouched — text stays effectively unlimited.

### Refill packs (raise AOV — stop leaving money on the table)
Replace the single $19 SKU with three Stripe one-time prices, same per-energy economics:
- **$19 → 1,000 energy** (Starter top-up)
- **$49 → 3,000 energy** ("Best value" — anchor/badge it)
- **$99 → 7,000 energy** (Creator pack — for whales)
Each pack must clear Higgsfield cost + Stripe + margin at the chosen markup (they do at 10×).

### The two cost leaks — plug both
1. **Monthly Pro grant (1,000 energy, free):** at 10× that's 100 credits ≈ **$3.30–$7.50 of our cost
   per Pro user/month** — fine and profitable on a $19 sub, and it's the retention engine, so let it
   flow on media. Keep it.
2. **7-day TRIAL grant is unpaid → media on it is pure bleed + the #1 abuse vector.** ✅ DECIDED:
   trial users get **text freely + exactly ONE subsidized image concept** (the cheap hook). **NO
   trial video at all** — instead they get the video *idea/script/prompt* from Nix, plus a CTA:
   **Nix: "Want me to bring that to life in the Studio? ⚡ Unlock Creator Pro and I'll build it for
   you →"**. So we give away the spark (idea + the one image + the video concept) and gate the actual
   render behind Creator Pro. Track the one freebie per normalized email + IP (reuse anti-farm layer).

---

## 3. 🏗️ BACKEND ARCHITECTURE (media ≠ text — build it right)

Text gen is synchronous streaming. Media (esp. video) is **async, seconds-to-minutes**. Studio needs
a **job-queue pattern**, not the streaming route. New routes under `/api/studio/*` (additive).

### Atomic energy reservation (THE must-fix)
Today `deductEnergy` is read-modify-write and runs AFTER success. For 500-energy async jobs that's
the exact cost-runup risk: fire 5 video jobs at once, all pass the check against the same balance, we
eat the overspend. Fix:
1. **Reserve up front, atomically.** A Postgres function (or `... SET remaining = remaining - cost
   WHERE remaining >= cost RETURNING` row-lock) that decrements only if the balance covers it. No
   reservation → no job. This also retires the "deductEnergy not atomic" debt in the handoff.
2. **Create the Higgsfield job only after reservation succeeds.**
3. **On success:** finalize (reservation becomes a `usage` ledger row), store the asset.
4. **On failure / timeout / moderation block:** `refundEnergy` the full reservation (logic already
   exists) and surface a friendly Nix "that one fizzled — your energy's back" message.
5. Respect each provider's **concurrent-job / rate limits** with our own per-user concurrency guard
   so we don't 429, and so one user can't monopolize the queue.

### Storage, moderation, history
- Store outputs in **Supabase Storage** (or S3); never hot-link Higgsfield URLs (they expire).
- Run generated media through a **moderation pass** before showing/storing (provider moderation +
  our own block list). We're liable for what we host.
- Save every generation to a Studio history table tied to the brand kit, so assets live in the
  user's library and feed the "create more" loop.

---

## 4. FEATURE A — Goblin Studio creation surface

New page `/dashboard/studio` (Pro-gated, energy-metered). Everything pre-loaded with the user's
chosen brand kit so output is on-brand with zero prompt-writing.

### Phase 1 — Images (ship first: high value, low cost, low risk)
- **Logo concepts** from the existing `logoPrompt` direction. ⚠️ Scope honestly: diffusion models do
  mascot/emblem/icon art well and **clean text wordmarks badly.** Frame as "logo concepts / icon
  marks," keep the written direction, offer variations + background removal (Higgsfield
  `remove_background`). Add a real vector/text-safe path later. Do NOT promise "finished vector logo."
- **Social graphics** — branded post images in the kit's palette, per platform size.
- **Product / hero / mascot art** — branded imagery for site + posts.
- Tools available from the provider to wire in: variations, upscale/hi-res, background removal,
  outpaint/uncrop. Each maps to its own credit→energy cost.

### Phase 2 — Short-form video (the differentiator; higher cost + complexity)
- **TikTok / Reels / YouTube Shorts sections**, format-native: 9:16, hook-first, trend templates,
  on-brand captions/voice pulled from the kit. Use provider reframe to retarget aspect ratios.
- This is where we genuinely beat ChatGPT (no native short-form video there). But it's the expensive,
  async-heavy path — gate it cleanly behind energy + the reservation flow.

### "Deploy" — scope it down for v1
v1 "deploy" = **export/download in the right format + aspect ratio.** One-click publishing to
TikTok/IG/YouTube needs their publishing APIs + OAuth + app review (TikTok especially is a slog) —
**defer to a later phase.** The TikTok/Reels/Shorts sections are about *creating* native content now,
publishing later.

---

## 5. FEATURE B — Bring your own logo / website

Lives in the **generate flow** as new **optional** inputs (so the existing path is untouched). Two
modes, both high-conversion — they kill the "I already have a brand" objection and open the existing-
business market (people with money + recurring content needs).

### Mode 1 — Style reference ("I love this look, make me something original like it")
- Input: an image (or reference brand). Use vision to extract **abstract attributes** — palette,
  mood, typographic feel, energy — and feed them to Claude as creative direction to generate
  something **new and original.**
- ⚠️ **IP/trademark guardrail:** NEVER reproduce or near-clone the reference. Frame as "inspired by
  the vibe." Extract abstract style only. Add a short ToS line that users must have rights to what
  they upload.

### Mode 2 — Existing brand ("here's my site/logo, build around what I already have")
- Input: a logo image and/or a **website URL**. Read the brand: name, colors, voice, offerings →
  Claude generates content **consistent with their existing identity** (the bigger retention /
  expansion-revenue unlock).
- ⚠️ **Reliability:** server-side fetch + readability parse is easy for simple sites; JS-heavy sites
  need rendering; expect 404s, paywalls, huge pages. Build graceful failure, size limits, respect
  robots/ToS. Charge a small energy cost (vision/scrape call). Low-res logo in → weak palette out;
  show a confirm-and-tweak step.
- Image input → Claude vision can read it directly; palette extraction from the logo.

---

## 6. 🎮 UX / DOPAMINE / CONVERSION (make it addictive, not a paywall)

- **The reveal is the hit.** Asset materializes with Nix reacting + sparkle (reuse the sound system +
  `RefillCelebration` pattern). Generation feels like *conjuring*, not "loading." Use Nix poses for
  progress like the text flow already does.
- **The reroll loop = fun AND revenue.** "Make 3 more / try another style" is the addictive engine,
  and each costs energy — fun and monetization perfectly aligned.
- **Show cost before generating**, framed as worth-it: "Conjure this video — 220 energy." Gamers
  accept a price when the value is visible.
- **Never hard-block mid-creation.** Catch them at peak desire with a graceful "top up to finish
  this" moment (the highest-converting instant in the app). Reuse `RefillCelebration` on return.
- **First Studio hit is a guaranteed wow** — slightly subsidized, capped to one (trial leak control).
- **Energy as a fun resource, never a "limit."** Copy: "Creative Energy powers your images and
  videos." Keep text "unlimited." Two clearly separate worlds so energy never reads as a wall.
- **Daily return:** tie a small daily energy trickle or a free daily Studio idea to the existing
  streak/daily-Nix system so people come back to build more.
- **The trial→Pro conversion trigger (highest-leverage moment):** when a trial/free user gets a video
  *idea* from Nix, Nix offers to make it real — **"Want me to bring that to life in the Studio? ⚡
  Unlock Creator Pro and I'll build it for you →"**. We hand them the spark (idea + one image +
  the concept) at peak excitement, then the render is the reason to subscribe. This is the single
  most important upsell surface — make it feel like Nix is dying to build it *with* them.

---

## 7. BUILD ORDER (phased; ship fun fast, never break the build)

0. **Prereqs:** set up **fal.ai** (primary) + **Replicate** (fallback) API accounts; verify per-model
   commercial terms; build the provider-abstraction layer; map each enabled model's USD cost.
1. **Atomic energy reservation** + USD-cost×markup pricing in `energy-config.ts`. (Foundation —
   ship before any media goes live.)
2. **Tiered refill packs** ($19/$49/$99) in Stripe + UI.
3. **Phase-1 images** (logo concepts, social graphics) via the job-queue + reservation flow.
4. **Bring-your-own-brand input** (logo image + website URL) in the generate flow — parallel to #3.
5. **Trial flow:** one free image concept + video-idea-with-Nix-CTA ("unlock Studio with Creator
   Pro"), wired to the anti-farm layer.
6. **Phase-2 short-form video** (TikTok/Reels/Shorts).
7. Later: vector/text-safe logos; one-click social publishing; optional Higgsfield premium effects.

---

## 8. ACCEPTANCE / GUARDRAILS

- Cost is **never** on us: energy reserved atomically up front; energy charged = credits × markup
  (≥8); only mapped models enabled; failed jobs refund.
- Trial users cannot drain media energy (one subsidized freebie max).
- "Unlimited" applies to text only; media is energy-metered and framed as a feature.
- Studio is Pro-gated and additive — **Stripe / energy-grant / trial / existing generate flow
  untouched** except the new atomic-reservation path.
- IP guardrails on style-reference; moderation on all generated media; we host nothing unmoderated.
- Nix animated from existing PNGs only, never regenerated. Next.js `<Image>` everywhere.
- `npx tsc --noEmit` + `npm run build` pass. Commit per phase; don't push until reviewed.
- Update `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md` after each phase.

## 9. DECISIONS — ✅ ALL LOCKED (June 20, 2026)
- **MARKUP multiplier = 10** (locked). Dialable to 12–15 later; never below 8.
- **Refill packs = $19/1,000 · $49/3,000 (badge "Best value") · $99/7,000** (locked).
- **Trial freebie = ONE image concept, NO video.** Trial users get video *ideas/scripts/prompts* +
  a Nix CTA ("Want me to bring that to life in the Studio? Unlock Creator Pro →"). Render gated behind
  Pro. (locked)
- **Providers = fal.ai primary · Replicate fallback · Higgsfield optional-premium** via a provider-
  abstraction layer; cheapest compliant model per job; energy pegged to real USD cost × markup.
  (locked)
- **Positioning = text unlimited; media = "Creative Energy powers your images & videos," never a
  limit.** (locked)

*Created June 20, 2026; decisions locked same day. Supersedes the one-line Goblin Studio entry in
PRODUCT_ROADMAP.md. Provider strategy: fal.ai primary / Replicate fallback / Higgsfield optional.
Backend cost figures verified against fal.ai + Higgsfield public pricing June 20, 2026 — re-confirm
each enabled model's live USD cost + commercial terms before launch.*

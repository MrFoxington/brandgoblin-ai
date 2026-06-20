# BrandGoblin AI — Claude Handoff Document
> Paste this entire file into a new Claude chat to resume exactly where we left off.

---

## 1. WHO YOU ARE IN THIS PROJECT

You are Claude Code, acting as lead developer + asset manager for **BrandGoblin AI** — a Next.js 14 SaaS that generates complete brand kits using AI. You have been working on this project across multiple sessions. This document is the complete state of everything.

---

## 2. THE PROJECT

**BrandGoblin AI** — "Everyone Has An Idea. BrandGoblin Helps Bring It To Life."

- **URL (live):** Deployed on Vercel via GitHub auto-deploy
- **Repo:** `github.com/MrFoxington/brandgoblin-ai`
- **Local path:** `/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai`
- **Mascot:** Nix — a green-skinned, purple-haired goblin in a purple "NIX" hoodie with gold trim. He is the heart and soul of the brand.

### Tech Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Checkout + Webhooks |
| AI | Anthropic Claude (claude-haiku-4-5) |
| Hosting | Vercel (auto-deploy from GitHub main) |
| Styling | Tailwind CSS |

---

## ✅ HONEST STATUS (updated June 20, 2026) — READ FIRST

**REVENUE-CAPABLE AND WORKING END-TO-END IN LIVE MODE.** Real purchases, energy refills, the
monthly Pro energy grant, dunning, and the customer portal all verified working with the live
webhook actually firing. App lives at **`https://app.brandgoblinai.com`** (root `brandgoblinai.com`
is the landing page). Email verification + Resend transactional email are live.

**The constraint is DISTRIBUTION, not product.** The app is built, magical, charges money, and is
protected against abuse. What's missing is real users → acquisition → conversion → retention.
See `docs/CREATOR_PRO_GROWTH_ENGINE.md`.

### 🎨 GOBLIN STUDIO — Phase 1 BUILT (June 20, 2026) — NOT YET PUSHED
Phase 1 code complete, `tsc + npm run build` both clean. **Do NOT push until reviewed.**
- **New routes:** `/dashboard/studio` (paid Pro only), `/api/studio/jobs`, `/api/studio/jobs/[jobId]`,
  `/api/studio/webhook/fal`, `/api/studio/sweep`
- **New libs:** `src/lib/studio/models.ts`, `provider.ts`, `jobs.ts`
- **Modified:** `energy-config.ts` (STUDIO_MODELS registry + computeStudioEnergyCost),
  `energy.ts` (reserveEnergy + finalizeReservation + addRefillEnergy amount param),
  `api/stripe/checkout` (3-pack support + packKey→priceId mapping),
  `api/stripe/webhook` (metadata-driven energy amount), `EnergyRefillModal` (3-pack UI)
- **DB migration to run:** `supabase/migrations/20260620_studio_phase1.sql` — creates `studio_jobs`
  table + `reserve_energy()` Postgres function (the atomic-reservation fix)
- **Key guardrails shipped:**
  - Trial gate: `plan !== "pro"` in both the page AND the API — trial users see upgrade prompt
  - Atomic reservation: Postgres `reserve_energy()` FOR UPDATE lock; no reservation → no job
  - Energy never lost: fal webhook is primary completion driver; client polls as backup; stale
    sweeper refunds jobs stuck > 10 min (runs on page load + `/api/studio/sweep`)
  - Moderation: fal's built-in `enable_safety_checker` + `has_nsfw_concepts[]` — blocked jobs
    get full energy refund
  - History: URLs always re-signed from `storage_path` on read, never served stale
  - Per-user concurrency cap: 2 concurrent jobs max
  - All energy labels computed from `computeStudioEnergyCost()` — never hardcoded
- **Model registry (exact fal endpoints, verified June 20):**
  - `fal-ai/flux/schnell` — $0.003/MP, default image ✓
  - `fal-ai/flux-pro/v1.1` — $0.04/MP, premium ✓ (`fal-ai/flux-pro` is deprecated)
  - `fal-ai/bytedance/seedream/v4.5/text-to-image` — $0.03 flat, artistic ✓
  - `fal-ai/imageutils/rembg` — ~$0.01 flat, bg removal (Phase 1 UI stub)
  - `fal-ai/clarity-upscaler` — $0.03/MP input, upscale (Phase 1 UI stub)
  - Video models mapped but NOT built: Wan 2.6, Kling 3.0 (Phase 2)
- **Before flipping live:** run `supabase/migrations/20260620_studio_phase1.sql` in Supabase SQL
  editor; re-verify fal.ai prices on each model page; verify Seedream + rembg + clarity-upscaler
  costs; FLUX dev is NON-commercial (excluded; schnell is Apache-2.0 ✓)
- **Cost model (locked):** `energy = ceil(usdCost × MARKUP / 0.018)`, MARKUP=10 env-tunable,
  pricing is per-megapixel (not flat) — margin correct at any resolution

### 🔥 BIG FIXES SHIPPED June 19 (all pushed + live)
- **Reverse trial + anti-farming** (Phase 2 + Layer 4): 7-day auto-Pro, `getEffectivePlan()`
  gating everywhere, one-trial-per-normalized-email, IP cap, email-verification gate.
- **Email verification**: `/auth/confirm` route, Supabase "Confirm email" ON, Site URL =
  `https://app.brandgoblinai.com`, Google sign-in + Turnstile (in progress/optional).
- **Resend email**: domain verified at GoDaddy (DKIM/SPF on `send.` subdomain), Supabase custom
  SMTP → `smtp.resend.com`. Google Workspace = human inbox (support@brandgoblinai.com).
- **Dashboard crash fix** (`3d883a6`): energy/balance API now returns full shape for
  uninitialized Pro users; guarded `.toLocaleString()`.
- **🚨 LIVE WEBHOOK SECRET FIX (the big one):** `STRIPE_WEBHOOK_SECRET` in Vercel had a
  TEST-mode secret → every live webhook failed signature (400) → no energy/dunning ran. Set it to
  the live endpoint's secret + subscribed the endpoint to all 5 events + deleted a bogus
  placeholder endpoint. Now firing. See `docs/STRIPE_LIVE_CONFIG.md`.
- **Energy refill price**: created live one-time $19 price → `STRIPE_PRICE_ID_ENERGY_REFILL` in Vercel.
- **False low-energy warning fix** (`4fc8bc6`): dashboard showed "Less than 25% remaining" for
  everyone because it checked `!== "ok"` but the API returns `null` when healthy. Now guarded.
- **🎉 APP LANDING PAGE REBUILT** (`32b406b`): emotional reframe ("Watch your idea become real"),
  **interactive hero** with a real rate-limited `/api/teaser` endpoint (3/IP/hr, never returns the
  full kit), **fabricated social proof REMOVED** (now honest founder note + "be one of the first"),
  7-day-trial messaging everywhere, idea-spark section, animated Nix (`NixFloat`). New components:
  `HeroInteractive`, `IdeaSparkSection`, `NixFloat`; `TestimonialsSection` made honest.
  Spec: `docs/LANDING_REBUILD_BRIEF.md` (essentially fully implemented — do NOT rebuild).
- **⚡ ENERGY REFILL CELEBRATION** (`c9dd549`, committed + PUSHED ✅):
  replaced the small auto-dismiss `RefillSuccessBanner` with `RefillCelebration.tsx`, a full
  celebration overlay on `/dashboard/creator-pro?refill=success`. Fetches `GET /api/energy/balance`
  on mount (fresh total, no stale props), animates the energy bar filling from pre-refill level up
  to the new total with a Framer Motion sparkle burst + floating celebrating Nix
  (`/nix/celebrating-nix.png`), headline "⚡ You're brimming with Creative Energy!" + capacity line
  via `getCapacityEstimates`, "✦ Let's build →" CTA scrolls to `#content-generator`, plays the
  fanfare via `useSoundFx().playLevelUp` (respects global mute), respects `prefers-reduced-motion`
  (final bar instantly, no anim), and strips `?refill=success` via `router.replace`. Modal is an
  `absolute inset-0` overlay inside a now-`relative` `<main>` (NOT position:fixed). `tsc` + `npm run
  build` both clean. NOT yet driven end-to-end in a browser — auth-gated route, needs a real Pro
  login to confirm the live animation/sound/scroll.

### 🌅 START HERE (next priorities, in order)
1. **Review + push Goblin Studio Phase 1** — code is built and build-verified. Review the changes
   then push. Before Studio goes live to users: run the DB migration in Supabase SQL editor
   (`supabase/migrations/20260620_studio_phase1.sql`), re-verify fal model prices, confirm each
   model's commercial license on its fal model page.
2. **Verify the refill celebration live** — `c9dd549` is pushed + deployed. Log in as a Pro user
   and hit `/dashboard/creator-pro?refill=success` to confirm the overlay, bar fill, sound, and
   scroll-to-generator all work in production (was build-verified only, never driven live).
3. **GoDaddy marketing site sync** — ⚠️ AUDITED June 20: Airo's first pass **did NOT take**. Live
   `brandgoblinai.com` still shows the old page — pricing still "$0 / one complete brand generation"
   (no 7-day trial), "Demo Video Coming Soon" still there, "Logo Prompt Creator" still naming
   Midjourney/DALL-E, full "Where Future Magic Is Forged" six-product grid still there, CTAs point
   to app root not `/signup`, hero headline not synced to "Watch your idea become real." Honest-proof
   guardrail DID hold (no fake stats/testimonials). **Corrected paste-in issued:**
   `docs/GODADDY_LANDING_ARROW_AI_BRIEF_V2.md` — supersedes v1. V2 adds strategic DELETIONS per
   Fox's call (June 20): remove the "See what BrandGoblin conjures" canned-examples section
   (redundant with Mana Brew; no dopamine), remove the Goblin Labs vaporware grid, and **cut Agency
   Edition entirely** (no card, no waitlist, no nav/footer links). Page now sells exactly TWO things:
   Free Trial (7 days of everything) + Creator Pro $19/mo — all focus on the create→hook→daily-return
   →refill-energy loop. Add tools/tiers later when paying customers ask. Next: paste V2 into Airo,
   then hard-reload live to verify the checklist at the bottom of V2.
4. **Pre-launch must-dos**: ≥1 real testimonial; refund test refill/sub in Stripe; hard-reload
   live app to confirm new landing is deployed.
   ✅ DONE June 20: Stripe **webhook signing secret rotated** (was leaked in `4fc8bc6`) — new
   secret set in Stripe + Vercel, old value scrubbed from `docs/STRIPE_LIVE_CONFIG.md` (`5c73e4f`).
   Old secret still exists in git history but is now useless. The leaked GitHub PATs are dead
   (GitHub auto-revoked them); replaced entirely by SSH — see Git/Deploy notes below.
5. **Get users** (the real lever): soft launch to beta crew + share cards, then acquisition loops
   (public brand pages for SEO + gift-energy referral). See `docs/CREATOR_PRO_GROWTH_ENGINE.md`.
   NOTE: when Fox next says "keep building", the open fork is which acquisition loop to build first
   — public brand pages (SEO, additive, read-only) vs gift-energy referral (touches energy grants).
6. **Phase 3 — Annual plan + $49 Launch Kit** (later; only matters once traffic exists).

### ✅ Done so far
- **Stripe checkout + webhook hardened** (committed `392ad9e`): fails loudly on missing keys,
  reuses Stripe customer, blocks live-key-on-localhost, re-grants Pro on renewal.
- **Creative Energy system** built (committed `d3cf835`): monthly allowance + $19 refills,
  energy gating on Creator Pro content, transaction ledger.
- **Refill idempotency fix** (committed): app guard + ledger-first write + DB unique index.
- **Magical Creator Experience** — 9 phases (committed): staggered Reveal, Brand DNA scores,
  sound system, XP + streaks, share card, upgrade nudge, locked builders, daily dashboard,
  instrumentation/analytics.
- **Phase 1 Dunning** (committed `7539b56`, ✅ PUSHED + LIVE):
  - `past_due` no longer triggers immediate downgrade — grace window preserved
  - `invoice.payment_failed` webhook case → sets `payment_status='past_due'`
  - `invoice.payment_succeeded` webhook case → clears back to `payment_status='active'`
  - `customer.subscription.deleted` + `unpaid` → sets `payment_status='canceled'`
  - `POST /api/stripe/portal` route — opens Stripe Customer Portal for card update
  - `PaymentRecoveryBanner` component — amber banner with waving Nix, shown on `past_due`
  - Migration `20260619_payment_state.sql` — run and confirmed ✅
- **DB migrations run in Supabase:** energy tables, energy idempotency index,
  `stripe_customer_id`, analytics properties, payment state columns — all applied. ✅

### ⚠️ Still open / known issues
- **Gotcha:** `STRIPE_PRICE_ID_ENERGY_REFILL` must be a **one-time** price; `STRIPE_PRICE_ID_PRO`
  the **recurring** one. Mixing them up throws a checkout error.
- **`deductEnergy` is not atomic** (read-modify-write) — concurrent generations could overspend.
  Future fix: a Postgres decrement function. Low priority for now.
- **Dual metering:** brand-kit generation still uses old `credits`; only Creator Pro content uses
  energy. `brand_generation: 50` in energy-config is currently unused. Decide if intentional.
- **Monthly reset is heuristic** (on `subscription.updated`). More robust:
  `invoice.payment_succeeded` + `billing_reason: subscription_cycle`.
- **Testimonials still placeholder; zero real customers.**
- **Stripe LIVE mode confirmed working** (tested June 20). Real payments enabled. ✅

➡️ Full launch path: `docs/LAUNCH_CHECKLIST.md`. Growth plan: `docs/CREATOR_PRO_GROWTH_ENGINE.md`.

---

## 3. WHAT IS LIVE RIGHT NOW

### Pages
| Route | Description | Status |
|---|---|---|
| `/` | Homepage | ✅ Just rebuilt (see below) |
| `/pricing` | 3-tier pricing page | ✅ Live |
| `/login` | Auth login | ✅ Live |
| `/signup` | Auth signup | ✅ Live |
| `/dashboard` | User dashboard with brand kit cards | ✅ Live |
| `/dashboard/generate` | Brand generation form | ✅ Live |
| `/dashboard/creator-pro` | Creator Pro content engine hub | ✅ Live |
| `/dashboard/brand/[id]` | Individual brand kit view | ✅ Live |
| `/admin` | Analytics dashboard | ✅ Live |

### Subscription Tiers
| Plan | Price | Features |
|---|---|---|
| Free | $0 | 3 brand generations, 9 core deliverables |
| Creator Pro | $19/month | Unlimited generations, 20 content types, 7 voice modes |
| Agency Edition | Coming Soon | Multi-client, white-label, waitlist only |

### Key Features Built
- Brand generation: 9 deliverables (names, taglines, story, voice, mascot, colors, website copy, social kit, launch plan)
- Creator Pro: 20 content types × 7 voice modes
- Brand personality: multi-trait selector + vibe description
- Mode selector: "New brand" vs "Existing brand" (Name Strength Check)
- Section reroll (regenerate individual sections)
- Dark mode PDF export
- Goblin Feedback System
- Business idea validation
- Testimonials (stored in Supabase `brand_testimonials` table)
- Agency Edition waitlist (stored in Supabase `agency_waitlist` table)
- Stripe webhooks: subscribe, cancel, downgrade
- Admin analytics dashboard

---

## 4. THE HOMEPAGE — JUST REBUILT (Latest Commit)

The homepage was completely rebuilt from "wall of text" to "show don't tell." Commit: `3f8af82`

### New sections in order:
1. **Hero** — `HeroTypewriter.tsx` — animated typewriter cycling through niches (skincare brand → fitness app → coffee shop → fashion label → podcast brand → SaaS startup → food truck → creative studio). Nix waving on right. Trust bar with gradient avatar stack, 5-star rating, user count.
2. **Comparison Section** — `ComparisonSection.tsx` — "The DIY Way" (❌ 47 ChatGPT prompts, 6-40 hours) vs "The Nix Way" (✓ one prompt, 1 min 47 sec). Scroll-reveal animations.
3. **Live Brand Kit Preview** — `BrandKitPreview.tsx` — Interactive tabbed demo showing a REAL generated brand kit for "Solace Skincare" (fictional example). Tabs: Names | Colors | Voice | Copy | Social Post. Animated counters: 12 deliverables · 112 sec · $4,800+ agency equivalent.
4. **Testimonials** — `TestimonialsSection.tsx` — 6 hardcoded outcome-driven cards with CSS gradient avatars (PLACEHOLDER — replace with real customers at launch). Specific stats: "47 min", "$8K saved", "+40% engagement".
5. **What You Get** — 9 feature cards each with inline sample output snippet
6. **How It Works** — 3 steps with real example prompts shown
7. **Pricing** — 3 tiers (free/pro/agency)
8. **Final CTA** — Uses conjuring-nix.png, personality copy

**Important:** Testimonials are currently PLACEHOLDER. The user will replace with real customer names, photos, and quotes before launch. The current cards have a small disclaimer note.

---

## 5. NIX CHARACTER — ASSET SYSTEM

### The Rules (CRITICAL)
1. **NEVER generate or fabricate Nix assets.** All Nix images come from the user generating in ChatGPT using the master sheet, then dropping the PNG file.
2. **Workflow:** User generates in ChatGPT → drops PNG → Claude places in `/public/nix/` folder → wires into app
3. **Master sheet:** `/public/nix/nix-master-sheet.png` — NEVER overwrite, never edit
4. **Quality check before placing:** green skin, purple hair, pointed ears, purple hoodie with gold trim, "NIX" on hoodie

### Current Nix Poses
| Pose | File | Used In | Status |
|---|---|---|---|
| Happy Waving | `/public/nix/happy-waving-nix.png` | Homepage hero, dashboard | ✅ Live |
| Thinking | `/public/nix/thinking-nix.png` | Loading screen, FAQ | ✅ Live |
| Working | `/public/nix/working-nix.png` | Creator Pro hub | ✅ Live |
| Celebrating | `/public/nix/celebrating-nix.png` | Success screens | ✅ Live |
| Sleeping | `/public/nix/sleeping-nix.png` | Empty states | ✅ Live |
| Conjuring | `/public/nix/conjuring-nix.png` | Final CTA, Goblin Labs | ✅ Live |
| Artist | `/public/nix/artist-nix.png` | Goblin Studio | 🔴 Needs drop |
| Scientist | `/public/nix/scientist-nix.png` | Goblin Labs | 🔴 Needs drop |
| Builder | `/public/nix/builder-nix.png` | Goblin Sites | 🔴 Needs drop |

### Still Needed
| Asset | Folder | Status |
|---|---|---|
| `brandgoblin-logo-dark.png` | `/public/logos/` | 🔴 Needs upload |
| `brandgoblin-logo-light.png` | `/public/logos/` | 🔴 Needs upload |
| `favicon.ico` | `/public/favicons/` | 🔴 Needs upload |
| `og-image.png` | `/public/social/` | 🔴 Needs upload |
| `twitter-card.png` | `/public/social/` | 🔴 Needs upload |
| All ecosystem badges | `/public/badges/` | 🔴 Needs generation |

---

## 6. BRAND ASSET RULES (CRITICAL FOR ANY NEW CLAUDE SESSION)

```
IF /public/logos/brandgoblin-logo.png does not exist:
  → STOP all branding work
  → Ask user to upload the official logo PNG
  → Wait for the file
  → Continue only after confirmed
```

- **Logo:** `/public/logos/brandgoblin-logo.png` ✅ exists
- **Always use Next.js `<Image>` component** — never `<img>` tags
- **Never generate background gradients or placeholder images** to substitute for official assets

---

## 7. DOCS IN THE PROJECT

All docs live at `/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai/docs/`

| File | Purpose |
|---|---|
| `ASSET_MAP.md` | Every asset path, status, where it's used |
| `NIX_CHARACTER_RULES.md` | Full Nix character bible + rules |
| `BRAND_GUIDELINES.md` | Colors, fonts, voice, brand rules |
| `PRODUCT_ROADMAP.md` | Feature status + ecosystem plans |
| `STRIPE_LIVE_CONFIG.md` | ⭐ Source of truth for all Stripe/Vercel live-mode values + webhook setup |
| `LAUNCH_CHECKLIST.md` | Pre-launch gating steps |
| `CREATOR_PRO_GROWTH_ENGINE.md` | The growth/monetization strategy ($10k MRR plan) |
| `MAGIC_EXPERIENCE_BRIEF.md` | The "holy crap" reveal + delight build spec |
| `PHASE2_REVERSE_TRIAL_BRIEF.md` | Reverse trial spec (BUILT — for reference) |
| `ANTI_ABUSE_BRIEF.md` | Email verification / Google sign-in / Turnstile / trial-farming |
| `COFOUNDER_LITE_BRIEF.md` | Additive brand-memory / welcome-back / library-search ideas |
| `PHASE1_DUNNING_BRIEF.md` | Dunning spec (BUILT — for reference) |
| `LANDING_REBUILD_BRIEF.md` | App landing rebuild (BUILT `32b406b` — interactive hero, honest proof) |
| `GODADDY_LANDING_ARROW_AI_BRIEF.md` | Arrow AI prompt to sync the GoDaddy marketing site (v1) |
| `GODADDY_LANDING_ARROW_AI_BRIEF_V2.md` | ⭐ Corrected Airo paste-in — supersedes v1 (audit June 20) |
| `STUDIO_SETUP_RUNBOOK.md` | ⭐ External setup Fox must complete before Studio goes live — fal.ai + Replicate keys, 3 Stripe refill prices (metadata-driven), `studio-assets` bucket, env table, per-model license checks. |
| `STUDIO_MODEL_COST_MAP.md` | ⭐ Green-lit models + energy pricing (energy = cost/0.0018 = 10× cost). Default image FLUX.1 schnell (NOT dev), default video Wan 2.6. fal prices verified June 20. |
| `GOBLIN_STUDIO_BRIEF.md` | ⭐ Goblin Studio build spec — all decisions LOCKED June 20. Cost model (energy = USD cost ×10 markup, never on us), atomic energy reservation, refill packs $19/$49/$99, trial = 1 free image + video-CTA (render gated to Pro), bring-your-own-brand input, TikTok/Reels/Shorts. Providers: fal.ai primary / Replicate fallback / Higgsfield optional. Positioning: text unlimited, media = "energy powers your images & videos." |

---

## 8. ECOSYSTEM ROADMAP (Coming Soon Products)

| Product | Description | Status |
|---|---|---|
| Creator Pro | AI content engine (LIVE) | ✅ Live |
| Goblin Studio | Full brand identity + logo design | 🔜 Planned |
| Goblin Labs | Experimental AI tools | 🔜 Planned |
| Goblin Sites | AI website builder | 🔜 Planned |
| Goblin Growth | Brand analytics + strategy | 🔜 Planned |
| Goblin Motion | AI video + animation | 🔜 Planned |
| Goblin Marketplace | Templates + digital products | 🔜 Planned |
| Agency Edition | Multi-client workspace | 🔜 Waitlist open |

---

## 9. WHAT TO DO NEXT (Suggested Priority Order)

### Immediate / Before Launch
- [ ] Replace placeholder testimonials with real customer quotes + real photos
- [ ] Upload favicon (`/public/favicons/favicon.ico`)
- [ ] Upload OG image for social sharing (`/public/social/og-image.png`)
- [ ] Add social media links to footer (Twitter/X, TikTok, Instagram)
- [ ] Mobile audit — test on real phone, check hero layout
- [ ] Generate remaining Nix poses: artist, scientist, builder

### Near-Term Improvements
- [ ] Annual pricing toggle on pricing page (e.g. $15/mo annual vs $19/mo monthly)
- [ ] Auth page split layout (left: form, right: live brand kit preview)
- [ ] FAQ section with thinking-nix.png
- [ ] "Try it free" interactive demo — no-signup teaser that generates one brand name
- [ ] Vercel Analytics + Speed Insights wired up (`@vercel/analytics`)

### Planned Features
- [ ] Goblin Studio MVP (logo generation via image AI)
- [ ] Goblin Sites MVP (one-click brand → landing page)
- [ ] Dashboard onboarding flow for new users

---

## 10. HOW PUSHING TO GITHUB WORKS

- Vercel auto-deploys when you push to `main`
- **SSH is set up (June 20, 2026) — just run `git push origin main` directly.** No PAT, no
  set-URL/clear dance, nothing expires.
- The remote uses the SSH URL: `git@github.com:MrFoxington/brandgoblin-ai.git`
- An ed25519 key lives at `~/.ssh/id_ed25519` (private key never leaves the Mac); its public half
  is registered in GitHub → Settings → SSH and GPG keys.
- ⚠️ The old PAT flow is DEAD — every PAT pasted in chat got auto-revoked by GitHub's secret
  scanner. Do not go back to PATs. If a push ever fails auth, the key/agent is the thing to check,
  not a token.
- Recurring gotcha: if `.git/index.lock` exists, `rm -f .git/index.lock` then retry.

---

## 11. CURRENT COMPONENT MAP

```
src/
  app/
    page.tsx                    ← Homepage (just rebuilt)
    layout.tsx                  ← Root layout
    pricing/page.tsx            ← Pricing page
    login/page.tsx              ← Login
    signup/page.tsx             ← Signup
    dashboard/
      page.tsx                  ← Dashboard home
      generate/page.tsx         ← Brand generation form
      creator-pro/page.tsx      ← Creator Pro hub
      brand/[id]/page.tsx       ← Individual brand kit
    admin/page.tsx              ← Analytics
    api/
      generate/route.ts         ← Brand generation API
      stripe/webhook/route.ts   ← Stripe webhooks
      creator-pro/route.ts      ← Content generation API

  components/
    Navbar.tsx
    Footer.tsx
    Particles.tsx
    LoadingScreen.tsx           ← Uses thinking-nix.png
    BrandKitView.tsx            ← Full brand kit display
    CreatorProHub.tsx           ← Creator Pro content engine
    HeroTypewriter.tsx          ← NEW: animated hero
    ComparisonSection.tsx       ← NEW: DIY vs Nix comparison
    BrandKitPreview.tsx         ← NEW: interactive demo
    TestimonialsSection.tsx     ← NEW: social proof cards
```

---

## 12. HOW TO RESUME IN A NEW CHAT

**Step 1:** Open a new Claude Code chat in the same project folder:
`/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai`

**Step 2:** Paste this entire document as your first message, then say what you want to work on next.

**Step 3:** Claude will have full context and can pick up immediately.

---

*Last updated: June 20, 2026 (v4) — Goblin Studio fully spec'd + external setup complete (fal.ai +
Replicate + Stripe packs + bucket all wired); ready for Claude Code to build Phase 1. Airo landing
V2 + Agency-cut issued. — (v3 below)*
*Earlier: June 20, 2026 (v3) — Live payments working end-to-end. Landing rebuilt (`32b406b`) + refill celebration shipped (`c9dd549`), both PUSHED + live. Security cleanup done: Stripe webhook secret rotated + scrubbed (`5c73e4f`); GitHub auth switched from PATs to SSH (`git push` works directly now). In progress externally: GoDaddy marketing-site sync (Arrow AI). Next: verify celebration live as a Pro user. Resume at "✅ HONEST STATUS → 🌅 START HERE" up top.*

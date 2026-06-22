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

### 🖼 GOBLIN STUDIO LIVE SHOWCASE WALL (built June 22) — AWAITING REVIEW/PUSH
Public, read-only, privacy-safe gallery of real Studio creations — embeddable on Airo via iframe.
Additive. `tsc + npm run build` clean. **DB MIGRATION REQUIRED before live:**
`supabase/migrations/20260622_studio_showcase.sql` (adds `featured` + `featured_order` + `featured_at`
+ partial index; includes an OPTIONAL seed snippet to feature your own jobs — replace `<YOUR_USER_ID>`).

**Privacy/consent (hard rules, enforced structurally):**
- Public API returns ONLY `{ id, imageUrl (short-lived signed, 30min), brandName, imageType }` — no
  user IDs, emails, or prompts. Only `featured = true AND status = 'completed'` (moderation-passed;
  NSFW → `moderation_blocked`, never completes, no asset).
- Admin can feature ONLY their own jobs — `setJobFeatured()` + `listAdminFeaturable()` both filter
  `user_id === admin.id`. Other users' work can never be featured in v1.

**Files:**
- **NEW** `supabase/migrations/20260622_studio_showcase.sql` — featured flags + index + seed snippet
- **NEW** `src/lib/studio/showcase.ts` — `listFeaturedPublic()` (public-safe), `listAdminFeaturable()`, `setJobFeatured()`
- **NEW** `src/app/api/showcase/route.ts` — public GET, `revalidate=120`, returns `{ items }`
- **NEW** `src/app/api/admin/showcase-feature/route.ts` — admin POST, ADMIN_EMAIL-gated + ownership-enforced
- **NEW** `src/app/embed/showcase/page.tsx` — chrome-less iframe page (noindex)
- **NEW** `src/app/showcase/page.tsx` — full public page + orange "Start Creating — Free" CTA
- **NEW** `src/components/showcase/ShowcaseMarquee.tsx` (always client-refreshes for live URLs) + `ShowcaseCard.tsx`
- **NEW** `src/components/admin/ShowcaseAdmin.tsx` — ⭐ feature toggle grid (optimistic, reverts)
- **MODIFIED** `src/app/admin/page.tsx` — Showcase Curation section
- **MODIFIED** `src/lib/studio/jobs.ts` — `featured*` on StudioJobRow; `getSignedUrl(path, ttl?)` optional TTL
- **MODIFIED** `src/types/index.ts` — `featured*` on duplicate StudioJobRow; `tailwind.config.ts` — marquee keyframe;
  `src/app/globals.css` — `.no-scrollbar`
- **ADMIN_EMAIL:** not set as env var but `/admin` + the feature route fall back to `joeherrington369@gmail.com`
  (Fox's email) so it works out of the box. Set `ADMIN_EMAIL` in Vercel for cleanliness.
- **Airo embed (Fox, after deploy):** `<iframe src="https://app.brandgoblinai.com/embed/showcase"
  style="width:100%;border:0;height:420px;" loading="lazy">`

### ✨ NIX ZONE — free Nix goodies (built June 22) — AWAITING REVIEW/PUSH
Free in-app distribution surface — wallpapers, sticker pack, gallery. Additive (no energy/Stripe/
trial/generation). `tsc + npm run build` clean. NO DB migration needed. **NO Nix art generated —
display-only from `/public/nix/*`; empty manifests render graceful "coming soon."**

**Files:**
- **NEW** `src/lib/nix-assets.ts` — manifest (WALLPAPERS/STICKERS/GALLERY arrays, currently EMPTY) +
  renamable `NIX_ZONE_LABEL` ("✨ Nix"). Adding a goodie = drop file in `/public/nix/<folder>/` + 1 line.
- **NEW** `src/lib/nix-download.ts` — `downloadFile`, `downloadWallpaperBranded` (canvas corner mark
  "Nix · brandgoblinai.com", source file untouched), `downloadStickersZip` (jszip dynamic-imported on click).
- **NEW** `src/app/dashboard/nix/page.tsx` — page, auth-gated to logged-in only, NO Pro gate.
- **NEW** `src/components/nix/NixZone.tsx` (orchestrator) + `NixWallpapers.tsx`, `NixStickers.tsx`,
  `NixGallery.tsx`, `NixEmptyState.tsx` (waving Nix "coming soon").
- **MODIFIED** `src/components/Navbar.tsx` — "✨ Nix" link (purple glow + FREE badge, NOT orange).
- **MODIFIED** `src/lib/studio/share.ts` — `shareImage(url, opts?)` optional title/text (additive; existing
  callers unchanged). Nix gallery shares "Meet Nix from BrandGoblin 🧙✨ brandgoblinai.com".
- **DEP:** added `jszip` (dynamically imported — stays out of main bundle; shared JS unchanged at 87.2 kB).

**FOX TODO — drop Nix art (page works empty until then), then add manifest lines:**
- `/public/nix/wallpapers/` — desktop (1920×1080 / 2560×1440) + phone (1080×1920) PNGs
- `/public/nix/stickers/` — transparent-bg PNGs (~512×512), clean die-cut poses
- `/public/nix/gallery/` — "Nix doing cool stuff" images + optional short clips (.mp4/.webm)

### ⭐ GOBLIN STUDIO — Favorites + Button Hierarchy + Share-at-Reveal — PUSHED ✅ LIVE (June 21) — `7fbf43d`
Additive to Phase 1.6 + Share Celebration. `tsc + npm run build` clean. **DB migration RUN ✅**
(`supabase/migrations/20260621_studio_favorites.sql` — added `studio_jobs.favorite` + partial index).
Completes the create → keep → share → grow → repeat loop: gold-star favorites + Hoard sections
(Studio tab + dashboard), Share=ORANGE / More-like-this=GREEN hierarchy, and "📣 Share it" surfaced at
the reveal (peak intent). Share Celebration (`b7dc1d5`) + full 8-file sound pack also LIVE.

**Files:**
- **NEW** `supabase/migrations/20260621_studio_favorites.sql` — favorite flag + partial index (run it!)
- **NEW** `src/app/api/studio/favorite/route.ts` — `POST { jobId, favorite }`, Pro-gated, ownership-checked
- **NEW** `src/lib/studio/share.ts` — extracted real-share-only flow (`shareImage()` → "shared" |
  "copied" | "cancelled" | "failed"). Reused by JobCard AND the reveal; celebrate only on shared/copied.
- **NEW** `src/lib/studio/favorites.ts` — single renamable `FAVORITES_LABEL` ("⭐ Favorites")
- **NEW** `src/components/studio/StudioFavoritesSection.tsx` — dashboard treasure-stash grid (capped 6)
- **MODIFIED** `src/lib/studio/jobs.ts` — `favorite` on StudioJobRow; `listUserFavoriteJobs()`, `setJobFavorite()`
- **MODIFIED** `src/components/studio/JobCard.tsx` — gold-star toggle (optimistic, reverts on fail);
  button hierarchy: Share ORANGE glowing / More-like-this GREEN solid / Download neutral / BG+Upscale quiet chips
- **MODIFIED** `src/components/studio/StudioImageGenerator.tsx` — `handleToggleFavorite` (optimistic),
  All/Favorites filter tabs (compose with brand filter), `handleRevealShare` + "📣 Share it" at the reveal
- **MODIFIED** `src/app/dashboard/page.tsx` — renders StudioFavoritesSection (Pro/agency only)
- **MODIFIED** `src/types/index.ts` — `favorite` added to the duplicate StudioJobRow (kept in sync)

### 🎨 GOBLIN STUDIO — Phase 1.7 PUSHED ✅ (June 21, 2026) — commit `8123a5a`
Phases 1–1.7 all complete and live. `tsc + npm run build` both clean.

**Phase 1.7 "Juice & Sound" — new/modified files (additive only):**
- **REWRITTEN** `src/components/primitives/SoundFx.tsx` — real HTMLAudioElement player (replaces
  Web Audio synth). 6 cue files wired to `/public/sounds/`; graceful silent fallback on 404.
  `ensurePrimed()` unlocks all audio on first gesture so the anticipation loop (started from a
  useEffect) isn't blocked by browser autoplay policy. `stopLoopImmediate()` called on mute so
  toggling mute mid-generation kills the loop instantly. Default-on: null localStorage pref → sound
  ON; "1" → muted. `SoundToggle` shows a one-time "🔊 sound on — tap to mute" hint (4s auto-dismiss).
  New cues: `playButtonPress`, `playConjureStart`, `startAnticipation`, `stopAnticipation`,
  `playStreak(count)` (pitch-shifted 1.0×–1.8× by real streak). Existing API unchanged.
- **REWRITTEN** `src/components/studio/NixCooking.tsx` — anticipation swell: `startAnticipation()`
  on mount / `stopAnticipation()` on unmount. Progress 0→1 over 18s via rAF (honest time-based).
  Stage 0/1/2 at 0.4/0.7: Nix float -8→-12→-16px, shimmer brightens, stage 2 adds 5 ✦ particle
  sparks floating up around Nix. Reduced-motion: no loop, no particles, no whoosh.
- **MODIFIED** `src/components/studio/StudioImageGenerator.tsx` — SPARKLES expanded to 18 (streak-
  scaled burst: 7 base + 2/streak, cap 18). `playButtonPress()` wired to Conjure, Re-cook, all
  sparks, Make another, Try a variation, New style. `playConjureStart()` at top of `submitJob()`
  (before first await — gesture context). `stopAnticipation()` + `playStreak(streak)` on job
  completion before reveal. New refs: `stopAnticipationRef`, `playStreakRef`, `streakRef`.

**✅ SOUND PACK PLACED (June 21):** 8 CC0/royalty-free files now in `/public/sounds/` (304KB total),
converted to mp3 via ffmpeg from Kenney (CC0) + Mixkit (free commercial):
- `button-press.mp3` (Kenney click) · `streak-chime.mp3` (Kenney glass)
- `conjure-start.mp3` (Mixkit Magic sparkle whoosh) · `anticipation-loop.mp3` (Mixkit Sparkling fairy
  glow) · `reveal.mp3` (Mixkit Fairy magic sparkle) · `level-up.mp3` (Mixkit Fantasy game success)
- `nudge.mp3` (Mixkit Arcade magic notification — NEW cue, see below)
- `share.mp3` (Mixkit Medium crowd applause, trimmed ~3s — for the Share Celebration build)

**NEW CUE — `nudge.mp3` (being wired by Claude Code):** `playNudge()` added to SoundFx; fires ONCE when
the post-reveal "Make another/Try a variation/New style" CTAs appear (the honest "continue creating"
moment — sparse, inviting, never naggy). Commit + push includes all 8 sound files.

**✅ SHARE CELEBRATION BUILT (June 21) — additive to 1.6 Share + 1.7 sound. Awaiting review/push.**
`tsc + npm run build` clean. Files:
- **MODIFIED** `src/components/primitives/SoundFx.tsx` — added `playShare()` → `share.mp3` (0.55 vol),
  same pattern as other cues (mute-gated, graceful fallback, primed on gesture). On `useSoundFx()` API.
- **MODIFIED** `src/components/studio/JobCard.tsx` — `handleShare()` now tracks a `succeeded` flag:
  true only when `navigator.share()` resolves OR clipboard copy succeeds; cancel/reject → no
  celebration. On success: `playShare()` + new `onShareSuccess?(job)` prop callback.
- **MODIFIED** `src/components/studio/StudioImageGenerator.tsx` — `handleShareSuccess()` opens a
  fixed bottom-right celebration toast: celebrating Nix + 4 rotating encouraging lines (`SHARE_MESSAGES`,
  3s rotation, 8s auto-dismiss) + 6-sparkle burst (skipped under reduced-motion) + orange
  "✨ Create something new" CTA (`handleShareKeepBuilding` → scroll to `#studio-form`) + Dismiss.
  Honest-dopamine: fires only on a real share, one toast per share, no nag/FOMO/timer-pressure.

### 🎨 GOBLIN STUDIO — Phase 1.6 PUSHED ✅ (June 21, 2026) — commit `645802d`
Phase 1 + 1.5 + 1.6 all complete and live. `tsc + npm run build` both clean.

**Phase 1.6 new/modified files (additive only — no energy/Stripe/trial/grant changes):**
- **NEW** `src/app/api/studio/process/route.ts` — crash-safe bg_removal + clarity_upscaler via
  `fal.subscribe()`. Energy reserved + job row created BEFORE fal call. Derived jobs inherit
  `brand_id` from source (brand-scoped gallery stays consistent). `maxDuration=60`.
- **REWRITTEN** `src/components/studio/StudioImageGenerator.tsx`:
  - Seed pinning: `seedRef = useRef(generateSeed())`. Fresh seed on brand change, type change,
    any prompt change (textarea, auto-cook, re-cook, spark, variation, more-like-this, make-another,
    new-style). Same seed reused ONLY on quality-tier-only change.
  - Brand-scoped gallery: `filterByBrand(job)` — jobs filtered to `selectedBrandId`; null brand_id
    shown only under Freeform selection.
  - Orange Conjure button (#FF6B35→#FF8C42 gradient + `animate-conjure-pulse` glow) on main CTA
    and post-reveal "Try a variation" + "Make another" CTAs.
  - Seedream labeled with ALT badge + visible warning: "different art engine · expect a new look".
  - `handleProcess(job, operation)` calls `/api/studio/process`; result prepended to jobs list.
  - `handleMoreLikeThis(job)` calls freshSeed + submitJob with job's prompt/model/type.
- **REWRITTEN** `src/components/studio/JobCard.tsx` — Remove BG + Upscale wired to handleProcess;
  ✨ More like this; Share (Web Share API → clipboard fallback + "✓ Copied" toast);
  derived variant tags (Background removed / ✨ Upscaled); process buttons gated to original jobs.
- **MODIFIED** `src/app/api/studio/cook-prompt/route.ts` — PALETTE LOCK instruction added to
  system prompt (hex colors must appear verbatim in output).
- **MODIFIED** `src/app/api/studio/jobs/route.ts` — accepts + validates `seed` from client body;
  passes seed to provider; Seedream gets `negative_prompt`.
- **MODIFIED** `src/lib/studio/provider.ts` — `seed` + `negativePrompt` added to SubmitJobParams
  and fal input; `negative_prompt` Seedream-only.
- **MODIFIED** `tailwind.config.ts` — `conjure-pulse` keyframe + `animate-conjure-pulse` (orange glow pulse).

**Phase 1.5 context (unchanged):**

**Phase 1.5 new/modified files (additive only — no energy/Stripe/trial/grant changes):**
- **NEW** `src/app/api/studio/cook-prompt/route.ts` — Claude Haiku prompt engineer. FREE (no energy),
  Pro-gated (`plan === "pro"`), best-effort rate limit ~20/min. Input: `{ brandId?, imageType, userNote? }`.
  Loads brand kit (name, tagline, story, voice, palette, logoPrompt), calls `claude-haiku-4-5-20251001`,
  returns `{ prompt }` (2-3 sentence visual description, no marketing copy).
- **NEW** `src/components/studio/NixCooking.tsx` — animated conjuring Nix + 5 rotating status lines
  (every 2.5s) + shimmer bar. `useReducedMotion()` respected. Props: `count: number`.
- **REWRITTEN** `src/components/studio/StudioImageGenerator.tsx` — full rewrite:
  - Prompt textarea auto-filled by cook-prompt; editable + Re-cook button; non-blocking
  - 400ms debounce auto-cook on brand/type change (suppressed during spark/newStyle cooks)
  - IDEA_SPARKS row (4 sparks → setImageType + cookPrompt with note)
  - Model order: Standard | Artistic | Premium. **Default: Standard (flux_schnell)**
  - Celebration reveal overlay: celebrating Nix, 7-sparkle burst, "+10 XP · N-day streak 🔥"
  - Post-reveal CTAs: "Try a variation · ⚡N" / "New style · ⚡N" / "Make another"
  - XP once-per-job: `awardedXPJobs = useRef<Set<string>>(new Set())`; `addXP(10)` via `useXP()`
  - `playComplete()` on reveal; streak read from `localStorage["brandgoblin_streak_v1"]`
  - Stale-closure-safe refs: `addXPRef`, `playCompleteRef`, `pollJobRef`, `suppressCookRef`
  - "Your Creations ({count})" gallery header
- **MODIFIED** `src/app/api/studio/jobs/route.ts` — accepts `prompt` from client body (replaces
  `customPrompt`); uses it directly (trim, strip nulls, cap 2000 chars); template builder is now
  fallback only when `prompt` is empty.
- **MODIFIED** `tailwind.config.ts` — `shadow-studio-glow` (amber box-shadow) + `animate-studio-glow`
  keyframe (2s pulse between 8px and 16px amber glow).
- **MODIFIED** `src/components/Navbar.tsx` — Studio button: amber border/bg/text, `shadow-studio-glow`,
  `motion-safe:animate-studio-glow`, NEW badge (absolute -top-1.5 -right-1.5 amber pill).
- **MODIFIED** `src/components/DailyCreatorDashboard.tsx` — Studio card: purple → amber/gold.
- **MODIFIED** `src/app/dashboard/creator-pro/page.tsx` — Studio sidebar card: purple → amber/gold + NEW badge.

**Phase 1 context (unchanged):**
- **New routes:** `/dashboard/studio` (paid Pro only), `/api/studio/jobs`, `/api/studio/jobs/[jobId]`,
  `/api/studio/webhook/fal`, `/api/studio/sweep`
- **New libs:** `src/lib/studio/models.ts`, `provider.ts`, `jobs.ts`
- **DB migration to run before live:** `supabase/migrations/20260620_studio_phase1.sql`
- **Model registry:** `fal-ai/flux/schnell` ($0.003/MP) | `fal-ai/flux-pro/v1.1` ($0.04/MP) |
  `fal-ai/bytedance/seedream/v4.5/text-to-image` ($0.03 flat)
- **Cost model:** `energy = ceil(usdCost × MARKUP / 0.018)`, MARKUP=10 env-tunable

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
1. **Drop 6 sound files into `/public/sounds/`** — Phase 1.7 is live but silent until files land.
   Sources: Kenney.nl Interface Sounds (CC0), Mixkit, Freesound CC0. Files needed:
   `button-press.mp3` · `conjure-start.mp3` · `anticipation-loop.mp3` · `reveal.mp3` · `streak-chime.mp3` · `level-up.mp3`
   After dropping files: `git add public/sounds/ && git commit -m "Add Phase 1.7 CC0 sound pack" && git push`
2. **Smoke-test Phase 1.7 live** (after sound files land): click Conjure, hear whoosh, watch Nix
   swell, hear sparkle burst on reveal, see streak chime pitch rise, mute mid-gen stops loop.
3. **Verify Phase 1.6 live** — also confirm brand gallery filter, orange Conjure, Remove BG/Upscale
   variant cards, ✨ More like this, Share button, Seedream ALT badge.
2. **NEXT STUDIO BUILDS — spec'd, NOT built yet (give to Claude Code one at a time):**
   - **Phase 1.6 — DONE/PUSHED** (`645802d`) — verify live (item 1).
   - **Phase 1.7 "Juice & Sound"** — `docs/GOBLIN_STUDIO_PHASE_1_7_BRIEF.md`. Real on-brand SFX pack
     (current SoundFx.tsx is thin synth tones + defaults muted), default-sound-ON, anticipation build
     during generation, escalating reveal, loop momentum. HARD RULE: honest dopamine only — NO
     losses-disguised-as-wins / near-miss / loss-chasing (energy = real money). Audio files must be
     sourced (CC0/royalty-free) and dropped in `/public/sounds/` — CC will output the exact file list.
   - **Live Showcase Wall** — `docs/GOBLIN_STUDIO_SHOWCASE_BRIEF.md`. Public, embeddable, auto-rotating
     `/embed/showcase` of REAL featured creations (iframe'd into Airo, which blocks JS but allows
     iframes). `featured` flag + admin toggle; consent + moderation guardrails (only Fox-owned or
     opt-in creations public); short-lived signed URLs from the private bucket. Updates auto-pull from
     the app — no manual Airo edits.
   - Later (Phase 1.7+ / Phase 2): multi-variation gacha spread, deeper gamification, short-form VIDEO
     (Wan 2.6 / Kling 3.0 — registry-mapped, NOT built; do NOT advertise video anywhere until built).
3. **GoDaddy / Airo marketing landing — V2 LANDED ✅, V3 in progress.** `brandgoblinai.com` now matches
   the app: "Watch your idea become real" hero, idea sparks, "Logo Direction", two-tier pricing
   (Agency cut), addictive-loop section, demo-video/examples/Goblin-Labs sections gone, CTAs → `/signup`.
   **V3 (`docs/GODADDY_LANDING_ARROW_AI_BRIEF_V3.md`) deltas:** ✅ hero orange CTA "✦ Start Creating —
   Free" is LIVE. ⏳ Pending Airo paste-ins issued this session: (a) make the top-nav "Start Creating
   Free" button orange to match; (b) add a "Goblin Studio / make real images" section right after the
   hero (images only — NOT video); (c) drop in 2–3 real Studio example images; (d) embed the Showcase
   iframe once built. ⚠️ Footer Legal links (Privacy/Terms/Refund) + Company links are all dead `#` —
   real fix needed for a paid site (Stripe/trust). NOTE: Airo ignores multi-part prompts — feed it
   ONE change at a time.
4. **Verify the refill celebration live** — `c9dd549` is pushed + deployed. Log in as a Pro user
   and hit `/dashboard/creator-pro?refill=success` to confirm the overlay, bar fill, sound, and
   scroll-to-generator all work in production (was build-verified only, never driven live).
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
| `GODADDY_LANDING_ARROW_AI_BRIEF_V2.md` | Corrected Airo paste-in — LANDED ✅ (audit June 20) |
| `GODADDY_LANDING_ARROW_AI_BRIEF_V3.md` | ⭐ Airo V3 delta (June 21) — orange CTA (live), add Studio "real images" section, fix logo-direction language. Feed Airo one change at a time. |
| `GOBLIN_STUDIO_PHASE_1_5_BRIEF.md` | Studio Phase 1.5 spec (BUILT/PUSHED) — cook-prompt, loop, reveal/XP, idea sparks, glow. |
| `GOBLIN_STUDIO_PHASE_1_6_BRIEF.md` | Studio Phase 1.6 spec (BUILT/PUSHED `645802d`) — orange button, brand gallery, seed-pinning, more-like-this, Remove BG/Upscale, Share. |
| `GOBLIN_STUDIO_PHASE_1_7_BRIEF.md` | ⭐ Studio Phase 1.7 spec (NOT built) — "Juice & Sound": real SFX pack, default-on, anticipation, escalating reveal. Honest-dopamine hard rule (no casino deception). Needs CC0 audio files in /public/sounds/. |
| `GOBLIN_STUDIO_SHOWCASE_BRIEF.md` | ⭐ Live Showcase Wall spec (NOT built) — public embeddable /embed/showcase of featured real creations, iframe'd into Airo. Consent + moderation guardrails. |
| `GOBLIN_STUDIO_PHASE_1_7_BRIEF.md` | Studio Phase 1.7 "Juice & Sound" (BUILT/PUSHED; sound pack placed). |
| `GOBLIN_STUDIO_SHARE_CELEBRATION_BRIEF.md` | Share Celebration (BUILT/LIVE `b7dc1d5`) — applause + Nix cheer + keep-building CTA on real share. |
| `GOBLIN_STUDIO_FAVORITES_AND_SHARE_BRIEF.md` | Favorites + button hierarchy + share-at-reveal (BUILT/LIVE `7fbf43d`) — gold-star favorites, Hoard sections, Share=orange/More-like-this=green, "Share it" at the reveal. |
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

*Last updated: June 21, 2026 (v8) — Full Studio dopamine loop SHIPPED + LIVE: Phase 1.7 sound pack,
Share Celebration (`b7dc1d5`), and Favorites + button hierarchy + share-at-reveal (`7fbf43d`, migration
run). create → ⭐ keep → 🟠 share → 🎉 grow → 🟢 build → repeat is fully wired. NEXT: Live Showcase Wall
(`docs/GOBLIN_STUDIO_SHOWCASE_BRIEF.md`) — the bridge to DISTRIBUTION (the real growth lever). Also
pending: Airo landing nav-button-orange + example images + dead footer legal links. — (v7 below)*
*Earlier: June 21, 2026 (v7) — Phase 1.7 "Juice & Sound" pushed + full 8-file sound pack placed in
/public/sounds/ (Kenney + Mixkit, CC0/free). New `nudge.mp3` cue being wired (post-reveal continue-
creating). `share.mp3` placed and Share Celebration spec'd (NOT built) to complete the create→share→
grow loop. Queued builds: Share Celebration, Live Showcase Wall. — (v6 below)*
*Earlier: June 21, 2026 (v6) — Goblin Studio Phase 1.6 BUILT + PUSHED (`645802d`): orange Conjure
button, brand-scoped gallery, seed-pinning (on-brand quality tiers), "More like this", Remove BG +
Upscale wired, Share. Two new phases spec'd (NOT built): Phase 1.7 "Juice & Sound" (real SFX pack,
honest-dopamine guardrails) + Live Showcase Wall (embeddable /embed/showcase, iframe'd into Airo).
Airo landing: V2 LANDED, V3 hero orange CTA live; pending nav-orange + Studio section + example images
+ showcase iframe + dead footer legal links. Resume at "🌅 START HERE". — (v5 below)*
*Earlier: June 21, 2026 (v5) — Goblin Studio Phase 1.5 built + build-verified (all 5 features:
cook-prompt endpoint, prompt textarea + debounce, NixCooking component, celebration reveal + XP/streak,
idea sparks, amber Studio glow). tsc + npm run build clean. NOT yet pushed — review diff first.*
*Earlier: June 20, 2026 (v3) — Live payments working end-to-end. Landing rebuilt (`32b406b`) + refill celebration shipped (`c9dd549`), both PUSHED + live. Security cleanup done: Stripe webhook secret rotated + scrubbed (`5c73e4f`); GitHub auth switched from PATs to SSH (`git push` works directly now). In progress externally: GoDaddy marketing-site sync (Arrow AI). Next: verify celebration live as a Pro user. Resume at "✅ HONEST STATUS → 🌅 START HERE" up top.*

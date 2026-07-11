# BrandGoblin AI — Claude Handoff Document
> Paste this entire file into a new Claude chat to resume exactly where we left off.

> **📖 READ `docs/NIX_MANIFESTO.md` — the founding document (July 2026).** It governs every build
> decision. The short version: amplify creators, never replace them. Every decision must
> strengthen at least one of: Revenue, Customer Success, Automation, Retention, Long-Term
> Advantage — everything else waits. Systems over services (every hour creates a compounding
> asset). Taste is the moat. Simplicity wins. Be honest, best idea wins. Think in decades:
> BrandGoblin is the proving ground for a bigger vision — every creator with an intelligent
> creative partner.

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

## ✅ HONEST STATUS (updated June 22, 2026) — READ FIRST

**REVENUE-CAPABLE AND WORKING END-TO-END IN LIVE MODE.** Real purchases, energy refills, the
monthly Pro energy grant, dunning, and the customer portal all verified working with the live
webhook actually firing. App lives at **`https://app.brandgoblinai.com`** (root `brandgoblinai.com`
is the landing page). Email verification + Resend transactional email are live.

**The constraint is DISTRIBUTION, not product.** The app is built, magical, charges money, and is
protected against abuse. What's missing is real users → acquisition → conversion → retention.
See `docs/CREATOR_PRO_GROWTH_ENGINE.md`.

---

## 🗓️ SESSION LOG — July 10, 2026 (CHANNEL IDENTITY DECIDED: FILM AS FOX + THE 0-100K MASTER PLAN)

Cowork session. Fox pushed the July 5 commit from his Mac (Powered by NIX + docs + agents).
Then the big strategic session: WHO is the face of the channels?

**1. NAME RESEARCH (deep dive).** Checked NIX handles across platforms: @nix, @heynix, @nixai,
@asknix, @itsnix, @nixofficial all TAKEN on YouTube. **@nixthegoblin is owned by an existing
artist** (YouTube + Instagram) — that name is permanently off the table. @nixgoblin was
available on YouTube + Instagram and **nixgoblin.com was unregistered (~$13)** as of July 10 —
Fox may grab it as insurance. nix.com is corporate-owned via MarkMonitor since 2001, not
buyable. NIX namespace is legally crowded: NixOS (trademarked), NIX United (owns nix-ai.com),
Nix lice treatment. Plain "NIX" as a software brand = trademark + SEO problems.

**2. ✅ DECISION (FINAL, Fox's words): CHANNELS ARE CREATOR/FOUNDER NAMED AND FOCUSED —
FOREVER.** "BrandGoblin may change, Nix may change, the names or products will evolve, but
Fox will always be Fox. I am always going to be the heart and soul of whatever I do."
Research backs it: founder content gets ~46% higher engagement, person-posted content gets
5-6x company-page reach, faceless brand accounts don't work without years of equity. Setup:
Fox-named handles, display name "Fox | BrandGoblin AI" for now (the part after the | is a
swappable product tag), Nix = Duolingo-style co-star (never channel owner),
@brandgoblinai registered as quiet product home base. Fresh accounts unless Foxximuss accounts
are dormant (old unrelated content poisons TikTok's 2026 follower-first testing).
NOTE: this supersedes the mastery guides' "product-named account" advice — same scripts,
same calendar, delivered by Fox.

**3. 📊 NEW `docs/ZERO_TO_1M_FOLLOWERS_PLAYBOOK_2026.md`** (research agent, ~45 sources).
Submagic autopsy dated precisely (May-Aug 2023, 3 years old; affiliates were the real engine,
their TikTok only has ~559K followers at $8M ARR), 8 more case studies, the math of 1M
(0.06% of channels; ~4 years + ~490 videos average), 2026 platform mechanics, phased playbook.
**VERDICT Fox agreed with: 1M followers is the WRONG primary goal** — chase qualified views +
signups, let followers accumulate, re-decide at 100K. Marc Lou is the model (100K subs in
10 months, ~30 videos, <10 hrs/wk, $100K+ attributed revenue).

**4. 🎯 NEW MASTER PLAN: `docs/FOX_0_TO_100K_PLAN.md` + `.pdf`** (8-page styled PDF).
Goal: 0-100K followers (YouTube+TikTok) + $100K product revenue ($8.4K MRR run rate).
Contains: setup week checklist, the 4 content formats (Live Demo / Build-in-Public Diary /
Hot Take / Nix Bit 1x-week max), 3 phases with kill/keep/boost rules, weekly operating system
(10-12 hrs), monthly scoreboard, revenue milestones ($500 → $2K → $8.4K/mo). The 30-day
acquisition plan runs INSIDE Phase 1. Affiliate program (Submagic's engine) is the Phase 3
unlock.

**5. (Same session, part 2) 🔍 DEEP DIVE AUDIT #3 — `docs/APP_AUDIT_JULY_10_2026.md`.**
Verified: July 5 push deployed (Powered by NIX live in app navbar + both footers), app consoles
CLEAN everywhere, dashboard/Studio/pricing healthy, BYOL live. Found 6 code issues + confirmed
the pending Airo items (hydration #418 still fires, social icons still dead, BYOL line still
missing, header tagline Block A not applied). BIG PRODUCT FIND: landing promises "Download your
complete brand kit" — one-click Brand Kit export needs verifying/building (audit item 11).
Also unaudited: fresh signup → first brand flow (item 12, do before acquisition Day 1).

**6. (Same session, part 3) ✅ ALL 6 AUDIT FIXES SHIPPED (tsc exit 0, ⚠️ NOT YET PUSHED):**
1. `Footer.tsx` → client component; logged-in users see Dashboard + Sign Out (real signOut)
   instead of Sign In/Sign Up; ecosystem chips: Goblin Studio now LIVE + linked (was "Soon"),
   Creator Pro linked too.
2. NEW `src/app/studio/page.tsx` → bare /studio redirects to /dashboard/studio (was naked 404).
3. NEW `src/app/not-found.tsx` → branded 404 ("This page got goblin'd", thinking Nix, Brand
   Vault + homepage buttons).
4. Pricing copy: "Top up energy anytime — packs from $19" (pricing page) + "top up from $19"
   (EnergyWidget zero-state) — kills the $19-vs-$49-modal mismatch.
5. `Navbar.tsx` → logged-in users get APP nav (Brand Vault / Creator Pro / Pricing); marketing
   anchors (Features/How It Works/About) only for visitors.
6. GREETING NAME SYSTEM ("Jopro" bug): email-derived names deleted. Greeting is nameless until
   the user sets a name via a one-time inline "What should Nix call you?" ask on the dashboard
   (saves to supabase user_metadata.display_name, ✕ dismissable via localStorage, no signup
   friction — decided via e-commerce/UX psychology: wrong name < no name < asked-for name).
   `dashboard/page.tsx` passes displayName; new "display_name_set" analytics event.
Files: Footer.tsx, Navbar.tsx, DailyCreatorDashboard.tsx, dashboard/page.tsx, pricing/page.tsx,
EnergyWidget.tsx, lib/analytics.ts, + 2 new pages.

**7. (Same session, part 4) 🧌 NEW FEATURE: MASCOT GENERATOR IN STUDIO (Fox's catch:
"the landing sells a Mascot Generator, the kit writes a mascot concept, but Studio couldn't
generate the mascot image"). Built (tsc exit 0, NO migration — image_type is free TEXT):**
- `energy-config.ts`: ImageType union + IMAGE_TYPE_SIZES gain "mascot" (portrait_4_3,
  768×1024 — full-body characters read best in portrait). Energy cost auto-computes (1MP,
  same as logo).
- `cook-prompt/route.ts`: mascot asset label + feeds the kit's EXISTING MascotConcept
  (name/appearance/personality/visualDescription/imagePrompt — it was sitting unused!) into
  the prompt engineer; new mascot textRule (ONE full-body character, no text, white bg for
  clean cutout, character-sheet quality).
- `jobs/route.ts`: mascot branch in the kit fallback builder (uses kit.mascot) + generic
  default prompt.
- `StudioImageGenerator.tsx`: 4th What-to-Create card "Mascot — Your brand's character,
  brought to life" (grid now 2×2 mobile / 4-up desktop); the "playful mascot scene" spark
  now correctly sets type mascot (was silently making logo_concepts — the July 3 mislabeled-
  job hazard, now fixed at the source).
- `JobCard.tsx`: "Mascot" type label. Remove BG on mascots uses fal rembg (photo/illustration
  cutout — right tool; local strip stays logo-only). No official-logo button on mascots (by
  design), no stamping on mascots (by design).

**8. (Same session, part 5) 🚀 "WHERE TO LAUNCH THIS" TIP + WEBSITE PREVIEW ROADMAP.**
Fox's insight: seeing HIS site live (GoDaddy Airo) is what kept him building — users need that
moment too. Shipped (tsc exit 0): teal "🚀 Where to launch this" tip box at the bottom of the
brand kit's Website Copy section — free path = Carrd (live in ~20 min, no account to start),
upgrade path = "Nix recommends GoDaddy Airo — brandgoblinai.com was built with Airo, powered
by Nix." File: BrandKitView.tsx.
**AFFILIATE NOTE (researched, parked):** GoDaddy affiliate program exists via CJ Affiliate
(10-15% commission, 45-day cookie, $100 min payout; join at cj.com then email CID to
affiliates@godaddy.com). Worth doing ONCE THERE'S TRAFFIC — don't build monetization plumbing
before users. When joined, swap the plain Airo link for the tagged link.
**🗺️ ROADMAP (order):** (1) Brand Kit download (audit item 11 — verify/build), (2) **WEBSITE
PREVIEW**: render the kit's real copy + palette + official logo into a live homepage mockup
in-app. Zero AI cost (template + kit data), hugely shareable, makes website copy feel real,
and it's the stepping stone to the "Goblin Sites" ecosystem promise.

**9. (Same session, part 6) 🌐 WEBSITE PREVIEW SHIPPED — BUILT LIVE ON CAMERA (founder build
video #1 🎬, tsc exit 0).** The roadmap item got built same-day. NEW `WebsitePreview.tsx`:
full-screen modal rendering the kit's REAL copy as a homepage inside a fake browser frame
(traffic-light dots + brandname.com address bar). Auto-themes from the brand's OWN palette:
darkest swatch = page background, brightest = buttons, luminance math keeps text readable on
any palette. Sections: nav + hero (headline/subheadline/both CTAs/tagline), features grid
(new `features` or legacy `featureBullets`), about, email capture, footer ("Made with
BrandGoblin AI 🧌"). Degrades gracefully for old kits. Zero AI cost. Wire-up: gold→purple
"🌐 See it live — preview your website" button in the Website Copy section (above the launch
tip), new `website_preview_opened` analytics event. Files: WebsitePreview.tsx (new),
BrandKitView.tsx, analytics.ts.

**10. (Same session, part 7) 🔴→✅ WEBSITE PREVIEW v2 — Fox rejected v1 ("flat, empty,
worse than not showing it" — a lame preview deflates the 'my idea is real' high). Full
rebuild (tsc exit 0):**
- **Layered palette glows** (3 radial gradients from the brand's own accent colors) instead
  of flat paint; accents now picked by CHROMA (most vivid), not just brightness.
- **THEIR STUDIO ART pulled in live** (fetches /api/studio/jobs, filters completed + brand):
  official logo in the site nav, latest product_art as a floating glowing hero image,
  mascot peeking over the email-capture card. Their brand, not a wireframe.
- **Big type**: hero at 7xl with gradient-ink accent words (splitHeadline), tagline as an
  eyebrow chip, buttons with glow shadows.
- **Motion**: whileInView reveals per section, staggered feature cards, hero art floats in.
- **"✨ Copy website prompt" button** in the top bar: builds a paste-ready brief from the
  whole kit (copy + hexes + personality + SEO) for GoDaddy Airo / Framer / any AI builder.
  New analytics event `website_prompt_copied`. Chip renamed MOCKUP → "Concept".
- AGREED FALLBACK: if v2 still doesn't spark on Fox's live look, demote the preview button
  and lead with the copy-prompt path instead.

**▶ NEXT SESSION / FOX — START HERE:**
1. PUSH everything (Claude Code: "commit and push my changes"): 6 audit fixes + MASCOT
   GENERATOR + LAUNCH TIP + WEBSITE PREVIEW v2. Then Fox eyeballs the Juicy Hazy preview
   again — the verdict on v2 decides if the preview button stays primary.
   LIVE TEST mascot (costs energy): pick Juicy Hazy → Mascot → generate (Premium engine
   recommended for the first) → expect ONE full-body character on white, no text; Remove BG
   → clean cutout. Then live-verify:
   footer while logged in, /studio redirect, a garbage URL shows the goblin 404, pricing copy,
   app navbar links, and the "What should Nix call you?" ask (set name → greeting updates).
2. Fox homework (accounts): Setup Week from FOX_0_TO_100K_PLAN.pdf — Fox handles (TikTok
   personal, YouTube phone-verified), park @brandgoblinai, optionally nixgoblin.com (~$13).
3. Airo paste-ins still pending (fix pack Blocks 1-3 + header Powered by NIX tagline). NOTE:
   once Fox's real social accounts exist, the dead footer icons can become real links instead
   of being removed.
4. Brand Kit download (audit item 11): verify it exists; if not, build it — biggest product
   win on the list.
5. VIDEO: script the "I audited my own app and fixed everything in a day" build-in-public
   video from this session's material (Fox requested it — waiting on the fixes being live).
6. Acquisition plan Day 1 funnel check when accounts are live.

---

## 🗓️ SESSION LOG — July 5, 2026 (DEEP DIVE AUDIT #2 + "BrandGoblin - Powered by NIX" + BYOL LIVE TEST ✅)

Cowork session. Full fresh audit of landing + app (report: `docs/DEEP_DIVE_AUDIT_JULY_5_2026.md`),
plus Fox's new brand directive: **"BrandGoblin - Powered by NIX" must be clearly stated on both
the website and the app — it's the future of what he's building.** Placement decision (Fox):
header + footer on both. Zero energy spent.

**1. ✅ BRING YOUR OWN LOGO LIVE TEST — PASSED (the July 4 open item).** Rights gate blocks
until ticked; real 2.4MB PNG upload lands tagged "⤴ Uploaded · no energy used", checkerboard,
Remove BG/Upscale chips, official logo auto-set with working hover-remove; >5MB → "Logo must be
5MB or smaller."; fake .png → "That file doesn't look like a valid image." NOT tested: free-account
locked panel (no free login available). Juicy Hazy's official logo was auto-replaced by the test
upload — RESTORED to the transparent sun/wave mark afterward. Cosmetic: big upload tiles decode
slowly (blank checkerboard at first) — note if users report "blank uploads".

**2. ✅ "Powered by NIX" IN THE APP (code done, tsc exit 0, ⚠️ NOT YET PUSHED).**
`Navbar.tsx`: "BrandGoblin / POWERED BY NIX ✨" text lockup next to the logo (hidden on
mobile-width). `Footer.tsx`: brand line is now "BrandGoblin - Powered by NIX ✨" (semibold gold)
and the bottom copyright line includes "Powered by NIX".

**3. 🌐 LANDING (Airo): NEW `docs/AIRO_POWERED_BY_NIX_PASTEINS.md`** — Block A (header tagline)
+ Block B (footer statement), one at a time as always.

**4. AUDIT FINDINGS (details in the report):** Landing: Sign In→/login FIXED ✅, 3 Studio images
live ✅, legal links live ✅; 🔴 React #418 hydration error in console on every load (Airo site);
⚠️ social icons still "#"; ⚠️ "Already have a brand?" line STILL missing. App: consoles CLEAN on
dashboard/creator-pro/studio/pricing ✅, energy widget sane (368/1,000 · 37%) ✅, pricing lists
BYOL ✅; ⚠️ bare /studio 404s (add redirect?); ⚠️ pricing "top up for $19" vs $49-default modal
copy mismatch still there; ⚠️ app footer shows Sign In/Sign Up while logged in.

**5. (Same session, part 2) 🔧 NEW `docs/AIRO_FIX_PACK_JULY_5_2026.md`** — paste-in blocks for
the 3 audit errors: Block 1 = "Already have a brand?" BYOL line (do first), Block 2 = REMOVE the
dead social icons (Fox's call — no real profiles yet), Block 3 = best-effort hydration fix
(Airo's own code; if it doesn't take, drop it — cosmetic only).

**6. 🚀 NEW `docs/CUSTOMER_ACQUISITION_PLAN_100_USERS_30_DAYS.md`** — deep-research-backed
(spun off a research agent, ~40 sourced URLs). Goal: 100 ACTIVE users in 30 days, $300 budget.
Core bets: multi-platform seeding (Reddit/communities 40-60 + launch-tour platforms 25-40 +
free AI directories 10-20 + short-form video 15-30 + $150 TikTok Spark Ads ONLY on a video that
already won organically 20-40) → ~150 signups × 65% activation ≈ 100 active. Free→Pro month-1
reality: 3-8 subs (2-5% benchmark). **NIX RIG VERDICT: NOT essential** — mascots outperform on
personality, not animation (Duolingo = costume + writing); static Nix + Fox's voiceover over
screen demos captures most of the value; rig = week-8 amplifier, built in parallel, never a
blocker. Week 1 is day-by-day; hook bank has 14 ready lines. Explicit skip list: Meta/Reddit
ads, referral build, SEO, cold email.

**7. (Same session, part 3) 📱 TIKTOK MASTERY + SPECIALIZED AGENT.** Fox doesn't use TikTok;
we're making the AI the expert so he doesn't have to be. Second research agent produced
**`docs/TIKTOK_MASTERY_FROM_SCRATCH_2026.md`** (~100 sourced links): how the algorithm actually
works (followers barely matter — every video gets its own 200-500-person test; 65%+ hold past
second 3 + 60%+ completion = escalation), myths busted (#fyp hashtags dead, posting times
nearly irrelevant, no cross-post penalty; REAL: watermarked reposts suppressed, engagement bait
-70% reach), realistic month-1 (50-500 views/video is NORMAL, "200-view jail" = calibration),
formats ranked for BrandGoblin with full timestamped scripts, weekly batch system, kill/keep/
boost decision rules, 30-day calendar that slots into the acquisition plan (first posts Day 4,
Spark decision Day 18). Flags where it supersedes the old NIX_TIKTOK_PLAYBOOK (hashtags demoted,
15-30s beats 7-15s now). **PDFs generated** for both the acquisition plan and the TikTok guide
(same filenames, .pdf, in docs/). **NEW `docs/AGENT_TIKTOK_STRATEGIST.md`** — specialized
tiktok-strategist agent definition; Cowork can't write .claude/ so INSTALL = copy its fenced
block to `.claude/agents/tiktok-strategist.md` (instructions in the file).

**8. (Same session, part 4) 📣 X + YOUTUBE MASTERY + AGENTS (same treatment as TikTok).**
Two more research agents produced **`docs/X_MASTERY_FROM_SCRATCH_2026.md`** (~60 sources) and
**`docs/YOUTUBE_MASTERY_FROM_SCRATCH_2026.md`** (~96 links), both with PDFs. X key findings:
posting into the void doesn't work (no stranger test audience like TikTok) — the engine is
10-15 quality replies/day under niche accounts; links in post body = near-zero reach (Buffer
18.8M-post study) so links go in first reply/bio only; PAY for Premium ($8/mo, from the $50
tools buffer, 6-10x impressions); post as FOX, Nix = co-star; X Communities shut down May 2026;
honest verdict: X is the LIGHT channel (~4.5 hrs/wk, 5-15 signups). YouTube key findings:
month 1 = Shorts-only, 100% repurposed from TikTok (+3-5 min/video); NEVER upload watermarked
files (documented ~25x view penalty); Shorts titles = search listings, not captions; links not
clickable near Shorts — verbal CTA + banner/About links, phone-verify day one; judge Shorts at
7 days not 48 hrs; expected 3-10 signups. **NEW agent installs: `docs/AGENT_X_STRATEGIST.md` +
`docs/AGENT_YOUTUBE_STRATEGIST.md`** (copy fenced blocks to `.claude/agents/`, same as the
TikTok one). The three strategist agents + mastery docs = the social expert bench.

**9. (Same session, part 5) 🎁 SHAREABLE GENERIC GUIDES — `docs/share/`.** Fox wanted the
research shareable with friends: all 3 mastery guides rewritten for ANY beginner (zero
BrandGoblin/Nix/Fox traces, verified by keyword sweep; examples rotate home bakery / finance
coach / indie app dev; all research + sources kept). Files: `TikTok_From_Scratch_2026`,
`X_Twitter_From_Scratch_2026`, `YouTube_From_Scratch_2026` (.md + .pdf each). Safe to send
anywhere.

**10. (Same session, part 6) ✅ AGENTS INSTALLED ON FOX'S MAC + FIRST SCRIPTS READY.**
Fox installed Claude Code (v2.1.191, Max plan, logged in) and ran `docs/install_agents.sh` —
`.claude/agents/` now has all 4: nix-animator, tiktok-strategist, x-strategist,
youtube-strategist (verified). First test drive: the tiktok-strategist wrote the FIRST 3
SCRIPTS (static Nix + voiceover + screen-record, NO rig needed) into `docs/NIX_CONTENT_QUEUE.md`
under a pinned "🎬 READY TO FILM THIS WEEK" section, above the (rig-dependent) daily batches.
Shooting packet PDF: `docs/FIRST_3_SCRIPTS_READY_TO_FILM.pdf`. Post order per plan: Scripts
1+2 on Day 4, Script 3 on Day 6; Script 2 starts the comment-loop that feeds the Day 8-14
reply-video engine. Prep before filming: generate + screen-record 3-4 brand kits in the app.

**▶ NEXT SESSION / FOX — START HERE:**
1. FILM SCRIPT 1 (packet: `docs/FIRST_3_SCRIPTS_READY_TO_FILM.pdf`). Prep the screen
   recordings first. Then Scripts 2 + 3 in the same batch session.
2. Push + deploy the Navbar/Footer "Powered by NIX" change (edited locally, NOT pushed —
   Claude Code can do it: "commit and push my changes"). Also commit the new docs + agents.
3. Feed Airo the fix pack (`docs/AIRO_FIX_PACK_JULY_5_2026.md`, Block 1 first) + the Powered by
   NIX blocks (`docs/AIRO_POWERED_BY_NIX_PASTEINS.md`), one block at a time.
4. START THE ACQUISITION PLAN — Week 1 Day 1 is the funnel check
   (`docs/CUSTOMER_ACQUISITION_PLAN_100_USERS_30_DAYS.md`). This is now THE priority per the
   manifesto (distribution is the constraint).
5. TikTok: do the account setup checklist (mastery guide section 3) + 3-5 day warm-up so the
   account is ready when the plan hits Day 4 (first posts).
6. ~~Install agents~~ ✅ DONE July 5 (all 4 verified in `.claude/agents/`).
7. Free-account BYOL check when convenient: locked gold panel + 🔒 Creator Pro link to /pricing.

---

## 🗓️ SESSION LOG — July 4, 2026 (NEW FEATURE: "Bring Your Own Logo" — Pro perk, READY TO PUSH, no migration)

Fox greenlit logo uploads after a brutal-audit discussion. DECISIONS: Pro-gated (consistent with
the already-Pro-gated official-logo feature), visible-but-locked for free users (sells the
upgrade), no energy charge, moderation from day one. Customer acquisition is Fox's next focus —
this feature exists to convert future traffic, not to move the needle alone.

**Built (tsc exit 0, NO migration — `job_type`/`model_key` are free TEXT columns):**
1. **NEW `/api/studio/upload-logo`** — multipart POST (file, brandId, rights). Auth → Pro gate →
   rights-checkbox check → PNG/JPG/WebP only, ≤5MB, 128–6000px (sharp metadata also proves it's a
   real image) → **Claude haiku VISION moderation, fail-closed** (SAFE/UNSAFE; rejects on anything
   else or on API error) → brand ownership check → inserts a COMPLETED `studio_jobs` row
   (`job_type "upload"`, `model_key "upload"`, `image_type "logo_concept"`, energy 0, provider
   "upload") → `uploadAsset` to studio-assets → **auto-`setOfficialLogo`** so stamping works with
   zero extra clicks. Bypasses `completeJob` on purpose (no reservation to finalize).
2. **Studio UI** (`StudioImageGenerator.tsx`): gold "⭐ Bring your own logo" panel under the Brand
   Kit selector (shows only when a brand is selected). Pro: rights checkbox gates the Upload
   button (PNG/JPG/WebP picker) → optimistic gallery insert + clears the brand's previous official
   logo in state. Free: same gold panel but a 🔒 "Creator Pro" link to /pricing. New `isPro` prop
   threaded from `studio/page.tsx` (server-side plan lookup).
3. **JobCard**: `job_type "upload"` handled — "⤴ Uploaded" tag, "Your file · no energy used" meta,
   checkerboard backdrop (uploads may be transparent PNGs), Remove BG/Upscale chips enabled
   (Remove BG on an uploaded white-bg logo is a common need), and official-logo button via new
   `canBeOfficial` (image/bg_removal/upload + logo_concept).
4. **Pricing page**: Pro features list gains "Bring your own logo — stamped on every product art &
   social graphic".

**✅ PUSHED + DEPLOYED July 4 (`1d1573a`).** Same session: Fox shared **The Nix Manifesto** →
saved as `docs/NIX_MANIFESTO.md` + pointer added at the top of this file (pushed `f4163f3`).
Fox is pausing the Nix rig; a BIGGER project is coming that he'll reveal soon. Next focus after
that: CUSTOMER ACQUISITION. Session closed clean — everything committed + pushed through `f4163f3`.

**▶ NEXT SESSION / FOX — START HERE:**
1. LIVE TEST Bring Your Own Logo (not yet done): (a) upload a real logo as Pro → lands in gallery
   tagged Uploaded, official gold state ON → generate product art → stamped; (b) upload without
   ticking rights → blocked; (c) try a >5MB file and a non-image → clean errors; (d) log into a
   free account → panel shows 🔒 Creator Pro and links to /pricing.
2. LANDING PAGE (Airo) still needs the "Already have a brand?" line so existing businesses know
   this exists — feature is half-shipped without it.
3. Phase 2 idea (parked): upload PRODUCT PHOTOS + AI scenes around them (image-to-image).

---

## 🗓️ SESSION LOG — July 3, 2026 PART 3 FINAL PLAN (forced transparency REVERTED — transparency is opt-in now)

**🔴 v2 (gray backdrop) ALSO failed Fox's live test:** (a) the "design must not use that gray"
prompt language made models avoid WHITE in designs entirely; (b) Velour's silver/metallic logo
matched the gray backdrop and the strip ATE the metallic parts; (c) transparent dark logos are
INVISIBLE on the dark gallery UI. LESSON: forcing transparency at generation is the wrong plan —
every backdrop color collides with some brand's palette, and prompt gymnastics distort designs.

**FINAL ARCHITECTURE (Fox-approved direction: "go back to white OR a better plan" — this is both):**
1. **Logo prompts reverted to a clean solid WHITE brand-board backdrop, zero color restrictions**
   on the design ("may freely use any colors, including white"). Logos look like they used to.
2. **NO strip at generation** — `maybeMakeLogoTransparent()` deleted from jobs.ts; originals are
   stored exactly as generated.
3. **Transparency = opt-in via Remove BG**, which for logo sources runs the local
   `stripLogoBackground()` (adaptive border-sampled color, TOL 16, feathered edge — unchanged
   from v2, it's good tech pointed at the right job now). The original is never destroyed; both
   cards coexist. White touching the backdrop still strips (physics), but the user chooses.
4. **Official-logo watermark path unchanged** — strips at stamp time from whichever version is set.
5. **NEW: checkerboard display** — `CHECKERBOARD_STYLE` exported from `StudioLightbox.tsx`, applied
   to `job_type === "bg_removal"` images in both JobCard (grid tile) and the lightbox, so
   transparent/dark logos are actually visible on the dark UI (defined in StudioLightbox and
   imported by JobCard to avoid a circular import).
**tsc exit 0. Files: cook-prompt route, jobs route, lib/studio/jobs.ts, JobCard.tsx,
StudioLightbox.tsx.** Baked bad creations (gray-eaten Velour, anti-white Juicy Hazy) — regenerate.

**✅ SHIPPED + LIVE-VERIFIED BY FOX (July 3, late night, commit `e34e2ae`):** new logos come out
clean in the white brand-board style, Remove BG produces good transparent versions, and the
official-logo watermark on brand content "looks really good" for Juicy Hazy. This logo pipeline
is DONE — don't touch it unless something new breaks.

---

## 🗓️ SESSION LOG — July 3, 2026 PART 3 (transparent logos from the start — SHIPPED, then HOTFIX v2 — BOTH SUPERSEDED BY THE ENTRY ABOVE)

**🔴 HOTFIX v2 (same session, after Fox's live test):** the first flood-fill version stripped ALL
white from logos. Two root causes: (a) the loose global "near white ≥ 225" threshold let the fill
LEAK through soft almost-white gradients into the design; (b) white-on-white is fundamentally
unsolvable — when the logo's own white touches a white backdrop, no pixel method can separate them.
Fix, two parts:
1. `stripLogoBackground()` rewritten ADAPTIVE: samples the actual backdrop color from the image
   border (median), flood-fills only pixels within a TIGHT per-channel tolerance (16) of THAT
   color, then feathers the 1px cut fringe (no bright halo on dark art). Colored backdrops are
   returned untouched (callers fall back). No `threshold` param anymore. Handles white, cream AND
   gray backdrops. Verified with 3 simulated unit tests: foam touching a gray backdrop survives,
   the soft-gradient leak path is blocked, colored backdrop skipped.
2. Logo prompts now demand a solid flat LIGHT GRAY backdrop (not white) in all 3 spots (cook-prompt
   textRule, jobs-route kit fallback, generic default) — so white/cream INSIDE the design can never
   match the backdrop color. Gray gets sampled + stripped; design whites are safe by construction.
**tsc exit 0. Pushed as `9e26f70`, later superseded by the FINAL PLAN entry above (`e34e2ae`).**

---

## 🗓️ SESSION LOG — July 3, 2026 PART 3-original (transparent logos from the start)

Fox flagged after live testing: (1) Remove BG (fal rembg, a PHOTO cutout model) butchers logo art —
it ate the white wave foam inside the Juicy Hazy logo; (2) bg-removed jobs lose the Official Logo +
More Like This buttons (only Share/Save shown); (3) logos should be transparent PNGs from the start.
All three fixed. **tsc exit 0 (sharp stubbed). NO migration needed. Not yet pushed/deployed.**

**1. NEW `stripLogoBackground()` in `logo-overlay.ts` — edge-connected FLOOD FILL.** Replaces the
global `makeNearWhiteTransparent()` (now deleted). Only near-white (r/g/b ≥ 225, same white+cream
tolerance) pixels REACHABLE FROM THE IMAGE BORDER go transparent — white shapes INSIDE the logo
(wave foam, enclosed negative space) survive. `hasRealTransparency()` now exported. The watermark
stamp path uses the flood fill too. Algorithm verified with a simulated-image unit test (border
white removed, colored ring kept, interior white kept). Known limit: white touching the border
through an open gap in the mark still strips (rare; noted for support).

**2. Logo concepts are now TRANSPARENT PNGs at generation.** `completeJob()` (jobs.ts) gained
`maybeMakeLogoTransparent()`: original (`job_type === "image"`) logo_concept jobs get the flood-fill
strip + store as image/png; if the strip yields no real transparency (colored backdrop), the
original is stored (non-fatal). Prompts now force the backdrop: cook-prompt icon textRule +
the jobs-route fallback logo prompt + the generic default all demand "solid pure white background,
no gradients/drop shadows". Manual Remove BG on logos is now mostly unnecessary.

**3. Remove BG is logo-aware.** `/api/studio/process`: when the SOURCE job is a logo_concept,
bg_removal skips fal rembg entirely and runs our local `stripLogoBackground()` (energy flow
unchanged). Photo-style art (product_art etc.) still uses fal rembg, where it belongs.

**4. Buttons restored on bg-removed logos.** `JobCard.tsx`: Official Logo + More Like This now also
show when `job_type === "bg_removal"` (backend `setOfficialLogo` always allowed it — it was a pure
UI gate). `StudioImageGenerator.handleMoreLikeThis` falls back to the currently selected engine
when the job's model_key is bg_removal/clarity_upscaler (was passing "bg_removal" as an art engine).

**Files touched:** `lib/studio/logo-overlay.ts`, `lib/studio/jobs.ts`,
`app/api/studio/process/route.ts`, `app/api/studio/cook-prompt/route.ts`,
`app/api/studio/jobs/route.ts`, `components/studio/JobCard.tsx`,
`components/studio/StudioImageGenerator.tsx`.

**▶ NEXT SESSION — START HERE:**
1. Commit + push (Fox pushes from his Mac if the sandbox blocks GitHub), Vercel deploy.
2. Live test (costs energy): (a) generate a fresh logo concept → should arrive ALREADY transparent
   (checkerboard in lightbox, downloads as .png); (b) Remove BG on an OLD logo → foam/interior
   whites intact now; (c) bg-removed logo card shows the gold Official Logo button → set it →
   generate product art → clean watermark, no white box; (d) More Like This on a bg-removed logo
   generates with the selected engine.
3. Old creations are baked — regenerate to get transparent versions.

---

## 🗓️ SESSION LOG — July 3, 2026 PART 2 (logo watermark overhaul — ⚠️ MIGRATION REQUIRED BEFORE DEPLOY)

Fox flagged: (1) logos aren't transparent PNGs, (2) the official-logo stamp puts an ugly white
square around the logo on product art/social graphics, and it stamps EVERY time with no opt-out.
All three addressed; typecheck clean (tsc exit 0, sharp stubbed).

**⚠️ RUN THIS MIGRATION IN SUPABASE **BEFORE** PUSHING/DEPLOYING** (createJobRow now inserts the
new column — deploying first would break ALL new generations):
`supabase/migrations/20260703_studio_stamp_logo.sql` — adds `studio_jobs.stamp_logo boolean
not null default true`.

**1. Watermark-style overlay (`logo-overlay.ts` rewritten).** Order of preference:
(a) logo already has real transparency (e.g. after Remove BG) → composited directly, NO white
panel; (b) opaque logo on a pure-white bg → `sharp().unflatten()` strips the white, then
composited as a watermark; (c) only a logo on a COLORED bg falls back to the white rounded badge.
"Real transparency" = alpha min < 128 && mean < 250 (ignores stray pixels). Still ~12% width,
bottom-right.

**2. Per-creation stamp opt-out.** `stamp_logo` threads: gold "⭐ Stamp my official logo" checkbox
in the Studio form (shows ONLY when the selected brand has an official logo AND the type is
product_art/social_graphic; default ON) → POST /api/studio/jobs `stampLogo` → `createJobRow` →
`maybeApplyOfficialLogo` bails when false. `stamp_logo` added to both StudioJobRow interfaces +
both full job literals (generator newJob, process route).

**3. PNG downloads.** `JobCard.handleDownload` now names the file by the REAL blob type
(png/webp/jpg — bg-removed images keep transparency instead of being renamed .jpg); share
filename uses .png for bg_removal jobs. Storage upload already handled PNG correctly.
NOTE for Fox: generated logo concepts are inherently JPEGs (image models can't output alpha) —
a true transparent PNG = run "Remove BG" on the logo (this is also what makes the watermark
stamp cleanest).

**✅ SHIPPED July 3:** migration run in Supabase FIRST (Fox), pushed (`1738793`), Vercel deployed.
**Live-verified:** stamp checkbox appears on Product Art for Juicy Hazy (gold, default ON),
console clean, energy widget breakdown correct.

**🔴 HOTFIX (same night):** Fox's first live generations still got the white badge. Root cause:
the white-removal used sharp `unflatten()`, which only strips PURE white — Juicy Hazy logo
concepts sit on CREAM/off-white (brand palettes love cream). Replaced with
`makeNearWhiteTransparent()` (raw pixel pass, r/g/b all ≥ 225 → transparent) so white AND cream
backgrounds strip; brand colors (golds/teals/oranges) untouched. Also: Seedream negative prompt
extended (cut-off text, cropped letters, white banner/panel) after an Artistic-engine social
graphic drew a giant clipped "Juicy Haz" white banner into the art itself. TWO separate issues
in Fox's screenshots: (1) badge = the cream bug (fixed); (2) big white band with clipped brand
name = the ARTISTIC ENGINE drawing text (mitigated via negative prompt — Premium is still the
text-safe engine). NOTE: gallery thumbnails crop landscape social graphics square (object-cover),
so a bottom-right stamp can LOOK clipped in the grid — the stored image is fine (lightbox/download).
Old creations are baked — regenerate to get the watermark.
**▶ REMAINING LIVE TEST (costs energy — Fox):** generate product art with the official logo set
(ideally Remove-BG the logo + re-set official first) → logo should sit directly on the art, NO
white box; untick the checkbox → no logo; download a bg-removed image → lands as .png.

---

## 🗓️ SESSION LOG — July 3, 2026 (backlog bug sweep — 5 fixes SHIPPED, commit `3d103d1`, deployed + partially verified)

Cowork session. Knocked out the July 2 bug backlog. **Committed `3d103d1`, Fox pushed from his
Mac (sandbox network blocks GitHub), Vercel deployed. LIVE-VERIFIED: /dashboard/creator-pro
console is CLEAN (hydration errors gone) and the energy widget now reads "Fully charged ·
1,520 ⚡ / 0 monthly + 1,520 refill". Still needs Fox's hands: Save to Photos click test,
official-logo hover state, smaller badge on a fresh product art.**

**1. 🔴 Hydration errors were NOT fully fixed — found + fixed the real remaining source.**
Verified live in Chrome: /dashboard console is CLEAN, but /dashboard/creator-pro still threw
React #425/#418/#423 on load. Root cause: `CreatorProHub.tsx` Recent Generations rendered
`new Date(item.created_at).toLocaleDateString()` — server (UTC) and Fox's browser (UTC+7)
print different strings. Fixed with `formatCreatedDate()` (pinned en-US locale + UTC timezone =
deterministic on both sides). EnergyWidget's date is safe (renders only after client fetch).
**▶ verify /dashboard/creator-pro console clean after deploy.**

**2. Studio "Save to Photos" dead on desktop Chrome — FIXED.** Desktop Chrome reports
`canShare({files})` = true, but rejects the real `share()` call because the user-gesture window
expires during our image fetch → old code silently fell through to copying the URL. Now:
new `isTouchDevice()` in `share.ts`; `JobCard.handleSave` only takes the share-sheet path on
touch devices, desktop always downloads, and if the sheet never truly opened ("failed"/"copied")
it downloads as a safety net ("cancelled" respected, no download).

**3. Energy meter over-max display — FIXED in both meters.** When the refill bucket pushes the
balance past the monthly allowance ("1,520 / 1,000 · 100% remaining"): EnergyWidget now shows
"Fully charged · 1,520 ⚡" + a "1,000 monthly + 520 refill" breakdown line; the dashboard meter
(DailyCreatorDashboard) shows "1,520 ⚡ (1,000 monthly + 520 refill)"; bar width capped at 100%.
API untouched (it already returns monthlyRemaining/refillRemaining).

**4. "Brand switch resets What-to-Create" — NOT REPRODUCIBLE.** Tested live in Chrome: selected
Product Art, switched Fossil Fuel → Velour → free-form → Juicy Hazy; the selection survived every
switch, and no code path resets it. Likely real cause of the mislabeled bag job: the "Not sure?
Try:" spark links — "playful mascot scene" / "minimalist logo card" silently switch the type to
logo_concept. ALSO fixed a real adjacent hazard: after a brand switch the prompt box still holds
the PREVIOUS brand's prompt until Nix re-cooks (saw a FOSSIL FUEL bag prompt under Velour) —
Conjure is now disabled while `isCooking` ("✨ Nix is writing your prompt…") so you can't
generate cross-brand art in that window.

**5. Official-logo badge — shrunk 18% → 12% width** (min 96→80px) in `logo-overlay.ts`; reads as
a signature, not a sticker. **Unset toggle:** backend always supported official:false — the UI
button toggles too, but "✓ Official logo" read as a status label, not a button. Now hovering it
shows "✕ Remove official logo" (red tint) so unsetting is discoverable. No API change.

**Files touched:** `CreatorProHub.tsx`, `EnergyWidget.tsx`, `DailyCreatorDashboard.tsx`,
`studio/JobCard.tsx`, `studio/StudioImageGenerator.tsx`, `lib/studio/share.ts`,
`lib/studio/logo-overlay.ts`.

**▶ NEXT SESSION — START HERE:**
1. ~~Commit + push~~ ✅ DONE (`3d103d1`, pushed by Fox, Vercel deployed green).
2. Live-verify: (a) ~~creator-pro console clean~~ ✅ VERIFIED; (b) ~~Save to Photos on desktop
   Chrome~~ ✅ VERIFIED by Fox (file downloads); (c) ~~energy meter breakdown~~ ✅ VERIFIED
   ("Fully charged · 1,520 ⚡ / 0 monthly + 1,520 refill"); (d) hover a gold "✓ Official logo" →
   shows the remove state (Fox); (e) generate one product art with an official logo set → badge
   noticeably smaller (~12% width) (costs energy — Fox's call).
3. Backlog still open: spark links silently switch What-to-Create (consider a visible flash/toast
   on type change); Studio Lightbox real-phone test.

---

## 🗓️ SESSION LOG — July 2, 2026 PART 2 (audit fixes SHIPPED: landing images live, celebration fixed, hydration fixed)

Same day as the audit below — Fox + Claude knocked out the fix-first list. Status:

**✅ DONE + VERIFIED LIVE:**
1. **Landing "Sign In" → /login** — fixed via Airo paste-in, verified live (was /signup).
2. **3 broken landing images REPLACED + LIVE** — the "Now Nix designs the visuals, too" section
   now shows real Studio art: Fossil Fuel coffee bag, Velour serum, Juicy Hazy surfboard.
   Files also saved on Fox's Mac: `~/Desktop/brandgoblin products/`. NOTE: if they ever look
   broken in a browser, it's cached 404s — the files serve 200 fine.
3. **Refill celebration FIXED + VERIFIED LIVE** (commit `594db10`): root cause was
   `router.replace` stripping ?refill=success which re-rendered the server page and unmounted
   the overlay instantly. Now `window.history.replaceState`. Verified in-browser: Nix, sparkles,
   bar fill, Let's build CTA all work at /dashboard/creator-pro?refill=success.
4. **Dashboard hydration errors FIXED** (commits `594db10` + `c781374`): greeting
   (getTimeOfDay), random Nix line (Math.random), and Today's Idea (local day-of-year) were all
   computed during SSR AND client render with different results (server=UTC, Fox=UTC+7) →
   React #418/#423/#425. All three now render stable values on the server and set real values
   in the mount effect. First fix verified live; `c781374` pushed at session end —
   **▶ verify console is clean on /dashboard next session.**

**🎨 NEW PRODUCT ART generated this session (Premium tier, in `~/Desktop/brandgoblin products/`):**
- `fossil-fuel-primal-brew-bag.jpg` — FOSSIL FUEL brand + PRIMAL BREW amber banner (T-Rex skull).
  Tiny fine-print slop remains at the bag bottom, invisible at web size.
- `velour-product-art.jpg` — golden serum bottle, marble, silk, VELOUR label. Flawless.
- `juicy-hazy-product-art.jpg` — the surfboard shot (clean, no badge).
- Surfer-wearing-shirt experiments (v1 badged, v2 all-orange logo) REJECTED by Fox — skip that
  concept. LESSON LEARNED for prompts: multiple small text lines garble; two big text elements
  max, spell them out explicitly, ban fine print.

**🐛 NEW BUGS SPOTTED (not yet fixed, add to backlog):**
- Studio "Save to Photos" button does nothing on desktop Chrome (no file lands in Downloads).
- Official-logo badge is stamped fairly large (~18% width) and can cover subject matter;
  consider smaller badge or per-job opt-out toggle.
- Energy meter shows "1,520 / 1,000 · 100% remaining" when refill bucket exceeds monthly
  allowance — confusing display math.
- Switching brand in Studio resets What-to-Create back to Logo Concept (one bag job got saved
  as job_type logo_concept because of this).
- Official logo can only be SET from the UI; unsetting required a direct API POST
  (`/api/studio/official-logo` with `official:false`). Consider a toggle-off in JobCard.

**Energy spent:** ~278 total (audit tests 8 + Premium bag 45 + garbled bag retry 45 + Velour 45 +
surfer v1 45 + surfer v2 45 + first Standard bag test 4 + misc). Balance ~1,520.

---

## 🗓️ SESSION LOG — July 2, 2026 (DEEP DIVE AUDIT — live walkthrough of landing + app, all in-browser)

Full fresh-eyes audit of brandgoblinai.com and app.brandgoblinai.com in Chrome on Fox's logged-in
account. Complete findings in `docs/DEEP_DIVE_AUDIT_JULY_2_2026.md`. Summary:

**✅ VERIFIED WORKING (closed these open items):**
- **Hex-code bug fix + brand-name rendering CONFIRMED** (the June 26 FOX TODO): generated a live
  Product Art for Juicy Hazy. Clean brand name "JUICY HAZY" on the art, zero hex/gibberish.
- **Official Logo feature CONFIRMED end to end:** gold star set on a logo concept, regenerated
  product art, exact logo badge composited bottom-right. Works.
- **Refill modal defaults to $49 Value pack** with savings tags. Works.
- **Teaser hero works** ("a candle brand for book lovers" → "Bookwick" in seconds).
- **Landing:** FAQ + pricing Agency-free (Block 7 ✅), legal footer links live at /privacy /terms
  /refund (Block 5 ✅ — paid traffic unblocked), showcase iframe embedded before Pricing (Block 8 ✅).

**🔴 NEW BUGS FOUND (fix-first list):**
1. Landing **"Sign In" links to /signup** not /login (both nav + mobile). Block 11 still NOT done.
2. Landing Goblin Studio section shows **3 broken images** (airo-assets nix-visuals-example-1/2/3
   don't load) right under the hero. Block 3 half-done: tags exist, files missing. Re-upload in Airo.
3. **Refill celebration never appears** on /dashboard/creator-pro?refill=success (tested 3x live).
   Needs code look at RefillCelebration mount conditions.
4. **React hydration errors (#425/#418/#423)** in console on /dashboard/creator-pro — likely the
   server-rendered time-of-day greeting; may be related to bug 3.

**⚠️ Minor:** dead "#" social icons in landing footer; energy meter shows "1,790 / 1,000 · 100%
remaining" (confusing over-max display); pricing-page "top up for $19" vs $49-default modal copy
mismatch; duplicate Studio pitch sections on landing (Block 9 optional); some showcase art reads
black-on-black in the dark marquee.

**Spent:** 8 energy (2 Standard product arts) on Fox's account for the live test.

---

## 🗓️ SESSION LOG — June 29, 2026 (NIX RIG — puppet LIVE in Character Animator ✅, next = webcam test)

Massive session. The rigged Nix is now imported and auto-tagged inside Adobe Character Animator, one
step from moving on camera. Voice plan + strategy locked. Read this whole entry before resuming.

**DONE this session:**
- **PSD cleaned + grouped + re-saved** (`brandgoblin-ai/nix-puppet.psd`, ~7.1MB):
  - Deleted the redundant `Layer 1` backup. KEPT one full-Nix copy at the very bottom, renamed
    **`Nix Full`**, as a static backstop/fill so no white gaps show when parts move (this is the fix
    for the "paint behind the limbs" problem, done the easy pro way with a fill layer).
  - Reordered so eyes + eyebrows sit ABOVE the `Head` base art.
  - Grouped into a **`Head`** group (Head base + Right/Left Eye + Right/Left Eyebrow) and a **`Body`**
    group (Torso + Right/Left Arm + Right/Left Leg). Verified with ImageMagick: both groups present,
    all 10 pieces + fill, correct stacking.
- **Expressive-face DECISION locked.** Test-composited a harvested mouth onto the front face = looked
  BAD (warmer skin patch, scale/lighting mismatch, original smile ghosting through). So NO per-mouth
  lip-sync for v1. Approach = **expression swaps** (whole on-model poses: neutral / grin / shocked /
  celebrating) + rig motion (head bob, eyes, eyebrows, blinks) + **voiceover**. True synced talking
  mouth = a later rung (drawn viseme set for 2D, or Live2D / 3D).
- **Strategy for "fully alive, Pixar-level, speaking Nix" (Fox's north star) mapped — 3 rungs:**
  1. NOW: 2D puppet (this) for TikTok/Shorts. Cheap, this week.
  2. NEXT: proper expressive rig + real voice. For the **Nix Creative Companion app**, the right tech
     is **Live2D** (real-time talking avatar). For 2D video lip-sync, a small drawn mouth set (paid
     illustrator). Voice via **ElevenLabs** is the easy, already-solved part.
  3. LATER (true Pixar): a **3D Nix model + rig** (hire a 3D artist or learn Blender), audio-driven
     facial lip-sync. Real money/time, funded by the audience built on rungs 1-2.
  Key point: don't skip rungs; each funds the next; today's 2D work is the foundation, not throwaway.
- **VOICE plan + new doc `docs/NIX_VOICE_BIBLE.md`.** Nix = ~13-year-old goblin: young, charismatic,
  funny, positive, a little magical, Pixar-sidekick energy. PLAN: Fox records his own Nix performance
  (he has VO skills) and CLONES it in ElevenLabs = an ownable, unique voice that also auto-generates
  lines for automated content. Bible has full voice direction, a recording script, and ElevenLabs
  setting tips. Don't over-pitch when recording (clones cleaner).
- **TOOL research (Mac reality, learned the hard way):**
  - **Cartoon Animator 5 is WINDOWS-ONLY** (v4 was the last Mac build). Ruled out.
  - Adobe Character Animator **Starter mode is free but CANNOT import a custom PSD** (Pro-only).
  - Fox already has an Adobe account (Lightroom) → **chose Adobe Character Animator (Pro)**. Note:
    the Photography plan may not include it, so it may run on the 7-day trial / need a single-app sub.
- **IN CHARACTER ANIMATOR NOW:** installed, imported `nix-puppet.psd`, opened in Rig. **Auto-tagging
  SUCCEEDED** — `Head` and `Body` both got the crown (recognized as independent groups), all 5 face
  parts recognized inside Head (8 tagged items total). Nix renders whole + on-model. `Nix Full` sits
  at the bottom untagged as the static backstop.

**▶ NEXT SESSION — START HERE (in Character Animator):**
1. Click **Record** (top). Allow webcam + mic. If the stage is empty, drag `nix-puppet` from the
   Project panel into a new Scene.
2. Sit facing the webcam, neutral face centered, and **Set Rest Pose** to calibrate.
3. Test the performance: head turn/tilt, eyes, eyebrows, blinks should mirror you. EXPECTED LIMITATION:
   there is no `Mouth` viseme layer, so the mouth won't lip-sync in v1 (by design). Record a short take.
4. Then: set up **expression-swap triggers** from the full poses; export a first clip; composite onto a
   real scene in CapCut (walkthrough Part 4); add the ElevenLabs voice.

**Open task list:** #4 install/import CA (basically done), #5 dances (superseded by CA path), #6 CapCut
composite, #7 expression-swap set, #8 record+clone Nix voice.

---

## 🗓️ SESSION LOG — June 28, 2026 (NIX RIG — puppet cut + saved ✅, expressive face NEXT)

Big progress on the Nix rig (the distribution blocker). Followed `docs/NIX_RIG_WALKTHROUGH.md` Part 1.

**DONE this session:**
- **New rig base art.** Fox generated a clean front-facing Nix (straight on, arms slightly out,
  neutral mouth) and saved it transparent. File: `brandgoblin-ai/Nix-front.PNG` (1024x1536, true
  alpha, on-model: green skin / purple hair / pointed ears / purple NIX hoodie / gold trim). Verified
  the cutout edges are clean (no glow halo). This replaces the old "need a clean front pose" art ask.
- **Cut Nix into 10 named layers in Photopea**, all on-model, names verified with correct capitals:
  `Head`, `Right Eye`, `Left Eye`, `Right Eyebrow`, `Left Eyebrow`, `Torso`, `Right Arm`, `Left Arm`,
  `Right Leg`, `Left Leg`. (Left/Right = character's own, mirrored from viewer.) Method used =
  beginner-safe copy-part-onto-its-own-layer off two full-Nix backup copies (`Layer 1` + `Background`,
  both still in the file). Torso cut generous at shoulders/hips/neck so limbs+head overlap with no gaps.
- **Saved checkpoint PSD:** `brandgoblin-ai/nix-puppet.psd` (~11.5MB, all layers intact). Confirmed
  via ImageMagick that every named layer is present as its own piece.

**DECISION:** Fox wants the FULL DELUXE expressive face (blinking eyes + talking mouth + personality/
humor/range), not the simple 6-piece puppet. He wants Nix to "feel fully alive."

**▶ NEXT SESSION (do this first):**
1. **Build the expressive face WITHOUT freehand drawing.** Harvest on-model mouth shapes
   (Neutral, Smile, Surprised, Aa, Oh) and extra expression poses from Fox's EXISTING approved Nix art
   (`/public/nix/nix-master-sheet.png` has a 12-expression sticker row; plus `happy-waving`, `thinking`,
   `working`, `celebrating`, `sleeping`, `conjuring` pose PNGs). This keeps everything on-model and
   respects the "never redraw Nix" rule. Align harvested mouths over the puppet's mouth area in Photopea.
2. Add `Left Blink` / `Right Blink` closed-eye shapes (simple lid over each eye).
3. Group into `Head` group (head, hair if split, ears, eyes, eyebrows, blinks, mouths) + `Body` group.
4. Hide/delete the two full-Nix backup layers (`Layer 1`, `Background`) before the Character Animator
   import. Original art is safe in `Nix-front.PNG` so deleting is fine.
5. Re-save `nix-puppet.psd`, then move to Part 2 (prove the rig in Adobe Character Animator).

---

## 🗓️ SESSION LOG — June 26, 2026 (Studio product-art fixes + Official Logo overlay) — ✅ SHIPPED + DEPLOYED (commit `4abc816`)

Fox flagged two Studio product-art bugs (hex color codes printed on the artwork like "#D41208" /
"2CCC22", and the brand name either missing or garbled), plus requested an "official logo" feature.
**All built, migration run in Supabase, pushed (`c2101a7..4abc816`), and Vercel deployed GREEN.**
The only thing left is the live in-browser test (deferred — see FOX TODO below).

**Root cause of the junk codes:** the cook-prompt system prompt had a "PALETTE LOCK" rule that forced
the LITERAL hex codes into the image prompt — and image models print any "#"/numbers they see as text
on the artwork. A second leak lived in the `jobs` fallback builder (raw `c.hex`). The brand name was
also explicitly suppressed ("no brand names embedded in the image").

**Fixed (Bugs):**
- **NEW** `src/lib/studio/color-names.ts` — `hexToColorName()` + `paletteToWords()`. Converts the brand
  palette to plain WORDS (e.g. "deep crimson, charcoal, gold"). Hex never reaches an image prompt again.
- `src/app/api/studio/cook-prompt/route.ts` — palette now passed as words; PALETTE LOCK replaced with a
  plain-words colour rule + an explicit "no hex/#/numbers/gibberish" ban. For **product_art** and
  **social_graphic** the model is now told to render the brand name spelled EXACTLY as the brand's name,
  as the ONLY text. Logo concepts stay icon-only (in-image text garbles).
- `src/app/api/studio/jobs/route.ts` — fallback builder uses `paletteToWords` (no hex), renders the exact
  brand name on product/social, bans junk; Seedream negative prompt extended (hex codes, gibberish,
  watermark, qr/barcode).

**NEW FEATURE — Official Logo overlay (exact logo on product art):**
Text-to-image can't reuse an exact logo, so we STAMP it on after generation.
- **MIGRATION TO RUN:** `supabase/migrations/20260626_studio_official_logo.sql` — adds
  `studio_jobs.official_logo` + a partial unique index (one official logo per user+brand). Run it in the
  Supabase SQL editor BEFORE the deploy goes live.
- **NEW DEP:** `sharp` added to `package.json` (Vercel installs on deploy; image compositing).
- **NEW** `src/lib/studio/logo-overlay.ts` — `compositeLogoBadge()`: places the saved logo on a clean
  white rounded badge, bottom-right (~18% width). Works for transparent OR opaque logos.
- `src/lib/studio/jobs.ts` — `official_logo` on `StudioJobRow`; `setOfficialLogo()` (one-per-brand,
  ownership + completed-logo_concept checks), `getOfficialLogoStoragePath()`, and `completeJob()` now
  stamps the official logo onto ORIGINAL `product_art`/`social_graphic` jobs (non-fatal; sharp is
  dynamically imported). Overlay only on originals (`job_type === "image"`), never bg-removal/upscale.
- **NEW** `src/app/api/studio/official-logo/route.ts` — POST `{ jobId, official }`, Pro-gated.
- **UI:** `JobCard.tsx` gets a GOLD "⭐ Make this my official logo" / "✓ Official logo" button on
  completed original **logo concepts**; `StudioImageGenerator.tsx` wires `handleSetOfficialLogo`
  (optimistic, clears the brand's previous official logo). `src/types/index.ts` + the two full
  `StudioJobRow` literals (generator newJob, process route) updated with `official_logo: false`.

**✅ DONE June 26:** migration run in Supabase, temp files deleted, pushed (`4abc816`), Vercel deployed green.

**▶ FOX TODO NEXT SESSION (live test — the only open item here):**
1. Generate a product art for a brand with NO official logo set → confirm clean brand name + zero hex
   codes/gibberish (the bug fix).
2. On a finished logo concept, click the gold "⭐ Make this my official logo" button, then regenerate
   product art for that brand → confirm the logo badge appears bottom-right (the new feature).
3. Tip if a name still looks rough: the "Premium" engine renders text best. For the cleanest logo badge,
   run "Remove BG" on the logo before setting it official (transparent logo).

---

## 🗓️ SESSION LOG — June 26, 2026 (app conversion overhaul + 2 LIVE bug fixes + website/growth)

Focus: align the APP with the new website conversion system (orange = action, GOLD = premium Studio)
and maximize the refill / Pro-upgrade money path. Fox worked the Nix rig in parallel.

**Shipped + LIVE (pushed to main, Vercel deployed, visually verified in-browser):**
- **Orange "Refill Creative Energy" CTA on the dashboard energy bar** (`DailyCreatorDashboard.tsx`,
  commit `f2a9cf2`) opens the existing `EnergyRefillModal`. Connected to the bar so it catches users at
  the moment they check balance. Pro + free.
- **Free users now see the energy meter + orange refill button** (was Pro-only; energy is now fetched
  for everyone since free users hold starter energy), plus a **rebuilt free upgrade card** with Nix +
  the full Creator Pro perks list + orange upgrade CTA (commit `266b66f`).
- **Color system standardized app-wide to match the website** (commit `4685484`): `btn-primary` flipped
  from the purple-green gradient to ORANGE (`#FF6B35` to `#FF8C42`) + orange `pulse-glow` keyframe;
  Generate-button glow orange; `EnergyWidget` refill button now solid orange (was soft purple),
  zero-state top-up outlined orange so the solid-orange Upgrade stays dominant. Purple stays the BRAND
  color (glows, borders, badges, XP bar); GOLD stays Studio's signature. Rule now: orange = clickable
  action only.
- **Refill modal optimized for AOV** (`EnergyRefillModal.tsx`, in `4685484`): now defaults to the **$49
  "Best Value" pack** (was the cheapest $19), with savings tags ("Save 14%", "Save 26%") + human
  capacity ("~100 / ~300 / ~700 social posts").

**Two LIVE bugs found via in-browser testing + fixed:**
1. **$49 and $99 refill packs threw "Invalid refill pack."** The Stripe prices existed but the Vercel
   env vars `STRIPE_PRICE_ID_ENERGY_3000` / `STRIPE_PRICE_ID_ENERGY_7000` were not wired. **Fox set both
   env vars (and confirmed each price carries metadata `energy_amount` = 3000 / 7000 so the webhook
   grants the right energy) and redeployed. Verified: the $49 pack now creates a live Stripe checkout
   session.**
2. **Post-checkout redirect dead-ended on ERR_CONNECTION_CLOSED.** `NEXT_PUBLIC_APP_URL` had a trailing
   dot (`https://app.brandgoblinai.com.`), so the success_url failed SSL host matching. **Fox fixed the
   env var (removed the dot) + redeployed. Verified: the success URL loads.** Also hardened in code so a
   stray trailing dot/slash is stripped automatically (`src/app/api/stripe/checkout/route.ts`).
   ✅ PUSHED June 26 (commit `f958566`, `4685484..f958566`) — Fox committed + pushed from his Mac.

**Website (Airo) — new doc `docs/GODADDY_LANDING_BRIEF_V5_PASTEINS.md`** = source of truth for the
remaining Airo edits, fed ONE block at a time. Audited the live site: Blocks 1/2/4/6 already done.
**Still to feed Airo:** Block 3 (add 3 real Studio images), Block 5 (dead footer legal links — MUST do
before paid traffic), Block 7 (FAQ still names the killed "Agency" tier), Block 8 (move the showcase
wall down to just before Pricing — fixes two orange sections back-to-back + puts social proof at peak
intent), Block 10 (orange = buttons / GOLD for the Goblin Studio "Make it." highlight + badge),
Block 11 ("Sign In" should link to /login not /signup). Block 9 optional (merge the 2 duplicate value
sections). NOTE: feed Airo one block at a time; it ignores multi-part prompts.

**Growth strategy (talked through, no doc — organic-first, under $300/mo, Fox on QC):** the flywheel is
"Nix brands a stranger's idea on camera in under 2 min" → comment-bait content engine (the audience
fills the queue) → free signup → magic reveal → one-tap share (carries the watermark) → repeat. Blocked
on the Nix rig (Fox's current task). Channels: short-form video (TikTok/Reels/Shorts) is ~80%; the
built-in share loop is already live; public brand pages for SEO are the next build; gift-energy referral
is the multiplier; spend the $300 only on TikTok Spark Ads boosting a proven organic winner.

**▶ STILL OPEN going into next session:** Studio + pricing-page visual audit not yet done.

**✅ CLOSED June 26 (commit `f958566`, pushed `4685484..f958566`):** (a) checkout-hardening commit is
now pushed + live; (b) `EnergyWidget` refill button no longer hardcodes "$19" — price dropped from the
label so it matches the $49-default modal. Both touched only `src/app/api/stripe/checkout/route.ts` +
`src/components/EnergyWidget.tsx`.

---

## 🗓️ SESSION LOG — June 23–24, 2026 (shipped a LOT; app is in strong shape)

**Shipped + live this session:**
- **Preview as a Live Webpage + richer website copy** (`renderSite.ts`, `/brand/[id]/preview`,
  PreviewActions) + **template polish** (premium/editorial; `pickTheme` now picks light/dark from the
  brand's *background swatch*, contrast-safe on dark+light). Verified by headless-Chrome render pass.
- **Phone-first Studio sharing** (`5feee15`): `shareImageFile()` (native share sheet with the real FILE →
  IG/TikTok/X/Save-to-Photos), Save-to-Photos button, and a full-screen **StudioLightbox** (click a
  creation → big view with Share/Save/More/Favorite/Download in it). ▶ NEEDS a real-phone test.
- **Robust clipboard** fix across all copy buttons (`src/lib/clipboard.ts`).
- **Homepage**: How-It-Works anchor + orange "Try It Free" CTA + live showcase wall. **Airo landing**:
  showcase wall embedded + "Real brands, really made by Nix" header.
- **Freemium conversion** (`d40520b`) — see section below. SHIPPED; smoke test pending.

**Decisions locked:**
- **Keep the name "BrandGoblin AI"** (rename audit: good `.com`s all taken/premium; name isn't the bottleneck).
- **Freemium model** (no 7-day trial): free tier + Studio taste (250 energy) + Pro $19/mo + $19 top-ups.
  Free starter grant cost ≈ $0.45 max/user. Pro-cancel **preserves** remaining energy (friendliest).

**Marketing / growth groundwork (docs/):** `NIX_TIKTOK_PLAYBOOK`, `NIX_CONTENT_AUTOMATION_PLAN`,
`NIX_CONTENT_QUEUE` (daily Idea Engine scheduled ~7am — already producing batches), `NIX_COMPANION_VISION`,
`NIX_ANIMATION_RESEARCH`, `NIX_RIG_WALKTHROUGH`, `LAUNCH_YOUR_BRAND_NEXT_STEPS`, plus a `nix-animator`
Claude Code agent + output style (in `.claude/`). `CREATIVE_CHECKLIST.md` (repo root) = Fox's shared
checkbox board.

**▶ QUEUED, NOT YET BUILT (briefs ready in docs/):**
- `LAUNCH_NEXT_STEPS_BUILD_BRIEF.md` — in-app "Now what?" launch guide + printable fact sheet.
- `GODADDY_LANDING_BRIEF_V4_FREEMIUM.md` — Airo landing reposition (publish AFTER app freemium smoke-tests).
- `STUDIO_FREE_TASTE_AND_UPSELL_BRIEF.md` — superseded/absorbed by the freemium build (the Nix "Create in
  Studio" upsell CTA can still be added).
- `GOBLIN_STUDIO_MEMES_AND_PRODUCT_ART.md` — fix category-blind product art + add a Meme Generator (backlog).
- `STUDIO_UX_AND_MONETIZATION_BACKLOG.md` — remaining Studio polish (juice, etc.).

**THE REAL NEXT MOVE (Fox's hands, not CC's):** the **Nix rig** (`NIX_RIG_WALKTHROUGH.md`). The whole
content/distribution engine is blocked on Nix being animatable. App is great; growth needs the goblin moving.

---

## 🔁 FREEMIUM CONVERSION — killed 7-day trial + Agency tier (SHIPPED ✅ June 24, 2026 — commit `d40520b`)

Per `docs/APP_FREEMIUM_CONVERSION_BRIEF.md`. Moved the app from a 7-day full-Pro trial → a lasting
free tier. **Pushed to main; migration applied in Supabase BEFORE deploy (correct order).**
**▶ Next: run the 4-flow smoke test once Vercel is green** (new signup gets 250 → free out-of-energy
upsell → Pro upgrade → Pro cancel keeps energy), THEN publish the Airo V4 landing copy so site matches.

**✅ MIGRATION APPLIED:** `supabase/migrations/20260624_free_studio_starter.sql` added
`users.has_received_free_studio_grant boolean default false` (run in Supabase June 24, before the push).
A separate flag from `has_used_trial` on purpose — existing free users already have `has_used_trial=true`,
so reusing it would strand them.

**Model now:**
- **Free (no clock):** brand kits + a ONE-TIME Goblin Studio starter energy grant
  (`FREE_STUDIO_STARTER_ENERGY`, default 250, env-tunable) added to the persistent refill bucket +
  free Nix goodies. No 7-day Pro window, no day-7 revoke.
- **Creator Pro ($19/mo):** unchanged — unlimited brands, content engine, monthly energy, top-ups.
- **$19 top-up:** now available to free users too (EnergyWidget surfaces it).

**Key behaviour changes:**
- `lib/trial.ts`: `startTrialIfEligible` → `grantFreeStudioStarterIfEligible` (same anti-abuse guards:
  verified email, one-per-normalized-email, IP cap — re-keyed to the new flag). Atomic flag claim =
  race-proof, no double-grants. `expireTrialIfNeeded` no longer revokes energy.
- `lib/energy.ts`: new `grantStudioStarterEnergy` (refill bucket, `starter_grant` ledger) +
  `downgradeToFree` (Pro cancel PRESERVES all remaining energy — no revoke-to-zero). Legacy
  `revokeEnergy` retained but unwired.
- **Goblin Studio is now open to anyone with energy** (was paid-Pro-only). `/api/studio/jobs` drops the
  plan gate; `reserveEnergy`'s 402 is the gate. `/api/energy/balance` + `EnergyWidget` show free-tier
  balance. Content engine stays Pro-only.
- Stripe webhook cancel/delete paths → `downgradeToFree`. `/api/trial/expire` cron no longer revokes.
- **Removed UI:** Agency Edition tier (landing PLANS + pricing page + waitlist modal usage),
  `TrialCountdownBanner` + `TrialEndScreen` (deleted). All "7 days / 7-day trial" copy rewritten to the
  freemium framing across HeroInteractive, `page.tsx`, `pricing/page.tsx`, studio page. (`AgencyWaitlistModal.tsx`
  + `/api/agency/waitlist` left orphaned; `"agency"` kept in the `Plan` type.)
- **Migration of existing users:** Pro untouched; existing free/expired get the 250 once via the flag;
  mid-trial cohort reads as Pro until `trial_ends_at`, then `is_trial` clears with energy preserved.
- **Post-merge TEST:** new signup grant, free out-of-energy upsell, Pro upgrade, Pro cancel→free (energy kept).

---

## 🆕 FEATURE — "Preview as a Live Webpage" + Richer Website Copy (built June 22, 2026 — additive, awaiting push)

Turns "we generate copy" into "we hand you a real, downloadable website." Per
`docs/WEBSITE_PREVIEW_AND_COPY_BRIEF.md`. Additive only — no energy/Stripe/auth/trial changes; all
new `WebsiteCopy` fields are OPTIONAL so existing brands typecheck, render, preview, and export.

- **One renderer (source of truth):** `src/lib/website/renderSite.ts` → `renderBrandSiteHTML(kit)`
  returns a complete, self-contained HTML doc (inline `<style>`, escaped text, conditional sections,
  `<title>`/`meta description`, `prefers-reduced-motion`-safe). `pickTheme(colors)` derives a
  **contrast-safe** theme from `kit.colorPalette` using WCAG relative luminance + contrast ratios
  (auto dark/light, guaranteed-readable text + accent) — verified readable on both dark (REPLICATE)
  and light palettes.
- **Preview route** `src/app/brand/[id]/preview/page.tsx` — mirrors the print page's auth + ownership
  load, then renders `<iframe srcDoc={html} sandbox="allow-same-origin">` so the preview is
  byte-identical to the download.
- **`PreviewActions`** (`src/components/preview/PreviewActions.tsx`) — Download HTML (Blob), Copy HTML
  (`copyToClipboard` + toast), Back to kit.
- **Entry points:** 👁 Preview as Webpage link in the Website Copy section of `BrandKitView`; a
  "Preview Website" action card in `BrandActions`.
- **Richer copy:** `WebsiteCopy` gains optional `seoTitle`, `metaDescription`, `secondaryCtaText`,
  `features[]`, `faqs[]`, `footerTagline`, `emailCaptureHeadline`. Both `prompts.ts` schema blocks +
  the `websiteCopy` section-reroll schema generate them; `BrandKitView` renders each (with copy
  buttons) only when present.
- **Status:** `tsc` + `npm run build` clean. **Deferred:** featuring live previews in the showcase.
  **Out of scope:** custom domains / hosting (user downloads the HTML).
- **Template polish (June 24, 2026 — per `docs/PREVIEW_TEMPLATE_POLISH_BRIEF.md`):** the preview
  template now looks *designed*, not generic. Thin wide-tracked heading type + a short uppercase
  accent **kicker**; the loud solid CTA is gone — primary CTA is now an **outlined accent button**
  with a faint tint + soft glow, secondary is a text link with an arrow; faint radial hero glow,
  hairline section dividers, subtle `bg2→bg` top gradient; clean 2-col features grid with
  accent-tinted numbered markers; static-accordion FAQ; minimal footer. `pickTheme` now returns
  `bg/bg2/text/muted/accent/accentRgb/border` and uses the accent ONLY for borders/text/tints/glow
  (never a solid fill); the accent is auto-nudged toward the text pole until it clears WCAG AA on the
  bg. Verified in Chrome on REPLICATE (dark), an all-light pastel palette, and a legacy bullets-only
  kit. **One renderer unchanged** → preview iframe == downloaded HTML.

---

## 🆕 SESSION LOG — June 22, 2026 (Showcase fix + marketing/content engine groundwork)

**1. Showcase static-render fix — SHIPPED ✅ (commits `7d3001d` + doc `7499910`, pushed to main).**
The `/showcase` and `/embed/showcase` pages were statically generated as EMPTY (before anything was
featured) and served frozen HTML even though `/api/showcase` returned the 7 items. Fix: added
`export const dynamic = "force-dynamic"` to both `src/app/showcase/page.tsx` and
`src/app/embed/showcase/page.tsx`, and made `ShowcaseMarquee` always refetch on mount with
`{ cache: "no-store" }` (initialItems = instant paint only). **Live-verified June 22:** both pages now
render all 7 Shroomadu creations; API still returns only `{id, imageUrl, brandName, imageType}`.
**Fox's next step:** embed the Airo iframe (snippet in the Showcase section).

**2. Rename audit — DECISION: KEEP "BrandGoblin AI". ✅** Explored renaming to Nix / a new name.
Findings: "Nix" collides badly (means "reject/nothing"; Nix® lice-treatment trademark; NixOS/NYX SEO).
Every good `.com` is taken or premium aftermarket — checked live: grimble.com $8,800, nixby.com $7,190,
goblio.com $2,750, conjora.com / conjuri.com / brandgoblin.com all taken. Conclusion: name isn't the
bottleneck (people click links/scan QR), a rename costs money + time, and BrandGoblin already carries
Nix. **Verdict: stick with BrandGoblin AI; make Nix the face of marketing; pour energy into distribution.**

**3. Nix-led TikTok / content engine — PLANNED + groundwork built. New docs in `docs/`:**
- `NIX_TIKTOK_PLAYBOOK.md` — pillars, hooks, 2025/26 virality rules, CTA strategy, starter slate.
- `NIX_CONTENT_AUTOMATION_PLAN.md` — the assembly-line workflow. **Approval is T-1 (approve tomorrow's
  content today).** Robots do the labor; Fox is the taste/QC gate; posting via a **social scheduler**.
- `NIX_CONTENT_QUEUE.md` — daily idea menu + approval tracker (the backbone doc).
- `NIX_COMPANION_VISION.md` — north-star vision: Nix as a daily creative companion app. Capture-now,
  build-portable, build-after-traction. Names: "Nix Companion" (product), "The Goblin Loop" (engine),
  "GrowthGoblin" (if growth engine ships as a product).

**4. Scheduled task created: `nix-daily-idea-engine`** — runs ~7am daily, scans trends, appends 3–5
on-brand Nix concepts to `NIX_CONTENT_QUEUE.md`. (Runs only while the Claude app is open.)

**5. Creative tooling (Higgsfield MCP) — first Nix composite tests generated.**
Account: **free plan, ~9.88 credits** at session start. Model `nano_banana_pro` = **2 credits/1k render**.
Generated 2 photoreal composites of Nix into Fox's real photos (from his approved Nix PNG, on-model):
  - Christmas/shoulder — job `bb5c49a7-cbc1-400a-b577-67d14806c39e`
  - Pattaya swing — job `123c1112-4757-4cca-9da1-565856bb73ea`
Both `completed` and shown in the UI widget. Repo-copy failed (network block on the CDN download), so
re-pull via `job_display`/`show_generations` next session. ~4 credits used → ~5.88 left.
**Plan:** if Higgsfield nails the look, upgrade to Pro plan.

**▶ NEXT SESSION PICK-UP:** (a) review the 2 composites + QC on-model; (b) try image-to-video to make
Nix *move* (the real test); (c) embed the Showcase iframe in Airo; (d) optionally build the brand-agnostic
"System Kit". Uploaded media_ids: Nix art `6f60e151-6181-4b63-862d-4d0db277d978`,
Christmas photo `be7eb024-efad-4133-9882-67d86e727d91`, swing photo `44ca378b-854c-4c0f-abfb-362983067e98`.

### 🖼 GOBLIN STUDIO LIVE SHOWCASE WALL — PUSHED ✅ LIVE + VERIFIED (June 22) — `d29c538`
Public, read-only, privacy-safe gallery of real Studio creations — embeddable on Airo via iframe.
Additive. **DB migration RUN ✅** (`supabase/migrations/20260622_studio_showcase.sql`).
**Live-verified June 22:** `/api/showcase` returns exactly 7 featured items with ONLY
`{id, brandName, imageType, imageUrl}` — privacy scan found ZERO private fields; image URLs are
signed from the private `studio-assets` bucket with a 30-min (1800s) JWT TTL. `/embed/showcase`
returns 200, renders the marquee, and carries `<meta robots="noindex,nofollow">`. API has a ~120s
CDN cache (`s-maxage=120`) so admin feature/unfeature changes take up to ~2 min to show publicly.
**Fox's next step:** embed the iframe in Airo (snippet at the bottom of this section).

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
- **ADMIN_EMAIL:** Fox's real app account is **`joepro@hotmail.com`** (NOT the old gmail). Hardcoded
  fallback fixed in all 3 spots (`07614cb`): `/admin` page, `/api/admin/showcase-feature`, and the
  Navbar's admin-link constant. `ADMIN_EMAIL` env var is now SET in Vercel = `joepro@hotmail.com`.
  A subtle "🧌 Admin" navbar link (`cd55503`) shows only for that email (client-side; real gate is
  server-side in `/admin`, which redirects non-admins). NOTE: Navbar email is hardcoded — if the env
  value ever changes, update the Navbar too (or migrate it to a `NEXT_PUBLIC_ADMIN_EMAIL`).
- **Airo embed (Fox's pending step):** `<iframe src="https://app.brandgoblinai.com/embed/showcase"
  style="width:100%;border:0;height:420px;" loading="lazy">` — tune height for mobile vs desktop.
- **Curation:** `/admin` → ⭐ Showcase Curation grid (own completed image jobs only). 7 currently featured.

### ✨ NIX ZONE — free Nix goodies — PUSHED ✅ LIVE (June 22) — `0972230`
Free in-app distribution surface — wallpapers, sticker pack, gallery. Additive (no energy/Stripe/
trial/generation). NO DB migration needed. **NO Nix art generated — display-only from `/public/nix/*`;
empty manifests render graceful "coming soon."**
**⏳ FOX TODO (live but empty until done):** drop Nix art into `/public/nix/{wallpapers,stickers,gallery}/`
+ add one manifest line per file in `src/lib/nix-assets.ts`. Folders exist (`.gitkeep`). Specs:
wallpapers = desktop 1920×1080/2560×1440 + phone 1080×1920 PNGs; stickers = transparent ~512×512 PNGs;
gallery = images + optional `.mp4`/`.webm` clips. Quality gate: green skin, purple hair, pointed ears,
purple "NIX" hoodie w/ gold trim.

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
**Studio is feature-complete through Phases 1→1.7 + Share Celebration + Favorites + Showcase Wall +
Nix Zone — all PUSHED + LIVE.** Sound pack (8 CC0 files) is live. The remaining work is mostly
content-population + distribution, not new code:

1. **Populate the Nix Zone** (live but empty) — drop Nix art into `/public/nix/{wallpapers,stickers,
   gallery}/` + add manifest lines in `src/lib/nix-assets.ts`. See the Nix Zone section above for specs.
2. **Embed the Showcase iframe in Airo** — Showcase is live + verified (7 featured items, privacy
   clean). Paste `<iframe src="https://app.brandgoblinai.com/embed/showcase" …>` into an Airo HTML
   section near the hero + orange CTA. Curate more via `/admin` → ⭐ Showcase Curation anytime.
3. **GoDaddy / Airo landing — V3 finish** (see item 4 below): make top-nav button orange, add a
   Studio "make real images" section, drop in 2–3 real Studio examples, embed the showcase iframe.
4. **Smoke-test the full Studio loop live** if not already: Conjure → sound/anticipation → reveal →
   ⭐ favorite → 📣 share → Share Celebration → Make another. Plus Remove BG/Upscale, More-like-this.
5. **Later / not built (do NOT advertise until shipped):** multi-variation gacha spread, deeper
   gamification, short-form VIDEO (Wan 2.6 / Kling 3.0 — registry-mapped only), paid physical merch
   (Nix hoodie/dolls via print-on-demand — only once a fanbase is asking).
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

### Subscription Tiers (freemium — June 24, 2026)
| Plan | Price | Features |
|---|---|---|
| Free | $0 forever | Brand generation, try Goblin Studio with a one-time Creative Energy starter (250, tunable), free Nix stickers/wallpapers. No 7-day trial, no day-7 lockout. |
| Creator Pro | $19/month | Unlimited generations, full content engine, monthly Creative Energy, top-ups. |
| ~~Agency Edition~~ | — | **Removed from all UI** June 24, 2026. `"agency"` retained in the `Plan` type for safety only. |

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

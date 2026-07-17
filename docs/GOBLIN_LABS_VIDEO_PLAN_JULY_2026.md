# 🧪 GOBLIN LABS — VIDEO PLAN (July 17, 2026)

> Fox's brief: take Studio creations (products, mascots, logos) and make short, sweet, punchy
> vertical videos from them — 6–30s, TikTok/Reels/Shorts native. Product videos, teasers, ads,
> and apparel "worn by a real person" videos. "This may require a big build — let's take the
> time to really think, plan, create and build Goblin Labs as best as we can."
>
> Research basis: two deep-dive agents, July 17 2026, every price read off live fal.ai model
> pages same day. Full reports summarized here; prices re-verify at each build phase (video
> pricing moves monthly).

---

## 1. THE VISION

**Goblin Labs = Nix's laboratory.** A new `/dashboard/labs` area (🧪, scientist Nix pose —
needs Fox to drop the PNG) where experimental magic ships before it's Studio-polished.
Experiments graduate: Labs → (proven + loved) → Studio/Goblin Motion. Video is Experiment #1.

**The core loop (reuses everything we already built):**
Studio image (already brand-perfect) → pick a RECIPE → motion prompt cooked by Nix →
specialist video engine → 5–20s vertical clip → share/download → post to TikTok/Reels/Shorts.

Why this wins: the hard part of AI video ads is getting a brand-faithful starting frame —
**we already own that pipeline.** Competitors (Arcads $11/video, Creatify $39/mo, Botika
$33/mo) can't make brand-kit-aware video. Nobody has a mascot in the room.

---

## 2. RESEARCH VERDICT — THE ENGINES (live-verified July 17)

Energy conversion used: 1⚡ ≈ $0.0018 (matches image registry: $0.06 → 34⚡).

### Launch lineup (Founder taste-test decides final cut, like the Wow Plan)

| Role | Model | fal endpoint | Price | 5s clip |
|---|---|---|---|---|
| **Motion Pro** — product/hero quality i2v | Kling v2.6 Pro | `fal-ai/kling-video/v2.6/pro/image-to-video` | $0.07/s silent, $0.14/s audio | 195⚡ / 389⚡ |
| **Quick Motion** — budget i2v, THE value freak | LTX-2.3 Fast | `fal-ai/ltx-2.3/image-to-video/fast` | $0.04/s at 1080p **with native audio**, 9:16 explicit, 20s max, Apache 2.0 | **112⚡** |
| **Character** — mascot motion | Hailuo 2.3 Fast | `fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video` | flat $0.19/6s (768p) | 106⚡ |
| **Ad Director** — text-to-video teasers w/ speech | Veo 3.1 Lite (→Fast upsell) | `fal-ai/veo3.1/lite/image-to-video` + t2v | $0.05/s 720p **with audio** (Fast: $0.15/s 1080p audio) | 139⚡ (Lite 5s) |

Supporting cast (later phases): Luma Ray 2 Flash (`loop` flag — seamless logo loops, $0.20/5s),
Kling AI Avatar v2 ($0.0562/s — **talking mascot**, lipsync on stylized characters),
`fal-ai/wan-effects` (44 viral presets, $0.35/video), Topaz video upscale ($0.01–0.08/s).

### Hard NOs / cautions from research
- **Sora 2 for i2v: NO.** No seed + OpenAI IP-blocking (`detect_and_block_ip`) may reject exactly
  our inputs (branded mascots/logos). Fine as a t2v style alt later.
- **Seedance 2.0 / Kling v3 4K / Sora 2 Pro:** gorgeous but 840–1,945⚡ per 5s — a whole month
  of Pro energy per clip. Only ever as "Cinema" premium framed against 3,000/7,000⚡ packs.
- **Old registry entries are dead weight:** `wan_2_6` price stale, `kling_3_0` points at a v1.6
  endpoint. Delete both, rebuild registry from the table above.
- **Veo output carries SynthID watermark** (invisible but non-removable) — fine, just know it.
- **Audio is a billing toggle everywhere** (~2x on Kling). UI: audio switch wired directly to
  the energy price shown.

### Energy math that matters
A 1,000⚡ Pro month buys ~8 Quick clips or ~5 Motion Pro clips. A 3,000⚡ ($49) pack ≈ 26
Quick clips ≈ $1.88/clip revenue vs ~$0.20 cost. Market anchor: Arcads charges $11/video.
**Margins are excellent; refill packs finally have a whale product.**

---

## 3. THE RECIPES (what users actually pick — not models, MOMENTS)

Research-distilled: winners are image-to-video with a controlled start frame — our strength.
Launch four:

1. **🎬 Hero Push-In** — product centered, slow dolly-in, atmosphere drifts, rim light blooms,
   product LOCKED. 5s. Cheapest + most reliable. (Motion Pro / Quick)
2. **📦 Unboxing Reveal** — branded box in palette → lid lifts → product reveal (end-frame =
   the product hero we already have). 6–7s. Uses start+end frame control.
3. **🧌 Mascot Comes Alive** — the kit mascot waves/reacts/presents. 5s beat. Differentiator
   NOBODY can copy — no competitor has a mascot pipeline. (Character engine)
4. **✨ Logo Sting** — 3–5s logo reveal; end-frame = the exact logo (pixel-faithful finish);
   Luma `loop` variant for seamless loops. The thing YouTubers pay $50+ for on Fiverr.

Phase-2 recipes: Cinematic Silhouette Reveal, Macro Texture Loop, Before/After Snap
(blank tee → printed tee), Brand-Color Pulse, multi-beat 15–30s assembly (hook → demo → CTA).

### VIDEO COOKER RULES (Cooker 3.0 — encode these, they're the whole craft)
- **Animate camera/light/atmosphere — NEVER the product.** Lock statements always:
  "product remains perfectly static, label locked, no deformation."
- **Motion-only prompts.** Never re-describe the product/garment in the motion prompt — the
  start image carries identity; re-describing causes label drift (same lesson as hex codes).
- **ONE camera move per shot.** Slow > fast. ~40–60 words, subject/action early.
- **No in-video text ever** — overlays are post-production (the #1 AI-slop tell).
- Negatives: "no morphing, no warping text, no extra fingers, no flicker."
- 9:16 discipline: center ~72% safe zone (top/bottom ~14% = platform UI).
- The START FRAME is the hook (first-3-seconds rule) — if the frame isn't a thumb-stopper,
  re-cook the image, not the video.

### 9:16 KEY INSIGHT
Nearly all i2v engines inherit aspect ratio from the input image. Studio images are 1:1/4:3.
**So the pipeline needs a "vertical stage" step: outpaint/reframe the chosen image to
1080×1920 BEFORE video.** (We have engines for this; small cost, huge payoff — every video
lands TikTok-native.)

---

## 4. APPAREL / "WORN LOOK" (Fox's try-on ask — honest verdict)

**No true single-call video-try-on API exists anywhere (verified).** Everyone (Botika,
WearView, CapCut) ships it as a chain: garment image → try-on STILL → image-to-video. That
chain IS ready:

1. Design → garment flat: `fal-ai/nano-banana-pro/edit` ($0.15) places the user's print on a
   clean flat-lay blank (we build an internal blank-garment library — tees/hoodies per color —
   highest-leverage asset of this phase).
2. Try-on: `fal-ai/fashn/tryon/v1.6` ($0.075, explicitly preserves prints/text, quality mode,
   2–4 samples) onto a CURATED model roster (no user selfies at launch — privacy/failure mess).
3. Vertical stage → animate: subtle motion ONLY (weight shift, ≤45° turn, fabric sway, handheld
   micro-drift). Arms never cross the print. ~$0.60 COGS per finished clip incl. one retry.

**Launch scope: tops only** (tees/hoodies/crewnecks — bottoms/full outfits are weak in every
model). Small print text degrades twice (try-on + motion) — UX copy stays honest, keep chest
prints big. This is PHASE 3 — it's the deepest build and needs the video bones first.

---

## 5. THE PHASED BUILD

### PHASE 0 — Foundations (built in small shippable chunks, Fox pushes between each)
- **0a — PRICING WINS (ships first, revenue-immediate, video-independent):**
  (1) Same-price nudge in EnergyRefillModal on the $19 pack (switches checkout to the Pro
  subscription); (2) Member bonus: +20% pack energy for Pro subscribers — bonus applied
  server-side in the Stripe webhook energy grant, advertised in the refill modal + pricing
  page ("Creator Pro members get +20% on every pack").
- Registry rebuild: delete stale video entries; add the 4 launch engines with verified prices
  (margin-safe rounding like flux_2_flex); `costUnit: per_second` + flat-per-video support;
  `computeVideoEnergyCost(modelKey, seconds, audio)`.
- `/dashboard/labs` shell: 🧪 branding, "Nix's laboratory — where future magic is forged",
  experiment cards (Video = LIVE, others = teased), **ADMIN/Fox-only flag at first**
  (taste-test gate, the Wow Plan pattern), footer chip goes live → links here.
- Video job plumbing: `job_type: "video"` through jobs route (drop the reject), webhook,
  duration param, video player JobCard variant, download. Migration likely needed (duration,
  audio flag on studio_jobs) — CHECK before deploy.
- ⚠️ Nix asset needed from Fox: scientist-Nix PNG (asset map has it 🔴; Claude never generates Nix).

### PHASE 1 — "ANIMATE MY CREATION" (the wedge)
- In Labs: pick any finished Studio creation (or a kit's official logo) → recipe picker
  (the 4 launch recipes) → Cooker 3.0 motion prompt (editable, same creative-surface philosophy)
  → engine (Motion Pro / Quick / Character — smart default per recipe) → duration (5s/10s)
  → audio toggle (price updates live) → Conjure.
- Vertical stage step (auto 9:16 outpaint before video; user sees "Making it TikTok-ready…").
- Energy: reserve on submit, refund on fail — identical to Studio. Celebration on reveal
  (it's a VIDEO reveal — the celebration economy's biggest moment yet; reuse SoundFx).
- **FOX A/B TEST after deploy:** same image through Motion Pro vs Quick on each recipe.
  Judge with taste. Tune defaults. (The July 16 pattern that worked.)

### PHASE 2 — TEASERS & ADS
- Multi-beat assembly: hook beat → demo beat → CTA end card (rendered by US from the brand
  kit — fonts/colors/CTA, no AI text ever) hard-cut into 15–30s. Veo 3.1 Lite/Fast t2v joins
  for spoken-audio teasers. Unboxing Reveal + Before/After recipes (end-frame control).
- Captions/music guidance (post-gen, TikTok Commercial Music Library note in UI).

### PHASE 3 — WORN LOOK (apparel)
- Blank-garment library → nano-banana mockup step → FASHN try-on v1.6 → curated model roster
  → subtle-motion i2v. Tops only. Premium energy framing (~350–450⚡ per finished clip).

### PHASE 4 — LAB EXPERIMENTS (the fun shelf)
- Talking Mascot (Kling AI Avatar, $0.0562/s — mascot SPEAKS the tagline), wan-effects presets
  (squish/cakeify — 44 one-tap virals, $0.35 flat), seamless logo loops (Luma `loop`),
  video upscale (generate cheap → upsell 1080p via Topaz), graduate winners out of Labs.

---

## 6. PRICING & ACCESS — ✅ FINAL (Fox-approved July 17, all four)

1. **SAME-PRICE NUDGE:** selecting the $19 one-time pack shows an inline comparison —
   "$19 once = 1,000⚡ once · $19/month = 1,000⚡ EVERY month + Creator Pro perks" — one tap
   switches checkout to the subscription. $19 pack ONLY (never slow a $49/$99 whale down).
   Classic Subscribe-&-Save mechanic; honest math, no trick.
2. **MEMBER BONUS FLYWHEEL:** Creator Pro members get **+20% bonus energy on every refill
   pack** (1,000→1,200 / 3,000→3,600 / 7,000→8,400). Subscription and packs now reinforce
   instead of cannibalize: planning to buy packs? Subscribe first (MRR ↑). Subscribed?
   Every top-up hits harder (retention ↑). COGS impact: pennies.
3. **LABS OPEN TO EVERYONE, energy-gated** — Studio's model ("energy is the gate, not the
   plan"). Free starter energy = one taste of video magic = the conversion hammer.
4. **TRUST ECONOMY (non-negotiable, manifesto):** energy never expires, transparent live
   pricing (audio toggle + duration slider move the ⚡ number in real time), genuine
   celebrations, NO countdown-timer FOMO. Rejected: gifting 30 days of Pro with packs —
   rolling gifts would cannibalize the subscription (Fox caught it).
- Per-second energy for video; Quick 5s = 112⚡ ("about 3 images" — feels cheap). Video is
  THE refill-pack product: one 10s Motion Pro w/ audio ≈ 778⚡ → $49/3,000⚡ obvious.
- Premium "Cinema" engines (Seedance 2.0, Kling 4K) ONLY if taste demands, framed against packs.
- WORN LOOK (apparel try-on) — **PARKED by Fox July 17**: complicated, niche possibly locked
  by specialists (Botika etc.), not max bang-for-buck now. Revisit as we grow; research is
  banked in §4.

## 7. OPEN QUESTIONS FOR FOX
1. Scientist-Nix PNG for the Labs header (drop when ready — blocks nothing, placeholder OK).
2. Wall-clock honesty: clips take ~1.5–4 min. Reveal-feed-style anticipation UI or fire-and-
   notify (jobs page already polls)? Lean: anticipation loop + Nix "brewing" states.
3. Labs naming: the roadmap also promised "Goblin Motion" — does video LIVE in Labs forever,
   or graduate to a Motion tab once proven? (Suggest: Labs first, decide at graduation.)
4. Marketing angle: Labs launch is itself a Hat-episode goldmine ("we built a video lab") —
   plan the build-in-public arc alongside Phase 1?

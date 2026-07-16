# Image Quality Upgrade Plan — "The Wow Plan"
### July 16, 2026 · Research verified against live fal.ai pricing pages

**The goal (Fox's words):** every generation makes people say "wow!" and want to share it.
**The promise of the manifesto:** grow and evolve with the models. Taste is the moat.

---

## 1. WHY RESULTS ARE HIT-OR-MISS TODAY (honest diagnosis)

Fox generates almost exclusively on Premium (Flux Pro 1.1) and Artistic (Seedream 4.5)
and still gets coin-flip results. Three compounding causes:

1. **Our best engine is two generations old.** Flux Pro v1.1 launched late 2024. Since
   then: FLUX.2 (new Black Forest flagship), GPT Image 2 (April 2026, OpenAI), Ideogram
   V3/V4, Recraft V3/V4, Seedream 5.0, Nano Banana 2 (Google). Several are DESIGN
   SPECIALISTS — built for logos, posters, product shots. We're bringing a 2024 general
   ist to a 2026 design fight.
2. **We starve the prompt.** The cooker (Haiku) is capped at 2-3 sentences. Modern
   models do their best work with rich structured prompts (subject, scene, lighting,
   camera, composition, mood — 100+ words). FLUX.2 even accepts JSON-structured prompts
   and REAL HEX COLORS (our current no-hex rule exists because old models painted hex
   codes as text — the new generation fixes this).
3. **One roll of the dice.** Single seed per Conjure. Pros generate 2-4, pick the winner.

---

## 2. THE MENU — VERIFIED PRICES (fal.ai, July 16 2026)

Energy math: `energy = ceil(usd × 10 / 0.018)` → 1 energy ≈ $0.0018 of model cost.
All image sizes we use are 1MP (1024×1024, 1024×768, 768×1024).

| Model (fal endpoint) | $/image @1MP | Energy | Superpower |
|---|---|---|---|
| flux_schnell (current Standard) | $0.003 | 2 | Fast drafts only |
| Seedream 4.5 (current Artistic) | $0.03–0.04 ⚠️re-verify | 17–23 | Artistic looks |
| Flux Pro 1.1 (current Premium) | $0.04 | 23 | Outdated flagship |
| **Ideogram V3 Turbo** | $0.03 | 17 | Posters + typography, cheap tier |
| **Ideogram V3 Balanced** | $0.06 | 34 | Posters + REAL TEXT in image |
| **Ideogram V3 Quality** | $0.09 | 50 | Max poster quality |
| **Recraft V3 (raster)** | $0.04 | 23 | DESIGN specialist: logos, brand style, accepts our exact brand hex colors as API input |
| **Recraft V3 (vector style)** | $0.08 | 45 | True vector-look logo art |
| **FLUX.2 [flex]** | $0.05–0.06/MP | 28–34 | New BFL flagship: adjustable quality steps, JSON prompts, hex color control, strong typography |
| **Nano Banana 2** (Google) | $0.08 @1K | 45 | Photoreal + text, strong all-rounder |
| **GPT Image 2** (OpenAI, Apr 2026) | $0.01 (low) → ~$0.41 (4K high) ⚠️verify mid-tier | 6–~230 | SOTA product photography: accurate labels, packaging, brand-consistent shots |
| Ideogram 4 / Seedream 5.0 / Recraft V4 | ⚠️ price not yet verified | — | Next-gen versions of the above; check before wiring |

Margin safety: energy auto-computes from usdRate at 10x markup, so ANY of these keeps
the same margin structure. A 34-energy image still costs the user only ~3.4% of a
1,000-energy pack (~29 images per pack).

---

## 3. THE PLAN — 4 PHASES, IMPACT ORDER

### Phase 1 — NEW ENGINES + SMART DEFAULTS (biggest lift, ~1 session)
Add to the registry (after re-verifying each live price on its fal page):
- `ideogram_v3` (balanced default; turbo/quality as internal tiers)
- `recraft_v3` (raster; vector style exposed for logos)
- `flux_2_flex` (steps ~30 default)

**Smart defaults per asset type** (manifesto: Simplicity wins — the app picks the best
tool, user can still override in the engine picker):
| Asset | Default engine | Why |
|---|---|---|
| Logo concept | Recraft V3 | Literal logo/brand specialist, hex color input |
| Social graphic | Ideogram V3 | Built for posters; typography when name is ON |
| Product art | FLUX.2 flex (→ GPT Image 2 in Phase 4) | Detail + surfaces |
| Mascot | Seedream 4.5 (keep) | Character art is its strength |

Rename tiers: Standard→"Draft (fast & cheap)", the new smart default per type shows as
"Best for this" ✨, keep Premium/Artistic as manual overrides. flux_schnell never
default again except as explicit Draft.

### Phase 2 — PROMPT COOKER 2.0 + STYLE CHIPS (~1 session)
- Raise the cooker's output to a structured ~120-word prompt: subject → composition →
  lighting → style → mood → palette. Give Haiku 2 gold-standard example prompts per
  asset type (few-shot).
- **Per-model prompt dialects**: FLUX.2/Recraft get REAL hex codes (supported now!);
  Ideogram gets poster-language; legacy models keep the color-words rule. The no-text
  scrub logic stays for name-OFF.
- **Style chips** (Fox's July 11 parked idea, now prioritized): tap-to-add taste —
  "Retro poster", "Hand-drawn", "Photoreal studio", "Neon glow", "Minimal flat",
  "3D clay", "Vintage badge", "Watercolor". Chips inject curated style blocks into the
  cooked prompt. Productizes Fox's hand-editing habit for everyone.

### Phase 3 — CONJURE ×2 (~half session)
"Conjure 2 variants" toggle: two seeds side by side, pick the keeper (both saved,
loser archivable). Costs exactly 2x energy — honest, and doubles the wow rate.
Standard practice everywhere else for a reason.

### Phase 4 — THE SHOWSTOPPER TIER (verify + wire, ~1 session)
- **GPT Image 2 for product art with brand name ON**: it renders real, correct labels
  and packaging text — the thing no model could do when we made names opt-out. Combined
  with Ideogram for social graphics, the "name ON" checkbox goes from garbled-text
  gamble to the premium path.
- Evaluate Ideogram 4, Seedream 5.0, Recraft V4 prices/quality; swap up where better.
- Registry stays the single source of truth: model upgrades = one entry + price verify.

---

## 4. WHAT IT COSTS USERS (layman's math)

On a 1,000-energy pack ($19): today's Premium image = 23 energy (~43 images/pack).
After upgrade, the smart default lands at 17-34 energy (~29-58 images/pack) — same
ballpark, dramatically better output. Conjure ×2 on the default = 34-68 energy
(~15-29 pairs). Margins unchanged by construction (10x markup baked into the formula).

## 5. PRINCIPLES CHECK (manifesto filter)
- **Revenue**: better images → more shares → more signups; Conjure×2 increases energy
  spend honestly. ✅
- **Customer success**: users get share-worthy art on the first try more often. ✅
- **Automation/Systems**: registry + smart defaults = model swaps are one-line edits
  forever. The app evolves with the model world by design. ✅
- **Retention**: "wow" is the retention feature. ✅
- **Long-term advantage**: taste (curated defaults, style chips, prompt dialects) is
  the moat — exactly what raw model access doesn't give competitors' users. ✅

## 6. SOURCES (checked July 16, 2026)
- fal.ai Ideogram V3 model page (tier pricing $0.03/$0.06/$0.09)
- fal.ai Recraft V3 model page ($0.04 raster / $0.08 vector, colors param, style presets)
- fal.ai FLUX.2 [flex] model page ($0.05-0.06/MP, steps, JSON prompts, hex support)
- fal.ai GPT Image 2 page ($0.01 low → $0.41 4K high, April 21 2026 launch)
- fal.ai "Best AI Image Generators" explore page (Seedream 4.5 $0.04, Nano Banana 2 $0.08)

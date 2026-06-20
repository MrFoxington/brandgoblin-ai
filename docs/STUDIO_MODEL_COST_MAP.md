# Goblin Studio — Model Cost Map (green-lit models + energy pricing)

### The exact models Claude Code may enable, their commercial license, real fal.ai cost, and the
### energy we charge at the locked 10× markup. **Only models on this list may be enabled.**
> Companion to `GOBLIN_STUDIO_BRIEF.md` + `STUDIO_SETUP_RUNBOOK.md`. Prices verified vs fal.ai public
> pricing June 20, 2026 — **re-confirm live cost + license on each fal model page before launch**
> (prices move). Provider = fal.ai primary; Replicate fallback runs the equivalent model.

---

## The formula (locked)

```
energy_charged = ceil( provider_USD_cost / 0.0018 )
```
where `0.0018 = 0.018 (net $ per refill energy) ÷ 10 (MARKUP)`. In plain terms: **the user pays ~10×
our raw generation cost**, denominated in energy. Round UP. Never enable a model not priced here.
`ENERGY_MARKUP_MULTIPLIER=10` is the env knob; raising it raises every energy price proportionally.

---

## ✅ IMAGES — Phase 1 (build these first)

| Use | Model (fal) | License | Our cost | Energy (×10) | Role |
|---|---|---|---|---|---|
| Standard graphics / logo concepts | **FLUX.1 [schnell]** | Apache-2.0 ✅ fully commercial | ~$0.025/img | **15** | **DEFAULT** — cheap, fast, safe |
| High-quality option | **FLUX.1 [pro]** | Commercial via fal API ✅ | ~$0.05/img | **30** | premium image upsell |
| Alt high-quality | **Seedream V4** | Commercial via fal ✅ (confirm) | ~$0.03/img | **20** | style variety |
| Background removal / cutout | fal bg-removal | ✅ | ~$0.01–0.02 | **15** | post-process |
| Upscale / hi-res | fal upscaler | ✅ | ~$0.02–0.05 | **30** | "make it crisp" |
| Variation (re-roll) | same as base model | — | = base | = base | the addictive loop |

> ⛔ **FLUX.1 [dev] is NON-COMMERCIAL — never enable it for customer output.** Default to schnell.

**Intuition:** 1,000 energy ≈ **65 standard images** (schnell) — generous for the monthly Pro grant;
heavy users refill. Logo concepts use the same image cost (frame as "concepts," not finished vectors).

---

## ✅ VIDEO — Phase 2 (map now, build later)

Assume ~5-second clips unless the user picks longer (price scales with seconds — compute from the
per-second cost × duration, then apply the formula).

| Tier | Model (fal) | License | Our cost (5s) | Energy (×10) | Role |
|---|---|---|---|---|---|
| Budget | **Wan 2.6** ($0.05/s) | Commercial via fal ✅ (confirm) | ~$0.25 | **140** | **DEFAULT** video |
| Mid | **Kling 3.0** ($0.10/s) | Commercial via fal ✅ (confirm) | ~$0.50 | **280** | better motion |
| Quick/flat | **Hailuo 02** (~$0.28/clip) | Commercial via fal ✅ (confirm) | ~$0.28 | **160** | fast turnaround |
| Premium | **Veo-class** (~$0.40–0.75/s) | Confirm per endpoint | ~$2.00–3.75 | **1,100–2,100** | gate as explicit premium |

**Compute rule for video:** `cost = per_second_rate × seconds`, then `energy = ceil(cost / 0.0018)`.
Show the energy price up front; default the UI to the budget/mid model, premium is an opt-in choice.

**Intuition:** 1,000 energy ≈ **7 budget clips** (Wan, 5s). That's why the monthly grant stays
profitable and why short-form video is the main reason creators refill.

---

## Implementation notes for Claude Code

- Store this as a **model registry** in `energy-config.ts`: each model → `{ falEndpoint,
  usdCostBasis, license, defaultFor }`; compute energy at runtime via the formula, never hardcode the
  energy number (so a fal price change = one cost edit, not a re-tune).
- For video, cost is **per-second** → energy must scale with requested duration.
- **Reserve the computed energy atomically BEFORE the job** (per the brief). Refund on failure.
- Default models: image = **FLUX.1 [schnell]**, video = **Wan 2.6**. Premium tiers are opt-in and
  must surface their energy cost before the user commits.
- Replicate fallback: map the same logical tiers to equivalent Replicate models; verify those models'
  cost + license too before enabling.
- Add a small safety cushion if fal adds per-request overhead — round energy UP generously; we never
  want a generation to cost more than the energy we reserved.

## Pre-launch verification
- [ ] Re-check each model's **live fal.ai price** (the energy formula assumes the costs above).
- [ ] Confirm **commercial license** on each fal model page (schnell/pro are known-safe; confirm
      Seedream/Wan/Kling/Hailuo/Veo per endpoint).
- [ ] Confirm Replicate fallback model costs + licenses.

*Created June 20, 2026. Default markup 10×. Re-verify before flipping Studio live.*

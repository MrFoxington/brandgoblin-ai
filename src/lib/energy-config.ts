// ⚡ Creative Energy Configuration
// All energy values live here. Tune without touching business logic.

export const ENERGY_CONFIG = {
  // Monthly allowance granted to Creator Pro users each billing cycle
  MONTHLY_ALLOWANCE: parseInt(process.env.CREATOR_PRO_MONTHLY_ENERGY ?? "1000"),

  // Amount added when a user purchases a $19 refill
  REFILL_AMOUNT: parseInt(process.env.CREATOR_PRO_REFILL_ENERGY ?? "1000"),

  // One-time Creative Energy granted to a brand-new FREE user so they can taste
  // Goblin Studio without paying. Granted once per user (anti-abuse guarded);
  // does NOT refill. Tune freely — this is the single knob for the free taste.
  FREE_STUDIO_STARTER_ENERGY: parseInt(process.env.FREE_STUDIO_STARTER_ENERGY ?? "250"),

  // Warning thresholds (as fraction of monthly allowance)
  LOW_THRESHOLD: 0.25,      // ⚡ Show "running low" warning
  CRITICAL_THRESHOLD: 0.10, // ⚡ Show "almost empty" warning

  // Stripe price ID for the one-time $19 refill product
  STRIPE_REFILL_PRICE_ID: process.env.STRIPE_PRICE_ID_ENERGY_REFILL ?? "",

  // Energy cost per content type (internal — never shown to users)
  CONTENT_COSTS: {
    // ── Low cost ──────────────────────────────
    instagram_post:          10,
    twitter_post:            10,
    facebook_post:           10,
    linkedin_post:           10,
    threads_post:            10,
    caption:                 10,
    hashtag_set:              5,
    headline:                10,
    marketing_ideas:         10,
    campaign_ideas:          10,
    audience_suggestions:    10,
    brand_voice_suggestions: 10,

    // ── Medium cost ───────────────────────────
    email_campaign:          30,
    ad_copy:                 30,
    product_description:     30,
    promotion:               30,
    seasonal_campaign:       30,
    launch_announcement:     30,
    website_copy:            50,
    content_calendar:        60,

    // ── High cost ─────────────────────────────
    blog_post:              100,

    // ── Brand generation (Pro users) ──────────
    brand_generation:        50,

    // ── Goblin Studio (legacy stubs — Studio uses computeStudioEnergyCost()) ──
    image_generation:       150,
    image_variation:        100,
    image_hires:            250,
    video_generation:       500,
  } as Record<string, number>,

  // User-facing capacity estimates (shown as "enough for approx X")
  CAPACITY_ESTIMATES: [
    { label: "social posts",    costKey: "instagram_post" },
    { label: "blog articles",   costKey: "blog_post" },
    { label: "email campaigns", costKey: "email_campaign" },
    { label: "ad copy sets",    costKey: "ad_copy" },
  ],
} as const;

export type EnergyContentType = keyof typeof ENERGY_CONFIG.CONTENT_COSTS;

export function getEnergyCost(contentType: string): number {
  return ENERGY_CONFIG.CONTENT_COSTS[contentType] ?? 10;
}

export function getEnergyWarningLevel(remaining: number, monthlyAllowance: number): "low" | "critical" | "empty" | null {
  if (remaining <= 0) return "empty";
  const ratio = remaining / monthlyAllowance;
  if (ratio <= ENERGY_CONFIG.CRITICAL_THRESHOLD) return "critical";
  if (ratio <= ENERGY_CONFIG.LOW_THRESHOLD) return "low";
  return null;
}

// ── Goblin Studio model registry ──────────────────────────────────────────
// Prices verified vs fal.ai public pricing June 20 2026.
// Re-verify each model's live price + license before flipping Studio live.
//
// costUnit:
//   'per_megapixel' → usdRate is $/MP; MP = ceil(width × height / 1_000_000)
//   'flat'          → usdRate is a fixed $/image cost
//   'per_second'    → usdRate is $/sec (video only)
//
// NEVER enable a model not listed here. Energy is always computed at runtime
// from usdRate so a price change = one number edit, never re-tuned constants.

export type StudioCostUnit = "per_megapixel" | "flat" | "per_second";
export type StudioModelKey =
  | "flux_schnell"
  | "flux_pro_v1"
  | "seedream_v45"
  | "ideogram_v3"
  | "recraft_v3"
  | "flux_2_flex"
  | "gpt_image_2"
  | "bg_removal"
  | "clarity_upscaler"
  | "kling_v26_pro"
  | "ltx_23_fast"
  | "hailuo_23_fast"
  | "veo_31_lite";

export interface StudioModel {
  falEndpoint: string;
  replicateModel?: string;
  costUnit: StudioCostUnit;
  usdRate: number;         // $/MP | $/img | $/sec (audio OFF for video models with an audio toggle)
  // Video models with billable native audio: $/sec with audio ON. Omit = model
  // has no audio toggle (either no audio, or audio included in usdRate).
  audioUsdRate?: number;
  // Longest single-generation clip the endpoint supports (video only).
  maxDurationSeconds?: number;
  license: string;
  // NOTE: for video models this doubles as the CATEGORY guard — jobs/route.ts
  // rejects defaultFor "video" until Goblin Labs Phase 0d wires real video jobs.
  defaultFor?: "image" | "video";
  enableSafetyChecker: boolean;
}

export const STUDIO_MODELS: Record<StudioModelKey, StudioModel> = {
  // ── Phase 1: Images ───────────────────────────────────────────────────────
  flux_schnell: {
    falEndpoint: "fal-ai/flux/schnell",
    replicateModel: "black-forest-labs/flux-schnell",
    costUnit: "per_megapixel",
    usdRate: 0.003,          // $0.003/MP — verified June 20 2026
    license: "Apache-2.0",
    defaultFor: "image",
    enableSafetyChecker: true,
  },
  flux_pro_v1: {
    falEndpoint: "fal-ai/flux-pro/v1.1",
    costUnit: "per_megapixel",
    usdRate: 0.04,           // $0.04/MP — verified June 20 2026
    license: "commercial-via-fal",
    enableSafetyChecker: true,
  },
  seedream_v45: {
    falEndpoint: "fal-ai/bytedance/seedream/v4.5/text-to-image",
    costUnit: "flat",
    usdRate: 0.03,           // $0.03/image — verified June 20 2026 (fal explore page listed $0.04 July 16 — re-verify in dashboard)
    license: "commercial-via-fal",
    enableSafetyChecker: true,
  },
  // ── July 16 2026 — "Wow Plan" Phase 1 engines (docs/IMAGE_QUALITY_UPGRADE_PLAN_JULY_2026.md)
  ideogram_v3: {
    falEndpoint: "fal-ai/ideogram/v3",
    costUnit: "flat",
    usdRate: 0.06,           // $0.06/image at BALANCED rendering_speed — verified on model page July 16 2026
    license: "commercial-via-fal",
    enableSafetyChecker: false, // no such param in Ideogram's schema — provider omits it
  },
  recraft_v3: {
    falEndpoint: "fal-ai/recraft/v3/text-to-image",
    costUnit: "flat",
    usdRate: 0.04,           // $0.04/image raster styles — verified July 16 2026 (vector styles are $0.08 — NOT enabled)
    license: "commercial-via-fal",
    enableSafetyChecker: true,
  },
  flux_2_flex: {
    falEndpoint: "fal-ai/flux-2-flex",
    costUnit: "per_megapixel",
    usdRate: 0.06,           // page shows $0.05/MP, meta says $0.06/MP — registered at 0.06 (margin-safe), verified July 16 2026
    license: "commercial-via-fal",
    enableSafetyChecker: true,
  },
  gpt_image_2: {
    falEndpoint: "openai/gpt-image-2",
    costUnit: "flat",
    usdRate: 0.20,           // TOKEN-billed ($30/1M output img tokens) — 0.20 is a conservative
                             // upper bound for 1MP at quality "high" (~$0.13-0.17 typical).
                             // ⚠️ Verify real per-image cost in the fal dashboard, then tune down.
    license: "commercial-via-fal",
    enableSafetyChecker: false, // no such param in the schema — provider omits it
  },
  bg_removal: {
    // July 16 2026: upgraded rembg → BiRefNet v2. rembg cuts by COLOR (white suit
    // on white bg = eaten suit — Fox's Dead Orbit mascots); BiRefNet segments the
    // SUBJECT itself. Billed per compute-second (tiny); $0.01 flat stays margin-safe.
    falEndpoint: "fal-ai/birefnet/v2",
    costUnit: "flat",
    usdRate: 0.01,
    license: "commercial-via-fal",
    enableSafetyChecker: false,
  },
  clarity_upscaler: {
    falEndpoint: "fal-ai/clarity-upscaler",
    costUnit: "per_megapixel",
    usdRate: 0.03,           // $0.03/MP of INPUT — re-verify before launch
    license: "commercial-via-fal",
    enableSafetyChecker: false,
  },
  // ── 🧪 GOBLIN LABS: Video launch engines (July 17 2026) ───────────────────
  // Prices live-verified on fal model pages July 17 2026 (deep-dive research,
  // docs/GOBLIN_LABS_VIDEO_PLAN_JULY_2026.md §2). Registered but NOT buildable
  // until Labs Phase 0d — jobs/route.ts rejects defaultFor "video".
  // Old stale entries (wan_2_6 at unverified $0.05, "kling_3_0" that pointed at
  // a v1.6 endpoint) deleted same day — never wired, no jobs reference them.
  kling_v26_pro: {
    // "Motion Pro" — quality image-to-video; best faithfulness-per-dollar.
    // Start+end frame support = controlled loops + clip chaining later.
    falEndpoint: "fal-ai/kling-video/v2.6/pro/image-to-video",
    costUnit: "per_second",
    usdRate: 0.07,           // $0.07/s audio OFF — verified July 17 2026
    audioUsdRate: 0.14,      // $0.14/s native audio ON (voice-control tier $0.168 NOT enabled)
    maxDurationSeconds: 10,  // 5s / 10s
    license: "commercial-via-fal",
    defaultFor: "video",
    enableSafetyChecker: true,
  },
  ltx_23_fast: {
    // "Quick Motion" — the value engine: 1080p, explicit 9:16, native audio
    // INCLUDED in the rate, 20s max single shot, Apache 2.0 (cleanest license).
    falEndpoint: "fal-ai/ltx-2.3/image-to-video/fast",
    costUnit: "per_second",
    usdRate: 0.04,           // $0.04/s at 1080p WITH audio — verified July 17 2026 (1440p $0.08, 4K $0.16 — not enabled)
    maxDurationSeconds: 20,
    license: "Apache-2.0",
    defaultFor: "video",
    enableSafetyChecker: true,
  },
  hailuo_23_fast: {
    // "Character" — mascot/character motion specialist, budget tier.
    // fal bills FLAT per video: $0.19/6s, $0.32/10s. Registered as $0.032/s so
    // the per_second math reproduces both real prices margin-safe
    // (6s → $0.192, 10s → $0.32). 768p; no audio; no end-frame (2.3 dropped it).
    falEndpoint: "fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video",
    costUnit: "per_second",
    usdRate: 0.032,          // derived from flat $0.19/6s + $0.32/10s — verified July 17 2026
    maxDurationSeconds: 10,  // 6s / 10s
    license: "commercial-via-fal",
    defaultFor: "video",
    enableSafetyChecker: true,
  },
  veo_31_lite: {
    // "Ad Director (Lite)" — Google-quality motion + native audio dirt cheap;
    // the text-to-video teaser path starts here (Veo 3.1 Fast = later upsell).
    falEndpoint: "fal-ai/veo3.1/lite/image-to-video",
    costUnit: "per_second",
    usdRate: 0.03,           // $0.03/s 720p audio OFF — verified July 17 2026
    audioUsdRate: 0.05,      // $0.05/s 720p audio ON (1080p $0.05/$0.08 — not enabled yet)
    maxDurationSeconds: 8,
    license: "commercial-via-fal",
    defaultFor: "video",
    enableSafetyChecker: true,
  },
};

// Allowed output dimensions per image type — PIN these server-side to
// prevent users from requesting arbitrary large sizes that erode margin.
// Megapixels = ceil(width × height / 1_000_000).
export type ImageType = "logo_concept" | "social_graphic" | "product_art" | "mascot";

export interface PinnedSize {
  falSize: string;
  width: number;
  height: number;
  label: string;
}

export const IMAGE_TYPE_SIZES: Record<ImageType, PinnedSize> = {
  logo_concept:   { falSize: "square_hd",     width: 1024, height: 1024, label: "1024×1024" },
  social_graphic: { falSize: "landscape_4_3", width: 1024, height: 768,  label: "1024×768"  },
  product_art:    { falSize: "square_hd",     width: 1024, height: 1024, label: "1024×1024" },
  // Full-body character reads best in portrait (July 10 2026 — Mascot generator)
  mascot:         { falSize: "portrait_4_3",  width: 768,  height: 1024, label: "768×1024"  },
};

/** ceil(pixels / 1_000_000) matching fal.ai billing rounding */
export function megapixelsForSize(width: number, height: number): number {
  return Math.ceil((width * height) / 1_000_000);
}

/**
 * Compute energy cost from the model registry at runtime.
 * energy = ceil(usdCost × MARKUP / 0.018)
 * Never call with guessed/hardcoded numbers — always pass dimensions from
 * IMAGE_TYPE_SIZES (images) or explicit durationSeconds (video).
 */
export function computeStudioEnergyCost(
  modelKey: StudioModelKey,
  params: { width?: number; height?: number; durationSeconds?: number; audio?: boolean } = {}
): number {
  const model = STUDIO_MODELS[modelKey];
  const markup = parseInt(process.env.ENERGY_MARKUP_MULTIPLIER ?? "10");

  let usdCost: number;
  if (model.costUnit === "per_megapixel") {
    const mp = megapixelsForSize(params.width ?? 1024, params.height ?? 1024);
    usdCost = model.usdRate * mp;
  } else if (model.costUnit === "per_second") {
    // Video: native audio is a separate billing tier on some engines (Kling,
    // Veo). audio=true uses audioUsdRate when the model has one; models with
    // audio included (LTX) or no audio (Hailuo) ignore the flag.
    const rate = params.audio && model.audioUsdRate ? model.audioUsdRate : model.usdRate;
    usdCost = rate * (params.durationSeconds ?? 5);
  } else {
    usdCost = model.usdRate;
  }

  return Math.ceil((usdCost * markup) / 0.018);
}

/**
 * Video energy cost — thin, intention-revealing wrapper for Goblin Labs.
 * Duration is clamped to the model's maxDurationSeconds so a rogue client
 * can never buy a 60s generation on a 10s engine.
 */
export function computeVideoEnergyCost(
  modelKey: StudioModelKey,
  durationSeconds: number,
  audio: boolean = false
): number {
  const model = STUDIO_MODELS[modelKey];
  const clamped = Math.max(1, Math.min(durationSeconds, model.maxDurationSeconds ?? 10));
  return computeStudioEnergyCost(modelKey, { durationSeconds: clamped, audio });
}

/** Returns an allowed image type's pinned size, throwing on unknown types. */
export function getPinnedSize(imageType: ImageType): PinnedSize {
  const size = IMAGE_TYPE_SIZES[imageType];
  if (!size) throw new Error(`Unknown imageType: ${imageType}`);
  return size;
}

/** Rough estimate of what a user can still create, shown in the UI */
export function getCapacityEstimates(totalRemaining: number): string[] {
  return ENERGY_CONFIG.CAPACITY_ESTIMATES
    .map(({ label, costKey }) => {
      const count = Math.floor(totalRemaining / (ENERGY_CONFIG.CONTENT_COSTS[costKey] ?? 10));
      if (count <= 0) return null;
      return `~${count} ${label}`;
    })
    .filter(Boolean) as string[];
}

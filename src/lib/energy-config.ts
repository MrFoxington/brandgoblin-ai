// ⚡ Creative Energy Configuration
// All energy values live here. Tune without touching business logic.

export const ENERGY_CONFIG = {
  // Monthly allowance granted to Creator Pro users each billing cycle
  MONTHLY_ALLOWANCE: parseInt(process.env.CREATOR_PRO_MONTHLY_ENERGY ?? "1000"),

  // Amount added when a user purchases a $19 refill
  REFILL_AMOUNT: parseInt(process.env.CREATOR_PRO_REFILL_ENERGY ?? "1000"),

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

    // ── Future: Goblin Studio ─────────────────
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

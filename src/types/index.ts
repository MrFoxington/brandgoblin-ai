// ---------- Goblin Studio ----------

export interface StudioJobRow {
  id: string;
  user_id: string;
  brand_id: string | null;
  job_type: string;
  model_key: string;
  image_type: string | null;
  image_size: string;
  energy_reserved: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled" | "moderation_blocked";
  provider: string;
  provider_job_id: string | null;
  prompt: string | null;
  output_url: string | null;
  storage_path: string | null;
  error_message: string | null;
  reservation_tx_id: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Database row types ----------

export type Plan = "free" | "pro" | "agency";

export function planDisplayName(plan: Plan): string {
  if (plan === "pro" || plan === "agency") return "Creator Pro";
  return "Free";
}

export type MarketingContentType =
  | "social_posts" | "captions" | "blog_ideas" | "ad_copy"
  | "email_campaigns" | "video_ideas" | "hashtags" | "seasonal_campaigns"
  | "meme_ideas" | "headline_ideas" | "website_copy" | "cta_ideas";

export interface MarketingContentRow {
  id: string;
  user_id: string;
  brand_id: string;
  content_type: MarketingContentType;
  content_json: unknown;
  created_at: string;
}

// ---------- Creator Pro content engine ----------

export type CreatorContentType =
  | "instagram_post" | "twitter_post" | "facebook_post" | "linkedin_post" | "threads_post"
  | "caption" | "hashtag_set"
  | "blog_post" | "product_description" | "email_campaign" | "ad_copy"
  | "headline" | "promotion" | "seasonal_campaign" | "launch_announcement"
  | "marketing_ideas" | "campaign_ideas" | "content_calendar"
  | "audience_suggestions" | "brand_voice_suggestions";

export type BrandVoiceMode =
  | "professional" | "funny" | "luxury" | "friendly" | "inspirational" | "minimalist" | "bold";

export interface CreatorContentRow {
  id: string;
  user_id: string;
  brand_id: string | null;
  content_type: CreatorContentType;
  title: string;
  content: unknown;
  created_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  created_at: string;
  credits: number;
  plan: Plan;
}

export interface BrandGenerationRow {
  id: string;
  user_id: string;
  input_data: BrandInput;
  output_data: BrandKit;
  created_at: string;
  favorite: boolean;
}

// ---------- Generator input ----------

export type BrandVibe =
  | "fun"
  | "premium"
  | "luxury"
  | "cute"
  | "rebellious"
  | "futuristic"
  | "trustworthy"
  | "minimalist"
  | "bold"
  | "playful";

export type BrandTrait =
  | "playful" | "funny" | "friendly" | "bold" | "luxury"
  | "professional" | "inspirational" | "minimalist" | "modern" | "creative"
  | "adventurous" | "elegant" | "innovative" | "trustworthy" | "energetic"
  | "sophisticated" | "premium" | "rebellious" | "authentic" | "approachable";

export type NameMode = "generated" | "existing";

export interface BrandInput {
  businessIdea: string;
  industry: string;
  targetAudience: string;
  vibe: BrandVibe;           // kept for backwards compat with existing saved brands
  keywords?: string;
  avoid?: string;
  nameMode?: NameMode;
  providedBrandName?: string;
  brandTraits?: BrandTrait[];    // NEW: multi-select (up to 3)
  vibeDescription?: string;     // NEW: free-text personality description
}

// ---------- AI output: full brand kit ----------

export interface BrandNameOption {
  name: string;
  reasoning?: string;
}

export interface FavoriteName {
  name: string;
  tagline: string;
  whyPicked: string;
  bestFor: string;
}

export interface AlternativeName {
  name: string;
  tagline: string;
  whyItWorks: string;
}

export interface MascotConcept {
  name: string;
  appearance: string;
  personality: string;
  visualDescription: string;
  imagePrompt: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  usage: string;
}

export interface WebsiteCopy {
  heroHeadline: string;
  subheadline: string;
  ctaText: string;
  aboutSection: string;
  featureBullets: string[];
}

export interface SocialKit {
  instagramBio: string;
  twitterBio: string;
  tiktokBio: string;
  launchPosts: string[];
}

export interface MarketingIdeas {
  viralContentIdeas: string[];
  memeIdeas: string[];
  adAngles: string[];
}

export interface BrandVoice {
  personalityTraits: string[];
  toneExamples: string[];
  wordsToUse: string[];
  wordsToAvoid: string[];
}

export interface BrandStory {
  originStory: string;
  mission: string;
}

export interface NameStrengthCheck {
  whatWorks: string;
  potentialConcerns: string;
  suggestedRefinement: string;
  bestPositioningAngle: string;
}

export interface BrandDNAScore {
  label: string;
  score: number;   // 0–100
  why: string;     // one-sentence justification from the model
}

export interface BrandKit {
  // Legacy fields (kept for backwards compat with existing saved brands)
  brandNames?: BrandNameOption[];
  topThreeReasoning?: string;
  recommendedNameReasoning?: string;
  // New naming structure (generated mode)
  favoriteName?: FavoriteName;
  alternativeNames?: AlternativeName[];
  // Existing name mode
  nameStrengthCheck?: NameStrengthCheck;
  // Always present
  recommendedName: string;
  taglines: string[];
  brandStory: BrandStory;
  brandVoice: BrandVoice;
  mascot: MascotConcept;
  logoPrompt: string;
  colorPalette: ColorSwatch[];
  websiteCopy: WebsiteCopy;
  socialKit: SocialKit;
  marketingIdeas: MarketingIdeas;
  launchPlan: string[];
  // Brand DNA — model-computed scores with justifications
  brandDna?: BrandDNAScore[];
}

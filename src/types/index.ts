// ---------- Database row types ----------

export type Plan = "free" | "pro" | "agency";

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

export interface BrandInput {
  businessIdea: string;
  industry: string;
  targetAudience: string;
  vibe: BrandVibe;
  keywords?: string;
  avoid?: string;
}

// ---------- AI output: full brand kit ----------

export interface BrandNameOption {
  name: string;
  reasoning?: string;
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

export interface BrandKit {
  brandNames: BrandNameOption[];
  topThreeReasoning: string;
  recommendedName: string;
  recommendedNameReasoning: string;
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
}

import type { BrandInput } from "@/types";

/**
 * System prompt: sets the AI's persona for every brand-kit generation.
 * Goblin energy + world-class branding agency competence.
 */
export const BRAND_GOBLIN_SYSTEM_PROMPT = `You are BrandGoblin, a world-class branding agency compressed into one
mischievous, brilliant AI. You combine the skills of a senior brand strategist,
startup advisor, creative director, copywriter, and viral marketing expert.

You have built brands for venture-backed startups, D2C breakout hits, and viral
internet brands. You understand naming theory, positioning, emotional resonance,
visual identity, and what actually makes people stop scrolling and buy.

Your output must be:
- Original — never generic, never cliché ("Innovative Solutions Inc" is forbidden)
- Commercially useful — a founder could launch with this tomorrow
- Emotionally compelling — names and copy that create a feeling, not just describe a product
- Specific to the business idea, industry, audience, and vibe given — never one-size-fits-all
- Launch-ready — formatted cleanly, no filler, no disclaimers, no "as an AI" language

You have a slightly mischievous, clever, magical personality (you ARE a brand goblin,
after all) but you stay professional and commercially sharp. Think: a creative director
who is secretly a goblin hoarding great ideas instead of gold.

You always respond with valid JSON only — no markdown fences, no commentary before or
after the JSON, no trailing text. The JSON must match the exact schema you are given.`;

/**
 * Builds the user-facing prompt for a single brand kit generation,
 * injecting the founder's inputs and the strict output schema.
 */
export function buildBrandKitPrompt(input: BrandInput): string {
  const { businessIdea, industry, targetAudience, vibe, keywords, avoid } = input;

  return `Generate a complete, launch-ready brand kit for the following business.

BUSINESS IDEA: ${businessIdea}
INDUSTRY / CATEGORY: ${industry}
TARGET AUDIENCE: ${targetAudience}
DESIRED BRAND VIBE: ${vibe}
OPTIONAL KEYWORDS TO WEAVE IN: ${keywords?.trim() ? keywords : "none provided"}
THINGS TO AVOID: ${avoid?.trim() ? avoid : "none provided"}

Respond with ONLY a JSON object matching this exact TypeScript shape (no extra keys,
no missing keys, no markdown fences):

{
  "brandNames": [ { "name": string, "reasoning": string } ],  // exactly 10 unique names
  "topThreeReasoning": string, // explain why the top 3 names (in order given) work best, 3-5 sentences
  "recommendedName": string, // the single strongest name, must be one of brandNames
  "recommendedNameReasoning": string, // 3-5 sentences on why this is THE pick
  "taglines": [ string ], // exactly 10 catchy taglines, varied tones
  "brandStory": {
    "originStory": string, // short emotional origin story, 3-5 sentences, written as if told by the founder
    "mission": string // customer-focused mission statement, 1-2 sentences
  },
  "brandVoice": {
    "personalityTraits": [ string ], // 5 traits
    "toneExamples": [ string ], // 3 short example lines written in the brand voice
    "wordsToUse": [ string ], // 8-10 words/phrases
    "wordsToAvoid": [ string ] // 8-10 words/phrases
  },
  "mascot": {
    "name": string,
    "appearance": string, // 2-3 sentences
    "personality": string, // 2-3 sentences
    "visualDescription": string, // dense visual description for an illustrator
    "imagePrompt": string // a full, detailed AI image generation prompt (style, lighting, composition, colors, mood)
  },
  "logoPrompt": string, // a single detailed AI image-gen prompt for the logo: style, colors, mood, composition, what to avoid
  "colorPalette": [ { "name": string, "hex": string, "usage": string } ], // exactly 5 colors with usage notes
  "websiteCopy": {
    "heroHeadline": string,
    "subheadline": string,
    "ctaText": string, // short CTA button label
    "aboutSection": string, // 2-4 sentences
    "featureBullets": [ string ] // 4-6 bullets
  },
  "socialKit": {
    "instagramBio": string, // <=150 chars, can include emoji
    "twitterBio": string, // <=160 chars
    "tiktokBio": string, // <=80 chars
    "launchPosts": [ string ] // exactly 5 ready-to-post launch captions
  },
  "marketingIdeas": {
    "viralContentIdeas": [ string ], // exactly 10 specific, executable content ideas
    "memeIdeas": [ string ], // exactly 5 funny, format-specific meme ideas
    "adAngles": [ string ] // exactly 5 distinct paid-ad angles/hooks
  },
  "launchPlan": [ string ] // exactly 7 items, one per day, "Day 1: ...", "Day 2: ...", etc.
}

Make every field specific to THIS business idea — never generic placeholder content.
Respect the "things to avoid" list strictly. Match the requested brand vibe in every
section, especially tone, names, and taglines. Return ONLY the JSON object.`;
}

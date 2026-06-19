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
 * Builds the prompt for existing-name mode — skips name generation,
 * locks the provided brand name, and adds a Name Strength Check section.
 */
function buildPersonalityBlock(input: BrandInput): string {
  const { vibe, brandTraits, vibeDescription } = input;
  const lines: string[] = [];

  if (brandTraits && brandTraits.length > 0) {
    lines.push(`BRAND PERSONALITY TRAITS: ${brandTraits.join(", ")}`);
  } else {
    lines.push(`DESIRED BRAND VIBE: ${vibe}`);
  }

  if (vibeDescription?.trim()) {
    lines.push(`VIBE DESCRIPTION (founder's own words): "${vibeDescription.trim()}"`);
  }

  if (brandTraits && brandTraits.length > 0 && vibeDescription?.trim()) {
    lines.push(`PERSONALITY DIRECTION: Blend the selected traits (${brandTraits.join(", ")}) with the founder's vibe description to create a nuanced, layered brand personality.`);
  }

  return lines.join("\n");
}

export function buildExistingNameBrandKitPrompt(input: BrandInput): string {
  const { businessIdea, industry, targetAudience, keywords, avoid, providedBrandName } = input;

  return `Generate a complete, launch-ready brand kit for the following business. The founder already has a brand name — do NOT suggest alternative names. Build everything around the provided name.

BRAND NAME (already chosen by founder): ${providedBrandName}
BUSINESS IDEA: ${businessIdea}
INDUSTRY / CATEGORY: ${industry}
TARGET AUDIENCE: ${targetAudience}
${buildPersonalityBlock(input)}
OPTIONAL KEYWORDS TO WEAVE IN: ${keywords?.trim() ? keywords : "none provided"}
THINGS TO AVOID: ${avoid?.trim() ? avoid : "none provided"}

Respond with ONLY a JSON object matching this exact shape (no extra keys, no missing keys, no markdown fences):

{
  "recommendedName": string, // must equal the provided brand name exactly
  "nameStrengthCheck": {
    "whatWorks": string,           // 2-3 sentences: the genuine strengths of this name — memorability, feel, market fit
    "potentialConcerns": string,   // 1-2 sentences: honest but constructive concerns. If the name is strong, say so warmly. Never be harsh.
    "suggestedRefinement": string, // 1-2 sentences: optional tweak or variation if helpful. If no refinement needed, affirm the name as-is.
    "bestPositioningAngle": string // 1 sentence: the strongest market positioning angle for this specific name
  },
  "taglines": [ string ], // exactly 10 catchy taglines built around the provided name, varied tones
  "brandStory": {
    "originStory": string,
    "mission": string
  },
  "brandVoice": {
    "personalityTraits": [ string ],
    "toneExamples": [ string ],
    "wordsToUse": [ string ],
    "wordsToAvoid": [ string ]
  },
  "mascot": {
    "name": string,
    "appearance": string,
    "personality": string,
    "visualDescription": string,
    "imagePrompt": string
  },
  "logoPrompt": string,
  "colorPalette": [ { "name": string, "hex": string, "usage": string } ],
  "websiteCopy": {
    "heroHeadline": string,
    "subheadline": string,
    "ctaText": string,
    "aboutSection": string,
    "featureBullets": [ string ]
  },
  "socialKit": {
    "instagramBio": string,
    "twitterBio": string,
    "tiktokBio": string,
    "launchPosts": [ string ]
  },
  "marketingIdeas": {
    "viralContentIdeas": [ string ],
    "memeIdeas": [ string ],
    "adAngles": [ string ]
  },
  "launchPlan": [ string ], // exactly 7 items, one per day
  "brandDna": [
    { "label": "Creativity",          "score": number, "why": string },
    { "label": "Memorability",        "score": number, "why": string },
    { "label": "Market Clarity",      "score": number, "why": string },
    { "label": "Emotional Resonance", "score": number, "why": string },
    { "label": "Virality Potential",  "score": number, "why": string },
    { "label": "Professionalism",     "score": number, "why": string },
    { "label": "Playfulness",         "score": number, "why": string },
    { "label": "Audience Match",      "score": number, "why": string }
  ]
  // brandDna scores must reflect this specific brand, not be generic.
  // Scores should be varied and honest — not all 90s. The "why" must name something specific.
}

Important rules:
- nameStrengthCheck must be encouraging and constructive. Never insult the name. If the name is weak, say "This name has potential — here's how the Goblin would sharpen it."
- All content must be built specifically around the provided brand name "${providedBrandName}".
- Respect the "things to avoid" list strictly.
- Return ONLY the JSON object.`;
}

/**
 * Builds the user-facing prompt for a single brand kit generation,
 * injecting the founder's inputs and the strict output schema.
 */
export function buildBrandKitPrompt(input: BrandInput): string {
  const { businessIdea, industry, targetAudience, keywords, avoid } = input;

  return `Generate a complete, launch-ready brand kit for the following business.

BUSINESS IDEA: ${businessIdea}
INDUSTRY / CATEGORY: ${industry}
TARGET AUDIENCE: ${targetAudience}
${buildPersonalityBlock(input)}
OPTIONAL KEYWORDS TO WEAVE IN: ${keywords?.trim() ? keywords : "none provided"}
THINGS TO AVOID: ${avoid?.trim() ? avoid : "none provided"}

Respond with ONLY a JSON object matching this exact TypeScript shape (no extra keys,
no missing keys, no markdown fences):

{
  "favoriteName": {
    "name": string,       // THE single best brand name — memorable, brandable, emotionally resonant
    "tagline": string,    // best tagline specifically for this name
    "whyPicked": string,  // 2-3 sentences: why this name wins on memorability, brandability, emotional appeal, domain/social potential
    "bestFor": string     // 1 sentence: who/what positioning this name is best suited for
  },
  "alternativeNames": [  // exactly 4 strong alternatives
    { "name": string, "tagline": string, "whyItWorks": string },
    { "name": string, "tagline": string, "whyItWorks": string },
    { "name": string, "tagline": string, "whyItWorks": string },
    { "name": string, "tagline": string, "whyItWorks": string }
  ],
  "recommendedName": string, // must equal favoriteName.name exactly — used for display elsewhere
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
  "launchPlan": [ string ], // exactly 7 items, one per day, "Day 1: ...", "Day 2: ...", etc.
  "brandDna": [             // exactly 8 items — score this specific brand, not a hypothetical one
    { "label": "Creativity",          "score": number, "why": string }, // how original/unexpected the brand concept feels
    { "label": "Memorability",        "score": number, "why": string }, // will customers recall the name after one encounter
    { "label": "Market Clarity",      "score": number, "why": string }, // does the name/story signal the category immediately
    { "label": "Emotional Resonance", "score": number, "why": string }, // how much it connects emotionally with the target audience
    { "label": "Virality Potential",  "score": number, "why": string }, // organic shareability and social media potential
    { "label": "Professionalism",     "score": number, "why": string }, // polish, credibility, how enterprise-ready it feels
    { "label": "Playfulness",         "score": number, "why": string }, // fun, warmth, approachability of the personality
    { "label": "Audience Match",      "score": number, "why": string }  // how tightly everything targets the stated audience
  ]
  // IMPORTANT for brandDna: scores must be specific and defensible — not all high, not all the same.
  // A luxury brand should score high on Professionalism/Emotional Resonance but lower on Playfulness.
  // A funny Gen Z brand should score high on Virality/Playfulness but perhaps lower on Professionalism.
  // The "why" must be ONE sentence naming something specific about THIS brand, not generic praise.
  // Bad why: "This brand has great creativity." Good why: "The name 'Barkly' uses unexpected animal wordplay that stands out in pet food."
}

Make every field specific to THIS business idea — never generic placeholder content.
Respect the "things to avoid" list strictly. Match the requested brand vibe in every
section, especially tone, names, and taglines. Return ONLY the JSON object.`;
}

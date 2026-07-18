-- ═══════════════════════════════════════════════════════════════════════════
-- 💜 OFFICIAL BRANDGOBLIN AI BRAND IMPORT (July 18, 2026)
-- Hand-crafted from docs/BRAND_GUIDELINES.md + Nix character rules — NOT generated.
-- Inserts the real BrandGoblin brand into Fox's admin account so Studio/Labs
-- create genuinely on-brand content.
--
-- HOW TO RUN: paste this whole file into the Supabase SQL editor → Run.
-- It prints the new brand id on success. Run ONCE (re-running makes a duplicate).
--
-- AFTER RUNNING:
--   1. Studio → brand picker → "BrandGoblin AI" → upload the REAL logo via
--      "Bring your own logo" (use /public/logos/brandgoblin-logo.png).
--   2. ⚠️ RULE #1 STILL APPLIES: never use the Mascot generator card on this
--      brand — Nix images come only from Fox's PNGs. Product art, social
--      graphics, logo concepts, Print Pro: all fair game.
-- ═══════════════════════════════════════════════════════════════════════════

insert into brand_generations (user_id, input_data, output_data, favorite, archived)
select
  u.id,
  $input$
  {
    "businessIdea": "An AI-powered brand creation engine: one prompt becomes a complete launch-ready brand kit — name, story, voice, colors, logo direction, website copy, social kit and launch plan — in under two minutes, with an AI art studio (Goblin Studio) and video lab (Goblin Labs) to bring it all to life.",
    "industry": "AI / SaaS / Creator Tools",
    "targetAudience": "Founders, creators, and entrepreneurs with an idea and no design team — from first-time side-hustlers to indie hackers building in public",
    "vibe": "playful",
    "keywords": "magic, goblin, conjure, creative energy, bring ideas to life",
    "nameMode": "existing",
    "providedBrandName": "BrandGoblin AI",
    "brandTraits": ["playful", "creative", "trustworthy"],
    "vibeDescription": "Pixar + Duolingo + Discord + premium SaaS: magical and playful on the surface, seriously capable underneath. Never cold, sterile, or enterprise-feeling."
  }
  $input$::jsonb,
  $output$
  {
    "recommendedName": "BrandGoblin AI",
    "nameStrengthCheck": {
      "whatWorks": "Instantly memorable and visual — you can SEE a goblin making brands. The mischief of 'goblin' plus the utility of 'brand' promises magic with a wink, and it comes with a built-in mascot, world, and voice no generic AI-tool name could ever grow.",
      "potentialConcerns": "Playfulness may read as un-serious to buttoned-up corporate buyers — which is fine, because they are not the audience. Creators are.",
      "suggestedRefinement": "None. Ship it. The name IS the brand strategy.",
      "bestPositioningAngle": "The magical creative partner for people with ideas: everyone has an idea, BrandGoblin helps bring it to life."
    },
    "taglines": [
      "Everyone Has An Idea. BrandGoblin Helps Bring It To Life.",
      "Your brand, conjured in minutes.",
      "Powered by NIX ✨",
      "From idea to brand before your coffee gets cold.",
      "Ideas are everywhere. Brands are made here."
    ],
    "brandStory": {
      "originStory": "BrandGoblin was born in cafés across Bangkok, Bali and Tokyo, built in public by Fox — a nomad founder who believed that the distance between having an idea and holding a real brand should be minutes, not months. Somewhere between the first prompt and the first launch, a green-skinned goblin named Nix showed up in a purple hoodie and refused to leave. He has been conjuring brands ever since.",
      "mission": "Amplify creators, never replace them. Give every person with an idea an intelligent creative partner — so the only thing standing between an idea and a real brand is the courage to type it in."
    },
    "brandVoice": {
      "personalityTraits": ["Playful", "Magical", "Warm", "Bold", "Encouraging"],
      "toneExamples": [
        "Nix is out of Creative Energy for now. Refill instantly or wait for your next monthly reset.",
        "This page got goblin'd. Let's get you back to your Brand Vault.",
        "✦ Your next step ✦ — bring your brand to life in Goblin Studio.",
        "Everyone has an idea. Scan it. Bring yours to life."
      ],
      "wordsToUse": ["conjure", "magic", "bring to life", "create", "Creative Energy", "reveal", "brew", "forge", "goblin-approved", "launch-ready"],
      "wordsToAvoid": ["leverage", "synergy", "utilize", "disrupt", "enterprise-grade", "solution", "empower", "cutting-edge", "seamless", "revolutionary"]
    },
    "mascot": {
      "name": "Nix",
      "appearance": "A small green-skinned goblin with wild purple hair, tall pointed ears, bright mischievous eyes, and his signature purple 'NIX' hoodie with gold trim.",
      "personality": "Playful, magical, warm. A tireless creative companion who celebrates every win with sparkles, speaks in encouragement, and treats every user's idea like treasure. Mischievous but never mean — the heart and soul of the brand.",
      "visualDescription": "Pixar-quality character design: soft rounded forms, expressive oversized eyes, dynamic poses, purple-and-gold hoodie always present, often surrounded by sparkles or conjuring effects. Reads perfectly at sticker size and hero size alike.",
      "imagePrompt": "OFFICIAL MASCOT — do not generate. Nix images come exclusively from the official pose library in /public/nix/ (celebrating, waving, thinking, working, conjuring, sleeping). Quality bar before placing any pose: green skin, purple hair, pointed ears, purple NIX hoodie with gold trim."
    },
    "logoPrompt": "The official BrandGoblin logo already exists (use the uploaded official logo — never regenerate it). For supporting brand marks only: a friendly goblin silhouette with tall pointed ears in royal purple, rounded confident geometry, a purple-to-emerald gradient with a single warm-gold sparkle accent, clean vector edges on a dark navy background, playful but premium — Pixar-meets-SaaS.",
    "colorPalette": [
      { "name": "Royal Purple", "hex": "#7C3AED", "usage": "Primary — buttons, accents, CTAs, Nix's world" },
      { "name": "Emerald Green", "hex": "#10B981", "usage": "Secondary — highlights, success states, goblin skin energy" },
      { "name": "Warm Gold", "hex": "#FBBF24", "usage": "Accent — stars, badges, sparkles, the wand" },
      { "name": "Deep Navy", "hex": "#0F172A", "usage": "App background — the night sky the magic happens against" },
      { "name": "Twilight Card", "hex": "#1E1B2E", "usage": "Card surfaces and panels" }
    ],
    "websiteCopy": {
      "heroHeadline": "Everyone Has An Idea.",
      "subheadline": "BrandGoblin helps bring it to life — a complete, launch-ready brand kit conjured from one prompt in under two minutes.",
      "ctaText": "Start Creating Free",
      "secondaryCtaText": "See a brand get born",
      "aboutSection": "BrandGoblin AI is the AI-powered brand creation engine for founders, creators, and entrepreneurs. Type your idea and Nix conjures the whole thing: name, story, voice, colors, logo direction, website copy, social kit and launch plan — then Goblin Studio brings it to life as logos, product art and social graphics, with Goblin Labs video magic on the way. Built in public by one nomad founder and his goblin.",
      "featureBullets": [
        "Complete brand kit from one prompt in under 2 minutes",
        "Goblin Studio: logos, product art & social graphics with specialist AI engines",
        "Print Pro: your brand name rendered perfectly on real product art",
        "Creator Pro: your AI marketing department, month after month",
        "Creative Energy: transparent pricing, energy never expires"
      ],
      "features": [
        { "title": "The 2-Minute Brand Kit", "description": "Name, story, voice, colors, taglines, website copy, social kit and launch plan — revealed live as Nix writes it." },
        { "title": "Goblin Studio", "description": "Bring the kit to life: specialist AI engines for logos, social graphics, product art — palette-matched to YOUR brand." },
        { "title": "Print Pro", "description": "Product art with your brand name spelled perfectly — labels, packaging, merch that reads like the real thing." },
        { "title": "Creator Pro", "description": "Your AI marketing department: content, campaigns and monthly Creative Energy to keep building." },
        { "title": "Goblin Labs", "description": "Where future magic is forged — brand videos and experiments graduate here first." }
      ],
      "faqs": [
        { "question": "Do I need design skills?", "answer": "None. If you can describe your idea in a sentence, Nix handles the rest — and you can fine-tune anything manually." },
        { "question": "What does it cost to start?", "answer": "Nothing. Free to start, no card needed. Creative Energy powers creations, and your energy never expires." },
        { "question": "Do I own what I make?", "answer": "Yes. Your brands, your art, your files — always downloadable, never held hostage." }
      ],
      "seoTitle": "BrandGoblin AI — Complete Brand Kits From One Prompt",
      "metaDescription": "Everyone has an idea. BrandGoblin brings it to life: a complete launch-ready brand kit in under 2 minutes, plus AI art and video studios. Free to start.",
      "footerTagline": "Made with 💜 and goblin magic",
      "emailCaptureHeadline": "Be first when new magic ships"
    },
    "socialKit": {
      "instagramBio": "🧌 Everyone has an idea. We bring it to life.\n✨ Complete brand kits in 2 minutes\n🎨 Powered by NIX\n⬇️ Free to start",
      "twitterBio": "The AI brand creation engine 🧌 One prompt → complete launch-ready brand kit in 2 minutes. Built in public. Powered by NIX ✨ Free to start.",
      "tiktokBio": "everyone has an idea 🧌 we bring it to life ✨ free to start ⬇️",
      "launchPosts": [
        "We taught a goblin to make brands. One prompt → name, story, colors, logo direction, launch plan — in under 2 minutes. Free to start at brandgoblinai.com 🧌✨",
        "Your idea deserves better than a notes-app graveyard. Type it in, watch Nix conjure the whole brand live. No card, no catch. 🧌",
        "POV: you had a shower-thought business idea at 9am and a complete brand kit by 9:02. That's the goblin difference. ✨"
      ]
    },
    "marketingIdeas": {
      "viralContentIdeas": [
        "THE HAT: pull 3 random words from a hat, build the whole brand live on camera — audience restocks the hat in the comments forever",
        "Street brandings: strangers pull words or pitch their real idea, watch their brand get born on the spot",
        "Founder build-in-public diary: real sessions, real terminal, real ships — ending on the To Be Continued arrow",
        "Speedrun challenges: idea to full brand kit, timed, react to what Nix conjures"
      ],
      "memeIdeas": [
        "Nix judging your DIY Canva logo vs what he would have conjured",
        "'My business idea' vs 'My business idea after the goblin got it' glow-up format",
        "To Be Continued arrow freeze-frames on every cliffhanger ship"
      ],
      "adAngles": [
        "Speed: complete brand kit before your coffee cools (under 2 minutes, on camera, no cuts)",
        "Underdog: no design team? You have a goblin. Free to start.",
        "Proof: real brands born live on camera from 3 random words — imagine what it does with YOUR real idea"
      ]
    },
    "launchPlan": [
      "Ship the free path: idea → kit → first Studio creation with starter Creative Energy",
      "Build in public: founder-led TikTok/Shorts with The Hat as the engine format",
      "Let every kit sell the next one: share cards, QR codes, live reveals on camera",
      "Convert with honesty: same-price nudge, member bonuses, energy that never expires",
      "Graduate the magic: Studio → Labs videos → Sites → Bazaar, one proven experiment at a time"
    ],
    "brandDna": [
      { "label": "Creativity", "score": 92, "why": "A mascot-led magical world in a category full of sterile AI dashboards is a genuinely fresh position." },
      { "label": "Memorability", "score": 94, "why": "You cannot forget a goblin in a purple hoodie who makes brands — the name paints its own picture." },
      { "label": "Clarity", "score": 90, "why": "'Everyone has an idea, BrandGoblin brings it to life' explains the product in one breath." },
      { "label": "Audience Fit", "score": 91, "why": "Creators and founders want speed, magic and encouragement — this brand is built from exactly those three." },
      { "label": "Longevity", "score": 88, "why": "Products are swappable tags; Fox and Nix are the constants — a world that can outlive any single feature." }
    ]
  }
  $output$::jsonb,
  true,   -- favorite: the official brand sits at the top of the vault
  false   -- archived
from auth.users u
where u.email = 'jopro@hotmail.com'
returning id as new_brandgoblin_brand_id;

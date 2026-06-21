# Product Roadmap — BrandGoblin AI

---

## Current Status

### ✅ Live — Free Tier
- Brand name generation (5 names + reasoning)
- 10 taglines
- Brand story + mission statement
- Brand voice guide
- Mascot concept brief
- Color palette (5 colors + hex)
- Website copy (hero, about, features)
- Social media kit (bios + 5 launch posts)
- 7-day launch plan
- 3 free brand generations

### ✅ Live — Creator Pro ($19/month)
- Unlimited brand generations
- 20 content types (social posts, blog, email, ads, etc.)
- 7 voice modes (professional, funny, luxury, friendly, inspirational, minimalist, bold)
- Content history (last 10 generations)
- Creator Pro hub dashboard (`/dashboard/creator-pro`)

---

## Coming Soon

### 🔜 Agency Edition
- Multi-client workspaces
- White-label reports
- Team collaboration
- Agency dashboard
- Waitlist: `agency_waitlist` table in Supabase

### ✅ Goblin Studio — Phases 1 → 1.7 + Share Celebration LIVE (June 21, 2026)
- **Phase 1 (live):** atomic energy reservation, model registry, image generation
- **Phase 1.5 (live, `1fb7d08`):** cook-prompt (Nix/Haiku writes on-brand prompts), editable
  prompt textarea + auto-cook + Re-cook, default Standard quality, NixCooking animation,
  celebration reveal (+10 XP / streak), idea sparks, amber Studio glow.
- **Phase 1.6 (live, `645802d`):** seed pinning (fresh seed on creative change, same on quality-
  only), brand-scoped gallery, orange Conjure button, `/api/studio/process` (crash-safe Remove BG
  + Upscale, derived jobs inherit brand_id), ✨ More like this, Share button (Web Share + clipboard),
  PALETTE LOCK in cook-prompt, Seedream ALT-engine relabel.
- **Phase 1.7 "Juice & Sound" (live, `8123a5a` + `1d500a6`):** real audio pack (8 CC0 files),
  default-on sound with visible mute + one-time hint, anticipation swell during generation (rAF,
  18s, honest time-based) with escalating Nix float + particle sparks, streak-scaled celebration
  burst, streak chime that rises in pitch with the real streak, `nudge.mp3` on post-reveal CTAs.
- **Share Celebration (built June 21, additive to 1.6 Share + 1.7 sound):** real-share-only trigger
  (navigator.share resolves OR clipboard copy succeeds — never on cancel), `playShare()` →
  `share.mp3` applause, celebrating-Nix toast with 4 rotating encouraging lines (3s rotation, 8s
  auto-dismiss), orange "✨ Create something new" loop-back CTA → scrolls to generator. Closes the
  create → share → grow → build loop. Honest-dopamine: celebrates only a genuine share, no nag/FOMO.
- **Additive only** — no changes to energy reservation, Stripe, trial, or grant logic.
- **Phase 2 later:** short-form video (Wan 2.6 / Kling 3.0 — mapped, not built)
- **Phase 3 later:** bring-your-own-brand input (Remove BG + Upscale already shipped in 1.6)

### 🔜 Goblin Labs
- Experimental AI tools
- Future magic

### 🔜 Goblin Sites
- AI-powered website builder
- One-click brand → website

### 🔜 Goblin Growth
- Brand analytics
- Growth strategy tools

### 🔜 Goblin Motion
- AI video & animation
- Brand videos

### 🔜 Goblin Marketplace
- Templates, tools & digital products

---

## Asset Pipeline Status

| Asset | Priority | Status |
|---|---|---|
| `happy-waving-nix.png` | ⭐⭐⭐⭐⭐ | ✅ Live |
| `thinking-nix.png` | ⭐⭐⭐⭐⭐ | 🔴 Pending |
| `working-nix.png` | ⭐⭐⭐⭐⭐ | 🔴 Pending |
| `celebrating-nix.png` | ⭐⭐⭐⭐⭐ | 🔴 Pending |
| `sleeping-nix.png` | ⭐⭐⭐⭐⭐ | ✅ Live |
| `conjuring-nix.png` | ⭐⭐⭐⭐⭐ | ✅ Live |
| `creator-pro-badge.png` | ⭐⭐⭐⭐ | 🔴 Pending |
| `goblin-labs-badge.png` | ⭐⭐⭐⭐ | 🔴 Pending |
| `goblin-studio-badge.png` | ⭐⭐⭐⭐ | 🔴 Pending |
| `scientist-nix.png` | ⭐⭐⭐ | 🔴 Pending |
| `artist-nix.png` | ⭐⭐⭐ | 🔴 Pending |
| `builder-nix.png` | ⭐⭐⭐ | 🔴 Pending |

---

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe Checkout + Webhooks
- **AI:** Anthropic Claude (claude-haiku-4-5 for speed)
- **Hosting:** Vercel
- **Repo:** github.com/MrFoxington/brandgoblin-ai

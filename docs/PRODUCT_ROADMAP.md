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

### 🏗️ Goblin Studio — Phase 1 BUILT (June 20, 2026)
- **Phase 1 live:** atomic energy reservation, model registry, image generation
- `/dashboard/studio` — paid Pro only (trial users shown upgrade prompt)
- fal.ai primary (FLUX schnell/pro, Seedream 4.5) + Replicate fallback
- Stale-job sweeper + fal webhook for server-side completion
- Storage in private `studio-assets` Supabase bucket with signed URLs
- 3-pack energy refill UI ($19/$49/$99) driven by Stripe price metadata
- **Phase 2 next:** short-form video (Wan 2.6 / Kling 3.0 — mapped, not built)
- **Phase 3 later:** background removal, upscale, bring-your-own-brand input

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

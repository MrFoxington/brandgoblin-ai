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

### 🏗️ Goblin Studio — Phase 1.5 BUILT (June 21, 2026) — NOT YET PUSHED
- **Phase 1 shipped:** atomic energy reservation, model registry, image generation (live)
- **Phase 1.5 built (June 21):** all 5 features complete, `tsc + npm run build` clean:
  - **Feature A:** `POST /api/studio/cook-prompt` — Nix (Claude Haiku) writes vivid on-brand
    prompts from brand kit (FREE, Pro-gated, rate-limited). Editable prompt textarea auto-filled,
    debounced auto-cook on brand/type change, Re-cook button. Client prompt sent directly to fal
    (jobs route updated to accept `prompt` field, no longer builds template server-side).
  - **Feature B:** Default quality = Standard (flux_schnell, ≈4 energy). Post-reveal CTAs:
    "Try a variation · ⚡N" / "New style · ⚡N" / "Make another" — the addiction loop.
  - **Feature C:** `NixCooking.tsx` — animated conjuring Nix + rotating status lines (every 2.5s)
    + shimmer bar during active generation. Celebrating Nix + sparkle burst + sound + XP reveal.
    +10 XP per creation (once-per-job ref guard). Streak from localStorage. `playComplete()` on reveal.
  - **Feature D:** Idea sparks row — 4 clickable sparks that set imageType + cook a prompt.
  - **Feature E:** Amber/gold glow on Studio button (Navbar + `shadow-studio-glow` + `animate-studio-glow`
    + NEW badge). Same warm amber treatment on Creator Pro sidebar card and dashboard Studio card.
- **Additive only** — no changes to energy reservation, Stripe, trial, or grant logic.
- **Phase 1.6 next:** multi-variation gacha spread, share-to-grow virality, deeper gamification.
- **Phase 2 later:** short-form video (Wan 2.6 / Kling 3.0 — mapped, not built)
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

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

### ✨ Nix Zone — free Nix goodies (built June 22, 2026 — additive, awaiting push)
- Free, no Pro/energy gate — distribution + brand-affinity surface (`/dashboard/nix`, nav entry
  with purple FREE glow, NOT orange). Display-only: never AI-generates Nix art.
- **Manifest-driven** (`src/lib/nix-assets.ts`): wallpapers / stickers / gallery arrays — adding a
  goodie = drop the file in `/public/nix/<folder>/` + one manifest line. Empty array → graceful
  "coming soon" (waving Nix), never a placeholder.
- **Wallpapers:** desktop + phone downloads, branded at download time with a tasteful
  "Nix · brandgoblinai.com" corner mark via canvas (source file never modified).
- **Stickers:** transparent-PNG grid, individual download + "Download all (zip)" (jszip, dynamically
  imported on click), messenger how-to note.
- **Gallery:** images + clips (`<video>`), each Share (reuses `lib/studio/share.ts`, Nix share text)
  + Download.
- Single renamable `NIX_ZONE_LABEL` (default "✨ Nix").
- **LATER (deferred):** paid physical merch (hoodie, dolls) via print-on-demand — only once a
  fanbase is asking. NOT built.

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
- **Favorites + Button Hierarchy + Share-at-Reveal (built June 21, additive):**
  - `studio_jobs.favorite` flag (migration `20260621_studio_favorites.sql`, partial index) +
    `POST /api/studio/favorite` (Pro-gated, ownership-checked). Gold-star toggle on every card
    (optimistic UI, reverts on failure, `playButtonPress` cue).
  - Favorites filter tab in Studio "Your Creations" (composes with brand filter) + a Favorites
    section on `/dashboard` (capped 6, "view all in Studio"). Single renamable `FAVORITES_LABEL`.
  - Button hierarchy: Share = ORANGE glowing ("Share it ✨"), More like this = GREEN solid;
    Download neutral; Remove BG / Upscale quiet utility chips. Only those two get bold color.
  - Share surfaced at the reveal ("📣 Share it" + "Love it? Show the world 🌍.") — same
    real-share-only flow (`src/lib/studio/share.ts`) → existing Share Celebration.
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

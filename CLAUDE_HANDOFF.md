# BrandGoblin AI — Claude Handoff Document
> Paste this entire file into a new Claude chat to resume exactly where we left off.

---

## 1. WHO YOU ARE IN THIS PROJECT

You are Claude Code, acting as lead developer + asset manager for **BrandGoblin AI** — a Next.js 14 SaaS that generates complete brand kits using AI. You have been working on this project across multiple sessions. This document is the complete state of everything.

---

## 2. THE PROJECT

**BrandGoblin AI** — "Everyone Has An Idea. BrandGoblin Helps Bring It To Life."

- **URL (live):** Deployed on Vercel via GitHub auto-deploy
- **Repo:** `github.com/MrFoxington/brandgoblin-ai`
- **Local path:** `/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai`
- **Mascot:** Nix — a green-skinned, purple-haired goblin in a purple "NIX" hoodie with gold trim. He is the heart and soul of the brand.

### Tech Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Checkout + Webhooks |
| AI | Anthropic Claude (claude-haiku-4-5) |
| Hosting | Vercel (auto-deploy from GitHub main) |
| Styling | Tailwind CSS |

---

## ⚠️ HONEST STATUS (June 18, 2026) — READ FIRST

**Pre-revenue. The app cannot take money yet.** Specifics:

- **Stripe is not switched on.** No `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID_PRO` /
  `STRIPE_WEBHOOK_SECRET` in the live environment. The "$19/mo Creator Pro" button cannot charge.
- **Not pointed at a public domain.** `NEXT_PUBLIC_APP_URL` is still `localhost:3000`.
  Confirm the real Vercel domain before launch.
- **Fixed this session:** a latent payment-killer bug — the `users` table had no
  `stripe_customer_id` column, so a paid upgrade could never be written back. Migration added
  (`supabase/migrations/20260618_add_stripe_customer_id.sql`). **Must be run in Supabase.**
- **Testimonials are placeholders.** Zero real customers so far.
- **Working correctly:** brand generation, auth, free-tier credit enforcement, dashboard.

➡️ **The path to first dollar is in `docs/LAUNCH_CHECKLIST.md`.** Do that before any new features.

---

## 3. WHAT IS LIVE RIGHT NOW

### Pages
| Route | Description | Status |
|---|---|---|
| `/` | Homepage | ✅ Just rebuilt (see below) |
| `/pricing` | 3-tier pricing page | ✅ Live |
| `/login` | Auth login | ✅ Live |
| `/signup` | Auth signup | ✅ Live |
| `/dashboard` | User dashboard with brand kit cards | ✅ Live |
| `/dashboard/generate` | Brand generation form | ✅ Live |
| `/dashboard/creator-pro` | Creator Pro content engine hub | ✅ Live |
| `/dashboard/brand/[id]` | Individual brand kit view | ✅ Live |
| `/admin` | Analytics dashboard | ✅ Live |

### Subscription Tiers
| Plan | Price | Features |
|---|---|---|
| Free | $0 | 3 brand generations, 9 core deliverables |
| Creator Pro | $19/month | Unlimited generations, 20 content types, 7 voice modes |
| Agency Edition | Coming Soon | Multi-client, white-label, waitlist only |

### Key Features Built
- Brand generation: 9 deliverables (names, taglines, story, voice, mascot, colors, website copy, social kit, launch plan)
- Creator Pro: 20 content types × 7 voice modes
- Brand personality: multi-trait selector + vibe description
- Mode selector: "New brand" vs "Existing brand" (Name Strength Check)
- Section reroll (regenerate individual sections)
- Dark mode PDF export
- Goblin Feedback System
- Business idea validation
- Testimonials (stored in Supabase `brand_testimonials` table)
- Agency Edition waitlist (stored in Supabase `agency_waitlist` table)
- Stripe webhooks: subscribe, cancel, downgrade
- Admin analytics dashboard

---

## 4. THE HOMEPAGE — JUST REBUILT (Latest Commit)

The homepage was completely rebuilt from "wall of text" to "show don't tell." Commit: `3f8af82`

### New sections in order:
1. **Hero** — `HeroTypewriter.tsx` — animated typewriter cycling through niches (skincare brand → fitness app → coffee shop → fashion label → podcast brand → SaaS startup → food truck → creative studio). Nix waving on right. Trust bar with gradient avatar stack, 5-star rating, user count.
2. **Comparison Section** — `ComparisonSection.tsx` — "The DIY Way" (❌ 47 ChatGPT prompts, 6-40 hours) vs "The Nix Way" (✓ one prompt, 1 min 47 sec). Scroll-reveal animations.
3. **Live Brand Kit Preview** — `BrandKitPreview.tsx` — Interactive tabbed demo showing a REAL generated brand kit for "Solace Skincare" (fictional example). Tabs: Names | Colors | Voice | Copy | Social Post. Animated counters: 12 deliverables · 112 sec · $4,800+ agency equivalent.
4. **Testimonials** — `TestimonialsSection.tsx` — 6 hardcoded outcome-driven cards with CSS gradient avatars (PLACEHOLDER — replace with real customers at launch). Specific stats: "47 min", "$8K saved", "+40% engagement".
5. **What You Get** — 9 feature cards each with inline sample output snippet
6. **How It Works** — 3 steps with real example prompts shown
7. **Pricing** — 3 tiers (free/pro/agency)
8. **Final CTA** — Uses conjuring-nix.png, personality copy

**Important:** Testimonials are currently PLACEHOLDER. The user will replace with real customer names, photos, and quotes before launch. The current cards have a small disclaimer note.

---

## 5. NIX CHARACTER — ASSET SYSTEM

### The Rules (CRITICAL)
1. **NEVER generate or fabricate Nix assets.** All Nix images come from the user generating in ChatGPT using the master sheet, then dropping the PNG file.
2. **Workflow:** User generates in ChatGPT → drops PNG → Claude places in `/public/nix/` folder → wires into app
3. **Master sheet:** `/public/nix/nix-master-sheet.png` — NEVER overwrite, never edit
4. **Quality check before placing:** green skin, purple hair, pointed ears, purple hoodie with gold trim, "NIX" on hoodie

### Current Nix Poses
| Pose | File | Used In | Status |
|---|---|---|---|
| Happy Waving | `/public/nix/happy-waving-nix.png` | Homepage hero, dashboard | ✅ Live |
| Thinking | `/public/nix/thinking-nix.png` | Loading screen, FAQ | ✅ Live |
| Working | `/public/nix/working-nix.png` | Creator Pro hub | ✅ Live |
| Celebrating | `/public/nix/celebrating-nix.png` | Success screens | ✅ Live |
| Sleeping | `/public/nix/sleeping-nix.png` | Empty states | ✅ Live |
| Conjuring | `/public/nix/conjuring-nix.png` | Final CTA, Goblin Labs | ✅ Live |
| Artist | `/public/nix/artist-nix.png` | Goblin Studio | 🔴 Needs drop |
| Scientist | `/public/nix/scientist-nix.png` | Goblin Labs | 🔴 Needs drop |
| Builder | `/public/nix/builder-nix.png` | Goblin Sites | 🔴 Needs drop |

### Still Needed
| Asset | Folder | Status |
|---|---|---|
| `brandgoblin-logo-dark.png` | `/public/logos/` | 🔴 Needs upload |
| `brandgoblin-logo-light.png` | `/public/logos/` | 🔴 Needs upload |
| `favicon.ico` | `/public/favicons/` | 🔴 Needs upload |
| `og-image.png` | `/public/social/` | 🔴 Needs upload |
| `twitter-card.png` | `/public/social/` | 🔴 Needs upload |
| All ecosystem badges | `/public/badges/` | 🔴 Needs generation |

---

## 6. BRAND ASSET RULES (CRITICAL FOR ANY NEW CLAUDE SESSION)

```
IF /public/logos/brandgoblin-logo.png does not exist:
  → STOP all branding work
  → Ask user to upload the official logo PNG
  → Wait for the file
  → Continue only after confirmed
```

- **Logo:** `/public/logos/brandgoblin-logo.png` ✅ exists
- **Always use Next.js `<Image>` component** — never `<img>` tags
- **Never generate background gradients or placeholder images** to substitute for official assets

---

## 7. DOCS IN THE PROJECT

All docs live at `/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai/docs/`

| File | Purpose |
|---|---|
| `ASSET_MAP.md` | Every asset path, status, where it's used |
| `NIX_CHARACTER_RULES.md` | Full Nix character bible + rules |
| `BRAND_GUIDELINES.md` | Colors, fonts, voice, brand rules |
| `PRODUCT_ROADMAP.md` | Feature status + ecosystem plans |

---

## 8. ECOSYSTEM ROADMAP (Coming Soon Products)

| Product | Description | Status |
|---|---|---|
| Creator Pro | AI content engine (LIVE) | ✅ Live |
| Goblin Studio | Full brand identity + logo design | 🔜 Planned |
| Goblin Labs | Experimental AI tools | 🔜 Planned |
| Goblin Sites | AI website builder | 🔜 Planned |
| Goblin Growth | Brand analytics + strategy | 🔜 Planned |
| Goblin Motion | AI video + animation | 🔜 Planned |
| Goblin Marketplace | Templates + digital products | 🔜 Planned |
| Agency Edition | Multi-client workspace | 🔜 Waitlist open |

---

## 9. WHAT TO DO NEXT (Suggested Priority Order)

### Immediate / Before Launch
- [ ] Replace placeholder testimonials with real customer quotes + real photos
- [ ] Upload favicon (`/public/favicons/favicon.ico`)
- [ ] Upload OG image for social sharing (`/public/social/og-image.png`)
- [ ] Add social media links to footer (Twitter/X, TikTok, Instagram)
- [ ] Mobile audit — test on real phone, check hero layout
- [ ] Generate remaining Nix poses: artist, scientist, builder

### Near-Term Improvements
- [ ] Annual pricing toggle on pricing page (e.g. $15/mo annual vs $19/mo monthly)
- [ ] Auth page split layout (left: form, right: live brand kit preview)
- [ ] FAQ section with thinking-nix.png
- [ ] "Try it free" interactive demo — no-signup teaser that generates one brand name
- [ ] Vercel Analytics + Speed Insights wired up (`@vercel/analytics`)

### Planned Features
- [ ] Goblin Studio MVP (logo generation via image AI)
- [ ] Goblin Sites MVP (one-click brand → landing page)
- [ ] Dashboard onboarding flow for new users

---

## 10. HOW PUSHING TO GITHUB WORKS

- Vercel auto-deploys when you push to `main`
- To push you need a GitHub PAT (Personal Access Token) with `repo` scope
- Generate at: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
- Claude uses it temporarily to push, then clears it from the remote URL immediately
- You should NOT share PATs in chat — but we have been doing this for convenience. Consider switching to SSH keys for a more permanent solution.

---

## 11. CURRENT COMPONENT MAP

```
src/
  app/
    page.tsx                    ← Homepage (just rebuilt)
    layout.tsx                  ← Root layout
    pricing/page.tsx            ← Pricing page
    login/page.tsx              ← Login
    signup/page.tsx             ← Signup
    dashboard/
      page.tsx                  ← Dashboard home
      generate/page.tsx         ← Brand generation form
      creator-pro/page.tsx      ← Creator Pro hub
      brand/[id]/page.tsx       ← Individual brand kit
    admin/page.tsx              ← Analytics
    api/
      generate/route.ts         ← Brand generation API
      stripe/webhook/route.ts   ← Stripe webhooks
      creator-pro/route.ts      ← Content generation API

  components/
    Navbar.tsx
    Footer.tsx
    Particles.tsx
    LoadingScreen.tsx           ← Uses thinking-nix.png
    BrandKitView.tsx            ← Full brand kit display
    CreatorProHub.tsx           ← Creator Pro content engine
    HeroTypewriter.tsx          ← NEW: animated hero
    ComparisonSection.tsx       ← NEW: DIY vs Nix comparison
    BrandKitPreview.tsx         ← NEW: interactive demo
    TestimonialsSection.tsx     ← NEW: social proof cards
```

---

## 12. HOW TO RESUME IN A NEW CHAT

**Step 1:** Open a new Claude Code chat in the same project folder:
`/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai`

**Step 2:** Paste this entire document as your first message, then say what you want to work on next.

**Step 3:** Claude will have full context and can pick up immediately.

---

*Last updated: June 18, 2026 — Stripe hardening + stripe_customer_id migration + launch checklist. See docs/LAUNCH_CHECKLIST.md.*

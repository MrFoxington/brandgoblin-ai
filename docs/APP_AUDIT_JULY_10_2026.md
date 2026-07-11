# Deep Dive Audit #3 — July 10, 2026
### Full fresh-eyes walkthrough: landing (brandgoblinai.com) + app (app.brandgoblinai.com), in-browser on Fox's logged-in account. Zero energy spent.

**Context: Fox's goal is daily-use readiness for the acquisition push. The bar is "best version it can be," not "good enough."**

---

## ✅ VERIFIED WORKING (this session)

1. **July 5 push IS deployed.** "POWERED BY NIX ✨" lockup live in the app navbar; footer brand line + copyright line live. Landing footer also shows "Powered by Nix ✨" (2 places).
2. **App consoles CLEAN** on /dashboard, /dashboard/creator-pro, /dashboard/studio. No hydration errors.
3. **Dashboard is rich and healthy:** streak, XP/level card, energy meter (209/1,000 · 21% with a proper "running low" warning + capacity estimates: ~20 social posts / ~2 blogs / ~6 emails / ~6 ad sets), Today's Idea, Quick Creates grid, Favorites, Brand Vault (8 brands, filters working).
4. **Studio healthy:** BYOL gold panel + rights checkbox live, energy widget consistent with dashboard, Nix auto-cooks the prompt on load.
5. **Pricing page $19/mo Creator Pro** matches the landing pricing section. Clean 2-tier layout.
6. **Landing content is strong:** teaser hero, sparks grid, hard-way-vs-magic-way, addiction loop, FAQ, legal links.

---

## 🔴 FIX-FIRST LIST (code, all quick — Claude can ship these)

1. **App footer shows "Sign In / Sign Up" to a logged-in user** (still, from July 5). Should be Dashboard / Account / Sign Out. Trust-killer for daily users.
2. **Footer ecosystem chips say "Goblin Studio — Soon" while Studio is LIVE** with a NEW badge in the same viewport. Contradicts our own product. Change Studio chip to live/link state.
3. **Bare `/studio` still 404s — and it's the unbranded default Next.js 404** (black page, no nav, no way home). Two fixes in one: redirect /studio → /dashboard/studio, AND build a branded 404 page (Nix + "this page got goblin'd" + buttons to Dashboard/Studio). A branded 404 is a shareable delight moment; the default one is a dead end.
4. **Pricing copy mismatch** (still, from July 2): "Top up energy anytime for $19" but the modal defaults to the $49 Value pack. Change to "Top up energy anytime — packs from $19."
5. **App navbar shows landing-page marketing links (Features / How It Works / Examples / About) to logged-in users.** A daily-use app should lead with app nav: Dashboard / Studio / Nix / Pricing / Generate. Marketing anchors send logged-in users BACK to the sales pitch. (Keep them for logged-out visitors.)
6. **Greeting says "Good evening, Jopro"** — verify "Jopro" is the display name Fox intends (profile name pull). If it's a stale/garbled profile value, add a profile-name edit field in account settings.

## 🟡 LANDING (Airo) — STILL PENDING, Fox's paste-in homework
7. **React #418 hydration error still fires on every landing load** (Airo fix pack Block 3).
8. **Dead social icons still in landing footer** (Twitter/GitHub/LinkedIn → "#") (Block 2 — remove them; no real profiles yet). NOTE: once Fox creates his founder accounts (today's homework!), these can become REAL links instead of being removed.
9. **"Already have a brand?" BYOL line still missing** (Block 1) — the July 4 feature is invisible to the exact audience it converts.
10. **Header "Powered by NIX" tagline (Block A) not applied** — footer version is live, header is not.

## 🔵 BEST-VERSION IMPROVEMENTS (the "not just good enough" list)

11. **The landing promises "Download your complete brand kit" — VERIFY the app delivers a one-click export.** If there's no single "Download Brand Kit" button (PDF/ZIP with name, story, colors, logo art, copy), that's a promise gap AND the single most shareable artifact the product could produce. Users showing their brand kit PDF to friends = organic distribution. STRONGLY consider making this the next feature if it doesn't exist.
12. **First-run experience unaudited:** signup → first brand flow wasn't tested this session (needs a fresh test account; Fox call — do one live signup walkthrough before the acquisition push, it's the funnel's front door).
13. **Fade-in animations delay content.** Dashboard and landing content sits at near-zero opacity for noticeable beats (screenshots caught whole sections invisible). Consider faster/shorter reveal animations, especially above the fold on landing (LCP + bounce risk on TikTok-referred mobile traffic).
14. **Brand Vault tag chips truncate awkwardly** ("Mushrooms, Mag..."). Cap visible tags at 2 + "+n".
15. **App pricing page could answer "what is Creative Energy?"** — a 3-question mini FAQ (What's energy? What does a generation cost? Do unused refills roll over?) would de-risk the $19 decision. The landing FAQ doesn't cover energy either.
16. **Duplicate "Start Creating Free" CTAs stack in the landing footer area** (nav button + floating sticky button side by side at bottom). Minor visual noise; consider hiding the sticky one once the footer is in view.

---

## Suggested priority order
1. Items 1-4 (one session of code fixes, all verified fixable) → push → these become the "I audited my own app and fixed everything in a day" build-in-public video.
2. Fox pastes Airo Blocks 1-3 (+ header tagline) — 20 minutes.
3. Verify/build the Brand Kit download (item 11) — biggest product win on the list.
4. One live signup-to-first-brand walkthrough (item 12) before Day 1 of the acquisition plan.

*Previous audits: DEEP_DIVE_AUDIT_JULY_2_2026.md, DEEP_DIVE_AUDIT_JULY_5_2026.md.*

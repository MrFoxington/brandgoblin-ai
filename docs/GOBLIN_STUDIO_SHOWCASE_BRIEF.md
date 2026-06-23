# Goblin Studio — Live Showcase Wall (embeddable rotating gallery of real creations)

### A live, auto-rotating "Wall of Creations" of REAL Studio output, embeddable on the Airo landing
### via iframe, curated to the best brands — so visitors think "oh shit, I can make THAT — right now."
> Build spec for Claude Code. Additive to the app. Public, read-only, privacy-safe. The Airo landing
> embeds it via a single iframe (Airo blocks custom JS but allows iframes). From Fox, June 21, 2026.

---

## NORTH STAR
**Bring out people's creative energy.** Real, gorgeous, on-brand creations rotating in front of a
visitor are the ultimate proof: not "here's what it could do" — "here's what people *just made*."
That converts the "I have an idea" spark into "I have to try this right now, for free."

---

## WHY AN IFRAME (the platform constraint)
The marketing site is GoDaddy **Airo**, which **disables custom JavaScript** but **allows iframe
embeds** in an HTML section. So: build the live gallery as a standalone embeddable page in OUR app
(`app.brandgoblinai.com`), and Airo embeds it via one `<iframe>`. The iframe pulls live from our DB,
so the wall updates automatically — no manual Airo edits, ever.

---

## FEATURE A — Curation: mark the "best" creations as featured
- Add a **`featured` boolean** (default false) to `studio_jobs` (+ optional `featured_order int` and
  `featured_at timestamptz`). Simple migration, additive.
- **Curate without manual busywork:**
  - Seed the showcase by auto-featuring **Fox's own account's best completed image jobs** (his brands
    — he owns + consents to them) so it's populated from day one.
  - Add a lightweight **"⭐ Feature in showcase" toggle** in the existing `/admin` (or a small admin-
    only control) so Fox can curate the exact best set.
  - (Optional, later) a scheduled task can auto-rotate which creations are featured daily/weekly for
    freshness — but the wall is LIVE regardless, so this is just for variety.
- **CONSENT RULE (hard):** only `featured = true` items appear publicly. A creation may be featured
  ONLY if it's Fox-owned OR the creator has explicitly opted in to public showcase. Never auto-
  feature other users' work. Re-run moderation (the existing `enable_safety_checker` result / a
  safe-content check) before anything is shown publicly.

## FEATURE B — Public read-only showcase API
- New **public** route, e.g. `GET /api/showcase` (no auth), returns ONLY featured items, ONLY public-
  safe fields: a **freshly-signed short-lived image URL** (from the private `studio-assets` bucket),
  the brand name, the image type, and optionally a short prompt/teaser. NOTHING else (no user IDs,
  no emails, no private prompts beyond a curated teaser).
- Cache sensibly (e.g. short server cache) so it's fast and doesn't hammer storage signing.

## FEATURE C — The embeddable rotating wall (`/embed/showcase`)
- New **chrome-less** page `app.brandgoblinai.com/embed/showcase` — no navbar/footer, just the
  gallery, transparent/dark background, designed to live inside an iframe.
- **Auto-rotating motion** (pick the most exciting, on-brand option — recommend a continuous
  horizontal **marquee row** of creation cards that loops seamlessly, OR a spin-reveal carousel):
  - Each card: the real image + brand name (+ a sparkle/magic accent, on-brand purple/gold).
  - Smooth continuous motion; **pause on hover**; **swipeable** on touch.
  - Respect `prefers-reduced-motion` (no auto-scroll; show a static swipeable row).
- Pulls from `GET /api/showcase` on load; **live** — reflects whatever's currently featured.
- Lightweight + fast (it's an embed); lazy-load images; cap the number shown (e.g. 12–20 best).
- Visually irresistible but on-brand: this is the "wow" — make the images the hero.

## FEATURE D — Optional public `/showcase` page (nice-to-have)
- A full app page `app.brandgoblinai.com/showcase` using the same data + a bolder layout, with a
  prominent orange **"✦ Start Creating — Free"** CTA → `/signup`. The Airo "See Example Brands" link
  could eventually point here. (Optional for v1; the iframe wall is the priority.)

---

## AIRO EMBED STEP (after the app side is live + deployed)
In Airo: add an **HTML / Embed section** where the showcase should appear (right after the hero /
Studio section), and paste an iframe like:
```
<iframe src="https://app.brandgoblinai.com/embed/showcase"
        style="width:100%;border:0;height:420px;" loading="lazy"
        title="Real brands made with BrandGoblin Studio"></iframe>
```
Tune the height for mobile (iframes don't auto-resize in Airo — pick a height that looks good on
phone + desktop, or provide a mobile-specific height). Place it where a visitor hits it early, paired
with the orange CTA so the reaction is "wow → I have to try this → start free."

---

## ACCEPTANCE / GUARDRAILS
- Only `featured = true`, consent-cleared, moderation-passed creations are ever public. Start with
  Fox-owned brands; other users require explicit opt-in. (Hard rule.)
- `/api/showcase` exposes only public-safe fields + short-lived signed image URLs; no private data.
- `/embed/showcase` is chrome-less, fast, auto-rotating, pause-on-hover, swipe, reduced-motion-safe.
- Additive — no changes to energy reservation, Stripe, trial, or generation logic. Nix PNGs only if
  used. `tsc` + `npm run build` clean; commit as one phase; don't push until reviewed. Update
  `CLAUDE_HANDOFF.md` + `PRODUCT_ROADMAP.md`.

## THE FEELING
A visitor lands, reads "watch your idea become real," and right there a wall of stunning real brands
(Shroomadu, Spinaway, the best ones) glides past — logos, product shots, social art — all made in the
app. They think: "people actually made these… I have an idea… I could make mine right now." Then the
orange button is right there. Free. They click.

*Created June 21, 2026. Showcase wall — embeddable via iframe (Airo blocks JS, allows iframes).
Consent + moderation guardrails mandatory. Updates auto-pull from the app; curate via featured flag.*

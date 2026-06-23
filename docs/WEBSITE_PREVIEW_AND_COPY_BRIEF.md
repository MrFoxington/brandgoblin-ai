# Build Brief — "Preview as a Live Webpage" + Richer Website Copy

### Two features, one phase. (A) One-click render the generated brand as a real, downloadable landing
### page. (B) Make the website-copy deliverable richer so that page is complete and paste-ready.
> Additive only. No energy / Stripe / auth / trial changes. Backward-compatible with existing brands.
> tsc + `npm run build` must pass clean. Commit as one phase; HOLD for review before push.

---

## CONTEXT / WHY
We tested the generated website copy by hand-building a real landing page from a brand ("REPLICATE") —
it worked beautifully but revealed the copy is a great *landing page* yet thin for a *complete site*
(no SEO meta, FAQ, footer, email capture, or rich features). This phase (1) turns "render the copy into
a real page" into a product feature with HTML export, and (2) expands what Nix generates so the exported
page is genuinely launch-ready.

Relevant existing files:
- `src/types/index.ts` — `WebsiteCopy` interface (~line 160) + `BrandKit` (~line 218).
- `src/lib/prompts.ts` — generation prompt; `websiteCopy` schema appears twice (~line 97 and ~line 190).
- `src/components/BrandKitView.tsx` — renders the kit; Website Copy is section 10 (~line 284).
- `src/app/brand/[id]/print/page.tsx` — existing per-brand route; MIRROR its data-load + ownership/auth
  pattern for the new preview route.
- `src/components/BrandActions.tsx` — the action cards (Export/Share) on a brand; add a Preview action.
- `src/lib/clipboard.ts` — use `copyToClipboard()` for the Copy-HTML button.

---

## PART B FIRST — RICHER WEBSITE COPY (do this before the template so the template can use it)

### B1. Extend the type (all new fields OPTIONAL — old brands must still typecheck & render)
In `src/types/index.ts`:
```ts
export interface WebsiteFeature { title: string; description: string; }
export interface FaqItem { question: string; answer: string; }

export interface WebsiteCopy {
  heroHeadline: string;
  subheadline: string;
  ctaText: string;
  aboutSection: string;
  featureBullets: string[];          // keep — backward compat
  // NEW (optional):
  seoTitle?: string;                 // <=60 chars
  metaDescription?: string;          // <=155 chars
  secondaryCtaText?: string;         // short, lower-commitment
  features?: WebsiteFeature[];       // 4–6, richer than bullets
  faqs?: FaqItem[];                  // 3
  footerTagline?: string;            // short brand line for footer
  emailCaptureHeadline?: string;     // e.g. "Be the first to know"
}
```

### B2. Update the generation prompt (`src/lib/prompts.ts`)
Update BOTH `websiteCopy` schema blocks to include the new fields, with guidance. The annotated block
should read roughly:
```
"websiteCopy": {
  "heroHeadline": string,           // punchy, benefit-first, <= ~60 chars
  "subheadline": string,            // 1 sentence expanding the promise
  "ctaText": string,                // primary button label
  "secondaryCtaText": string,       // lower-commitment, e.g. "See how it works"
  "aboutSection": string,           // 2–4 sentences, brand voice
  "featureBullets": [ string ],     // 4–6 (kept for compatibility)
  "features": [ { "title": string, "description": string } ], // 4–6; title 2–4 words, desc 1 benefit-led sentence
  "faqs": [ { "question": string, "answer": string } ],       // exactly 3, real buyer questions, 2–3 sentence answers
  "seoTitle": string,               // <=60 chars, includes brand name + core value
  "metaDescription": string,        // <=155 chars, benefit-driven, no fluff
  "footerTagline": string,          // short memorable brand line
  "emailCaptureHeadline": string    // short, e.g. "Get early access"
}
```
Add a line to the prompt instructions: "Write all website copy in the brand's voice, specific and
benefit-driven — never generic placeholder text. The copy must be ready to paste into a real site."
Keep the rest of the kit schema unchanged. Ensure the model still returns valid JSON.

### B3. Section reroll
`src/app/api/generate/section/route.ts` handles `websiteCopy` re-conjure — confirm it regenerates the
full (now richer) object against the same schema. No structural change expected; just verify.

### B4. Render the new fields in `BrandKitView.tsx` (Website Copy section)
Add, below the existing fields (each with a `<CopyButton>`):
- SEO title + meta description (small, labeled "SEO").
- Features as title + description rows (use `features` if present, else fall back to `featureBullets`).
- FAQs (question bold, answer muted).
- Footer tagline + email-capture headline.
Update the section-level `copyText` to include the new fields so "copy whole section" copies everything.
All new fields render ONLY if present (old brands degrade gracefully).

---

## PART A — PREVIEW AS A LIVE WEBPAGE + DOWNLOAD/COPY HTML

### A1. Single source of truth: a standalone-HTML generator
Create `src/lib/website/renderSite.ts`:
```ts
export function renderBrandSiteHTML(kit: BrandKit): string
```
- Returns a COMPLETE, self-contained HTML document (inline `<style>`, no external deps) — a polished,
  responsive landing page populated ONLY from the kit's generated copy + colors. This same string is
  what the preview shows AND what the user downloads (WYSIWYG, one renderer).
- Sections (render a section only if its data exists): nav (brand name + secondary CTA) · hero
  (heroHeadline, subheadline, primary CTA) · about · features (title+desc, or bullets fallback) ·
  FAQ · email-capture band · footer (footerTagline + name + small "Made with BrandGoblin").
- Set `<title>` = seoTitle (or name) and `<meta name="description">` = metaDescription.
- THEME: derive from `kit.colorPalette`. Add a helper `pickTheme(colors)` that computes each swatch's
  relative luminance and chooses: a background, a readable text color (near-white on dark bg / near-black
  on light bg — enforce adequate contrast), a primary accent (a vivid mid-luminance swatch), and a muted
  text color. THIS IS THE KEY ROBUSTNESS PIECE — it must look right for a dark brand (REPLICATE) AND a
  light brand (e.g. skincare). Never render low-contrast/unreadable text.
- `prefers-reduced-motion`: no essential motion; keep effects subtle/optional.
- Escape user/generated text to avoid broken HTML.

### A2. Preview route
Create `src/app/brand/[id]/preview/page.tsx`:
- Load the brand kit by id using the SAME data-fetch + ownership/auth approach as
  `src/app/brand/[id]/print/page.tsx`.
- Compute `const html = renderBrandSiteHTML(kit)`.
- Render a full-viewport `<iframe srcDoc={html} sandbox="allow-same-origin" style="width:100%;height:100vh;border:0">`
  so the preview is EXACTLY the downloadable file.
- Render a thin top action bar (a small client component `PreviewActions`) over/above the iframe with:
  **⤓ Download HTML**, **Copy HTML**, and **← Back to kit**.

### A3. Preview actions (client component)
`src/components/preview/PreviewActions.tsx` — receives the `html` string + brand name:
- Download: `new Blob([html], {type:"text/html"})` → trigger download `"<brandName>-website.html"`.
- Copy: `copyToClipboard(html)` (from `@/lib/clipboard`) → success/failure toast.
- Back: link to the brand kit page.

### A4. Entry points
- In `BrandKitView.tsx`: add a **"👁 Preview as Webpage"** button near the top actions (and/or the
  Website Copy section header) → links to `/brand/[id]/preview`, opens in a new tab.
- In `BrandActions.tsx`: add a **"Preview Website"** action card alongside Export/Share.

---

## ACCEPTANCE / GUARDRAILS
- Additive only; no energy/Stripe/auth/trial changes. New `WebsiteCopy` fields are OPTIONAL; existing
  brands typecheck, render, preview, and export without errors (sections simply omit missing data).
- Preview = iframe of `renderBrandSiteHTML()`; the downloaded/copied HTML is byte-identical to the preview.
- Theme is contrast-safe on both dark and light palettes (the REPLICATE dark palette and a light palette
  must both be readable).
- Reuse `copyToClipboard()`; respect `prefers-reduced-motion`; Next.js `<Image>` only if images are used.
- `tsc` clean, `npm run build` clean. Commit as one phase. HOLD for review before push.
- Update `CLAUDE_HANDOFF.md` (new feature) and `PRODUCT_ROADMAP.md` (note: "Feature live-site previews
  in the showcase" deferred as a later phase).

## OUT OF SCOPE (later)
- Featuring live-webpage previews in the admin/showcase (Part C) — deferred.
- Custom domains / hosting the page for the user — they download the HTML and host it themselves for now.

*Created June 22, 2026. Turns "we generate copy" into "we hand you a real, downloadable website."*

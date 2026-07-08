# Build Brief — Studio Share fix (phone-first) + Lightbox viewer

### Two paired upgrades to the Studio creation experience. (A) Make sharing actually work on phones —
### native share sheet with the real file + Save to Photos. (B) Click any creation → full-screen viewer
### with the share/save actions in it. This is a DISTRIBUTION lever (every creation becomes spreadable).
> Additive; no energy/Stripe/auth changes. tsc + `npm run build` clean. Commit; HOLD for review before push.
> Key files: `src/lib/studio/share.ts`, `src/components/studio/JobCard.tsx`, (new) lightbox component.

---

## A. SHARE FIX — share the FILE via the native sheet (not the URL)
**Problem (verified in code):** `JobCard.handleShare()` calls `shareImage(job.output_url)`, which does
`navigator.share({ url })` — on a phone that shares a *link*, not the image, so IG/TikTok/Save-to-Photos
don't get the actual creation. And `handleDownload()` is a desktop anchor download (saves to a folder —
useless on mobile). DO NOT build direct IG/TikTok/X posting APIs (IG has no web posting API; TikTok needs
heavy approval; X is paid/restricted). The native share sheet gives ~95% of that for far less.

**Fix — in `src/lib/studio/share.ts`:** add a file-first share:
```
export async function shareImageFile(url, { title, text, filename }): Promise<ShareResult>
```
1. `fetch(url)` → `blob` → `new File([blob], filename, { type: blob.type })`.
2. If `navigator.canShare?.({ files: [file] })` → `await navigator.share({ files: [file], title, text })`
   → return "shared" (AbortError → "cancelled"). This opens the OS sheet with Instagram, TikTok, X, AND
   "Save to Photos" already present — the user taps one and it opens with the creation loaded.
3. Else fall back to the EXISTING URL share, then clipboard (keep current behavior).
Keep the "celebrate only on shared|copied, never on cancel" contract.

**In `JobCard.tsx`:**
- `handleShare()` → call `shareImageFile(job.output_url, { filename: "goblin-studio-<type>-<id>.jpg" })`.
  Keep the orange "Share it ✨" button as the prominent growth action.
- Add a clear **"Save"** (Save to Photos) action: on mobile, call `shareImageFile` (the sheet offers
  "Save Image"); on desktop, do the existing blob download. (Detect via `navigator.canShare` w/ files, or a
  small `isMobile` check.) Make Save easy to find — it's the #1 phone action.
- Keep the existing blob download as a desktop fallback (it's fine there); just don't make it the primary
  mobile path.

## B. LIGHTBOX — click a creation → full-screen viewer with actions
**Problem:** clicking the image in `JobCard` does nothing; users can't see their creation big.
**Fix:** new `src/components/studio/StudioLightbox.tsx`:
- Opens when the user clicks the creation thumbnail in `JobCard` (make the image wrapper a button/clickable).
- Full-screen overlay (dim backdrop), the creation shown large and centered (support BOTH `<Image>` for
  images and a `<video controls>` for video jobs, keyed off job type/url).
- **Keep the actions IN the lightbox** so the user never exits to do the next step: Share it (file-share),
  Save to Photos, ✨ More like this, ⭐ Favorite, Download.
- Close via an X button, Esc key, and backdrop click. Trap focus while open; restore on close.
- Respect `prefers-reduced-motion` (no big animations if reduced). `position: fixed` is fine here (real app).
- Reuse the same handlers/props JobCard already has (onMoreLikeThis, onToggleFavorite, onShareSuccess) so
  behavior is identical inside and outside the lightbox.

## ACCEPTANCE
- On a phone, tapping Share opens the OS sheet WITH the actual image and Save-to-Photos / IG / TikTok / X.
- "Save" puts the image in the camera roll on mobile (via the sheet) and downloads on desktop.
- Clicking any creation opens a full-screen viewer with all actions present; Esc/backdrop/X close it.
- No direct social-API integrations built. Additive; existing share-celebration + favorite logic reused.
- `prefers-reduced-motion` respected; Next.js `<Image>`; tsc + build clean; commit; HOLD for review.

*This is the highest-leverage Studio upgrade: it turns every creation into something that spreads on its own.*

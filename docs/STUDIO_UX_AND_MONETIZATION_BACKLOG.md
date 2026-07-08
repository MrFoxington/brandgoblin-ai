# Goblin Studio — UX + Monetization Backlog (Fox's ideas, reviewed)

### Reviewed June 24, 2026. These are mostly CONVERSION + CORE-UX fixes (not feature-bloat) — they serve
### the two scarcest things: distribution and revenue. Prioritized below. Build when ready; Share fix is
### worth doing soon because it directly amplifies distribution.

---

## PRIORITY ORDER
1. **Share fix** — native share sheet + Save to Photos (distribution lever; phone-first). ← do soon
2. **Lightbox viewer** — click a creation → full-screen, with share-in-place (easy, expected).
3. **Free Studio taste** — Nix CTA + small capped energy grant + dual monetization (best revenue lever).
4. **Surgical juice/haptics** — reward the peaks, not every click; haptics = native app, later.

---

## 1. SHARE FIX (highest leverage) ⭐
**Problem:** Share/download is desktop-oriented. On phones (most users) it downloads to a folder — useless.
The Share button has lots of options but not the *right* ones front-and-center.
**The honest fix — DON'T build direct social APIs.** Instagram has no public web-app posting API; TikTok's
Content Posting API needs heavy approval; X's API is paid/restricted. Building per-platform integrations =
weeks of fragile work platforms can revoke. Instead:
- Use the **Web Share API with the actual FILE**: `navigator.share({ files: [file], title, text })`. On a
  phone this opens the OS share sheet with Instagram, TikTok, X, AND "Save to Photos" already present — the
  user taps the app they want and it opens with the creation loaded. The OS provides the integrations.
- Front-and-center actions: **Save to Photos** + the native Share sheet. Keep a "Copy link" fallback.
- Fix the download: on mobile, prefer share-sheet/Save-to-Photos over an anchor download (which saves to a
  folder). Desktop can keep a normal download.
- This single change delivers ~95% of the "post straight to social" dream for a fraction of the effort, and
  fixes Save-to-Photos + the bad download at once.
**Why #1:** share = distribution = the #1 constraint. Every un-shareable creation is a lost free impression.

## 2. LIGHTBOX VIEWER (easy win)
**Problem:** Clicking an image/video in the Studio doesn't enlarge it. People want to see what they made, big.
**Fix:** Click any creation → full-screen lightbox/viewer (image or video player). Keep the **Save / Share /
Make-another** actions right inside the viewer so the user never has to exit to do the next step. Esc/tap-out
to close. Pairs directly with the Share fix (#1).

## 3. FREE STUDIO TASTE + MONETIZATION (best revenue lever)
**Idea:** Let free users experience the Studio (the "wow"), then convert. Nix pop on the brand dashboard /
after a kit: "Let's cook it up in the Studio!" with a glowing **orange CTA**.
- **Free starter energy grant** so they can actually create a couple things. **CAP IT TIGHT (~300, not 500)** —
  enough for 1–2 real creations to feel the magic, not enough to satisfy.
- **Dual monetization:** "Upgrade to Creator Pro" CTA AND a "Top up energy — $19" option, so even non-subscribers
  can pay. (Even a free user can become revenue.)
- **Stage the CTA by state:** lead with "Try Goblin Studio — free"; once energy runs dry, switch to
  "Upgrade / Top up to keep creating."
- **Always-free:** Nix stickers + wallpapers stay ungated (goodwill + distribution).
**⚠️ The one real risk — cost.** Free generations cost real money (fal/Replicate). The free grant is a
*marketing expense (CAC)*, not free. Cap it, and confirm grant-size × expected-free-users is affordable.
Reuse the existing energy reservation/refund + moderation. Best CTA placement: right at the kit-reveal /
brand-dashboard moment (highest intent), and an empty-energy upsell state inside the Studio.

## 4. SURGICAL JUICE / HAPTICS (polish)
**Idea:** Every click feels alive — sound + haptics + micro-animation.
**Honest guidance:**
- Juice the **peaks** (reveal, create, share, level-up, streak), NOT every click — over-juicing gets muted fast.
- Keep the existing mute toggle; respect `prefers-reduced-motion`.
- **Haptics don't exist on web** — that's a native-app feature for later. On the website, "alive" = tasteful
  micro-animations + sound at key moments only.

---

## SEQUENCING NOTE
All of this matters most once people are IN the app — so the real gate is still distribution (the Nix rig +
content engine). Recommendation: do the **Share fix soon** (it makes every creation spreadable, feeding
distribution), keep the rest as this backlog, and build #2–#4 as users start arriving. Don't let Studio
polish pull focus from the rig.

*Reviewed by Claude, June 24, 2026. Honest verdict: strong, conversion-focused ideas — the Share fix is the
sleeper hit because it's a growth lever disguised as a UX fix.*

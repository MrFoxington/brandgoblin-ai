# Deep Dive Audit, July 2, 2026

Live walkthrough of brandgoblinai.com (landing) and app.brandgoblinai.com, done in Chrome on Fox's logged-in account. Every finding below was seen live, not guessed from code.

## FIX FIRST (costing conversions right now)

### 1. Landing site "Sign In" goes to the wrong page
Both Sign In links (desktop nav and mobile menu) point to `/signup` instead of `/login`. A returning customer who clicks Sign In lands on the signup page. This was Airo Block 11 and it is still not done.
Fix in Airo: change the Sign In link URL to `https://app.brandgoblinai.com/login`.

### 2. Three broken images in the Goblin Studio section on the landing page
Right under the hero, the "Now Nix designs the visuals, too" section shows three empty dark boxes with alt text ("Nix-generated brand visual example 1/2/3"). The image tags exist but the files at
`brandgoblinai.com/airo-assets/images/pages/home/nix-visuals-example-1` (and -2, -3) do not load.
This is prime real estate showing broken images to every visitor. Fix in Airo: re-upload the three Studio example images to that section. Good news: two fresh on-brand images now exist in the app (see wins below), plus everything in the showcase.

### 3. Refill celebration does not appear
Visiting `/dashboard/creator-pro?refill=success` as a Pro user strips the URL param but never shows the celebration overlay (tested three times, including a 1-second-after-load screenshot). Someone who just paid for energy gets no payoff moment. Needs a code look at `RefillCelebration.tsx` mount conditions.

### 4. React hydration errors on the Creator Pro page
The browser console shows repeated React errors #425, #418, #423 (server HTML does not match the client) on `/dashboard/creator-pro`. Likely culprit: time-of-day content rendered on the server (the "Good evening" greeting or rotating Nix line). These errors force React to re-render the page client side and may be connected to finding 3.

## WORKING AND VERIFIED (big wins)

- **Hex-code bug fix CONFIRMED.** Generated a fresh Product Art for Juicy Hazy. Zero hex codes, zero gibberish, and the brand name "JUICY HAZY" rendered perfectly on the artwork (surfboard against a beach shack, on-palette).
- **Official Logo feature CONFIRMED end to end.** Clicked the gold star on a completed logo concept (button flipped to "Official logo"), regenerated product art, and the exact logo appeared as a clean white badge bottom right. The June 26 build works.
- **Refill modal CONFIRMED.** Defaults to the $49 Value pack with Save 14% / Save 26% tags and capacity lines. Matches the AOV-optimized spec.
- **Interactive teaser works.** Typed "a candle brand for book lovers", got "Bookwick / Illuminate your next great chapter" in seconds with the 1-of-12 upsell line.
- **Landing FAQ and pricing are Agency-free** (Block 7 done). Two-tier freemium copy is consistent.
- **Footer legal links are real pages now.** /privacy, /terms, /refund all return live content (Block 5 done). Paid traffic is no longer blocked on this.
- **Showcase iframe is embedded** on the landing page, placed before Pricing (Blocks 8 and the embed both done).

## SMALLER ITEMS (worth a pass, not urgent)

1. **Footer social icons are dead.** Three empty links with `href="#"` in the landing footer (the social icons). Point them at real profiles or remove them.
2. **Energy meter math looks wrong when over the monthly max.** Sidebar shows "100% remaining, 1,790 / 1,000". Reading "1,790 out of 1,000" looks like a bug to users. Suggest showing just the number, or making the denominator the true total.
3. **Pricing page copy says "Top up energy anytime for $19"** but the modal defaults to $49 with three pack sizes. Suggest "Top up energy anytime (packs from $19)".
4. **Duplicate Studio pitch on the landing page.** "Now Nix designs the visuals, too" appears twice (near the hero and again inside What You Get). Optional Block 9 merge still open.
5. **Some showcase art is black-on-black.** Dark logo art (Shroomadu, Spinaway) nearly disappears against the dark marquee. Consider featuring lighter pieces or giving cards a light backing.
6. **Landing hero takes a beat to animate in.** Scroll-reveal delays mean fast scrollers see empty black sections. Worth a look at animation timing in Airo if bounce looks high later.

## WHAT I SPENT
8 Creative Energy (two Standard product art generations at 4 each) on the live test, plus one official logo flag on a Juicy Hazy logo concept. The new product art pieces are in the Juicy Hazy gallery and are genuinely showcase-worthy.

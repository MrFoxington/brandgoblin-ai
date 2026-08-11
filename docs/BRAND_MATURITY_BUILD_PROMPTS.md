# BrandGoblin Brand Maturity: Build Prompts
### Copy-paste prompts for Claude Code (terminal) or Opus, phase by phase
*Companion to docs/BRAND_MATURITY_PLAN.md. Prepared August 9, 2026.*

---

## HOW TO USE THIS FILE (read this once)

1. Open Terminal, go to the project folder, and start Claude Code:
   ```
   cd "/Users/foxximuss/Desktop/Claude Files/brandgoblin-ai"
   claude
   ```
2. Copy ONE prompt at a time from this file (everything inside the big box) and paste it in.
3. Let it work, review what it shows you, and answer its questions if it has any.
4. When it finishes, it will commit. **You push** (same as always, PAT in the URL, then clear it).
5. Where a prompt says "MIGRATION," you run the SQL in the Supabase SQL editor BEFORE pushing. The prompt will print the SQL for you.
6. Do the prompts in order. Each one is safe on its own, so you can stop between any two.

Every prompt tells the builder to read the plan and handoff first, so you never have to explain context. Just paste and go.

---

# PHASE 1: THIS WEEK (copy and cuts)

## PROMPT 1: New hero + example chips + H1 fix

```
Read docs/BRAND_MATURITY_PLAN.md and CLAUDE_HANDOFF.md before touching anything. Follow all
project rules (never generate Nix art, always use next/image, commit but do NOT push).

TASK: Rewrite the marketing hero and example prompt chips on the app landing page
(src/app/page.tsx and its hero components: HeroInteractive.tsx, HeroTypewriter.tsx,
IdeaSparkSection.tsx. Locate the actual text by searching for the current copy).

1. HERO HEADLINE (this is the "wild card demonstration hero" from the plan, Part 3):
   H1: This brand didn't exist two minutes ago.
   Subhead: One sentence in, twelve deliverables out. Type your idea and watch Nix work.
   The hero must sit directly above or beside the live demo / typewriter element so the
   headline and the proof are seen together. Keep the existing interactive demo working.

2. SINGLE H1: The page currently renders two competing hero headlines ("Watch your idea
   become real. BrandGoblin AI brings it to life." and "Watch your idea become real.").
   After this change there must be exactly ONE h1 on the page. Verify by searching the
   rendered output for <h1.

3. SECONDARY HEADLINE: Where the 12-deliverables section begins, use this as its h2:
   Your whole brand. One prompt. About two minutes.

4. EXAMPLE PROMPT CHIPS: Replace the current idea chips with exactly these eight:
   - a calm, science-backed skincare brand
   - a finance newsletter for 20-somethings
   - a specialty coffee roaster
   - a productivity app for ADHD founders
   - a sustainable activewear label
   - a coworking space for freelancers
   - hot sauce for people who cry at movies
   - a pet brand with main character energy
   Remove: "a meme coin", "a dog food brand with a villain arc", "a wine brand for people
   who drink alone on purpose", "an app that texts you like a hype man", and any other
   edgelord-register chips. Chips have NO emoji prefixes.

5. Remove "conjure", "magic", "goblin magic" and the ✦ glyph from the hero and CTAs on
   this page. CTA text becomes: Start free. No card needed.
   (The ONE allowed magic moment in the whole product is the generation loading screen.
   Do not touch LoadingScreen.tsx.)

DONE CHECK: one h1, new hero live above the demo, eight chips exactly as listed, no
"conjure/magic" in src/app/page.tsx or hero components, build passes (npm run build).
Then: update CLAUDE_HANDOFF.md session log with what changed, commit with a clear message,
do not push.
```

## PROMPT 2: Kill "The Loop", cut emoji, dedupe sections, quiet Nix

```
Read docs/BRAND_MATURITY_PLAN.md and CLAUDE_HANDOFF.md first. Project rules apply
(no Nix generation, next/image only, commit but do NOT push).

TASK: Maturity pass on the marketing landing page (src/app/page.tsx and the section
components it imports, likely including XPSystem.tsx, ComparisonSection.tsx, Footer.tsx).
This touches MARKETING surfaces only. Do not change dashboard, Studio, or any in-app UI.

1. REPLACE the "Warning: Addictive" / "The Loop" section entirely with:
   Header: Built for momentum
   Body: Every generation ends with a next step, so your brand keeps moving: idea, name,
   logo, launch. Milestones mark real progress: first kit, first logo, first product.
   Earned by creating, never bought.
   DELETE these lines wherever they appear: "Warning: Addictive", "It's not our fault
   you'll keep coming back", "I designed the loop. You're welcome."

2. DEDUPE: The "Now Nix designs the visuals, too" block appears twice near-verbatim.
   Keep the better one, delete the other.

3. SECTION COUNT: Consolidate the landing page to at most 7 sections in this order:
   (1) hero with live demo, (2) DIY-vs-Nix comparison table, (3) real-output demo /
   showcase, (4) the 12 deliverables, (5) how it works in 3 steps, (6) pricing summary,
   (7) FAQ + final CTA. Merge or delete everything else. Do not delete the comparison
   table or the real-output demo. Those are the two most credible things on the page.

4. EMOJI PURGE (marketing pages only): Remove emoji used as section icons, list bullets,
   or decoration on src/app/page.tsx, pricing/page.tsx, and Footer.tsx. Replace section
   icons with nothing (whitespace and typography carry it) for now. Also remove the
   "Nix says hi 🧙" style footer line. Functional in-app emoji (energy bolt, streaks,
   badges) are OUT OF SCOPE. Leave them.

5. NIX SPEAKS TWICE, MAXIMUM: Across the whole marketing site Nix may have at most two
   first-person quoted lines. Keep exactly these two:
   - On the how-it-works section: "I take your idea as seriously as you do."
   - On the loading/generation screen (already exists, do not touch).
   Every other first-person Nix quote on marketing pages converts to brand voice
   (confident, second person, no mascot narration) or gets deleted. Nix IMAGES stay
   where they are.

6. Vertical spacing: roughly double the padding between the surviving sections.

DONE CHECK: max 7 sections, zero manipulation copy, at most one marketing-page Nix quote
plus the loading screen, decorative emoji gone from landing/pricing/footer, build passes.
Update CLAUDE_HANDOFF.md session log, commit, do not push.
```

## PROMPT 3: Measurement baseline (know if any of this works)

```
Read docs/BRAND_MATURITY_PLAN.md and CLAUDE_HANDOFF.md first. Commit but do NOT push.

TASK: Give us a simple signup scoreboard so every change in this redesign can be judged.

1. MIGRATION (print the SQL and tell Fox to run it in the Supabase SQL editor BEFORE
   the deploy): add a nullable text column hero_variant to the table where signups/
   profiles are recorded, or a small signup_events table if that is cleaner with RLS
   service-role only. Keep it minimal.

2. Set a first-touch cookie in middleware: when a visitor first lands on the marketing
   homepage, set bg_hero=<variant> (for now always "wildcard-v1", the coin flip comes
   in a later prompt) plus a bg_landed_at timestamp. On successful signup, record the
   cookie value onto the signup row/event.

3. Admin scoreboard: on the existing /admin page add a small "Funnel" card that shows,
   for the last 7 and 28 days: signups per day and signups by hero_variant. Visitors
   come from Vercel Analytics (tell Fox: Vercel dashboard -> project -> Analytics ->
   Enable, it is one click and the free tier is fine), so the card only needs signup
   counts, not traffic.

4. No user-facing changes. No extra dependencies.

DONE CHECK: cookie sets on first visit, a test signup records the variant, admin Funnel
card renders, migration SQL printed clearly for Fox. Update CLAUDE_HANDOFF.md, commit,
do not push. Remind Fox in your final message: run the migration first, then push, then
enable Vercel Analytics.
```

---

# PHASE 2: WEEKS 2 TO 4 (design system and money moves)

## PROMPT 4: The grown-up design system (fonts + palette)

```
Read docs/BRAND_MATURITY_PLAN.md (especially Part 2, Disagreement 1) and
CLAUDE_HANDOFF.md first. Commit but do NOT push.

TASK: Apply the new visual system to the MARKETING surfaces (landing, pricing, login,
signup, footer, navbar). The in-app dashboard/Studio can inherit later; do not restyle
them in this pass.

1. FONTS via next/font/google in src/app/layout.tsx:
   - Fraunces: headlines (h1/h2/h3 on marketing pages)
   - Hanken Grotesk: body and UI text
   - Geist Mono (or JetBrains Mono if Geist is unavailable on Google Fonts): hex codes
     and small technical labels only
   Wire them as CSS variables and Tailwind font families (display, sans, mono).

2. PALETTE as Tailwind tokens + CSS variables in globals.css / tailwind.config:
   - signature green #2E7D5B (primary buttons, links, accents)
   - emerald #10B981 (energy/live states only)
   - gold #FBBF24 (small highlights, badges, sparingly)
   - ink #141518 (text, dark surfaces)
   - warm off-white #FAF7F2 (page background on marketing pages)
   - nix purple #7C3AED: allowed ONLY in components where Nix himself appears
     (mascot containers, loading screen, Nix avatar/toast). Nowhere else on
     marketing surfaces.

3. KILL: all multi-stop gradients on marketing pages; the purple gradient theme;
   theme-color in metadata moves from #7c3aed to #2E7D5B. A single subtle warm tint
   gradient is allowed at most.

4. ONE CTA STYLE: primary button = signature green, one hover state, no sparkle
   decorations. Apply everywhere on marketing surfaces.

5. Do NOT touch: Nix image assets, badge/crest art, LoadingScreen.tsx, dashboard,
   Studio, or any generation UI.

DONE CHECK: marketing pages render Fraunces/Hanken on the warm off-white palette, no
purple outside Nix components, no gradients, build passes, screenshots of before/after
for Fox. Update CLAUDE_HANDOFF.md, commit, do not push.
```

## PROMPT 5: Proof above the fold + prompt-visible gallery

```
Read docs/BRAND_MATURITY_PLAN.md and CLAUDE_HANDOFF.md first. Commit but do NOT push.

TASK: Make the real product the star.

1. ABOVE THE FOLD: Ensure the first full viewport of the landing page shows the actual
   product: the live demo/typewriter AND a real generated kit (the Solace Skincare demo
   with its palette hex codes visible, in mono font). If the current hero already does
   this after Prompt 1, tighten it; if not, restructure so no visitor has to scroll to
   see real output.

2. GALLERY: Build a "Made with one sentence" section using 4 to 6 real kits from the
   existing showcase system (src/app/showcase, api/showcase). Each card shows THE PROMPT
   that created it as a quoted line above the kit preview. Reuse existing showcase data;
   do not fabricate kits or testimonials. If fewer than 4 strong kits exist, build the
   section to render gracefully with 3 and tell Fox which prompts to generate to fill it.

3. Hex codes anywhere on marketing pages render in the mono font.

DONE CHECK: real output visible with zero scroll at 1440px and on iPhone width, gallery
live with visible prompts, no fabricated content, build passes. Update CLAUDE_HANDOFF.md,
commit, do not push.
```

## PROMPT 6: The Goblin Studio tier ($49 anchor) + pricing page maturity

```
Read docs/BRAND_MATURITY_PLAN.md (Part 2, Disagreement 3) and CLAUDE_HANDOFF.md first,
especially the July 6 lesson where the $49 refill granted only 1,000 energy because the
Stripe price was missing metadata. Commit but do NOT push.

TASK: Add a real, buyable third tier and grow the pricing page up.

1. NEW TIER "Goblin Studio" at $49/month: 3,000 monthly Creative Energy, multiple
   brands, priority generation, PDF brand kit export (if export is not built yet, list
   only what is real today and tell Fox what was left out). Wire subscription logic
   parallel to Creator Pro in the Stripe checkout and webhook routes
   (api/stripe/checkout, api/stripe/webhook). The webhook MUST read the energy amount
   from Stripe price metadata, never from a hardcoded fallback.

2. FOX'S MANUAL STRIPE STEPS (print these clearly at the end):
   - Stripe dashboard -> Products -> add "Goblin Studio" $49/month recurring (live mode)
   - On the price, add metadata: energy_amount = 3000
   - Copy the price ID into Vercel env as STRIPE_PRICE_ID_STUDIO, redeploy
   - After deploy, make one real live purchase and confirm 3,000 energy lands, then
     cancel/refund from the Stripe dashboard.

3. PRICING PAGE (pricing/page.tsx, PricingCard.tsx):
   - Order tiers most expensive first: Studio $49, Creator Pro $19 (keep the
     "Most Popular" flag on Pro), Free $0.
   - Page header: Simple pricing. Serious value.  (replaces "goblin-fair pricing")
   - Add the possession promise, visibly, near the tiers:
     "Anything you finish is yours. Every plan, forever."
   - Remove Nix imagery, first-person Nix lines, and sparkle decorations from this
     page. Money surfaces stay calm.
   - Keep the "top up from $19" copy consistent with the refill modal defaults.

4. Energy still gates CREATION only. Nothing in this change may gate downloading or
   keeping finished work. If you find any existing gate on possession, flag it to Fox
   as a bug.

DONE CHECK: three tiers render most-expensive-first, checkout for Studio creates a live
Stripe session in test, webhook grants energy from metadata, promise line visible,
pricing page Nix-free, build passes. Update CLAUDE_HANDOFF.md, commit, do not push,
print Fox's manual Stripe steps.
```

## PROMPT 7: One website (move marketing to the root domain, retire Airo)

```
Read docs/BRAND_MATURITY_PLAN.md (Part 2, Disagreement 2) and CLAUDE_HANDOFF.md first.
Commit but do NOT push.

TASK: Make the Next.js app the one and only site for brandgoblinai.com.

1. Confirm the app's marketing homepage (src/app/page.tsx) fully covers what the Airo
   landing page did: hero, comparison, showcase, deliverables, how it works, pricing
   summary, FAQ, legal links (/privacy /terms /refund), and that logged-out visitors
   get marketing nav while logged-in users get app nav (Navbar.tsx already does this,
   verify).

2. SEO: set metadataBase and canonical URLs to https://brandgoblinai.com. Title:
   "BrandGoblin AI | Launch Your Brand In Minutes". Keep existing meta descriptions.
   Add a redirect so app.brandgoblinai.com/ (marketing paths only) 308-redirects to
   brandgoblinai.com/ while /dashboard, /studio, /login, /signup, /api and all app
   routes keep working on the app subdomain exactly as today. Be careful: cookies and
   auth must be unaffected. If splitting marketing/app across the two hostnames gets
   risky, the safe fallback is: serve BOTH domains from Vercel with the root domain
   primary and the subdomain redirecting only the homepage. Choose the safest option
   and explain it to Fox in plain words.

3. FOX'S MANUAL STEPS (print clearly at the end, assume GoDaddy DNS):
   - Vercel dashboard -> the project -> Settings -> Domains -> Add "brandgoblinai.com"
     and "www.brandgoblinai.com". Vercel will show the exact records to set.
   - GoDaddy -> your domain -> DNS: change the A record for @ to Vercel's IP
     (76.76.21.21 unless Vercel shows different) and the CNAME for www to
     cname.vercel-dns.com. Remove/disable the records pointing at GoDaddy's
     website builder.
   - Wait for Vercel to show green checkmarks on both domains (can take an hour).
   - Then cancel the GoDaddy Airo/Websites subscription so it stops billing.
     Do this LAST, only after the new site is confirmed live on the root domain.

4. Blog: if the Airo blog posts are not in the app, note their titles for Fox so we can
   rebuild them in the app later. Do not lose the SEO foundation silently.

DONE CHECK: root domain serves the app's marketing page, app subdomain still runs the
app, auth works, canonical tags point at the root, Fox's DNS steps printed. Update
CLAUDE_HANDOFF.md, commit, do not push.
```

## PROMPT 8: The real A/B hero test (run only when traffic justifies it)

```
Read docs/BRAND_MATURITY_PLAN.md and CLAUDE_HANDOFF.md first. Only build this when Fox
says traffic is steady (rough bar: a few hundred marketing visitors a week). Commit but
do NOT push.

TASK: Coin-flip hero test on the marketing homepage.

1. In middleware, if the visitor has no bg_hero cookie, assign 50/50:
   - "wildcard-v1": H1 "This brand didn't exist two minutes ago." with its subhead
   - "prompt-v1": H1 "Your whole brand. One prompt. About two minutes." with subhead
     "Name, logo, colors, voice, website copy, launch plan. Generated together, so
     everything actually matches. Meet Nix, your brand goblin."
   Cookie persists 90 days so each visitor always sees the same hero.

2. The hero component renders from the cookie server-side (no flash of the wrong hero).

3. Signups already record hero_variant (Prompt 3). Extend the admin Funnel card with a
   per-variant signup count and a simple conversion note. Add a plain-language line:
   "Fewer than 100 signups per variant means the numbers are still guessing."

DONE CHECK: two variants render 50/50 across fresh incognito visits, variant sticky per
visitor, admin card splits by variant, build passes. Update CLAUDE_HANDOFF.md, commit,
do not push.
```

---

# PHASE 3: ONGOING (compounding credibility)

## PROMPT 9: The Nix Usage Guide

```
Read docs/BRAND_MATURITY_PLAN.md (Part 4, Step 12) and CLAUDE_HANDOFF.md first.

TASK: Write docs/NIX_USAGE_GUIDE.md, one page, plain language. Contents:
- Where Nix appears: hero (once), empty states, loading/generation states, success and
  celebration moments, 404 pages, onboarding, social media, merch.
- Where Nix does not appear: pricing, checkout and payment flows, security/data/privacy
  and legal copy, error messages about money, the core generation workspace UI,
  agency/enterprise pages.
- Voice rule: Nix shows emotion through pose and context. He speaks rarely; at most two
  quoted lines across the marketing site plus the loading screen. He never explains,
  interrupts, or sells (the GitHub/Clippy rule).
- Art rule: restate rule #1: no generated Nix art ever; all poses come from approved
  PNGs; quality check green skin, purple hair, pointed ears, purple NIX hoodie with
  gold trim. Purple #7C3AED is Nix's color and travels with him; it is not a site color.
- A short DO/DON'T list with one example each.
Then add a pointer to this guide in CLAUDE_HANDOFF.md's key rules. Commit, do not push.
```

## PROMPT 10: Honest traction counter (when the number is respectable)

```
Read docs/BRAND_MATURITY_PLAN.md and CLAUDE_HANDOFF.md first. Commit but do NOT push.

TASK: A live "brands generated" counter for the marketing homepage. Count real completed
brand kits from the database (cheap cached query, revalidate hourly). Render as plain
confident text in the proof section: "<N> brands generated". Build it behind a simple
flag (env var or constant) so Fox decides when the number goes public. No fake floors,
no inflation, no animation. DONE CHECK: accurate count verified against the database,
flag off by default. Update CLAUDE_HANDOFF.md, commit, do not push.
```

**Steps 13, 14, 15 from the plan (founding creators, Fox's channel, Product Hunt) are your jobs, not build prompts. The DM template is in the plan, Part 4, Step 13.**

---

# THE AIRO / GODADDY PIECE (brandgoblinai.com)

You have two options here. My recommendation: do Option A this week so the two sites stop contradicting each other, then Option B (which is Prompt 7) in Phase 2 and Airo dies. If you'd rather skip straight to the redirect and not touch Airo at all, that also works: do the "quick redirect now" version at the bottom.

## OPTION A: Interim tie-in (paste this into Airo's AI editor)

Airo works best with block-by-block instructions. Paste this as your request; if Airo only takes one change at a time, feed it section by section in order.

```
Update my landing page with the following changes. Keep the overall layout unless told
otherwise. Do not add new sections.

1. HERO: Replace the headline with: Your whole brand. One prompt. About two minutes.
   Replace the subheadline with: Name, logo, colors, voice, website copy, launch plan.
   Generated together, so everything actually matches. Meet Nix, your brand goblin.
   Button text: Start free. No card needed.
   Button link: https://app.brandgoblinai.com/signup

2. Remove all emoji used as icons or bullets throughout the page.

3. In the example ideas list, delete "a meme coin", "a dog food brand with a villain
   arc", "a wine brand for people who drink alone on purpose", and "an app that texts
   you like a hype man". Add instead: "a calm, science-backed skincare brand",
   "a finance newsletter for 20-somethings", "a specialty coffee roaster",
   "a productivity app for ADHD founders".

4. Delete the section titled "Warning: Addictive" (also known as "The Loop") entirely,
   including the lines "It's not our fault you'll keep coming back" and "I designed the
   loop. You're welcome."

5. If the page contains two sections about "Now Nix designs the visuals, too", delete
   one of them.

6. Replace the words "conjure" and "magic" anywhere on the page with plain language:
   "generate" or "build".

7. Remove the footer line "Nix says hi" and any sparkle symbols (✦) on buttons.

8. Every button on the page must link to https://app.brandgoblinai.com/signup except
   "Sign In", which links to https://app.brandgoblinai.com/login

9. Make sure there is only one main headline (H1) on the page.
```

That's it for Airo. Do not try to do the font/color redesign in Airo; it isn't worth polishing a page that Phase 2 deletes. This paste-in just stops the bleeding: same hero family as the app, no meme register, no manipulation section, all roads lead to signup.

## OPTION B: The real fix (this is Prompt 7 above)

Marketing moves into the app, GoDaddy DNS points brandgoblinai.com at Vercel, Airo gets cancelled. Prompt 7 prints your exact click-by-click steps.

## QUICK REDIRECT NOW (only if you want the Airo page gone TODAY)

If you'd rather not update Airo at all, you can forward the domain immediately:

1. Log in to GoDaddy, open your domain brandgoblinai.com.
2. Find "Forwarding" (under Domain Settings or DNS).
3. Forward brandgoblinai.com to https://app.brandgoblinai.com with type "Permanent (301)", forwarding only (not masking).
4. Save. The Airo page stops being reachable on the main domain.

Trade-off, so you decide with open eyes: this makes the main domain a bounce-pass to the app instead of a page of its own, and permanent forwards pass less SEO weight than the Prompt 7 setup. It is fine as a stopgap, but Prompt 7 is the destination either way.

---

## SUGGESTED ORDER, ALL TOGETHER

1. This week: Prompt 1, Prompt 2, Prompt 3, plus the Airo Option A paste-in.
2. Weeks 2 to 4: Prompt 4, Prompt 5, Prompt 6, Prompt 7 (Airo dies here).
3. After that, ongoing: Prompt 9, Prompt 10, and your own Steps 13 to 15 from the plan.
4. Prompt 8 (the coin-flip A/B test) waits until traffic makes it worth running.

One last reminder in every builder's ear: push discipline stays the same. The terminal Claude commits, you push, and if a "fixed" bug ever reappears, check for unpushed commits before panicking.

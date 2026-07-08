# Airo Landing (brandgoblinai.com) — V5 Paste-Ins (the final open items)

**Read me first, Fox:** Airo ignores multi-part prompts. Feed it ONE block at a time, in order.
After each one, hard-reload the live site to confirm it published before moving to the next.
These blocks assume V2, V3, and V4 already landed (freemium pricing + orange hero CTA + Studio woven in).
There are no em dashes and no fake stats in any of this copy on purpose.

**The 5 open items, in order:**
1. Make the top-nav button orange (match the hero)
2. Add a Goblin Studio "real images" beat right after the hero
3. Drop in 2 or 3 real Studio example images
4. Embed the live Showcase wall
5. Fix the dead footer links (Privacy, Terms, Refund, Company)

Plus a quick consistency sweep at the bottom to make sure no old "7-day trial" wording survived.

---

## ✅ STATUS — audited live June 26, 2026
- **Block 1 (orange nav): DONE.**
- **Block 2 (Studio "real images" beat): DONE** — both the "Don't just plan your brand, make it"
  section and the "Now Nix designs the visuals, too" beat are live.
- **Block 3 (real example images): NOT done** — Studio section has emoji bullets but no real pictures.
- **Block 4 (showcase wall): DONE** — confirmed rendering live June 26 (Fox saw the wall himself).
- **Block 5 (footer links): NOT done** — Privacy, Terms, Cookie, Refund, and the whole Company column
  still point to "#".
- **Block 6 (kill trial wording): DONE.**
- **Block 7 (NEW — fix stale FAQ): NOT done** — FAQ still names the killed "Agency" tier and says free
  outputs are "personal and testing use only." See Block 7 below.

**Blocks left to do:**
- 3 — add 3 real Studio images (in progress: Fox generating brands in his Pro account)
- 5 — fix dead footer links (MUST do before traffic)
- 7 — fix stale FAQ (kill Agency mentions)
- 8 — move showcase wall down to before Pricing (drag is easiest)
- 10 — color discipline: orange = buttons, Goblin Studio accents = gold ("Make it." + "GOBLIN STUDIO" badge)
- 11 — small: "Sign In" nav link should go to /login, not /signup
- 9 — optional later: merge the two duplicate value sections

---

## BLOCK 1 — Make the top-nav button orange

> On my BrandGoblin AI site, change the button in the top navigation bar (the "Start Creating Free"
> button) to the same vibrant orange as my hero button, hex around #FF6B35. Keep the text the same.
> It should be the boldest element in the nav so a visitor's eye lands on it first. It still links to
> https://app.brandgoblinai.com/signup. Do not change anything else.

---

## BLOCK 2 — Add the Goblin Studio "real images" beat (right after the hero)

> Right after my hero section, add one short visual section. Do not make it a separate product page or
> a grid of products, just one clean band that fits the existing style.
>
> Headline: "Now Nix designs the visuals, too."
> Body: "Beyond the words, Nix generates real, on-brand logos, social graphics, and product art right
> inside the app. Your colors, your vibe, turned into actual images. No designer, no other tools, no
> leaving BrandGoblin."
> Button: "✦ Start Creating — Free" in the same orange (#FF6B35), linking to
> https://app.brandgoblinai.com/signup.
>
> Leave a space in this section for 2 or 3 example images, which I will add next. Keep it mobile-first
> and fast.

---

## BLOCK 3 — Add real Studio example images

You need to drop in actual images here. Two ways to get them, pick whichever is easier:
- Open the app, go to Goblin Studio, generate 2 or 3 of your best on-brand pieces (a logo, a social
  graphic, a product shot), and download them.
- Or pull your favorites from the Studio gallery you already made.

Quality gate before you use any image: it has to look genuinely good, because this is the proof.
Then in Airo:

> In the "Now Nix designs the visuals, too" section, add a row of 3 image slots next to or below the
> text. I am uploading the images myself. Display them as clean rounded cards with a soft shadow, evenly
> sized, side by side on desktop and stacked on mobile. No captions needed.

(Then use Airo's image upload on each slot to add your 3 real pieces.)

---

## BLOCK 4 — Embed the live Showcase wall

Airo needs a custom HTML or "embed code" block for this. Add one where you want the wall to appear
(a good spot is just below the Studio section or near the bottom before the final CTA), then paste:

```html
<iframe
  src="https://app.brandgoblinai.com/embed/showcase"
  style="width:100%;border:0;height:420px;"
  loading="lazy"
  title="Real brands made by Nix">
</iframe>
```

If it looks too tall or too short on your phone, change `height:420px` to a bigger or smaller number
and republish. Above the iframe, add a small heading: "Real brands, really made by Nix."

You curate what shows here from the app at /admin under "⭐ Showcase Curation." It can take up to about
2 minutes for changes to appear publicly because of caching.

---

## BLOCK 5 — Fix the dead footer links

Right now Privacy, Terms, Refund, and the Company links go nowhere. For a site that charges money,
those need to be real, both for trust and because Stripe expects them. Have Airo generate basic pages,
then you can refine the wording later.

> Create three real pages on my site and link them from the footer where the dead links currently are:
>
> 1. Privacy Policy — a standard privacy policy for a SaaS web app that collects an email and name for
>    accounts, uses Stripe for payments, and uses cookies for login. State that we do not sell personal
>    data. Include a contact line: support@brandgoblinai.com.
> 2. Terms of Service — standard terms for a subscription software product. Cover account use,
>    acceptable use, that Creator Pro is a $19/month subscription you can cancel anytime, and that the
>    service is provided as is.
> 3. Refund Policy — explain that subscriptions can be cancelled anytime and remaining access runs to
>    the end of the billing period, and how to request help at support@brandgoblinai.com.
>
> Link all three from the footer, replacing the current dead links. For any other dead footer links
> under "Company" (like About or Contact), either point Contact to mailto:support@brandgoblinai.com or
> remove the ones we do not have pages for. Keep the footer trust line "No card required · Cancel
> anytime · Powered by Nix."

Note: these auto-generated pages are a starting point, not legal advice. Skim them once they exist and
fix anything that does not match how the product actually works.

---

## BLOCK 6 — Consistency sweep (kill any leftover trial wording)

> Search my whole site for any remaining mention of a "7-day trial," "7 days of everything," "7 days
> free," or "what happens after the free trial," including small text under buttons. Replace all of it
> with the free-tier framing: "Start free, no credit card. Upgrade to Creator Pro when you're ready to
> grow." Do not promise "unlimited images" anywhere, because Studio images run on Creative Energy.

---

## BLOCK 7 — Fix the stale FAQ (kill leftover "Agency" mentions)

The FAQ still references the Agency tier you removed, and tells free users their outputs are "personal
and testing use only," which works against the free-tier pitch.

> In my FAQ, update two answers. For "Can I use the generated brands commercially?" replace the answer
> with: "Yes. Everything you generate is yours to use commercially. Creator Pro includes full commercial
> licensing for all generated content." For "Do I own the outputs?" replace the answer with:
> "Absolutely. The brand names, copy, concepts, and all other outputs belong to you. We don't claim any
> ownership over what you generate." Remove every mention of an "Agency" plan anywhere on the site,
> since that plan no longer exists.

---

## BLOCK 8 — Reorder: move the Showcase wall down to peak-intent (before Pricing)

**Why:** the Studio "make it" visuals section and the "Real brands made by Nix" showcase wall are
currently back to back, both orange. That desensitizes the orange CTA and spends both proof beats at
once. Social proof also converts best late, near the decision, not near the top. Fix = move the
showcase wall down so it sits just before Pricing.

**Easiest way (do this first):** in Airo, just grab the "Real brands, really made by Nix" showcase
section and drag it down so it sits right after the "Two Ways to Build a Brand" comparison and right
before the Pricing section. No prompt needed. Republish and hard-reload.

**If dragging isn't available, paste this:**

> Move my "Real brands, really made by Nix" showcase section. Right now it sits near the top just after
> the Goblin Studio visuals section. Move it down so it appears right after the "Two Ways to Build a
> Brand" comparison section and right before the Pricing section. Do not change its content or its
> orange CTA, just change where it sits in the page order. Leave the Goblin Studio visuals section where
> it is near the top.

**Target order after this move:** Hero → Idea sparks → Goblin Studio visuals (+ 3 images) → How it
works → Value/What you get → Two Ways to Build → **Showcase wall** → Warning: Addictive → Creator Pro →
Pricing → FAQ → Final CTA.

---

## BLOCK 9 (optional, do later) — Merge the two duplicate value sections

The page has two near-identical sections: "What Nix conjures for you" (8 cards) and "One tool. Complete
brand." (9 tools). They say the same thing twice and slow momentum.

> I have two sections that list what the product does and they overlap heavily: "What Nix conjures for
> you" and "One tool. Complete brand." Merge them into a single value section with one clean grid of the
> best items, no duplicates. Keep the strongest headline of the two and delete the other section.

---

## BLOCK 10 — Color discipline: orange = buttons, gold = Goblin Studio

**Why:** orange only pulls clicks because the brain learns "orange = click." Using orange for headline
words and badges that aren't buttons (e.g. the "Make it." highlight + the "GOBLIN STUDIO" badge)
desensitizes the eye and weakens your real CTA buttons. Verified live June 26: 3 orange elements in one
viewport, only 1 is a button. **Decision (Fox, June 26): Goblin Studio accents = premium GOLD (Nix's
trim color), CTA buttons stay orange.**

> Across my whole site, reserve the orange color (around #FF6B35) for clickable action buttons only. In
> the "Don't just plan your brand. Make it." Goblin Studio section, recolor the orange accents to a
> premium gold (around #D4AF37) instead: change the highlighted word "Make it." to gold, and change the
> "GOBLIN STUDIO" badge above it to gold. Keep all action buttons orange. The goal is that gold signals
> the premium Goblin Studio, and orange always and only means "this is a button to click."

---

## BLOCK 11 (small fix) — "Sign In" points to the wrong page

The nav "Sign In" link goes to the signup page. A returning user clicking "Sign In" should land on login.

> Change my nav "Sign In" link so it goes to the login page (https://app.brandgoblinai.com/login)
> instead of the signup page. Leave the orange "Start Creating Free" button pointing to
> https://app.brandgoblinai.com/signup.

---

## After all blocks — quick check
- [ ] Nav button is orange and matches the hero
- [ ] "Now Nix designs the visuals, too" section is live with 2 to 3 real images
- [ ] Showcase wall iframe loads and shows real creations
- [ ] Privacy, Terms, and Refund pages exist and are linked from the footer
- [ ] No "7-day trial" wording anywhere, no fake stats, no "unlimited images"
- [ ] Every primary CTA still goes to https://app.brandgoblinai.com/signup

*Created June 26, 2026. Supersedes the open paste-in items in V3. Pricing/freemium copy is governed by V4.*

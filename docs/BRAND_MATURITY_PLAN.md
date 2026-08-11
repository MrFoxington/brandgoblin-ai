# BrandGoblin Brand Maturity Plan
### Aging the brand up to 18-35 buyers without killing Nix
*Prepared by Kenji, August 9, 2026. Based on the full audit document, the CLAUDE_HANDOFF, the Nix Manifesto, and your saved decisions.*

---

## PART 1: MY VERDICT ON THE AUDIT

Short version: this is a good audit. About 85% of it is right and worth doing. The core diagnosis is correct and matches what the masters teach:

**The problem is not Nix. The problem is that everything around Nix is loud too.** Premium brands earn one weird, lovable thing by making everything else calm. Right now the site has twelve weird things fighting for attention, so Nix reads as noise instead of charm.

The audit's strongest calls, which I fully agree with:

1. Cut the emoji clutter on marketing pages by about 80%.
2. Swap the meme example prompts ("meme coin", "villain arc") for credible ones. Hopkins rule: a specific, believable claim sells. "Meme coin" tells a founder with a real budget that this is a toy.
3. Rewrite "Warning: Addictive" and "The Loop". Bragging about manipulating users is the opposite of your own CapCut lesson. More on this below.
4. Stop letting Nix narrate the whole page. GitHub learned this from Clippy: the mascot should appear and emote, not talk constantly. Nix keeps one or two great spoken moments, that's it.
5. Put a real product screenshot above the fold. Showing the actual product is proof, and proof beats claims every time.
6. Whitespace, fewer sections, one CTA style. Cheapest premium signals that exist.
7. The pricing anchor logic (a third tier makes $19 look like the smart choice).
8. The social proof and founder-led channel strategy. This matches your "Fox is the brand" decision exactly.

Now here is where I disagree, or where I have a better idea. You asked me to tell you, so here it is straight.

---

## PART 2: WHERE I DISAGREE WITH THE AUDIT (5 things)

### Disagreement 1: Do NOT abandon purple entirely. Demote it instead.

The audit says "avoid purple entirely." That is an outsider's recommendation from someone who read your website but not your closet. Purple is Nix's hoodie. Purple is in your official imported brand kit (#7C3AED alongside emerald #10B981 and gold #FBBF24). Purple is baked into your badges, your crests, your Labs glow, your mascot's actual clothing. Killing purple means either repainting Nix or having a mascot dressed in a color the brand disowned. Both are bad.

**The better move: purple becomes Nix's color, not the brand's wallpaper.**

- The site's base becomes warm off-white (#FAF7F2), near-black ink (#141518), and a grown-up goblin green as the signature color.
- Gold (#FBBF24) stays as the small accent. You already own it.
- Purple appears exactly where Nix appears: his hoodie, his moments, his loading screens. When Nix walks into frame, he brings his color with him. When he leaves, the page goes calm again.
- The purple GRADIENT wallpaper look dies completely. That is the actual "AI slop" signal the audit is right about. Purple as a character color is not the problem. Purple as the default theme of every AI startup in 2026 is.

This is cheaper (no asset repainting), smarter (Nix stays visually consistent), and more distinctive (a green and gold brand with a purple-hooded goblin is ownable; another purple AI site is not).

**Suggested palette:**

| Role | Color | Notes |
|---|---|---|
| Signature | Goblin Green #2E7D5B | Deep, confident, literally on-theme for a goblin brand |
| Energy accent | Emerald #10B981 | Already yours. Use for energy meters, live states, glow |
| Gold accent | #FBBF24 | Already yours. Badges, "Nix Pick" moments, sparingly |
| Ink | #141518 | Text and dark surfaces. Not pure black |
| Background | #FAF7F2 | Warm off-white. Instant maturity upgrade |
| Nix's purple | #7C3AED | ONLY where Nix appears. His color, not the site's |

### Disagreement 2: The "two sites" fix is bigger than the audit realizes.

The audit says "pick one canonical marketing site" like it's a copy edit. Reality: brandgoblinai.com is a GoDaddy Airo page, and app.brandgoblinai.com is your real Next.js app. They are two different systems, and every change to the Airo page happens through manual paste-ins. That is why the copy drifted apart in the first place, and it will keep drifting forever as long as both exist.

**The better move: make the Next.js app the only site.** Build the marketing homepage inside the app project (most of it already exists there), point the root domain brandgoblinai.com at Vercel, and retire Airo. One codebase, one voice, one set of edits, and the whole redesign in this plan only has to be built once instead of twice. This is the "systems over services" rule from your own manifesto: stop maintaining two of the same thing.

This is a Phase 2 job, not a this-week job. Until then, freeze the Airo page (no new copy) so the gap stops growing.

### Disagreement 3: The third pricing tier is right, but the audit doesn't know your history.

You already had an "Agency Edition" tier and you deliberately killed it because it was a waitlist promise, not a product. Do not bring back a fake tier for anchoring. A fake anchor is a lie, and the honesty doctrine says every claim must be real.

**The better move: build "Goblin Studio" at $49/month out of parts you already sell.** Your $49 energy pack (3,000 energy) already exists and already works in Stripe. A $49/month tier is roughly: 3,000 monthly energy, multiple brands, priority generation, PDF brand kit export. Real on day one, no vaporware, and it makes $19 read as the obvious smart choice. List tiers most expensive first so $49 anchors.

One hard rule from your own playbook: **the tier gates creation volume, never possession.** Anything a user finished, they can download and keep, on any plan. No CapCut ambushes, ever. That rule should be printed on the pricing page as a promise, because it is a trust weapon almost nobody else has: *"Anything you finish is yours. Every plan, forever."*

### Disagreement 4: Keep more of the "Soon" ecosystem visible than the audit wants, but only what's real.

The audit says hide most of the five "Soon" products. Half right. Goblin Labs is already built and admin-gated, and Studio is live. Show Studio and Labs as real things. Collapse Sites, Growth, Motion, and Bazaar into a single quiet line ("More goblins in training") or remove them. Five permanent "Soon" badges read as vaporware. Two real products plus one wink reads as momentum.

### Disagreement 5: The emoji purge applies to marketing pages, not the app.

Inside the app, some emoji are functional controls users have already learned (the energy bolt, the fire streak, badge art fallbacks). Ripping those out mid-flight breaks learned patterns for zero gain. The 80% purge targets the marketing homepage, pricing page, and about page, where emoji are being used as decoration and section icons. In-app emoji get reviewed later, case by case, only where they read as clutter rather than as controls.

---

## PART 3: THE HERO (Kenji's ranked picks)

The audit offers seven hero options and recommends #1 or #6. Good instincts. Here is my ranking with the reasoning, per my rule that every line must be justified against the masters.

**Pick 1 (my recommendation): "Your whole brand. One prompt. About two minutes."**
Sub: *Name, logo, colors, voice, website copy, launch plan. Generated together, so everything actually matches. Meet Nix, your brand goblin.*
Why it wins: Hopkins. Three specifics in nine words, no adjectives to kill. "About two minutes" is more believable than "2 minutes" because it sounds measured, not marketed. The sub sells the real mechanism (generated together = everything matches), which is your true differentiator against ChatGPT-plus-Canva duct tape.

**Pick 2: "One prompt in. A complete brand out."**
Why it's close: tight, rhythmic, confident. Slightly weaker than Pick 1 because it drops the time claim, and the time claim is your most unbelievable-but-true fact. Schwartz: lead with the claim the market hasn't heard yet.

**Pick 3: "Launch-ready branding, without the agency invoice."**
Why it places: names the villain (agency cost), which the comparison table already proves with numbers. Strong for an A/B test. Weaker as the lead because it defines you by what you're not.

**Kenji's wild card: put the demo IN the hero.**
Headline over the actual Solace Skincare kit, rendered live:
**"This brand didn't exist two minutes ago."**
Sub: *One sentence in, twelve deliverables out. Type your idea and watch Nix work.*
Why it might beat everything: Hopkins said demonstration beats description, and this IS the demonstration. It's an A-pile line: it creates a curiosity gap that only scrolling resolves, and the proof is sitting right under the words. Risk: needs the visual to load fast and look great. If you A/B test anything, test this against Pick 1.

Retire from the hero: "conjure", "magic", "goblin magic". Keep exactly one magic moment in the whole product: the generation loading screen. "Nix is conjuring your brand..." while the user waits is the one place where magic language is doing honest work, because something magical is literally happening.

---

## PART 4: THE STEP-BY-STEP PLAN

Each step says what to do, where it happens, and how you'll know it's done. "Claude session" means you open Cowork and say "do step X from the Brand Maturity Plan."

### PHASE 1: THIS WEEK (copy and cuts, no redesign yet)

**Step 1. Freeze the Airo page.**
Do: nothing. Just stop making copy changes on brandgoblinai.com until Phase 2 kills it.
Done when: you've agreed to it. (This one's free.)

**Step 2. Swap the example prompt chips.** (Claude session, app landing)
Out: "a meme coin", "a dog food brand with a villain arc", "a wine brand for people who drink alone on purpose", "an app that texts you like a hype man".
In: "a calm, science-backed skincare brand" · "a finance newsletter for 20-somethings" · "a specialty coffee roaster" · "a productivity app for ADHD founders" · "a sustainable activewear label" · "a coworking space for freelancers".
Keep two witty ones for soul: "hot sauce for people who cry at movies" and one more of your choice. Wit stays, edgelord goes.
Done when: chips are live and no chip would embarrass a 28-year-old founder showing a cofounder.

**Step 3. Rewrite the hero.** (Claude session, app landing)
Use Pick 1 from Part 3. Fix the duplicate H1 while in there (one H1 per page).
Done when: one H1, new hero live.

**Step 4. Replace "The Loop" section.** (Claude session, app landing)
New header: **"Built for momentum"**
New body: *Every generation ends with a next step, so your brand keeps moving from idea to name to logo to launch. Milestones mark real progress: first kit, first logo, first product. Earned by creating, never bought.*
Delete: "Warning: Addictive", "It's not our fault you'll keep coming back", "I designed the loop. You're welcome."
Why: this is your own Trophy Shelf philosophy ("honest dopamine, earned by creating") said out loud, instead of a manipulation brag that contradicts it.
Done when: no manipulation language anywhere on the page.

**Step 5. Cut marketing-page emoji by ~80% and dedupe sections.** (Claude session, app landing)
Remove emoji used as section icons and bullets. Delete the duplicate "Now Nix designs the visuals, too" block. Target six or seven sections total: hero, comparison table, real-output demo, 12 deliverables, how it works, pricing, FAQ plus final CTA.
Done when: section count is 7 or fewer and remaining emoji are deliberate, not structural.

**Step 6. Reduce Nix's speaking roles.** (Claude session, app landing)
Nix keeps two lines on the whole marketing site, maximum. Everything else converts to brand voice (confident peer, second person). Nix still appears visually wherever he already does.
Suggested keeper line, on the how-it-works section: *"I take your idea as seriously as you do."* (Softened from the smug version. Charm without the flex.)
Done when: exactly one or two Nix quotes remain on the page.

### PHASE 2: WEEKS 2 TO 4 (the redesign and the money moves)

**Step 7. Adopt the type and color system.** (Claude session, app-wide marketing surfaces)
Fonts: **Fraunces** for headlines, **Hanken Grotesk** for body, **Geist Mono** for hex codes and technical labels. A nice detail: your own "Hot Right Now" AI font shelf picked Fraunces, Bricolage Grotesque, and Hanken Grotesk in July. Your product already has taste. Let the product's taste dress the brand.
Colors: the palette table from Disagreement 1. Purple gradient dies; purple survives only on Nix.
Spacing: roughly double the vertical space between sections. One CTA style, goblin green, everywhere.
Done when: no multi-stop gradients anywhere, theme-color is off #7c3aed, headlines are Fraunces.

**Step 8. Real product screenshot above the fold.** (Claude session)
Put the actual generation interface or the Solace Skincare kit right under the hero. If testing the wild card hero, this IS the hero.
Done when: a visitor sees the real product without scrolling.

**Step 9. Ship the Goblin Studio tier.** (Claude session for build, you for Stripe checks)
$49/month as described in Disagreement 3. Order tiers most expensive first. Add the possession promise line to the pricing page: *"Anything you finish is yours. Every plan, forever."* Mute Nix and sparkles on this page; money surfaces stay calm (the GitHub rule).
Also rename "goblin-fair pricing" to plain confidence: **"Simple pricing. Serious value."**
Done when: a real buyable $49 tier is live and the webhook grants the right energy (test with a live purchase, you know why).

**Step 10. One site to rule them all.** (Claude session for build, you for the domain click)
Build the marketing homepage as the app's root, point brandgoblinai.com at Vercel (I'll give you exact GoDaddy DNS steps when we do it, it's about three fields), retire Airo. All blog posts move over or get redirected.
Done when: brandgoblinai.com and the app are one codebase and the Airo page is gone.

**Step 11. Expand the demo into a mini gallery.** (Claude session)
Four to six real generated kits, each shown WITH the prompt that made it. Prompt visible above kit. This is the "show the mechanism" proof Hopkins demands, and it doubles as your testimonial section until real quotes exist.
Done when: gallery live with prompts visible.

### PHASE 3: ONGOING (compounding credibility)

**Step 12. Write the Nix Usage Guide.** (Claude session, one page in docs/)
Where Nix appears: hero (once), empty states, loading and generation states, success moments, 404s, onboarding, social, merch.
Where Nix does not: pricing, checkout, security and legal copy, error messages about money, the core workspace UI.
Nix speaks rarely; he shows emotion through pose and context. This extends your existing rule #1 (never generate fake Nix art) into a full governance doc.
Done when: the guide is in docs/ and the handoff references it.

**Step 13. Recruit 5 to 10 founding creators.** (You, with a template below)
Find founders visibly launching things (Indie Hackers, r/SideProject, X). Offer a free Pro month for feedback and a named quote. Specific quotes with first name, role, and the brand they built.
DM template, Halbert style, one person to one person:
*"Hey [name], saw you're launching [their thing]. I built a tool that turns one sentence into a full brand kit (name, logo, palette, copy) in about two minutes, and I'm picking 10 founders to use it free while it's early. If it saves you real time, all I'd ask is one honest sentence about it. Want a link?"*
Why this works: it opens with THEM, the offer is free and specific, the ask is tiny and honest, and it never begs.
Done when: 5+ named quotes with real brands on the site.

**Step 14. Fox goes loud, Nix goes social.** (You, ongoing)
Per your standing decision: channels are Fox-named, Nix is the co-star. Fox builds in public on X (the redesign itself is content: post the before and after of every step in this plan). Nix stars in short-form video where being loud is the correct register. The discipline rules apply to the website, not to Nix's TikTok personality.
Done when: it's a habit, not a task.

**Step 15. Product Hunt, AFTER the redesign.** (You plus a Claude prep session)
Launch only when Steps 1 through 11 are done, the gallery is live, and at least a few founding-creator quotes exist. Launching before the redesign wastes your one first impression.

**Step 16. Honest traction numbers.** (Claude session, small)
A live "X brands generated" counter once the number is respectable. Modest real numbers beat vague claims. You decide the threshold where it goes public.

---

## PART 5: WHAT NOT TO DO (guardrails)

1. **Do not sanitize into blandness.** The failure mode on the other side is "anonymous AI wrapper site". Nix, the green and gold palette, Fraunces, and the wit in the example chips are your anti-generic insurance. If a change makes the site look like it could belong to any AI startup, revert it.
2. **Do not repaint or regenerate Nix.** Rule #1 stands. Nix's art evolves only through real assets you approve, pose by pose. The "maturity" changes are in usage and frequency, not in his face.
3. **Do not add the anchor tier as a waitlist.** Real and buyable, or not at all.
4. **Do not gate the finish line.** Ever. It's now a public promise on the pricing page, which means breaking it isn't just bad UX, it's a broken promise.
5. **Do not run Product Hunt early.** One first impression.

---

## THE ONE-PARAGRAPH SUMMARY

Keep Nix. Calm everything around him. Green and gold site, purple stays Nix's personal color, Fraunces headlines, real screenshots, credible example prompts, two Nix lines instead of twenty, a real $49 anchor tier with a "what you finish is yours" promise, one website instead of two, and proof stacked in layers: live demo, prompt-visible gallery, named founding creators, honest numbers, and Fox in public. One thing stays weird. Everything else gets disciplined. That's how a goblin grows up without growing old.

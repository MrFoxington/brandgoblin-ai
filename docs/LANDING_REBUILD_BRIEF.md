# BrandGoblin AI — Landing Page Rebuild Brief
### Flip it from "fast & cheap utility" to "watch your idea come alive." Punchy, fun, addictive.
> Build spec for the homepage (`src/app/page.tsx` + components). Hand to Claude Code.
> Anchored to what's already shipped (Nix PNGs, 7-day reverse trial, energy, Framer Motion).
> RULE: animate existing Nix PNGs only — never generate Nix art. Use Next.js `<Image>`.

---

## 0. THE STRATEGIC SHIFT (read first)

The current page sells **speed and price** ("2 min", "$0", "vs $5,000 agency", "47 prompts").
That attracts price-shoppers and competes on cheapness. The new page sells **emotion and
identity**: the thrill of watching a half-formed idea suddenly become *real* — a name, a voice, a
look — conjured by Nix in front of you. We sell the feeling of *becoming a founder*, not a discount.

Two jobs for this page:
1. **Spark + excite** — a visitor (even one without a clear idea) feels "I HAVE to try this."
2. **Convert at peak emotion** — let them taste the magic, then sign up while they're lit up.

---

## 1. 🚨 FIX FIRST — remove fabricated social proof (legal + trust)

**Delete all invented numbers and fake named testimonials.** Currently: "2,400+ founders",
"4.9/5 from 2,400 brands", and six named quotes (Maya T., Carlos R., "saved $8,000", "I cried").
With ~9 real users this is fabricated — an FTC deceptive-advertising risk and a credibility bomb.

Replace with honest proof that still converts:
- **Founder's note** from the real founder (you): one human paragraph about why you built Nix.
- **"Be one of the first"** framing instead of fake counts — early-adopter energy is a *feature*.
- **Real beta quotes only** — even 2 genuine ones, with permission, beat 6 fake ones. Until you
  have them, use an honest placeholder: "Real creators, coming soon — be one of them."
- Trust signals that ARE true: "Built by brand strategists," "Powered by Claude," "No card required."

Never display a metric you can't defend with real data.

---

## 2. THE HERO — make it interactive (the #1 conversion change)

Today every CTA forces a signup before any value. Kill that. **The hero becomes the product.**

- Headline (keep the typewriter, sharpen the emotion):
  **"Watch your idea become a brand."** with a typewriter subline cycling wild ideas
  ("a coffee brand for night owls" → "a skincare line that feels like Sunday" → "a podcast for
  recovering perfectionists"…). The cycling examples double as **idea sparks**.
- **Live "try it" input, right in the hero:** a text box — placeholder *"Type any idea… a cereal
  company for adults"* — and a **"✦ Conjure it →"** button.
  - On submit: call a NEW lightweight, **no-signup** teaser endpoint that returns ONE killer
    brand name + one tagline (Haiku, cheap, ~1s). Animate it appearing with sparkles + Nix
    reacting ("Ooh, I like this one…").
  - That instant "whoa, it GETS it" is the dopamine spark.
  - Immediately under the teaser: **"That's 1 of 12. Want the full kit — story, colors, voice,
    launch plan? → Start free (7 days of everything)."** Gate the full magic at peak excitement.
- **Abuse guard for the teaser:** rate-limit by IP (e.g. 3 teasers/hour), no auth, tiny output
  only, reuse energy-config Haiku. Never expose the full kit without signup.
- Nix: use happy-waving PNG with a subtle idle animation (float/blink) so he feels alive, not pasted.

> If a teaser endpoint is too much for v1, fall back to a **client-side curated reveal**: typing an
> idea instantly shows a pre-written sample for the closest category — still feels live, zero cost.

---

## 3. LEAD WITH THE 7-DAY TRIAL (your best lever, currently invisible)

The page never mentions the reverse trial. It should be loud and everywhere:
- Hero CTA: **"Start free — 7 days of everything"** (not "3 free kits").
- Pricing section: Free tier reframed around **"7 days of full Creator Pro, free. No card."**
- Final CTA: same promise. "7 days of unlimited creating with Nix — free."

A 7-day "everything" trial is a far juicier promise than "3 generations." Make it the headline offer.

---

## 4. THE EMOTION REWRITE (section by section)

Keep the strong structure; swap the *story* from efficiency to transformation/delight.

- **Comparison section** — keep it (it's good), but retitle from time/money to feeling:
  "The hard way vs. the magic way." Keep concrete contrasts but add an emotional payoff line:
  "One way drains you. The other makes you feel unstoppable."
- **Live preview (Solace)** — keep; it's your best asset. Add motion: let the tabs auto-cycle and
  numbers count up so it feels alive. Caption: "This was one prompt. Yours is next."
- **"12 deliverables" grid** — keep, but frame each as a *gift being unwrapped*, not a feature spec.
- **How it works** — keep 3 steps; make step 2 about *Nix's personality* ("Nix gets to work —
  obsessing over every detail like it's his own brand").
- **Nix throughout** — give him voice/personality moments (short, calibrated, a little cheeky).
  He's the differentiator; make the page feel like meeting a character, not reading a brochure.

---

## 5. IDEA-SPARK SECTION (for visitors without an idea yet)

New section: **"Not sure what to build? Nix has ideas."** A rotating/animated wall of wild example
brands ("a meditation app for gamers," "hot sauce for people who cry at movies," "a finance
newsletter for 20-somethings"). Each is clickable → drops that idea into the hero input and
conjures a teaser. This turns the idle browser into a player and literally *inspires the idea*.

---

## 6. THE DOPAMINE LOOP (what the page promises, the app delivers)

The landing page should *tease* the loop so people know it's addictive. One short section:
**"Once you start, you won't want to stop."** Show the loop visually:
surprise reveal → pride (your brand!) → progress (XP/levels/streaks) → share (flex it) →
"one more" (reroll / build the socials) → come back tomorrow (Nix's daily idea + energy reset).
These systems already exist in-app; the page advertises the *feeling* of the loop.

---

## 7. MICRO-DELIGHT + CRAFT (the "punchy/fun" feel)

- Framer Motion on scroll-reveal for every section (respect `prefers-reduced-motion`).
- Nix reacts on the page: idle animation, a wink/wave on CTA hover, a sparkle on the teaser.
- Optional muteable sparkle sound on the teaser conjure (reuse existing sound system; default on,
  global mute already exists — the page already shows a 🔇 toggle).
- Buttons feel alive: subtle scale/press, gradient energy. Never static.
- Mobile-first: the interactive hero must feel amazing on a phone (most social traffic is mobile).

---

## 8. CONVERSION HYGIENE (best practices, applied)

- One primary CTA color/action repeated consistently: **"Start free — 7 days of everything."**
- Reduce signup friction: offer **Google sign-in** prominently (already built) — one tap.
- Put the interactive hero + first CTA fully **above the fold**; the magic must be visible without
  scrolling.
- Keep the page fast (the teaser must feel instant; lazy-load heavy sections/particles).
- Add a sticky/secondary CTA on scroll for mobile.

---

## ACCEPTANCE / GUARDRAILS
- No fabricated stats or named testimonials anywhere. Honest proof only.
- Interactive hero works and is rate-limited; falls back gracefully if the teaser API is down.
- 7-day trial is the headline offer across hero, pricing, and final CTA.
- Nix is animated (existing PNGs only), never regenerated.
- `prefers-reduced-motion` respected; smooth on mobile. `npx tsc --noEmit` + `npm run build` pass.
- Additive to existing routing/auth/energy — do not touch Stripe/energy/trial logic.
- Commit as one phase; don't push until reviewed.

## BUILD ORDER
1. Remove fabricated social proof (ship this alone immediately if nothing else — it's a liability).
2. Interactive "try it" hero + teaser endpoint (or curated fallback).
3. 7-day trial messaging everywhere.
4. Emotion rewrite of existing sections + idea-spark section.
5. Micro-delight / Nix animation polish.

## THE NORTH STAR
A visitor lands, types a half-formed idea on a whim, watches Nix instantly conjure a name that
makes them grin, and thinks: *"Wait — I could actually do this."* Then they're signing up before
they've decided to. Punchy, alive, a little magic. That's the page.

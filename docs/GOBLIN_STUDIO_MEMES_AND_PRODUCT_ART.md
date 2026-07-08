# Goblin Studio — fix Product Art + add a Meme Generator (backlog brief)

### Captured June 22, 2026 from Fox's feedback. NOT to build now — revisit when it makes sense.
### Two things: (1) Product Art is the weakest Studio output (category-blind); (2) add a Meme Generator
### (Fox's favorite idea — universal + shareable = distribution).

---

## THE PROBLEM (real, reproducible)
For "REPLICATE" (a sci-fi horror FILM), hitting **Product Art** produced soaps/shampoos with the brand
name on them — completely off-brand and off-category. Root cause: product-art generation assumes every
brand sells a physical consumer good, so without knowing what the brand *is*, it defaults to generic
CPG mockups (bottles, soap). A film has a *poster*, a SaaS an *app screen*, a podcast *cover art* — not
a shampoo bottle.

## OPTION ANALYSIS
- **Force a product-photo upload** → NO (or optional only). Most early users have an *idea*, not
  inventory; many brands (films, apps, services) never have a physical product. Gating on upload locks
  out most of the audience.
- **Make it category-aware (+ optional product input)** → YES, the real fix. The app already knows the
  brand category from the original idea. Product art should adapt the visual *format* to the category.
- **Add a Meme Generator** → YES (high priority). Universal across categories, forgiving for AI, fun,
  on-brand for Nix, and shareable → serves the #1 constraint (distribution).

---

## FIX A — MAKE PRODUCT ART CATEGORY-AWARE
- Pass the brand's category / "what it is" into the product-art cook-prompt so Nix picks the right
  visual format per category, e.g.:
  - Film / show → key art / movie poster
  - SaaS / app → device or UI mockup
  - CPG / food / beverage / cosmetics → packaging mockup (the current default — fine HERE)
  - Podcast / newsletter → cover art / branded header
  - Service / agency → brand hero / lifestyle image
  - Physical product / ecommerce → product render (packaging or the item)
- Add OPTIONAL inputs (never required): a short "what's the product/visual you want?" description, and an
  optional product photo upload (image-to-image) for users who have one.
- Possibly rename to "Brand Visuals" / "Product & Brand Art" so it doesn't imply a physical product.
- Keep the on-brand palette-lock + cook-prompt quality work already in place.

## FIX B — MEME GENERATOR (new Studio mode) ⭐ Fox's favorite
- New Studio mode: **Meme Generator.** Universal (works for any brand), forgiving for AI, shareable.
- Flow: user pastes a meme prompt/idea (from their kit's `marketingIdeas.memeIdeas`, or their own) →
  Studio generates a real meme image. One-click "copy a meme prompt from my kit → drop into generator."
- Two viable rendering approaches (pick one in build):
  1. **AI-rendered meme** — modern image models (e.g. nano_banana) render the whole meme incl. text.
     Simplest; text quality is decent now.
  2. **Template + caption overlay** — generate/choose a base image, overlay top/bottom text via canvas
     for crisp, reliable text. More control, guaranteed-readable.
- Make memes brand-flavored (use the brand's topic/vibe; optional brand color accent), but keep them
  funny first — a meme that's too "branded" doesn't spread.
- Uses Creative Energy like other Studio gens (consistent cost model). New `job_type: "meme"`.
- Add a tasteful, optional brand mark so shared memes carry the brand (distribution), like the Nix Zone
  download mark — but subtle, never killing the joke.

---

## WHY MEMES MATTER (the strategic case)
Distribution is the #1 constraint. Memes are the most *shareable* output we could make — every brand
meme in the wild is a free impression. They also sidestep the product-art accuracy problem entirely.
This could become the most-used and most-viral feature in Studio.

## SEQUENCING (when revisited)
1. Meme Generator first (higher universality + distribution payoff).
2. Product-art category-awareness + optional inputs second.
Both additive; energy-metered like existing Studio jobs; moderation via the existing safety checker.

*Logged for later. Don't build until the current priorities (Preview/copy, launch guide, Nix rig +
content engine) are shipped and we choose to come back to Studio.*

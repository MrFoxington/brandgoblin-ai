# Nix Companion — product vision & build-portable architecture

### The north-star vision: Nix as your personal creative companion — a lovable goblin who lives on your
### phone/desktop, nudges you daily, cooks up your ideas and content, and helps you grow your dream.
### We are NOT building the app now. We ARE building its brain now — as portable, reusable modules — so
### the companion app is later a re-packaging of proven machinery, not a from-scratch project.
> Vision + architecture doc. Created June 22, 2026. Companion to the Playbook + Automation Plan.

---

## THE VISION IN ONE LINE
BrandGoblin today = "a tool you visit." Nix Companion = "a creative partner who lives with you and keeps
you building." That shift — from tool to relationship — is the retention moat and the real product.

## WHY IT'S POWERFUL (honest case)
- **Habit loop / retention:** a daily nudge from a character you love is the #1 driver of repeat use
  (Duolingo's Duo proved it). The difference & our edge: Duo nags you to do *their* lessons; **Nix helps
  you grow *your own* dream.** More lovable, more defensible.
- **Unifies the product line:** brand generator, Goblin Studio, and the growth loop all become *things
  Nix does for you.* One personality, many superpowers, one clean story.
- **Emotional moat:** the bond is with a character only we have. Competitors can copy features, not Nix.

## HONEST RISKS / WHY NOT NOW
- A real mobile app = a big, ongoing build (iOS + Android, push, app-store review, maintenance).
- A "trained/custom LLM" = expensive far-future; existing models (Claude API) already do this today.
- A companion *amplifies* love for a product — so the product must be loved first. Build it before
  BrandGoblin has fans and you've decorated an empty house. **Traction first, companion second.**

---

## THE KEY INSIGHT: WE'RE ALREADY BUILDING ITS BRAIN
Everything in the live Nix content loop IS the companion's core logic. Map it:

| Today (content loop) | Becomes (companion app) |
|---|---|
| Daily Idea Engine (scheduled, fills the Queue) | Nix's daily "here's what we're making today" nudge |
| NIX_CONTENT_QUEUE approval gate | The in-app approve / tweak / kill flow |
| Nix persona + voice in prompts | The companion's personality & dialogue |
| Prompt libraries per pillar | Nix's "I'll cook it up for you" generation skills |
| Approval cadence (T-1) + reminders | Push notifications / scheduled check-ins |
| Weekly metrics digest | Nix's "here's how we did, let's do more of this" coaching |
| Generation from approved Nix art | The companion's on-model creative engine |

**Engineering principle — BUILD PORTABLE:** every piece we make for the loop is built as a clean,
documented, parameterized module (inputs: brand voice, mascot, goals → outputs: ideas/content), not a
one-off script. Nothing we build now should be throwaway. When the companion app is greenlit, its spec
is "wire these proven modules into a UI."

---

## NAMING (working)
- **Nix Companion** — the product/experience (the face you talk to).
- **The Goblin Loop** — the reusable engine inside it (create → approve → post → learn).
- **GrowthGoblin** — candidate name if the growth engine ships as its own sellable product/feature.

---

## PHASED ROADMAP (capture now, build only as traction earns it)
- **Phase 0 — NOW:** Run the live Nix content loop to grow BrandGoblin. Build every module portable +
  documented. Capture processes in the System Kit (below). *Cost: ~zero extra. Value: compounding.*
- **Phase 1 — after the loop is proven on us:** A lightweight **"Nix nudge"** feature inside the
  existing web app — Nix greets you, suggests today's creation, links into Studio. No new app, just a
  companion *surface* on what exists.
- **Phase 2 — after BrandGoblin has real traction:** A true mobile companion (push notifications, daily
  check-ins, on-the-go creation). This is where the portable modules pay off.
- **Phase 3 — long term:** Deeper AI assistant (memory, proactive coaching) using best available models.
  Custom/trained LLM only if/when scale justifies it.

---

## THE SYSTEM KIT (the savable, replicable asset — make this in Phase 0)
A brand-agnostic master version of the loop: the Playbook + Automation Plan + Queue + prompt libraries,
**parameterized so it can be pointed at ANY brand** by swapping in that brand's voice, mascot, and goals.
- Lets us replicate this whole engine for future brands (and is the literal spec for productizing it).
- Lives as documented templates now; becomes code modules as the companion gets built.
- "Create a great process once → rinse, repeat, reuse." Same ethos as the app: create, share, grow, repeat.

---

## DISCIPLINE NOTE (the friend talking)
All of this is genuinely good — and that's the danger. Vision is cheap; traction is everything. The rule:
**capture the vision, build portable, but keep daily focus on getting people into the app.** The companion,
the growth product, the mobile build — they all get *easier and better-funded* once BrandGoblin has users.
Don't let the cathedral distract from opening the doors. Eyeballs first.

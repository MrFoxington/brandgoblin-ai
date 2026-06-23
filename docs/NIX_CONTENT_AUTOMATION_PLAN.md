# Nix Content Automation Plan — the rinse-and-repeat engine

### Goal: automate ~90% of the TikTok content labor so Fox's job shrinks to a daily ~20-min check-in —
### approve / reject / tweak — while staying the creative director and quality gate on every piece.
> Companion to NIX_TIKTOK_PLAYBOOK.md. Created June 22, 2026.

---

## THE HONEST TAKE (read this first)
- **What SHOULD be automated:** idea generation, trend-scanning, prompt-writing, first-draft asset
  generation (Nix clips from approved art), caption/hashtag/sound drafting, scheduling, metrics pulls.
- **What should NEVER be fully automated:** the final approve/post decision, and the on-model + "does
  this have soul" judgment. That's the moat. An auto-poster that skips your eye is how Nix dies.
- **The real bottleneck is your approval time** — so the entire system is designed to make approving
  fast: batched, phone-friendly, one-tap. We optimize *your minutes*, not the robots' minutes.
- **TikTok reality:** there's no clean "AI posts for me" button. Official posting needs API approval;
  the practical, ToS-safe route is a social scheduler (you approve a queue, it posts on a timer) or a
  60-second manual upload. We lean on a scheduler so posting is hands-off but human-approved.

---

## THE ASSEMBLY LINE (5 stages, 1 human gate)

```
[1 IDEATE] → [2 GENERATE] → [★ FOX APPROVES ★] → [3 CAPTION] → [4 SCHEDULE] → [5 LEARN]
   robots        robots          HUMAN GATE          robots       semi-auto      robots
```

**Stage 1 — Ideate (fully automated, daily)**
A scheduled AI task runs every morning and drops a batch of 3–5 ready-to-shoot concepts into a Content
Queue. Each concept = pillar + hook + 1-line script + shot list + suggested sound. Built from the
Playbook pillars + a quick scan of what's trending. *You wake up to a menu, not a blank page.*

**Stage 2 — Generate (automated, on-model)**
For concepts you green-light, the creative tools generate the Nix clip/image **from your approved Nix
PNG** (image-to-video, motion-transfer, compositing into your photos). Output lands in a review folder.
Never text-generates a new Nix — always animates the real one.

**★ Stage 3 — FOX APPROVES (the human gate — ~20 min/day) ★**
You review the generated clips on your phone. For each: ✅ approve · ✏️ tweak (send note, regenerate) ·
❌ kill. Check: on-model (green skin / purple hair / ears / NIX hoodie / gold trim) + heart + funny.
Nothing moves past here without you.

**Stage 4 — Caption + package (automated draft, you confirm)**
Approved clips get auto-drafted caption, hook text-overlay, hashtags, and sound pick. You glance, tweak
a word if needed, confirm.

**Stage 5 — Schedule (semi-auto)**
Confirmed posts drop into the scheduler queue and publish at optimal times automatically. You can
reorder/pause anytime. (Or 60-sec manual upload if you'd rather keep a human finger on publish.)

**Stage 6 — Learn (automated weekly)**
A weekly task pulls performance (3s retention, completion, shares, profile clicks), tells you what hit
and what flopped, and feeds the winners back into Stage 1 so the idea engine makes more of what works.

---

## TOOL → STAGE MAP (use the right tool for each job)
| Stage | Tool | Role |
|---|---|---|
| 1 Ideate | **Cowork (me) on a daily schedule** | Generate concept batch + trend scan into the Queue |
| 2 Generate | **Connected creative suite** (image-to-video, motion-transfer) | Animate Nix from approved art |
| 2 alt / heavy edits | **Claude Code / ChatGPT** | Custom scripts, batch processing, edge cases |
| 3 Approve | **You + phone** | The gate. Approve/tweak/kill |
| 4 Caption | **Cowork (me)** | Draft captions, hooks, hashtags, sound |
| 5 Schedule | **Social scheduler** (e.g. Metricool/Later/Buffer or TikTok native) | Timed, hands-off posting |
| 6 Learn | **Cowork (me) on a weekly schedule** | Metrics digest + feed winners back to Stage 1 |

---

## APPROVAL CADENCE — ALWAYS ONE DAY AHEAD (T-1)
You approve **tomorrow's** content **today.** The loop runs on a 1-day buffer so there's always time to
tweak or regenerate without a last-minute scramble. Each day's check-in asks: *"This batch is built and
ready for tomorrow — approve, tweak, or kill?"* Approved → queued in the scheduler to post the next day.
This means a flop or off-model Nix never sneaks out under deadline pressure — there's always a day of slack.

## YOUR DAILY ~20-MIN CHECK-IN (the whole point)
1. Open the Content Queue → skim this morning's 3–5 concepts → tap the 1–2 you like. (2 min)
2. Open the Review folder → watch the generated clips → approve / note-a-tweak / kill. (10 min)
3. Glance at the auto-drafted captions on approved clips → confirm. (3 min)
4. Done. The scheduler posts them. Once a week, read the metrics digest. (5 min)

That's it. Create → produce → approve → post → learn → repeat. Same loop as the app: *create, share,
grow, repeat.*

---

## IMPLEMENTATION — CRAWL / WALK / RUN (don't build it all at once)

**Phase 0 — This week (prove the loop manually before automating it)**
- Stand up the **Content Queue** (a simple doc/tracker) + a **Review folder** + an **Approved/Posted** log.
- Set up the **daily Idea Engine** (scheduled AI task → fills the Queue each morning). ← biggest instant win.
- Produce ONE test clip end-to-end (the coffee-cup Nix) to validate the look + the approval flow.
- Post the first 3–5 starter-slate videos manually. Learn the rhythm.

**Phase 1 — Next (automate generation)**
- Build a repeatable **prompt library** for each pillar so generating an on-model Nix clip is one step.
- Batch-generate a week of clips per session into the Review folder.
- Add the **auto-caption/hashtag drafter**.

**Phase 2 — Then (automate distribution)**
- Connect a **social scheduler**; you approve a week's queue in one sitting, it posts daily.
- Lock posting windows from early performance data.

**Phase 3 — Then (close the loop)**
- Turn on the **weekly metrics digest**; pipe winners back into the Idea Engine so it self-improves.
- Expand to YouTube Shorts + IG Reels by repurposing the same approved clips (1 shoot → 3 platforms).

---

## HONEST RISKS & LIMITS (so nothing surprises you)
- **On-model drift is the #1 threat.** Mitigated by always animating from your real Nix art + your eye
  at the gate. Non-negotiable.
- **Posting can't be 100% hands-off safely.** A scheduler is as automated as it gets without risking
  TikTok's bot-suppression. That's fine — it matches your "approve everything" requirement anyway.
- **Garbage-in:** the idea engine is only as good as the Playbook + trend data feeding it. We tune it
  weekly with what actually performed.
- **Your time is the real constraint.** If the daily check-in ever creeps past ~20 min, we simplify —
  the system serves your time, not the reverse.
- **Tool sprawl:** resist adding tools. Each stage gets ONE owner. Simplicity = it actually gets done.

---

## WHAT WE SET UP FIRST (proposed)
1. **Daily Idea Engine** — a scheduled task that drops 3–5 fresh Nix concepts into your Queue each
   morning. (I can turn this on now.)
2. **Content Queue + Review/Posted tracker** — the simple backbone doc.
3. **One end-to-end test clip** — the coffee-cup Nix, to prove the look + approval flow before scaling.

*Build the loop small, prove it works, then automate one stage at a time. Rinse, repeat, grow.*

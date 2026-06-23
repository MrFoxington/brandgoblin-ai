# Nix Animation — how to bring him to life consistently (research report)

### The core insight: STOP asking AI to *draw* Nix; start *moving* the Nix you already have.
### AI image-to-video redraws him every clip (that's why composites looked off). A rigged 2D puppet
### literally IS your canonical art, so he's 100% on-model, every clip, forever.
> Research agent report. June 22, 2026. Use this to pick tools + a learning path.

---

## THE VERDICT
**Primary engine: Reallusion Cartoon Animator 5 (CTA5)** — rig the one Nix illustration once as a 2D
puppet, then animate with its huge drag-drop motion library (dances, walks, reactions). No keyframing.
On-model is guaranteed because the puppet is your actual artwork, just moved.

**Secondary engine for "Mirror Mode": Adobe Character Animator** — live webcam + Body Tracker mocap. You
perform, Nix copies your head/arms/face in real time. Free "Starter" mode to test at $0. This is the one
tool that solves your "Nix mimics my movements" idea.

Both tools ingest the SAME layered Photoshop (PSD) file, so the art-prep work is reusable across both.

## WHY NOT THE OTHERS
- **Pure AI video (Runway / Kling / Higgsfield / Sora / Veo):** redraws Nix every time → drift. Soul ID /
  Gen-4 references help for *photoreal humans trained on 10–20 photos*, NOT a flat-shaded cartoon goblin
  with exact gold trim from ONE image. Use AI **only for backgrounds Nix is composited onto — never Nix.**
- **3D (Blender + Meshy/Tripo):** would be consistent + give any angle, but AI image-to-3D produces a
  goblin that's *close but visibly not your exact 2D Nix*, plus weeks of Blender. Park as "Phase 2, maybe."
- **Live2D Cubism / After Effects+Duik:** guarantee consistency but steepest learning curves; Live2D is
  VTuber face-rig focused (weak on full-body dance), AE means manual keyframing. Wrong fit for limited time.

---

## RECOMMENDED TOOL STACK
| Layer | Tool | Cost | Role |
|---|---|---|---|
| Primary animation | **Cartoon Animator 5 (Pipeline)** | ~$149–199 one-time (sales often lower) | Rig once; drag-drop motion library. Nix-alone content. |
| Mirror Mode | **Adobe Character Animator** | Free Starter; Pro needs CC (~$23–60/mo) | Live webcam/body puppeteering. |
| Art prep | Photoshop / free Photopea / Krita | $0–70 | Cut Nix into layers (the one-time foundation). |
| Composite into real footage | **CapCut** (free) | Free | Layer green-screened Nix onto your photos/videos. |
| Backgrounds ONLY | Runway Gen-4 / Kling | $12–95/mo (low tier) | Scenes Nix sits in — never Nix himself. |
| Voice (optional) | ElevenLabs / TTS | $0–5/mo | Consistent Nix voice for lip-sync. |

**Realistic spend:** ~$150–200 one-time (CTA5) + $0–60/mo optional. Can start at ~$0 (Character Animator
Starter is free) to prove the concept before buying anything.

---

## COMPARISON (consistency · learning curve · cost · time/video · mocap)
| Approach | Consistency | Learning | Cost | Time/video | Mirror Mode | Verdict |
|---|---|---|---|---|---|---|
| CTA5 (2D puppet) | ★★★★★ guaranteed | Moderate (rig once = the hump) | ~$149–199 once | 15–45 min | Yes (Motion LIVE 2D) | **PRIMARY** |
| Adobe Character Animator | ★★★★★ guaranteed | Low–moderate | Free–$60/mo | Real-time + cleanup | ★★★★★ best webcam mocap | **SECONDARY** |
| Live2D Cubism | ★★★★★ | High | Free–$100/yr | 30–60 min | Face only | Skip |
| AE + Duik/RubberHose | ★★★★★ | Very high | CC sub | Hours | No | Skip |
| 3D (Blender + Meshy) | ★★★★☆ (not exact 2D look) | Very high | Free–$60/mo | Long upfront | Yes (Mixamo) | Phase 2 maybe |
| AI video (Runway/Kling/etc.) | ★★☆☆☆ drifts | Very low | $12–95/mo | Minutes | Off-model | Backgrounds only |

---

## START HERE THIS WEEK
**Day 1–2 — Prep the art (one-time foundation):** open the Nix illustration in Photoshop/Photopea/Krita;
separate into layers (head, front/back hair, each eye, brows, a few mouth shapes for lip-sync, torso/hoodie,
upper arms, forearms, hands, thighs, shins, feet); paint behind moving parts so no holes show. This PSD is
reusable in BOTH tools.

**Day 2–3 — Free proof in Adobe Character Animator (Starter = $0):** watch Okay Samurai (Dave Werner, the
Adobe Ch lead) "Intro to Adobe Character Animator" (~47 min), then his "Creating a Photoshop Puppet"
tutorial to rig Nix. Turn on webcam + Body Tracker → watch Nix copy you. That's your Mirror Mode test, free.

**Day 4–7 — Set up the workhorse (CTA5):** download the FREE trial first; do Reallusion's official
"Intro to SVG & PSD Workflow | CTA5" and "How to Design and Rig a CTA5 G3 Actor" (courses.reallusion.com);
goal: import Nix, drag ONE library dance onto him, export a clip. That drag-drop moment = consistency is now free.

**Week 2 — Composite (Use Case 2):** export Nix on transparent/green bg → in free CapCut, overlay onto your
real photo/video, key out the bg, scale onto your shoulder/cup, add a shadow.

---

## PITFALLS — DON'T WASTE TIME ON
- Don't keep trying to make AI video *generate Nix himself* — it will always drift on a hard-edged 2D mascot.
- Don't start with 3D/Blender — close-but-not-exact + weeks of learning.
- Don't pick Live2D or AE as primary — steepest curves, wrong fit.
- Don't over-segment or sloppily cut the art — clean layer prep (painted behind limbs, named/grouped) is
  what makes rigging easy. Get this right and everything downstream is smooth.

**Expectations:** the rig is the hump (budget one focused weekend). After that, an on-model dance/reaction
clip is 15–45 min, every time, forever. Mirror Mode (webcam) is jittery — expect a take or two + smoothing;
face + upper body works best.

---

### ONE LINE
Rig your one canonical Nix illustration as a 2D puppet in Cartoon Animator 5 (drag-drop dances), add Adobe
Character Animator for live Mirror Mode, composite into your world with free CapCut, and use AI video only
for backgrounds — never for Nix. That's how he stays exactly on-model, every clip, forever.

# 🟣 NIX RIG WALKTHROUGH — bring the goblin to life, end-to-end

> For Fox. Do these in order. You do NOT need to be an animator — every menu and button is named.
> **On-model is sacred.** Per `NIX_CHARACTER_RULES.md` we NEVER redraw Nix. This rig MOVES the real
> artwork; it never reinvents it. AI tools touch backgrounds only — never Nix.
>
> **Source art:** start from Nix's canonical PNG. Best base for rigging is a clean **front-facing,
> arms-slightly-out, mouth-neutral** pose. From `ASSET_MAP.md` the on-disk options are:
> - `/public/nix/happy-waving-nix.png` (live)
> - `/public/nix/nix-master-sheet.png` (the DNA — use ONLY as color/shape reference, don't rig the sheet itself)
>
> If none of the live poses is a clean front T-ish pose, that's the one art ask before rigging: a
> straight-on Nix, arms a little away from the body, neutral mouth, on transparent background. Everything
> below assumes that file. We'll call it **`nix-front.png`** in the steps.

---

## PART 1 — CUT NIX INTO LAYERS IN PHOTOPEA (~60–90 min, $0)

**1.1 — Open Nix** in Photopea (photopea.com, free, runs in browser). Open `nix-front.png`.
If he's on a background, cut him out so he's on transparency.

**1.2 — Separate him into layers.** Each movable part = its own layer. Cut these, exactly:

Head group (put all of these inside a GROUP named `Head`):
- `Head` — the face/skull base (skin, nose, cheeks)
- `Back Hair` — hair behind the head
- `Front Hair` — hair in front
- `Left Ear`, `Right Ear`
- `Left Eyebrow`, `Right Eyebrow`
- `Left Eye`, `Right Eye` (the white + iris; keep simple to start)
- `Left Blink`, `Right Blink` — a closed-eye shape drawn over each eye (for blinking)
- Mouth shapes (draw 4–5, stacked, same spot): `Neutral`, `Smile`, `Surprised`, `Aa`, `Oh`

Body group (inside a GROUP named `Body`):
- `Torso` — hoodie + chest (the "NIX" + gold trim lives here)
- `Left Arm`, `Right Arm` (upper arm)
- `Left Forearm`, `Right Forearm` (lower arm + hand)
- `Left Thigh`, `Right Thigh`
- `Left Shin`, `Right Shin` (lower leg + foot)
- `Cape` (if his cape is separate) — its own layer behind the body

**1.3 — Paint behind the moving parts.** Wherever an arm/leg overlaps the body, paint the hoodie/pants
*behind* it so no hole shows when the limb moves. (Quick trick: clone/extend the torso color under each arm.)

**1.4 — Name layers EXACTLY like above.** Character Animator auto-rigs by reading these names. Spelling
and Left/Right matter. ("Left/Right" = the character's own left/right, i.e. mirrored from your view.)

**1.5 — Save as PSD.** File → Export As → **PSD** (keeps all layers). Name it `nix-puppet.psd`.

---

## PART 2 — PROVE IT FREE IN ADOBE CHARACTER ANIMATOR (~45 min, $0)
**2.1** Download + open Character Animator (Starter mode is free).
**2.2** File → Import → choose `nix-puppet.psd`. It creates a **puppet** in your Project panel.
**2.3** Double-click the puppet to open the **Rig** workspace. Character Animator auto-tags parts from your
layer names. Look at the right panel — green tags = recognized. Fix any untagged part by selecting the
layer and clicking the matching tag (Head, Left Arm, Mouth, etc.).
**2.4** Set the crosshairs (origins) if needed: drag the little + handles so joints sit at shoulders, elbows,
hips, knees, and the head sits on the neck. (Character Animator usually places these for you.)
**2.5** Switch to the **Record** workspace. Allow camera access. Sit facing the webcam in good light.
**2.6** Click the **Set Rest Pose** / calibrate button (face neutral, look straight). Now move — Nix's head
and mouth follow you. Turn on **Body Tracker** (right panel) to drive his arms with your arms.
**2.7** Hit the red **Record** button, do a wave or a little dance, stop. Play it back.
**2.8** Export: File → Export → **Video (via Adobe Media Encoder)** or PNG sequence. That's your first
living Nix clip. 🎉

➡️ **Decision point:** Did Nix mirror you and stay on-model? If yes, the whole strategy is proven — move to
Part 3 for the dance library. If something looked off, send the frame to the `nix-animator` agent to fix.

---

## PART 3 — CARTOON ANIMATOR 5 FOR DRAG-DROP DANCES (after it clicks)
**3.1** Download the **free CTA5 trial** (reallusion.com). Don't buy until you've tested.
**3.2** Import your same `nix-puppet.psd` as a **G3 Free-Bone actor** (CTA5's PSD import wizard walks you
through mapping the layers to its skeleton — same layer names help here too).
**3.3** Open the **Motion / Animation library**, find a dance or reaction, and **drag it onto Nix.** He
performs it — on-model, zero keyframing.
**3.4** Export → MP4 (or PNG sequence with transparency for compositing).

---

## PART 4 — PUT NIX IN YOUR WORLD (CapCut, free)
**4.1** Export Nix on transparent or green background from CTA5/Character Animator.
**4.2** In CapCut: add your real photo/video as the base track, add the Nix clip as an **overlay**.
**4.3** If green: Overlay → **Remove Background → Chroma Key**, pick the green. If transparent: it just works.
**4.4** Scale + position Nix onto your shoulder / the cup / the swing. Add a soft shadow under him.
**4.5** Export 1080×1920 (9:16) for TikTok. Done.

---

## PITFALLS (don't trip on these)
- Sloppy layer cut = the #1 failure. Paint behind limbs; name layers exactly; group Head and Body.
- Don't over-cut to start — the list above is enough. Add detail later.
- Mirror Mode (webcam) is a little jittery: do 2–3 takes, keep the best, smooth in editing. Face + upper
  body works best; don't expect webcam breakdancing.
- Lighting matters for webcam capture — face a window or lamp.

---

## 🟣 PASTE THIS TO YOUR `nix-animator` AGENT WHEN YOU'RE READY / STUCK
> I'm rigging Nix. Here's where I am: [describe step / paste a screenshot or frame]. Walk me through the
> exact next move, keep him on-model, and tell me if anything looks off. Use the chosen toolchain
> (Character Animator for Mirror Mode, CTA5 for the dance library, CapCut to composite).

*One weekend on the rig = on-model Nix clips in 15–45 min forever after. Worth every minute.*

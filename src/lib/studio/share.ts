// Single real-share-only flow, reused by JobCard AND the post-reveal celebration.
// Returns the outcome so callers can celebrate ONLY on genuine success.
//
//   "shared"    — navigator.share() resolved (a real share happened)
//   "copied"    — clipboard fallback copy succeeded
//   "cancelled" — user dismissed the share sheet (AbortError) — DO NOT celebrate
//   "failed"    — nothing worked (no API, or copy threw) — DO NOT celebrate

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

interface ShareOpts {
  title?: string;
  text?: string;
}

export async function shareImage(url: string, opts?: ShareOpts): Promise<ShareResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = (typeof navigator !== "undefined" ? navigator : null) as any;
  if (!nav) return "failed";

  if (nav.share) {
    try {
      // Resolves ONLY on a real share; rejects on cancel.
      await nav.share({
        title: opts?.title ?? "My creation — BrandGoblin Studio",
        text: opts?.text ?? "Made with Goblin Studio 🎨",
        url,
      });
      return "shared";
    } catch (err) {
      // AbortError = user cancelled the share sheet → never celebrate.
      const name = (err as { name?: string })?.name;
      if (name === "AbortError") return "cancelled";
      // Some browsers reject share() for non-cancel reasons — fall through to clipboard.
    }
  }

  if (nav.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
}

// True only where the OS can share an actual FILE (phones, mostly). Used to
// branch mobile (open the native sheet) vs desktop (direct download).
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof File === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  if (typeof nav.canShare !== "function" || typeof nav.share !== "function") return false;
  try {
    return nav.canShare({ files: [new File([], "probe.jpg", { type: "image/jpeg" })] });
  } catch {
    return false;
  }
}

interface ShareFileOpts extends ShareOpts {
  filename?: string;
}

// File-first share: puts the ACTUAL creation on the OS share sheet, so
// Instagram / TikTok / X / "Save to Photos" all receive the image itself —
// not just a link. Falls back to the URL share (shareImage) everywhere a file
// share isn't possible. Same celebrate-only-on-shared|copied contract.
export async function shareImageFile(url: string, opts?: ShareFileOpts): Promise<ShareResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = (typeof navigator !== "undefined" ? navigator : null) as any;
  if (!nav) return "failed";

  if (typeof nav.canShare === "function" && typeof nav.share === "function" && typeof File !== "undefined") {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], opts?.filename ?? "goblin-studio.jpg", {
        type: blob.type || "image/jpeg",
      });
      if (nav.canShare({ files: [file] })) {
        // Resolves ONLY on a real share; rejects on cancel.
        await nav.share({
          files: [file],
          title: opts?.title ?? "My creation — BrandGoblin Studio",
          text: opts?.text ?? "Made with Goblin Studio 🎨",
        });
        return "shared";
      }
      // canShare(false) → no file support; fall through to URL share below.
    } catch (err) {
      // AbortError = user dismissed the sheet → never celebrate.
      const name = (err as { name?: string })?.name;
      if (name === "AbortError") return "cancelled";
      // fetch failed or share rejected for another reason → fall through to URL share.
    }
  }

  // Fall back to the existing URL share → clipboard (keeps current behavior).
  return shareImage(url, opts);
}

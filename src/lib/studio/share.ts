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

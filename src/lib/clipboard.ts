// Robust clipboard copy used by every copy button in the app.
// The async Clipboard API (navigator.clipboard.writeText) fails silently in several
// real situations: non-secure (http) contexts, when the document isn't focused, in
// some browsers, or when permission is denied. When that happens the OLD clipboard
// value is kept — which is why a failed "copy section" looked like it copied just the
// brand name (the last thing successfully copied). This helper tries the modern API
// first, then falls back to a hidden-textarea + execCommand copy, and finally reports
// failure so the caller can tell the user instead of failing silently.
//
// Returns true only when the text was actually placed on the clipboard.

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1) Modern async Clipboard API (best path; needs secure context + focus)
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy fallback below
    }
  }

  // 2) Legacy fallback: hidden textarea + execCommand("copy")
  // Works in more contexts (http, unfocused, older browsers).
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);

    // Preserve any existing selection so we don't disrupt the user.
    const selection = document.getSelection();
    const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(ta);

    if (savedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
    return ok;
  } catch {
    return false;
  }
}

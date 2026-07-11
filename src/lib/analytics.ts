/**
 * Client-side event tracking.
 * Fires-and-forgets — never throws, never blocks the UI.
 */

// Typed event catalogue — add new events here as the product grows
export type AnalyticsEvent =
  | "brand_kit_viewed"       // brand kit page opened
  | "reveal_skipped"         // user clicked "Skip" during cinematic reveal
  | "reveal_completed"       // all reveal cards animated naturally
  | "first_copy"             // first CopyButton hit on a brand kit page
  | "session_start"          // dashboard loaded (used for D1/D7 return)
  | "content_generated"      // Creator Pro content piece generated
  | "upgrade_nudge_shown"    // free user saw UpgradeNudge
  | "upgrade_cta_clicked"    // any upgrade button clicked
  | "display_name_set"       // user told Nix their name (greeting personalization)
  | "website_preview_opened"  // user opened the live homepage mockup
  | "website_prompt_copied";  // user copied the AI-builder brief from the preview

export interface AnalyticsProperties {
  brandId?: string;
  timeOnPageMs?: number;   // ms since page load — "time to first wow"
  daysSinceSignup?: number;  // for D1/D7 retention
  cardIndex?: number;      // which RevealCard triggered the event
  section?: string;
  plan?: string;
  [key: string]: unknown;
}

// Page-load timestamp — used to compute timeOnPageMs
const PAGE_LOAD_AT = typeof window !== "undefined" ? Date.now() : 0;

export function msOnPage(): number {
  return Date.now() - PAGE_LOAD_AT;
}

export function trackEvent(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {}
): void {
  // Best-effort fire-and-forget — never throws
  try {
    fetch("/api/brand/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: event,
        brandGenerationId: properties.brandId,
        properties,
      }),
      keepalive: true, // survives page unload
    }).catch(() => null);
  } catch {
    // Silently ignore — analytics must never break the product
  }
}

// Normalize an email for abuse-prevention checks.
// Gmail: strip dots and +aliases from the local part.
// All domains: lowercase everything.

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export function normalizeEmail(raw: string): string {
  const lower = raw.toLowerCase().trim();
  const atIdx = lower.lastIndexOf("@");
  if (atIdx === -1) return lower;

  const local  = lower.slice(0, atIdx);
  const domain = lower.slice(atIdx + 1);

  if (GMAIL_DOMAINS.has(domain)) {
    const stripped = local.replace(/\./g, "").replace(/\+.*$/, "");
    return `${stripped}@${domain}`;
  }

  // For all other providers: strip +alias only (conservative)
  const stripped = local.replace(/\+.*$/, "");
  return `${stripped}@${domain}`;
}

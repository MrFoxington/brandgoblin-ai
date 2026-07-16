import type { BrandDNAScore } from "@/types";

/**
 * Normalizes Brand DNA scores to a 0–100 scale.
 * Guards against the model scoring on a 0–10 scale (July 16 2026 bug:
 * a brand the model scored 9/10 across the board displayed as 9/100
 * overall — looked like "your idea sucks" when it actually meant 91).
 */
export function normalizeBrandDna(scores: BrandDNAScore[] | undefined | null): BrandDNAScore[] {
  if (!scores || scores.length === 0) return [];
  const max = Math.max(...scores.map((s) => s.score));
  const factor = max <= 10 ? 10 : 1;
  return scores.map((s) => ({
    ...s,
    score: Math.max(0, Math.min(100, Math.round(s.score * factor))),
  }));
}

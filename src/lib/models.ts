// ── Claude model routing (Sept 2026) ──────────────────────────────────────────
// Creator Max members get Nix's strongest brain. Everyone else keeps the fast
// defaults that have been in production since July. Model IDs are env-tunable
// so Fox can point Max at a newer model the day it ships without a code change.
//
//   CLAUDE_MODEL_KIT           brand kit generation, default for Free/Pro
//   CLAUDE_MODEL_KIT_MAX       brand kit generation for Creator Max
//   CLAUDE_MODEL_CONTENT       Creator Pro content engine, default
//   CLAUDE_MODEL_CONTENT_MAX   content engine for Creator Max
//
// The kit route falls back to the default model automatically if the Max model
// rejects the request before any text streams (e.g. an ID that isn't live yet),
// so a bad env value can never break a paying member's generation.

export const MODELS = {
  kit:        process.env.CLAUDE_MODEL_KIT         ?? "claude-sonnet-4-6",
  kitMax:     process.env.CLAUDE_MODEL_KIT_MAX     ?? "claude-opus-4-6",
  content:    process.env.CLAUDE_MODEL_CONTENT     ?? "claude-haiku-4-5-20251001",
  contentMax: process.env.CLAUDE_MODEL_CONTENT_MAX ?? "claude-sonnet-4-6",
} as const;

/** Ordered candidates for brand-kit generation: preferred first, fallback last. */
export function kitModelsFor(plan: string | null | undefined): string[] {
  if (plan === "max" && MODELS.kitMax !== MODELS.kit) return [MODELS.kitMax, MODELS.kit];
  return [MODELS.kit];
}

/** Model for the Creator Pro content engine. */
export function contentModelFor(plan: string | null | undefined): string {
  return plan === "max" ? MODELS.contentMax : MODELS.content;
}

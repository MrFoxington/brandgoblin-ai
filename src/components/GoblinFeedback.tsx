"use client";

import { useState } from "react";

type Rating = "nailed_it" | "pretty_close" | "not_what_i_imagined";
type WouldBuild = "yes" | "maybe" | "no";

const RATINGS: { value: Rating; emoji: string; label: string; color: string; question: string }[] = [
  {
    value: "nailed_it",
    emoji: "🟢",
    label: "Nailed It",
    color: "border-green-500/50 bg-green-500/10 text-green-400",
    question: "What was your favorite part?",
  },
  {
    value: "pretty_close",
    emoji: "🟡",
    label: "Pretty Close",
    color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    question: "What should BrandGoblin improve?",
  },
  {
    value: "not_what_i_imagined",
    emoji: "🔴",
    label: "Not What I Imagined",
    color: "border-red-500/50 bg-red-500/10 text-red-400",
    question: "Tell the Goblin what you were hoping for.",
  },
];

const VALIDATION_OPTIONS: { value: WouldBuild; label: string }[] = [
  { value: "yes", label: "Yes, I'd launch this." },
  { value: "maybe", label: "Maybe." },
  { value: "no", label: "Probably not." },
];

async function track(brandGenerationId: string, eventType: string) {
  await fetch("/api/brand/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandGenerationId, eventType }),
  }).catch(() => {});
}

export default function GoblinFeedback({
  brandGenerationId,
  brandName,
}: {
  brandGenerationId: string;
  brandName: string;
}) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [wouldBuild, setWouldBuild] = useState<WouldBuild | null>(null);
  const [validationSubmitted, setValidationSubmitted] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRating = RATINGS.find((r) => r.value === rating);
  const showTestimonialPrompt =
    feedbackSubmitted && validationSubmitted && rating === "nailed_it" && wouldBuild === "yes";

  async function submitFeedback() {
    if (!rating) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brand/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandGenerationId, rating, feedbackText: feedbackText || null }),
      });
      if (!res.ok) throw new Error();
      await track(brandGenerationId, `feedback_${rating}`);
      setFeedbackSubmitted(true);
    } catch {
      setError("Couldn't save your feedback. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitValidation(value: WouldBuild) {
    setWouldBuild(value);
    try {
      await fetch("/api/brand/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandGenerationId, wouldBuild: value }),
      });
      await track(brandGenerationId, `validation_${value}`);
    } catch {}
    setValidationSubmitted(true);
  }

  async function submitTestimonial() {
    if (!testimonialText.trim()) { setTestimonialSubmitted(true); return; }
    try {
      await fetch("/api/brand/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandGenerationId, testimonialText }),
      });
    } catch {}
    setTestimonialSubmitted(true);
  }

  return (
    <div className="space-y-6 mt-10">

      {/* Phase 5: Goblin Feedback */}
      <div className="bg-card rounded-2xl p-8">
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">🧌</span>
          <h2 className="font-display text-2xl font-extrabold text-white mb-2">Help Train The Goblin</h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Every piece of feedback helps BrandGoblin get better at bringing ideas to life.
          </p>
        </div>

        {!feedbackSubmitted ? (
          <div className="space-y-5">
            <p className="text-center text-sm font-semibold text-white">How close did we get?</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRating(r.value)}
                  className={`rounded-xl border-2 px-5 py-4 text-center font-semibold transition-all ${
                    rating === r.value
                      ? r.color + " scale-[1.03]"
                      : "border-[rgba(45,45,78,0.8)] text-muted hover:border-primary/40 hover:text-white"
                  }`}
                >
                  <span className="block text-2xl mb-1">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>

            {rating && selectedRating && (
              <div className="space-y-3">
                <label className="label">{selectedRating.question}</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="input"
                  placeholder="Optional — share your thoughts…"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              onClick={submitFeedback}
              disabled={!rating || saving}
              className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Submit Feedback →"}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-3xl block mb-2">{selectedRating?.emoji}</span>
            <p className="text-white font-semibold">Thanks for the feedback!</p>
            <p className="text-sm text-muted mt-1">The Goblin is taking notes. 📝</p>
          </div>
        )}
      </div>

      {/* Phase 6: Business Validation */}
      {feedbackSubmitted && (
        <div className="bg-card rounded-2xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block">🚀</span>
            <h2 className="font-display text-xl font-extrabold text-white mb-2">Would You Actually Build This?</h2>
            <p className="text-muted text-sm">Be honest — every answer helps.</p>
          </div>

          {!validationSubmitted ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {VALIDATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => submitValidation(opt.value)}
                  className="rounded-xl border-2 border-[rgba(45,45,78,0.8)] px-5 py-4 text-sm font-semibold text-muted transition hover:border-primary/50 hover:text-white hover:bg-primary/10"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-white font-semibold">
              {wouldBuild === "yes" ? "🔥 Love the ambition. Keep building!" : wouldBuild === "maybe" ? "✨ Maybe is a good start. Keep exploring." : "👍 Honest answer appreciated. Try another idea!"}
            </p>
          )}
        </div>
      )}

      {/* Phase 8: Testimonial prompt (nailed_it + yes only) */}
      {showTestimonialPrompt && !testimonialSubmitted && (
        <div className="bg-card rounded-2xl p-8 border border-secondary/20">
          <div className="text-center mb-5">
            <span className="text-3xl block mb-2">⭐</span>
            <h2 className="font-display text-xl font-extrabold text-white mb-1">Would you share a quick testimonial?</h2>
            <p className="text-sm text-muted">We may feature it on BrandGoblinAI.com. Totally optional.</p>
          </div>
          <textarea
            rows={3}
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
            className="input mb-4"
            placeholder={`"BrandGoblin turned my idea for ${brandName} into a complete brand in minutes…"`}
          />
          <div className="flex gap-3">
            <button onClick={submitTestimonial} className="btn-primary flex-1 py-3">
              Share Testimonial →
            </button>
            <button onClick={() => setTestimonialSubmitted(true)} className="btn-secondary px-5 py-3 text-sm">
              Skip
            </button>
          </div>
        </div>
      )}

      {testimonialSubmitted && showTestimonialPrompt && (
        <div className="text-center py-2">
          <p className="text-sm text-secondary font-semibold">✓ Thank you! We appreciate your support.</p>
        </div>
      )}

    </div>
  );
}

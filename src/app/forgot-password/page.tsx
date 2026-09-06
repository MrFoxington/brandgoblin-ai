"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MarketingShell from "@/components/marketing/MarketingShell";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <MarketingShell>
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="bg-card w-full max-w-md p-8 sm:p-10">
          <div className="mb-8 text-center">
            <span className="block text-5xl mb-3">🔑</span>
            <h1 className="font-display text-3xl font-semibold text-ink">Reset your password</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-goblin/30 bg-goblin-tint p-4 text-sm text-goblin-dark">
                ✓ Reset link sent! Check your email and follow the link to set a new password.
              </div>
              <p className="text-sm text-ink-muted">
                Didn&apos;t get it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-goblin hover:text-goblin-dark transition-colors"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Sending..." : "Send reset link →"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-muted">
            Remember it?{" "}
            <Link href="/login" className="font-semibold text-goblin hover:text-goblin-dark transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}

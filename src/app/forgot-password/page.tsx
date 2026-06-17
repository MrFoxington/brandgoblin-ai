"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="bg-card w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <span className="logo-glow block text-5xl mb-3">🔑</span>
            <h1 className="font-display text-2xl font-extrabold text-white">Reset your password</h1>
            <p className="mt-1 text-sm text-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 text-sm text-secondary">
                ✓ Reset link sent! Check your email and follow the link to set a new password.
              </div>
              <p className="text-sm text-muted">
                Didn&apos;t get it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-primary-light hover:text-white transition-colors"
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
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Sending..." : "Send reset link →"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Remember it?{" "}
            <Link href="/login" className="font-semibold text-primary-light hover:text-white transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

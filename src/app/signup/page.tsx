"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MarketingShell from "@/components/marketing/MarketingShell";
import NixAvatar from "@/components/NixAvatar";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/confirm?next=/dashboard` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Record which hero variant this signup first saw (Brand Maturity Prompt 3).
    // Fire-and-forget: attribution must never block or break signup.
    if (data.user?.id) {
      fetch("/api/signup-attrib", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id }),
        keepalive: true,
      }).catch(() => {});
    }

    setLoading(false);
    if (data.session) {
      router.push("/generate");
      router.refresh();
    } else {
      setSuccess(true);
    }
  }

  return (
    <MarketingShell>
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="bg-card w-full max-w-md p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <NixAvatar size="xl" glow />
            </div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              Start Building Your Brand
            </h1>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Everyone Has An Idea.<br />
              BrandGoblin Helps Bring It To Life.
            </p>
            <p className="mt-2 text-xs text-ink-faint">3 free brand generations · No card required</p>
          </div>

          {success ? (
            <div className="rounded-xl border border-goblin/30 bg-goblin-tint p-5 text-center text-sm text-goblin-dark">
              Check your email to confirm your account, then log in.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
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
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Creating your account…" : "Create account free"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-goblin hover:text-goblin-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MarketingShell from "@/components/marketing/MarketingShell";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <MarketingShell>
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="bg-card w-full max-w-md p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/nix/happy-waving-nix.png"
                alt="Nix, your brand goblin"
                width={112}
                height={112}
                priority
                className="drop-shadow-[0_12px_28px_rgba(124,58,237,0.35)]"
              />
            </div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              Welcome to BrandGoblin AI
            </h1>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Everyone Has An Idea.<br />
              BrandGoblin Helps Bring It To Life.
            </p>
          </div>

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
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-ink-muted hover:text-goblin transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            No account yet?{" "}
            <Link href="/signup" className="font-semibold text-goblin hover:text-goblin-dark transition-colors">
              Sign up free
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-ink-faint">
            Nix is ready when you are.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}

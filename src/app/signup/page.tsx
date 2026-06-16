"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // If email confirmation is disabled, Supabase returns a session immediately.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="goblin-card w-full max-w-md p-8">
          <div className="mb-6 text-center">
            <span className="text-4xl">🪄</span>
            <h1 className="mt-3 text-2xl font-extrabold text-white">
              Create your goblin account
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              3 free brand kits included. No card required.
            </p>
          </div>

          {success ? (
            <p className="rounded-lg border border-goblin-emerald/30 bg-goblin-emerald/10 p-4 text-center text-sm text-goblin-emerald">
              Check your email to confirm your account, then log in.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="goblin-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="goblin-input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="goblin-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="goblin-input"
                  placeholder="At least 6 characters"
                />
              </div>

              {error ? (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={loading} className="goblin-btn-primary w-full">
                {loading ? "Summoning account..." : "Create account ✨"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-goblin-purple-light">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

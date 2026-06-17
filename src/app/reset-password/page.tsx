"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase exchanges the token from the URL hash and fires onAuthStateChange
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="bg-card w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <span className="logo-glow block text-5xl mb-3">🔐</span>
            <h1 className="font-display text-2xl font-extrabold text-white">Set new password</h1>
            <p className="mt-1 text-sm text-muted">Choose a strong password for your account.</p>
          </div>

          {!ready ? (
            <div className="text-center text-sm text-muted py-4">
              Verifying reset link
              <span className="animate-pulse">...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="label" htmlFor="confirm">Confirm new password</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input"
                  placeholder="Repeat your new password"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Updating..." : "Update password →"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

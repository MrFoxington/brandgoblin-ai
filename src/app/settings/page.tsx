import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import UpgradeButton from "@/components/UpgradeButton";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("email, plan, credits, created_at")
    .eq("id", authData.user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Settings</h1>
          <p className="mt-1 mb-8 text-sm text-zinc-400">
            Manage your account, plan, and credits.
          </p>

          <div className="goblin-card mb-6 space-y-3 p-6">
            <h2 className="goblin-section-title">👤 Account</h2>
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Email:</span> {userRow?.email ?? authData.user.email}
            </p>
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Member since:</span>{" "}
              {userRow?.created_at
                ? new Date(userRow.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div className="goblin-card mb-6 space-y-4 p-6">
            <h2 className="goblin-section-title">🪙 Plan & credits</h2>
            <div className="flex items-center justify-between rounded-lg border border-goblin-border bg-goblin-bg/40 p-4">
              <div>
                <p className="font-semibold capitalize text-white">{userRow?.plan ?? "free"} plan</p>
                <p className="text-sm text-zinc-400">
                  {userRow?.plan === "free"
                    ? `${userRow?.credits ?? 0} credits remaining`
                    : "Unlimited generations"}
                </p>
              </div>
              {userRow?.plan === "free" ? (
                <div className="flex gap-2">
                  <UpgradeButton plan="pro" label="Upgrade to Pro" />
                  <UpgradeButton plan="agency" label="Upgrade to Agency" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="goblin-card p-6">
            <h2 className="goblin-section-title mb-4">🚪 Session</h2>
            <LogoutButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import UpgradeButton from "@/components/UpgradeButton";
import { planDisplayName } from "@/types";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("email, plan, credits, created_at")
    .eq("id", authData.user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-2xl">

          <div className="mb-10">
            <span className="badge-purple mb-3 block w-fit">✦ Account</span>
            <h1 className="font-display text-3xl font-extrabold text-white">Settings</h1>
            <p className="mt-1 text-sm text-muted">Manage your account, plan, and credits.</p>
          </div>

          {/* Account */}
          <div className="bg-card mb-5 p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              👤 Account
            </h2>
            <div className="border-t border-[rgba(45,45,78,0.6)] pt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Email</span>
                <span className="text-white">{userRow?.email ?? authData.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Member since</span>
                <span className="text-white">
                  {userRow?.created_at
                    ? new Date(userRow.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Plan & credits */}
          <div className="bg-card mb-5 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              🪙 Plan & Credits
            </h2>
            <div className="border-t border-[rgba(45,45,78,0.6)] pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display font-bold text-white text-lg">
                    {planDisplayName(userRow?.plan ?? "free")} plan
                  </p>
                  <p className="text-sm text-muted">
                    {userRow?.plan === "free"
                      ? `${userRow?.credits ?? 0} generations remaining`
                      : "Unlimited brand generations + Keep Growing content engine"}
                  </p>
                </div>
                {userRow?.plan === "free" && (
                  <div className="flex gap-2 flex-wrap">
                    <UpgradeButton plan="pro" label="✦ Upgrade to Creator Pro" />
                  </div>
                )}
                {userRow?.plan !== "free" && (
                  <span className="badge-green">Active</span>
                )}
              </div>
            </div>
          </div>

          {/* Session */}
          <div className="bg-card p-6">
            <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              🚪 Session
            </h2>
            <LogoutButton />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

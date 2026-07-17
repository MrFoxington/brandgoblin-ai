import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LabsHub from "@/components/labs/LabsHub";

// 🧪 GOBLIN LABS — Nix's laboratory, where future magic is forged.
// Phase 0c shell (July 17 2026, docs/GOBLIN_LABS_VIDEO_PLAN_JULY_2026.md).
//
// FOUNDER PREVIEW GATE: Fox-only while experiments come online (the Wow Plan
// taste-test pattern — nothing goes public before the founder quality pass).
// TO OPEN LABS TO EVERYONE: delete the ADMIN_EMAIL check below — Labs is
// designed energy-gated like Studio, so that one deletion is the whole launch.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "jopro@hotmail.com";

export default async function LabsPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // Founder preview gate — remove to launch Labs publicly.
  if (authData.user.email !== ADMIN_EMAIL) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <LabsHub />
        </div>
      </main>
      <Footer />
    </div>
  );
}

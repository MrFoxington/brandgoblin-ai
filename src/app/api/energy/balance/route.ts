import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserEnergyBalance } from "@/lib/energy";
import { getEffectivePlan } from "@/lib/access";
import { ENERGY_CONFIG, getEnergyWarningLevel, getCapacityEstimates } from "@/lib/energy-config";

export async function GET() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("plan, is_trial, trial_ends_at")
    .eq("id", authData.user.id)
    .single();

  const isPro   = !!userRow && getEffectivePlan(userRow) === "pro";
  const balance = await getUserEnergyBalance(authData.user.id);

  // Free users without any energy — show the empty/upsell state.
  if (!balance || (!isPro && balance.totalRemaining <= 0)) {
    if (isPro) {
      // Pro user without an initialized energy row yet — full shape with safe defaults.
      return NextResponse.json({
        plan:             "pro",
        monthlyTotal:     0,
        monthlyRemaining: 0,
        refillRemaining:  0,
        totalRemaining:   0,
        monthlyAllowance: ENERGY_CONFIG.MONTHLY_ALLOWANCE,
        percentRemaining: 0,
        warningLevel:     null,
        estimates:        [],
        periodEnd:        null,
        uninitialized:    true,
      });
    }
    return NextResponse.json({ plan: "free", totalRemaining: 0 });
  }

  // Bar denominator: Pro uses the monthly allowance; free uses its own granted
  // total (starter + any top-ups) so the gauge reads sensibly on the free tier.
  const allowance = isPro
    ? ENERGY_CONFIG.MONTHLY_ALLOWANCE
    : Math.max(balance.monthlyTotal + balance.refillTotal, balance.totalRemaining, 1);

  const warningLevel = getEnergyWarningLevel(balance.totalRemaining, allowance);
  const estimates    = getCapacityEstimates(balance.totalRemaining);

  return NextResponse.json({
    plan:             isPro ? "pro" : "free",
    monthlyTotal:     balance.monthlyTotal,
    monthlyRemaining: balance.monthlyRemaining,
    refillRemaining:  balance.refillRemaining,
    totalRemaining:   balance.totalRemaining,
    monthlyAllowance: allowance,
    percentRemaining: Math.round((balance.totalRemaining / allowance) * 100),
    warningLevel,
    estimates,
    periodEnd:        isPro ? balance.periodEnd : null,
  });
}

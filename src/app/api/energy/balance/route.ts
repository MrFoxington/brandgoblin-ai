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

  if (!userRow || getEffectivePlan(userRow) === "free") {
    return NextResponse.json({ plan: "free", totalRemaining: 0 });
  }

  const balance = await getUserEnergyBalance(authData.user.id);

  if (!balance) {
    // Pro user without an initialized energy row yet — return the FULL shape with
    // safe defaults so the dashboard never reads an undefined field (e.g. .toLocaleString()).
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

  const warningLevel = getEnergyWarningLevel(balance.totalRemaining, ENERGY_CONFIG.MONTHLY_ALLOWANCE);
  const estimates    = getCapacityEstimates(balance.totalRemaining);

  return NextResponse.json({
    plan:             "pro",
    monthlyTotal:     balance.monthlyTotal,
    monthlyRemaining: balance.monthlyRemaining,
    refillRemaining:  balance.refillRemaining,
    totalRemaining:   balance.totalRemaining,
    monthlyAllowance: ENERGY_CONFIG.MONTHLY_ALLOWANCE,
    percentRemaining: Math.round((balance.totalRemaining / ENERGY_CONFIG.MONTHLY_ALLOWANCE) * 100),
    warningLevel,
    estimates,
    periodEnd:        balance.periodEnd,
  });
}

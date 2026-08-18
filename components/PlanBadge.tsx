"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

const PLANS: Record<string, { label: string; bg: string; color: string }> = {
  starter: { label: "Invest.", bg: "#C95B2A", color: "#F5F0E8" },
  pro:     { label: "Pro",    bg: "#1A7A52", color: "#F5F0E8" },
};

export function usePlan(): { plan: string | null; isLoading: boolean } {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setPlan(typeof window !== "undefined" ? localStorage.getItem("lmnp_plan") : null);
      setIsLoading(false);
      return;
    }
    supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setPlan(typeof window !== "undefined" ? localStorage.getItem("lmnp_plan") : null);
        } else {
          setPlan(data.plan);
          if (typeof window !== "undefined") localStorage.setItem("lmnp_plan", data.plan);
        }
        setIsLoading(false);
      });
  }, [user, isLoaded]);

  return { plan, isLoading };
}

/** Small inline badge for the header button */
export function PlanBadgeInline() {
  const { plan } = usePlan();
  if (!plan || !PLANS[plan]) return null;
  const { label, bg, color } = PLANS[plan];
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-1"
      style={{ background: bg, color, letterSpacing: "0.02em", verticalAlign: "middle" }}
    >
      {label}
    </span>
  );
}

/** Larger banner for the dashboard page */
export function PlanBanner() {
  const { plan } = usePlan();
  if (!plan || !PLANS[plan]) return null;
  const { label, bg, color } = PLANS[plan];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 mb-8 text-sm font-medium"
      style={{ background: bg, color }}
    >
      <span>✓</span>
      <span>
        Abonnement <strong>{label === "Pro" ? "Pro" : "Investisseur"}</strong> actif — simulations illimitées
        {label === "Pro" ? " · PDF illimités" : ""}
      </span>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Après un paiement Stripe réussi, met à jour lmnp_plan dans localStorage
// selon le price ID reçu via query param (ou mode détecté depuis la session)
// Pour l'instant on détecte via le referrer / query param 'plan'
export default function MerciPlanSetter() {
  const params = useSearchParams();

  useEffect(() => {
    const plan = params.get("plan");
    if (plan === "starter" || plan === "investisseur") {
      localStorage.setItem("lmnp_plan", "starter");
    } else if (plan === "pro") {
      localStorage.setItem("lmnp_plan", "pro");
    }
    // Pour le rapport à l'unité (1,99€) : pas de mise à jour du plan
  }, [params]);

  return null;
}

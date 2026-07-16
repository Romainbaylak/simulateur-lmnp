"use client";

import { useState } from "react";
import type { SimulationData } from "./computeResultats";

interface CheckoutOptions {
  priceId: string;
  mode: "payment" | "subscription";
  userId?: string;
  plan?: string;
  simulationData?: SimulationData;
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async ({ priceId, mode, userId, plan, simulationData }: CheckoutOptions) => {
    setLoading(true);
    setError(null);
    try {
      // Save simulation data to sessionStorage before leaving the page
      if (simulationData) {
        sessionStorage.setItem("lmnp_simulation_data", JSON.stringify({
          ...simulationData,
          savedAt: Date.now(),
        }));
      }

      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode, userId, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erreur inattendue");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
      setLoading(false);
    }
  };

  return { redirectToCheckout, loading, error };
}

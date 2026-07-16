"use client";

import { useState } from "react";

interface CheckoutOptions {
  priceId: string;
  mode: "payment" | "subscription";
  userId?: string;
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async ({ priceId, mode, userId }: CheckoutOptions) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode, userId }),
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

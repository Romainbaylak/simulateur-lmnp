"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useStripeCheckout } from "@/lib/useStripeCheckout";
import { useEffect, useRef } from "react";

// ⚠️  Remplace ces IDs par les nouveaux price IDs créés dans le tableau Stripe
const PRICE_INVESTISSEUR = "price_1Ttn8vRkmRCKEt1coHEDX2yS"; // TODO: remplacer par le price 7,99 €/mois
const PRICE_PRO          = "price_1Ttn9rRkmRCKEt1cfdcRt1f7"; // TODO: remplacer par le price 24,99 €/mois
const PRICE_PRO_PLUS     = "price_REPLACE_WITH_PROPLUS_ID";   // TODO: remplacer par le price 149,99 €/mois

// clé sessionStorage pour mémoriser l'abonnement visé avant connexion
const PENDING_KEY = "lmnp_pending_checkout";

function SubscribeButton({
  priceId,
  plan,
  label,
  style,
  errorStyle,
}: {
  priceId: string;
  plan: string;
  label: string;
  style: React.CSSProperties;
  errorStyle?: React.CSSProperties;
}) {
  const { isSignedIn, user } = useUser();
  const { redirectToCheckout, loading, error } = useStripeCheckout();
  const triggered = useRef(false);

  // Après connexion : déclencher le checkout si cet abonnement était en attente
  useEffect(() => {
    if (!isSignedIn || !user || triggered.current) return;
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw);
      if (pending.priceId !== priceId) return;
      triggered.current = true;
      sessionStorage.removeItem(PENDING_KEY);
      redirectToCheckout({ priceId, mode: "subscription", userId: user.id, plan });
    } catch {
      sessionStorage.removeItem(PENDING_KEY);
    }
  }, [isSignedIn, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    redirectToCheckout({ priceId, mode: "subscription", userId: user?.id, plan });
  };

  // Mémoriser le plan visé AVANT d'ouvrir le modal Clerk
  const savePending = () => {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ priceId, plan }));
  };

  if (!isSignedIn) {
    return (
      <SignInButton
        mode="modal"
        // fallback si Clerk redirige la page pendant la vérification par mail
        fallbackRedirectUrl="/tarifs"
        signUpFallbackRedirectUrl="/tarifs"
      >
        <button
          onClick={savePending}
          className="block w-full text-center py-3 rounded font-medium transition-opacity hover:opacity-[0.88]"
          style={{ ...style, borderRadius: 6 }}
        >
          {label}
        </button>
      </SignInButton>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="block w-full text-center py-3 rounded font-medium transition-opacity hover:opacity-[0.88] disabled:opacity-60"
        style={{ ...style, borderRadius: 6 }}
      >
        {loading ? "Redirection vers le paiement…" : label}
      </button>
      {error && (
        <p className="text-xs text-center mt-2" style={{ color: "#B03A2A", ...errorStyle }}>
          {error}
        </p>
      )}
    </>
  );
}

export function InvestisseurButton() {
  return (
    <SubscribeButton
      priceId={PRICE_INVESTISSEUR}
      plan="starter"
      label="Commencer — 7,99 €/mois"
      style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
    />
  );
}

export function ProButton() {
  return (
    <SubscribeButton
      priceId={PRICE_PRO}
      plan="pro"
      label="Passer Pro — 24,99 €/mois"
      style={{ backgroundColor: "#F5F0E8", color: "#1A1612" }}
      errorStyle={{ color: "#C95B2A" }}
    />
  );
}

export function ProPlusButton() {
  return (
    <SubscribeButton
      priceId={PRICE_PRO_PLUS}
      plan="pro_plus"
      label="Accès Pro+ — 149,99 €/mois"
      style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
      errorStyle={{ color: "rgba(245,240,232,0.6)" }}
    />
  );
}

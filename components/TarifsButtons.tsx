"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useStripeCheckout } from "@/lib/useStripeCheckout";

const PRICE_INVESTISSEUR = "price_1Ttn8vRkmRCKEt1coHEDX2yS";
const PRICE_PRO = "price_1Ttn9rRkmRCKEt1cfdcRt1f7";

function SubscribeButton({
  priceId,
  label,
  style,
  errorStyle,
}: {
  priceId: string;
  label: string;
  style: React.CSSProperties;
  errorStyle?: React.CSSProperties;
}) {
  const { isSignedIn, user } = useUser();
  const { redirectToCheckout, loading, error } = useStripeCheckout();

  const handleClick = () => {
    redirectToCheckout({
      priceId,
      mode: "subscription",
      userId: user?.id,
    });
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
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
        {loading ? "Redirection…" : label}
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
      label="Commencer — 4,99 €/mois"
      style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
    />
  );
}

export function ProButton() {
  return (
    <SubscribeButton
      priceId={PRICE_PRO}
      label="Passer Pro — 12,99 €/mois"
      style={{ backgroundColor: "#F5F0E8", color: "#1A1612" }}
      errorStyle={{ color: "#C95B2A" }}
    />
  );
}

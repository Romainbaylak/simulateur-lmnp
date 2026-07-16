"use client";
import Link from "next/link";
import { useStripeCheckout } from "@/lib/useStripeCheckout";
import type { SimulationData } from "@/lib/computeResultats";

const PRICE_RAPPORT = "price_1TtnAdRkmRCKEt1c3M6Nnvu1";

interface Props {
  onClose: () => void;
  simulationData?: SimulationData;
}

export default function PopupPaiementUnite({ onClose, simulationData }: Props) {
  const { redirectToCheckout, loading, error } = useStripeCheckout();

  const handlePay = () => {
    redirectToCheckout({
      priceId: PRICE_RAPPORT,
      mode: "payment",
      simulationData,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ background: "rgba(26,22,18,0.08)", color: "#1A1612", fontSize: 16 }}
        >×</button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-medium text-xl mb-1" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
            Débloquer ce rapport
          </h2>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
            Accès complet au tableau d&apos;amortissement et export PDF
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-6 py-4 rounded-xl" style={{ background: "rgba(201,91,42,0.07)", border: "0.5px solid rgba(201,91,42,0.18)" }}>
          <div className="text-5xl font-light mb-1" style={{ color: "#C95B2A", letterSpacing: "-0.04em" }}>1,99 €</div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "rgba(26,22,18,0.4)" }}>paiement unique</div>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {[
            "Tableau d'amortissement par composants",
            "Export PDF du rapport complet",
            "Valable pour cette simulation uniquement",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(26,22,18,0.75)" }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                style={{ background: "rgba(201,91,42,0.15)", color: "#C95B2A" }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] disabled:opacity-60 mb-3"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
        >
          {loading ? "Redirection…" : "Payer 1,99 € et télécharger"}
        </button>

        {error && (
          <p className="text-xs text-center mb-3" style={{ color: "#B03A2A" }}>{error}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ background: "rgba(26,22,18,0.1)" }} />
          <span className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>ou</span>
          <div className="flex-1 h-px" style={{ background: "rgba(26,22,18,0.1)" }} />
        </div>

        {/* Subscription link */}
        <div className="text-center">
          <Link
            href="/tarifs"
            onClick={onClose}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "#C95B2A" }}
          >
            Voir les abonnements →
          </Link>
        </div>
      </div>
    </div>
  );
}

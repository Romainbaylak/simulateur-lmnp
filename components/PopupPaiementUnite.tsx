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

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {[
            "7 pages d'étude et de développement du projet",
            "Tableau d'emprunt & d'amortissement",
            "Export PDF du rapport complet",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(26,22,18,0.75)" }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                style={{ background: "rgba(201,91,42,0.15)", color: "#C95B2A" }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA paiement unique */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-[0.88] disabled:opacity-60 mb-3"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
        >
          {loading ? "Redirection…" : (
            <>
              <div>Payer 1,99 €</div>
              <div className="text-xs font-normal opacity-80 mt-0.5">paiement unique · accès immédiat</div>
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-center mb-3" style={{ color: "#B03A2A" }}>{error}</p>
        )}

        {/* CTA abonnement */}
        <Link
          href="/tarifs"
          onClick={onClose}
          className="w-full py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-[0.88] flex flex-col items-center"
          style={{ backgroundColor: "#1A1612", color: "#F5F0E8", display: "flex" }}
        >
          <span>Abonnement à partir de 4,99 €</span>
          <span className="text-xs font-normal opacity-60 mt-0.5">simulations illimitées + PDF inclus</span>
        </Link>
      </div>
    </div>
  );
}

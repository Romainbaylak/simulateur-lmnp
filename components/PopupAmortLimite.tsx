"use client";
import Link from "next/link";

interface Props {
  onClose: () => void;
}

export default function PopupAmortLimite({ onClose }: Props) {
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ background: "rgba(26,22,18,0.08)", color: "#1A1612", fontSize: 16 }}
        >×</button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl"
            style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A" }}>🔒</div>
          <h2 className="font-medium text-xl mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
            Limite quotidienne atteinte
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.6)" }}>
            Vous avez utilisé votre simulation d&apos;amortissement gratuite aujourd&apos;hui.
            Revenez demain ou débloquez l&apos;accès illimité.
          </p>
        </div>

        <Link
          href="/tarifs"
          className="block w-full text-center py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
          onClick={onClose}
        >
          Voir les offres — dès 4,99 €/mois
        </Link>

        <button
          onClick={onClose}
          className="block w-full text-center py-3 rounded-lg text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(26,22,18,0.5)", border: "0.5px solid rgba(26,22,18,0.15)" }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

interface Props {
  onGenerate: () => void;
  onClose: () => void;
  onPayUnit: () => void;
  weekCount: number;
}

export const PDF_WEEK_LIMIT = 5;

export default function PopupPDFStarter({ onGenerate, onClose, onPayUnit, weekCount }: Props) {
  const remaining = Math.max(0, PDF_WEEK_LIMIT - weekCount);

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
            style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A" }}>📄</div>
          <h2 className="font-medium text-xl mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
            Générer votre rapport PDF
          </h2>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
            Inclus dans votre abonnement Investisseur
          </p>
        </div>

        <div className="rounded-xl py-4 px-5 mb-6 text-center"
          style={{ background: "rgba(201,91,42,0.07)", border: "0.5px solid rgba(201,91,42,0.18)" }}>
          <div className="text-2xl font-light mb-0.5" style={{ color: "#C95B2A" }}>
            {remaining} / {PDF_WEEK_LIMIT}
          </div>
          <div className="text-xs" style={{ color: "rgba(26,22,18,0.45)" }}>
            exports PDF restants cette semaine
          </div>
        </div>

        {remaining > 0 ? (
          <button
            onClick={onGenerate}
            className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
          >
            Générer le PDF
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center mb-4" style={{ color: "rgba(26,22,18,0.55)" }}>
              Quota hebdomadaire atteint. Revenez lundi, payez à l&apos;unité ou passez au plan Pro.
            </p>
            <button
              onClick={() => { onClose(); onPayUnit(); }}
              className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] flex items-center justify-center gap-2"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
            >
              <span>Générer ce rapport — 1,99 €</span>
            </button>
            <Link
              href="/tarifs"
              onClick={onClose}
              className="block w-full py-3 text-center rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88]"
              style={{ background: "#1A1612", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.3)" }}
            >
              Passer au plan Pro — illimité →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

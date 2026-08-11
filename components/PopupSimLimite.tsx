"use client";

import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

interface Props {
  isSignedIn: boolean;
  onClose: () => void;
  onAccountBonus: () => void;
}

export default function PopupSimLimite({ isSignedIn, onClose, onAccountBonus }: Props) {
  const bonusAlreadyUsed =
    typeof window !== "undefined" &&
    (!!localStorage.getItem("lmnp_account_bonus_used") || !!localStorage.getItem("lmnp_bonus_pending"));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 64px rgba(26,22,18,0.22)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl leading-none transition-opacity hover:opacity-50"
          style={{ color: "rgba(26,22,18,0.4)", background: "none", border: "none", cursor: "pointer" }}
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-1" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
            Limite atteinte pour aujourd&apos;hui
          </h2>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
            Choisissez comment continuer à simuler.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">

          {/* Option 1 — Inscription */}
          {!isSignedIn && !bonusAlreadyUsed && (
            <SignUpButton mode="modal" fallbackRedirectUrl="/">
              <button
                onClick={onAccountBonus}
                className="w-full text-left rounded-xl px-5 py-4 transition-opacity hover:opacity-[0.88]"
                style={{ background: "#C95B2A", color: "#F5F0E8" }}
              >
                <div className="font-semibold text-sm leading-snug mb-1">
                  Débloque des simulations supplémentaires en t&apos;inscrivant
                </div>
                <div className="text-base font-bold">
                  S&apos;inscrire gratuitement →
                </div>
              </button>
            </SignUpButton>
          )}

          {/* Option 2 — Abonnement */}
          <Link
            href="/tarifs"
            onClick={onClose}
            className="w-full text-left rounded-xl px-5 py-4 transition-opacity hover:opacity-[0.88]"
            style={{ background: "#4E1F12", color: "#F5F0E8", display: "block" }}
          >
            <div className="font-semibold text-sm leading-snug mb-1">
              Abonnez-vous pour des simulations illimitées et accès aux rapports PDF
            </div>
            <div className="text-base font-bold">
              À partir de 4,99 €/mois →
            </div>
          </Link>

          {/* Option 3 — Attendre */}
          {!isSignedIn && (
            <div
              className="w-full text-left rounded-xl px-5 py-4"
              style={{ background: "#EDE7DC", color: "#1A1612" }}
            >
              <div className="font-semibold text-sm leading-snug mb-1">
                Attendez demain
              </div>
              <div className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
                Votre compteur se remet à zéro chaque jour à minuit.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

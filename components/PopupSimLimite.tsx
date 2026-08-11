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
        className="w-full max-w-md rounded-2xl p-8 relative"
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
        <div className="text-center mb-6">
          <div className="text-3xl mb-3">⏳</div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
            Débloquer plus de simulations
          </h2>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
            Vous avez atteint votre limite de simulations pour aujourd&apos;hui.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">

          {/* Option 1 — Créer un compte (non connecté uniquement) */}
          {!isSignedIn && !bonusAlreadyUsed && (
            <div className="rounded-xl p-4" style={{ background: "#EDE7DC", border: "1px solid rgba(26,22,18,0.1)" }}>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🎁</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-0.5" style={{ color: "#1A1612" }}>
                    Créez un compte — bonus unique
                  </div>
                  <div className="text-xs mb-3" style={{ color: "rgba(26,22,18,0.5)" }}>
                    Débloquez 6 simulations supplémentaires aujourd&apos;hui. Offre unique, une fois par compte.
                  </div>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/">
                    <button
                      onClick={onAccountBonus}
                      className="w-full py-2.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-[0.88]"
                      style={{ background: "#C95B2A", color: "#F5F0E8" }}
                    >
                      S&apos;inscrire gratuitement →
                    </button>
                  </SignUpButton>
                </div>
              </div>
            </div>
          )}

          {/* Option 2 — Abonnement */}
          <div className="rounded-xl p-4" style={{ background: "#EDE7DC", border: "1px solid rgba(26,22,18,0.1)" }}>
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">🚀</span>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-0.5" style={{ color: "#1A1612" }}>
                  Abonnez-vous — simulations illimitées
                </div>
                <div className="text-xs mb-3" style={{ color: "rgba(26,22,18,0.5)" }}>
                  Simulez sans limite, sauvegardez jusqu&apos;à 10 simulations et accédez aux rapports PDF.
                </div>
                <Link
                  href="/tarifs"
                  onClick={onClose}
                  className="block w-full py-2.5 text-sm font-medium text-center rounded-lg transition-opacity hover:opacity-[0.88]"
                  style={{ background: "#4E1F12", color: "#F5F0E8" }}
                >
                  À partir de 4,99 €/mois →
                </Link>
              </div>
            </div>
          </div>

          {/* Option 3 — Attendre (non connecté uniquement) */}
          {!isSignedIn && (
            <div className="rounded-xl p-4" style={{ background: "#EDE7DC", border: "1px solid rgba(26,22,18,0.1)" }}>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🌙</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-0.5" style={{ color: "#1A1612" }}>
                    Attendez demain
                  </div>
                  <div className="text-xs" style={{ color: "rgba(26,22,18,0.5)" }}>
                    Votre compteur se remet à zéro chaque jour à minuit.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

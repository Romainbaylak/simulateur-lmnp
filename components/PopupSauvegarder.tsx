"use client";

import { useState } from "react";
import Link from "next/link";

interface SavedSimulation {
  name: string;
  data: object;
  savedAt: number;
}

export function getSavedSimulations(): SavedSimulation[] {
  try {
    return JSON.parse(localStorage.getItem("lmnp_saved_simulations") ?? "[]");
  } catch { return []; }
}

interface Props {
  isPro: boolean;
  simulationData: object;
  onClose: () => void;
  onSaved: () => void;
}

export default function PopupSauvegarder({ isPro, simulationData, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const existing = getSavedSimulations();
    const updated: SavedSimulation[] = [
      { name: name.trim(), data: simulationData, savedAt: Date.now() },
      ...existing.filter(s => s.name !== name.trim()),
    ].slice(0, isPro ? 100 : 6);
    localStorage.setItem("lmnp_saved_simulations", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl p-8"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-lg leading-none transition-opacity hover:opacity-50"
          style={{ color: "rgba(26,22,18,0.35)" }}>✕</button>

        {isPro ? (
          saved ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">✓</div>
              <p className="font-medium" style={{ color: "#228B22" }}>Simulation sauvegardée !</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 18 }}>💾</div>
                <div>
                  <h2 className="font-medium text-lg" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
                    Sauvegarder la simulation
                  </h2>
                  <p className="text-xs" style={{ color: "rgba(26,22,18,0.45)" }}>
                    {isPro ? "Sauvegarde illimitée" : "Jusqu'à 6 simulations"}
                  </p>
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5"
                  style={{ color: "rgba(26,22,18,0.45)" }}>Nom de la simulation</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex : Appart Lyon T2 — rue de la Paix"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                  className="w-full px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
                  style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.15)", color: "#1A1612" }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] disabled:opacity-40"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              >
                Sauvegarder
              </button>
            </>
          )
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 22 }}>🔒</div>
              <h2 className="font-medium text-lg mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
                Fonctionnalité réservée aux abonnés
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                Sauvegardez et retrouvez vos simulations à tout moment avec un abonnement Investisseur ou Pro.
              </p>
            </div>
            <Link
              href="/tarifs"
              className="block w-full py-3 text-center rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              onClick={onClose}
            >
              Voir les abonnements →
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}
            >
              Plus tard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

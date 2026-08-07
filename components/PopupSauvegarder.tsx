"use client";

import { useState } from "react";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

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

const FREE_KEY = "lmnp_free_save_used";

const FIELD = "w-full px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const FIELD_STYLE = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.15)", color: "#1A1612" };
const LBL = "block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5";
const LBL_STYLE = { color: "rgba(26,22,18,0.45)" };

interface Props {
  isPro: boolean;
  isSignedIn: boolean;
  simulationData: object;
  onClose: () => void;
  onSaved: () => void;
}

export default function PopupSauvegarder({ isPro, isSignedIn, simulationData, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"ap" | "ma">("ap");
  const [ville, setVille] = useState("");
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  const freeSaveUsed = typeof window !== "undefined" && !!localStorage.getItem(FREE_KEY);

  const handleSave = (maxSlots: number) => {
    if (!name.trim()) return;
    const bienInfo = { type, ville: ville.trim(), surface: surface.trim(), description: description.trim() };
    const dataWithBien = { ...(simulationData as object), bienInfo };
    const existing = getSavedSimulations();
    const updated: SavedSimulation[] = [
      { name: name.trim(), data: dataWithBien, savedAt: Date.now() },
      ...existing.filter(s => s.name !== name.trim()),
    ].slice(0, maxSlots);
    localStorage.setItem("lmnp_saved_simulations", JSON.stringify(updated));
    if (maxSlots === 1) localStorage.setItem(FREE_KEY, "1");
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 900);
  };

  // ── Shared form UI ────────────────────────────────────────────────
  const SaveForm = ({ maxSlots, subtitle }: { maxSlots: number; subtitle: string }) =>
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
            <p className="text-xs" style={{ color: "rgba(26,22,18,0.45)" }}>{subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className={LBL} style={LBL_STYLE}>Nom de la simulation *</label>
            <input
              autoFocus
              type="text"
              placeholder="Ex : Appart Lyon T2 — rue de la Paix"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(maxSlots); }}
              className={FIELD}
              style={FIELD_STYLE}
            />
          </div>

          <div className="pt-1" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
            <p className="text-[10px] uppercase tracking-[0.12em] mb-3 font-medium" style={{ color: "rgba(26,22,18,0.35)" }}>
              Infos sur le bien (optionnel)
            </p>
            <div className="mb-3">
              <label className={LBL} style={LBL_STYLE}>Type de bien</label>
              <div className="flex rounded-md overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.15)", width: "fit-content" }}>
                {(["ap", "ma"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="px-4 py-1.5 text-sm font-medium transition-colors"
                    style={{ background: type === t ? "#1A1612" : "#EDE7DC", color: type === t ? "#F5F0E8" : "rgba(26,22,18,0.55)" }}>
                    {t === "ap" ? "Appartement" : "Maison"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className={LBL} style={LBL_STYLE}>Ville</label>
              <input type="text" value={ville} onChange={e => setVille(e.target.value)}
                placeholder="Ex : Lyon, Paris…" className={FIELD} style={FIELD_STYLE} />
            </div>
            <div className="mb-3">
              <label className={LBL} style={LBL_STYLE}>Surface (m²)</label>
              <input type="number" value={surface} onChange={e => setSurface(e.target.value)}
                placeholder="Ex : 45" className={FIELD} style={FIELD_STYLE} />
            </div>
            <div>
              <label className={LBL} style={LBL_STYLE}>Description / Commentaires</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Notes, remarques, contexte…" rows={2}
                className={`${FIELD} resize-none`} style={FIELD_STYLE} />
            </div>
          </div>
        </div>

        <button
          onClick={() => handleSave(maxSlots)}
          disabled={!name.trim()}
          className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] disabled:opacity-40"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
        >
          Sauvegarder
        </button>
      </>
    );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl p-8"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-lg leading-none transition-opacity hover:opacity-50"
          style={{ color: "rgba(26,22,18,0.35)" }}>✕</button>

        {/* ── 1. Non connecté → créer un compte ── */}
        {!isSignedIn ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 22 }}>💾</div>
              <h2 className="font-medium text-lg mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
                Sauvegarde ta simulation
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                Crée un compte gratuit pour sauvegarder 1 simulation et la retrouver à tout moment.
              </p>
            </div>
            <SignUpButton mode="modal" afterSignUpUrl={typeof window !== "undefined" ? window.location.href : "/"}>
              <button
                className="block w-full py-3 text-center rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
                onClick={onClose}
              >
                Créer un compte gratuit →
              </button>
            </SignUpButton>
            <button onClick={onClose}
              className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}>
              Plus tard
            </button>
          </>
        ) : isPro ? (
          /* ── 2. Abonné Starter / Pro ── */
          <SaveForm maxSlots={isPro ? 100 : 6} subtitle={isPro ? "Sauvegarde illimitée" : "Jusqu'à 6 simulations"} />
        ) : freeSaveUsed ? (
          /* ── 3. Connecté sans abonnement, quota 1 déjà utilisé → upsell ── */
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 22 }}>🔒</div>
              <h2 className="font-medium text-lg mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
                Tu as utilisé ta sauvegarde gratuite
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                Passe à un abonnement Investisseur ou Pro pour sauvegarder jusqu'à 6 simulations ou sans limite.
              </p>
            </div>
            <Link href="/tarifs"
              className="block w-full py-3 text-center rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              onClick={onClose}>
              Voir les abonnements →
            </Link>
            <button onClick={onClose}
              className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}>
              Plus tard
            </button>
          </>
        ) : (
          /* ── 4. Connecté sans abonnement, 1 slot gratuit disponible ── */
          <>
            <SaveForm maxSlots={1} subtitle="1 sauvegarde gratuite incluse avec ton compte" />
            {!saved && (
              <p className="text-center text-xs mt-4" style={{ color: "rgba(26,22,18,0.4)" }}>
                Pour plusieurs simulations →{" "}
                <Link href="/tarifs" className="underline" onClick={onClose}>voir les abonnements</Link>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

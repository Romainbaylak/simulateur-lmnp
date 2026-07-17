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

const FIELD = "w-full px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const FIELD_STYLE = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.15)", color: "#1A1612" };
const LBL = "block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5";
const LBL_STYLE = { color: "rgba(26,22,18,0.45)" };

interface Props {
  isPro: boolean;
  simulationData: object;
  onClose: () => void;
  onSaved: () => void;
}

export default function PopupSauvegarder({ isPro, simulationData, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"ap" | "ma">("ap");
  const [ville, setVille] = useState("");
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const bienInfo = { type, ville: ville.trim(), surface: surface.trim(), description: description.trim() };
    const dataWithBien = { ...(simulationData as object), bienInfo };
    const existing = getSavedSimulations();
    const updated: SavedSimulation[] = [
      { name: name.trim(), data: dataWithBien, savedAt: Date.now() },
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
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
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

              <div className="space-y-4 mb-5">
                {/* Nom */}
                <div>
                  <label className={LBL} style={LBL_STYLE}>Nom de la simulation *</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ex : Appart Lyon T2 — rue de la Paix"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                    className={FIELD}
                    style={FIELD_STYLE}
                  />
                </div>

                <div className="pt-1" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
                  <p className="text-[10px] uppercase tracking-[0.12em] mb-3 font-medium" style={{ color: "rgba(26,22,18,0.35)" }}>
                    Infos sur le bien (optionnel)
                  </p>

                  {/* Type */}
                  <div className="mb-3">
                    <label className={LBL} style={LBL_STYLE}>Type de bien</label>
                    <div className="flex rounded-md overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.15)", width: "fit-content" }}>
                      {(["ap", "ma"] as const).map(t => (
                        <button key={t} onClick={() => setType(t)}
                          className="px-4 py-1.5 text-sm font-medium transition-colors"
                          style={{
                            background: type === t ? "#1A1612" : "#EDE7DC",
                            color: type === t ? "#F5F0E8" : "rgba(26,22,18,0.55)",
                          }}>
                          {t === "ap" ? "Appartement" : "Maison"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ville */}
                  <div className="mb-3">
                    <label className={LBL} style={LBL_STYLE}>Ville</label>
                    <input
                      type="text"
                      value={ville}
                      onChange={e => setVille(e.target.value)}
                      placeholder="Ex : Lyon, Paris…"
                      className={FIELD}
                      style={FIELD_STYLE}
                    />
                  </div>

                  {/* Surface */}
                  <div className="mb-3">
                    <label className={LBL} style={LBL_STYLE}>Surface (m²)</label>
                    <input
                      type="number"
                      value={surface}
                      onChange={e => setSurface(e.target.value)}
                      placeholder="Ex : 45"
                      className={FIELD}
                      style={FIELD_STYLE}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={LBL} style={LBL_STYLE}>Description / Commentaires</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Notes, remarques, contexte…"
                      rows={2}
                      className={`${FIELD} resize-none`}
                      style={FIELD_STYLE}
                    />
                  </div>
                </div>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

export interface SavedSimulation {
  name: string;
  data: Record<string, unknown>;
  savedAt: number;
}

export function getSavedSimulations(): SavedSimulation[] {
  try {
    return JSON.parse(localStorage.getItem("lmnp_saved_simulations") ?? "[]");
  } catch { return []; }
}

export type Plan = "free" | "starter" | "pro";
const MAX_SLOTS: Record<Plan, number> = { free: 1, starter: 10, pro: 999 };
const FREE_KEY = "lmnp_free_save_used";

const FIELD = "w-full px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const FIELD_STYLE = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.15)", color: "#1A1612" };
const LBL = "block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5";
const LBL_STYLE = { color: "rgba(26,22,18,0.45)" };

interface Props {
  plan: Plan;
  isSignedIn: boolean;
  simulationData: object;
  onClose: () => void;
  onSaved: () => void;
}

type View = "choice" | "new" | "replace_list" | "success" | "upsell_signup" | "upsell_quota";

function getInitialView(isSignedIn: boolean, plan: Plan): View {
  if (!isSignedIn) return "upsell_signup";
  const existing = getSavedSimulations();
  const freeSaveUsed = !!localStorage.getItem(FREE_KEY);
  if (plan === "free" && freeSaveUsed) return "upsell_quota";
  if (existing.length === 0) return "new";
  return "choice";
}

export default function PopupSauvegarder({ plan, isSignedIn, simulationData, onClose, onSaved }: Props) {
  const [view, setView] = useState<View>(() =>
    typeof window !== "undefined" ? getInitialView(isSignedIn, plan) : "new"
  );
  const [name, setName] = useState("");
  const [type, setType] = useState<"ap" | "ma">("ap");
  const [ville, setVille] = useState("");
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");

  const maxSlots = MAX_SLOTS[plan];
  const slotLabel = plan === "pro" ? "∞" : String(maxSlots);

  const saveNew = () => {
    if (!name.trim()) return;
    const bienInfo = { type, ville: ville.trim(), surface: surface.trim(), description: description.trim() };
    const dataWithBien = { ...(simulationData as object), bienInfo };
    const existing = getSavedSimulations();
    const updated: SavedSimulation[] = [
      { name: name.trim(), data: dataWithBien as Record<string, unknown>, savedAt: Date.now() },
      ...existing.filter(s => s.name !== name.trim()),
    ].slice(0, maxSlots === 999 ? 9999 : maxSlots);
    localStorage.setItem("lmnp_saved_simulations", JSON.stringify(updated));
    if (plan === "free") localStorage.setItem(FREE_KEY, "1");
    setView("success");
    setTimeout(() => { onSaved(); onClose(); }, 1200);
  };

  const saveReplace = (existingName: string) => {
    const bienInfo = { type, ville: ville.trim(), surface: surface.trim(), description: description.trim() };
    const dataWithBien = { ...(simulationData as object), bienInfo };
    const existing = getSavedSimulations();
    const updated = existing.map(s =>
      s.name === existingName
        ? { name: existingName, data: dataWithBien as Record<string, unknown>, savedAt: Date.now() }
        : s
    );
    localStorage.setItem("lmnp_saved_simulations", JSON.stringify(updated));
    setView("success");
    setTimeout(() => { onSaved(); onClose(); }, 1200);
  };

  const handleChooseNew = () => {
    const existing = getSavedSimulations();
    if (existing.length >= maxSlots) { setView("upsell_quota"); return; }
    setView("new");
  };

  const Header = ({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 18 }}>
        {icon ?? "💾"}
      </div>
      <div>
        <h2 className="font-medium text-lg" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>{title}</h2>
        {subtitle && <p className="text-xs" style={{ color: "rgba(26,22,18,0.45)" }}>{subtitle}</p>}
      </div>
    </div>
  );

  const FormFields = () => (
    <div className="space-y-4 mb-5">
      <div>
        <label className={LBL} style={LBL_STYLE}>Nom de la simulation *</label>
        <input autoFocus type="text"
          placeholder="Ex : Appart Lyon T2 — rue de la Paix"
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") saveNew(); }}
          className={FIELD} style={FIELD_STYLE} />
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
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-sm rounded-2xl p-8"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-lg leading-none transition-opacity hover:opacity-50"
          style={{ color: "rgba(26,22,18,0.35)" }}>✕</button>

        {/* ── 1. Non connecté ── */}
        {view === "upsell_signup" && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 22 }}>💾</div>
              <h2 className="font-medium text-lg mb-2" style={{ color: "#4E1F12" }}>Sauvegarde ta simulation</h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                Crée un compte gratuit pour sauvegarder 1 simulation et la retrouver à tout moment.
              </p>
            </div>
            <SignUpButton mode="modal" fallbackRedirectUrl="/">
              <button className="block w-full py-3 text-center rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }} onClick={onClose}>
                Créer un compte gratuit →
              </button>
            </SignUpButton>
            <button onClick={onClose} className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}>Plus tard</button>
          </>
        )}

        {/* ── 2. Choix nouvelle / remplacer ── */}
        {view === "choice" && (() => {
          const existing = getSavedSimulations();
          return (
            <>
              <Header title="Sauvegarder la simulation"
                subtitle={`${existing.length} / ${slotLabel} simulation${existing.length > 1 ? "s" : ""} sauvegardée${existing.length > 1 ? "s" : ""}`} />
              <div className="space-y-3 mb-5">
                <button onClick={handleChooseNew}
                  className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] flex items-center gap-3"
                  style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}>
                  <span style={{ fontSize: 16 }}>+</span>
                  <div className="text-left">
                    <div>Nouvelle sauvegarde</div>
                    {existing.length >= maxSlots && plan !== "pro" && (
                      <div className="text-xs font-normal opacity-75">Quota atteint — passer à Pro</div>
                    )}
                  </div>
                </button>
                <button onClick={() => setView("replace_list")}
                  className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors hover:opacity-80 flex items-center gap-3"
                  style={{ background: "#EDE7DC", color: "#1A1612", border: "0.5px solid rgba(26,22,18,0.15)" }}>
                  <span style={{ fontSize: 16 }}>↺</span>
                  <span>Remplacer une simulation existante</span>
                </button>
              </div>
              {plan !== "pro" && (
                <p className="text-center text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>
                  {existing.length}/{maxSlots} emplacements · <Link href="/tarifs" className="underline" onClick={onClose}>
                    {plan === "free" ? "Passer à Investisseur" : "Passer à Pro"}
                  </Link> pour plus
                </p>
              )}
            </>
          );
        })()}

        {/* ── 3. Formulaire nouvelle sauvegarde ── */}
        {view === "new" && (
          <>
            <Header title="Nouvelle sauvegarde"
              subtitle={plan === "free" ? "1 sauvegarde gratuite incluse" : plan === "starter" ? "Jusqu'à 10 simulations" : "Sauvegarde illimitée"} />
            <FormFields />
            <button onClick={saveNew} disabled={!name.trim()}
              className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] disabled:opacity-40"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}>
              Sauvegarder
            </button>
            {getSavedSimulations().length > 0 && (
              <button onClick={() => setView("choice")} className="w-full py-2 text-sm text-center mt-2 transition-opacity hover:opacity-70"
                style={{ color: "rgba(26,22,18,0.45)" }}>← Retour</button>
            )}
          </>
        )}

        {/* ── 4. Liste des simulations à remplacer ── */}
        {view === "replace_list" && (() => {
          const existing = getSavedSimulations();
          return (
            <>
              <Header icon="↺" title="Remplacer une simulation" subtitle="Sélectionnez celle à écraser avec la nouvelle" />
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {existing.map(sim => {
                  const bi = (sim.data.bienInfo ?? {}) as Record<string, unknown>;
                  const dateStr = new Date(sim.savedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <button key={sim.name} onClick={() => saveReplace(sim.name)}
                      className="w-full text-left rounded-lg p-3 transition-colors hover:opacity-80 group"
                      style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.12)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: "#4E1F12" }}>{sim.name}</div>
                          <div className="text-[11px] mt-0.5 flex items-center gap-2" style={{ color: "rgba(26,22,18,0.45)" }}>
                            <span>{dateStr}</span>
                            {bi.ville && <span>· {bi.ville as string}</span>}
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                          style={{ background: "#B03A2A", color: "#fff" }}>Remplacer</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setView("choice")} className="w-full py-2 text-sm text-center transition-opacity hover:opacity-70"
                style={{ color: "rgba(26,22,18,0.45)" }}>← Retour</button>
            </>
          );
        })()}

        {/* ── 5. Quota atteint → upsell ── */}
        {view === "upsell_quota" && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A", fontSize: 22 }}>🔒</div>
              <h2 className="font-medium text-lg mb-2" style={{ color: "#4E1F12" }}>
                {plan === "free" ? "Sauvegarde gratuite utilisée" : "Quota de sauvegardes atteint"}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                {plan === "free"
                  ? "Passe à Investisseur pour 10 sauvegardes, ou Pro pour des sauvegardes illimitées."
                  : "Passe au plan Pro pour sauvegarder un nombre illimité de simulations."}
              </p>
            </div>
            <Link href="/tarifs"
              className="block w-full py-3 text-center rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }} onClick={onClose}>
              Voir les abonnements →
            </Link>
            <button onClick={() => setView("replace_list")}
              className="w-full py-2.5 text-sm text-center font-medium transition-opacity hover:opacity-80 mb-2 rounded-lg"
              style={{ background: "#EDE7DC", color: "#1A1612", border: "0.5px solid rgba(26,22,18,0.12)" }}>
              ↺ Remplacer une simulation existante
            </button>
            <button onClick={onClose} className="w-full py-2 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}>Plus tard</button>
          </>
        )}

        {/* ── 6. Succès ── */}
        {view === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(34,139,34,0.1)", fontSize: 30 }}>✓</div>
            <p className="font-semibold text-lg" style={{ color: "#228B22" }}>Simulation sauvegardée !</p>
            <p className="text-sm mt-2" style={{ color: "rgba(26,22,18,0.5)" }}>
              Retrouvez-la dans{" "}
              <Link href="/dashboard" className="underline" style={{ color: "#C95B2A" }} onClick={onClose}>
                Mes simulations
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

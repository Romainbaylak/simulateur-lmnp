"use client";

import { useState } from "react";

export interface BienInfo {
  type: "ap" | "ma" | "im";
  ville: string;
  surface: string;
  pieces: string;
  description: string;
}

export const defaultBienInfo: BienInfo = { type: "ap", ville: "", surface: "", pieces: "", description: "" };

interface Props {
  initial: BienInfo;
  onConfirm: (info: BienInfo) => void;
  onClose: () => void;
  ctaLabel?: string;
}

const FIELD = "w-full px-3 py-2.5 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const FIELD_STYLE = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.15)", color: "#1A1612" };
const LBL = "block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5";
const LBL_STYLE = { color: "rgba(26,22,18,0.45)" };

const TYPES: { id: "ap" | "ma" | "im"; label: string }[] = [
  { id: "ap", label: "Appartement" },
  { id: "ma", label: "Maison" },
  { id: "im", label: "Immeuble" },
];

export default function PopupBienInfo({ initial, onConfirm, onClose, ctaLabel = "Continuer vers le PDF" }: Props) {
  const [type, setType] = useState<"ap" | "ma" | "im">(initial.type ?? "ap");
  const [ville, setVille] = useState(initial.ville);
  const [surface, setSurface] = useState(initial.surface);
  const [description, setDescription] = useState(initial.description);

  const confirm = () => onConfirm({ type, ville, surface, pieces: "", description });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,22,18,0.55)", backdropFilter: "blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ background: "rgba(26,22,18,0.08)", color: "#1A1612", fontSize: 16 }}
        >×</button>

        <div className="mb-6">
          <h2 className="font-medium text-xl mb-1" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
            Complète ces informations sur ton bien
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(26,22,18,0.45)" }}>
            Non obligatoire
          </p>
        </div>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className={LBL} style={LBL_STYLE}>Type de bien</label>
            <div className="flex rounded-md overflow-hidden w-full" style={{ border: "0.5px solid rgba(26,22,18,0.15)" }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className="flex-1 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: type === t.id ? "#1A1612" : "#EDE7DC",
                    color: type === t.id ? "#F5F0E8" : "rgba(26,22,18,0.55)",
                    borderRight: t.id !== "im" ? "0.5px solid rgba(26,22,18,0.15)" : "none",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className={LBL} style={LBL_STYLE}>Ville</label>
            <input
              type="text"
              value={ville}
              onChange={e => setVille(e.target.value)}
              placeholder="Ex : Lyon, Paris, Bordeaux…"
              className={FIELD}
              style={FIELD_STYLE}
            />
          </div>

          {/* Surface */}
          <div>
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
              placeholder="Notes, remarques, contexte de l'investissement…"
              rows={3}
              className={`${FIELD} resize-none`}
              style={FIELD_STYLE}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={confirm}
            className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

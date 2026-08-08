"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedSimulations, type SavedSimulation } from "./PopupSauvegarder";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function fE(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n ?? 0);
}

function openSimulation(sim: SavedSimulation) {
  const data = sim.data as Record<string, unknown>;
  sessionStorage.setItem("lmnp_form_draft", JSON.stringify({
    form: data.form,
    isSaisonnier: data.isSaisonnier,
    prixNuitee: data.prixNuitee,
    tauxOccBas: data.tauxOccBas,
    tauxOccMoyen: data.tauxOccMoyen,
    tauxOccHaut: data.tauxOccHaut,
    amortPct: data.amortPct,
    amortMode: data.amortMode,
    amortDureeEnsemble: data.amortDureeEnsemble,
    amortDureeMobilier: data.amortDureeMobilier,
    amortDureeTravaux: data.amortDureeTravaux,
    amortDureeNotaire: data.amortDureeNotaire,
    composants: data.composants,
    selectedRegime: data.selectedRegime,
  }));
  sessionStorage.setItem("lmnp_simulation_data", JSON.stringify({ ...data, savedAt: Date.now() }));
  window.location.href = `/rapport?session_id=saved_${Date.now()}`;
}

function SimulationCard({ sim, onDelete }: { sim: SavedSimulation; onDelete: () => void }) {
  const data = sim.data as Record<string, unknown>;
  const form = (data.form ?? {}) as Record<string, unknown>;
  const isSaisonnier = !!data.isSaisonnier;

  const prix = Number(form.prix ?? 0);
  const apport = Number(form.apport ?? 0);
  const loyerMensuel = Number(form.loyerMensuel ?? 0);
  const prixNuitee = Number(data.prixNuitee ?? 0);
  const montantCredit = prix - apport;

  const typeBien = (form.typeBien as string) || "Appartement";
  const ville = (form.ville as string) || "";
  const surface = Number(form.surface ?? 0);
  const description = (data.description as string) || "";
  const regime = (data.selectedRegime as string) || "";

  const regimeLabel = regime === "reel" ? "Réel" : regime === "micro" ? "Micro-BIC" : "";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "0.5px solid rgba(26,22,18,0.1)",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(26,22,18,0.06)",
      }}
    >
      {/* Card header */}
      <div style={{ background: "#4E1F12", padding: "16px 20px" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "rgba(245,240,232,0.55)" }}>
              {formatDate(sim.savedAt)}
            </div>
            <div className="font-semibold text-base leading-tight" style={{ color: "#F5F0E8" }}>
              {sim.name}
            </div>
          </div>
          <button
            onClick={onDelete}
            title="Supprimer"
            className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-60"
            style={{ color: "rgba(245,240,232,0.45)", fontSize: 18, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            ×
          </button>
        </div>
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span style={{ background: "rgba(245,240,232,0.12)", color: "#F5F0E8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>
            {typeBien}
          </span>
          {ville && (
            <span style={{ background: "rgba(245,240,232,0.12)", color: "#F5F0E8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>
              {ville}
            </span>
          )}
          {surface > 0 && (
            <span style={{ background: "rgba(245,240,232,0.12)", color: "#F5F0E8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>
              {surface} m²
            </span>
          )}
          {isSaisonnier && (
            <span style={{ background: "#C95B2A", color: "#F5F0E8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
              Saisonnier
            </span>
          )}
          {regimeLabel && (
            <span style={{ background: "rgba(245,240,232,0.12)", color: "#F5F0E8", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>
              {regimeLabel}
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding: "16px 20px", borderBottom: "0.5px solid rgba(26,22,18,0.07)" }}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(26,22,18,0.4)" }}>Prix d&apos;achat</div>
            <div className="text-sm font-semibold" style={{ color: "#1A1612" }}>{fE(prix)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(26,22,18,0.4)" }}>
              {isSaisonnier ? "Prix/nuit" : "Loyer/mois"}
            </div>
            <div className="text-sm font-semibold" style={{ color: "#1A1612" }}>
              {isSaisonnier ? fE(prixNuitee) : fE(loyerMensuel)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(26,22,18,0.4)" }}>Emprunt</div>
            <div className="text-sm font-semibold" style={{ color: "#1A1612" }}>{fE(montantCredit)}</div>
          </div>
        </div>
        {description && (
          <p className="text-xs mt-3 leading-relaxed" style={{ color: "rgba(26,22,18,0.5)" }}>
            {description}
          </p>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: "14px 20px" }} className="flex items-center justify-between gap-3">
        <button
          onClick={() => openSimulation(sim)}
          className="flex-1 text-sm font-medium py-2.5 rounded-md transition-opacity hover:opacity-[0.88]"
          style={{ background: "#C95B2A", color: "#F5F0E8" }}
        >
          Ouvrir le rapport →
        </button>
        <Link
          href="/#simulateur"
          onClick={() => {
            const data = sim.data as Record<string, unknown>;
            sessionStorage.setItem("lmnp_form_draft", JSON.stringify({
              form: data.form,
              isSaisonnier: data.isSaisonnier,
              prixNuitee: data.prixNuitee,
              tauxOccBas: data.tauxOccBas,
              tauxOccMoyen: data.tauxOccMoyen,
              tauxOccHaut: data.tauxOccHaut,
              amortPct: data.amortPct,
              amortMode: data.amortMode,
              amortDureeEnsemble: data.amortDureeEnsemble,
              amortDureeMobilier: data.amortDureeMobilier,
              amortDureeTravaux: data.amortDureeTravaux,
              amortDureeNotaire: data.amortDureeNotaire,
              composants: data.composants,
              selectedRegime: data.selectedRegime,
            }));
          }}
          className="text-sm font-medium px-4 py-2.5 rounded-md transition-opacity hover:opacity-80"
          style={{ background: "#EDE7DC", color: "#4E1F12" }}
        >
          Modifier
        </Link>
      </div>
    </div>
  );
}

export default function MesSimulationsClient() {
  const [sims, setSims] = useState<SavedSimulation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSims(getSavedSimulations());
    setLoaded(true);
  }, []);

  function deleteSim(name: string, savedAt: number) {
    const updated = sims.filter((s) => !(s.name === name && s.savedAt === savedAt));
    localStorage.setItem("lmnp_saved_simulations", JSON.stringify(updated));
    setSims(updated);
  }

  if (!loaded) return null;

  if (sims.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-5" style={{ color: "#C95B2A" }}>📊</div>
        <h2 className="font-light text-2xl mb-3" style={{ color: "#4E1F12" }}>Aucune simulation sauvegardée</h2>
        <p className="text-sm mb-8" style={{ color: "rgba(26,22,18,0.5)" }}>
          Lancez une simulation et cliquez sur &ldquo;Sauvegarder&rdquo; pour la retrouver ici.
        </p>
        <Link
          href="/#simulateur"
          className="inline-block text-sm font-medium px-6 py-3 rounded-md transition-opacity hover:opacity-[0.88]"
          style={{ background: "#C95B2A", color: "#F5F0E8" }}
        >
          Lancer une simulation →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg" style={{ color: "#4E1F12" }}>
          {sims.length} simulation{sims.length > 1 ? "s" : ""} sauvegardée{sims.length > 1 ? "s" : ""}
        </h2>
        <Link href="/#simulateur" className="text-sm font-medium transition-opacity hover:opacity-80" style={{ color: "#C95B2A" }}>
          + Nouvelle simulation
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {sims.map((sim) => (
          <SimulationCard
            key={`${sim.name}-${sim.savedAt}`}
            sim={sim}
            onDelete={() => deleteSim(sim.name, sim.savedAt)}
          />
        ))}
      </div>
    </div>
  );
}

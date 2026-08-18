"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
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
  window.location.href = "/?open=1#simulateur";
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
            // No autoShowResults — user wants to edit the form
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
  const { user, isLoaded: userLoaded } = useUser();
  const [sims, setSims] = useState<SavedSimulation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!userLoaded) return;
    if (!user) {
      setSims(getSavedSimulations());
      setLoaded(true);
      return;
    }
    supabase
      .from("simulations")
      .select("id, name, data, saved_at")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) {
          setSims(getSavedSimulations());
        } else {
          const mapped: SavedSimulation[] = data.map((row) => ({
            id: row.id as string,
            name: row.name as string,
            data: row.data as Record<string, unknown>,
            savedAt: typeof row.saved_at === "number" ? row.saved_at : Number(row.saved_at),
          }));
          setSims(mapped);
          localStorage.setItem("lmnp_saved_simulations", JSON.stringify(mapped));
        }
        setLoaded(true);
      });
  }, [user, userLoaded]);

  const filtered = query.trim()
    ? sims.filter((s) => {
        const q = query.toLowerCase();
        const data = s.data as Record<string, unknown>;
        const form = (data.form ?? {}) as Record<string, unknown>;
        return (
          s.name.toLowerCase().includes(q) ||
          String(form.prix ?? "").includes(q) ||
          String(form.surface ?? "").includes(q) ||
          String((form.ville as string) ?? "").toLowerCase().includes(q)
        );
      })
    : sims;

  function deleteSim(name: string, savedAt: number) {
    const target = sims.find((s) => s.name === name && s.savedAt === savedAt);
    const updated = sims.filter((s) => !(s.name === name && s.savedAt === savedAt));
    localStorage.setItem("lmnp_saved_simulations", JSON.stringify(updated));
    setSims(updated);
    if (user && target?.id) {
      supabase.from("simulations").delete().eq("id", target.id).then(({ error }) => {
        if (error) console.error("Supabase delete error:", error);
      });
    } else if (user) {
      supabase.from("simulations").delete().eq("user_id", user.id).eq("name", name).then(({ error }) => {
        if (error) console.error("Supabase delete error:", error);
      });
    }
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
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h2 className="font-semibold text-lg" style={{ color: "#4E1F12" }}>
          {filtered.length} simulation{filtered.length > 1 ? "s" : ""} sauvegardée{filtered.length > 1 ? "s" : ""}
        </h2>
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Search bar */}
          <div className="relative" style={{ maxWidth: 260, width: "100%" }}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="15" height="15" viewBox="0 0 20 20" fill="none"
              style={{ color: "rgba(26,22,18,0.35)" }}
            >
              <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
              style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.12)", color: "#1A1612" }}
            />
          </div>
          <Link href="/#simulateur" className="text-sm font-medium transition-opacity hover:opacity-80 whitespace-nowrap" style={{ color: "#C95B2A" }}>
            + Nouvelle simulation
          </Link>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {filtered.length === 0 && (
          <p className="col-span-2 text-sm py-8 text-center" style={{ color: "rgba(26,22,18,0.4)" }}>
            Aucune simulation ne correspond à votre recherche.
          </p>
        )}
        {filtered.map((sim) => (
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

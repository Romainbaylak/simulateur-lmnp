"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import MobileHeader from "@/components/MobileHeader";
import HeaderAuth from "@/components/HeaderAuth";
import {
  computeResultats,
  fEur,
  fPct,
  type SimulationData,
  type SimulationForm,
  type Resultats,
  type TMI,
} from "@/lib/computeResultats";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const INPUT = "w-full px-3 py-2.5 text-sm rounded-md text-[#1A1612] placeholder-[rgba(26,22,18,0.35)] focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const INPUT_STYLE = { background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)" };
const LABEL = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[rgba(26,22,18,0.45)] mb-1.5";

export default function RapportInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "used">("loading");
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [form, setForm] = useState<SimulationForm | null>(null);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const sessionId = params.get("session_id") ?? "";

  useEffect(() => {
    if (!sessionId) { router.replace("/"); return; }

    const raw = sessionStorage.getItem("lmnp_simulation_data");
    if (!raw) { setStatus("expired"); return; }

    try {
      const data: SimulationData = JSON.parse(raw);
      const age = Date.now() - (data.savedAt ?? 0);
      if (age > SESSION_TTL_MS) { setStatus("expired"); return; }

      const usedKey = `lmnp_rapport_used_${sessionId}`;
      if (sessionStorage.getItem(usedKey) === "1") { setStatus("used"); return; }

      setSimData(data);
      setForm(data.form);
      setStatus("ready");
    } catch { setStatus("expired"); }
  }, [sessionId, router]);

  const recalc = useCallback((f: SimulationForm, sd: SimulationData) => {
    const loyer = parseFloat(f.loyer) || 0;
    const res = computeResultats(f, loyer, sd.amortPct, sd.amortMode, sd.amortDureeEnsemble, sd.composants);
    setResultats(res);
  }, []);

  useEffect(() => {
    if (form && simData) recalc(form, simData);
  }, [form, simData, recalc]);

  useEffect(() => {
    if (status !== "ready" || !isLoaded) return;
    if (!isSignedIn) {
      const t = setTimeout(() => setShowAuthModal(true), 2000);
      return () => clearTimeout(t);
    }
  }, [status, isLoaded, isSignedIn]);

  const setField = (key: keyof SimulationForm, val: string | number) => {
    setForm(prev => prev ? { ...prev, [key]: val } : prev);
  };

  const handleGeneratePDF = async () => {
    if (!form || !resultats || !simData) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const orange = [201, 91, 42] as [number, number, number];
    const dark = [26, 22, 18] as [number, number, number];
    const beige = [245, 240, 232] as [number, number, number];
    const maroon = [78, 31, 18] as [number, number, number];
    const W = doc.internal.pageSize.getWidth();
    let y = 0;

    // Header
    doc.setFillColor(...maroon);
    doc.rect(0, 0, W, 22, "F");
    doc.setFontSize(16); doc.setTextColor(...beige); doc.setFont("helvetica", "bold");
    doc.text("toutlmnp", 14, 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text("Rapport de rentabilité LMNP", 55, 14);
    doc.setFontSize(8);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, W - 14, 14, { align: "right" });
    y = 30;

    const ville = form.villeLabel || "—";
    doc.setFontSize(17); doc.setTextColor(...maroon); doc.setFont("helvetica", "bold");
    doc.text(`Simulation — ${ville}`, 14, y);
    y += 12;

    const sectionHeader = (title: string) => {
      doc.setFillColor(...beige);
      doc.roundedRect(14, y, W - 28, 8, 2, 2, "F");
      doc.setFontSize(10); doc.setTextColor(...maroon); doc.setFont("helvetica", "bold");
      doc.text(title, 18, y + 5.5);
      y += 12;
    };

    const twoColRows = (rows: [string, string][], valOffset = 50) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      rows.forEach(([k, v], i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const x = col === 0 ? 14 : W / 2 + 4;
        const cy = y + row * 7;
        doc.setTextColor(...dark); doc.text(k, x, cy);
        doc.setFont("helvetica", "bold"); doc.setTextColor(...orange);
        doc.text(v, x + valOffset, cy, { align: "right" });
        doc.setFont("helvetica", "normal");
      });
      y += Math.ceil(rows.length / 2) * 7 + 6;
    };

    // Section 1
    sectionHeader("Récapitulatif du bien");
    twoColRows([
      ["Prix d'achat", fEur(parseFloat(form.prix) || 0)],
      ["Travaux", fEur(parseFloat(form.travaux) || 0)],
      ["Frais de notaire", fEur(parseFloat(form.notaire) || 0)],
      ["Mobilier", fEur(parseFloat(form.mobilier) || 0)],
      ["Surface", `${form.surface} m²`],
      ["Loyer mensuel", fEur(parseFloat(form.loyer) || 0)],
      ["Taxe foncière/an", fEur(parseFloat(form.taxeFonciere) || 0)],
      ["Charges copro/an", fEur(parseFloat(form.chargesCopro) || 0)],
      ["Apport", fEur(parseFloat(form.apport) || 0)],
      [`Crédit ${form.duree} ans`, `${form.taux}% · ${fEur(resultats.mensualite)}/mois`],
      ["TMI", `${form.tmi}%`],
    ]);

    // Section 2
    sectionHeader("Résultats clés");
    twoColRows([
      ["Rendement brut", fPct(resultats.rendementBrut)],
      ["Rendement net", fPct(resultats.rendementNet)],
      ["Cash-flow réel /mois", fEur(resultats.cashflowReelMensuel)],
      ["Cash-flow micro-BIC /mois", fEur(resultats.cashflowBICMensuel)],
      ["Investissement total", fEur(resultats.investTotal)],
      ["Mensualité crédit", fEur(resultats.mensualite)],
    ], 60);

    // Section 3 — Tableau fiscal
    sectionHeader("Comparaison régimes fiscaux");
    const cw = (W - 28) / 3;
    const fiscalRows: [string, string, string][] = [
      ["", "Régime réel", "Micro-BIC"],
      ["Loyers annuels", fEur(resultats.loyerAnnuel), fEur(resultats.loyerAnnuel)],
      ["Charges déductibles", fEur(resultats.chargesDeductibles), "Abattement 30 %"],
      ["Amortissements", fEur(resultats.amortTotal), "—"],
      ["Base imposable", fEur(resultats.baseImposableReel), fEur(resultats.baseBIC)],
      ["Impôt estimé", fEur(resultats.impotReel), fEur(resultats.impotBIC)],
      ["Cash-flow mensuel", fEur(resultats.cashflowReelMensuel), fEur(resultats.cashflowBICMensuel)],
    ];
    doc.setFontSize(9);
    fiscalRows.forEach(([label, reel, bic], i) => {
      const cy = y + i * 7;
      if (i === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFillColor(...orange); doc.roundedRect(14 + cw, cy - 5, cw - 2, 6, 1, 1, "F");
        doc.setTextColor(...beige); doc.text(reel, 14 + cw + cw / 2, cy, { align: "center" });
        doc.setFillColor(...maroon); doc.roundedRect(14 + cw * 2, cy - 5, cw - 2, 6, 1, 1, "F");
        doc.text(bic, 14 + cw * 2 + cw / 2, cy, { align: "center" });
      } else {
        doc.setFont("helvetica", "normal"); doc.setTextColor(...dark); doc.text(label, 14, cy);
        doc.setTextColor(...orange); doc.text(reel, 14 + cw + cw / 2, cy, { align: "center" });
        doc.setTextColor(100, 80, 60); doc.text(bic, 14 + cw * 2 + cw / 2, cy, { align: "center" });
      }
    });
    y += fiscalRows.length * 7 + 6;

    // Section 4 — Amortissement
    if (y > 235) { doc.addPage(); y = 20; }
    sectionHeader("Tableau d'amortissement");
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    [
      ["Valeur amortissable du bien", fEur((parseFloat(form.prix) || 0) * simData.amortPct / 100)],
      ["Amortissement bien/an", fEur(resultats.amortBien)],
      ["Amortissement mobilier/an", fEur(resultats.amortMobilier)],
      ["Amortissement travaux/an", fEur(resultats.amortTravaux)],
      ["Amortissement notaire/an", fEur(resultats.amortNotaire)],
      ["Total amortissement/an", fEur(resultats.amortTotal)],
    ].forEach(([k, v]) => {
      doc.setTextColor(...dark); doc.text(k, 14, y);
      doc.setFont("helvetica", "bold"); doc.setTextColor(...orange);
      doc.text(v, W - 14, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 7;
    });

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7); doc.setTextColor(180, 160, 140);
    doc.text("Généré par ToutLMNP — toutlmnp.fr | Simulation à titre indicatif, non contractuelle.", W / 2, pageH - 8, { align: "center" });

    const fileName = `rapport-lmnp-${ville.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

    // Mark session as used
    sessionStorage.setItem(`lmnp_rapport_used_${sessionId}`, "1");
    sessionStorage.removeItem("lmnp_simulation_data");
    setPdfGenerated(true);
  };

  // ── Render states ──
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>Chargement…</div>
      </main>
    );
  }

  if (status === "expired" || status === "used") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="text-4xl mb-6">⏱</div>
        <h1 className="font-light text-2xl mb-3" style={{ color: "#4E1F12" }}>
          {status === "used" ? "Rapport déjà généré" : "Session expirée"}
        </h1>
        <p className="text-sm mb-8" style={{ color: "rgba(26,22,18,0.5)" }}>
          {status === "used"
            ? "Votre rapport PDF a déjà été téléchargé pour cette session."
            : "Les données de simulation ont expiré (2h). Relancez une simulation pour générer un nouveau rapport."}
        </p>
        <Link href="/#simulateur" className="inline-block text-sm font-medium px-6 py-3 transition-opacity hover:opacity-[0.88]"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
          Retour au simulateur →
        </Link>
      </main>
    );
  }

  if (!form || !simData || !resultats) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80 transition-opacity">LMNP</Link>
            <Link href="/blog" className="hover:opacity-80 transition-opacity">Articles</Link>
            <Link href="/tarifs" className="hover:opacity-80 transition-opacity">Abonnements</Link>
          </nav>
          <div className="flex items-center gap-2">
            <HeaderAuth dark={true} />
            <a href="/#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
              Simuler maintenant
            </a>
          </div>
        </div>
        <MobileHeader />
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="font-light" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
              Vérifiez vos données avant la génération du PDF
            </h1>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: "rgba(34,139,34,0.1)", color: "#228B22", border: "1px solid rgba(34,139,34,0.25)" }}>
              Paiement confirmé ✓
            </span>
          </div>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
            Modifiez les valeurs si nécessaire — les résultats se recalculent automatiquement.
          </p>
        </div>

        {/* Section 1 — Données modifiables */}
        <div className="rounded-xl p-6 mb-6" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
          <h2 className="font-medium mb-5" style={{ color: "#4E1F12", fontSize: 15 }}>Données du bien</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {([
              ["Prix d'achat (€)", "prix"],
              ["Travaux (€)", "travaux"],
              ["Frais de notaire (€)", "notaire"],
              ["Mobilier (€)", "mobilier"],
              ["Surface (m²)", "surface"],
              ["Loyer mensuel (€)", "loyer"],
              ["Taxe foncière/an (€)", "taxeFonciere"],
              ["Charges copro/an (€)", "chargesCopro"],
              ["Apport (€)", "apport"],
              ["Taux d'intérêt (%)", "taux"],
            ] as [string, keyof SimulationForm][]).map(([label, key]) => (
              <div key={key}>
                <label className={LABEL}>{label}</label>
                <input
                  type="number"
                  className={INPUT}
                  style={INPUT_STYLE}
                  value={form[key] as string}
                  onChange={e => setField(key, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className={LABEL}>Durée crédit (ans)</label>
              <select className={INPUT} style={INPUT_STYLE} value={form.duree}
                onChange={e => setField("duree", parseInt(e.target.value))}>
                {[10, 15, 20, 25].map(d => <option key={d} value={d}>{d} ans</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>TMI (%)</label>
              <select className={INPUT} style={INPUT_STYLE} value={form.tmi}
                onChange={e => setField("tmi", parseInt(e.target.value) as TMI)}>
                {[0, 11, 30, 41, 45].map(t => <option key={t} value={t}>{t}%</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 — KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Rendement brut", val: fPct(resultats.rendementBrut) },
            { label: "Rendement net", val: fPct(resultats.rendementNet) },
            { label: "Cash-flow réel/mois", val: fEur(resultats.cashflowReelMensuel), color: resultats.cashflowReelMensuel >= 0 ? "#22793A" : "#B03A2A" },
            { label: "Impôt estimé/an", val: fEur(resultats.impotReel) },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-5 text-center" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
              <div className="text-2xl font-light mb-1" style={{ color: color ?? "#C95B2A", letterSpacing: "-0.03em" }}>{val}</div>
              <div className="text-xs" style={{ color: "rgba(26,22,18,0.45)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Section 3 — Tableau fiscal */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
          <div className="px-5 py-3" style={{ background: "#4E1F12" }}>
            <h2 className="font-medium text-sm" style={{ color: "#F5F0E8" }}>Comparaison régimes fiscaux</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "rgba(26,22,18,0.45)", background: "#EDE7DC" }}></th>
                  <th className="px-4 py-3 text-xs font-medium text-center" style={{ color: "#F5F0E8", background: "#C95B2A" }}>Régime réel</th>
                  <th className="px-4 py-3 text-xs font-medium text-center" style={{ color: "#F5F0E8", background: "#4E1F12" }}>Micro-BIC</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ["Loyers annuels", fEur(resultats.loyerAnnuel), fEur(resultats.loyerAnnuel)],
                  ["Charges déductibles", fEur(resultats.chargesDeductibles), "Abattement 30 %"],
                  ["Amortissements", fEur(resultats.amortTotal), "—"],
                  ["Base imposable", fEur(resultats.baseImposableReel), fEur(resultats.baseBIC)],
                  ["Impôt estimé", fEur(resultats.impotReel), fEur(resultats.impotBIC)],
                  ["Cash-flow mensuel", fEur(resultats.cashflowReelMensuel), fEur(resultats.cashflowBICMensuel)],
                ] as [string, string, string][]).map(([label, reel, bic], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? "#F5F0E8" : "#EDE7DC" }}>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "rgba(26,22,18,0.6)" }}>{label}</td>
                    <td className="px-4 py-2.5 text-xs text-center font-medium" style={{ color: "#C95B2A" }}>{reel}</td>
                    <td className="px-4 py-2.5 text-xs text-center" style={{ color: "rgba(26,22,18,0.7)" }}>{bic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4 — Amortissement */}
        <div className="rounded-xl overflow-hidden mb-10" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
          <div className="px-5 py-3" style={{ background: "#4E1F12" }}>
            <h2 className="font-medium text-sm" style={{ color: "#F5F0E8" }}>Tableau d&apos;amortissement</h2>
          </div>
          <div className="p-5" style={{ background: "#F5F0E8" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {([
                ["Valeur amortissable", fEur((parseFloat(form.prix) || 0) * simData.amortPct / 100)],
                ["Amortissement bien/an", fEur(resultats.amortBien)],
                ["Amortissement mobilier/an", fEur(resultats.amortMobilier)],
                ["Amortissement travaux/an", fEur(resultats.amortTravaux)],
                ["Amortissement notaire/an", fEur(resultats.amortNotaire)],
                ["Total amortissement/an", fEur(resultats.amortTotal)],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "0.5px solid rgba(26,22,18,0.06)" }}>
                  <span className="text-sm" style={{ color: "rgba(26,22,18,0.55)" }}>{k}</span>
                  <span className="text-sm font-medium" style={{ color: "#C95B2A" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton PDF */}
        {!pdfGenerated ? (
          <div className="flex justify-center mb-12">
            <button
              onClick={handleGeneratePDF}
              className="px-12 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-xl"
              style={{ background: "#C95B2A", color: "#F5F0E8" }}
            >
              Générer et télécharger le PDF
            </button>
          </div>
        ) : (
          <div className="text-center mb-12 py-8 rounded-xl" style={{ background: "rgba(34,139,34,0.07)", border: "1px solid rgba(34,139,34,0.18)" }}>
            <div className="text-3xl mb-3">✓</div>
            <p className="font-medium mb-1" style={{ color: "#228B22" }}>Rapport PDF téléchargé</p>
            <p className="text-sm mb-5" style={{ color: "rgba(26,22,18,0.4)" }}>
              Cette page n&apos;est plus accessible. Merci d&apos;utiliser ToutLMNP.
            </p>
            <Link href="/#simulateur" className="inline-block text-sm font-medium px-6 py-3 rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}>
              Nouvelle simulation →
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>

      {/* Auth modal */}
      {showAuthModal && !isSignedIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(26,22,18,0.5)", backdropFilter: "blur(2px)" }}
        >
          <div className="relative w-full max-w-sm rounded-2xl p-8"
            style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)" }}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A" }}>👋</div>
              <h2 className="font-medium text-xl mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
                Bienvenue sur ToutLMNP !
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                Votre rapport est prêt. Connectez-vous pour sauvegarder vos futures simulations et retrouver vos analyses.
              </p>
            </div>
            <SignInButton mode="modal" fallbackRedirectUrl="/">
              <button
                className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              >
                Se connecter avec mon email
              </button>
            </SignInButton>
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

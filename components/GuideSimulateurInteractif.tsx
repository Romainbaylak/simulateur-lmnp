"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

/* ── Palette ───────────────────────────────────────────────────── */
const C = {
  fond: "#F5F0E8",
  fondSec: "#EDE7DC",
  fondCarte: "#FDFAF6",
  brun: "#4E1F12",
  texte: "#1A1612",
  orange: "#C95B2A",
  vert: "#1A7A52",
  rouge: "#B03A2A",
  bleu: "#2A7080",
  bleuFonce: "#26527A",
};

/* ── Exemple de simulation (fil conducteur de tout le guide) ──── */
// Prix: 250 000 €, Notaire: 20 000 €, Mobilier: 5 000 €, Travaux: 0 €
// Apport: 40 000 €, Crédit: 235 000 €, 20 ans, 3,5 %, Assurance emprunteur: 0,25 %
// Loyer HC: 1 600 €/mois, Charges locataire: 50 €/mois
// TF: 1 600 €/an, Copro: 1 000 €/an, Entretien: 500 €/an, Compta: 500 €/an, TMI: 30 %
const EX = {
  prix: 250000, notaire: 20000, mobilier: 5000, travaux: 0, apport: 40000,
  credit: 235000, duree: 20, taux: 3.5, assEmprPct: 0.25,
  mensualiteCredit: 1363, assEmprMensuel: 49, mensualiteTotal: 1412,
  loyerHC: 1600, chargesLoc: 50,
  tf: 1600, copro: 1000, entretien: 500, compta: 500,
  investTotal: 275000, loyerAnnuel: 19200, chargesLocAnnuel: 600, recettes: 19800,
  chargesAnnuelles: 3600, assEmprAnnuel: 588, interets: 8100, creditAnnuel: 16356,
  chargesDeductibles: 12288, resultatAvantAmort: 7512,
  amortTotal: 9925, baseImposableReel: 0, impotReel: 0, amortAReporter: 2413,
  cashflowReel: -62,
  baseBIC: 9900, impotBIC: 4811, cashflowBIC: -463,
  rendBrut: 7.0, rendNet: 5.67,
};

/* ── Styles reproduisant exactement le simulateur ────────────── */
const INPUT_STYLE: React.CSSProperties = { background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)", borderRadius: 6, padding: "10px 12px", fontSize: 14, color: "#1A1612", width: "100%", boxSizing: "border-box" };
const LABEL_STYLE: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,22,18,0.45)", marginBottom: 6 };
const AUTO_STYLE: React.CSSProperties = { ...INPUT_STYLE, background: "rgba(201,91,42,0.06)" };

function FRow({ label, val, color, bold, sep, bg, labelBold }: { label: string; val: string; color?: string; bold?: boolean; sep?: boolean; bg?: string; labelBold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderTop: sep ? "1px solid rgba(26,22,18,0.09)" : undefined, background: bg, borderRadius: bg ? 5 : undefined, marginLeft: bg ? -8 : undefined, marginRight: bg ? -8 : undefined, paddingLeft: bg ? 8 : undefined, paddingRight: bg ? 8 : undefined }}>
      <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13, fontWeight: labelBold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 400, color: color ?? "#1A1612", whiteSpace: "nowrap" }}>{val}</span>
    </div>
  );
}

function DemoWrapper({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div style={{ border: `1px solid rgba(201,91,42,0.25)`, borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
      <div style={{ background: C.brun, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: C.orange, color: "#F5F0E8", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Aperçu interactif</span>
        <span style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.75rem" }}>{title}</span>
      </div>
      <div style={{ background: C.fond, padding: "20px" }}>{children}</div>
    </div>
  );
}

function DemoStatic({ children }: { children?: ReactNode }) {
  return (
    <div style={{ border: `1px solid rgba(201,91,42,0.25)`, borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
      <div style={{ background: C.brun, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: C.orange, color: "#F5F0E8", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Aperçu du simulateur</span>
        <span style={{ background: "rgba(245,240,232,0.12)", color: "rgba(245,240,232,0.65)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Exemple réel</span>
      </div>
      <div style={{ background: C.fond, padding: "20px" }}>{children}</div>
    </div>
  );
}

function fEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n);
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 1 — Saisir votre projet
══════════════════════════════════════════════════════════════════ */
const chargeExplications: Record<string, { label: string; type: string; explication: string; astuce?: string }> = {
  prix: { label: "Prix d'achat", type: "€", explication: "Le prix net vendeur, hors frais de notaire. C'est sur cette base que le simulateur calcule les rendements et le montant à emprunter.", astuce: "Ne pas inclure les frais d'agence si vous comptez les financer séparément." },
  notaire: { label: "Frais de notaire", type: "auto", explication: "Calculés automatiquement (7 à 8 % dans l'ancien, 2 à 3 % dans le neuf). Ils s'ajoutent au prix d'achat dans l'investissement total. En LMNP, ils sont amortissables sur 25 ans.", astuce: "Frais réels fournis par votre notaire ? Saisissez-les directement pour plus de précision." },
  mobilier: { label: "Mobilier (€)", type: "€", explication: "Le montant du mobilier initial (cuisine équipée, literie, électroménager…). En LMNP, le mobilier s'amortit séparément sur 5 à 10 ans — c'est une charge fiscale supplémentaire réduisant votre base imposable.", astuce: "Comptez 3 000 à 15 000 € selon la qualité de l'ameublement." },
  travaux: { label: "Travaux (€)", type: "€", explication: "Montant des travaux de rénovation. En régime réel LMNP, les travaux sont amortissables sur 10 à 20 ans selon leur nature (pas déductibles en une fois).", astuce: "Les travaux importants peuvent doubler la valeur amortissable annuelle." },
  apport: { label: "Apport personnel", type: "€", explication: "La somme que vous investissez de votre poche. Un apport réduit la mensualité et améliore le cash-flow, mais diminue l'effet de levier. Idéalement, couvrez les frais de notaire.", astuce: "0 € d'apport = effet de levier maximum, cash-flow plus tendu. Testez les deux scénarios." },
  taux: { label: "Taux d'intérêt annuel", type: "%", explication: "Taux annuel hors assurance emprunteur. En 2026, comptez 3,0 à 4,5 % selon la durée et le profil. Le simulateur calcule les intérêts exacts de la 1re année — déductibles en totalité au réel." },
  assEmpr: { label: "Assurance emprunteur", type: "% du capital emprunté/an", explication: "Exprimée en pourcentage annuel du capital emprunté. Typically 0,10 à 0,40 %. Sur 235 000 € à 0,25 %, c'est 588 €/an soit 49 €/mois. Elle est déductible comme charge financière au régime réel.", astuce: "0,25 % est une valeur raisonnable. Renégociez l'assurance après 1 an pour diviser ce coût par 2." },
  tf: { label: "Taxe foncière", type: "€/an", explication: "Fournie par votre avis de taxe foncière ou estimée à l'achat. Déductible en totalité dans les deux régimes (réel et micro-BIC non, mais les charges réelles s'appliquent au réel).", astuce: "Demandez le montant exact au vendeur avant l'achat." },
  copro: { label: "Charges de copropriété", type: "€/an", explication: "Part non récupérable sur le locataire (entretien parties communes, ravalement…). La part récupérable est saisie dans 'Charges locataire'. Toutes deux sont déductibles au régime réel.", astuce: "En copro, comptez 1 000 à 3 500 €/an selon la taille et l'ancienneté de l'immeuble." },
  pno: { label: "Assurance PNO / GLI", type: "% du loyer annuel", explication: "Assurance Propriétaire Non Occupant (obligatoire) et optionnellement Garantie Loyers Impayés. Saisie en % du loyer annuel. Sur 19 200 €/an, 1 % = 192 €/an. Déductible au réel.", astuce: "PNO seule : 0,2–0,5 %. PNO + GLI : 2–4 % du loyer annuel." },
  gestion: { label: "Gestion locative", type: "% du loyer HC/an", explication: "Si vous confiez la gestion à une agence, comptez 6 à 10 % du loyer HC. Entièrement déductible au réel. Si vous gérez seul, mettez 0.", astuce: "6 % sur 19 200 €/an = 1 152 €/an de moins dans votre cash-flow." },
  entretien: { label: "Entretien courant", type: "€/an", explication: "Budget annuel pour les petites réparations (plomberie, peinture, électroménager…). Provision raisonnable : 300 à 1 500 €/an selon l'état du bien. Déductible en totalité au réel.", astuce: "Une règle empirique : 0,5 à 1 % du prix d'achat par an." },
  compta: { label: "Comptabilité LMNP", type: "€/an", explication: "Honoraires annuels d'un expert-comptable spécialisé LMNP. Entre 300 et 800 €/an. Obligatoire pour tenir une comptabilité d'amortissement au régime réel. Déductible en totalité.", astuce: "Certains cabinets proposent un forfait à 450 €/an tout compris." },
};

export function SectionSaisirDonnees() {
  const [activeField, setActiveField] = useState<string | null>(null);
  const fields: { key: string; value: string }[] = [
    { key: "prix", value: "250 000 €" },
    { key: "notaire", value: "20 000 € (auto)" },
    { key: "mobilier", value: "5 000 €" },
    { key: "travaux", value: "0 €" },
    { key: "apport", value: "40 000 €" },
    { key: "taux", value: "3,5 %" },
    { key: "assEmpr", value: "0,25 % / an" },
    { key: "tf", value: "1 600 €/an" },
    { key: "copro", value: "1 000 €/an" },
    { key: "pno", value: "0,3 % du loyer" },
    { key: "gestion", value: "0 % (autogéré)" },
    { key: "entretien", value: "500 €/an" },
    { key: "compta", value: "500 €/an" },
  ];
  const info = activeField ? chargeExplications[activeField] : null;

  return (
    <DemoWrapper title="Saisir votre projet — cliquez sur chaque champ pour en savoir plus">
      {/* Simulateur replica: section header */}
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A1612", marginBottom: 16 }}>Bien &amp; Financement</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10, marginBottom: 12 }}>
        {fields.map(({ key, value }) => {
          const fi = chargeExplications[key];
          const isActive = activeField === key;
          const isAuto = key === "notaire";
          return (
            <button key={key} onClick={() => setActiveField(isActive ? null : key)} aria-pressed={isActive} style={{ textAlign: "left", cursor: "pointer", background: isActive ? "rgba(201,91,42,0.09)" : (isAuto ? "rgba(201,91,42,0.06)" : C.fondSec), border: isActive ? `1.5px solid ${C.orange}` : `0.5px solid rgba(26,22,18,0.12)`, borderRadius: 6, padding: "10px 12px", transition: "all 130ms", outline: "none" }}>
              <div style={LABEL_STYLE}>{fi.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.texte }}>{value}</div>
              {fi.type !== "€" && fi.type !== "auto" && <div style={{ fontSize: 10, color: "rgba(26,22,18,0.4)", marginTop: 2 }}>{fi.type}</div>}
            </button>
          );
        })}
      </div>
      {info && (
        <div style={{ marginTop: 4, padding: "14px 16px", background: "rgba(201,91,42,0.07)", borderRadius: 8, border: `1px solid rgba(201,91,42,0.22)` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 4 }}>{info.label} <span style={{ fontWeight: 400, color: "rgba(26,22,18,0.45)", fontSize: 11 }}>— {info.type}</span></div>
          <div style={{ fontSize: 13, color: "rgba(26,22,18,0.75)", lineHeight: 1.65, marginBottom: info.astuce ? 8 : 0 }}>{info.explication}</div>
          {info.astuce && <div style={{ fontSize: 12, color: C.vert, lineHeight: 1.55 }}>💡 {info.astuce}</div>}
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 2 — Option Saisonnière (réplique exacte du toggle)
══════════════════════════════════════════════════════════════════ */
export function SectionSaisonnier() {
  const [on, setOn] = useState(false);
  return (
    <DemoWrapper title="Option Location Saisonnière">
      {/* Exact replica of the saisonnier button from Simulateur.tsx */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 38, marginBottom: 16 }}>
        <span style={LABEL_STYLE}>Loyer</span>
        <button
          onClick={() => setOn((v: boolean) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer", background: on ? "rgba(38,82,122,0.1)" : "#F5F0E8", border: on ? `1.5px solid #26527A` : "0.5px solid rgba(26,22,18,0.18)", color: on ? "#26527A" : "rgba(26,22,18,0.55)", transition: "all 200ms" }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: on ? "#26527A" : "transparent", border: on ? "none" : "1.5px solid rgba(26,22,18,0.3)" }}>
            {on && <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>}
          </span>
          Location Saisonnière
        </button>
      </div>

      {on ? (
        <div style={{ background: "rgba(38,82,122,0.05)", border: "1px solid rgba(38,82,122,0.2)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "#26527A", marginBottom: 12 }}>Location Saisonnière</div>
          <div style={{ marginBottom: 12 }}>
            <div style={LABEL_STYLE}>Prix moyen par nuitée</div>
            <div style={{ position: "relative", maxWidth: 140 }}>
              <div style={{ ...INPUT_STYLE, background: C.fondSec, color: "rgba(26,22,18,0.5)" }}>90</div>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(26,22,18,0.45)" }}>€</span>
            </div>
          </div>
          <div>
            <div style={LABEL_STYLE}>Taux d&apos;occupation estimé</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Bas", val: "30", nuits: 110 },
                { label: "Moyen", val: "50", nuits: 183 },
                { label: "Haut", val: "70", nuits: 256 },
              ].map(({ label, val, nuits }) => (
                <div key={label}>
                  <div style={{ fontSize: 12, fontWeight: 500, textAlign: "center", marginBottom: 4, color: "#1A1612" }}>{label}</div>
                  <div style={{ ...INPUT_STYLE, textAlign: "center", paddingRight: 22, background: C.fondSec, color: "rgba(26,22,18,0.55)" }}>{val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, textAlign: "center", marginTop: 4, color: "#C95B2A" }}>{nuits} nuits/an</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, marginTop: 8, color: "#1A1612", lineHeight: 1.5 }}>Les calculs de rentabilité approfondis sont effectués avec l&apos;estimation <strong>Moyenne</strong>.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Loyer HC / mois (€)", val: "1 600", sub: "Hors charges locataire" },
            { label: "Charges locataire / mois (€)", val: "50", sub: "Neutral — non inclus dans le rendement" },
          ].map(({ label, val, sub }) => (
            <div key={label}>
              <div style={LABEL_STYLE}>{label}</div>
              <div style={{ ...INPUT_STYLE, background: C.fondSec, color: "rgba(26,22,18,0.55)" }}>{val}</div>
              <div style={{ fontSize: 10, marginTop: 4, color: "rgba(26,22,18,0.4)" }}>{sub}</div>
            </div>
          ))}
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 3 — Les deux régimes (présentation avant calcul)
══════════════════════════════════════════════════════════════════ */
export function SectionRegimes() {
  const [sel, setSel] = useState<"reel" | "bic" | null>(null);
  const regimes = [
    {
      key: "reel" as const, label: "Régime Réel Simplifié", badge: "Recommandé LMNP",
      color: C.orange, badgeBg: C.orange,
      points: ["Toutes les charges réelles déduites", "Amortissement du bien comptabilisé chaque année", "Impôt souvent nul la 1re décennie", "Comptabilité obligatoire (~500 €/an)", "Idéal si charges + amortissements > 50 % des revenus"],
      bas: false,
    },
    {
      key: "bic" as const, label: "Micro-BIC", badge: "Abattement 50 %",
      color: "#1A1612", badgeBg: "#1A1612",
      points: ["Abattement forfaitaire de 50 % sur les recettes", "Aucune comptabilité, déclaration simple", "Pas d'amortissement → impôt réel sur 50 % des revenus", "Avantageux si charges réelles < 50 % des revenus", "Plafonné à 77 700 € de recettes/an (meublé classique)"],
      bas: true,
    },
  ] as const;

  const selected = sel ? regimes.find(r => r.key === sel) : null;
  return (
    <DemoWrapper title="Choisir un régime fiscal — cliquez pour explorer">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {regimes.map(r => (
          <button key={r.key} onClick={() => setSel(sel === r.key ? null : r.key)} aria-pressed={sel === r.key} style={{ textAlign: "left", cursor: "pointer", background: sel === r.key ? "rgba(201,91,42,0.06)" : C.fondSec, border: sel === r.key ? `2px solid ${r.color}` : "0.5px solid rgba(26,22,18,0.12)", borderRadius: 10, padding: 0, overflow: "hidden", transition: "all 150ms", outline: "none" }}>
            <div style={{ background: r.color, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #F5F0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sel === r.key && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5F0E8" }} />}
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#F5F0E8" }}>{r.label}</span>
              {!r.bas && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#F5F0E8", background: "rgba(245,240,232,0.2)", padding: "2px 8px", borderRadius: 4 }}>✓ {r.badge}</span>}
              {r.bas && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#F5F0E8", background: "rgba(245,240,232,0.2)", padding: "2px 8px", borderRadius: 4 }}>{r.badge}</span>}
            </div>
            <div style={{ padding: "10px 14px" }}>
              {r.points.map(p => <div key={p} style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", marginBottom: 4, paddingLeft: 10, position: "relative" }}><span style={{ position: "absolute", left: 0, top: 1 }}>·</span>{p}</div>)}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: selected.key === "reel" ? "rgba(201,91,42,0.07)" : "rgba(26,22,18,0.05)", borderRadius: 8, border: `1px solid ${selected.key === "reel" ? "rgba(201,91,42,0.25)" : "rgba(26,22,18,0.12)"}`, fontSize: 13, color: "rgba(26,22,18,0.7)", lineHeight: 1.65 }}>
          {selected.key === "reel"
            ? "Le régime réel est adapté à la quasi-totalité des investissements LMNP avec crédit. L'amortissement du bien réduit — voire annule — votre base imposable, pendant que vous remboursez votre crédit. Résultat : impôt 0 € pendant 10 à 15 ans."
            : "Le Micro-BIC convient si vos charges réelles sont faibles (bien sans crédit, déjà amorti, haut rendement). Mais dès que vous avez un crédit immobilier, le réel devient presque toujours plus avantageux fiscalement."}
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 4 — Calcul de l'impôt (tableaux répliques exactes)
══════════════════════════════════════════════════════════════════ */
export function SectionImpot() {
  const [sel, setSel] = useState<"reel" | "bic">("reel");
  return (
    <DemoWrapper title="Comment votre impôt est calculé — basculez entre les deux régimes">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["reel", "bic"] as const).map(k => (
          <button key={k} onClick={() => setSel(k)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, background: sel === k ? (k === "reel" ? C.orange : "#1A1612") : C.fondSec, color: sel === k ? "#F5F0E8" : C.texte, border: sel === k ? "none" : "0.5px solid rgba(26,22,18,0.12)", transition: "all 150ms" }}>
            {k === "reel" ? "Régime Réel" : "Micro-BIC"}
          </button>
        ))}
      </div>

      {/* Tableau réplique exacte du simulateur */}
      <div style={{ borderRadius: 10, overflow: "hidden", border: sel === "reel" ? `2.5px solid ${C.orange}` : `2.5px solid #1A1612`, boxShadow: sel === "reel" ? "0 0 0 3px rgba(201,91,42,0.12)" : "0 0 0 3px rgba(26,22,18,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", background: sel === "reel" ? C.orange : "#1A1612" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #F5F0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F5F0E8" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#F5F0E8" }}>{sel === "reel" ? "Régime réel simplifié" : "Micro-BIC"}</span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#F5F0E8", background: "rgba(245,240,232,0.2)", padding: "2px 10px", borderRadius: 4 }}>✓ {sel === "reel" ? "SÉLECTIONNÉ" : "SÉLECTIONNÉ"}</span>
        </div>
        <div style={{ padding: "0 20px", background: "#FDFAF6" }}>
          {sel === "reel" ? (
            <>
              <FRow label="Loyers annuels (HC)" val={fEur(EX.loyerAnnuel)} bold />
              <FRow label="Emprunt (mensualités × 12)" val={`−${fEur(EX.creditAnnuel)}`} color={C.rouge} />
              <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(26,22,18,0.6)" }}>Dont frais d&apos;emprunt (intérêts) </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.rouge }}>{fEur(EX.interets)}</span>
              </div>
              <FRow label="Charges déductibles" val={`−${fEur(EX.chargesDeductibles)}`} color={C.rouge} />
              <FRow label="Résultat avant amortissement" val={fEur(EX.resultatAvantAmort)} bold color={C.vert} sep />
              {/* Amort row — replica exacte avec fond bleu */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 8px", background: "rgba(42,112,128,0.09)", borderRadius: "3px 0 0 3px", margin: "0 -20px 0 -8px", borderTop: "2px solid #2A7080", borderBottom: "2px solid #2A7080", borderLeft: "2px solid #2A7080" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(26,22,18,0.78)" }}>Amortissements</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2A7080" }}>−{fEur(EX.amortTotal)}</span>
              </div>
              <FRow label="Base imposable" val={fEur(EX.baseImposableReel)} bold sep color={C.vert} />
              <FRow label="Impôt estimé" val={fEur(EX.impotReel)} color={C.rouge} />
              <FRow label="Amortissement à reporter N+1" val={fEur(EX.amortAReporter)} color="#B08A2A" />
              <div style={{ borderTop: "1px solid rgba(26,22,18,0.09)", padding: "10px 0 4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 2 }}>
                  <span style={{ fontSize: 13, color: "rgba(26,22,18,0.78)" }}>Cash-flow <strong>Mensuel</strong></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: EX.cashflowReel >= 0 ? C.vert : C.rouge }}>{EX.cashflowReel > 0 ? "+" : ""}{fEur(EX.cashflowReel)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel :</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.rouge }}>{fEur(EX.cashflowReel * 12)}</span>
                </div>
              </div>
              <div style={{ height: 12 }} />
            </>
          ) : (
            <>
              <FRow label="Loyers annuels (HC)" val={fEur(EX.loyerAnnuel)} bold />
              <FRow label="Emprunt (mensualités × 12)" val={`−${fEur(EX.creditAnnuel)}`} color={C.rouge} />
              <FRow label="Ensemble des charges" val={`−${fEur(EX.chargesAnnuelles + EX.assEmprAnnuel)}`} color={C.rouge} />
              <div style={{ borderTop: "1px solid rgba(26,22,18,0.09)", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,22,18,0.78)" }}>Base imposable</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1612" }}>{fEur(EX.baseBIC)}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(26,22,18,0.55)", background: "rgba(26,22,18,0.04)", padding: "6px 10px", borderRadius: 6, lineHeight: 1.4, marginBottom: 8 }}>
                  Abattement forfaitaire 50 % appliqué sur {fEur(EX.recettes)} de recettes
                </div>
              </div>
              <FRow label="Impôt estimé (TMI 30 % + PS 18,6 %)" val={fEur(EX.impotBIC)} color={C.rouge} />
              <div style={{ borderTop: "1px solid rgba(26,22,18,0.09)", padding: "10px 0 4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 2 }}>
                  <span style={{ fontSize: 13, color: "rgba(26,22,18,0.78)" }}>Cash-flow <strong>Mensuel</strong></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.rouge }}>{fEur(EX.cashflowBIC)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel :</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.rouge }}>{fEur(EX.cashflowBIC * 12)}</span>
                </div>
              </div>
              <div style={{ height: 12 }} />
            </>
          )}
        </div>
      </div>
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 5 — Quel régime choisir : tableau comparatif
══════════════════════════════════════════════════════════════════ */
export function SectionChoisir() {
  return (
    <DemoStatic>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(26,22,18,0.45)", borderBottom: "1px solid rgba(26,22,18,0.1)" }}>Indicateur</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 700, color: C.orange, borderBottom: "1px solid rgba(26,22,18,0.1)" }}>Régime Réel</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 700, color: "#1A1612", borderBottom: "1px solid rgba(26,22,18,0.1)" }}>Micro-BIC</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Base imposable", fEur(EX.baseImposableReel), fEur(EX.baseBIC)],
              ["Impôt estimé / an", fEur(EX.impotReel), fEur(EX.impotBIC)],
              ["Impôt / mois", fEur(0), fEur(EX.impotBIC / 12)],
              ["Cash-flow mensuel", `${EX.cashflowReel > 0 ? "+" : ""}${fEur(EX.cashflowReel)}`, `${EX.cashflowBIC > 0 ? "+" : ""}${fEur(EX.cashflowBIC)}`],
              ["Cash-flow annuel", fEur(EX.cashflowReel * 12), fEur(EX.cashflowBIC * 12)],
            ].map(([label, reel, bic], i) => (
              <tr key={label} style={{ background: i % 2 === 0 ? "transparent" : "rgba(26,22,18,0.02)" }}>
                <td style={{ padding: "9px 12px", color: "rgba(26,22,18,0.7)" }}>{label}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color: label === "Impôt estimé / an" || label === "Impôt / mois" ? C.vert : (label.includes("Cash") ? (EX.cashflowReel >= 0 ? C.vert : C.rouge) : "#1A1612") }}>{reel}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color: label === "Impôt estimé / an" || label === "Impôt / mois" ? C.rouge : (label.includes("Cash") ? C.rouge : "#1A1612") }}>{bic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(26,122,82,0.08)", border: `1px solid rgba(26,122,82,0.2)`, borderRadius: 8, fontSize: 13, color: C.vert, fontWeight: 700 }}>
        ✓ Régime Réel Simplifié — économie de {fEur((EX.impotBIC - EX.impotReel))} d&apos;impôt par an soit {fEur((EX.cashflowReel - EX.cashflowBIC))} de cash-flow mensuel en plus.
      </div>
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 6 — Amortissement : le principe
══════════════════════════════════════════════════════════════════ */
export function SectionAmortissement() {
  const [mode, setMode] = useState<"composant" | "global">("composant");
  const composants = [
    { label: "Gros œuvre (bâti)", pct: "45 %", duree: "40 ans", valAmort: "95 625 €", amtAn: "2 391 €/an" },
    { label: "Toiture", pct: "15 %", duree: "25 ans", valAmort: "31 875 €", amtAn: "1 275 €/an" },
    { label: "Aménagements intérieurs", pct: "20 %", duree: "15 ans", valAmort: "42 500 €", amtAn: "2 833 €/an" },
    { label: "Installation électrique", pct: "10 %", duree: "20 ans", valAmort: "21 250 €", amtAn: "1 063 €/an" },
    { label: "Étanchéité / plomberie", pct: "10 %", duree: "20 ans", valAmort: "21 250 €", amtAn: "1 063 €/an" },
  ];
  return (
    <DemoWrapper title="Méthode d'amortissement">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["composant", "global"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, background: mode === m ? C.bleu : C.fondSec, color: mode === m ? "#F5F0E8" : C.texte, border: mode === m ? `1.5px solid ${C.bleu}` : "0.5px solid rgba(26,22,18,0.12)", transition: "all 150ms" }}>
            {m === "composant" ? "Par Composant" : "Global Simplifié"}
          </button>
        ))}
      </div>

      {mode === "composant" ? (
        <>
          <div style={{ fontSize: 12, color: "rgba(26,22,18,0.5)", marginBottom: 8 }}>Valeur amortissable du bien : 250 000 € × 85 % = <strong style={{ color: C.bleu }}>212 500 €</strong></div>
          <div style={{ display: "grid", gap: 6 }}>
            {composants.map(({ label, pct, duree, valAmort, amtAn }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", background: C.fondSec, borderRadius: 6, padding: "8px 12px", border: "0.5px solid rgba(26,22,18,0.08)", gap: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(26,22,18,0.75)" }}>{label}</span>
                <span style={{ fontSize: 12, color: C.bleu, fontWeight: 600, textAlign: "center" }}>{pct}</span>
                <span style={{ fontSize: 11, color: "rgba(26,22,18,0.5)", textAlign: "center" }}>{duree}</span>
                <span style={{ fontSize: 12, color: C.orange, fontWeight: 700, textAlign: "right" }}>{amtAn}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
            <div style={{ fontSize: 11, color: "rgba(26,22,18,0.5)", marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Également amortis :</div>
            {[
              { label: "Mobilier", val: "500 €/an", duree: "10 ans" },
              { label: "Frais de notaire", val: "800 €/an", duree: "25 ans" },
            ].map(({ label, val, duree }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(42,112,128,0.06)", borderRadius: 6, padding: "7px 12px", border: "0.5px solid rgba(42,112,128,0.15)" }}>
                <span style={{ fontSize: 12, color: "rgba(26,22,18,0.6)" }}>{label}</span>
                <span style={{ fontSize: 11, color: "rgba(26,22,18,0.4)" }}>{duree}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.bleu }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(42,112,128,0.08)", borderRadius: 8, border: `1px solid rgba(42,112,128,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.bleu }}>Total amortissements / an</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.bleu }}>{fEur(EX.amortTotal)}</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "rgba(26,22,18,0.5)", marginBottom: 8 }}>Valeur amortissable du bien : 250 000 € × 85 % = <strong style={{ color: C.bleu }}>212 500 €</strong>, sur une durée unique.</div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { label: "Valeur amortissable", val: "212 500 €" },
              { label: "Durée d'amortissement", val: "25 ans" },
              { label: "Amortissement bien / an", val: "8 500 €/an" },
              { label: "+ Mobilier (5 000 € / 10 ans)", val: "500 €/an" },
              { label: "+ Notaire (20 000 € / 25 ans)", val: "800 €/an" },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", background: C.fondSec, borderRadius: 6, padding: "9px 12px", border: "0.5px solid rgba(26,22,18,0.08)" }}>
                <span style={{ fontSize: 13, color: "rgba(26,22,18,0.7)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(42,112,128,0.08)", borderRadius: 8, border: `1px solid rgba(42,112,128,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.bleu }}>Total amortissements / an</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.bleu }}>{fEur(9800)}</span>
          </div>
        </>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 7 — Récapitulatif final (réplique du résumé)
══════════════════════════════════════════════════════════════════ */
export function SectionRecap() {
  return (
    <DemoStatic>
      {/* 3 blocs récap */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { titre: "Le bien", lignes: ["Prix d'achat : 250 000 €", "Notaire : 20 000 €", "Mobilier : 5 000 €", "Travaux : 0 €", "Investissement total : 275 000 €"] },
          { titre: "Financement", lignes: ["Apport : 40 000 €", "Crédit : 235 000 €", "Durée : 20 ans — 3,5 %", "Mensualité : 1 363 €/mois", "+ Assurance : 49 €/mois"] },
          { titre: "Charges annuelles", lignes: ["Taxe foncière : 1 600 €", "Copro : 1 000 €", "Entretien : 500 €", "Comptabilité : 500 €", "Assur. emprunteur : 588 €"] },
        ].map(({ titre, lignes }) => (
          <div key={titre} style={{ background: C.fondSec, borderRadius: 8, padding: "12px 14px", border: "0.5px solid rgba(26,22,18,0.1)" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: C.brun, marginBottom: 8 }}>{titre}</div>
            {lignes.map(l => <div key={l} style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", marginBottom: 3 }}>{l}</div>)}
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div style={{ padding: "12px 16px", background: "rgba(26,122,82,0.08)", borderRadius: 8, border: `1px solid rgba(26,122,82,0.2)`, marginBottom: 14, fontSize: 13, color: C.vert, fontWeight: 700 }}>
        ✓ Régime Réel Simplifié recommandé — Impôt : 0 € — Cash-flow : {fEur(EX.cashflowReel)}/mois
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
        {[
          { label: "Rendement brut", val: `${EX.rendBrut.toFixed(1)} %`, color: C.texte },
          { label: "Rendement net (avant impôt)", val: `${EX.rendNet.toFixed(2)} %`, color: C.texte },
          { label: "Investissement total", val: fEur(EX.investTotal), color: C.texte },
          { label: "Mensualité totale", val: `${fEur(EX.mensualiteTotal)}/mois`, color: C.texte },
          { label: "Impôt annuel (réel)", val: fEur(EX.impotReel), color: C.vert },
          { label: "Cash-flow mensuel", val: `${fEur(EX.cashflowReel)}/mois`, color: C.rouge },
          { label: "Amort. à reporter", val: fEur(EX.amortAReporter), color: "#B08A2A" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: C.fondSec, borderRadius: 6, padding: "10px 12px", border: "0.5px solid rgba(26,22,18,0.08)" }}>
            <div style={{ fontSize: 10, color: "rgba(26,22,18,0.45)", marginBottom: 3 }}>{label}</div>
            <div style={{ fontWeight: 700, color, fontSize: 13 }}>{val}</div>
          </div>
        ))}
      </div>
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 8 — Cash-flow sur 25 ans (graphique SVG)
══════════════════════════════════════════════════════════════════ */
export function SectionCashflow() {
  const W = 520, H = 200, PAD = { top: 30, right: 20, bottom: 30, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  // Après 20 ans le crédit est remboursé, le cash-flow explose
  const points = Array.from({ length: 26 }, (_, i) => {
    let cf: number;
    if (i <= 20) {
      cf = EX.cashflowReel + i * 5; // légère amélioration avec inflation loyers
    } else {
      cf = EX.cashflowReel + 100 + (i - 20) * 135; // crédit remboursé : +1 363 €/mois
    }
    return { x: i, y: cf };
  });
  const minY = -200, maxY = 1600;
  const toX = (i: number) => PAD.left + (i / 25) * innerW;
  const toY = (v: number) => PAD.top + (1 - (v - minY) / (maxY - minY)) * innerH;
  const zeroY = toY(0);
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${toX(25).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`;

  return (
    <DemoStatic>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }} role="img" aria-label="Graphique cash-flow sur 25 ans">
          {/* Grille */}
          {[0, 400, 800, 1200].map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="rgba(26,22,18,0.07)" strokeWidth={1} />
              <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.35)">{v > 0 ? `+${v}` : v} €</text>
            </g>
          ))}
          {/* Ligne zéro */}
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="rgba(26,22,18,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={PAD.left - 6} y={zeroY + 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.5)">0 €</text>
          {/* Année 20 */}
          <line x1={toX(20)} y1={PAD.top} x2={toX(20)} y2={H - PAD.bottom} stroke="rgba(201,91,42,0.3)" strokeWidth={1} strokeDasharray="3 2" />
          <text x={toX(20)} y={PAD.top - 4} textAnchor="middle" fontSize={9} fill={C.orange}>Fin crédit</text>
          {/* Aire */}
          <clipPath id="clip-above"><rect x={PAD.left} y={zeroY} width={innerW} height={innerH + PAD.top} /></clipPath>
          <clipPath id="clip-below"><rect x={PAD.left} y={PAD.top} width={innerW} height={zeroY - PAD.top} /></clipPath>
          <path d={areaD} fill="rgba(26,122,82,0.1)" clipPath="url(#clip-above)" />
          <path d={areaD} fill="rgba(176,58,42,0.08)" clipPath="url(#clip-below)" />
          {/* Courbe */}
          <path d={pathD} fill="none" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* Étiquettes */}
          <text x={toX(0) + 4} y={toY(EX.cashflowReel) - 6} fontSize={9} fill={C.rouge}>{fEur(EX.cashflowReel)}/mois</text>
          <text x={toX(25) - 4} y={toY(points[25].y) - 6} textAnchor="end" fontSize={9} fill={C.vert}>+{fEur(points[25].y)}/mois</text>
          {/* Axe X */}
          <text x={PAD.left} y={H - 4} fontSize={9} fill="rgba(26,22,18,0.35)">An 1</text>
          <text x={toX(20)} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(26,22,18,0.35)">An 20</text>
          <text x={W - PAD.right} y={H - 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.35)">An 25</text>
        </svg>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "rgba(26,22,18,0.4)", marginTop: 6 }}>
        Projection hypothèse loyer stable. À partir de l&apos;an 21, le crédit est remboursé : le cash-flow devient fortement positif.
      </div>
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 9 — Les 3 rapports (statique)
══════════════════════════════════════════════════════════════════ */
export function SectionRapports() {
  const rapports = [
    {
      titre: "Rapport Standard",
      badge: "Gratuit",
      badgeColor: C.vert,
      desc: "Synthèse complète de votre simulation : bien, financement, charges, comparatif fiscal Réel vs Micro-BIC, rendements et cash-flow. Idéal pour garder une trace ou partager avec votre banquier.",
      contenu: ["Fiche bien (prix, notaire, mobilier, travaux)", "Tableau de financement (crédit, mensualité, assurance)", "Comparatif fiscal Réel vs Micro-BIC", "Rendements brut et net", "Cash-flow mensuel et annuel", "Tableau d'amortissement simplifié"],
    },
    {
      titre: "Rapport Détaillé",
      badge: "Starter",
      badgeColor: C.orange,
      desc: "Rapport approfondi incluant le plan d'amortissement complet par composant, l'évolution du cash-flow sur toute la durée du crédit, et une analyse de sensibilité sur le loyer.",
      contenu: ["Tout du rapport standard", "Plan d'amortissement par composant (40 ans)", "Évolution annuelle du cash-flow", "Analyse de sensibilité loyer ±10 %", "Estimation de la valeur du bien en fin de crédit", "Récapitulatif fiscal sur 20 ans"],
    },
    {
      titre: "Rapport Fiscal",
      badge: "Pro",
      badgeColor: C.brun,
      desc: "Document orienté déclaration et conseil fiscal. Comprend le détail précis des charges déductibles, les montants à reporter d'une année sur l'autre, et un guide de la déclaration 2042-C-PRO.",
      contenu: ["Détail ligne par ligne des charges déductibles", "Amortissements à reporter N+1", "Base imposable et calcul de l'impôt détaillé", "Prélèvements sociaux (18,6 %)", "Guide déclaration 2042-C-PRO", "Synthèse à remettre à votre expert-comptable"],
    },
  ] as const;

  return (
    <DemoStatic>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {rapports.map(r => (
          <div key={r.titre} style={{ background: C.fondSec, borderRadius: 10, border: "0.5px solid rgba(26,22,18,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "0.5px solid rgba(26,22,18,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.brun }}>{r.titre}</span>
              <span style={{ background: r.badgeColor, color: "#F5F0E8", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{r.badge}</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", lineHeight: 1.6, marginBottom: 10 }}>{r.desc}</div>
              {r.contenu.map(c => <div key={c} style={{ fontSize: 11, color: "rgba(26,22,18,0.55)", marginBottom: 3, paddingLeft: 10, position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.orange }}>·</span>{c}</div>)}
            </div>
          </div>
        ))}
      </div>
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════════ */
const faqItems = [
  {
    q: "Pourquoi le cash-flow est négatif alors que l'impôt est 0 € ?",
    a: "En LMNP réel, l'amortissement réduit la base imposable — souvent à 0 €. Mais l'amortissement est une charge comptable, pas une sortie de cash. Ce qui sort réellement de votre poche chaque mois, c'est la mensualité du crédit (capital + intérêts + assurance). La part capital du remboursement n'est pas déductible fiscalement. Résultat : votre base imposable est nulle, mais vous déboursez tout de même de l'argent pour rembourser le capital. C'est un enrichissement différé, pas une perte.",
  },
  {
    q: "Le remboursement du capital est-il une charge déductible ?",
    a: "Non. Seuls les intérêts d'emprunt sont déductibles en LMNP réel. Le capital remboursé chaque mois augmente votre patrimoine (vous possédez de plus en plus votre bien) mais ne réduit pas votre base imposable. Sur 235 000 € empruntés à 3,5 % / 20 ans, la mensualité est de 1 363 € dont ~685 € d'intérêts déductibles et ~678 € de capital non déductible.",
  },
  {
    q: "Quel amortissement choisir : par composant ou global ?",
    a: "La méthode par composant ventile le bien en 5 à 6 éléments (gros œuvre, toiture, aménagements…) chacun amorti sur sa propre durée. Elle génère souvent plus d'amortissements en début de période (via les éléments à courte durée) mais requiert une comptabilité précise. La méthode globale est plus simple : 85 % du prix sur 25 ans. Dans notre exemple, la méthode par composant génère 9 925 €/an vs 9 800 €/an en global — l'écart est faible ici. Demandez conseil à votre expert-comptable.",
  },
  {
    q: "Puis-je modifier ma simulation après avoir vu les résultats ?",
    a: "Oui. ToutLMNP vous permet de revenir en arrière à tout moment pour modifier n'importe quel paramètre : loyer, taux, charges, régime fiscal, méthode d'amortissement… Les résultats se recalculent instantanément. C'est précisément l'intérêt du simulateur : testez autant de variantes que nécessaire.",
  },
  {
    q: "Qu'est-ce que l'amortissement à reporter N+1 ?",
    a: `Quand votre amortissement (${fEur(EX.amortTotal)}/an dans l'exemple) dépasse votre résultat avant amortissement (${fEur(EX.resultatAvantAmort)}), l'excédent (${fEur(EX.amortAReporter)}) ne peut pas être déduit cette année mais est reporté sur les exercices futurs. Ce mécanisme est très avantageux : vous constituez une réserve fiscale qui s'épuisera progressivement au fil des années.`,
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {faqItems.map((item, i) => (
        <div key={i} style={{ background: C.fondSec, borderRadius: 10, border: "0.5px solid rgba(26,22,18,0.1)", overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} style={{ width: "100%", textAlign: "left", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: C.texte, gap: 12, outline: "none" }}>
            <span>{item.q}</span>
            <span style={{ fontSize: "1.1rem", color: C.orange, flexShrink: 0 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div style={{ padding: "0 18px 16px", fontSize: 14, color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

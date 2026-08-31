"use client";

import { useState, type ReactNode, type CSSProperties } from "react";

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
const INPUT_STYLE: CSSProperties = { background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)", borderRadius: 6, padding: "10px 12px", fontSize: 14, color: "#1A1612", width: "100%", boxSizing: "border-box" };
const LABEL_STYLE: CSSProperties = { display: "block", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,22,18,0.45)", marginBottom: 6 };

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
      <div style={{ background: C.brun, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
      <div style={{ background: C.brun, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
   Dictionnaire d'explications — un champ = une fiche
══════════════════════════════════════════════════════════════════ */
type Fiche = { label: string; type: string; explication: string; astuce?: string };

const FICHES: Record<string, Fiche> = {
  /* ── Bien & financement ── */
  prix: {
    label: "Prix d'achat", type: "€",
    explication: "Le prix net vendeur, hors frais de notaire. C'est la base de tous tes calculs : le montant que tu empruntes, tes rendements, et la valeur que tu vas amortir chaque année.",
    astuce: "N'y inclus pas les frais d'agence si tu comptes les financer à part.",
  },
  notaire: {
    label: "Frais de notaire", type: "auto",
    explication: "Calculés automatiquement pour toi (7 à 8 % dans l'ancien, 2 à 3 % dans le neuf). Ils s'ajoutent au prix dans ton investissement total. Bonne nouvelle : en LMNP réel, tu les amortis sur 25 ans.",
    astuce: "Ton notaire t'a donné le montant exact ? Saisis-le directement, tu gagnes en précision.",
  },
  mobilier: {
    label: "Mobilier (€)", type: "€",
    explication: "Ce que tu dépenses pour meubler : cuisine équipée, literie, électroménager, vaisselle. En LMNP c'est obligatoire — et ça s'amortit séparément sur 5 à 10 ans, donc ça réduit encore ta base imposable.",
    astuce: "Compte 3 000 à 15 000 € selon le standing que tu vises.",
  },
  travaux: {
    label: "Travaux (€)", type: "€",
    explication: "Le montant de tes travaux de rénovation. Attention : au régime réel tu ne les déduis pas d'un coup — tu les amortis sur 10 à 20 ans selon leur nature.",
    astuce: "Des travaux lourds peuvent quasiment doubler ton amortissement annuel.",
  },
  apport: {
    label: "Apport personnel", type: "€",
    explication: "Ce que tu sors de ta poche. Plus tu mets d'apport, plus ta mensualité baisse et plus ton cash-flow s'améliore — mais tu perds en effet de levier. Au minimum, essaie de couvrir les frais de notaire.",
    astuce: "Teste les deux : 0 € d'apport pour le levier maximum, puis ton apport réel. L'écart de cash-flow te surprendra.",
  },
  duree: {
    label: "Durée du crédit", type: "ans",
    explication: "Sur combien d'années tu rembourses. Allonger la durée fait baisser ta mensualité (donc améliore ton cash-flow) mais tu paies plus d'intérêts au total. En LMNP on privilégie souvent le cash-flow.",
    astuce: "Passe de 20 à 25 ans et regarde ton cash-flow mensuel : c'est le levier le plus rapide.",
  },
  taux: {
    label: "Taux d'intérêt annuel", type: "%",
    explication: "Ton taux annuel hors assurance. En 2026, compte 3,0 à 4,5 % selon ta durée et ton profil. Le simulateur calcule tes intérêts exacts de la 1re année — et au régime réel, tu les déduis intégralement.",
    astuce: "0,5 % de taux en plus sur 235 000 € / 20 ans, c'est environ 60 €/mois de cash-flow en moins.",
  },
  assEmpr: {
    label: "Assurance emprunteur", type: "% du capital emprunté/an",
    explication: "Elle s'exprime en pourcentage annuel du capital emprunté — typiquement 0,10 à 0,40 %. Sur 235 000 € à 0,25 %, ça te fait 588 €/an, soit 49 €/mois. Tu la déduis comme charge financière au réel.",
    astuce: "Renégocie-la après un an : tu peux souvent diviser ce coût par deux.",
  },

  /* ── Loyer ── */
  loyerHC: {
    label: "Loyer HC / mois (€)", type: "€/mois",
    explication: "Ton loyer hors charges, c'est-à-dire ce qui te reste vraiment. C'est ce montant — et lui seul — qui sert au calcul de tes rendements et de ta base imposable.",
    astuce: "Sois réaliste : prends le loyer réellement pratiqué dans le quartier, pas celui espéré par le vendeur.",
  },
  chargesLoc: {
    label: "Charges locataire / mois (€)", type: "€/mois",
    explication: "Les charges que tu récupères auprès de ton locataire (eau, ordures ménagères, gardien…). Elles ne t'enrichissent pas : elles transitent par ton compte. C'est pour ça qu'elles n'entrent pas dans le rendement — mais le simulateur les intègre bien dans ta base fiscale.",
    astuce: "Ne les confonds pas avec tes charges de copropriété non récupérables, qui sont une vraie dépense pour toi.",
  },
  saisonnier: {
    label: "Location saisonnière", type: "option",
    explication: "Coche cette case si tu loues en courte durée (Airbnb, Booking…). Tu remplaces alors le loyer mensuel fixe par un prix à la nuitée et trois taux d'occupation, et le simulateur te calcule trois scénarios.",
    astuce: "Attention : en Micro-BIC saisonnier non classé, ton abattement tombe à 30 % au lieu de 50 %.",
  },

  /* ── Autres charges déductibles ── */
  tf: {
    label: "Taxe foncière", type: "€/an",
    explication: "Le montant figure sur l'avis de taxe foncière du bien. C'est une charge que tu déduis intégralement au régime réel, et souvent l'une des plus lourdes.",
    astuce: "Demande le montant exact au vendeur avant de faire une offre. Une TF à 2 500 €/an, c'est un mois et demi de loyer qui part chaque année.",
  },
  copro: {
    label: "Charges de copropriété", type: "€/an",
    explication: "La part que tu ne récupères pas sur ton locataire : entretien des parties communes, ravalement, ascenseur. La part récupérable, elle, se saisit dans « Charges locataire ». Les deux sont déductibles au réel.",
    astuce: "Compte 1 000 à 3 500 €/an selon la taille et l'ancienneté de l'immeuble. Demande les 3 derniers PV d'AG.",
  },
  pno: {
    label: "Assurance PNO / GLI", type: "% du loyer annuel",
    explication: "Ton assurance Propriétaire Non Occupant (obligatoire) et, si tu la prends, la Garantie Loyers Impayés. Tu la saisis en % de ton loyer annuel : sur 19 200 €/an, 1 % = 192 €/an. Déductible au réel.",
    astuce: "PNO seule : 0,2 à 0,5 %. PNO + GLI : 2 à 4 % du loyer annuel.",
  },
  gestion: {
    label: "Gestion locative", type: "% du loyer HC/an",
    explication: "Si tu confies ton bien à une agence, compte 6 à 10 % du loyer HC. C'est entièrement déductible au réel. Si tu gères toi-même, laisse 0.",
    astuce: "6 % sur 19 200 €/an, c'est 1 152 €/an — soit près de 100 €/mois de cash-flow en moins.",
  },
  entretien: {
    label: "Entretien courant", type: "€/an",
    explication: "Ta provision annuelle pour les petites réparations : plomberie, peinture, électroménager à remplacer. Beaucoup l'oublient et se retrouvent avec un cash-flow bien plus faible que prévu.",
    astuce: "Règle simple : provisionne 0,5 à 1 % du prix d'achat chaque année.",
  },
  compta: {
    label: "Comptabilité LMNP", type: "€/an",
    explication: "Les honoraires de ton expert-comptable spécialisé LMNP. Entre 300 et 800 €/an. C'est obligatoire si tu veux tenir une comptabilité d'amortissement au régime réel — et c'est déductible.",
    astuce: "Ça peut sembler contraignant, mais c'est ce cabinet qui te sauvera en cas de contrôle fiscal.",
  },
};

/* ══════════════════════════════════════════════════════════════════
   Bloc générique : capture à gauche, explication à droite
══════════════════════════════════════════════════════════════════ */
function ChampsAvecExplications({
  titre,
  entete,
  champs,
  intro,
  colonnes = 2,
}: {
  titre: string;
  entete: string;
  champs: { key: string; value: string; auto?: boolean }[];
  intro: string;
  colonnes?: number;
}) {
  const [actif, setActif] = useState<string | null>(null);
  const fiche = actif ? FICHES[actif] : null;

  return (
    <DemoWrapper title={titre}>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 18, alignItems: "start" }}>

        {/* ── Colonne gauche : la capture d'écran du simulateur ── */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A1612", marginBottom: 12 }}>{entete}</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))`, gap: 10 }}>
            {champs.map(({ key, value, auto }) => {
              const f = FICHES[key];
              const on = actif === key;
              return (
                <button
                  key={key}
                  onClick={() => setActif(on ? null : key)}
                  aria-pressed={on}
                  style={{
                    textAlign: "left", cursor: "pointer",
                    background: on ? "rgba(201,91,42,0.09)" : (auto ? "rgba(201,91,42,0.06)" : C.fondSec),
                    border: on ? `1.5px solid ${C.orange}` : "0.5px solid rgba(26,22,18,0.12)",
                    borderRadius: 6, padding: "10px 12px", transition: "all 130ms", outline: "none",
                  }}>
                  <div style={LABEL_STYLE}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.texte }}>{value}</div>
                  {f.type !== "€" && f.type !== "auto" && f.type !== "option" && (
                    <div style={{ fontSize: 10, color: "rgba(26,22,18,0.4)", marginTop: 2 }}>{f.type}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Colonne droite : l'explication, au même niveau ── */}
        <div>
          {fiche ? (
            <div style={{ padding: "16px 18px", background: "rgba(201,91,42,0.07)", borderRadius: 10, border: `1px solid rgba(201,91,42,0.25)` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginBottom: 6 }}>
                {fiche.label}{" "}
                <span style={{ fontWeight: 400, color: "rgba(26,22,18,0.45)", fontSize: 11 }}>— {fiche.type}</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(26,22,18,0.75)", lineHeight: 1.7, marginBottom: fiche.astuce ? 10 : 0 }}>{fiche.explication}</div>
              {fiche.astuce && (
                <div style={{ fontSize: 12, color: C.vert, lineHeight: 1.6, borderTop: "1px solid rgba(26,122,82,0.18)", paddingTop: 8 }}>
                  💡 {fiche.astuce}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "16px 18px", background: "rgba(26,22,18,0.03)", borderRadius: 10, border: "1px dashed rgba(26,22,18,0.18)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(26,22,18,0.4)", marginBottom: 8 }}>
                👆 Clique sur un champ
              </div>
              <div style={{ fontSize: 13, color: "rgba(26,22,18,0.6)", lineHeight: 1.7 }}>{intro}</div>
            </div>
          )}
        </div>
      </div>
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 1a — Bien & Financement
══════════════════════════════════════════════════════════════════ */
export function SectionBienFinancement() {
  return (
    <ChampsAvecExplications
      titre="Bien & Financement — clique sur un champ pour le comprendre"
      entete="Bien & Financement"
      intro="Chaque champ de cette colonne détermine ce que ton projet te coûte vraiment : le montant que tu empruntes, ta mensualité, et la valeur que tu pourras amortir. Clique sur l'un d'eux pour savoir quoi y mettre."
      champs={[
        { key: "prix", value: "250 000 €" },
        { key: "notaire", value: "20 000 € (auto)", auto: true },
        { key: "mobilier", value: "5 000 €" },
        { key: "travaux", value: "0 €" },
        { key: "apport", value: "40 000 €" },
        { key: "duree", value: "20 ans" },
        { key: "taux", value: "3,5 %" },
        { key: "assEmpr", value: "0,25 % / an" },
      ]}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 1b — Loyer
══════════════════════════════════════════════════════════════════ */
export function SectionLoyer() {
  return (
    <ChampsAvecExplications
      titre="Loyer — clique sur un champ pour le comprendre"
      entete="Loyer"
      colonnes={1}
      intro="C'est ici que tu déclares ce que ton bien te rapporte. La distinction entre loyer hors charges et charges locataire est essentielle : seul le premier compte dans ton rendement."
      champs={[
        { key: "loyerHC", value: "1 600 €" },
        { key: "chargesLoc", value: "50 €" },
        { key: "saisonnier", value: "Non cochée" },
      ]}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 1c — Autres charges déductibles
══════════════════════════════════════════════════════════════════ */
export function SectionAutresCharges() {
  return (
    <ChampsAvecExplications
      titre="Autres charges déductibles — clique sur un champ pour le comprendre"
      entete="Autres charges déductibles"
      intro="Ce sont tes charges récurrentes, celles qui grignotent ton cash-flow tous les mois. Au régime réel, tu les déduis intégralement. Deux d'entre elles se saisissent en pourcentage — clique dessus, ce sont les plus souvent sous-estimées."
      champs={[
        { key: "tf", value: "1 600 €/an" },
        { key: "copro", value: "1 000 €/an" },
        { key: "pno", value: "0,3 % du loyer" },
        { key: "gestion", value: "0 % (autogéré)" },
        { key: "entretien", value: "500 €/an" },
        { key: "compta", value: "500 €/an" },
      ]}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 2 — Option Saisonnière (réplique exacte du toggle)
══════════════════════════════════════════════════════════════════ */
export function SectionSaisonnier() {
  const [on, setOn] = useState(false);
  return (
    <DemoWrapper title="Option Location Saisonnière — coche la case pour voir le changement">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 38, marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
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
            <div style={{ fontSize: 11, marginTop: 8, color: "#1A1612", lineHeight: 1.5 }}>Tes calculs de rentabilité approfondis sont effectués avec l&apos;estimation <strong>Moyenne</strong>.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Loyer HC / mois (€)", val: "1 600", sub: "Hors charges locataire" },
            { label: "Charges locataire / mois (€)", val: "50", sub: "Neutre — non inclus dans le rendement" },
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
   SECTION 3 — Les deux régimes
══════════════════════════════════════════════════════════════════ */
export function SectionRegimes() {
  const [sel, setSel] = useState<"reel" | "bic" | null>(null);
  const regimes = [
    {
      key: "reel" as const, label: "Régime Réel Simplifié", badge: "Recommandé LMNP",
      color: C.orange,
      points: ["Tu déduis toutes tes charges réelles", "Tu amortis ton bien chaque année", "Ton impôt est souvent nul la 1re décennie", "Comptabilité obligatoire (~500 €/an)", "Idéal si tes charges + amortissements dépassent 50 % de tes revenus"],
      bas: false,
    },
    {
      key: "bic" as const, label: "Micro-BIC", badge: "Abattement 50 %",
      color: "#1A1612",
      points: ["Abattement forfaitaire de 50 % sur tes recettes", "Aucune comptabilité, déclaration simple", "Pas d'amortissement → tu es imposé sur 50 % de tes revenus", "Avantageux si tes charges réelles sont sous 50 % des revenus", "Plafonné à 77 700 € de recettes/an (meublé classique)"],
      bas: true,
    },
  ] as const;

  const selected = sel ? regimes.find(r => r.key === sel) : null;
  return (
    <DemoWrapper title="Choisir ton régime fiscal — clique pour explorer">
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
        {regimes.map(r => (
          <button key={r.key} onClick={() => setSel(sel === r.key ? null : r.key)} aria-pressed={sel === r.key} style={{ textAlign: "left", cursor: "pointer", background: sel === r.key ? "rgba(201,91,42,0.06)" : C.fondSec, border: sel === r.key ? `2px solid ${r.color}` : "0.5px solid rgba(26,22,18,0.12)", borderRadius: 10, padding: 0, overflow: "hidden", transition: "all 150ms", outline: "none" }}>
            <div style={{ background: r.color, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {sel === r.key && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5F0E8" }} />}
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#F5F0E8" }}>{r.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#F5F0E8", background: "rgba(245,240,232,0.2)", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>{r.bas ? r.badge : `✓ ${r.badge}`}</span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              {r.points.map(p => <div key={p} style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", marginBottom: 4, paddingLeft: 10, position: "relative" }}><span style={{ position: "absolute", left: 0, top: 1 }}>·</span>{p}</div>)}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: selected.key === "reel" ? "rgba(201,91,42,0.07)" : "rgba(26,22,18,0.05)", borderRadius: 8, border: `1px solid ${selected.key === "reel" ? "rgba(201,91,42,0.25)" : "rgba(26,22,18,0.12)"}`, fontSize: 13, color: "rgba(26,22,18,0.7)", lineHeight: 1.7 }}>
          {selected.key === "reel"
            ? "Le régime réel est adapté à la quasi-totalité des investissements LMNP financés à crédit. L'amortissement de ton bien réduit — voire annule — ta base imposable pendant que tu rembourses. Résultat : tu peux être à 0 € d'impôt pendant 10 à 15 ans."
            : "Le Micro-BIC te convient si tes charges réelles sont faibles : bien sans crédit, déjà amorti, à haut rendement. Mais dès que tu as un crédit immobilier en cours, le réel devient presque toujours plus avantageux."}
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Tableau fiscal réel — réutilisé section 4 et section 9
══════════════════════════════════════════════════════════════════ */
function TableauReel() {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `2.5px solid ${C.orange}`, boxShadow: "0 0 0 3px rgba(201,91,42,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", background: C.orange }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F5F0E8" }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#F5F0E8" }}>Régime réel simplifié</span>
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#F5F0E8", background: "rgba(245,240,232,0.2)", padding: "2px 10px", borderRadius: 4 }}>✓ SÉLECTIONNÉ</span>
      </div>
      <div style={{ padding: "0 20px", background: "#FDFAF6" }}>
        <FRow label="Loyers annuels (HC)" val={fEur(EX.loyerAnnuel)} bold />
        <FRow label="Emprunt (mensualités × 12)" val={`−${fEur(EX.creditAnnuel)}`} color={C.rouge} />
        <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(26,22,18,0.6)" }}>Dont frais d&apos;emprunt (intérêts) </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.rouge }}>{fEur(EX.interets)}</span>
        </div>
        <FRow label="Charges déductibles" val={`−${fEur(EX.chargesDeductibles)}`} color={C.rouge} />
        <FRow label="Résultat avant amortissement" val={fEur(EX.resultatAvantAmort)} bold color={C.vert} sep />
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
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 4 — Calcul de l'impôt
══════════════════════════════════════════════════════════════════ */
export function SectionImpot() {
  const [sel, setSel] = useState<"reel" | "bic">("reel");
  return (
    <DemoWrapper title="Comment ton impôt est calculé — bascule entre les deux régimes">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["reel", "bic"] as const).map(k => (
          <button key={k} onClick={() => setSel(k)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, background: sel === k ? (k === "reel" ? C.orange : "#1A1612") : C.fondSec, color: sel === k ? "#F5F0E8" : C.texte, border: sel === k ? "none" : "0.5px solid rgba(26,22,18,0.12)", transition: "all 150ms" }}>
            {k === "reel" ? "Régime Réel" : "Micro-BIC"}
          </button>
        ))}
      </div>

      {sel === "reel" ? <TableauReel /> : (
        <div style={{ borderRadius: 10, overflow: "hidden", border: "2.5px solid #1A1612", boxShadow: "0 0 0 3px rgba(26,22,18,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", background: "#1A1612" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F5F0E8" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#F5F0E8" }}>Micro-BIC</span>
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#F5F0E8", background: "rgba(245,240,232,0.2)", padding: "2px 10px", borderRadius: 4 }}>✓ SÉLECTIONNÉ</span>
          </div>
          <div style={{ padding: "0 20px", background: "#FDFAF6" }}>
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
          </div>
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 5 — Quel régime choisir
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
        ✓ Régime Réel Simplifié — tu économises {fEur(EX.impotBIC - EX.impotReel)} d&apos;impôt par an, soit {fEur(EX.cashflowReel - EX.cashflowBIC)} de cash-flow mensuel en plus.
      </div>
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Détail d'amortissement — réutilisé section 7 et section 9
══════════════════════════════════════════════════════════════════ */
const COMPOSANTS = [
  { label: "Gros œuvre (bâti)", pct: "45 %", duree: "40 ans", amtAn: "2 391 €/an" },
  { label: "Toiture", pct: "15 %", duree: "25 ans", amtAn: "1 275 €/an" },
  { label: "Aménagements intérieurs", pct: "20 %", duree: "15 ans", amtAn: "2 833 €/an" },
  { label: "Installation électrique", pct: "10 %", duree: "20 ans", amtAn: "1 063 €/an" },
  { label: "Étanchéité / plomberie", pct: "10 %", duree: "20 ans", amtAn: "1 063 €/an" },
];

function DetailComposants() {
  return (
    <>
      <div style={{ fontSize: 12, color: "rgba(26,22,18,0.5)", marginBottom: 8 }}>Valeur amortissable de ton bien : 250 000 € × 85 % = <strong style={{ color: C.bleu }}>212 500 €</strong></div>
      <div style={{ display: "grid", gap: 6 }}>
        {COMPOSANTS.map(({ label, pct, duree, amtAn }) => (
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
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 7 — Amortissement : composant vs global
══════════════════════════════════════════════════════════════════ */
export function SectionAmortissement() {
  const [mode, setMode] = useState<"composant" | "global">("composant");
  return (
    <DemoWrapper title="Méthode d'amortissement — bascule pour comparer">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["composant", "global"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, background: mode === m ? C.bleu : C.fondSec, color: mode === m ? "#F5F0E8" : C.texte, border: mode === m ? `1.5px solid ${C.bleu}` : "0.5px solid rgba(26,22,18,0.12)", transition: "all 150ms" }}>
            {m === "composant" ? "Par Composant" : "Global Simplifié"}
          </button>
        ))}
      </div>

      {mode === "composant" ? <DetailComposants /> : (
        <>
          <div style={{ fontSize: 12, color: "rgba(26,22,18,0.5)", marginBottom: 8 }}>Valeur amortissable de ton bien : 250 000 € × 85 % = <strong style={{ color: C.bleu }}>212 500 €</strong>, sur une durée unique.</div>
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
   SECTION 9 — Le récapitulatif complet
══════════════════════════════════════════════════════════════════ */
function SousTitreRecap({ children }: { children?: ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: C.brun, margin: "28px 0 12px", paddingBottom: 6, borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
      {children}
    </div>
  );
}

export function SectionRecap() {
  return (
    <DemoStatic>
      {/* ── Partie 1 : les 3 blocs de rappel ── */}
      <SousTitreRecap>1 · Le rappel de ta saisie</SousTitreRecap>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
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

      {/* ── Partie 2 : verdict + KPIs ── */}
      <SousTitreRecap>2 · Le verdict et tes indicateurs</SousTitreRecap>
      <div style={{ padding: "12px 16px", background: "rgba(26,122,82,0.08)", borderRadius: 8, border: `1px solid rgba(26,122,82,0.2)`, marginBottom: 12, fontSize: 13, color: C.vert, fontWeight: 700 }}>
        ✓ Régime Réel Simplifié recommandé — Impôt : 0 € — Cash-flow : {fEur(EX.cashflowReel)}/mois
      </div>
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

      {/* ── Partie 3 : le tableau du régime retenu ── */}
      <SousTitreRecap>3 · Le tableau du régime que tu as retenu</SousTitreRecap>
      <div style={{ fontSize: 12, color: "rgba(26,22,18,0.6)", lineHeight: 1.7, marginBottom: 12 }}>
        Le récapitulatif ne se contente pas de te donner un verdict : il te réaffiche le tableau fiscal complet du régime retenu, ligne à ligne. Tu peux ainsi revérifier d&apos;où sort chaque chiffre sans remonter dans la page.
      </div>
      <TableauReel />

      {/* ── Partie 4 : le détail de l'amortissement ── */}
      <SousTitreRecap>4 · Le détail de ton amortissement</SousTitreRecap>
      <div style={{ fontSize: 12, color: "rgba(26,22,18,0.6)", lineHeight: 1.7, marginBottom: 12 }}>
        Si tu es au régime réel, le récapitulatif déroule aussi le détail de ton amortissement — composant par composant, avec la durée retenue pour chacun et le montant annuel correspondant. C&apos;est le justificatif de la ligne « Amortissements » du tableau ci-dessus.
      </div>
      <DetailComposants />
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 10 — Cash-flow sur 25 ans
══════════════════════════════════════════════════════════════════ */
export function SectionCashflow() {
  const W = 520, H = 200, PAD = { top: 30, right: 20, bottom: 30, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const points = Array.from({ length: 26 }, (_, i) => {
    let cf: number;
    if (i <= 20) {
      cf = EX.cashflowReel + i * 5;
    } else {
      cf = EX.cashflowReel + 100 + (i - 20) * 135;
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
          {[0, 400, 800, 1200].map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="rgba(26,22,18,0.07)" strokeWidth={1} />
              <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.35)">{v > 0 ? `+${v}` : v} €</text>
            </g>
          ))}
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="rgba(26,22,18,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={PAD.left - 6} y={zeroY + 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.5)">0 €</text>
          <line x1={toX(20)} y1={PAD.top} x2={toX(20)} y2={H - PAD.bottom} stroke="rgba(201,91,42,0.3)" strokeWidth={1} strokeDasharray="3 2" />
          <text x={toX(20)} y={PAD.top - 4} textAnchor="middle" fontSize={9} fill={C.orange}>Fin crédit</text>
          <clipPath id="clip-above"><rect x={PAD.left} y={zeroY} width={innerW} height={innerH + PAD.top} /></clipPath>
          <clipPath id="clip-below"><rect x={PAD.left} y={PAD.top} width={innerW} height={zeroY - PAD.top} /></clipPath>
          <path d={areaD} fill="rgba(26,122,82,0.1)" clipPath="url(#clip-above)" />
          <path d={areaD} fill="rgba(176,58,42,0.08)" clipPath="url(#clip-below)" />
          <path d={pathD} fill="none" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <text x={toX(0) + 4} y={toY(EX.cashflowReel) - 6} fontSize={9} fill={C.rouge}>{fEur(EX.cashflowReel)}/mois</text>
          <text x={toX(25) - 4} y={toY(points[25].y) - 6} textAnchor="end" fontSize={9} fill={C.vert}>+{fEur(points[25].y)}/mois</text>
          <text x={PAD.left} y={H - 4} fontSize={9} fill="rgba(26,22,18,0.35)">An 1</text>
          <text x={toX(20)} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(26,22,18,0.35)">An 20</text>
          <text x={W - PAD.right} y={H - 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.35)">An 25</text>
        </svg>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "rgba(26,22,18,0.4)", marginTop: 6 }}>
        Projection à loyer stable. À partir de l&apos;an 21, ton crédit est remboursé : ton cash-flow devient fortement positif.
      </div>
    </DemoStatic>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 11 — Les 3 rapports (avec les vrais boutons)
══════════════════════════════════════════════════════════════════ */
export function SectionRapports() {
  const rapports = [
    {
      cle: "invest",
      fond: "#1A4A35", accent: "#2ECC71",
      ligne1: "Rapport", ligne2: "Invest",
      desc: "Ton dossier d'investisseur complet : la synthèse de ton projet, le comparatif fiscal des deux régimes, tes rendements et la projection de ton cash-flow. C'est celui à garder sous la main pour décider.",
      contenu: ["Fiche du bien (prix, notaire, mobilier, travaux)", "Plan de financement et mensualités", "Comparatif Réel vs Micro-BIC", "Rendements brut et net", "Cash-flow mensuel et annuel", "Projection sur toute la durée du crédit"],
    },
    {
      cle: "synthese",
      fond: "#6B2D12", accent: "#C95B2A",
      ligne1: "Synthèse", ligne2: "d'investissement",
      desc: "La version approfondie, orientée fiscalité. Tu y retrouves le détail ligne à ligne de tes charges déductibles et le plan d'amortissement complet — c'est le document à transmettre à ton expert-comptable.",
      contenu: ["Détail des charges déductibles", "Amortissement par composant, année par année", "Base imposable et calcul de l'impôt", "Amortissements à reporter en N+1", "Traitement de la plus-value à la revente", "Annexes de projection détaillées"],
    },
    {
      cle: "banque",
      fond: "#1A2D45", accent: "#4A9FCA",
      ligne1: "Synthèse financière", ligne2: "– Banque",
      desc: "Un dossier pensé pour ton banquier : présentation sobre, chiffres clés mis en avant, et l'analyse de ta capacité de remboursement. À joindre à ta demande de financement.",
      contenu: ["Présentation du projet et du plan de financement", "Capacité de remboursement et taux d'effort", "Scénarios de sensibilité", "Cash-flow après fiscalité", "Valeur patrimoniale constituée", "Format sobre, prêt à imprimer"],
    },
  ] as const;

  return (
    <DemoStatic>
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
        {rapports.map(r => (
          <div key={r.cle}>
            {/* Le bouton, tel qu'il apparaît sur la page rapport */}
            <div
              className="rounded-xl flex items-center gap-2"
              style={{ background: r.fond, padding: "10px 12px", minHeight: 52, marginBottom: 10 }}>
              <span className="font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: r.accent, color: r.fond, fontSize: 9 }}>PDF</span>
              <span className="font-bold leading-tight flex-1" style={{ color: "#F5F0E8", fontSize: 11 }}>
                {r.ligne1}<br />{r.ligne2}
              </span>
              <span style={{ color: r.accent, fontSize: 14, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>→</span>
            </div>

            {/* La case d'explication */}
            <div style={{ background: C.fondSec, borderRadius: 10, border: "0.5px solid rgba(26,22,18,0.1)", padding: "12px 14px", height: "100%" }}>
              <div style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", lineHeight: 1.65, marginBottom: 10 }}>{r.desc}</div>
              {r.contenu.map(c => (
                <div key={c} style={{ fontSize: 11, color: "rgba(26,22,18,0.55)", marginBottom: 3, paddingLeft: 10, position: "relative", lineHeight: 1.5 }}>
                  <span style={{ position: "absolute", left: 0, color: r.accent }}>·</span>{c}
                </div>
              ))}
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
    q: "Pourquoi mon cash-flow est négatif alors que mon impôt est à 0 € ?",
    a: "En LMNP réel, l'amortissement réduit ta base imposable — souvent jusqu'à 0 €. Mais c'est une charge comptable, pas une sortie d'argent. Ce qui quitte vraiment ton compte chaque mois, c'est ta mensualité de crédit (capital + intérêts + assurance), et la part capital n'est pas déductible. Résultat : tu n'es pas imposé, mais tu débourses quand même pour rembourser ton capital. C'est un enrichissement différé, pas une perte.",
  },
  {
    q: "Le remboursement du capital est-il une charge déductible ?",
    a: "Non. Seuls tes intérêts d'emprunt le sont. Le capital que tu rembourses chaque mois augmente ton patrimoine — tu possèdes de plus en plus ton bien — mais ne réduit pas ta base imposable. Sur 235 000 € empruntés à 3,5 % sur 20 ans, ta mensualité de 1 363 € se décompose en ~685 € d'intérêts déductibles et ~678 € de capital non déductible.",
  },
  {
    q: "Quel amortissement choisir : par composant ou global ?",
    a: "La méthode par composant ventile ton bien en 5 à 6 éléments (gros œuvre, toiture, aménagements…), chacun amorti sur sa propre durée. Elle te génère souvent plus d'amortissements en début de période, mais demande une comptabilité précise. La méthode globale est plus simple : 85 % du prix sur 25 ans. Dans notre exemple, tu obtiens 9 925 €/an par composant contre 9 800 €/an en global — l'écart est faible ici. Demande conseil à ton expert-comptable.",
  },
  {
    q: "Puis-je modifier ma simulation après avoir vu les résultats ?",
    a: "Oui, autant de fois que tu veux. Tu peux revenir en arrière à tout moment pour changer n'importe quel paramètre : loyer, taux, charges, régime fiscal, méthode d'amortissement. Tout se recalcule instantanément. C'est précisément l'intérêt du simulateur : teste toutes les variantes qui t'intéressent avant de t'engager.",
  },
  {
    q: "Qu'est-ce que l'amortissement à reporter N+1 ?",
    a: `Quand ton amortissement (${fEur(EX.amortTotal)}/an dans l'exemple) dépasse ton résultat avant amortissement (${fEur(EX.resultatAvantAmort)}), l'excédent (${fEur(EX.amortAReporter)}) ne peut pas être déduit cette année — mais il est reporté sur tes exercices futurs, sans limite de durée. Tu te constitues ainsi une réserve fiscale qui s'épuisera progressivement au fil des années.`,
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

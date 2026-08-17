export type TypeBien = "ap" | "ma";
export type TMI = 0 | 11 | 30 | 41 | 45;

export interface SimulationForm {
  type: TypeBien;
  surface: string;
  villeKey: string;
  villeLabel: string;
  prix: string;
  travaux: string;
  mobilier: string;
  notaire: string;
  chargesCopro: string;
  apport: string;
  duree: number;
  taux: string;
  loyer: string;           // Loyer HC (hors charges locataire)
  chargesLoyer: string;    // Charges récupérables sur locataire (non incluses dans rendement)
  taxeFonciere: string;
  tmi: TMI;
  // Autres charges déductibles
  assurancePNO: string;         // Assurance PNO/GLI annuelle
  gestionLocativePct: string;   // % gestion locative sur loyer HC
  entretienCourant: string;     // Entretien courant annuel
  comptabilite: string;         // Comptabilité LMNP annuelle
  // Charge financière
  assuranceEmprunteur: string;  // Assurance emprunteur annuelle
}

export interface Resultats {
  investTotal: number;
  montantCredit: number;
  mensualite: number;
  creditAnnuel: number;
  interetsAnnee1: number;
  chargesAnnuelles: number;
  autresCharges: number;
  assuranceEmprunteurAnnuel: number;
  loyerAnnuel: number;
  amortBien: number;
  amortMobilier: number;
  amortTravaux: number;
  amortNotaire: number;
  amortTotal: number;
  chargesDeductibles: number;
  resultatAvantAmort: number;
  baseImposableReel: number;
  impotReel: number;
  impotReelMensuel: number;
  amortAReporter: number;
  cashflowReelMensuel: number;
  baseBIC: number;
  impotBIC: number;
  cashflowBICMensuel: number;
  rendementBrut: number;
  rendementNet: number;        // net de charges (avant impôt) — utilisé pour le verdict
  rendementNetReel: number;    // net de charges ET d'impôt réel
  rendementNetBIC: number;     // net de charges ET d'impôt Micro-BIC
}

export interface SimulationData {
  form: SimulationForm;
  amortPct: number;
  amortMode: "ensemble" | "composant";
  amortDureeEnsemble: number;
  composants: { label: string; pct: number; duree: number }[];
  savedAt: number;
  amortDureeMobilier?: number;
  amortDureeTravaux?: number;
  amortDureeNotaire?: number;
  isSaisonnier?: boolean;
  prixNuitee?: string;
  tauxOccBas?: string;
  tauxOccMoyen?: string;
  tauxOccHaut?: string;
  resultatsTriple?: { bas: Resultats | null; moyen: Resultats | null; haut: Resultats | null } | null;
  bienInfo?: { type?: "ap" | "ma"; ville?: string; surface?: string; description?: string };
  selectedRegime?: "micro" | "reel" | null;
}

export function calcMensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  if (capital <= 0 || tauxAnnuel <= 0) return capital / (dureeAns * 12);
  const r = tauxAnnuel / 12;
  const n = dureeAns * 12;
  return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcInteretsAnnee1(capital: number, tauxAnnuel: number, dureeAns: number): number {
  if (capital <= 0 || tauxAnnuel <= 0) return 0;
  const r = tauxAnnuel / 12;
  const n = dureeAns * 12;
  const M = capital * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  let totalInterets = 0;
  let capitalRestant = capital;
  for (let k = 1; k <= 12; k++) {
    const interetMois = capitalRestant * r;
    totalInterets += interetMois;
    capitalRestant -= (M - interetMois);
  }
  return totalInterets;
}

export function computeResultats(
  form: SimulationForm,
  loyerMensuel: number,
  amortPct: number,
  amortMode: "ensemble" | "composant",
  amortDureeEnsemble: number,
  composants: { label: string; pct: number; duree: number }[],
  isSaisonnier = false,
  amortDureeMobilier = 7,
  amortDureeTravaux = 15,
  amortDureeNotaire = 20,
): Resultats | null {
  const prix = parseFloat(form.prix) || 0;
  const travaux = parseFloat(form.travaux) || 0;
  const notaire = parseFloat(form.notaire) || 0;
  const chargesCopro = parseFloat(form.chargesCopro) || 0;
  const apport = parseFloat(form.apport) || 0;
  const taux = parseFloat(form.taux) / 100 || 0;
  const taxeFonciere = parseFloat(form.taxeFonciere) || 0;
  const assurancePNOPct = parseFloat(form.assurancePNO) || 0;
  const gestionLocativePct = parseFloat(form.gestionLocativePct) || 0;
  const entretienCourant = parseFloat(form.entretienCourant) || 0;
  const comptabilite = parseFloat(form.comptabilite) || 0;
  const assuranceEmprunteurPct = parseFloat(form.assuranceEmprunteur) || 0;

  if (prix <= 0 || loyerMensuel <= 0) return null;

  const mobilier = parseFloat(form.mobilier) || 0;
  const investTotal = prix + travaux + notaire;
  const montantCredit = Math.max(0, investTotal - apport);
  const assuranceEmprunteurAnnuel = montantCredit * (assuranceEmprunteurPct / 100);
  const mensualite = calcMensualite(montantCredit, taux, form.duree);
  const creditAnnuel = mensualite * 12;
  const interetsAnnee1 = calcInteretsAnnee1(montantCredit, taux, form.duree);
  const loyerAnnuel = loyerMensuel * 12;

  const assurancePNO = loyerAnnuel * (assurancePNOPct / 100);
  const gestionLocative = loyerAnnuel * (gestionLocativePct / 100);
  const autresCharges = assurancePNO + gestionLocative + entretienCourant + comptabilite;
  const chargesAnnuelles = taxeFonciere + chargesCopro + autresCharges;

  const valeurAmortissable = prix * (amortPct / 100);
  const amortBien = amortMode === "ensemble"
    ? valeurAmortissable / amortDureeEnsemble
    : composants.reduce((sum, c) => sum + (valeurAmortissable * c.pct / 100) / c.duree, 0);
  const amortMobilier = amortDureeMobilier > 0 ? mobilier / amortDureeMobilier : 0;
  const amortTravaux = amortDureeTravaux > 0 ? travaux / amortDureeTravaux : 0;
  const amortNotaire = amortDureeNotaire > 0 ? notaire / amortDureeNotaire : 0;
  const amortTotal = amortBien + amortMobilier + amortTravaux + amortNotaire;

  // Assurance emprunteur = charge financière déductible (comme les intérêts)
  const chargesDeductibles = chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel;
  const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
  const baseImposableReel = Math.max(0, resultatAvantAmort - amortTotal);
  const impotReel = baseImposableReel * (form.tmi / 100 + 0.186);
  const impotReelMensuel = impotReel / 12;
  const amortAReporter = Math.max(0, amortTotal - Math.max(0, resultatAvantAmort));
  const cashflowReelMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotReel) / 12;

  // abattPct = taux d'abattement forfaitaire (30% saisonnier non classé, 50% classique)
  // Base imposable = loyers × (1 − abattPct)
  const abattPct = isSaisonnier ? 0.30 : 0.50;
  const baseBIC = loyerAnnuel * (1 - abattPct);
  const impotBIC = baseBIC * (form.tmi / 100 + 0.186);
  const cashflowBICMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotBIC) / 12;

  // Rendements
  const rendementBrut = (loyerAnnuel / investTotal) * 100;
  const rendementNet = ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100;                          // avant impôt
  const rendementNetReel = ((loyerAnnuel - chargesAnnuelles - impotReel) / investTotal) * 100;          // après impôt réel
  const rendementNetBIC = ((loyerAnnuel - chargesAnnuelles - impotBIC) / investTotal) * 100;            // après impôt BIC

  return {
    investTotal, montantCredit, mensualite, creditAnnuel, interetsAnnee1,
    chargesAnnuelles, autresCharges, assuranceEmprunteurAnnuel,
    loyerAnnuel, amortBien, amortMobilier, amortTravaux, amortNotaire, amortTotal,
    chargesDeductibles, resultatAvantAmort, baseImposableReel, impotReel, impotReelMensuel,
    amortAReporter, cashflowReelMensuel, baseBIC, impotBIC, cashflowBICMensuel,
    rendementBrut, rendementNet, rendementNetReel, rendementNetBIC,
  };
}

export function fEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR",
    maximumFractionDigits: 0, minimumFractionDigits: 0,
  }).format(n);
}

export function fPct(n: number): string { return n.toFixed(2) + " %"; }

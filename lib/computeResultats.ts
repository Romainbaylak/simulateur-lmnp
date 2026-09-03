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
  amortDureeMobilier = 10,
  amortDureeTravaux = 20,
  amortDureeNotaire = 25,
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
  // mobilier inclus dans l'investissement total (financé au même titre que prix/travaux/notaire)
  const investTotal = prix + travaux + notaire + mobilier;
  const montantCredit = Math.max(0, investTotal - apport);
  const assuranceEmprunteurAnnuel = montantCredit * (assuranceEmprunteurPct / 100);
  const mensualite = calcMensualite(montantCredit, taux, form.duree);
  const creditAnnuel = mensualite * 12;
  const interetsAnnee1 = calcInteretsAnnee1(montantCredit, taux, form.duree);
  const loyerAnnuel = loyerMensuel * 12;

  // Charges locataires récupérables incluses dans la base fiscale
  const chargesLocatairesAnnuel = (parseFloat(form.chargesLoyer) || 0) * 12;
  const recettesAnnuelles = loyerAnnuel + chargesLocatairesAnnuel;

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
  const resultatAvantAmort = recettesAnnuelles - chargesDeductibles;
  const baseImposableReel = Math.max(0, resultatAvantAmort - amortTotal);
  const impotReel = baseImposableReel * (form.tmi / 100 + 0.186);
  const impotReelMensuel = impotReel / 12;
  const amortAReporter = Math.max(0, amortTotal - Math.max(0, resultatAvantAmort));
  const cashflowReelMensuel = (recettesAnnuelles - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotReel) / 12;

  // abattPct = taux d'abattement forfaitaire (30% saisonnier non classé, 50% classique)
  const abattPct = isSaisonnier ? 0.30 : 0.50;
  const baseBIC = recettesAnnuelles * (1 - abattPct);
  const impotBIC = baseBIC * (form.tmi / 100 + 0.186);
  const cashflowBICMensuel = (recettesAnnuelles - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotBIC) / 12;

  // Rendements (base loyer HC, investTotal inclut mobilier)
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

/* ════════════════════════════════════════════════════════════════════════════
   MOTEUR DE PROJECTION UNIQUE
   Utilisé par les trois rapports PDF (Invest / Synthèse / Banque) afin qu'ils
   soient trois vues d'un même calcul, et jamais trois formules différentes.

   Règles :
   - chaque composant s'amortit sur SA propre durée puis s'éteint ;
   - l'amortissement non consommé est reporté sans limitation de durée ;
   - l'assurance emprunteur ne court que pendant le crédit ;
   - l'année 1 de la projection reproduit exactement computeResultats().
════════════════════════════════════════════════════════════════════════════ */

export interface ProjectionParams {
  prix: number;
  travaux: number;
  mobilier: number;
  notaire: number;
  montantCredit: number;
  duree: number;
  taux: number;                    // taux annuel en décimal (0.035)
  loyerAnnuel: number;             // loyer HC annuel
  chargesLocatairesAnnuel: number; // charges récupérables sur le locataire
  chargesAnnuelles: number;        // charges d'exploitation (TF, copro, PNO, gestion…)
  assuranceEmprunteurAnnuel: number;
  tmi: number;                     // en %
  amortPct: number;                // % du prix amortissable
  amortMode: "ensemble" | "composant";
  amortDureeEnsemble: number;
  composants: { label: string; pct: number; duree: number }[];
  amortDureeMobilier: number;
  amortDureeTravaux: number;
  amortDureeNotaire: number;
  isMicro: boolean;
  isSaisonnier: boolean;
  horizon?: number;                // nb d'années à projeter
}

export interface ProjectionYear {
  year: number;
  /** capital restant dû au 1er jour de l'année */
  capitalDebut: number;
  /** capital restant dû au dernier jour de l'année */
  capitalFin: number;
  capitalRembourse: number;
  capitalRembourseCumul: number;
  interets: number;
  creditAnnuel: number;
  assuranceEmprunteur: number;
  /** dotation aux amortissements de l'année (composants encore actifs) */
  amortDotation: number;
  amortBien: number;
  amortMobilier: number;
  amortTravaux: number;
  amortNotaire: number;
  /** amortissement reporté des exercices antérieurs */
  reportEntrant: number;
  amortDisponible: number;
  /** amortissement réellement imputé cette année */
  amortImpute: number;
  /** amortissement reporté sur N+1 */
  reportSortant: number;
  /** cumul des amortissements effectivement déduits (assiette de plus-value) */
  amortImputeCumul: number;
  recettes: number;
  chargesDeductibles: number;
  resultatAvantAmort: number;
  baseImposable: number;
  impot: number;
  cashflowAnnuel: number;
  cashflowMensuel: number;
}

export const TAUX_PS_LOCATIF = 0.186; // prélèvements sociaux sur revenus locatifs meublés (2026)
export const TAUX_PS_PLUSVALUE = 0.172; // prélèvements sociaux sur plus-values immobilières
export const TAUX_IR_PLUSVALUE = 0.19;

export function computeProjection(p: ProjectionParams): ProjectionYear[] {
  const recettes = p.loyerAnnuel + p.chargesLocatairesAnnuel;
  const abattPct = p.isSaisonnier ? 0.30 : 0.50;
  const baseMicro = recettes * (1 - abattPct);
  const tauxImpot = p.tmi / 100 + TAUX_PS_LOCATIF;

  const valeurAmortissable = p.prix * (p.amortPct / 100);
  const r = p.taux / 12;
  const nMois = p.duree * 12;
  const M = p.montantCredit > 0 && p.taux > 0
    ? p.montantCredit * r * Math.pow(1 + r, nMois) / (Math.pow(1 + r, nMois) - 1)
    : (nMois > 0 ? p.montantCredit / nMois : 0);

  // horizon : au moins la durée du crédit et celle du plus long amortissement, + 5 ans
  const amortMaxDuree = p.amortMode === "ensemble"
    ? p.amortDureeEnsemble
    : Math.max(0, ...p.composants.map(c => c.duree));
  const horizon = p.horizon ?? Math.max(
    p.duree,
    amortMaxDuree,
    p.amortDureeMobilier,
    p.amortDureeTravaux,
    p.amortDureeNotaire,
    20,
  ) + 5;

  const out: ProjectionYear[] = [];
  let capital = p.montantCredit;
  let capitalCumul = 0;
  let report = 0;
  let amortCumul = 0;

  for (let year = 1; year <= horizon; year++) {
    const capitalDebut = Math.max(0, capital);
    let interets = 0;
    let capitalRembourse = 0;
    let creditAnnuel = 0;

    if (year <= p.duree && p.montantCredit > 0) {
      if (p.taux > 0) {
        for (let m = 0; m < 12; m++) {
          const im = capital * r;
          interets += im;
          capital -= (M - im);
        }
        capital = Math.max(0, capital);
        creditAnnuel = M * 12;
        capitalRembourse = creditAnnuel - interets;
      } else {
        creditAnnuel = M * 12;
        capitalRembourse = creditAnnuel;
        capital = Math.max(0, capital - capitalRembourse);
      }
    }
    capitalCumul += capitalRembourse;

    // L'assurance emprunteur ne court que pendant le crédit
    const assuranceEmprunteur = year <= p.duree ? p.assuranceEmprunteurAnnuel : 0;

    // Dotations : chaque élément s'éteint à sa propre durée
    let amortBien = 0;
    if (p.amortMode === "ensemble") {
      amortBien = year <= p.amortDureeEnsemble && p.amortDureeEnsemble > 0
        ? valeurAmortissable / p.amortDureeEnsemble : 0;
    } else {
      for (const c of p.composants) {
        if (c.duree > 0 && year <= c.duree) amortBien += (valeurAmortissable * c.pct / 100) / c.duree;
      }
    }
    const amortMobilier = p.amortDureeMobilier > 0 && year <= p.amortDureeMobilier ? p.mobilier / p.amortDureeMobilier : 0;
    const amortTravaux = p.amortDureeTravaux > 0 && year <= p.amortDureeTravaux ? p.travaux / p.amortDureeTravaux : 0;
    const amortNotaire = p.amortDureeNotaire > 0 && year <= p.amortDureeNotaire ? p.notaire / p.amortDureeNotaire : 0;
    const amortDotation = amortBien + amortMobilier + amortTravaux + amortNotaire;

    const chargesDeductibles = p.chargesAnnuelles + interets + assuranceEmprunteur;
    const resultatAvantAmort = recettes - chargesDeductibles;

    const reportEntrant = report;
    const amortDisponible = amortDotation + reportEntrant;
    // On n'impute que dans la limite du résultat : le LMNP ne peut pas créer
    // de déficit par les amortissements (art. 39 C II 2° CGI).
    const amortImpute = Math.max(0, Math.min(amortDisponible, Math.max(0, resultatAvantAmort)));
    const reportSortant = Math.max(0, amortDisponible - amortImpute);
    report = reportSortant;
    amortCumul += amortImpute;

    const baseReel = Math.max(0, resultatAvantAmort - amortImpute);
    const baseImposable = p.isMicro ? baseMicro : baseReel;
    const impot = baseImposable * tauxImpot;
    const cashflowAnnuel = recettes - creditAnnuel - p.chargesAnnuelles - assuranceEmprunteur - impot;

    out.push({
      year,
      capitalDebut, capitalFin: Math.max(0, capital),
      capitalRembourse, capitalRembourseCumul: capitalCumul,
      interets, creditAnnuel, assuranceEmprunteur,
      amortDotation, amortBien, amortMobilier, amortTravaux, amortNotaire,
      reportEntrant, amortDisponible, amortImpute, reportSortant, amortImputeCumul: amortCumul,
      recettes, chargesDeductibles, resultatAvantAmort,
      baseImposable, impot,
      cashflowAnnuel, cashflowMensuel: cashflowAnnuel / 12,
    });
  }
  return out;
}

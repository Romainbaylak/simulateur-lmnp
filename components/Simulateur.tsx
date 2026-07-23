"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import PopupPaiementUnite from "./PopupPaiementUnite";
import PopupAmortLimite from "./PopupAmortLimite";
import PopupPDFStarter from "./PopupPDFStarter";
import PopupSauvegarder from "./PopupSauvegarder";
import PopupBienInfo, { type BienInfo, defaultBienInfo } from "./PopupBienInfo";

type TypeBien = "ap" | "ma";
type TMI = 0 | 11 | 30 | 41 | 45;

interface FormState {
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
  chargesLoyer: string;    // Charges récupérables sur locataire (neutrales, non dans rendement)
  taxeFonciere: string;
  tmi: TMI;
  // Autres charges déductibles
  assurancePNO: string;
  gestionLocativePct: string;
  entretienCourant: string;
  comptabilite: string;
  // Charge financière
  assuranceEmprunteur: string;
}

interface Resultats {
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
  rendementNet: number;
}

function formatEuro(n: number, decimals = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR",
    maximumFractionDigits: decimals, minimumFractionDigits: decimals,
  }).format(n);
}

function formatPct(n: number): string { return n.toFixed(2) + " %"; }

function calcMensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  if (capital <= 0 || tauxAnnuel <= 0) return capital / (dureeAns * 12);
  const r = tauxAnnuel / 12;
  const n = dureeAns * 12;
  return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcInteretsAnnee1(capital: number, tauxAnnuel: number, dureeAns: number): number {
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

function stripLeadingZeros(val: string): string {
  if (!val) return val;
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toString();
}

function computeResultats(
  form: FormState,
  loyerMensuel: number,
  amortPct: number,
  amortMode: "ensemble" | "composant",
  amortDureeEnsemble: number,
  composants: { label: string; pct: number; duree: number }[]
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
  const amortMobilier = mobilier / 7;
  const amortTravaux = travaux / 15;
  const amortNotaire = notaire / 20;
  const amortTotal = amortBien + amortMobilier + amortTravaux + amortNotaire;

  const chargesDeductibles = chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel;
  const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
  const baseImposableReel = Math.max(0, resultatAvantAmort - amortTotal);
  const impotReel = baseImposableReel * (form.tmi / 100 + 0.186);
  const impotReelMensuel = impotReel / 12;
  const amortAReporter = Math.max(0, amortTotal - Math.max(0, resultatAvantAmort));
  const cashflowReelMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotReel) / 12;

  const baseBIC = loyerAnnuel * 0.70;
  const impotBIC = baseBIC * (form.tmi / 100 + 0.186);
  const cashflowBICMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotBIC) / 12;

  const rendementBrut = (loyerAnnuel / investTotal) * 100;
  const rendementNet = ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100;

  return {
    investTotal, montantCredit, mensualite, creditAnnuel, interetsAnnee1,
    chargesAnnuelles, autresCharges, assuranceEmprunteurAnnuel,
    loyerAnnuel, amortBien, amortMobilier, amortTravaux, amortNotaire, amortTotal,
    chargesDeductibles, resultatAvantAmort, baseImposableReel, impotReel, impotReelMensuel,
    amortAReporter, cashflowReelMensuel, baseBIC, impotBIC, cashflowBICMensuel,
    rendementBrut, rendementNet,
  };
}

const INPUT = "w-full px-3 py-2.5 text-sm rounded-md text-[#1A1612] placeholder-[rgba(26,22,18,0.35)] focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const INPUT_STYLE = { background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)" };
const LABEL = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[rgba(26,22,18,0.45)] mb-1.5";
const AUTO_STYLE = { ...INPUT_STYLE, background: "rgba(201,91,42,0.06)" };

export default function Simulateur() {
  const [form, setForm] = useState<FormState>({
    type: "ap",
    surface: "",
    villeKey: "",
    villeLabel: "",
    prix: "",
    travaux: "0",
    notaire: "",
    chargesCopro: "",
    mobilier: "0",
    apport: "0",
    duree: 20,
    taux: "3.5",
    loyer: "",
    chargesLoyer: "0",
    taxeFonciere: "",
    tmi: 30,
    assurancePNO: "",
    gestionLocativePct: "",
    entretienCourant: "",
    comptabilite: "",
    assuranceEmprunteur: "0.25",
  });
  const [showAutresCharges, setShowAutresCharges] = useState(false);
  const [showLoyerWarning, setShowLoyerWarning] = useState(false);
  const [selectedRegime, setSelectedRegime] = useState<"micro" | "reel" | null>(null);
  const [simulationValidated, setSimulationValidated] = useState(false);

  const [loyerSlider, setLoyerSlider] = useState<number>(0);
  const [sliderMax, setSliderMax] = useState(10000);
  const [isSaisonnier, setIsSaisonnier] = useState(false);
  const [prixNuitee, setPrixNuitee] = useState("");
  const [tauxOccBas, setTauxOccBas] = useState("20");
  const [tauxOccMoyen, setTauxOccMoyen] = useState("35");
  const [tauxOccHaut, setTauxOccHaut] = useState("45");
  const [resultatsTriple, setResultatsTriple] = useState<{
    bas: Resultats | null; moyen: Resultats | null; haut: Resultats | null;
  } | null>(null);
  const [showAmort, setShowAmort] = useState(false);
  const [amortPct, setAmortPct] = useState(85);
  const [amortMode, setAmortMode] = useState<"ensemble" | "composant" | null>(null);
  const [amortDureeEnsemble, setAmortDureeEnsemble] = useState(25);
  const [composants, setComposants] = useState([
    { label: "Bâti / Gros œuvre", pct: 45, duree: 40 },
    { label: "Toiture", pct: 15, duree: 25 },
    { label: "Aménagement intérieur", pct: 20, duree: 15 },
    { label: "Électricité", pct: 10, duree: 20 },
    { label: "Étanchéité", pct: 10, duree: 20 },
  ]);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [showAmortLimite, setShowAmortLimite] = useState(false);
  const [showPDFStarter, setShowPDFStarter] = useState(false);
  const [pdfWeekCount, setPdfWeekCount] = useState(0);
  const [showSauvegarder, setShowSauvegarder] = useState(false);
  const [showBienInfoPopup, setShowBienInfoPopup] = useState(false);
  const [pendingPdfAction, setPendingPdfAction] = useState<"pro" | "starter" | "pay" | null>(null);
  const bienInfoRef = useRef<BienInfo>(defaultBienInfo);

  // Helpers pour lire le plan et les compteurs localStorage
  const getPlan = () => (typeof window !== "undefined" ? localStorage.getItem("lmnp_plan") : null);

  const isAmortBlocked = (): boolean => {
    if (typeof window === "undefined") return false;
    const plan = getPlan();
    if (plan === "starter" || plan === "pro") return false;
    const last = localStorage.getItem("lmnp_amort_last_used");
    const today = new Date().toISOString().slice(0, 10);
    return last === today;
  };

  const markAmortUsed = () => {
    if (typeof window === "undefined") return;
    const plan = getPlan();
    if (plan === "starter" || plan === "pro") return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("lmnp_amort_last_used", today);
  };

  const getPdfWeekCount = (): number => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("lmnp_pdf_week_count");
    if (!stored) return 0;
    try {
      const { count, weekStart } = JSON.parse(stored);
      const currentWeekStart = getWeekStart();
      if (weekStart !== currentWeekStart) return 0;
      return count ?? 0;
    } catch { return 0; }
  };

  const incrementPdfWeekCount = () => {
    if (typeof window === "undefined") return;
    const count = getPdfWeekCount() + 1;
    localStorage.setItem("lmnp_pdf_week_count", JSON.stringify({ count, weekStart: getWeekStart() }));
  };

  const getWeekStart = (): string => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };
  const resultsRef = useRef<HTMLDivElement>(null);
  const pdfButtonsRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    const stripped = typeof value === "string" ? stripLeadingZeros(value) : value;
    setForm(prev => ({ ...prev, [key]: stripped }));
  }, []);

  const handleBlur = useCallback((field: keyof FormState) => {
    setForm(prev => ({ ...prev, [field]: stripLeadingZeros(prev[field] as string) }));
  }, []);

  useEffect(() => {
    const prix = parseFloat(form.prix) || 0;
    if (prix > 0) {
      const notaire = Math.round(prix * 0.075);
      const chargesCopro = Math.round(prix * 0.01);
      setForm(prev => ({
        ...prev,
        notaire: notaire.toString(),
        chargesCopro: chargesCopro.toString(),
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.prix]);

  useEffect(() => {
    const l = parseFloat(form.loyer) || 0;
    if (l > 0 && loyerSlider === 0) setLoyerSlider(l);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loyer]);

  const loyerSaisonnier = (nuitee: number, taux: number) => nuitee * (taux / 100) * 365 / 12;

  const handleSimuler = () => {
    if (isSaisonnier) {
      const nuitee = parseFloat(prixNuitee) || 0;
      const lBas   = loyerSaisonnier(nuitee, parseFloat(tauxOccBas)   || 0);
      const lMoyen = loyerSaisonnier(nuitee, parseFloat(tauxOccMoyen) || 0);
      const lHaut  = loyerSaisonnier(nuitee, parseFloat(tauxOccHaut)  || 0);
      const rBas   = computeResultats(form, lBas,   amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      const rMoyen = computeResultats(form, lMoyen, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      const rHaut  = computeResultats(form, lHaut,  amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      setResultatsTriple({ bas: rBas, moyen: rMoyen, haut: rHaut });
      setResultats(rMoyen);
      setShowResults(true);
      setSelectedRegime(null);
      setSimulationValidated(false);
      setTimeout(() => pdfButtonsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
      const loyerMensuel = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
      const r = computeResultats(form, loyerMensuel, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      setResultats(r);
      if (loyerMensuel > 0) {
        setLoyerSlider(loyerMensuel);
        setSliderMax(Math.max(loyerMensuel * 2, 200));
      }
      setShowResults(true);
      setSelectedRegime(null);
      setSimulationValidated(false);
      setTimeout(() => pdfButtonsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const handleAjuster = () => {
    if (isAmortBlocked()) { setShowAmortLimite(true); return; }
    markAmortUsed();
    if (isSaisonnier) {
      const nuitee = parseFloat(prixNuitee) || 0;
      const lBas   = loyerSaisonnier(nuitee, parseFloat(tauxOccBas)   || 0);
      const lMoyen = loyerSaisonnier(nuitee, parseFloat(tauxOccMoyen) || 0);
      const lHaut  = loyerSaisonnier(nuitee, parseFloat(tauxOccHaut)  || 0);
      const rBas   = computeResultats(form, lBas,   amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      const rMoyen = computeResultats(form, lMoyen, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      const rHaut  = computeResultats(form, lHaut,  amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      setResultatsTriple({ bas: rBas, moyen: rMoyen, haut: rHaut });
      setResultats(rMoyen);
    } else {
      const loyerMensuel = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
      const r = computeResultats(form, loyerMensuel, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
      setResultats(r);
      if (loyerMensuel > 0) setSliderMax(Math.max(loyerMensuel * 2, 200));
    }
    setSimulationValidated(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const displayCashflow = resultats
    ? (selectedRegime === "micro" ? resultats.cashflowBICMensuel : resultats.cashflowReelMensuel)
    : 0;
  const displayImpot = resultats
    ? (selectedRegime === "micro" ? resultats.impotBIC : resultats.impotReel)
    : 0;
  const displayImpotMensuel = displayImpot / 12;

  const verdict = resultats
    ? resultats.rendementNet > 5 && displayCashflow > 0
      ? { label: "Excellent investissement", bg: "#1A7A52", icon: "✓" }
      : resultats.rendementNet > 3
      ? { label: "Investissement correct", bg: "#B08A2A", icon: "~" }
      : { label: "Rentabilité faible", bg: "#B03A2A", icon: "✗" }
    : null;

  const loyerEffectif = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
  const sliderMin = 40;

  // Inline amort display values (always reflect current state, not frozen resultats)
  const prixDisplay = parseFloat(form.prix) || 0;
  const valAmortDisplay = prixDisplay * amortPct / 100;
  const amortBienDisplay = (amortMode ?? "ensemble") === "ensemble"
    ? (amortDureeEnsemble > 0 ? valAmortDisplay / amortDureeEnsemble : 0)
    : composants.reduce((sum, c) => sum + (valAmortDisplay * c.pct / 100) / (c.duree || 1), 0);
  const amortMobilierDisplay = (parseFloat(form.mobilier) || 0) / 7;
  const amortTravauxDisplay = (parseFloat(form.travaux) || 0) / 15;
  const amortNotaireDisplay = (parseFloat(form.notaire) || 0) / 20;
  const amortTotalDisplay = amortBienDisplay + amortMobilierDisplay + amortTravauxDisplay + amortNotaireDisplay;

  const handleGeneratePDF = () => {
    if (!resultats) return;
    const prix = parseFloat(form.prix) || 0;
    const travaux = parseFloat(form.travaux) || 0;
    const notaire = parseFloat(form.notaire) || 0;
    const mobilier = parseFloat(form.mobilier) || 0;
    const taux = parseFloat(form.taux) / 100 || 0;
    const duree = form.duree;
    const tmi = form.tmi;
    const loyerAnnuel = resultats.loyerAnnuel;
    const chargesLoyer = parseFloat(form.chargesLoyer) || 0;
    const chargesAnnuelles = resultats.chargesAnnuelles;
    const assuranceEmprunteurAnnuel = resultats.assuranceEmprunteurAnnuel;
    const montantCredit = resultats.montantCredit;
    const apport = parseFloat(form.apport) || 0;
    const r = taux / 12;
    const n = duree * 12;
    const M = montantCredit > 0 && taux > 0
      ? montantCredit * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : (duree > 0 ? montantCredit / n : 0);

    const amortBienMaxDuree = (amortMode ?? "ensemble") === "ensemble"
      ? amortDureeEnsemble
      : Math.max(...composants.map(c => c.duree));
    const maxAmortDuree = Math.max(amortBienMaxDuree, 20, 15, 7);
    const totalYears = Math.max(duree, maxAmortDuree) + 5;

    const valeurAmortissable = prix * amortPct / 100;
    const fEur = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

    interface PdfRow {
      year: number; capitalDebut: number; creditAnnuelR: number; interetsAnnee: number;
      amortTotalA: number; amortDisponible: number; reportEntrant: number; reportNplus1: number;
      resultatAvantAmort: number; chargesDeductibles: number; baseImposable: number;
      impot: number; cashflow: number;
      amortBienA: number; amortMobilierA: number; amortTravauxA: number; amortNotaireA: number;
      amortParComposant: number[];
    }
    const rows: PdfRow[] = [];
    let capitalRestant = montantCredit;
    let reportN = 0;

    for (let year = 1; year <= totalYears; year++) {
      const capitalDebut = Math.max(0, capitalRestant);
      let interetsAnnee = 0;
      let creditAnnuelR = 0;
      if (year <= duree && montantCredit > 0 && taux > 0) {
        for (let m = 0; m < 12; m++) {
          const im = capitalRestant * r;
          interetsAnnee += im;
          capitalRestant -= (M - im);
        }
        capitalRestant = Math.max(0, capitalRestant);
        creditAnnuelR = M * 12;
      } else if (year <= duree && montantCredit > 0) {
        creditAnnuelR = montantCredit / n * 12;
      }

      let amortBienA = 0;
      const amortParComposant: number[] = [];
      if ((amortMode ?? "ensemble") === "ensemble") {
        amortBienA = year <= amortDureeEnsemble ? valeurAmortissable / amortDureeEnsemble : 0;
      } else {
        for (const c of composants) {
          const contrib = year <= c.duree ? (valeurAmortissable * c.pct / 100) / c.duree : 0;
          amortBienA += contrib;
          amortParComposant.push(contrib);
        }
      }
      const amortMobilierA = year <= 7 ? mobilier / 7 : 0;
      const amortTravauxA = year <= 15 ? travaux / 15 : 0;
      const amortNotaireA = year <= 20 ? notaire / 20 : 0;
      const amortTotalA = amortBienA + amortMobilierA + amortTravauxA + amortNotaireA;
      const chargesDeductibles = chargesAnnuelles + interetsAnnee + assuranceEmprunteurAnnuel;
      const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
      const reportEntrant = reportN;
      const amortDisponible = amortTotalA + reportEntrant;
      const baseImposable = Math.max(0, resultatAvantAmort - amortDisponible);
      const newReport = Math.max(0, amortDisponible - Math.max(0, resultatAvantAmort));
      const impot = baseImposable * (tmi / 100 + 0.186);
      const cashflow = (loyerAnnuel - creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - impot) / 12;
      rows.push({
        year, capitalDebut, creditAnnuelR, interetsAnnee, amortTotalA, amortDisponible,
        reportEntrant, reportNplus1: newReport,
        resultatAvantAmort, chargesDeductibles, baseImposable, impot, cashflow,
        amortBienA, amortMobilierA, amortTravauxA, amortNotaireA, amortParComposant,
      });
      reportN = newReport;
    }

    const zerosYears = rows.filter(ro => ro.baseImposable === 0).length;
    const firstTaxRow = rows.find(ro => ro.baseImposable > 0);
    const baseBIC = loyerAnnuel * 0.70;
    const impotBIC = baseBIC * (tmi / 100 + 0.186);

    const tableRows = rows.map(ro => {
      const reportLines = ro.reportNplus1 > 0
        ? `<div style="font-size:9px;color:#B08A2A;margin-top:2px">→ N+1 : ${fEur(ro.reportNplus1)}</div>`
        : "";
      return `
      <tr class="${ro.year === duree + 1 ? "credit-end" : ""}">
        <td class="col-an">${ro.year}</td>
        <td class="cc">${ro.year <= duree ? fEur(ro.capitalDebut) : ""}</td>
        <td class="cc">${ro.year <= duree ? fEur(ro.creditAnnuelR) : ""}</td>
        <td class="cc-last">${ro.year <= duree ? fEur(ro.interetsAnnee) : ""}</td>
        <td>${fEur(chargesAnnuelles)}</td>
        <td>${fEur(ro.resultatAvantAmort)}</td>
        <td style="font-weight:600">${fEur(ro.amortDisponible)}${reportLines}</td>
        <td style="color:${ro.baseImposable === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEur(ro.baseImposable)}</td>
        <td style="color:${ro.impot === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEur(ro.impot)}</td>
        <td style="color:${ro.cashflow >= 0 ? "#1A7A52" : "#B03A2A"}">${fEur(ro.cashflow)}/mois</td>
      </tr>`;
    }).join("");

    // Annexe — table unifiée avec sous-colonnes Amort + Reste par catégorie
    const annexeCols: { label: string; annuel: number; duree: number; initial: number }[] = [];
    if ((amortMode ?? "ensemble") === "ensemble") {
      if (valeurAmortissable > 0) annexeCols.push({ label: "Bien immobilier", annuel: valeurAmortissable / amortDureeEnsemble, duree: amortDureeEnsemble, initial: valeurAmortissable });
    } else {
      for (const c of composants) {
        const val = valeurAmortissable * c.pct / 100;
        if (val > 0) annexeCols.push({ label: c.label.replace("Aménagement intérieur", "Amén.<br>intérieur"), annuel: val / c.duree, duree: c.duree, initial: val });
      }
    }
    if (mobilier > 0) annexeCols.push({ label: "Mobilier", annuel: mobilier / 7, duree: 7, initial: mobilier });
    if (travaux > 0) annexeCols.push({ label: "Travaux", annuel: travaux / 15, duree: 15, initial: travaux });
    if (notaire > 0) annexeCols.push({ label: "Frais notaire", annuel: notaire / 20, duree: 20, initial: notaire });
    const annexeMaxDuree = annexeCols.length > 0 ? Math.max(...annexeCols.map(c => c.duree)) : 0;
    // 2 sous-colonnes par catégorie + colonne An + colonne Cumul
    const totalSubCols = annexeCols.length * 2 + 2;
    const afs = totalSubCols > 16 ? 7 : totalSubCols > 12 ? 8 : totalSubCols > 8 ? 9 : 10;
    const headerRow1 = annexeCols.map(c =>
      `<th colspan="2" style="text-align:center;font-size:${afs}px;border-right:1px solid rgba(255,255,255,0.15);padding:5px 4px;vertical-align:top">
        <div style="font-weight:700">${c.label}</div>
        <div style="font-weight:400;opacity:.75;font-size:${Math.max(6, afs - 1)}px;margin-top:3px;line-height:1.55;white-space:nowrap">
          Valeur initiale : ${fEur(c.initial)}<br>Durée : ${c.duree} ans<br>Amort. annuel : ${fEur(c.annuel)}
        </div>
      </th>`).join("");
    const headerRow2 = annexeCols.map(() =>
      `<th style="font-size:${afs}px;background:#3a1509;padding:4px 5px">Amort.</th>
       <th style="font-size:${afs}px;background:#3a1509;padding:4px 5px;border-right:1px solid rgba(255,255,255,0.12)">Reste</th>`).join("");
    const annexeBodyRows = Array.from({ length: annexeMaxDuree }, (_, i) => {
      const year = i + 1;
      let cumul = 0;
      const cells = annexeCols.map(c => {
        if (year <= c.duree) {
          const reste = Math.max(0, c.initial - year * c.annuel);
          cumul += c.annuel;
          return `<td style="font-size:${afs}px;padding:4px 5px">${fEur(c.annuel)}</td>
                  <td style="font-size:${afs}px;padding:4px 5px;color:${reste <= 0.01 ? "#1A7A52" : "rgba(26,22,18,0.55)"};border-right:1px solid rgba(26,22,18,0.07)">${fEur(reste)}</td>`;
        }
        return `<td></td><td style="border-right:1px solid rgba(26,22,18,0.07)"></td>`;
      }).join("");
      return `<tr><td class="col-an" style="font-size:${afs}px;padding:4px 4px;width:18px">${year}</td>${cells}<td style="font-weight:700;color:#C95B2A;font-size:${afs}px;padding:4px 5px">${fEur(cumul)}</td></tr>`;
    }).join("");
    const annexeTable = annexeCols.length > 0 ? `
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th rowspan="2" style="font-size:${afs}px;width:18px;padding:4px" class="col-an">An</th>
            ${headerRow1}
            <th rowspan="2" style="background:#C95B2A;color:#1A1612;font-size:${afs}px;padding:5px 4px;text-align:center">Cumul<br>/an</th>
          </tr>
          <tr>${headerRow2}</tr>
        </thead>
        <tbody>${annexeBodyRows}</tbody>
      </table>` : "";

    const conclusionText = zerosYears >= totalYears
      ? `Sur toute la période analysée (${totalYears} ans), la base imposable reste à 0 € grâce à l'amortissement. Vous ne payez aucun impôt sur vos revenus locatifs pendant cette période.`
      : zerosYears > 0
      ? `Vous ne payez aucun impôt pendant <strong>${zerosYears} an${zerosYears > 1 ? "s" : ""}</strong>.${firstTaxRow ? ` À partir de l'année ${firstTaxRow.year}, la base imposable s'établit à ${fEur(firstTaxRow.baseImposable)}, générant un impôt de ${fEur(firstTaxRow.impot)}/an.` : ""}`
      : `Dès la 1ère année, la base imposable s'établit à ${fEur(rows[0]?.baseImposable ?? 0)}, générant un impôt de ${fEur(rows[0]?.impot ?? 0)}/an. L'amortissement reste partiellement utilisé — envisagez d'allonger les durées ou d'augmenter la part mobilier.`;

    const microbicNote = tmi > 0
      ? `En Micro-BIC 2025, votre base imposable serait de <strong>${fEur(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEur(loyerAnnuel)}/an, en cas de loyer constant), générant un impôt estimé de <strong>${fEur(impotBIC)}</strong> par an (TMI ${tmi} % + prélèvements sociaux 18,6 %).`
      : `En Micro-BIC 2025, votre base imposable serait de <strong>${fEur(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEur(loyerAnnuel)}/an, en cas de loyer constant). Renseignez votre TMI pour calculer l'impôt correspondant.`;

    // Saisonnière: 6-table comparison block
    let saisonniereSummaryHtml = "";
    if (isSaisonnier && resultatsTriple) {
      const scenarios = [
        { label: "Estimation basse", r: resultatsTriple.bas, taux: tauxOccBas },
        { label: "Estimation moyenne", r: resultatsTriple.moyen, taux: tauxOccMoyen },
        { label: "Estimation haute", r: resultatsTriple.haut, taux: tauxOccHaut },
      ];
      const makeScenarioCol = (label: string, r: Resultats | null, taux: string, nuits: number) => {
        if (!r) return `<div style="flex:1"></div>`;
        const lr = r.loyerAnnuel;
        const bic = lr * 0.70;
        const impBic = bic * (form.tmi / 100 + 0.186);
        const cfBic = r.cashflowBICMensuel;
        const cfReel = r.cashflowReelMensuel;
        const row = (lbl: string, val: string, color?: string, bold?: boolean, sep?: boolean) =>
          `<tr><td style="padding:4px 6px;font-size:10px;color:rgba(26,22,18,.55);${sep?"border-top:1px solid rgba(26,22,18,.12);padding-top:6px":""}">${lbl}</td><td style="padding:4px 6px;font-size:10px;text-align:right;${bold?"font-weight:700;":""} ${color?`color:${color};`:""}${sep?"border-top:1px solid rgba(26,22,18,.12);padding-top:6px":""}">${val}</td></tr>`;
        return `<div style="flex:1;min-width:0;border-radius:8px;overflow:hidden;border:1px solid rgba(26,22,18,.12)">
          <div style="text-align:center;padding:10px 8px 8px;background:#4E1F12;color:#F5F0E8">
            <div style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase">${label}</div>
            <div style="font-size:9px;opacity:.65;margin-top:2px">${taux}% · ${nuits} nuits/an</div>
            <div style="font-size:16px;font-weight:300;color:#C95B2A;margin-top:4px;letter-spacing:-.02em">${fEur(lr/12)}/mois</div>
            <div style="font-size:9px;opacity:.55;margin-top:1px">${fEur(lr)}/an</div>
          </div>
          <div style="background:#EDE7DC;padding:6px 0 2px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#4E1F12;padding:4px 6px 2px">Régime Réel</div>
            <table style="width:100%;border-collapse:collapse">
              ${row("Revenus annuels", fEur(lr), undefined, true)}
              ${row("Emprunt", `−${fEur(r.creditAnnuel)}`, "#B03A2A")}
              ${row("Charges", `−${fEur(r.chargesAnnuelles)}`, "#B03A2A")}
              ${row("Amortissements", `−${fEur(r.amortTotal)}`, "#B03A2A")}
              ${row("Base imposable", fEur(r.baseImposableReel), r.baseImposableReel===0?"#1A7A52":"#1A1612", true, true)}
              ${row("Impôt estimé", fEur(r.impotReel), "#B03A2A")}
              ${row("Cash-flow/mois", `${fEur(cfReel)}/mois`, cfReel>=0?"#1A7A52":"#B03A2A", true, true)}
            </table>
          </div>
          <div style="background:#F5F0E8;padding:6px 0 6px;border-top:2px solid rgba(26,82,122,.15)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#26527A;padding:4px 6px 2px">Micro-BIC 2025</div>
            <table style="width:100%;border-collapse:collapse">
              ${row("Revenus annuels", fEur(lr), undefined, true)}
              ${row("Abattement 30%", `−${fEur(lr*.30)}`, "#B03A2A")}
              ${row("Base imposable", fEur(bic), "#1A1612", true, true)}
              ${row("Impôt estimé", fEur(impBic), "#B03A2A")}
              ${row("Cash-flow/mois", `${fEur(cfBic)}/mois`, cfBic>=0?"#1A7A52":"#B03A2A", true, true)}
            </table>
          </div>
        </div>`;
      };
      saisonniereSummaryHtml = `
<h2>Location Saisonnière — Comparaison des 3 scénarios (année 1)</h2>
<p style="font-size:10px;color:rgba(26,22,18,.5);margin-bottom:12px">Prix par nuitée : <strong>${fEur(parseFloat(prixNuitee)||0)}</strong>. Le tableau de projection détaillé ci-dessous utilise l'estimation <strong>Moyenne</strong>.</p>
<div style="display:flex;gap:12px;align-items:stretch">
  ${scenarios.map(s => makeScenarioCol(s.label, s.r, s.taux, Math.round(parseFloat(s.taux)/100*365))).join("")}
</div>`;
    }

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Analyse de Rentabilité LMNP – toutlmnp</title>
<style>
@page{size:A4;margin:10mm 12mm}
*{box-sizing:border-box}
html{background:#6B6B6B;min-height:100%}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;background:#F5F0E8;
  width:794px;min-height:1123px;margin:24px auto;padding:18mm 16mm;font-size:12px;
  box-shadow:0 6px 32px rgba(0,0,0,0.45);-webkit-print-color-adjust:exact;print-color-adjust:exact}
header{background:#4E1F12;color:#F5F0E8;padding:12px 18px;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.lt{font-weight:300;font-size:19px;color:#F5F0E8}.ll{font-weight:700;font-size:19px;color:#C95B2A}
.ls{font-size:8px;letter-spacing:.12em;color:rgba(245,240,232,.5);text-transform:uppercase;margin-top:2px}
.main-title{text-align:center;margin:18px 0 22px}
.main-title h1{font-size:20px;font-weight:700;color:#4E1F12;letter-spacing:-.02em;margin:0 0 4px}
.main-title .sub{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:rgba(26,22,18,.4)}
h2{font-size:12px;font-weight:700;color:#4E1F12;border-bottom:2px solid #C95B2A;padding-bottom:4px;margin:20px 0 8px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#4E1F12;color:#F5F0E8;padding:6px 7px;text-align:right;font-weight:500;white-space:nowrap}
th:first-child,th.col-an{text-align:left}
td{padding:6px 7px;text-align:right;border-bottom:.5px solid rgba(26,22,18,.07);vertical-align:middle}
td:first-child,td.col-an{text-align:left;font-weight:600}
tr:nth-child(even){background:rgba(201,91,42,.04)}
tr.credit-end td{}
th.cc,th.cc-last{background:#3a1509;border-top:2px solid #C95B2A}
th.cc:first-of-type{border-left:2px solid #C95B2A}
th.cc-last{border-right:2px solid #C95B2A}
td.cc{background:rgba(78,31,18,0.04);border-left:2px solid rgba(201,91,42,.25)}
td.cc-last{background:rgba(78,31,18,0.04);border-right:2px solid rgba(201,91,42,.25)}
th.col-an,td.col-an{width:18px}
.recap{display:flex;gap:0;margin-bottom:10px}
.recap-col{flex:1;padding:9px 11px;border-radius:5px;margin-right:7px}
.recap-col:last-child{margin-right:0}
.recap-prestep{background:#EDE7DC;margin-bottom:7px;border-radius:5px;padding:7px 11px;display:flex;gap:10px;flex-wrap:wrap}
.kvi{flex:1;min-width:70px}
.kvl{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,.45)}
.kvv{font-size:11px;font-weight:600;color:#1A1612}
.orange{color:#C95B2A}
.note{background:rgba(201,91,42,.08);border:1px solid rgba(201,91,42,.2);border-radius:5px;padding:9px 13px;line-height:1.6;color:rgba(26,22,18,.7);margin-top:10px}
.conclusion{background:#4E1F12;color:#F5F0E8;border-radius:6px;padding:11px 15px;margin-top:12px;line-height:1.7}
.fiscal-note{background:#EDE7DC;border-radius:5px;padding:11px 15px;line-height:1.8;color:rgba(26,22,18,.65);margin-top:10px;font-size:11px}
.fiscal-note p{margin:0 0 5px}
.page-break{page-break-before:always}
@media print{
  html{background:none;padding:0}
  body{width:100%;margin:0;padding:0;box-shadow:none;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page-break{page-break-before:always}
  header{border-radius:0}
}
</style></head><body>
<header>
  <div><div style="display:flex"><span class="lt">tout</span><span class="ll">lmnp</span></div><div class="ls">Simulateur de rentabilité</div></div>
  <div style="margin-left:auto;font-size:10px;opacity:.6">${new Date().toLocaleDateString("fr-FR")}</div>
</header>
<div class="main-title">
  <h1>Analyse de Rentabilité</h1>
  <div class="sub">LMNP — Régime réel simplifié</div>
</div>

<h2>Récapitulatif</h2>
<div class="recap-prestep">
  ${bienInfoRef.current.type ? `<div class="kvi"><div class="kvl">Type de bien</div><div class="kvv">${bienInfoRef.current.type === "ap" ? "Appartement" : "Maison"}</div></div>` : ""}
  ${bienInfoRef.current.ville ? `<div class="kvi"><div class="kvl">Ville</div><div class="kvv">${bienInfoRef.current.ville}</div></div>` : ""}
  ${bienInfoRef.current.surface ? `<div class="kvi"><div class="kvl">Surface</div><div class="kvv">${bienInfoRef.current.surface} m²</div></div>` : ""}
  ${bienInfoRef.current.description ? `<div class="kvi" style="flex:2"><div class="kvl">Description</div><div class="kvv" style="font-weight:400;font-size:10px;white-space:pre-wrap">${bienInfoRef.current.description}</div></div>` : ""}
</div>
<div class="recap">
  <div class="recap-col" style="background:#EDE7DC">
    <div class="kvl" style="margin-bottom:6px;font-weight:700">Acquisition</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Prix d'achat</div><div class="kvv">${fEur(prix)}</div></div>
    ${travaux > 0 ? `<div class="kvi" style="margin-bottom:6px"><div class="kvl">Travaux</div><div class="kvv">${fEur(travaux)}</div></div>` : ""}
    ${mobilier > 0 ? `<div class="kvi" style="margin-bottom:6px"><div class="kvl">Mobilier</div><div class="kvv">${fEur(mobilier)}</div></div>` : ""}
  </div>
  <div class="recap-col" style="background:rgba(201,91,42,0.09);border:1px solid rgba(201,91,42,0.2)">
    <div class="kvl" style="margin-bottom:6px;font-weight:700;color:#C95B2A">Revenus</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer HC mensuel</div><div class="kvv orange">${fEur(loyerAnnuel / 12)}/mois</div></div>
    ${chargesLoyer > 0 ? `<div class="kvi" style="margin-bottom:6px"><div class="kvl">Charges locataire</div><div class="kvv">${fEur(chargesLoyer)}/mois</div></div>` : ""}
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer HC annuel</div><div class="kvv orange">${fEur(loyerAnnuel)}/an</div></div>
    <div class="kvi"><div class="kvl">Charges propriétaire/an</div><div class="kvv">${fEur(chargesAnnuelles)}</div></div>
    ${assuranceEmprunteurAnnuel > 0 ? `<div class="kvi" style="margin-top:4px"><div class="kvl">Ass. emprunteur/an</div><div class="kvv">${fEur(assuranceEmprunteurAnnuel)}</div></div>` : ""}
  </div>
  <div class="recap-col" style="background:#EDE7DC">
    <div class="kvl" style="margin-bottom:6px;font-weight:700">Financement</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Apport personnel</div><div class="kvv">${fEur(apport)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Montant du crédit</div><div class="kvv">${fEur(montantCredit)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Taux · Durée</div><div class="kvv">${form.taux} % · ${duree} ans</div></div>
    <div class="kvi"><div class="kvl">Frais de notaire</div><div class="kvv">${fEur(notaire)}</div></div>
  </div>
</div>

${saisonniereSummaryHtml}
${!isSaisonnier ? `<h2>Comparaison régimes fiscaux (année 1)</h2>
<table><thead><tr><th>Indicateur</th><th>Régime réel simplifié</th><th>Micro-BIC 2025</th></tr></thead><tbody>
<tr><td>Loyers annuels</td><td>${fEur(loyerAnnuel)}</td><td>${fEur(loyerAnnuel)}</td></tr>
<tr><td>Charges déductibles</td><td>${fEur(rows[0]?.chargesDeductibles ?? 0)}</td><td>Abattement 30 %</td></tr>
<tr><td>Amortissements</td><td>${fEur(rows[0]?.amortTotalA ?? 0)}</td><td>—</td></tr>
<tr><td>Base imposable</td><td style="font-weight:600;color:${(rows[0]?.baseImposable ?? 0) === 0 ? "#1A7A52" : "#B03A2A"}">${fEur(rows[0]?.baseImposable ?? 0)}</td><td>${fEur(baseBIC)}</td></tr>
<tr><td>Impôt estimé</td><td style="font-weight:600">${fEur(rows[0]?.impot ?? 0)}</td><td>${fEur(impotBIC)}</td></tr>
<tr><td>Cash-flow mensuel</td><td style="color:${(rows[0]?.cashflow ?? 0) >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEur(rows[0]?.cashflow ?? 0)}/mois</td><td style="color:${resultats.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fEur(resultats.cashflowBICMensuel)}/mois</td></tr>
</tbody></table>` : ""}

<div class="fiscal-note">
  <p><strong>Comment est calculé votre impôt ?</strong></p>
  <p><strong>TMI</strong> (Tranche Marginale d'Imposition) : taux appliqué à votre dernière tranche de revenus, ici <strong>${tmi} %</strong>.</p>
  <p><strong>PS</strong> (Prélèvements Sociaux) : <strong>18,6 %</strong> depuis la loi de financement de la sécurité sociale 2026 (contre 17,2 % auparavant), prélevés sur les revenus du patrimoine. Le LMNP paie uniquement ces prélèvements sans ouvrir de droits sociaux.</p>
  <p>Impôt total = base imposable × (TMI + PS) = base × <strong>${(tmi + 18.6).toFixed(1)} %</strong>.</p>
</div>

<div class="page-break">
<h2>Tableau récapitulatif (${totalYears} ans)${isSaisonnier ? " — Estimation moyenne des revenus" : ""}</h2>
<p style="font-size:10px;color:rgba(26,22,18,.5);margin-bottom:6px">Projection en régime réel simplifié avec loyers et charges constants. L'amortissement évolue chaque année. La ligne marquée indique la fin du crédit.</p>
<table><thead><tr>
  <th class="col-an">An</th>
  <th class="cc">Capital restant</th><th class="cc">Annuités</th><th class="cc-last">dont intérêts</th>
  <th>Charges</th><th>Résultat av. amort.</th><th>Amortissement</th>
  <th>Base imposable</th><th>Impôt</th><th>Cash-flow/mois</th>
</tr></thead><tbody>${tableRows}</tbody></table>
<div class="conclusion">✓ ${conclusionText}</div>
<div class="note" style="margin-top:12px"><strong>Micro-BIC 2025 :</strong> ${microbicNote}</div>
</div>

<div class="page-break">
<h2>Annexe — Amortissement par catégorie</h2>
${annexeTable}
</div>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 600); }
  };

  const cardStyle = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" };
  const sectionStyle = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" };

  return (
    <section id="simulateur" className="py-16" style={{ backgroundColor: "#F5F0E8" }}>
      <div className="max-w-6xl mx-auto px-4">

        {/* ─── FORM ─── */}
        <div className="rounded-xl p-6 md:p-8 mb-6" style={sectionStyle}>

          {/* Mode de location */}
          <div className="mb-6">
            <div className={LABEL}>Mode de location</div>
            <button
              onClick={() => { setIsSaisonnier(!isSaisonnier); setResultatsTriple(null); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
              style={{
                background: isSaisonnier ? "rgba(26,82,122,0.1)" : "#F5F0E8",
                border: isSaisonnier ? "1.5px solid #26527A" : "0.5px solid rgba(26,22,18,0.18)",
                color: isSaisonnier ? "#26527A" : "rgba(26,22,18,0.55)",
              }}>
              <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: isSaisonnier ? "#26527A" : "transparent",
                  border: isSaisonnier ? "none" : "1.5px solid rgba(26,22,18,0.3)",
                }}>
                {isSaisonnier && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
              </span>
              Location Saisonnière
            </button>
          </div>

          {/* Grid 2 cols */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── LEFT : Bien & Financement ── */}
            <div className="space-y-4">
              <p className={LABEL} style={{ opacity: 1, color: "#1A1612" }}>Bien &amp; Financement</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Prix d&apos;achat (€)</label>
                  <input type="number" value={form.prix}
                    onChange={e => updateField("prix", e.target.value)}
                    onBlur={() => handleBlur("prix")}
                    placeholder="250 000" className={INPUT} style={INPUT_STYLE} />
                </div>
                <div>
                  <label className={LABEL}>Travaux (€)</label>
                  <input type="number" value={form.travaux}
                    onChange={e => updateField("travaux", e.target.value)}
                    onBlur={() => handleBlur("travaux")}
                    placeholder="0" className={INPUT} style={INPUT_STYLE} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Mobilier (€)</label>
                  <input type="number" value={form.mobilier}
                    onChange={e => updateField("mobilier", e.target.value)}
                    onBlur={() => handleBlur("mobilier")}
                    placeholder="0" className={INPUT} style={INPUT_STYLE} />
                </div>
                <div>
                  <label className={LABEL}>Frais de notaire (auto)</label>
                  <input type="number" value={form.notaire}
                    onChange={e => updateField("notaire", e.target.value)}
                    onBlur={() => handleBlur("notaire")}
                    className={INPUT} style={AUTO_STYLE} />
                </div>
                <div>
                  <label className={LABEL}>Apport personnel (€)</label>
                  <input type="number" value={form.apport}
                    onChange={e => updateField("apport", e.target.value)}
                    onBlur={() => handleBlur("apport")}
                    placeholder="0" className={INPUT} style={INPUT_STYLE} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Taxe foncière/an (€)</label>
                  <input type="number" value={form.taxeFonciere}
                    onChange={e => updateField("taxeFonciere", e.target.value)}
                    onBlur={() => handleBlur("taxeFonciere")}
                    placeholder="À renseigner" className={INPUT} style={INPUT_STYLE} />
                </div>
                <div>
                  <label className={LABEL}>
                    Charges copropriété/an (€)
                    {form.type !== "ap" && <span className="ml-1 text-[10px] normal-case tracking-normal" style={{ color: "rgba(26,22,18,0.35)" }}>maison</span>}
                  </label>
                  <input type="number" value={form.chargesCopro}
                    onChange={e => updateField("chargesCopro", e.target.value)}
                    onBlur={() => handleBlur("chargesCopro")}
                    placeholder="0"
                    className={INPUT}
                    style={form.chargesCopro && parseFloat(form.chargesCopro) > 0 ? AUTO_STYLE : INPUT_STYLE} />
                </div>
              </div>

              {/* Durée crédit — slider */}
              <div>
                <label className={LABEL}>
                  Durée du crédit —{" "}
                  <span style={{ color: "#C95B2A", fontWeight: 600 }}>{form.duree} ans</span>
                </label>
                <input type="range" min={7} max={30} step={1} value={form.duree}
                  onChange={e => updateField("duree", parseInt(e.target.value))}
                  className="w-full mt-1" />
                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: "rgba(26,22,18,0.4)" }}>
                  <span>7 ans</span>
                  <span>30 ans</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Taux d&apos;intérêt annuel</label>
                  <div className="flex items-center gap-1.5">
                    <input type="number" step="0.1" value={form.taux}
                      onChange={e => updateField("taux", e.target.value)}
                      onBlur={() => handleBlur("taux")}
                      placeholder="3.5" className={INPUT} style={{ ...INPUT_STYLE, flex: 1 }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(26,22,18,0.45)" }}>%</span>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Assurance emprunteur</label>
                  <div className="flex items-center gap-1.5">
                    <input type="number" step="0.01" min="0" max="1" value={form.assuranceEmprunteur}
                      onChange={e => updateField("assuranceEmprunteur", e.target.value)}
                      onBlur={() => handleBlur("assuranceEmprunteur")}
                      placeholder="0.25" className={INPUT} style={{ ...INPUT_STYLE, flex: 1 }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(26,22,18,0.45)" }}>%</span>
                  </div>
                  {(() => {
                    const pct = parseFloat(form.assuranceEmprunteur) || 0;
                    const capital = resultats?.montantCredit ?? 0;
                    const annuel = capital * pct / 100;
                    return capital > 0 && pct > 0 ? (
                      <p className="text-[10px] mt-1" style={{ color: "rgba(26,22,18,0.4)" }}>
                        = {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(annuel)}/an · charge financière déductible
                      </p>
                    ) : (
                      <p className="text-[10px] mt-1" style={{ color: "rgba(26,22,18,0.4)" }}>% du capital emprunté · déductible</p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* ── RIGHT : Loyer ── */}
            <div className="space-y-4">
              <p className={LABEL} style={{ opacity: 1, color: "#1A1612" }}>Loyer</p>

              {/* Loyer mensuel ou Saisonnier */}
              {isSaisonnier ? (
                <div className="space-y-3 rounded-xl p-4" style={{ background: "rgba(38,82,122,0.05)", border: "1px solid rgba(38,82,122,0.2)" }}>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: "#26527A" }}>Location Saisonnière</div>
                  <div>
                    <label className={LABEL}>Prix moyen par nuitée (€)</label>
                    <input type="number" value={prixNuitee}
                      onChange={e => setPrixNuitee(e.target.value)}
                      placeholder="Ex : 80" className={INPUT} style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL}>Taux d&apos;occupation estimé (%)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Basse", val: tauxOccBas, set: setTauxOccBas, placeholder: "20" },
                        { label: "Moyenne", val: tauxOccMoyen, set: setTauxOccMoyen, placeholder: "35" },
                        { label: "Haute", val: tauxOccHaut, set: setTauxOccHaut, placeholder: "45" },
                      ].map(({ label, val, set, placeholder }) => {
                        const taux = parseFloat(val) || parseFloat(placeholder) || 0;
                        const nuits = Math.round(taux / 100 * 365);
                        return (
                          <div key={label}>
                            <div className="text-[10px] text-center mb-1" style={{ color: "rgba(26,22,18,0.45)" }}>{label}</div>
                            <input type="number" value={val} onChange={e => set(e.target.value)}
                              placeholder={placeholder} className={INPUT} style={{ ...INPUT_STYLE, textAlign: "center" }} />
                            <div className="text-[10px] text-center mt-1" style={{ color: "rgba(26,22,18,0.35)" }}>{nuits} nuits/an</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: "rgba(26,22,18,0.45)", lineHeight: 1.5 }}>
                      Les calculs de rentabilité approfondis sont effectués avec l&apos;estimation <strong>Moyenne</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Loyer HC / mois (€)</label>
                    <input type="number" value={form.loyer}
                      onChange={e => {
                        updateField("loyer", e.target.value);
                        setLoyerSlider(parseFloat(e.target.value) || 0);
                      }}
                      onBlur={() => handleBlur("loyer")}
                      placeholder="Ex : 1 100" className={INPUT} style={INPUT_STYLE} />
                    <p className="text-[10px] mt-1" style={{ color: "rgba(26,22,18,0.4)" }}>Hors charges locataire</p>
                  </div>
                  <div>
                    <label className={LABEL}>Charges locataire / mois (€)</label>
                    <input type="number" value={form.chargesLoyer}
                      onChange={e => updateField("chargesLoyer", e.target.value)}
                      onBlur={() => handleBlur("chargesLoyer")}
                      placeholder="0" className={INPUT} style={INPUT_STYLE} />
                    <p className="text-[10px] mt-1" style={{ color: "rgba(26,22,18,0.4)" }}>Neutral — non inclus dans le rendement</p>
                  </div>
                </div>
              )}

              {/* TMI */}
              <div>
                <label className={LABEL}>Tranche marginale d&apos;imposition (TMI)</label>
                <div className="flex rounded-md overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.12)" }}>
                  {([0, 11, 30, 41, 45] as TMI[]).map(t => (
                    <button key={t} onClick={() => updateField("tmi", t)}
                      className="flex-1 py-2.5 text-xs font-medium transition-colors"
                      style={{
                        background: form.tmi === t ? "#1A1612" : "#F5F0E8",
                        color: form.tmi === t ? "#F5F0E8" : "rgba(26,22,18,0.55)",
                      }}>
                      {t}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Autres charges — expandable */}
              {(() => {
                const pnoPct = parseFloat(form.assurancePNO) || 0;
                const gestionPct = parseFloat(form.gestionLocativePct) || 0;
                const loyerHC = parseFloat(form.loyer) || 0;
                const loyerAnnuelUI = loyerHC * 12;
                const assurancePNOEur = loyerAnnuelUI * (pnoPct / 100);
                const gestionLocative = loyerAnnuelUI * (gestionPct / 100);
                const entretien = parseFloat(form.entretienCourant) || 0;
                const compta = parseFloat(form.comptabilite) || 0;
                const total = assurancePNOEur + gestionLocative + entretien + compta;
                return (
                  <div className="rounded-xl overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.12)" }}>
                    <button
                      onClick={() => setShowAutresCharges(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-80"
                      style={{ background: "#EDE7DC" }}>
                      <div>
                        <span className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "rgba(26,22,18,0.55)" }}>
                          Autres charges déductibles
                        </span>
                        {total > 0 && (
                          <span className="ml-2 text-xs font-medium" style={{ color: "#C95B2A" }}>
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(total)}/an
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium" style={{ color: "#C95B2A" }}>
                        {showAutresCharges ? "▲ Réduire" : "▼ Détailler"}
                      </span>
                    </button>
                    {showAutresCharges && (
                      <div className="p-4 space-y-3" style={{ background: "#F5F0E8" }}>
                        {/* Popup avertissement loyer */}
                        {showLoyerWarning && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,22,18,0.45)" }}
                            onClick={() => setShowLoyerWarning(false)}>
                            <div className="rounded-2xl p-6 max-w-xs w-full mx-4 text-center shadow-2xl" style={{ background: "#F5F0E8" }}
                              onClick={e => e.stopPropagation()}>
                              <p className="text-sm font-medium mb-1" style={{ color: "#1A1612" }}>Loyer non renseigné</p>
                              <p className="text-xs mb-4" style={{ color: "rgba(26,22,18,0.6)" }}>Renseigne d&apos;abord le loyer HC mensuel pour calculer le montant de la gestion locative.</p>
                              <button onClick={() => setShowLoyerWarning(false)}
                                className="px-5 py-2 rounded-xl text-sm font-medium" style={{ background: "#C95B2A", color: "#fff" }}>
                                OK
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Assurance Loyer impayé */}
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <label className={LABEL} style={{ margin: 0, flex: 1 }}>Assurance Loyer impayé (PNO / GLI)</label>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="text" inputMode="decimal"
                                value={form.assurancePNO}
                                placeholder="~2.5%"
                                onChange={e => {
                                  const v = e.target.value.replace(",", ".");
                                  if (/^\d*\.?\d*$/.test(v))
                                    updateField("assurancePNO", v);
                                }}
                                onBlur={() => handleBlur("assurancePNO")}
                                className={INPUT} style={{ ...INPUT_STYLE, width: "88px" }} />
                              <span className="text-xs" style={{ color: "rgba(26,22,18,0.45)", whiteSpace: "nowrap" }}>% loyer HC</span>
                            </div>
                          </div>
                          {pnoPct > 0 && loyerHC > 0 && (
                            <p className="text-xs font-medium mt-1" style={{ color: "#C95B2A" }}>
                              Soit {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(assurancePNOEur)}/an
                            </p>
                          )}
                        </div>

                        {/* Gestion locative */}
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <label className={LABEL} style={{ margin: 0, flex: 1 }}>Gestion locative</label>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="text" inputMode="decimal"
                                value={form.gestionLocativePct}
                                placeholder="~25%"
                                onClick={() => { if (!loyerHC) setShowLoyerWarning(true); }}
                                onChange={e => {
                                  const v = e.target.value.replace(",", ".");
                                  if (/^\d*\.?\d*$/.test(v) && (parseFloat(v) || 0) <= 70)
                                    updateField("gestionLocativePct", v);
                                }}
                                onBlur={() => handleBlur("gestionLocativePct")}
                                className={INPUT} style={{ ...INPUT_STYLE, width: "88px" }} />
                              <span className="text-xs" style={{ color: "rgba(26,22,18,0.45)", whiteSpace: "nowrap" }}>% loyer HC</span>
                            </div>
                          </div>
                          {gestionPct > 0 && loyerHC > 0 && (
                            <p className="text-xs font-medium mt-1" style={{ color: "#C95B2A" }}>
                              Soit {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(gestionLocative)}/an
                            </p>
                          )}
                        </div>

                        {/* Entretien courant */}
                        <div className="flex items-center justify-between gap-3">
                          <label className={LABEL} style={{ margin: 0, flex: 1 }}>Entretien courant</label>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input type="number" value={form.entretienCourant}
                              onChange={e => updateField("entretienCourant", e.target.value)}
                              onBlur={() => handleBlur("entretienCourant")}
                              placeholder="500" className={INPUT} style={{ ...INPUT_STYLE, width: "88px" }} />
                            <span className="text-xs" style={{ color: "rgba(26,22,18,0.45)", whiteSpace: "nowrap" }}>€/an</span>
                          </div>
                        </div>

                        {/* Comptabilité LMNP */}
                        <div className="flex items-center justify-between gap-3">
                          <label className={LABEL} style={{ margin: 0, flex: 1 }}>Comptabilité LMNP</label>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input type="number" value={form.comptabilite}
                              onChange={e => updateField("comptabilite", e.target.value)}
                              onBlur={() => handleBlur("comptabilite")}
                              placeholder="800" className={INPUT} style={{ ...INPUT_STYLE, width: "88px" }} />
                            <span className="text-xs" style={{ color: "rgba(26,22,18,0.45)", whiteSpace: "nowrap" }}>€/an</span>
                          </div>
                        </div>
                        {/* Total */}
                        {total > 0 && (
                          <div className="pt-2 flex justify-between items-center" style={{ borderTop: "0.5px solid rgba(26,22,18,0.1)" }}>
                            <span className="text-xs font-medium uppercase tracking-[0.1em]" style={{ color: "rgba(26,22,18,0.5)" }}>Total autres charges</span>
                            <span className="text-sm font-medium" style={{ color: "#C95B2A" }}>
                              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(total)}/an
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ─── BOUTON SIMULER ─── */}
        <div className="flex justify-end mb-10">
          <button onClick={handleSimuler}
            className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 8, letterSpacing: "0.02em" }}>
            Lancer la simulation →
          </button>
        </div>

        {/* ─── RESULTS ─── */}
        <div ref={resultsRef}>
          {showResults && (
            !resultats ? (
              <div className="rounded-xl p-12 text-center" style={cardStyle}>
                <p className="text-lg font-light" style={{ color: "rgba(26,22,18,0.45)" }}>
                  Renseignez le prix d&apos;achat et le loyer mensuel pour voir les résultats
                </p>
              </div>
            ) : (
              <>
              {/* ─── BOUTONS PDF + SAUVEGARDER — haut de page ─── */}
              {simulationValidated && <div ref={pdfButtonsRef} className="flex flex-wrap justify-center items-center gap-3 mb-5">
                <button onClick={() => {
                  const plan = getPlan();
                  if (plan === "pro") { setPendingPdfAction("pro"); setShowBienInfoPopup(true); return; }
                  if (plan === "starter") { setPdfWeekCount(getPdfWeekCount()); setShowPDFStarter(true); return; }
                  setShowPayPopup(true);
                }}
                  className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                  style={{ background: "#4E1F12", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.3)", letterSpacing: "0.02em" }}>
                  Générer compte rendu PDF
                </button>
                <button
                  onClick={() => setShowSauvegarder(true)}
                  className="flex items-center gap-2 px-6 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                  style={{ background: "#EDE7DC", color: "#4E1F12", border: "1px solid rgba(78,31,18,0.2)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Sauvegarder
                </button>
              </div>}
              <div className="space-y-5">
                {/* Verdict */}
                {verdict && (
                  <div className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: verdict.bg, color: "#F5F0E8" }}>
                    <span className="text-2xl font-bold">{verdict.icon}</span>
                    <div>
                      <div className="font-bold text-xl">{verdict.label}</div>
                      <div className="text-[14px] mt-0.5" style={{ color: "rgba(245,240,232,0.8)" }}>
                        Rendement net <span className="font-bold" style={{ color: "#F5A623" }}>{formatPct(resultats.rendementNet)}</span>
                        {" · "}Cash-flow <span className="font-bold" style={{ color: "#F5A623" }}>{formatEuro(displayCashflow)}/mois</span>
                        {selectedRegime ? <> · <span style={{ color: "rgba(245,240,232,0.65)" }}>{selectedRegime === "reel" ? "Régime réel" : "Micro-BIC"}</span></> : ""}
                      </div>
                    </div>
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Rendement brut + net */}
                  <div className="rounded-xl p-4" style={cardStyle}>
                    <div className={LABEL}>Rendement</div>
                    <div className="text-xl font-light mt-1" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>
                      {formatPct(resultats.rendementBrut)}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>brut · loyers / investissement</div>
                    <div className="text-base font-light mt-2" style={{ color: "#C95B2A", letterSpacing: "-0.02em" }}>
                      {formatPct(resultats.rendementNet)}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>net · après charges</div>
                  </div>

                  {/* Revenus annuels */}
                  <div className="rounded-xl p-4" style={cardStyle}>
                    <div className={LABEL}>Revenus annuels</div>
                    <div className="text-xl font-light mt-1" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>
                      {formatEuro(resultats.loyerAnnuel)}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(26,22,18,0.40)" }}>loyers encaissés / an</div>
                  </div>

                  {/* Charges annuelles */}
                  <div className="rounded-xl p-4" style={cardStyle}>
                    <div className={LABEL}>Charges annuelles</div>
                    <div className="text-xl font-light mt-1" style={{ color: "#B03A2A", letterSpacing: "-0.02em" }}>
                      {formatEuro(resultats.chargesDeductibles)}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>charges + intérêts emprunt</div>
                    <div className="text-[11px] mt-1.5" style={{ color: "rgba(26,22,18,0.35)" }}>
                      dont {formatEuro(resultats.interetsAnnee1)} d&apos;intérêts
                    </div>
                  </div>

                  {/* Impôt annuel + mensuel */}
                  <div className="rounded-xl p-4" style={cardStyle}>
                    <div className={LABEL}>Impôt estimé annuel</div>
                    <div className="text-xl font-light mt-1" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>
                      {formatEuro(displayImpot)}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>TMI {form.tmi}% + PS 18,6%</div>
                    <div className="text-base font-light mt-2" style={{ color: "rgba(26,22,18,0.45)", letterSpacing: "-0.02em" }}>
                      {formatEuro(displayImpotMensuel)}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>mensuel · annuel ÷ 12</div>
                  </div>

                  {/* Cash-flow mensuel */}
                  <div className="rounded-xl p-4" style={cardStyle}>
                    <div className={LABEL}>Cash-flow mensuel</div>
                    <div className="text-xl font-light mt-1" style={{
                      color: displayCashflow >= 0 ? "#1A7A52" : "#B03A2A",
                      letterSpacing: "-0.02em",
                    }}>
                      {formatEuro(displayCashflow)}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(26,22,18,0.40)" }}>
                      {selectedRegime === "micro" ? "Micro-BIC" : selectedRegime === "reel" ? "Régime réel" : "Régime réel (par défaut)"}
                    </div>
                  </div>
                </div>

                {/* Loyer slider ou estimations saisonnières */}
                {isSaisonnier && resultatsTriple ? (
                  <div className="rounded-xl p-5" style={cardStyle}>
                    <div className="text-sm font-medium mb-4" style={{ color: "#1A1612" }}>Revenus locatifs selon les estimations</div>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { label: "Basse", taux: parseFloat(tauxOccBas) || 0, accent: "rgba(176,58,42,0.12)", color: "#B03A2A" },
                        { label: "Moyenne", taux: parseFloat(tauxOccMoyen) || 0, accent: "rgba(201,91,42,0.12)", color: "#C95B2A" },
                        { label: "Haute", taux: parseFloat(tauxOccHaut) || 0, accent: "rgba(26,122,82,0.12)", color: "#1A7A52" },
                      ] as const).map(({ label, taux, accent, color }) => {
                        const loyer = loyerSaisonnier(parseFloat(prixNuitee) || 0, taux);
                        return (
                          <div key={label} className="rounded-lg p-3 text-center" style={{ background: accent }}>
                            <div className="text-[10px] uppercase tracking-[0.12em] font-medium mb-1" style={{ color }}>{label}</div>
                            <div className="text-lg font-light" style={{ color, letterSpacing: "-0.02em" }}>{formatEuro(loyer)}/mois</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "rgba(26,22,18,0.45)" }}>{taux}% d&apos;occupation · <strong>{Math.round(taux / 100 * 365)} nuits/an</strong></div>
                            <div className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>{formatEuro(loyer * 12)}/an</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : !isSaisonnier ? (
                  <div className="rounded-xl p-5" style={cardStyle}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium" style={{ color: "#1A1612" }}>Ajuster le loyer</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={loyerEffectif || ""}
                          onChange={e => {
                            const v = parseFloat(e.target.value) || 0;
                            setLoyerSlider(v);
                            updateField("loyer", e.target.value);
                            if (showResults) {
                              const r = computeResultats(form, v, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
                              setResultats(r);
                            }
                          }}
                          className="w-24 text-right text-xl font-semibold rounded-md px-2 py-1 focus:outline-none [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                          style={{ color: "#F5F0E8", background: "#C95B2A", border: "none" }}
                        />
                        <span className="text-base font-medium" style={{ color: "#C95B2A" }}>/mois</span>
                      </div>
                    </div>
                    <input type="range"
                      min={sliderMin} max={sliderMax} step={5}
                      value={loyerSlider || parseFloat(form.loyer) || 500}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        setLoyerSlider(v);
                        updateField("loyer", v.toString());
                        if (showResults) {
                          const r = computeResultats(form, v, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants);
                          setResultats(r);
                        }
                      }}
                      className="w-full" />
                  </div>
                ) : null}

                {/* Comparaison régimes + choix */}
                <div className="rounded-xl p-5" style={cardStyle}>
                  {isSaisonnier && <h3 className="font-medium text-[#1A1612] mb-4">Comparaison des régimes fiscaux</h3>}

                  {isSaisonnier && resultatsTriple ? (() => {
                    const scenarios = [
                      { label: "Estimation basse", r: resultatsTriple.bas, accent: "rgba(176,58,42,0.05)", border: "rgba(176,58,42,0.25)", tagBg: "rgba(176,58,42,0.1)", tagColor: "#B03A2A" },
                      { label: "Estimation moyenne", r: resultatsTriple.moyen, accent: "rgba(201,91,42,0.05)", border: "rgba(201,91,42,0.35)", tagBg: "rgba(201,91,42,0.12)", tagColor: "#C95B2A" },
                      { label: "Estimation haute", r: resultatsTriple.haut, accent: "rgba(26,122,82,0.05)", border: "rgba(26,122,82,0.25)", tagBg: "rgba(26,122,82,0.1)", tagColor: "#1A7A52" },
                    ];
                    const RegimeRow = ({ sc, isReel }: { sc: typeof scenarios[0]; isReel: boolean }) => {
                      const r = sc.r;
                      if (!r) return <div className="rounded-lg p-3 text-center text-xs" style={{ background: sc.accent, border: `0.5px solid ${sc.border}`, color: "rgba(26,22,18,0.4)" }}>–</div>;
                      const cf = isReel ? r.cashflowReelMensuel : r.cashflowBICMensuel;
                      const base = isReel ? r.baseImposableReel : r.baseBIC;
                      const impot = isReel ? r.impotReel : r.impotBIC;
                      const Row = ({ label, val, color, bold, separator }: { label: string; val: string; color?: string; bold?: boolean; separator?: boolean }) => (
                        <div className="flex justify-between" style={{ paddingTop: separator ? 6 : 0, marginTop: separator ? 4 : 0, borderTop: separator ? "0.5px solid rgba(26,22,18,0.1)" : "none" }}>
                          <span style={{ color: "rgba(26,22,18,0.5)", fontSize: 11 }}>{label}</span>
                          <span style={{ color: color ?? "#1A1612", fontWeight: bold ? 600 : 400, fontSize: 11 }}>{val}</span>
                        </div>
                      );
                      return (
                        <div>
                          <div className="space-y-1.5">
                            <Row label="Revenus annuels" val={formatEuro(r.loyerAnnuel)} bold />
                            <Row label="Emprunt" val={`−${formatEuro(r.creditAnnuel)}`} color="#B03A2A" />
                            {isReel ? (
                              <>
                                <Row label="Charges" val={`−${formatEuro(r.chargesDeductibles - r.interetsAnnee1)}`} color="#B03A2A" />
                                <Row label="Amortissements" val={`−${formatEuro(r.amortTotal)}`} color="#B03A2A" />
                              </>
                            ) : (
                              <Row label="Abattement 30%" val={`−${formatEuro(r.loyerAnnuel * 0.30)}`} color="#B03A2A" />
                            )}
                            <Row label="Base imposable" val={formatEuro(base)} color={base === 0 ? "#1A7A52" : "#1A1612"} bold separator />
                            <Row label="Impôt estimé" val={formatEuro(impot)} color="#B03A2A" />
                            <Row label="Cash-flow/mois" val={formatEuro(cf)} color={cf >= 0 ? "#1A7A52" : "#B03A2A"} bold separator />
                          </div>
                        </div>
                      );
                    };
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        {scenarios.map(sc => (
                          <div key={sc.label} className="rounded-xl overflow-hidden flex flex-col"
                            style={{ border: `1.5px solid ${sc.border}`, background: sc.accent }}>
                            <div className="px-3 py-3 text-center" style={{ borderBottom: `1px solid ${sc.border}` }}>
                              <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: sc.tagColor }}>{sc.label}</div>
                              {sc.r && <div className="text-base font-semibold mt-0.5" style={{ color: sc.tagColor }}>{formatEuro(sc.r.loyerAnnuel)}/an</div>}
                            </div>
                            <div className="px-3 pt-2 pb-3" style={{ borderBottom: `1px solid ${sc.border}` }}>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "#4E1F12" }}>Régime réel <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "#C95B2A", color: "#F5F0E8" }}>Recommandé</span></div>
                              <RegimeRow sc={sc} isReel={true} />
                            </div>
                            <div className="px-3 pt-2 pb-3">
                              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "rgba(26,22,18,0.5)" }}>Micro-BIC 2025 <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(26,22,18,0.08)", color: "rgba(26,22,18,0.5)" }}>Abatt. 30%</span></div>
                              <RegimeRow sc={sc} isReel={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })() : (() => {
                    const economy = resultats.impotBIC - resultats.impotReel;
                    const cfDiff = resultats.cashflowReelMensuel - resultats.cashflowBICMensuel;
                    const reelBetter = economy > 0 || (economy === 0 && cfDiff >= 0);
                    const bestLabel = reelBetter ? "Régime Réel Simplifié" : "Micro-BIC 2025";
                    const bestColor = reelBetter ? "#C95B2A" : "#1A1612";
                    const bestBg = reelBetter ? "rgba(201,91,42,0.06)" : "rgba(26,22,18,0.04)";
                    const bestBorder = reelBetter ? "rgba(201,91,42,0.3)" : "rgba(26,22,18,0.2)";

                    const Row = ({ label, val, color, bold, sep, indent }: { label: string; val: string; color?: string; bold?: boolean; sep?: boolean; indent?: boolean }) => (
                      <div className={`flex justify-between items-baseline py-2.5${indent ? " pl-4" : ""}${sep ? " mt-1" : ""}`}
                        style={{ borderTop: sep ? "1px solid rgba(26,22,18,0.09)" : undefined }}>
                        <span className="text-sm pr-3" style={{ color: indent ? "rgba(26,22,18,0.4)" : "rgba(26,22,18,0.58)", fontSize: indent ? 12 : 13 }}>{label}</span>
                        <span className="text-sm whitespace-nowrap" style={{ fontSize: 13, fontWeight: bold ? 600 : 400, color: color ?? "#1A1612" }}>{val}</span>
                      </div>
                    );

                    return (
                      <>
                        {/* Recommandation banner */}
                        <div className="rounded-xl px-5 py-4 mb-5" style={{ background: bestBg, border: `1.5px solid ${bestBorder}` }}>
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "rgba(26,22,18,0.45)" }}>Régime le plus adapté à votre situation</div>
                          <div className="text-2xl font-black" style={{ color: bestColor, letterSpacing: "-0.02em" }}>{bestLabel}</div>
                          <div className="text-base mt-1.5 font-semibold" style={{ color: reelBetter ? "#1A7A52" : "rgba(26,22,18,0.6)" }}>
                            {reelBetter
                              ? `${economy > 0 ? `${formatEuro(economy)}/an d'impôt économisé` : ""}${cfDiff > 0 ? `${economy > 0 ? " · " : ""}Cash-flow supérieur de ${formatEuro(cfDiff)}/mois` : ""}`
                              : `Micro-BIC suffisant — écart d'impôt de ${formatEuro(Math.abs(economy))}/an`}
                          </div>
                        </div>

                        {/* "Fais ton choix" + tableaux */}
                        {selectedRegime === null ? (
                          <>
                            <div className="text-center mb-4">
                              <span className="text-base font-semibold" style={{ color: "#1A1612" }}>Fais ton choix de régime fiscal</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                              {/* Réel — clickable */}
                              <button type="button" onClick={() => setSelectedRegime("reel")}
                                className="rounded-xl overflow-hidden text-left w-full transition-all hover:shadow-md focus:outline-none group"
                                style={{ border: "2px solid rgba(201,91,42,0.35)" }}>
                                {/* Radio header */}
                                <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: "rgba(201,91,42,0.08)", borderBottom: "1px solid rgba(201,91,42,0.2)" }}>
                                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid #C95B2A", background: "#fff" }}>
                                    <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: "#C95B2A" }} />
                                  </div>
                                  <span className="font-bold text-[15px]" style={{ color: "#4E1F12" }}>Régime réel simplifié</span>
                                  <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "#C95B2A", color: "#F5F0E8" }}>RECOMMANDÉ</span>
                                </div>
                                <div className="px-5 pb-2" style={{ background: "#FDFAF6" }}>
                                  <Row label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                                  <Row label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                                  <div className="pl-3 pb-1.5 -mt-1">
                                    <span className="text-[13px] font-medium" style={{ color: "rgba(26,22,18,0.5)" }}>Dont frais d&apos;emprunt : </span>
                                    <span className="text-[13px] font-semibold" style={{ color: "#4E1F12" }}>{formatEuro(resultats.interetsAnnee1)}</span>
                                  </div>
                                  <Row label="Charges déductibles" val={`−${formatEuro(resultats.chargesDeductibles)}`} color="#B03A2A" />
                                  <Row label="Amortissements" val={`−${formatEuro(resultats.amortTotal)}`} color="#B03A2A" />
                                  <Row label="Base imposable" val={formatEuro(resultats.baseImposableReel)} bold sep />
                                  <Row label="Impôt estimé" val={formatEuro(resultats.impotReel)} color="#B03A2A" />
                                  <Row label="Cash-flow mensuel" val={formatEuro(resultats.cashflowReelMensuel)} bold color={resultats.cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"} sep />
                                </div>
                                <div className="px-5 py-3 text-center text-sm font-semibold" style={{ background: "rgba(201,91,42,0.08)", color: "#C95B2A" }}>
                                  Choisir ce régime →
                                </div>
                              </button>

                              {/* Micro-BIC — clickable */}
                              <button type="button" onClick={() => { setSelectedRegime("micro"); setSimulationValidated(true); }}
                                className="rounded-xl overflow-hidden text-left w-full transition-all hover:shadow-md focus:outline-none group"
                                style={{ border: "1.5px solid rgba(26,22,18,0.15)" }}>
                                <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: "#EDE7DC", borderBottom: "0.5px solid rgba(26,22,18,0.12)" }}>
                                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid rgba(26,22,18,0.35)", background: "#fff" }}>
                                    <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: "#1A1612" }} />
                                  </div>
                                  <span className="font-bold text-[15px]" style={{ color: "#1A1612" }}>Micro-BIC 2025</span>
                                  <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded" style={{ background: "rgba(26,22,18,0.1)", color: "rgba(26,22,18,0.55)" }}>ABATTEMENT 30%</span>
                                </div>
                                <div className="px-5 pb-2" style={{ background: "#FDFAF6" }}>
                                  <Row label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                                  <Row label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                                  <div className="pl-3 pb-1.5 -mt-1">
                                    <span className="text-[13px] font-medium" style={{ color: "rgba(26,22,18,0.5)" }}>Dont frais d&apos;emprunt : </span>
                                    <span className="text-[13px] font-semibold" style={{ color: "#4E1F12" }}>{formatEuro(resultats.interetsAnnee1)}</span>
                                  </div>
                                  <Row label="Base imposable (70% loyers)" val={formatEuro(resultats.baseBIC)} bold sep />
                                  <Row label="Impôt estimé" val={formatEuro(resultats.impotBIC)} color="#B03A2A" />
                                  <Row label="Cash-flow mensuel" val={formatEuro(resultats.cashflowBICMensuel)} bold color={resultats.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"} sep />
                                </div>
                                <div className="px-5 py-3 text-center text-sm font-semibold" style={{ background: "#EDE7DC", color: "rgba(26,22,18,0.6)" }}>
                                  Choisir ce régime →
                                </div>
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Un régime sélectionné — tableau unique + bouton changer */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {/* Tableau du régime choisi */}
                            <div className="rounded-xl overflow-hidden"
                              style={{
                                border: selectedRegime === "reel" ? "2.5px solid #C95B2A" : "2.5px solid #1A1612",
                                boxShadow: selectedRegime === "reel" ? "0 0 0 3px rgba(201,91,42,0.12)" : "0 0 0 3px rgba(26,22,18,0.07)",
                              }}>
                              <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: selectedRegime === "reel" ? "#C95B2A" : "#1A1612", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid #F5F0E8", background: "transparent" }}>
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />
                                </div>
                                <span className="font-bold text-[15px]" style={{ color: "#F5F0E8" }}>
                                  {selectedRegime === "reel" ? "Régime réel simplifié" : "Micro-BIC 2025"}
                                </span>
                                <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "rgba(245,240,232,0.2)", color: "#F5F0E8" }}>✓ SÉLECTIONNÉ</span>
                              </div>
                              <div className="px-5" style={{ background: "#FDFAF6" }}>
                                {selectedRegime === "reel" ? (
                                  <>
                                    <Row label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                                    <Row label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                                    <div className="pl-3 -mt-1 pb-2">
                                      <span className="text-[12px]" style={{ color: "rgba(26,22,18,0.45)" }}>Dont frais d&apos;emprunt </span>
                                      <span className="text-[13px] font-semibold" style={{ color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span>
                                    </div>
                                    <Row label="Charges déductibles" val={`−${formatEuro(resultats.chargesDeductibles)}`} color="#B03A2A" />
                                    <Row label="Résultat avant amortissement" val={formatEuro(resultats.resultatAvantAmort)} bold color={resultats.resultatAvantAmort >= 0 ? "#1A1612" : "#B03A2A"} sep />
                                    <Row label="Amortissements" val={`−${formatEuro(resultats.amortTotal)}`} color="#B03A2A" />
                                    <Row label="Base imposable" val={formatEuro(resultats.baseImposableReel)} bold sep />
                                    <Row label="Impôt estimé" val={formatEuro(resultats.impotReel)} color="#B03A2A" />
                                    <Row label="Amortissement à reporter N+1" val={formatEuro(resultats.amortAReporter)} color="#B08A2A" />
                                    <Row label="Cash-flow mensuel" val={formatEuro(resultats.cashflowReelMensuel)} bold color={resultats.cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"} sep />
                                  </>
                                ) : (
                                  <>
                                    <Row label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                                    <Row label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                                    <div className="pl-3 -mt-1 pb-2">
                                      <span className="text-[12px]" style={{ color: "rgba(26,22,18,0.45)" }}>Dont frais d&apos;emprunt </span>
                                      <span className="text-[13px] font-semibold" style={{ color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span>
                                    </div>
                                    <Row label="Base imposable (70% loyers)" val={formatEuro(resultats.baseBIC)} bold sep />
                                    <Row label="Impôt estimé" val={formatEuro(resultats.impotBIC)} color="#B03A2A" />
                                    <Row label="Cash-flow mensuel" val={formatEuro(resultats.cashflowBICMensuel)} bold color={resultats.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"} sep />
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Bouton changer de régime */}
                            <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl" style={{ background: "rgba(26,22,18,0.03)", border: "1px dashed rgba(26,22,18,0.15)", minHeight: 180 }}>
                              <div className="text-sm text-center" style={{ color: "rgba(26,22,18,0.45)" }}>
                                Vous avez choisi le<br />
                                <strong style={{ color: selectedRegime === "reel" ? "#C95B2A" : "#1A1612" }}>
                                  {selectedRegime === "reel" ? "Régime réel simplifié" : "Micro-BIC 2025"}
                                </strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setSelectedRegime(null); setSimulationValidated(false); }}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                                style={{ background: "#EDE7DC", color: "#4E1F12", border: "1px solid rgba(78,31,18,0.2)" }}>
                                ← Changer de régime fiscal
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                </div>

                {/* Amortissement — réel uniquement */}
                {selectedRegime === "reel" && <div className="rounded-xl overflow-hidden" style={cardStyle}>
                  {/* En-tête L'Amortissement */}
                  <div className="px-6 py-5" style={{ background: "linear-gradient(90deg, #4E1F12 0%, #7A2E15 100%)", borderBottom: "3px solid #C95B2A" }}>
                    <div className="text-xl font-black tracking-tight" style={{ color: "#F5F0E8" }}>L&apos;Amortissement LMNP</div>
                    <div className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.65)" }}>Régime réel simplifié · Optimisation fiscale</div>
                  </div>
                  <div className="px-5 pt-5 pb-5 space-y-5">

                      {/* Bloc unifié : explication + valeur amort + méthodes + boutons */}
                      {(() => {
                        const prixVal2 = parseFloat(form.prix) || 0;
                        const valAmort2 = prixVal2 * amortPct / 100;
                        return (
                          <>
                          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(78,31,18,0.12)" }}>
                            {/* Explication principale + calcul valeur amortissable */}
                            <div className="p-5" style={{ background: "rgba(78,31,18,0.05)" }}>
                              <p className="text-[15px] leading-relaxed font-medium" style={{ color: "#4E1F12" }}>
                                En LMNP au réel, vous pouvez amortir comptablement votre bien — <strong>hors terrain (~{100 - amortPct}%)</strong> — sur sa durée d&apos;usage. Chaque année, cet amortissement est déduit de vos revenus locatifs, ce qui <strong>réduit la base imposable et donc l&apos;impôt</strong>.
                              </p>

                              {/* Bloc calcul structuré */}
                              <div className="mt-4 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(78,31,18,0.15)" }}>
                                {/* Ligne 1 : Prix du bien */}
                                <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(78,31,18,0.04)", borderBottom: "1px solid rgba(78,31,18,0.1)" }}>
                                  <span className="text-[13px] font-semibold" style={{ color: "#4E1F12" }}>Prix du bien</span>
                                  <span className="text-[15px] font-bold" style={{ color: "#1A1612" }}>{formatEuro(prixVal2)}</span>
                                </div>
                                {/* Ligne 2 : % amortissable (modifiable) */}
                                <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(78,31,18,0.02)", borderBottom: "1.5px solid #C95B2A" }}>
                                  <span className="text-[13px] font-semibold" style={{ color: "#4E1F12" }}>
                                    Part amortissable <span className="font-normal text-[12px]" style={{ color: "rgba(26,22,18,0.5)" }}>(hors terrain, modifiable)</span>
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <input type="number" min={0} max={100} value={amortPct}
                                      onChange={e => {
                                        const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        e.target.value = String(v);
                                        setAmortPct(v);
                                      }}
                                      className="w-14 text-center text-[15px] font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#C95B2A]"
                                      style={{ ...INPUT_STYLE, color: "#C95B2A" }} />
                                    <span className="text-[15px] font-bold" style={{ color: "#C95B2A" }}>%</span>
                                  </div>
                                </div>
                                {/* Ligne 3 : Valeur amortissable — résultat */}
                                <div className="flex items-center justify-between px-4 py-3.5" style={{ background: "linear-gradient(90deg, rgba(78,31,18,0.08) 0%, rgba(201,91,42,0.06) 100%)" }}>
                                  <span className="text-[14px] font-bold" style={{ color: "#4E1F12" }}>Valeur amortissable</span>
                                  <span className="text-[20px] font-black" style={{ color: "#C95B2A", letterSpacing: "-0.02em" }}>{formatEuro(valAmort2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Deux colonnes texte — suite naturelle, sans bordure top */}
                            <div className="grid grid-cols-2 gap-0" style={{ borderTop: "none" }}>
                              <div className="p-5" style={{ background: "rgba(78,31,18,0.04)", borderRight: "2px solid #C95B2A" }}>
                                <div className="font-bold text-[14px] mb-2" style={{ color: "#4E1F12" }}>Amort. Global Simplifié</div>
                                <p className="text-[13px] leading-relaxed" style={{ color: "#4E1F12", opacity: 0.75 }}>
                                  Tolérée sans comptable. Le bien est amorti en une seule fois sur la durée choisie. Simple, mais moins optimisé.
                                </p>
                              </div>
                              <div className="p-5" style={{ background: "rgba(26,122,82,0.04)" }}>
                                <div className="font-bold text-[14px] mb-2" style={{ color: "#1A7A52" }}>Amort. par Composant</div>
                                <p className="text-[13px] leading-relaxed" style={{ color: "#1A7A52", opacity: 0.8 }}>
                                  Méthode optimale recommandée par les experts. Durées distinctes par composant pour maximiser la déduction.
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Boutons choix — séparés, style radio comme le choix de régime */}
                          <div className="grid grid-cols-2 gap-4 pt-1">
                            {/* Global Simplifié */}
                            <button onClick={() => setAmortMode("ensemble")}
                              className="rounded-xl overflow-hidden text-left w-full transition-all hover:shadow-md focus:outline-none group"
                              style={{
                                border: amortMode === "ensemble" ? "2.5px solid #C95B2A" : "1.5px solid rgba(201,91,42,0.25)",
                                boxShadow: amortMode === "ensemble" ? "0 0 0 3px rgba(201,91,42,0.1)" : "none",
                              }}>
                              <div className="flex items-center gap-3 px-4 py-3" style={{ background: amortMode === "ensemble" ? "#C95B2A" : "rgba(201,91,42,0.06)" }}>
                                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${amortMode === "ensemble" ? "#F5F0E8" : "#C95B2A"}`, background: "transparent" }}>
                                  {amortMode === "ensemble"
                                    ? <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />
                                    : <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: "#C95B2A" }} />}
                                </div>
                                <span className="font-bold text-[14px]" style={{ color: amortMode === "ensemble" ? "#F5F0E8" : "#4E1F12" }}>Global Simplifié</span>
                                {amortMode === "ensemble" && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(245,240,232,0.25)", color: "#F5F0E8" }}>✓ SÉLECTIONNÉ</span>}
                              </div>
                            </button>

                            {/* Par Composant */}
                            <button onClick={() => setAmortMode("composant")}
                              className="rounded-xl overflow-hidden text-left w-full transition-all hover:shadow-md focus:outline-none group"
                              style={{
                                border: amortMode === "composant" ? "2.5px solid #1A7A52" : "1.5px solid rgba(26,122,82,0.25)",
                                boxShadow: amortMode === "composant" ? "0 0 0 3px rgba(26,122,82,0.1)" : "none",
                              }}>
                              <div className="flex items-center gap-3 px-4 py-3" style={{ background: amortMode === "composant" ? "#1A7A52" : "rgba(26,122,82,0.06)" }}>
                                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${amortMode === "composant" ? "#F5F0E8" : "#1A7A52"}`, background: "transparent" }}>
                                  {amortMode === "composant"
                                    ? <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />
                                    : <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: "#1A7A52" }} />}
                                </div>
                                <span className="font-bold text-[14px]" style={{ color: amortMode === "composant" ? "#F5F0E8" : "#1A7A52" }}>Par Composant</span>
                                {amortMode === "composant" && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(245,240,232,0.25)", color: "#F5F0E8" }}>✓ SÉLECTIONNÉ</span>}
                              </div>
                            </button>
                          </div>
                          </>
                        );
                      })()}

                      {/* Contenu selon mode choisi — masqué jusqu'au clic */}
                      {amortMode !== null && (() => {
                        const prixVal = parseFloat(form.prix) || 0;
                        const valAmort = prixVal * amortPct / 100;
                        return (
                          <div className="space-y-4">
                            {/* Slider durée (mode ensemble) */}
                            {amortMode === "ensemble" && (
                              <div className="rounded-lg p-4" style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.08)" }}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className={LABEL} style={{ marginBottom: 0 }}>Durée d&apos;amortissement</div>
                                  <div className="flex items-baseline gap-3">
                                    <span className="text-lg font-semibold" style={{ color: "#C95B2A" }}>{amortDureeEnsemble} ans</span>
                                    <span className="text-[13px] font-semibold" style={{ color: "#4E1F12" }}>{formatEuro(valAmort)}</span>
                                  </div>
                                </div>
                                <input
                                  type="range" min={5} max={50} step={1}
                                  value={amortDureeEnsemble}
                                  onChange={e => setAmortDureeEnsemble(parseInt(e.target.value))}
                                  className="w-full accent-[#C95B2A]"
                                />
                                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: "rgba(26,22,18,0.3)" }}>
                                  <span>5</span><span>50 ans</span>
                                </div>
                                <div className="mt-3 flex gap-3">
                                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "linear-gradient(135deg, #4E1F12 0%, #C95B2A 100%)" }}>
                                    <div className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: "rgba(245,240,232,0.75)" }}>Valeur amortissable</div>
                                    <div className="text-base font-bold" style={{ color: "#F5F0E8" }}>{formatEuro(valAmort)}</div>
                                  </div>
                                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "rgba(201,91,42,0.08)", border: "1px solid rgba(201,91,42,0.2)" }}>
                                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#C95B2A" }}>Amort. / an</div>
                                    <div className="text-base font-bold" style={{ color: "#C95B2A" }}>{formatEuro(amortDureeEnsemble > 0 ? valAmort / amortDureeEnsemble : 0)}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Rappel valeur amortissable au-dessus du tableau composant */}
                            {amortMode === "composant" && (
                              <p className="text-[13px]" style={{ color: "rgba(26,22,18,0.55)" }}>
                                Valeur à répartir : <strong style={{ color: "#C95B2A" }}>{formatEuro(valAmort)}</strong>
                              </p>
                            )}

                            {/* Mode Par composant */}
                            {amortMode === "composant" && (() => {
                              const totalPct = composants.reduce((s, c) => s + c.pct, 0);
                              const inputCls = "w-14 px-2 py-1.5 text-sm rounded-md text-center text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#C95B2A] [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";
                              return (
                                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(78,31,18,0.18)" }}>
                                  {/* Header */}
                                  <div className="grid items-center px-4 py-2.5"
                                    style={{ gridTemplateColumns: "1fr 100px 100px 90px", background: "#4E1F12" }}>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(245,240,232,0.65)" }}>Composant</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: "rgba(245,240,232,0.65)" }}>%</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: "rgba(245,240,232,0.65)" }}>Durée (ans)</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: "#C95B2A" }}>Amort / an</span>
                                  </div>

                                  {composants.map((c, i) => {
                                    const val = valAmort * c.pct / 100;
                                    return (
                                      <div key={c.label} className="grid items-center px-4 py-3"
                                        style={{ gridTemplateColumns: "1fr 100px 100px 90px", borderBottom: "0.5px solid rgba(26,22,18,0.07)", background: i % 2 === 0 ? "#FDFAF6" : "#F5F0E8" }}>
                                        <div>
                                          <div className="text-sm font-medium" style={{ color: "#1A1612" }}>{c.label}</div>
                                          <div className="text-[11px]" style={{ color: "#C95B2A" }}>{formatEuro(val)}</div>
                                        </div>
                                        <div className="flex items-center justify-center gap-1">
                                          <input type="number" min={0} max={100} value={c.pct === 0 ? "" : c.pct}
                                            placeholder="0"
                                            onChange={e => {
                                              const raw = e.target.value;
                                              const v = raw === "" ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0));
                                              setComposants(prev => prev.map((x, j) => j === i ? { ...x, pct: v } : x));
                                            }}
                                            className={inputCls} style={INPUT_STYLE} />
                                          <span className="text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>%</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-1">
                                          <input type="number" min={0} max={100} value={c.duree === 0 ? "" : c.duree}
                                            placeholder="0"
                                            onChange={e => {
                                              const raw = e.target.value;
                                              const v = raw === "" ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0));
                                              setComposants(prev => prev.map((x, j) => j === i ? { ...x, duree: v } : x));
                                            }}
                                            className={inputCls} style={INPUT_STYLE} />
                                          <span className="text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>ans</span>
                                        </div>
                                        <div className="text-sm font-bold text-right" style={{ color: "#C95B2A" }}>
                                          {formatEuro(c.duree > 0 ? val / c.duree : 0)}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Total row */}
                                  <div className="grid items-center px-4 py-3"
                                    style={{ gridTemplateColumns: "1fr 100px 100px 90px", background: "#4E1F12" }}>
                                    <span className="text-sm font-semibold" style={{ color: "#F5F0E8" }}>Total</span>
                                    <span className="text-sm font-semibold text-center" style={{ color: totalPct === 100 ? "#6FCF97" : "#EB5757" }}>
                                      {totalPct} %{totalPct !== 100 && " ⚠"}
                                    </span>
                                    <span />
                                    <span className="text-sm font-bold text-right" style={{ color: "#C95B2A" }}>
                                      {formatEuro(composants.reduce((s, c) => s + (valAmort * c.pct / 100) / (c.duree || 1), 0))}/an
                                    </span>
                                  </div>
                                  {totalPct !== 100 && (
                                    <p className="px-4 py-2 text-xs" style={{ color: "#B03A2A", background: "rgba(176,58,42,0.06)" }}>
                                      ⚠ Les % doivent totaliser 100 % pour couvrir toute la valeur amortissable.
                                    </p>
                                  )}
                                  {composants.some(c => c.duree === 0 && c.pct > 0) && (
                                    <p className="px-4 py-2 text-xs" style={{ color: "#B03A2A", background: "rgba(176,58,42,0.06)" }}>
                                      ⚠ La durée d&apos;amortissement ne peut pas être 0 an pour un composant avec un % &gt; 0.
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}

                      {/* Récap cards */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { label: "Bien", val: amortBienDisplay, sub: (amortMode ?? "ensemble") === "ensemble" ? `${amortPct}% prix · ${amortDureeEnsemble} ans` : `${amortPct}% · composants`, color: "#4E1F12" },
                          { label: "Mobilier", val: amortMobilierDisplay, sub: "mobilier · 7 ans", color: "#6B4226" },
                          { label: "Travaux", val: amortTravauxDisplay, sub: "travaux · 15 ans", color: "#6B4226" },
                          { label: "Notaire", val: amortNotaireDisplay, sub: "notaire · 20 ans", color: "#6B4226" },
                          { label: "Total", val: amortTotalDisplay, sub: "Déductible/an", accent: true, color: "#C95B2A" },
                        ].map(({ label, val, sub, accent, color }) => (
                          <div key={label} className="rounded-lg p-3.5 text-center"
                            style={{ background: accent ? "rgba(201,91,42,0.1)" : "#F5F0E8", border: accent ? "1.5px solid rgba(201,91,42,0.3)" : "0.5px solid rgba(26,22,18,0.1)" }}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                              style={{ color: accent ? "#C95B2A" : "rgba(26,22,18,0.45)" }}>{label}</div>
                            <div className="font-bold text-[15px]"
                              style={{ color }}>{formatEuro(val)}/an</div>
                            <div className="text-[11px] mt-1" style={{ color: "rgba(26,22,18,0.38)" }}>{sub}</div>
                          </div>
                        ))}
                      </div>

                      {/* Bouton Ajuster/Valider */}
                      <div className="flex justify-center">
                        <button onClick={handleAjuster}
                          className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", letterSpacing: "0.02em" }}>
                          Valider la simulation →
                        </button>
                      </div>
                  </div>
                </div>}

              </div>{/* end space-y-5 */}

              {/* ─── BOUTONS PDF + SAUVEGARDER — bas de page ─── */}
              {simulationValidated && <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
                <button onClick={() => {
                  const plan = getPlan();
                  if (plan === "pro") { setPendingPdfAction("pro"); setShowBienInfoPopup(true); return; }
                  if (plan === "starter") { setPdfWeekCount(getPdfWeekCount()); setShowPDFStarter(true); return; }
                  setShowPayPopup(true);
                }}
                  className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                  style={{ background: "#4E1F12", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.3)", letterSpacing: "0.02em" }}>
                  Générer compte rendu PDF
                </button>
                <button
                  onClick={() => setShowSauvegarder(true)}
                  className="flex items-center gap-2 px-6 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                  style={{ background: "#EDE7DC", color: "#4E1F12", border: "1px solid rgba(78,31,18,0.2)" }}
                  title="Sauvegarder la simulation"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Sauvegarder
                </button>
              </div>}
              </>
            )
          )}
        </div>
      </div>
      {showPayPopup && (
        <PopupPaiementUnite
          onClose={() => setShowPayPopup(false)}
          simulationData={{
            form,
            amortPct,
            amortMode: amortMode ?? "ensemble",
            amortDureeEnsemble,
            composants,
            savedAt: Date.now(),
            isSaisonnier,
            prixNuitee,
            tauxOccBas,
            tauxOccMoyen,
            tauxOccHaut,
            resultatsTriple,
          }}
        />
      )}
      {showAmortLimite && <PopupAmortLimite onClose={() => setShowAmortLimite(false)} />}
      {showSauvegarder && (
        <PopupSauvegarder
          isPro={getPlan() === "starter" || getPlan() === "pro"}
          simulationData={{ form, amortPct, amortMode, amortDureeEnsemble, composants, savedAt: Date.now(), isSaisonnier, prixNuitee, tauxOccBas, tauxOccMoyen, tauxOccHaut, resultatsTriple }}
          onClose={() => setShowSauvegarder(false)}
          onSaved={() => setShowSauvegarder(false)}
        />
      )}
      {showPDFStarter && (
        <PopupPDFStarter
          weekCount={pdfWeekCount}
          onClose={() => setShowPDFStarter(false)}
          onGenerate={() => {
            incrementPdfWeekCount();
            setShowPDFStarter(false);
            setPendingPdfAction("pro");
            setShowBienInfoPopup(true);
          }}
          onPayUnit={() => setShowPayPopup(true)}
        />
      )}
      {showBienInfoPopup && (
        <PopupBienInfo
          initial={bienInfoRef.current}
          onClose={() => setShowBienInfoPopup(false)}
          ctaLabel={pendingPdfAction === "pay" ? "Continuer vers le paiement" : "Continuer vers le PDF"}
          onConfirm={info => {
            bienInfoRef.current = info;
            setShowBienInfoPopup(false);
            if (pendingPdfAction === "pro") { handleGeneratePDF(); }
            else if (pendingPdfAction === "starter") { setPdfWeekCount(getPdfWeekCount()); setShowPDFStarter(true); }
            else if (pendingPdfAction === "pay") { setShowPayPopup(true); }
            setPendingPdfAction(null);
          }}
        />
      )}
    </section>
  );
}

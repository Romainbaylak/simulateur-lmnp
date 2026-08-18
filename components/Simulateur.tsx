"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PopupPaiementUnite from "./PopupPaiementUnite";
import PopupAmortLimite from "./PopupAmortLimite";
import PopupPDFStarter from "./PopupPDFStarter";
import PopupSauvegarder, { type Plan } from "./PopupSauvegarder";
import PopupSimLimite from "./PopupSimLimite";

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
  chargesLocatairesAnnuel: number;
  recettesAnnuelles: number;
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
  rendementNetReel: number;
  rendementNetBIC: number;
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
  composants: { label: string; pct: number; duree: number }[],
  isSaisonnier = false,
  dureeMobilier = 10,
  dureeTravaux = 20,
  dureeNotaire = 25,
  abattementBIC = isSaisonnier ? 0.30 : 0.50
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

  // Charges locataires récupérables (ex. provision copro refacturée au locataire)
  const chargesLocatairesMensuel = parseFloat(form.chargesLoyer) || 0;
  const chargesLocatairesAnnuel = chargesLocatairesMensuel * 12;
  // Recettes fiscales totales = loyer HC + charges récupérables encaissées
  const recettesAnnuelles = loyerAnnuel + chargesLocatairesAnnuel;

  const assurancePNO = loyerAnnuel * (assurancePNOPct / 100);
  const gestionLocative = loyerAnnuel * (gestionLocativePct / 100);
  const autresCharges = assurancePNO + gestionLocative + entretienCourant + comptabilite;
  // Charges de copropriété conservées en montant brut (charges récupérables non soustraites)
  const chargesAnnuelles = taxeFonciere + chargesCopro + autresCharges;

  const valeurAmortissable = prix * (amortPct / 100);
  const amortBien = amortMode === "ensemble"
    ? valeurAmortissable / amortDureeEnsemble
    : composants.reduce((sum, c) => sum + (valeurAmortissable * c.pct / 100) / c.duree, 0);
  const amortMobilier = dureeMobilier > 0 ? mobilier / dureeMobilier : 0;
  const amortTravaux = dureeTravaux > 0 ? travaux / dureeTravaux : 0;
  const amortNotaire = dureeNotaire > 0 ? notaire / dureeNotaire : 0;
  const amortTotal = amortBien + amortMobilier + amortTravaux + amortNotaire;

  // Réel : recettes fiscales incluent les charges locataires encaissées
  const chargesDeductibles = chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel;
  const resultatAvantAmort = recettesAnnuelles - chargesDeductibles;
  const baseImposableReel = Math.max(0, resultatAvantAmort - amortTotal);
  const impotReel = baseImposableReel * (form.tmi / 100 + 0.186);
  const impotReelMensuel = impotReel / 12;
  const amortAReporter = Math.max(0, amortTotal - Math.max(0, resultatAvantAmort));
  const cashflowReelMensuel = (recettesAnnuelles - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotReel) / 12;

  // Micro-BIC : abattement 50% classique, 30% saisonnier (Loi de Finances 2024)
  const baseBIC = recettesAnnuelles * (1 - abattementBIC);
  const impotBIC = baseBIC * (form.tmi / 100 + 0.186);
  const cashflowBICMensuel = (recettesAnnuelles - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel - impotBIC) / 12;

  const rendementBrut = (loyerAnnuel / investTotal) * 100;
  const rendementNet = ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100;                       // avant impôt
  const rendementNetReel = ((loyerAnnuel - chargesAnnuelles - impotReel) / investTotal) * 100;       // après impôt réel
  const rendementNetBIC = ((loyerAnnuel - chargesAnnuelles - impotBIC) / investTotal) * 100;         // après impôt BIC

  return {
    investTotal, montantCredit, mensualite, creditAnnuel, interetsAnnee1,
    chargesAnnuelles, autresCharges, assuranceEmprunteurAnnuel,
    loyerAnnuel, chargesLocatairesAnnuel, recettesAnnuelles,
    amortBien, amortMobilier, amortTravaux, amortNotaire, amortTotal,
    chargesDeductibles, resultatAvantAmort, baseImposableReel, impotReel, impotReelMensuel,
    amortAReporter, cashflowReelMensuel, baseBIC, impotBIC, cashflowBICMensuel,
    rendementBrut, rendementNet, rendementNetReel, rendementNetBIC,
  };
}

const INPUT = "w-full px-3 py-2.5 text-sm rounded-md text-[#1A1612] placeholder-[rgba(26,22,18,0.35)] focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const INPUT_STYLE = { background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)" };
const LABEL = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[rgba(26,22,18,0.45)] mb-1.5";
const AUTO_STYLE = { ...INPUT_STYLE, background: "rgba(201,91,42,0.06)" };

export default function Simulateur({ onShowResults }: { onShowResults?: () => void } = {}) {
  const { isSignedIn } = useUser();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  useEffect(() => { setCurrentPlan(localStorage.getItem("lmnp_plan")); }, []);
  const isSubscribed = currentPlan === "starter" || currentPlan === "pro";

  // Applique le bonus de simulations dès que l'utilisateur crée son compte
  useEffect(() => {
    if (!isSignedIn) return;
    const pending = typeof window !== "undefined" && localStorage.getItem("lmnp_bonus_pending");
    if (!pending) return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("lmnp_sim_day_count", JSON.stringify({ count: 0, date: today }));
    localStorage.setItem("lmnp_account_bonus_used", "1");
    localStorage.removeItem("lmnp_bonus_pending");
  }, [isSignedIn]);
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
  const [amortDureeMobilier, setAmortDureeMobilier] = useState(10);
  const [amortDureeTravaux, setAmortDureeTravaux] = useState(20);
  const [amortDureeNotaire, setAmortDureeNotaire] = useState(25);
  const [inputMobilier, setInputMobilier] = useState("10");
  const [inputTravaux, setInputTravaux] = useState("20");
  const [inputNotaire, setInputNotaire] = useState("25");
  const [showDetailsEnsemble, setShowDetailsEnsemble] = useState(false);
  const [showDetailsComposant, setShowDetailsComposant] = useState(false);
  const [composants, setComposants] = useState([
    { label: "Bâti / Gros œuvre", pct: 45, duree: 40 },
    { label: "Toiture", pct: 15, duree: 25 },
    { label: "Aménagement intérieur", pct: 20, duree: 15 },
    { label: "Électricité", pct: 10, duree: 20 },
    { label: "Étanchéité", pct: 10, duree: 20 },
  ]);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [pendingAutoSimulate, setPendingAutoSimulate] = useState<Record<string, unknown> | null>(null);
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [showSimLimite, setShowSimLimite] = useState(false);
  const [showAmortRequired, setShowAmortRequired] = useState(false);
  const [showAmortLimite, setShowAmortLimite] = useState(false);
  const [showPDFStarter, setShowPDFStarter] = useState(false);
  const [pdfWeekCount, setPdfWeekCount] = useState(0);
  const [showSauvegarder, setShowSauvegarder] = useState(false);
  const [showRegimeExplainer, setShowRegimeExplainer] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Persistance formulaire dans sessionStorage ────────────────────────────
  const FORM_KEY = "lmnp_form_draft";

  useEffect(() => {
    // Restauration au montage (back navigateur, rechargement)
    try {
      // ?reset=1 : nouvelle simulation demandée depuis le header
      const params = new URLSearchParams(window.location.search);
      if (params.get("reset") === "1") {
        sessionStorage.removeItem(FORM_KEY);
        const url = new URL(window.location.href);
        url.searchParams.delete("reset");
        window.history.replaceState({}, "", url.toString());
        return;
      }
      const raw = sessionStorage.getItem(FORM_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.form) setForm(d.form);
      if (d.isSaisonnier != null) setIsSaisonnier(d.isSaisonnier);
      if (d.prixNuitee != null) setPrixNuitee(d.prixNuitee);
      if (d.tauxOccBas != null) setTauxOccBas(d.tauxOccBas);
      if (d.tauxOccMoyen != null) setTauxOccMoyen(d.tauxOccMoyen);
      if (d.tauxOccHaut != null) setTauxOccHaut(d.tauxOccHaut);
      if (d.amortPct != null) setAmortPct(d.amortPct);
      if (d.amortMode != null) setAmortMode(d.amortMode);
      if (d.amortDureeEnsemble != null) setAmortDureeEnsemble(d.amortDureeEnsemble);
      if (d.amortDureeMobilier != null) { setAmortDureeMobilier(d.amortDureeMobilier); setInputMobilier(String(d.amortDureeMobilier)); }
      if (d.amortDureeTravaux != null) { setAmortDureeTravaux(d.amortDureeTravaux); setInputTravaux(String(d.amortDureeTravaux)); }
      if (d.amortDureeNotaire != null) { setAmortDureeNotaire(d.amortDureeNotaire); setInputNotaire(String(d.amortDureeNotaire)); }
      if (d.composants?.length) setComposants(d.composants);
      if (d.selectedRegime != null) setSelectedRegime(d.selectedRegime);

      // Ouverture depuis "Mes simulations" → déclenche l'auto-simulation via état intermédiaire
      if (params.get("open") === "1") {
        setPendingAutoSimulate(d);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("open");
        window.history.replaceState({}, "", cleanUrl.toString());
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Sauvegarde automatique à chaque changement
    try {
      sessionStorage.setItem(FORM_KEY, JSON.stringify({
        form, isSaisonnier, prixNuitee, tauxOccBas, tauxOccMoyen, tauxOccHaut,
        amortPct, amortMode, amortDureeEnsemble,
        amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
        composants, selectedRegime,
      }));
    } catch { /* ignore */ }
  }, [form, isSaisonnier, prixNuitee, tauxOccBas, tauxOccMoyen, tauxOccHaut,
      amortPct, amortMode, amortDureeEnsemble,
      amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
      composants, selectedRegime]);

  // Effet 2 : déclenché APRÈS le rendu avec le formulaire peuplé → calcule et affiche le bilan
  useEffect(() => {
    if (!pendingAutoSimulate) return;
    const d = pendingAutoSimulate;
    setPendingAutoSimulate(null);
    const f = (d.form ?? {}) as FormState;
    const aMode = (d.amortMode as "ensemble" | "composant") ?? "ensemble";
    const aPct = (d.amortPct as number) ?? 0;
    const aDurEns = (d.amortDureeEnsemble as number) ?? 20;
    const aComps = (d.composants as { label: string; pct: number; duree: number }[]) ?? [];
    const aMob = (d.amortDureeMobilier as number) ?? 10;
    const aTrav = (d.amortDureeTravaux as number) ?? 20;
    const aNotaire = (d.amortDureeNotaire as number) ?? 25;
    if (d.isSaisonnier) {
      const nuitee = parseFloat(d.prixNuitee as string) || 0;
      const lBas   = nuitee * ((parseFloat(d.tauxOccBas   as string) || 0) / 100) * 365 / 12;
      const lMoyen = nuitee * ((parseFloat(d.tauxOccMoyen as string) || 0) / 100) * 365 / 12;
      const lHaut  = nuitee * ((parseFloat(d.tauxOccHaut  as string) || 0) / 100) * 365 / 12;
      const rBas   = computeResultats(f, lBas,   aPct, aMode, aDurEns, aComps, true, aMob, aTrav, aNotaire);
      const rMoyen = computeResultats(f, lMoyen, aPct, aMode, aDurEns, aComps, true, aMob, aTrav, aNotaire);
      const rHaut  = computeResultats(f, lHaut,  aPct, aMode, aDurEns, aComps, true, aMob, aTrav, aNotaire);
      setResultatsTriple({ bas: rBas, moyen: rMoyen, haut: rHaut });
      setResultats(rMoyen);
    } else {
      const loyer = parseFloat((f as unknown as Record<string, string>).loyer) || 0;
      setResultats(computeResultats(f, loyer, aPct, aMode, aDurEns, aComps, false, aMob, aTrav, aNotaire));
    }
    if (d.selectedRegime) setSelectedRegime(d.selectedRegime as "micro" | "reel" | null);
    setShowResults(true);
    onShowResults?.();
    setTimeout(() => {
      if (verdictRef.current) {
        const top = verdictRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 80);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoSimulate]);

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

  const SIM_LIMIT = 6;
  const getSimDayCount = (): number => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem("lmnp_sim_day_count");
      if (!stored) return 0;
      const { count, date } = JSON.parse(stored);
      const today = new Date().toISOString().slice(0, 10);
      if (date !== today) return 0;
      return count ?? 0;
    } catch { return 0; }
  };
  const incrementSimDayCount = () => {
    if (typeof window === "undefined") return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("lmnp_sim_day_count", JSON.stringify({ count: getSimDayCount() + 1, date: today }));
  };
  const isSimBlocked = (): boolean => {
    if (typeof window === "undefined") return false;
    const plan = getPlan();
    if (plan === "starter" || plan === "pro") return false;
    return getSimDayCount() >= SIM_LIMIT;
  };

  const getWeekStart = (): string => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };
  const resultsRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const pdfButtonsRef = useRef<HTMLDivElement>(null);
  const amortContentRef = useRef<HTMLDivElement>(null);
  const validerRef = useRef<HTMLDivElement>(null);

  // Flags pour déclencher un scroll après le prochain rendu React
  const scrollToResults = useRef(false);
  const scrollToValider = useRef(false);
  const scrollToPdf = useRef(false);
  const scrollToAmort = useRef(false);

  useEffect(() => {
    if (scrollToResults.current) {
      scrollToResults.current = false;
      if (verdictRef.current) {
        const top = verdictRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    if (scrollToPdf.current) {
      scrollToPdf.current = false;
      pdfButtonsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (scrollToAmort.current) {
      scrollToAmort.current = false;
      if (amortContentRef.current) {
        const top = amortContentRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    if (scrollToValider.current) {
      scrollToValider.current = false;
      if (validerRef.current) {
        const rect = validerRef.current.getBoundingClientRect();
        const top = window.scrollY + rect.bottom - window.innerHeight + 32;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  });

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
    if (l > 0) setLoyerSlider(l);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loyer]);

  const loyerSaisonnier = (nuitee: number, taux: number) => nuitee * (taux / 100) * 365 / 12;

  const handleSimuler = () => {
    if (isSimBlocked()) { setShowSimLimite(true); return; }
    incrementSimDayCount();
    if (isSaisonnier) {
      const nuitee = parseFloat(prixNuitee) || 0;
      const lBas   = loyerSaisonnier(nuitee, parseFloat(tauxOccBas)   || 0);
      const lMoyen = loyerSaisonnier(nuitee, parseFloat(tauxOccMoyen) || 0);
      const lHaut  = loyerSaisonnier(nuitee, parseFloat(tauxOccHaut)  || 0);
      const rBas   = computeResultats(form, lBas,   amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, true,  amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      const rMoyen = computeResultats(form, lMoyen, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, true,  amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      const rHaut  = computeResultats(form, lHaut,  amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, true,  amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      setResultatsTriple({ bas: rBas, moyen: rMoyen, haut: rHaut });
      setResultats(rMoyen);
      setShowResults(true);
      onShowResults?.();
      setSelectedRegime(null);
      setSimulationValidated(false);
      scrollToResults.current = true;
    } else {
      const loyerMensuel = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
      const r = computeResultats(form, loyerMensuel, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, false, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      setResultats(r);
      if (loyerMensuel > 0) {
        setLoyerSlider(loyerMensuel);
        setSliderMax(Math.max(loyerMensuel * 2, 200));
      }
      setShowResults(true);
      onShowResults?.();
      setSelectedRegime(null);
      setSimulationValidated(false);
      scrollToResults.current = true;
    }
  };

  const handleAjuster = () => {
    if (selectedRegime === "reel" && amortMode === null) {
      scrollToAmort.current = true;
      setShowAmortRequired(true);
      setTimeout(() => setShowAmortRequired(false), 3000);
      return;
    }
    if (isSaisonnier) {
      const nuitee = parseFloat(prixNuitee) || 0;
      const lBas   = loyerSaisonnier(nuitee, parseFloat(tauxOccBas)   || 0);
      const lMoyen = loyerSaisonnier(nuitee, parseFloat(tauxOccMoyen) || 0);
      const lHaut  = loyerSaisonnier(nuitee, parseFloat(tauxOccHaut)  || 0);
      const rBas   = computeResultats(form, lBas,   amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, true,  amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      const rMoyen = computeResultats(form, lMoyen, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, true,  amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      const rHaut  = computeResultats(form, lHaut,  amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, true,  amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      setResultatsTriple({ bas: rBas, moyen: rMoyen, haut: rHaut });
      setResultats(rMoyen);
    } else {
      const loyerMensuel = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
      const r = computeResultats(form, loyerMensuel, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, false, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
      setResultats(r);
      if (loyerMensuel > 0) setSliderMax(Math.max(loyerMensuel * 2, 200));
    }
    setSimulationValidated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      ? { label: "Investissement correct", bg: "#2A9060", icon: "~" }
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
  const amortMobilierDisplay = amortDureeMobilier > 0 ? (parseFloat(form.mobilier) || 0) / amortDureeMobilier : 0;
  const amortTravauxDisplay = amortDureeTravaux > 0 ? (parseFloat(form.travaux) || 0) / amortDureeTravaux : 0;
  const amortNotaireDisplay = amortDureeNotaire > 0 ? (parseFloat(form.notaire) || 0) / amortDureeNotaire : 0;
  const amortTotalDisplay = amortBienDisplay + amortMobilierDisplay + amortTravauxDisplay + amortNotaireDisplay;

  const redirectToRapport = () => {
    const sessionId = `pro_${Date.now()}`;
    sessionStorage.setItem("lmnp_simulation_data", JSON.stringify({
      form,
      amortPct,
      amortMode: amortMode ?? "ensemble",
      amortDureeEnsemble,
      amortDureeMobilier,
      amortDureeTravaux,
      amortDureeNotaire,
      composants,
      isSaisonnier,
      prixNuitee,
      tauxOccBas,
      tauxOccMoyen,
      tauxOccHaut,
      resultatsTriple,
      selectedRegime,
      savedAt: Date.now(),
    }));
    window.location.href = `/rapport?session_id=${sessionId}`;
  };

  const cardStyle = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" };
  const sectionStyle = { background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" };

  return (
    <section id="simulateur" className={simulationValidated ? "pt-4 pb-16" : "py-16"} style={{ backgroundColor: "#F5F0E8" }}>
      <div className="max-w-6xl mx-auto px-4">

        {/* ─── FORM ─── */}
        {!simulationValidated && <div className="rounded-xl p-6 md:p-8 mb-6" style={sectionStyle}>

          {/* Grid 2 cols */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── LEFT : Bien & Financement ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between" style={{ minHeight: 38 }}>
                <p className={LABEL} style={{ opacity: 1, color: "#1A1612", marginBottom: 0 }}>Bien &amp; Financement</p>
                {/* Saisonnier button — mobile only, top-right of form */}
                <button
                  onClick={() => { const next = !isSaisonnier; setIsSaisonnier(next); setResultatsTriple(null); if (next) { updateField("loyer", ""); setLoyerSlider(0); } }}
                  className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: isSaisonnier ? "rgba(26,82,122,0.1)" : "#F5F0E8",
                    border: isSaisonnier ? "1.5px solid #26527A" : "0.5px solid rgba(26,22,18,0.18)",
                    color: isSaisonnier ? "#26527A" : "rgba(26,22,18,0.55)",
                  }}>
                  <span className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: isSaisonnier ? "#26527A" : "transparent", border: isSaisonnier ? "none" : "1.5px solid rgba(26,22,18,0.3)" }}>
                    {isSaisonnier && <span className="text-white text-[9px] leading-none font-bold">✓</span>}
                  </span>
                  Saisonnier
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={LABEL} style={{ minHeight: "2.5em" }}>Prix d&apos;achat (€)</label>
                  <input type="number" value={form.prix}
                    onChange={e => updateField("prix", e.target.value)}
                    onBlur={() => handleBlur("prix")}
                    placeholder="250 000" className={INPUT} style={INPUT_STYLE} />
                </div>
                <div className="flex flex-col">
                  <label className={LABEL} style={{ minHeight: "2.5em" }}>Travaux (€)</label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <span style={{ color: "#C95B2A", fontWeight: 700, fontSize: "1rem" }}>{form.duree} ans</span>
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
                      placeholder="3.5" className={INPUT} style={{ ...INPUT_STYLE, width: "80px" }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(26,22,18,0.45)" }}>%</span>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Assurance emprunteur</label>
                  <div className="flex items-center gap-1.5">
                    <input type="number" step="0.01" min="0" max="1" value={form.assuranceEmprunteur}
                      onChange={e => updateField("assuranceEmprunteur", e.target.value)}
                      onBlur={() => handleBlur("assuranceEmprunteur")}
                      placeholder="0.25" className={INPUT} style={{ ...INPUT_STYLE, width: "80px" }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(26,22,18,0.45)" }}>%</span>
                  </div>
                  {(() => {
                    const pct = parseFloat(form.assuranceEmprunteur) || 0;
                    const capital = resultats?.montantCredit ?? 0;
                    const annuel = capital * pct / 100;
                    return capital > 0 && pct > 0 ? (
                      <p className="text-sm font-semibold mt-1" style={{ color: "#C95B2A" }}>
                        = {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(annuel)}/an
                        <span className="text-[10px] font-normal ml-1" style={{ color: "rgba(26,22,18,0.4)" }}>· charge financière déductible</span>
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
              {/* Mobile separator */}
              <div className="lg:hidden" style={{ borderTop: "1.5px solid rgba(26,22,18,0.1)", marginTop: 8 }} />
              <div className="flex items-center justify-between">
                <p className={LABEL} style={{ opacity: 1, color: "#1A1612", marginBottom: 0 }}>Loyer</p>
                <button
                  onClick={() => { const next = !isSaisonnier; setIsSaisonnier(next); setResultatsTriple(null); if (next) { updateField("loyer", ""); setLoyerSlider(0); } }}
                  className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all"
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

              {/* Loyer mensuel ou Saisonnier */}
              {isSaisonnier ? (
                <div className="space-y-3 rounded-xl p-4" style={{ background: "rgba(38,82,122,0.05)", border: "1px solid rgba(38,82,122,0.2)" }}>
                  <div className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: "#26527A" }}>Location Saisonnière</div>
                  <div>
                    <label className={LABEL}>Prix moyen par nuitée</label>
                    <div className="relative">
                      <input type="number" value={prixNuitee}
                        onChange={e => setPrixNuitee(e.target.value)}
                        placeholder="Ex : 80" className={INPUT} style={{ ...INPUT_STYLE, paddingRight: "28px" }} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
                        style={{ color: "rgba(26,22,18,0.45)" }}>€</span>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Taux d&apos;occupation estimé</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Bas", val: tauxOccBas, set: setTauxOccBas, placeholder: "20" },
                        { label: "Moyen", val: tauxOccMoyen, set: setTauxOccMoyen, placeholder: "35" },
                        { label: "Haut", val: tauxOccHaut, set: setTauxOccHaut, placeholder: "45" },
                      ].map(({ label, val, set, placeholder }) => {
                        const taux = parseFloat(val) || parseFloat(placeholder) || 0;
                        const nuits = Math.round(taux / 100 * 365);
                        return (
                          <div key={label}>
                            <div className="text-xs font-medium text-center mb-1" style={{ color: "#1A1612" }}>{label}</div>
                            <div className="relative">
                              <input type="number" value={val} onChange={e => set(e.target.value)}
                                placeholder={placeholder} className={INPUT}
                                style={{ ...INPUT_STYLE, textAlign: "center", paddingRight: "22px" }} />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                                style={{ color: "rgba(26,22,18,0.45)" }}>%</span>
                            </div>
                            <div className="text-xs font-semibold text-center mt-1" style={{ color: "#C95B2A" }}>{nuits} nuits/an</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: "#1A1612", lineHeight: 1.5 }}>
                      Les calculs de rentabilité approfondis sont effectués avec l&apos;estimation <strong>Moyenne</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className={LABEL} style={{ minHeight: "2.5em" }}>Loyer HC / mois (€)</label>
                    <input type="number" value={form.loyer}
                      onChange={e => {
                        updateField("loyer", e.target.value);
                        setLoyerSlider(parseFloat(e.target.value) || 0);
                      }}
                      onBlur={() => handleBlur("loyer")}
                      placeholder="Ex : 1 100" className={INPUT} style={INPUT_STYLE} />
                    <p className="text-[10px] mt-1" style={{ color: "rgba(26,22,18,0.4)" }}>Hors charges locataire</p>
                  </div>
                  <div className="flex flex-col">
                    <label className={LABEL} style={{ minHeight: "2.5em" }}>Charges locataire / mois (€)</label>
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
                <label className={LABEL}>
                  Tranche marginale d&apos;imposition (TMI)
                  <span className="relative group inline-flex items-center justify-center ml-1.5 align-middle">
                    <span className="w-4 h-4 rounded-full border border-current text-[9px] font-bold inline-flex items-center justify-center cursor-default select-none" style={{ color: "rgba(26,22,18,0.45)", borderColor: "rgba(26,22,18,0.35)" }}>?</span>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block w-64 rounded-lg shadow-lg text-left"
                      style={{ background: "#1A1612", color: "#F5F0E8", padding: "10px 12px", fontSize: "11px", lineHeight: "1.5" }}>
                      <span className="block font-semibold mb-1.5" style={{ fontSize: "11.5px" }}>Taux Marginal d&apos;Imposition</span>
                      <span className="block mb-2" style={{ color: "rgba(245,240,232,0.75)" }}>Taux qui s&apos;applique à la tranche la plus élevée de vos revenus.</span>
                      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "10px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(245,240,232,0.2)" }}>
                            <th className="text-left pb-1" style={{ color: "rgba(245,240,232,0.55)", fontWeight: 500 }}>Tranche</th>
                            <th className="text-right pb-1" style={{ color: "rgba(245,240,232,0.55)", fontWeight: 500 }}>TMI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Jusqu'à 10 225 €", "0 %"],
                            ["10 226 € – 26 070 €", "11 %"],
                            ["26 071 € – 74 545 €", "30 %"],
                            ["74 546 € – 160 336 €", "41 %"],
                            ["Plus de 160 336 €", "45 %"],
                          ].map(([tranche, taux]) => (
                            <tr key={taux} style={{ borderBottom: "1px solid rgba(245,240,232,0.08)" }}>
                              <td className="py-0.5" style={{ color: "rgba(245,240,232,0.85)" }}>{tranche}</td>
                              <td className="text-right py-0.5 font-semibold">{taux}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #1A1612" }} />
                    </span>
                  </span>
                </label>
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
                // Pour saisonnier : utiliser le revenu moyen estimé pour l'affichage
                const loyerHC = isSaisonnier
                  ? loyerSaisonnier(parseFloat(prixNuitee) || 0, parseFloat(tauxOccMoyen) || 0)
                  : parseFloat(form.loyer) || 0;
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
                          <span className="ml-2 text-sm font-bold" style={{ color: "#C95B2A" }}>
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
                        {/* Popup avertissement loyer / nuitée */}
                        {showLoyerWarning && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,22,18,0.45)" }}
                            onClick={() => setShowLoyerWarning(false)}>
                            <div className="rounded-2xl p-6 max-w-xs w-full mx-4 text-center shadow-2xl" style={{ background: "#F5F0E8" }}
                              onClick={e => e.stopPropagation()}>
                              <p className="text-sm font-medium mb-1" style={{ color: "#1A1612" }}>
                                {isSaisonnier ? "Prix par nuitée non renseigné" : "Loyer non renseigné"}
                              </p>
                              <p className="text-xs mb-4" style={{ color: "rgba(26,22,18,0.6)" }}>
                                {isSaisonnier
                                  ? "Renseigne d'abord le prix par nuitée pour estimer le montant de la gestion locative."
                                  : "Renseigne d'abord le loyer HC mensuel pour calculer le montant de la gestion locative."}
                              </p>
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
                                onClick={() => { if (!loyerHC && !(isSaisonnier && parseFloat(prixNuitee) > 0)) setShowLoyerWarning(true); }}
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
        </div>}

        {/* ─── BOUTON SIMULER ─── */}
        {!simulationValidated && <div className="flex justify-end items-center gap-3 mb-10">
          {(() => {
            const remaining = Math.max(0, SIM_LIMIT - getSimDayCount());
            const blocked = isSimBlocked();
            return <>
              <span style={{ fontSize: 11, color: blocked ? "#B03A2A" : "rgba(26,22,18,0.45)" }}>
                {!isSubscribed && (blocked
                  ? "0 simulation restante aujourd'hui"
                  : remaining <= 3
                    ? `${remaining} simulation${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} aujourd'hui`
                    : "")}
              </span>
              <button onClick={handleSimuler}
                className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88]"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 8, letterSpacing: "0.02em" }}>
                Lancer la simulation →
              </button>
            </>;
          })()}
        </div>}

        {/* ─── RESULTS ─── */}
        {/* Ancre invisible : le scroll atterrit ici, 24px au-dessus du bandeau */}
        <div ref={resultsRef} style={{ scrollMarginTop: "72px" }} />
        <div style={{ height: 8 }} />
        <div>
          {showResults && (
            !resultats ? (
              <div className="rounded-xl p-12 text-center" style={cardStyle}>
                <p className="text-lg font-light" style={{ color: "rgba(26,22,18,0.45)" }}>
                  Renseignez le prix d&apos;achat et le loyer mensuel pour voir les résultats
                </p>
              </div>
            ) : (
              <>
              {simulationValidated ? (
              /* ─── PAGE FINALE ─── */
              <div className="space-y-5" ref={pdfButtonsRef}>
                {/* Bouton retour */}
                <div>
                  <button onClick={() => setSimulationValidated(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ background: "#EDE7DC", color: "#4E1F12", border: "1px solid rgba(78,31,18,0.2)" }}>
                    ← Retour à la simulation
                  </button>
                </div>

                {/* Récap données client */}
                {(() => {
                  const p    = parseFloat(form.prix)             || 0;
                  const ap   = parseFloat(form.apport)           || 0;
                  const tr   = parseFloat(form.travaux)          || 0;
                  const mob  = parseFloat(form.mobilier)         || 0;
                  const not  = parseFloat(form.notaire)          || 0;
                  const loyer       = parseFloat(form.loyer)     || loyerEffectif || 0;
                  const chargesLoc  = parseFloat(form.chargesLoyer) || 0;
                  const taux        = parseFloat(form.taux)      || 0;
                  const duree       = form.duree                  || 20;
                  const assurEmp    = parseFloat(form.assuranceEmprunteur) || 0;
                  const taxeFonc    = parseFloat(form.taxeFonciere)        || 0;
                  const copro       = parseFloat(form.chargesCopro)        || 0;
                  const pno         = parseFloat(form.assurancePNO)        || 0;
                  const entretien   = parseFloat(form.entretienCourant)    || 0;
                  const gestion     = parseFloat(form.gestionLocativePct)  || 0;
                  const compta      = parseFloat(form.comptabilite)        || 0;
                  const nuitee      = parseFloat(prixNuitee)               || 0;
                  const montantCredit = Math.max(0, p - ap);
                  const tmi         = form.tmi                    || 0;

                  // Formattage avec points (1.000.000 €)
                  const fDot = (n: number) => {
                    const rounded = Math.round(n);
                    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
                  };

                  type ColDef = { bg: string; border: string; titleColor: string };
                  const COLS: Record<string, ColDef> = {
                    bien:        { bg: "#E9F4EC", border: "#C4DFC9", titleColor: "#1E5C2E" },
                    financement: { bg: "#E4EEF8", border: "#BACED9", titleColor: "#1A3A6B" },
                    charges:     { bg: "#FDF0E8", border: "#E8CEBC", titleColor: "#7A3010" },
                  };
                  const colStyle = (k: string) => ({
                    background: COLS[k].bg,
                    border: `1px solid ${COLS[k].border}`,
                    borderRadius: 12,
                    padding: "16px 18px",
                    flex: 1,
                    minWidth: 220,
                  });
                  const titleStyle = (k: string) => ({
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLS[k].titleColor,
                    textAlign: "center" as const,
                    marginBottom: 14,
                    display: "block",
                    letterSpacing: "-0.01em",
                  });
                  type Row = { label: string; value: string; sub?: string; color?: string };
                  const Row = ({ label, value, sub, color }: Row) => (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
                      <span style={{ fontSize: 11, color: "rgba(26,22,18,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: color ?? "#1A1612", textAlign: "right" as const }}>
                        {value}{sub && <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(26,22,18,0.45)", marginLeft: 4 }}>{sub}</span>}
                      </span>
                    </div>
                  );

                  return (
                    <div style={{ marginTop: 20, marginBottom: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "rgba(26,22,18,0.35)", marginBottom: 12 }}>
                        Récapitulatif de votre simulation
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>

                        {/* Colonne 1 — Le bien */}
                        <div style={colStyle("bien")}>
                          <span style={titleStyle("bien")}>🏠 Le bien</span>
                          <Row label="Prix d'achat"     value={fDot(p)} />
                          <Row label="Apport"           value={fDot(ap)} />
                          <Row label="Crédit"           value={fDot(montantCredit)} />
                          {tr  > 0 && <Row label="Travaux"          value={fDot(tr)} />}
                          {mob > 0 && <Row label="Mobilier"         value={fDot(mob)} />}
                          <Row label="Frais de notaire" value={fDot(not)} />
                          {!isSaisonnier ? (
                            <>
                              <Row label="Loyer mensuel" value={fDot(loyer)} sub="HC" />
                              {chargesLoc > 0 && <Row label="Charges locataire" value={`+${fDot(chargesLoc)}/mois`} />}
                            </>
                          ) : (
                            <>
                              <Row label="Prix par nuitée" value={fDot(nuitee)} />
                              <Row label="Taux d'occupation" value={`${tauxOccBas} / ${tauxOccMoyen} / ${tauxOccHaut} %`} />
                            </>
                          )}
                        </div>

                        {/* Colonne 2 — Financement */}
                        <div style={colStyle("financement")}>
                          <span style={titleStyle("financement")}>🏦 Financement</span>
                          <Row label="Taux d'intérêt"       value={`${taux} %`} sub={`sur ${duree} ans`} />
                          <Row label="Assurance emprunteur"  value={`${assurEmp} %`} sub="du capital" />
                          <Row label="Montant emprunté"      value={fDot(montantCredit)} />
                          {resultats && (
                            <>
                              <Row label="Mensualité crédit"  value={`${fDot(resultats.creditAnnuel / 12)}/mois`} />
                              <Row label="Coût total crédit"   value={fDot(resultats.creditAnnuel * duree)} />
                            </>
                          )}
                          <Row label="Tranche marginale d'imposition" value={`${tmi} %`} />
                        </div>

                        {/* Colonne 3 — Charges */}
                        <div style={colStyle("charges")}>
                          <span style={titleStyle("charges")}>📋 Charges annuelles</span>
                          <Row label="Taxe foncière"        value={fDot(taxeFonc)} />
                          <Row label="Charges copropriété"  value={fDot(copro)} />
                          <Row label="Assurance PNO"        value={`${pno} %`} sub="du prix" />
                          {gestion   > 0 && <Row label="Gestion locative"  value={`${gestion} %`} sub="des loyers" />}
                          {entretien > 0 && <Row label="Entretien courant"  value={fDot(entretien)} sub="/an" />}
                          {compta    > 0 && <Row label="Comptabilité"       value={fDot(compta)} sub="/an" />}
                          {resultats && <Row label="Total charges" value={fDot(resultats.chargesAnnuelles)} sub="/an" color={COLS.charges.titleColor} />}
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* Verdict */}
                {verdict && (
                  <div ref={verdictRef} className="rounded-xl p-4 flex items-center gap-3" style={{ scrollMarginTop: "80px", background: verdict.bg, color: "#F5F0E8" }}>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Rendement</div>
                    <div className="mt-0.5"><span className="text-lg font-bold" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>{formatPct(resultats.rendementBrut)}</span><span className="text-[12px] font-medium ml-1" style={{ color: "rgba(26,22,18,0.45)" }}>Brut</span></div>
                    <div className="mt-1"><span className="text-lg font-bold" style={{ color: "#C95B2A", letterSpacing: "-0.02em" }}>{formatPct(selectedRegime === "micro" ? resultats.rendementNetBIC : resultats.rendementNetReel)}</span><span className="text-[12px] font-medium ml-1" style={{ color: "rgba(26,22,18,0.45)" }}>Net</span></div>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Revenus annuels</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>{formatEuro(resultats.loyerAnnuel)}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>loyers encaissés HC</div>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Emprunt annuel</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#B03A2A", letterSpacing: "-0.02em" }}>{formatEuro(resultats.creditAnnuel + resultats.assuranceEmprunteurAnnuel)}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.50)" }}>soit <span className="font-semibold" style={{ color: "#B03A2A" }}>{formatEuro((resultats.creditAnnuel + resultats.assuranceEmprunteurAnnuel) / 12)}</span>/mois</div>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Charges annuelles</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#B03A2A", letterSpacing: "-0.02em" }}>{formatEuro(resultats.chargesDeductibles)}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.50)" }}>dont <span className="font-semibold" style={{ color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span> d&apos;intérêts d&apos;emprunt</div>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Impôt estimé /an</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: displayImpot > 0 ? "#B03A2A" : "#1A7A52", letterSpacing: "-0.02em" }}>{formatEuro(displayImpot)}</div>
                    <div className="text-[12px] mt-0" style={{ color: "rgba(26,22,18,0.40)" }}>TMI {form.tmi}% + PS 18,6%</div>
                    <div className="text-[12px] mt-1" style={{ color: "rgba(26,22,18,0.50)" }}>Soit <span className="font-semibold" style={{ color: displayImpot > 0 ? "#B03A2A" : "#1A7A52" }}>{formatEuro(displayImpotMensuel)}</span>/mois</div>
                  </div>
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Cash-flow <strong>Mensuel</strong></div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: displayCashflow >= 0 ? "#1A7A52" : "#B03A2A", letterSpacing: "-0.02em" }}>{formatEuro(displayCashflow)}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>{selectedRegime === "micro" ? "Au Micro-BIC" : "Au Régime réel"}</div>
                  </div>
                </div>

                {/* Régime fiscal + Amortissement */}
                {(() => {
                  const FRow = ({ label, val, color, bold, labelBold, bg, sep, indent, tight }: { label: string; val: string; color?: string; bold?: boolean; labelBold?: boolean; bg?: string; sep?: boolean; indent?: boolean; tight?: boolean }) => (
                    <div className={`flex justify-between items-baseline ${tight ? "py-1.5" : "py-2.5"}${indent ? " pl-4" : ""}${sep ? " mt-0.5" : ""}`}
                      style={{ borderTop: sep ? "1px solid rgba(26,22,18,0.09)" : undefined, background: bg, borderRadius: bg ? 5 : undefined, marginLeft: bg ? -8 : undefined, marginRight: bg ? -8 : undefined, paddingLeft: bg ? 8 : undefined, paddingRight: bg ? 8 : undefined }}>
                      <span style={{ color: indent ? "rgba(26,22,18,0.6)" : "rgba(26,22,18,0.78)", fontSize: indent ? 12 : 13, fontWeight: labelBold ? 700 : 400 }}>{label}</span>
                      <span className="whitespace-nowrap" style={{ fontSize: 13, fontWeight: bold ? 700 : 400, color: color ?? "#1A1612" }}>{val}</span>
                    </div>
                  );
                  const prixVal2 = parseFloat(form.prix) || 0;
                  const valAmort2 = prixVal2 * amortPct / 100;
                  const C2 = "#2A7080";

                  const AmortBlock = () => amortMode !== null ? (
                    <div className="rounded-xl overflow-hidden mt-4"
                      style={{ border: `2px solid ${C2}`, boxShadow: "0 0 0 3px rgba(42,112,128,0.1)" }}>
                      <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: C2 }}>
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid #F5F0E8" }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />
                        </div>
                        <span className="font-bold text-[14px] flex-1" style={{ color: "#F5F0E8" }}>
                          {amortMode === "ensemble" ? "Amortissement Global Simplifié" : "Amortissement par Composant"}
                        </span>
                        <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "rgba(245,240,232,0.2)", color: "#F5F0E8" }}>✓ CHOISI</span>
                      </div>
                      {amortMode === "ensemble" ? (
                        <div className="px-5 py-4 flex items-center gap-6" style={{ background: "#FDFAF6" }}>
                          <div><div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: C2 }}>Valeur amortissable</div><div className="text-xl font-bold" style={{ color: C2 }}>{formatEuro(valAmort2)}</div></div>
                          <div className="w-px self-stretch" style={{ background: "rgba(42,112,128,0.2)" }} />
                          <div><div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: C2 }}>Amortissement / an</div><div className="text-xl font-bold" style={{ color: C2 }}>{formatEuro(amortDureeEnsemble > 0 ? valAmort2 / amortDureeEnsemble : 0)}</div></div>
                          <div className="w-px self-stretch" style={{ background: "rgba(42,112,128,0.2)" }} />
                          <div><div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: "rgba(42,112,128,0.6)" }}>Sur</div><div className="text-xl font-bold" style={{ color: "#1A1612" }}>{amortDureeEnsemble} ans</div></div>
                        </div>
                      ) : (
                        <div style={{ background: "#FDFAF6" }}>
                          <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(42,112,128,0.08)", borderBottom: "1px solid rgba(42,112,128,0.12)" }}>
                            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(42,112,128,0.7)", width: 140 }}>Composant</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(42,112,128,0.7)", flex: 1 }}>Quote-part</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(42,112,128,0.7)", width: 60 }}>Durée</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: C2, width: 75 }}>Amort/an</span>
                          </div>
                          {composants.map((c, i) => {
                            const val = valAmort2 * c.pct / 100;
                            return (
                              <div key={c.label} className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "0.5px solid rgba(26,22,18,0.06)", background: i % 2 === 0 ? "#FDFAF6" : "#F8F4EE" }}>
                                <span style={{ color: "#1A1612", fontSize: 13, fontWeight: 600, width: 140 }}>{c.label}</span>
                                <span style={{ color: C2, fontSize: 13, fontWeight: 700, flex: 1 }}>{c.pct}% <span style={{ color: "rgba(26,22,18,0.4)", fontWeight: 400, fontSize: 12 }}>soit {formatEuro(val)}</span></span>
                                <span style={{ color: "rgba(26,22,18,0.6)", fontSize: 12, width: 60 }}>{c.duree} ans</span>
                                <span style={{ color: C2, fontSize: 13, fontWeight: 700, width: 75, textAlign: "right" }}>{formatEuro(c.duree > 0 ? val / c.duree : 0)}</span>
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1612", width: 140 }}>Total</span>
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: composants.reduce((s, c) => s + c.pct, 0) === 100 ? "#1A7A52" : "#B03A2A" }}>{composants.reduce((s, c) => s + c.pct, 0)}%</span>
                            <span style={{ width: 60 }} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: C2, width: 75, textAlign: "right" }}>{formatEuro(composants.reduce((s, c) => s + (valAmort2 * c.pct / 100) / (c.duree || 1), 0))}/an</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null;

                  /* ── SAISONNIER : 3 estimations pour le régime choisi ── */
                  if (isSaisonnier && resultatsTriple) {
                    const isReel = selectedRegime === "reel";
                    const scenarios = [
                      { label: "Basse", r: resultatsTriple.bas, taux: parseFloat(tauxOccBas)||0, color: "#1A4D8F", accent: "rgba(26,77,143,0.07)", border: "rgba(26,77,143,0.22)" },
                      { label: "Moyenne", r: resultatsTriple.moyen, taux: parseFloat(tauxOccMoyen)||0, color: "#C95B2A", accent: "rgba(201,91,42,0.08)", border: "rgba(201,91,42,0.28)" },
                      { label: "Haute", r: resultatsTriple.haut, taux: parseFloat(tauxOccHaut)||0, color: "#1A7A52", accent: "rgba(26,122,82,0.08)", border: "rgba(26,122,82,0.22)" },
                    ];
                    const headerBg = isReel ? "#C95B2A" : "#1A1612";
                    const headerLabel = isReel ? "Régime réel simplifié" : "Régime Micro-BIC";
                    const headerBadge = isReel ? "RECOMMANDÉ" : "ABATT. 30%";
                    return (
                      <div className="space-y-4">
                        {/* Header régime */}
                        <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ background: headerBg }}>
                          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid #F5F0E8" }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />
                          </div>
                          <span className="font-bold text-[15px]" style={{ color: "#F5F0E8" }}>{headerLabel}</span>
                          <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "rgba(245,240,232,0.2)", color: "#F5F0E8" }}>✓ {headerBadge}</span>
                        </div>

                        {/* 3 colonnes côte à côte */}
                        <div className="grid grid-cols-3 gap-3">
                          {scenarios.map(sc => {
                            const r = sc.r;
                            const loyer = loyerSaisonnier(parseFloat(prixNuitee)||0, sc.taux);
                            const nuits = Math.round(sc.taux / 100 * 365);
                            const cf = r ? (isReel ? r.cashflowReelMensuel : r.cashflowBICMensuel) : 0;
                            return (
                              <div key={sc.label} className="rounded-xl overflow-hidden flex flex-col" style={{ border: `1.5px solid ${sc.border}` }}>
                                {/* En-tête estimation */}
                                <div className="px-4 py-3 text-center" style={{ background: sc.accent, borderBottom: `1px solid ${sc.border}` }}>
                                  <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: sc.color }}>Estimation {sc.label}</div>
                                  <div className="text-xl font-bold mt-1" style={{ color: sc.color, letterSpacing: "-0.02em" }}>{formatEuro(loyer)}/mois</div>
                                  <div className="text-[11px] mt-1 font-semibold" style={{ color: "#1A1612" }}>{sc.taux}% occupation</div>
                                  <div className="text-[11px] font-semibold" style={{ color: "#C95B2A" }}>{nuits} nuits/an</div>
                                  <div className="text-[11px] mt-1 font-bold" style={{ color: sc.color }}>{formatEuro(loyer * 12)}/an</div>
                                </div>
                                {/* Tableau régime */}
                                <div className="px-4 py-2 flex-1" style={{ background: "#FDFAF6" }}>
                                  {r ? (isReel ? (
                                    <>
                                      <FRow tight label="Revenus annuels" val={formatEuro(r.loyerAnnuel)} bold />
                                      <FRow tight label="Emprunt" val={`−${formatEuro(r.creditAnnuel)}`} color="#B03A2A" />
                                      <FRow tight label="Charges déduct." val={`−${formatEuro(r.chargesDeductibles)}`} color="#B03A2A" />
                                      <FRow tight label="Résultat avant amort." val={formatEuro(r.resultatAvantAmort)} bold sep color={r.resultatAvantAmort >= 0 ? "#1A7A52" : "#B03A2A"} />
                                      <FRow tight label="Amortissements" val={`−${formatEuro(r.amortTotal)}`} color="#8B1A1A" bold labelBold bg="rgba(139,26,26,0.05)" />
                                      <FRow tight label="Base imposable" val={formatEuro(r.baseImposableReel)} bold sep color={r.baseImposableReel === 0 ? "#1A7A52" : "#1A1612"} />
                                      <FRow tight label="Impôt estimé" val={formatEuro(r.impotReel)} color="#B03A2A" />
                                      {(() => { const cfColor = cf >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                        <div className="mt-0.5" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                          <div className="flex justify-between items-baseline py-1.5">
                                            <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13 }}>Cash-flow <strong>Mensuel</strong></span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cf)}</span>
                                          </div>
                                          <div className="-mt-0.5 pb-1.5">
                                            <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel : </span><span style={{ fontSize: 12, color: cfColor }}>{formatEuro(cf * 12)}</span>
                                          </div>
                                        </div>
                                      ); })()}
                                    </>
                                  ) : (
                                    <>
                                      <FRow tight label="Revenus annuels" val={formatEuro(r.loyerAnnuel)} bold />
                                      <FRow tight label="Emprunt" val={`−${formatEuro(r.creditAnnuel)}`} color="#B03A2A" />
                                      <FRow tight label="Ensemble des charges" val={`−${formatEuro(r.chargesAnnuelles + r.assuranceEmprunteurAnnuel)}`} color="#B03A2A" />
                                      <div className="mt-0.5 pt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                        <div className="flex justify-between items-baseline py-1.5">
                                          <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13, fontWeight: 600 }}>Base imposable</span>
                                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1612" }}>{formatEuro(r.baseBIC)}</span>
                                        </div>
                                        <div className="text-[11px] mb-1 px-2 py-1 rounded" style={{ color: "rgba(26,22,18,0.55)", background: "rgba(26,22,18,0.04)", lineHeight: 1.4 }}>
                                          Abattement forfaitaire 30% appliqué sur {formatEuro(r.recettesAnnuelles)} de recettes
                                        </div>
                                      </div>
                                      <FRow tight label="Impôt estimé" val={formatEuro(r.impotBIC)} color="#B03A2A" />
                                      {(() => { const cfColor = cf >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                        <div className="mt-0.5" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                          <div className="flex justify-between items-baseline py-1.5">
                                            <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13 }}>Cash-flow <strong>Mensuel</strong></span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cf)}</span>
                                          </div>
                                          <div className="-mt-0.5 pb-1.5">
                                            <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel : </span><span style={{ fontSize: 12, color: cfColor }}>{formatEuro(cf * 12)}</span>
                                          </div>
                                        </div>
                                      ); })()}
                                    </>
                                  )) : <div className="text-xs py-4 text-center" style={{ color: "rgba(26,22,18,0.4)" }}>–</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Amortissement en dessous si réel */}
                        {isReel && <AmortBlock />}
                      </div>
                    );
                  }

                  /* ── NON-SAISONNIER : tableau unique + amortissement côte à côte ── */
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {/* Tableau régime fiscal choisi */}
                      <div className="rounded-xl overflow-hidden"
                        style={{ border: selectedRegime === "reel" ? "2.5px solid #C95B2A" : "2.5px solid #1A1612", boxShadow: selectedRegime === "reel" ? "0 0 0 3px rgba(201,91,42,0.12)" : "0 0 0 3px rgba(26,22,18,0.07)" }}>
                        <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: selectedRegime === "reel" ? "#C95B2A" : "#1A1612" }}>
                          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid #F5F0E8" }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />
                          </div>
                          <span className="font-bold text-[15px]" style={{ color: "#F5F0E8" }}>{selectedRegime === "reel" ? "Régime réel simplifié" : "Micro-BIC"}</span>
                          <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "rgba(245,240,232,0.2)", color: "#F5F0E8" }}>✓ SÉLECTIONNÉ</span>
                        </div>
                        <div className="px-5" style={{ background: "#FDFAF6" }}>
                          {selectedRegime === "reel" ? (
                            <>
                              <FRow label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                              <FRow label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                              <div className="pl-3 -mt-1 pb-2"><span style={{ fontSize: 12, color: "rgba(26,22,18,0.6)" }}>Dont frais d&apos;emprunt </span><span style={{ fontSize: 13, fontWeight: 600, color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span></div>
                              <FRow label="Charges déductibles" val={`−${formatEuro(resultats.chargesDeductibles)}`} color="#B03A2A" />
                              <FRow label="Résultat avant amortissement" val={formatEuro(resultats.resultatAvantAmort)} bold color={resultats.resultatAvantAmort >= 0 ? "#1A7A52" : "#B03A2A"} sep />
                              <FRow label="Amortissements" val={`−${formatEuro(resultats.amortTotal)}`} color="#8B1A1A" bold labelBold bg="rgba(139,26,26,0.05)" />
                              <FRow label="Base imposable" val={formatEuro(resultats.baseImposableReel)} bold sep />
                              <FRow label="Impôt estimé" val={formatEuro(resultats.impotReel)} color="#B03A2A" />
                              <FRow label="Amortissement à reporter N+1" val={formatEuro(resultats.amortAReporter)} color="#B08A2A" />
                              {(() => { const cfVal = resultats.cashflowReelMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                <div className="mt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                  <div className="flex justify-between items-baseline py-2.5">
                                    <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13 }}>Cash-flow <strong>Mensuel</strong></span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                  </div>
                                  <div className="flex justify-between -mt-1 pb-2">
                                    <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel :</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                  </div>
                                </div>
                              ); })()}
                            </>
                          ) : (
                            <>
                              <FRow label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                              <FRow label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                              <div className="pl-3 -mt-1 pb-2"><span style={{ fontSize: 12, color: "rgba(26,22,18,0.6)" }}>Dont frais d&apos;emprunt </span><span style={{ fontSize: 13, fontWeight: 600, color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span></div>
                              <FRow label="Ensemble des charges" val={`−${formatEuro(resultats.chargesAnnuelles + resultats.assuranceEmprunteurAnnuel)}`} color="#B03A2A" />
                              <FRow label="Base imposable (50% recettes)" val={formatEuro(resultats.baseBIC)} bold sep />
                              <FRow label="Impôt estimé" val={formatEuro(resultats.impotBIC)} color="#B03A2A" />
                              {(() => { const cfVal = resultats.cashflowBICMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                <div className="mt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                  <div className="flex justify-between items-baseline py-2.5">
                                    <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13 }}>Cash-flow <strong>Mensuel</strong></span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                  </div>
                                  <div className="flex justify-between -mt-1 pb-2">
                                    <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel :</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                  </div>
                                </div>
                              ); })()}
                            </>
                          )}
                        </div>
                      </div>
                      {/* Tableau amortissement — réel uniquement */}
                      {selectedRegime === "reel" && <AmortBlock />}
                    </div>
                  );
                })()}

                {/* Amortissements totaux — réel uniquement */}
                {selectedRegime === "reel" && amortMode !== null && (
                  <div>
                    <div className="text-sm font-semibold mb-3" style={{ color: "rgba(26,22,18,0.65)" }}>Amortissements totaux :</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Bien", val: amortBienDisplay, sub: amortMode === "ensemble" ? `${amortPct}% du prix · sur ${amortDureeEnsemble} ans` : `${amortPct}% · composants`, color: "#2A7080" },
                        { label: "Mobilier", val: amortMobilierDisplay, sub: `sur ${amortDureeMobilier} ans`, color: "#2A7080" },
                        { label: "Travaux", val: amortTravauxDisplay, sub: `sur ${amortDureeTravaux} ans`, color: "#2A7080" },
                        { label: "Notaire", val: amortNotaireDisplay, sub: `sur ${amortDureeNotaire} ans`, color: "#2A7080" },
                        { label: "Total", val: amortTotalDisplay, sub: "Déductible première année", accent: true, color: "#F5F0E8" },
                      ].map(({ label, val, sub, accent, color }) => (
                        <div key={label} className="rounded-lg p-3.5 text-center"
                          style={{
                            background: accent ? "#C95B2A" : "#fff",
                            border: accent ? "none" : "1px solid rgba(42,112,128,0.2)",
                            boxShadow: accent ? "0 2px 8px rgba(201,91,42,0.25)" : "0 1px 3px rgba(26,22,18,0.06)",
                          }}>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: accent ? "rgba(245,240,232,0.65)" : "rgba(42,112,128,0.6)" }}>{label}</div>
                          <div className="font-bold text-[15px]" style={{ color }}>{formatEuro(val)}{accent ? "" : "/an"}</div>
                          <div className="text-[12px] mt-1" style={{ color: accent ? "rgba(245,240,232,0.6)" : "rgba(26,22,18,0.4)" }}>{sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boutons PDF + Sauvegarder */}
                <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
                  <button onClick={() => {
                    const plan = getPlan();
                    if (plan === "pro") { redirectToRapport(); return; }
                    if (plan === "starter") { setPdfWeekCount(getPdfWeekCount()); setShowPDFStarter(true); return; }
                    setShowPayPopup(true);
                  }}
                    className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                    style={{ background: "#1A4A35", color: "#F5F0E8", letterSpacing: "0.02em" }}>
                    Générer compte rendu PDF
                  </button>
                  <button onClick={() => setShowSauvegarder(true)}
                    className="flex items-center gap-2 px-6 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                    style={{ background: "#EDE7DC", color: "#4E1F12", border: "1px solid rgba(78,31,18,0.2)" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Sauvegarder
                  </button>
                </div>
              </div>
              ) : (
              /* ─── SIMULATION ─── */
              <div className="space-y-5">
                {/* Verdict */}
                {verdict && (
                  <div ref={verdictRef} className="rounded-xl p-4 flex items-center gap-3"
                    style={{ scrollMarginTop: "80px", background: verdict.bg, color: "#F5F0E8" }}>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Rendement brut + net */}
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Rendement</div>
                    <div className="mt-0.5">
                      <span className="text-lg font-bold" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>{formatPct(resultats.rendementBrut)}</span>
                      <span className="text-[12px] font-medium ml-1" style={{ color: "rgba(26,22,18,0.45)" }}>Brut</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-lg font-bold" style={{ color: "#C95B2A", letterSpacing: "-0.02em" }}>{formatPct(selectedRegime === "micro" ? resultats.rendementNetBIC : resultats.rendementNetReel)}</span>
                      <span className="text-[12px] font-medium ml-1" style={{ color: "rgba(26,22,18,0.45)" }}>Net</span>
                    </div>
                  </div>

                  {/* Revenus annuels */}
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Revenus annuels</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>
                      {formatEuro(resultats.loyerAnnuel)}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>loyers encaissés HC</div>
                  </div>

                  {/* Emprunt annuel */}
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Emprunt annuel</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#B03A2A", letterSpacing: "-0.02em" }}>
                      {formatEuro(resultats.creditAnnuel + resultats.assuranceEmprunteurAnnuel)}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.50)" }}>
                      soit <span className="font-semibold" style={{ color: "#B03A2A" }}>{formatEuro((resultats.creditAnnuel + resultats.assuranceEmprunteurAnnuel) / 12)}</span>/mois
                    </div>
                  </div>

                  {/* Charges annuelles */}
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Charges annuelles</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#B03A2A", letterSpacing: "-0.02em" }}>
                      {formatEuro(resultats.chargesDeductibles)}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.50)" }}>
                      dont <span className="font-semibold" style={{ color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span> d&apos;intérêts d&apos;emprunt
                    </div>
                  </div>

                  {/* Impôt annuel + mensuel */}
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Impôt estimé /an</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color: "#1A1612", letterSpacing: "-0.02em" }}>
                      {formatEuro(displayImpot)}
                    </div>
                    <div className="text-[12px] mt-0" style={{ color: "rgba(26,22,18,0.40)" }}>TMI {form.tmi}% + PS 18,6%</div>
                    <div className="text-[12px] mt-1" style={{ color: "rgba(26,22,18,0.50)" }}>
                      Soit <span className="font-semibold" style={{ color: "#1A1612" }}>{formatEuro(displayImpotMensuel)}</span>/mois
                    </div>
                  </div>

                  {/* Cash-flow mensuel */}
                  <div className="rounded-lg px-3 py-2.5" style={cardStyle}>
                    <div className={LABEL}>Cash-flow <strong>Mensuel</strong></div>
                    <div className="text-lg font-bold mt-0.5" style={{
                      color: displayCashflow >= 0 ? "#1A7A52" : "#B03A2A",
                      letterSpacing: "-0.02em",
                    }}>
                      {formatEuro(displayCashflow)}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,22,18,0.40)" }}>
                      {selectedRegime === "micro" ? "Au Micro-BIC" : "Au Régime réel"}
                    </div>
                  </div>
                </div>

                {/* Loyer slider — location classique uniquement */}
                {!isSaisonnier ? (
                  <div className="rounded-xl px-4 py-2.5" style={cardStyle}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium" style={{ color: "rgba(26,22,18,0.55)" }}>Ajuster le loyer</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={loyerEffectif || ""}
                          onChange={e => {
                            const v = parseFloat(e.target.value) || 0;
                            setLoyerSlider(v);
                            updateField("loyer", e.target.value);
                            if (showResults) {
                              const r = computeResultats(form, v, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, false, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
                              setResultats(r);
                            }
                          }}
                          className="w-20 text-right text-base font-semibold rounded-md px-2 py-0.5 focus:outline-none [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                          style={{ color: "#F5F0E8", background: "#C95B2A", border: "none" }}
                        />
                        <span className="text-sm font-medium" style={{ color: "#C95B2A" }}>/mois</span>
                      </div>
                    </div>
                    <input type="range"
                      min={sliderMin} max={sliderMax} step={1}
                      value={parseFloat(form.loyer) || loyerSlider || 500}
                      onChange={e => {
                        const v = parseInt(e.target.value, 10);
                        setLoyerSlider(v);
                        updateField("loyer", v.toString());
                        if (showResults) {
                          const r = computeResultats(form, v, amortPct, amortMode ?? "ensemble", amortDureeEnsemble, composants, false, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire);
                          setResultats(r);
                        }
                      }}
                      className="w-full" />
                  </div>
                ) : null}

                {/* Comparaison régimes + choix */}
                <div className="rounded-xl p-5" style={cardStyle}>

                  {isSaisonnier && resultatsTriple ? (() => {
                    const scenarios = [
                      { label: "Basse", r: resultatsTriple.bas, taux: parseFloat(tauxOccBas)||0, color: "#1A4D8F", accent: "rgba(26,77,143,0.07)", border: "rgba(26,77,143,0.22)" },
                      { label: "Moyenne", r: resultatsTriple.moyen, taux: parseFloat(tauxOccMoyen)||0, color: "#C95B2A", accent: "rgba(201,91,42,0.08)", border: "rgba(201,91,42,0.28)" },
                      { label: "Haute", r: resultatsTriple.haut, taux: parseFloat(tauxOccHaut)||0, color: "#1A7A52", accent: "rgba(26,122,82,0.08)", border: "rgba(26,122,82,0.22)" },
                    ];
                    const TRow = ({ label, val, color, bold, labelBold, bg, sep }: { label: string; val: string; color?: string; bold?: boolean; labelBold?: boolean; bg?: string; sep?: boolean }) => (
                      <div className="flex justify-between" style={{ paddingTop: sep ? 6 : 3, marginTop: sep ? 4 : 0, borderTop: sep ? "0.5px solid rgba(26,22,18,0.1)" : "none", background: bg, borderRadius: bg ? 4 : undefined, paddingLeft: bg ? 4 : undefined, paddingRight: bg ? 4 : undefined }}>
                        <span style={{ color: labelBold ? (color ?? "rgba(26,22,18,0.7)") : "rgba(26,22,18,0.7)", fontWeight: labelBold ? 700 : 400, fontSize: 12.5 }}>{label}</span>
                        <span style={{ color: color ?? "#1A1612", fontWeight: bold ? 700 : 400, fontSize: 12.5 }}>{val}</span>
                      </div>
                    );
                    return (
                      <div className="space-y-3">
                        {/* Title + clickable regime headers */}
                        <div className="text-center text-sm font-semibold mb-1" style={{ color: "#1A1612" }}>Choisissez votre régime fiscal</div>
                        <div className="grid gap-2" style={{ gridTemplateColumns: "0.6fr 1.5fr 1.5fr" }}>
                          <div />
                          <button type="button" onClick={() => { setSelectedRegime("reel"); scrollToAmort.current = true; }}
                            className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] py-2 px-3 rounded-lg transition-all"
                            style={{ background: selectedRegime === "reel" ? "#C95B2A" : "rgba(201,91,42,0.08)", color: selectedRegime === "reel" ? "#F5F0E8" : "#4E1F12", border: selectedRegime === "reel" ? "none" : "1.5px solid rgba(201,91,42,0.25)", cursor: "pointer" }}>
                            <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ border: `2px solid ${selectedRegime === "reel" ? "#F5F0E8" : "#C95B2A"}` }}>
                              {selectedRegime === "reel" && <span className="w-2 h-2 rounded-full" style={{ background: "#F5F0E8", display: "block" }} />}
                            </span>
                            Régime Réel&nbsp;<span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: selectedRegime === "reel" ? "rgba(245,240,232,0.25)" : "#C95B2A", color: "#F5F0E8" }}>{selectedRegime === "reel" ? "✓ Sélect." : "Recommandé"}</span>
                          </button>
                          <button type="button" onClick={() => { setSelectedRegime("micro"); setSimulationValidated(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] py-2 px-3 rounded-lg transition-all"
                            style={{ background: selectedRegime === "micro" ? "#1A1612" : "rgba(26,22,18,0.08)", color: selectedRegime === "micro" ? "#F5F0E8" : "#1A1612", border: selectedRegime === "micro" ? "none" : "1.5px solid rgba(26,22,18,0.15)", cursor: "pointer" }}>
                            <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ border: `2px solid ${selectedRegime === "micro" ? "#F5F0E8" : "rgba(26,22,18,0.4)"}` }}>
                              {selectedRegime === "micro" && <span className="w-2 h-2 rounded-full" style={{ background: "#F5F0E8", display: "block" }} />}
                            </span>
                            Micro-BIC&nbsp;<span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: selectedRegime === "micro" ? "rgba(245,240,232,0.2)" : "rgba(26,22,18,0.15)", color: selectedRegime === "micro" ? "#F5F0E8" : "#1A1612" }}>{selectedRegime === "micro" ? "✓ Sélect." : "Abatt. 30%"}</span>
                          </button>
                        </div>

                        {/* One row per scenario */}
                        {scenarios.map(sc => {
                          const r = sc.r;
                          const loyer = loyerSaisonnier(parseFloat(prixNuitee)||0, sc.taux);
                          const nuits = Math.round(sc.taux / 100 * 365);
                          return (
                            <div key={sc.label} className="grid gap-0 rounded-xl overflow-hidden" style={{ gridTemplateColumns: "0.6fr 1.5fr 1.5fr", border: `1.5px solid ${sc.border}` }}>
                              {/* Revenue */}
                              <div className="p-3 flex flex-col justify-center" style={{ background: sc.accent }}>
                                <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: sc.color }}>Estimation {sc.label}</div>
                                <div className="text-xl font-bold" style={{ color: sc.color, letterSpacing: "-0.02em" }}>{formatEuro(loyer)}/mois</div>
                                <div className="text-xs mt-0.5 font-semibold" style={{ color: "#1A1612" }}>{sc.taux}% occupation</div>
                                <div className="text-xs font-semibold" style={{ color: "#C95B2A" }}>{nuits} nuits/an</div>
                                <div className="text-xs mt-1 font-bold" style={{ color: sc.color }}>{formatEuro(loyer * 12)}/an</div>
                              </div>
                              {/* Réel */}
                              <div className="p-3" style={{ background: "#FDFAF6", borderLeft: `1px solid ${sc.border}` }}>
                                {r ? <div className="space-y-0.5">
                                  <TRow label="Revenus annuels" val={formatEuro(r.loyerAnnuel)} bold />
                                  <TRow label="Emprunt" val={`−${formatEuro(r.creditAnnuel)}`} color="#B03A2A" />
                                  <TRow label="Charges" val={`−${formatEuro(r.chargesDeductibles - r.interetsAnnee1)}`} color="#B03A2A" />
                                  <TRow label="Amortissements" val={`−${formatEuro(r.amortTotal)}`} color="#8B1A1A" bold labelBold bg="rgba(139,26,26,0.05)" />
                                  <TRow label="Base imposable" val={formatEuro(r.baseImposableReel)} bold sep color={r.baseImposableReel === 0 ? "#1A7A52" : "#1A1612"} />
                                  <TRow label="Impôt estimé" val={formatEuro(r.impotReel)} color="#B03A2A" />
                                  {(() => { const cfVal = r.cashflowReelMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                    <div style={{ borderTop: "0.5px solid rgba(26,22,18,0.1)", paddingTop: 6, marginTop: 4 }}>
                                      <div className="flex justify-between">
                                        <span style={{ color: "rgba(26,22,18,0.7)", fontSize: 12.5, fontWeight: 700 }}>Cash-flow <strong>Mensuel</strong></span>
                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                      </div>
                                      <div className="mt-1">
                                        <span style={{ fontSize: 11, color: "rgba(26,22,18,0.55)" }}>Soit annuel : </span><span style={{ fontSize: 11, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                      </div>
                                    </div>
                                  ); })()}
                                </div> : <div className="text-xs text-center py-4" style={{ color: "rgba(26,22,18,0.4)" }}>–</div>}
                              </div>
                              {/* BIC */}
                              <div className="p-3" style={{ background: "#FDFAF6", borderLeft: `1px solid ${sc.border}` }}>
                                {r ? <div className="space-y-0.5">
                                  <TRow label="Revenus annuels" val={formatEuro(r.loyerAnnuel)} bold />
                                  <TRow label="Emprunt" val={`−${formatEuro(r.creditAnnuel)}`} color="#B03A2A" />
                                  <TRow label="Ensemble des charges" val={`−${formatEuro(r.chargesAnnuelles + r.assuranceEmprunteurAnnuel)}`} color="#B03A2A" />
                                  <div className="mt-1 pt-1" style={{ borderTop: "0.5px solid rgba(26,22,18,0.1)" }}>
                                    <div className="flex justify-between py-1.5">
                                      <span style={{ color: "rgba(26,22,18,0.7)", fontSize: 12.5, fontWeight: 600 }}>Base imposable</span>
                                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1612" }}>{formatEuro(r.baseBIC)}</span>
                                    </div>
                                    <div className="text-[10px] mb-1 px-1.5 py-0.5 rounded" style={{ color: "rgba(26,22,18,0.5)", background: "rgba(26,22,18,0.04)" }}>
                                      Abatt. 30% sur {formatEuro(r.recettesAnnuelles)}
                                    </div>
                                  </div>
                                  <TRow label="Impôt estimé" val={formatEuro(r.impotBIC)} color="#B03A2A" />
                                  {(() => { const cfVal = r.cashflowBICMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                    <div style={{ borderTop: "0.5px solid rgba(26,22,18,0.1)", paddingTop: 6, marginTop: 4 }}>
                                      <div className="flex justify-between">
                                        <span style={{ color: "rgba(26,22,18,0.7)", fontSize: 12.5, fontWeight: 700 }}>Cash-flow <strong>Mensuel</strong></span>
                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                      </div>
                                      <div className="mt-1">
                                        <span style={{ fontSize: 11, color: "rgba(26,22,18,0.55)" }}>Soit annuel : </span><span style={{ fontSize: 11, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                      </div>
                                    </div>
                                  ); })()}
                                </div> : <div className="text-xs text-center py-4" style={{ color: "rgba(26,22,18,0.4)" }}>–</div>}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    );
                  })() : (() => {
                    const economy = resultats.impotBIC - resultats.impotReel;
                    const cfDiff = resultats.cashflowReelMensuel - resultats.cashflowBICMensuel;
                    const reelBetter = economy > 0 || (economy === 0 && cfDiff >= 0);
                    const bestLabel = reelBetter ? "Régime Réel Simplifié" : "Micro-BIC";
                    const bestColor = reelBetter ? "#C95B2A" : "#1A1612";
                    const bestBg = reelBetter ? "rgba(201,91,42,0.06)" : "rgba(26,22,18,0.04)";
                    const bestBorder = reelBetter ? "rgba(201,91,42,0.3)" : "rgba(26,22,18,0.2)";

                    const Row = ({ label, val, color, bold, labelBold, bg, sep, indent }: { label: string; val: string; color?: string; bold?: boolean; labelBold?: boolean; bg?: string; sep?: boolean; indent?: boolean }) => (
                      <div className={`flex justify-between items-baseline py-2.5${indent ? " pl-4" : ""}${sep ? " mt-1" : ""}`}
                        style={{ borderTop: sep ? "1px solid rgba(26,22,18,0.09)" : undefined, background: bg, borderRadius: bg ? 5 : undefined, marginLeft: bg ? -8 : undefined, paddingLeft: bg ? (indent ? 20 : 8) : undefined, paddingRight: bg ? 8 : undefined }}>
                        <span className="text-sm pr-3" style={{ color: labelBold ? (color ?? (indent ? "rgba(26,22,18,0.6)" : "rgba(26,22,18,0.78)")) : (indent ? "rgba(26,22,18,0.6)" : "rgba(26,22,18,0.78)"), fontWeight: labelBold ? 700 : 400, fontSize: indent ? 12 : 13 }}>{label}</span>
                        <span className="text-sm whitespace-nowrap" style={{ fontSize: 13, fontWeight: bold ? 600 : 400, color: color ?? "#1A1612" }}>{val}</span>
                      </div>
                    );

                    return (
                      <>
                        {/* Explication régimes fiscaux — disparaît après sélection */}
                        {selectedRegime === null && showRegimeExplainer && (
                          <div className="mb-3">
                            <p className="text-[15px] leading-relaxed" style={{ color: "#4E1F12", margin: 0 }}>
                              En LMNP, le choix du régime fiscal est déterminant car il impacte directement le montant de ton impôt, et donc ton cash-flow à la fin de chaque mois.<br />Il existe deux régimes :
                            </p>
                            <p className="text-[15px] leading-relaxed" style={{ color: "#4E1F12", margin: "8px 0 0" }}>
                              Le <strong style={{ color: "#2A6E80" }}>Micro-BIC</strong> applique un abattement forfaitaire de <strong style={{ color: "#2A6E80" }}>50%</strong> sur tes loyers puis te donne ta base imposable.<br />
                              Le <strong style={{ color: "#C95B2A" }}>Régime Réel</strong> déduit tes vraies charges et te permet <strong><u>d&apos;amortir une partie de ton bien</u></strong>, réduisant souvent ton impôt.{" "}
                              Pour la majorité des investisseurs avec un crédit, le <strong style={{ color: "#C95B2A" }}>Régime Réel</strong> est plus avantageux.
                            </p>
                            <div className="flex justify-end mt-2">
                              <button onClick={() => setShowRegimeExplainer(false)}
                                className="text-[11px] font-medium px-3 py-1 rounded-md transition-opacity hover:opacity-70"
                                style={{ color: "rgba(26,22,18,0.45)", background: "rgba(26,22,18,0.06)", border: "none" }}>
                                − Réduire
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Recommandation banner — visible uniquement avant le choix du régime */}
                        {selectedRegime === null && (
                          <div className="rounded-xl px-5 py-4 mb-4" style={{ background: bestBg, border: `1.5px solid ${bestBorder}` }}>
                            <div className="flex items-baseline flex-wrap gap-x-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(26,22,18,0.45)" }}>Régime le plus adapté à votre situation</span>
                              <span className="text-lg font-black" style={{ color: bestColor, letterSpacing: "-0.02em" }}>{bestLabel}</span>
                            </div>
                            <div className="text-base mt-1.5 font-semibold" style={{ color: reelBetter ? "#1A7A52" : "rgba(26,22,18,0.6)" }}>
                              {reelBetter
                                ? `${economy > 0 ? `${formatEuro(economy)}/an d'impôt économisé` : ""}${cfDiff > 0 ? `${economy > 0 ? " · " : ""}Cash-flow supérieur de ${formatEuro(cfDiff)}/mois` : ""}`
                                : `Micro-BIC suffisant — écart d'impôt de ${formatEuro(Math.abs(economy))}/an`}
                            </div>
                          </div>
                        )}

                        {/* "Fais ton choix" + tableaux */}
                        {selectedRegime === null ? (
                          <>
                            <div className="text-center mb-4">
                              <span className="text-base font-semibold" style={{ color: "#1A1612" }}>Fais ton choix de régime fiscal</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                              {/* Réel — clickable */}
                              <button type="button" onClick={() => { setSelectedRegime("reel"); scrollToAmort.current = true; }}
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
                                  <Row label="Amortissements" val={`−${formatEuro(resultats.amortTotal)}`} color="#8B1A1A" bold labelBold bg="rgba(139,26,26,0.05)" />
                                  <Row label="Base imposable" val={formatEuro(resultats.baseImposableReel)} bold sep />
                                  <Row label="Impôt estimé" val={formatEuro(resultats.impotReel)} color="#B03A2A" />
                                  {(() => { const cfVal = resultats.cashflowReelMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                    <div className="mt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                      <div className="flex justify-between items-baseline py-2.5">
                                        <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13, fontWeight: 600 }}>Cash-flow <strong>Mensuel</strong></span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                      </div>
                                      <div className="flex justify-between -mt-1 pb-2">
                                        <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel :</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                      </div>
                                    </div>
                                  ); })()}
                                </div>
                                <div className="px-5 py-3 text-center text-sm font-semibold" style={{ background: "rgba(201,91,42,0.08)", color: "#C95B2A" }}>
                                  Choisir ce régime →
                                </div>
                              </button>

                              {/* Micro-BIC — clickable */}
                              <button type="button" onClick={() => { setSelectedRegime("micro"); setSimulationValidated(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                className="rounded-xl overflow-hidden text-left w-full transition-all hover:shadow-md focus:outline-none group"
                                style={{ border: "1.5px solid rgba(26,22,18,0.15)" }}>
                                <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: "#EDE7DC", borderBottom: "0.5px solid rgba(26,22,18,0.12)" }}>
                                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid rgba(26,22,18,0.35)", background: "#fff" }}>
                                    <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: "#1A1612" }} />
                                  </div>
                                  <span className="font-bold text-[15px]" style={{ color: "#1A1612" }}>Régime Micro-BIC</span>
                                  <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded" style={{ background: "rgba(26,22,18,0.1)", color: "rgba(26,22,18,0.55)" }}>{isSaisonnier ? "ABATTEMENT 30%" : "ABATTEMENT 50%"}</span>
                                </div>
                                <div className="px-5 pb-2" style={{ background: "#FDFAF6" }}>
                                  <Row label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                                  <Row label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                                  <div className="pl-3 pb-1.5 -mt-1">
                                    <span className="text-[13px] font-medium" style={{ color: "rgba(26,22,18,0.6)" }}>Dont frais d&apos;emprunt : </span>
                                    <span className="text-[13px] font-semibold" style={{ color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span>
                                  </div>
                                  {!isSaisonnier && <Row label="Ensemble des charges" val={`−${formatEuro(resultats.chargesAnnuelles + resultats.assuranceEmprunteurAnnuel)}`} color="#B03A2A" />}
                                  <Row label={isSaisonnier ? "Base imposable (70% recettes)" : "Base imposable (50% recettes)"} val={formatEuro(resultats.baseBIC)} bold sep />
                                  <Row label="Impôt estimé" val={formatEuro(resultats.impotBIC)} color="#B03A2A" />
                                  {(() => { const cfVal = resultats.cashflowBICMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                    <div className="mt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                      <div className="flex justify-between items-baseline py-2.5">
                                        <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13, fontWeight: 600 }}>Cash-flow <strong>Mensuel</strong></span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                      </div>
                                      <div className="flex justify-between -mt-1 pb-2">
                                        <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel :</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                      </div>
                                    </div>
                                  ); })()}
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
                                  {selectedRegime === "reel" ? "Régime réel simplifié" : "Micro-BIC"}
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
                                    <Row label="Résultat avant amortissement" val={formatEuro(resultats.resultatAvantAmort)} bold color={resultats.resultatAvantAmort >= 0 ? "#1A7A52" : "#B03A2A"} sep />
                                    <Row label="Amortissements" val={`−${formatEuro(resultats.amortTotal)}`} color="#8B1A1A" bold labelBold bg="rgba(139,26,26,0.05)" />
                                    <Row label="Base imposable" val={formatEuro(resultats.baseImposableReel)} bold sep />
                                    <Row label="Impôt estimé" val={formatEuro(resultats.impotReel)} color="#B03A2A" />
                                    <Row label="Amortissement à reporter N+1" val={formatEuro(resultats.amortAReporter)} color="#B08A2A" />
                                    {(() => { const cfVal = resultats.cashflowReelMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                      <div className="mt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                        <div className="flex justify-between items-baseline py-2.5">
                                          <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13, fontWeight: 600 }}>Cash-flow <strong>Mensuel</strong></span>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                        </div>
                                        <div className="-mt-1 pb-2">
                                          <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel : </span><span style={{ fontSize: 12, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                        </div>
                                      </div>
                                    ); })()}
                                  </>
                                ) : (
                                  <>
                                    <Row label="Loyers annuels" val={formatEuro(resultats.loyerAnnuel)} bold />
                                    <Row label="Emprunt" val={`−${formatEuro(resultats.creditAnnuel)}`} color="#B03A2A" />
                                    <div className="pl-3 -mt-1 pb-2">
                                      <span className="text-[12px]" style={{ color: "rgba(26,22,18,0.6)" }}>Dont frais d&apos;emprunt </span>
                                      <span className="text-[13px] font-semibold" style={{ color: "#B03A2A" }}>{formatEuro(resultats.interetsAnnee1)}</span>
                                    </div>
                                    {!isSaisonnier && <Row label="Ensemble des charges" val={`−${formatEuro(resultats.chargesAnnuelles + resultats.assuranceEmprunteurAnnuel)}`} color="#B03A2A" />}
                                    <Row label={isSaisonnier ? "Base imposable (70% recettes)" : "Base imposable (50% recettes)"} val={formatEuro(resultats.baseBIC)} bold sep />
                                    <Row label="Impôt estimé" val={formatEuro(resultats.impotBIC)} color="#B03A2A" />
                                    {(() => { const cfVal = resultats.cashflowBICMensuel; const cfColor = cfVal >= 0 ? "#1A7A52" : "#B03A2A"; return (
                                      <div className="mt-1" style={{ borderTop: "1px solid rgba(26,22,18,0.09)" }}>
                                        <div className="flex justify-between items-baseline py-2.5">
                                          <span style={{ color: "rgba(26,22,18,0.78)", fontSize: 13, fontWeight: 600 }}>Cash-flow <strong>Mensuel</strong></span>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: cfColor }}>{formatEuro(cfVal)}</span>
                                        </div>
                                        <div className="-mt-1 pb-2">
                                          <span style={{ fontSize: 12, color: "rgba(26,22,18,0.55)" }}>Soit annuel : </span><span style={{ fontSize: 12, color: cfColor }}>{formatEuro(cfVal * 12)}</span>
                                        </div>
                                      </div>
                                    ); })()}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Bouton changer de régime */}
                            <div className="flex items-start pt-1">
                              <button
                                type="button"
                                onClick={() => { setSelectedRegime(null); setSimulationValidated(false); }}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                                style={{ background: "#EDE7DC", color: selectedRegime === "reel" ? "#C95B2A" : "#1A1612", border: `1px solid ${selectedRegime === "reel" ? "rgba(201,91,42,0.25)" : "rgba(26,22,18,0.2)"}` }}>
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
                {selectedRegime === "reel" && <div ref={amortContentRef} className="rounded-xl overflow-hidden" style={{ ...cardStyle, scrollMarginTop: "90px" }}>
                  {/* En-tête L'Amortissement */}
                  <div className="px-6 py-4 flex items-center gap-3" style={{ background: "linear-gradient(90deg, #4E1F12 0%, #7A2E15 100%)" }}>
                    <div className="text-xl font-black tracking-tight" style={{ color: "#F5F0E8" }}>L&apos;Amortissement LMNP</div>
                    <div className="text-sm font-medium" style={{ color: "rgba(245,240,232,0.55)" }}>· Régime réel simplifié</div>
                  </div>
                  <div className="px-5 pt-5 pb-5 space-y-5">

                      {/* Bloc unifié : explication + valeur amort + méthodes + boutons */}
                      {(() => {
                        const prixVal2 = parseFloat(form.prix) || 0;
                        const valAmort2 = prixVal2 * amortPct / 100;
                        return (
                          <>
                          <div>
                            {/* Explication principale */}
                            <p className="text-[15px] leading-relaxed" style={{ color: "#4E1F12" }}>
                              En LMNP au réel, tu peux donc amortir ton bien chaque année qui vient réduire ta base imposable.{" "}
                              Tu peux amortir uniquement{" "}
                              <strong>la partie Bâti de ton bien mais qui représente déjà <span style={{ color: "#C95B2A" }}>~{amortPct}%</span> <span style={{ color: "#C95B2A" }}>(ajustable)</span> de sa valeur</strong>.{" "}
                              Le terrain, les {100 - amortPct}% restants, ne s&apos;amortit pas.
                            </p>

                            {/* Calcul en ligne — formule mathématique */}
                            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                              <span className="text-[16px] font-medium" style={{ color: "#4E1F12" }}>Prix du bien</span>
                              <span className="text-[16px] font-bold" style={{ color: "#1A1612" }}>{formatEuro(prixVal2)}</span>
                              <span className="text-[18px] font-light" style={{ color: "rgba(26,22,18,0.35)" }}>×</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[16px] font-medium" style={{ color: "#4E1F12" }}>Part amortissable</span>
                                <input type="number" min={0} max={100} value={amortPct}
                                  onChange={e => {
                                    const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                    e.target.value = String(v);
                                    setAmortPct(v);
                                  }}
                                  className="w-12 text-center text-[16px] font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#C95B2A]"
                                  style={{ ...INPUT_STYLE, color: "#C95B2A" }} />
                                <span className="text-[16px] font-bold" style={{ color: "#C95B2A" }}>%</span>
                              </div>
                              <span className="text-[18px] font-light" style={{ color: "rgba(26,22,18,0.35)" }}>=</span>
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: "rgba(201,91,42,0.08)", border: "1.5px solid rgba(201,91,42,0.25)" }}>
                                <span className="text-[16px] font-medium" style={{ color: "#4E1F12" }}>Valeur amortissable</span>
                                <span className="text-[16px] font-black" style={{ color: "#C95B2A", letterSpacing: "-0.02em" }}>{formatEuro(valAmort2)}</span>
                              </div>
                            </div>

                            {/* Titre choix type amortissement */}
                            <div className="text-center mt-14 mb-4">
                              <span className="text-base font-semibold" style={{ color: "#1A1612" }}>Fais ton choix de méthode d&apos;Amortissement</span>
                            </div>

                            {/* Explication méthodes */}
                            <div className="mb-6">
                              <p className="text-[15px] leading-relaxed" style={{ color: "#4E1F12", margin: 0 }}>
                                Le choix de ta méthode d&apos;amortissement influence directement le montant que tu pourras déduire chaque année — et donc ton impôt.{" "}
                                La <strong>méthode par composants</strong> est plus précise et fiscalement optimisée.{" "}
                                La <strong>méthode globale</strong> est plus simple et s&apos;applique aux petits biens (en dessous de 200 000 €).{" "}
                                Clique sur <strong>&ldquo;Détails&rdquo;</strong> sous chaque option pour voir comment chaque méthode fonctionne.
                              </p>
                            </div>


                            {/* Grille 2 colonnes : Composant | Global */}
                            <div ref={amortContentRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12" style={{ scrollMarginTop: "80px" }}>

                              {/* ── Colonne Par Composant ── */}
                              <div className="space-y-3">
                                {amortMode !== "ensemble" ? (() => {
                                  const totalPct = composants.reduce((s, c) => s + c.pct, 0);
                                  const C2 = "#2A7080";
                                  const inputCls = "w-14 px-2 py-1.5 text-sm rounded-md text-center text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#2A7080] [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";
                                  return (
                                    <div onClick={() => { setAmortMode("composant"); scrollToValider.current = true; }} className="cursor-pointer rounded-xl overflow-hidden transition-all"
                                      style={{
                                        border: amortMode === "composant" ? `2px solid ${C2}` : "1.5px solid rgba(42,112,128,0.2)",
                                        boxShadow: amortMode === "composant" ? "0 0 0 3px rgba(42,112,128,0.1)" : "none",
                                      }}>
                                      {/* Header — radio + label + valeur amortissable */}
                                      <div className="px-5 py-3.5 flex items-center gap-3 transition-all"
                                        style={{ background: amortMode === "composant" ? C2 : "rgba(42,112,128,0.07)", borderBottom: "1px solid rgba(42,112,128,0.15)" }}>
                                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                          style={{ border: `2px solid ${amortMode === "composant" ? "#F5F0E8" : C2}` }}>
                                          {amortMode === "composant" && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />}
                                        </div>
                                        <span className="font-bold text-[14px] flex-1" style={{ color: amortMode === "composant" ? "#F5F0E8" : C2 }}>
                                          Amortissement par Composant
                                        </span>
                                        <div className="text-right">
                                          <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
                                            style={{ color: amortMode === "composant" ? "rgba(245,240,232,0.65)" : "rgba(42,112,128,0.6)" }}>Val. amortissable</div>
                                          <div className="text-[15px] font-bold"
                                            style={{ color: amortMode === "composant" ? "#F5F0E8" : C2 }}>{formatEuro(valAmort2)}</div>
                                        </div>
                                      </div>
                                      {/* ── Tableau unique — layout adapté par JS (isMobile) ── */}
                                      {isMobile ? (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 64px", columnGap: 4 }}>
                                          {[
                                            { label: "Composant", align: "left" as const },
                                            { label: "% / Valeur", align: "center" as const },
                                            { label: "Durée", align: "center" as const },
                                            { label: "/ an", align: "center" as const },
                                          ].map(({ label, align }) => (
                                            <div key={label} className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                                              style={{ background: "rgba(42,112,128,0.08)", borderBottom: "1px solid rgba(42,112,128,0.12)", color: label === "/ an" ? C2 : "rgba(42,112,128,0.7)", textAlign: align }}>
                                              {label}
                                            </div>
                                          ))}
                                          {composants.map((c, i) => {
                                            const val = valAmort2 * c.pct / 100;
                                            const rowBg = i % 2 === 0 ? "#FDFAF6" : "#F8F4EE";
                                            const border = "0.5px solid rgba(26,22,18,0.06)";
                                            return [
                                              <div key={`${c.label}-n`} className="px-2 flex items-center text-[12px] font-semibold" style={{ color: "#1A1612", background: rowBg, borderBottom: border, minHeight: 42 }}>{c.label}</div>,
                                              <div key={`${c.label}-p`} className="flex flex-col items-center justify-center gap-0.5 py-1" style={{ background: rowBg, borderBottom: border }}>
                                                <div className="flex items-center gap-0.5">
                                                  <input type="number" min={0} max={100} value={c.pct === 0 ? "" : c.pct} placeholder="0"
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => { const raw = e.target.value; const v = raw === "" ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0)); setComposants(prev => prev.map((x, j) => j === i ? { ...x, pct: v } : x)); }}
                                                    className={inputCls} style={{ ...INPUT_STYLE, width: 38, fontSize: 12, padding: "3px 4px" }} />
                                                  <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.5)" }}>%</span>
                                                </div>
                                                <span className="text-[10px] font-bold" style={{ color: C2 }}>{formatEuro(val)}</span>
                                              </div>,
                                              <div key={`${c.label}-d`} className="flex flex-col items-center justify-center gap-0.5 py-1" style={{ background: rowBg, borderBottom: border }}>
                                                <div className="flex items-center gap-0.5">
                                                  <input type="number" min={0} max={100} value={c.duree === 0 ? "" : c.duree} placeholder="0"
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => { const raw = e.target.value; const v = raw === "" ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0)); setComposants(prev => prev.map((x, j) => j === i ? { ...x, duree: v } : x)); }}
                                                    className={inputCls} style={{ ...INPUT_STYLE, width: 38, fontSize: 12, padding: "3px 4px" }} />
                                                  <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.5)" }}>ans</span>
                                                </div>
                                              </div>,
                                              <div key={`${c.label}-a`} className="flex items-center justify-center text-[12px] font-bold" style={{ color: C2, background: rowBg, borderBottom: border }}>{formatEuro(c.duree > 0 ? val / c.duree : 0)}</div>,
                                            ];
                                          })}
                                          <div className="px-2 py-2 text-[13px] font-bold" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)", color: "#1A1612" }}>Total</div>
                                          <div className="py-2 flex items-center justify-center text-[13px] font-bold" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)", color: totalPct === 100 ? "#1A7A52" : "#B03A2A" }}>{totalPct} %{totalPct !== 100 && " ⚠"}</div>
                                          <div className="py-2" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)" }} />
                                          <div className="py-2 flex items-center justify-center text-[12px] font-bold" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)", color: C2 }}>{formatEuro(composants.reduce((s, c) => s + (valAmort2 * c.pct / 100) / (c.duree || 1), 0))}/an</div>
                                        </div>
                                      ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 2.2fr 1fr 1fr", columnGap: 0 }}>
                                          {[
                                            { label: "Composant", align: "left" as const },
                                            { label: "Quote part en %", align: "left" as const },
                                            { label: "Durée", align: "center" as const },
                                            { label: "Amort / an", align: "right" as const },
                                          ].map(({ label, align }) => (
                                            <div key={label} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider"
                                              style={{ background: "rgba(42,112,128,0.08)", borderBottom: "1px solid rgba(42,112,128,0.12)", color: label === "Amort / an" ? C2 : "rgba(42,112,128,0.7)", textAlign: align }}>
                                              {label}
                                            </div>
                                          ))}
                                          {composants.map((c, i) => {
                                            const val = valAmort2 * c.pct / 100;
                                            const rowBg = i % 2 === 0 ? "#FDFAF6" : "#F8F4EE";
                                            const border = "0.5px solid rgba(26,22,18,0.06)";
                                            const amortAn = c.duree > 0 ? val / c.duree : 0;
                                            return [
                                              <div key={`${c.label}-n`} className="px-3 flex items-center text-[13px] font-semibold" style={{ color: "#1A1612", background: rowBg, borderBottom: border, minHeight: 48 }}>{c.label}</div>,
                                              <div key={`${c.label}-p`} className="px-3 flex items-center gap-1.5 py-1" style={{ background: rowBg, borderBottom: border }}>
                                                <input type="number" min={0} max={100} value={c.pct === 0 ? "" : c.pct} placeholder="0"
                                                  onClick={e => e.stopPropagation()}
                                                  onChange={e => { const raw = e.target.value; const v = raw === "" ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0)); setComposants(prev => prev.map((x, j) => j === i ? { ...x, pct: v } : x)); }}
                                                  className={inputCls} style={{ ...INPUT_STYLE, width: 42, fontSize: 13, padding: "4px 5px" }} />
                                                <span className="text-[12px]" style={{ color: "rgba(26,22,18,0.5)" }}>% soit</span>
                                                <span className="text-[12px] font-bold" style={{ color: C2 }}>{formatEuro(val)}</span>
                                                <span className="text-[12px]" style={{ color: "rgba(26,22,18,0.5)" }}>sur</span>
                                              </div>,
                                              <div key={`${c.label}-d`} className="flex items-center justify-center gap-1 py-1" style={{ background: rowBg, borderBottom: border }}>
                                                <input type="number" min={0} max={100} value={c.duree === 0 ? "" : c.duree} placeholder="0"
                                                  onClick={e => e.stopPropagation()}
                                                  onChange={e => { const raw = e.target.value; const v = raw === "" ? 0 : Math.min(100, Math.max(0, parseInt(raw) || 0)); setComposants(prev => prev.map((x, j) => j === i ? { ...x, duree: v } : x)); }}
                                                  className={inputCls} style={{ ...INPUT_STYLE, width: 42, fontSize: 13, padding: "4px 5px" }} />
                                                <span className="text-[12px]" style={{ color: "rgba(26,22,18,0.5)" }}>ans</span>
                                              </div>,
                                              <div key={`${c.label}-a`} className="flex items-center justify-end px-3 text-[13px] font-bold" style={{ color: C2, background: rowBg, borderBottom: border }}>= {formatEuro(amortAn)}</div>,
                                            ];
                                          })}
                                          <div className="px-3 py-2 text-[13px] font-bold" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)", color: "#1A1612" }}>Total</div>
                                          <div className="px-3 py-2 text-[13px] font-bold" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)", color: totalPct === 100 ? "#1A7A52" : "#B03A2A" }}>{totalPct} %{totalPct !== 100 && " ⚠"}</div>
                                          <div style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)" }} />
                                          <div className="px-3 py-2 text-right text-[13px] font-bold" style={{ background: "rgba(42,112,128,0.1)", borderTop: "1px solid rgba(42,112,128,0.15)", color: C2 }}>{formatEuro(composants.reduce((s, c) => s + (valAmort2 * c.pct / 100) / (c.duree || 1), 0))}/an</div>
                                        </div>
                                      )}
                                      {/* Warnings */}
                                      {totalPct !== 100 && (
                                        <p className="px-4 py-2 text-[13px]" style={{ color: "#B03A2A", background: "rgba(176,58,42,0.05)" }}>
                                          ⚠ Les % doivent totaliser 100 % pour couvrir toute la valeur amortissable.
                                        </p>
                                      )}
                                      {composants.some(c => c.duree === 0 && c.pct > 0) && (
                                        <p className="px-4 py-2 text-[13px]" style={{ color: "#B03A2A", background: "rgba(176,58,42,0.05)" }}>
                                          ⚠ La durée d&apos;amortissement ne peut pas être 0 an pour un composant avec un % &gt; 0.
                                        </p>
                                      )}
                                    </div>
                                  );
                                })() : (
                                  <button onClick={() => setAmortMode(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80" style={{ background: "#EDE7DC", color: "#2A7080", border: "1px solid rgba(42,112,128,0.25)" }}>← Changer de méthode d&apos;amortissement</button>
                                )}

                                {/* Détails — tout en bas */}
                                {amortMode !== "ensemble" && (
                                  <div className="pt-1">
                                    <button onClick={e => { e.stopPropagation(); setShowDetailsComposant(v => !v); }}
                                      className="text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1"
                                      style={{ color: "#2A7080", background: "rgba(42,112,128,0.08)", border: "1px solid rgba(42,112,128,0.2)" }}>
                                      {showDetailsComposant ? "▲" : "▼"} Détails
                                    </button>
                                    {showDetailsComposant && (
                                      <div className="mt-2">
                                        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,22,18,0.75)" }}>
                                          L&apos;Amortissement par Composant consiste à décomposer et distribuer la valeur du bien sur plusieurs éléments principaux : gros œuvre, toiture, installations électriques, etc.
                                        </p>
                                        <p className="text-[13px] leading-relaxed mt-1.5" style={{ color: "rgba(26,22,18,0.75)" }}>
                                          Chaque composant va correspondre à un pourcentage de la valeur du bien et à une durée pour l&apos;amortir bien précise. Lors du choix de ces valeurs, il faut bien veiller à respecter les durées d&apos;utilisation normale de chaque composant, ainsi que leur proportion dans la valeur totale du logement.
                                        </p>
                                        <button onClick={() => setShowDetailsComposant(false)} className="mt-1 text-[11px] font-medium" style={{ color: "rgba(26,22,18,0.4)" }}>▲ Réduire</button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* ── Colonne Global Simplifié ── */}
                              <div className="space-y-3">
                                {amortMode !== "composant" ? (
                                  <div onClick={() => { setAmortMode("ensemble"); scrollToValider.current = true; }} className="cursor-pointer rounded-xl overflow-hidden transition-all"
                                    style={{
                                      border: amortMode === "ensemble" ? "2px solid #C95B2A" : "1.5px solid rgba(201,91,42,0.2)",
                                      boxShadow: amortMode === "ensemble" ? "0 0 0 3px rgba(201,91,42,0.1)" : "none",
                                    }}>
                                    {/* Header — radio + label + valeur amortissable */}
                                    <div className="px-5 py-3.5 flex items-center gap-3 transition-all"
                                      style={{ background: amortMode === "ensemble" ? "#C95B2A" : "rgba(201,91,42,0.07)", borderBottom: "1px solid rgba(201,91,42,0.15)" }}>
                                      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                        style={{ border: `2px solid ${amortMode === "ensemble" ? "#F5F0E8" : "#C95B2A"}` }}>
                                        {amortMode === "ensemble" && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5F0E8" }} />}
                                      </div>
                                      <span className="font-bold text-[14px] flex-1" style={{ color: amortMode === "ensemble" ? "#F5F0E8" : "#C95B2A" }}>
                                        Amortissement Global Simplifié
                                      </span>
                                      <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
                                          style={{ color: amortMode === "ensemble" ? "rgba(245,240,232,0.65)" : "rgba(201,91,42,0.6)" }}>Val. amortissable</div>
                                        <div className="text-[15px] font-bold"
                                          style={{ color: amortMode === "ensemble" ? "#F5F0E8" : "#C95B2A" }}>{formatEuro(valAmort2)}</div>
                                      </div>
                                    </div>
                                    {/* Content — Amort/an + Pendant */}
                                    <div className="px-5 py-4 flex items-center gap-6" style={{ background: "#FDFAF6" }}>
                                      <div>
                                        <div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#C95B2A" }}>Amortissement / an</div>
                                        <div className="text-xl font-bold" style={{ color: "#C95B2A" }}>{formatEuro(amortDureeEnsemble > 0 ? valAmort2 / amortDureeEnsemble : 0)}</div>
                                      </div>
                                      <div className="w-px self-stretch" style={{ background: "rgba(201,91,42,0.15)" }} />
                                      <div>
                                        <div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: "rgba(26,22,18,0.4)" }}>Pendant</div>
                                        <div className="flex items-baseline gap-1">
                                          <input type="number" min={5} max={100} value={amortDureeEnsemble === 0 ? "" : amortDureeEnsemble}
                                            placeholder="—"
                                            onClick={e => e.stopPropagation()}
                                            onChange={e => {
                                              const raw = e.target.value;
                                              if (raw === "") { setAmortDureeEnsemble(0); return; }
                                              const v = parseInt(raw);
                                              if (!isNaN(v)) setAmortDureeEnsemble(Math.min(100, v));
                                            }}
                                            onBlur={() => {
                                              if (amortDureeEnsemble < 5) setAmortDureeEnsemble(5);
                                            }}
                                            className="w-14 text-center text-xl font-bold rounded-md focus:outline-none focus:ring-1 focus:ring-[#C95B2A] [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                            style={{ ...INPUT_STYLE, color: "#1A1612" }} />
                                          <span className="text-[15px] font-bold" style={{ color: "#1A1612" }}>ans</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setAmortMode(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80" style={{ background: "#EDE7DC", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.25)" }}>← Changer de méthode d&apos;amortissement</button>
                                )}

                                {/* Détails — tout en bas */}
                                {amortMode !== "composant" && (
                                  <div className="pt-1">
                                    <button onClick={e => { e.stopPropagation(); setShowDetailsEnsemble(v => !v); }}
                                      className="text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1"
                                      style={{ color: "#C95B2A", background: "rgba(201,91,42,0.08)", border: "1px solid rgba(201,91,42,0.2)" }}>
                                      {showDetailsEnsemble ? "▲" : "▼"} Détails
                                    </button>
                                    {showDetailsEnsemble && (
                                      <div className="mt-2">
                                        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,22,18,0.75)" }}>
                                          L&apos;amortissement Global Simplifié consiste à amortir le bien dans son ensemble (~85% de sa valeur, hors la valeur terrain) sur la durée choisie, généralement entre 25 et 45 ans. C&apos;est la méthode la plus simple, non conventionnelle mais elle est généralement tolérée lorsqu&apos;il s&apos;agit d&apos;un petit bien seul et que la comptabilité est faite sans expert comptable.
                                        </p>
                                        <button onClick={() => setShowDetailsEnsemble(false)} className="mt-1 text-[11px] font-medium" style={{ color: "rgba(26,22,18,0.4)" }}>▲ Réduire</button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          </>
                        );
                      })()}

                      {/* Récap cards — toujours visibles dans la section amort */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Bien */}
                        <div className="rounded-lg p-3.5 text-center" style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.1)" }}>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "rgba(26,22,18,0.45)" }}>Bien</div>
                          <div className="font-bold text-[15px]" style={{ color: "#4E1F12" }}>{formatEuro(amortBienDisplay)}/an</div>
                          <div className="text-[12px] mt-1" style={{ color: "rgba(26,22,18,0.38)" }}>{(amortMode ?? "ensemble") === "ensemble" ? `${amortPct}% du prix · sur ${amortDureeEnsemble} ans` : `${amortPct}% · composants`}</div>
                        </div>
                        {/* Mobilier — éditable */}
                        <div className="rounded-lg p-3.5 text-center" style={{ background: "#F5F0E8", border: "1px solid rgba(201,91,42,0.25)" }}>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "rgba(26,22,18,0.45)" }}>Mobilier</div>
                          <div className="font-bold text-[15px] mb-1" style={{ color: "#6B4226" }}>{formatEuro(amortMobilierDisplay)}/an</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>sur</span>
                            <input
                              type="text" inputMode="numeric"
                              value={inputMobilier}
                              onChange={e => setInputMobilier(e.target.value.replace(/[^0-9]/g, ""))}
                              onBlur={() => { const v = Math.min(100, Math.max(3, parseInt(inputMobilier) || 3)); setAmortDureeMobilier(v); setInputMobilier(String(v)); }}
                              onFocus={e => e.target.select()}
                              className="w-12 text-center text-[13px] font-bold rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
                              style={{ background: "rgba(201,91,42,0.12)", border: "1px solid rgba(201,91,42,0.4)", color: "#C95B2A" }}
                            />
                            <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>ans</span>
                          </div>
                        </div>
                        {/* Travaux — éditable */}
                        <div className="rounded-lg p-3.5 text-center" style={{ background: "#F5F0E8", border: "1px solid rgba(201,91,42,0.25)" }}>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "rgba(26,22,18,0.45)" }}>Travaux</div>
                          <div className="font-bold text-[15px] mb-1" style={{ color: "#6B4226" }}>{formatEuro(amortTravauxDisplay)}/an</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>sur</span>
                            <input
                              type="text" inputMode="numeric"
                              value={inputTravaux}
                              onChange={e => setInputTravaux(e.target.value.replace(/[^0-9]/g, ""))}
                              onBlur={() => { const v = Math.min(100, Math.max(3, parseInt(inputTravaux) || 3)); setAmortDureeTravaux(v); setInputTravaux(String(v)); }}
                              onFocus={e => e.target.select()}
                              className="w-12 text-center text-[13px] font-bold rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
                              style={{ background: "rgba(201,91,42,0.12)", border: "1px solid rgba(201,91,42,0.4)", color: "#C95B2A" }}
                            />
                            <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>ans</span>
                          </div>
                        </div>
                        {/* Notaire — éditable */}
                        <div className="rounded-lg p-3.5 text-center" style={{ background: "#F5F0E8", border: "1px solid rgba(201,91,42,0.25)" }}>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "rgba(26,22,18,0.45)" }}>Notaire</div>
                          <div className="font-bold text-[15px] mb-1" style={{ color: "#6B4226" }}>{formatEuro(amortNotaireDisplay)}/an</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>sur</span>
                            <input
                              type="text" inputMode="numeric"
                              value={inputNotaire}
                              onChange={e => setInputNotaire(e.target.value.replace(/[^0-9]/g, ""))}
                              onBlur={() => { const v = Math.min(100, Math.max(3, parseInt(inputNotaire) || 3)); setAmortDureeNotaire(v); setInputNotaire(String(v)); }}
                              onFocus={e => e.target.select()}
                              className="w-12 text-center text-[13px] font-bold rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
                              style={{ background: "rgba(201,91,42,0.12)", border: "1px solid rgba(201,91,42,0.4)", color: "#C95B2A" }}
                            />
                            <span className="text-[11px]" style={{ color: "rgba(26,22,18,0.45)" }}>ans</span>
                          </div>
                        </div>
                        {/* Total */}
                        <div className="rounded-lg p-3.5 text-center" style={{ background: "rgba(201,91,42,0.1)", border: "1.5px solid rgba(201,91,42,0.3)" }}>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "#C95B2A" }}>Total</div>
                          <div className="font-bold text-[15px]" style={{ color: "#C95B2A" }}>{formatEuro(amortTotalDisplay)}</div>
                          <div className="text-[12px] mt-1" style={{ color: "rgba(26,22,18,0.38)" }}>Déductible première année</div>
                        </div>
                      </div>

                  </div>
                </div>}

                {/* Bouton Valider — visible pour réel (après amort) et micro-BIC */}
                {selectedRegime !== null && (
                  <div ref={validerRef} className="flex justify-center mt-4">
                    <button onClick={handleAjuster}
                      className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                      style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", letterSpacing: "0.02em" }}>
                      Valider la simulation →
                    </button>
                  </div>
                )}

              </div>
              )}
              </>
            )
          )}
        </div>
      </div>
      {showAmortRequired && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ background: "#4E1F12", color: "#F5F0E8", letterSpacing: "0.01em" }}>
          Choisis ton type d'amortissement avant de valider
        </div>
      )}
      {showPayPopup && (
        <PopupPaiementUnite
          onClose={() => setShowPayPopup(false)}
          simulationData={{
            form,
            amortPct,
            amortMode: amortMode ?? "ensemble",
            amortDureeEnsemble,
            amortDureeMobilier,
            amortDureeTravaux,
            amortDureeNotaire,
            composants,
            savedAt: Date.now(),
            isSaisonnier,
            prixNuitee,
            tauxOccBas,
            tauxOccMoyen,
            tauxOccHaut,
            resultatsTriple,
            selectedRegime,
          }}
        />
      )}
      {showSimLimite && (
        <PopupSimLimite
          isSignedIn={!!isSignedIn}
          onClose={() => setShowSimLimite(false)}
          onAccountBonus={() => {
            // Pose un flag : le bonus sera appliqué quand isSignedIn passe à true
            localStorage.setItem("lmnp_bonus_pending", "1");
            setShowSimLimite(false);
          }}
        />
      )}
      {showAmortLimite && <PopupAmortLimite onClose={() => setShowAmortLimite(false)} />}
      {showSauvegarder && (
        <PopupSauvegarder
          isSignedIn={!!isSignedIn}
          plan={(getPlan() || "free") as Plan}
          simulationData={{ form, amortPct, amortMode, amortDureeEnsemble, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire, composants, savedAt: Date.now(), isSaisonnier, prixNuitee, tauxOccBas, tauxOccMoyen, tauxOccHaut, resultatsTriple, resultats, selectedRegime }}
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
            redirectToRapport();
          }}
          onPayUnit={() => setShowPayPopup(true)}
        />
      )}
    </section>
  );
}

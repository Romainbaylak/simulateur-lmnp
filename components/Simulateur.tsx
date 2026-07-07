"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { loyersData, allVillesList } from "@/data/loyers";

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
  loyer: string;
  taxeFonciere: string;
  tmi: TMI;
}

interface Resultats {
  investTotal: number;
  montantCredit: number;
  mensualite: number;
  creditAnnuel: number;
  interetsAnnee1: number;
  chargesAnnuelles: number;
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

  if (prix <= 0 || loyerMensuel <= 0) return null;

  const mobilier = parseFloat(form.mobilier) || 0;
  const investTotal = prix + travaux + notaire;
  const montantCredit = Math.max(0, investTotal - apport);
  const mensualite = calcMensualite(montantCredit, taux, form.duree);
  const creditAnnuel = mensualite * 12;
  const interetsAnnee1 = calcInteretsAnnee1(montantCredit, taux, form.duree);
  const chargesAnnuelles = taxeFonciere + chargesCopro;
  const loyerAnnuel = loyerMensuel * 12;

  const valeurAmortissable = prix * (amortPct / 100);
  const amortBien = amortMode === "ensemble"
    ? valeurAmortissable / amortDureeEnsemble
    : composants.reduce((sum, c) => sum + (valeurAmortissable * c.pct / 100) / c.duree, 0);
  const amortMobilier = mobilier / 7;
  const amortTravaux = travaux / 15;
  const amortNotaire = notaire / 20;
  const amortTotal = amortBien + amortMobilier + amortTravaux + amortNotaire;

  const chargesDeductibles = chargesAnnuelles + interetsAnnee1;
  const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
  const baseImposableReel = Math.max(0, resultatAvantAmort - amortTotal);
  const impotReel = baseImposableReel * (form.tmi / 100 + 0.186);
  const impotReelMensuel = impotReel / 12;
  const amortAReporter = Math.max(0, amortTotal - Math.max(0, resultatAvantAmort));
  const cashflowReelMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - impotReel) / 12;

  const baseBIC = loyerAnnuel * 0.70;
  const impotBIC = baseBIC * (form.tmi / 100 + 0.186);
  const cashflowBICMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - impotBIC) / 12;

  const rendementBrut = (loyerAnnuel / investTotal) * 100;
  const rendementNet = ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100;

  return {
    investTotal, montantCredit, mensualite, creditAnnuel, interetsAnnee1,
    chargesAnnuelles, loyerAnnuel, amortBien, amortMobilier, amortTravaux, amortNotaire, amortTotal,
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
    taxeFonciere: "",
    tmi: 30,
  });

  const [villeSearch, setVilleSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loyerSlider, setLoyerSlider] = useState<number>(0);
  const [showAmort, setShowAmort] = useState(false);
  const [amortPct, setAmortPct] = useState(80);
  const [amortMode, setAmortMode] = useState<"ensemble" | "composant">("ensemble");
  const [amortDureeEnsemble, setAmortDureeEnsemble] = useState(20);
  const [composants, setComposants] = useState([
    { label: "Bâti / Gros œuvre", pct: 50, duree: 20 },
    { label: "Toiture", pct: 15, duree: 20 },
    { label: "Aménagement intérieur", pct: 15, duree: 12 },
    { label: "Électricité", pct: 10, duree: 10 },
    { label: "Étanchéité", pct: 10, duree: 20 },
  ]);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const villeData = form.villeKey ? loyersData[form.villeKey] : null;
  const surface = parseFloat(form.surface) || 0;
  const typeKey = form.type;

  const loyerBas   = villeData && surface > 0 ? villeData[typeKey].b * surface : 0;
  const loyerMoyen = villeData && surface > 0 ? villeData[typeKey].m * surface : 0;
  const loyerHaut  = villeData && surface > 0 ? villeData[typeKey].h * surface : 0;
  const showFourchette = !!villeData && surface > 0;

  const filteredVilles = villeSearch.length >= 1
    ? allVillesList.filter(v => v.label.toLowerCase().includes(villeSearch.toLowerCase())).slice(0, 10)
    : [];

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof FormState) => {
    setForm(prev => ({ ...prev, [field]: stripLeadingZeros(prev[field] as string) }));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const prix = parseFloat(form.prix) || 0;
    if (prix > 0) {
      const notaire = Math.round(prix * 0.075);
      const chargesCopro = form.type === "ap" ? Math.round(prix * 0.01) : 0;
      setForm(prev => ({ ...prev, notaire: notaire.toString(), chargesCopro: chargesCopro.toString() }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.prix, form.type]);

  useEffect(() => {
    const l = parseFloat(form.loyer) || 0;
    if (l > 0 && loyerSlider === 0) setLoyerSlider(l);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loyer]);

  const handleSimuler = () => {
    const loyerMensuel = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
    const r = computeResultats(form, loyerMensuel, amortPct, amortMode, amortDureeEnsemble, composants);
    setResultats(r);
    if (loyerMensuel > 0) setLoyerSlider(loyerMensuel);
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleAjuster = () => {
    const loyerMensuel = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
    const r = computeResultats(form, loyerMensuel, amortPct, amortMode, amortDureeEnsemble, composants);
    setResultats(r);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const verdict = resultats
    ? resultats.rendementNet > 5 && resultats.cashflowReelMensuel > 0
      ? { label: "Excellent investissement", bg: "#1A7A52", icon: "✓" }
      : resultats.rendementNet > 3
      ? { label: "Investissement correct", bg: "#B08A2A", icon: "~" }
      : { label: "Rentabilité faible", bg: "#B03A2A", icon: "✗" }
    : null;

  const loyerEffectif = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
  const sliderMin = Math.max(100, Math.floor(loyerBas * 0.7 / 25) * 25);
  const sliderMax = loyerHaut > 0 ? Math.round(loyerHaut * 1.5) : Math.round((parseFloat(form.loyer) || 500) * 2);

  // Inline amort display values (always reflect current state, not frozen resultats)
  const prixDisplay = parseFloat(form.prix) || 0;
  const valAmortDisplay = prixDisplay * amortPct / 100;
  const amortBienDisplay = amortMode === "ensemble"
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
    const chargesAnnuelles = resultats.chargesAnnuelles;
    const montantCredit = resultats.montantCredit;
    const apport = parseFloat(form.apport) || 0;
    const r = taux / 12;
    const n = duree * 12;
    const M = montantCredit > 0 && taux > 0
      ? montantCredit * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : (duree > 0 ? montantCredit / n : 0);

    const amortBienMaxDuree = amortMode === "ensemble"
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
      if (amortMode === "ensemble") {
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
      const chargesDeductibles = chargesAnnuelles + interetsAnnee;
      const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
      const reportEntrant = reportN;
      const amortDisponible = amortTotalA + reportEntrant;
      const baseImposable = Math.max(0, resultatAvantAmort - amortDisponible);
      const newReport = Math.max(0, amortDisponible - Math.max(0, resultatAvantAmort));
      const impot = baseImposable * (tmi / 100 + 0.186);
      const cashflow = (loyerAnnuel - creditAnnuelR - chargesAnnuelles - impot) / 12;
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
      const reportLines = [
        ro.reportEntrant > 0 ? `<div style="font-size:10px;color:#B08A2A;margin-top:2px">+${fEur(ro.reportEntrant)} report N-1</div>` : "",
        ro.reportNplus1 > 0 ? `<div style="font-size:10px;color:rgba(26,22,18,0.4);margin-top:1px">→ N+1 : ${fEur(ro.reportNplus1)}</div>` : "",
      ].join("");
      return `
      <tr class="${ro.year === duree + 1 ? "credit-end" : ""}">
        <td class="col-an">${ro.year}</td>
        <td class="cc">${ro.year <= duree ? fEur(ro.capitalDebut) : "—"}</td>
        <td class="cc">${ro.year <= duree ? fEur(ro.creditAnnuelR) : "—"}</td>
        <td class="cc-last">${ro.year <= duree ? fEur(ro.interetsAnnee) : "—"}</td>
        <td>${fEur(chargesAnnuelles)}</td>
        <td>${fEur(ro.resultatAvantAmort)}</td>
        <td style="font-weight:600">${fEur(ro.amortDisponible)}${reportLines}</td>
        <td style="color:${ro.baseImposable === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEur(ro.baseImposable)}</td>
        <td style="color:${ro.impot === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEur(ro.impot)}</td>
        <td style="color:${ro.cashflow >= 0 ? "#1A7A52" : "#B03A2A"}">${fEur(ro.cashflow)}/mois</td>
      </tr>`;
    }).join("");

    const conclusionText = zerosYears >= totalYears
      ? `Sur toute la période analysée (${totalYears} ans), la base imposable reste à 0 € grâce à l'amortissement. Vous ne payez aucun impôt sur vos revenus locatifs pendant cette période.`
      : zerosYears > 0
      ? `Vous ne payez aucun impôt pendant <strong>${zerosYears} an${zerosYears > 1 ? "s" : ""}</strong>.${firstTaxRow ? ` À partir de l'année ${firstTaxRow.year}, la base imposable s'établit à ${fEur(firstTaxRow.baseImposable)}, générant un impôt de ${fEur(firstTaxRow.impot)}/an.` : ""}`
      : `Dès la 1ère année, la base imposable s'établit à ${fEur(rows[0]?.baseImposable ?? 0)}, générant un impôt de ${fEur(rows[0]?.impot ?? 0)}/an. L'amortissement reste partiellement utilisé — envisagez d'allonger les durées ou d'augmenter la part mobilier.`;

    const microbicNote = tmi > 0
      ? `En Micro-BIC 2025, votre base imposable serait de <strong>${fEur(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEur(loyerAnnuel)}/an, en cas de loyer constant), générant un impôt estimé de <strong>${fEur(impotBIC)}</strong> par an (TMI ${tmi} % + prélèvements sociaux 18,6 %).`
      : `En Micro-BIC 2025, votre base imposable serait de <strong>${fEur(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEur(loyerAnnuel)}/an, en cas de loyer constant). Renseignez votre TMI pour calculer l'impôt correspondant.`;

    const modeDesc = amortMode === "ensemble"
      ? `Amortissement global — ${amortPct} % de ${fEur(prix)} sur ${amortDureeEnsemble} ans`
      : `Amortissement par composant — ${amortPct} % de ${fEur(prix)} : ${composants.map(c => `${c.label} ${c.pct} %/${c.duree} ans`).join(", ")}`;

    const makeSubTable = (label: string, initial: number, dureeComp: number, labelHtml?: string) => {
      if (initial <= 0) return "";
      const annuel = initial / dureeComp;
      const rowsHtml = Array.from({ length: dureeComp }, (_, i) => {
        const year = i + 1;
        const reste = Math.max(0, initial - year * annuel);
        return `<tr>
          <td class="col-an">${year}</td>
          <td>${fEur(annuel)}</td>
          <td style="color:${reste === 0 ? "#1A7A52" : "inherit"}">${fEur(reste)}</td>
        </tr>`;
      }).join("");
      const displayLabel = labelHtml ?? label;
      return `
      <div class="annexe-block">
        <div class="annexe-block-title">${displayLabel}</div>
        <div class="annexe-block-meta">Valeur initiale : <strong>${fEur(initial)}</strong> · Durée : <strong>${dureeComp} ans</strong> · Amort. annuel : <strong>${fEur(annuel)}</strong></div>
        <table class="annexe-table">
          <thead><tr><th class="col-an">An</th><th>Amort. annuel</th><th>Reste à amortir</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
    };

    const labelWithBreak = (lbl: string) => lbl.replace("Aménagement intérieur", "Aménagement<br>intérieur").replace("Aménagement Intérieur", "Aménagement<br>Intérieur");

    let annexeBlocks = "";
    if (amortMode === "ensemble") {
      annexeBlocks += makeSubTable("Bien immobilier (global)", valeurAmortissable, amortDureeEnsemble);
    } else {
      for (const c of composants) {
        const val = valeurAmortissable * c.pct / 100;
        annexeBlocks += makeSubTable(c.label, val, c.duree, labelWithBreak(c.label));
      }
    }
    if (mobilier > 0) annexeBlocks += makeSubTable("Mobilier", mobilier, 7);
    if (travaux > 0) annexeBlocks += makeSubTable("Travaux", travaux, 15);
    if (notaire > 0) annexeBlocks += makeSubTable("Frais de notaire", notaire, 20);

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Tableau d'amortissement LMNP – toutlmnp</title>
<style>
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;background:#F5F0E8;margin:0;padding:20px;font-size:12px}
header{background:#4E1F12;color:#F5F0E8;padding:14px 20px;border-radius:8px;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.lt{font-weight:300;font-size:20px;color:#F5F0E8}.ll{font-weight:700;font-size:20px;color:#C95B2A}
.ls{font-size:8px;letter-spacing:.12em;color:rgba(245,240,232,.5);text-transform:uppercase;margin-top:2px}
h2{font-size:13px;font-weight:700;color:#4E1F12;border-bottom:2px solid #C95B2A;padding-bottom:5px;margin:18px 0 8px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#4E1F12;color:#F5F0E8;padding:7px 8px;text-align:right;font-weight:500;white-space:nowrap}
th:first-child,th.col-an{text-align:left}
td{padding:7px 8px;text-align:right;border-bottom:.5px solid rgba(26,22,18,.07);vertical-align:middle}
td:first-child,td.col-an{text-align:left;font-weight:600}
tr:nth-child(even){background:rgba(201,91,42,.04)}
tr.credit-end td{border-top:2px solid rgba(201,91,42,.35)}
th.cc,th.cc-last{background:#3a1509;border-top:2px solid #C95B2A}
th.cc:first-of-type{border-left:2px solid #C95B2A}
th.cc-last{border-right:2px solid #C95B2A}
td.cc{background:rgba(78,31,18,0.04);border-left:2px solid rgba(201,91,42,.25)}
td.cc-last{background:rgba(78,31,18,0.04);border-right:2px solid rgba(201,91,42,.25)}
th.col-an,td.col-an{width:26px}
.recap{display:flex;gap:0;margin-bottom:10px}
.recap-col{flex:1;padding:10px 12px;border-radius:6px;margin-right:8px}
.recap-col:last-child{margin-right:0}
.recap-prestep{background:#EDE7DC;margin-bottom:8px;border-radius:6px;padding:8px 12px;display:flex;gap:12px;flex-wrap:wrap}
.kvi{flex:1;min-width:70px}
.kvl{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,.45)}
.kvv{font-size:12px;font-weight:600;color:#1A1612}
.orange{color:#C95B2A}
.note{background:rgba(201,91,42,.08);border:1px solid rgba(201,91,42,.2);border-radius:6px;padding:10px 14px;line-height:1.7;color:rgba(26,22,18,.7);margin-top:10px}
.conclusion{background:#4E1F12;color:#F5F0E8;border-radius:8px;padding:12px 16px;margin-top:14px;line-height:1.7}
.fiscal-note{background:#EDE7DC;border-radius:6px;padding:12px 16px;line-height:1.85;color:rgba(26,22,18,.65);margin-top:10px;font-size:12px}
.fiscal-note p{margin:0 0 6px}
.annexe-block{border:1.5px solid rgba(78,31,18,0.2);border-radius:7px;overflow:hidden;margin-bottom:14px;display:inline-block;min-width:320px;max-width:100%}
.annexe-block-title{background:#4E1F12;color:#C95B2A;font-size:12px;font-weight:700;padding:7px 12px;letter-spacing:.02em}
.annexe-block-meta{background:#EDE7DC;font-size:11px;padding:5px 12px;color:rgba(26,22,18,.65)}
.annexe-table{border-collapse:collapse;font-size:13px;width:100%}
.annexe-table th{background:#3a1509;color:#F5F0E8;padding:6px 14px;text-align:right;font-weight:500;white-space:nowrap}
.annexe-table th:first-child,th.col-an{text-align:left}
.annexe-table td{padding:6px 14px;text-align:right;border-bottom:.5px solid rgba(26,22,18,.07);vertical-align:middle}
.annexe-table td:first-child{text-align:left;font-weight:600}
.annexe-table tr:nth-child(even){background:rgba(201,91,42,.04)}
.annexe-wrapper{display:flex;flex-wrap:wrap;gap:14px}
@media print{body{padding:0}header{border-radius:0}}
</style></head><body>
<header>
  <div><div style="display:flex"><span class="lt">tout</span><span class="ll">lmnp</span></div><div class="ls">Simulateur de rentabilité</div></div>
  <div style="margin-left:auto;font-size:10px;opacity:.6">Généré le ${new Date().toLocaleDateString("fr-FR")}</div>
</header>

<h2>Récapitulatif</h2>
<div class="recap-prestep">
  ${form.villeLabel ? `<div class="kvi"><div class="kvl">Ville</div><div class="kvv">${form.villeLabel}</div></div>` : ""}
  ${form.surface ? `<div class="kvi"><div class="kvl">Surface</div><div class="kvv">${form.surface} m²</div></div>` : ""}
  <div class="kvi"><div class="kvl">Type de bien</div><div class="kvv">${form.type === "ap" ? "Appartement" : "Maison"}</div></div>
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
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer mensuel</div><div class="kvv orange">${fEur(loyerAnnuel / 12)}/mois</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer annuel</div><div class="kvv orange">${fEur(loyerAnnuel)}/an</div></div>
    <div class="kvi"><div class="kvl">Charges annuelles</div><div class="kvv">${fEur(chargesAnnuelles)}</div></div>
  </div>
  <div class="recap-col" style="background:#EDE7DC">
    <div class="kvl" style="margin-bottom:6px;font-weight:700">Financement</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Apport personnel</div><div class="kvv">${fEur(apport)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Montant du crédit</div><div class="kvv">${fEur(montantCredit)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Taux · Durée</div><div class="kvv">${form.taux} % · ${duree} ans</div></div>
    <div class="kvi"><div class="kvl">Frais de notaire</div><div class="kvv">${fEur(notaire)}</div></div>
  </div>
</div>

<h2>Comparaison régimes fiscaux (année 1)</h2>
<table><thead><tr><th>Indicateur</th><th>Régime réel simplifié</th><th>Micro-BIC 2025</th></tr></thead><tbody>
<tr><td>Loyers annuels</td><td>${fEur(loyerAnnuel)}</td><td>${fEur(loyerAnnuel)}</td></tr>
<tr><td>Charges déductibles</td><td>${fEur(rows[0]?.chargesDeductibles ?? 0)}</td><td>Abattement 30 %</td></tr>
<tr><td>Amortissements</td><td>${fEur(rows[0]?.amortTotalA ?? 0)}</td><td>—</td></tr>
<tr><td>Base imposable</td><td style="font-weight:600;color:${(rows[0]?.baseImposable ?? 0) === 0 ? "#1A7A52" : "#B03A2A"}">${fEur(rows[0]?.baseImposable ?? 0)}</td><td>${fEur(baseBIC)}</td></tr>
<tr><td>Impôt estimé</td><td style="font-weight:600">${fEur(rows[0]?.impot ?? 0)}</td><td>${fEur(impotBIC)}</td></tr>
<tr><td>Cash-flow mensuel</td><td style="color:${(rows[0]?.cashflow ?? 0) >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEur(rows[0]?.cashflow ?? 0)}/mois</td><td style="color:${resultats.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fEur(resultats.cashflowBICMensuel)}/mois</td></tr>
</tbody></table>

<div class="fiscal-note">
  <p><strong>Comment est calculé votre impôt ?</strong></p>
  <p><strong>TMI</strong> (Tranche Marginale d'Imposition) : taux appliqué à votre dernière tranche de revenus, ici <strong>${tmi} %</strong>.</p>
  <p><strong>PS</strong> (Prélèvements Sociaux) : <strong>18,6 %</strong> depuis la loi de financement de la sécurité sociale 2026 (contre 17,2 % auparavant), prélevés sur les revenus du patrimoine. Le LMNP paie uniquement ces prélèvements sans ouvrir de droits sociaux.</p>
  <p>Impôt total = base imposable × (TMI + PS) = base × <strong>${(tmi + 18.6).toFixed(1)} %</strong>.</p>
</div>

<h2>Tableau annuel — Régime réel (${totalYears} ans)</h2>
<p style="font-size:11px;color:rgba(26,22,18,.5);margin-bottom:6px">Projection en régime réel simplifié avec loyers et charges constants. L'amortissement évolue chaque année. La ligne marquée indique la fin du crédit.</p>
<table><thead><tr>
  <th class="col-an">An</th>
  <th class="cc">Capital restant</th><th class="cc">Annuités</th><th class="cc-last">dont intérêts</th>
  <th>Charges</th><th>Résultat av. amort.</th><th>Amortissement</th>
  <th>Base imposable</th><th>Impôt</th><th>Cash-flow/mois</th>
</tr></thead><tbody>${tableRows}</tbody></table>
<div class="conclusion">✓ ${conclusionText}</div>
<div class="note" style="margin-top:12px"><strong>Micro-BIC 2025 :</strong> ${microbicNote}</div>

<h2 style="margin-top:24px">Annexe — Détail de l'amortissement par catégorie</h2>
<div class="note" style="margin-bottom:12px">${modeDesc}</div>
<div class="annexe-wrapper">${annexeBlocks}</div>
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

          {/* Type de bien */}
          <div className="mb-6">
            <div className={LABEL}>Type de bien</div>
            <div className="flex rounded-md overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.12)", width: "fit-content" }}>
              {(["ap", "ma"] as TypeBien[]).map(t => (
                <button key={t} onClick={() => updateField("type", t)}
                  className="px-5 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: form.type === t ? "#1A1612" : "#F5F0E8",
                    color: form.type === t ? "#F5F0E8" : "rgba(26,22,18,0.55)",
                  }}>
                  {t === "ap" ? "Appartement" : "Maison"}
                </button>
              ))}
            </div>
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

              <div>
                <label className={LABEL}>Taux d&apos;intérêt annuel (%)</label>
                <input type="number" step="0.1" value={form.taux}
                  onChange={e => updateField("taux", e.target.value)}
                  onBlur={() => handleBlur("taux")}
                  placeholder="3.5" className={INPUT} style={INPUT_STYLE} />
              </div>
            </div>

            {/* ── RIGHT : Localisation & Loyer ── */}
            <div className="space-y-4">
              <p className={LABEL} style={{ opacity: 1, color: "#1A1612" }}>Localisation &amp; Loyer</p>

              {/* Ville autocomplete */}
              <div>
                <label className={LABEL}>Ville</label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={villeSearch}
                    onChange={e => {
                      setVilleSearch(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) {
                        updateField("villeKey", "");
                        updateField("villeLabel", "");
                      }
                    }}
                    onFocus={() => villeSearch.length >= 1 && setShowDropdown(true)}
                    placeholder="Tapez une ville..."
                    className={INPUT} style={INPUT_STYLE}
                  />
                  {showDropdown && filteredVilles.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 rounded-md shadow-lg overflow-hidden"
                      style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)" }}>
                      {filteredVilles.map(v => (
                        <button key={v.key}
                          className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors"
                          style={{ color: "#1A1612" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#EDE7DC")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          onMouseDown={() => {
                            setVilleSearch(v.label);
                            updateField("villeKey", v.key);
                            updateField("villeLabel", v.label);
                            setShowDropdown(false);
                          }}>
                          {v.label}
                          {v.hasData && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide"
                              style={{ color: "#C95B2A" }}>données officielles</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {form.villeKey && villeData && (
                  <p className="mt-1 text-[11px]" style={{ color: "rgba(26,22,18,0.40)" }}>
                    Source : Observatoire des loyers · data.gouv.fr
                  </p>
                )}
              </div>

              {/* Surface */}
              <div>
                <label className={LABEL}>Surface (m²)</label>
                <input type="number" value={form.surface}
                  onChange={e => updateField("surface", e.target.value)}
                  onBlur={() => handleBlur("surface")}
                  placeholder="45" className={INPUT} style={INPUT_STYLE} />
              </div>

              {/* Fourchette loyers */}
              {showFourchette && (
                <div className="rounded-md p-3" style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.08)" }}>
                  <p className={LABEL} style={{ marginBottom: 8 }}>Fourchette de loyer estimée</p>
                  <div className="flex gap-2">
                    {[
                      { label: "Bas", val: loyerBas },
                      { label: "Médian", val: loyerMoyen },
                      { label: "Haut", val: loyerHaut },
                    ].map(({ label, val }) => (
                      <button key={label}
                        onClick={() => {
                          updateField("loyer", Math.round(val).toString());
                          setLoyerSlider(Math.round(val));
                        }}
                        className="flex-1 rounded py-2 text-center transition-opacity hover:opacity-80"
                        style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
                        <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "rgba(26,22,18,0.4)" }}>{label}</div>
                        <div className="text-sm font-medium" style={{ color: "#C95B2A" }}>{formatEuro(Math.round(val))}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seloger message */}
              {form.villeKey && !villeData && (
                <div className="rounded-md p-3 text-[12px]"
                  style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.08)", color: "rgba(26,22,18,0.55)" }}>
                  <a href="https://www.seloger.com" target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: "#C95B2A" }}>
                    Consultez Seloger.com
                  </a>
                  {" "}— section Location, filtrez par surface et nombre de pièces similaires pour estimer le loyer de marché.
                </div>
              )}

              {/* Loyer mensuel */}
              <div>
                <label className={LABEL}>Loyer mensuel (€)</label>
                <input type="number" value={form.loyer}
                  onChange={e => {
                    updateField("loyer", e.target.value);
                    setLoyerSlider(parseFloat(e.target.value) || 0);
                  }}
                  onBlur={() => handleBlur("loyer")}
                  placeholder="Ex : 1 200" className={INPUT} style={INPUT_STYLE} />
              </div>

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
            </div>
          </div>
        </div>

        {/* ─── BOUTON SIMULER ─── */}
        <div className="text-center mb-10">
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
              <div className="space-y-5">
                {/* Verdict */}
                {verdict && (
                  <div className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: verdict.bg, color: "#F5F0E8" }}>
                    <span className="text-2xl font-bold">{verdict.icon}</span>
                    <div>
                      <div className="font-medium text-lg">{verdict.label}</div>
                      <div className="text-sm" style={{ opacity: 0.85 }}>
                        Rendement net {formatPct(resultats.rendementNet)} · Cash-flow {formatEuro(resultats.cashflowReelMensuel)}/mois (régime réel)
                      </div>
                    </div>
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Rendement brut", val: formatPct(resultats.rendementBrut), sub: "loyers / investissement" },
                    { label: "Rendement net", val: formatPct(resultats.rendementNet), sub: "après charges" },
                    { label: "Impôt estimé annuel", val: formatEuro(resultats.impotReel), sub: `TMI ${form.tmi}% + PS 18,6% (LFSS 2026)` },
                    { label: "Impôt estimé mensuel", val: formatEuro(resultats.impotReelMensuel), sub: "annuel ÷ 12" },
                    {
                      label: "Cash-flow mensuel",
                      val: formatEuro(resultats.cashflowReelMensuel),
                      sub: "net régime réel",
                      positive: resultats.cashflowReelMensuel >= 0,
                    },
                  ].map(({ label, val, sub, positive }) => (
                    <div key={label} className="rounded-xl p-4" style={cardStyle}>
                      <div className={LABEL}>{label}</div>
                      <div className="text-xl font-light mt-1" style={{
                        color: positive !== undefined
                          ? (positive ? "#1A7A52" : "#B03A2A")
                          : "#1A1612",
                        letterSpacing: "-0.02em",
                      }}>{val}</div>
                      <div className="text-[11px] mt-1" style={{ color: "rgba(26,22,18,0.40)" }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Loyer slider */}
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
                            const r = computeResultats(form, v, amortPct, amortMode, amortDureeEnsemble, composants);
                            setResultats(r);
                          }
                        }}
                        className="w-24 text-right text-xl font-semibold rounded-md px-2 py-1 focus:outline-none [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        style={{ color: "#1A1612", background: "#C95B2A", border: "none" }}
                      />
                      <span className="text-base font-medium" style={{ color: "#C95B2A" }}>/mois</span>
                    </div>
                  </div>
                  <input type="range"
                    min={sliderMin} max={sliderMax} step={25}
                    value={loyerSlider || parseFloat(form.loyer) || 500}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      setLoyerSlider(v);
                      updateField("loyer", v.toString());
                      if (showResults) {
                        const r = computeResultats(form, v, amortPct, amortMode, amortDureeEnsemble, composants);
                        setResultats(r);
                      }
                    }}
                    className="w-full" />
                  <div className="flex justify-between text-[11px] mt-1" style={{ color: "rgba(26,22,18,0.40)" }}>
                    <span>Bas marché</span>
                    <span>Haut marché</span>
                  </div>
                </div>

                {/* Comparaison régimes */}
                <div className="rounded-xl p-5" style={cardStyle}>
                  <h3 className="font-medium text-[#1A1612] mb-4">Comparaison des régimes fiscaux</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        regime: "Régime réel simplifié",
                        badge: "Recommandé",
                        loyers: resultats.loyerAnnuel,
                        creditAnnuel: resultats.creditAnnuel,
                        charges: resultats.chargesDeductibles,
                        amort: resultats.amortTotal,
                        base: resultats.baseImposableReel,
                        impot: resultats.impotReel,
                        cf: resultats.cashflowReelMensuel,
                        highlight: true,
                      },
                      {
                        regime: "Micro-BIC 2025",
                        badge: "Abattement 30%",
                        loyers: resultats.loyerAnnuel,
                        creditAnnuel: resultats.creditAnnuel,
                        charges: null,
                        amort: null,
                        base: resultats.baseBIC,
                        impot: resultats.impotBIC,
                        cf: resultats.cashflowBICMensuel,
                        highlight: false,
                      },
                    ].map(r => (
                      <div key={r.regime} className="rounded-lg p-4"
                        style={{
                          background: r.highlight ? "rgba(201,91,42,0.06)" : "#F5F0E8",
                          border: r.highlight ? "0.5px solid rgba(201,91,42,0.2)" : "0.5px solid rgba(26,22,18,0.08)",
                        }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium" style={{ color: "#1A1612" }}>{r.regime}</div>
                          <span className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                            style={{
                              background: r.highlight ? "#C95B2A" : "rgba(26,22,18,0.08)",
                              color: r.highlight ? "#F5F0E8" : "rgba(26,22,18,0.5)",
                            }}>
                            {r.badge}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(26,22,18,0.5)" }}>Loyers annuels</span>
                            <span className="font-medium">{formatEuro(r.loyers)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(26,22,18,0.5)" }}>Emprunt</span>
                            <span style={{ color: "#B03A2A" }}>−{formatEuro(r.creditAnnuel)}</span>
                          </div>
                          {r.highlight && (
                            <div className="flex justify-between pl-3" style={{ color: "rgba(26,22,18,0.45)" }}>
                              <span>Dont frais d&apos;emprunt</span>
                              <span>{formatEuro(resultats.interetsAnnee1)}</span>
                            </div>
                          )}
                          {r.charges !== null && (
                            <div className="flex justify-between">
                              <span style={{ color: "rgba(26,22,18,0.5)" }}>Charges déductibles</span>
                              <span style={{ color: "#B03A2A" }}>−{formatEuro(r.charges)}</span>
                            </div>
                          )}
                          {r.highlight && (
                            <div className="flex justify-between pt-1.5" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
                              <span style={{ color: "rgba(26,22,18,0.5)" }}>Résultat avant amortissement</span>
                              <span className="font-medium" style={{ color: resultats.resultatAvantAmort >= 0 ? "#1A1612" : "#B03A2A" }}>
                                {formatEuro(resultats.resultatAvantAmort)}
                              </span>
                            </div>
                          )}
                          {r.amort !== null && (
                            <div className="flex justify-between">
                              <span style={{ color: "rgba(26,22,18,0.5)" }}>Amortissements (Bien, travaux, mobilier, frais de notaire)</span>
                              <span style={{ color: "#B03A2A" }}>−{formatEuro(r.amort)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1.5" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
                            <span style={{ color: "rgba(26,22,18,0.5)" }}>Base imposable</span>
                            <span className="font-medium">{formatEuro(r.base)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(26,22,18,0.5)" }}>Impôt estimé</span>
                            <span style={{ color: "#B03A2A" }}>{formatEuro(r.impot)}</span>
                          </div>
                          {r.highlight && (
                            <div className="flex justify-between">
                              <span style={{ color: "rgba(26,22,18,0.5)" }}>Amortissement à reporter N+1</span>
                              <span style={{ color: "#B08A2A" }}>{formatEuro(resultats.amortAReporter)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1.5 font-medium" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
                            <span>Cash-flow mensuel</span>
                            <span style={{ color: r.cf >= 0 ? "#1A7A52" : "#B03A2A" }}>{formatEuro(r.cf)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-lg text-[13px]"
                    style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.08)", color: "rgba(26,22,18,0.65)", lineHeight: 1.6 }}>
                    Si vous avez un emprunt et des charges, nous conseillons le Régime Réel au Régime Micro-BIC, qui permet un amortissement partiel du bien, des charges déductibles, et donc un résultat au bilan comptable nul qui réduit la base imposable.{" "}
                    <Link href="/comment-ca-marche"
                      className="inline-flex items-center gap-1 font-medium underline"
                      style={{ color: "#C95B2A" }}>
                      En savoir plus → Grandes Lignes du LMNP
                    </Link>
                  </div>
                </div>

                {/* Amortissement */}
                <div className="rounded-xl overflow-hidden" style={cardStyle}>
                  <button onClick={() => setShowAmort(!showAmort)}
                    className="w-full flex justify-between items-center p-5 text-left transition-all hover:opacity-95"
                    style={{ background: "linear-gradient(90deg, #4E1F12 0%, rgba(201,91,42,0.85) 100%)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: "rgba(245,240,232,0.18)", color: "#F5F0E8" }}>⚙</div>
                      <div>
                        <div className="font-bold text-base"
                          style={{ color: "#F5F0E8", letterSpacing: "-0.01em" }}>Amortissement LMNP</div>
                        <div className="text-[13px] mt-0.5 font-medium" style={{ color: "rgba(245,240,232,0.75)" }}>
                          Configurez vos durées · Optimisez votre impôt
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium px-4 py-2 rounded-lg hidden sm:inline-block"
                        style={{ background: "#EDE7DC", color: "#C95B2A" }}>
                        {showAmort ? "Réduire" : "Configurer →"}
                      </span>
                      <span style={{ color: "#F5F0E8", fontSize: 14, fontWeight: 700 }}>{showAmort ? "▲" : "▼"}</span>
                    </div>
                  </button>
                  {showAmort && (
                    <div className="px-5 pb-5 space-y-4" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>

                      {/* OBJECTIF */}
                      <div className="rounded-lg p-4 mt-4" style={{ background: "rgba(201,91,42,0.08)", border: "1px solid rgba(201,91,42,0.25)" }}>
                        <div className="font-bold text-sm mb-2 uppercase tracking-wide" style={{ color: "#C95B2A" }}>OBJECTIF : Payer 0 € d&apos;impôt</div>
                        <p className="text-[13px]" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.7 }}>
                          L&apos;objectif est clair ici : ajuste ton amortissement pour obtenir chaque année un bilan comptable neutre grâce à un amortissement supérieur ou égal à ton résultat. Une base imposable nulle = 0 € d&apos;impôt.
                        </p>
                        <p className="text-[13px] mt-2" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.7 }}>
                          Joue avec les durées d&apos;amortissement, quitte à les raccourcir. Il vaut mieux avoir un excédent d&apos;amortissement au début car il est toujours reportable à N+1.
                        </p>
                      </div>

                      {/* Toggle mode — centré avec label */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(26,22,18,0.5)" }}>Choisir :</div>
                        <div className="flex rounded-md overflow-hidden" style={{ border: "0.5px solid #4E1F12" }}>
                          {(["ensemble", "composant"] as const).map(mode => (
                            <button key={mode} onClick={() => setAmortMode(mode)}
                              className="px-5 py-2.5 text-sm font-semibold transition-colors"
                              style={{
                                background: amortMode === mode ? "#4E1F12" : "#EDE7DC",
                                color: amortMode === mode ? "#C95B2A" : "rgba(26,22,18,0.5)",
                              }}>
                              {mode === "ensemble" ? "Amortissement Global" : "Amortissement par composant"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bien immobilier — commun aux deux modes */}
                      {(() => {
                        const prixVal = parseFloat(form.prix) || 0;
                        const valAmort = prixVal * amortPct / 100;
                        return (
                          <div className="space-y-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#1A1612" }}>Bien immobilier</div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="rounded-lg p-3" style={{ background: "#F5F0E8" }}>
                                <div className={LABEL}>Valeur du bien</div>
                                <div className="font-semibold text-sm" style={{ color: "#1A1612" }}>{formatEuro(prixVal)}</div>
                              </div>
                              <div className="rounded-lg p-3" style={{ background: "#F5F0E8" }}>
                                <div className={LABEL}>% amortissable</div>
                                <div className="flex items-center gap-1.5">
                                  <input type="number" min={0} max={100} value={amortPct}
                                    onChange={e => setAmortPct(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                    className="w-14 px-2 py-1.5 text-sm rounded-md text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
                                    style={INPUT_STYLE} />
                                  <span className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>%</span>
                                </div>
                              </div>
                              <div className="rounded-lg p-3" style={{ background: "rgba(201,91,42,0.06)", border: "0.5px solid rgba(201,91,42,0.2)" }}>
                                <div className={LABEL}>Valeur amortissable</div>
                                <div className="font-bold text-sm" style={{ color: "#C95B2A" }}>{formatEuro(valAmort)}</div>
                                <div className="text-[10px] mt-1" style={{ color: "rgba(26,22,18,0.4)" }}>
                                  Terrain (non amortissable) : {formatEuro(prixVal * (1 - amortPct / 100))}
                                </div>
                              </div>
                            </div>

                            {/* Mode Global */}
                            {amortMode === "ensemble" && (
                              <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg p-3" style={{ background: "#F5F0E8" }}>
                                  <div className={LABEL}>Valeur amortissable</div>
                                  <div className="text-sm font-semibold" style={{ color: "#1A1612" }}>{formatEuro(valAmort)}</div>
                                </div>
                                <div className="rounded-lg p-3" style={{ background: "#F5F0E8" }}>
                                  <div className={LABEL}>Durée (années)</div>
                                  <input type="number" min={1} max={50} value={amortDureeEnsemble}
                                    onChange={e => setAmortDureeEnsemble(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 px-2 py-1.5 text-sm rounded-md text-[#1A1612] focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
                                    style={INPUT_STYLE} />
                                </div>
                                <div className="rounded-lg p-3" style={{ background: "rgba(201,91,42,0.08)", border: "0.5px solid rgba(201,91,42,0.2)" }}>
                                  <div className={LABEL}>Amort. 1ère Année</div>
                                  <div className="text-sm font-bold" style={{ color: "#C95B2A" }}>
                                    {formatEuro(amortDureeEnsemble > 0 ? valAmort / amortDureeEnsemble : 0)}/an
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Mode Par composant */}
                            {amortMode === "composant" && (() => {
                              const totalPct = composants.reduce((s, c) => s + c.pct, 0);
                              return (
                                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(78,31,18,0.2)" }}>
                                  <div className="grid gap-x-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider"
                                    style={{ gridTemplateColumns: "2fr 1fr 0.7fr 1fr", background: "#4E1F12", color: "rgba(245,240,232,0.7)" }}>
                                    <span>Composant</span>
                                    <span>% · Valeur €</span>
                                    <span>Durée</span>
                                    <span style={{ color: "#C95B2A" }}>Amort 1ère Année</span>
                                  </div>
                                  {composants.map((c, i) => {
                                    const val = valAmort * c.pct / 100;
                                    return (
                                      <div key={c.label} className="grid gap-x-3 items-center px-3 py-2.5"
                                        style={{ gridTemplateColumns: "2fr 1fr 0.7fr 1fr", background: i % 2 === 0 ? "#F5F0E8" : "#EDE7DC", borderBottom: "0.5px solid rgba(26,22,18,0.06)" }}>
                                        <span className="text-xs font-semibold" style={{ color: "#1A1612" }}>{c.label}</span>
                                        <div className="flex items-center gap-1">
                                          <input type="number" min={0} max={100} value={c.pct}
                                            onChange={e => {
                                              const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                              setComposants(prev => prev.map((x, j) => j === i ? { ...x, pct: v } : x));
                                            }}
                                            className="w-12 px-2 py-1 text-xs rounded text-center focus:outline-none focus:ring-1 focus:ring-[#C95B2A] [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                            style={INPUT_STYLE} />
                                          <span className="text-xs font-medium" style={{ color: "#C95B2A" }}>{formatEuro(val)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <input type="number" min={1} max={50} value={c.duree}
                                            onChange={e => {
                                              const v = Math.max(1, parseInt(e.target.value) || 1);
                                              setComposants(prev => prev.map((x, j) => j === i ? { ...x, duree: v } : x));
                                            }}
                                            className="w-14 px-2 py-1 text-xs rounded text-center focus:outline-none focus:ring-1 focus:ring-[#C95B2A] [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                            style={INPUT_STYLE} />
                                          <span className="text-[10px]" style={{ color: "rgba(26,22,18,0.4)" }}>ans</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: "#C95B2A" }}>
                                          {formatEuro(c.duree > 0 ? val / c.duree : 0)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div className="grid gap-x-3 items-center px-3 py-2.5 font-bold"
                                    style={{ gridTemplateColumns: "2fr 1fr 0.7fr 1fr", background: "#4E1F12" }}>
                                    <span className="text-xs" style={{ color: "#F5F0E8" }}>Total</span>
                                    <span className="text-xs" style={{ color: totalPct === 100 ? "#6FCF97" : "#EB5757" }}>
                                      {totalPct}%{totalPct !== 100 && " ⚠"}
                                    </span>
                                    <span />
                                    <span className="text-sm" style={{ color: "#C95B2A" }}>
                                      {formatEuro(composants.reduce((s, c) => s + (valAmort * c.pct / 100) / (c.duree || 1), 0))}/an
                                    </span>
                                  </div>
                                  {totalPct !== 100 && (
                                    <p className="px-3 py-1.5 text-[11px]" style={{ color: "#B03A2A", background: "rgba(176,58,42,0.05)" }}>
                                      Les % doivent totaliser 100 % pour couvrir toute la valeur amortissable.
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
                          { label: "Bien", val: amortBienDisplay, sub: amortMode === "ensemble" ? `${amortPct}% prix · ${amortDureeEnsemble} ans` : `${amortPct}% · composants` },
                          { label: "Mobilier", val: amortMobilierDisplay, sub: "mobilier · 7 ans" },
                          { label: "Travaux", val: amortTravauxDisplay, sub: "travaux · 15 ans" },
                          { label: "Notaire", val: amortNotaireDisplay, sub: "notaire · 20 ans" },
                          { label: "Total", val: amortTotalDisplay, sub: "Déductible/an", accent: true },
                        ].map(({ label, val, sub, accent }) => (
                          <div key={label} className="rounded-lg p-3 text-center"
                            style={{ background: accent ? "rgba(201,91,42,0.1)" : "#F5F0E8", border: accent ? "1px solid rgba(201,91,42,0.25)" : "0.5px solid rgba(26,22,18,0.08)" }}>
                            <div className="text-[10px] uppercase tracking-[0.1em] mb-1"
                              style={{ color: accent ? "#C95B2A" : "rgba(26,22,18,0.4)" }}>{label}</div>
                            <div className="font-bold text-sm"
                              style={{ color: accent ? "#C95B2A" : "#1A1612" }}>{formatEuro(val)}/an</div>
                            <div className="text-[10px] mt-0.5" style={{ color: "rgba(26,22,18,0.35)" }}>{sub}</div>
                          </div>
                        ))}
                      </div>

                      {/* Boutons PDF + Ajuster */}
                      <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={handleGeneratePDF}
                          className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                          style={{ background: "#4E1F12", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.3)", letterSpacing: "0.02em" }}>
                          Générer l&apos;amortissement PDF
                        </button>
                        <button onClick={handleAjuster}
                          className="px-10 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-lg"
                          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", letterSpacing: "0.02em" }}>
                          Ajuster Simulation →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

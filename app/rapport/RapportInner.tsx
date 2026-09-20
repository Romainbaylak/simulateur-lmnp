"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import MobileHeader from "@/components/MobileHeader";
import HeaderAuth from "@/components/HeaderAuth";
import {
  computeResultats,
  computeProjection,
  TAUX_PS_PLUSVALUE,
  TAUX_IR_PLUSVALUE,
  type SimulationData,
  type SimulationForm,
  type Resultats,
} from "@/lib/computeResultats";
import { defaultBienInfo, type BienInfo } from "@/components/PopupBienInfo";
import { usePlan } from "@/components/PlanBadge";
import PopupPaiementUnite from "@/components/PopupPaiementUnite";
import PopupPDFStarter from "@/components/PopupPDFStarter";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export default function RapportInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "ready" | "done" | "expired" | "used">("loading");
  const [form, setForm] = useState<SimulationForm | null>(null);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [initialBienInfo, setInitialBienInfo] = useState<BienInfo>(defaultBienInfo);
  const [bienType, setBienType] = useState<"ap" | "ma" | "im">("ap");
  const [bienVille, setBienVille] = useState("");
  const [bienSurface, setBienSurface] = useState("");
  const [bienPieces, setBienPieces] = useState("");
  const [bienDescription, setBienDescription] = useState("");

  const amortPctRef = useRef(85);
  const amortModeRef = useRef<"ensemble" | "composant">("ensemble");
  const amortDureeEnsembleRef = useRef(25);
  const amortDureeMobilierRef = useRef(7);
  const amortDureeTravauxRef = useRef(15);
  const amortDureeNotaireRef = useRef(20);
  const composantsRef = useRef([
    { label: "Gros œuvre", pct: 40, duree: 50 },
    { label: "Toiture", pct: 10, duree: 25 },
    { label: "Façade", pct: 10, duree: 20 },
    { label: "Électricité / plomberie", pct: 15, duree: 15 },
    { label: "Menuiseries", pct: 10, duree: 20 },
    { label: "Agencement intérieur", pct: 15, duree: 12 },
  ]);
  const isSaisonnierRef = useRef(false);
  const prixNuiteeRef = useRef("");
  const tauxOccBasRef = useRef("20");
  const tauxOccMoyenRef = useRef("35");
  const tauxOccHautRef = useRef("45");
  const resultatsTripleRef = useRef<{ bas: Resultats | null; moyen: Resultats | null; haut: Resultats | null } | null>(null);
  const selectedRegimeRef = useRef<"micro" | "reel" | null>(null);

  const { plan: currentPlan } = usePlan();
  // Les trois rapports détaillés restent réservés aux abonnés ; la page, elle,
  // est désormais accessible à tout le monde.
  const estAbonne = currentPlan === "starter" || currentPlan === "pro" || currentPlan === "rapport";
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [showPDFStarter, setShowPDFStarter] = useState(false);
  const [pdfWeekCount, setPdfWeekCount] = useState(0);
  const [pendingPdf, setPendingPdf] = useState<"synthese-pdf" | "banque-pdf" | "resume-pdf" | null>(null);

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

      amortPctRef.current = data.amortPct;
      amortModeRef.current = data.amortMode;
      amortDureeEnsembleRef.current = data.amortDureeEnsemble;
      if (data.amortDureeMobilier) amortDureeMobilierRef.current = data.amortDureeMobilier;
      if (data.amortDureeTravaux) amortDureeTravauxRef.current = data.amortDureeTravaux;
      if (data.amortDureeNotaire) amortDureeNotaireRef.current = data.amortDureeNotaire;
      if (data.composants?.length) composantsRef.current = data.composants;
      if (data.isSaisonnier) {
        isSaisonnierRef.current = true;
        if (data.prixNuitee) prixNuiteeRef.current = data.prixNuitee;
        if (data.tauxOccBas) tauxOccBasRef.current = data.tauxOccBas;
        if (data.tauxOccMoyen) tauxOccMoyenRef.current = data.tauxOccMoyen;
        if (data.tauxOccHaut) tauxOccHautRef.current = data.tauxOccHaut;
        if (data.resultatsTriple) resultatsTripleRef.current = data.resultatsTriple;
      }
      if (data.selectedRegime) selectedRegimeRef.current = data.selectedRegime;

      // For saisonnier, use stored resultatsTriple.moyen directly (form.loyer is cleared)
      let res: Resultats | null = null;
      if (data.isSaisonnier && data.resultatsTriple?.moyen) {
        res = data.resultatsTriple.moyen;
      } else {
        const loyer = parseFloat(data.form.loyer) || 0;
        res = computeResultats(data.form, loyer, data.amortPct, data.amortMode, data.amortDureeEnsemble, composantsRef.current,
          false, amortDureeMobilierRef.current, amortDureeTravauxRef.current, amortDureeNotaireRef.current);
      }
      setForm(data.form);
      setResultats(res);
      const bienInit: BienInfo = {
        type: data.form.type === "ma" ? "ma" : "ap",
        ville: data.form.villeLabel || "",
        surface: data.form.surface || "",
        pieces: "",
        description: "",
      };
      setInitialBienInfo(bienInit);
      setBienType(bienInit.type);
      setBienVille(bienInit.ville);
      setBienSurface(bienInit.surface);
      sessionStorage.setItem(usedKey, "1");
      sessionStorage.removeItem("lmnp_simulation_data");
      setStatus("done");
    } catch { setStatus("expired"); }
  }, [sessionId, router]);


  // ─── SYNTHÈSE D'INVESTISSEMENT — RAPPORT COMPLET ────────────────────────────
  const buildPdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const amortDureeMobilier = amortDureeMobilierRef.current;
    const amortDureeTravaux = amortDureeTravauxRef.current;
    const amortDureeNotaire = amortDureeNotaireRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
    const selectedRegime = selectedRegimeRef.current;
    const isMicro = selectedRegime === "micro";
    // Abattement micro-BIC : 30 % pour un meublé de tourisme non classé, 50 % sinon
    const abattPct = isSaisonnier ? 0.30 : 0.50;
    const abattLabel = isSaisonnier ? "30 %" : "50 %";

    /* ── Mise en forme ──────────────────────────────────────────────────────── */
    const fE = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
    const fE2 = (v: number) => Math.abs(v - Math.round(v)) < 0.005
      ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)
      : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
    const fN = (v: number) => Math.round(v).toLocaleString("fr-FR");
    const fP = (v: number, d = 2) => v.toFixed(d).replace(".", ",") + " %";
    // pourcentage « propre » : pas de décimales quand la valeur est entière
    const fPc = (v: number, d = 2) => (Math.abs(v - Math.round(v)) < 0.005 ? String(Math.round(v)) : v.toFixed(d).replace(".", ",")) + " %";
    const sE = (v: number) => (v >= 0 ? "+" : "−") + fE(Math.abs(v));
    const col = (v: number) => v >= 0 ? "#1A6644" : "#B03A2A";

    /* ── Données saisies ────────────────────────────────────────────────────── */
    const prix = parseFloat(f.prix) || 0;
    const travaux = parseFloat(f.travaux) || 0;
    const notaire = parseFloat(f.notaire) || 0;
    const mobilier = parseFloat(f.mobilier) || 0;
    const apport = parseFloat(f.apport) || 0;
    const taux = parseFloat(f.taux) / 100 || 0;
    const duree = f.duree;
    const tmi = f.tmi;
    const tauxGlobal = tmi / 100 + 0.186;

    const investTotal = res.investTotal;
    const montantCredit = res.montantCredit;
    const mensualite = res.mensualite;                       // hors assurance
    const creditAnnuel = res.creditAnnuel;                   // capital + intérêts
    const interetsAnnee1 = res.interetsAnnee1;
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;
    const loyerAnnuel = res.loyerAnnuel;
    const loyerMensuel = loyerAnnuel / 12;
    const chargesLocatairesAnnuel = (parseFloat(f.chargesLoyer) || 0) * 12;
    const recettesAnnuelles = loyerAnnuel + chargesLocatairesAnnuel;

    const taxeFonciere = parseFloat(f.taxeFonciere) || 0;
    const chargesCopro = parseFloat(f.chargesCopro) || 0;
    const pnoEur = loyerAnnuel * (parseFloat(f.assurancePNO) || 0) / 100;
    const gestionEur = loyerAnnuel * (parseFloat(f.gestionLocativePct) || 0) / 100;
    const entretien = parseFloat(f.entretienCourant) || 0;
    const compta = parseFloat(f.comptabilite) || 0;

    /* ── Amortissement : bases et durées ────────────────────────────────────── */
    const valeurAmortissable = prix * amortPct / 100;
    const terrainVal = prix - valeurAmortissable;
    const amortCols: { label: string; base: number; duree: number; annuel: number }[] = [];
    if (amortMode === "ensemble") {
      if (valeurAmortissable > 0 && amortDureeEnsemble > 0)
        amortCols.push({ label: "Bien immobilier", base: valeurAmortissable, duree: amortDureeEnsemble, annuel: valeurAmortissable / amortDureeEnsemble });
    } else {
      for (const c of composants) {
        const base = valeurAmortissable * c.pct / 100;
        if (base > 0 && c.duree > 0) amortCols.push({ label: c.label, base, duree: c.duree, annuel: base / c.duree });
      }
    }
    if (mobilier > 0 && amortDureeMobilier > 0) amortCols.push({ label: "Mobilier", base: mobilier, duree: amortDureeMobilier, annuel: mobilier / amortDureeMobilier });
    if (travaux > 0 && amortDureeTravaux > 0) amortCols.push({ label: "Travaux", base: travaux, duree: amortDureeTravaux, annuel: travaux / amortDureeTravaux });
    if (notaire > 0 && amortDureeNotaire > 0) amortCols.push({ label: "Frais de notaire", base: notaire, duree: amortDureeNotaire, annuel: notaire / amortDureeNotaire });
    const baseAmortissableTotale = amortCols.reduce((s, c) => s + c.base, 0);
    const amortMaxDuree = amortCols.length ? Math.max(...amortCols.map(c => c.duree)) : 0;

    const amortBienMaxDuree = amortMode === "ensemble"
      ? amortDureeEnsemble
      : (composants.length ? Math.max(...composants.map(c => c.duree)) : 0);
    const HORIZON = Math.max(duree, amortBienMaxDuree, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire, 20) + 5;

    /* ── Projection : moteur unique, partagé par les trois rapports ─────────── */
    const projParams = {
      prix, travaux, mobilier, notaire,
      montantCredit, duree, taux,
      loyerAnnuel, chargesLocatairesAnnuel,
      chargesAnnuelles, assuranceEmprunteurAnnuel,
      tmi, amortPct, amortMode, amortDureeEnsemble, composants,
      amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
      isSaisonnier, horizon: HORIZON,
    };
    const projReel = computeProjection({ ...projParams, isMicro: false });
    const projMicro = computeProjection({ ...projParams, isMicro: true });
    const proj = isMicro ? projMicro : projReel;
    const at = (y: number) => proj[Math.min(Math.max(y, 1), proj.length) - 1];
    const y1 = at(1);

    /* ── Agrégats ───────────────────────────────────────────────────────────── */
    const dureeCredit = Math.max(duree, 1);
    const cumulCf = (p: typeof projReel, n: number) => p.slice(0, n).reduce((s, y) => s + y.cashflowAnnuel, 0);
    const cumulCfReel = cumulCf(projReel, duree);
    const cumulCfMicro = cumulCf(projMicro, duree);
    const cumulCfChoisi = isMicro ? cumulCfMicro : cumulCfReel;
    const apresReelMois = (projReel[duree]?.cashflowMensuel ?? projReel[projReel.length - 1].cashflowMensuel);
    const apresMicroMois = (projMicro[duree]?.cashflowMensuel ?? projMicro[projMicro.length - 1].cashflowMensuel);
    const apresChoisiMois = isMicro ? apresMicroMois : apresReelMois;
    const cumulImpotCredit = proj.slice(0, duree).reduce((s, y) => s + y.impot, 0);
    const ecartImpotAn1 = projMicro[0].impot - projReel[0].impot;      // > 0 : le réel coûte moins cher
    const ecartCumulCf = cumulCfMicro - cumulCfReel;                   // > 0 : le micro laisse plus de trésorerie
    const derniere = proj[proj.length - 1];

    // Financement
    const interetsTotaux = proj.slice(0, duree).reduce((s, y) => s + y.interets, 0);
    const capitalTotal = proj.slice(0, duree).reduce((s, y) => s + y.capitalRembourse, 0);
    const assuranceTotale = assuranceEmprunteurAnnuel * duree;
    const totalHorsAssurance = capitalTotal + interetsTotaux;
    const totalVerse = totalHorsAssurance + assuranceTotale;
    const coutFinancement = interetsTotaux + assuranceTotale;
    const mensualiteAssurance = assuranceEmprunteurAnnuel / 12;
    const sortieMensuelleCredit = mensualite + mensualiteAssurance;

    // Rendements
    const rendBrutPrix = prix > 0 ? (loyerAnnuel / prix) * 100 : 0;
    const rendBrutActe = investTotal > 0 ? (loyerAnnuel / investTotal) * 100 : 0;
    const rendNetCharges = investTotal > 0 ? ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100 : 0;

    // Cash-flow année 1
    const cfMois1 = y1.cashflowMensuel;
    const cfAn1 = y1.cashflowAnnuel;
    const sortiesMois1 = loyerMensuel + chargesLocatairesAnnuel / 12 - cfMois1;
    const chargesMois = chargesAnnuelles / 12;
    const impotMois1 = y1.impot / 12;

    /* ── Plus-value de cession ──────────────────────────────────────────────── */
    const abattIR = (N: number) => N < 6 ? 0 : N >= 22 ? 1 : (N - 5) * 0.06;
    const abattPS = (N: number) => { if (N < 6) return 0; if (N >= 30) return 1; if (N >= 22) return 0.28 + (N - 22) * 0.09; return (N - 5) * 0.0165; };
    const prixRevente = prix;   // hypothèse centrale : valeur maintenue

    interface Vente {
      N: number; prixVente: number; amortReintegre: number; prixFiscal: number;
      pvBrute: number; ir: number; ps: number; dette: number; net: number; forfait: number;
    }
    const calcVente = (N: number, prixVente: number, avecForfait = true): Vente => {
      // art. 150 VB II CGI : forfait travaux de 15 % au-delà de 5 ans de détention
      const forfait = avecForfait && N > 5 ? Math.max(travaux, prix * 0.15) : travaux;
      const baseAcquisition = prix + notaire + forfait;
      const amortReintegre = isMicro ? 0 : (at(N)?.amortImputeCumul ?? 0);
      const prixFiscal = Math.max(0, baseAcquisition - amortReintegre);
      const pvBrute = Math.max(0, prixVente - prixFiscal);
      const ir = pvBrute * (1 - abattIR(N)) * TAUX_IR_PLUSVALUE;
      const ps = pvBrute * (1 - abattPS(N)) * TAUX_PS_PLUSVALUE;
      const dette = N <= duree ? (at(N)?.capitalFin ?? 0) : 0;
      const net = prixVente - ir - ps - dette;
      return { N, prixVente, amortReintegre, prixFiscal, pvBrute, ir, ps, dette, net, forfait };
    };

    const horizonsVente = Array.from(new Set([5, 15, 30].map(n => Math.min(n, HORIZON)))).sort((a, b) => a - b);
    const ventes = horizonsVente.map(n => calcVente(n, prixRevente));
    const venteFinCredit = calcVente(duree, prixRevente);
    const totalProjetFinCredit = cumulCfChoisi + venteFinCredit.net;

    /* ── Scénarios de stress (page 5) ───────────────────────────────────────── */
    const stress = (yr: number, dLoyer: number, dCharges: number) => {
      const row = at(yr);
      const loyers = loyerAnnuel * dLoyer;
      const charges = chargesAnnuelles + dCharges;
      const recettes = loyers + chargesLocatairesAnnuel;
      let impot: number;
      if (isMicro) {
        impot = recettes * (1 - abattPct) * tauxGlobal;
      } else {
        const raa = recettes - charges - row.interets - row.assuranceEmprunteur;
        impot = Math.max(0, raa - row.amortDisponible) * tauxGlobal;
      }
      const cfAn = recettes - charges - row.creditAnnuel - row.assuranceEmprunteur - impot;
      return { cfAn, cfMois: cfAn / 12, impot };
    };
    const anneeStress2 = Math.min(duree, HORIZON);
    const scenarios = [
      { label: "Scénario de départ", dLoyer: 1, dCharges: 0 },
      { label: "Un mois sans loyer", dLoyer: 11 / 12, dCharges: 0 },
      { label: "Loyer réduit de 10 %", dLoyer: 0.9, dCharges: 0 },
      { label: "1 000 € de charges en plus / an", dLoyer: 1, dCharges: 1000 },
      { label: "Deux mois sans loyer<br>+ 2 000 € de charges", dLoyer: 10 / 12, dCharges: 2000 },
    ].map(s => ({ ...s, a1: stress(1, s.dLoyer, s.dCharges), a2: stress(anneeStress2, s.dLoyer, s.dCharges) }));
    const pireA2 = scenarios[scenarios.length - 1].a2;

    /* ── Paliers d'amortissement (page 3) ───────────────────────────────────── */
    const paliers: { de: number; a: number; val: number }[] = [];
    if (!isMicro) {
      for (const y of proj) {
        const v = Math.round(y.amortDotation);
        const last = paliers[paliers.length - 1];
        if (last && last.val === v) last.a = y.year;
        else paliers.push({ de: y.year, a: y.year, val: v });
      }
    }
    const impotFinal = derniere.impot;

    /* ── Saisonnier : les trois estimations, dans les deux régimes ──────────── */
    const triple = resultatsTripleRef.current;
    const prixNuitee = parseFloat(prixNuiteeRef.current) || 0;
    const occ = { bas: parseFloat(tauxOccBasRef.current) || 0, moyen: parseFloat(tauxOccMoyenRef.current) || 0, haut: parseFloat(tauxOccHautRef.current) || 0 };
    const estimations = (["bas", "moyen", "haut"] as const).map(k => ({
      cle: k,
      label: k === "bas" ? "Estimation basse" : k === "moyen" ? "Estimation moyenne" : "Estimation haute",
      occ: occ[k],
      nuits: Math.round(365 * occ[k] / 100),
      r: triple?.[k] ?? null,
    }));

    /* ── Graphiques SVG ─────────────────────────────────────────────────────── */
    const niceScale = (lo: number, hi: number, n: number) => {
      if (hi - lo < 1) hi = lo + 1;
      const raw = (hi - lo) / n;
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const mult = [1, 2, 2.5, 5, 10].find(m => m * mag >= raw) ?? 10;
      const st = mult * mag;
      return { min: Math.floor(lo / st) * st, max: Math.ceil(hi / st) * st };
    };

    // Graphe page 2 : cash-flow mensuel des deux régimes sur crédit + 5 ans
    const makeRegimeChart = (): string => {
      const lastY = Math.min(duree + 5, HORIZON);
      const ptsR = projReel.filter(y => y.year <= lastY);
      const ptsM = projMicro.filter(y => y.year <= lastY);
      const W = 690, H = 210, PL = 62, PR = 18, PT = 34, PB = 26;
      const iW = W - PL - PR, iH = H - PT - PB;
      const all = [...ptsR.map(p => p.cashflowMensuel), ...ptsM.map(p => p.cashflowMensuel)];
      const sc = niceScale(Math.min(0, ...all), Math.max(...all, 1), 4);
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(lastY - 1, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 5 }, (_, i) => {
        const t = i / 4, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.10)" stroke-width="1"/><text x="${PL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(26,22,18,0.5)">${fN(v)}</text>`;
      }).join("");
      const line = (pts: typeof ptsR, color: string) =>
        `<path d="${pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(p.cashflowMensuel).toFixed(1)}`).join(" ")}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
      const xFin = toX(Math.min(duree, lastY));
      const finLine = montantCredit > 0 && duree <= lastY
        ? `<line x1="${xFin.toFixed(1)}" y1="${PT - 12}" x2="${xFin.toFixed(1)}" y2="${PT + iH}" stroke="#C95B2A" stroke-width="1.3" stroke-dasharray="5 3"/><text x="${xFin.toFixed(1)}" y="${PT - 17}" text-anchor="middle" font-size="12" font-weight="700" fill="#C95B2A">Fin du prêt</text>`
        : "";
      const marks = Array.from(new Set([1, 5, 10, 15, 20, 25, lastY].filter(y => y >= 1 && y <= lastY))).sort((a, b) => a - b);
      const xL = marks.map(y => `<text x="${toX(y).toFixed(1)}" y="${PT + iH + 17}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.55)">${y}</text>`).join("");
      return `<div class="graph">
  <div class="graph-lg"><span class="glbl"><i style="background:#1A6644"></i>Régime réel</span><span class="glbl"><i style="background:#C95B2A"></i>Micro-BIC</span></div>
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
    <text x="4" y="${PT - 6}" font-size="12" fill="rgba(26,22,18,0.45)">€/mois</text>
    ${grid}${finLine}${line(ptsR, "#1A6644")}${line(ptsM, "#C95B2A")}${xL}
  </svg></div>`;
    };

    // Graphe page 3 : impôt annuel (courbe) et amortissement (barres), même échelle
    const makeImpotAmortChart = (): string => {
      const pts = proj;
      const lastY = pts[pts.length - 1].year;
      const W = 690, H = 200, PL = 62, PR = 18, PT = 34, PB = 26;
      const iW = W - PL - PR, iH = H - PT - PB;
      const all = [...pts.map(p => p.impot), ...(isMicro ? [] : pts.map(p => p.amortDotation))];
      const sc = niceScale(0, Math.max(...all, 1), 4);
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(lastY - 1, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 5 }, (_, i) => {
        const t = i / 4, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.10)" stroke-width="1"/><text x="${PL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(26,22,18,0.5)">${fN(v)}</text>`;
      }).join("");
      const bw = Math.max(2.5, Math.min(11, (iW / pts.length) * 0.55));
      const bars = isMicro ? "" : pts.filter(p => p.amortDotation > 0).map(p =>
        `<rect x="${(toX(p.year) - bw / 2).toFixed(1)}" y="${toY(p.amortDotation).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, toY(0) - toY(p.amortDotation)).toFixed(1)}" fill="rgba(42,92,138,0.32)" rx="1.5"/>`).join("");
      const path = `<path d="${pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(p.impot).toFixed(1)}`).join(" ")}" fill="none" stroke="#C95B2A" stroke-width="2.6" stroke-linejoin="round"/>`;
      const marks = Array.from(new Set([1, 10, 20, 30, 40, lastY].filter(y => y >= 1 && y <= lastY))).sort((a, b) => a - b);
      const plat = Math.max(...pts.map(p => p.impot)) - Math.min(...pts.map(p => p.impot)) < 1;
      const labels = (plat ? [1] : marks).map((y, k) => {
        const p = at(y);
        const anchor: "start" | "middle" | "end" = y === 1 ? "start" : y === lastY ? "end" : "middle";
        // une étiquette sur deux est décalée vers le bas pour éviter les chevauchements
        const dy = !plat && k % 2 === 1 ? 16 : -8;
        return `<text x="${toX(y).toFixed(1)}" y="${(toY(p.impot) + dy).toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="700" fill="#A8471F">${fE(p.impot)}</text>`;
      }).join("");
      const xFin = toX(Math.min(duree, lastY));
      const finLine = montantCredit > 0 && duree <= lastY
        ? `<line x1="${xFin.toFixed(1)}" y1="${PT - 12}" x2="${xFin.toFixed(1)}" y2="${PT + iH}" stroke="#C95B2A" stroke-width="1.1" stroke-dasharray="5 3" opacity=".7"/><text x="${xFin.toFixed(1)}" y="${PT - 17}" text-anchor="middle" font-size="12" font-weight="700" fill="#C95B2A">Fin du prêt</text>`
        : "";
      const xL = marks.map(y => `<text x="${toX(y).toFixed(1)}" y="${PT + iH + 17}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.55)">${y}</text>`).join("");
      return `<div class="graph">
  <div class="graph-lg"><span class="glbl"><i style="background:#C95B2A"></i>Impôt : IR + PS</span>${isMicro ? "" : `<span class="glbl"><i style="background:rgba(42,92,138,0.42)"></i>Amortissement</span>`}</div>
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
    <text x="4" y="${PT - 6}" font-size="12" fill="rgba(26,22,18,0.45)">€/an</text>
    ${grid}${finLine}${bars}${path}${labels}${xL}
  </svg></div>`;
    };

    // Graphe page 4 : cash-flow mensuel après impôt sur tout l'horizon
    const makeCashflowChart = (): string => {
      const pts = proj;
      const lastY = pts[pts.length - 1].year;
      const W = 690, H = 200, PL = 62, PR = 24, PT = 34, PB = 26;
      const iW = W - PL - PR, iH = H - PT - PB;
      const vals = pts.map(p => p.cashflowMensuel);
      const sc = niceScale(Math.min(0, ...vals), Math.max(...vals, 1), 3);
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(lastY - 1, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 4 }, (_, i) => {
        const t = i / 3, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.10)" stroke-width="1"/><text x="${PL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(26,22,18,0.5)">${fN(v)}</text>`;
      }).join("");
      const path = `<path d="${pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(p.cashflowMensuel).toFixed(1)}`).join(" ")}" fill="none" stroke="#1A6644" stroke-width="2.6" stroke-linejoin="round"/>`;
      const marks = Array.from(new Set([1, 10, 20, 21, 30, 40, lastY].filter(y => y >= 1 && y <= lastY && (y !== 21 || duree + 1 <= lastY)))).sort((a, b) => a - b);
      const shown = marks.filter((y, i) => i === 0 || y - marks[i - 1] >= 3 || y === duree + 1);
      const pieces = shown.map(y => {
        const p = at(y);
        // le saut de fin de prêt fait se croiser les étiquettes : on écarte celles qui l'encadrent
        const avantSaut = y === duree, apresSaut = y === duree + 1;
        const anchor: "start" | "middle" | "end" = y === 1 || apresSaut ? "start" : y === lastY || avantSaut ? "end" : "middle";
        const dy = avantSaut ? 17 : -9;
        const dx = avantSaut ? -6 : apresSaut ? 6 : 0;
        return `<circle cx="${toX(y).toFixed(1)}" cy="${toY(p.cashflowMensuel).toFixed(1)}" r="2.8" fill="#1A6644"/><text x="${(toX(y) + dx).toFixed(1)}" y="${(toY(p.cashflowMensuel) + dy).toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="700" fill="#145136">${fE(p.cashflowMensuel)}</text>`;
      }).join("");
      const xFin = toX(Math.min(duree, lastY));
      const finLine = montantCredit > 0 && duree <= lastY
        ? `<line x1="${xFin.toFixed(1)}" y1="${PT - 12}" x2="${xFin.toFixed(1)}" y2="${PT + iH}" stroke="#C95B2A" stroke-width="1.1" stroke-dasharray="5 3" opacity=".75"/><text x="${xFin.toFixed(1)}" y="${PT - 17}" text-anchor="middle" font-size="12" font-weight="700" fill="#C95B2A">Fin du prêt</text>`
        : "";
      const xL = Array.from(new Set([1, 10, 20, 30, 40, lastY].filter(y => y >= 1 && y <= lastY))).sort((a, b) => a - b)
        .map(y => `<text x="${toX(y).toFixed(1)}" y="${PT + iH + 17}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.55)">${y}</text>`).join("");
      return `<div class="graph">
  <div class="graph-lg"><span class="glbl"><i style="background:#1A6644"></i>Cash-flow après impôt</span></div>
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
    <text x="4" y="${PT - 6}" font-size="12" fill="rgba(26,22,18,0.45)">€/mois</text>
    ${grid}${finLine}${path}${pieces}${xL}
  </svg></div>`;
    };

    // Graphe page 6 : net vendeur année par année
    const makeNetVendeurChart = (): string => {
      const lastY = Math.min(35, HORIZON);
      const steps = Array.from({ length: Math.floor(lastY / 5) + 1 }, (_, i) => i === 0 ? 1 : i * 5).filter(y => y <= lastY);
      const serie = Array.from({ length: lastY }, (_, i) => ({ year: i + 1, v: calcVente(i + 1, prixRevente).net }));
      const W = 690, H = 170, PL = 76, PR = 24, PT = 18, PB = 26;
      const iW = W - PL - PR, iH = H - PT - PB;
      const sc = niceScale(Math.min(0, ...serie.map(p => p.v)), Math.max(...serie.map(p => p.v), 1), 3);
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(lastY - 1, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 4 }, (_, i) => {
        const t = i / 3, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.10)" stroke-width="1"/><text x="${PL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(26,22,18,0.5)">${fE(v)}</text>`;
      }).join("");
      const path = `<path d="${serie.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(p.v).toFixed(1)}`).join(" ")}" fill="none" stroke="#7B5EA7" stroke-width="2.6" stroke-linejoin="round"/>`;
      const pieces = steps.map((y, k) => {
        const v = calcVente(y, prixRevente).net;
        const anchor: "start" | "middle" | "end" = y === 1 ? "start" : y === lastY ? "end" : "middle";
        const dy = k % 2 === 1 ? 17 : -9;
        return `<circle cx="${toX(y).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="2.8" fill="#7B5EA7"/><text x="${toX(y).toFixed(1)}" y="${(toY(v) + dy).toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="700" fill="#5C4184">${fE(v)}</text>`;
      }).join("");
      const xL = steps.map(y => `<text x="${toX(y).toFixed(1)}" y="${PT + iH + 17}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.55)">${y}</text>`).join("");
      return `<div class="graph">
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">${grid}${path}${pieces}${xL}</svg></div>`;
    };

    /* ── Identité du rapport ────────────────────────────────────────────────── */
    const today = new Date().toLocaleDateString("fr-FR");
    const typeLabel = bienInfo.type === "ma" ? "Maison" : bienInfo.type === "im" ? "Immeuble" : "Appartement";
    const typePieces = bienInfo.pieces ? `${typeLabel} T${bienInfo.pieces}` : typeLabel;
    const bienLigne = [
      typePieces,
      bienInfo.surface ? `${bienInfo.surface} m²` : "",
      bienInfo.ville ? `Localisation saisie : ${bienInfo.ville}` : "",
    ].filter(Boolean).join(" · ");
    const regimeLabel = isMicro ? "Micro-BIC" : "Régime réel simplifié";
    const locationLabel = isSaisonnier ? "Location saisonnière" : "Meublée longue durée";

    /* ── Briques HTML ───────────────────────────────────────────────────────── */
    const infoClef = (ton: "neutre" | "favorable" | "defavorable", titre: string, texte: string) => {
      const cls = ton === "favorable" ? "gr" : ton === "defavorable" ? "br" : "sl";
      const mot = ton === "favorable" ? "FAVORABLE" : ton === "defavorable" ? "DÉFAVORABLE" : "NEUTRE";
      return `<div class="info ${cls}"><div class="info-b">INFO CLEF</div><div class="info-c"><div class="info-t">${mot} · ${titre}</div><div class="info-x">${texte}</div></div></div>`;
    };
    const kpi = (l: string, v: string, s: string, tone = "") =>
      `<div class="kpi"><div class="kpi-l">${l}</div><div class="kpi-v"${tone ? ` style="color:${tone}"` : ""}>${v}</div><div class="kpi-s">${s}</div></div>`;
    const infoRow = (l: string, v: string, mute = false, accent = false) =>
      `<div class="ir"><span class="ir-l"${mute ? ` style="color:rgba(26,22,18,0.38)"` : ""}>${l}</span><span class="ir-v"${accent ? ` style="color:#C95B2A"` : mute ? ` style="color:rgba(26,22,18,0.45)"` : ""}>${v}</span></div>`;
    const star = (v: number) => v > 0 ? fE(v) : `${fE(0)}*`;

    /* ── Pages ──────────────────────────────────────────────────────────────── */
    const pages: { badge: string; titre: string; sous: string; corps: string }[] = [];

    /* PAGE — Intro : votre projet en détail */
    pages.push({
      badge: "Intro :", titre: "Votre projet en détail",
      sous: "Récapitulatif des données du dossier et des paramètres utilisés pour la simulation.",
      corps: `
<div class="sec">LE BIEN, SON ACQUISITION ET SES REVENUS</div>
<div class="duo">
  <div class="box gr">
    <div class="box-h">LE BIEN ET LES REVENUS</div>
    ${infoRow("Type de bien", typePieces)}
    ${infoRow("Localisation", bienInfo.ville || "Non renseignée")}
    ${infoRow("Surface", bienInfo.surface ? `${bienInfo.surface} m²` : "Non renseignée")}
    ${infoRow("Location", `${locationLabel}<sup>1</sup>`)}
    ${isSaisonnier
        ? infoRow("Prix / nuitée · occupation", `${fE(prixNuitee)} · ${fP(occ.moyen, 0)}`, false, true)
        : infoRow("Loyer HC mensuel", `${fE(loyerMensuel)}/mois`, false, true)}
    ${infoRow("Loyers HC annuels", fE(loyerAnnuel))}
  </div>
  <div class="box or">
    <div class="box-h">ACQUISITION</div>
    ${infoRow("Prix d'achat", fE(prix))}
    ${infoRow("Frais de notaire", star(notaire), notaire === 0)}
    ${infoRow("Travaux", star(travaux), travaux === 0)}
    ${infoRow("Mobilier", star(mobilier), mobilier === 0)}
    ${infoRow("Coût total saisi", fE(investTotal), false, true)}
  </div>
</div>

<div class="sec tight">LES CHARGES ANNUELLES ET LE FINANCEMENT</div>
<div class="duo">
  <div class="box rd">
    <div class="box-h">CHARGES ANNUELLES</div>
    ${infoRow("Copropriété", star(chargesCopro), chargesCopro === 0)}
    ${infoRow("Taxe foncière / CFE", star(taxeFonciere), taxeFonciere === 0)}
    ${infoRow("Assurance propriétaire", star(pnoEur), pnoEur === 0)}
    ${infoRow("Gestion / comptabilité", `${star(gestionEur)} / ${star(compta)}`, gestionEur === 0 && compta === 0)}
    ${infoRow("Entretien / autres", star(entretien), entretien === 0)}
    ${infoRow("Total retenu", fE(chargesAnnuelles), false, true)}
  </div>
  <div class="box bl">
    <div class="box-h">FINANCEMENT</div>
    ${infoRow("Apport / emprunt", `${fE(apport)} / ${fE(montantCredit)}`)}
    ${infoRow("Taux / durée", montantCredit > 0 ? `${fP(taux * 100)} / ${duree} ans` : "Aucun crédit")}
    ${infoRow("Assurance du prêt", assuranceEmprunteurAnnuel > 0 ? `${fE2(assuranceEmprunteurAnnuel)}/an` : `${fE(0)}*`, assuranceEmprunteurAnnuel === 0)}
    ${infoRow("Mensualité hors ass.", fE2(mensualite), false, true)}
    ${infoRow("Sortie mensuelle totale", fE2(sortieMensuelleCredit))}
  </div>
</div>

<div class="sec tight">FISCALITÉ ET HYPOTHÈSES DE PROJECTION</div>
<p class="para"><strong>Régime choisi :</strong> ${isMicro ? `micro-BIC` : `réel simplifié`} · <strong>TMI :</strong> ${tmi} % · <strong>Prélèvements sociaux locatifs :</strong> 18,6 %. <strong>Comparaison ${isMicro ? "régime réel" : "micro-BIC"} :</strong> ${isMicro ? `charges réelles et amortissements déduits` : `abattement de ${abattLabel}`}. <strong>Horizon :</strong> ${HORIZON} ans ; loyers et charges constants. <strong>Revente centrale :</strong> valeur du bien maintenue à ${fE(prixRevente)}. ${isMicro
        ? `Aucun amortissement n'est déduit au micro-BIC ; la base est forfaitaire.`
        : `Base amortissable : ${fE(baseAmortissableTotale)}, terrain exclu : ${fE(terrainVal)} ; détail en partie 3 et annexe B.`}</p>

<p class="foot-note">* Montant non renseigné dans le dossier, affiché à 0 et non ajouté aux calculs. <sup>1</sup> Hypothèse de simulation. Les paramètres calculés ou déduits du rapport ne constituent pas de nouvelles saisies du client. Le statut LMNP et l'éligibilité aux deux régimes sont supposés.</p>

${infoClef("neutre", "Le point de départ de votre simulation",
        `Le budget saisi est de <strong>${fE(investTotal)}</strong>, pour <strong>${fE(loyerAnnuel)}</strong> de loyers par an. Les résultats reposent sur ces données et sur les montants affichés à 0 ; ils évolueront si ces postes sont complétés.`)}`,
    });

    /* PAGE 1 — Le financement */
    pages.push({
      badge: "1", titre: "Le financement",
      sous: "De l'achat aux mensualités : distinguer le capital financé du coût du crédit.",
      corps: `
<div class="kpis">
  ${kpi("APPORT", fE(apport), investTotal > 0 ? `${fP(apport / investTotal * 100, 0)} du budget` : "—")}
  ${kpi("EMPRUNT", fE(montantCredit), investTotal > 0 ? `${fP(montantCredit / investTotal * 100, 0)} du budget` : "—")}
  ${kpi("DURÉE / TAUX", montantCredit > 0 ? `${duree} ans` : "—", montantCredit > 0 ? `Taux nominal : ${fP(taux * 100)}` : "Achat comptant")}
</div>

<div class="sec tight">CHAQUE MOIS${montantCredit > 0 ? ` PENDANT ${duree} ANS` : ""}</div>
<div class="kpis">
  ${kpi("CAPITAL + INTÉRÊTS", fE2(mensualite), "Mensualité hors assurance")}
  ${kpi("ASSURANCE", fE2(mensualiteAssurance), `${fE2(assuranceEmprunteurAnnuel)} par an`)}
  ${kpi("SORTIE TOTALE", fE2(sortieMensuelleCredit), "Crédit et assurance")}
</div>

<div class="sec tight">AU TOTAL SUR LA DURÉE DE L'EMPRUNT</div>
<table class="tbl">
  <tr><th>Ce qui est remboursé ou payé</th><th class="r">Montant</th></tr>
  <tr><td>Capital rendu à la banque</td><td class="r">${fE(capitalTotal)}</td></tr>
  <tr><td>Intérêts du crédit</td><td class="r">${fE(interetsTotaux)}</td></tr>
  <tr><td>Total remboursé hors assurance</td><td class="r">${fE(totalHorsAssurance)}</td></tr>
  <tr><td>Assurance emprunteur cumulée</td><td class="r">${fE(assuranceTotale)}</td></tr>
  <tr class="strong"><td>Total versé, assurance incluse</td><td class="r">${fE(totalVerse)}</td></tr>
  <tr class="strong or"><td>Coût du financement : intérêts + assurance</td><td class="r">${fE(coutFinancement)}</td></tr>
</table>

<p class="para">${montantCredit > 0
        ? `Le coût total de l'opération, acquisition et financement inclus, atteint <strong>${fE(totalVerse + apport)}</strong>. Il comprend déjà le prix du bien et les frais de notaire financés. Le capital n'est pas ajouté une seconde fois.`
        : `Le projet est financé sans crédit : aucun intérêt ni assurance emprunteur n'est supporté.`}</p>

${infoClef("neutre", montantCredit >= investTotal ? "Un financement intégral du budget saisi" : "Le poids du crédit dans le projet",
        montantCredit > 0
          ? `Le projet mobilise <strong>${fE2(sortieMensuelleCredit)} par mois</strong> pendant le prêt. Sur ${duree} ans, le financement coûte <strong>${fE(coutFinancement)}</strong> en intérêts et assurance, en plus des ${fE(capitalTotal)} de capital remboursé.`
          : `Aucun emprunt n'est simulé : la totalité du budget de ${fE(investTotal)} est apportée au comptant. Le cash-flow n'est donc grevé d'aucune mensualité.`)}`,
    });

    /* PAGE 2 — Le choix du régime */
    const cmpRow = (k: string, a: string, b: string, cls = "") =>
      `<div class="cmp-r ${cls}"><span class="cmp-k">${k}</span><span class="cmp-v">${a}</span></div>|||<div class="cmp-r ${cls}"><span class="cmp-k">${k}</span><span class="cmp-v">${b}</span></div>`;
    const rowsCmp = [
      cmpRow("Loyers imposables", fE(recettesAnnuelles), fE(recettesAnnuelles)),
      cmpRow("Charges / abattement", fE(res.chargesDeductibles), fE(recettesAnnuelles * abattPct)),
      cmpRow("Amortissement déduit", fE(projReel[0].amortImpute), "Aucun"),
      cmpRow("Base imposable", fE(projReel[0].baseImposable), fE(projMicro[0].baseImposable)),
      cmpRow("Impôt + PS / an", fE(projReel[0].impot), fE(projMicro[0].impot)),
      cmpRow("Cash-flow net / mois", sE(projReel[0].cashflowMensuel), sE(projMicro[0].cashflowMensuel), "cf"),
    ];
    const colReel = rowsCmp.map(r => r.split("|||")[0]).join("");
    const colMicro = rowsCmp.map(r => r.split("|||")[1]).join("");

    const tableauxSaisonniers = (regime: "reel" | "micro") => {
      const micro = regime === "micro";
      return `<div class="est3">${estimations.map(e => {
        const rr = e.r;
        const cf = rr ? (micro ? rr.cashflowBICMensuel : rr.cashflowReelMensuel) : 0;
        const base = rr ? (micro ? rr.baseBIC : rr.baseImposableReel) : 0;
        const imp = rr ? (micro ? rr.impotBIC : rr.impotReel) : 0;
        const rev = rr?.loyerAnnuel ?? 0;
        return `<div class="est">
  <div class="est-h"><div class="est-t">${e.label}</div><div class="est-s">${fP(e.occ, 0)} occ. · ${e.nuits} nuits · ${fE(rev / 12)}/mois · ${fE(rev)}/an</div></div>
  <div class="est-b">
    <div class="er"><span>Revenus annuels</span><b>${fE(rev)}</b></div>
    <div class="er"><span>Emprunt</span><b>${(rr?.creditAnnuel ?? 0) > 0.5 ? "−" : ""}${fE(rr?.creditAnnuel ?? 0)}</b></div>
    <div class="er"><span>${micro ? `Abattement ${abattLabel}` : "Charges déduct."}</span><b>−${fE(micro ? rev * abattPct : (rr?.chargesDeductibles ?? 0))}</b></div>
    ${micro ? "" : `<div class="er"><span>Résultat avant amort.</span><b>${fE(rr?.resultatAvantAmort ?? 0)}</b></div>
    <div class="er"><span>Amortissements</span><b>−${fE(rr?.amortTotal ?? 0)}</b></div>`}
    <div class="er"><span>Base imposable</span><b>${fE(base)}</b></div>
    <div class="er"><span>Impôt estimé</span><b style="color:${imp > 0.5 ? "#B03A2A" : "rgba(26,22,18,0.6)"}">${imp > 0.5 ? "−" : ""}${fE(imp)}</b></div>
    <div class="er tot"><span>Cash-flow mensuel</span><b style="color:${col(cf)}">${sE(cf)}</b></div>
    <div class="er sub"><span>Soit annuel</span><b style="color:${col(cf)}">${sE(cf * 12)}</b></div>
  </div>
</div>`;
      }).join("")}</div>`;
    };

    pages.push({
      badge: "2", titre: "Le choix du régime",
      sous: "Le régime détermine la base imposable, donc l'impôt et le cash restant après fiscalité.",
      corps: isSaisonnier && triple ? `
<div class="sec">LES SIX ESTIMATIONS · ANNÉE 1 · ${fE(prixNuitee)} PAR NUITÉE</div>
<div class="reg-bar gr">RÉGIME RÉEL SIMPLIFIÉ · charges réelles et amortissements déduits</div>
${tableauxSaisonniers("reel")}
<div class="reg-bar or">MICRO-BIC · abattement forfaitaire de ${abattLabel}</div>
${tableauxSaisonniers("micro")}
<p class="para">Les trois taux d'occupation saisis (${fP(occ.bas, 0)}, ${fP(occ.moyen, 0)} et ${fP(occ.haut, 0)}) sont repris tels quels de la simulation. <strong>La suite du rapport retient l'estimation moyenne</strong> (${fP(occ.moyen, 0)}, soit ${estimations[1].nuits} nuits par an) au ${regimeLabel.toLowerCase()}, régime que vous avez sélectionné.</p>
${infoClef(cumulCfChoisi >= 0 ? "neutre" : "defavorable", `Régime choisi : ${isMicro ? "micro-BIC" : "réel simplifié"}`,
        `En estimation moyenne, l'écart d'impôt en année 1 est de <strong>${fE(Math.abs(ecartImpotAn1))}</strong> ${ecartImpotAn1 >= 0 ? "en faveur du réel" : "en faveur du micro-BIC"}. Sur ${duree} ans, le ${ecartCumulCf >= 0 ? "micro-BIC" : "réel"} laisse <strong>${fE(Math.abs(ecartCumulCf))}</strong> de cash-flow supplémentaire dans cette simulation.`)}`
        : `
<div class="sec">COMPARAISON DES RÉGIMES · ANNÉE 1</div>
<div class="cmp">
  <div class="cmp-c on"><div class="cmp-h">RÉEL SIMPLIFIÉ${isMicro ? "" : ` <em>· retenu</em>`}</div>${colReel}</div>
  <div class="vs">vs</div>
  <div class="cmp-c on2"><div class="cmp-h">MICRO-BIC${isMicro ? ` <em>· retenu</em>` : ""}</div>${colMicro}</div>
</div>

<div class="sec tight">CASH-FLOW APRÈS IMPÔT · CRÉDIT + 5 ANS</div>
${makeRegimeChart()}

<p class="para"><strong>Pendant les ${duree} ans de prêt :</strong> ${sE(cumulCfReel)} cumulés au réel, contre ${sE(cumulCfMicro)} au micro-BIC. <strong>Dès l'année ${duree + 1} :</strong> ${sE(apresReelMois)}/mois au réel, contre ${sE(apresMicroMois)}/mois au micro-BIC. Les régimes sont conservés sur toute la période ; comparaison hors frais comptables spécifiques et revente.</p>

${infoClef("neutre", `Régime choisi : ${isMicro ? "micro-BIC" : "réel simplifié"}`,
          isMicro
            ? `Avantage : aucune comptabilité obligatoire et un abattement forfaitaire de ${abattLabel}, soit ${fE(recettesAnnuelles * abattPct)} déduits sans justificatif. Limite : ${ecartImpotAn1 >= 0 ? `le régime réel ferait économiser ${fE(ecartImpotAn1)} d'impôt dès l'année 1` : `aucune charge réelle ni amortissement ne vient en déduction`}. Sur ${duree} ans, l'écart de cash-flow cumulé entre les deux régimes est de ${fE(Math.abs(ecartCumulCf))}.`
            : `Avantage : ${fE(Math.abs(ecartImpotAn1))} d'impôt ${ecartImpotAn1 >= 0 ? "en moins" : "en plus"} en année 1 grâce aux charges et à l'amortissement. Limite : cet avantage diminue ; sur ${duree} ans, le ${ecartCumulCf >= 0 ? "micro-BIC" : "réel"} laisse ${fE(Math.abs(ecartCumulCf))} de cash-flow supplémentaire dans cette simulation.`)}`,
    });

    /* PAGE 3 — L'impôt et l'amortissement */
    const calculAn1 = isMicro ? `
<table class="tbl">
  <tr><th>Calcul au micro-BIC · année 1</th><th class="r">Montant</th></tr>
  <tr><td>Recettes déclarées (loyers ${chargesLocatairesAnnuel > 0 ? "et charges locatives " : ""}encaissés)</td><td class="r">${fE(recettesAnnuelles)}</td></tr>
  <tr><td>Abattement forfaitaire de ${abattLabel}</td><td class="r">−${fE(recettesAnnuelles * abattPct)}</td></tr>
  <tr class="strong"><td>Base imposable</td><td class="r">${fE(projMicro[0].baseImposable)}</td></tr>
  <tr><td>Impôt sur le revenu : base × TMI de ${tmi} %</td><td class="r">${fE(projMicro[0].baseImposable * tmi / 100)}</td></tr>
  <tr><td>Prélèvements sociaux : base × 18,6 %</td><td class="r">${fE(projMicro[0].baseImposable * 0.186)}</td></tr>
  <tr class="strong or"><td>Total fiscal : IR + prélèvements sociaux</td><td class="r">${fE(projMicro[0].impot)}/an</td></tr>
</table>
<p class="para">L'IR est estimé via la TMI, sans calcul complet du foyer ; les prélèvements sociaux s'y ajoutent. L'abattement de ${abattLabel} remplace <strong>toute</strong> déduction : ni charges réelles (${fE(chargesAnnuelles)}), ni intérêts d'emprunt (${fE(interetsAnnee1)} en année 1), ni amortissement ne viennent réduire la base. L'impôt reste donc stable tant que les recettes le sont.</p>`
      : `
<table class="tbl">
  <tr><th>Calcul au réel · année 1</th><th class="r">Montant</th></tr>
  <tr><td>Loyers − charges − intérêts − assurance</td><td class="r">${fN(recettesAnnuelles)} − ${fN(chargesAnnuelles)} − ${fN(y1.interets)} − ${fN(y1.assuranceEmprunteur)} €</td></tr>
  <tr class="strong"><td>Résultat avant amortissement</td><td class="r">${fE(y1.resultatAvantAmort)}</td></tr>
  <tr><td>Amortissement déduit</td><td class="r">−${fE(y1.amortImpute)}</td></tr>
  <tr class="strong"><td>Base imposable</td><td class="r">${fE(y1.baseImposable)}</td></tr>
  <tr><td>Impôt sur le revenu : base × TMI de ${tmi} %</td><td class="r">${fE(y1.baseImposable * tmi / 100)}</td></tr>
  <tr><td>Prélèvements sociaux : base × 18,6 %</td><td class="r">${fE(y1.baseImposable * 0.186)}</td></tr>
  <tr class="strong or"><td>Total fiscal : IR + prélèvements sociaux</td><td class="r">${fE(y1.impot)}/an</td></tr>
</table>
<p class="para">L'IR est estimé via la TMI, sans calcul complet du foyer ; les prélèvements sociaux s'y ajoutent. L'amortissement réduit le bénéfice taxable sans sortie de cash. ${y1.baseImposable > 0
        ? `Il ne le ramène pas à zéro : vous payez donc encore de l'impôt. S'il absorbait tout le bénéfice, la base et l'impôt locatif seraient nuls.`
        : `Ici il absorbe tout le bénéfice : la base et l'impôt locatif sont nuls, et la fraction non utilisée (${fE(y1.reportSortant)}) est reportée sans limitation de durée.`}</p>`;

    const palierTable = (!isMicro && paliers.length) ? `
<table class="tbl compact">
  <tr><th>Amortissement / an</th>${paliers.slice(0, 6).map(p => `<th class="r">${p.de === p.a ? `Année ${p.de}` : `Années ${p.de}–${p.a}`}</th>`).join("")}</tr>
  <tr><td>Total déduit</td>${paliers.slice(0, 6).map(p => `<td class="r">${fE(p.val)}</td>`).join("")}</tr>
</table>` : "";

    pages.push({
      badge: "3", titre: isMicro ? "L'impôt au micro-BIC" : "L'impôt et l'amortissement",
      sous: isMicro ? "Comprendre ce qui est taxé, et pourquoi la base ne bouge pas." : "Comprendre ce qui est taxé, puis pourquoi l'impôt augmente au fil des années.",
      corps: `
${calculAn1}

<div class="sec tight">${isMicro ? "IMPÔT ANNUEL · STABLE SUR TOUT L'HORIZON" : "IMPÔT ET AMORTISSEMENT · MÊME ÉCHELLE ANNUELLE"}</div>
${makeImpotAmortChart()}

<p class="para">${isMicro
        ? `À recettes constantes, la base forfaitaire ne varie pas : l'impôt reste de ${fE(projMicro[0].impot)} par an sur tout l'horizon. Ni la baisse des intérêts d'emprunt, ni la fin du crédit ne le modifient.`
        : `Moins d'amortissement signifie moins de déduction : à autres données identiques, l'impôt augmente. Pendant le crédit, la baisse des intérêts déductibles contribue aussi à cette hausse.`}</p>

${palierTable}
<p class="foot-note">Référence : impots.gouv.fr · Régimes d'imposition. Montants arrondis après calcul.</p>

${infoClef("neutre", isMicro ? "Un impôt forfaitaire, stable dans le temps" : "L'amortissement réduit l'impôt sans l'annuler",
        isMicro
          ? `L'impôt s'élève à <strong>${fE(projMicro[0].impot)}/an</strong> et totalise <strong>${fE(cumulImpotCredit)}</strong> pendant le prêt. Il ne dépend que des recettes déclarées, pas des dépenses réellement engagées.`
          : `L'impôt passe de <strong>${fE(y1.impot)}/an</strong> au départ à <strong>${fE(impotFinal)}/an</strong> une fois l'amortissement terminé. Il totalise <strong>${fE(cumulImpotCredit)}</strong> pendant le prêt. ${derniere.reportSortant > 1 ? `Un report d'amortissement non déduit subsiste (${fE(derniere.reportSortant)}) ; il reste imputable sans limitation de durée.` : `Tous les amortissements sont déduits dans ce dossier`} ; détail par composant en annexe B.`)}`,
    });

    /* PAGE 4 — Cash-flow */
    pages.push({
      badge: "4", titre: "Cash-Flow : ce qu'il reste chaque mois",
      sous: "Cash-flow = loyers encaissés − charges − crédit − assurance − impôt.",
      corps: `
<div class="kpis">
  ${kpi("LOYERS", `${fE(loyerMensuel)}/mois`, chargesLocatairesAnnuel > 0 ? `+ ${fE(chargesLocatairesAnnuel / 12)} de charges locatives` : "Hors charges")}
  ${kpi("SORTIES TOTALES", `${fE(sortiesMois1)}/mois`, "Année 1, impôt compris")}
  ${kpi("CASH-FLOW", `${sE(cfMois1)}/mois`, `${sE(cfAn1)} en année 1`, col(cfMois1))}
</div>

<p class="para">En année 1 : ${fE(loyerMensuel)}${chargesLocatairesAnnuel > 0 ? ` + ${fE(chargesLocatairesAnnuel / 12)} de charges locatives` : ""} − ${fE2(chargesMois)} de charges − ${fE2(y1.creditAnnuel / 12)} de crédit − ${fE2(y1.assuranceEmprunteur / 12)} d'assurance − ${fE2(impotMois1)} d'impôt. ${isMicro ? `L'abattement de ${abattLabel} est déjà pris en compte dans l'impôt.` : `L'amortissement est déjà pris en compte dans l'impôt : il n'est pas soustrait une seconde fois.`}</p>

<div class="sec tight">LE CASH DISPONIBLE ÉVOLUE DANS LE TEMPS</div>
${makeCashflowChart()}

<p class="para"><strong>Année ${duree} : ${sE(at(duree).cashflowMensuel)}/mois.</strong> ${isMicro ? "Le cash disponible reste stable pendant le crédit, la base imposable étant forfaitaire." : "L'impôt augmente et réduit le cash disponible."} <strong>Année ${duree + 1} : ${sE(apresChoisiMois)}/mois.</strong> Le prêt et son assurance s'arrêtent.${!isMicro && amortMaxDuree < HORIZON ? ` <strong>Dès l'année ${amortMaxDuree + 1} : ${sE(at(Math.min(amortMaxDuree + 1, HORIZON)).cashflowMensuel)}/mois.</strong> La fin de l'amortissement augmente encore l'impôt.` : ""}</p>

<div class="sec tight">LA RENTABILITÉ DU BIEN · AVANT CRÉDIT ET IMPÔT</div>
<div class="kpis">
  ${kpi("BRUTE SUR PRIX", fP(rendBrutPrix), `${fN(loyerAnnuel)} / ${fN(prix)}`)}
  ${kpi("BRUTE ACTE EN MAIN", fP(rendBrutActe), `${fN(loyerAnnuel)} / ${fN(investTotal)}`)}
  ${kpi("NETTE DES CHARGES", fP(rendNetCharges), `${fN(loyerAnnuel - chargesAnnuelles)} / ${fN(investTotal)}`, "#1A6644")}
</div>

${infoClef(cfMois1 >= 0 ? "favorable" : "defavorable", cfMois1 >= 0 ? "Un excédent dans le scénario central" : "Un effort d'épargne dans le scénario central",
        cfMois1 >= 0
          ? `Les loyers couvrent les sorties saisies ${proj.slice(0, duree).every(y => y.cashflowAnnuel >= 0) ? "pendant toute la projection" : "la plupart des années"}. Le cash-flow cumulé atteint <strong>${sE(cumulCfChoisi)}</strong> à la fin du prêt. Les rendements mesurent le revenu du bien ; ils ne sont pas le cash réellement disponible.`
          : `Les loyers ne couvrent pas les sorties : l'effort est de <strong>${fE(Math.abs(cfMois1))}/mois</strong> en année 1. Sur la durée du prêt, le cumul s'établit à <strong>${sE(cumulCfChoisi)}</strong>. Les rendements mesurent le revenu du bien ; ils ne sont pas le cash réellement disponible.`)}`,
    });

    /* PAGE 5 — La marge face aux imprévus */
    pages.push({
      badge: "5", titre: "La marge face aux imprévus",
      sous: "Combien de cash reste-t-il si les revenus baissent ou si les dépenses augmentent ?",
      corps: `
<div class="recap">
  <p><strong>Charges du bien maintenues chaque année dans la simulation :</strong> ${[
          chargesCopro > 0 ? `copropriété ${fE(chargesCopro)}/an` : "",
          taxeFonciere > 0 ? `taxe foncière ${fE(taxeFonciere)}/an` : "",
          pnoEur > 0 ? `assurance propriétaire ${fE(pnoEur)}/an` : "",
          gestionEur > 0 ? `gestion locative ${fE(gestionEur)}/an` : "",
          compta > 0 ? `comptabilité ${fE(compta)}/an` : "",
          entretien > 0 ? `entretien ${fE(entretien)}/an` : "",
        ].filter(Boolean).join(", ") || "aucune charge saisie"}. Les postes non renseignés sont retenus à 0 €. Total retenu : <strong>${fE2(chargesMois)}/mois</strong>. Ces charges sont supposées constantes pendant la détention.</p>
  ${montantCredit > 0 ? `<p style="margin-top:7px"><strong>Pendant le prêt seulement :</strong> ${fE2(mensualite)}/mois de crédit + ${fE2(mensualiteAssurance)}/mois d'assurance.</p>` : ""}
</div>

<p class="para">Chaque encadré montre le <strong>cash-flow après impôt : l'argent restant en moyenne à la fin de chaque mois</strong>.${!isMicro ? ` L'année ${anneeStress2} est plus fragile, car l'impôt y est plus élevé.` : ""}</p>

<div class="scn-h"><span>SCÉNARIO TESTÉ</span><span>ANNÉE 1</span><span>ANNÉE ${anneeStress2}</span></div>
${scenarios.map((s, i) => `<div class="scn${i === scenarios.length - 1 ? " last" : ""}">
  <span class="scn-l">${s.label}</span>
  <span class="scn-v"><b style="color:${col(s.a1.cfMois)}">${sE(s.a1.cfMois)}</b><em>par mois</em></span>
  <span class="scn-v"><b style="color:${col(s.a2.cfMois)}">${sE(s.a2.cfMois)}</b><em>par mois</em></span>
</div>`).join("")}

<p class="foot-note">Tests indépendants, sauf le dernier qui cumule deux aléas. Impôt recalculé avec des charges supposées déductibles. Moyennes mensuelles sur l'année testée, et non solde bancaire minimum.</p>

${infoClef(pireA2.cfMois >= 0 ? "neutre" : "defavorable", pireA2.cfMois >= 0 ? "La marge absorbe les aléas testés" : "La marge se resserre en fin de crédit",
        pireA2.cfMois >= 0
          ? `Même le scénario le plus dur laisse <strong>${sE(scenarios[4].a1.cfMois)}/mois</strong> en année 1 et <strong>${sE(pireA2.cfMois)}/mois</strong> en année ${anneeStress2}. Le scénario central reste positif dans tous les tests présentés.`
          : `Le dernier scénario laisse encore <strong>${sE(scenarios[4].a1.cfMois)}/mois</strong> en année 1, mais exige <strong>${fE(Math.abs(pireA2.cfMois))}/mois</strong> d'effort en année ${anneeStress2}, soit environ ${fE(Math.abs(pireA2.cfAn))} sur l'année. ${cfMois1 >= 0 ? "Le scénario central reste positif ; les aléas peuvent absorber son excédent." : "Le scénario central est déjà négatif ; les aléas l'aggravent."}`)}`,
    });

    /* PAGE 6 — Scénarios de revente */
    const noteAbatt = (N: number) => {
      const i = abattIR(N), p = abattPS(N);
      if (i >= 1 && p >= 1) return `Exonération totale à ${N} ans.`;
      if (i === 0 && p === 0) return `Aucun abattement à ${N} ans.`;
      return `Abattements : IR ${fPc(i * 100)} ; PS ${fPc(p * 100)}.`;
    };
    pages.push({
      badge: "6", titre: "Scénarios de revente",
      sous: `${ventes.length === 3 ? "Trois horizons" : "Plusieurs horizons"}, avec un prix supposé stable à ${fE(prixRevente)} : que récupérez-vous ?`,
      corps: `
<p class="para">${isMicro
        ? `<strong>Au micro-BIC, aucun amortissement n'est réintégré</strong> dans l'assiette de plus-value : le prix d'acquisition retenu reste le prix payé, majoré des frais. Les abattements de durée s'appliquent ensuite : <strong>exonération d'IR après 22 ans, de prélèvements sociaux après 30 ans</strong>.`
        : `<strong>Au réel, les amortissements déduits augmentent la plus-value fiscale</strong> en diminuant le prix d'acquisition retenu. Une vente au prix d'achat peut donc être imposée. Les abattements de durée s'appliquent ensuite : <strong>exonération d'IR après 22 ans, de prélèvements sociaux après 30 ans</strong>. Il ne s'agit pas d'une exonération séparée des amortissements.`}</p>
<p class="para">Hypothèses du dossier : LMNP conservé ; IR de cession ${fP(TAUX_IR_PLUSVALUE * 100, 0)}, prélèvements sociaux ${fP(TAUX_PS_PLUSVALUE * 100, 1)}. Forfait travaux de 15 % au-delà de 5 ans : retenu à ${ventes.filter(v => v.N > 5).map(v => `${v.N}`).join(" et ")} ans${ventes.some(v => v.N <= 5) ? `, pas à exactement ${ventes.filter(v => v.N <= 5).map(v => v.N).join(" ni ")} ans` : ""}. Frais de vente : 0 € renseigné.</p>

<div class="vnt3">${ventes.map(v => `<div class="vnt">
  <div class="vnt-t">REVENTE À ${v.N} ANS</div>
  <div class="vr"><span>Prix de vente</span><b>${fE(v.prixVente)}</b></div>
  ${isMicro ? "" : `<div class="vr"><span>Amortissements déduits</span><b>${fE(v.amortReintegre)}</b></div>`}
  <div class="vr"><span>Plus-value avant abattement</span><b>${fE(v.pvBrute)}</b></div>
  <div class="vr"><span>IR sur la plus-value</span><b style="color:#B03A2A">${fE(v.ir)}</b></div>
  <div class="vr"><span>Prélèvements sociaux</span><b style="color:#B03A2A">${fE(v.ps)}</b></div>
  <div class="vr"><span>Dette à solder</span><b>${fE(v.dette)}</b></div>
  <div class="vnt-f"><span>NET VENDEUR APRÈS DETTE</span><b style="color:${col(v.net)}">${fE(v.net)}</b></div>
</div>`).join("")}</div>
<div class="vnt-caps">${ventes.map(v => `<span>${noteAbatt(v.N)}</span>`).join("")}</div>

<div class="sec tight">ÉVOLUTION DU NET VENDEUR · ANNÉES 1 À ${Math.min(35, HORIZON)}</div>
${makeNetVendeurChart()}
<p class="foot-note">Net vendeur = prix − impôt de cession − dette ; hors cash-flows cumulés et avant frais de vente. Référence : impots.gouv.fr.</p>

${infoClef("favorable", "La durée réduit la fiscalité de sortie",
        `À ${ventes[1]?.N ?? ventes[0].N} ans, la vente laisse <strong>${fE(ventes[1]?.net ?? ventes[0].net)}</strong> après impôt et remboursement du prêt. À ${ventes[ventes.length - 1].N} ans, ${ventes[ventes.length - 1].dette <= 1 ? "la dette est soldée" : `il reste ${fE(ventes[ventes.length - 1].dette)} de dette`} et ${abattIR(ventes[ventes.length - 1].N) >= 1 && abattPS(ventes[ventes.length - 1].N) >= 1 ? `l'exonération totale laisse les ${fE(prixRevente)} de prix supposé` : `le net vendeur atteint ${fE(ventes[ventes.length - 1].net)}`}, avant frais de vente.`)}`,
    });

    /* PAGE 7 — Le projet en un regard */
    const regard = (v: string, t: string, d: string, tone = "") =>
      `<div class="rg"><div class="rg-v"${tone ? ` style="color:${tone}"` : ""}>${v}</div><div class="rg-c"><div class="rg-t">${t}</div><div class="rg-d">${d}</div></div></div>`;
    pages.push({
      badge: "7", titre: "Le projet en un regard",
      sous: "Les chiffres à retenir, de l'acquisition à la sortie à la fin du prêt.",
      corps: `
<div class="sec">AU DÉPART · BUDGET ET PERFORMANCE EN ANNÉE 1</div>
${regard(fE(investTotal), "LE BUDGET DU PROJET", `<strong>${fE(prix)}</strong> pour le bien${notaire > 0 ? ` et <strong>${fE(notaire)}</strong> de frais de notaire` : ""}${travaux + mobilier > 0 ? `, <strong>${fE(travaux + mobilier)}</strong> de travaux et mobilier` : ""} ; apport saisi : <strong>${fE(apport)}</strong>.`)}
${regard(fP(rendNetCharges), "LA RENTABILITÉ NETTE DES CHARGES", `Loyers annuels nets des charges saisies / coût d'acquisition ; avant crédit et impôt.`)}
${regard(`${sE(cfMois1)}/mois`, "LE CASH DISPONIBLE EN ANNÉE 1", `Après charges, prêt, assurance et impôt : <strong style="color:${col(cfAn1)}">${sE(cfAn1)}</strong> sur l'année.`, col(cfMois1))}
${regard(`${fE(y1.impot)}/an`, "L'IMPÔT EN ANNÉE 1", `IR + prélèvements sociaux au ${isMicro ? "micro-BIC" : "réel"} : <strong style="color:#B03A2A">${fE2(impotMois1)}/mois</strong> en moyenne.`, "#B03A2A")}

<div class="sep"></div>
<div class="sec">À ${duree} ANS · CUMULS ET SCÉNARIO DE SORTIE</div>
${regard(fE(totalVerse), `LE PRIX DE L'EMPRUNT PENDANT ${duree} ANS`, `Capital, intérêts et assurance : <strong>${fE2(sortieMensuelleCredit)}/mois</strong>. Dont <strong>${fE(coutFinancement)}</strong> de coût de financement.`)}
${regard(fE(cumulImpotCredit), `L'IMPÔT CUMULÉ SUR ${duree} ANS`, `IR + prélèvements sociaux au ${isMicro ? "micro-BIC" : "réel"} : <strong style="color:#B03A2A">${fE2(cumulImpotCredit / (duree * 12))}/mois</strong> en moyenne.${isMicro ? "" : " Le montant évolue pendant le crédit."}`, "#B03A2A")}
${regard(sE(cumulCfChoisi), `LE CASH-FLOW CUMULÉ SUR ${duree} ANS`, `Argent généré progressivement, disponible à la fin seulement s'il a été conservé.`, col(cumulCfChoisi))}
${regard(fE(venteFinCredit.net), `LE PRODUIT NET DE VENTE À ${duree} ANS`, `Prix supposé : <strong>${fE(prixRevente)}</strong> ; dette : <strong>${fE(venteFinCredit.dette)}</strong> ; impôt de cession : <strong>${fE(venteFinCredit.ir + venteFinCredit.ps)}</strong>. Avant frais.`)}
${regard(fE(totalProjetFinCredit), `TOTAL CASH ENCAISSÉ DU PROJET SUR ${duree} ANS`, `<strong>${fE(venteFinCredit.net)}</strong> de vente ${cumulCfChoisi >= 0 ? "+" : ""} <strong style="color:${col(cumulCfChoisi)}">${sE(cumulCfChoisi)}</strong> de cash-flow. Total nominal, sans double comptage.`, col(totalProjetFinCredit))}

<div class="sep"></div>
${infoClef(cfMois1 >= 0 ? "favorable" : "neutre", cfMois1 >= 0 ? "Les points forts du scénario" : "Les points de vigilance du scénario",
        cfMois1 >= 0
          ? `Les loyers couvrent les sorties saisies et dégagent du cash dès la première année. Le crédit rembourse progressivement le bien ; une fois soldé, le cash-flow passe à <strong>${sE(apresChoisiMois)}/mois</strong>. Ces atouts restent liés aux hypothèses renseignées.`
          : `Le projet demande un effort de <strong>${fE(Math.abs(cfMois1))}/mois</strong> en année 1. Il devient excédentaire une fois le prêt soldé, à <strong>${sE(apresChoisiMois)}/mois</strong>. Le patrimoine se constitue pendant ce temps par le remboursement du capital.`)}`,
    });

    /* ANNEXE A — Projection annuelle complète */
    const blocsA: number[][] = [];
    for (let s = 1; s <= HORIZON; s += 15) blocsA.push(Array.from({ length: Math.min(15, HORIZON - s + 1) }, (_, i) => s + i));
    for (const bloc of blocsA) {
      const ligne = (yr: number) => {
        const y = at(yr);
        return `<tr><td class="c">${yr}</td><td class="r">${fN(loyerAnnuel)}</td><td class="r">${fN(chargesAnnuelles)}</td><td class="r">${fN(y.creditAnnuel)}</td><td class="r">${fN(y.assuranceEmprunteur)}</td><td class="r">${fN(y.interets)}</td><td class="r">${fN(y.capitalRembourse)}</td><td class="r">${fN(y.capitalFin)}</td>${isMicro
          ? `<td class="r">${fN(recettesAnnuelles * abattPct)}</td>`
          : `<td class="r">${fN(y.resultatAvantAmort)}</td><td class="r">${fN(y.amortImpute)}</td>`}<td class="r">${fN(y.baseImposable)}</td><td class="r">${fN(y.impot)}</td><td class="r" style="color:${col(y.cashflowAnnuel)}">${fN(y.cashflowAnnuel)}</td><td class="r" style="color:${col(y.cashflowMensuel)};font-weight:700">${fN(y.cashflowMensuel)}</td></tr>`;
      };
      pages.push({
        badge: "A", titre: "Projection annuelle complète",
        sous: `Années ${bloc[0]} à ${bloc[bloc.length - 1]} sur ${HORIZON} · ${regimeLabel} · Montants en euros · Loyers et charges constants.`,
        corps: `
<table class="tbl dense">
  <tr><th class="c">An</th><th class="r">Loyers HC</th><th class="r">Charges</th><th class="r">Annuité hors ass.</th><th class="r">Assurance</th><th class="r">Intérêts</th><th class="r">Capital remb.</th><th class="r">Dette fin an</th>${isMicro
            ? `<th class="r">Abattement</th>`
            : `<th class="r">Résultat avant amort.</th><th class="r">Amort. déduit</th>`}<th class="r">Base imposable</th><th class="r">Impôt + PS</th><th class="r">Cash-flow / an</th><th class="r">Cash-flow / mois</th></tr>
  ${bloc.map(ligne).join("")}
</table>
<p class="foot-note">Annuité = capital remboursé + intérêts. ${isMicro ? `Base imposable = recettes − abattement de ${abattLabel}.` : `Résultat avant amortissement = loyers − charges − intérêts − assurance.`} Cash-flow = loyers − charges − annuité − assurance − impôt. Les zéros après l'année ${duree} correspondent à un prêt soldé.</p>
<p class="foot-note">Le capital remboursé n'est pas une charge fiscale.${isMicro ? "" : " L'amortissement n'est pas une sortie de trésorerie."} Montants arrondis après calcul.</p>`,
      });
    }

    /* ANNEXE B — Amortissement par composant (régime réel uniquement) */
    if (!isMicro && amortCols.length > 0) {
      const detail = amortCols.length <= 6;   // au-delà, on n'affiche que la dotation
      const blocsB: number[][] = [];
      for (let s = 1; s <= amortMaxDuree; s += 20) blocsB.push(Array.from({ length: Math.min(20, amortMaxDuree - s + 1) }, (_, i) => s + i));
      for (const bloc of blocsB) {
        pages.push({
          badge: "B", titre: "Amortissement par composant",
          sous: `Années ${bloc[0]} à ${bloc[bloc.length - 1]} · Dotation annuelle${detail ? " et base restant à amortir en fin d'année" : ""} · Montants en euros.`,
          corps: `
<table class="tbl dense">
  <tr><th class="c" rowspan="2">An</th>${amortCols.map(c => `<th class="c" colspan="${detail ? 2 : 1}">${c.label}</th>`).join("")}<th class="r" rowspan="2">Total dotation</th><th class="r" rowspan="2">Total restant</th></tr>
  <tr>${amortCols.map(() => detail ? `<th class="r sub">Dotation</th><th class="r sub">Reste</th>` : `<th class="r sub">Dotation</th>`).join("")}</tr>
  ${bloc.map(yr => {
            let totD = 0, totR = 0;
            const cells = amortCols.map(c => {
              const d = yr <= c.duree ? c.annuel : 0;
              const reste = Math.max(0, c.base - c.annuel * Math.min(yr, c.duree));
              totD += d; totR += reste;
              return detail ? `<td class="r">${fN(d)}</td><td class="r mute">${fN(reste)}</td>` : `<td class="r">${fN(d)}</td>`;
            }).join("");
            return `<tr><td class="c">${yr}</td>${cells}<td class="r" style="font-weight:700">${fN(totD)}</td><td class="r">${fN(totR)}</td></tr>`;
          }).join("")}
</table>
<p class="foot-note">Bases : ${amortCols.map(c => `${c.label.toLowerCase()} ${fE(c.base)} / ${c.duree} ans`).join(" ; ")}.</p>
<p class="foot-note">Base totale : ${fE(baseAmortissableTotale)}. Terrain exclu : ${fE(terrainVal)}.${amortMaxDuree < HORIZON ? ` Années ${amortMaxDuree + 1} à ${HORIZON} : dotations et bases restantes nulles.` : ""} Plan du dossier à confirmer comptablement. La dotation effectivement déduite chaque année figure en annexe A, colonne « Amort. déduit ».</p>`,
        });
      }
    }

    /* ANNEXE C — Revente : calculs et hypothèses */
    const horizonsC = Array.from(new Set([10, duree, Math.min(35, HORIZON)].filter(n => n >= 1 && n <= HORIZON))).sort((a, b) => a - b);
    const lignesC = horizonsC.flatMap(N => [false, true].map(hausse => {
      const pv = hausse ? prixRevente * Math.pow(1.01, N) : prixRevente;
      const v = calcVente(N, pv);
      const cum = cumulCf(proj, N);
      return `<tr${hausse ? "" : ` class="grp"`}><td class="c">${N} ans</td><td class="r">${fN(v.prixVente)}</td><td class="r">${fN(v.dette)}</td><td class="r">${isMicro ? "—" : fN(v.amortReintegre)}</td><td class="r">${fN(v.prixFiscal)}</td><td class="r">${fN(v.pvBrute)}</td><td class="r">${fN(v.ir)}</td><td class="r">${fN(v.ps)}</td><td class="r" style="font-weight:700">${fN(v.net)}</td><td class="r" style="color:${col(cum)}">${fN(cum)}</td><td class="r" style="font-weight:700;color:${col(v.net + cum)}">${fN(v.net + cum)}</td></tr>`;
    }));
    const sensibilite = horizonsC.map(N => {
      const a = calcVente(N, prixRevente, true).net;
      const b = calcVente(N, prixRevente, false).net;
      return `<tr><td>${N} ans · prix stable</td><td class="r">${fE(a)}</td><td class="r">${fE(b)}</td><td class="r" style="color:${col(a - b)}">${sE(a - b)}</td></tr>`;
    }).join("");
    const forfaitRetenu = Math.max(travaux, prix * 0.15);

    pages.push({
      badge: "C", titre: "Revente : calculs et hypothèses",
      sous: `Ventes après ${horizonsC.join(", ")} années pleines · ${regimeLabel} conservé · Montants en euros, avant frais de vente.`,
      corps: `
<table class="tbl dense">
  <tr><th class="c">Durée</th><th class="r">Prix de vente</th><th class="r">Dette restante</th><th class="r">Amort. réintégré</th><th class="r">Prix fiscal ajusté<sup>1</sup></th><th class="r">Plus-value brute</th><th class="r">IR sur plus-value</th><th class="r">PS sur plus-value</th><th class="r">Net de revente</th><th class="r">Cash-flow cumulé</th><th class="r">Total projet<sup>2</sup></th></tr>
  ${lignesC.join("")}
</table>
<p class="foot-note">Pour chaque durée : première ligne à prix stable ; deuxième ligne avec une hausse de 1 % par an. <sup>1</sup> Prix fiscal ajusté = ${fN(prix)} + ${fN(notaire)} de frais${travaux > 0 || forfaitRetenu > 0 ? ` + travaux réels ou forfait de 15 % (${fN(forfaitRetenu)}) au-delà de 5 ans` : ""}${isMicro ? "" : ` − amortissements déduits`}. <sup>2</sup> Total projet = produit net de revente + cash-flow cumulé ; l'apport saisi ${apport > 0 ? `de ${fE(apport)} n'en est pas déduit` : `est nul`}.</p>
<p class="foot-note">Abattements retenus : ${horizonsC.map(N => `à ${N} ans, IR ${fPc(abattIR(N) * 100)} et PS ${fPc(abattPS(N) * 100)}`).join(" ; ")}. Taux : IR ${fP(TAUX_IR_PLUSVALUE * 100, 0)}, PS ${fP(TAUX_PS_PLUSVALUE * 100, 1)}. Aucune surtaxe de plus-value n'est déclenchée dans les scénarios présentés.</p>

<div class="sec tight">SENSIBILITÉ AU FORFAIT FISCAL TRAVAUX DE 15 %</div>
<table class="tbl">
  <tr><th>Produit net à prix stable</th><th class="r">Avec forfait retenu</th><th class="r">Sans forfait</th><th class="r">Écart</th></tr>
  ${sensibilite}
</table>
<p class="foot-note">Art. 150 VB II 4° du CGI : au-delà de cinq ans de détention, le vendeur peut retenir un forfait de 15 % du prix d'acquisition au titre des travaux, sans justificatif, s'il lui est plus favorable que ses travaux réels.</p>`,
    });

    /* ── Assemblage ─────────────────────────────────────────────────────────── */
    const nb = pages.length;
    const body = pages.map((p, i) => `
<div class="page">
  <div class="hdr">
    <div><div class="hdr-t">TOUTLMNP · RAPPORT COMPLET</div><div class="hdr-s">${bienLigne}</div></div>
    <div><div class="hdr-d">Données du ${today}</div><div class="hdr-d">${regimeLabel}</div></div>
  </div>
  <div class="ptitle"><div class="ptitle-n${p.badge.length > 2 ? " wide" : ""}">${p.badge}</div><div class="ptitle-l">${p.titre}</div></div>
  <div class="psub">${p.sous}</div>
  ${p.corps}
  <div class="ftr"><span>toutlmnp.fr · Simulation indicative</span><span>${i + 1} / ${nb}</span><span>${today}</span></div>
</div>`).join("");

    const css = `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#D0C9BC;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;background:#FDF9F3;margin:14px auto;padding:11mm 13mm 16mm;position:relative;page-break-after:always;box-shadow:0 3px 24px rgba(0,0,0,0.22)}
.page:last-child{page-break-after:avoid}
.no-print{position:sticky;top:0;z-index:100;background:#1A4A35;padding:10px 20px;display:flex;align-items:center;justify-content:space-between}
.no-print button{background:#C95B2A;color:#fff;border:none;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer}
.no-print span{color:#F5F0E8;font-size:13px}

.hdr{background:#4E1F12;border-radius:8px;padding:9px 16px;display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:11px}
.hdr-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.11em;color:#F5F0E8}
.hdr-s{font-size:12px;color:rgba(245,240,232,0.62);margin-top:2px}
.hdr-d{font-size:12px;color:rgba(245,240,232,0.72);text-align:right;line-height:1.5}

.ptitle{display:flex;align-items:center;gap:13px;margin-bottom:5px}
.ptitle-n{min-width:34px;height:32px;padding:0 9px;border-radius:7px;background:#C95B2A;color:#F5F0E8;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ptitle-n.wide{font-size:14px}
.ptitle-l{font-size:25px;font-weight:800;color:#C95B2A;letter-spacing:-.02em;line-height:1.1}
.psub{font-size:12px;color:rgba(26,22,18,0.5);margin-bottom:11px}

.sec{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#C95B2A;text-align:center;margin:7px 0 7px}
.sec.tight{margin-top:13px}

.duo{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.box{border-radius:8px;padding:9px 13px 10px;border-left:3px solid transparent}
.box.gr{background:#E9EFE9;border-left-color:#1A6644}
.box.or{background:#FAECE2;border-left-color:#C95B2A}
.box.rd{background:#F6EBE7;border-left-color:#B03A2A}
.box.bl{background:#E9EEF2;border-left-color:#2A5C8A}
.box-h{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#1A1612;margin-bottom:5px}
.ir{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:2.5px 0;border-bottom:.5px solid rgba(26,22,18,0.07)}
.ir:last-child{border-bottom:none}
.ir-l{font-size:12px;color:rgba(26,22,18,0.58)}
.ir-v{font-size:12px;font-weight:700;color:#1A1612;text-align:right;white-space:nowrap}

.para{font-size:12px;line-height:1.55;color:rgba(26,22,18,0.78);margin-top:8px}
.foot-note{font-size:12px;line-height:1.5;color:rgba(26,22,18,0.45);margin-top:6px}

.kpis{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px}
.kpi{border-radius:8px;padding:9px 14px;background:#F1EDE5}
.kpi-l{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:rgba(26,22,18,0.5);margin-bottom:6px}
.kpi-v{font-size:21px;font-weight:800;letter-spacing:-.025em;color:#1A1612;line-height:1}
.kpi-s{font-size:12px;color:rgba(26,22,18,0.45);margin-top:6px}

table.tbl{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}
table.tbl th{background:#4E1F12;color:#F5F0E8;padding:5px 8px;text-align:left;font-weight:700;font-size:12px}
table.tbl th.r{text-align:right}
table.tbl th.c{text-align:center}
table.tbl td{padding:4px 8px;border-bottom:.5px solid rgba(26,22,18,0.09);font-size:12px}
table.tbl tr:nth-child(even) td{background:rgba(26,22,18,0.028)}
table.tbl .r{text-align:right}
table.tbl .c{text-align:center}
table.tbl tr.strong td{font-weight:800}
table.tbl tr.or td{color:#C95B2A}
table.tbl.compact td,table.tbl.compact th{padding:4px 7px}
table.tbl.dense{font-size:10.5px;margin-top:2px}
table.tbl.dense th{font-size:10px;padding:4px 3px;line-height:1.25}
table.tbl.dense th.sub{font-size:9.5px;font-weight:600;background:#6B3423}
table.tbl.dense td{font-size:10.5px;padding:2.6px 3px;white-space:nowrap}
table.tbl.dense td.mute{color:rgba(26,22,18,0.45)}
table.tbl.dense tr.grp td{border-top:1px solid rgba(26,22,18,0.22)}

.cmp{display:grid;grid-template-columns:1fr 34px 1fr;align-items:stretch}
.cmp-c{border-radius:8px;overflow:hidden;background:#F1EDE5}
.cmp-h{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;text-align:center;padding:7px 8px;color:#F5F0E8;background:rgba(26,22,18,0.4)}
.cmp-h em{font-style:normal;font-weight:700;opacity:.8}
.cmp-c.on .cmp-h,.cmp-c.on2 .cmp-h{}
.cmp-c.on{background:#E9EFE9}
.cmp-c.on .cmp-h{background:#1A6644}
.cmp-c.on2{background:#FAECE2}
.cmp-c.on2 .cmp-h{background:#C95B2A}
.cmp-c.off .cmp-h{background:#8A7F74}
.cmp-r{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:5px 13px;font-size:12px;border-bottom:.5px solid rgba(26,22,18,0.08)}
.cmp-k{color:rgba(26,22,18,0.62)}
.cmp-v{font-weight:700;color:#1A1612;white-space:nowrap}
.cmp-r.cf{border-bottom:none}
.cmp-r.cf .cmp-k{font-weight:700;color:#1A1612}
.cmp-c.on .cmp-r.cf .cmp-v{color:#1A6644}
.cmp-c.on2 .cmp-r.cf .cmp-v{color:#C95B2A}
.vs{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:rgba(26,22,18,0.35)}

.graph{background:#F1EDE5;border-radius:8px;padding:9px 11px 6px;margin-top:4px}
.graph-lg{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;margin-bottom:2px}
.glbl{font-size:12px;font-weight:700;color:rgba(26,22,18,0.72)}
.glbl i{display:inline-block;width:18px;height:3.5px;vertical-align:middle;margin-right:7px;border-radius:2px}

.reg-bar{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#F5F0E8;border-radius:6px;padding:5px 12px;margin:9px 0 6px}
.reg-bar.gr{background:#1A6644}
.reg-bar.or{background:#C95B2A}
.est3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}
.est{background:#F1EDE5;border-radius:7px;overflow:hidden}
.est-h{background:rgba(26,22,18,0.07);padding:5px 9px}
.est-t{font-size:12px;font-weight:800;color:#1A1612}
.est-s{font-size:12px;color:rgba(26,22,18,0.5);margin-top:1px}
.est-b{padding:5px 9px 7px}
.er{display:flex;justify-content:space-between;gap:6px;font-size:12px;padding:2px 0;border-bottom:.5px solid rgba(26,22,18,0.07)}
.er span{color:rgba(26,22,18,0.58)}
.er b{font-weight:700;white-space:nowrap}
.er.tot{border-bottom:none;border-top:1px solid rgba(26,22,18,0.18);margin-top:3px;padding-top:4px}
.er.tot span{font-weight:700;color:#1A1612}
.er.sub{border-bottom:none;padding-top:0}
.er.sub span{color:rgba(26,22,18,0.42)}

.recap{background:#F1EDE5;border-radius:8px;padding:10px 14px;font-size:12px;line-height:1.55;color:rgba(26,22,18,0.78)}
.scn-h{margin-top:11px;display:grid;grid-template-columns:1fr 150px 150px;gap:8px;font-size:12px;font-weight:800;letter-spacing:.07em;color:#C95B2A;padding:0 14px 5px}
.scn-h span:not(:first-child){text-align:center}
.scn{display:grid;grid-template-columns:1fr 150px 150px;gap:8px;align-items:center;background:#E9EFE9;border-radius:7px;padding:8px 14px;margin-bottom:6px}
.scn.last{background:#F6EBE7}
.scn-l{font-size:12px;font-weight:700;color:#1A1612}
.scn-v{text-align:center}
.scn-v b{display:block;font-size:17px;font-weight:800}
.scn-v em{display:block;font-size:12px;font-style:normal;color:rgba(26,22,18,0.42);margin-top:1px}

.vnt3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:4px}
.vnt{background:#F1EDE5;border-radius:8px;padding:9px 12px 10px}
.vnt-t{font-size:16px;font-weight:800;color:#C95B2A;letter-spacing:-.01em;margin-bottom:6px}
.vr{margin-bottom:4px}
.vr span{display:block;font-size:12px;color:rgba(26,22,18,0.52)}
.vr b{display:block;font-size:12px;font-weight:700;color:#1A1612}
.vnt-f{border-top:1px solid rgba(26,22,18,0.16);padding-top:6px;margin-top:6px}
.vnt-f span{display:block;font-size:12px;font-weight:800;color:#1A6644;letter-spacing:.03em}
.vnt-f b{display:block;font-size:19px;font-weight:800;margin-top:2px}
.vnt-caps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:5px}
.vnt-caps span{font-size:12px;color:rgba(26,22,18,0.48);text-align:center}

.sep{height:1.5px;background:rgba(201,91,42,0.35);margin:11px 0 3px}
.rg{display:grid;grid-template-columns:185px 1fr;gap:14px;align-items:center;background:#F1EDE5;border-radius:7px;padding:8px 14px;margin-bottom:7px}
.rg-v{font-size:19px;font-weight:800;letter-spacing:-.02em;color:#1A1612;white-space:nowrap}
.rg-t{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#C95B2A;margin-bottom:2px}
.rg-d{font-size:12px;line-height:1.5;color:rgba(26,22,18,0.72)}

.info{border-radius:8px;padding:10px 15px;display:flex;align-items:center;gap:15px;margin-top:11px}
.info.gr{background:#1A6644}
.info.br{background:#4E1F12}
.info.sl{background:#4A5D6B}
.info-b{flex:0 0 auto;border-radius:20px;padding:7px 17px;font-size:12px;font-weight:800;letter-spacing:.09em;color:#F5F0E8;background:rgba(245,240,232,0.18);white-space:nowrap}
.info.br .info-b{background:rgba(201,91,42,0.55)}
.info-c{flex:1;min-width:0}
.info-t{font-size:13px;font-weight:700;color:#F5F0E8;margin-bottom:4px}
.info-x{font-size:12px;color:rgba(245,240,232,0.84);line-height:1.5}
.info-x strong{color:#F5F0E8}

.ftr{position:absolute;bottom:10mm;left:13mm;right:13mm;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(26,22,18,0.4);border-top:.5px solid rgba(26,22,18,0.12);padding-top:6px}

@media print{
  html,body{background:#FDF9F3;padding:0;margin:0}
  .no-print{display:none}
  .page{margin:0;box-shadow:none;min-height:297mm;background:#FDF9F3}
  .page:last-child{page-break-after:avoid}
}
`;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>ToutLMNP · Rapport complet — ${bienLigne}</title><style>${css}</style></head>
<body>
<div class="no-print"><span>Rapport complet · ${nb} pages · Utilisez « Enregistrer au format PDF »</span><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
${body}
</body></html>`;
  };

  // ─── RÉSUMÉ PDF BUILDER ───────────────────────────────────────────────────
  // ─── RÉSUMÉ PDF BUILDER ───────────────────────────────────────────────────
  const buildResumePdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const amortDureeMobilier = amortDureeMobilierRef.current;
    const amortDureeTravaux = amortDureeTravauxRef.current;
    const amortDureeNotaire = amortDureeNotaireRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
    const selectedRegime = selectedRegimeRef.current;
    const isMicro = selectedRegime === "micro";
    const abattPct = isSaisonnier ? 0.30 : 0.50;

    const fE = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
    const fP = (v: number, d = 2) => v.toFixed(d).replace(".", ",") + " %";

    const prix = parseFloat(f.prix) || 0;
    const travaux = parseFloat(f.travaux) || 0;
    const notaire = parseFloat(f.notaire) || 0;
    const mobilier = parseFloat(f.mobilier) || 0;
    const apport = parseFloat(f.apport) || 0;
    const taux = parseFloat(f.taux) / 100 || 0;
    const duree = f.duree;
    const tmi = f.tmi;

    const investTotal = res.investTotal;
    const montantCredit = res.montantCredit;
    const mensualite = res.mensualite;
    const creditAnnuel = res.creditAnnuel; // capital + intérêts annuels
    const interetsAnnee1 = res.interetsAnnee1;
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;
    const loyerAnnuel = res.loyerAnnuel;
    const chargesLocatairesAnnuel = (parseFloat(f.chargesLoyer) || 0) * 12;
    const recettesAnnuelles = loyerAnnuel + chargesLocatairesAnnuel;
    const amortTotalAn1 = res.amortTotal;
    const baseImposableReel = res.baseImposableReel;
    const impotReel = res.impotReel;
    const baseBIC = res.baseBIC;
    const impotBIC = res.impotBIC;
    const rendBrut = res.rendementBrut;
    const rendNetReel = res.rendementNetReel;
    const rendNetBIC = res.rendementNetBIC;
    const rendChosen = isMicro ? rendNetBIC : rendNetReel;
    const cfMensuel = isMicro ? res.cashflowBICMensuel : res.cashflowReelMensuel;

    // Amort annuel par composant
    const valeurAmortissable = prix * amortPct / 100;
    const amortBienAn = amortMode === "ensemble"
      ? valeurAmortissable / amortDureeEnsemble
      : composants.reduce((s, c) => s + (valeurAmortissable * c.pct / 100) / c.duree, 0);
    const amortMobilierAn = amortDureeMobilier > 0 && mobilier > 0 ? mobilier / amortDureeMobilier : 0;
    const amortTravauxAn = amortDureeTravaux > 0 && travaux > 0 ? travaux / amortDureeTravaux : 0;
    const amortNotaireAn = amortDureeNotaire > 0 && notaire > 0 ? notaire / amortDureeNotaire : 0;
    const amortLabel = amortMode === "ensemble"
      ? `amortissement global simplifié (${amortPct} % du prix sur ${amortDureeEnsemble} ans)`
      : `amortissement par composants (${amortPct} % du prix ventilés par élément)`;

    // Charges détail
    const taxeFonciere = parseFloat(f.taxeFonciere) || 0;
    const chargesCopro = parseFloat(f.chargesCopro) || 0;
    const pnoPct = parseFloat(f.assurancePNO) || 0;
    const pnoEur = loyerAnnuel * pnoPct / 100;
    const gestionPct = parseFloat(f.gestionLocativePct) || 0;
    const gestionEur = loyerAnnuel * gestionPct / 100;
    const entretien = parseFloat(f.entretienCourant) || 0;
    const compta = parseFloat(f.comptabilite) || 0;
    const totalChargesHorsCredit = taxeFonciere + chargesCopro + pnoEur + gestionEur + entretien + compta;
    const totalIntAssu = interetsAnnee1 + assuranceEmprunteurAnnuel;

    // Credit total annuel (capital + intérêts + assurance emprunteur)
    const creditTotalAnnuel = creditAnnuel + assuranceEmprunteurAnnuel;

    // Interest schedule
    const r = taux / 12;
    const nMois = duree * 12;
    const M = montantCredit > 0 && taux > 0
      ? montantCredit * r * Math.pow(1 + r, nMois) / (Math.pow(1 + r, nMois) - 1)
      : (nMois > 0 ? montantCredit / nMois : 0);

    // Year-by-year projection
    type Proj = { year: number; interets: number; capital: number; capCumul: number; amort: number; amortImpute: number; reportSortant: number; amortImputeCumul: number; impot: number; cfAnnuel: number; capRestant: number; capDebut: number };
    // Projection issue du moteur unique (lib/computeResultats) — identique aux autres rapports
    const projParams = {
      prix, travaux, mobilier, notaire,
      montantCredit, duree, taux,
      loyerAnnuel, chargesLocatairesAnnuel,
      chargesAnnuelles, assuranceEmprunteurAnnuel,
      tmi, amortPct, amortMode, amortDureeEnsemble, composants,
      amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
      isSaisonnier,
    };
    // Les deux régimes, pour pouvoir les comparer dans le temps
    const projReel = computeProjection({ ...projParams, isMicro: false });
    const projMicro = computeProjection({ ...projParams, isMicro: true });
    const projection = isMicro ? projMicro : projReel;
    const allYears: Proj[] = projection.map(y => ({
      year: y.year,
      interets: y.interets,
      capital: y.capitalRembourse,
      capCumul: y.capitalRembourseCumul,
      amort: y.amortDotation,
      amortImpute: y.amortImpute,
      reportSortant: y.reportSortant,
      amortImputeCumul: y.amortImputeCumul,
      impot: y.impot,
      cfAnnuel: y.cashflowAnnuel,
      capRestant: y.capitalFin,
      capDebut: y.capitalDebut,
    }));

    const getYear = (y: number) => allYears.find(rr => rr.year === y) || allYears[allYears.length - 1];

    /* ── Agrégats des deux régimes (page 1 et commentaires) ──────────────── */
    const cumulCfReel = projReel.slice(0, duree).reduce((sum, y) => sum + y.cashflowAnnuel, 0);
    const cumulCfMicro = projMicro.slice(0, duree).reduce((sum, y) => sum + y.cashflowAnnuel, 0);
    const apresReelAn = projReel[duree]?.cashflowAnnuel ?? 0;
    const apresMicroAn = projMicro[duree]?.cashflowAnnuel ?? 0;
    const cumulCfChoisi = isMicro ? cumulCfMicro : cumulCfReel;
    const apresChoisiAn = isMicro ? apresMicroAn : apresReelAn;
    const cumulImpotCredit = projection.slice(0, duree).reduce((sum, y) => sum + y.impot, 0);
    const ecartImpotAn1 = impotBIC - impotReel;          // > 0 : le réel coûte moins cher
    const ecartCumulCf = cumulCfMicro - cumulCfReel;     // > 0 : le micro laisse plus de trésorerie
    // Année où les deux régimes se rejoignent (croisement des cash-flow annuels)
    const anneeEgalite = (() => {
      const n = Math.min(projReel.length, projMicro.length, duree);
      for (let i = 1; i < n; i++) {
        const d0 = projReel[i].cashflowAnnuel - projMicro[i].cashflowAnnuel;
        const dPrev = projReel[i - 1].cashflowAnnuel - projMicro[i - 1].cashflowAnnuel;
        if ((dPrev > 0 && d0 <= 0) || (dPrev < 0 && d0 >= 0)) return projReel[i].year;
      }
      return null;
    })();

    /* ── Saisonnier : les trois scénarios d'occupation ───────────────────── */
    const prixNuitee = parseFloat(prixNuiteeRef.current) || 0;
    const tauxOcc = {
      bas: parseFloat(tauxOccBasRef.current) || 0,
      moyen: parseFloat(tauxOccMoyenRef.current) || 0,
      haut: parseFloat(tauxOccHautRef.current) || 0,
    };
    const triple = resultatsTripleRef.current;
    const scenariosSaison = (["bas", "moyen", "haut"] as const).map(k => {
      const rr = triple?.[k] ?? null;
      const occ = tauxOcc[k];
      return {
        cle: k,
        label: k === "bas" ? "Scénario bas" : k === "moyen" ? "Scénario médian" : "Scénario haut",
        occ,
        nuits: Math.round(365 * occ / 100),
        loyerAnnuel: rr?.loyerAnnuel ?? 0,
        impot: rr ? (isMicro ? rr.impotBIC : rr.impotReel) : 0,
        base: rr ? (isMicro ? rr.baseBIC : rr.baseImposableReel) : 0,
        cfMensuel: rr ? (isMicro ? rr.cashflowBICMensuel : rr.cashflowReelMensuel) : 0,
        rendBrut: rr?.rendementBrut ?? 0,
        median: k === "moyen",
      };
    });


    // Table years
    const tableYearsSet = new Set([1, 3, 5, 10, 15, 20, duree, duree + 5].filter(y => y >= 1));
    const TABLE_YEARS = Array.from(tableYearsSet).sort((a, b) => a - b);



    // ── Impôt line graph ──────────────────────────────────────────────────────



    /* ── Graphe page 2 : cash-flow, impôt et amortissement, une seule échelle ── */
    const makeImpotAmortGraph = (): string => {
      const gW = 690, gH = 152;
      const PADL = 70, PADR = 78, PADT = 22, PADB = 34;
      const iW = gW - PADL - PADR, iH = gH - PADT - PADB;
      const lastYear = duree + 5;
      const pts = projection.filter(y => y.year <= lastYear);

      const niceScale = (lo: number, hi: number, n: number) => {
        if (hi - lo < 1) hi = lo + 1;
        const raw = (hi - lo) / n;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const mult = [1, 2, 2.5, 5, 10].find(m => m * mag >= raw) ?? 10;
        const st = mult * mag;
        return { min: Math.floor(lo / st) * st, max: Math.ceil(hi / st) * st };
      };
      const nT = 4;
      const allV = [...pts.map(p => p.cashflowAnnuel), ...pts.map(p => p.impot), ...(isMicro ? [] : pts.map(p => p.amortDotation))];
      const sc = niceScale(Math.min(0, ...allV), Math.max(...allV, 1), nT);
      const yMin = sc.min, yMax = sc.max, yR = (yMax - yMin) || 1;

      const toX = (yr: number) => PADL + ((yr - 1) / Math.max(lastYear - 1, 1)) * iW;
      const toY = (v: number) => PADT + (1 - (v - yMin) / yR) * iH;

      const grid = Array.from({ length: nT + 1 }, (_, i) => {
        const t = i / nT, v = yMin + t * yR, y = PADT + (1 - t) * iH;
        return `<line x1="${PADL}" y1="${y.toFixed(1)}" x2="${PADL + iW}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.10)" stroke-width="1"/>
<text x="${PADL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" font-weight="700" fill="rgba(26,22,18,0.5)">${Math.round(v).toLocaleString("fr-FR")}</text>`;
      }).join("");

      const zero = yMin < 0 ? `<line x1="${PADL}" y1="${toY(0).toFixed(1)}" x2="${PADL + iW}" y2="${toY(0).toFixed(1)}" stroke="rgba(26,22,18,0.32)" stroke-width="1.1" stroke-dasharray="4 3"/>` : "";

      const barW = Math.max(3, Math.min(15, (iW / pts.length) * 0.52));
      const bars = isMicro ? "" : pts.filter(p => p.amortDotation > 0).map(p => {
        const y = toY(p.amortDotation), y0 = toY(Math.max(yMin, 0));
        return `<rect x="${(toX(p.year) - barW / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(1, y0 - y).toFixed(1)}" fill="rgba(42,92,138,0.30)" rx="1.5"/>`;
      }).join("");

      const serie = (get: (p: typeof pts[0]) => number, color: string) => {
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(get(p)).toFixed(1)}`).join(" ");
        const dots = pts.map(p => `<circle cx="${toX(p.year).toFixed(1)}" cy="${toY(get(p)).toFixed(1)}" r="2.6" fill="${color}" stroke="#F5F0E8" stroke-width="1"/>`).join("");
        return `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
      };

      const xFin = toX(duree);
      const finLine = montantCredit > 0
        ? `<line x1="${xFin.toFixed(1)}" y1="${PADT - 8}" x2="${xFin.toFixed(1)}" y2="${PADT + iH}" stroke="#C95B2A" stroke-width="1.3" stroke-dasharray="5 3"/>`
        : "";

      const stepX = lastYear > 22 ? 5 : lastYear > 12 ? 5 : 2;
      const pinned = [1, lastYear];
      const yrs = new Set<number>(pinned);
      if (montantCredit > 0) yrs.add(duree);
      for (let y = 1; y <= lastYear; y += stepX) if (!Array.from(yrs).some(p => Math.abs(p - y) < 2)) yrs.add(y);
      const xLabels = Array.from(yrs).sort((a, b) => a - b).map(y =>
        `<text x="${toX(y).toFixed(1)}" y="${PADT + iH + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="rgba(26,22,18,0.55)">${y}</text>`).join("");

      // Valeurs de fin de projection, à droite des courbes
      const last = pts[pts.length - 1];
      const endLbl = `<text x="${(PADL + iW + 8).toFixed(1)}" y="${(toY(last.cashflowAnnuel) + 4).toFixed(1)}" font-size="13" font-weight="800" fill="#1A6644">${fE(last.cashflowAnnuel)}</text>
<text x="${(PADL + iW + 8).toFixed(1)}" y="${(toY(last.impot) + 4).toFixed(1)}" font-size="13" font-weight="800" fill="#C95B2A">${fE(last.impot)}</text>`;

      const legende = `<div style="display:flex;gap:26px;flex-wrap:wrap;justify-content:center;margin-top:4px;font-size:12px;font-weight:600;color:rgba(26,22,18,0.7)">
  <span><span style="display:inline-block;width:18px;height:3.5px;background:#1A6644;vertical-align:middle;margin-right:7px;border-radius:2px"></span>Cash-flow / an</span>
  <span><span style="display:inline-block;width:18px;height:3.5px;background:#C95B2A;vertical-align:middle;margin-right:7px;border-radius:2px"></span>Impôt / an</span>
  ${!isMicro ? `<span><span style="display:inline-block;width:12px;height:12px;background:rgba(42,92,138,0.42);vertical-align:middle;margin-right:7px;border-radius:2px"></span>Amortissement / an</span>` : ""}
</div>`;

      return `<div style="background:#EDE7DC;border-radius:9px;padding:11px 13px 9px">
<svg width="${gW}" height="${gH}" viewBox="0 0 ${gW} ${gH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${gW}px">
  <text x="${PADL - 9}" y="16" font-size="12" fill="rgba(26,22,18,0.5)">Une seule échelle · €/an</text>
  ${montantCredit > 0 ? `<text x="${PADL + iW}" y="16" text-anchor="end" font-size="12" font-weight="700" fill="#C95B2A">Fin du crédit · année ${duree}</text>` : ""}
  ${grid}${bars}${zero}${finLine}
  ${serie(p => p.impot, "#C95B2A")}
  ${serie(p => p.cashflowAnnuel, "#1A6644")}
  ${endLbl}
  <line x1="${PADL}" y1="${PADT + iH}" x2="${PADL + iW}" y2="${PADT + iH}" stroke="rgba(26,22,18,0.28)" stroke-width="1.1"/>
  ${xLabels}
  <text x="${PADL + iW / 2}" y="${gH - 6}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.45)">Année</text>
</svg>${legende}</div>`;
    };

    /* ── Page 3 : barres Loyers / Sorties d'une année donnée ─────────────── */
    const makeBarresAnnee = (yr: number): string => {
      const row = getYear(yr);
      const creditAn = yr <= duree ? creditTotalAnnuel : 0;
      const cf = row.cfAnnuel;
      const impotAn = row.impot;
      const chargesAn = chargesAnnuelles;
      const H2 = 232, colW2 = 84, gap2 = 26;
      const total = Math.max(recettesAnnuelles, chargesAn + creditAn + impotAn + Math.max(0, cf), 1);
      const h = (v: number) => Math.max(0, (v / total) * H2);

      const hLoyer = h(recettesAnnuelles);
      const hCf = h(Math.max(0, cf));
      const hCh = h(chargesAn);
      const hCr = h(creditAn);
      const hIm = h(impotAn);

      // Colonne « sorties » empilée de haut en bas : cash-flow, charges, crédit, impôt
      let yCur = H2 - (hCf + hCh + hCr + hIm);
      const segs: string[] = [];
      const push = (hh: number, fill: string, label: string, val: string, txtCol: string) => {
        if (hh <= 0.5) return;
        const y0 = yCur; yCur += hh;
        segs.push(`<rect x="${colW2 + gap2}" y="${y0.toFixed(1)}" width="${colW2}" height="${hh.toFixed(1)}" fill="${fill}"/>`);
        if (hh > 34) segs.push(`<text x="${colW2 + gap2 + colW2 / 2}" y="${(y0 + hh / 2 - 6).toFixed(1)}" text-anchor="middle" font-size="12" fill="${txtCol}" opacity="0.85">${label}</text><text x="${colW2 + gap2 + colW2 / 2}" y="${(y0 + hh / 2 + 10).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="${txtCol}">${val}</text>`);
        else if (hh > 15) segs.push(`<text x="${colW2 + gap2 + colW2 / 2}" y="${(y0 + hh / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${txtCol}">${val}</text>`);
      };
      if (cf >= 0) push(hCf, "#1A6644", "Cash-flow", `+${fE(cf)}`, "#FFFFFF");
      push(hCh, "#8B5A3A", "Charges", fE(chargesAn), "#FFFFFF");
      push(hCr, "#4E1F12", "Crédit", fE(creditAn), "#F5F0E8");
      push(hIm, "#2C0F08", "Impôt", fE(impotAn), "#F5A623");

      const W2 = colW2 * 2 + gap2;
      return `<svg width="${W2}" height="${H2 + 20}" viewBox="0 0 ${W2} ${H2 + 20}" xmlns="http://www.w3.org/2000/svg" style="flex:0 0 auto">
  <rect x="0" y="${(H2 - hLoyer).toFixed(1)}" width="${colW2}" height="${hLoyer.toFixed(1)}" fill="#1A6644" rx="3"/>
  <text x="${colW2 / 2}" y="${(H2 - hLoyer / 2 - 6).toFixed(1)}" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.8)">Loyers</text>
  <text x="${colW2 / 2}" y="${(H2 - hLoyer / 2 + 10).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="#FFFFFF">${fE(recettesAnnuelles)}</text>
  ${segs.join("")}
  <text x="${colW2 / 2}" y="${H2 + 14}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.5)">Loyers</text>
  <text x="${colW2 + gap2 + colW2 / 2}" y="${H2 + 14}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.5)">Sorties</text>
</svg>`;
    };

    /* ── Page 3 : frise verticale des années ─────────────────────────────── */
    const makeFrise = (): string => {
      const hauteur = 760;
      const dernier = duree + 5;
      const reperes = [1, duree + 1];
      // jalons réguliers, en écartant ceux qui tomberaient sur un repère
      const jalons = [5, 10, 15, 20, 25, 30, 35]
        .filter(v => v <= dernier && reperes.every(rp => Math.abs(rp - v) >= 3));
      const yOf = (an: number) => 16 + (an / dernier) * (hauteur - 40);
      const marques = jalons.map(an =>
        `<line x1="14" y1="${yOf(an).toFixed(1)}" x2="22" y2="${yOf(an).toFixed(1)}" stroke="rgba(201,91,42,0.5)" stroke-width="1.3"/>
<text x="27" y="${(yOf(an) + 4).toFixed(1)}" font-size="12" fill="rgba(26,22,18,0.45)">${an}</text>`).join("");
      const repere = (an: number, txt: string) =>
        `<circle cx="18" cy="${yOf(an).toFixed(1)}" r="4.5" fill="#C95B2A"/>
<text x="27" y="${(yOf(an) + 4).toFixed(1)}" font-size="12" font-weight="800" fill="#C95B2A">${txt}</text>`;
      return `<svg width="76" height="${hauteur}" viewBox="0 0 76 ${hauteur}" xmlns="http://www.w3.org/2000/svg">
  <line x1="18" y1="10" x2="18" y2="${hauteur - 14}" stroke="#C95B2A" stroke-width="1.6"/>
  <polygon points="18,${hauteur - 4} 14,${hauteur - 14} 22,${hauteur - 14}" fill="#C95B2A"/>
  ${marques}
  ${repere(1, "An 1")}
  ${repere(duree + 1, `An ${duree + 1}`)}
</svg>`;
    };

    // ── Détail de l'amortissement retenu (rien en Micro-BIC) ───────────────────
    const makeAmortDetail = (): string => {
      if (isMicro) return "";
      const lignes: { label: string; base: string; duree: string; montant: number }[] = [];
      if (amortMode === "ensemble") {
        lignes.push({ label: "Bien immobilier (hors terrain)", base: `${amortPct} % de ${fE(prix)}`, duree: `${amortDureeEnsemble} ans`, montant: amortBienAn });
      } else {
        composants.forEach(c => lignes.push({
          label: c.label,
          base: `${c.pct} % de ${fE(valeurAmortissable)}`,
          duree: `${c.duree} ans`,
          montant: (valeurAmortissable * c.pct / 100) / c.duree,
        }));
      }
      if (amortMobilierAn > 0) lignes.push({ label: "Mobilier", base: fE(mobilier), duree: `${amortDureeMobilier} ans`, montant: amortMobilierAn });
      if (amortTravauxAn > 0) lignes.push({ label: "Travaux", base: fE(travaux), duree: `${amortDureeTravaux} ans`, montant: amortTravauxAn });
      if (amortNotaireAn > 0) lignes.push({ label: "Frais de notaire", base: fE(notaire), duree: `${amortDureeNotaire} ans`, montant: amortNotaireAn });

      const rows = lignes.map(l => `<tr>
  <td style="padding:3px 8px;color:rgba(26,22,18,0.75)">${l.label}</td>
  <td style="padding:3px 8px;color:rgba(26,22,18,0.5)">${l.base}</td>
  <td style="padding:3px 8px;text-align:center;color:rgba(26,22,18,0.5)">${l.duree}</td>
  <td style="padding:3px 8px;text-align:right;font-weight:700;color:#2A5C8A">${fE(l.montant)}/an</td>
</tr>`).join("");

      return `<div style="background:#EDE7DC;border-radius:8px;overflow:hidden;margin-top:10px">
  <div style="background:rgba(42,92,138,0.12);padding:6px 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#2A5C8A">
    Détail de votre amortissement · ${amortMode === "ensemble" ? "méthode globale simplifiée" : "méthode par composants"}
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed">
    <tr style="background:rgba(26,22,18,0.04)">
      <td style="padding:3px 8px;font-size:12px;font-weight:700;color:rgba(26,22,18,0.5)">Élément</td>
      <td style="padding:4px 8px;font-size:12px;font-weight:700;color:rgba(26,22,18,0.5)">Base amortissable</td>
      <td style="padding:4px 8px;font-size:12px;font-weight:700;text-align:center;color:rgba(26,22,18,0.5)">Durée</td>
      <td style="padding:4px 8px;font-size:12px;font-weight:700;text-align:right;color:rgba(26,22,18,0.5)">Dotation</td>
    </tr>
    ${rows}
    <tr style="background:rgba(42,92,138,0.10);border-top:1.5px solid rgba(42,92,138,0.3)">
      <td colspan="3" style="padding:6px 8px;font-weight:700;color:#2A5C8A">Total amortissement année 1</td>
      <td style="padding:6px 8px;text-align:right;font-weight:800;color:#2A5C8A;font-size:14px">${fE(amortTotalAn1)}/an</td>
    </tr>
  </table>
</div>`;
    };

    // ── Abattements PV ────────────────────────────────────────────────────────
    const abattIR = (N: number) => N < 6 ? 0 : N >= 22 ? 1 : (N - 5) * 0.06;
    const abattPS = (N: number) => { if (N < 6) return 0; if (N >= 30) return 1; if (N >= 22) return 0.28 + (N - 22) * 0.09; return (N - 5) * 0.0165; };

    // ── Conclusion ────────────────────────────────────────────────────────────
    const dureeY = duree;
    const sumLoyers = allYears.filter(rr => rr.year <= dureeY).length * loyerAnnuel;
    const sumImpot = allYears.filter(rr => rr.year <= dureeY).reduce((s, rr) => s + rr.impot, 0);
    const sumCF = allYears.filter(rr => rr.year <= dureeY).reduce((s, rr) => s + rr.cfAnnuel, 0);
    // Cumuls issus du moteur : amortissements réellement imputés (pas une dotation figée)
    const rowFin = getYear(dureeY);
    const amortCumulFinal = rowFin.amortImputeCumul;
    const amortImmoFinal = amortCumulFinal;

    // Plus-value : valeur du bien (hors frais d'acquisition) vs prix d'acquisition fiscal
    const prixVenteFinal = prix;
    const abIR = abattIR(dureeY);
    const abPS = abattPS(dureeY);

    // Scénarios de prix de vente à l'horizon (baisse 10 %, stable, +1 %/an)
    // résidu de calcul possible : en dessous de 1 €, le crédit est considéré soldé
    const crdFinBrut = dureeY <= duree ? (getYear(dureeY).capRestant ?? 0) : 0;
    const crdFin = crdFinBrut < 1 ? 0 : crdFinBrut;
    // Prix d'acquisition retenu pour la plus-value immobilière des particuliers :
    // prix + frais d'acquisition réels + travaux (réels ou forfait 15 % au-delà de
    // 5 ans de détention, art. 150 VB II CGI). Le mobilier en est exclu.
    const forfaitTravaux = dureeY > 5 ? Math.max(travaux, prix * 0.15) : travaux;
    const baseAcquisitionPV = prix + notaire + forfaitTravaux;
    const netApres = (prixVente: number) => {
      // Amortissements déduits réintégrés au régime réel (Loi de finances 2025)
      const acq = baseAcquisitionPV - (isMicro ? 0 : amortCumulFinal);
      const pv = Math.max(0, prixVente - acq);
      const tax = pv * (1 - abIR) * TAUX_IR_PLUSVALUE + pv * (1 - abPS) * TAUX_PS_PLUSVALUE;
      return { prixVente, pv, tax, net: prixVente - crdFin - tax };
    };
    const scenariosVente: { label: string; central: boolean; prixVente: number; pv: number; tax: number; net: number }[] = [
      { label: `Baisse de 10 % à l'horizon`, central: false, ...netApres(prix * 0.9) },
      { label: `Valeur stable`, central: true, ...netApres(prix) },
      { label: `Hausse de 1 % par an`, central: false, ...netApres(prix * Math.pow(1.01, dureeY)) },
    ];
    const scenarioCentral = scenariosVente[1];
    const pvBrute = scenarioCentral.pv;
    const impotPV = scenarioCentral.tax;
    const netRevente = scenarioCentral.net;
    const totalCumule = cumulCfChoisi + netRevente;

    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const bienTitle = [
      bienInfo.type === "ap" ? "Appartement" : bienInfo.type === "ma" ? "Maison" : bienInfo.type === "im" ? "Immeuble" : "",
      bienInfo.pieces ? `T${bienInfo.pieces}` : "",
      bienInfo.surface ? `${bienInfo.surface} m²` : "",
      bienInfo.ville || "",
    ].filter(Boolean).join(" · ") || "Bien immobilier";

    const regimeLabel = isMicro ? "Micro-BIC" : "Régime Réel Simplifié";
    const regimeColor = isMicro ? "#2A5C8A" : "#1A6644";
    const regimeAvantage = isMicro
      ? `Simplicité administrative · abattement forfaitaire ${isSaisonnier ? "30" : "50"}% · aucune comptabilité obligatoire`
      : `Déduction de toutes les charges réelles · ${amortMode === "ensemble" ? `amortissement du bien sur ${amortDureeEnsemble} ans` : `amortissement par composants (${Array.from(new Set(composants.map(c => c.duree))).sort((a, b) => a - b).join(" / ")} ans)`} · amortissements non déduits reportables sans limitation de durée`;

    const impotAmortGraphHtml = makeImpotAmortGraph();
    const friseHtml = makeFrise();
    const nbPages = isSaisonnier ? 5 : 4;   // une page de plus en location saisonnière
    const nSaison = 2, nImpot = isSaisonnier ? 3 : 2, nVision = isSaisonnier ? 4 : 3, nFin = isSaisonnier ? 5 : 4;

    // ── CSS ───────────────────────────────────────────────────────────────────
    const css = `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#D0C9BC;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;font-size:12px;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;background:#F5F0E8;margin:14px auto;padding:11mm 13mm 16mm;position:relative;page-break-after:always;box-shadow:0 3px 24px rgba(0,0,0,0.22)}
.page:last-child{page-break-after:avoid}
.no-print{position:sticky;top:0;z-index:100;background:#1A4A35;padding:10px 20px;display:flex;align-items:center;justify-content:space-between}

/* En-tête de page */
.hdr{background:#4E1F12;border-radius:9px;padding:9px 16px;display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:9px}
.hdr-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.13em;color:#F5F0E8}
.hdr-s{font-size:12px;color:rgba(245,240,232,0.6);margin-top:2px}
.hdr-p{font-size:19px;font-weight:400;color:#C95B2A;letter-spacing:-.02em;text-align:right}
.hdr-d{font-size:12px;color:rgba(245,240,232,0.55);text-align:right;margin-top:2px}

/* Titre de page : pastille + libellé */
.ptitle{display:flex;align-items:center;gap:13px;margin-bottom:10px}
.ptitle-n{width:34px;height:34px;border-radius:8px;background:#C95B2A;color:#F5F0E8;font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ptitle-l{font-size:25px;font-weight:800;color:#C95B2A;letter-spacing:-.02em;line-height:1.1}

/* Titre de section centré */
.sec{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#C95B2A;text-align:center;margin:8px 0 5px}
.sec.tight{margin-top:14px}

/* Bandes Acquisition / Financement */
.band{background:#EDE7DC;border-radius:8px;overflow:hidden;margin-bottom:6px}
.band-h{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.55);padding:5px 12px;background:rgba(26,22,18,0.06)}
.band-r{display:flex;align-items:stretch;padding:6px 12px;gap:0}
.cell{flex:1 1 0;min-width:0;padding:0 12px;border-left:1px solid rgba(26,22,18,0.13)}
.cell:first-child{border-left:none;padding-left:0}
.cell-l{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:rgba(26,22,18,0.5);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cell-v{font-size:14px;font-weight:700;color:#1A1612;white-space:nowrap}
.cell.tag{flex:0 0 auto;border-left:none;border-radius:7px;padding:7px 13px;margin-left:10px}
.cell.tag.or{background:rgba(201,91,42,0.10);border:1px solid rgba(201,91,42,0.30)}
.cell.tag.gr{background:rgba(26,102,68,0.09);border:1px solid rgba(26,102,68,0.28)}
.cell.tag.or .cell-v{color:#C95B2A}
.cell.tag.gr .cell-v{color:#1A6644}

/* Cartes indicateurs */
.kpis{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.kpi{border-radius:8px;padding:8px 14px;background:#EDE7DC}
.kpi.or{background:rgba(201,91,42,0.10)}
.kpi.dk{background:#1A6644}
.kpi-l{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:rgba(26,22,18,0.5);margin-bottom:6px}
.kpi-v{font-size:22px;font-weight:800;letter-spacing:-.025em;color:#1A1612;line-height:1}
.kpi.or .kpi-v{color:#C95B2A}
.kpi-s{font-size:12px;color:rgba(26,22,18,0.45);margin-top:6px}
.kpi.dk .kpi-l{color:rgba(245,240,232,0.6)}
.kpi.dk .kpi-v{color:#F5F0E8}
.kpi.dk .kpi-s{color:rgba(245,240,232,0.6)}

/* Comparaison des régimes */
.cmp{display:grid;grid-template-columns:1fr 34px 1fr;align-items:stretch}
.cmp-c{border-radius:8px;padding:8px 12px;background:#EDE7DC}
.cmp-c.on{background:rgba(26,102,68,0.06);border:1.5px solid #1A6644}
.cmp-c.off{background:rgba(26,22,18,0.045)}
.cmp-h{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;text-align:center;margin-bottom:8px}
.cmp-c.on .cmp-h{color:#1A6644}
.cmp-c.off .cmp-h{color:rgba(26,22,18,0.42)}
.cmp-r{display:flex;justify-content:space-between;align-items:baseline;padding:1px 0;font-size:12px}
.cmp-k{color:rgba(26,22,18,0.6)}
.cmp-v{font-weight:700;color:#1A1612;white-space:nowrap}
.cmp-r.am .cmp-k{color:#C95B2A;font-weight:700}
.cmp-r.am .cmp-v{color:#C95B2A}
.cmp-r.cf{border-top:1px solid rgba(26,22,18,0.12);margin-top:4px;padding-top:6px}
.cmp-r.cf .cmp-v{color:#1A6644;font-size:13px}
.cmp-c.off .cmp-r.cf .cmp-v{color:rgba(26,22,18,0.6)}
.vs{display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:rgba(26,22,18,0.35)}

/* Bandeaux INFO CLEF */
.info{border-radius:9px;padding:9px 14px;display:flex;align-items:flex-start;gap:14px;margin-top:8px}
.info.gr{background:#1A6644}
.info.br{background:#4E1F12}
.info-b{flex:0 0 auto;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:800;letter-spacing:.09em;color:#F5F0E8;align-self:center;white-space:nowrap}
.info.gr .info-b{background:rgba(245,240,232,0.16)}
.info.br .info-b{background:rgba(201,91,42,0.55)}
.info-c{flex:1;min-width:0}
.info-t{font-size:13px;font-weight:700;color:#F5F0E8;margin-bottom:4px}
.info-x{font-size:12px;color:rgba(245,240,232,0.82);line-height:1.5}
.info-x strong{color:#F5F0E8}
.info-big{background:#F5F0E8;border-radius:7px;padding:6px 14px;font-size:19px;font-weight:800;color:#1A1612;letter-spacing:-.02em;white-space:nowrap;flex:0 0 auto;align-self:center}

/* Tableaux */
table.tbl{width:100%;border-collapse:collapse;font-size:12px}
table.tbl th{background:#4E1F12;color:#F5F0E8;padding:4px 7px;text-align:left;font-weight:700;font-size:12px}
table.tbl td{padding:3px 7px;border-bottom:.5px solid rgba(26,22,18,0.08);font-size:12px}
table.tbl tr:nth-child(even) td{background:rgba(26,22,18,0.03)}
table.tbl .r{text-align:right}
table.tbl .c{text-align:center}
.note{font-size:12px;color:rgba(26,22,18,0.48);line-height:1.5;margin-top:5px}

/* Bloc amortissement */
.amo{background:rgba(42,92,138,0.07);border-radius:8px;overflow:hidden;margin-top:10px}
.amo-h{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#2A5C8A;padding:5px 13px;background:rgba(42,92,138,0.12)}
.amo table{width:100%;border-collapse:collapse;font-size:12px}
.amo td{padding:1px 13px;color:rgba(26,22,18,0.72)}
.amo .r{text-align:right;font-weight:700;color:#2A5C8A}
.amo .hd td{font-size:12px;color:rgba(26,22,18,0.5);font-weight:700;padding-top:5px}
.amo .tot td{border-top:1.5px solid rgba(42,92,138,0.3);font-weight:800;color:#2A5C8A;padding-top:5px;padding-bottom:6px}

/* Pied de page */
.ftr{position:absolute;bottom:11mm;left:13mm;right:13mm;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(26,22,18,0.4);border-top:.5px solid rgba(26,22,18,0.12);padding-top:6px}

/* Vision d'ensemble : frise + cartes */
.tl{display:flex;gap:14px;align-items:stretch}
.tl-axis{flex:0 0 76px;position:relative}
.tl-card{flex:1;min-width:0;background:#EDE7DC;border-radius:9px;padding:13px 16px}
.tl-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}
.tl-t{font-size:19px;font-weight:800;color:#4E1F12;letter-spacing:-.02em}
.tl-s{font-size:12px;font-weight:700;color:rgba(26,22,18,0.5)}
.tl-b{display:flex;gap:16px;align-items:flex-start}
.tl-txt{flex:1;min-width:0;font-size:12px;line-height:1.65;color:rgba(26,22,18,0.72)}
.tl-txt p{margin-bottom:7px}
.tl-txt p:last-child{margin-bottom:0}

/* Synthèse finale */
.fin{border:1.5px solid rgba(201,91,42,0.4);border-radius:10px;padding:10px 14px;margin-top:9px}
.fin-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px}
.fin-t{font-size:17px;font-weight:800;color:#4E1F12;letter-spacing:-.02em}
.fin-r{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#C95B2A}
.fin-g{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:9px}
.fin-c{background:rgba(26,102,68,0.07);border-radius:7px;padding:6px 12px}
.fin-v{font-size:17px;font-weight:800;color:#1A6644;letter-spacing:-.02em}
.fin-l{font-size:12px;color:rgba(26,22,18,0.5);margin-top:2px}
.fin-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:8px}
.fin-st{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#C95B2A;margin-bottom:4px}
.fin-sx{font-size:12px;line-height:1.5;color:rgba(26,22,18,0.72)}
.fin-tot{border-top:1.5px solid rgba(201,91,42,0.3);padding-top:7px;display:flex;justify-content:space-between;align-items:baseline}
.fin-tl{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#C95B2A}
.fin-tv{font-size:21px;font-weight:800;color:#4E1F12;letter-spacing:-.02em}

@media print{
  html,body{background:#F5F0E8;padding:0;margin:0}
  .no-print{display:none}
  .page{margin:0;box-shadow:none;min-height:297mm;background:#F5F0E8}
  .page:last-child{page-break-after:avoid}
}
`;

    // Fiscal section (replaces amort)
    const fiscalSection = !isMicro ? `
  <div class="sec">Fiscalité · Détail année 1</div>
  <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:6px">
    <!-- Tableau fiscal -->
    <div style="flex:1.2;background:#EDE7DC;border-radius:8px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <tr style="background:rgba(26,22,18,0.05)">
          <td style="padding:6px 10px;color:rgba(26,22,18,0.55)">Recettes fiscales</td>
          <td style="padding:6px 10px;text-align:right;font-weight:600;color:#1A7A52">${fE(recettesAnnuelles)}</td>
        </tr>
        <tr>
          <td style="padding:5px 10px;color:rgba(26,22,18,0.55)">− Charges déductibles</td>
          <td style="padding:5px 10px;text-align:right;font-weight:600;color:#8B1A1A">−${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)}</td>
        </tr>
        <tr style="background:rgba(42,92,138,0.08);border-top:1px solid rgba(42,92,138,0.2);border-bottom:1px solid rgba(42,92,138,0.2)">
          <td style="padding:5px 10px;color:#2A5C8A;font-weight:700">− Amortissements (an. 1)</td>
          <td style="padding:5px 10px;text-align:right;font-weight:700;color:#2A5C8A">−${fE(amortTotalAn1)}</td>
        </tr>
        <tr style="background:rgba(26,22,18,0.04);border-top:1.5px solid rgba(26,22,18,0.15)">
          <td style="padding:5px 10px;color:rgba(26,22,18,0.6);font-weight:600">= Base imposable</td>
          <td style="padding:5px 10px;text-align:right;font-weight:700;color:#1A1612">${fE(baseImposableReel)}</td>
        </tr>
        <tr style="background:#4E1F12">
          <td style="padding:6px 10px;color:#F5F0E8;font-weight:700">Impôt + prél. soc. (18,6%)</td>
          <td style="padding:6px 10px;text-align:right;font-weight:700;color:#F5A623">${fE(impotReel)}</td>
        </tr>
      </table>
    </div>
    <!-- Détail amort -->
    <div style="flex:1;display:flex;flex-direction:column;gap:4px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#2A5C8A;margin-bottom:2px;text-align:center">Détail amortissement</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Bien (${amortPct}% · ${amortDureeEnsemble} ans)</div>
          <div style="font-size:14px;font-weight:600;color:#2A5C8A">${fE(amortBienAn)}/an</div>
        </div>
        ${mobilier > 0 ? `<div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Mobilier (${amortDureeMobilier} ans)</div>
          <div style="font-size:14px;font-weight:600;color:#2A5C8A">${fE(amortMobilierAn)}/an</div>
        </div>` : "<div></div>"}
        ${travaux > 0 ? `<div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Travaux (${amortDureeTravaux} ans)</div>
          <div style="font-size:14px;font-weight:600;color:#2A5C8A">${fE(amortTravauxAn)}/an</div>
        </div>` : "<div></div>"}
        ${notaire > 0 ? `<div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Notaire (${amortDureeNotaire} ans)</div>
          <div style="font-size:14px;font-weight:600;color:#2A5C8A">${fE(amortNotaireAn)}/an</div>
        </div>` : "<div></div>"}
      </div>
      <div style="text-align:center;padding:4px 0;font-size:12px;color:#2A5C8A;font-weight:700;border-top:1.5px solid rgba(42,92,138,0.25);margin-top:2px">Total amort. = ${fE(amortTotalAn1)}/an</div>
    </div>
  </div>
  <!-- Lecture du tableau -->
  <div style="background:rgba(26,102,68,0.06);border-left:2.5px solid #1A6644;border-radius:0 6px 6px 0;padding:7px 10px;margin-bottom:6px">
    <div style="font-size:12px;line-height:1.65;color:rgba(26,22,18,0.75)">
      Au régime réel, l'ensemble de vos charges — charges d'exploitation, intérêts d'emprunt et assurance emprunteur — vient en déduction de vos recettes, soit <strong style="color:#8B1A1A">${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)}</strong> déduits la première année. Votre base imposable descend d'autant.
    </div>
    <div style="font-size:12px;line-height:1.65;color:rgba(26,22,18,0.75);margin-top:5px">
      S'y ajoute l'<strong style="color:#2A5C8A">${amortLabel}</strong> : <strong style="color:#2A5C8A">${fE(amortTotalAn1)}</strong> supplémentaires viennent réduire l'assiette de l'impôt, sans aucune sortie de trésorerie. Votre base imposable tombe ainsi à <strong>${fE(baseImposableReel)}</strong>, ce qui porte votre impôt et prélèvements sociaux à <strong style="color:#C95B2A">${fE(impotReel)}</strong> pour l'année 1${impotReel > 0 ? `, soit ${fE(impotReel / 12)}/mois` : ""}.
    </div>
  </div>
  <div style="background:rgba(42,112,128,0.10);border-left:2.5px solid #2A7080;border-radius:0 6px 6px 0;padding:7px 10px;margin-bottom:6px;font-size:12px;line-height:1.6;color:rgba(26,22,18,0.75)">
    <strong>Pourquoi 18,6 % ici et 17,2 % à la revente ?</strong> Les prélèvements sociaux applicables aux <strong>revenus locatifs meublés</strong> (18,6 %) et ceux applicables aux <strong>plus-values immobilières</strong> (17,2 %) sont deux prélèvements distincts, à des taux différents.
  </div>
` : `
  <div class="sec">Fiscalité · Détail année 1</div>
  <div style="background:#EDE7DC;border-radius:8px;padding:8px 10px;margin-bottom:6px">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <tr style="background:rgba(26,22,18,0.05)">
        <td style="padding:5px 8px;color:rgba(26,22,18,0.55)">Recettes fiscales</td>
        <td style="padding:5px 8px;text-align:right;font-weight:600;color:#1A7A52">${fE(recettesAnnuelles)}</td>
      </tr>
      <tr>
        <td style="padding:5px 8px;color:rgba(26,22,18,0.55)">Abattement forfaitaire (${isSaisonnier ? "30" : "50"}%)</td>
        <td style="padding:5px 8px;text-align:right;font-weight:600;color:#8B1A1A">−${fE(recettesAnnuelles * abattPct)}</td>
      </tr>
      <tr style="background:rgba(26,22,18,0.04);border-top:1.5px solid rgba(26,22,18,0.15)">
        <td style="padding:5px 8px;color:rgba(26,22,18,0.6);font-weight:600">= Base imposable</td>
        <td style="padding:5px 8px;text-align:right;font-weight:700">${fE(baseBIC)}</td>
      </tr>
      <tr style="background:#4E1F12">
        <td style="padding:6px 8px;color:#F5F0E8;font-weight:700">Impôt + prél. soc. (18,6%)</td>
        <td style="padding:6px 8px;text-align:right;font-weight:700;color:#F5A623">${fE(impotBIC)}</td>
      </tr>
    </table>
  </div>
  <!-- Lecture du tableau -->
  <div style="background:rgba(42,92,138,0.06);border-left:2.5px solid #2A5C8A;border-radius:0 6px 6px 0;padding:7px 10px;margin-bottom:6px">
    <div style="font-size:12px;line-height:1.65;color:rgba(26,22,18,0.75)">
      Au Micro-BIC, vos charges réelles ne viennent pas en déduction de votre base imposable : ni vos charges d'exploitation, ni vos intérêts d'emprunt, ni aucun amortissement. Elles sont remplacées par un <strong>abattement forfaitaire de ${isSaisonnier ? "30" : "50"} %</strong> appliqué sur vos recettes, soit <strong style="color:#8B1A1A">${fE(recettesAnnuelles * abattPct)}</strong>, quel que soit le montant réellement dépensé (${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)} dans votre cas).
    </div>
    <div style="font-size:12px;line-height:1.65;color:rgba(26,22,18,0.75);margin-top:5px">
      Votre base imposable s'établit donc à <strong>${fE(baseBIC)}</strong>, ce qui porte votre impôt et prélèvements sociaux à <strong style="color:#C95B2A">${fE(impotBIC)}</strong> pour l'année 1, soit <strong style="color:#C95B2A">${fE(impotBIC / 12)}/mois</strong>.
    </div>
  </div>
  <div style="background:rgba(42,112,128,0.10);border-left:2.5px solid #2A7080;border-radius:0 6px 6px 0;padding:7px 10px;margin-bottom:6px;font-size:12px;line-height:1.6;color:rgba(26,22,18,0.75)">
    <strong>Pourquoi 18,6 % ici et 17,2 % à la revente ?</strong> Les prélèvements sociaux applicables aux <strong>revenus locatifs meublés</strong> (18,6 %) et ceux applicables aux <strong>plus-values immobilières</strong> (17,2 %) sont deux prélèvements distincts, à des taux différents.
  </div>`;

    const HDR = `<div class="hdr">
    <div><div class="hdr-t">toutlmnp · Rapport Invest</div><div class="hdr-s">${bienTitle}${bienInfo.description ? ` · ${bienInfo.description}` : ""}</div></div>
    <div><div class="hdr-p">${fE(prix)}</div><div class="hdr-d">${today}</div></div>
  </div>`;
    const FTR = (n: number) => `<div class="ftr"><span>toutlmnp.fr · Rapport indicatif</span><span>Page ${n} / ${nbPages}</span><span>${today}</span></div>`;
    const TITRE = (n: number, l: string) => `<div class="ptitle"><div class="ptitle-n">${n}</div><div class="ptitle-l">${l}</div></div>`;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport Invest – toutlmnp</title>
<style>${css}</style></head><body>

<div class="no-print">
  <span style="color:#F5F0E8;font-size:13px;font-weight:600">Rapport Invest – toutlmnp</span>
  <button onclick="window.print()" style="background:#C95B2A;color:#F5F0E8;border:none;border-radius:6px;padding:8px 20px;font-size:12px;font-weight:600;cursor:pointer">⬇ Enregistrer en PDF</button>
</div>

<!-- ═══════════ PAGE 1 · L'ESSENTIEL DU PROJET ═══════════ -->
<div class="page">
  ${HDR}
  ${TITRE(1, "L'essentiel du projet")}

  <div class="band">
    <div class="band-h">Acquisition</div>
    <div class="band-r">
      <div class="cell"><div class="cell-l">Prix d'achat</div><div class="cell-v">${fE(prix)}</div></div>
      ${travaux > 0 ? `<div class="cell"><div class="cell-l">Travaux</div><div class="cell-v">${fE(travaux)}</div></div>` : ""}
      ${mobilier > 0 ? `<div class="cell"><div class="cell-l">Mobilier</div><div class="cell-v">${fE(mobilier)}</div></div>` : ""}
      <div class="cell"><div class="cell-l">Frais notaire</div><div class="cell-v">${fE(notaire)}</div></div>
      <div class="cell tag or"><div class="cell-l">Coût total</div><div class="cell-v">${fE(investTotal)}</div></div>
    </div>
  </div>

  <div class="band">
    <div class="band-h">Financement</div>
    <div class="band-r">
      <div class="cell"><div class="cell-l">Apport</div><div class="cell-v">${fE(apport)}</div></div>
      <div class="cell"><div class="cell-l">Crédit</div><div class="cell-v">${fE(montantCredit)}</div></div>
      <div class="cell"><div class="cell-l">Taux · Durée</div><div class="cell-v">${fP(parseFloat(f.taux) || 0, 2)} · ${duree} ans</div></div>
      <div class="cell"><div class="cell-l">Mensualité<sup>1</sup></div><div class="cell-v">${fE(mensualite)}/mois</div></div>
      <div class="cell tag gr"><div class="cell-l">${isSaisonnier ? "Recettes méd." : "Loyer HC"}</div><div class="cell-v">${fE(loyerAnnuel / 12)}/mois</div></div>
    </div>
  </div>

  <div class="sec">Indicateurs clés</div>
  <div class="kpis">
    <div class="kpi or"><div class="kpi-l">Coût total projet</div><div class="kpi-v">${fE(investTotal)}</div><div class="kpi-s">dont ${fE(montantCredit)} financés</div></div>
    <div class="kpi"><div class="kpi-l">Rendement brut</div><div class="kpi-v">${fP(rendBrut)}</div><div class="kpi-s">loyers / investissement</div></div>
    <div class="kpi dk"><div class="kpi-l">Net après impôt<sup>2</sup></div><div class="kpi-v">${fP(rendChosen)}</div><div class="kpi-s">${regimeLabel}</div></div>
  </div>

  <div class="sec">Comparaison Régime Réel vs Micro-BIC</div>
  <div class="cmp">
    <div class="cmp-c ${!isMicro ? "on" : "off"}">
      <div class="cmp-h">Régime réel simplifié</div>
      <div class="cmp-r"><span class="cmp-k">Recettes fiscales</span><span class="cmp-v">${fE(recettesAnnuelles)}/an</span></div>
      <div class="cmp-r"><span class="cmp-k">Charges déductibles</span><span class="cmp-v">${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)}/an</span></div>
      <div class="cmp-r am"><span class="cmp-k">Amortissements (an. 1)</span><span class="cmp-v">${fE(amortTotalAn1)}/an</span></div>
      <div class="cmp-r"><span class="cmp-k">Base imposable</span><span class="cmp-v">${fE(baseImposableReel)}</span></div>
      <div class="cmp-r"><span class="cmp-k">Impôt + prél. soc.</span><span class="cmp-v">${fE(impotReel)}/an</span></div>
      <div class="cmp-r cf"><span class="cmp-k">Cash-flow mensuel</span><span class="cmp-v">${res.cashflowReelMensuel >= 0 ? "+" : ""}${fE(res.cashflowReelMensuel)}/mois</span></div>
      <div class="cmp-r" style="display:block;border-top:1px solid rgba(26,22,18,0.14);margin-top:6px;padding-top:6px"><div class="cmp-k" style="margin-bottom:1px">Cash-flow cumulé pendant le crédit</div><div class="cmp-v" style="font-size:13px;color:${cumulCfReel >= 0 ? "#1A6644" : "#B03A2A"}">${cumulCfReel >= 0 ? "+" : ""}${fE(cumulCfReel)} sur ${duree} ans</div></div>
      <div class="cmp-r" style="display:block;padding-top:5px"><div class="cmp-k" style="margin-bottom:1px">Cash-flow après emprunt · dès l'année ${duree + 1}</div><div class="cmp-v" style="font-size:13px;color:${apresReelAn >= 0 ? "#1A6644" : "#B03A2A"}">${apresReelAn >= 0 ? "+" : ""}${fE(apresReelAn / 12)} / mois</div></div>
    </div>
    <div class="vs">vs</div>
    <div class="cmp-c ${isMicro ? "on" : "off"}">
      <div class="cmp-h">Micro-BIC ${isSaisonnier ? "30" : "50"} %</div>
      <div class="cmp-r"><span class="cmp-k">Recettes fiscales</span><span class="cmp-v">${fE(recettesAnnuelles)}/an</span></div>
      <div class="cmp-r"><span class="cmp-k">Abattement forfaitaire</span><span class="cmp-v">${fE(recettesAnnuelles * abattPct)}/an</span></div>
      <div class="cmp-r"><span class="cmp-k" style="color:rgba(26,22,18,0.35)">Pas d'amortissement</span><span class="cmp-v" style="color:rgba(26,22,18,0.3)">—</span></div>
      <div class="cmp-r"><span class="cmp-k">Base imposable</span><span class="cmp-v">${fE(baseBIC)}</span></div>
      <div class="cmp-r"><span class="cmp-k">Impôt + prél. soc.</span><span class="cmp-v">${fE(impotBIC)}/an</span></div>
      <div class="cmp-r cf"><span class="cmp-k">Cash-flow mensuel</span><span class="cmp-v">${res.cashflowBICMensuel >= 0 ? "+" : ""}${fE(res.cashflowBICMensuel)}/mois</span></div>
      <div class="cmp-r" style="display:block;border-top:1px solid rgba(26,22,18,0.14);margin-top:6px;padding-top:6px"><div class="cmp-k" style="margin-bottom:1px">Cash-flow cumulé pendant le crédit</div><div class="cmp-v" style="font-size:13px;color:${cumulCfMicro >= 0 ? "#1A6644" : "#B03A2A"}">${cumulCfMicro >= 0 ? "+" : ""}${fE(cumulCfMicro)} sur ${duree} ans</div></div>
      <div class="cmp-r" style="display:block;padding-top:5px"><div class="cmp-k" style="margin-bottom:1px">Cash-flow après emprunt · dès l'année ${duree + 1}</div><div class="cmp-v" style="font-size:13px;color:${apresMicroAn >= 0 ? "#1A6644" : "#B03A2A"}">${apresMicroAn >= 0 ? "+" : ""}${fE(apresMicroAn / 12)} / mois</div></div>
    </div>
  </div>

  <div class="info gr">
    <div class="info-b">Info clef</div>
    <div class="info-c">
      <div class="info-t">Régime choisi · ${isMicro ? "Micro-BIC" : "Réel simplifié"}</div>
      <div class="info-x">
        <strong>${fE(Math.abs(ecartImpotAn1))} d'impôt en ${ecartImpotAn1 >= 0 ? "moins" : "plus"} en année 1</strong>${!isMicro ? `, grâce aux charges et à l'amortissement` : ` au Micro-BIC`}.
        ${anneeEgalite ? `L'avantage du réel diminue ensuite : les régimes sont presque à égalité en année ${anneeEgalite}. ` : ""}
        Sur ${duree} ans, ${Math.abs(ecartCumulCf) < 1
          ? `les deux régimes laissent une trésorerie équivalente`
          : `le ${ecartCumulCf > 0 ? "micro-BIC" : "régime réel"} laisse ici <strong>${fE(Math.abs(ecartCumulCf))} de trésorerie en plus</strong>`}, hors frais spécifiques et revente.
      </div>
    </div>
  </div>

  <div class="info br">
    <div class="info-b">Info clef</div>
    <div class="info-c">
      <div class="info-t">Cash-flow mensuel après impôt · année 1</div>
      <div style="display:flex;align-items:center;gap:16px">
        <div class="info-big" style="color:${cfMensuel >= 0 ? "#1A6644" : "#B03A2A"}">${cfMensuel >= 0 ? "+" : ""}${fE(cfMensuel)} / mois</div>
        <div class="info-x" style="flex:1">${cfMensuel >= 0
          ? `Les loyers couvrent les sorties renseignées et laissent un excédent. Moyenne mensuelle variable selon les dépenses effectives.`
          : `Les loyers ne couvrent pas encore toutes les sorties : ${fE(Math.abs(cfMensuel))} restent à financer chaque mois. En contrepartie, vous remboursez ${fE(getYear(1).capital / 12)} de capital par mois.`}</div>
      </div>
    </div>
  </div>

  <div class="note" style="margin-top:10px"><sup>1</sup> Mensualité hors assurance. <sup>2</sup> (Loyers − charges − impôt) / coût total, avant crédit et assurance.</div>
  ${FTR(1)}
</div>
${isSaisonnier ? `
<!-- ═══════════ PAGE SAISONNIÈRE ═══════════ -->
<div class="page">
  ${HDR}
  ${TITRE(nSaison, "La location saisonnière")}

  <div class="band">
    <div class="band-h">Vos hypothèses d'exploitation</div>
    <div class="band-r">
      <div class="cell"><div class="cell-l">Prix moyen / nuitée</div><div class="cell-v">${fE(prixNuitee)}</div></div>
      <div class="cell"><div class="cell-l">Occ. basse</div><div class="cell-v">${fP(tauxOcc.bas, 0)}</div></div>
      <div class="cell"><div class="cell-l">Occ. médiane</div><div class="cell-v">${fP(tauxOcc.moyen, 0)}</div></div>
      <div class="cell"><div class="cell-l">Occ. haute</div><div class="cell-v">${fP(tauxOcc.haut, 0)}</div></div>
    </div>
  </div>

  <div class="sec">Les trois scénarios d'occupation</div>
  <table class="tbl">
    <thead><tr>
      <th>Scénario</th>
      <th class="c">Occupation</th>
      <th class="c">Nuits / an</th>
      <th class="r">Recettes / an</th>
      <th class="r">Base imposable</th>
      <th class="r">Impôt / an</th>
      <th class="r">Cash-flow / mois</th>
    </tr></thead>
    <tbody>
      ${scenariosSaison.map(sc => `<tr${sc.median ? ` style="background:rgba(201,91,42,0.09)"` : ""}>
        <td${sc.median ? ` style="font-weight:800"` : ""}>${sc.label}${sc.median ? ` <span style="color:#C95B2A;font-weight:800">· retenu</span>` : ""}</td>
        <td class="c">${fP(sc.occ, 0)}</td>
        <td class="c">${sc.nuits}</td>
        <td class="r" style="color:#1A6644;font-weight:700">${fE(sc.loyerAnnuel)}</td>
        <td class="r">${fE(sc.base)}</td>
        <td class="r" style="color:#B03A2A;font-weight:700">${fE(sc.impot)}</td>
        <td class="r" style="font-weight:800;color:${sc.cfMensuel >= 0 ? "#1A6644" : "#B03A2A"}">${sc.cfMensuel >= 0 ? "+" : ""}${fE(sc.cfMensuel)}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <div class="note">Recettes calculées sur ${fE(prixNuitee)} la nuitée × 365 nuits × taux d'occupation. Charges, crédit et fiscalité identiques dans les trois scénarios : seul le niveau de recettes change.</div>

  <div class="info gr">
    <div class="info-b">Info clef</div>
    <div class="info-c">
      <div class="info-t">Le scénario médian sert de base à tout le rapport</div>
      <div class="info-x">
        Les pages suivantes — impôt, vision d'ensemble, revente — reposent sur l'hypothèse <strong>${fP(tauxOcc.moyen, 0)} d'occupation</strong>, soit <strong>${fE(scenariosSaison[1].loyerAnnuel)}</strong> de recettes annuelles.
        L'écart entre le scénario bas et le scénario haut représente <strong>${fE(Math.abs(scenariosSaison[2].cfMensuel - scenariosSaison[0].cfMensuel))} de trésorerie mensuelle</strong> : c'est la marge d'incertitude de votre projet.
      </div>
    </div>
  </div>

  <div class="info br">
    <div class="info-b">Info clef</div>
    <div class="info-c">
      <div class="info-t">Fiscalité propre au meublé de tourisme</div>
      <div class="info-x">
        En Micro-BIC, l'abattement forfaitaire d'un meublé de tourisme <strong>non classé est de 30 %</strong>, contre 50 % pour une location meublée classique (Loi de finances 2024). Le régime réel, lui, se calcule de façon identique : charges réelles et amortissements restent déductibles.
        ${isMicro ? ` Votre simulation retient le Micro-BIC : l'abattement de 30 % s'applique.` : ` Votre simulation retient le régime réel : cet abattement ne s'applique donc pas.`}
      </div>
    </div>
  </div>

  <div class="note" style="margin-top:14px">Un meublé de tourisme classé bénéficie d'un abattement plus favorable. Le classement est une démarche volontaire auprès d'un organisme accrédité — à vérifier avant de retenir ce régime.</div>
  ${FTR(nSaison)}
</div>` : ""}

<!-- ═══════════ PAGE · QUE DIT L'IMPÔT ═══════════ -->
<div class="page">
  ${HDR}
  ${TITRE(nImpot, "Que dit l'impôt")}

  <div class="sec tight">Évolution dans le temps · ${regimeLabel}</div>
  <table class="tbl">
    <thead>
      <tr>
        <th rowspan="2">Année</th>
        <th rowspan="2" class="r">Loyers</th>
        <th colspan="2" class="c" style="background:rgba(201,91,42,0.9);color:#F5F0E8">Charges &amp; Crédit</th>
        <th rowspan="2" class="r">Capital<br/>remboursé</th>
        <th rowspan="2" class="c">%<br/>remb.</th>
        <th rowspan="2" class="r" style="border-left:2px solid #B03A2A;border-right:2px solid #B03A2A">Impôt</th>
        <th rowspan="2" class="r">Cash-flow / an</th>
      </tr>
      <tr>
        <th class="r" style="background:rgba(201,91,42,0.75);color:#F5F0E8;font-size:12px">Charges</th>
        <th class="r" style="background:rgba(201,91,42,0.75);color:#F5F0E8;font-size:12px">Intérêts emprunt<br/>+ assurance</th>
      </tr>
    </thead>
    <tbody>
    ${TABLE_YEARS.map(yr => {
      const row = getYear(yr);
      const cf = row.cfAnnuel;
      const intAssu = row.interets + (yr <= duree ? assuranceEmprunteurAnnuel : 0);
      const pctRemb = montantCredit > 0 ? Math.min(100, (row.capCumul / montantCredit) * 100) : 0;
      const beyond = yr > duree;
      return `<tr>
        <td style="font-weight:800">An ${yr}</td>
        <td class="r">${fE(recettesAnnuelles)}</td>
        <td class="r" style="color:#B03A2A">−${fE(chargesAnnuelles)}</td>
        <td class="r" style="color:#B03A2A">${beyond ? "—" : `−${fE(intAssu)}`}</td>
        <td class="r" style="color:#2A5C8A;font-weight:700">${beyond ? fE(0) : fE(row.capital)}</td>
        <td class="c" style="color:rgba(26,22,18,0.55)">${fP(pctRemb, 0)}</td>
        <td class="r" style="color:#B03A2A;font-weight:700;border-left:2px solid rgba(176,58,42,0.5);border-right:2px solid rgba(176,58,42,0.5)">${row.impot > 0 ? `−${fE(row.impot)}` : fE(0)}</td>
        <td class="r" style="font-weight:800;color:${cf >= 0 ? "#1A6644" : "#B03A2A"}">${cf >= 0 ? "+" : ""}${fE(cf)}</td>
      </tr>`;
    }).join("")}
    </tbody>
  </table>
  <div class="note">Montants annuels en euros. % remboursé cumulé. Année ${duree + 5} : après la fin du crédit.</div>

  <div class="info gr">
    <div class="info-b">Info clef</div>
    <div class="info-c">
      <div class="info-t">Impôt et prélèvements sociaux cumulés pendant les ${duree} ans de crédit</div>
      <div style="display:flex;align-items:center;gap:16px">
        <div class="info-big">${fE(cumulImpotCredit)}</div>
        <div class="info-x" style="flex:1">Total ${isMicro ? "au Micro-BIC" : "au régime réel"}, hors fiscalité de revente. ${isMicro
          ? `La base imposable étant forfaitaire, l'impôt reste stable d'une année sur l'autre.`
          : `Moins d'intérêts et d'amortissement à déduire signifie ici plus d'impôt au fil du temps.`}</div>
      </div>
    </div>
  </div>

  <div class="sec">Évolution de l'impôt${!isMicro ? " et de l'amortissement" : ""}</div>
  ${impotAmortGraphHtml}

  ${!isMicro ? `<div class="amo">
    <div class="amo-h">Détail de votre amortissement · ${amortMode === "ensemble" ? "méthode globale simplifiée" : "méthode par composants"}</div>
    <table>
      <tr class="hd"><td>Élément</td><td>Base amortissable</td><td>Durée</td><td class="r">Dotation</td></tr>
      ${(amortMode === "ensemble"
        ? [{ l: "Bien immobilier (hors terrain)", b: `${amortPct} % de ${fE(prix)}`, d: `${amortDureeEnsemble} ans`, m: amortBienAn }]
        : composants.map(c => ({ l: c.label, b: `${c.pct} % de ${fE(valeurAmortissable)}`, d: `${c.duree} ans`, m: (valeurAmortissable * c.pct / 100) / c.duree }))
      ).concat(
        amortMobilierAn > 0 ? [{ l: "Mobilier", b: fE(mobilier), d: `${amortDureeMobilier} ans`, m: amortMobilierAn }] : [],
        amortTravauxAn > 0 ? [{ l: "Travaux", b: fE(travaux), d: `${amortDureeTravaux} ans`, m: amortTravauxAn }] : [],
        amortNotaireAn > 0 ? [{ l: "Frais de notaire", b: fE(notaire), d: `${amortDureeNotaire} ans`, m: amortNotaireAn }] : [],
      ).map(x => `<tr><td>${x.l}</td><td style="color:rgba(26,22,18,0.55)">${x.b}</td><td style="color:rgba(26,22,18,0.55)">${x.d}</td><td class="r">${fE(x.m)}/an</td></tr>`).join("")}
      <tr class="tot"><td colspan="3">Total amortissement année 1</td><td class="r">${fE(amortTotalAn1)}/an</td></tr>
    </table>
  </div>` : `<div class="note" style="margin-top:12px">Au Micro-BIC, aucun amortissement n'est déduit : l'abattement forfaitaire de ${isSaisonnier ? "30" : "50"} % remplace toute déduction de charges réelles.</div>`}

  ${FTR(nImpot)}
</div>
<!-- ═══════════ PAGE · VISION D'ENSEMBLE ═══════════ -->
<div class="page">
  ${HDR}
  ${TITRE(nVision, "Vision d'ensemble")}

  <div class="sec tight">Vision d'ensemble · année 1 vs fin d'emprunt + 1 an</div>

  <div class="tl">
    <div class="tl-axis">${friseHtml}</div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">

      <div class="tl-card">
        <div class="tl-h"><div class="tl-t">Année 1</div><div class="tl-s">${montantCredit > 0 ? "Crédit en cours" : "Sans crédit"}</div></div>
        <div class="tl-b">
          ${makeBarresAnnee(1)}
          <div class="tl-txt">
            ${montantCredit > 0 ? `<p>Les échéances de crédit représentent <strong>${fE(creditTotalAnnuel)}/an</strong>, assurance comprise, soit ${creditTotalAnnuel / Math.max(recettesAnnuelles, 1) >= 0.45 ? "près de la moitié" : `environ ${fP(creditTotalAnnuel / Math.max(recettesAnnuelles, 1) * 100, 0)}`} des loyers.</p>` : ""}
            <p>Après les charges et l'impôt, le cash-flow est de <strong style="color:${getYear(1).cfAnnuel >= 0 ? "#1A6644" : "#B03A2A"}">${getYear(1).cfAnnuel >= 0 ? "+" : ""}${fE(getYear(1).cfAnnuel)}/an, soit ${getYear(1).cfAnnuel >= 0 ? "+" : ""}${fE(getYear(1).cfAnnuel / 12)}/mois</strong>.
            ${getYear(1).cfAnnuel >= 0 ? "Les loyers couvrent les sorties renseignées." : "Cet écart reste à financer sur votre épargne."}</p>
            <p><strong>Charges : ${fE(chargesAnnuelles)}/an.</strong> ${!isMicro
              ? `L'amortissement de ${fE(amortTotalAn1)}/an réduit l'impôt sans être une sortie d'argent ; il n'est donc pas représenté ici.`
              : `Au Micro-BIC, l'abattement de ${isSaisonnier ? "30" : "50"} % remplace la déduction des charges réelles.`}</p>
          </div>
        </div>
      </div>

      <div class="tl-card">
        <div class="tl-h"><div class="tl-t">Année ${duree + 1}</div><div class="tl-s">Premier exercice sans crédit</div></div>
        <div class="tl-b">
          ${makeBarresAnnee(duree + 1)}
          <div class="tl-txt">
            ${montantCredit > 0 ? `<p>Le crédit est soldé : les <strong>${fE(creditTotalAnnuel)}/an d'échéances</strong> disparaissent.</p>` : ""}
            <p>Le cash-flow atteint <strong style="color:#1A6644">${getYear(duree + 1).cfAnnuel >= 0 ? "+" : ""}${fE(getYear(duree + 1).cfAnnuel)}/an, soit ${fE(getYear(duree + 1).cfAnnuel / 12)}/mois</strong>. Cela représente <strong>${getYear(duree + 1).cfAnnuel - getYear(1).cfAnnuel >= 0 ? "+" : ""}${fE(getYear(duree + 1).cfAnnuel - getYear(1).cfAnnuel)}/an</strong> par rapport à l'année 1.</p>
            <p><strong>Charges : ${fE(chargesAnnuelles)}/an.</strong> L'impôt atteint ${fE(getYear(duree + 1).impot)}/an : ${montantCredit > 0 ? "les intérêts ne sont plus déductibles" : "la base imposable est pleine"}${!isMicro ? " et l'amortissement a diminué" : ""}. ${getYear(duree + 1).impot - getYear(1).impot < creditTotalAnnuel ? "Cette hausse reste inférieure aux échéances supprimées." : ""}</p>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="note" style="margin-top:12px">Même échelle pour les deux graphiques : ${fE(recettesAnnuelles)} de recettes annuelles. Représentation schématique. Loyers et charges supposés constants.</div>
  ${FTR(nVision)}
</div>

<!-- ═══════════ PAGE · CE QU'IL RESTE À LA FIN ═══════════ -->
<div class="page">
  ${HDR}
  ${TITRE(nFin, "Ce qu'il reste à la fin")}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px">
    <div style="background:#EDE7DC;border-radius:9px;padding:13px 17px">
      <div class="kpi-l">Valeur du bien en fin de crédit</div>
      <div style="font-size:26px;font-weight:800;letter-spacing:-.03em;color:#4E1F12;line-height:1">${fE(prix)}</div>
      <div class="kpi-s">À ${dureeY} ans · hypothèse : prix d'achat maintenu</div>
    </div>
    <div style="background:#EDE7DC;border-radius:9px;padding:13px 17px">
      <div class="kpi-l">Dette restante en fin de crédit</div>
      <div style="font-size:26px;font-weight:800;letter-spacing:-.03em;color:${crdFin > 0 ? "#B03A2A" : "#1A6644"};line-height:1">${fE(crdFin)}</div>
      <div class="kpi-s">${crdFin > 0 ? `Capital restant dû à ${dureeY} ans` : `Après ${dureeY} années pleines · crédit soldé`}</div>
    </div>
  </div>

  <div class="sec">Deux sources d'encaissements, une seule addition</div>
  <div class="info br" style="margin-top:0">
    <div class="info-b">Info clef</div>
    <div class="info-c">
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0">
        <span class="info-x">Cash-flow cumulé sur ${dureeY} ans</span>
        <span style="font-size:19px;font-weight:800;letter-spacing:-.02em;color:${cumulCfChoisi >= 0 ? "#4ADE80" : "#F87171"}">${cumulCfChoisi >= 0 ? "+" : ""}${fE(cumulCfChoisi)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0">
        <span class="info-x">Vente nette après impôt${crdFin > 0 ? " et crédit" : ""}</span>
        <span style="font-size:19px;font-weight:800;letter-spacing:-.02em;color:#F5F0E8">+${fE(netRevente)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1.5px solid rgba(201,91,42,0.75);margin-top:7px;padding-top:8px">
        <span style="font-size:13px;font-weight:700;color:#F5F0E8">Total cumulé · avant frais de vente</span>
        <span style="font-size:25px;font-weight:800;letter-spacing:-.03em;color:#F5F0E8">${fE(totalCumule)}</span>
      </div>
    </div>
  </div>

  <div class="note" style="margin-top:10px">
    ${cumulCfChoisi >= 0
      ? `Les <strong>${fE(cumulCfChoisi)}</strong> de trésorerie sont générés au fil des années ; ils ne constituent une épargne à la sortie que s'ils ont été conservés.`
      : `L'effort d'épargne de <strong>${fE(Math.abs(cumulCfChoisi))}</strong> a été consenti au fil des années ; il vient en déduction du produit de la vente.`}
    Le capital remboursé est déjà pris en compte : il ne s'ajoute pas une seconde fois.
  </div>

  <div class="sec">Si le prix de vente change</div>
  <table class="tbl">
    <thead><tr><th>Prix à ${dureeY} ans</th><th class="r">Prix de vente</th><th class="r">Après impôt${crdFin > 0 ? " et crédit" : ""}<sup>1</sup></th></tr></thead>
    <tbody>
      ${scenariosVente.map(sc => `<tr${sc.central ? ` style="background:rgba(201,91,42,0.08)"` : ""}>
        <td${sc.central ? ` style="font-weight:800"` : ""}>${sc.label}</td>
        <td class="r">${fE(sc.prixVente)}</td>
        <td class="r" style="font-weight:800">${fE(sc.net)}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <div class="note">
    <sup>1</sup> Avant frais de vente non renseignés.${dureeY > 5 && forfaitTravaux > travaux ? ` Forfait fiscal travaux de 15 % appliqué après plus de 5 ans` : ""}${!isMicro ? `${dureeY > 5 && forfaitTravaux > travaux ? " ; a" : " A"}mortissements déduits réintégrés (${fE(amortCumulFinal)})` : ""}.
    Abattements pour durée de détention : ${fP(abIR * 100, 0)} sur l'impôt sur le revenu, ${fP(abPS * 100, 0)} sur les prélèvements sociaux.
    Même à prix stable, la fiscalité de revente est estimée à <strong>${fE(impotPV)}</strong>.
  </div>

  <div class="fin">
    <div class="fin-h"><div class="fin-t">Votre projet en un regard</div><div class="fin-r">${regimeLabel}</div></div>
    <div class="fin-g">
      <div class="fin-c"><div class="fin-v" style="color:${cfMensuel >= 0 ? "#1A6644" : "#B03A2A"}">${cfMensuel >= 0 ? "+" : ""}${fE(cfMensuel)} / mois</div><div class="fin-l">Cash-flow en année 1</div></div>
      <div class="fin-c"><div class="fin-v">${apresChoisiAn >= 0 ? "+" : ""}${fE(apresChoisiAn / 12)} / mois</div><div class="fin-l">Après le crédit · année ${duree + 1}</div></div>
      <div class="fin-c"><div class="fin-v" style="color:${crdFin > 0 ? "#B03A2A" : "#1A6644"}">${fE(crdFin)} de dette</div><div class="fin-l">À la fin des ${dureeY} ans</div></div>
    </div>
    <div class="fin-2">
      <div>
        <div class="fin-st">Points forts</div>
        <div class="fin-sx">${cumulCfChoisi >= 0
          ? `Trésorerie positive sur les ${dureeY} ans de crédit : <strong>${fE(cumulCfChoisi)} cumulés.</strong> Les loyers couvrent les sorties renseignées.`
          : `Le capital remboursé (<strong>${fE(montantCredit)}</strong>) constitue un patrimoine net de dette à ${dureeY} ans, malgré un effort d'épargne pendant le crédit.`}</div>
      </div>
      <div>
        <div class="fin-st">Points à vérifier</div>
        <div class="fin-sx">Marge ${getYear(duree).cfAnnuel >= 0 ? "réduite" : "négative"} à <strong>${fE(getYear(duree).cfAnnuel / 12)}/mois en année ${duree}</strong>. Compléter les charges, tester la vacance et comparer la fiscalité sur la durée.</div>
      </div>
    </div>
    <div class="fin-tot">
      <div><div class="fin-tl">Total estimé après revente à ${dureeY} ans</div><div class="fin-l" style="margin-top:3px">${fE(netRevente)} de vente nette + ${fE(cumulCfChoisi)} de cash-flow cumulé · avant frais de vente</div></div>
      <div class="fin-tv">${fE(totalCumule)}</div>
    </div>
  </div>

  <div class="note" style="margin-top:12px">Hypothèses : détention directe en location meublée non professionnelle, ${regimeLabel} ; TMI ${tmi} % + prélèvements sociaux 18,6 % sur les revenus locatifs, 17,2 % sur la plus-value. Montants nominaux non actualisés. Loyers et charges supposés constants. Simulation indicative — ne constitue pas un conseil fiscal ou financier.</div>
  ${FTR(nFin)}
</div>

</body></html>`;
  };

  // ─── DOSSIER BANCAIRE ───────────────────────────────────────────────────────
  const buildBanquePdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const amortDureeMobilier = amortDureeMobilierRef.current;
    const amortDureeTravaux = amortDureeTravauxRef.current;
    const amortDureeNotaire = amortDureeNotaireRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
    const selectedRegime = selectedRegimeRef.current;
    const isMicro = selectedRegime === "micro";
    const abattPct = isSaisonnier ? 0.30 : 0.50;
    const abattLabel = isSaisonnier ? "30 %" : "50 %";
    const regimeLabel = isMicro ? "Micro-BIC" : "Régime réel";

    /* ── Mise en forme ──────────────────────────────────────────────────────── */
    const fE = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
    const fE2 = (v: number) => Math.abs(v - Math.round(v)) < 0.005
      ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)
      : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
    const fN = (v: number) => Math.round(v).toLocaleString("fr-FR");
    const fP = (v: number, d = 2) => v.toFixed(d).replace(".", ",") + " %";
    const fX = (v: number) => v.toFixed(2).replace(".", ",") + "×";
    const sE = (v: number) => (v >= 0 ? "+" : "−") + fE(Math.abs(v));
    const sE2 = (v: number) => (v >= 0 ? "+" : "−") + fE2(Math.abs(v));
    const col = (v: number) => v >= 0 ? "#1A6644" : "#B03A2A";

    /* ── Données saisies ────────────────────────────────────────────────────── */
    const prix = parseFloat(f.prix) || 0;
    const travaux = parseFloat(f.travaux) || 0;
    const notaire = parseFloat(f.notaire) || 0;
    const mobilier = parseFloat(f.mobilier) || 0;
    const apport = parseFloat(f.apport) || 0;
    const taux = parseFloat(f.taux) / 100 || 0;
    const duree = f.duree;
    const tmi = f.tmi;
    const tauxGlobal = tmi / 100 + 0.186;

    const investTotal = res.investTotal;
    const montantCredit = res.montantCredit;
    const mensualite = res.mensualite;
    const creditAnnuel = res.creditAnnuel;
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceAn = res.assuranceEmprunteurAnnuel ?? 0;
    const assuranceMois = assuranceAn / 12;
    const serviceDette = creditAnnuel + assuranceAn;
    const echeanceTotale = mensualite + assuranceMois;
    const chargesLocatairesAnnuel = (parseFloat(f.chargesLoyer) || 0) * 12;
    const chargesMois = chargesAnnuelles / 12;

    const taxeFonciere = parseFloat(f.taxeFonciere) || 0;
    const chargesCopro = parseFloat(f.chargesCopro) || 0;
    const pnoEur = res.loyerAnnuel * (parseFloat(f.assurancePNO) || 0) / 100;
    const gestionEur = res.loyerAnnuel * (parseFloat(f.gestionLocativePct) || 0) / 100;
    const entretien = parseFloat(f.entretienCourant) || 0;
    const compta = parseFloat(f.comptabilite) || 0;

    /* ── Amortissement : plan du dossier ────────────────────────────────────── */
    const valeurAmortissable = prix * amortPct / 100;
    const terrainVal = prix - valeurAmortissable;
    const amortCols: { label: string; base: number; duree: number; annuel: number }[] = [];
    if (amortMode === "ensemble") {
      if (valeurAmortissable > 0 && amortDureeEnsemble > 0)
        amortCols.push({ label: "Bien immobilier", base: valeurAmortissable, duree: amortDureeEnsemble, annuel: valeurAmortissable / amortDureeEnsemble });
    } else {
      for (const c of composants) {
        const base = valeurAmortissable * c.pct / 100;
        if (base > 0 && c.duree > 0) amortCols.push({ label: c.label, base, duree: c.duree, annuel: base / c.duree });
      }
    }
    if (mobilier > 0 && amortDureeMobilier > 0) amortCols.push({ label: "Mobilier", base: mobilier, duree: amortDureeMobilier, annuel: mobilier / amortDureeMobilier });
    if (travaux > 0 && amortDureeTravaux > 0) amortCols.push({ label: "Travaux", base: travaux, duree: amortDureeTravaux, annuel: travaux / amortDureeTravaux });
    if (notaire > 0 && amortDureeNotaire > 0) amortCols.push({ label: "Frais de notaire", base: notaire, duree: amortDureeNotaire, annuel: notaire / amortDureeNotaire });
    const baseAmortissable = amortCols.reduce((s, c) => s + c.base, 0);
    const amortMaxDuree = amortCols.length ? Math.max(...amortCols.map(c => c.duree)) : 0;

    const amortBienMaxDuree = amortMode === "ensemble"
      ? amortDureeEnsemble
      : (composants.length ? Math.max(...composants.map(c => c.duree)) : 0);
    const HORIZON = Math.max(duree, amortBienMaxDuree, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire, 20) + 5;

    const projBase = {
      prix, travaux, mobilier, notaire,
      montantCredit, duree, taux,
      chargesLocatairesAnnuel, chargesAnnuelles,
      assuranceEmprunteurAnnuel: assuranceAn,
      tmi, amortPct, amortMode, amortDureeEnsemble, composants,
      amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
      isMicro, isSaisonnier, horizon: HORIZON,
    };

    /* ── Scénarios de stress appliqués à un niveau de loyer ─────────────────── */
    const STRESS = [
      { label: "Central", kL: 1, dC: 0 },
      { label: "Loyers −5 %", kL: 0.95, dC: 0 },
      { label: "Loyers −10 %", kL: 0.90, dC: 0 },
      { label: "Loyers −20 %", kL: 0.80, dC: 0 },
      { label: "1 mois sans loyer", kL: 11 / 12, dC: 0 },
      { label: "Charges +1 000 €", kL: 1, dC: 1000 },
      { label: "2 mois vides +2 000 €", kL: 10 / 12, dC: 2000 },
    ];

    /* ── Tout ce qui découle d'un niveau de recettes ────────────────────────── */
    const makeCase = (loyerAn: number, label: string, sousLabel: string) => {
      const recettes = loyerAn + chargesLocatairesAnnuel;
      const proj = computeProjection({ ...projBase, loyerAnnuel: loyerAn });
      const at = (y: number) => proj[Math.min(Math.max(y, 1), proj.length) - 1];
      const y1 = at(1);
      const noi = recettes - chargesAnnuelles;
      const dscr = serviceDette > 0 ? noi / serviceDette : 0;
      const dscrHorsAss = creditAnnuel > 0 ? noi / creditAnnuel : 0;
      const debtYield = montantCredit > 0 ? noi / montantCredit * 100 : 0;
      const rendBrutCout = investTotal > 0 ? loyerAn / investTotal * 100 : 0;
      const rendBrutPrix = prix > 0 ? loyerAn / prix * 100 : 0;
      const rendNet = investTotal > 0 ? noi / investTotal * 100 : 0;
      const excedentAvantImpot = noi - creditAnnuel - assuranceAn;
      const base1 = y1.baseImposable;
      const ir1 = base1 * tmi / 100;
      const ps1 = base1 * 0.186;
      const impot1 = y1.impot;
      const cashAn1 = y1.cashflowAnnuel;
      const cashMois1 = y1.cashflowMensuel;
      const apresPret = proj[duree]?.cashflowMensuel ?? proj[proj.length - 1].cashflowMensuel;
      const cumulCf = proj.slice(0, duree).reduce((s, y) => s + y.cashflowAnnuel, 0);
      const cumulImpot = proj.slice(0, duree).reduce((s, y) => s + y.impot, 0);
      const partFiscale = excedentAvantImpot > 0 ? impot1 / excedentAvantImpot * 100 : 0;

      // impôt d'une année donnée pour un couple (recettes, charges) modifié
      const impotDe = (rec: number, ch: number, yr = 1) => {
        if (isMicro) return rec * (1 - abattPct) * tauxGlobal;
        const row = at(yr);
        const raa = rec - ch - row.interets - row.assuranceEmprunteur;
        return Math.max(0, raa - row.amortDisponible) * tauxGlobal;
      };

      const stress = STRESS.map(s => {
        const loyers = loyerAn * s.kL;
        const charges = chargesAnnuelles + s.dC;
        const rec = loyers + chargesLocatairesAnnuel;
        const n = rec - charges;
        const impot = impotDe(rec, charges);
        const avant = n - serviceDette;
        const apres = avant - impot;
        return {
          label: s.label, loyers, charges, noi: n,
          dscr: serviceDette > 0 ? n / serviceDette : 0,
          rendNet: investTotal > 0 ? n / investTotal * 100 : 0,
          impot, avantMois: avant / 12, apresMois: apres / 12, apresAn: apres,
        };
      });

      // seuil 1 : DSCR = 1 (le NOI couvre juste l'échéance)
      const loyerDscr1 = serviceDette + chargesAnnuelles - chargesLocatairesAnnuel;
      // seuil 2 : cash après impôt = 0 — résolu par dichotomie (valable dans les deux régimes)
      const cashPour = (L: number) => {
        const rec = L + chargesLocatairesAnnuel;
        return rec - chargesAnnuelles - serviceDette - impotDe(rec, chargesAnnuelles);
      };
      let lo = 0, hi = Math.max(loyerAn * 3, serviceDette * 4, 1);
      if (cashPour(hi) > 0) { for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (cashPour(mid) > 0) hi = mid; else lo = mid; } }
      const loyerCash0 = hi;
      const baisseDscr1 = loyerAn > 0 ? (1 - loyerDscr1 / loyerAn) * 100 : 0;
      const baisseCash0 = loyerAn > 0 ? (1 - loyerCash0 / loyerAn) * 100 : 0;
      // charges supplémentaires qui absorbent l'excédent
      const chargesAbsorbe = isMicro ? cashAn1 : cashAn1 / Math.max(1e-9, 1 - tauxGlobal);

      return {
        label, sousLabel, loyerAn, loyerMois: loyerAn / 12, recettes, proj, at, y1,
        noi, dscr, dscrHorsAss, debtYield, rendBrutCout, rendBrutPrix, rendNet,
        excedentAvantImpot, base1, ir1, ps1, impot1, cashAn1, cashMois1, apresPret,
        cumulCf, cumulImpot, partFiscale, stress, loyerDscr1, loyerCash0,
        baisseDscr1, baisseCash0, chargesAbsorbe,
      };
    };

    /* ── Cas retenus : central, ou basse + moyenne en saisonnier ────────────── */
    const triple = resultatsTripleRef.current;
    const prixNuitee = parseFloat(prixNuiteeRef.current) || 0;
    const occ = { bas: parseFloat(tauxOccBasRef.current) || 0, moyen: parseFloat(tauxOccMoyenRef.current) || 0, haut: parseFloat(tauxOccHautRef.current) || 0 };
    const nuits = (t: number) => Math.round(365 * t / 100);
    const saison = isSaisonnier && !!triple;
    const cases = saison
      ? [
        makeCase(triple?.bas?.loyerAnnuel ?? 0, "Estimation basse", `${fP(occ.bas, 0)} d'occupation · ${nuits(occ.bas)} nuits`),
        makeCase(triple?.moyen?.loyerAnnuel ?? 0, "Estimation moyenne", `${fP(occ.moyen, 0)} d'occupation · ${nuits(occ.moyen)} nuits`),
      ]
      : [makeCase(res.loyerAnnuel, "Scénario central", "Loyers et charges constants")];
    const C0 = cases[0];                       // cas prudent (basse en saisonnier)
    const CR = cases[cases.length - 1];        // cas de référence (moyenne en saisonnier)
    const dual = cases.length > 1;

    /* ── Le crédit : tableau d'amortissement de la dette ────────────────────── */
    const jalons = Array.from(new Set([1, Math.round(duree / 4), Math.round(duree / 2), Math.round(3 * duree / 4), duree]
      .filter(y => y >= 1 && y <= duree))).sort((a, b) => a - b);
    const interetsTotaux = CR.proj.slice(0, duree).reduce((s, y) => s + y.interets, 0);
    const capitalTotal = CR.proj.slice(0, duree).reduce((s, y) => s + y.capitalRembourse, 0);
    const assuranceTotale = assuranceAn * duree;
    const totalVerse = capitalTotal + interetsTotaux + assuranceTotale;
    const coutFinancement = interetsTotaux + assuranceTotale;
    const dette10 = CR.at(Math.min(10, duree));
    const anneeMi = Math.min(10, duree);

    /* ── Amortissement : effet fiscal (régime réel) ─────────────────────────── */
    const anneesSansImpot = CR.proj.filter(y => y.year <= HORIZON && y.impot < 1).length;
    const reportFinal = CR.proj[CR.proj.length - 1].reportSortant;
    const impotSansAmort1 = Math.max(0, CR.y1.resultatAvantAmort) * tauxGlobal;
    const economieAn1 = impotSansAmort1 - CR.impot1;
    const economieCredit = CR.proj.slice(0, duree)
      .reduce((s, y) => s + (Math.max(0, y.resultatAvantAmort) * tauxGlobal - y.impot), 0);
    const amortCumulCredit = CR.proj.slice(0, duree).reduce((s, y) => s + y.amortImpute, 0);
    const paliers: { de: number; a: number; val: number }[] = [];
    if (!isMicro) {
      for (const y of CR.proj) {
        const v = Math.round(y.amortDotation);
        const last = paliers[paliers.length - 1];
        if (last && last.val === v) last.a = y.year; else paliers.push({ de: y.year, a: y.year, val: v });
      }
    }

    /* ── Graphiques ─────────────────────────────────────────────────────────── */
    const niceScale = (lo: number, hi: number, n: number) => {
      if (hi - lo < 1) hi = lo + 1;
      const raw = (hi - lo) / n;
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const mult = [1, 2, 2.5, 5, 10].find(m => m * mag >= raw) ?? 10;
      const st = mult * mag;
      return { min: Math.floor(lo / st) * st, max: Math.ceil(hi / st) * st };
    };

    // Capital restant dû, fin d'année
    const makeDetteChart = (): string => {
      const pts = [{ yr: 0, v: montantCredit }].concat(CR.proj.filter(y => y.year <= duree).map(y => ({ yr: y.year, v: y.capitalFin })));
      const W = 690, H = 185, PL = 78, PR = 26, PT = 26, PB = 34;
      const iW = W - PL - PR, iH = H - PT - PB;
      const sc = niceScale(0, Math.max(montantCredit, 1), 2);
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + (yr / Math.max(duree, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 3 }, (_, i) => {
        const t = i / 2, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(27,46,74,0.14)" stroke-width="1"/><text x="${PL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(27,46,74,0.55)">${fN(v)}</text>`;
      }).join("");
      const path = `<path d="${pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.yr).toFixed(1)},${toY(p.v).toFixed(1)}`).join(" ")}" fill="none" stroke="#1B2E4A" stroke-width="2.6" stroke-linejoin="round"/>`;
      // on n'étiquette que des points suffisamment espacés, sinon les libellés se chevauchent
      const espace = Math.max(1, duree / 8);
      const marks = Array.from(new Set([0, ...jalons])).sort((a, b) => a - b)
        .filter((y, i, arr) => i === 0 || y === duree || y - arr[i - 1] >= espace)
        .filter((y, i, arr) => y !== duree || i === arr.length - 1 || arr[arr.length - 1] === duree);
      const dots = marks.map(yr => {
        const v = yr === 0 ? montantCredit : CR.at(yr).capitalFin;
        const anchor: "start" | "middle" | "end" = yr === 0 ? "start" : yr === duree ? "end" : "middle";
        return `<circle cx="${toX(yr).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="3" fill="#1B2E4A"/><text x="${toX(yr).toFixed(1)}" y="${(toY(v) - 10).toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="700" fill="#1B2E4A">${fE(v)}</text>`;
      }).join("");
      const xL = marks.map(yr => `<text x="${toX(yr).toFixed(1)}" y="${PT + iH + 18}" text-anchor="middle" font-size="12" fill="rgba(27,46,74,0.55)">${yr}</text>`).join("");
      return `<div class="graph"><svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
  <text x="2" y="${PT - 8}" font-size="12" fill="rgba(27,46,74,0.5)">€ de dette</text>
  ${grid}${path}${dots}${xL}
  <text x="${W - PR}" y="${H - 3}" text-anchor="end" font-size="12" fill="rgba(27,46,74,0.5)">Années</text>
</svg></div>`;
    };

    // Cash-flow après impôt, scénario central (hors saisonnier)
    const makeCashChart = (): string => {
      const lastY = Math.min(duree + 5, HORIZON);
      const pts = CR.proj.filter(y => y.year <= lastY);
      const W = 690, H = 185, PL = 66, PR = 40, PT = 26, PB = 34;
      const iW = W - PL - PR, iH = H - PT - PB;
      const vals = pts.map(p => p.cashflowMensuel);
      const sc = niceScale(Math.min(0, ...vals), Math.max(...vals, 1), 2);
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(lastY - 1, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 3 }, (_, i) => {
        const t = i / 2, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(27,46,74,0.14)" stroke-width="1"/><text x="${PL - 9}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(27,46,74,0.55)">${fN(v)}</text>`;
      }).join("");
      const path = `<path d="${pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(p.cashflowMensuel).toFixed(1)}`).join(" ")}" fill="none" stroke="#1A6644" stroke-width="2.6" stroke-linejoin="round"/>`;
      const espace = Math.max(1, lastY / 8);
      const marks = Array.from(new Set([1, ...jalons, lastY].filter(y => y >= 1 && y <= lastY))).sort((a, b) => a - b)
        .filter((y, i, arr) => i === 0 || y === lastY || y - arr[i - 1] >= espace);
      const dots = marks.map((yr, k) => {
        const v = CR.at(yr).cashflowMensuel;
        const anchor: "start" | "middle" | "end" = yr === 1 ? "start" : yr === lastY ? "end" : "middle";
        return `<circle cx="${toX(yr).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="3" fill="#1A6644"/><text x="${toX(yr).toFixed(1)}" y="${(toY(v) + ((yr === duree || (k % 2 === 1 && yr < duree)) ? 17 : -10)).toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="700" fill="#145136">${fE(v)}</text>`;
      }).join("");
      const xL = marks.map(yr => `<text x="${toX(yr).toFixed(1)}" y="${PT + iH + 18}" text-anchor="middle" font-size="12" fill="rgba(27,46,74,0.55)">${yr}</text>`).join("");
      return `<div class="graph"><svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
  <text x="2" y="${PT - 8}" font-size="12" fill="rgba(27,46,74,0.5)">€/mois</text>
  ${grid}${path}${dots}${xL}
  <text x="${W - PR}" y="${H - 3}" text-anchor="end" font-size="12" fill="rgba(27,46,74,0.5)">Années</text>
</svg></div>`;
    };

    /* ── Identité du dossier ────────────────────────────────────────────────── */
    const today = new Date().toLocaleDateString("fr-FR");
    const typeLabel = bienInfo.type === "ma" ? "Maison" : bienInfo.type === "im" ? "Immeuble" : "Appartement";
    const typeArticle = bienInfo.type === "ma" ? "Une maison louée meublée" : bienInfo.type === "im" ? "Un immeuble loué meublé" : "Un appartement loué meublé";
    const bienLigne = [
      "Investissement locatif meublé",
      typeLabel,
      bienInfo.pieces ? `T${bienInfo.pieces}` : "",
      bienInfo.surface ? `${bienInfo.surface} m²` : "",
      bienInfo.ville || "",
    ].filter(Boolean).join(" · ");
    const usage = isSaisonnier ? "Location saisonnière" : "Meublé longue durée";

    /* ── Briques HTML ───────────────────────────────────────────────────────── */
    const infoClef = (titre: string, texte: string) =>
      `<div class="info"><div class="info-b">INFO CLEF</div><div class="info-c"><div class="info-t">${titre}</div><div class="info-x">${texte}</div></div></div>`;
    const kpi = (l: string, v: string, s: string, tone: "" | "gr" | "rd" = "") =>
      `<div class="kpi ${tone}"><div class="kpi-l">${l}</div><div class="kpi-v">${v}</div><div class="kpi-s">${s}</div></div>`;
    const row = (l: string, v: string, mute = false) =>
      `<div class="ir"><span class="ir-l">${l}</span><span class="ir-v"${mute ? ` style="color:rgba(27,46,74,0.45)"` : ""}>${v}</span></div>`;
    const star = (v: number) => v > 0 ? fE(v) : fE(0);
    // valeur déclinée par estimation en saisonnier, simple sinon
    const perCase = (fn: (c: typeof C0) => string) =>
      dual ? cases.map(c => `<span class="pc"><em>${c.label.replace("Estimation ", "")}</em> ${fn(c)}</span>`).join("")
        : fn(C0);

    const pages: { badge: string; titre: string; sous: string; corps: string }[] = [];

    /* ══ 1 · LE BIEN ET SES REVENUS ═══════════════════════════════════════════ */
    const blocCharges = `
<div class="sec">LES CHARGES RÉCURRENTES DU BIEN · PAR AN</div>
<div class="duo">
  <div class="box be">
    <div class="box-h">CHARGES ET ASSURANCES</div>
    ${row("Copropriété propriétaire", star(chargesCopro), chargesCopro === 0)}
    ${row("Taxe foncière", star(taxeFonciere), taxeFonciere === 0)}
    ${row("PNO / loyers impayés", star(pnoEur), pnoEur === 0)}
  </div>
  <div class="box bl">
    <div class="box-h">GESTION ET ENTRETIEN</div>
    ${row("Gestion / comptabilité", `${star(gestionEur)} / ${star(compta)}`, gestionEur === 0 && compta === 0)}
    ${row("Entretien / autres", star(entretien), entretien === 0)}
    ${row("Total des charges retenues", fE(chargesAnnuelles))}
  </div>
</div>`;

    if (!saison) {
      pages.push({
        badge: "1", titre: "Le bien et ses revenus",
        sous: `${typeArticle} : budget d'acquisition, recettes et revenu net d'exploitation.`,
        corps: `
<div class="duo">
  <div class="box be">
    <div class="box-h">LE BIEN ET L'ACQUISITION</div>
    ${row("Type", bienInfo.pieces ? `${typeLabel} T${bienInfo.pieces}` : typeLabel)}
    ${row("Prix d'achat", fE(prix))}
    ${row("Frais de notaire", star(notaire), notaire === 0)}
    ${row("Travaux / mobilier", star(travaux + mobilier), travaux + mobilier === 0)}
    ${row("Coût total du projet", fE(investTotal))}
  </div>
  <div class="box bl">
    <div class="box-h">LA LOCATION ET LES REVENUS</div>
    ${row("Usage simulé", usage)}
    ${row("Loyer mensuel HC", fE(C0.loyerMois))}
    ${row("Loyers annuels HC", fE(C0.loyerAn))}
    ${row("Charges récupérées", star(chargesLocatairesAnnuel), chargesLocatairesAnnuel === 0)}
    ${row("Régime retenu", regimeLabel)}
  </div>
</div>
${blocCharges}
<div class="kpis">
  ${kpi("LOYERS ANNUELS", fE(C0.loyerAn), `${fE(C0.loyerMois)} encaissés par mois`)}
  ${kpi("CHARGES ANNUELLES", fE(chargesAnnuelles), `${fE(chargesMois)} par mois · ${fP(C0.recettes > 0 ? chargesAnnuelles / C0.recettes * 100 : 0)} des loyers`)}
  ${kpi("NOI · REVENU NET", fE(C0.noi), `${fE(C0.noi / 12)}/mois avant crédit et impôt`, "gr")}
</div>
<p class="para">NOI (Net Operating Income) = loyers encaissés − charges d'exploitation. Les charges du bien se poursuivent après le crédit ; l'assurance emprunteur est présentée avec la dette.</p>

${infoClef(`${fP(C0.recettes > 0 ? C0.noi / C0.recettes * 100 : 0, 1)} des loyers restent disponibles avant financement`,
          `Après ${fE(chargesAnnuelles)} de charges annuelles, le bien produit <strong>${fE(C0.noi)}</strong> de NOI, soit <strong>${fP(C0.debtYield)}</strong> du montant emprunté : c'est le rendement que la banque finance, indépendamment du taux et de la durée. ${chargesAnnuelles / Math.max(C0.recettes, 1) < 0.15 ? `La structure de charges est légère (${fP(chargesAnnuelles / Math.max(C0.recettes, 1) * 100, 1)} des loyers), ce qui laisse peu de place à une dérive du NOI` : `La structure de charges pèse ${fP(chargesAnnuelles / Math.max(C0.recettes, 1) * 100, 1)} des loyers : c'est le premier levier d'amélioration du NOI`}.`)}`,
      });
    } else {
      /* Saisonnier : une page « le bien », une page « les revenus et hypothèses » */
      pages.push({
        badge: "1", titre: "Le bien", sous: `${typeArticle} en location saisonnière : budget d'acquisition et charges d'exploitation.`,
        corps: `
<div class="duo">
  <div class="box be">
    <div class="box-h">LE BIEN ET L'ACQUISITION</div>
    ${row("Type", bienInfo.pieces ? `${typeLabel} T${bienInfo.pieces}` : typeLabel)}
    ${row("Localisation", bienInfo.ville || "Non renseignée")}
    ${row("Surface", bienInfo.surface ? `${bienInfo.surface} m²` : "Non renseignée")}
    ${row("Prix d'achat", fE(prix))}
    ${row("Frais de notaire", star(notaire), notaire === 0)}
    ${row("Travaux / mobilier", star(travaux + mobilier), travaux + mobilier === 0)}
    ${row("Coût total du projet", fE(investTotal))}
  </div>
  <div class="box bl">
    <div class="box-h">L'EXPLOITATION</div>
    ${row("Usage simulé", "Location saisonnière")}
    ${row("Régime retenu", regimeLabel)}
    ${row("Prix par nuitée", fE(prixNuitee))}
    ${row("Charges récupérées", star(chargesLocatairesAnnuel), chargesLocatairesAnnuel === 0)}
    ${row("Charges d'exploitation", `${fE(chargesAnnuelles)}/an`)}
    ${row("Service de la dette", `${fE(serviceDette)}/an`)}
    ${row("Meublé de tourisme", "Non classé (hypothèse)")}
  </div>
</div>
${blocCharges}
<p class="para">En location saisonnière, les charges d'exploitation sont indépendantes du niveau d'occupation : elles constituent le socle fixe que les nuitées doivent couvrir avant toute rémunération du capital. Le service de la dette s'y ajoute à hauteur de <strong>${fE(serviceDette)}</strong> par an.</p>

${infoClef(`Un socle de charges fixes de ${fE(chargesAnnuelles + serviceDette)} par an`,
          `Charges du bien et échéances de crédit cumulées, le projet doit produire <strong>${fE(chargesAnnuelles + serviceDette)}</strong> de recettes annuelles pour s'équilibrer avant impôt, soit <strong>${Math.ceil((chargesAnnuelles + serviceDette) / Math.max(prixNuitee, 1))} nuits</strong> au prix de ${fE(prixNuitee)}${prixNuitee > 0 ? ` (${fP(Math.ceil((chargesAnnuelles + serviceDette) / prixNuitee) / 365 * 100, 1)} d'occupation)` : ""}. C'est le seuil physique d'exploitation du bien, avant toute fiscalité.`)}`,
      });

      const estAll = [
        { k: "bas" as const, lbl: "Estimation basse", t: occ.bas, r: triple?.bas ?? null },
        { k: "moyen" as const, lbl: "Estimation moyenne", t: occ.moyen, r: triple?.moyen ?? null },
        { k: "haut" as const, lbl: "Estimation haute", t: occ.haut, r: triple?.haut ?? null },
      ];
      pages.push({
        badge: "2", titre: "Les revenus et les hypothèses",
        sous: "Les trois niveaux d'occupation simulés, et ceux retenus pour l'analyse de financement.",
        corps: `
<div class="sec">LES HYPOTHÈSES DE RECETTES</div>
<table class="tbl">
  <tr><th>Hypothèse d'occupation</th><th class="r">Taux</th><th class="r">Nuits / an</th><th class="r">Prix / nuitée</th><th class="r">Recettes / mois</th><th class="r">Recettes / an</th><th class="r">NOI / an</th></tr>
  ${estAll.map(e => {
          const la = e.r?.loyerAnnuel ?? 0;
          const retenue = e.k !== "haut";
          return `<tr class="${retenue ? "keep" : "drop"}"><td>${e.lbl}${retenue ? ` <em class="tag">retenue</em>` : ` <em class="tag off">écartée</em>`}</td><td class="r">${fP(e.t, 0)}</td><td class="r">${nuits(e.t)}</td><td class="r">${fE(prixNuitee)}</td><td class="r">${fE(la / 12)}</td><td class="r">${fE(la)}</td><td class="r">${fE(la + chargesLocatairesAnnuel - chargesAnnuelles)}</td></tr>`;
        }).join("")}
</table>
<p class="para"><strong>Principe de prudence retenu dans ce dossier :</strong> l'estimation haute (${fP(occ.haut, 0)} d'occupation, ${fE(triple?.haut?.loyerAnnuel ?? 0)} de recettes) est mentionnée ici pour situer le potentiel du bien, mais <strong>elle n'est reprise dans aucune des pages suivantes</strong>. L'ensemble de l'analyse — indicateurs, exploitation, fiscalité et projection — est décliné sur les seules estimations basse et moyenne.</p>

<div class="sec tight">CE QUE PRODUISENT LES DEUX ESTIMATIONS RETENUES</div>
${cases.map(c => `<div class="estbar">${c.label.toUpperCase()} · ${c.sousLabel}</div>
<div class="kpis">
  ${kpi("RECETTES ANNUELLES", fE(c.loyerAn), `${fE(c.loyerMois)} par mois`)}
  ${kpi("NOI · REVENU NET", fE(c.noi), `${fE(c.noi / 12)}/mois avant crédit et impôt`, "gr")}
  ${kpi("COUVERTURE DE LA DETTE", fX(c.dscr), `${fE(c.noi)} de NOI / ${fE(serviceDette)} d'échéances`, c.dscr >= 1 ? "gr" : "rd")}
</div>`).join("")}

<p class="para">L'écart de recettes entre les deux estimations est de <strong>${fE(CR.loyerAn - C0.loyerAn)}</strong> par an, soit <strong>${fP(C0.loyerAn > 0 ? (CR.loyerAn / C0.loyerAn - 1) * 100 : 0, 0)}</strong>. Les charges et la dette étant fixes, cet écart se répercute intégralement sur le NOI et sur la trésorerie.</p>

${infoClef(`L'occupation basse ${C0.dscr >= 1 ? "suffit déjà à couvrir la dette" : "ne couvre pas encore la dette"}`,
          C0.dscr >= 1
            ? `À ${fP(occ.bas, 0)} d'occupation seulement (${nuits(occ.bas)} nuits), le NOI de <strong>${fE(C0.noi)}</strong> couvre les échéances <strong>${fX(C0.dscr)}</strong>. Le dossier peut donc s'analyser sur l'hypothèse la plus défensive : tout ce qui est produit au-delà de ${nuits(occ.bas)} nuits constitue une marge de sécurité, et non une condition de remboursement.`
            : `À ${fP(occ.bas, 0)} d'occupation, le NOI de <strong>${fE(C0.noi)}</strong> couvre ${fX(C0.dscr)} les échéances : il manque <strong>${fE(serviceDette - C0.noi)}</strong> par an, soit ${Math.ceil((serviceDette - C0.noi) / Math.max(prixNuitee, 1))} nuits supplémentaires. L'équilibre du dossier suppose donc d'atteindre au moins ${Math.ceil((chargesAnnuelles + serviceDette) / Math.max(prixNuitee, 1))} nuits ; l'estimation moyenne (${nuits(occ.moyen)} nuits) y parvient avec ${fX(CR.dscr)} de couverture.`)}`,
      });
    }

    /* ══ 2 · LE PLAN DE FINANCEMENT ═══════════════════════════════════════════ */
    const pct = (v: number) => investTotal > 0 ? fP(v / investTotal * 100, 1) : "0 %";
    const emplois: [string, number][] = [
      ["Prix d'achat", prix], ["Frais de notaire", notaire], ["Travaux", travaux], ["Mobilier", mobilier],
    ];
    const ressources: [string, number][] = [
      ["Apport personnel", apport], ["Crédit immobilier", montantCredit], ["Autres prêts", 0], ["Subventions", 0],
    ];
    pages.push({
      badge: String(pages.length + 1), titre: "Le plan de financement",
      sous: montantCredit > 0
        ? `Une demande de ${fE(montantCredit)} sur ${duree} ans, couvrant ${montantCredit > prix ? "l'achat et les frais d'acquisition" : "une partie du prix d'achat"}.`
        : `Une acquisition financée sans recours au crédit.`,
      corps: `
<div class="duo">
  <div>
    <div class="sec">EMPLOIS</div>
    <table class="tbl"><tr><th>Poste</th><th class="r">Montant</th><th class="r">% total</th></tr>
      ${emplois.map(([l, v]) => `<tr><td>${l}</td><td class="r">${fE(v)}</td><td class="r">${pct(v)}</td></tr>`).join("")}
      <tr class="tot"><td>Total emplois</td><td class="r">${fE(investTotal)}</td><td class="r">100 %</td></tr>
    </table>
  </div>
  <div>
    <div class="sec">RESSOURCES</div>
    <table class="tbl"><tr><th>Poste</th><th class="r">Montant</th><th class="r">% total</th></tr>
      ${ressources.map(([l, v]) => `<tr><td>${l}</td><td class="r">${fE(v)}</td><td class="r">${pct(v)}</td></tr>`).join("")}
      <tr class="tot"><td>Total ressources</td><td class="r">${fE(apport + montantCredit)}</td><td class="r">100 %</td></tr>
    </table>
  </div>
</div>

<div class="sec tight">LES CONDITIONS DE LA DEMANDE</div>
<div class="kpis">
  ${kpi("TAUX NOMINAL", montantCredit > 0 ? fP(taux * 100) : "—", montantCredit > 0 ? "Fixe dans la simulation" : "Aucun crédit simulé")}
  ${kpi("DURÉE", montantCredit > 0 ? `${duree} ans` : "—", montantCredit > 0 ? `${duree * 12} mensualités sans différé` : "Acquisition comptant")}
  ${kpi("CRÉDIT + ASSURANCE", `${fE2(echeanceTotale)}/mois`, `${fE2(serviceDette)} par an`)}
</div>

<table class="tbl" style="margin-top:12px">
  <tr><th>Lecture du montage</th><th class="r">Montant / proportion</th></tr>
  <tr><td>Apport / coût du projet</td><td class="r">${fE(apport)} / ${pct(apport)}</td></tr>
  <tr><td>Crédit / coût total · LTC</td><td class="r">${pct(montantCredit)}</td></tr>
  <tr><td>Crédit / prix d'achat</td><td class="r">${prix > 0 ? fP(montantCredit / prix * 100, 1) : "—"}</td></tr>
  <tr><td>Solde : ressources − emplois</td><td class="r">${fE(apport + montantCredit - investTotal)}</td></tr>
</table>

${infoClef(
        montantCredit > prix ? "Le crédit finance également les frais d'acquisition"
          : apport > 0 ? `Un apport de ${pct(apport)} réduit d'autant le service de la dette`
            : "Une acquisition sans recours au crédit",
        montantCredit > prix
          ? `La dette dépasse le prix du bien de <strong>${fE(montantCredit - prix)}</strong>, c'est-à-dire les frais d'acquisition : il n'y a pas de marge de garantie initiale sur cette base de prix. Elle se reconstitue par l'amortissement du capital — <strong>${fE(CR.proj[0].capitalRembourse)}</strong> dès la première année, et la dette repasse sous le prix d'achat en année <strong>${(CR.proj.find(y => y.capitalFin <= prix)?.year ?? duree)}</strong>. L'échéance de ${fE2(echeanceTotale)} est couverte ${fX(CR.dscr)} par le revenu d'exploitation.`
          : apport > 0
            ? `L'apport de <strong>${fE(apport)}</strong> ramène la dette à <strong>${prix > 0 ? fP(montantCredit / prix * 100, 1) : "—"}</strong> du prix d'achat et l'échéance à ${fE2(echeanceTotale)} par mois. Le revenu d'exploitation la couvre ${fX(CR.dscr)} ; chaque euro d'apport supplémentaire allège l'échéance d'environ <strong>${fE2(montantCredit > 0 ? echeanceTotale / montantCredit * 1000 : 0)}</strong> par tranche de 1 000 €.`
            : `Le projet est financé sans emprunt : le revenu net d'exploitation de <strong>${fE(CR.noi)}</strong> est intégralement disponible avant impôt, et aucun risque de refinancement ne pèse sur l'opération.`)}`,
    });

    /* ══ 3 · LES INDICATEURS DU PROJET ════════════════════════════════════════ */
    const indic = (val: string, titre: string, texte: string, tone: "" | "gr" | "rd" = "") =>
      `<div class="ind"><div class="ind-v ${tone}">${val}</div><div class="ind-c"><div class="ind-t">${titre}</div><div class="ind-x">${texte}</div></div></div>`;
    // gros chiffre de la colonne de gauche
    const biBlock = (fn: (c: typeof C0) => string) =>
      dual ? cases.map(c => `<span class="b2"><em>${c.label.replace("Estimation ", "")}</em>${fn(c)}</span>`).join("") : fn(C0);
    // même valeur, mais au fil du texte
    const biInline = (fn: (c: typeof C0) => string) =>
      dual ? cases.map(c => `<strong>${fn(c)}</strong> en ${c.label.replace("Estimation ", "occupation ")}`).join(" et ") : fn(C0);

    pages.push({
      badge: String(pages.length + 1), titre: "Les indicateurs du projet",
      sous: dual
        ? "Capacité du bien à porter sa dette, niveau de financement et rendements, sur les deux estimations retenues."
        : "Lire la capacité du bien à porter sa dette, son niveau de financement et ses rendements.",
      corps: `
${indic(biBlock(c => fX(c.dscr)), "DSCR · COUVERTURE DU SERVICE DE LA DETTE",
        dual
          ? `NOI rapporté aux ${fE(serviceDette)} d'échéances annuelles. À occupation basse le revenu d'exploitation ${C0.dscr >= 1 ? `laisse déjà ${fE(C0.noi - serviceDette)} d'excédent avant impôt` : `est inférieur de ${fE(serviceDette - C0.noi)} aux échéances`} ; à occupation moyenne ${CR.dscr >= 1 ? `l'excédent atteint ${fE(CR.noi - serviceDette)}` : `il manque encore ${fE(serviceDette - CR.noi)}`}.`
          : `${fE(C0.noi)} de NOI / ${fE(serviceDette)} de crédit et assurance. Le revenu d'exploitation couvre les échéances avec ${fE(C0.noi - serviceDette)} d'excédent avant impôt.`,
        C0.dscr >= 1 ? "gr" : "rd")}

${indic(biBlock(c => fP(c.debtYield)), "DEBT YIELD · NOI / EMPRUNT INITIAL",
        `Rendement du revenu d'exploitation rapporté à la dette de ${fE(montantCredit)}, indépendamment du taux et de la durée. C'est le ratio qui résiste à une remontée des taux : il ne bouge que si les recettes ou les charges changent.`)}

${indic(investTotal > 0 ? fP(montantCredit / investTotal * 100, 1) : "—", "LTC · EMPRUNT / COÛT TOTAL",
        `${fE(montantCredit)} / ${fE(investTotal)}. ${apport > 0 ? `${pct(apport)} du coût est couvert par apport.` : `L'intégralité du coût du projet est financée par emprunt ; 0 % par apport.`}`)}

${indic(prix > 0 ? fP(montantCredit / prix * 100, 1) : "—", "DETTE / PRIX D'ACHAT",
        `${fE(montantCredit)} / ${fE(prix)}. Ce ratio utilise le prix d'achat ; le LTV bancaire utilise la valeur retenue par le prêteur, qui peut être différente. Il passe sous 80 % en année ${(CR.proj.find(y => y.capitalFin <= prix * 0.8)?.year ?? duree)}.`)}

${indic(biBlock(c => fP(c.rendBrutCout)), "RENDEMENT BRUT · SUR COÛT TOTAL",
        `Loyers rapportés aux ${fE(investTotal)} investis. Sur le seul prix d'achat de ${fE(prix)}, le rendement brut est de ${biInline(c => fP(c.rendBrutPrix))}.`)}

${indic(biBlock(c => fP(c.rendNet)), "RENDEMENT NET DES CHARGES · SUR COÛT TOTAL",
        `NOI rapporté aux ${fE(investTotal)} investis. Performance du bien avant financement et fiscalité ; elle ne correspond pas au cash réellement conservé.`,
        "gr")}

<p class="foot-note">DSCR retenu assurance incluse (${biInline(c => fX(c.dscrHorsAss))} hors assurance). Les définitions et seuils d'acceptation varient selon le prêteur et le financement ; aucun seuil d'accord bancaire universel n'est appliqué. Référence de méthode : OCC, p. 40–44 <sup>[1]</sup>.</p>

${infoClef(
        CR.cashAn1 >= 0 ? "La marge avant impôt et le cash final sont très différents" : "La fiscalité fait basculer le dossier en effort d'épargne",
        `Le DSCR de ${fX(CR.dscr)} se lit avant impôt. Après les <strong>${fE(CR.impot1)}</strong> de fiscalité de l'année 1, il ne reste que <strong>${fE(CR.noi - CR.impot1)}</strong> pour honorer ${fE(serviceDette)} d'échéances, soit une couverture réelle de <strong>${fX(serviceDette > 0 ? (CR.noi - CR.impot1) / serviceDette : 0)}</strong>. ${CR.cashAn1 >= 0
          ? `Le projet reste excédentaire de ${fE(CR.cashAn1)} par an, mais c'est ce second ratio — et non le DSCR — qui mesure la véritable marge de manœuvre de l'emprunteur.`
          : `Le projet exige donc un effort de ${fE(Math.abs(CR.cashMois1))} par mois, à rapprocher des revenus de l'emprunteur : c'est ce second ratio, et non le DSCR, qui conditionne la tenue du dossier.`}${!isMicro && anneesSansImpot > 0 ? ` L'amortissement neutralise toutefois l'impôt pendant les ${anneesSansImpot} premières années (partie ${pages.length + 2}).` : ""}`)}`,
    });

    /* ══ 4 · EXPLOITATION ET FISCALITÉ ════════════════════════════════════════ */
    const cols = dual ? cases.length * 2 : 2;
    const flux = (l: string, v: (c: typeof C0) => number, cls = "", signe = false) =>
      `<tr class="${cls}"><td>${l}</td>${cases.map(c => {
        const x = v(c);
        const s = signe ? sE(x) : fE(x);
        const sm = signe ? sE2(x / 12) : fE2(x / 12);
        const tone = signe ? ` style="color:${col(x)};font-weight:700"` : "";
        return `<td class="r"${tone}>${s}</td><td class="r"${tone}>${sm}</td>`;
      }).join("")}</tr>`;

    const detailImpot = isMicro ? `
<div class="calc">
  ${cases.map(c => `<p>${dual ? `<strong>${c.label} — </strong>` : ""}<strong>${fE(c.recettes)}</strong> de recettes × (1 − ${abattLabel} d'abattement) = <strong>${fE(c.base1)}</strong> imposables.</p>
  <p>Impôt sur le revenu : ${fE(c.base1)} × ${tmi} % = <strong>${fE(c.ir1)}</strong>. Prélèvements sociaux : ${fE(c.base1)} × 18,6 % = <strong>${fE(c.ps1)}</strong>.</p>
  <p class="calc-t">Total : ${fE(c.impot1)}/an, soit ${fE2(c.impot1 / 12)}/mois.</p>`).join("")}
</div>
<p class="foot-note">L'abattement forfaitaire remplace les déductions de charges, d'intérêts et d'amortissements : leur variation ne change pas la base micro-BIC à recettes constantes. IR estimé à la TMI ; prélèvements sociaux hors affiliation aux cotisations sociales. <sup>[2]</sup></p>`
      : `
<div class="calc">
  ${cases.map(c => `<p>${dual ? `<strong>${c.label} — </strong>` : ""}<strong>${fE(c.recettes)}</strong> de recettes − ${fE(chargesAnnuelles)} de charges − ${fE(c.y1.interets)} d'intérêts − ${fE(c.y1.assuranceEmprunteur)} d'assurance = <strong>${fE(c.y1.resultatAvantAmort)}</strong> de résultat avant amortissement.</p>
  <p>Amortissement déduit : <strong>${fE(c.y1.amortImpute)}</strong>${c.y1.reportSortant > 1 ? ` (sur ${fE(c.y1.amortDotation)} de dotation ; ${fE(c.y1.reportSortant)} reportés sans limite de durée)` : ""} → base imposable : <strong>${fE(c.base1)}</strong>.</p>
  <p class="calc-t">IR ${fE(c.ir1)} + prélèvements sociaux ${fE(c.ps1)} = ${fE(c.impot1)}/an, soit ${fE2(c.impot1 / 12)}/mois.</p>`).join("")}
</div>
<p class="foot-note">Le capital remboursé n'est pas déductible : seule la part d'intérêts de l'échéance réduit la base. L'amortissement est une charge comptable sans décaissement, ce qui explique l'écart entre l'impôt et la trésorerie. IR estimé à la TMI ; prélèvements sociaux hors affiliation aux cotisations sociales. <sup>[2]</sup></p>`;

    pages.push({
      badge: String(pages.length + 1), titre: "Exploitation et fiscalité",
      sous: `Le compte d'exploitation du projet, puis le passage au cash disponible ${isMicro ? "sous le micro-BIC choisi" : "au régime réel choisi"}.`,
      corps: `
<table class="tbl flux">
  <tr><th rowspan="${dual ? 2 : 1}">Année 1 · flux de trésorerie</th>${dual ? cases.map(c => `<th class="c" colspan="2">${c.label}</th>`).join("") : `<th class="r">Par an</th><th class="r">Moyenne / mois</th>`}</tr>
  ${dual ? `<tr>${cases.map(() => `<th class="r sub">Par an</th><th class="r sub">/ mois</th>`).join("")}</tr>` : ""}
  ${flux("Loyers encaissés", c => c.recettes)}
  ${flux("Charges d'exploitation", () => -chargesAnnuelles)}
  ${flux("NOI · revenu net d'exploitation", c => c.noi, "tot")}
  ${flux("Capital remboursé", c => -c.y1.capitalRembourse)}
  ${flux("Intérêts du prêt", c => -c.y1.interets)}
  ${flux("Assurance emprunteur", c => -c.y1.assuranceEmprunteur)}
  ${flux("Excédent avant impôt", c => c.excedentAvantImpot, "tot", true)}
  ${flux(`IR · TMI ${tmi} %`, c => -c.ir1, "fisc")}
  ${flux("Prélèvements sociaux · 18,6 %", c => -c.ps1, "fisc")}
  ${flux("Excédent après impôt", c => c.cashAn1, "tot", true)}
</table>

<div class="sec tight">${isMicro ? "MICRO-BIC" : "RÉGIME RÉEL"} · DE LA RECETTE À L'IMPÔT</div>
${detailImpot}
<p class="foot-note">Convention de lecture : cash positif = excédent ; cash négatif = effort à financer. Les montants mensuels sont des moyennes annuelles, notamment pour la fiscalité.</p>

${infoClef(
        CR.excedentAvantImpot <= 0
          ? `L'impôt s'applique même lorsque l'exploitation ne couvre pas la dette`
          : isMicro
            ? (CR.partFiscale >= 50 ? `La fiscalité absorbe ${fP(CR.partFiscale, 1)} de l'excédent avant impôt` : `L'abattement de ${abattLabel} contient la fiscalité à ${fP(CR.partFiscale, 1)} de l'excédent`)
            : (anneesSansImpot > 0 ? `L'amortissement neutralise l'impôt pendant ${anneesSansImpot} ans` : `L'amortissement ramène l'impôt à ${fP(CR.partFiscale, 1)} de l'excédent`),
        `${CR.excedentAvantImpot > 0
          ? `Sur les <strong>${fE2(CR.excedentAvantImpot / 12)}/mois</strong> dégagés après charges et échéances, ${fE2(CR.impot1 / 12)} partent en impôt et <strong>${fE2(CR.cashMois1)}</strong> restent à l'investisseur.`
          : `L'exploitation laisse déjà ${fE2(Math.abs(CR.excedentAvantImpot) / 12)}/mois de découvert après charges et échéances ; l'impôt de ${fE2(CR.impot1 / 12)}/mois s'y ajoute et porte l'effort à <strong>${fE2(Math.abs(CR.cashMois1))}/mois</strong>.`} ${isMicro
          ? `Au micro-BIC la base ne dépend que des recettes : l'impôt de ${fE(CR.impot1)} restera identique chaque année, y compris après la fin du crédit — où la trésorerie passera à ${fE2(CR.apresPret)}/mois.`
          : `Le capital remboursé — ${fE(CR.y1.capitalRembourse)} en année 1, ${fE(capitalTotal)} au total — n'est pas une charge mais un enrichissement : l'effort réel de l'investisseur est inférieur de ce montant à ce que la trésorerie laisse paraître.`}${dual ? ` En occupation basse, la trésorerie s'établit à ${fE2(C0.cashMois1)}/mois : ${C0.cashMois1 >= 0 ? "le dossier reste autofinancé dans l'hypothèse la plus prudente" : `un effort de ${fE(Math.abs(C0.cashMois1))}/mois est alors nécessaire`}.` : ""}`)}`,
    });

    /* ══ 4bis · L'AMORTISSEMENT (régime réel uniquement) ══════════════════════ */
    if (!isMicro && amortCols.length > 0) {
      pages.push({
        badge: String(pages.length + 1), titre: "L'amortissement et son effet fiscal",
        sous: "Le plan d'amortissement retenu, son incidence sur l'impôt pendant le crédit, et sa contrepartie à la revente.",
        corps: `
<div class="kpis">
  ${kpi("BASE AMORTISSABLE", fE(baseAmortissable), `${fP(amortPct, 0)} du prix ; terrain exclu : ${fE(terrainVal)}`)}
  ${kpi("DOTATION ANNÉE 1", fE(CR.y1.amortDotation), `${fE2(CR.y1.amortDotation / 12)} par mois, sans décaissement`)}
  ${kpi("IMPÔT ÉVITÉ SUR LE PRÊT", fE(economieCredit), `${fE(economieAn1)} dès l'année 1`, "gr")}
</div>

<div class="sec tight">LE PLAN D'AMORTISSEMENT DU DOSSIER</div>
<table class="tbl">
  <tr><th>Composant</th><th class="r">Base amortissable</th><th class="r">Durée</th><th class="r">Dotation / an</th><th class="r">Part de la dotation</th></tr>
  ${amortCols.map(c => `<tr><td>${c.label}</td><td class="r">${fE(c.base)}</td><td class="r">${c.duree} ans</td><td class="r">${fE(c.annuel)}</td><td class="r">${fP(CR.y1.amortDotation > 0 ? c.annuel / CR.y1.amortDotation * 100 : 0, 1)}</td></tr>`).join("")}
  <tr class="tot"><td>Total</td><td class="r">${fE(baseAmortissable)}</td><td class="r">${amortMaxDuree} ans max</td><td class="r">${fE(CR.y1.amortDotation)}</td><td class="r">100 %</td></tr>
</table>

<div class="sec tight">LA DOTATION DÉCROÎT PAR PALIERS</div>
<table class="tbl compact">
  <tr><th>Dotation annuelle</th>${paliers.slice(0, 6).map(p => `<th class="r">${p.de === p.a ? `An ${p.de}` : `Ans ${p.de}–${p.a}`}</th>`).join("")}</tr>
  <tr><td>Montant déductible</td>${paliers.slice(0, 6).map(p => `<td class="r">${fE(p.val)}</td>`).join("")}</tr>
  <tr><td>Impôt de l'année</td>${paliers.slice(0, 6).map(p => `<td class="r">${fE(CR.at(p.de).impot)}</td>`).join("")}</tr>
</table>

<p class="para"><strong>Ce que cela implique fiscalement.</strong> L'amortissement est une charge comptable qui ne donne lieu à aucun décaissement : il réduit la base imposable sans réduire la trésorerie. ${anneesSansImpot > 0
            ? `Dans ce dossier il absorbe la totalité du bénéfice pendant <strong>${anneesSansImpot} ans</strong>, période durant laquelle le résultat fiscal est nul${reportFinal > 1 ? ` et où ${fE(reportFinal)} d'amortissement non utilisé restent reportables sans limitation de durée (art. 39 C du CGI)` : ""}.`
            : `Il ramène la base imposable de ${fE(CR.y1.resultatAvantAmort)} à <strong>${fE(CR.base1)}</strong> dès l'année 1, soit ${fE(economieAn1)} d'impôt en moins.`} À mesure que les composants arrivent à terme, la dotation diminue et l'impôt remonte mécaniquement : il passe de ${fE(CR.impot1)} en année 1 à <strong>${fE(CR.proj[CR.proj.length - 1].impot)}</strong> une fois le plan achevé.</p>

<p class="para"><strong>La contrepartie à la revente.</strong> Depuis la loi de finances 2025, les amortissements effectivement déduits sont réintégrés dans l'assiette de la plus-value de cession : les <strong>${fE(amortCumulCredit)}</strong> déduits pendant le crédit viennent diminuer d'autant le prix d'acquisition retenu. L'avantage fiscal est donc un différé d'imposition, non une exonération — atténué par les abattements pour durée de détention (IR au-delà de 22 ans, prélèvements sociaux au-delà de 30 ans).</p>

${infoClef(`Un impôt différé qui sécurise la trésorerie pendant le remboursement`,
          `L'amortissement économise <strong>${fE(economieCredit)}</strong> d'impôt sur les ${duree} ans de crédit, soit <strong>${fE2(economieCredit / (duree * 12))}/mois</strong> de trésorerie supplémentaire exactement sur la période où l'emprunteur porte l'échéance. C'est ce mécanisme qui explique un cash-flow de ${fE2(CR.cashMois1)}/mois là où le seul excédent d'exploitation après impôt sans amortissement serait de ${fE2((CR.excedentAvantImpot - impotSansAmort1) / 12)}/mois. Le prix à payer est différé à la revente, et n'affecte donc pas la capacité de remboursement pendant le prêt.`)}`,
      });
    }

    /* ══ 5 · LA STRUCTURE DE LA DETTE ═════════════════════════════════════════ */
    if (montantCredit > 0) {
      pages.push({
        badge: String(pages.length + 1), titre: "La structure de la dette",
        sous: `Un prêt amortissable à échéances constantes, remboursé intégralement au terme des ${duree} ans.`,
        corps: `
<div class="kpis">
  ${kpi("CAPITAL INITIAL", fE(montantCredit), "Un seul crédit amortissable")}
  ${kpi("TAUX / DURÉE", `${fP(taux * 100)} / ${duree} ans`, "Taux fixe · aucun différé")}
  ${kpi("ÉCHÉANCE TOTALE", fE2(echeanceTotale), `${fE2(mensualite)} + ${fE2(assuranceMois)} d'assurance`)}
</div>

<div class="sec tight">CAPITAL RESTANT DÛ · FIN D'ANNÉE</div>
${makeDetteChart()}

<table class="tbl">
  <tr><th>Fin d'année</th><th class="r">Dette restante</th><th class="r">Capital remboursé cumulé</th><th class="r">Intérêts cumulés</th><th class="r">Dette / prix d'achat</th></tr>
  ${jalons.map(y => {
          const r = CR.at(y);
          const intCum = CR.proj.slice(0, y).reduce((s, x) => s + x.interets, 0);
          return `<tr><td>Année ${y}</td><td class="r">${fE(r.capitalFin)}</td><td class="r">${fE(r.capitalRembourseCumul)}</td><td class="r">${fE(intCum)}</td><td class="r">${prix > 0 ? fP(r.capitalFin / prix * 100, 1) : "—"}</td></tr>`;
        }).join("")}
</table>

<p class="para">Sur ${duree} ans : ${fE(capitalTotal)} de capital + ${fE(interetsTotaux)} d'intérêts + ${fE(assuranceTotale)} d'assurance = <strong>${fE(totalVerse)} versés</strong>. Coût du financement : <strong>${fE(coutFinancement)}</strong>. Assurance : ${f.assuranceEmprunteur ? `${f.assuranceEmprunteur.replace(".", ",")} %/an du capital initial` : "non renseignée"} ; frais de garantie et de dossier non saisis.</p>

${infoClef("Une dette qui diminue, sans capital final à refinancer",
          `Le prêt est intégralement amortissable : aucun capital résiduel n'est à refinancer au terme. À ${anneeMi} ans, <strong>${fE(dette10.capitalRembourseCumul)}</strong> de capital sont remboursés et la dette revient à <strong>${fE(dette10.capitalFin)}</strong>, soit ${prix > 0 ? fP(dette10.capitalFin / prix * 100, 1) : "—"} du prix d'achat : la garantie se renforce chaque année sans intervention de l'emprunteur. L'échéance, elle, reste fixe à ${fE2(echeanceTotale)} pendant toute la durée, alors que les loyers${isSaisonnier ? " et l'occupation" : ""} sont supposés constants — toute indexation réelle des loyers améliorerait la couverture affichée.`)}`,
      });
    }

    /* ══ 6 · LA RÉSISTANCE AUX IMPRÉVUS (hors saisonnier) ═════════════════════ */
    if (!saison) {
      const s = C0.stress;
      const central = s[0], m10 = s[2], pire = s[s.length - 1];
      pages.push({
        badge: String(pages.length + 1), titre: "La résistance aux imprévus",
        sous: "D'abord la trajectoire centrale, puis l'impact des aléas sur la trésorerie et le rendement du bien.",
        corps: `
<div class="sec">CASH-FLOW APRÈS IMPÔT · SCÉNARIO CENTRAL</div>
${makeCashChart()}
<p class="foot-note">${isMicro
            ? `Excédent stable à ${fE2(C0.cashMois1)}/mois jusqu'à l'année ${duree} ; ${fE2(C0.apresPret)}/mois dès l'année ${duree + 1}, après le crédit et son assurance. Loyers, charges et paramètres fiscaux constants.`
            : `La trésorerie évolue de ${fE2(C0.cashMois1)}/mois en année 1 à ${fE2(C0.at(duree).cashflowMensuel)}/mois en année ${duree}, sous l'effet de la baisse des intérêts déductibles et de la dotation d'amortissement ; elle passe à ${fE2(C0.apresPret)}/mois dès l'année ${duree + 1}. Loyers et charges constants.`}</p>

<div class="sec tight">PENDANT LE PRÊT · CASH RESTANT APRÈS FISCALITÉ</div>
<table class="tbl">
  <tr><th>Scénario</th><th class="r">DSCR</th><th class="r">Rend. net<sup>1</sup></th><th class="r">Écart<sup>1</sup></th><th class="r">Excédent / effort mensuel</th><th class="r">Excédent / effort annuel</th></tr>
  ${s.map((x, i) => `<tr class="${i === 0 ? "tot" : ""}"><td>${x.label}</td><td class="r">${fX(x.dscr)}</td><td class="r">${fP(x.rendNet)}</td><td class="r">${i === 0 ? "0,00 pt" : (x.rendNet - central.rendNet).toFixed(2).replace(".", ",") + " pt"}</td><td class="r" style="color:${col(x.apresMois)};font-weight:700">${sE(x.apresMois)}</td><td class="r" style="color:${col(x.apresAn)};font-weight:700">${sE(x.apresAn)}</td></tr>`).join("")}
</table>
<p class="foot-note"><sup>1</sup> Rendement net des charges avant dette et impôt, sur ${fE(investTotal)} ; écart en points par rapport au central. + = excédent ; − = effort. Scénarios indépendants, sauf le dernier ; détail en annexe A.</p>

${infoClef(
          C0.baisseCash0 > 0 && C0.baisseCash0 < C0.baisseDscr1
            ? "Le premier point de rupture est la trésorerie après impôt"
            : "Le dossier absorbe les aléas testés",
          `Deux seuils distincts encadrent le dossier. Le DSCR ne tombe à 1,00× qu'après <strong>${fP(Math.max(0, C0.baisseDscr1), 1)}</strong> de baisse de loyer (${fE2(C0.loyerDscr1 / 12)}/mois) : la banque garde une marge confortable sur le revenu d'exploitation. Mais la trésorerie de l'investisseur, elle, s'annule dès <strong>${fP(Math.max(0, C0.baisseCash0), 1)}</strong> de baisse (${fE2(C0.loyerCash0 / 12)}/mois), parce que l'impôt ${isMicro ? `reste assis sur les recettes brutes, même dégradées` : `ne recule pas aussi vite que les loyers`}. À −10 %, le DSCR tient à ${fX(m10.dscr)} et ${m10.apresMois >= 0 ? `il reste ${fE(m10.apresMois)}/mois à l'investisseur` : `l'investisseur doit financer ${fE(Math.abs(m10.apresMois))}/mois`}${pire.apresMois < 0 ? ` ; le scénario cumulé (deux mois vides et ${fE(2000)} de charges) porte l'effort à ${fE(Math.abs(pire.apresMois))}/mois` : ""}. C'est cette seconde marge — pas la première — qu'il faut sécuriser.`)}`,
      });

      /* ══ ANNEXE A · SCÉNARIOS DE STRESS EN DÉTAIL ═════════════════════════ */
      pages.push({
        badge: "A", titre: "Les scénarios de stress en détail",
        sous: `Pendant les ${duree} années de crédit · Montants en euros · ${regimeLabel} inchangé.`,
        corps: `
<table class="tbl dense">
  <tr><th>Scénario</th><th class="r">Loyers / an</th><th class="r">Charges / an</th><th class="r">NOI / an</th><th class="r">DSCR</th><th class="r">Rend. net</th><th class="r">Cash avant impôt / mois</th><th class="r">Impôt / an</th><th class="r">Cash après impôt / mois</th><th class="r">Cash après impôt / an</th></tr>
  ${s.map((x, i) => `<tr class="${i === 0 ? "tot" : ""}"><td>${x.label}</td><td class="r">${fN(x.loyers)}</td><td class="r">${fN(x.charges)}</td><td class="r">${fN(x.noi)}</td><td class="r">${fX(x.dscr)}</td><td class="r">${fP(x.rendNet)}</td><td class="r" style="color:${col(x.avantMois)}">${sE(x.avantMois)}</td><td class="r">${fN(x.impot)}</td><td class="r" style="color:${col(x.apresMois)};font-weight:700">${sE(x.apresMois)}</td><td class="r" style="color:${col(x.apresAn)};font-weight:700">${sE(x.apresAn)}</td></tr>`).join("")}
</table>

<p class="foot-note">Deux seuils distincts : à ${fE2(C0.loyerDscr1 / 12)}/mois de loyer, le NOI couvre juste le crédit et l'assurance (DSCR = 1 ; baisse de ${fP(Math.max(0, C0.baisseDscr1), 1)}). Après impôt, l'équilibre exige ${fE2(C0.loyerCash0 / 12)}/mois (baisse de ${fP(Math.max(0, C0.baisseCash0), 1)}). ${C0.chargesAbsorbe > 0 ? `${fE(C0.chargesAbsorbe)} de charges supplémentaires par an absorbent l'excédent central.` : ""}</p>
<p class="foot-note">Méthode : NOI = recettes − charges ; DSCR = NOI / ${fE2(serviceDette)} ; rendement net = NOI / ${fE(investTotal)} ; impôt ${isMicro ? `= recettes × ${abattLabel} × ${fP(tauxGlobal * 100, 1)}` : `= (recettes − charges − intérêts − assurance − amortissement imputable) × ${fP(tauxGlobal * 100, 1)}`}. Vacance : loyer non perçu sur l'année, charges maintenues. Les cash-flows mensuels sont des moyennes ; les signes négatifs représentent l'effort à financer.</p>
<p class="foot-note">Références consultées le ${today} : <sup>[1]</sup> OCC · Commercial Real Estate Lending, p. 40–44 (repères de méthode en immobilier de rapport, sans transposition des seuils américains au crédit français) ; <sup>[2]</sup> DGFiP · Les régimes d'imposition.</p>
<p class="foot-note">NOI et ratios établis sur le budget saisi, postes non renseignés retenus à 0 €. Les scénarios mesurent l'effet mécanique des aléas, sans leur attribuer de probabilité.</p>`,
      });
    }

    /* ══ ANNEXE B · PROJECTION ANNUELLE DÉTAILLÉE ═════════════════════════════ */
    for (const c of cases) {
      const blocs: number[][] = [];
      for (let st = 1; st <= HORIZON; st += 15) blocs.push(Array.from({ length: Math.min(15, HORIZON - st + 1) }, (_, i) => st + i));
      for (const bloc of blocs) {
        pages.push({
          badge: "B", titre: "Projection annuelle détaillée",
          sous: `Années ${bloc[0]} à ${bloc[bloc.length - 1]}${dual ? ` · ${c.label}` : ""} · ${regimeLabel} · Montants annuels en euros, sauf indication contraire.`,
          corps: `
<table class="tbl dense">
  <tr><th class="c">An</th><th class="r">Loyers</th><th class="r">Charges</th><th class="r">Crédit hors ass.</th><th class="r">Assurance</th><th class="r">Intérêts<sup>1</sup></th><th class="r">Capital remb.<sup>1</sup></th><th class="r">Dette fin an</th>${isMicro
              ? `<th class="r">Base micro</th>`
              : `<th class="r">Amort. déduit</th><th class="r">Base imposable</th>`}<th class="r">Impôt + PS</th><th class="r">Cash avant impôt / an</th><th class="r">Cash après impôt / an</th></tr>
  ${bloc.map(yr => {
              const y = c.at(yr);
              const avant = c.recettes - chargesAnnuelles - y.creditAnnuel - y.assuranceEmprunteur;
              return `<tr><td class="c">${yr}</td><td class="r">${fN(c.recettes)}</td><td class="r">${fN(chargesAnnuelles)}</td><td class="r">${fN(y.creditAnnuel)}</td><td class="r">${fN(y.assuranceEmprunteur)}</td><td class="r">${fN(y.interets)}</td><td class="r">${fN(y.capitalRembourse)}</td><td class="r">${fN(y.capitalFin)}</td>${isMicro
                ? `<td class="r">${fN(y.baseImposable)}</td>`
                : `<td class="r">${fN(y.amortImpute)}</td><td class="r">${fN(y.baseImposable)}</td>`}<td class="r">${fN(y.impot)}</td><td class="r" style="color:${col(avant)}">${fN(avant)}</td><td class="r" style="color:${col(y.cashflowAnnuel)};font-weight:700">${fN(y.cashflowAnnuel)}</td></tr>`;
            }).join("")}
</table>
<p class="foot-note"><sup>1</sup> Intérêts + capital remboursé = crédit hors assurance : ces colonnes détaillent l'échéance et ne s'y ajoutent pas. ${isMicro
              ? `Impôt micro-BIC = recettes × ${abattLabel} × ${fP(tauxGlobal * 100, 1)}.`
              : `Impôt = base imposable × ${fP(tauxGlobal * 100, 1)} ; l'amortissement non imputé est reporté sans limitation de durée.`}</p>
<p class="foot-note">Cash après impôt : ${fE2(c.cashMois1)}/mois en année 1${montantCredit > 0 ? `, puis ${fE2(c.apresPret)}/mois après le terme du prêt` : ""}. Hypothèses constantes, sans nouveaux travaux ni remplacement de mobilier. Montants arrondis après calcul.</p>`,
        });
      }
    }

    /* ── Assemblage ─────────────────────────────────────────────────────────── */
    const nb = pages.length;
    const body = pages.map((p, i) => `
<div class="page">
  <div class="hdr">
    <div><div class="hdr-t">TOUTLMNP · DOSSIER BANCAIRE</div><div class="hdr-s">${bienLigne}</div></div>
    <div><div class="hdr-d">Données du ${today}</div><div class="hdr-d">Régime choisi : ${regimeLabel}</div></div>
  </div>
  <div class="ptitle"><div class="ptitle-n">${p.badge}</div><div class="ptitle-l">${p.titre}</div></div>
  <div class="psub">${p.sous}</div>
  ${p.corps}
  <div class="ftr"><span>toutlmnp.fr · Étude indicative</span><span>${i + 1} / ${nb}</span><span>${today}</span></div>
</div>`).join("");

    const css = `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#C7C2B8;font-family:'Helvetica Neue',Arial,sans-serif;color:#17293F;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;background:#FBF7F0;margin:14px auto;padding:11mm 13mm 16mm;position:relative;page-break-after:always;box-shadow:0 3px 24px rgba(0,0,0,0.22)}
.page:last-child{page-break-after:avoid}
.no-print{position:sticky;top:0;z-index:100;background:#1B2E4A;padding:10px 20px;display:flex;align-items:center;justify-content:space-between}
.no-print button{background:#F5F0E8;color:#1B2E4A;border:none;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer}
.no-print span{color:#F5F0E8;font-size:13px}

.hdr{background:#1B2E4A;border-radius:8px;padding:9px 16px;display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:11px}
.hdr-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.11em;color:#F5F0E8}
.hdr-s{font-size:12px;color:rgba(245,240,232,0.62);margin-top:2px}
.hdr-d{font-size:12px;color:rgba(245,240,232,0.72);text-align:right;line-height:1.5}

.ptitle{display:flex;align-items:center;gap:14px;margin-bottom:5px}
.ptitle-n{min-width:34px;height:32px;padding:0 9px;border-radius:7px;background:#1B2E4A;color:#F5F0E8;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ptitle-l{font-size:25px;font-weight:800;color:#17293F;letter-spacing:-.02em;line-height:1.1}
.psub{font-size:12px;color:rgba(23,41,63,0.5);margin-bottom:11px}

.sec{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#1B3A5C;text-align:center;margin:7px 0 7px}
.sec.tight{margin-top:13px}

.duo{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
.box{border-radius:8px;padding:9px 13px 10px}
.box.be{background:#EDE8DE}
.box.bl{background:#E4EBF2}
.box-h{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#17293F;margin-bottom:5px}
.ir{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:3px 0;border-bottom:.5px solid rgba(23,41,63,0.08)}
.ir:last-child{border-bottom:none}
.ir-l{font-size:12px;color:rgba(23,41,63,0.6)}
.ir-v{font-size:12px;font-weight:700;color:#17293F;text-align:right;white-space:nowrap}

.para{font-size:12px;line-height:1.55;color:rgba(23,41,63,0.8);margin-top:9px}
.foot-note{font-size:12px;line-height:1.5;color:rgba(23,41,63,0.48);margin-top:6px}

.kpis{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;margin-top:4px}
.kpi{border-radius:8px;padding:9px 14px;background:#EDE8DE}
.kpi.gr{background:#E3EDE5}
.kpi.rd{background:#F4E6E2}
.kpi-l{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:rgba(23,41,63,0.5);margin-bottom:6px}
.kpi-v{font-size:21px;font-weight:800;letter-spacing:-.025em;color:#17293F;line-height:1.05}
.kpi.gr .kpi-v{color:#1A6644}
.kpi.rd .kpi-v{color:#B03A2A}
.kpi-s{font-size:12px;color:rgba(23,41,63,0.45);margin-top:6px}

table.tbl{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}
table.tbl th{background:#1B2E4A;color:#F5F0E8;padding:5px 8px;text-align:left;font-weight:700;font-size:12px;line-height:1.3}
table.tbl th.r{text-align:right}
table.tbl th.c{text-align:center}
table.tbl th.sub{background:#33506F;font-weight:600}
table.tbl td{padding:4.5px 8px;border-bottom:.5px solid rgba(23,41,63,0.09);font-size:12px}
table.tbl tr:nth-child(even) td{background:rgba(23,41,63,0.03)}
table.tbl .r{text-align:right}
table.tbl .c{text-align:center}
table.tbl tr.tot td{font-weight:800;background:#E3EDE5}
table.tbl tr.fisc td{color:#B03A2A}
table.tbl tr.drop td{color:rgba(23,41,63,0.42)}
table.tbl em.tag{font-style:normal;font-size:12px;font-weight:700;color:#1A6644;margin-left:5px}
table.tbl em.tag.off{color:rgba(23,41,63,0.4)}
table.tbl.compact td,table.tbl.compact th{padding:4px 7px}
table.tbl.dense{font-size:10.5px}
table.tbl.dense th{font-size:10px;padding:4px 4px;line-height:1.25}
table.tbl.dense td{font-size:10.5px;padding:3px 4px;white-space:nowrap}

.ind{display:grid;grid-template-columns:172px 1fr;gap:16px;align-items:center;background:#E4EBF2;border-radius:8px;padding:9px 15px;margin-bottom:8px}
.ind-v{font-size:21px;font-weight:800;letter-spacing:-.025em;color:#17293F;text-align:center;line-height:1.15}
.ind-v.gr{color:#1A6644}
.ind-v.rd{color:#B03A2A}
.ind-t{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#1B3A5C;margin-bottom:3px}
.ind-x{font-size:12px;line-height:1.5;color:rgba(23,41,63,0.75)}
.b2{display:block;font-size:16px;font-weight:800;line-height:1.35}
.b2 em{display:inline-block;min-width:66px;font-style:normal;font-size:12px;font-weight:600;color:rgba(23,41,63,0.5);text-transform:capitalize}
.pc{display:inline-block;margin-right:12px}
.pc em{font-style:normal;color:rgba(23,41,63,0.5)}

.estbar{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#F5F0E8;background:#1B2E4A;border-radius:6px;padding:5px 12px;margin:10px 0 6px}
.calc{background:#E4EBF2;border-radius:8px;padding:10px 15px}
.calc p{font-size:12px;line-height:1.7;color:rgba(23,41,63,0.82)}
.calc p.calc-t{color:#1B3A5C;font-weight:700;margin-bottom:6px}
.calc p.calc-t:last-child{margin-bottom:0}

.graph{background:#EDE8DE;border-radius:8px;padding:10px 12px 6px;margin-top:4px}

.info{border-radius:8px;padding:11px 16px;display:flex;align-items:center;gap:16px;margin-top:12px;background:#1B2E4A}
.info-b{flex:0 0 auto;border-radius:20px;padding:7px 17px;font-size:12px;font-weight:800;letter-spacing:.09em;color:#F5F0E8;background:#33506F;white-space:nowrap}
.info-c{flex:1;min-width:0}
.info-t{font-size:13px;font-weight:700;color:#F5F0E8;margin-bottom:4px}
.info-x{font-size:12px;color:rgba(245,240,232,0.85);line-height:1.55}
.info-x strong{color:#FFFFFF}

.ftr{position:absolute;bottom:10mm;left:13mm;right:13mm;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(23,41,63,0.4);border-top:.5px solid rgba(23,41,63,0.12);padding-top:6px}

@media print{
  html,body{background:#FBF7F0;padding:0;margin:0}
  .no-print{display:none}
  .page{margin:0;box-shadow:none;min-height:297mm;background:#FBF7F0}
  .page:last-child{page-break-after:avoid}
}
`;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>ToutLMNP · Dossier bancaire — ${bienLigne}</title><style>${css}</style></head>
<body>
<div class="no-print"><span>Dossier bancaire · ${nb} pages · Utilisez « Enregistrer au format PDF »</span><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
${body}
</body></html>`;
  };

  // ─── VOTRE SIMULATION : ONE PAGE (rapport gratuit) ──────────────────────────
  const buildOnePagePdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const amortDureeMobilier = amortDureeMobilierRef.current;
    const amortDureeTravaux = amortDureeTravauxRef.current;
    const amortDureeNotaire = amortDureeNotaireRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
    const selectedRegime = selectedRegimeRef.current;
    const isMicro = selectedRegime === "micro";
    const regimeLabel = isMicro ? "Micro-BIC" : "Régime réel simplifié";

    const fE = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
    const fE2 = (v: number) => Math.abs(v - Math.round(v)) < 0.005
      ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)
      : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
    const fN = (v: number) => Math.round(v).toLocaleString("fr-FR");
    const fP = (v: number, d = 2) => v.toFixed(d).replace(".", ",") + " %";
    const sE = (v: number) => (v >= 0 ? "+" : "−") + fE(Math.abs(v));

    /* ── Couleurs ─────────────────────────────────────────────────────────── */
    const OR = "#C95B2A", BR = "#4A1E10", VE = "#1A6644", RG = "#B03A2A", SA = "#9A7B52";

    const prix = parseFloat(f.prix) || 0;
    const travaux = parseFloat(f.travaux) || 0;
    const notaire = parseFloat(f.notaire) || 0;
    const mobilier = parseFloat(f.mobilier) || 0;
    const apport = parseFloat(f.apport) || 0;
    const taux = parseFloat(f.taux) / 100 || 0;
    const duree = f.duree;
    const tmi = f.tmi;

    const investTotal = res.investTotal;
    const montantCredit = res.montantCredit;
    const mensualite = res.mensualite;
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceAn = res.assuranceEmprunteurAnnuel ?? 0;
    const chargesLocatairesAnnuel = (parseFloat(f.chargesLoyer) || 0) * 12;

    const amortBienMaxDuree = amortMode === "ensemble"
      ? amortDureeEnsemble
      : (composants.length ? Math.max(...composants.map(c => c.duree)) : 0);
    const HORIZON = Math.max(duree, amortBienMaxDuree, amortDureeMobilier, amortDureeTravaux, amortDureeNotaire, 20) + 5;

    const projBase = {
      prix, travaux, mobilier, notaire,
      montantCredit, duree, taux,
      chargesLocatairesAnnuel, chargesAnnuelles,
      assuranceEmprunteurAnnuel: assuranceAn,
      tmi, amortPct, amortMode, amortDureeEnsemble, composants,
      amortDureeMobilier, amortDureeTravaux, amortDureeNotaire,
      isMicro, isSaisonnier, horizon: HORIZON,
    };

    /* Tout ce qui découle d'un niveau de loyers — sert aussi aux 3 estimations */
    const faireCas = (loyerAn: number) => {
      const proj = computeProjection({ ...projBase, loyerAnnuel: loyerAn });
      const y1 = proj[0];
      const recettes = loyerAn + chargesLocatairesAnnuel;
      const noi = recettes - chargesAnnuelles;
      return {
        loyerAn, loyerMois: loyerAn / 12, recettes, noi, proj, y1,
        rendBrut: investTotal > 0 ? loyerAn / investTotal * 100 : 0,
        rendNet: investTotal > 0 ? noi / investTotal * 100 : 0,
        impotMois: y1.impot / 12,
        cashMois: y1.cashflowMensuel,
        cashAn: y1.cashflowAnnuel,
        cumul: proj.slice(0, duree).reduce((s, y) => s + y.cashflowAnnuel, 0),
        apres: proj[duree]?.cashflowMensuel ?? proj[proj.length - 1].cashflowMensuel,
      };
    };

    /* Saisonnier : les trois hypothèses d'occupation */
    const triple = resultatsTripleRef.current;
    const prixNuitee = parseFloat(prixNuiteeRef.current) || 0;
    const occ = { bas: parseFloat(tauxOccBasRef.current) || 0, moyen: parseFloat(tauxOccMoyenRef.current) || 0, haut: parseFloat(tauxOccHautRef.current) || 0 };
    const saison = isSaisonnier && !!triple;
    const estimations = saison ? ([
      { lbl: "Estimation basse", t: occ.bas, cas: faireCas(triple?.bas?.loyerAnnuel ?? 0), ton: "#2A5C8A" },
      { lbl: "Estimation moyenne", t: occ.moyen, cas: faireCas(triple?.moyen?.loyerAnnuel ?? 0), ton: OR },
      { lbl: "Estimation haute", t: occ.haut, cas: faireCas(triple?.haut?.loyerAnnuel ?? 0), ton: VE },
    ]) : [];

    // Le corps du document retient l'estimation moyenne en saisonnier
    const C = saison ? estimations[1].cas : faireCas(res.loyerAnnuel);

    const interetsTotaux = C.proj.slice(0, duree).reduce((s, y) => s + y.interets, 0);
    const assuranceTotale = assuranceAn * duree;
    const coutEmprunt = interetsTotaux + assuranceTotale;
    const echeance = mensualite + assuranceAn / 12;
    const chargesMois = chargesAnnuelles / 12;
    const detteFin = C.proj[duree - 1]?.capitalFin ?? 0;

    /* ── Répartition mensuelle du loyer ───────────────────────────────────── */
    const recettesMois = C.recettes / 12;
    const creditMois = (C.y1.creditAnnuel + C.y1.assuranceEmprunteur) / 12;
    const sorties = chargesMois + creditMois + C.impotMois;
    const cashPositif = C.cashMois >= 0;
    const totalBarre = cashPositif ? recettesMois : sorties;
    const pc = (v: number) => totalBarre > 0 ? Math.max(0, v / totalBarre * 100) : 0;
    const segments = [
      { l: "Charges", v: chargesMois, c: SA },
      { l: "Crédit +<br>assurance", v: creditMois, c: BR },
      { l: "Impôt +<br>prél. sociaux", v: C.impotMois, c: OR },
      ...(cashPositif ? [{ l: "Cash conservé", v: C.cashMois, c: VE }] : []),
    ].filter(s => s.v > 0.5 || s.l === "Cash conservé");

    /* ── Graphe du cash-flow mensuel ──────────────────────────────────────── */
    const makeChart = (): string => {
      const lastY = Math.min(duree + 5, HORIZON);
      const pts = C.proj.filter(y => y.year <= lastY);
      const W = 700, H = 104, PL = 52, PR = 30, PT = 20, PB = 19;
      const iW = W - PL - PR, iH = H - PT - PB;
      const vals = pts.map(p => p.cashflowMensuel);
      const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
      const amp = hi - lo, marge = Math.max(amp * 0.18, 20);
      const niceScale = (a: number, b: number, n: number) => {
        if (b - a < 1) b = a + 1;
        const raw = (b - a) / n;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const mult = [1, 2, 2.5, 5, 10].find(m => m * mag >= raw) ?? 10;
        const st = mult * mag;
        return { min: Math.floor(a / st) * st, max: Math.ceil(b / st) * st };
      };
      const brut = niceScale(lo - marge, hi + marge, 3);
      // on ne descend pas sous zéro si la trésorerie ne le fait jamais
      const sc = { min: lo >= 0 ? 0 : brut.min, max: brut.max };
      const yR = (sc.max - sc.min) || 1;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(lastY - 1, 1)) * iW;
      const toY = (v: number) => PT + (1 - (v - sc.min) / yR) * iH;
      const grid = Array.from({ length: 3 }, (_, i) => {
        const t = i / 2, v = sc.min + t * yR, y = PT + (1 - t) * iH;
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${PL + iW}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.10)" stroke-width="1"/><text x="${PL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="rgba(26,22,18,0.45)">${fN(v)}</text>`;
      }).join("");
      const path = `<path d="${pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year).toFixed(1)},${toY(p.cashflowMensuel).toFixed(1)}`).join(" ")}" fill="none" stroke="${VE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
      const reperes = Array.from(new Set([1, 5, 10, 15, 20, 25, 30, 35, 40, lastY].filter(y => y >= 1 && y <= lastY))).sort((a, b) => a - b)
        .filter((y, i, arr) => i === 0 || y === lastY || y - arr[i - 1] >= Math.max(2, lastY / 8));
      const pieces = reperes.map(yr => {
        const v = C.proj[yr - 1].cashflowMensuel;
        const anchor: "start" | "middle" | "end" = yr === 1 ? "start" : yr === lastY ? "end" : "middle";
        // étiquettes au-dessus du point, sauf si l'on touche le haut du cadre
        const dy = toY(v) - PT < 16 ? 17 : -10;
        return `<circle cx="${toX(yr).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="3" fill="${VE}"/><text x="${toX(yr).toFixed(1)}" y="${(toY(v) + dy).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" font-weight="800" fill="#145136">${fE(v)}</text>`;
      }).join("");
      const xL = reperes.map(yr => `<text x="${toX(yr).toFixed(1)}" y="${PT + iH + 16}" text-anchor="middle" font-size="12" fill="rgba(26,22,18,0.45)">${yr}</text>`).join("");
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
  <text x="0" y="${PT - 9}" font-size="12" fill="rgba(26,22,18,0.5)">€/mois après impôt</text>
  <text x="${W}" y="${PT - 9}" text-anchor="end" font-size="12" fill="rgba(26,22,18,0.5)">Années</text>
  ${grid}${path}${pieces}${xL}
</svg>`;
    };

    /* ── Identité ─────────────────────────────────────────────────────────── */
    const today = new Date().toLocaleDateString("fr-FR");
    const typeLabel = bienInfo.type === "ma" ? "Maison" : bienInfo.type === "im" ? "Immeuble" : "Appartement";
    const bienLigne = [
      typeLabel,
      bienInfo.pieces ? `T${bienInfo.pieces}` : "",
      bienInfo.surface ? `${bienInfo.surface} m²` : "",
      bienInfo.ville || "",
    ].filter(Boolean).join(" · ");

    const entete = `<div class="hdr">
  <div><div class="hdr-t">ToutLMNP · Votre synthèse</div><div class="hdr-s">${bienLigne}</div></div>
  <div><div class="hdr-d">${regimeLabel}</div><div class="hdr-d2">Données du ${today}</div></div>
</div>`;
    const pied = `<div class="ftr"><span>toutlmnp.fr · Simulation indicative</span><span class="ftr-c">Explorez vos rapports détaillés sur ToutLMNP →</span></div>`;
    const titre = (n: string, t: string, s?: string) =>
      `<div class="sc"><div class="sc-n">${n}</div><div class="sc-t">${t}</div></div>${s ? `<div class="sc-s">${s}</div>` : ""}`;

    /* ── Page saisonnière : les trois estimations ─────────────────────────── */
    const pageSaison = saison ? `
<div class="page">
  ${entete}
  ${titre("1", "Vos trois estimations", `Location saisonnière à ${fE(prixNuitee)} la nuitée · ${regimeLabel} · ce que produit chaque hypothèse d'occupation.`)}

  <div class="est3">
    ${estimations.map((e, i) => `<div class="est${i === 1 ? " on" : ""}">
      <div class="est-h" style="background:${e.ton}">
        <div class="est-l">${e.lbl}${i === 1 ? " · retenue" : ""}</div>
        <div class="est-o">${fP(e.t, 0)} d'occupation · ${Math.round(365 * e.t / 100)} nuits</div>
      </div>
      <div class="est-b">
        <div class="est-big" style="color:${e.ton}">${fE(e.cas.loyerAn)}<span>/an</span></div>
        <div class="est-sub">${fE(e.cas.loyerMois)} de recettes par mois</div>
        <div class="er"><span>Charges du bien</span><b>−${fE(chargesAnnuelles)}</b></div>
        <div class="er"><span>Crédit + assurance</span><b>−${fE(e.cas.y1.creditAnnuel + e.cas.y1.assuranceEmprunteur)}</b></div>
        <div class="er"><span>Impôt + prél. sociaux</span><b>−${fE(e.cas.y1.impot)}</b></div>
        <div class="er tot"><span>Cash-flow / mois</span><b style="color:${e.cas.cashMois >= 0 ? VE : RG}">${sE(e.cas.cashMois)}</b></div>
        <div class="er sub"><span>Soit sur l'année</span><b style="color:${e.cas.cashAn >= 0 ? VE : RG}">${sE(e.cas.cashAn)}</b></div>
        <div class="est-r">
          <div><div class="est-rl">Rendement brut</div><div class="est-rv">${fP(e.cas.rendBrut)}</div></div>
          <div><div class="est-rl">Rendement net des charges</div><div class="est-rv" style="color:${OR}">${fP(e.cas.rendNet)}</div></div>
        </div>
      </div>
    </div>`).join("")}
  </div>

  <div class="band">
    <div class="band-t">L'estimation moyenne sert de base à la suite du document</div>
    <div class="band-x">Les pages suivantes sont calculées sur <strong>${fP(occ.moyen, 0)} d'occupation</strong>, soit ${Math.round(365 * occ.moyen / 100)} nuits et ${fE(estimations[1].cas.loyerAn)} de recettes annuelles. L'écart de recettes entre l'hypothèse basse et l'hypothèse haute est de <strong>${fE(estimations[2].cas.loyerAn - estimations[0].cas.loyerAn)}</strong> par an ; les charges et l'échéance de crédit, elles, ne bougent pas.</div>
  </div>

  <div class="info">
    <div class="info-b">Info clef</div>
    <div>
      <div class="info-t">${estimations[0].cas.cashMois >= 0
        ? "Le projet tient même dans l'hypothèse la plus prudente"
        : `L'équilibre est atteint à partir de ${Math.ceil((chargesAnnuelles + C.y1.creditAnnuel + C.y1.assuranceEmprunteur + C.y1.impot) / Math.max(prixNuitee, 1))} nuits par an`}</div>
      <div class="info-x">${estimations[0].cas.cashMois >= 0
        ? `À ${fP(occ.bas, 0)} d'occupation seulement, le cash-flow reste de <strong>${sE(estimations[0].cas.cashMois)}/mois</strong>. Chaque nuit louée au-delà de ${Math.round(365 * occ.bas / 100)} vient s'ajouter à cette marge : l'hypothèse moyenne porte le cash à ${sE(estimations[1].cas.cashMois)}/mois, la haute à ${sE(estimations[2].cas.cashMois)}/mois.`
        : `À ${fP(occ.bas, 0)} d'occupation, le projet demande ${fE(Math.abs(estimations[0].cas.cashMois))}/mois d'effort ; à ${fP(occ.moyen, 0)} il ${estimations[1].cas.cashMois >= 0 ? `dégage ${sE(estimations[1].cas.cashMois)}/mois` : `en demande encore ${fE(Math.abs(estimations[1].cas.cashMois))}`} et à ${fP(occ.haut, 0)} ${estimations[2].cas.cashMois >= 0 ? `${sE(estimations[2].cas.cashMois)}/mois` : `${fE(Math.abs(estimations[2].cas.cashMois))}/mois d'effort`}. Le niveau d'occupation est donc le paramètre déterminant du dossier.`}</div>
    </div>
  </div>
  ${pied}
</div>` : "";

    const n1 = saison ? "2" : "1", n2 = saison ? "3" : "2", n3 = saison ? "4" : "3";

    /* ── CSS ──────────────────────────────────────────────────────────────── */
    const css = `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#D0C9BC;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;background:#F7F2E9;margin:14px auto;padding:10mm 12mm 13mm;position:relative;page-break-after:always;box-shadow:0 3px 24px rgba(0,0,0,0.22)}
.page:last-child{page-break-after:avoid}
.no-print{position:sticky;top:0;z-index:100;background:${VE};padding:10px 20px;display:flex;align-items:center;justify-content:space-between}
.no-print button{background:${OR};color:#fff;border:none;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer}
.no-print span{color:#F5F0E8;font-size:13px}

.hdr{background:${BR};border-radius:7px;padding:8px 16px;display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.hdr-t{font-size:13px;font-weight:700;color:#F5F0E8}
.hdr-s{font-size:12px;color:rgba(245,240,232,0.6);margin-top:2px}
.hdr-d{font-size:13px;color:#F5F0E8;text-align:right}
.hdr-d2{font-size:12px;color:rgba(245,240,232,0.6);text-align:right;margin-top:2px}

.sc{display:flex;align-items:center;gap:11px;margin-top:7px}
.sc-n{width:27px;height:27px;border-radius:6px;background:${OR};color:#F5F0E8;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sc-t{font-size:21px;font-weight:800;color:${OR};letter-spacing:-.02em;line-height:1.1}
.sc-s{font-size:12px;color:rgba(26,22,18,0.5);margin:2px 0 6px 0}

.k4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:9px}
.k{background:#F1ECE2;border-radius:7px;padding:8px 13px 9px}
.k-l{font-size:12px;color:rgba(26,22,18,0.55);margin-bottom:4px}
.k-v{font-size:18px;font-weight:800;letter-spacing:-.025em;line-height:1.1}
.k-s{font-size:12px;color:rgba(26,22,18,0.5);margin-top:3px;line-height:1.38}
.k-s b{font-weight:700;color:#1A1612}

.loyer{background:#F8E9DB;border-radius:7px;padding:9px 14px 10px;margin-top:8px}
.loyer-top{display:flex;align-items:center;gap:14px}
.loyer-l{flex:0 0 auto;min-width:132px}
.loyer-lb{font-size:12px;color:rgba(26,22,18,0.55)}
.loyer-v{font-size:19px;font-weight:800;letter-spacing:-.025em}
.loyer-v span{font-size:12px;font-weight:500;color:rgba(26,22,18,0.5);margin-left:3px}
.bar{flex:1;display:flex;height:17px;border-radius:3px;overflow:hidden}
.leg{display:flex;gap:0;margin-top:6px;padding-left:146px}
.leg-i{flex:1 1 0;min-width:0;padding-left:9px;border-left:2.5px solid}
.leg-l{font-size:12px;color:rgba(26,22,18,0.55);line-height:1.3;min-height:28px}
.leg-v{font-size:16px;font-weight:800;letter-spacing:-.02em;margin-top:2px}

.rend{display:grid;grid-template-columns:1fr 1.3fr;gap:0;background:#F1ECE2;border-radius:7px;margin-top:8px;overflow:hidden}
.rend-l{padding:9px 16px 10px}
.rend-r{padding:9px 16px 10px;border-left:1px solid rgba(26,22,18,0.12)}
.rend-t{font-size:12px;font-weight:700;color:#1A1612;margin-bottom:3px}
.rend-big{font-size:22px;font-weight:800;color:${OR};letter-spacing:-.03em;line-height:1.05}
.rend-s{font-size:12px;color:rgba(26,22,18,0.5);margin-top:5px}
.rend-s2{font-size:16px;font-weight:800;letter-spacing:-.02em}
.rend-v{font-size:19px;font-weight:800;letter-spacing:-.02em;margin-top:2px}
.rend-x{font-size:12px;color:rgba(26,22,18,0.55);margin-top:5px;line-height:1.45}

.cf{background:${VE};border-radius:7px;padding:9px 18px 10px;margin-top:1px;display:flex;align-items:flex-end;gap:18px}
.cf-l{flex:1;min-width:0}
.cf-t{font-size:12.5px;font-weight:700;color:rgba(245,240,232,0.85);margin-bottom:5px}
.cf-v{font-size:24px;font-weight:800;color:#F5F0E8;letter-spacing:-.03em;line-height:1}
.cf-s{font-size:12px;color:rgba(245,240,232,0.72);margin-top:5px}
.cf-r{flex:0 0 auto;text-align:right}
.cf-rv{font-size:21px;font-weight:800;color:#F5F0E8;letter-spacing:-.025em}
.cf-rs{font-size:12px;color:rgba(245,240,232,0.72);margin-top:3px;line-height:1.4}

.chart{margin-top:7px}

.fin2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:2px}
.fin{border-radius:7px;padding:9px 14px 10px}
.fin.gr{background:#E7EFE7}
.fin.be{background:#F1ECE2}
.fin-l{font-size:12px;color:rgba(26,22,18,0.55)}
.fin-v{font-size:21px;font-weight:800;letter-spacing:-.025em;margin-top:2px}
.fin-x{font-size:12px;color:rgba(26,22,18,0.55);margin-top:4px;line-height:1.45}
.fin-x b{color:#1A1612;font-weight:700}

.info{background:${BR};border-radius:7px;padding:9px 16px;margin-top:8px;display:flex;align-items:center;gap:16px}
.info-b{flex:0 0 auto;background:#8A6A4A;color:#F5F0E8;border-radius:5px;padding:7px 15px;font-size:12.5px;font-weight:700;white-space:nowrap}
.info-t{font-size:13px;font-weight:700;color:#F5F0E8;margin-bottom:3px}
.info-x{font-size:12px;color:rgba(245,240,232,0.82);line-height:1.5}
.info-x strong{color:#fff}

.hyp{font-size:12px;color:rgba(26,22,18,0.45);line-height:1.4;margin-top:6px}

.ftr{position:absolute;bottom:8mm;left:12mm;right:12mm;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(26,22,18,0.42);border-top:.5px solid rgba(26,22,18,0.12);padding-top:7px}
.ftr-c{color:${OR};font-weight:700}

/* Page saisonnière */
.est3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.est{background:#F1ECE2;border-radius:8px;overflow:hidden}
.est.on{box-shadow:0 0 0 2px ${OR}}
.est-h{padding:8px 12px}
.est-l{font-size:12.5px;font-weight:800;color:#F5F0E8}
.est-o{font-size:12px;color:rgba(245,240,232,0.78);margin-top:1px}
.est-b{padding:9px 12px 11px}
.est-big{font-size:21px;font-weight:800;letter-spacing:-.025em;line-height:1.1}
.est-big span{font-size:12px;font-weight:500;color:rgba(26,22,18,0.45);margin-left:2px}
.est-sub{font-size:12px;color:rgba(26,22,18,0.5);margin:1px 0 7px}
.er{display:flex;justify-content:space-between;gap:6px;font-size:12px;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)}
.er span{color:rgba(26,22,18,0.58)}
.er b{font-weight:700;white-space:nowrap}
.er.tot{border-bottom:none;border-top:1px solid rgba(26,22,18,0.18);margin-top:4px;padding-top:6px}
.er.tot span{font-weight:700;color:#1A1612}
.er.tot b{font-size:14px}
.er.sub{border-bottom:none;padding-top:0}
.er.sub span{color:rgba(26,22,18,0.42)}
.est-r{display:flex;gap:12px;margin-top:9px;padding-top:8px;border-top:1px solid rgba(26,22,18,0.12)}
.est-r>div{flex:1;min-width:0}
.est-rl{font-size:12px;color:rgba(26,22,18,0.5);line-height:1.3}
.est-rv{font-size:15px;font-weight:800;letter-spacing:-.02em;margin-top:2px}
.band{background:#F8E9DB;border-radius:7px;padding:11px 16px;margin-top:11px}
.band-t{font-size:13px;font-weight:800;color:${OR};margin-bottom:4px}
.band-x{font-size:12px;color:rgba(26,22,18,0.72);line-height:1.6}

@media print{html,body{background:#F7F2E9;margin:0}.no-print{display:none}.page{margin:0;box-shadow:none}}
`;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>ToutLMNP · Votre synthèse — ${bienLigne}</title><style>${css}</style></head>
<body>
<div class="no-print"><span>Votre synthèse · one page · Utilisez « Enregistrer au format PDF »</span><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
${pageSaison}
<div class="page">
  ${entete}

  ${titre(n1, "Rendement", "Le projet, le cash disponible et son évolution pendant le crédit.")}

  <div class="k4">
    <div class="k"><div class="k-l">Budget total</div><div class="k-v" style="color:${OR}">${fE(investTotal)}</div></div>
    <div class="k"><div class="k-l">Apport</div><div class="k-v">${fE(apport)}</div>${apport > 0 && investTotal > 0 ? `<div class="k-s">${fP(apport / investTotal * 100, 0)} du budget</div>` : ""}</div>
    <div class="k"><div class="k-l">Crédit</div><div class="k-v">${fE(montantCredit)}</div>${montantCredit > 0 ? `<div class="k-s">${duree} ans · ${fP(taux * 100)}<br><b>${fE2(echeance)}/mois</b><br>assurance incluse</div>` : ""}</div>
    <div class="k"><div class="k-l">Coût de l'emprunt</div><div class="k-v">${fE(coutEmprunt)}</div>${montantCredit > 0 ? `<div class="k-s">Intérêts + assurance<br>sur ${duree} ans</div>` : ""}</div>
  </div>

  <div class="loyer">
    <div class="loyer-top">
      <div class="loyer-l">
        <div class="loyer-lb">${saison ? "Recettes" : "Loyer HC"}</div>
        <div class="loyer-v">${fE(recettesMois)}<span>/mois</span></div>
      </div>
      <div class="bar">
        ${segments.map(s => `<div style="width:${pc(Math.abs(s.v)).toFixed(2)}%;background:${s.c}"></div>`).join("")}
      </div>
    </div>
    <div class="leg">
      ${segments.map(s => `<div class="leg-i" style="border-color:${s.c}"><div class="leg-l">${s.l}</div><div class="leg-v" style="color:${s.c}">${fE(Math.abs(s.v))}</div></div>`).join("")}
      ${cashPositif ? "" : `<div class="leg-i" style="border-color:${RG}"><div class="leg-l">Effort à<br>financer</div><div class="leg-v" style="color:${RG}">${fE(Math.abs(C.cashMois))}</div></div>`}
    </div>
  </div>

  <div class="rend">
    <div class="rend-l">
      <div class="rend-t">Rendement net des charges</div>
      <div class="rend-big">${fP(C.rendNet)}</div>
      <div class="rend-s">Rendement brut</div>
      <div class="rend-s2">${fP(C.rendBrut)}</div>
    </div>
    <div class="rend-r">
      <div class="rend-t">Revenu net d'exploitation</div>
      <div class="rend-v">${fE(C.noi)}<span style="font-size:12px;font-weight:500;color:rgba(26,22,18,0.5)">/an</span></div>
      <div class="rend-x">${fE(C.recettes)} de ${saison ? "recettes" : "loyers"} − ${fE(chargesAnnuelles)} de charges du bien.<br>Avant crédit et impôt.</div>
    </div>
  </div>

  ${titre(n2, "Cash-flow")}

  <div class="cf">
    <div class="cf-l">
      <div class="cf-t">Votre excédent après impôt · Année 1</div>
      <div class="cf-v">${sE(C.cashMois)}/mois</div>
      <div class="cf-s">${C.cashMois >= 0
        ? `Effort à financer : ${fE(0)}/mois dans le scénario central`
        : `Effort à financer : ${fE(Math.abs(C.cashMois))}/mois dans le scénario central`}</div>
    </div>
    <div class="cf-r">
      <div class="cf-rv">${sE(C.cashAn)}/an</div>
      <div class="cf-rs">Après charges, crédit,<br>assurance et fiscalité.</div>
    </div>
  </div>

  <div class="chart">${makeChart()}</div>

  ${titre(n3, "In fine")}

  <div class="fin2">
    <div class="fin gr">
      <div class="fin-l">Cash-flows cumulés sur ${duree} ans</div>
      <div class="fin-v" style="color:${C.cumul >= 0 ? VE : RG}">${sE(C.cumul)}</div>
      <div class="fin-x">Après charges, crédit, assurance et impôt.<br><b>Aucun produit de revente inclus.</b></div>
    </div>
    <div class="fin be">
      <div class="fin-l">Dette restante à ${duree} ans</div>
      <div class="fin-v">${fE(detteFin)}</div>
      <div class="fin-x">${fE(montantCredit)} de capital remboursés.<br>Ce capital ne s'ajoute pas au cash-flow.</div>
    </div>
  </div>

  <div class="info">
    <div class="info-b">Info clef</div>
    <div>
      <div class="info-t">${C.cumul >= 0 && C.cashMois >= 0
        ? "Un excédent pendant toute la durée du crédit"
        : C.cashMois >= 0 ? "Un excédent qui se resserre en fin de crédit"
          : "Un effort d'épargne pendant le crédit, un excédent ensuite"}</div>
      <div class="info-x">${C.cashMois >= 0
        ? `Le cash reste positif, malgré une marge réduite à ${fE(C.proj[duree - 1].cashflowMensuel)}/mois en année ${duree}.${montantCredit > 0 ? ` Dès l'année ${duree + 1}, après le prêt, il atteint ${fE(C.apres)}/mois.` : ""}`
        : `Le projet demande ${fE(Math.abs(C.cashMois))}/mois d'effort en année 1, soit ${fE(Math.abs(C.cashAn))} sur l'année.${montantCredit > 0 ? ` Dès l'année ${duree + 1}, le prêt soldé, le cash-flow passe à ${sE(C.apres)}/mois ; entre-temps ${fE(montantCredit)} de capital sont remboursés par les loyers.` : ""}`}</div>
    </div>
  </div>

  <div class="hyp">Hypothèses : loyers et charges constants ; postes non saisis = 0 €. Régime retenu : ${regimeLabel}. TMI : ${tmi} % ; PS : 18,6 %. Moyennes arrondies après calcul.<br>Cash cumulé disponible à la fin seulement s'il a été conservé.</div>

  ${pied}
</div>
</body></html>`;
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (status === "loading" || status === "ready") {
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

  // status === "done"
  const getBienInfo = (): BienInfo => ({ type: bienType, ville: bienVille, surface: bienSurface, pieces: bienPieces, description: bienDescription });

  const getWeekStart = (): string => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };
  const getPdfWeekCount = (): number => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem("lmnp_pdf_week_count");
      if (!stored) return 0;
      const { count, weekStart } = JSON.parse(stored);
      return weekStart === getWeekStart() ? (count ?? 0) : 0;
    } catch { return 0; }
  };
  const incrementPdfWeekCount = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lmnp_pdf_week_count", JSON.stringify({ count: getPdfWeekCount() + 1, weekStart: getWeekStart() }));
  };

  // Clic sur l'un des trois rapports détaillés : ouvert aux abonnés,
  // sinon le popup d'abonnement s'affiche à la place.
  const demanderPdf = (choix: "synthese-pdf" | "banque-pdf" | "resume-pdf") => {
    if (!estAbonne) { setPendingPdf(choix); setShowPayPopup(true); return; }
    if (currentPlan === "starter") {
      setPendingPdf(choix);
      setPdfWeekCount(getPdfWeekCount());
      setShowPDFStarter(true);
      return;
    }
    generatePdf(choix);
  };

  const generatePdf = (choix: "synthese-pdf" | "banque-pdf" | "resume-pdf" | "onepage-pdf") => {
    if (!form || !resultats) return;
    const html = choix === "banque-pdf"
      ? buildBanquePdfHtml(form, resultats, getBienInfo())
      : choix === "onepage-pdf"
        ? buildOnePagePdfHtml(form, resultats, getBienInfo())
        : choix === "resume-pdf"
          ? buildResumePdfHtml(form, resultats, getBienInfo())
          : buildPdfHtml(form, resultats, getBienInfo());
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  // ── Les trois rapports détaillés et ce qu'ils contiennent ────────────────
  const saison = isSaisonnierRef.current;
  const reel = selectedRegimeRef.current !== "micro";
  const RAPPORTS: {
    cle: "resume-pdf" | "synthese-pdf" | "banque-pdf";
    nom: string; bg: string; accent: string; points: string[];
  }[] = [
    {
      cle: "resume-pdf", nom: "Synthèse", bg: "#1A4A35", accent: "#2ECC71",
      points: [
        "Vue d'ensemble : budget, financement et cash-flow en un coup d'œil",
        "Le détail de vos charges et de l'impôt de la première année",
        "Les deux régimes comparés sur toute la durée du crédit",
        "Année 1 face à la fin d'emprunt, puis les scénarios de revente",
        saison
          ? "Une page dédiée aux trois estimations d'occupation saisonnière"
          : "Le graphe d'évolution de la trésorerie dans le temps",
      ],
    },
    {
      cle: "synthese-pdf", nom: "Rapport Complet", bg: "#6B2D12", accent: "#C95B2A",
      points: [
        "Huit chapitres : financement, régime, impôt, cash-flow, imprévus, revente",
        "La projection annuelle complète, année par année sur tout l'horizon",
        reel
          ? "Le plan d'amortissement détaillé, composant par composant"
          : "Le calcul du micro-BIC et son effet sur la trésorerie, année par année",
        "La revente à 5, 15 et 30 ans, avec le net vendeur après dette et impôt",
        saison
          ? "Les six estimations saisonnières : bas, moyen et haut dans les deux régimes"
          : "La marge face aux imprévus : vacance locative et hausse de charges",
      ],
    },
    {
      cle: "banque-pdf", nom: "Rapport Banque", bg: "#1A2D45", accent: "#4A9FCA",
      points: [
        "Le plan de financement présenté en emplois et ressources",
        "Les ratios attendus par un financeur : DSCR, debt yield, LTC, dette / prix",
        "Le compte d'exploitation et le passage au cash réellement disponible",
        "La structure de la dette : capital restant dû et coût du financement",
        saison
          ? "Toute l'analyse déclinée sur les estimations basse et moyenne"
          : "La résistance aux imprévus, chiffrée scénario par scénario",
      ],
    },
  ];

  const FIELD = "w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C95B2A]";
  const FSTYLE = { background: "#EDE7DC", border: "1.5px solid transparent", color: "#1A1612" };
  const LBL = "block text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5" as const;

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <Link href="/?reset=1"><Logo variant="light" /></Link>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80 transition-opacity">Guide</Link>
            <Link href="/blog" className="hover:opacity-80 transition-opacity">Articles</Link>
            <Link href="/tarifs" className="hover:opacity-80 transition-opacity">Abonnements</Link>
            <Link href="/contact" className="hover:opacity-80 transition-opacity">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <HeaderAuth dark={true} />
            <a href="/?reset=1#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
              Simuler maintenant
            </a>
          </div>
        </div>
        <MobileHeader simulerHref="/?reset=1#simulateur" />
      </header>

      {/* Single centred column layout */}
      <div className="flex flex-col items-center px-6 pt-10" style={{ maxWidth: 620, margin: "0 auto", width: "100%" }}>

        {/* TOP — form fields (no title) */}
        <div className="w-full space-y-5 mb-12">
          {/* Type */}
          <div>
            <label className={LBL} style={{ color: "#4E1F12" }}>Type de bien</label>
            <div className="flex rounded-xl overflow-hidden" style={{ border: "2px solid #EDE7DC" }}>
              {([["ap", "Appart."], ["ma", "Maison"], ["im", "Immeuble"]] as ["ap"|"ma"|"im", string][]).map(([id, label]) => (
                <button key={id} onClick={() => setBienType(id)}
                  className="flex-1 py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: bienType === id ? "#C95B2A" : "transparent",
                    color: bienType === id ? "#F5F0E8" : "rgba(26,22,18,0.45)",
                    borderRight: id !== "im" ? "2px solid #EDE7DC" : "none",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ville + Surface + Pièces */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={LBL} style={{ color: "#4E1F12" }}>Ville</label>
              <input type="text" value={bienVille}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBienVille(e.target.value)}
                placeholder="Lyon, Paris…" className={FIELD} style={FSTYLE} />
            </div>
            <div style={{ width: 90 }}>
              <label className={LBL} style={{ color: "#4E1F12" }}>Pièces</label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ ...FSTYLE, border: "1.5px solid transparent" }}>
                <span className="pl-3 text-sm font-semibold select-none" style={{ color: "#4E1F12" }}>T</span>
                <input type="number" value={bienPieces} min={1} max={20}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = Math.max(1, Math.min(20, Math.round(Number(e.target.value) || 0)));
                    setBienPieces(v > 0 ? String(v) : "");
                  }}
                  placeholder="2" className="flex-1 pl-1 pr-3 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-0" style={{ color: "#1A1612" }} />
              </div>
            </div>
            <div style={{ width: 100 }}>
              <label className={LBL} style={{ color: "#4E1F12" }}>Surface (m²)</label>
              <input type="number" value={bienSurface}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBienSurface(e.target.value)}
                placeholder="45" className={FIELD} style={FSTYLE} />
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className={LBL} style={{ color: "#4E1F12" }}>Commentaires</label>
            <textarea value={bienDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBienDescription(e.target.value)}
              placeholder="Notes, contexte de l'investissement…"
              rows={3} className={`${FIELD} resize-none`} style={FSTYLE} />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full" style={{ height: "1.5px", background: "rgba(26,22,18,0.1)" }} />
      </div>

      {/* BOTTOM — rapport gratuit puis rapports détaillés, sur une colonne plus large */}
      <div className="flex-1 px-6 pt-10 pb-14" style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <div className="w-full">
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: "#1A7A52", color: "#fff" }}>✓</div>
            <h1 className="font-bold text-center" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: "#4E1F12", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Votre rapport est prêt
            </h1>
          </div>

          {/* ── Rapport gratuit, bouton principal et centré ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hidden md:block" />
            <button onClick={() => generatePdf("onepage-pdf")}
              className="rounded-xl flex items-center gap-3 text-left transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "#1A7A52", padding: "16px 20px", border: "none", cursor: "pointer", minHeight: 72, boxShadow: "0 6px 18px rgba(26,122,82,0.28)" }}>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#F5F0E8", color: "#1A7A52" }}>GRATUIT</span>
              <span className="text-sm font-bold leading-snug flex-1" style={{ color: "#F5F0E8" }}>
                Votre simulation :<br />one page
              </span>
              <span style={{ color: "#F5F0E8", fontSize: 18, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>→</span>
            </button>
            <div className="hidden md:block" />
          </div>
          <p className="text-center text-[12px] mt-2.5" style={{ color: "rgba(26,22,18,0.45)" }}>
            Une page, sans inscription : budget, revenus, fiscalité et trésorerie de votre projet.
          </p>

          {/* ── Section premium ── */}
          <div className="rounded-2xl mt-10 overflow-hidden" style={{ background: "#241008", border: "1.5px solid rgba(201,91,42,0.45)", boxShadow: "0 14px 40px rgba(26,22,18,0.22)" }}>

            {/* Bandeau */}
            <div className="px-5 py-4 md:px-7 md:py-5" style={{ background: "linear-gradient(135deg,#3A1608 0%,#4E1F12 55%,#6B2D12 100%)", borderBottom: "1px solid rgba(201,91,42,0.35)" }}>
              <div className="flex flex-wrap items-center justify-center gap-2.5 mb-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full tracking-[0.16em]"
                  style={{ background: "#C95B2A", color: "#F5F0E8" }}>★ PREMIUM</span>
                {!estAbonne && (
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: "rgba(245,240,232,0.12)", color: "rgba(245,240,232,0.8)" }}>Réservé aux abonnés</span>
                )}
              </div>
              <h2 className="text-center font-bold" style={{ fontSize: "clamp(1.25rem,2.2vw,1.6rem)", color: "#F5F0E8", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                Les trois rapports détaillés
              </h2>
              <p className="text-center text-[13px] mt-2 mx-auto" style={{ color: "rgba(245,240,232,0.62)", maxWidth: 480, lineHeight: 1.55 }}>
                Toute votre simulation développée : projection année par année, fiscalité, revente et dossier prêt à présenter à votre banque.
              </p>
            </div>

            {/* Les trois rapports */}
            <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {RAPPORTS.map(r => (
                <div key={r.cle} className="rounded-xl flex flex-col overflow-hidden"
                  style={{ background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.12)" }}>

                  {/* En-tête coloré du rapport */}
                  <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: r.bg }}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: r.accent, color: r.bg }}>PDF</span>
                    <span className="text-[15px] font-bold flex-1" style={{ color: "#F5F0E8", letterSpacing: "-0.01em" }}>{r.nom}</span>
                    {!estAbonne && <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>🔒</span>}
                  </div>

                  {/* Ce que contient le rapport */}
                  <ul className="px-4 py-3.5 space-y-2 flex-1">
                    {r.points.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-[12.5px]" style={{ color: "rgba(245,240,232,0.78)", lineHeight: 1.5 }}>
                        <span style={{ color: r.accent, flexShrink: 0, fontWeight: 800 }}>·</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action */}
                  <button onClick={() => demanderPdf(r.cle)}
                    className="mx-4 mb-4 rounded-lg py-2.5 text-[13px] font-bold transition-all hover:opacity-[0.88] active:scale-[0.99]"
                    style={{ background: estAbonne ? r.accent : "rgba(245,240,232,0.10)", color: estAbonne ? r.bg : "#F5F0E8", border: estAbonne ? "none" : "1px solid rgba(245,240,232,0.22)", cursor: "pointer" }}>
                    {estAbonne ? "Générer le PDF →" : "🔒 Débloquer"}
                  </button>
                </div>
              ))}
            </div>

            {!estAbonne && (
              <div className="px-5 pb-5 md:px-7 md:pb-6 text-center">
                <button onClick={() => { setPendingPdf(null); setShowPayPopup(true); }}
                  className="w-full md:w-auto md:px-10 py-3.5 rounded-xl text-[15px] font-bold transition-opacity hover:opacity-[0.88]"
                  style={{ background: "#C95B2A", color: "#F5F0E8", border: "none", cursor: "pointer" }}>
                  Débloquer les trois rapports
                </button>
                <p className="text-[12px] mt-3" style={{ color: "rgba(245,240,232,0.5)" }}>
                  Déjà abonné ? <Link href="/tarifs" className="underline" style={{ color: "rgba(245,240,232,0.75)" }}>Voir les abonnements</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayPopup && form && (
        <PopupPaiementUnite
          onClose={() => { setShowPayPopup(false); setPendingPdf(null); }}
          simulationData={{
            form,
            amortPct: amortPctRef.current,
            amortMode: amortModeRef.current,
            amortDureeEnsemble: amortDureeEnsembleRef.current,
            amortDureeMobilier: amortDureeMobilierRef.current,
            amortDureeTravaux: amortDureeTravauxRef.current,
            amortDureeNotaire: amortDureeNotaireRef.current,
            composants: composantsRef.current,
            isSaisonnier: isSaisonnierRef.current,
            prixNuitee: prixNuiteeRef.current,
            tauxOccBas: tauxOccBasRef.current,
            tauxOccMoyen: tauxOccMoyenRef.current,
            tauxOccHaut: tauxOccHautRef.current,
            resultatsTriple: resultatsTripleRef.current,
            selectedRegime: selectedRegimeRef.current,
            savedAt: Date.now(),
          }}
        />
      )}
      {showPDFStarter && (
        <PopupPDFStarter
          weekCount={pdfWeekCount}
          onClose={() => { setShowPDFStarter(false); setPendingPdf(null); }}
          onGenerate={() => {
            incrementPdfWeekCount();
            setShowPDFStarter(false);
            if (pendingPdf) generatePdf(pendingPdf);
            setPendingPdf(null);
          }}
          onPayUnit={() => { setShowPDFStarter(false); setShowPayPopup(true); }}
        />
      )}

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import MobileHeader from "@/components/MobileHeader";
import HeaderAuth from "@/components/HeaderAuth";
import {
  computeResultats,
  type SimulationData,
  type SimulationForm,
  type Resultats,
} from "@/lib/computeResultats";
import { defaultBienInfo, type BienInfo } from "@/components/PopupBienInfo";

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


  // ─── PDF BUILDER ────────────────────────────────────────────────────────────
  const buildPdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const amortDureeMobilier = amortDureeMobilierRef.current;
    const amortDureeTravaux = amortDureeTravauxRef.current;
    const amortDureeNotaire = amortDureeNotaireRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
    // abattPct = taux d'abattement (30% saisonnier non classé, 50% classique)
    const abattPct = isSaisonnier ? 0.30 : 0.50;
    const prixNuitee = prixNuiteeRef.current;
    const tauxOccBas = tauxOccBasRef.current;
    const tauxOccMoyen = tauxOccMoyenRef.current;
    const tauxOccHaut = tauxOccHautRef.current;
    const resultatsTriple = resultatsTripleRef.current;
    const selectedRegime = selectedRegimeRef.current;
    const isMicro = selectedRegime === "micro";

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
    const creditAnnuel = res.creditAnnuel;
    const interetsAnnee1 = res.interetsAnnee1;
    const capitalRembourseAn1 = Math.max(0, creditAnnuel - interetsAnnee1);
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;
    const loyerAnnuel = res.loyerAnnuel;
    const amortTotalAn1 = res.amortTotal;
    const chargesDeductibles = res.chargesDeductibles;
    const resultatAvantAmort = res.resultatAvantAmort;
    const baseImposableReel = res.baseImposableReel;
    const impotReel = res.impotReel;
    const cashflowReelMensuel = res.cashflowReelMensuel;
    const baseBIC = res.baseBIC;
    const impotBIC = res.impotBIC;
    const cashflowBICMensuel = res.cashflowBICMensuel;
    const rendementBrut = res.rendementBrut;
    const rendementNet = res.rendementNet;

    const coutTotalInteret = montantCredit > 0 && taux > 0
      ? (mensualite * duree * 12) - montantCredit : 0;
    const cashflowAvantImpot = (loyerAnnuel - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel) / 12;
    const rentaNetteAvFinancement = investTotal > 0 ? ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100 : 0;

    // Year-by-year projection
    const valeurAmortissable = prix * amortPct / 100;
    const r = taux / 12;
    const n = duree * 12;
    const M = montantCredit > 0 && taux > 0
      ? montantCredit * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : (duree > 0 ? montantCredit / n : 0);

    const amortBienMaxDuree = amortMode === "ensemble"
      ? amortDureeEnsemble
      : Math.max(...composants.map((c: { label: string; pct: number; duree: number }) => c.duree));
    const maxAmortDuree = Math.max(amortBienMaxDuree, 20);
    const totalYears = Math.max(duree, maxAmortDuree) + 5;

    interface PdfRow {
      year: number; capitalDebut: number; capitalFin: number; creditAnnuelR: number;
      interetsAnnee: number; capitalRembourse: number; amortTotalA: number;
      amortDisponible: number; reportEntrant: number; reportNplus1: number;
      resultatAvantAmort: number; chargesDeductibles: number;
      baseImposable: number; impot: number; cashflow: number;
    }
    const rows: PdfRow[] = [];
    let capitalRestant = montantCredit;
    let reportN = 0;

    for (let year = 1; year <= totalYears; year++) {
      const capitalDebut = Math.max(0, capitalRestant);
      let interetsAnnee = 0;
      let creditAnnuelR = 0;
      let capitalRembAn = 0;

      if (year <= duree && montantCredit > 0 && taux > 0) {
        for (let m = 0; m < 12; m++) {
          const im = capitalRestant * r;
          interetsAnnee += im;
          capitalRestant -= (M - im);
        }
        capitalRestant = Math.max(0, capitalRestant);
        creditAnnuelR = M * 12;
        capitalRembAn = creditAnnuelR - interetsAnnee;
      } else if (year <= duree && montantCredit > 0) {
        creditAnnuelR = montantCredit / n * 12;
        capitalRembAn = creditAnnuelR;
      }

      let amortBienA = 0;
      if (amortMode === "ensemble") {
        amortBienA = year <= amortDureeEnsemble ? valeurAmortissable / amortDureeEnsemble : 0;
      } else {
        for (const c of composants) {
          amortBienA += year <= c.duree ? (valeurAmortissable * c.pct / 100) / c.duree : 0;
        }
      }
      const amortMobilierA = amortDureeMobilier > 0 && year <= amortDureeMobilier ? mobilier / amortDureeMobilier : 0;
      const amortTravauxA = amortDureeTravaux > 0 && year <= amortDureeTravaux ? travaux / amortDureeTravaux : 0;
      const amortNotaireA = amortDureeNotaire > 0 && year <= amortDureeNotaire ? notaire / amortDureeNotaire : 0;
      const amortTotalA = amortBienA + amortMobilierA + amortTravauxA + amortNotaireA;
      const chargesDed = chargesAnnuelles + interetsAnnee + assuranceEmprunteurAnnuel;
      const resAvAmort = loyerAnnuel - chargesDed;
      const reportEntrant = reportN;
      const amortDisponible = amortTotalA + reportEntrant;
      const baseImposable = Math.max(0, resAvAmort - amortDisponible);
      const newReport = Math.max(0, amortDisponible - Math.max(0, resAvAmort));
      const impot = baseImposable * (tmi / 100 + 0.186);
      const cashflow = (loyerAnnuel - creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - impot) / 12;

      rows.push({
        year, capitalDebut, capitalFin: Math.max(0, capitalRestant),
        creditAnnuelR, interetsAnnee, capitalRembourse: capitalRembAn,
        amortTotalA, amortDisponible, reportEntrant, reportNplus1: newReport,
        resultatAvantAmort: resAvAmort, chargesDeductibles: chargesDed,
        baseImposable, impot, cashflow,
      });
      reportN = newReport;
    }

    const zerosYears = rows.filter(ro => ro.baseImposable === 0).length;
    const firstTaxRow = rows.find(ro => ro.baseImposable > 0);

    // Amort composants for display
    const annexeCols: { label: string; annuel: number; duree: number; initial: number }[] = [];
    if (amortMode === "ensemble") {
      if (valeurAmortissable > 0) annexeCols.push({ label: "Bien immobilier", annuel: valeurAmortissable / amortDureeEnsemble, duree: amortDureeEnsemble, initial: valeurAmortissable });
    } else {
      for (const c of composants) {
        const val = valeurAmortissable * c.pct / 100;
        if (val > 0) annexeCols.push({ label: c.label, annuel: val / c.duree, duree: c.duree, initial: val });
      }
    }
    if (mobilier > 0) annexeCols.push({ label: "Mobilier", annuel: mobilier / amortDureeMobilier, duree: amortDureeMobilier, initial: mobilier });
    if (travaux > 0) annexeCols.push({ label: "Travaux", annuel: travaux / amortDureeTravaux, duree: amortDureeTravaux, initial: travaux });
    if (notaire > 0) annexeCols.push({ label: "Frais notaire", annuel: notaire / amortDureeNotaire, duree: amortDureeNotaire, initial: notaire });

    // Terrain (non amortissable)
    const terrainVal = prix * (1 - amortPct / 100);

    // ── SVG Charts ──────────────────────────────────────────────────────────

    // Bar chart: amortissement par année
    const makeAmortBarChart = () => {
      const chartYears = Math.min(maxAmortDuree + 5, 40);
      const barData = Array.from({ length: chartYears }, (_, i) => {
        const yr = i + 1;
        let a = 0;
        if (amortMode === "ensemble") {
          a = yr <= amortDureeEnsemble ? valeurAmortissable / amortDureeEnsemble : 0;
        } else {
          for (const c of composants) {
            a += yr <= c.duree ? (valeurAmortissable * c.pct / 100) / c.duree : 0;
          }
        }
        if (amortDureeMobilier > 0 && yr <= amortDureeMobilier && mobilier > 0) a += mobilier / amortDureeMobilier;
        if (amortDureeTravaux > 0 && yr <= amortDureeTravaux && travaux > 0) a += travaux / amortDureeTravaux;
        if (amortDureeNotaire > 0 && yr <= amortDureeNotaire && notaire > 0) a += notaire / amortDureeNotaire;
        return { yr, a };
      });
      const maxVal = Math.max(...barData.map(d => d.a), 1);
      const W = 680, H = 150, PL = 60, PR = 10, PT = 10, PB = 25;
      const cW = W - PL - PR, cH = H - PT - PB;
      const bW = Math.max(2, cW / chartYears - 1.5);
      const bars = barData.map(({ yr, a }, i) => {
        const bh = (a / maxVal) * cH;
        const bx = PL + i * (cW / chartYears) + 0.5;
        const by = PT + cH - bh;
        return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bW.toFixed(1)}" height="${Math.max(0, bh).toFixed(1)}" fill="${a > 0 ? "#C95B2A" : "#EDE7DC"}" opacity="${a > 0 ? 0.8 : 1}"/>
${yr % 5 === 0 || yr === 1 ? `<text x="${(bx + bW / 2).toFixed(1)}" y="${(H - 6).toFixed(1)}" text-anchor="middle" font-size="7" fill="rgba(26,22,18,0.4)">${yr}</text>` : ""}`;
      }).join("");
      const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PT + cH * (1 - t);
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${W - PR}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.07)" stroke-width="0.5"/>
<text x="${(PL - 4).toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="7" fill="rgba(26,22,18,0.35)">${fE(maxVal * t)}</text>`;
      }).join("");
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;margin-top:8px">${ticks}${bars}<text x="${W / 2}" y="${H - 1}" text-anchor="middle" font-size="7" fill="rgba(26,22,18,0.3)">Année</text></svg>`;
    };

    // Line chart: capital restant dû
    const makeCapitalChart = () => {
      const pts = rows.filter(ro => ro.year <= duree + 1).map(ro => ({ yr: ro.year, v: ro.capitalDebut }));
      if (pts.length === 0) return "";
      const maxV = Math.max(...pts.map(p => p.v), 1);
      const W = 680, H = 130, PL = 65, PR = 10, PT = 10, PB = 22;
      const cW = W - PL - PR, cH = H - PT - PB;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(duree, 1)) * cW;
      const toY = (v: number) => PT + cH - (v / maxV) * cH;
      const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.yr).toFixed(1)},${toY(p.v).toFixed(1)}`).join(" ");
      const areaD = `${pathD} L${toX(pts[pts.length - 1].yr).toFixed(1)},${(PT + cH).toFixed(1)} L${toX(pts[0].yr).toFixed(1)},${(PT + cH).toFixed(1)} Z`;
      const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PT + cH * (1 - t);
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${W - PR}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.06)" stroke-width="0.5"/>
<text x="${(PL - 4).toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="7" fill="rgba(26,22,18,0.35)">${fE(maxV * t)}</text>`;
      }).join("");
      const xLabels = [1, Math.round(duree / 3), Math.round(2 * duree / 3), duree].map(yr => {
        return `<text x="${toX(yr).toFixed(1)}" y="${(H - 5).toFixed(1)}" text-anchor="middle" font-size="7" fill="rgba(26,22,18,0.4)">An ${yr}</text>`;
      }).join("");
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;margin-top:8px">${ticks}<path d="${areaD}" fill="#2A7080" opacity="0.08"/><path d="${pathD}" fill="none" stroke="#2A7080" stroke-width="2"/>${xLabels}</svg>`;
    };

    // Line chart: cashflow mensuel
    const makeCashflowChart = () => {
      const visYears = Math.min(totalYears, duree + 10);
      const pts = rows.filter(ro => ro.year <= visYears).map(ro => ({ yr: ro.year, v: ro.cashflow }));
      if (pts.length === 0) return "";
      const allV = pts.map(p => p.v);
      const minV = Math.min(...allV);
      const maxV = Math.max(...allV, 1);
      const range = maxV - minV || 1;
      const W = 680, H = 130, PL = 65, PR = 10, PT = 10, PB = 22;
      const cW = W - PL - PR, cH = H - PT - PB;
      const toX = (yr: number) => PL + ((yr - 1) / Math.max(visYears - 1, 1)) * cW;
      const toY = (v: number) => PT + cH - ((v - minV) / range) * cH;
      const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.yr).toFixed(1)},${toY(p.v).toFixed(1)}`).join(" ");
      // Zero line
      const zeroY = toY(0);
      const zeroLine = zeroY >= PT && zeroY <= PT + cH
        ? `<line x1="${PL}" y1="${zeroY.toFixed(1)}" x2="${W - PR}" y2="${zeroY.toFixed(1)}" stroke="#B03A2A" stroke-width="0.75" stroke-dasharray="4,3" opacity="0.5"/>`
        : "";
      const ticks = [minV, (minV + maxV) / 2, maxV].map(v => {
        const y = toY(v);
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${W - PR}" y2="${y.toFixed(1)}" stroke="rgba(26,22,18,0.06)" stroke-width="0.5"/>
<text x="${(PL - 4).toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="7" fill="rgba(26,22,18,0.35)">${fE(v)}</text>`;
      }).join("");
      const step = Math.max(5, Math.round(visYears / 5 / 5) * 5);
      const xLabels = Array.from({ length: Math.floor(visYears / step) + 1 }, (_, i) => Math.min(i * step + 1, visYears)).map(yr => {
        return `<text x="${toX(yr).toFixed(1)}" y="${(H - 5).toFixed(1)}" text-anchor="middle" font-size="7" fill="rgba(26,22,18,0.4)">An ${yr}</text>`;
      }).join("");
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;margin-top:8px">${ticks}${zeroLine}<path d="${pathD}" fill="none" stroke="#1A7A52" stroke-width="2"/>${xLabels}</svg>`;
    };

    // Key years for page 6
    const keyYears = [1, 5, 10, 15, 20, 21, 25, 30, 35, 40].filter(y => y <= totalYears);

    const today = new Date().toLocaleDateString("fr-FR");
    const chargesLoyer = parseFloat(f.chargesLoyer ?? "0") || 0;
    const taxeFonciere = parseFloat(f.taxeFonciere) || 0;
    const chargesCopro = parseFloat(f.chargesCopro ?? "0") || 0;

    // Saisonnier scenario pages (Pages 1 & 2 for saisonnier)
    const saisonnierPagesHtml = isSaisonnier && resultatsTriple ? (() => {
      const scenarios = [
        { label: "Estimation basse", color: "#2A7080", sr: resultatsTriple.bas, taux: tauxOccBas },
        { label: "Estimation moyenne", color: "#C95B2A", sr: resultatsTriple.moyen, taux: tauxOccMoyen },
        { label: "Estimation haute", color: "#1A7A52", sr: resultatsTriple.haut, taux: tauxOccHaut },
      ];
      const prixN = parseFloat(prixNuitee) || 0;

      // Large scenario cards with breakdown table
      const largeCards = scenarios.map(({ label, color, sr, taux: t }) => {
        if (!sr) return `<div style="flex:1;background:#EDE7DC;border-radius:10px;overflow:hidden;border-top:3px solid ${color};opacity:.4"><div style="background:${color};padding:10px 14px"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.75)">${label}</div></div></div>`;
        const nuits = Math.round(parseFloat(t) / 100 * 365);
        const cfNet = isMicro ? sr.cashflowBICMensuel : sr.cashflowReelMensuel;
        const cfAnnuel = cfNet * 12;
        const baseImp = isMicro ? sr.loyerAnnuel * 0.70 : sr.baseImposableReel;
        const impot = isMicro ? sr.impotBIC : sr.impotReel;
        return `<div style="flex:1;background:#EDE7DC;border-radius:10px;overflow:hidden;border-top:3px solid ${color}">
  <div style="background:${color};padding:10px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.72);margin-bottom:2px">${label}</div>
    <div style="font-size:19px;font-weight:700;color:#fff;line-height:1.1">${fE(cfNet)}<span style="font-size:9px;font-weight:400;margin-left:2px">/mois</span></div>
    <div style="font-size:7.5px;color:rgba(255,255,255,.68);margin-top:3px">${t}% occ. · ${nuits} nuits · ${fE(prixN)}/nuit</div>
  </div>
  <div style="padding:10px 14px">
    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Revenus annuels</td><td style="font-size:8px;font-weight:600;text-align:right">${fE(sr.loyerAnnuel)}</td></tr>
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Emprunt (annuel)</td><td style="font-size:8px;text-align:right">−${fE(sr.creditAnnuel)}</td></tr>
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Charges propriétaire</td><td style="font-size:8px;text-align:right">−${fE(sr.chargesAnnuelles)}</td></tr>
      ${!isMicro ? `<tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Amortissements</td><td style="font-size:8px;text-align:right">−${fE(sr.amortTotal)}</td></tr>` : `<tr style="border-bottom:0.5px solid rgba(26,22,18,.08)"><td style="font-size:7.5px;color:rgba(26,22,18,.38);padding:2px 0;font-style:italic">Abattement 30% (Micro-BIC)</td><td style="font-size:7.5px;text-align:right;color:rgba(26,22,18,.38)">−${fE(sr.loyerAnnuel * 0.30)}</td></tr>`}
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Base imposable</td><td style="font-size:8px;font-weight:600;text-align:right;color:${baseImp > 0 ? "#B03A2A" : "#1A7A52"}">${fE(baseImp)}</td></tr>
      <tr style="border-bottom:1px solid rgba(26,22,18,.18)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Impôt estimé</td><td style="font-size:8px;text-align:right;color:#B03A2A">−${fE(impot)}</td></tr>
      <tr><td style="font-size:8.5px;font-weight:700;padding:4px 0 1px">Cash-flow mensuel</td><td style="font-size:9.5px;font-weight:700;text-align:right;color:${cfNet >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfNet)}/mois</td></tr>
      <tr><td style="font-size:7.5px;color:rgba(26,22,18,.4)">Soit annuel</td><td style="font-size:8.5px;font-weight:600;text-align:right;color:${cfAnnuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAnnuel)}</td></tr>
    </table>
  </div>
</div>`;
      }).join("");

      const nuitsMoyen = Math.round(parseFloat(tauxOccMoyen) / 100 * 365);
      const moyen = resultatsTriple.moyen;
      const cfMoyen = moyen ? (isMicro ? moyen.cashflowBICMensuel : moyen.cashflowReelMensuel) : 0;

      return `
<!-- PAGE 1 SAISONNIER — COMPARAISON DES 3 SCÉNARIOS -->
<div class="page">
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Rapport Client · Simulation LMNP · Location saisonnière</div>
  </div>
  <div class="hdr-right">Généré le ${today}<br>${isMicro ? "Micro-BIC" : "Régime réel simplifié"}</div>
</div>

<div style="margin:8px 0 12px">
  <h1 style="font-size:17px;font-weight:700;color:#4E1F12;letter-spacing:-.02em;margin-bottom:6px">Synthèse · Location saisonnière</h1>
  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
    ${bienInfo.type ? `<span class="bien-badge">${bienInfo.type === "ap" ? "Appartement" : bienInfo.type === "ma" ? "Maison" : "Immeuble"}</span>` : ""}
    ${bienInfo.ville ? `<span class="bien-badge">📍 ${bienInfo.ville}</span>` : ""}
    ${bienInfo.surface ? `<span class="bien-badge">📐 ${bienInfo.surface} m²</span>` : ""}
    <span class="bien-badge">🏡 Location saisonnière</span>
    <span class="bien-badge">${fE(prixN)}/nuit</span>
    ${bienInfo.description ? `<span style="font-size:10px;color:#1A1612">${bienInfo.description}</span>` : ""}
  </div>
</div>

<h2 class="ch">Récapitulatif</h2>
<div class="info-grid" style="margin-bottom:14px">
  <div class="info-col">
    <div class="info-col-title">Acquisition</div>
    <div class="info-row"><div class="ir-lbl">Prix d'achat</div><div class="ir-val">${fE(prix)}</div></div>
    ${travaux > 0 ? `<div class="info-row"><div class="ir-lbl">Travaux</div><div class="ir-val">${fE(travaux)}</div></div>` : ""}
    ${mobilier > 0 ? `<div class="info-row"><div class="ir-lbl">Mobilier</div><div class="ir-val">${fE(mobilier)}</div></div>` : ""}
    <div class="info-row"><div class="ir-lbl">Frais de notaire</div><div class="ir-val">${fE(notaire)}</div></div>
    <div class="info-row"><div class="ir-lbl">Coût total</div><div class="ir-val orange">${fE(investTotal)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title">Revenus (est. moy.)</div>
    <div class="info-row"><div class="ir-lbl">Prix par nuitée</div><div class="ir-val orange">${fE(prixN)}</div></div>
    <div class="info-row"><div class="ir-lbl">Recettes moy./mois</div><div class="ir-val orange">${fE(loyerAnnuel / 12)}</div></div>
    <div class="info-row"><div class="ir-lbl">Recettes moy./an</div><div class="ir-val">${fE(loyerAnnuel)}</div></div>
    <div class="info-row"><div class="ir-lbl">Charges propri./an</div><div class="ir-val">${fE(chargesAnnuelles)}</div></div>
    <div class="info-row"><div class="ir-lbl">Rentabilité brute</div><div class="ir-val">${fP(rendementBrut, 2)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title">Financement</div>
    <div class="info-row"><div class="ir-lbl">Apport personnel</div><div class="ir-val">${fE(apport)}</div></div>
    <div class="info-row"><div class="ir-lbl">Montant emprunté</div><div class="ir-val">${fE(montantCredit)}</div></div>
    <div class="info-row"><div class="ir-lbl">Taux · Durée</div><div class="ir-val">${f.taux} % · ${duree} ans</div></div>
    <div class="info-row"><div class="ir-lbl">Mensualité</div><div class="ir-val">${fE(mensualite)}/mois</div></div>
  </div>
</div>

<h2 class="ch">Les 3 estimations · ${isMicro ? "Micro-BIC" : "Régime réel simplifié"}</h2>
<div style="display:flex;gap:10px;margin-bottom:14px">
  ${largeCards}
</div>

<div class="beige-note">
  <strong>Loi de Finances 2024 :</strong> Pour les meublés de tourisme non classés, l'abattement Micro-BIC est de <strong>30 %</strong> (contre 50 % en location nue). Le régime réel reste souvent plus avantageux grâce aux amortissements. TMI appliquée : <strong>${tmi} %</strong> + prélèvements sociaux <strong>18,6 %</strong>.
</div>
</div>

<!-- PAGE 2 SAISONNIER — PIVOT ESTIMATION MOYENNE -->
<div class="page">
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Rapport Client · Simulation LMNP · Location saisonnière</div>
  </div>
  <div class="hdr-right">${today}<br>${isMicro ? "Micro-BIC" : "Régime réel simplifié"}</div>
</div>

<div style="text-align:center;margin:24px 0 28px;padding:28px 32px;background:#4E1F12;border-radius:12px">
  <div style="font-size:20px;font-weight:700;color:#F5F0E8;line-height:1.4;letter-spacing:-.02em;margin-bottom:12px">
    Pour la suite de ce rapport,<br>nous utilisons l'<span style="color:#C95B2A">Estimation Moyenne</span>
  </div>
  <div style="display:flex;justify-content:center;gap:24px">
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Taux d'occupation</div><div style="font-size:14px;font-weight:700;color:#C95B2A">${tauxOccMoyen}%</div></div>
    <div style="width:1px;background:rgba(245,240,232,.2)"></div>
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Nuits/an</div><div style="font-size:14px;font-weight:700;color:#C95B2A">${nuitsMoyen}</div></div>
    <div style="width:1px;background:rgba(245,240,232,.2)"></div>
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Prix/nuit</div><div style="font-size:14px;font-weight:700;color:#C95B2A">${fE(prixN)}</div></div>
    <div style="width:1px;background:rgba(245,240,232,.2)"></div>
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Loyers annuels</div><div style="font-size:14px;font-weight:700;color:#C95B2A">${moyen ? fE(moyen.loyerAnnuel) : "—"}</div></div>
  </div>
</div>

<div class="kpi-row">
  <div class="kpi">
    <div class="kpi-lbl">Coût total projet</div>
    <div class="kpi-val">${fE(investTotal)}</div>
    <div class="kpi-unit">acquisition + travaux + notaire</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Rentabilité brute acte en main</div>
    <div class="kpi-val">${fP(rendementBrut, 2)}</div>
    <div class="kpi-unit">loyer annuel / coût total</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Cash-flow mensuel après fiscalité</div>
    <div class="kpi-val" style="color:${cfMoyen >= 0 ? "#4ADE80" : "#FCA5A5"}">${fE(cfMoyen)}</div>
    <div class="kpi-unit">année 1 · ${isMicro ? "Micro-BIC" : "régime réel"} · est. moyenne</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Capital remboursé année 1</div>
    <div class="kpi-val">${fE(capitalRembourseAn1)}</div>
    <div class="kpi-unit">annuité − intérêts</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-col">
    <div class="info-col-title">Revenus (estimation moyenne)</div>
    <div class="info-row"><div class="ir-lbl">Prix par nuitée</div><div class="ir-val orange">${fE(prixN)}</div></div>
    <div class="info-row"><div class="ir-lbl">Recettes moy./mois</div><div class="ir-val orange">${fE(loyerAnnuel / 12)}</div></div>
    <div class="info-row"><div class="ir-lbl">Recettes moy./an</div><div class="ir-val">${fE(loyerAnnuel)}</div></div>
    <div class="info-row"><div class="ir-lbl">Charges propriétaire/an</div><div class="ir-val">${fE(chargesAnnuelles)}</div></div>
    ${assuranceEmprunteurAnnuel > 0 ? `<div class="info-row"><div class="ir-lbl">Ass. emprunteur/an</div><div class="ir-val">${fE(assuranceEmprunteurAnnuel)}</div></div>` : ""}
  </div>
  <div class="info-col">
    <div class="info-col-title">Acquisition</div>
    <div class="info-row"><div class="ir-lbl">Prix d'achat</div><div class="ir-val">${fE(prix)}</div></div>
    ${travaux > 0 ? `<div class="info-row"><div class="ir-lbl">Travaux</div><div class="ir-val">${fE(travaux)}</div></div>` : ""}
    ${mobilier > 0 ? `<div class="info-row"><div class="ir-lbl">Mobilier</div><div class="ir-val">${fE(mobilier)}</div></div>` : ""}
    <div class="info-row"><div class="ir-lbl">Frais de notaire</div><div class="ir-val">${fE(notaire)}</div></div>
    <div class="info-row"><div class="ir-lbl">Coût total</div><div class="ir-val orange">${fE(investTotal)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title">Financement</div>
    <div class="info-row"><div class="ir-lbl">Apport personnel</div><div class="ir-val">${fE(apport)}</div></div>
    <div class="info-row"><div class="ir-lbl">Montant emprunté</div><div class="ir-val">${fE(montantCredit)}</div></div>
    <div class="info-row"><div class="ir-lbl">Taux · Durée</div><div class="ir-val">${f.taux} % · ${duree} ans</div></div>
    <div class="info-row"><div class="ir-lbl">Mensualité (hors ass.)</div><div class="ir-val">${fE(mensualite)}/mois</div></div>
  </div>
</div>
</div>`;
    })() : "";

    // Annexe B table
    const annexeMaxDuree = annexeCols.length > 0 ? Math.max(...annexeCols.map(c => c.duree)) : 0;
    const afs = 9;
    const annexeBRows = Array.from({ length: annexeMaxDuree }, (_, i) => {
      const year = i + 1;
      let total = 0;
      const cells = annexeCols.map(c => {
        if (year <= c.duree) {
          const reste = Math.max(0, c.initial - year * c.annuel);
          total += c.annuel;
          return `<td style="font-size:${afs}px;padding:5px 6px">${fE(c.annuel)}</td>
<td style="font-size:${afs}px;padding:5px 6px;color:${reste <= 0.01 ? "#1A7A52" : "rgba(26,22,18,0.45)"};border-right:1px solid rgba(26,22,18,0.07)">${fE(reste)}</td>`;
        }
        return `<td style="font-size:${afs}px;padding:5px 6px;color:#1A1612">—</td><td style="border-right:1px solid rgba(26,22,18,0.07)"></td>`;
      }).join("");
      return `<tr><td class="can" style="font-size:${afs}px">${year}</td>${cells}<td style="font-weight:700;color:#C95B2A;font-size:${afs}px;padding:5px 6px">${fE(total)}</td></tr>`;
    }).join("");
    const annexeBHeaderCols = annexeCols.map(c =>
      `<th colspan="2" style="text-align:center;font-size:9px;padding:6px 5px;border-right:1px solid rgba(255,255,255,0.12)">
        <div style="font-weight:700">${c.label}</div>
        <div style="font-weight:400;opacity:.7;font-size:8px;margin-top:2px">${fE(c.initial)} · ${c.duree} ans · ${fE(c.annuel)}/an</div>
      </th>`).join("");
    const annexeBHeaderSub = annexeCols.map(() =>
      `<th style="font-size:8px;background:#3a1509;padding:4px 5px">Amort.</th><th style="font-size:8px;background:#3a1509;padding:4px 5px;border-right:1px solid rgba(255,255,255,0.1)">Reste</th>`
    ).join("");

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport LMNP – toutlmnp</title>
<style>
@page{size:A4;margin:0}
@page landscape{size:A4 landscape;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#5a5a5a;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;font-size:11px;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{padding:0 0 32px}
.page{width:210mm;min-height:297mm;background:#F5F0E8;margin:0 auto 24px;padding:14mm 15mm;box-shadow:0 8px 40px rgba(0,0,0,0.5);position:relative}
.page.landscape{width:297mm;min-height:210mm;page:landscape}
.no-print{position:sticky;top:0;z-index:100;background:#3a1509;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:0}
.hdr{display:flex;align-items:center;justify-content:space-between;background:#4E1F12;color:#F5F0E8;
  padding:6px 14px;border-radius:5px;margin-bottom:14px}
.hdr-brand{display:flex;align-items:baseline;gap:0}
.hdr-light{font-weight:300;font-size:14px}.hdr-bold{font-weight:700;font-size:14px;color:#C95B2A}
.hdr-sub{font-size:8px;letter-spacing:.12em;opacity:.5;text-transform:uppercase;margin-top:2px}
.hdr-right{font-size:9px;opacity:.5;text-align:right}
h2.ch{font-size:12px;font-weight:700;color:#4E1F12;border-bottom:2px solid #C95B2A;padding-bottom:5px;margin:22px 0 10px;letter-spacing:-.01em}
h2.ch .num{color:#C95B2A;margin-right:5px}
.cover-title{text-align:center;margin:10px 0 20px}
.cover-title h1{font-size:22px;font-weight:700;color:#4E1F12;letter-spacing:-.025em;margin-bottom:5px}
.cover-title .sub{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:#1A1612}
.info-grid{display:flex;gap:10px;margin-bottom:14px}
.info-col{flex:1;background:#EDE7DC;border-radius:7px;padding:12px 14px}
.info-col.orange{background:rgba(201,91,42,0.08);border:1px solid rgba(201,91,42,0.2)}
.info-col-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#1A1612;margin-bottom:10px}
.info-row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:5px}
.info-row:last-child{margin-bottom:0}
.ir-lbl{font-size:8px;text-transform:uppercase;letter-spacing:.09em;color:rgba(26,22,18,0.55);flex-shrink:0}
.ir-val{font-size:10px;font-weight:700;color:#1A1612;text-align:right}
.ir-val.orange{color:#C95B2A}
.kpi-row{display:flex;gap:8px;margin-bottom:14px}
.kpi{flex:1;background:#4E1F12;color:#F5F0E8;border-radius:7px;padding:12px 10px;text-align:center}
.kpi-lbl{font-size:7.5px;text-transform:uppercase;letter-spacing:.1em;opacity:.6;margin-bottom:6px;line-height:1.4}
.kpi-val{font-size:17px;font-weight:700;color:#C95B2A;letter-spacing:-.02em}
.kpi-unit{font-size:8px;opacity:.55;margin-top:3px}
table.tbl{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:6px}
table.tbl th{background:#4E1F12;color:#F5F0E8;padding:6px 8px;text-align:left;font-weight:500;font-size:9.5px}
table.tbl th.r{text-align:right}
table.tbl td{padding:6px 8px;border-bottom:.5px solid rgba(26,22,18,.07);vertical-align:middle}
table.tbl td.r{text-align:right}
table.tbl td.lbl{color:#1A1612;font-size:10px}
table.tbl tr:nth-child(even){background:rgba(201,91,42,.03)}
table.tbl tr.sep td{border-top:1.5px solid rgba(26,22,18,.12);font-weight:700}
table.tbl tr.total td{background:rgba(78,31,18,.07);font-weight:700}
.can{text-align:left!important;font-weight:600;width:24px;white-space:nowrap}
.green{color:#1A7A52}.red{color:#B03A2A}.orange{color:#C95B2A}
.note{background:rgba(201,91,42,.07);border:1px solid rgba(201,91,42,.18);border-radius:6px;padding:10px 13px;font-size:9.5px;line-height:1.65;color:#1A1612;margin-top:10px}
.note strong{color:#1A1612}
.beige-note{background:#EDE7DC;border-radius:6px;padding:10px 13px;font-size:9.5px;line-height:1.65;color:#1A1612;margin-top:10px}
.two-col{display:flex;gap:14px}
.two-col > div{flex:1}
.section-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#C95B2A;margin-bottom:6px}
.chart-title{font-size:9px;font-weight:700;color:#1A1612;text-transform:uppercase;letter-spacing:.08em;margin:14px 0 2px}
.big-result{background:#4E1F12;color:#F5F0E8;border-radius:7px;padding:12px 16px;margin-top:10px;display:flex;align-items:center;gap:12px}
.big-result .lbl{font-size:9px;opacity:.6}
.big-result .val{font-size:16px;font-weight:700;color:#C95B2A}
.bien-badge{display:inline-block;background:#EDE7DC;border-radius:4px;padding:2px 7px;font-size:9px;color:#1A1612;margin-right:6px}
@media print{
  html,body{background:#F5F0E8;padding:0;margin:0}
  body{padding:0}
  .no-print{display:none}
  .page{margin:0;box-shadow:none;padding:14mm 15mm;page-break-after:always;min-height:297mm;width:100%;background:#F5F0E8}
  .page.landscape{padding:12mm 14mm}
  .page:last-child{page-break-after:avoid}
}
</style></head><body>
<div class="no-print">
  <div style="font-size:12px;font-weight:600;color:#F5F0E8;letter-spacing:.02em">Rapport LMNP – <span style="color:#C95B2A">toutlmnp</span></div>
  <button onclick="window.print()" style="background:#C95B2A;color:#F5F0E8;border:none;border-radius:6px;padding:8px 20px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:.02em">⬇ Imprimer / Enregistrer en PDF</button>
</div>

${saisonnierPagesHtml}

${!isSaisonnier ? `<!-- ═══════════════════════════════════════════════════════
     PAGE 1 — COUVERTURE / SYNTHÈSE
═══════════════════════════════════════════════════════ -->
<div class="page">
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Rapport Client · Simulation LMNP</div>
  </div>
  <div class="hdr-right">Généré le ${today}<br>${isMicro ? "Micro-BIC" : "Régime réel simplifié"}</div>
</div>

<div class="cover-title">
  <h1>Synthèse de votre investissement LMNP</h1>
  <div class="sub">Estimation de la rentabilité, du cash-flow et de la fiscalité du projet</div>
</div>

<div style="background:#EDE7DC;border-radius:7px;padding:10px 14px;margin-bottom:14px;display:flex;gap:16px;flex-wrap:wrap">
  ${bienInfo.type ? `<span class="bien-badge">${bienInfo.type === "ap" ? "Appartement" : bienInfo.type === "ma" ? "Maison" : "Immeuble"}</span>` : ""}
  ${bienInfo.ville ? `<span class="bien-badge">📍 ${bienInfo.ville}</span>` : ""}
  ${bienInfo.surface ? `<span class="bien-badge">📐 ${bienInfo.surface} m²</span>` : ""}
  ${bienInfo.description ? `<span style="font-size:10px;color:#1A1612">${bienInfo.description}</span>` : ""}
  ${!bienInfo.type && !bienInfo.ville && !bienInfo.surface && !bienInfo.description ? `<span style="font-size:10px;color:#1A1612">Bien immobilier – simulation LMNP ${isMicro ? "Micro-BIC" : "régime réel simplifié"}</span>` : ""}
</div>

<div class="info-grid">
  <div class="info-col">
    <div class="info-col-title">Le bien et les revenus</div>
    <div class="info-row"><div class="ir-lbl">Loyer HC mensuel</div><div class="ir-val orange">${fE(loyerAnnuel / 12)}/mois</div></div>
    <div class="info-row"><div class="ir-lbl">Loyer HC annuel</div><div class="ir-val">${fE(loyerAnnuel)}</div></div>
    ${chargesLoyer > 0 ? `<div class="info-row"><div class="ir-lbl">Charges locataire</div><div class="ir-val">${fE(chargesLoyer)}/mois</div></div>` : ""}
    <div class="info-row"><div class="ir-lbl">Charges propriétaire/an</div><div class="ir-val">${fE(chargesAnnuelles)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title">Acquisition</div>
    <div class="info-row"><div class="ir-lbl">Prix d'achat</div><div class="ir-val">${fE(prix)}</div></div>
    ${travaux > 0 ? `<div class="info-row"><div class="ir-lbl">Travaux</div><div class="ir-val">${fE(travaux)}</div></div>` : ""}
    ${mobilier > 0 ? `<div class="info-row"><div class="ir-lbl">Mobilier</div><div class="ir-val">${fE(mobilier)}</div></div>` : ""}
    <div class="info-row"><div class="ir-lbl">Frais de notaire</div><div class="ir-val">${fE(notaire)}</div></div>
    <div class="info-row"><div class="ir-lbl">Coût total</div><div class="ir-val orange">${fE(investTotal)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title">Financement</div>
    <div class="info-row"><div class="ir-lbl">Apport personnel</div><div class="ir-val">${fE(apport)}</div></div>
    <div class="info-row"><div class="ir-lbl">Montant emprunté</div><div class="ir-val">${fE(montantCredit)}</div></div>
    <div class="info-row"><div class="ir-lbl">Taux · Durée</div><div class="ir-val">${f.taux} % · ${duree} ans</div></div>
    <div class="info-row"><div class="ir-lbl">Mensualité (hors ass.)</div><div class="ir-val">${fE(mensualite)}/mois</div></div>
  </div>
</div>

<div class="kpi-row">
  <div class="kpi">
    <div class="kpi-lbl">Coût total projet</div>
    <div class="kpi-val">${fE(investTotal)}</div>
    <div class="kpi-unit">acquisition + travaux + notaire</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Rentabilité brute acte en main</div>
    <div class="kpi-val">${fP(rendementBrut, 2)}</div>
    <div class="kpi-unit">loyer annuel / coût total</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Cash-flow mensuel après fiscalité</div>
    <div class="kpi-val" style="color:${(isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? "#4ADE80" : "#FCA5A5"}">${fE(isMicro ? cashflowBICMensuel : cashflowReelMensuel)}</div>
    <div class="kpi-unit">année 1 · ${isMicro ? "Micro-BIC" : "régime réel"}</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Capital remboursé année 1</div>
    <div class="kpi-val">${fE(capitalRembourseAn1)}</div>
    <div class="kpi-unit">annuité − intérêts</div>
  </div>
</div>

<h2 class="ch">Comparaison des régimes fiscaux – année 1</h2>
<table class="tbl">
  <thead><tr>
    <th>Indicateur</th>
    <th class="r">Régime réel simplifié</th>
    <th class="r">Micro-BIC</th>
  </tr></thead>
  <tbody>
    <tr><td class="lbl">Loyers imposables</td><td class="r">${fE(loyerAnnuel)}</td><td class="r">${fE(loyerAnnuel)}</td></tr>
    <tr><td class="lbl">Charges / abattement</td><td class="r">Charges réelles : ${fE(chargesDeductibles)}</td><td class="r">Abattement ${isSaisonnier ? "30" : "50"} % : ${fE(loyerAnnuel * abattPct)}</td></tr>
    <tr style="background:rgba(139,26,26,0.04)"><td class="lbl" style="font-weight:700;color:#8B1A1A">Amortissements déduits</td><td class="r" style="font-weight:700;color:#8B1A1A">${fE(amortTotalAn1)}</td><td class="r" style="color:rgba(26,22,18,0.35)">—</td></tr>
    <tr class="sep"><td class="lbl">Base imposable</td>
      <td class="r" style="color:${baseImposableReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(baseImposableReel)}</td>
      <td class="r">${fE(baseBIC)}</td>
    </tr>
    <tr><td class="lbl">Impôt IR estimé (TMI ${tmi} %)</td><td class="r">${fE(impotReel * tmi / (tmi + 18.6))}</td><td class="r">${fE(impotBIC * tmi / (tmi + 18.6))}</td></tr>
    <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotReel * 18.6 / (tmi + 18.6))}</td><td class="r">${fE(impotBIC * 18.6 / (tmi + 18.6))}</td></tr>
    <tr class="total"><td>Fiscalité totale estimée</td><td class="r" style="color:${impotReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotReel)}</td><td class="r">${fE(impotBIC)}</td></tr>
    <tr class="total"><td>Cash-flow mensuel net</td>
      <td class="r" style="color:${cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowReelMensuel)}/mois</td>
      <td class="r" style="color:${cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowBICMensuel)}/mois</td>
    </tr>
  </tbody>
</table>

<div class="beige-note">
  <strong>Hypothèse :</strong> Simulation sur ${totalYears} ans en ${isMicro ? "Micro-BIC" : "régime réel simplifié"}. Loyers, charges et valeur du bien supposés constants.${isMicro ? ` Abattement forfaitaire ${isSaisonnier ? "30" : "50"} % appliqué sur les loyers.` : " L'amortissement est calculé selon les durées fiscalement reconnues."} TMI appliquée : <strong>${tmi} %</strong> + prélèvements sociaux <strong>18,6 %</strong>. Cette simulation est indicative et ne constitue pas un conseil fiscal.
</div>

<!-- Recap fiscal + barre régime choisi -->
<div style="margin-top:18px;background:#EDE7DC;border-radius:10px;padding:16px 20px;display:flex;gap:0;align-items:stretch">
  <div style="text-align:center;flex:1;padding:0 16px">
    <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#1A1612;margin-bottom:6px">Impôt Micro-BIC</div>
    <div style="font-size:20px;font-weight:700;color:#B03A2A">${fE(impotBIC)}</div>
    <div style="font-size:9px;color:#1A1612;margin-top:2px">par an</div>
  </div>
  <div style="width:1px;background:rgba(26,22,18,.12)"></div>
  <div style="text-align:center;flex:1;padding:0 16px">
    <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#1A1612;margin-bottom:6px">Impôt Régime réel</div>
    <div style="font-size:20px;font-weight:700;color:${impotReel === 0 ? "#1A7A52" : "#C95B2A"}">${fE(impotReel)}</div>
    <div style="font-size:9px;color:#1A1612;margin-top:2px">par an</div>
  </div>
  <div style="width:1px;background:rgba(26,22,18,.12)"></div>
  <div style="text-align:center;flex:1;padding:0 16px">
    <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#1A1612;margin-bottom:6px">Économie fiscale an. 1</div>
    <div style="font-size:22px;font-weight:700;color:#1A7A52">${fE(Math.max(0, impotBIC - impotReel))}</div>
    <div style="font-size:9px;color:#1A1612;margin-top:2px">en faveur du réel</div>
  </div>
</div>

<div style="margin-top:12px;background:${isMicro ? "#2A5C8A" : "#1A6644"};border-radius:10px;padding:14px 20px;color:#fff;display:flex;align-items:center;gap:16px">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;white-space:nowrap;opacity:.7;flex-shrink:0">Régime<br>choisi</div>
  <div style="width:1px;background:rgba(255,255,255,.25);align-self:stretch"></div>
  <div>
    <div style="font-size:13px;font-weight:700;margin-bottom:4px">${isMicro ? "Micro-BIC" : "Régime réel simplifié"}</div>
    <div style="font-size:9px;opacity:.85;line-height:1.6">${isMicro
      ? `Abattement forfaitaire ${isSaisonnier ? "30" : "50"} % · Déclaration simplifiée · Aucune comptabilité obligatoire · Idéal si charges réelles inférieures à l'abattement`
      : "Déduction des charges réelles · Amortissement du bien, mobilier, travaux et notaire · Report illimité du déficit · Optimisation fiscale sur le long terme"
    }</div>
  </div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 2 — CHAPITRE 1 : PROJET ET FINANCEMENT
═══════════════════════════════════════════════════════ -->
</div>` : ""}
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP${isSaisonnier ? " · Estimation Moyenne" : ""}</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">1.</span>Votre projet et son financement${isSaisonnier ? " <span style=\"font-size:9px;font-weight:400;color:#C95B2A;margin-left:6px\">(Estimation Moyenne)</span>" : ""}</h2>

<div class="two-col" style="margin-bottom:14px">
  <div>
    <div class="section-label">Le bien</div>
    <table class="tbl">
      <thead><tr><th>Élément</th><th class="r">Montant</th></tr></thead>
      <tbody>
        <tr><td class="lbl">Prix d'achat</td><td class="r">${fE(prix)}</td></tr>
        ${travaux > 0 ? `<tr><td class="lbl">Travaux</td><td class="r">${fE(travaux)}</td></tr>` : ""}
        ${mobilier > 0 ? `<tr><td class="lbl">Mobilier</td><td class="r">${fE(mobilier)}</td></tr>` : ""}
        <tr><td class="lbl">Frais de notaire</td><td class="r">${fE(notaire)}</td></tr>
        <tr class="total"><td>Coût total projet</td><td class="r">${fE(investTotal)}</td></tr>
      </tbody>
    </table>
  </div>
  <div>
    <div class="section-label">Les revenus</div>
    <table class="tbl">
      <thead><tr><th>Élément</th><th class="r">Montant</th></tr></thead>
      <tbody>
        <tr><td class="lbl">Loyer HC mensuel</td><td class="r orange">${fE(loyerAnnuel / 12)}/mois</td></tr>
        ${chargesLoyer > 0 ? `<tr><td class="lbl">Charges locataire</td><td class="r">${fE(chargesLoyer)}/mois</td></tr>` : ""}
        <tr><td class="lbl">Loyer HC annuel</td><td class="r">${fE(loyerAnnuel)}</td></tr>
        ${taxeFonciere > 0 ? `<tr><td class="lbl">Taxe foncière</td><td class="r">${fE(taxeFonciere)}</td></tr>` : ""}
        ${chargesCopro > 0 ? `<tr><td class="lbl">Charges copropriété</td><td class="r">${fE(chargesCopro)}</td></tr>` : ""}
        <tr><td class="lbl">Total charges annuelles</td><td class="r">${fE(chargesAnnuelles)}</td></tr>
        ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">Assurance emprunteur</td><td class="r">${fE(assuranceEmprunteurAnnuel)}/an</td></tr>` : ""}
      </tbody>
    </table>
  </div>
</div>

<div class="section-label">Le crédit : remboursement et coût</div>
<table class="tbl">
  <thead><tr><th>Financement</th><th class="r">Montant</th><th>Traitement dans les calculs</th></tr></thead>
  <tbody>
    <tr><td class="lbl">Apport personnel</td><td class="r">${fE(apport)}</td><td style="font-size:9px;color:#1A1612">Non déduit des revenus locatifs</td></tr>
    <tr><td class="lbl">Montant emprunté</td><td class="r">${fE(montantCredit)}</td><td style="font-size:9px;color:#1A1612">Base du tableau d'amortissement</td></tr>
    <tr><td class="lbl">Taux nominal · durée</td><td class="r">${f.taux} % · ${duree} ans</td><td></td></tr>
    <tr><td class="lbl">Mensualité hors assurance</td><td class="r">${fE(mensualite)}/mois</td><td style="font-size:9px;color:#1A1612">Déduite du cash-flow mais pas fiscalement</td></tr>
    <tr><td class="lbl">Annuité de crédit</td><td class="r">${fE(creditAnnuel)}</td><td style="font-size:9px;color:#1A1612">Capital + intérêts annuels</td></tr>
    <tr><td class="lbl">Intérêts année 1</td><td class="r">${fE(interetsAnnee1)}</td><td style="font-size:9px;color:#1A1612">${isMicro ? "Non déductibles en Micro-BIC (abattement forfaitaire)" : "Déductibles des revenus locatifs"}</td></tr>
    <tr><td class="lbl">Capital remboursé année 1</td><td class="r">${fE(capitalRembourseAn1)}</td><td style="font-size:9px;color:#1A1612">Non déductible · enrichissement net</td></tr>
    ${coutTotalInteret > 0 ? `<tr><td class="lbl">Coût total estimé des intérêts</td><td class="r">${fE(coutTotalInteret)}</td><td style="font-size:9px;color:#1A1612">Sur ${duree} ans</td></tr>` : ""}
    ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">Assurance emprunteur</td><td class="r">${fE(assuranceEmprunteurAnnuel)}/an</td><td style="font-size:9px;color:#1A1612">${isMicro ? "Non déductible en Micro-BIC" : "Déductible des revenus locatifs"}</td></tr>` : ""}
  </tbody>
</table>

<div class="note">
  ${isMicro
    ? `<strong>À retenir :</strong> En <strong>Micro-BIC</strong>, un abattement forfaitaire de <strong>${isSaisonnier ? "30" : "50"} %</strong> remplace toutes les déductions (charges réelles, intérêts, amortissements). Le remboursement du capital (${fE(capitalRembourseAn1)}/an en année 1) constitue un enrichissement patrimonial : vous reconstituez votre capital tout au long du crédit.`
    : `<strong>À retenir :</strong> Seuls les <strong>intérêts d'emprunt</strong> et l'<strong>assurance emprunteur</strong> sont déductibles fiscalement. Le remboursement du capital (${fE(capitalRembourseAn1)}/an en année 1) constitue un enrichissement patrimonial : vous reconstituez votre capital tout au long du crédit.`
  }
</div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 3 — CHAPITRE 2 : RENTABILITÉ ET CASH-FLOW
═══════════════════════════════════════════════════════ -->
</div><div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">2.</span>Rentabilité et calcul du cash-flow</h2>

<table class="tbl" style="margin-bottom:14px">
  <thead><tr><th>Indicateur</th><th>Calcul</th><th class="r">Résultat</th></tr></thead>
  <tbody>
    <tr>
      <td class="lbl">Rentabilité brute sur prix d'achat</td>
      <td style="font-size:9px;color:#1A1612">${fE(loyerAnnuel)} / ${fE(prix)} × 100</td>
      <td class="r"><strong>${fP((loyerAnnuel / prix) * 100, 2)}</strong></td>
    </tr>
    <tr>
      <td class="lbl">Rentabilité brute acte en main</td>
      <td style="font-size:9px;color:#1A1612">${fE(loyerAnnuel)} / ${fE(investTotal)} × 100</td>
      <td class="r"><strong>${fP(rendementBrut, 2)}</strong></td>
    </tr>
    <tr>
      <td class="lbl">Rentabilité nette</td>
      <td style="font-size:9px;color:#1A1612">(${fE(loyerAnnuel)} − ${fE(chargesAnnuelles)}) / ${fE(investTotal)} × 100</td>
      <td class="r"><strong>${fP(rentaNetteAvFinancement, 2)}</strong></td>
    </tr>
    <tr>
      <td class="lbl">Cash-flow avant impôt</td>
      <td style="font-size:9px;color:#1A1612">Loyers − crédit − charges − ass. emprunteur</td>
      <td class="r" style="color:${cashflowAvantImpot >= 0 ? "#1A7A52" : "#B03A2A"}"><strong>${fE(cashflowAvantImpot)}/mois</strong></td>
    </tr>
    <tr>
      <td class="lbl">Cash-flow après impôt (an. 1)</td>
      <td style="font-size:9px;color:#1A1612">Cash-flow av. impôt − impôt estimé (${fE((isMicro ? impotBIC : impotReel) / 12)}/mois)</td>
      <td class="r" style="color:${(isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? "#1A7A52" : "#B03A2A"}"><strong>${fE(isMicro ? cashflowBICMensuel : cashflowReelMensuel)}/mois</strong></td>
    </tr>
  </tbody>
</table>

<div class="section-label">Comment le cash-flow est-il calculé ?</div>
<table class="tbl">
  <thead><tr><th>Flux de trésorerie</th><th class="r">Annuel</th><th class="r">Mensuel</th></tr></thead>
  <tbody>
    <tr><td class="lbl">+ Loyers encaissés (HC)</td><td class="r green">${fE(loyerAnnuel)}</td><td class="r green">${fE(loyerAnnuel / 12)}</td></tr>
    <tr><td class="lbl">− Charges propriétaire</td><td class="r red">−${fE(chargesAnnuelles)}</td><td class="r red">−${fE(chargesAnnuelles / 12)}</td></tr>
    ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">− Assurance emprunteur</td><td class="r red">−${fE(assuranceEmprunteurAnnuel)}</td><td class="r red">−${fE(assuranceEmprunteurAnnuel / 12)}</td></tr>` : ""}
    <tr><td class="lbl">− Mensualités de crédit</td><td class="r red">−${fE(creditAnnuel)}</td><td class="r red">−${fE(mensualite)}</td></tr>
    <tr><td class="lbl">− Impôt estimé (année 1)</td><td class="r red">−${fE(isMicro ? impotBIC : impotReel)}</td><td class="r red">−${fE((isMicro ? impotBIC : impotReel) / 12)}</td></tr>
    <tr class="total"><td>= Trésorerie nette</td>
      <td class="r" style="color:${(isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? "#1A7A52" : "#B03A2A"}">${fE((isMicro ? cashflowBICMensuel : cashflowReelMensuel) * 12)}</td>
      <td class="r" style="color:${(isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(isMicro ? cashflowBICMensuel : cashflowReelMensuel)}/mois</td>
    </tr>
  </tbody>
</table>

<div class="note" style="margin-top:12px">
  <strong>Bon à savoir :</strong> Un cash-flow négatif n'est pas nécessairement rédhibitoire. Il mesure la trésorerie mensuelle nette, mais votre investissement crée simultanément de la <strong>valeur patrimoniale</strong> : remboursement de capital (${fE(capitalRembourseAn1)}/an en an. 1) et potentielle valorisation du bien.${!isMicro ? " Les amortissements génèrent également une économie fiscale qui ne ressort pas dans le cash-flow mais dans la fiscalité." : ""} La rentabilité globale s'apprécie sur l'ensemble de la durée de détention.
</div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 4 — CHAPITRE 3 : FISCALITÉ
═══════════════════════════════════════════════════════ -->
</div><div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">3.</span>Fiscalité : calcul de l'impôt estimé</h2>

${isMicro ? `
<div class="section-label" style="margin-bottom:6px">Calcul fiscal – année 1 (Micro-BIC)</div>
<table class="tbl" style="margin-bottom:14px">
  <thead><tr><th>Étape</th><th class="r">Montant</th></tr></thead>
  <tbody>
    <tr><td class="lbl">Revenus locatifs annuels (HC)</td><td class="r">${fE(loyerAnnuel)}</td></tr>
    <tr><td class="lbl">− Abattement forfaitaire (${isSaisonnier ? "30" : "50"} %)</td><td class="r red">−${fE(loyerAnnuel * abattPct)}</td></tr>
    <tr class="sep"><td class="lbl">= Base imposable</td><td class="r">${fE(baseBIC)}</td></tr>
    <tr><td class="lbl">Impôt IR estimé (TMI ${tmi} %)</td><td class="r">${fE(impotBIC * (tmi / (tmi + 18.6)))}</td></tr>
    <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotBIC * (18.6 / (tmi + 18.6)))}</td></tr>
    <tr class="total"><td>= Fiscalité totale estimée</td><td class="r" style="color:${impotBIC === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotBIC)}</td></tr>
    <tr class="total"><td>Cash-flow mensuel</td><td class="r" style="color:${cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowBICMensuel)}/mois</td></tr>
  </tbody>
</table>
<div class="note">
  <strong>Comment est calculé l'impôt ?</strong> En Micro-BIC, un abattement forfaitaire de <strong>${isSaisonnier ? "30" : "50"} %</strong> est appliqué sur vos revenus. La base imposable restante est taxée au taux global TMI + PS = <strong>${(tmi + 18.6).toFixed(1)} %</strong>. Ce régime est simple mais ne permet pas de déduire les charges réelles ni les amortissements.
</div>
` : `
<div class="section-label" style="margin-bottom:6px">Calcul fiscal – année 1 (régime réel simplifié)</div>
<table class="tbl">
  <thead><tr><th>Étape</th><th class="r">Montant</th></tr></thead>
  <tbody>
    <tr><td class="lbl">Loyers imposables (HC)</td><td class="r">${fE(loyerAnnuel)}</td></tr>
    <tr><td class="lbl">− Charges annuelles déductibles</td><td class="r red">−${fE(chargesAnnuelles)}</td></tr>
    <tr><td class="lbl">− Intérêts d'emprunt</td><td class="r red">−${fE(interetsAnnee1)}</td></tr>
    ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">− Assurance emprunteur</td><td class="r red">−${fE(assuranceEmprunteurAnnuel)}</td></tr>` : ""}
    <tr class="sep"><td class="lbl">= Résultat avant amortissement</td><td class="r">${fE(resultatAvantAmort)}</td></tr>
    <tr style="background:rgba(139,26,26,0.04)"><td class="lbl" style="font-weight:700;color:#8B1A1A">− Amortissements déduits (an. 1)</td><td class="r" style="font-weight:700;color:#8B1A1A">−${fE(amortTotalAn1)}</td></tr>
    <tr class="total"><td>= Base imposable</td><td class="r" style="color:${baseImposableReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(baseImposableReel)}</td></tr>
    <tr><td class="lbl">Impôt IR estimé (TMI ${tmi} %)</td><td class="r">${fE(impotReel * (tmi / (tmi + 18.6)))}</td></tr>
    <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotReel * (18.6 / (tmi + 18.6)))}</td></tr>
    <tr class="total"><td>= Fiscalité totale estimée</td><td class="r" style="color:${impotReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotReel)}</td></tr>
  </tbody>
</table>

<div class="note" style="margin-top:14px">
  <strong>Comment est calculé l'impôt ?</strong> TMI (Tranche Marginale d'Imposition) : taux appliqué à votre dernière tranche de revenus — ici <strong>${tmi} %</strong>. Prélèvements Sociaux : <strong>18,6 %</strong> prélevés sur les revenus du patrimoine. Impôt total = base imposable × (TMI + PS) = base × <strong>${(tmi + 18.6).toFixed(1)} %</strong>.
  ${firstTaxRow ? ` En régime réel, vous commencez à payer de l'impôt à partir de l'année <strong>${firstTaxRow.year}</strong> avec une base imposable de ${fE(firstTaxRow.baseImposable)}.` : zerosYears >= totalYears ? " Sur toute la période analysée, la base imposable reste à 0 € grâce aux amortissements reportables." : ""}
</div>
`}
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 5 — CHAPITRE 4 : AMORTISSEMENT (réel uniquement)
═══════════════════════════════════════════════════════ -->
${!isMicro ? `</div><div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">4.</span>L'amortissement, expliqué simplement</h2>

<div style="font-size:10px;line-height:1.7;color:#1A1612;margin-bottom:14px">
  En LMNP au régime réel, vous pouvez <strong>déduire chaque année une fraction de la valeur du bien de vos revenus locatifs</strong> — c'est l'amortissement. Contrairement aux charges réelles, il ne s'agit pas d'une dépense effective : c'est un avantage fiscal pur. Le terrain (non dégradable) n'est jamais amortissable. Seule la fraction immobilière du bien est amortie, selon des durées reconnues par l'administration fiscale.
</div>

<table class="tbl" style="margin-bottom:6px">
  <thead><tr><th>Composant</th><th class="r">Valeur retenue</th><th class="r">Durée</th><th class="r">Amortissement annuel</th></tr></thead>
  <tbody>
    ${annexeCols.map(c => `<tr><td class="lbl">${c.label}</td><td class="r">${fE(c.initial)}</td><td class="r">${c.duree} ans</td><td class="r"><strong>${fE(c.annuel)}/an</strong></td></tr>`).join("")}
    <tr><td class="lbl" style="color:#1A1612">Terrain (non amortissable)</td><td class="r" style="color:#1A1612">${fE(terrainVal)}</td><td class="r" style="color:#1A1612">—</td><td class="r" style="color:#1A1612">0 €</td></tr>
    <tr class="total" style="background:rgba(139,26,26,0.06)"><td style="color:#8B1A1A;font-weight:700">Total amortissement annuel (an. 1)</td><td class="r">${fE(prix)}</td><td></td><td class="r" style="color:#8B1A1A;font-weight:700;font-size:12px">${fE(amortTotalAn1)}/an</td></tr>
  </tbody>
</table>

<div class="beige-note" style="margin-bottom:12px">
  <strong>Part amortissable :</strong> ${amortPct} % du prix d'achat (${fE(valeurAmortissable)}) est amortissable. Les ${100 - amortPct} % restants (${fE(terrainVal)}) représentent le terrain. En cas d'excédent d'amortissement (amortissement &gt; résultat), le surplus est <strong>reporté sans limitation de durée</strong> sur les exercices suivants.
</div>

<div class="chart-title">Amortissement théorique annuel (€/an)</div>
${makeAmortBarChart()}

<div class="note" style="margin-top:10px;font-size:9px">
  Le graphique représente l'amortissement annuel cumulé (bien + mobilier + travaux + notaire) par année fiscale. Les années sans colonne correspondent à la période post-amortissement. L'amortissement non absorbé une année est reporté gratuitement sur les années suivantes — aucune perte fiscale.
</div>
</div>` : ""}


<!-- ═══════════════════════════════════════════════════════
     PAGE 6 — CHAPITRE 5 : ÉVOLUTION DANS LE TEMPS
═══════════════════════════════════════════════════════ -->
</div><div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">5.</span>Évolution de l'investissement dans le temps</h2>

${(() => {
  if (isMicro) {
    const bicBase = loyerAnnuel * (1 - abattPct);
    const bicImpot = bicBase * (tmi / 100 + 0.186);
    return `<table class="tbl" style="margin-bottom:14px">
  <thead><tr>
    <th>Année</th>
    <th class="r">Capital restant dû</th>
    <th class="r">Intérêts</th>
    <th class="r">Base imposable BIC</th>
    <th class="r">Impôt</th>
    <th class="r">Cash-flow/mois</th>
  </tr></thead>
  <tbody>
    ${keyYears.map(yr => {
      const ro = rows.find(r => r.year === yr);
      if (!ro) return "";
      const cfBic = (loyerAnnuel - ro.creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - bicImpot) / 12;
      return `<tr>
        <td class="can">An ${yr}</td>
        <td class="r">${yr <= duree ? fE(ro.capitalDebut) : "—"}</td>
        <td class="r">${yr <= duree ? fE(ro.interetsAnnee) : "—"}</td>
        <td class="r" style="color:#B03A2A">${fE(bicBase)}</td>
        <td class="r" style="color:${bicImpot === 0 ? "#1A7A52" : "#B03A2A"}">${fE(bicImpot)}</td>
        <td class="r" style="color:${cfBic >= 0 ? "#1A7A52" : "#B03A2A"}"><strong>${fE(cfBic)}/mois</strong></td>
      </tr>`;
    }).join("")}
  </tbody>
</table>`;
  }
  return `<table class="tbl" style="margin-bottom:14px">
  <thead><tr>
    <th>Année</th>
    <th class="r">Capital restant dû</th>
    <th class="r">Intérêts</th>
    <th class="r">Amortissement</th>
    <th class="r">Base imposable</th>
    <th class="r">Impôt</th>
    <th class="r">Cash-flow/mois</th>
  </tr></thead>
  <tbody>
    ${keyYears.map(yr => {
      const ro = rows.find(r => r.year === yr);
      if (!ro) return "";
      return `<tr>
        <td class="can">An ${yr}</td>
        <td class="r">${yr <= duree ? fE(ro.capitalDebut) : "—"}</td>
        <td class="r">${yr <= duree ? fE(ro.interetsAnnee) : "—"}</td>
        <td class="r">${fE(ro.amortTotalA)}</td>
        <td class="r" style="color:${ro.baseImposable === 0 ? "#1A7A52" : "#B03A2A"}">${fE(ro.baseImposable)}</td>
        <td class="r" style="color:${ro.impot === 0 ? "#1A7A52" : "#B03A2A"}">${fE(ro.impot)}</td>
        <td class="r" style="color:${ro.cashflow >= 0 ? "#1A7A52" : "#B03A2A"}"><strong>${fE(ro.cashflow)}/mois</strong></td>
      </tr>`;
    }).join("")}
  </tbody>
</table>`;
})()}

<div class="chart-title">Capital restant dû en fin d'année (€)</div>
${makeCapitalChart()}

<div class="chart-title" style="margin-top:14px">Cash-flow mensuel après fiscalité estimée (€/mois)</div>
${makeCashflowChart()}
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 7 — CHAPITRE 6 : SCÉNARIOS DE REVENTE
═══════════════════════════════════════════════════════ -->
${(() => {
  // Abattements plus-value immobilière (particuliers LMNP)
  const abattIR = (N: number) => N < 6 ? 0 : N >= 22 ? 1 : (N - 5) * 0.06;
  const abattPS = (N: number) => {
    if (N < 6) return 0;
    if (N >= 30) return 1;
    if (N >= 22) return 0.28 + (N - 22) * 0.09;
    return (N - 5) * 0.0165;
  };

  // Amortissements cumulés au fil des ans (réintégration Loi de finances 2025 pour LMNP réel)
  const amortCumulByYear: Record<number, number> = {};
  let cumul = 0;
  for (const ro of rows) { cumul += ro.amortTotalA; amortCumulByYear[ro.year] = cumul; }

  const reventeYears = [10, 20, 35];
  const growthScenarios = [
    { label: "Valeur stable (0 %/an)", pct: 0, color: "#6B4226" },
    { label: "Revalorisation +1 %/an", pct: 0.01, color: "#2A7080" },
  ];

  const getRow = (year: number) => rows.find(ro => ro.year === year) ?? rows[rows.length - 1];

  const yearCards = reventeYears.map(yr => {
    const abIR = abattIR(yr);
    const abPS = abattPS(yr);
    const exoIRTag = abIR >= 1 ? `<span style="display:inline-block;font-size:7.5px;background:#1A7A52;color:#fff;border-radius:3px;padding:1px 5px;margin-left:6px;font-weight:600">IR exonéré</span>` : abIR > 0 ? `<span style="display:inline-block;font-size:7.5px;background:rgba(176,138,42,0.18);color:#B08A2A;border-radius:3px;padding:1px 5px;margin-left:6px">Abatt. IR ${Math.round(abIR*100)} %</span>` : "";
    const exoPSTag = abPS >= 1 ? `<span style="display:inline-block;font-size:7.5px;background:#1A7A52;color:#fff;border-radius:3px;padding:1px 5px;margin-left:4px;font-weight:600">Prél. soc. exonérés</span>` : "";
    const row = getRow(yr);
    const crd = yr <= duree ? (row?.capitalFin ?? 0) : 0;
    // Réintégration des amortissements dans l'assiette de plus-value (Loi de finances 2025 — LMNP réel)
    const amortCumul = isMicro ? 0 : (amortCumulByYear[yr] ?? amortCumulByYear[Math.max(...Object.keys(amortCumulByYear).map(Number).filter(k => k <= yr))] ?? 0);
    const scenRows = growthScenarios.map((sc, si) => {
      const prixVente = investTotal * Math.pow(1 + sc.pct, yr);
      // Plus-value brute = prix de vente − (investTotal − amortissements réintégrés)
      const pvBrute = Math.max(0, prixVente - investTotal + amortCumul);
      const taxIR = pvBrute * (1 - abattIR(yr)) * 0.19;
      const taxPS = pvBrute * (1 - abattPS(yr)) * 0.172;
      const impotTotal = taxIR + taxPS;
      const net = prixVente - crd - impotTotal;
      const netColor = net >= investTotal ? "#1A7A52" : net >= 0 ? "#B08A2A" : "#B03A2A";
      return `<tr style="background:${si === 0 ? "#F5F0E8" : "#EDE7DC"}">
        <td style="padding:7px 10px;font-size:9px;font-weight:600;color:${sc.color};border-right:1px solid rgba(26,22,18,0.08);white-space:nowrap">${sc.label}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:#1A1612;border-right:1px solid rgba(26,22,18,0.08)">${fE(prixVente)}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:${crd > 0 ? "#B03A2A" : "rgba(26,22,18,0.3)"};border-right:1px solid rgba(26,22,18,0.08)">${crd > 0 ? `−${fE(crd)}` : "—"}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:${taxIR > 0 ? "#B03A2A" : "#1A7A52"};border-right:1px solid rgba(26,22,18,0.08)">${taxIR > 0 ? `−${fE(taxIR)}` : "0 € ✓"}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:${taxPS > 0 ? "#B03A2A" : "#1A7A52"};border-right:1px solid rgba(26,22,18,0.08)">${taxPS > 0 ? `−${fE(taxPS)}` : "0 € ✓"}</td>
        <td style="padding:7px 10px;text-align:right"><span style="font-size:12px;font-weight:800;color:${netColor}">${fE(net)}</span></td>
      </tr>`;
    }).join("");
    return `<div style="margin-bottom:14px;border-radius:8px;overflow:hidden;border:0.5px solid rgba(26,22,18,0.12)">
      <div style="background:#4E1F12;padding:9px 12px;display:flex;align-items:center">
        <span style="color:#F5F0E8;font-size:12px;font-weight:700">Revente à ${yr} ans</span>
        ${exoIRTag}${exoPSTag}
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:rgba(26,22,18,0.04)">
          <th style="padding:6px 10px;font-size:8px;font-weight:500;color:#1A1612;text-align:left;border-right:1px solid rgba(26,22,18,0.08)">Scénario</th>
          <th style="padding:6px 8px;font-size:8px;font-weight:500;color:#1A1612;text-align:right;border-right:1px solid rgba(26,22,18,0.08)">Prix de vente</th>
          <th style="padding:6px 8px;font-size:8px;font-weight:500;color:#1A1612;text-align:right;border-right:1px solid rgba(26,22,18,0.08)">Crédit restant dû</th>
          <th style="padding:6px 8px;font-size:8px;font-weight:500;color:#1A1612;text-align:right;border-right:1px solid rgba(26,22,18,0.08)">Impôt sur la plus-value (IR 19 %)*</th>
          <th style="padding:6px 8px;font-size:8px;font-weight:500;color:#1A1612;text-align:right;border-right:1px solid rgba(26,22,18,0.08)">Prélèvements sociaux (17,2 %)**</th>
          <th style="padding:6px 10px;font-size:8px;font-weight:600;color:#4E1F12;text-align:right">Net dans la poche</th>
        </tr></thead>
        <tbody>${scenRows}</tbody>
      </table>
    </div>`;
  }).join("");

  return `<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">6.</span>Scénarios de revente</h2>

<div style="font-size:10px;line-height:1.7;color:#1A1612;margin-bottom:16px;background:#EDE7DC;border-radius:7px;padding:12px 14px">
  ${isMicro
    ? `<strong>Plus-value en Micro-BIC :</strong> Aucun amortissement n'est réintégré dans l'assiette de plus-value. La plus-value brute = prix de vente − prix d'acquisition initial. Les abattements pour durée de détention s'appliquent dès la 6<sup>e</sup> année — <strong>exonération Impôt sur le Revenu totale à 22 ans, Prélèvements sociaux totaux à 30 ans</strong>.`
    : `<strong>Plus-value en régime réel (Loi de finances 2025) :</strong> Depuis 2025, les amortissements déduits fiscalement sont <strong>réintégrés</strong> dans le calcul de la plus-value imposable. La plus-value brute = prix de vente − (prix d'acquisition − amortissements cumulés déduits). Les abattements pour durée de détention s'appliquent dès la 6<sup>e</sup> année — <strong>exonération Impôt sur le Revenu totale à 22 ans, Prélèvements sociaux totaux à 30 ans</strong>.`
  }
</div>

${yearCards}

<div style="font-size:9px;color:#1A1612;line-height:1.7;margin-bottom:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
  <div style="background:#EDE7DC;border-radius:6px;padding:9px 11px">
    <div style="font-weight:700;color:#4E1F12;margin-bottom:4px">* Impôt sur le Revenu — plus-value immobilière (taux fixe : 19 %)</div>
    <div>Ans 1–5 : 0 %</div>
    <div>Ans 6–21 : 6 % d'abattement par an (max 96 %)</div>
    <div>An 22 : + 4 % → <strong>100 % exonéré</strong></div>
  </div>
  <div style="background:#EDE7DC;border-radius:6px;padding:9px 11px">
    <div style="font-weight:700;color:#4E1F12;margin-bottom:4px">** Prélèvements sociaux — plus-value immobilière (taux : 17,2 %)</div>
    <div>Ans 1–5 : 0 %</div>
    <div>Ans 6–21 : 1,65 % d'abattement par an · An 22 : 1,6 %</div>
    <div>Ans 23–30 : 9 % par an → <strong>100 % exonéré à 30 ans</strong></div>
  </div>
</div>

<div class="beige-note">
  <strong>Hypothèses.</strong> Base d'acquisition : ${fE(investTotal)} (bien + travaux + notaire).${!isMicro ? ` Amortissements cumulés réintégrés (Loi de finances 2025).` : ""} La revalorisation s'applique uniformément. Le crédit restant dû est déduit si la revente intervient avant la fin du crédit (${duree} ans). Simulation indicative — consulter un expert-comptable LMNP.
</div>
</div>`;
})()}


<!-- ═══════════════════════════════════════════════════════
     ANNEXE A — PROJECTION DÉTAILLÉE (réel uniquement)
═══════════════════════════════════════════════════════ -->
<div class="page landscape">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch">Annexe A — Projection détaillée sur ${totalYears} ans</h2>
<p style="font-size:9px;color:#1A1612;margin-bottom:8px">${isMicro ? `Micro-BIC · Abattement ${isSaisonnier ? "30" : "50"} % constant · Loyers et charges supposés constants` : "Régime réel simplifié · Loyers et charges constants · Amortissement variable selon les durées"}</p>

${isMicro ? (() => {
  const bicBase = loyerAnnuel * (1 - abattPct);
  const bicImpot = bicBase * (tmi / 100 + 0.186);
  return `<table class="tbl">
  <thead><tr>
    <th class="can">An</th>
    <th class="r" style="font-size:8.5px">Capital restant dû</th>
    <th class="r" style="font-size:8.5px">Annuité</th>
    <th class="r" style="font-size:8.5px">Intérêts</th>
    <th class="r" style="font-size:8.5px">Capital remb.</th>
    <th class="r" style="font-size:8.5px">Charges</th>
    <th class="r" style="font-size:8.5px">Base impos. BIC</th>
    <th class="r" style="font-size:8.5px">Impôt</th>
    <th class="r" style="font-size:8.5px">CF/mois</th>
  </tr></thead>
  <tbody>
    ${rows.map(ro => {
      const cfBic = (loyerAnnuel - ro.creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - bicImpot) / 12;
      return `<tr>
        <td class="can" style="font-size:9px">${ro.year}</td>
        <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.capitalFin) : "—"}</td>
        <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.creditAnnuelR) : "—"}</td>
        <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.interetsAnnee) : "—"}</td>
        <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.capitalRembourse) : "—"}</td>
        <td class="r" style="font-size:9px">${fE(chargesAnnuelles)}</td>
        <td class="r" style="font-size:9px;color:#B03A2A">${fE(bicBase)}</td>
        <td class="r" style="font-size:9px;color:${bicImpot === 0 ? "#1A7A52" : "#B03A2A"}">${fE(bicImpot)}</td>
        <td class="r" style="font-size:9px;color:${cfBic >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fE(cfBic)}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>`;
})() : `<table class="tbl">
  <thead><tr>
    <th class="can">An</th>
    <th class="r" style="font-size:8.5px">Capital restant dû</th>
    <th class="r" style="font-size:8.5px">Annuité</th>
    <th class="r" style="font-size:8.5px">Intérêts</th>
    <th class="r" style="font-size:8.5px">Capital remb.</th>
    <th class="r" style="font-size:8.5px">Charges</th>
    <th class="r" style="font-size:8.5px">Résultat av. amort.</th>
    <th class="r" style="font-size:8.5px">Amort. déduit</th>
    <th class="r" style="font-size:8.5px">Base impos.</th>
    <th class="r" style="font-size:8.5px">Impôt</th>
    <th class="r" style="font-size:8.5px">CF/mois</th>
  </tr></thead>
  <tbody>
    ${rows.map(ro => `<tr>
      <td class="can" style="font-size:9px">${ro.year}</td>
      <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.capitalFin) : "—"}</td>
      <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.creditAnnuelR) : "—"}</td>
      <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.interetsAnnee) : "—"}</td>
      <td class="r" style="font-size:9px">${ro.year <= duree ? fE(ro.capitalRembourse) : "—"}</td>
      <td class="r" style="font-size:9px">${fE(chargesAnnuelles)}</td>
      <td class="r" style="font-size:9px">${fE(ro.resultatAvantAmort)}</td>
      <td class="r" style="font-size:9px;font-weight:600">${fE(ro.amortDisponible)}${ro.reportNplus1 > 0 ? `<div style="font-size:7.5px;color:#B08A2A">→ N+1: ${fE(ro.reportNplus1)}</div>` : ""}</td>
      <td class="r" style="font-size:9px;color:${ro.baseImposable === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fE(ro.baseImposable)}</td>
      <td class="r" style="font-size:9px;color:${ro.impot === 0 ? "#1A7A52" : "#B03A2A"}">${fE(ro.impot)}</td>
      <td class="r" style="font-size:9px;color:${ro.cashflow >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fE(ro.cashflow)}</td>
    </tr>`).join("")}
  </tbody>
</table>`}
</div>


<!-- ═══════════════════════════════════════════════════════
     ANNEXE B — AMORTISSEMENT DÉTAILLÉ (réel uniquement)
═══════════════════════════════════════════════════════ -->
${!isMicro && annexeCols.length > 0 ? `<div class="page landscape">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch">Annexe B — Amortissement détaillé par composant</h2>

<table class="tbl" style="font-size:${afs}px">
  <thead>
    <tr>
      <th class="can" rowspan="2" style="font-size:8.5px">An</th>
      ${annexeBHeaderCols}
      <th rowspan="2" style="background:#C95B2A;color:#1A1612;font-size:8.5px;text-align:center;padding:5px">Total<br>/an</th>
    </tr>
    <tr>${annexeBHeaderSub}</tr>
  </thead>
  <tbody>${annexeBRows}</tbody>
</table>

<div class="beige-note" style="margin-top:12px">
  <strong>Récapitulatif des composants :</strong>
  <table class="tbl" style="margin-top:8px">
    <thead><tr><th>Composant</th><th class="r">Valeur initiale</th><th class="r">Durée</th><th class="r">Dotation annuelle</th></tr></thead>
    <tbody>
      ${annexeCols.map(c => `<tr><td class="lbl">${c.label}</td><td class="r">${fE(c.initial)}</td><td class="r">${c.duree} ans</td><td class="r"><strong>${fE(c.annuel)}</strong></td></tr>`).join("")}
      <tr class="total"><td>Total an. 1</td><td class="r">${fE(annexeCols.reduce((s, c) => s + c.initial, 0))}</td><td></td><td class="r">${fE(amortTotalAn1)}</td></tr>
    </tbody>
  </table>
</div>
</div>` : ""}

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
    type Proj = { year: number; interets: number; capital: number; capCumul: number; amort: number; impot: number; cfAnnuel: number; capRestant: number };
    const allYears: Proj[] = [];
    let cap = montantCredit;
    let capCumul = 0;
    for (let yr = 1; yr <= Math.max(duree + 5, 35); yr++) {
      let intY = 0; let capY = 0;
      for (let m = 1; m <= 12; m++) {
        if (yr > duree) break;
        const intM = cap * r;
        const capM = Math.max(0, M - intM);
        intY += intM; capY += capM;
        cap = Math.max(0, cap - capM);
      }
      capCumul += capY;
      const amortBY = yr <= amortDureeEnsemble ? amortBienAn : 0;
      const amortMY = amortDureeMobilier > 0 && yr <= amortDureeMobilier ? amortMobilierAn : 0;
      const amortTY = amortDureeTravaux > 0 && yr <= amortDureeTravaux ? amortTravauxAn : 0;
      const amortNY = amortDureeNotaire > 0 && yr <= amortDureeNotaire ? amortNotaireAn : 0;
      const amortY = amortBY + amortMY + amortTY + amortNY;

      const creditAn = yr <= duree ? creditTotalAnnuel : 0;
      const chargesD = chargesAnnuelles + intY + assuranceEmprunteurAnnuel;
      const baseR = Math.max(0, recettesAnnuelles - chargesD - amortY);
      const impR = baseR * (tmi / 100 + 0.186);
      const impB = baseBIC * (tmi / 100 + 0.186);
      const imp = isMicro ? impB : impR;
      const cf = recettesAnnuelles - creditAn - chargesAnnuelles - imp;

      allYears.push({ year: yr, interets: intY, capital: capY, capCumul, amort: amortY, impot: imp, cfAnnuel: cf, capRestant: cap });
    }

    const getYear = (y: number) => allYears.find(rr => rr.year === y) || allYears[allYears.length - 1];

    // Table years
    const tableYearsSet = new Set([1, 3, 5, 10, 15, 20, duree, duree + 5].filter(y => y >= 1));
    const TABLE_YEARS = Array.from(tableYearsSet).sort((a, b) => a - b);

    // ── Stacked bar pair (FIXED: right col uses full creditTotalAnnuel so both cols balance) ──
    const makeStackedBarPair = (): string => {
      const H = 190;
      const colW = 92;
      const gap = 5;                    // colonnes quasi collées
      const barsW = colW * 2 + gap;
      const annotW = 104;               // zone des flèches d'annotation
      const W = barsW + annotW;

      const buildColData = (yr: number) => {
        const row = getYear(yr);
        const creditAn = yr <= duree ? creditTotalAnnuel : 0; // capital + intérêts + assu
        const chargesVal = chargesAnnuelles;
        const impotVal = row.impot;
        const revenuVal = recettesAnnuelles;
        // CF = revenus - charges - creditAn - impôt  (now balances perfectly)
        const cfCash = revenuVal - chargesVal - creditAn - impotVal;
        return { chargesVal, creditAn, impotVal, revenuVal, cfCash };
      };

      const anneeApres = duree + 1;     // fin d'emprunt + 1 : plus aucune mensualité
      const c1 = buildColData(1);
      const c2 = buildColData(anneeApres);

      // Scale: both columns reach exactly H
      const maxRef = Math.max(
        c1.revenuVal + Math.max(0, -c1.cfCash),
        c2.revenuVal + Math.max(0, -c2.cfCash),
        1
      );
      const scale = H / maxRef;

      const renderSvg = (c: typeof c1, uid: string) => {
        const revH = c.revenuVal * scale;
        const chH = c.chargesVal * scale;
        const crH = c.creditAn * scale;
        const imH = c.impotVal * scale;
        const cfH = Math.abs(c.cfCash) * scale;
        const cfPos = c.cfCash >= 0;

        const leftTop = H - revH;
        const imY = H - imH;
        const crY = imY - crH;
        const chY = crY - chH;
        const rightH = chH + crH + imH;
        const rightTop = H - rightH;

        const fs = 10;
        const fsLbl = 8;
        const xR = colW + gap;          // x de la colonne de droite
        const cxL = colW / 2;
        const cxR = xR + colW / 2;

        // Segments trop petits pour porter un texte → annotés par une flèche
        const annots: { y: number; ty: number; side: "L" | "R"; label: string; val: string; color: string }[] = [];
        const MIN_H = 16;               // en dessous, on annote à l'extérieur

        const pushAnnot = (y: number, side: "L" | "R", label: string, val: string, color: string) => {
          annots.push({ y, ty: y, side, label, val, color });
        };

        const leftCol = `<rect x="0" y="${leftTop}" width="${colW}" height="${Math.max(revH, 2)}" fill="#1A6644" rx="3"/>
${revH > 35 ? `<text x="${cxL}" y="${leftTop + revH/2 - 7}" text-anchor="middle" font-size="${fsLbl}" fill="rgba(255,255,255,0.7)" font-weight="600">Loyers</text><text x="${cxL}" y="${leftTop + revH/2 + 9}" text-anchor="middle" font-size="${fs + 1}" fill="#fff" font-weight="700">${fE(c.revenuVal)}</text>` : revH > MIN_H ? `<text x="${cxL}" y="${leftTop + revH/2 + 4}" text-anchor="middle" font-size="${fs}" fill="#fff" font-weight="700">${fE(c.revenuVal)}</text>` : ""}`;
        if (revH <= MIN_H && c.revenuVal > 0) pushAnnot(leftTop + revH / 2, "L", "Loyers", fE(c.revenuVal), "#1A6644");

        const seg = (y: number, h: number, fill: string, rx: number, label: string, val: string, txtCol: string, lblCol: string, annotCol: string) => {
          const rect = `<rect x="${xR}" y="${y}" width="${colW}" height="${Math.max(h, 2)}" fill="${fill}" rx="${rx}"/>`;
          if (h > 30) return rect + `<text x="${cxR}" y="${y+h/2-6}" text-anchor="middle" font-size="${fsLbl}" fill="${lblCol}">${label}</text><text x="${cxR}" y="${y+h/2+8}" text-anchor="middle" font-size="${fs}" fill="${txtCol}" font-weight="700">${val}</text>`;
          if (h > MIN_H) return rect + `<text x="${cxR}" y="${y+h/2+4}" text-anchor="middle" font-size="${fs-1}" fill="${txtCol}" font-weight="700">${val}</text>`;
          pushAnnot(y + h / 2, "R", label, val, annotCol);
          return rect;
        };

        const rightCol = [
          c.chargesVal > 0 ? seg(chY, chH, "#8B5A3A", 1, "Charges", fE(c.chargesVal), "#fff", "rgba(255,255,255,0.75)", "#8B5A3A") : "",
          c.creditAn > 0 ? seg(crY, crH, "#4E1F12", 1, "Crédit", fE(c.creditAn), "#F5F0E8", "rgba(245,240,232,0.75)", "#4E1F12") : "",
          c.impotVal > 0 ? seg(imY, imH, "#2C0F08", 1, "Impôt", fE(c.impotVal), "#F5A623", "rgba(245,166,35,0.85)", "#8A5A12") : "",
        ].join("");

        let cfBlock = "";
        if (cfPos && cfH > 1) {
          const cfY = rightTop - cfH;
          cfBlock = `<rect x="${xR}" y="${cfY}" width="${colW}" height="${Math.max(cfH,2)}" fill="#1A7A52" rx="3"/>`;
          if (cfH > 30) cfBlock += `<text x="${cxR}" y="${cfY+cfH/2-6}" text-anchor="middle" font-size="${fsLbl}" fill="rgba(255,255,255,0.75)">Cash-flow</text><text x="${cxR}" y="${cfY+cfH/2+8}" text-anchor="middle" font-size="${fs}" fill="#fff" font-weight="700">+${fE(c.cfCash)}</text>`;
          else if (cfH > MIN_H) cfBlock += `<text x="${cxR}" y="${cfY+cfH/2+4}" text-anchor="middle" font-size="${fs-1}" fill="#fff" font-weight="700">+${fE(c.cfCash)}</text>`;
          else pushAnnot(cfY + cfH / 2, "R", "Cash-flow", `+${fE(c.cfCash)}`, "#1A7A52");
        } else if (!cfPos && cfH > 1) {
          const cfY = leftTop - cfH;
          cfBlock = `<rect x="0" y="${cfY}" width="${colW}" height="${Math.max(cfH,2)}" fill="#B03A2A" rx="3"/>`;
          if (cfH > 30) cfBlock += `<text x="${cxL}" y="${cfY+cfH/2-6}" text-anchor="middle" font-size="${fsLbl}" fill="rgba(255,255,255,0.75)">Effort</text><text x="${cxL}" y="${cfY+cfH/2+8}" text-anchor="middle" font-size="${fs}" fill="#fff" font-weight="700">${fE(c.cfCash)}</text>`;
          else if (cfH > MIN_H) cfBlock += `<text x="${cxL}" y="${cfY+cfH/2+4}" text-anchor="middle" font-size="${fs-1}" fill="#fff" font-weight="700">${fE(c.cfCash)}</text>`;
          else pushAnnot(cfY + cfH / 2, "L", "Effort", fE(c.cfCash), "#B03A2A");
        }

        // Répartition verticale des annotations pour qu'elles ne se chevauchent pas
        annots.sort((a, b) => a.y - b.y);
        let lastY = -5;  // → la 1re annotation ne peut pas remonter au-dessus de y=7 (texte tronqué)
        annots.forEach(a => { a.ty = Math.max(a.y, lastY + 12); lastY = a.ty; });
        const overflow = annots.length ? Math.max(0, annots[annots.length - 1].ty - H) : 0;

        const annotHtml = annots.map(a => {
          const fromX = a.side === "L" ? colW : xR + colW;
          return `<polyline points="${fromX},${a.y} ${barsW + 10},${a.ty} ${barsW + 14},${a.ty}" fill="none" stroke="${a.color}" stroke-width="0.9" marker-start="url(#ah-${uid})"/>
<text x="${barsW + 18}" y="${a.ty + 2.6}" font-size="7.5" fill="rgba(26,22,18,0.6)">${a.label} <tspan font-weight="700" fill="${a.color}">${a.val}</tspan></text>`;
        }).join("");

        const defs = annots.length
          ? `<defs><marker id="ah-${uid}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="6,0 0,3 6,6" fill="rgba(26,22,18,0.55)"/></marker></defs>`
          : "";

        const lblLeft = `<text x="${cxL}" y="${H + 13}" text-anchor="middle" font-size="7.5" fill="rgba(26,22,18,0.5)">Loyers</text>`;
        const lblRight = `<text x="${cxR}" y="${H + 13}" text-anchor="middle" font-size="7.5" fill="rgba(26,22,18,0.5)">Sorties</text>`;

        return `<svg width="${W}" height="${H + 18 + overflow}" viewBox="0 0 ${W} ${H + 18 + overflow}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%">${defs}${leftCol}${rightCol}${cfBlock}${annotHtml}${lblLeft}${lblRight}</svg>`;
      };

      // Titre d'année : au-dessus du graphe, en gros et en orange
      const yearTitle = (txt: string, sub: string) => `<div style="margin-bottom:5px">
  <div style="font-size:17px;font-weight:700;color:#C95B2A;letter-spacing:-.01em;line-height:1.1">${txt}</div>
  <div style="font-size:7.5px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.42);margin-top:1px">${sub}</div>
</div>`;

      // Commentaires à droite de chaque graphe
      const deltaCf = c2.cfCash - c1.cfCash;
      const deltaImpot = c2.impotVal - c1.impotVal;
      const note = (txt: string) => `<div style="font-size:8px;line-height:1.6;color:rgba(26,22,18,0.62);margin-bottom:5px">${txt}</div>`;

      const comm1 = `${note(`Sur l'année 1, la <strong>mensualité de crédit</strong> (${fE(c1.creditAn)}/an, assurance comprise) absorbe l'essentiel de vos loyers. C'est le poste qui pèse le plus lourd dans votre trésorerie.`)}
${note(c1.cfCash >= 0
  ? `Votre cash-flow est déjà positif à <strong style="color:#1A7A52">+${fE(c1.cfCash)}/an</strong>, soit ${fE(c1.cfCash / 12)}/mois : le bien s'autofinance dès la première année.`
  : `Il vous reste un effort d'épargne de <strong style="color:#B03A2A">${fE(Math.abs(c1.cfCash))}/an</strong>, soit ${fE(Math.abs(c1.cfCash) / 12)}/mois. En contrepartie, vous remboursez du capital chaque mois : cet effort se transforme en patrimoine.`)}
${!isMicro ? note(`L'<strong>amortissement</strong> (${fE(amortTotalAn1)}/an) n'apparaît pas dans ce graphique : ce n'est pas une sortie d'argent. Il réduit l'impôt sans toucher à votre trésorerie.`) : note(`Au Micro-BIC, aucun amortissement ne vient réduire l'impôt : seul l'abattement de ${isSaisonnier ? "30" : "50"} % s'applique.`)}`;

      const comm2 = `${note(`À partir de l'année ${anneeApres}, <strong>le crédit est intégralement remboursé</strong>. Les ${fE(c1.creditAn)}/an de mensualités disparaissent du graphique : c'est le basculement de tout le projet.`)}
${note(`Votre cash-flow passe de ${c1.cfCash >= 0 ? "+" : ""}${fE(c1.cfCash)} à <strong style="color:#1A7A52">+${fE(c2.cfCash)}/an</strong>, soit <strong>${fE(c2.cfCash / 12)}/mois</strong>${deltaCf > 0 ? ` — un gain de ${fE(deltaCf)}/an` : ""}.`)}
${note(deltaImpot > 0
  ? `En contrepartie, l'impôt augmente (${fE(c1.impotVal)} → <strong style="color:#C95B2A">${fE(c2.impotVal)}/an</strong>) : les intérêts d'emprunt ne sont plus déductibles${!isMicro ? ` et les amortissements s'épuisent progressivement` : ""}. La hausse reste sans commune mesure avec la mensualité économisée.`
  : `L'impôt reste stable à ${fE(c2.impotVal)}/an${!isMicro ? `, les amortissements continuant de couvrir la base imposable` : ""}.`)}
${note(`Hypothèse prudente : loyers et charges constants, sans revalorisation. Toute hausse de loyer améliorerait encore ce résultat.`)}`;

      const bloc = (title: string, sub: string, svg: string, comm: string) => `<div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:12px">
  <div style="flex:0 0 auto">${yearTitle(title, sub)}${svg}</div>
  <div style="flex:1;min-width:0;padding-top:24px">${comm}</div>
</div>`;

      return `${bloc("Année 1", "Démarrage · crédit en cours", renderSvg(c1, "y1"), comm1)}
<div style="height:1px;background:rgba(26,22,18,0.12);margin:0 0 12px"></div>
${bloc(`Année ${anneeApres}`, "Fin d'emprunt + 1 · sans mensualité", renderSvg(c2, "y2"), comm2)}`;
    };

    // ── Impôt line graph ──────────────────────────────────────────────────────
    const makeImpotGraph = (): string => {
      const gW = 500; const gH = 65;
      const pts = allYears.filter(rr => rr.year <= duree + 5);
      const maxImpot = Math.max(...pts.map(p => p.impot), 1);
      const minImpot = Math.min(...pts.map(p => p.impot), 0);
      const range = maxImpot - minImpot || 1;

      const toX = (yr: number) => Math.round((yr - 1) / (pts[pts.length - 1].year - 1) * (gW - 20)) + 10;
      const toY = (v: number) => Math.round(gH - ((v - minImpot) / range) * (gH - 8)) - 4;

      const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.year)},${toY(p.impot)}`).join(" ");

      // Label a few key points
      const labelYears = new Set([1, Math.round(duree / 2), duree, duree + 5].filter(y => y >= 1 && y <= pts[pts.length - 1].year));
      const labels = pts
        .filter(p => labelYears.has(p.year))
        .map(p => `<text x="${toX(p.year)}" y="${toY(p.impot) - 5}" text-anchor="middle" font-size="7" fill="#4E1F12" font-weight="600">${fE(p.impot)}</text><circle cx="${toX(p.year)}" cy="${toY(p.impot)}" r="3" fill="#C95B2A"/>`)
        .join("");

      return `<svg width="${gW}" height="${gH + 20}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${gW}px">
  <path d="${pathD}" fill="none" stroke="#4E1F12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${pathD} L${toX(pts[pts.length-1].year)},${gH+4} L${toX(pts[0].year)},${gH+4} Z" fill="rgba(78,31,18,0.07)"/>
  ${labels}
  <text x="10" y="${gH+17}" font-size="7" fill="rgba(26,22,18,0.4)">An 1</text>
  <text x="${gW - 10}" y="${gH+17}" font-size="7" fill="rgba(26,22,18,0.4)" text-anchor="end">An ${pts[pts.length-1].year}</text>
</svg>`;
    };

    // ── Abattements PV ────────────────────────────────────────────────────────
    const abattIR = (N: number) => N < 6 ? 0 : N >= 22 ? 1 : (N - 5) * 0.06;
    const abattPS = (N: number) => { if (N < 6) return 0; if (N >= 30) return 1; if (N >= 22) return 0.28 + (N - 22) * 0.09; return (N - 5) * 0.0165; };

    // ── Conclusion ────────────────────────────────────────────────────────────
    const dureeY = duree;
    const sumLoyers = allYears.filter(rr => rr.year <= dureeY).length * loyerAnnuel;
    const sumImpot = allYears.filter(rr => rr.year <= dureeY).reduce((s, rr) => s + rr.impot, 0);
    const sumCF = allYears.filter(rr => rr.year <= dureeY).reduce((s, rr) => s + rr.cfAnnuel, 0);
    const amortCumulFinal = Math.min(dureeY, amortDureeEnsemble) * amortBienAn
      + Math.min(dureeY, amortDureeMobilier) * amortMobilierAn
      + Math.min(dureeY, amortDureeTravaux) * amortTravauxAn
      + Math.min(dureeY, amortDureeNotaire) * amortNotaireAn;
    const amortImmoFinal = Math.min(dureeY, amortDureeEnsemble) * amortBienAn;

    const pvBrute = isMicro ? 0 : amortImmoFinal;
    const abIR = abattIR(dureeY);
    const abPS = abattPS(dureeY);
    const impotPV = pvBrute * (1 - abIR) * 0.19 + pvBrute * (1 - abPS) * 0.186;
    const netRevente = prix - impotPV;

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
      : `Déduction de toutes les charges réelles · amortissement du bien sur ${amortDureeEnsemble} ans · déficit reportable sans limite`;

    const stackedBarPairHtml = makeStackedBarPair();
    const impotGraphHtml = makeImpotGraph();

    // ── CSS ───────────────────────────────────────────────────────────────────
    const css = `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#D0C9BC;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;font-size:10px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;background:#F5F0E8;margin:14px auto;padding:11mm 13mm 16mm;position:relative;page-break-after:always;box-shadow:0 3px 24px rgba(0,0,0,0.22)}
.page:last-child{page-break-after:avoid}
.no-print{position:sticky;top:0;z-index:100;background:#1A4A35;padding:10px 20px;display:flex;align-items:center;justify-content:space-between}
.hdr{background:#4E1F12;border-radius:10px;padding:12px 16px;margin-bottom:10px;display:flex;align-items:flex-start;justify-content:space-between}
.sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#C95B2A;text-align:center;margin-top:26px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid rgba(201,91,42,0.35)}
.sec.first{margin-top:2px}
.cards{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px}
.card{flex:1;min-width:0;background:#EDE7DC;border-radius:7px;padding:7px 9px}
.card.hl{background:rgba(201,91,42,0.10);border:1px solid rgba(201,91,42,0.22)}
.card.green{background:rgba(26,102,68,0.08);border:1px solid rgba(26,102,68,0.2)}
.card.red{background:rgba(176,58,42,0.08);border:1px solid rgba(176,58,42,0.22)}
.card-lbl{font-size:7px;text-transform:uppercase;letter-spacing:.09em;color:rgba(26,22,18,0.42);margin-bottom:2px}
.card-val{font-size:12px;font-weight:300;letter-spacing:-.02em;color:#1A1612}
.card-val.lg{font-size:15px}
.card-val.orange{color:#C95B2A}
.card-val.green{color:#1A6644}
.card-val.red{color:#B03A2A}
.card-sub{font-size:7px;color:rgba(26,22,18,0.4);margin-top:1px}
.sub-hdr{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.5);padding:4px 8px;background:rgba(26,22,18,0.05);border-radius:4px 4px 0 0;margin-bottom:4px}
.compare-wrap{display:grid;grid-template-columns:1fr 20px 1fr;gap:0;margin-bottom:6px}
.compare-col{background:#EDE7DC;border-radius:7px;padding:8px 10px}
.compare-col.chosen{border:2px solid ${regimeColor};background:${isMicro ? "rgba(42,92,138,0.06)" : "rgba(26,102,68,0.06)"}}
.vs-sep{display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#C95B2A}
.cmp-hdr{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${regimeColor};margin-bottom:5px;text-align:center}
.cmp-hdr.inactive{color:rgba(26,22,18,0.35)}
.cmp-row{display:flex;justify-content:space-between;font-size:8.5px;padding:2px 0;border-bottom:.5px solid rgba(26,22,18,0.07)}
.cmp-row:last-child{border-bottom:none;padding-top:4px}
.cmp-lbl{color:rgba(26,22,18,0.5)}
.cmp-val{font-weight:600;color:#1A1612}
.cmp-amort{font-weight:700;color:#C95B2A}
.regime-band{background:${regimeColor};border-radius:8px;padding:8px 12px;margin-top:6px}
.ftr{position:absolute;bottom:11mm;left:13mm;right:13mm;display:flex;justify-content:space-between;align-items:center;font-size:7.5px;color:rgba(26,22,18,0.32);border-top:.5px solid rgba(26,22,18,0.1);padding-top:5px}
table.tbl{width:100%;border-collapse:collapse;font-size:8.5px}
table.tbl th{background:#4E1F12;color:#F5F0E8;padding:5px 5px;text-align:left;font-weight:500;font-size:8px}
table.tbl td{padding:4px 5px;border-bottom:.5px solid rgba(26,22,18,0.07);font-size:8.5px}
table.tbl tr:nth-child(even) td{background:rgba(26,22,18,0.025)}
table.tbl .r{text-align:right}
table.tbl .pos{color:#1A7A52;font-weight:600}
table.tbl .neg{color:#8B1A1A;font-weight:600}
table.tbl .grp{border-left:1.5px solid rgba(201,91,42,0.5);border-right:1.5px solid rgba(201,91,42,0.5)}
.concl-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:9px}
.concl-card{background:#EDE7DC;border-radius:8px;padding:10px 12px}
.concl-lbl{font-size:7px;text-transform:uppercase;letter-spacing:.09em;color:rgba(26,22,18,0.4);margin-bottom:3px}
.concl-val{font-size:15px;font-weight:300;letter-spacing:-.02em;color:#1A1612}
.concl-sub{font-size:7px;color:rgba(26,22,18,0.42);margin-top:1px}
.revente-box{background:#4E1F12;border-radius:9px;padding:11px 14px;color:#F5F0E8}
@media print{
  html,body{background:#F5F0E8;padding:0;margin:0}
  .no-print{display:none}
  .page{margin:0;box-shadow:none;min-height:297mm;background:#F5F0E8}
  .page:last-child{page-break-after:avoid}
}`;

    // Fiscal section (replaces amort)
    const fiscalSection = !isMicro ? `
  <div class="sec">Fiscalité · Détail année 1</div>
  <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:6px">
    <!-- Tableau fiscal -->
    <div style="flex:1.2;background:#EDE7DC;border-radius:8px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:8.5px">
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
      <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#2A5C8A;margin-bottom:2px;text-align:center">Détail amortissement</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Bien (${amortPct}% · ${amortDureeEnsemble} ans)</div>
          <div style="font-size:11px;font-weight:600;color:#2A5C8A">${fE(amortBienAn)}/an</div>
        </div>
        ${mobilier > 0 ? `<div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Mobilier (${amortDureeMobilier} ans)</div>
          <div style="font-size:11px;font-weight:600;color:#2A5C8A">${fE(amortMobilierAn)}/an</div>
        </div>` : "<div></div>"}
        ${travaux > 0 ? `<div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Travaux (${amortDureeTravaux} ans)</div>
          <div style="font-size:11px;font-weight:600;color:#2A5C8A">${fE(amortTravauxAn)}/an</div>
        </div>` : "<div></div>"}
        ${notaire > 0 ? `<div style="background:rgba(42,92,138,0.07);border:1px solid rgba(42,92,138,0.2);border-radius:6px;padding:6px 8px">
          <div style="font-size:6.5px;text-transform:uppercase;letter-spacing:.08em;color:rgba(42,92,138,0.7);margin-bottom:2px">Notaire (${amortDureeNotaire} ans)</div>
          <div style="font-size:11px;font-weight:600;color:#2A5C8A">${fE(amortNotaireAn)}/an</div>
        </div>` : "<div></div>"}
      </div>
      <div style="text-align:center;padding:4px 0;font-size:8.5px;color:#2A5C8A;font-weight:700;border-top:1.5px solid rgba(42,92,138,0.25);margin-top:2px">Total amort. = ${fE(amortTotalAn1)}/an</div>
    </div>
  </div>
  <!-- Lecture du tableau -->
  <div style="background:rgba(26,102,68,0.06);border-left:2.5px solid #1A6644;border-radius:0 6px 6px 0;padding:7px 10px;margin-bottom:6px">
    <div style="font-size:8.5px;line-height:1.65;color:rgba(26,22,18,0.75)">
      Au régime réel, l'ensemble de vos charges — charges d'exploitation, intérêts d'emprunt et assurance emprunteur — vient en déduction de vos recettes, soit <strong style="color:#8B1A1A">${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)}</strong> déduits la première année. Votre base imposable descend d'autant.
    </div>
    <div style="font-size:8.5px;line-height:1.65;color:rgba(26,22,18,0.75);margin-top:5px">
      S'y ajoute l'<strong style="color:#2A5C8A">${amortLabel}</strong> : <strong style="color:#2A5C8A">${fE(amortTotalAn1)}</strong> supplémentaires viennent réduire l'assiette de l'impôt, sans aucune sortie de trésorerie. Votre base imposable tombe ainsi à <strong>${fE(baseImposableReel)}</strong>, ce qui porte votre impôt et prélèvements sociaux à <strong style="color:#C95B2A">${fE(impotReel)}</strong> pour l'année 1${impotReel > 0 ? `, soit ${fE(impotReel / 12)}/mois` : ""}.
    </div>
  </div>
  <!-- Graphe évolution impôt -->
  <div style="background:#EDE7DC;border-radius:7px;padding:8px 10px;margin-bottom:6px">
    <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.4);margin-bottom:5px">Évolution de l'impôt sur la durée du prêt</div>
    ${impotGraphHtml}
    <div style="font-size:7.5px;color:rgba(26,22,18,0.5);margin-top:4px">L'impôt augmente progressivement à mesure que les amortissements et intérêts diminuent.</div>
  </div>` : `
  <div class="sec">Fiscalité · Détail année 1</div>
  <div style="background:#EDE7DC;border-radius:8px;padding:8px 10px;margin-bottom:6px">
    <table style="width:100%;border-collapse:collapse;font-size:8.5px">
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
    <div style="font-size:8.5px;line-height:1.65;color:rgba(26,22,18,0.75)">
      Au Micro-BIC, vos charges réelles ne viennent pas en déduction de votre base imposable : ni vos charges d'exploitation, ni vos intérêts d'emprunt, ni aucun amortissement. Elles sont remplacées par un <strong>abattement forfaitaire de ${isSaisonnier ? "30" : "50"} %</strong> appliqué sur vos recettes, soit <strong style="color:#8B1A1A">${fE(recettesAnnuelles * abattPct)}</strong>, quel que soit le montant réellement dépensé (${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)} dans votre cas).
    </div>
    <div style="font-size:8.5px;line-height:1.65;color:rgba(26,22,18,0.75);margin-top:5px">
      Votre base imposable s'établit donc à <strong>${fE(baseBIC)}</strong>, ce qui porte votre impôt et prélèvements sociaux à <strong style="color:#C95B2A">${fE(impotBIC)}</strong> pour l'année 1, soit <strong style="color:#C95B2A">${fE(impotBIC / 12)}/mois</strong>.
    </div>
  </div>`;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport Invest – toutlmnp</title>
<style>${css}</style></head><body>

<div class="no-print">
  <span style="color:#F5F0E8;font-size:13px;font-weight:600">Rapport Invest – toutlmnp</span>
  <button onclick="window.print()" style="background:#C95B2A;color:#F5F0E8;border:none;border-radius:6px;padding:8px 20px;font-size:12px;font-weight:600;cursor:pointer">⬇ Enregistrer en PDF</button>
</div>

<!-- ═══════════════════ PAGE 1 ═══════════════════ -->
<div class="page">

  <div class="hdr">
    <div>
      <div style="font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:rgba(245,240,232,0.5);margin-bottom:3px">tout<span style="color:#C95B2A">lmnp</span> · Rapport Invest</div>
      <div style="font-size:20px;font-weight:200;color:#F5F0E8;letter-spacing:-.03em;line-height:1.1">${bienTitle}</div>
      ${bienInfo.description ? `<div style="font-size:8.5px;color:rgba(245,240,232,0.5);margin-top:3px">${bienInfo.description}</div>` : ""}
    </div>
    <div style="text-align:right;flex-shrink:0;margin-left:14px">
      ${prix > 0 ? `<div style="font-size:17px;font-weight:300;color:#C95B2A;letter-spacing:-.02em">${fE(prix)}</div><div style="font-size:7.5px;color:rgba(245,240,232,0.45);margin-top:1px">prix d'achat</div>` : ""}
      <div style="margin-top:5px;font-size:7.5px;color:rgba(245,240,232,0.35)">${today}</div>
    </div>
  </div>

  <div class="sec first">Récapitulatif du bien</div>
  <div style="background:#EDE7DC;border-radius:8px;overflow:hidden;margin-bottom:5px">
    <div class="sub-hdr">Acquisition</div>
    <div class="cards" style="padding:0 7px 7px">
      <div class="card"><div class="card-lbl">Prix d'achat</div><div class="card-val">${fE(prix)}</div></div>
      ${travaux > 0 ? `<div class="card"><div class="card-lbl">Travaux</div><div class="card-val">${fE(travaux)}</div></div>` : ""}
      ${mobilier > 0 ? `<div class="card"><div class="card-lbl">Mobilier</div><div class="card-val">${fE(mobilier)}</div></div>` : ""}
      <div class="card"><div class="card-lbl">Frais notaire</div><div class="card-val">${fE(notaire)}</div></div>
      <div class="card hl"><div class="card-lbl">Coût total</div><div class="card-val orange">${fE(investTotal)}</div></div>
    </div>
  </div>
  <div style="background:#EDE7DC;border-radius:8px;overflow:hidden;margin-bottom:6px">
    <div class="sub-hdr">Financement</div>
    <div class="cards" style="padding:0 7px 7px">
      <div class="card"><div class="card-lbl">Apport</div><div class="card-val">${fE(apport)}</div></div>
      <div class="card"><div class="card-lbl">Crédit</div><div class="card-val">${fE(montantCredit)}</div></div>
      <div class="card"><div class="card-lbl">Taux · Durée</div><div class="card-val">${fP(parseFloat(f.taux) || 0, 2)} · ${duree} ans</div></div>
      <div class="card"><div class="card-lbl">Mensualité</div><div class="card-val">${fE(mensualite)}/mois</div></div>
      <div class="card green"><div class="card-lbl">Loyer HC</div><div class="card-val green">${fE(loyerAnnuel / 12)}/mois</div></div>
    </div>
  </div>

  <div class="sec">Indicateurs clés</div>
  <div class="cards">
    <div class="card hl">
      <div class="card-lbl">Coût total projet</div>
      <div class="card-val lg orange">${fE(investTotal)}</div>
      <div class="card-sub">dont ${fE(montantCredit)} financés</div>
    </div>
    <div class="card">
      <div class="card-lbl">Rendement brut</div>
      <div class="card-val lg">${fP(rendBrut)}</div>
      <div class="card-sub">loyers / investissement</div>
    </div>
    <div class="card" style="background:${regimeColor}">
      <div class="card-lbl" style="color:rgba(255,255,255,0.6)">Net après impôt</div>
      <div class="card-val lg" style="color:#fff;font-weight:400">${fP(rendChosen)}</div>
      <div class="card-sub" style="color:rgba(255,255,255,0.5)">${regimeLabel}</div>
    </div>
    <div class="card ${cfMensuel >= 0 ? "green" : "red"}">
      <div class="card-lbl">Cash-flow mensuel</div>
      <div class="card-val lg ${cfMensuel >= 0 ? "green" : "red"}">${cfMensuel >= 0 ? "+" : ""}${fE(cfMensuel)}/mois</div>
      <div class="card-sub">après impôt · ${regimeLabel}</div>
    </div>
  </div>

  <div class="sec">Comparaison Régime Réel vs Micro-BIC</div>
  <div class="compare-wrap">
    <div class="compare-col ${!isMicro ? "chosen" : ""}">
      <div class="cmp-hdr ${isMicro ? "inactive" : ""}">Régime Réel Simplifié ${!isMicro ? "✓" : ""}</div>
      <div class="cmp-row"><span class="cmp-lbl">Recettes fiscales</span><span class="cmp-val">${fE(recettesAnnuelles)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Charges déductibles</span><span class="cmp-val">${fE(chargesAnnuelles + interetsAnnee1 + assuranceEmprunteurAnnuel)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl" style="font-weight:700;color:#C95B2A">Amortissements (an. 1)</span><span class="cmp-amort">${fE(amortTotalAn1)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Base imposable</span><span class="cmp-val">${fE(baseImposableReel)}</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Impôt + prél. soc.</span><span class="cmp-val">${fE(impotReel)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Cash-flow mensuel</span><span class="cmp-val" style="color:${res.cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${res.cashflowReelMensuel >= 0 ? "+" : ""}${fE(res.cashflowReelMensuel)}/mois</span></div>
    </div>
    <div class="vs-sep">vs</div>
    <div class="compare-col ${isMicro ? "chosen" : ""}">
      <div class="cmp-hdr ${!isMicro ? "inactive" : ""}">Micro-BIC ${isSaisonnier ? "30" : "50"}% ${isMicro ? "✓" : ""}</div>
      <div class="cmp-row"><span class="cmp-lbl">Recettes fiscales</span><span class="cmp-val">${fE(recettesAnnuelles)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Abattement forfaitaire</span><span class="cmp-val">${fE(recettesAnnuelles * abattPct)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl" style="color:rgba(26,22,18,0.3)">Pas d'amortissement</span><span class="cmp-val" style="color:rgba(26,22,18,0.25)">—</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Base imposable</span><span class="cmp-val">${fE(baseBIC)}</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Impôt + prél. soc.</span><span class="cmp-val">${fE(impotBIC)}/an</span></div>
      <div class="cmp-row"><span class="cmp-lbl">Cash-flow mensuel</span><span class="cmp-val" style="color:${res.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${res.cashflowBICMensuel >= 0 ? "+" : ""}${fE(res.cashflowBICMensuel)}/mois</span></div>
    </div>
  </div>

  <div class="regime-band">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="background:rgba(255,255,255,0.15);border-radius:20px;padding:3px 10px;font-size:8px;font-weight:700;color:#fff;letter-spacing:.05em;flex-shrink:0">RÉGIME CHOISI</div>
      <div>
        <div style="font-size:12px;font-weight:600;color:#fff">${regimeLabel}</div>
        <div style="font-size:7.5px;color:rgba(255,255,255,0.6);margin-top:1px">${regimeAvantage}</div>
      </div>
    </div>
  </div>

  <div class="sec">Évolution dans le temps · ${regimeLabel}</div>
  <table class="tbl">
    <thead>
      <tr>
        <th rowspan="2">Année</th>
        <th rowspan="2" class="r">Loyer CC</th>
        <th colspan="2" style="background:rgba(201,91,42,0.25);color:#C95B2A;text-align:center;border:1.5px solid rgba(201,91,42,0.5);border-bottom:none;font-size:7.5px">Charges &amp; Crédit</th>
        <th rowspan="2" class="r">Cap. Remb.</th>
        <th rowspan="2" class="r">% Remb.</th>
        <th rowspan="2" class="r">Impôt</th>
        <th rowspan="2" class="r">Cash-flow/an</th>
      </tr>
      <tr>
        <th class="r" style="background:rgba(201,91,42,0.15);color:#C95B2A;border-left:1.5px solid rgba(201,91,42,0.5)">Charges</th>
        <th class="r" style="background:rgba(201,91,42,0.15);color:#C95B2A;border-right:1.5px solid rgba(201,91,42,0.5)">Intérêts emprunt + Assu.</th>
      </tr>
    </thead>
    <tbody>
    ${TABLE_YEARS.map(yr => {
      const row = getYear(yr);
      const cf = row.cfAnnuel;
      const cfCls = cf >= 0 ? "pos" : "neg";
      const intAssu = row.interets + assuranceEmprunteurAnnuel;
      const pctRemb = montantCredit > 0 ? (row.capCumul / montantCredit) * 100 : 0;
      const isBeyond = yr > duree;
      return `<tr>
        <td style="font-weight:700">An ${yr}${isBeyond ? `<br/><span style="font-size:6.5px;color:rgba(26,22,18,0.4)">post-emprunt</span>` : ""}</td>
        <td class="r" style="color:#1A7A52;font-weight:600">${fE(recettesAnnuelles)}</td>
        <td class="r neg" style="border-left:1.5px solid rgba(201,91,42,0.3)">−${fE(chargesAnnuelles)}</td>
        <td class="r neg" style="border-right:1.5px solid rgba(201,91,42,0.3)">${isBeyond ? "—" : `−${fE(intAssu)}`}</td>
        <td class="r" style="color:#2A5C8A;font-weight:600">${fE(row.capital)}</td>
        <td class="r" style="color:rgba(26,22,18,0.55)">${pctRemb > 0 ? fP(pctRemb, 0) : "—"}</td>
        <td class="r neg">${row.impot > 0 ? `−${fE(row.impot)}` : "0 €"}</td>
        <td class="r ${cfCls}" style="white-space:nowrap">${cf >= 0 ? "+" : ""}${fE(cf)} <span style="display:inline-block;margin-left:3px;padding:1px 5px;border-radius:4px;font-size:7.5px;font-weight:700;background:${cf >= 0 ? "rgba(26,122,82,0.12)" : "rgba(176,58,42,0.12)"};color:${cf >= 0 ? "#1A7A52" : "#B03A2A"}">${cf >= 0 ? "+" : ""}${fE(cf / 12)}/m</span></td>
      </tr>`;
    }).join("")}
    </tbody>
  </table>

  <div class="ftr"><span>toutlmnp.fr · Rapport indicatif</span><span>Page 1 / 3</span><span>${today}</span></div>
</div>

<!-- ═══════════════════ PAGE 2 ═══════════════════ -->
<div class="page">

  <div style="background:#4E1F12;border-radius:7px;padding:7px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
    <div style="font-size:10px;font-weight:300;color:#F5F0E8">tout<span style="color:#C95B2A">lmnp</span> · <strong>${bienTitle}</strong></div>
    <div style="background:${regimeColor};border-radius:12px;padding:2px 9px;font-size:7.5px;font-weight:700;color:#fff">${regimeLabel}</div>
  </div>

  <!-- Charges + Fiscalité -->
  <div class="sec first">Détail des Charges et de l'impôt</div>
  <div style="display:flex;gap:0;background:#EDE7DC;border-radius:8px;overflow:hidden;margin-bottom:6px">
    <!-- Gauche : charges -->
    <div style="flex:1.6;padding:10px 12px">
      ${[
        taxeFonciere > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Taxe foncière</span><span style="font-size:9px;font-weight:600">${fE(taxeFonciere)}/an</span></div>` : "",
        chargesCopro > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Charges copropriété</span><span style="font-size:9px;font-weight:600">${fE(chargesCopro)}/an</span></div>` : "",
        pnoEur > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Assu. Loyer (${fP(pnoPct, 1)})</span><span style="font-size:9px;font-weight:600">${fE(pnoEur)}/an</span></div>` : "",
        gestionEur > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Gestion locative (${fP(gestionPct, 1)})</span><span style="font-size:9px;font-weight:600">${fE(gestionEur)}/an</span></div>` : "",
        entretien > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Entretien courant</span><span style="font-size:9px;font-weight:600">${fE(entretien)}/an</span></div>` : "",
        compta > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Comptabilité</span><span style="font-size:9px;font-weight:600">${fE(compta)}/an</span></div>` : "",
      ].filter(Boolean).join("") || `<div style="font-size:8.5px;color:rgba(26,22,18,0.35);padding:4px 0">Aucune charge renseignée</div>`}
      <div style="margin-top:8px;padding-top:5px;border-top:2px solid rgba(26,22,18,0.15)">
        <span style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.45)">TOTAL charges</span>
        <div style="font-size:16px;font-weight:700;color:#C95B2A;letter-spacing:-.01em;margin-top:1px">${fE(totalChargesHorsCredit)}/an</div>
      </div>
    </div>
    <!-- Séparateur vertical -->
    <div style="width:1px;background:rgba(26,22,18,0.12);margin:10px 0"></div>
    <!-- Droite : calcul de l'impôt -->
    <div style="flex:1.1;padding:10px 12px">
      <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.4);margin-bottom:6px">Calcul de l'impôt · Année 1</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Recettes fiscales</span><span style="font-size:9px;font-weight:600;color:#1A7A52">${fE(recettesAnnuelles)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">− Charges déductibles</span><span style="font-size:9px;font-weight:600;color:#8B1A1A">−${fE(totalChargesHorsCredit)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">− Intérêts emprunt + Assu.</span><span style="font-size:9px;font-weight:600;color:#8B1A1A">−${fE(totalIntAssu)}</span></div>
      ${!isMicro ? `
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(42,92,138,0.25);background:rgba(42,92,138,0.05);margin:0 -2px;padding-left:2px;padding-right:2px">
        <span style="font-size:8.5px;color:#2A5C8A;font-weight:700">− Amortissements</span>
        <span style="font-size:9px;font-weight:700;color:#2A5C8A">−${fE(amortTotalAn1)}</span>
      </div>
      ${amortBienAn > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:2px 0 2px 10px;border-bottom:.5px solid rgba(42,92,138,0.1)"><span style="font-size:7.5px;color:rgba(42,92,138,0.75)">↳ Bien (${amortPct}% · ${amortDureeEnsemble} ans)</span><span style="font-size:7.5px;font-weight:600;color:rgba(42,92,138,0.85)">−${fE(amortBienAn)}</span></div>` : ""}
      ${amortMobilierAn > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:2px 0 2px 10px;border-bottom:.5px solid rgba(42,92,138,0.1)"><span style="font-size:7.5px;color:rgba(42,92,138,0.75)">↳ Mobilier (${amortDureeMobilier} ans)</span><span style="font-size:7.5px;font-weight:600;color:rgba(42,92,138,0.85)">−${fE(amortMobilierAn)}</span></div>` : ""}
      ${amortTravauxAn > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:2px 0 2px 10px;border-bottom:.5px solid rgba(42,92,138,0.1)"><span style="font-size:7.5px;color:rgba(42,92,138,0.75)">↳ Travaux (${amortDureeTravaux} ans)</span><span style="font-size:7.5px;font-weight:600;color:rgba(42,92,138,0.85)">−${fE(amortTravauxAn)}</span></div>` : ""}
      ${amortNotaireAn > 0 ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:2px 0 2px 10px;border-bottom:.5px solid rgba(42,92,138,0.1)"><span style="font-size:7.5px;color:rgba(42,92,138,0.75)">↳ Notaire (${amortDureeNotaire} ans)</span><span style="font-size:7.5px;font-weight:600;color:rgba(42,92,138,0.85)">−${fE(amortNotaireAn)}</span></div>` : ""}
      ` : `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:.5px solid rgba(26,22,18,0.08)"><span style="font-size:8.5px;color:rgba(26,22,18,0.55)">Abattement forfaitaire (${isSaisonnier ? "30" : "50"}%)</span><span style="font-size:9px;font-weight:600;color:#8B1A1A">−${fE(recettesAnnuelles * abattPct)}</span></div>`}
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-top:1.5px solid rgba(26,22,18,0.15);margin-top:3px"><span style="font-size:8.5px;color:rgba(26,22,18,0.6);font-weight:700">= Base imposable</span><span style="font-size:9px;font-weight:700">${fE(isMicro ? baseBIC : baseImposableReel)}</span></div>
      <div style="margin-top:5px;padding:5px 8px;background:#4E1F12;border-radius:6px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:8.5px;color:#F5F0E8;font-weight:700">Impôt + prél. soc.</span>
        <span style="font-size:13px;font-weight:700;color:#F5A623">${fE(isMicro ? impotBIC : impotReel)}</span>
      </div>
    </div>
  </div>

  <!-- Vision d'ensemble -->
  <div class="sec">Vision d'ensemble · Année 1 vs Fin d'emprunt + 1 an</div>
  <div style="background:#EDE7DC;border-radius:8px;padding:10px 14px;margin-bottom:4px">
    ${stackedBarPairHtml}
  </div>

  <div class="ftr"><span>toutlmnp.fr · Rapport indicatif</span><span>Page 2 / 3</span><span>${today}</span></div>
</div>

<!-- ═══════════════════ PAGE 3 ═══════════════════ -->
<div class="page">

  <div style="background:#4E1F12;border-radius:7px;padding:7px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
    <div style="font-size:10px;font-weight:300;color:#F5F0E8">tout<span style="color:#C95B2A">lmnp</span> · <strong>Situation hypothétique à ${dureeY} ans</strong></div>
    <div style="font-size:7.5px;color:rgba(245,240,232,0.45)">fin de l'emprunt · 0 % de revalorisation</div>
  </div>

  <div style="background:rgba(201,91,42,0.07);border:1px solid rgba(201,91,42,0.18);border-radius:7px;padding:7px 11px;font-size:8px;color:rgba(26,22,18,0.6);line-height:1.55;margin-bottom:10px">
    <strong>Hypothèse :</strong> Le bien conserve la même valeur qu'à l'achat (${fE(prix)}) sans revalorisation. Les loyers ne sont pas revalorisés. Simulation indicative, non constitutive d'un conseil financier.
  </div>

  <div class="sec first">Bilan d'exploitation sur ${dureeY} ans</div>
  <div class="concl-grid">
    <div class="concl-card">
      <div class="concl-lbl">Capital remboursé</div>
      <div class="concl-val" style="color:#1A6644">${fE(montantCredit)}</div>
      <div class="concl-sub">dette entièrement soldée</div>
    </div>
    <div class="concl-card">
      <div class="concl-lbl">Loyers encaissés</div>
      <div class="concl-val">${fE(sumLoyers)}</div>
      <div class="concl-sub">${fE(loyerAnnuel)}/an × ${dureeY} ans</div>
    </div>
    <div class="concl-card">
      <div class="concl-lbl">Impôts payés (total)</div>
      <div class="concl-val">${fE(sumImpot)}</div>
      <div class="concl-sub">cumulé sur ${dureeY} ans</div>
    </div>
    <div class="concl-card ${sumCF >= 0 ? "" : "red"}">
      <div class="concl-lbl">Cash-flow cumulé</div>
      <div class="concl-val" style="color:${sumCF >= 0 ? "#1A7A52" : "#B03A2A"}">${sumCF >= 0 ? "+" : ""}${fE(sumCF)}</div>
      <div class="concl-sub">${fE(sumCF / dureeY / 12)}/mois en moyenne</div>
    </div>
    ${!isMicro ? `<div class="concl-card">
      <div class="concl-lbl">Amortissements cumulés</div>
      <div class="concl-val" style="color:#C95B2A">${fE(amortCumulFinal)}</div>
      <div class="concl-sub">déductions fiscales accumulées</div>
    </div>` : ""}
    <div class="concl-card" style="border:1.5px solid rgba(26,22,18,0.15)">
      <div class="concl-lbl">Valeur du bien</div>
      <div class="concl-val">${fE(prix)}</div>
      <div class="concl-sub">supposée identique à l'achat</div>
    </div>
  </div>

  <div class="sec">Revente hypothétique à ${dureeY} ans · imposition de la plus-value</div>
  <div class="revente-box">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div>
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(245,240,232,0.45);margin-bottom:7px">Calcul de la plus-value</div>
        ${isMicro ? `
        <div style="font-size:10px;color:rgba(245,240,232,0.7);line-height:1.6;margin-bottom:6px">En Micro-BIC, aucun amortissement n'a été déduit. La plus-value est calculée sur le prix d'acquisition initial sans réintégration.</div>
        <div style="font-size:10px;color:rgba(245,240,232,0.9)">Prix cession : <strong>${fE(prix)}</strong></div>
        <div style="font-size:10px;color:rgba(245,240,232,0.9)">Prix acquisition retenu : <strong>${fE(prix)}</strong></div>
        <div style="font-size:10px;color:rgba(245,240,232,0.9)">Plus-value brute : <strong style="color:#F5A623">0 €</strong> (0% revalo)</div>
        <div style="font-size:10px;color:rgba(245,240,232,0.9)">Impôt plus-value : <strong style="color:#F5A623">0 €</strong></div>
        ` : `
        <div style="font-size:10px;color:rgba(245,240,232,0.75);line-height:1.9">
          Prix de cession : <span style="color:#F5F0E8;font-weight:600">${fE(prix)}</span><br/>
          − Amorts. réintégrés (Loi 2025) : <span style="color:#F5A623;font-weight:600">−${fE(amortImmoFinal)}</span><br/>
          = Prix acq. retenu : <span style="color:#F5F0E8;font-weight:600">${fE(prix - amortImmoFinal)}</span><br/>
          Plus-value brute : <span style="color:#F5A623;font-weight:600">${fE(pvBrute)}</span><br/>
          Abatt. IR (${dureeY} ans) : <span style="color:#F5F0E8">${fP(abIR * 100, 0)}</span><br/>
          Abatt. PS (${dureeY} ans) : <span style="color:#F5F0E8">${fP(abPS * 100, 0)}</span>
        </div>`}
      </div>
      <div>
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(245,240,232,0.45);margin-bottom:7px">Résultat net de revente</div>
        <div style="font-size:10px;color:rgba(245,240,232,0.75);line-height:1.9">
          Prix de vente : <span style="color:#F5F0E8;font-weight:600">${fE(prix)}</span><br/>
          Impôt plus-value : <span style="color:#F5A623;font-weight:600">−${fE(impotPV)}</span>
        </div>
        <div style="margin-top:9px;background:rgba(245,240,232,0.08);border-radius:6px;padding:10px">
          <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(245,240,232,0.45);margin-bottom:4px">Net en poche après revente</div>
          <div style="font-size:28px;font-weight:400;color:#C95B2A;letter-spacing:-.02em">${fE(netRevente)}</div>
        </div>
        <div style="margin-top:7px;background:rgba(26,122,82,0.15);border-radius:6px;padding:9px;font-size:10px;color:rgba(245,240,232,0.7);line-height:1.6">
          + Cash-flow cumulé : <strong style="color:${sumCF >= 0 ? "#4ADE80" : "#F87171"}">${sumCF >= 0 ? "+" : ""}${fE(sumCF)}</strong><br/>
          = <strong style="color:#F5F0E8;font-size:11px">Enrichissement total estimé : ${fE(netRevente + sumCF)}</strong>
        </div>
      </div>
    </div>
  </div>

  <div style="margin-top:8px;background:rgba(26,22,18,0.05);border-radius:6px;padding:7px 10px;font-size:7px;color:rgba(26,22,18,0.45);line-height:1.55">
    Calcul indicatif basé sur la législation 2026. La réintégration des amortissements (Loi de finances 2025) s'applique au régime réel. Les abattements pour durée de détention s'appliquent à partir de 6 ans. Consulter un notaire ou expert-comptable avant toute décision.
  </div>

  <div class="ftr"><span>toutlmnp.fr · Simulation indicative — ne constitue pas un conseil fiscal ou financier</span><span>Page 3 / 3</span><span>${today}</span></div>
</div>

</body></html>`;
  };

  const buildBanquePdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const amortDureeMobilier = amortDureeMobilierRef.current;
    const amortDureeTravaux = amortDureeTravauxRef.current;
    const amortDureeNotaire = amortDureeNotaireRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
    // abattPct = taux d'abattement (30% saisonnier non classé, 50% classique)
    const abattPct = isSaisonnier ? 0.30 : 0.50;
    const prixNuitee = prixNuiteeRef.current;
    const tauxOccBas = tauxOccBasRef.current;
    const tauxOccMoyen = tauxOccMoyenRef.current;
    const tauxOccHaut = tauxOccHautRef.current;
    const resultatsTriple = resultatsTripleRef.current;
    const selectedRegime = selectedRegimeRef.current;
    const isMicro = selectedRegime === "micro";

    const fE = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
    const fP = (v: number, d = 2) => v.toFixed(d).replace(".", ",") + " %";
    const fX = (v: number, d = 2) => v.toFixed(d).replace(".", ",");

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
    const creditAnnuel = res.creditAnnuel;
    const interetsAnnee1 = res.interetsAnnee1;
    const capitalRembourseAn1 = Math.max(0, creditAnnuel - interetsAnnee1);
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;
    const loyerAnnuel = res.loyerAnnuel;
    const amortTotalAn1 = res.amortTotal;
    const chargesDeductibles = res.chargesDeductibles;
    const resultatAvantAmort = res.resultatAvantAmort;
    const baseImposableReel = res.baseImposableReel;
    const impotReel = res.impotReel;
    const baseBIC = res.baseBIC;
    const impotBIC = res.impotBIC;
    const rendementBrut = res.rendementBrut;

    // Banking metrics
    const noi = loyerAnnuel - chargesAnnuelles;
    const serviceDebt = creditAnnuel + assuranceEmprunteurAnnuel;
    const dscr = serviceDebt > 0 ? noi / serviceDebt : 0;
    const debtYield = montantCredit > 0 ? (noi / montantCredit) * 100 : 0;
    const ltc = investTotal > 0 ? (montantCredit / investTotal) * 100 : 0;
    const detteSurPrix = prix > 0 ? (montantCredit / prix) * 100 : 0;
    const cfAvantImpot = loyerAnnuel - chargesAnnuelles - serviceDebt;
    const cfApresImpot = cfAvantImpot - (isMicro ? impotBIC : impotReel);
    const coutTotalInteret = montantCredit > 0 && taux > 0
      ? (mensualite * duree * 12) - montantCredit : 0;

    const valeurAmortissable = prix * amortPct / 100;
    const terrainVal = prix * (1 - amortPct / 100);
    const r = taux / 12;
    const n = duree * 12;
    const M = montantCredit > 0 && taux > 0
      ? montantCredit * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : (duree > 0 ? montantCredit / n : 0);

    const amortBienMaxDuree = amortMode === "ensemble"
      ? amortDureeEnsemble
      : Math.max(...composants.map((c: { label: string; pct: number; duree: number }) => c.duree));
    const maxAmortDuree = Math.max(amortBienMaxDuree, 20);
    const totalYears = Math.max(duree, maxAmortDuree) + 5;

    interface PdfRow {
      year: number; capitalDebut: number; capitalFin: number; creditAnnuelR: number;
      interetsAnnee: number; capitalRembourse: number; amortTotalA: number;
      amortDisponible: number; reportEntrant: number; reportNplus1: number;
      resultatAvantAmort: number; chargesDeductibles: number;
      baseImposable: number; impot: number; cashflow: number;
    }
    const rows: PdfRow[] = [];
    let capitalRestant = montantCredit;
    let reportN = 0;

    for (let year = 1; year <= totalYears; year++) {
      const capitalDebut = Math.max(0, capitalRestant);
      let interetsAnnee = 0;
      let creditAnnuelR = 0;
      let capitalRembAn = 0;

      if (year <= duree && montantCredit > 0 && taux > 0) {
        for (let m = 0; m < 12; m++) {
          const im = capitalRestant * r;
          interetsAnnee += im;
          capitalRestant -= (M - im);
        }
        capitalRestant = Math.max(0, capitalRestant);
        creditAnnuelR = M * 12;
        capitalRembAn = creditAnnuelR - interetsAnnee;
      } else if (year <= duree && montantCredit > 0) {
        creditAnnuelR = montantCredit / n * 12;
        capitalRembAn = creditAnnuelR;
      }

      let amortBienA = 0;
      if (amortMode === "ensemble") {
        amortBienA = year <= amortDureeEnsemble ? valeurAmortissable / amortDureeEnsemble : 0;
      } else {
        for (const c of composants) {
          amortBienA += year <= c.duree ? (valeurAmortissable * c.pct / 100) / c.duree : 0;
        }
      }
      const amortMobilierA = amortDureeMobilier > 0 && year <= amortDureeMobilier ? mobilier / amortDureeMobilier : 0;
      const amortTravauxA = amortDureeTravaux > 0 && year <= amortDureeTravaux ? travaux / amortDureeTravaux : 0;
      const amortNotaireA = amortDureeNotaire > 0 && year <= amortDureeNotaire ? notaire / amortDureeNotaire : 0;
      const amortTotalA = amortBienA + amortMobilierA + amortTravauxA + amortNotaireA;
      const chargesDed = chargesAnnuelles + interetsAnnee + assuranceEmprunteurAnnuel;
      const resAvAmort = loyerAnnuel - chargesDed;
      const reportEntrant = reportN;
      const amortDisponible = amortTotalA + reportEntrant;
      const baseImposable = Math.max(0, resAvAmort - amortDisponible);
      const newReport = Math.max(0, amortDisponible - Math.max(0, resAvAmort));
      const impot = baseImposable * (tmi / 100 + 0.186);
      const cfAnnee = loyerAnnuel - (year <= duree ? creditAnnuelR + assuranceEmprunteurAnnuel : 0) - chargesAnnuelles - impot;

      rows.push({
        year, capitalDebut, capitalFin: Math.max(0, capitalRestant),
        creditAnnuelR, interetsAnnee, capitalRembourse: capitalRembAn,
        amortTotalA, amortDisponible, reportEntrant, reportNplus1: newReport,
        resultatAvantAmort: resAvAmort, chargesDeductibles: chargesDed,
        baseImposable, impot, cashflow: cfAnnee / 12,
      });
      reportN = newReport;
    }

    const annexeCols: { label: string; annuel: number; duree: number; initial: number }[] = [];
    if (amortMode === "ensemble") {
      if (valeurAmortissable > 0) annexeCols.push({ label: "Bien immobilier", annuel: valeurAmortissable / amortDureeEnsemble, duree: amortDureeEnsemble, initial: valeurAmortissable });
    } else {
      for (const c of composants) {
        const val = valeurAmortissable * c.pct / 100;
        if (val > 0) annexeCols.push({ label: c.label, annuel: val / c.duree, duree: c.duree, initial: val });
      }
    }
    if (mobilier > 0) annexeCols.push({ label: "Mobilier", annuel: mobilier / amortDureeMobilier, duree: amortDureeMobilier, initial: mobilier });
    if (travaux > 0) annexeCols.push({ label: "Travaux", annuel: travaux / amortDureeTravaux, duree: amortDureeTravaux, initial: travaux });
    if (notaire > 0) annexeCols.push({ label: "Frais notaire", annuel: notaire / amortDureeNotaire, duree: amortDureeNotaire, initial: notaire });

    const chargesLoyer = parseFloat(f.chargesLoyer ?? "0") || 0;
    const taxeFonciere = parseFloat(f.taxeFonciere) || 0;
    const chargesCopro = parseFloat(f.chargesCopro ?? "0") || 0;
    const today = new Date().toLocaleDateString("fr-FR");

    const keyYears = [1, 5, 10, 15, 20, 25].filter(y => y <= totalYears);

    const bienLabel = bienInfo.type === "ap" ? "Appartement" : bienInfo.type === "ma" ? "Maison" : "Immeuble";
    const regimeLabel = isMicro ? "Micro-BIC" : "Régime réel simplifié";
    const dscrColor = dscr >= 1.3 ? "#1A7A52" : dscr >= 1.0 ? "#B08A2A" : "#B03A2A";
    const dscrLabel = dscr >= 1.3 ? "Solide" : dscr >= 1.0 ? "Acceptable" : "Insuffisant";

    // Saisonnier scenario pages for banque PDF
    const saisonnierBanquePagesHtml = isSaisonnier && resultatsTriple ? (() => {
      const fEB = fE;
      const scenarios = [
        { label: "Estimation basse", color: "#2A7080", sr: resultatsTriple.bas, taux: tauxOccBas },
        { label: "Estimation moyenne", color: "#4A9FCA", sr: resultatsTriple.moyen, taux: tauxOccMoyen },
        { label: "Estimation haute", color: "#1A7A52", sr: resultatsTriple.haut, taux: tauxOccHaut },
      ];
      const prixN = parseFloat(prixNuitee) || 0;

      const dscrOf = (sr: typeof resultatsTriple.bas) => sr ? (serviceDebt > 0 ? (sr.loyerAnnuel - sr.chargesAnnuelles) / serviceDebt : 0) : 0;
      const dscrColorOf = (v: number) => v >= 1.3 ? "#1A7A52" : v >= 1.0 ? "#B08A2A" : "#B03A2A";

      // Large scenario cards with breakdown table (banque version)
      const largeCardsBanque = scenarios.map(({ label, color, sr, taux: t }) => {
        if (!sr) return `<div style="flex:1;background:#EDE7DC;border-radius:10px;overflow:hidden;border-top:3px solid ${color};opacity:.4"><div style="background:${color};padding:10px 14px"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.75)">${label}</div></div></div>`;
        const nuits = Math.round(parseFloat(t) / 100 * 365);
        const cfNet = isMicro ? sr.cashflowBICMensuel : sr.cashflowReelMensuel;
        const cfAnnuel = cfNet * 12;
        const baseImp = isMicro ? sr.loyerAnnuel * 0.70 : sr.baseImposableReel;
        const impot = isMicro ? sr.impotBIC : sr.impotReel;
        const dscrS = dscrOf(sr);
        const dscrCS = dscrColorOf(dscrS);
        return `<div style="flex:1;background:#EDE7DC;border-radius:10px;overflow:hidden;border-top:3px solid ${color}">
  <div style="background:${color};padding:10px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.72);margin-bottom:2px">${label}</div>
    <div style="font-size:19px;font-weight:700;color:#fff;line-height:1.1">${fEB(cfNet)}<span style="font-size:9px;font-weight:400;margin-left:2px">/mois</span></div>
    <div style="font-size:7.5px;color:rgba(255,255,255,.68);margin-top:3px">${t}% occ. · ${nuits} nuits · ${fEB(prixN)}/nuit</div>
  </div>
  <div style="padding:10px 14px">
    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Revenus annuels</td><td style="font-size:8px;font-weight:600;text-align:right">${fEB(sr.loyerAnnuel)}</td></tr>
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Emprunt (annuel)</td><td style="font-size:8px;text-align:right">−${fEB(sr.creditAnnuel)}</td></tr>
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Charges propriétaire</td><td style="font-size:8px;text-align:right">−${fEB(sr.chargesAnnuelles)}</td></tr>
      ${!isMicro ? `<tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Amortissements</td><td style="font-size:8px;text-align:right">−${fEB(sr.amortTotal)}</td></tr>` : `<tr style="border-bottom:0.5px solid rgba(26,22,18,.08)"><td style="font-size:7.5px;color:rgba(26,22,18,.38);padding:2px 0;font-style:italic">Abattement 30% (Micro-BIC)</td><td style="font-size:7.5px;text-align:right;color:rgba(26,22,18,.38)">−${fEB(sr.loyerAnnuel * 0.30)}</td></tr>`}
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Base imposable</td><td style="font-size:8px;font-weight:600;text-align:right;color:${baseImp > 0 ? "#B03A2A" : "#1A7A52"}">${fEB(baseImp)}</td></tr>
      <tr style="border-bottom:0.5px solid rgba(26,22,18,.1)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">Impôt estimé</td><td style="font-size:8px;text-align:right;color:#B03A2A">−${fEB(impot)}</td></tr>
      <tr style="border-bottom:1px solid rgba(26,22,18,.18)"><td style="font-size:8px;color:rgba(26,22,18,.55);padding:3px 0">DSCR</td><td style="font-size:8px;font-weight:700;text-align:right;color:${dscrCS}">${dscrS.toFixed(2)}x</td></tr>
      <tr><td style="font-size:8.5px;font-weight:700;padding:4px 0 1px">Cash-flow mensuel</td><td style="font-size:9.5px;font-weight:700;text-align:right;color:${cfNet >= 0 ? "#1A7A52" : "#B03A2A"}">${fEB(cfNet)}/mois</td></tr>
      <tr><td style="font-size:7.5px;color:rgba(26,22,18,.4)">Soit annuel</td><td style="font-size:8.5px;font-weight:600;text-align:right;color:${cfAnnuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fEB(cfAnnuel)}</td></tr>
    </table>
  </div>
</div>`;
      }).join("");

      const nuitsMoyen = Math.round(parseFloat(tauxOccMoyen) / 100 * 365);
      const moyen = resultatsTriple.moyen;

      return `
<!-- PAGE 1 SAISONNIER BANQUE — COMPARAISON DES 3 SCÉNARIOS -->
<div class="page">
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Dossier de Financement · LMNP · Location saisonnière</div>
  </div>
  <div class="hdr-right">Généré le ${today}<br>${regimeLabel}</div>
</div>

<div style="margin:8px 0 12px">
  <h1 style="font-size:17px;font-weight:700;color:#1A2D45;letter-spacing:-.02em;margin-bottom:6px">Dossier de Financement · Location saisonnière</h1>
  <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
    ${bienInfo.type ? `<span class="bien-badge">${bienInfo.type === "ap" ? "Appartement" : bienInfo.type === "ma" ? "Maison" : "Immeuble"}</span>` : ""}
    ${bienInfo.ville ? `<span class="bien-badge">📍 ${bienInfo.ville}</span>` : ""}
    ${bienInfo.surface ? `<span class="bien-badge">📐 ${bienInfo.surface} m²</span>` : ""}
    <span class="bien-badge">🏡 Location saisonnière</span>
    <span class="bien-badge">${fEB(prixN)}/nuit</span>
    ${bienInfo.description ? `<span style="font-size:10px;color:#1A1612">${bienInfo.description}</span>` : ""}
  </div>
</div>

<h2 class="ch" style="border-bottom-color:#4A9FCA;color:#1A2D45">Récapitulatif</h2>
<div class="info-grid" style="margin-bottom:14px">
  <div class="info-col">
    <div class="info-col-title" style="color:#1A2D45">Acquisition</div>
    <div class="info-row"><div class="ir-lbl">Prix d'achat</div><div class="ir-val">${fEB(prix)}</div></div>
    ${travaux > 0 ? `<div class="info-row"><div class="ir-lbl">Travaux</div><div class="ir-val">${fEB(travaux)}</div></div>` : ""}
    ${mobilier > 0 ? `<div class="info-row"><div class="ir-lbl">Mobilier</div><div class="ir-val">${fEB(mobilier)}</div></div>` : ""}
    <div class="info-row"><div class="ir-lbl">Frais de notaire</div><div class="ir-val">${fEB(notaire)}</div></div>
    <div class="info-row"><div class="ir-lbl">Coût total</div><div class="ir-val" style="color:#4A9FCA">${fEB(investTotal)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title" style="color:#1A2D45">Revenus (est. moy.)</div>
    <div class="info-row"><div class="ir-lbl">Prix par nuitée</div><div class="ir-val" style="color:#4A9FCA">${fEB(prixN)}</div></div>
    <div class="info-row"><div class="ir-lbl">Recettes moy./mois</div><div class="ir-val" style="color:#4A9FCA">${fEB(loyerAnnuel / 12)}</div></div>
    <div class="info-row"><div class="ir-lbl">Recettes moy./an</div><div class="ir-val">${fEB(loyerAnnuel)}</div></div>
    <div class="info-row"><div class="ir-lbl">Charges propri./an</div><div class="ir-val">${fEB(chargesAnnuelles)}</div></div>
    <div class="info-row"><div class="ir-lbl">Rentabilité brute</div><div class="ir-val">${fP(rendementBrut, 2)}</div></div>
  </div>
  <div class="info-col">
    <div class="info-col-title" style="color:#1A2D45">Financement</div>
    <div class="info-row"><div class="ir-lbl">Apport personnel</div><div class="ir-val">${fEB(apport)}</div></div>
    <div class="info-row"><div class="ir-lbl">Montant emprunté</div><div class="ir-val">${fEB(montantCredit)}</div></div>
    <div class="info-row"><div class="ir-lbl">Taux · Durée</div><div class="ir-val">${f.taux} % · ${duree} ans</div></div>
    <div class="info-row"><div class="ir-lbl">Mensualité</div><div class="ir-val">${fEB(mensualite)}/mois</div></div>
  </div>
</div>

<h2 class="ch" style="border-bottom-color:#4A9FCA;color:#1A2D45">Les 3 estimations · ${isMicro ? "Micro-BIC" : "Régime réel simplifié"}</h2>
<div style="display:flex;gap:10px;margin-bottom:14px">
  ${largeCardsBanque}
</div>

<div class="beige-note">
  <strong>Loi de Finances 2024 :</strong> Pour les meublés de tourisme non classés, l'abattement Micro-BIC est de <strong>30 %</strong>. Le DSCR (Debt Service Coverage Ratio) mesure la capacité du bien à couvrir le service de la dette — seuil bancaire typique : 1,20x. TMI : <strong>${tmi}%</strong> + prélèvements sociaux <strong>18,6%</strong>.
</div>
</div>

<!-- PAGE 2 SAISONNIER BANQUE — PIVOT ESTIMATION MOYENNE -->
<div class="page">
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Dossier de Financement · LMNP · Location saisonnière</div>
  </div>
  <div class="hdr-right">${today} · ${regimeLabel}</div>
</div>

<div style="text-align:center;margin:24px 0 28px;padding:28px 32px;background:#1A2D45;border-radius:12px">
  <div style="font-size:20px;font-weight:700;color:#F5F0E8;line-height:1.4;letter-spacing:-.02em;margin-bottom:12px">
    Pour la suite de ce dossier,<br>nous utilisons l'<span style="color:#4A9FCA">Estimation Moyenne</span>
  </div>
  <div style="display:flex;justify-content:center;gap:24px">
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Taux d'occupation</div><div style="font-size:14px;font-weight:700;color:#4A9FCA">${tauxOccMoyen}%</div></div>
    <div style="width:1px;background:rgba(245,240,232,.2)"></div>
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Nuits/an</div><div style="font-size:14px;font-weight:700;color:#4A9FCA">${nuitsMoyen}</div></div>
    <div style="width:1px;background:rgba(245,240,232,.2)"></div>
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Prix/nuit</div><div style="font-size:14px;font-weight:700;color:#4A9FCA">${fEB(parseFloat(prixNuitee) || 0)}</div></div>
    <div style="width:1px;background:rgba(245,240,232,.2)"></div>
    <div style="text-align:center"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:rgba(245,240,232,.55);margin-bottom:3px">Revenus annuels</div><div style="font-size:14px;font-weight:700;color:#4A9FCA">${moyen ? fEB(moyen.loyerAnnuel) : "—"}</div></div>
  </div>
</div>

<div style="display:flex;gap:10px;margin-bottom:14px">
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:8px">L'actif</div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Type</div><div style="font-size:11px;font-weight:600">${bienLabel}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Prix d'achat</div><div style="font-size:11px;font-weight:600">${fEB(prix)}</div></div>
    ${travaux > 0 ? `<div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Travaux</div><div style="font-size:11px;font-weight:600">${fEB(travaux)}</div></div>` : ""}
    <div><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Coût total</div><div style="font-size:13px;font-weight:700;color:#1A2D45">${fEB(investTotal)}</div></div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:8px">Montage financier</div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Apport</div><div style="font-size:11px;font-weight:600">${fEB(apport)}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Crédit</div><div style="font-size:11px;font-weight:600">${fEB(montantCredit)}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Taux · Durée</div><div style="font-size:11px;font-weight:600">${f.taux} % · ${duree} ans</div></div>
    <div><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Mensualité</div><div style="font-size:13px;font-weight:700;color:#1A2D45">${fEB(mensualite)}/mois</div></div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:8px">Revenus (est. moy.)</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(26,22,18,.55)">Prix par nuitée</div><div style="font-size:10px;font-weight:700;color:#4A9FCA">${fEB(parseFloat(prixNuitee) || 0)}</div></div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(26,22,18,.55)">Recettes moy./mois</div><div style="font-size:10px;font-weight:700;color:#4A9FCA">${fEB(loyerAnnuel / 12)}</div></div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(26,22,18,.55)">Recettes moy./an</div><div style="font-size:10px;font-weight:700">${fEB(loyerAnnuel)}</div></div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(26,22,18,.55)">Charges propriétaire/an</div><div style="font-size:10px;font-weight:700">${fEB(chargesAnnuelles)}</div></div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(26,22,18,.55)">NOI</div><div style="font-size:12px;font-weight:700;color:#1A2D45">${fEB(noi)}</div></div>
  </div>
</div>

<div class="kpi-row">
  <div class="kpi">
    <div class="kpi-lbl">Coût total du projet</div>
    <div class="kpi-val">${fEB(investTotal)}</div>
    <div class="kpi-sub">acquisition + frais</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Financement / Coût</div>
    <div class="kpi-val">${fP(ltc, 1)}</div>
    <div class="kpi-sub">LTC — loan-to-cost</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">DSCR — Couverture dette</div>
    <div class="kpi-val" style="color:${dscrColor}">${fX(dscr, 2)}x</div>
    <div class="kpi-sub">${dscrLabel} · est. moyenne</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Cash-flow après fiscalité</div>
    <div class="kpi-val" style="color:${cfApresImpot >= 0 ? "#4ADE80" : "#FCA5A5"}">${fEB(cfApresImpot / 12)}/mois</div>
    <div class="kpi-sub">année 1 · ${regimeLabel} · est. moy.</div>
  </div>
</div>
</div>`;
    })() : "";

    // Annexe B rows
    const annexeMaxDuree = annexeCols.length > 0 ? Math.max(...annexeCols.map(c => c.duree)) : 0;
    const afs = 9;
    const annexeBRows = Array.from({ length: annexeMaxDuree }, (_, i) => {
      const year = i + 1;
      let total = 0;
      const cells = annexeCols.map(c => {
        if (year <= c.duree) {
          const reste = Math.max(0, c.initial - year * c.annuel);
          total += c.annuel;
          return `<td style="font-size:${afs}px;padding:5px 6px">${fE(c.annuel)}</td>
<td style="font-size:${afs}px;padding:5px 6px;color:${reste <= 0.01 ? "#1A7A52" : "rgba(26,22,18,0.45)"};border-right:1px solid rgba(26,22,18,0.07)">${fE(reste)}</td>`;
        }
        return `<td style="font-size:${afs}px;padding:5px 6px;color:#1A1612">—</td><td style="border-right:1px solid rgba(26,22,18,0.07)"></td>`;
      }).join("");
      return `<tr><td class="can" style="font-size:${afs}px">${year}</td>${cells}<td style="font-weight:700;color:#C95B2A;font-size:${afs}px;padding:5px 6px">${fE(total)}</td></tr>`;
    }).join("");
    const annexeBHeaderCols = annexeCols.map(c =>
      `<th colspan="2" style="text-align:center;font-size:9px;padding:6px 5px;border-right:1px solid rgba(255,255,255,0.12)">
        <div style="font-weight:700">${c.label}</div>
        <div style="font-weight:400;opacity:.7;font-size:8px;margin-top:2px">${fE(c.initial)} · ${c.duree} ans · ${fE(c.annuel)}/an</div>
      </th>`).join("");
    const annexeBHeaderSub = annexeCols.map(() =>
      `<th style="font-size:8px;background:#3a1509;padding:4px 5px">Amort.</th><th style="font-size:8px;background:#3a1509;padding:4px 5px;border-right:1px solid rgba(255,255,255,0.1)">Reste</th>`
    ).join("");

    const css = `
@page{size:A4;margin:0}
@page landscape{size:A4 landscape;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#4a4a4a;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;font-size:11px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{padding:0 0 32px}
.page{width:210mm;min-height:297mm;background:#F5F0E8;margin:0 auto 24px;padding:13mm 14mm;box-shadow:0 8px 40px rgba(0,0,0,0.5);position:relative}
.page.landscape{width:297mm;min-height:210mm;page:landscape}
.no-print{position:sticky;top:0;z-index:100;background:#1A2D45;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:0}
.hdr{display:flex;align-items:center;justify-content:space-between;background:#1A2D45;color:#F5F0E8;padding:6px 14px;border-radius:5px;margin-bottom:14px}
.hdr-brand{display:flex;align-items:baseline}
.hdr-light{font-weight:300;font-size:14px}.hdr-bold{font-weight:700;font-size:14px;color:#4A9FCA}
.hdr-sub{font-size:8px;letter-spacing:.12em;opacity:.5;text-transform:uppercase;margin-top:2px}
.hdr-right{font-size:9px;opacity:.55;text-align:right;line-height:1.6}
h2.ch{font-size:12px;font-weight:700;color:#1A2D45;border-bottom:2px solid #4A9FCA;padding-bottom:4px;margin:18px 0 10px;letter-spacing:-.01em}
h2.ch .num{color:#4A9FCA;margin-right:5px}
.kpi-row{display:flex;gap:8px;margin-bottom:14px}
.kpi{flex:1;background:#1A2D45;color:#F5F0E8;border-radius:7px;padding:11px 10px;text-align:center}
.kpi-lbl{font-size:7px;text-transform:uppercase;letter-spacing:.1em;opacity:.6;margin-bottom:5px;line-height:1.4}
.kpi-val{font-size:16px;font-weight:700;color:#4A9FCA;letter-spacing:-.02em}
.kpi-sub{font-size:7.5px;opacity:.5;margin-top:2px}
table.tbl{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:6px}
table.tbl th{background:#1A2D45;color:#F5F0E8;padding:6px 8px;text-align:left;font-weight:500;font-size:9px}
table.tbl th.r{text-align:right}
table.tbl td{padding:5px 8px;border-bottom:.5px solid rgba(26,22,18,.07);vertical-align:middle}
table.tbl td.r{text-align:right}
table.tbl td.lbl{color:#1A1612;font-size:9.5px}
table.tbl tr:nth-child(even){background:rgba(74,159,202,.04)}
table.tbl tr.sep td{border-top:1.5px solid rgba(26,22,18,.12);font-weight:700}
table.tbl tr.total td{background:rgba(26,45,69,.07);font-weight:700}
.can{text-align:left!important;font-weight:600;width:24px;white-space:nowrap}
.green{color:#1A7A52}.red{color:#B03A2A}.blue{color:#1A2D45}.teal{color:#4A9FCA}
.note{background:rgba(74,159,202,.07);border:1px solid rgba(74,159,202,.2);border-radius:6px;padding:9px 12px;font-size:9px;line-height:1.6;color:#1A1612;margin-top:8px}
.beige-note{background:#EDE7DC;border-radius:6px;padding:9px 12px;font-size:9px;line-height:1.6;color:#1A1612;margin-top:8px}
.info-grid{display:flex;gap:10px;margin-bottom:14px}
.info-col{flex:1;background:#EDE7DC;border-radius:7px;padding:12px 14px}
.info-col-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#1A2D45;margin-bottom:10px}
.info-row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:5px}
.info-row:last-child{margin-bottom:0}
.ir-lbl{font-size:8px;text-transform:uppercase;letter-spacing:.09em;color:rgba(26,22,18,0.55);flex-shrink:0}
.ir-val{font-size:10px;font-weight:700;color:#1A1612;text-align:right}
.two-col{display:flex;gap:12px}
.two-col>div{flex:1}
.section-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:5px}
.ratio-card{background:#EDE7DC;border-radius:8px;padding:10px 12px;flex:1}
.ratio-card .val{font-size:18px;font-weight:700;margin:3px 0}
.ratio-card .lbl{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#1A1612}
.ratio-card .sub{font-size:8px;color:#1A1612;margin-top:2px}
.pl-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:.5px solid rgba(26,22,18,.07)}
.pl-row:last-child{border-bottom:none}
.pl-lbl{font-size:10px;color:#1A1612}
.pl-val{font-size:10px;font-weight:600}
.pl-subtotal{background:#EDE7DC;border-radius:4px;padding:6px 10px;display:flex;justify-content:space-between;margin:4px 0;font-weight:700}
.pl-total{background:#1A2D45;color:#F5F0E8;border-radius:4px;padding:7px 10px;display:flex;justify-content:space-between;font-weight:700;margin-top:4px}
@media print{
  html,body{background:none;padding:0;margin:0}
  body{padding:0}
  .no-print{display:none}
  .page{margin:0;box-shadow:none;padding:13mm 14mm;page-break-after:always;min-height:0;width:100%}
  .page.landscape{padding:11mm 13mm}
  .page:last-child{page-break-after:avoid}
}`;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Dossier de Financement LMNP – toutlmnp</title>
<style>${css}</style></head><body>
<div class="no-print">
  <div style="font-size:12px;font-weight:600;color:#F5F0E8;letter-spacing:.02em">Dossier Banque LMNP – <span style="color:#4A9FCA">toutlmnp</span></div>
  <button onclick="window.print()" style="background:#4A9FCA;color:#1A2D45;border:none;border-radius:6px;padding:8px 20px;font-size:12px;font-weight:700;cursor:pointer">⬇ Imprimer / Enregistrer en PDF</button>
</div>

${saisonnierBanquePagesHtml}

${!isSaisonnier ? `<!-- PAGE 1 — COUVERTURE -->
<div class="page">
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Dossier de Financement · LMNP</div>
  </div>
  <div class="hdr-right">Généré le ${today}<br>${regimeLabel}</div>
</div>

<div style="text-align:center;margin:10px 0 18px">
  <div style="font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:#4A9FCA;font-weight:600;margin-bottom:6px">Dossier de Financement</div>
  <h1 style="font-size:24px;font-weight:700;color:#1A2D45;letter-spacing:-.025em;margin-bottom:4px">Investissement LMNP</h1>
  <div style="font-size:10px;color:#1A1612">${bienInfo.ville ? bienInfo.ville + " · " : ""}${bienLabel}${bienInfo.surface ? " · " + bienInfo.surface + " m²" : ""}</div>
  ${bienInfo.description ? `<div style="font-size:9px;color:#1A1612;margin-top:4px;font-style:italic">${bienInfo.description}</div>` : ""}
</div>

<div style="display:flex;gap:10px;margin-bottom:14px">
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:8px">L'actif</div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Type</div><div style="font-size:11px;font-weight:600">${bienLabel}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Prix d'achat</div><div style="font-size:11px;font-weight:600">${fE(prix)}</div></div>
    ${travaux > 0 ? `<div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Travaux</div><div style="font-size:11px;font-weight:600">${fE(travaux)}</div></div>` : ""}
    <div><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Coût total</div><div style="font-size:13px;font-weight:700;color:#1A2D45">${fE(investTotal)}</div></div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:8px">Montage financier</div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Apport</div><div style="font-size:11px;font-weight:600">${fE(apport)}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Crédit</div><div style="font-size:11px;font-weight:600">${fE(montantCredit)}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Taux · Durée</div><div style="font-size:11px;font-weight:600">${f.taux} % · ${duree} ans</div></div>
    <div><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Mensualité</div><div style="font-size:13px;font-weight:700;color:#1A2D45">${fE(mensualite)}/mois</div></div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px 14px">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4A9FCA;margin-bottom:8px">Exploitation</div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Régime fiscal</div><div style="font-size:11px;font-weight:600">${regimeLabel}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Loyers annuels</div><div style="font-size:11px;font-weight:600">${fE(loyerAnnuel)}</div></div>
    <div style="margin-bottom:5px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">Charges annuelles</div><div style="font-size:11px;font-weight:600">${fE(chargesAnnuelles)}</div></div>
    <div><div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612">NOI</div><div style="font-size:13px;font-weight:700;color:#1A2D45">${fE(noi)}</div></div>
  </div>
</div>

<div class="kpi-row">
  <div class="kpi">
    <div class="kpi-lbl">Coût total du projet</div>
    <div class="kpi-val">${fE(investTotal)}</div>
    <div class="kpi-sub">acquisition + frais</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Financement / Coût</div>
    <div class="kpi-val">${fP(ltc, 1)}</div>
    <div class="kpi-sub">LTC — loan-to-cost</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">DSCR — Couverture dette</div>
    <div class="kpi-val" style="color:${dscrColor}">${fX(dscr, 2)}x</div>
    <div class="kpi-sub">${dscrLabel} · NOI / service dette</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Cash-flow après fiscalité</div>
    <div class="kpi-val" style="color:${cfApresImpot >= 0 ? "#4ADE80" : "#FCA5A5"}">${fE(cfApresImpot / 12)}/mois</div>
    <div class="kpi-sub">année 1 · ${regimeLabel}</div>
  </div>
</div>

<div class="beige-note" style="margin-top:4px">
  <strong>Objet du dossier :</strong> Ce document présente l'analyse financière de l'investissement locatif meublé (LMNP) soumis à financement bancaire. Les projections sont réalisées en <strong>${regimeLabel}</strong> sur ${totalYears} ans. Loyers, charges et valeur du bien supposés constants. TMI : <strong>${tmi} %</strong> + prélèvements sociaux <strong>18,6 %</strong>. Simulation indicative — ne constitue pas un conseil fiscal ou financier.
</div>
</div>` : ""}

<!-- PAGE 2 — RÉSUMÉ EXÉCUTIF -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP${isSaisonnier ? " · Estimation Moyenne" : ""}</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">1.</span>Résumé exécutif${isSaisonnier ? " <span style=\"font-size:9px;font-weight:400;color:#4A9FCA;margin-left:6px\">(Estimation Moyenne)</span>" : ""}</h2>

<div class="two-col" style="margin-bottom:12px">
  <div>
    <div class="section-label">Acquisition et financement</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Prix d'achat</td><td class="r">${fE(prix)}</td></tr>
        ${travaux > 0 ? `<tr><td class="lbl">Travaux</td><td class="r">${fE(travaux)}</td></tr>` : ""}
        ${mobilier > 0 ? `<tr><td class="lbl">Mobilier</td><td class="r">${fE(mobilier)}</td></tr>` : ""}
        <tr><td class="lbl">Frais de notaire</td><td class="r">${fE(notaire)}</td></tr>
        <tr class="total"><td>Coût total projet</td><td class="r">${fE(investTotal)}</td></tr>
        <tr><td class="lbl">Apport personnel</td><td class="r">${fE(apport)}</td></tr>
        <tr class="total"><td>Crédit sollicité</td><td class="r">${fE(montantCredit)}</td></tr>
        <tr><td class="lbl">Taux · Durée</td><td class="r">${f.taux} % · ${duree} ans</td></tr>
        <tr><td class="lbl">Mensualité hors assurance</td><td class="r">${fE(mensualite)}/mois</td></tr>
        ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">Assurance emprunteur</td><td class="r">${fE(assuranceEmprunteurAnnuel / 12)}/mois</td></tr>` : ""}
      </tbody>
    </table>
  </div>
  <div>
    <div class="section-label">Exploitation locative</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Loyers annuels HC</td><td class="r">${fE(loyerAnnuel)}</td></tr>
        ${chargesLoyer > 0 ? `<tr><td class="lbl">Charges récupérables</td><td class="r">${fE(chargesLoyer * 12)}/an</td></tr>` : ""}
        ${taxeFonciere > 0 ? `<tr><td class="lbl">Taxe foncière</td><td class="r">${fE(taxeFonciere)}</td></tr>` : ""}
        ${chargesCopro > 0 ? `<tr><td class="lbl">Charges de copropriété</td><td class="r">${fE(chargesCopro)}</td></tr>` : ""}
        <tr><td class="lbl">Total charges propriétaire</td><td class="r">${fE(chargesAnnuelles)}</td></tr>
        <tr class="total"><td>NOI (Net Operating Income)</td><td class="r">${fE(noi)}</td></tr>
        <tr><td class="lbl">Service de la dette</td><td class="r">${fE(serviceDebt)}</td></tr>
        <tr class="sep"><td class="lbl">Cash-flow avant impôt</td><td class="r" style="color:${cfAvantImpot >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAvantImpot)}</td></tr>
        <tr><td class="lbl">Fiscalité estimée (an. 1)</td><td class="r">${fE(isMicro ? impotBIC : impotReel)}</td></tr>
        <tr class="total"><td>Cash-flow après impôt</td><td class="r" style="color:${cfApresImpot >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfApresImpot)}/an · ${fE(cfApresImpot / 12)}/mois</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="section-label">Indicateurs bancaires clés</div>
<div style="display:flex;gap:8px">
  <div class="ratio-card">
    <div class="lbl">DSCR</div>
    <div class="val" style="color:${dscrColor}">${fX(dscr, 2)}x</div>
    <div class="sub">${dscrLabel} · seuil bancaire : 1,20x</div>
  </div>
  <div class="ratio-card">
    <div class="lbl">Debt Yield</div>
    <div class="val" style="color:#1A2D45">${fP(debtYield, 2)}</div>
    <div class="sub">NOI / montant crédit</div>
  </div>
  <div class="ratio-card">
    <div class="lbl">LTC (Loan-to-Cost)</div>
    <div class="val" style="color:#1A2D45">${fP(ltc, 1)}</div>
    <div class="sub">Crédit / coût total projet</div>
  </div>
  <div class="ratio-card">
    <div class="lbl">Dette / Prix achat</div>
    <div class="val" style="color:#1A2D45">${fP(detteSurPrix, 1)}</div>
    <div class="sub">Crédit / prix d'achat</div>
  </div>
  <div class="ratio-card">
    <div class="lbl">Rentabilité brute</div>
    <div class="val" style="color:#1A2D45">${fP(rendementBrut, 2)}</div>
    <div class="sub">Loyers / coût total</div>
  </div>
</div>
</div>

<!-- PAGE 3 — DESCRIPTION ET HYPOTHÈSES -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">2.</span>Description, montage et hypothèses</h2>

<div class="two-col" style="margin-bottom:14px">
  <div>
    <div class="section-label">Caractéristiques du bien</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Type d'actif</td><td class="r">${bienLabel}</td></tr>
        ${bienInfo.ville ? `<tr><td class="lbl">Localisation</td><td class="r">${bienInfo.ville}</td></tr>` : ""}
        ${bienInfo.surface ? `<tr><td class="lbl">Surface</td><td class="r">${bienInfo.surface} m²</td></tr>` : ""}
        <tr><td class="lbl">Mode d'exploitation</td><td class="r">Location meublée (LMNP)</td></tr>
        <tr><td class="lbl">Régime fiscal retenu</td><td class="r">${regimeLabel}</td></tr>
        <tr><td class="lbl">TMI investisseur</td><td class="r">${tmi} %</td></tr>
      </tbody>
    </table>
    ${bienInfo.description ? `<div class="beige-note" style="margin-top:8px;font-size:9px"><strong>Commentaires :</strong> ${bienInfo.description}</div>` : ""}
  </div>
  <div>
    <div class="section-label">Hypothèses de projection</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Loyer mensuel HC retenu</td><td class="r">${fE(loyerAnnuel / 12)}</td></tr>
        <tr><td class="lbl">Loyer annuel HC</td><td class="r">${fE(loyerAnnuel)}</td></tr>
        <tr><td class="lbl">Charges annuelles totales</td><td class="r">${fE(chargesAnnuelles)}</td></tr>
        <tr><td class="lbl">Vacance locative supposée</td><td class="r">0 % (loyers constants)</td></tr>
        <tr><td class="lbl">Revalorisation loyers/bien</td><td class="r">Non appliquée</td></tr>
        <tr><td class="lbl">Horizon d'analyse</td><td class="r">${totalYears} ans</td></tr>
        ${!isMicro ? `<tr><td class="lbl">Amortissement bien (${amortPct} %)</td><td class="r">${amortMode === "ensemble" ? amortDureeEnsemble + " ans linéaire" : "Par composants"}</td></tr>` : ""}
      </tbody>
    </table>
  </div>
</div>

<div class="section-label">Pièces et documents du dossier</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
  ${[
    "Pièce d'identité (recto-verso)",
    "3 derniers avis d'imposition",
    "3 derniers bulletins de salaire",
    "Justificatif de domicile < 3 mois",
    "Compromis ou promesse de vente",
    "Tableau d'amortissement estimatif",
    "Bail signé ou projet de bail",
    "Extrait du plan cadastral (si dispo.)",
  ].map(doc => `<div style="display:flex;align-items:center;gap:6px;background:#EDE7DC;border-radius:5px;padding:6px 10px;font-size:9px">
    <span style="width:14px;height:14px;border:1px solid rgba(26,45,69,.3);border-radius:3px;flex-shrink:0;display:inline-block"></span>
    <span>${doc}</span>
  </div>`).join("")}
</div>

<div class="note" style="margin-top:14px">
  <strong>Note :</strong> Les projections présentées dans ce dossier sont établies sur la base des données renseignées par l'investisseur. Elles ont une valeur indicative et ne sauraient constituer une garantie de rentabilité. Le dossier doit être complété des pièces justificatives mentionnées ci-dessus.
</div>
</div>

<!-- PAGE 4 — PLAN DE FINANCEMENT -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">3.</span>Plan de financement</h2>

<div class="two-col" style="margin-bottom:14px">
  <div>
    <div class="section-label">Emplois</div>
    <table class="tbl">
      <thead><tr><th>Poste</th><th class="r">Montant</th><th class="r">% coût total</th></tr></thead>
      <tbody>
        <tr><td class="lbl">Prix d'achat</td><td class="r">${fE(prix)}</td><td class="r">${fP(investTotal > 0 ? (prix / investTotal) * 100 : 0, 1)}</td></tr>
        ${travaux > 0 ? `<tr><td class="lbl">Travaux</td><td class="r">${fE(travaux)}</td><td class="r">${fP((travaux / investTotal) * 100, 1)}</td></tr>` : ""}
        ${mobilier > 0 ? `<tr><td class="lbl">Mobilier</td><td class="r">${fE(mobilier)}</td><td class="r">${fP((mobilier / investTotal) * 100, 1)}</td></tr>` : ""}
        <tr><td class="lbl">Frais de notaire</td><td class="r">${fE(notaire)}</td><td class="r">${fP((notaire / investTotal) * 100, 1)}</td></tr>
        <tr class="total"><td>Total emplois</td><td class="r">${fE(investTotal)}</td><td class="r">100 %</td></tr>
      </tbody>
    </table>
  </div>
  <div>
    <div class="section-label">Ressources</div>
    <table class="tbl">
      <thead><tr><th>Source</th><th class="r">Montant</th><th class="r">% coût total</th></tr></thead>
      <tbody>
        <tr><td class="lbl">Apport personnel</td><td class="r">${fE(apport)}</td><td class="r">${fP(investTotal > 0 ? (apport / investTotal) * 100 : 0, 1)}</td></tr>
        <tr><td class="lbl">Crédit immobilier</td><td class="r">${fE(montantCredit)}</td><td class="r">${fP(ltc, 1)}</td></tr>
        <tr class="total"><td>Total ressources</td><td class="r">${fE(investTotal)}</td><td class="r">100 %</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="section-label">Ratios de financement</div>
<div style="display:flex;gap:8px;margin-bottom:14px">
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#1A1612;margin-bottom:4px">LTC · Loan-to-Cost</div>
    <div style="font-size:20px;font-weight:700;color:#1A2D45">${fP(ltc, 1)}</div>
    <div style="font-size:8px;color:#1A1612;margin-top:2px">Crédit / coût total · Idéal &lt; 80 %</div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#1A1612;margin-bottom:4px">Dette / Prix d'achat</div>
    <div style="font-size:20px;font-weight:700;color:#1A2D45">${fP(detteSurPrix, 1)}</div>
    <div style="font-size:8px;color:#1A1612;margin-top:2px">Crédit / prix d'achat</div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#1A1612;margin-bottom:4px">Effort mensuel net</div>
    <div style="font-size:20px;font-weight:700;color:${cfAvantImpot >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAvantImpot / 12)}</div>
    <div style="font-size:8px;color:#1A1612;margin-top:2px">Cash-flow avant impôt / mois</div>
  </div>
  <div style="flex:1;background:#EDE7DC;border-radius:8px;padding:12px">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#1A1612;margin-bottom:4px">Capital constitué an. 1</div>
    <div style="font-size:20px;font-weight:700;color:#1A2D45">${fE(capitalRembourseAn1)}</div>
    <div style="font-size:8px;color:#1A1612;margin-top:2px">Capital remboursé en 1re année</div>
  </div>
</div>

<div class="beige-note">
  <strong>Lecture :</strong> Le LTC de <strong>${fP(ltc, 1)}</strong> indique que <strong>${fP(100 - ltc, 1)}</strong> du projet sont financés sur fonds propres (apport : ${fE(apport)}). Ce ratio est l'un des premiers critères d'analyse bancaire. Le capital remboursé dès la 1re année (${fE(capitalRembourseAn1)}) représente un enrichissement patrimonial immédiat, indépendant du cash-flow.
</div>
</div>

<!-- PAGE 5 — COMPTE D'EXPLOITATION -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">4.</span>Compte d'exploitation — Année 1</h2>

<div style="max-width:480px;margin:0 auto">
  <div style="background:#1A2D45;color:#F5F0E8;border-radius:8px 8px 0 0;padding:10px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Compte de résultat simplifié</div>
  <div style="background:#EDE7DC;border-radius:0 0 8px 8px;padding:14px 16px">
    <div class="pl-row">
      <span class="pl-lbl" style="color:#1A7A52;font-weight:600">+ Revenus locatifs (HC)</span>
      <span class="pl-val" style="color:#1A7A52">${fE(loyerAnnuel)}</span>
    </div>
    <div class="pl-row">
      <span class="pl-lbl">− Charges d'exploitation</span>
      <span class="pl-val" style="color:#B03A2A">−${fE(chargesAnnuelles)}</span>
    </div>
    <div class="pl-subtotal">
      <span>= NOI (Net Operating Income)</span>
      <span style="color:${noi >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(noi)}</span>
    </div>
    <div class="pl-row" style="margin-top:8px">
      <span class="pl-lbl">− Mensualités de crédit</span>
      <span class="pl-val" style="color:#B03A2A">−${fE(creditAnnuel)}</span>
    </div>
    ${assuranceEmprunteurAnnuel > 0 ? `<div class="pl-row">
      <span class="pl-lbl">− Assurance emprunteur</span>
      <span class="pl-val" style="color:#B03A2A">−${fE(assuranceEmprunteurAnnuel)}</span>
    </div>` : ""}
    <div class="pl-subtotal">
      <span>= Cash-flow avant impôt</span>
      <span style="color:${cfAvantImpot >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAvantImpot)}</span>
    </div>
    <div class="pl-row" style="margin-top:8px">
      <span class="pl-lbl">− Fiscalité estimée (${regimeLabel})</span>
      <span class="pl-val" style="color:#B03A2A">−${fE(isMicro ? impotBIC : impotReel)}</span>
    </div>
    <div class="pl-total">
      <span>= Cash-flow après impôt</span>
      <span style="color:${cfApresImpot >= 0 ? "#4ADE80" : "#FCA5A5"}">${fE(cfApresImpot)}/an · ${fE(cfApresImpot / 12)}/mois</span>
    </div>
  </div>
</div>

<div style="display:flex;gap:10px;margin-top:14px">
  <div style="flex:1">
    <div class="section-label">Décomposition des charges (an. 1)</div>
    <table class="tbl">
      <tbody>
        ${taxeFonciere > 0 ? `<tr><td class="lbl">Taxe foncière</td><td class="r">${fE(taxeFonciere)}</td></tr>` : ""}
        ${chargesCopro > 0 ? `<tr><td class="lbl">Charges copropriété</td><td class="r">${fE(chargesCopro)}</td></tr>` : ""}
        <tr class="total"><td>Total charges</td><td class="r">${fE(chargesAnnuelles)}</td></tr>
        <tr><td class="lbl">Service de la dette</td><td class="r">${fE(serviceDebt)}</td></tr>
        <tr><td class="lbl">Dont intérêts an. 1</td><td class="r">${fE(interetsAnnee1)}</td></tr>
        <tr><td class="lbl">Dont capital remboursé an. 1</td><td class="r">${fE(capitalRembourseAn1)}</td></tr>
      </tbody>
    </table>
  </div>
  <div style="flex:1">
    <div class="section-label">Détail de la fiscalité (an. 1)</div>
    <table class="tbl">
      <tbody>
        ${isMicro ? `
        <tr><td class="lbl">Loyers imposables</td><td class="r">${fE(loyerAnnuel)}</td></tr>
        <tr><td class="lbl">Abattement forfaitaire ${isSaisonnier ? "30" : "50"} %</td><td class="r" style="color:#B03A2A">−${fE(loyerAnnuel * abattPct)}</td></tr>
        <tr class="sep"><td class="lbl">Base imposable BIC</td><td class="r">${fE(baseBIC)}</td></tr>
        <tr class="total"><td>Fiscalité totale</td><td class="r" style="color:${impotBIC === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotBIC)}</td></tr>
        ` : `
        <tr><td class="lbl">Résultat avant amortissement</td><td class="r">${fE(resultatAvantAmort)}</td></tr>
        <tr style="background:rgba(139,26,26,0.04)"><td class="lbl" style="font-weight:700;color:#8B1A1A">Amortissement déduit</td><td class="r" style="font-weight:700;color:#8B1A1A">−${fE(amortTotalAn1)}</td></tr>
        <tr class="sep"><td class="lbl">Base imposable</td><td class="r" style="color:${baseImposableReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(baseImposableReel)}</td></tr>
        <tr class="total"><td>Fiscalité totale</td><td class="r" style="color:${impotReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotReel)}</td></tr>
        `}
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- PAGE 6 — STRUCTURE DE LA DETTE -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">5.</span>Structure de la dette</h2>

<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
  ${[
    { lbl: "Montant emprunté", val: fE(montantCredit) },
    { lbl: "Taux nominal", val: fP(taux * 100, 2) },
    { lbl: "Durée", val: duree + " ans" },
    { lbl: "Mensualité (hors ass.)", val: fE(mensualite) },
    { lbl: "Annuité totale", val: fE(serviceDebt) },
    { lbl: "Intérêts an. 1", val: fE(interetsAnnee1) },
    { lbl: "Capital remb. an. 1", val: fE(capitalRembourseAn1) },
    { lbl: "Coût total intérêts", val: coutTotalInteret > 0 ? fE(coutTotalInteret) : "—" },
  ].map(item => `<div style="flex:1;min-width:100px;background:#EDE7DC;border-radius:7px;padding:9px 11px">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#1A1612;margin-bottom:3px">${item.lbl}</div>
    <div style="font-size:13px;font-weight:700;color:#1A2D45">${item.val}</div>
  </div>`).join("")}
</div>

<div class="section-label">Évolution du crédit — jalons clés</div>
<table class="tbl">
  <thead><tr>
    <th>Année</th>
    <th class="r">Capital restant dû</th>
    <th class="r">Intérêts cumulés</th>
    <th class="r">Capital remboursé</th>
    <th class="r">Annuité</th>
    <th class="r">NOI</th>
    <th class="r">DSCR</th>
  </tr></thead>
  <tbody>
    ${keyYears.map(yr => {
      const ro = rows.find(r => r.year === yr);
      if (!ro) return "";
      const dscrYr = serviceDebt > 0 ? noi / serviceDebt : 0;
      const dscrC = dscrYr >= 1.3 ? "#1A7A52" : dscrYr >= 1.0 ? "#B08A2A" : "#B03A2A";
      const capitalCumul = montantCredit - (yr <= duree ? ro.capitalFin : 0);
      const interetsCumul = rows.filter(r => r.year <= yr && r.year <= duree).reduce((s, r) => s + r.interetsAnnee, 0);
      return `<tr>
        <td class="can">An ${yr}</td>
        <td class="r">${yr <= duree ? fE(ro.capitalFin) : "—"}</td>
        <td class="r">${yr <= duree ? fE(interetsCumul) : "—"}</td>
        <td class="r">${yr <= duree ? fE(capitalCumul) : "—"}</td>
        <td class="r">${yr <= duree ? fE(serviceDebt) : "—"}</td>
        <td class="r">${fE(noi)}</td>
        <td class="r" style="color:${dscrC};font-weight:700">${yr <= duree ? fX(dscrYr, 2) + "x" : "—"}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>

<div class="note" style="margin-top:8px">
  <strong>DSCR constant :</strong> En l'absence de revalorisation des loyers et des charges, le NOI et la dette restent fixes, donc le DSCR demeure stable sur toute la durée du crédit. Le DSCR ici calculé est de <strong style="color:${dscrColor}">${fX(dscr, 2)}x</strong> (${dscrLabel}). Un DSCR &gt; 1,20x est généralement requis par les établissements bancaires.
</div>
</div>

<!-- PAGE 7 — RATIOS BANCAIRES -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">6.</span>Ratios bancaires et indicateurs financiers</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
  ${[
    {
      lbl: "DSCR — Couverture du service de la dette",
      val: fX(dscr, 2) + "x",
      formula: "NOI / service de la dette",
      detail: `NOI ${fE(noi)} / Service ${fE(serviceDebt)}`,
      note: dscr >= 1.3 ? "Solide — capacité de remboursement confortable" : dscr >= 1.0 ? "Acceptable — surveillance recommandée" : "Insuffisant — risque de défaut",
      color: dscrColor,
    },
    {
      lbl: "Debt Yield",
      val: fP(debtYield, 2),
      formula: "NOI / montant du crédit",
      detail: `NOI ${fE(noi)} / Crédit ${fE(montantCredit)}`,
      note: debtYield >= 8 ? "Bon — rendement net supérieur au coût de la dette" : debtYield >= 5 ? "Correct" : "Faible — attention au coût de la dette",
      color: debtYield >= 8 ? "#1A7A52" : debtYield >= 5 ? "#B08A2A" : "#B03A2A",
    },
    {
      lbl: "LTC — Loan-to-Cost",
      val: fP(ltc, 1),
      formula: "Crédit / coût total projet",
      detail: `Crédit ${fE(montantCredit)} / Coût ${fE(investTotal)}`,
      note: ltc <= 80 ? "Sain — apport personnel significatif" : ltc <= 90 ? "Acceptable" : "Élevé — apport faible",
      color: ltc <= 80 ? "#1A7A52" : ltc <= 90 ? "#B08A2A" : "#B03A2A",
    },
    {
      lbl: "Dette / Prix d'achat",
      val: fP(detteSurPrix, 1),
      formula: "Crédit / prix d'achat",
      detail: `Crédit ${fE(montantCredit)} / Prix ${fE(prix)}`,
      note: detteSurPrix <= 100 ? "Normal — dette inférieure ou égale au prix" : "Attention — crédit supérieur au prix d'achat",
      color: detteSurPrix <= 100 ? "#1A7A52" : "#B03A2A",
    },
    {
      lbl: "Cash-flow avant impôt",
      val: fE(cfAvantImpot / 12) + "/mois",
      formula: "NOI − service de la dette",
      detail: `NOI ${fE(noi)} − Service ${fE(serviceDebt)}`,
      note: cfAvantImpot >= 0 ? "Positif — effort d'épargne nul" : "Négatif — effort mensuel de " + fE(-cfAvantImpot / 12),
      color: cfAvantImpot >= 0 ? "#1A7A52" : "#B03A2A",
    },
    {
      lbl: "Cash-flow après impôt",
      val: fE(cfApresImpot / 12) + "/mois",
      formula: "Cash-flow avant impôt − fiscalité",
      detail: `Cash-flow ${fE(cfAvantImpot / 12)} − Impôt ${fE((isMicro ? impotBIC : impotReel) / 12)}`,
      note: cfApresImpot >= 0 ? "Positif — flux net après impôt favorable" : "Négatif — coût de portage de " + fE(-cfApresImpot / 12) + "/mois",
      color: cfApresImpot >= 0 ? "#1A7A52" : "#B03A2A",
    },
  ].map(item => `<div style="background:#EDE7DC;border-radius:8px;padding:12px 14px;border-left:3px solid ${item.color}">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1A2D45;margin-bottom:5px">${item.lbl}</div>
    <div style="font-size:20px;font-weight:800;color:${item.color};margin-bottom:4px">${item.val}</div>
    <div style="font-size:8px;color:#1A1612;margin-bottom:2px">${item.formula}</div>
    <div style="font-size:8px;color:#1A1612;margin-bottom:4px">${item.detail}</div>
    <div style="font-size:8px;font-style:italic;color:${item.color}">${item.note}</div>
  </div>`).join("")}
</div>

<div class="beige-note">
  <strong>Grilles d'analyse bancaires (indicatif) :</strong> DSCR &gt; 1,20x (solide &gt; 1,30x) · Debt Yield &gt; 6–8 % · LTC &lt; 80 % recommandé · Cash-flow avant impôt &gt; 0. Ces seuils varient selon les établissements prêteurs. La solidité globale du dossier dépend aussi du profil de l'emprunteur (revenus, endettement global, patrimoine).
</div>
</div>

<!-- PAGE 8 — FISCALITÉ -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">7.</span>Fiscalité — ${regimeLabel}</h2>

${isMicro ? `
<div style="background:#EDE7DC;border-radius:8px;padding:14px;margin-bottom:14px">
  <div style="font-size:10px;font-weight:700;color:#1A2D45;margin-bottom:6px">Principe du Micro-BIC</div>
  <div style="font-size:9.5px;line-height:1.7;color:#1A1612">En Micro-BIC, un <strong>abattement forfaitaire de ${isSaisonnier ? "30" : "50"} %</strong> est appliqué sur l'ensemble des loyers perçus. La base imposable est taxée au taux global TMI + Prélèvements Sociaux. Ce régime ne permet pas de déduire les charges réelles ni les amortissements, mais offre une grande simplicité déclarative.</div>
</div>

<div class="section-label">Calcul fiscal — Année 1</div>
<table class="tbl" style="margin-bottom:14px;max-width:400px">
  <tbody>
    <tr><td class="lbl">Loyers imposables bruts</td><td class="r">${fE(loyerAnnuel)}</td></tr>
    <tr><td class="lbl">− Abattement forfaitaire ${isSaisonnier ? "30" : "50"} %</td><td class="r" style="color:#B03A2A">−${fE(loyerAnnuel * abattPct)}</td></tr>
    <tr class="sep"><td class="lbl">= Base imposable</td><td class="r">${fE(baseBIC)}</td></tr>
    <tr><td class="lbl">Impôt IR (TMI ${tmi} %)</td><td class="r">${fE(impotBIC * tmi / (tmi + 18.6))}</td></tr>
    <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotBIC * 18.6 / (tmi + 18.6))}</td></tr>
    <tr class="total"><td>= Fiscalité totale</td><td class="r" style="color:${impotBIC === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotBIC)}/an · ${fE(impotBIC / 12)}/mois</td></tr>
  </tbody>
</table>
` : `
<div style="background:#EDE7DC;border-radius:8px;padding:14px;margin-bottom:14px">
  <div style="font-size:10px;font-weight:700;color:#1A2D45;margin-bottom:6px">Principe du régime réel simplifié</div>
  <div style="font-size:9.5px;line-height:1.7;color:#1A1612">Au régime réel, les <strong>charges réelles</strong> (intérêts, assurance, charges locatives) sont déductibles, ainsi que les <strong>amortissements</strong> par composants. Le résultat net peut être <strong>reporté sans limitation</strong> en cas de déficit imputable sur les loyers. L'avantage fiscal majeur : les amortissements réduisent la base imposable pendant de nombreuses années sans sortie de trésorerie.</div>
</div>

<div class="two-col">
  <div>
    <div class="section-label">Calcul fiscal — Année 1</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Loyers imposables</td><td class="r">${fE(loyerAnnuel)}</td></tr>
        <tr><td class="lbl">− Charges déductibles</td><td class="r" style="color:#B03A2A">−${fE(chargesAnnuelles)}</td></tr>
        <tr><td class="lbl">− Intérêts d'emprunt</td><td class="r" style="color:#B03A2A">−${fE(interetsAnnee1)}</td></tr>
        ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">− Assurance emprunteur</td><td class="r" style="color:#B03A2A">−${fE(assuranceEmprunteurAnnuel)}</td></tr>` : ""}
        <tr class="sep"><td class="lbl">= Résultat avant amort.</td><td class="r">${fE(resultatAvantAmort)}</td></tr>
        <tr style="background:rgba(139,26,26,0.04)"><td class="lbl" style="font-weight:700;color:#8B1A1A">− Amortissements an. 1</td><td class="r" style="font-weight:700;color:#8B1A1A">−${fE(amortTotalAn1)}</td></tr>
        <tr class="total"><td>= Base imposable</td><td class="r" style="color:${baseImposableReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(baseImposableReel)}</td></tr>
        <tr><td class="lbl">Impôt IR (TMI ${tmi} %)</td><td class="r">${fE(impotReel * tmi / (tmi + 18.6))}</td></tr>
        <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotReel * 18.6 / (tmi + 18.6))}</td></tr>
        <tr class="total"><td>= Fiscalité totale</td><td class="r" style="color:${impotReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotReel)}/an</td></tr>
      </tbody>
    </table>
  </div>
  <div>
    <div class="section-label">Plan d'amortissement — Composants</div>
    <table class="tbl">
      <thead><tr><th>Composant</th><th class="r">Valeur</th><th class="r">Durée</th><th class="r">Amort./an</th></tr></thead>
      <tbody>
        ${annexeCols.map(c => `<tr><td class="lbl">${c.label}</td><td class="r">${fE(c.initial)}</td><td class="r">${c.duree} ans</td><td class="r"><strong>${fE(c.annuel)}</strong></td></tr>`).join("")}
        <tr><td class="lbl" style="color:#1A1612">Terrain (non amort.)</td><td class="r" style="color:#1A1612">${fE(terrainVal)}</td><td class="r">—</td><td class="r">0 €</td></tr>
        <tr class="total" style="background:rgba(139,26,26,0.06)"><td style="color:#8B1A1A;font-weight:700">Total an. 1</td><td class="r">${fE(prix)}</td><td></td><td class="r" style="color:#8B1A1A;font-weight:700">${fE(amortTotalAn1)}/an</td></tr>
      </tbody>
    </table>
    <div class="beige-note" style="margin-top:8px">
      <strong>Part amortissable :</strong> ${amortPct} % du prix (${fE(valeurAmortissable)}). Les ${100 - amortPct} % restants (${fE(terrainVal)}) représentent le terrain.
    </div>
  </div>
</div>
`}
</div>

<!-- PAGE 9 — PROJECTION ET STRESS TEST -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">8.</span>Projection synthétique et scénarios de stress</h2>

<div class="section-label" style="margin-bottom:6px">Projection aux jalons clés</div>
<table class="tbl" style="margin-bottom:14px">
  <thead><tr>
    <th>Année</th>
    <th class="r">Capital restant dû</th>
    <th class="r">Capital remb. cumulé</th>
    ${!isMicro ? `<th class="r">Amortissement</th>` : ""}
    <th class="r">Base imposable</th>
    <th class="r">Impôt</th>
    <th class="r">Cash-flow avant impôt/mois</th>
    <th class="r">Cash-flow après impôt/mois</th>
  </tr></thead>
  <tbody>
    ${keyYears.map(yr => {
      const ro = rows.find(r => r.year === yr);
      if (!ro) return "";
      const bicBase = loyerAnnuel * (1 - abattPct);
      const bicImpot = bicBase * (tmi / 100 + 0.186);
      const impotYr = isMicro ? bicImpot : ro.impot;
      const cfAv = (noi - (yr <= duree ? serviceDebt : 0)) / 12;
      const cfAp = cfAv - impotYr / 12;
      const capitalCumul = montantCredit - (yr <= duree ? ro.capitalFin : 0);
      return `<tr>
        <td class="can">An ${yr}</td>
        <td class="r">${yr <= duree ? fE(ro.capitalFin) : "—"}</td>
        <td class="r">${yr <= duree ? fE(capitalCumul) : fE(montantCredit)}</td>
        ${!isMicro ? `<td class="r">${fE(ro.amortTotalA)}</td>` : ""}
        <td class="r" style="color:${(isMicro ? bicBase : ro.baseImposable) === 0 ? "#1A7A52" : "#B03A2A"}">${fE(isMicro ? bicBase : ro.baseImposable)}</td>
        <td class="r" style="color:${impotYr === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotYr)}</td>
        <td class="r" style="color:${cfAv >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAv)}</td>
        <td class="r" style="color:${cfAp >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:700">${fE(cfAp)}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>

<div class="section-label" style="margin-bottom:6px">Scénarios de stress — impact d'une baisse des loyers</div>
<table class="tbl">
  <thead><tr>
    <th>Scénario</th>
    <th class="r">Loyers annuels</th>
    <th class="r">NOI</th>
    <th class="r">DSCR</th>
    <th class="r">Cash-flow avant impôt/mois</th>
    <th class="r">Fiscalité</th>
    <th class="r">Cash-flow après impôt/mois</th>
  </tr></thead>
  <tbody>
    ${[
      { label: "Base (100 %)", pct: 1.00, color: "#1A2D45" },
      { label: "Stress −5 % (95 %)", pct: 0.95, color: "#B08A2A" },
      { label: "Stress −10 % (90 %)", pct: 0.90, color: "#B03A2A" },
      { label: "Stress −20 % (80 %)", pct: 0.80, color: "#B03A2A" },
    ].map((sc, i) => {
      const loyerSc = loyerAnnuel * sc.pct;
      const noiSc = loyerSc - chargesAnnuelles;
      const dscrSc = serviceDebt > 0 ? noiSc / serviceDebt : 0;
      const dscrScC = dscrSc >= 1.3 ? "#1A7A52" : dscrSc >= 1.0 ? "#B08A2A" : "#B03A2A";
      const cfAvSc = (noiSc - serviceDebt) / 12;
      let fiscSc = 0;
      if (isMicro) {
        fiscSc = loyerSc * (1 - abattPct) * (tmi / 100 + 0.186);
      } else {
        const resAvAmortSc = loyerSc - chargesDeductibles;
        const baseImposSc = Math.max(0, resAvAmortSc - amortTotalAn1);
        fiscSc = baseImposSc * (tmi / 100 + 0.186);
      }
      const cfApSc = cfAvSc - fiscSc / 12;
      return `<tr style="background:${i % 2 === 0 ? "transparent" : "rgba(74,159,202,.04)"}">
        <td class="lbl" style="font-weight:600;color:${sc.color}">${sc.label}</td>
        <td class="r">${fE(loyerSc)}</td>
        <td class="r" style="color:${noiSc >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(noiSc)}</td>
        <td class="r" style="color:${dscrScC};font-weight:700">${fX(dscrSc, 2)}x</td>
        <td class="r" style="color:${cfAvSc >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAvSc)}</td>
        <td class="r">${fE(fiscSc)}</td>
        <td class="r" style="color:${cfApSc >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:700">${fE(cfApSc)}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>

<div class="note" style="margin-top:8px">
  <strong>Lecture des stress tests :</strong> Ces scénarios simulent l'impact d'une vacance locative partielle ou d'une baisse des loyers de marché. Le DSCR en dessous de 1,00x indique que le NOI ne couvre plus le service de la dette. Le seuil de rupture du DSCR est atteint lorsque les loyers baissent de ${serviceDebt > 0 && loyerAnnuel > 0 ? fP(Math.max(0, (1 - (serviceDebt + chargesAnnuelles) / loyerAnnuel) * 100), 1) : "—"}.
</div>
</div>

<!-- PAGE 10 — REVENTE ET RÉFÉRENCES -->
<div class="page">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch"><span class="num">9.</span>Scénario de revente et cadre fiscal</h2>

<div style="background:#EDE7DC;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:9.5px;line-height:1.7">
  ${isMicro
    ? `<strong>Plus-value en Micro-BIC :</strong> Aucun amortissement n'est réintégré dans l'assiette de plus-value. Plus-value brute = prix de vente − prix d'acquisition initial. Exonération Impôt sur le Revenu totale à 22 ans, Prélèvements sociaux totaux à 30 ans.`
    : `<strong>Plus-value en régime réel (Loi de finances 2025) :</strong> Les amortissements déduits fiscalement sont <strong>réintégrés</strong> dans le calcul de la plus-value imposable. Plus-value brute = prix de vente − (prix d'acquisition − amortissements cumulés déduits). Exonération Impôt sur le Revenu totale à 22 ans, Prélèvements sociaux totaux à 30 ans.`
  }
</div>

${(() => {
  const abattIR = (N: number) => N < 6 ? 0 : N >= 22 ? 1 : (N - 5) * 0.06;
  const abattPS = (N: number) => {
    if (N < 6) return 0;
    if (N >= 30) return 1;
    if (N >= 22) return 0.28 + (N - 22) * 0.09;
    return (N - 5) * 0.0165;
  };
  // Amortissements cumulés (réintégration Loi de finances 2025)
  const amortCumulByYear2: Record<number, number> = {};
  let cumul2 = 0;
  for (const ro of rows) { cumul2 += ro.amortTotalA; amortCumulByYear2[ro.year] = cumul2; }
  const reventeYears = [10, 20, 30];
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
    ${reventeYears.map(yr => {
      const abIR = abattIR(yr);
      const abPS = abattPS(yr);
      const ro = rows.find(r => r.year === yr) ?? rows[rows.length - 1];
      const crd = yr <= duree ? (ro?.capitalFin ?? 0) : 0;
      const amortCumul2 = isMicro ? 0 : (amortCumulByYear2[yr] ?? amortCumulByYear2[Math.max(...Object.keys(amortCumulByYear2).map(Number).filter(k => k <= yr))] ?? 0);
      const prixVentePlus = investTotal * 1.01 ** yr;
      const pvBrutePlus = Math.max(0, prixVentePlus - investTotal + amortCumul2);
      const taxIR = pvBrutePlus * (1 - abIR) * 0.19;
      const taxPS = pvBrutePlus * (1 - abPS) * 0.172;
      const net = prixVentePlus - crd - taxIR - taxPS;
      return `<div style="background:#EDE7DC;border-radius:8px;overflow:hidden">
        <div style="background:#1A2D45;color:#F5F0E8;padding:8px 12px;font-size:11px;font-weight:700">Revente à ${yr} ans</div>
        <div style="padding:10px 12px;font-size:9px">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>Abatt. IR (19 %)</span><span style="font-weight:700">${Math.round(abIR * 100)} %${abIR >= 1 ? " ✓" : ""}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Abatt. Prél. sociaux (17,2 %)</span><span style="font-weight:700">${Math.round(abPS * 100)} %${abPS >= 1 ? " ✓" : ""}</span></div>
          <div style="font-size:8px;color:#1A1612;margin-bottom:4px;font-style:italic">Scénario +1 %/an :</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>Prix de vente</span><span>${fE(prixVentePlus)}</span></div>
          ${crd > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>− Crédit restant dû</span><span style="color:#B03A2A">−${fE(crd)}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>− Impôt plus-value IR</span><span style="color:${taxIR > 0 ? "#B03A2A" : "#1A7A52"}">${taxIR > 0 ? "−" + fE(taxIR) : "0 € ✓"}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span>− Prélèvements sociaux</span><span style="color:${taxPS > 0 ? "#B03A2A" : "#1A7A52"}">${taxPS > 0 ? "−" + fE(taxPS) : "0 € ✓"}</span></div>
          <div style="display:flex;justify-content:space-between;background:#1A2D45;color:#F5F0E8;padding:5px 7px;border-radius:4px;margin-top:4px;font-weight:700"><span>Net dans la poche</span><span style="color:${net >= 0 ? "#4ADE80" : "#FCA5A5"}">${fE(net)}</span></div>
        </div>
      </div>`;
    }).join("")}
  </div>`;
})()}

<div class="section-label" style="margin-bottom:6px">Paramètres de la simulation</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:9px">
  ${[
    ["Régime fiscal", regimeLabel],
    ["TMI investisseur", tmi + " %"],
    ["Prix d'achat", fE(prix)],
    ["Coût total projet", fE(investTotal)],
    ["Loyer mensuel HC", fE(loyerAnnuel / 12)],
    ["Taux d'emprunt", f.taux + " %"],
    ["Durée crédit", duree + " ans"],
    ["Mensualité", fE(mensualite) + "/mois"],
    !isMicro ? ["Amortissement bien", amortPct + " % sur " + (amortMode === "ensemble" ? amortDureeEnsemble + " ans" : "composants")] : ["Abattement forfaitaire", isSaisonnier ? "30 %" : "50 %"],
    ["Horizon de projection", totalYears + " ans"],
  ].filter(Boolean).map(([k, v]) => `<div style="background:#EDE7DC;border-radius:5px;padding:6px 10px;display:flex;justify-content:space-between"><span style="color:#1A1612">${k}</span><span style="font-weight:600">${v}</span></div>`).join("")}
</div>

<div class="beige-note" style="margin-top:12px;font-size:8.5px">
  <strong>Références réglementaires :</strong> LMNP — Art. 35 bis et 156 I bis CGI · Abattements plus-value : Art. 150 VC CGI · Amortissements : Art. 39 C CGI et jurisprudence BOFiP · Micro-BIC : Art. 50-0 CGI (seuil 77 700 €/an 2025) · Prélèvements sociaux : Art. L136-6 CSS (17,2 % sur revenus du patrimoine depuis 2018). Simulation établie le ${today} — indicative uniquement.
</div>
</div>

<!-- ANNEXE A — PROJECTION DÉTAILLÉE (paysage) -->
<div class="page landscape">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch">Annexe A — Projection détaillée sur ${totalYears} ans</h2>
<p style="font-size:9px;color:#1A1612;margin-bottom:8px">${isMicro ? `Micro-BIC · Abattement ${isSaisonnier ? "30" : "50"} % constant · Loyers et charges supposés constants` : "Régime réel simplifié · Amortissement variable · Loyers et charges constants"}</p>

${isMicro ? (() => {
  const bicBase = loyerAnnuel * (1 - abattPct);
  const bicImpot = bicBase * (tmi / 100 + 0.186);
  return `<table class="tbl">
  <thead><tr>
    <th class="can">An</th>
    <th class="r" style="font-size:8px">Capital restant dû</th>
    <th class="r" style="font-size:8px">Annuité</th>
    <th class="r" style="font-size:8px">Intérêts</th>
    <th class="r" style="font-size:8px">Capital remb.</th>
    <th class="r" style="font-size:8px">Charges</th>
    <th class="r" style="font-size:8px">Base BIC</th>
    <th class="r" style="font-size:8px">Impôt</th>
    <th class="r" style="font-size:8px">Cash-flow av. impôt/mois</th>
    <th class="r" style="font-size:8px">Cash-flow ap. impôt/mois</th>
  </tr></thead>
  <tbody>
    ${rows.map(ro => {
      const cfAv = (noi - (ro.year <= duree ? serviceDebt : 0)) / 12;
      const cfAp = cfAv - bicImpot / 12;
      return `<tr>
        <td class="can" style="font-size:8.5px">${ro.year}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.capitalFin) : "—"}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.creditAnnuelR) : "—"}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.interetsAnnee) : "—"}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.capitalRembourse) : "—"}</td>
        <td class="r" style="font-size:8.5px">${fE(chargesAnnuelles)}</td>
        <td class="r" style="font-size:8.5px;color:#B03A2A">${fE(bicBase)}</td>
        <td class="r" style="font-size:8.5px;color:${bicImpot === 0 ? "#1A7A52" : "#B03A2A"}">${fE(bicImpot)}</td>
        <td class="r" style="font-size:8.5px;color:${cfAv >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAv)}</td>
        <td class="r" style="font-size:8.5px;color:${cfAp >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fE(cfAp)}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>`;
})() : `<table class="tbl">
  <thead><tr>
    <th class="can">An</th>
    <th class="r" style="font-size:8px">Capital restant dû</th>
    <th class="r" style="font-size:8px">Annuité</th>
    <th class="r" style="font-size:8px">Intérêts</th>
    <th class="r" style="font-size:8px">Capital remb.</th>
    <th class="r" style="font-size:8px">Charges</th>
    <th class="r" style="font-size:8px">Résultat av. amort.</th>
    <th class="r" style="font-size:8px">Amort. déduit</th>
    <th class="r" style="font-size:8px">Base imposable</th>
    <th class="r" style="font-size:8px">Impôt</th>
    <th class="r" style="font-size:8px">Cash-flow av./mois</th>
    <th class="r" style="font-size:8px">Cash-flow ap./mois</th>
  </tr></thead>
  <tbody>
    ${rows.map(ro => {
      const cfAv = (noi - (ro.year <= duree ? serviceDebt : 0)) / 12;
      const cfAp = cfAv - ro.impot / 12;
      return `<tr>
        <td class="can" style="font-size:8.5px">${ro.year}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.capitalFin) : "—"}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.creditAnnuelR) : "—"}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.interetsAnnee) : "—"}</td>
        <td class="r" style="font-size:8.5px">${ro.year <= duree ? fE(ro.capitalRembourse) : "—"}</td>
        <td class="r" style="font-size:8.5px">${fE(chargesAnnuelles)}</td>
        <td class="r" style="font-size:8.5px">${fE(ro.resultatAvantAmort)}</td>
        <td class="r" style="font-size:8.5px;font-weight:600">${fE(ro.amortDisponible)}${ro.reportNplus1 > 0 ? `<div style="font-size:7px;color:#B08A2A">→N+1:${fE(ro.reportNplus1)}</div>` : ""}</td>
        <td class="r" style="font-size:8.5px;color:${ro.baseImposable === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fE(ro.baseImposable)}</td>
        <td class="r" style="font-size:8.5px;color:${ro.impot === 0 ? "#1A7A52" : "#B03A2A"}">${fE(ro.impot)}</td>
        <td class="r" style="font-size:8.5px;color:${cfAv >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cfAv)}</td>
        <td class="r" style="font-size:8.5px;color:${cfAp >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fE(cfAp)}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>`}
</div>

${!isMicro && annexeCols.length > 0 ? `
<!-- ANNEXE B — AMORTISSEMENT DÉTAILLÉ (paysage, réel uniquement) -->
<div class="page landscape">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Dossier de Financement · LMNP</div></div><div class="hdr-right">${today} · ${regimeLabel}</div></div>
<h2 class="ch">Annexe B — Plan d'amortissement détaillé par composant</h2>

<table class="tbl" style="font-size:${afs}px">
  <thead>
    <tr>
      <th class="can" rowspan="2" style="font-size:8.5px">An</th>
      ${annexeBHeaderCols}
      <th rowspan="2" style="background:#4A9FCA;color:#1A2D45;font-size:8.5px;text-align:center;padding:5px">Total<br>/an</th>
    </tr>
    <tr>${annexeBHeaderSub}</tr>
  </thead>
  <tbody>${annexeBRows}</tbody>
</table>

<div class="beige-note" style="margin-top:10px">
  <strong>Récapitulatif des composants :</strong>
  <table class="tbl" style="margin-top:6px">
    <thead><tr><th>Composant</th><th class="r">Valeur initiale</th><th class="r">Durée</th><th class="r">Dotation annuelle</th></tr></thead>
    <tbody>
      ${annexeCols.map(c => `<tr><td class="lbl">${c.label}</td><td class="r">${fE(c.initial)}</td><td class="r">${c.duree} ans</td><td class="r"><strong>${fE(c.annuel)}</strong></td></tr>`).join("")}
      <tr><td class="lbl" style="color:#1A1612">Terrain (non amortissable)</td><td class="r" style="color:#1A1612">${fE(terrainVal)}</td><td class="r">—</td><td class="r">0 €</td></tr>
      <tr class="total"><td>Total an. 1</td><td class="r">${fE(annexeCols.reduce((s, c) => s + c.initial, 0))}</td><td></td><td class="r">${fE(amortTotalAn1)}</td></tr>
    </tbody>
  </table>
</div>
</div>` : ""}

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

  const generatePdf = (choix: "synthese-pdf" | "banque-pdf" | "resume-pdf") => {
    if (!form || !resultats) return;
    const html = choix === "banque-pdf"
      ? buildBanquePdfHtml(form, resultats, getBienInfo())
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
      <div className="flex flex-col items-center flex-1 px-6 py-10" style={{ maxWidth: 620, margin: "0 auto", width: "100%" }}>

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
        <div className="w-full mb-10" style={{ height: "1.5px", background: "rgba(26,22,18,0.1)" }} />

        {/* BOTTOM — rapport prêt + buttons */}
        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: "#1A7A52", color: "#fff" }}>✓</div>
            <h1 className="font-bold" style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: "#4E1F12", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Votre rapport est prêt
            </h1>
          </div>

          {/* 3 boutons : empilés sur mobile, en colonnes égales dès md */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Rapport Invest */}
            <button onClick={() => generatePdf("resume-pdf")}
              className="rounded-xl flex items-center gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "#1A4A35", padding: "16px 20px", border: "none", cursor: "pointer", minHeight: 72 }}>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#2ECC71", color: "#1A4A35" }}>PDF</span>
              <span className="text-sm font-bold leading-snug flex-1" style={{ color: "#F5F0E8" }}>
                Rapport<br />Invest
              </span>
              <span style={{ color: "#2ECC71", fontSize: 18, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>→</span>
            </button>

            {/* Synthèse PDF */}
            <button onClick={() => generatePdf("synthese-pdf")}
              className="rounded-xl flex items-center gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "#6B2D12", padding: "16px 20px", border: "none", cursor: "pointer", minHeight: 72 }}>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#C95B2A", color: "#F5F0E8" }}>PDF</span>
              <span className="text-sm font-bold leading-snug flex-1" style={{ color: "#F5F0E8" }}>
                Synthèse<br />d&apos;investissement
              </span>
              <span style={{ color: "#C95B2A", fontSize: 18, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>→</span>
            </button>

            {/* Banque PDF */}
            <button onClick={() => generatePdf("banque-pdf")}
              className="rounded-xl flex items-center gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "#1A2D45", padding: "16px 20px", border: "none", cursor: "pointer", minHeight: 72 }}>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#4A9FCA", color: "#1A2D45" }}>PDF</span>
              <span className="text-sm font-bold leading-snug flex-1" style={{ color: "#F5F0E8" }}>
                Synthèse financière<br />– Banque
              </span>
              <span style={{ color: "#4A9FCA", fontSize: 18, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>→</span>
            </button>

          </div>
        </div>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

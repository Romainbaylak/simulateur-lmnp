"use client";

import { useState, useEffect, useRef } from "react";
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
import PopupBienInfo, { defaultBienInfo, type BienInfo } from "@/components/PopupBienInfo";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export default function RapportInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "ready" | "done" | "expired" | "used">("loading");
  const [form, setForm] = useState<SimulationForm | null>(null);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [showBienPopup, setShowBienPopup] = useState(false);
  const [initialBienInfo, setInitialBienInfo] = useState<BienInfo>(defaultBienInfo);

  const amortPctRef = useRef(85);
  const amortModeRef = useRef<"ensemble" | "composant">("ensemble");
  const amortDureeEnsembleRef = useRef(25);
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

      const loyer = parseFloat(data.form.loyer) || 0;
      const res = computeResultats(data.form, loyer, data.amortPct, data.amortMode, data.amortDureeEnsemble, composantsRef.current);
      setForm(data.form);
      setResultats(res);
      setInitialBienInfo({
        type: data.form.type === "ma" ? "ma" : "ap",
        ville: data.form.villeLabel || "",
        surface: data.form.surface || "",
        description: "",
      });
      sessionStorage.setItem(usedKey, "1");
      sessionStorage.removeItem("lmnp_simulation_data");
      setStatus("done");
    } catch { setStatus("expired"); }
  }, [sessionId, router]);

  const handleOpenPdf = () => setShowBienPopup(true);

  const openPdfWithInfo = (bienInfo: BienInfo) => {
    setShowBienPopup(false);
    if (!form || !resultats) return;
    const html = buildPdfHtml(form, resultats, bienInfo);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 800); }
  };

  // ─── PDF BUILDER ────────────────────────────────────────────────────────────
  const buildPdfHtml = (f: SimulationForm, res: Resultats, bienInfo: BienInfo): string => {
    const amortPct = amortPctRef.current;
    const amortMode = amortModeRef.current;
    const amortDureeEnsemble = amortDureeEnsembleRef.current;
    const composants = composantsRef.current;
    const isSaisonnier = isSaisonnierRef.current;
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
      const amortMobilierA = year <= 7 ? mobilier / 7 : 0;
      const amortTravauxA = year <= 15 ? travaux / 15 : 0;
      const amortNotaireA = year <= 20 ? notaire / 20 : 0;
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
    if (mobilier > 0) annexeCols.push({ label: "Mobilier", annuel: mobilier / 7, duree: 7, initial: mobilier });
    if (travaux > 0) annexeCols.push({ label: "Travaux", annuel: travaux / 15, duree: 15, initial: travaux });
    if (notaire > 0) annexeCols.push({ label: "Frais notaire", annuel: notaire / 20, duree: 20, initial: notaire });

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
        if (yr <= 7 && mobilier > 0) a += mobilier / 7;
        if (yr <= 15 && travaux > 0) a += travaux / 15;
        if (yr <= 20 && notaire > 0) a += notaire / 20;
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

    // Saisonnier scenarios
    const saisonnierHtml = isSaisonnier && resultatsTriple ? (() => {
      const scenarios = [
        { label: "Estimation basse", sr: resultatsTriple.bas, taux: tauxOccBas },
        { label: "Estimation moyenne", sr: resultatsTriple.moyen, taux: tauxOccMoyen },
        { label: "Estimation haute", sr: resultatsTriple.haut, taux: tauxOccHaut },
      ];
      const cols = scenarios.map(({ label, sr, taux: t }) => {
        if (!sr) return `<td></td>`;
        const nuits = Math.round(parseFloat(t) / 100 * 365);
        const bic = sr.loyerAnnuel * 0.70;
        const ibic = bic * (tmi / 100 + 0.186);
        return `<td style="padding:10px;background:#EDE7DC;border-radius:6px;vertical-align:top">
          <div style="font-weight:700;font-size:11px;color:#4E1F12;margin-bottom:4px">${label}</div>
          <div style="font-size:9px;color:rgba(26,22,18,0.45);margin-bottom:8px">${t}% · ${nuits} nuits/an · ${fE(parseFloat(prixNuitee) || 0)}/nuit</div>
          <div style="display:flex;gap:16px">
            <div>
              <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.4);margin-bottom:3px">Régime réel</div>
              <div style="font-size:10px">Loyers : <strong>${fE(sr.loyerAnnuel)}</strong></div>
              <div style="font-size:10px">Base : <strong style="color:${sr.baseImposableReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(sr.baseImposableReel)}</strong></div>
              <div style="font-size:10px">Impôt : <strong>${fE(sr.impotReel)}</strong></div>
              <div style="font-size:11px;font-weight:700;color:${sr.cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"};margin-top:4px">CF : ${fE(sr.cashflowReelMensuel)}/mois</div>
            </div>
            <div>
              <div style="font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,0.4);margin-bottom:3px">Micro-BIC</div>
              <div style="font-size:10px">Base : <strong>${fE(bic)}</strong></div>
              <div style="font-size:10px">Impôt : <strong>${fE(ibic)}</strong></div>
              <div style="font-size:11px;font-weight:700;color:${sr.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"};margin-top:4px">CF : ${fE(sr.cashflowBICMensuel)}/mois</div>
            </div>
          </div>
        </td>`;
      }).join("");
      return `<h2 class="ch">Location saisonnière — Comparaison des 3 scénarios (année 1)</h2>
<table style="border-collapse:separate;border-spacing:8px 0"><tr>${cols}</tr></table>`;
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
        return `<td style="font-size:${afs}px;padding:5px 6px;color:rgba(26,22,18,0.2)">—</td><td style="border-right:1px solid rgba(26,22,18,0.07)"></td>`;
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

    const today = new Date().toLocaleDateString("fr-FR");
    const chargesLoyer = parseFloat(f.chargesLoyer ?? "0") || 0;
    const taxeFonciere = parseFloat(f.taxeFonciere) || 0;
    const chargesCopro = parseFloat(f.chargesCopro ?? "0") || 0;

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport LMNP – toutlmnp</title>
<style>
@page{size:A4;margin:14mm 15mm}
*{box-sizing:border-box;margin:0;padding:0}
html{background:#5a5a5a;min-height:100%}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;background:#F5F0E8;
  width:794px;min-height:1123px;margin:20px auto;padding:14mm 15mm;font-size:11px;line-height:1.55;
  box-shadow:0 8px 40px rgba(0,0,0,0.5);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pb{page-break-before:always;padding-top:4px}
.hdr{display:flex;align-items:center;justify-content:space-between;background:#4E1F12;color:#F5F0E8;
  padding:10px 16px;border-radius:6px;margin-bottom:18px}
.hdr-brand{display:flex;align-items:baseline;gap:0}
.hdr-light{font-weight:300;font-size:17px}.hdr-bold{font-weight:700;font-size:17px;color:#C95B2A}
.hdr-sub{font-size:8px;letter-spacing:.12em;opacity:.5;text-transform:uppercase;margin-top:2px}
.hdr-right{font-size:9px;opacity:.5;text-align:right}
h2.ch{font-size:12px;font-weight:700;color:#4E1F12;border-bottom:2px solid #C95B2A;padding-bottom:5px;margin:22px 0 10px;letter-spacing:-.01em}
h2.ch .num{color:#C95B2A;margin-right:5px}
.cover-title{text-align:center;margin:10px 0 20px}
.cover-title h1{font-size:22px;font-weight:700;color:#4E1F12;letter-spacing:-.025em;margin-bottom:5px}
.cover-title .sub{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:rgba(26,22,18,.38)}
.info-grid{display:flex;gap:10px;margin-bottom:14px}
.info-col{flex:1;background:#EDE7DC;border-radius:7px;padding:12px 14px}
.info-col.orange{background:rgba(201,91,42,0.08);border:1px solid rgba(201,91,42,0.2)}
.info-col-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(26,22,18,.4);margin-bottom:10px}
.info-row{margin-bottom:7px}
.info-row:last-child{margin-bottom:0}
.ir-lbl{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:rgba(26,22,18,.4)}
.ir-val{font-size:11px;font-weight:600;color:#1A1612}
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
table.tbl td.lbl{color:rgba(26,22,18,.6);font-size:10px}
table.tbl tr:nth-child(even){background:rgba(201,91,42,.03)}
table.tbl tr.sep td{border-top:1.5px solid rgba(26,22,18,.12);font-weight:700}
table.tbl tr.total td{background:rgba(78,31,18,.07);font-weight:700}
.can{text-align:left!important;font-weight:600;width:24px;white-space:nowrap}
.green{color:#1A7A52}.red{color:#B03A2A}.orange{color:#C95B2A}
.note{background:rgba(201,91,42,.07);border:1px solid rgba(201,91,42,.18);border-radius:6px;padding:10px 13px;font-size:9.5px;line-height:1.65;color:rgba(26,22,18,.65);margin-top:10px}
.note strong{color:#1A1612}
.beige-note{background:#EDE7DC;border-radius:6px;padding:10px 13px;font-size:9.5px;line-height:1.65;color:rgba(26,22,18,.65);margin-top:10px}
.two-col{display:flex;gap:14px}
.two-col > div{flex:1}
.section-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#C95B2A;margin-bottom:6px}
.chart-title{font-size:9px;font-weight:700;color:rgba(26,22,18,.5);text-transform:uppercase;letter-spacing:.08em;margin:14px 0 2px}
.big-result{background:#4E1F12;color:#F5F0E8;border-radius:7px;padding:12px 16px;margin-top:10px;display:flex;align-items:center;gap:12px}
.big-result .lbl{font-size:9px;opacity:.6}
.big-result .val{font-size:16px;font-weight:700;color:#C95B2A}
.bien-badge{display:inline-block;background:#EDE7DC;border-radius:4px;padding:2px 7px;font-size:9px;color:rgba(26,22,18,.55);margin-right:6px}
@media print{
  html{background:none;padding:0}
  body{width:100%;margin:0;padding:14mm 15mm;box-shadow:none}
  .pb{page-break-before:always}
}
</style></head><body>

<!-- ═══════════════════════════════════════════════════════
     PAGE 1 — COUVERTURE / SYNTHÈSE
═══════════════════════════════════════════════════════ -->
<div class="hdr">
  <div>
    <div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div>
    <div class="hdr-sub">Rapport Client · Simulation LMNP</div>
  </div>
  <div class="hdr-right">Généré le ${today}<br>Régime réel simplifié</div>
</div>

<div class="cover-title">
  <h1>Synthèse de votre investissement LMNP</h1>
  <div class="sub">Estimation de la rentabilité, du cash-flow et de la fiscalité du projet</div>
</div>

<div style="background:#EDE7DC;border-radius:7px;padding:10px 14px;margin-bottom:14px;display:flex;gap:16px;flex-wrap:wrap">
  ${bienInfo.type ? `<span class="bien-badge">${bienInfo.type === "ap" ? "🏢 Appartement" : "🏠 Maison"}</span>` : ""}
  ${bienInfo.ville ? `<span class="bien-badge">📍 ${bienInfo.ville}</span>` : ""}
  ${bienInfo.surface ? `<span class="bien-badge">📐 ${bienInfo.surface} m²</span>` : ""}
  ${bienInfo.description ? `<span style="font-size:10px;color:rgba(26,22,18,.5)">${bienInfo.description}</span>` : ""}
  ${!bienInfo.type && !bienInfo.ville && !bienInfo.surface && !bienInfo.description ? `<span style="font-size:10px;color:rgba(26,22,18,.4)">Bien immobilier – simulation LMNP régime réel simplifié</span>` : ""}
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
    <div class="kpi-val" style="color:${cashflowReelMensuel >= 0 ? "#4ADE80" : "#FCA5A5"}">${fE(cashflowReelMensuel)}</div>
    <div class="kpi-unit">année 1 · régime réel</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Capital remboursé année 1</div>
    <div class="kpi-val">${fE(capitalRembourseAn1)}</div>
    <div class="kpi-unit">annuité − intérêts</div>
  </div>
</div>

${saisonnierHtml}

<h2 class="ch">Comparaison des régimes fiscaux – année 1</h2>
<table class="tbl">
  <thead><tr>
    <th>Indicateur</th>
    <th class="r">Régime réel simplifié</th>
    <th class="r">Micro-BIC</th>
  </tr></thead>
  <tbody>
    <tr><td class="lbl">Loyers imposables</td><td class="r">${fE(loyerAnnuel)}</td><td class="r">${fE(loyerAnnuel)}</td></tr>
    <tr><td class="lbl">Charges / abattement</td><td class="r">Charges réelles : ${fE(chargesDeductibles)}</td><td class="r">Abattement 30 % : ${fE(loyerAnnuel * 0.30)}</td></tr>
    <tr><td class="lbl">Amortissements déduits</td><td class="r">${fE(amortTotalAn1)}</td><td class="r">—</td></tr>
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
  <strong>Hypothèse :</strong> Simulation sur ${totalYears} ans en régime réel simplifié. Loyers, charges et valeur du bien supposés constants. L'amortissement est calculé selon les durées fiscalement reconnues. TMI appliquée : <strong>${tmi} %</strong> + prélèvements sociaux <strong>18,6 %</strong>. Cette simulation est indicative et ne constitue pas un conseil fiscal.
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 2 — CHAPITRE 1 : PROJET ET FINANCEMENT
═══════════════════════════════════════════════════════ -->
<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">1.</span>Votre projet et son financement</h2>

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
    <tr><td class="lbl">Apport personnel</td><td class="r">${fE(apport)}</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Non déduit des revenus locatifs</td></tr>
    <tr><td class="lbl">Montant emprunté</td><td class="r">${fE(montantCredit)}</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Base du tableau d'amortissement</td></tr>
    <tr><td class="lbl">Taux nominal · durée</td><td class="r">${f.taux} % · ${duree} ans</td><td></td></tr>
    <tr><td class="lbl">Mensualité hors assurance</td><td class="r">${fE(mensualite)}/mois</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Déduite du cash-flow mais pas fiscalement</td></tr>
    <tr><td class="lbl">Annuité de crédit</td><td class="r">${fE(creditAnnuel)}</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Capital + intérêts annuels</td></tr>
    <tr><td class="lbl">Intérêts année 1</td><td class="r">${fE(interetsAnnee1)}</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Déductibles des revenus locatifs</td></tr>
    <tr><td class="lbl">Capital remboursé année 1</td><td class="r">${fE(capitalRembourseAn1)}</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Non déductible · enrichissement net</td></tr>
    ${coutTotalInteret > 0 ? `<tr><td class="lbl">Coût total estimé des intérêts</td><td class="r">${fE(coutTotalInteret)}</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Sur ${duree} ans</td></tr>` : ""}
    ${assuranceEmprunteurAnnuel > 0 ? `<tr><td class="lbl">Assurance emprunteur</td><td class="r">${fE(assuranceEmprunteurAnnuel)}/an</td><td style="font-size:9px;color:rgba(26,22,18,.45)">Déductible des revenus locatifs</td></tr>` : ""}
  </tbody>
</table>

<div class="note">
  <strong>À retenir :</strong> Seuls les <strong>intérêts d'emprunt</strong> et l'<strong>assurance emprunteur</strong> sont déductibles fiscalement. Le remboursement du capital (${fE(capitalRembourseAn1)}/an en année 1) constitue un enrichissement patrimonial : vous reconstituez votre capital tout au long du crédit.
</div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 3 — CHAPITRE 2 : RENTABILITÉ ET CASH-FLOW
═══════════════════════════════════════════════════════ -->
<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">2.</span>Rentabilité et calcul du cash-flow</h2>

<table class="tbl" style="margin-bottom:14px">
  <thead><tr><th>Indicateur</th><th>Calcul</th><th class="r">Résultat</th></tr></thead>
  <tbody>
    <tr>
      <td class="lbl">Rentabilité brute sur prix d'achat</td>
      <td style="font-size:9px;color:rgba(26,22,18,.45)">${fE(loyerAnnuel)} / ${fE(prix)} × 100</td>
      <td class="r"><strong>${fP((loyerAnnuel / prix) * 100, 2)}</strong></td>
    </tr>
    <tr>
      <td class="lbl">Rentabilité brute acte en main</td>
      <td style="font-size:9px;color:rgba(26,22,18,.45)">${fE(loyerAnnuel)} / ${fE(investTotal)} × 100</td>
      <td class="r"><strong>${fP(rendementBrut, 2)}</strong></td>
    </tr>
    <tr>
      <td class="lbl">Rentabilité nette avant financement</td>
      <td style="font-size:9px;color:rgba(26,22,18,.45)">(${fE(loyerAnnuel)} − ${fE(chargesAnnuelles)}) / ${fE(investTotal)} × 100</td>
      <td class="r"><strong>${fP(rentaNetteAvFinancement, 2)}</strong></td>
    </tr>
    <tr>
      <td class="lbl">Cash-flow avant impôt</td>
      <td style="font-size:9px;color:rgba(26,22,18,.45)">Loyers − crédit − charges − ass. emprunteur</td>
      <td class="r" style="color:${cashflowAvantImpot >= 0 ? "#1A7A52" : "#B03A2A"}"><strong>${fE(cashflowAvantImpot)}/mois</strong></td>
    </tr>
    <tr>
      <td class="lbl">Cash-flow après impôt (an. 1)</td>
      <td style="font-size:9px;color:rgba(26,22,18,.45)">Cash-flow av. impôt − impôt estimé (${fE(impotReel / 12)}/mois)</td>
      <td class="r" style="color:${cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"}"><strong>${fE(cashflowReelMensuel)}/mois</strong></td>
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
    <tr><td class="lbl">− Impôt estimé (année 1)</td><td class="r red">−${fE(impotReel)}</td><td class="r red">−${fE(impotReel / 12)}</td></tr>
    <tr class="total"><td>= Trésorerie nette</td>
      <td class="r" style="color:${cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowReelMensuel * 12)}</td>
      <td class="r" style="color:${cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowReelMensuel)}/mois</td>
    </tr>
  </tbody>
</table>

<div class="note" style="margin-top:12px">
  <strong>Bon à savoir :</strong> Un cash-flow négatif n'est pas nécessairement rédhibitoire. Il mesure la trésorerie mensuelle nette, mais votre investissement crée simultanément de la <strong>valeur patrimoniale</strong> : remboursement de capital (${fE(capitalRembourseAn1)}/an en an. 1), potentielle valorisation du bien et économies fiscales liées aux amortissements. La rentabilité globale s'apprécie sur l'ensemble de la durée de détention.
</div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 4 — CHAPITRE 3 : FISCALITÉ
═══════════════════════════════════════════════════════ -->
<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">3.</span>Fiscalité : calcul de l'impôt estimé</h2>

${isMicro ? `
<div class="section-label" style="margin-bottom:6px">Calcul fiscal – année 1 (Micro-BIC)</div>
<table class="tbl" style="margin-bottom:14px">
  <thead><tr><th>Étape</th><th class="r">Montant</th></tr></thead>
  <tbody>
    <tr><td class="lbl">Revenus locatifs annuels (HC)</td><td class="r">${fE(loyerAnnuel)}</td></tr>
    <tr><td class="lbl">− Abattement forfaitaire (30 %)</td><td class="r red">−${fE(loyerAnnuel * 0.30)}</td></tr>
    <tr class="sep"><td class="lbl">= Base imposable</td><td class="r">${fE(baseBIC)}</td></tr>
    <tr><td class="lbl">Impôt IR estimé (TMI ${tmi} %)</td><td class="r">${fE(impotBIC * (tmi / (tmi + 18.6)))}</td></tr>
    <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotBIC * (18.6 / (tmi + 18.6)))}</td></tr>
    <tr class="total"><td>= Fiscalité totale estimée</td><td class="r" style="color:${impotBIC === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotBIC)}</td></tr>
    <tr class="total"><td>Cash-flow mensuel</td><td class="r" style="color:${cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowBICMensuel)}/mois</td></tr>
  </tbody>
</table>
<div class="note">
  <strong>Comment est calculé l'impôt ?</strong> En Micro-BIC, un abattement forfaitaire de <strong>30 %</strong> est appliqué sur vos revenus. La base imposable restante est taxée au taux global TMI + PS = <strong>${(tmi + 18.6).toFixed(1)} %</strong>. Ce régime est simple mais ne permet pas de déduire les charges réelles ni les amortissements.
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
    <tr><td class="lbl">− Amortissements déduits (an. 1)</td><td class="r red">−${fE(amortTotalAn1)}</td></tr>
    <tr class="total"><td>= Base imposable</td><td class="r" style="color:${baseImposableReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(baseImposableReel)}</td></tr>
    <tr><td class="lbl">Impôt IR estimé (TMI ${tmi} %)</td><td class="r">${fE(impotReel * (tmi / (tmi + 18.6)))}</td></tr>
    <tr><td class="lbl">Prélèvements sociaux (18,6 %)</td><td class="r">${fE(impotReel * (18.6 / (tmi + 18.6)))}</td></tr>
    <tr class="total"><td>= Fiscalité totale estimée</td><td class="r" style="color:${impotReel === 0 ? "#1A7A52" : "#B03A2A"}">${fE(impotReel)}</td></tr>
  </tbody>
</table>

<div class="two-col" style="margin-top:14px">
  <div>
    <div class="section-label">Comparaison Micro-BIC</div>
    <table class="tbl">
      <thead><tr><th>Micro-BIC</th><th class="r">Montant</th></tr></thead>
      <tbody>
        <tr><td class="lbl">Revenus annuels</td><td class="r">${fE(loyerAnnuel)}</td></tr>
        <tr><td class="lbl">− Abattement forfaitaire (30 %)</td><td class="r red">−${fE(loyerAnnuel * 0.30)}</td></tr>
        <tr class="total"><td>= Base imposable</td><td class="r">${fE(baseBIC)}</td></tr>
        <tr><td class="lbl">Fiscalité totale</td><td class="r">${fE(impotBIC)}</td></tr>
        <tr class="total"><td>Cash-flow mensuel</td><td class="r" style="color:${cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fE(cashflowBICMensuel)}/mois</td></tr>
      </tbody>
    </table>
  </div>
  <div>
    <div class="section-label">Économie fiscale du régime réel</div>
    <div style="background:#EDE7DC;border-radius:7px;padding:14px">
      <div style="margin-bottom:10px">
        <div class="ir-lbl">Impôt Micro-BIC</div>
        <div style="font-size:14px;font-weight:700;color:#B03A2A">${fE(impotBIC)}/an</div>
      </div>
      <div style="margin-bottom:10px">
        <div class="ir-lbl">Impôt Régime réel (an. 1)</div>
        <div style="font-size:14px;font-weight:700;color:${impotReel === 0 ? "#1A7A52" : "#C95B2A"}">${fE(impotReel)}/an</div>
      </div>
      <div style="border-top:1.5px solid rgba(26,22,18,.12);padding-top:10px">
        <div class="ir-lbl">Économie fiscale an. 1</div>
        <div style="font-size:16px;font-weight:700;color:#1A7A52">${fE(impotBIC - impotReel)}</div>
      </div>
      ${zerosYears > 0 ? `<div style="margin-top:8px;font-size:9px;color:rgba(26,22,18,.55);line-height:1.5">Base imposable à 0 € pendant <strong>${zerosYears} an${zerosYears > 1 ? "s" : ""}</strong> grâce aux amortissements.</div>` : ""}
    </div>
  </div>
</div>

<div class="note" style="margin-top:12px">
  <strong>Comment est calculé l'impôt ?</strong> TMI (Tranche Marginale d'Imposition) : taux appliqué à votre dernière tranche de revenus — ici <strong>${tmi} %</strong>. Prélèvements Sociaux : <strong>18,6 %</strong> prélevés sur les revenus du patrimoine. Impôt total = base imposable × (TMI + PS) = base × <strong>${(tmi + 18.6).toFixed(1)} %</strong>.
  ${firstTaxRow ? ` En régime réel, vous commencez à payer de l'impôt à partir de l'année <strong>${firstTaxRow.year}</strong> avec une base imposable de ${fE(firstTaxRow.baseImposable)}.` : zerosYears >= totalYears ? " Sur toute la période analysée, la base imposable reste à 0 € grâce aux amortissements reportables." : ""}
</div>
`}
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 5 — CHAPITRE 4 : AMORTISSEMENT (réel uniquement)
═══════════════════════════════════════════════════════ -->
${!isMicro ? `<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">4.</span>L'amortissement, expliqué simplement</h2>

<div style="font-size:10px;line-height:1.7;color:rgba(26,22,18,.65);margin-bottom:14px">
  En LMNP au régime réel, vous pouvez <strong>déduire chaque année une fraction de la valeur du bien de vos revenus locatifs</strong> — c'est l'amortissement. Contrairement aux charges réelles, il ne s'agit pas d'une dépense effective : c'est un avantage fiscal pur. Le terrain (non dégradable) n'est jamais amortissable. Seule la fraction immobilière du bien est amortie, selon des durées reconnues par l'administration fiscale.
</div>

<table class="tbl" style="margin-bottom:6px">
  <thead><tr><th>Composant</th><th class="r">Valeur retenue</th><th class="r">Durée</th><th class="r">Amortissement annuel</th></tr></thead>
  <tbody>
    ${annexeCols.map(c => `<tr><td class="lbl">${c.label}</td><td class="r">${fE(c.initial)}</td><td class="r">${c.duree} ans</td><td class="r"><strong>${fE(c.annuel)}/an</strong></td></tr>`).join("")}
    <tr><td class="lbl" style="color:rgba(26,22,18,.35)">Terrain (non amortissable)</td><td class="r" style="color:rgba(26,22,18,.35)">${fE(terrainVal)}</td><td class="r" style="color:rgba(26,22,18,.35)">—</td><td class="r" style="color:rgba(26,22,18,.35)">0 €</td></tr>
    <tr class="total"><td>Total amortissement annuel (an. 1)</td><td class="r">${fE(prix)}</td><td></td><td class="r">${fE(amortTotalAn1)}/an</td></tr>
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
<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">5.</span>Évolution de l'investissement dans le temps</h2>

<table class="tbl" style="margin-bottom:14px">
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
</table>

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

  const reventeYears = [10, 25, 35];
  const growthScenarios = [
    { label: "Valeur stable (0 %/an)", pct: 0, color: "#6B4226" },
    { label: "Revalorisation +1 %/an", pct: 0.01, color: "#2A7080" },
  ];

  const getRow = (year: number) => rows.find(ro => ro.year === year) ?? rows[rows.length - 1];

  // Build 3 year-cards, each with 2 scenario rows
  const yearCards = reventeYears.map(yr => {
    const abIR = abattIR(yr);
    const abPS = abattPS(yr);
    const exoIRTag = abIR >= 1 ? `<span style="display:inline-block;font-size:7.5px;background:#1A7A52;color:#fff;border-radius:3px;padding:1px 5px;margin-left:6px;font-weight:600">IR exonéré</span>` : abIR > 0 ? `<span style="display:inline-block;font-size:7.5px;background:rgba(176,138,42,0.18);color:#B08A2A;border-radius:3px;padding:1px 5px;margin-left:6px">Abatt. IR ${Math.round(abIR*100)} %</span>` : "";
    const exoPSTag = abPS >= 1 ? `<span style="display:inline-block;font-size:7.5px;background:#1A7A52;color:#fff;border-radius:3px;padding:1px 5px;margin-left:4px;font-weight:600">PS exonérés</span>` : "";
    const row = getRow(yr);
    const crd = yr <= duree ? (row?.capitalFin ?? 0) : 0;
    const scenRows = growthScenarios.map((sc, si) => {
      const prixVente = investTotal * Math.pow(1 + sc.pct, yr);
      const pvBrute = Math.max(0, prixVente - investTotal);
      const taxIR = pvBrute * (1 - abattIR(yr)) * 0.19;
      const taxPS = pvBrute * (1 - abattPS(yr)) * 0.172;
      const impotPV = taxIR + taxPS;
      const net = prixVente - crd - impotPV;
      const netColor = net >= investTotal ? "#1A7A52" : net >= 0 ? "#B08A2A" : "#B03A2A";
      return `<tr style="background:${si === 0 ? "#F5F0E8" : "#EDE7DC"}">
        <td style="padding:7px 10px;font-size:9px;font-weight:600;color:${sc.color};border-right:1px solid rgba(26,22,18,0.08);white-space:nowrap">${sc.label}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:#1A1612;border-right:1px solid rgba(26,22,18,0.08)">${fE(prixVente)}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:${crd > 0 ? "#B03A2A" : "rgba(26,22,18,0.3)"};border-right:1px solid rgba(26,22,18,0.08)">${crd > 0 ? `−${fE(crd)}` : "—"}</td>
        <td style="padding:7px 8px;font-size:9px;text-align:right;color:${impotPV > 0 ? "#B03A2A" : "#1A7A52"};border-right:1px solid rgba(26,22,18,0.08)">${impotPV > 0 ? `−${fE(impotPV)}` : "0 € ✓"}</td>
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
          <th style="padding:6px 10px;font-size:8.5px;font-weight:500;color:rgba(26,22,18,0.45);text-align:left;border-right:1px solid rgba(26,22,18,0.08)">Scénario</th>
          <th style="padding:6px 8px;font-size:8.5px;font-weight:500;color:rgba(26,22,18,0.45);text-align:right;border-right:1px solid rgba(26,22,18,0.08)">Prix de vente</th>
          <th style="padding:6px 8px;font-size:8.5px;font-weight:500;color:rgba(26,22,18,0.45);text-align:right;border-right:1px solid rgba(26,22,18,0.08)">CRD crédit</th>
          <th style="padding:6px 8px;font-size:8.5px;font-weight:500;color:rgba(26,22,18,0.45);text-align:right;border-right:1px solid rgba(26,22,18,0.08)">Impôt PV</th>
          <th style="padding:6px 10px;font-size:8.5px;font-weight:600;color:#4E1F12;text-align:right">Net dans la poche</th>
        </tr></thead>
        <tbody>${scenRows}</tbody>
      </table>
    </div>`;
  }).join("");

  return `<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch"><span class="num">6.</span>Scénarios de revente</h2>

<div style="font-size:10px;line-height:1.7;color:rgba(26,22,18,.65);margin-bottom:16px;background:#EDE7DC;border-radius:7px;padding:12px 14px">
  <strong>Avantage LMNP :</strong> la plus-value est calculée sur la différence entre le prix de vente et le <strong>prix d'acquisition initial</strong> (sans réintégration des amortissements déduits). Les abattements pour durée de détention s'appliquent dès la 6<sup>e</sup> année — <strong>exonération IR totale à 22 ans, PS totale à 30 ans</strong>.
</div>

${yearCards}

<div style="font-size:9px;color:rgba(26,22,18,0.45);line-height:1.7;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
  <div style="background:#EDE7DC;border-radius:6px;padding:9px 11px">
    <div style="font-weight:700;color:#4E1F12;margin-bottom:4px">Abattements IR (taux : 19 %)</div>
    <div>Ans 1–5 : 0 %</div>
    <div>Ans 6–21 : 6 % par an (max 96 %)</div>
    <div>An 22 : + 4 % → <strong>100 % exonéré</strong></div>
  </div>
  <div style="background:#EDE7DC;border-radius:6px;padding:9px 11px">
    <div style="font-weight:700;color:#4E1F12;margin-bottom:4px">Abattements PS (taux : 17,2 %)</div>
    <div>Ans 1–5 : 0 %</div>
    <div>Ans 6–21 : 1,65 % / an · An 22 : 1,6 %</div>
    <div>Ans 23–30 : 9 % / an → <strong>100 % à 30 ans</strong></div>
  </div>
</div>

<div class="beige-note">
  <strong>Hypothèses.</strong> Base d'acquisition : ${fE(investTotal)} (bien + travaux + notaire). La revalorisation s'applique uniformément. Le CRD est déduit si la revente intervient avant la fin du crédit (${duree} ans). Simulation indicative — consulter un expert-comptable LMNP.
</div>
</div>`;
})()}


<!-- ═══════════════════════════════════════════════════════
     ANNEXE A — PROJECTION DÉTAILLÉE (réel uniquement)
═══════════════════════════════════════════════════════ -->
${!isMicro ? `<div class="pb">
<div class="hdr"><div><div class="hdr-brand"><span class="hdr-light">tout</span><span class="hdr-bold">lmnp</span></div><div class="hdr-sub">Rapport Client · Simulation LMNP</div></div><div class="hdr-right">${today}</div></div>
<h2 class="ch">Annexe A — Projection détaillée sur ${totalYears} ans</h2>
<p style="font-size:9px;color:rgba(26,22,18,.4);margin-bottom:8px">Régime réel simplifié · Loyers et charges constants · Amortissement variable selon les durées</p>

<table class="tbl">
  <thead><tr>
    <th class="can">An</th>
    <th class="r" style="font-size:8.5px">CRD fin</th>
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
</table>
</div>` : ""}


<!-- ═══════════════════════════════════════════════════════
     ANNEXE B — AMORTISSEMENT DÉTAILLÉ (réel uniquement)
═══════════════════════════════════════════════════════ -->
${!isMicro && annexeCols.length > 0 ? `<div class="pb">
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
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {showBienPopup && (
        <PopupBienInfo
          initial={initialBienInfo}
          onConfirm={openPdfWithInfo}
          onClose={() => openPdfWithInfo(initialBienInfo)}
          ctaLabel="Générer le rapport PDF →"
        />
      )}

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

      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 text-2xl"
          style={{ background: "rgba(26,122,82,0.1)", color: "#1A7A52" }}>✓</div>
        <h1 className="font-light mb-4" style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
          Votre rapport est prêt !
        </h1>
        <button
          onClick={handleOpenPdf}
          className="inline-block text-base font-medium px-10 py-4 mb-4 transition-opacity hover:opacity-[0.88] rounded-xl"
          style={{ backgroundColor: "#1A4A35", color: "#F5F0E8" }}
        >
          📄 Ouvrir et imprimer le PDF
        </button>
        <div className="mb-10">
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>
            Si la fenêtre est bloquée, autorisez les pop-ups pour ce site dans votre navigateur puis réessayez.
          </p>
        </div>
        <Link href="/#simulateur"
          className="inline-block text-sm font-medium px-8 py-3 transition-opacity hover:opacity-[0.88]"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
          Nouvelle simulation →
        </Link>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

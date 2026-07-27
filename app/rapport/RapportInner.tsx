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
import { defaultBienInfo } from "@/components/PopupBienInfo";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function RapportInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "ready" | "generating" | "done" | "expired" | "used">("loading");
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [form, setForm] = useState<SimulationForm | null>(null);
  const [resultats, setResultats] = useState<Resultats | null>(null);

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

      const loyer = parseFloat(data.form.loyer) || 0;
      const res = computeResultats(data.form, loyer, data.amortPct, data.amortMode, data.amortDureeEnsemble, composantsRef.current);
      setSimData(data);
      setForm(data.form);
      setResultats(res);
      setStatus("ready");
    } catch { setStatus("expired"); }
  }, [sessionId, router]);

  useEffect(() => {
    if (status !== "ready" || !form || !resultats || !simData) return;
    setStatus("generating");
    // Small delay to allow "generating" UI to render first
    setTimeout(() => generateAndOpenPDF(form, resultats, simData), 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const generateAndOpenPDF = (f: SimulationForm, res: Resultats, sd: SimulationData) => {
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
    const bienInfo = defaultBienInfo;

    const prix = parseFloat(f.prix) || 0;
    const travaux = parseFloat(f.travaux) || 0;
    const notaire = parseFloat(f.notaire) || 0;
    const mobilier = parseFloat(f.mobilier) || 0;
    const taux = parseFloat(f.taux) / 100 || 0;
    const duree = f.duree;
    const tmi = f.tmi;
    const loyerAnnuel = res.loyerAnnuel;
    const chargesLoyer = parseFloat(f.chargesLoyer ?? "0") || 0;
    const chargesAnnuelles = res.chargesAnnuelles;
    const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;
    const montantCredit = res.montantCredit;
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
    const fEurLocal = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

    interface PdfRow {
      year: number; capitalDebut: number; creditAnnuelR: number; interetsAnnee: number;
      amortTotalA: number; amortDisponible: number; reportEntrant: number; reportNplus1: number;
      resultatAvantAmort: number; chargesDeductibles: number; baseImposable: number;
      impot: number; cashflow: number;
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
      const chargesDeductibles = chargesAnnuelles + interetsAnnee + assuranceEmprunteurAnnuel;
      const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
      const reportEntrant = reportN;
      const amortDisponible = amortTotalA + reportEntrant;
      const baseImposable = Math.max(0, resultatAvantAmort - amortDisponible);
      const newReport = Math.max(0, amortDisponible - Math.max(0, resultatAvantAmort));
      const impot = baseImposable * (tmi / 100 + 0.186);
      const cashflow = (loyerAnnuel - creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - impot) / 12;
      rows.push({ year, capitalDebut, creditAnnuelR, interetsAnnee, amortTotalA, amortDisponible, reportEntrant, reportNplus1: newReport, resultatAvantAmort, chargesDeductibles, baseImposable, impot, cashflow });
      reportN = newReport;
    }

    const zerosYears = rows.filter(ro => ro.baseImposable === 0).length;
    const firstTaxRow = rows.find(ro => ro.baseImposable > 0);
    const baseBIC = loyerAnnuel * 0.70;
    const impotBIC = baseBIC * (tmi / 100 + 0.186);

    let saisonniereSummaryHtml = "";
    if (isSaisonnier && resultatsTriple) {
      const scenarios = [
        { label: "Estimation basse", r: resultatsTriple.bas, taux: tauxOccBas },
        { label: "Estimation moyenne", r: resultatsTriple.moyen, taux: tauxOccMoyen },
        { label: "Estimation haute", r: resultatsTriple.haut, taux: tauxOccHaut },
      ];
      const makeScenarioCol = (label: string, sr: Resultats | null, tauxStr: string, nuits: number) => {
        if (!sr) return `<div style="flex:1"></div>`;
        const lr = sr.loyerAnnuel;
        const bic = lr * 0.70;
        const impBic = bic * (tmi / 100 + 0.186);
        const cfBic = sr.cashflowBICMensuel;
        const cfReel = sr.cashflowReelMensuel;
        const row = (lbl: string, val: string, color?: string, bold?: boolean, sep?: boolean) =>
          `<tr><td style="padding:4px 6px;font-size:10px;color:rgba(26,22,18,.55);${sep?"border-top:1px solid rgba(26,22,18,.12);padding-top:6px":""}">${lbl}</td><td style="padding:4px 6px;font-size:10px;text-align:right;${bold?"font-weight:700;":""}${color?`color:${color};`:""}${sep?"border-top:1px solid rgba(26,22,18,.12);padding-top:6px":""}">${val}</td></tr>`;
        return `<div style="flex:1;min-width:0;border-radius:8px;overflow:hidden;border:1px solid rgba(26,22,18,.12)">
          <div style="text-align:center;padding:10px 8px 8px;background:#4E1F12;color:#F5F0E8">
            <div style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase">${label}</div>
            <div style="font-size:9px;opacity:.65;margin-top:2px">${tauxStr}% · ${nuits} nuits/an</div>
            <div style="font-size:16px;font-weight:300;color:#C95B2A;margin-top:4px;letter-spacing:-.02em">${fEurLocal(lr/12)}/mois</div>
            <div style="font-size:9px;opacity:.55;margin-top:1px">${fEurLocal(lr)}/an</div>
          </div>
          <div style="background:#EDE7DC;padding:6px 0 2px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#4E1F12;padding:4px 6px 2px">Régime Réel</div>
            <table style="width:100%;border-collapse:collapse">
              ${row("Revenus annuels", fEurLocal(lr), undefined, true)}
              ${row("Emprunt", `−${fEurLocal(sr.creditAnnuel)}`, "#B03A2A")}
              ${row("Charges", `−${fEurLocal(sr.chargesAnnuelles)}`, "#B03A2A")}
              ${row("Amortissements", `−${fEurLocal(sr.amortTotal)}`, "#B03A2A")}
              ${row("Base imposable", fEurLocal(sr.baseImposableReel), sr.baseImposableReel===0?"#1A7A52":"#1A1612", true, true)}
              ${row("Impôt estimé", fEurLocal(sr.impotReel), "#B03A2A")}
              ${row("Cash-flow/mois", `${fEurLocal(cfReel)}/mois`, cfReel>=0?"#1A7A52":"#B03A2A", true, true)}
            </table>
          </div>
          <div style="background:#F5F0E8;padding:6px 0 6px;border-top:2px solid rgba(26,82,122,.15)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#26527A;padding:4px 6px 2px">Micro-BIC</div>
            <table style="width:100%;border-collapse:collapse">
              ${row("Revenus annuels", fEurLocal(lr), undefined, true)}
              ${row("Abattement 30%", `−${fEurLocal(lr*.30)}`, "#B03A2A")}
              ${row("Base imposable", fEurLocal(bic), "#1A1612", true, true)}
              ${row("Impôt estimé", fEurLocal(impBic), "#B03A2A")}
              ${row("Cash-flow/mois", `${fEurLocal(cfBic)}/mois`, cfBic>=0?"#1A7A52":"#B03A2A", true, true)}
            </table>
          </div>
        </div>`;
      };
      saisonniereSummaryHtml = `
<h2>Location Saisonnière — Comparaison des 3 scénarios (année 1)</h2>
<p style="font-size:10px;color:rgba(26,22,18,.5);margin-bottom:12px">Prix par nuitée : <strong>${fEurLocal(parseFloat(prixNuitee)||0)}</strong>. Le tableau de projection détaillé ci-dessous utilise l'estimation <strong>Moyenne</strong>.</p>
<div style="display:flex;gap:12px;align-items:stretch">
  ${scenarios.map(s => makeScenarioCol(s.label, s.r, s.taux, Math.round(parseFloat(s.taux)/100*365))).join("")}
</div>`;
    }

    const tableRows = rows.map(ro => {
      const reportLines = ro.reportNplus1 > 0
        ? `<div style="font-size:9px;color:#B08A2A;margin-top:2px">→ N+1 : ${fEurLocal(ro.reportNplus1)}</div>`
        : "";
      return `<tr class="${ro.year === duree + 1 ? "credit-end" : ""}">
        <td class="col-an">${ro.year}</td>
        <td class="cc">${ro.year <= duree ? fEurLocal(ro.capitalDebut) : ""}</td>
        <td class="cc">${ro.year <= duree ? fEurLocal(ro.creditAnnuelR) : ""}</td>
        <td class="cc-last">${ro.year <= duree ? fEurLocal(ro.interetsAnnee) : ""}</td>
        <td>${fEurLocal(chargesAnnuelles)}</td>
        <td>${fEurLocal(ro.resultatAvantAmort)}</td>
        <td style="font-weight:600">${fEurLocal(ro.amortDisponible)}${reportLines}</td>
        <td style="color:${ro.baseImposable === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEurLocal(ro.baseImposable)}</td>
        <td style="color:${ro.impot === 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEurLocal(ro.impot)}</td>
        <td style="color:${ro.cashflow >= 0 ? "#1A7A52" : "#B03A2A"}">${fEurLocal(ro.cashflow)}/mois</td>
      </tr>`;
    }).join("");

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
    const annexeMaxDuree = annexeCols.length > 0 ? Math.max(...annexeCols.map(c => c.duree)) : 0;
    const totalSubCols = annexeCols.length * 2 + 2;
    const afs = totalSubCols > 16 ? 7 : totalSubCols > 12 ? 8 : totalSubCols > 8 ? 9 : 10;
    const headerRow1 = annexeCols.map(c =>
      `<th colspan="2" style="text-align:center;font-size:${afs}px;border-right:1px solid rgba(255,255,255,0.15);padding:5px 4px;vertical-align:top">
        <div style="font-weight:700">${c.label}</div>
        <div style="font-weight:400;opacity:.75;font-size:${Math.max(6, afs - 1)}px;margin-top:3px;line-height:1.55;white-space:nowrap">
          Valeur initiale : ${fEurLocal(c.initial)}<br>Durée : ${c.duree} ans<br>Amort. annuel : ${fEurLocal(c.annuel)}
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
          return `<td style="font-size:${afs}px;padding:4px 5px">${fEurLocal(c.annuel)}</td>
                  <td style="font-size:${afs}px;padding:4px 5px;color:${reste <= 0.01 ? "#1A7A52" : "rgba(26,22,18,0.55)"};border-right:1px solid rgba(26,22,18,0.07)">${fEurLocal(reste)}</td>`;
        }
        return `<td></td><td style="border-right:1px solid rgba(26,22,18,0.07)"></td>`;
      }).join("");
      return `<tr><td class="col-an" style="font-size:${afs}px;padding:4px 4px;width:18px">${year}</td>${cells}<td style="font-weight:700;color:#C95B2A;font-size:${afs}px;padding:4px 5px">${fEurLocal(cumul)}</td></tr>`;
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
      ? `Vous ne payez aucun impôt pendant <strong>${zerosYears} an${zerosYears > 1 ? "s" : ""}</strong>.${firstTaxRow ? ` À partir de l'année ${firstTaxRow.year}, la base imposable s'établit à ${fEurLocal(firstTaxRow.baseImposable)}, générant un impôt de ${fEurLocal(firstTaxRow.impot)}/an.` : ""}`
      : `Dès la 1ère année, la base imposable s'établit à ${fEurLocal(rows[0]?.baseImposable ?? 0)}, générant un impôt de ${fEurLocal(rows[0]?.impot ?? 0)}/an.`;

    const microbicNote = tmi > 0
      ? `En Micro-BIC, votre base imposable serait de <strong>${fEurLocal(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEurLocal(loyerAnnuel)}/an), générant un impôt estimé de <strong>${fEurLocal(impotBIC)}</strong> par an (TMI ${tmi} % + prélèvements sociaux 18,6 %).`
      : `En Micro-BIC, votre base imposable serait de <strong>${fEurLocal(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEurLocal(loyerAnnuel)}/an).`;

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
  ${bienInfo.type ? `<div class="kvi"><div class="kvl">Type de bien</div><div class="kvv">${bienInfo.type === "ap" ? "Appartement" : "Maison"}</div></div>` : ""}
  ${bienInfo.ville ? `<div class="kvi"><div class="kvl">Ville</div><div class="kvv">${bienInfo.ville}</div></div>` : ""}
  ${bienInfo.surface ? `<div class="kvi"><div class="kvl">Surface</div><div class="kvv">${bienInfo.surface} m²</div></div>` : ""}
  ${bienInfo.description ? `<div class="kvi" style="flex:2"><div class="kvl">Description</div><div class="kvv" style="font-weight:400;font-size:10px;white-space:pre-wrap">${bienInfo.description}</div></div>` : ""}
</div>
<div class="recap">
  <div class="recap-col" style="background:#EDE7DC">
    <div class="kvl" style="margin-bottom:6px;font-weight:700">Acquisition</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Prix d'achat</div><div class="kvv">${fEurLocal(prix)}</div></div>
    ${travaux > 0 ? `<div class="kvi" style="margin-bottom:6px"><div class="kvl">Travaux</div><div class="kvv">${fEurLocal(travaux)}</div></div>` : ""}
    ${mobilier > 0 ? `<div class="kvi" style="margin-bottom:6px"><div class="kvl">Mobilier</div><div class="kvv">${fEurLocal(mobilier)}</div></div>` : ""}
  </div>
  <div class="recap-col" style="background:rgba(201,91,42,0.09);border:1px solid rgba(201,91,42,0.2)">
    <div class="kvl" style="margin-bottom:6px;font-weight:700;color:#C95B2A">Revenus</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer HC mensuel</div><div class="kvv orange">${fEurLocal(loyerAnnuel / 12)}/mois</div></div>
    ${chargesLoyer > 0 ? `<div class="kvi" style="margin-bottom:6px"><div class="kvl">Charges locataire</div><div class="kvv">${fEurLocal(chargesLoyer)}/mois</div></div>` : ""}
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer HC annuel</div><div class="kvv orange">${fEurLocal(loyerAnnuel)}/an</div></div>
    <div class="kvi"><div class="kvl">Charges propriétaire/an</div><div class="kvv">${fEurLocal(chargesAnnuelles)}</div></div>
    ${assuranceEmprunteurAnnuel > 0 ? `<div class="kvi" style="margin-top:4px"><div class="kvl">Ass. emprunteur/an</div><div class="kvv">${fEurLocal(assuranceEmprunteurAnnuel)}</div></div>` : ""}
  </div>
  <div class="recap-col" style="background:#EDE7DC">
    <div class="kvl" style="margin-bottom:6px;font-weight:700">Financement</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Apport personnel</div><div class="kvv">${fEurLocal(parseFloat(f.apport) || 0)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Montant du crédit</div><div class="kvv">${fEurLocal(montantCredit)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Taux · Durée</div><div class="kvv">${f.taux} % · ${duree} ans</div></div>
    <div class="kvi"><div class="kvl">Frais de notaire</div><div class="kvv">${fEurLocal(notaire)}</div></div>
  </div>
</div>

${saisonniereSummaryHtml}
${!isSaisonnier ? `<h2>Comparaison régimes fiscaux (année 1)</h2>
<table><thead><tr><th>Indicateur</th><th>Régime réel simplifié</th><th>Micro-BIC</th></tr></thead><tbody>
<tr><td>Loyers annuels</td><td>${fEurLocal(loyerAnnuel)}</td><td>${fEurLocal(loyerAnnuel)}</td></tr>
<tr><td>Charges déductibles</td><td>${fEurLocal(rows[0]?.chargesDeductibles ?? 0)}</td><td>Abattement 30 %</td></tr>
<tr><td>Amortissements</td><td>${fEurLocal(rows[0]?.amortTotalA ?? 0)}</td><td>—</td></tr>
<tr><td>Base imposable</td><td style="font-weight:600;color:${(rows[0]?.baseImposable ?? 0) === 0 ? "#1A7A52" : "#B03A2A"}">${fEurLocal(rows[0]?.baseImposable ?? 0)}</td><td>${fEurLocal(baseBIC)}</td></tr>
<tr><td>Impôt estimé</td><td style="font-weight:600">${fEurLocal(rows[0]?.impot ?? 0)}</td><td>${fEurLocal(impotBIC)}</td></tr>
<tr><td>Cash-flow mensuel</td><td style="color:${(rows[0]?.cashflow ?? 0) >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEurLocal(rows[0]?.cashflow ?? 0)}/mois</td><td style="color:${res.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fEurLocal(res.cashflowBICMensuel)}/mois</td></tr>
</tbody></table>` : ""}

<div class="fiscal-note">
  <p><strong>Comment est calculé votre impôt ?</strong></p>
  <p><strong>TMI</strong> : taux appliqué à votre dernière tranche de revenus, ici <strong>${tmi} %</strong>.</p>
  <p><strong>PS</strong> (Prélèvements Sociaux) : <strong>18,6 %</strong> prélevés sur les revenus du patrimoine.</p>
  <p>Impôt total = base imposable × (TMI + PS) = base × <strong>${(tmi + 18.6).toFixed(1)} %</strong>.</p>
</div>

<div class="page-break">
<h2>Tableau récapitulatif (${totalYears} ans)${isSaisonnier ? " — Estimation moyenne des revenus" : ""}</h2>
<p style="font-size:10px;color:rgba(26,22,18,.5);margin-bottom:6px">Projection en régime réel simplifié avec loyers et charges constants. L'amortissement évolue chaque année.</p>
<table><thead><tr>
  <th class="col-an">An</th>
  <th class="cc">Capital restant</th><th class="cc">Annuités</th><th class="cc-last">dont intérêts</th>
  <th>Charges</th><th>Résultat av. amort.</th><th>Amortissement</th>
  <th>Base imposable</th><th>Impôt</th><th>Cash-flow/mois</th>
</tr></thead><tbody>${tableRows}</tbody></table>
<div class="conclusion">✓ ${conclusionText}</div>
<div class="note" style="margin-top:12px"><strong>Micro-BIC :</strong> ${microbicNote}</div>
</div>

<div class="page-break">
<h2>Annexe — Amortissement par catégorie</h2>
${annexeTable}
</div>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 600); }

    sessionStorage.setItem(`lmnp_rapport_used_${sessionId}`, "1");
    sessionStorage.removeItem("lmnp_simulation_data");
    setStatus("done");
  };

  // ── Render states ──
  if (status === "loading" || status === "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>Chargement…</div>
      </main>
    );
  }

  if (status === "generating") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
          style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A" }}>
          📄
        </div>
        <h1 className="font-light text-2xl mb-3" style={{ color: "#4E1F12", letterSpacing: "-0.025em" }}>
          Génération du PDF en cours…
        </h1>
        <p className="text-sm" style={{ color: "rgba(26,22,18,0.45)" }}>
          Votre rapport s&apos;ouvre dans un nouvel onglet.
        </p>
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
          Rapport PDF généré !
        </h1>
        <p className="text-base mb-2" style={{ color: "rgba(26,22,18,0.6)", lineHeight: 1.75 }}>
          Votre analyse de rentabilité LMNP s&apos;est ouverte dans un nouvel onglet.
        </p>
        <p className="text-base mb-10" style={{ color: "rgba(26,22,18,0.6)", lineHeight: 1.75 }}>
          Si la fenêtre ne s&apos;est pas ouverte, vérifiez que votre navigateur n&apos;a pas bloqué les pop-ups.
        </p>
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

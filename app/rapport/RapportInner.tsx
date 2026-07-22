"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import MobileHeader from "@/components/MobileHeader";
import HeaderAuth from "@/components/HeaderAuth";
import {
  computeResultats,
  fEur,
  fPct,
  type SimulationData,
  type SimulationForm,
  type Resultats,
  type TMI,
} from "@/lib/computeResultats";
import PopupBienInfo, { type BienInfo, defaultBienInfo } from "@/components/PopupBienInfo";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const INPUT = "w-full px-3 py-2.5 text-sm rounded-md text-[#1A1612] placeholder-[rgba(26,22,18,0.35)] focus:outline-none focus:ring-1 focus:ring-[#C95B2A]";
const INPUT_STYLE = { background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)" };
const LABEL = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[rgba(26,22,18,0.45)] mb-1.5";

export default function RapportInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "used">("loading");
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [form, setForm] = useState<SimulationForm | null>(null);
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [showBienInfoPopup, setShowBienInfoPopup] = useState(false);
  const bienInfoRef = useRef<BienInfo>(defaultBienInfo);

  // Editable amort state
  const [amortPct, setAmortPct] = useState(85);
  const [amortMode, setAmortMode] = useState<"ensemble" | "composant">("ensemble");
  const [amortDureeEnsemble, setAmortDureeEnsemble] = useState(25);
  const [composants, setComposants] = useState<{ label: string; pct: number; duree: number }[]>([
    { label: "Gros œuvre", pct: 40, duree: 50 },
    { label: "Toiture", pct: 10, duree: 25 },
    { label: "Façade", pct: 10, duree: 20 },
    { label: "Électricité / plomberie", pct: 15, duree: 15 },
    { label: "Menuiseries", pct: 10, duree: 20 },
    { label: "Agencement intérieur", pct: 15, duree: 12 },
  ]);

  // Saisonnier state
  const [isSaisonnier, setIsSaisonnier] = useState(false);
  const [prixNuitee, setPrixNuitee] = useState("");
  const [tauxOccBas, setTauxOccBas] = useState("20");
  const [tauxOccMoyen, setTauxOccMoyen] = useState("35");
  const [tauxOccHaut, setTauxOccHaut] = useState("45");
  const [resultatsTriple, setResultatsTriple] = useState<{
    bas: Resultats | null; moyen: Resultats | null; haut: Resultats | null;
  } | null>(null);

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

      setSimData(data);
      setForm(data.form);
      setAmortPct(data.amortPct);
      setAmortMode(data.amortMode);
      setAmortDureeEnsemble(data.amortDureeEnsemble);
      if (data.composants?.length) setComposants(data.composants);
      if (data.isSaisonnier) {
        setIsSaisonnier(true);
        if (data.prixNuitee) setPrixNuitee(data.prixNuitee);
        if (data.tauxOccBas) setTauxOccBas(data.tauxOccBas);
        if (data.tauxOccMoyen) setTauxOccMoyen(data.tauxOccMoyen);
        if (data.tauxOccHaut) setTauxOccHaut(data.tauxOccHaut);
        if (data.resultatsTriple) setResultatsTriple(data.resultatsTriple);
      }
      setStatus("ready");
    } catch { setStatus("expired"); }
  }, [sessionId, router]);

  const loyerSaisonnier = (nuitee: number, taux: number) => nuitee * (taux / 100) * 365 / 12;

  const recalc = useCallback((f: SimulationForm, _sd: SimulationData, aPct: number, aMode: "ensemble" | "composant", aDuree: number, aComps: typeof composants) => {
    const loyer = parseFloat(f.loyer) || 0;
    const res = computeResultats(f, loyer, aPct, aMode, aDuree, aComps);
    setResultats(res);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (form && simData) recalc(form, simData, amortPct, amortMode, amortDureeEnsemble, composants);
  }, [form, simData, amortPct, amortMode, amortDureeEnsemble, composants, recalc]);

  useEffect(() => {
    if (!isSaisonnier || !form) return;
    const nuitee = parseFloat(prixNuitee) || 0;
    const lBas   = loyerSaisonnier(nuitee, parseFloat(tauxOccBas)   || 0);
    const lMoyen = loyerSaisonnier(nuitee, parseFloat(tauxOccMoyen) || 0);
    const lHaut  = loyerSaisonnier(nuitee, parseFloat(tauxOccHaut)  || 0);
    // Don't wipe resultats if price is not filled yet
    if (lBas === 0 && lMoyen === 0 && lHaut === 0) return;
    setResultatsTriple({
      bas:   computeResultats(form, lBas,   amortPct, amortMode, amortDureeEnsemble, composants),
      moyen: computeResultats(form, lMoyen, amortPct, amortMode, amortDureeEnsemble, composants),
      haut:  computeResultats(form, lHaut,  amortPct, amortMode, amortDureeEnsemble, composants),
    });
    const rMoyen = computeResultats(form, lMoyen, amortPct, amortMode, amortDureeEnsemble, composants);
    if (rMoyen) setResultats(rMoyen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaisonnier, form, prixNuitee, tauxOccBas, tauxOccMoyen, tauxOccHaut, amortPct, amortMode, amortDureeEnsemble, composants]);

  useEffect(() => {
    if (status !== "ready" || !isLoaded) return;
    if (!isSignedIn) {
      const t = setTimeout(() => setShowAuthModal(true), 2000);
      return () => clearTimeout(t);
    }
  }, [status, isLoaded, isSignedIn]);

  const setField = (key: keyof SimulationForm, val: string | number) => {
    setForm(prev => prev ? { ...prev, [key]: val } : prev);
  };

  const handleGeneratePDF = () => {
    if (!form || !resultats || !simData) return;

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
      const chargesDeductibles = chargesAnnuelles + interetsAnnee;
      const resultatAvantAmort = loyerAnnuel - chargesDeductibles;
      const reportEntrant = reportN;
      const amortDisponible = amortTotalA + reportEntrant;
      const baseImposable = Math.max(0, resultatAvantAmort - amortDisponible);
      const newReport = Math.max(0, amortDisponible - Math.max(0, resultatAvantAmort));
      const impot = baseImposable * (tmi / 100 + 0.186);
      const cashflow = (loyerAnnuel - creditAnnuelR - chargesAnnuelles - impot) / 12;
      rows.push({ year, capitalDebut, creditAnnuelR, interetsAnnee, amortTotalA, amortDisponible, reportEntrant, reportNplus1: newReport, resultatAvantAmort, chargesDeductibles, baseImposable, impot, cashflow });
      reportN = newReport;
    }

    const zerosYears = rows.filter(ro => ro.baseImposable === 0).length;
    const firstTaxRow = rows.find(ro => ro.baseImposable > 0);
    const baseBIC = loyerAnnuel * 0.70;
    const impotBIC = baseBIC * (tmi / 100 + 0.186);

    // Saisonnier 3-scenario block
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
        const impBic = bic * (tmi / 100 + 0.186);
        const cfBic = r.cashflowBICMensuel;
        const cfReel = r.cashflowReelMensuel;
        const row = (lbl: string, val: string, color?: string, bold?: boolean, sep?: boolean) =>
          `<tr><td style="padding:4px 6px;font-size:10px;color:rgba(26,22,18,.55);${sep?"border-top:1px solid rgba(26,22,18,.12);padding-top:6px":""}">${lbl}</td><td style="padding:4px 6px;font-size:10px;text-align:right;${bold?"font-weight:700;":""}${color?`color:${color};`:""}${sep?"border-top:1px solid rgba(26,22,18,.12);padding-top:6px":""}">${val}</td></tr>`;
        return `<div style="flex:1;min-width:0;border-radius:8px;overflow:hidden;border:1px solid rgba(26,22,18,.12)">
          <div style="text-align:center;padding:10px 8px 8px;background:#4E1F12;color:#F5F0E8">
            <div style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase">${label}</div>
            <div style="font-size:9px;opacity:.65;margin-top:2px">${taux}% · ${nuits} nuits/an</div>
            <div style="font-size:16px;font-weight:300;color:#C95B2A;margin-top:4px;letter-spacing:-.02em">${fEurLocal(lr/12)}/mois</div>
            <div style="font-size:9px;opacity:.55;margin-top:1px">${fEurLocal(lr)}/an</div>
          </div>
          <div style="background:#EDE7DC;padding:6px 0 2px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#4E1F12;padding:4px 6px 2px">Régime Réel</div>
            <table style="width:100%;border-collapse:collapse">
              ${row("Revenus annuels", fEurLocal(lr), undefined, true)}
              ${row("Emprunt", `−${fEurLocal(r.creditAnnuel)}`, "#B03A2A")}
              ${row("Charges", `−${fEurLocal(r.chargesAnnuelles)}`, "#B03A2A")}
              ${row("Amortissements", `−${fEurLocal(r.amortTotal)}`, "#B03A2A")}
              ${row("Base imposable", fEurLocal(r.baseImposableReel), r.baseImposableReel===0?"#1A7A52":"#1A1612", true, true)}
              ${row("Impôt estimé", fEurLocal(r.impotReel), "#B03A2A")}
              ${row("Cash-flow/mois", `${fEurLocal(cfReel)}/mois`, cfReel>=0?"#1A7A52":"#B03A2A", true, true)}
            </table>
          </div>
          <div style="background:#F5F0E8;padding:6px 0 6px;border-top:2px solid rgba(26,82,122,.15)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#26527A;padding:4px 6px 2px">Micro-BIC 2025</div>
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
      ? `En Micro-BIC 2025, votre base imposable serait de <strong>${fEurLocal(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEurLocal(loyerAnnuel)}/an), générant un impôt estimé de <strong>${fEurLocal(impotBIC)}</strong> par an (TMI ${tmi} % + prélèvements sociaux 18,6 %).`
      : `En Micro-BIC 2025, votre base imposable serait de <strong>${fEurLocal(baseBIC)}</strong> par an (70 % des loyers bruts de ${fEurLocal(loyerAnnuel)}/an).`;

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
  ${bienInfoRef.current.type ? `<div class="kvi"><div class="kvl">Type de bien</div><div class="kvv">${bienInfoRef.current.type === "ap" ? "Appartement" : "Maison"}</div></div>` : ""}
  ${bienInfoRef.current.ville ? `<div class="kvi"><div class="kvl">Ville</div><div class="kvv">${bienInfoRef.current.ville}</div></div>` : ""}
  ${bienInfoRef.current.surface ? `<div class="kvi"><div class="kvl">Surface</div><div class="kvv">${bienInfoRef.current.surface} m²</div></div>` : ""}
  ${bienInfoRef.current.description ? `<div class="kvi" style="flex:2"><div class="kvl">Description</div><div class="kvv" style="font-weight:400;font-size:10px;white-space:pre-wrap">${bienInfoRef.current.description}</div></div>` : ""}
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
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer mensuel CC</div><div class="kvv orange">${fEurLocal(loyerAnnuel / 12)}/mois</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Loyer annuel</div><div class="kvv orange">${fEurLocal(loyerAnnuel)}/an</div></div>
    <div class="kvi"><div class="kvl">Charges annuelles</div><div class="kvv">${fEurLocal(chargesAnnuelles)}</div></div>
  </div>
  <div class="recap-col" style="background:#EDE7DC">
    <div class="kvl" style="margin-bottom:6px;font-weight:700">Financement</div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Apport personnel</div><div class="kvv">${fEurLocal(parseFloat(form.apport) || 0)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Montant du crédit</div><div class="kvv">${fEurLocal(montantCredit)}</div></div>
    <div class="kvi" style="margin-bottom:6px"><div class="kvl">Taux · Durée</div><div class="kvv">${form.taux} % · ${duree} ans</div></div>
    <div class="kvi"><div class="kvl">Frais de notaire</div><div class="kvv">${fEurLocal(notaire)}</div></div>
  </div>
</div>

${saisonniereSummaryHtml}
${!isSaisonnier ? `<h2>Comparaison régimes fiscaux (année 1)</h2>
<table><thead><tr><th>Indicateur</th><th>Régime réel simplifié</th><th>Micro-BIC 2025</th></tr></thead><tbody>
<tr><td>Loyers annuels</td><td>${fEurLocal(loyerAnnuel)}</td><td>${fEurLocal(loyerAnnuel)}</td></tr>
<tr><td>Charges déductibles</td><td>${fEurLocal(rows[0]?.chargesDeductibles ?? 0)}</td><td>Abattement 30 %</td></tr>
<tr><td>Amortissements</td><td>${fEurLocal(rows[0]?.amortTotalA ?? 0)}</td><td>—</td></tr>
<tr><td>Base imposable</td><td style="font-weight:600;color:${(rows[0]?.baseImposable ?? 0) === 0 ? "#1A7A52" : "#B03A2A"}">${fEurLocal(rows[0]?.baseImposable ?? 0)}</td><td>${fEurLocal(baseBIC)}</td></tr>
<tr><td>Impôt estimé</td><td style="font-weight:600">${fEurLocal(rows[0]?.impot ?? 0)}</td><td>${fEurLocal(impotBIC)}</td></tr>
<tr><td>Cash-flow mensuel</td><td style="color:${(rows[0]?.cashflow ?? 0) >= 0 ? "#1A7A52" : "#B03A2A"};font-weight:600">${fEurLocal(rows[0]?.cashflow ?? 0)}/mois</td><td style="color:${resultats.cashflowBICMensuel >= 0 ? "#1A7A52" : "#B03A2A"}">${fEurLocal(resultats.cashflowBICMensuel)}/mois</td></tr>
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
<div class="note" style="margin-top:12px"><strong>Micro-BIC 2025 :</strong> ${microbicNote}</div>
</div>

<div class="page-break">
<h2>Annexe — Amortissement par catégorie</h2>
${annexeTable}
</div>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 600); }

    // Mark session as used
    sessionStorage.setItem(`lmnp_rapport_used_${sessionId}`, "1");
    sessionStorage.removeItem("lmnp_simulation_data");
    setPdfGenerated(true);
  };

  // ── Render states ──
  if (status === "loading") {
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

  if (!form || !simData || !resultats) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* Header */}
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="font-light" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
              Vérifiez vos données avant la génération du PDF
            </h1>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: "rgba(34,139,34,0.1)", color: "#228B22", border: "1px solid rgba(34,139,34,0.25)" }}>
              Paiement confirmé ✓
            </span>
          </div>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
            Modifiez les valeurs si nécessaire — les résultats se recalculent automatiquement.
          </p>
        </div>

        {/* Section 1 — Données modifiables */}
        <div className="rounded-xl p-6 mb-6" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
          <h2 className="font-medium mb-5" style={{ color: "#4E1F12", fontSize: 15 }}>Données du bien</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {([
              ["Prix d'achat (€)", "prix"],
              ["Travaux (€)", "travaux"],
              ["Frais de notaire (€)", "notaire"],
              ["Mobilier (€)", "mobilier"],
              ["Surface (m²)", "surface"],
              ["Taxe foncière/an (€)", "taxeFonciere"],
              ["Charges copro/an (€)", "chargesCopro"],
              ["Apport (€)", "apport"],
              ["Taux d'intérêt (%)", "taux"],
            ] as [string, keyof SimulationForm][]).map(([label, key]) => (
              <div key={key}>
                <label className={LABEL}>{label}</label>
                <input
                  type="number"
                  className={INPUT}
                  style={INPUT_STYLE}
                  value={form[key] as string}
                  onChange={e => setField(key, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className={LABEL}>Durée crédit (ans)</label>
              <select className={INPUT} style={INPUT_STYLE} value={form.duree}
                onChange={e => setField("duree", parseInt(e.target.value))}>
                {[10, 15, 20, 25].map(d => <option key={d} value={d}>{d} ans</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>TMI (%)</label>
              <select className={INPUT} style={INPUT_STYLE} value={form.tmi}
                onChange={e => setField("tmi", parseInt(e.target.value) as TMI)}>
                {[0, 11, 30, 41, 45].map(t => <option key={t} value={t}>{t}%</option>)}
              </select>
            </div>
          </div>

          {/* Mode de location */}
          <div className="mt-5 pt-5" style={{ borderTop: "0.5px solid rgba(26,22,18,0.12)" }}>
            <div className={LABEL}>Mode de location</div>
            <button
              onClick={() => setIsSaisonnier(v => !v)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
              style={{
                background: isSaisonnier ? "rgba(38,82,122,0.1)" : "#F5F0E8",
                border: isSaisonnier ? "1.5px solid #26527A" : "0.5px solid rgba(26,22,18,0.18)",
                color: isSaisonnier ? "#26527A" : "rgba(26,22,18,0.55)",
              }}
            >
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

          {/* Saisonnier inputs */}
          {isSaisonnier && (
            <div className="mt-4 rounded-xl p-4 space-y-3" style={{ background: "rgba(38,82,122,0.05)", border: "1px solid rgba(38,82,122,0.2)" }}>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: "#26527A" }}>Location Saisonnière</div>
              <div>
                <label className={LABEL}>Prix moyen par nuitée (€)</label>
                <input
                  type="number"
                  value={prixNuitee}
                  onChange={e => setPrixNuitee(e.target.value)}
                  placeholder="Ex : 80"
                  className={INPUT}
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={LABEL}>Taux d&apos;occupation estimé (%)</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { label: "Basse", val: tauxOccBas, set: setTauxOccBas },
                    { label: "Moyenne", val: tauxOccMoyen, set: setTauxOccMoyen },
                    { label: "Haute", val: tauxOccHaut, set: setTauxOccHaut },
                  ] as const).map(({ label, val, set }) => {
                    const taux = parseFloat(val) || 0;
                    const nuits = Math.round(taux / 100 * 365);
                    const loyer = loyerSaisonnier(parseFloat(prixNuitee) || 0, taux);
                    return (
                      <div key={label}>
                        <div className="text-[10px] mb-1 font-medium" style={{ color: "rgba(26,22,18,0.45)" }}>{label}</div>
                        <input
                          type="number" min={0} max={100}
                          value={val}
                          onChange={e => set(e.target.value)}
                          placeholder="0"
                          className={INPUT}
                          style={INPUT_STYLE}
                        />
                        <div className="text-[10px] mt-1" style={{ color: "rgba(38,82,122,0.7)" }}>
                          {nuits} nuits · {fEur(loyer)}/mois
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Loyer mensuel — only shown when NOT saisonnier */}
          {!isSaisonnier && (
            <div className="mt-4">
              <label className={LABEL}>Loyer mensuel (€)</label>
              <input
                type="number"
                className={INPUT}
                style={INPUT_STYLE}
                value={form.loyer}
                onChange={e => setField("loyer", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Section 2 — KPIs */}
        {isSaisonnier && <p className="text-xs mb-2" style={{ color: "rgba(38,82,122,0.7)" }}>Indicateurs basés sur l&apos;estimation Moyenne</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Rendement brut", val: fPct(resultats.rendementBrut) },
            { label: "Rendement net", val: fPct(resultats.rendementNet) },
            { label: "Cash-flow réel/mois", val: fEur(resultats.cashflowReelMensuel), color: resultats.cashflowReelMensuel >= 0 ? "#22793A" : "#B03A2A" },
            { label: "Impôt estimé/an", val: fEur(resultats.impotReel) },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-5 text-center" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
              <div className="text-2xl font-light mb-1" style={{ color: color ?? "#C95B2A", letterSpacing: "-0.03em" }}>{val}</div>
              <div className="text-xs" style={{ color: "rgba(26,22,18,0.45)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Section Saisonnier — 3-scenario comparison */}
        {isSaisonnier && resultatsTriple && (
          <div className="rounded-xl overflow-hidden mb-6" style={{ border: "0.5px solid rgba(38,82,122,0.3)" }}>
            <div className="px-5 py-3" style={{ background: "#26527A" }}>
              <h2 className="font-medium text-sm" style={{ color: "#F5F0E8" }}>Location Saisonnière — 3 scénarios</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.6)" }}>
                Prix nuitée : {fEur(parseFloat(prixNuitee) || 0)} · Le tableau de projection utilise l&apos;estimation Moyenne
              </p>
            </div>
            <div className="p-5" style={{ background: "#F5F0E8" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { label: "Estimation basse", r: resultatsTriple.bas, taux: tauxOccBas, accent: "rgba(176,58,42,0.07)", border: "rgba(176,58,42,0.3)", tagColor: "#B03A2A", tagBg: "rgba(176,58,42,0.1)" },
                  { label: "Estimation moyenne", r: resultatsTriple.moyen, taux: tauxOccMoyen, accent: "rgba(201,91,42,0.07)", border: "rgba(201,91,42,0.4)", tagColor: "#C95B2A", tagBg: "rgba(201,91,42,0.12)" },
                  { label: "Estimation haute", r: resultatsTriple.haut, taux: tauxOccHaut, accent: "rgba(26,122,82,0.07)", border: "rgba(26,122,82,0.3)", tagColor: "#1A7A52", tagBg: "rgba(26,122,82,0.1)" },
                ] as const).map(({ label, r, taux, accent, border, tagColor, tagBg }) => {
                  const nuits = Math.round((parseFloat(taux) || 0) / 100 * 365);
                  return (
                    <div key={label} className="rounded-xl p-4" style={{ background: accent, border: `1px solid ${border}` }}>
                      <div className="mb-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: tagBg, color: tagColor }}>{label}</span>
                        <div className="text-xs mt-1.5" style={{ color: "rgba(26,22,18,0.45)" }}>{taux}% · {nuits} nuits/an</div>
                      </div>
                      {r ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "rgba(26,22,18,0.55)" }}>Revenus/mois</span>
                            <span className="font-medium" style={{ color: tagColor }}>{fEur(r.loyerAnnuel / 12)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "rgba(26,22,18,0.55)" }}>Base imposable</span>
                            <span className="font-medium" style={{ color: r.baseImposableReel === 0 ? "#1A7A52" : "#1A1612" }}>{fEur(r.baseImposableReel)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "rgba(26,22,18,0.55)" }}>Impôt/an</span>
                            <span className="font-medium">{fEur(r.impotReel)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-1.5" style={{ borderTop: `0.5px solid ${border}` }}>
                            <span style={{ color: "rgba(26,22,18,0.55)" }}>Cash-flow/mois</span>
                            <span className="font-medium" style={{ color: r.cashflowReelMensuel >= 0 ? "#1A7A52" : "#B03A2A" }}>{fEur(r.cashflowReelMensuel)}</span>
                          </div>
                        </div>
                      ) : <p className="text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>Données insuffisantes</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section 3 — Tableau fiscal */}
        {!isSaisonnier && (
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
          <div className="px-5 py-3" style={{ background: "#4E1F12" }}>
            <h2 className="font-medium text-sm" style={{ color: "#F5F0E8" }}>Comparaison régimes fiscaux</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "rgba(26,22,18,0.45)", background: "#EDE7DC" }}></th>
                  <th className="px-4 py-3 text-sm font-medium text-center" style={{ color: "#F5F0E8", background: "#C95B2A" }}>Régime réel</th>
                  <th className="px-4 py-3 text-sm font-medium text-center" style={{ color: "#F5F0E8", background: "#4E1F12" }}>Micro-BIC</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ["Loyers annuels", fEur(resultats.loyerAnnuel), fEur(resultats.loyerAnnuel)],
                  ["Charges déductibles", fEur(resultats.chargesDeductibles), "Abattement 30 %"],
                  ["Amortissements", fEur(resultats.amortTotal), "—"],
                  ["Base imposable", fEur(resultats.baseImposableReel), fEur(resultats.baseBIC)],
                  ["Impôt estimé", fEur(resultats.impotReel), fEur(resultats.impotBIC)],
                  ["Cash-flow mensuel", fEur(resultats.cashflowReelMensuel), fEur(resultats.cashflowBICMensuel)],
                ] as [string, string, string][]).map(([label, reel, bic], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? "#F5F0E8" : "#EDE7DC" }}>
                    <td className="px-4 py-3 text-sm" style={{ color: "rgba(26,22,18,0.6)" }}>{label}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium" style={{ color: "#C95B2A" }}>{reel}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: "rgba(26,22,18,0.7)" }}>{bic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Section 4 — Amortissement */}
        <div className="rounded-xl overflow-hidden mb-10" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
          <div className="px-5 py-3" style={{ background: "#4E1F12" }}>
            <h2 className="font-medium text-sm" style={{ color: "#F5F0E8" }}>Tableau d&apos;amortissement</h2>
          </div>
          <div className="p-5" style={{ background: "#F5F0E8" }}>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-5">
              {(["ensemble", "composant"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setAmortMode(m)}
                  className="px-4 py-2 rounded text-sm font-medium transition-all"
                  style={amortMode === m
                    ? { background: "#C95B2A", color: "#F5F0E8" }
                    : { background: "#EDE7DC", color: "rgba(26,22,18,0.6)", border: "0.5px solid rgba(26,22,18,0.15)" }
                  }
                >
                  {m === "ensemble" ? "Par ensemble" : "Par composant"}
                </button>
              ))}
            </div>

            {amortMode === "ensemble" ? (() => {
              const valAmort = (parseFloat(form.prix) || 0) * amortPct / 100;
              const annuelAmort = amortDureeEnsemble > 0 ? valAmort / amortDureeEnsemble : 0;
              return (
              <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>% amortissable du bien</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={50} max={100} step={1}
                      value={amortPct}
                      onChange={e => setAmortPct(Number(e.target.value))}
                      className="flex-1 accent-[#C95B2A]"
                    />
                    <input
                      type="number" min={50} max={100}
                      value={amortPct}
                      onChange={e => setAmortPct(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 text-sm rounded text-center"
                      style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.12)", color: "#1A1612" }}
                    />
                    <span className="text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>%</span>
                  </div>
                  <div className="text-xs mt-1.5 font-medium" style={{ color: "#C95B2A" }}>
                    = {fEur(valAmort)} à amortir
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Durée d&apos;amortissement (ans)</label>
                  <input
                    type="number" min={1} max={50}
                    value={amortDureeEnsemble}
                    onChange={e => setAmortDureeEnsemble(Number(e.target.value))}
                    className={INPUT}
                    style={INPUT_STYLE}
                  />
                  <div className="text-xs mt-1.5 font-medium" style={{ color: "#C95B2A" }}>
                    = {fEur(annuelAmort)} / an
                  </div>
                </div>
              </div>
              );
            })() : (
              <div className="mb-5">
                <div className="grid grid-cols-[1fr_130px_130px] gap-x-3 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(26,22,18,0.4)" }}>Composant</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-center" style={{ color: "rgba(26,22,18,0.4)" }}>% · Montant</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-center" style={{ color: "rgba(26,22,18,0.4)" }}>Durée · /an</span>
                </div>
                {composants.map((c, i) => {
                  const valAmort = (parseFloat(form.prix) || 0) * amortPct / 100;
                  const montant = valAmort * c.pct / 100;
                  const annuel = c.duree > 0 ? montant / c.duree : 0;
                  return (
                  <div key={i} className="grid grid-cols-[1fr_130px_130px] gap-x-3 mb-3 items-start">
                    <span className="text-sm pt-1.5" style={{ color: "rgba(26,22,18,0.7)" }}>{c.label}</span>
                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min={0} max={100}
                          value={c.pct}
                          onChange={e => {
                            const next = [...composants];
                            next[i] = { ...next[i], pct: Number(e.target.value) };
                            setComposants(next);
                          }}
                          className="w-full px-2 py-1.5 text-sm rounded text-center"
                          style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.12)", color: "#1A1612" }}
                        />
                        <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,22,18,0.4)" }}>%</span>
                      </div>
                      <div className="text-xs mt-1 font-medium text-center" style={{ color: "#C95B2A" }}>{fEur(montant)}</div>
                    </div>
                    <div>
                      <input
                        type="number" min={1} max={80}
                        value={c.duree}
                        onChange={e => {
                          const next = [...composants];
                          next[i] = { ...next[i], duree: Number(e.target.value) };
                          setComposants(next);
                        }}
                        className="w-full px-2 py-1.5 text-sm rounded text-center"
                        style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.12)", color: "#1A1612" }}
                      />
                      <div className="text-xs mt-1 font-medium text-center" style={{ color: "#C95B2A" }}>{fEur(annuel)}/an</div>
                    </div>
                  </div>
                  );
                })}
                <p className="text-xs mt-2" style={{ color: "rgba(26,22,18,0.4)" }}>
                  Total : {composants.reduce((s, c) => s + c.pct, 0)}% (recommandé ≤ 100%)
                </p>
              </div>
            )}

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4 pt-4" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
              {([
                ["Valeur amortissable", fEur((parseFloat(form.prix) || 0) * amortPct / 100)],
                ["Amortissement bien/an", fEur(resultats.amortBien)],
                ["Amortissement mobilier/an", fEur(resultats.amortMobilier)],
                ["Amortissement travaux/an", fEur(resultats.amortTravaux)],
                ["Amortissement notaire/an", fEur(resultats.amortNotaire)],
                ["Total amortissement/an", fEur(resultats.amortTotal)],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between py-3" style={{ borderBottom: "0.5px solid rgba(26,22,18,0.06)" }}>
                  <span className="text-sm" style={{ color: "rgba(26,22,18,0.55)" }}>{k}</span>
                  <span className="text-sm font-medium" style={{ color: "#C95B2A" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton PDF */}
        {!pdfGenerated ? (
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowBienInfoPopup(true)}
              className="px-12 py-4 text-base font-medium transition-opacity hover:opacity-[0.88] rounded-xl"
              style={{ background: "#C95B2A", color: "#F5F0E8" }}
            >
              Générer et télécharger le PDF
            </button>
          </div>
        ) : (
          <div className="text-center mb-12 py-8 rounded-xl" style={{ background: "rgba(34,139,34,0.07)", border: "1px solid rgba(34,139,34,0.18)" }}>
            <div className="text-3xl mb-3">✓</div>
            <p className="font-medium mb-1" style={{ color: "#228B22" }}>Rapport PDF téléchargé</p>
            <p className="text-sm mb-5" style={{ color: "rgba(26,22,18,0.4)" }}>
              Cette page n&apos;est plus accessible. Merci d&apos;utiliser ToutLMNP.
            </p>
            <Link href="/#simulateur" className="inline-block text-sm font-medium px-6 py-3 rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}>
              Nouvelle simulation →
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>

      {/* BienInfo popup */}
      {showBienInfoPopup && (
        <PopupBienInfo
          initial={bienInfoRef.current}
          onClose={() => setShowBienInfoPopup(false)}
          onConfirm={info => {
            bienInfoRef.current = info;
            setShowBienInfoPopup(false);
            handleGeneratePDF();
          }}
        />
      )}

      {/* Auth modal */}
      {showAuthModal && !isSignedIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(26,22,18,0.5)", backdropFilter: "blur(2px)" }}
        >
          <div className="relative w-full max-w-sm rounded-2xl p-8"
            style={{ background: "#F5F0E8", boxShadow: "0 24px 60px rgba(26,22,18,0.22)", border: "0.5px solid rgba(26,22,18,0.1)" }}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl"
                style={{ background: "rgba(201,91,42,0.1)", color: "#C95B2A" }}>👋</div>
              <h2 className="font-medium text-xl mb-2" style={{ color: "#4E1F12", letterSpacing: "-0.02em" }}>
                Bienvenue sur ToutLMNP !
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.55)" }}>
                Votre rapport est prêt. Connectez-vous pour sauvegarder vos futures simulations et retrouver vos analyses.
              </p>
            </div>
            <SignInButton mode="modal" fallbackRedirectUrl="/">
              <button
                className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-[0.88] mb-3"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              >
                Se connecter avec mon email
              </button>
            </SignInButton>
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(26,22,18,0.45)" }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

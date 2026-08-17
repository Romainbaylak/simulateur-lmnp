import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
  ShadingType, PageOrientation, convertInchesToTwip, PageBreak,
  TableLayoutType, VerticalAlign,
} from "docx";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fE = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v ?? 0);
const fP = (v: number, d = 2) => v.toFixed(d).replace(".", ",") + " %";

// Brand colours
const DARK = "4E1F12";
const ORANGE = "C95B2A";
const GREEN = "1A7A52";
const RED = "B03A2A";
const BEIGE = "EDE7DC";
const CREAM = "F5F0E8";

const pt = (n: number) => n * 20; // half-points

// ── Small building blocks ─────────────────────────────────────────────────────
const blank = () => new Paragraph({ text: "", spacing: { after: 60 } });

const heading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2) =>
  new Paragraph({
    text,
    heading: level,
    spacing: { before: 200, after: 100 },
    border: { bottom: { color: ORANGE, size: 8, style: BorderStyle.SINGLE } },
  });

const body = (text: string, bold = false, color = "1A1612", size = 20) =>
  new Paragraph({
    children: [new TextRun({ text, bold, color, size })],
    spacing: { after: 60 },
  });

const note = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, size: 18, color: "1A1612", italics: true })],
    shading: { type: ShadingType.CLEAR, fill: BEIGE },
    spacing: { before: 80, after: 80 },
    indent: { left: 100, right: 100 },
    border: {
      left: { color: ORANGE, size: 12, style: BorderStyle.SINGLE },
    },
  });

// DXA widths for full-width table (A4 portrait usable ≈ 8870 twip, landscape ≈ 12930)
const FULL = 8870;
const FULL_L = 12800;

const th = (text: string, w: number, right = false) =>
  new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: CREAM, size: 18 })],
      alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT,
    })],
    shading: { type: ShadingType.CLEAR, fill: DARK },
    width: { size: w, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });

const td = (text: string, w: number, opts: { right?: boolean; bold?: boolean; color?: string; shade?: string } = {}) =>
  new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: opts.bold ?? false, color: opts.color ?? "1A1612", size: 18 })],
      alignment: opts.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
    })],
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade } : undefined,
    width: { size: w, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });

const trow = (cells: TableCell[], shade?: string) =>
  new TableRow({
    children: cells,
    tableHeader: false,
  });

// ── TYPES (mirror computeResultats) ───────────────────────────────────────────
interface Form {
  prix: string; apport: string; travaux: string; notaire: string; mobilier: string;
  taux: string; duree: number; tmi: number; loyer: string; chargesLoyer?: string;
  taxeFonciere: string; chargesCopro?: string; type?: string; villeLabel?: string; surface?: string;
}
interface Resultats {
  investTotal: number; montantCredit: number; mensualite: number; creditAnnuel: number;
  interetsAnnee1: number; chargesAnnuelles: number; loyerAnnuel: number;
  amortTotal: number; chargesDeductibles: number; resultatAvantAmort: number;
  baseImposableReel: number; impotReel: number; cashflowReelMensuel: number;
  baseBIC: number; impotBIC: number; cashflowBICMensuel: number;
  rendementBrut: number; rendementNet: number; amortAReporter: number;
  assuranceEmprunteurAnnuel?: number;
}
interface Composant { label: string; pct: number; duree: number }
interface WordReportInput {
  form: Form;
  resultats: Resultats;
  selectedRegime: "micro" | "reel" | null;
  amortPct: number;
  amortMode: "ensemble" | "composant";
  amortDureeEnsemble: number;
  composants: Composant[];
  isSaisonnier?: boolean;
  prixNuitee?: string;
  tauxOccBas?: string;
  tauxOccMoyen?: string;
  tauxOccHaut?: string;
  resultatsTriple?: { bas: Resultats | null; moyen: Resultats | null; haut: Resultats | null } | null;
  bienVille?: string;
  bienSurface?: string;
}

// ── PROJECTION (same logic as buildPdfHtml) ───────────────────────────────────
function buildRows(f: Form, res: Resultats, amortPct: number, amortMode: string, amortDureeEnsemble: number, composants: Composant[]) {
  const prix = parseFloat(f.prix) || 0;
  const travaux = parseFloat(f.travaux) || 0;
  const notaire = parseFloat(f.notaire) || 0;
  const mobilier = parseFloat(f.mobilier) || 0;
  const taux = parseFloat(f.taux) / 100 || 0;
  const duree = f.duree;
  const tmi = f.tmi;
  const montantCredit = res.montantCredit;
  const loyerAnnuel = res.loyerAnnuel;
  const chargesAnnuelles = res.chargesAnnuelles;
  const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;
  const valeurAmortissable = prix * amortPct / 100;

  const r = taux / 12;
  const n = duree * 12;
  const M = montantCredit > 0 && taux > 0
    ? montantCredit * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : (duree > 0 ? montantCredit / n : 0);

  const amortBienMaxDuree = amortMode === "ensemble"
    ? amortDureeEnsemble
    : Math.max(...composants.map(c => c.duree));
  const maxAmortDuree = Math.max(amortBienMaxDuree, 20);
  const totalYears = Math.max(duree, maxAmortDuree) + 5;

  const rows: any[] = [];
  let capitalRestant = montantCredit;
  let reportN = 0;

  for (let year = 1; year <= totalYears; year++) {
    const capitalDebut = Math.max(0, capitalRestant);
    let interetsAnnee = 0; let creditAnnuelR = 0; let capitalRembAn = 0;
    if (year <= duree && montantCredit > 0 && taux > 0) {
      for (let m = 0; m < 12; m++) { const im = capitalRestant * r; interetsAnnee += im; capitalRestant -= (M - im); }
      capitalRestant = Math.max(0, capitalRestant);
      creditAnnuelR = M * 12; capitalRembAn = creditAnnuelR - interetsAnnee;
    } else if (year <= duree && montantCredit > 0) {
      creditAnnuelR = montantCredit / n * 12; capitalRembAn = creditAnnuelR;
    }
    let amortBienA = 0;
    if (amortMode === "ensemble") {
      amortBienA = year <= amortDureeEnsemble ? valeurAmortissable / amortDureeEnsemble : 0;
    } else {
      for (const c of composants) amortBienA += year <= c.duree ? (valeurAmortissable * c.pct / 100) / c.duree : 0;
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
    rows.push({ year, capitalDebut, capitalFin: Math.max(0, capitalRestant), creditAnnuelR, interetsAnnee, capitalRembourse: capitalRembAn, amortTotalA, amortDisponible, reportEntrant, reportNplus1: newReport, resultatAvantAmort: resAvAmort, chargesDeductibles: chargesDed, baseImposable, impot, cashflow });
    reportN = newReport;
  }
  return { rows, totalYears };
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────────────
export async function generateWordReport(input: WordReportInput): Promise<Buffer> {
  const { form, resultats: res, selectedRegime, amortPct, amortMode, amortDureeEnsemble, composants } = input;
  const isMicro = selectedRegime === "micro";
  const isSaisonnier = input.isSaisonnier ?? false;

  const prix = parseFloat(form.prix) || 0;
  const travaux = parseFloat(form.travaux) || 0;
  const notaire = parseFloat(form.notaire) || 0;
  const mobilier = parseFloat(form.mobilier) || 0;
  const apport = parseFloat(form.apport) || 0;
  const taux = parseFloat(form.taux) || 0;
  const duree = form.duree;
  const tmi = form.tmi;
  const chargesLoyer = parseFloat(form.chargesLoyer ?? "0") || 0;
  const taxeFonciere = parseFloat(form.taxeFonciere) || 0;
  const chargesCopro = parseFloat(form.chargesCopro ?? "0") || 0;

  const investTotal = res.investTotal;
  const montantCredit = res.montantCredit;
  const mensualite = res.mensualite;
  const creditAnnuel = res.creditAnnuel;
  const interetsAnnee1 = res.interetsAnnee1;
  const chargesAnnuelles = res.chargesAnnuelles;
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
  const assuranceEmprunteurAnnuel = res.assuranceEmprunteurAnnuel ?? 0;

  const capitalRembourseAn1 = Math.max(0, creditAnnuel - interetsAnnee1);
  const coutTotalInteret = montantCredit > 0 && taux > 0 ? (mensualite * duree * 12) - montantCredit : 0;
  const cashflowAvantImpot = (loyerAnnuel - creditAnnuel - chargesAnnuelles - assuranceEmprunteurAnnuel) / 12;
  const rentaNetteAvFinancement = investTotal > 0 ? ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100 : 0;
  const valeurAmortissable = prix * amortPct / 100;
  const terrainVal = prix * (1 - amortPct / 100);

  const today = new Date().toLocaleDateString("fr-FR");
  const typeLabel = form.type === "ma" ? "Maison" : form.type === "im" ? "Immeuble" : "Appartement";
  const regimeLabel = isMicro ? "Micro-BIC" : "Régime réel simplifié";

  // Projection
  const { rows, totalYears } = buildRows(form, res, amortPct, amortMode, amortDureeEnsemble, composants);
  const keyYears = [1, 5, 10, 15, 20, 21, 25, 30, 35, 40].filter(y => y <= totalYears);

  // Amort composants
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

  // Plus-value helpers
  const abattIR = (N: number) => N < 6 ? 0 : N >= 22 ? 1 : (N - 5) * 0.06;
  const abattPS = (N: number) => {
    if (N < 6) return 0; if (N >= 30) return 1;
    if (N >= 22) return 0.28 + (N - 22) * 0.09;
    return (N - 5) * 0.0165;
  };
  // Amortissements cumulés par année (réintégration Loi de finances 2025 — LMNP réel)
  const amortCumulWordByYear: Record<number, number> = {};
  let amortWordCumul = 0;
  for (const ro of rows) { amortWordCumul += ro.amortTotalA; amortCumulWordByYear[ro.year] = amortWordCumul; }
  const getAmortCumul = (yr: number) => isMicro ? 0 : (amortCumulWordByYear[yr] ?? amortCumulWordByYear[Math.max(...Object.keys(amortCumulWordByYear).map(Number).filter((k: number) => k <= yr))] ?? 0);

  // ─────────────────────────────────────────────────────────────────────────
  // PAGE BUILDER (portrait sections)
  // ─────────────────────────────────────────────────────────────────────────
  const sections: any[] = [];

  // ── PAGE 1 — COUVERTURE ──────────────────────────────────────────────────
  const page1: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: "toutlmnp", bold: true, size: pt(18), color: ORANGE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Rapport LMNP – Simulation de rentabilité", bold: true, size: pt(16), color: DARK })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Généré le ${today}  ·  ${regimeLabel}`, size: pt(9), color: "888888" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    // Info bien
    ...(form.villeLabel || form.surface || form.type ? [
      new Paragraph({
        children: [
          new TextRun({ text: typeLabel + (form.villeLabel ? "  –  " + form.villeLabel : "") + (form.surface ? "  ·  " + form.surface + " m²" : ""), size: pt(10), color: "1A1612" }),
        ],
        shading: { type: ShadingType.CLEAR, fill: BEIGE },
        spacing: { before: 60, after: 200 },
        indent: { left: 200, right: 200 },
      }),
    ] : []),
    heading("Synthèse de votre investissement LMNP", HeadingLevel.HEADING_1),
    // KPI table 2x2
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL / 4), Math.round(FULL / 4), Math.round(FULL / 4), Math.round(FULL / 4)],
      rows: [
        new TableRow({ children: [
          td("Coût total projet", Math.round(FULL / 4), { shade: DARK }),
          td("Rentabilité brute", Math.round(FULL / 4), { shade: DARK }),
          td("Cash-flow mensuel (an. 1)", Math.round(FULL / 4), { shade: DARK }),
          td("Capital remboursé an. 1", Math.round(FULL / 4), { shade: DARK }),
        ]}),
        new TableRow({ children: [
          td(fE(investTotal), Math.round(FULL / 4), { bold: true, color: ORANGE }),
          td(fP(rendementBrut), Math.round(FULL / 4), { bold: true, color: ORANGE }),
          td(fE(isMicro ? cashflowBICMensuel : cashflowReelMensuel) + "/mois", Math.round(FULL / 4), { bold: true, color: (isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? GREEN : RED }),
          td(fE(capitalRembourseAn1), Math.round(FULL / 4), { bold: true, color: ORANGE }),
        ]}),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),

    // Comparaison régimes
    heading("Comparaison des régimes fiscaux – année 1"),
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL * 0.45), Math.round(FULL * 0.275), Math.round(FULL * 0.275)],
      rows: [
        trow([th("Indicateur", Math.round(FULL * 0.45)), th("Régime réel simplifié", Math.round(FULL * 0.275), true), th("Micro-BIC", Math.round(FULL * 0.275), true)]),
        trow([td("Loyers imposables", Math.round(FULL * 0.45)), td(fE(loyerAnnuel), Math.round(FULL * 0.275), { right: true }), td(fE(loyerAnnuel), Math.round(FULL * 0.275), { right: true })]),
        trow([td("Charges / abattement", Math.round(FULL * 0.45)), td("Charges réelles : " + fE(chargesDeductibles), Math.round(FULL * 0.275), { right: true }), td("Abattement 50 % : " + fE(loyerAnnuel * 0.5), Math.round(FULL * 0.275), { right: true })]),
        trow([td("Amortissements déduits", Math.round(FULL * 0.45)), td(fE(amortTotalAn1), Math.round(FULL * 0.275), { right: true }), td("—", Math.round(FULL * 0.275), { right: true })]),
        trow([td("Base imposable", Math.round(FULL * 0.45), { bold: true }), td(fE(baseImposableReel), Math.round(FULL * 0.275), { right: true, bold: true, color: baseImposableReel === 0 ? GREEN : RED }), td(fE(baseBIC), Math.round(FULL * 0.275), { right: true, bold: true })]),
        trow([td("Fiscalité totale estimée", Math.round(FULL * 0.45), { bold: true }), td(fE(impotReel), Math.round(FULL * 0.275), { right: true, bold: true, color: impotReel === 0 ? GREEN : RED }), td(fE(impotBIC), Math.round(FULL * 0.275), { right: true, bold: true, color: RED })]),
        trow([td("Cash-flow mensuel net", Math.round(FULL * 0.45), { bold: true }), td(fE(cashflowReelMensuel) + "/mois", Math.round(FULL * 0.275), { right: true, bold: true, color: cashflowReelMensuel >= 0 ? GREEN : RED }), td(fE(cashflowBICMensuel) + "/mois", Math.round(FULL * 0.275), { right: true, bold: true, color: cashflowBICMensuel >= 0 ? GREEN : RED })]),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),
    note(`Hypothèse : Simulation sur ${totalYears} ans en ${regimeLabel}. Loyers, charges et valeur du bien supposés constants. TMI appliquée : ${tmi} % + prélèvements sociaux 18,6 %. Simulation indicative.`),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── PAGE 2 — CHAPITRE 1 : PROJET ET FINANCEMENT ─────────────────────────
  const page2: (Paragraph | Table)[] = [
    heading("1. Votre projet et son financement", HeadingLevel.HEADING_1),
    blank(),
    body("Le bien et les coûts d'acquisition", true),
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL * 0.6), Math.round(FULL * 0.4)],
      rows: [
        trow([th("Élément", Math.round(FULL * 0.6)), th("Montant", Math.round(FULL * 0.4), true)]),
        trow([td("Prix d'achat", Math.round(FULL * 0.6)), td(fE(prix), Math.round(FULL * 0.4), { right: true })]),
        ...(travaux > 0 ? [trow([td("Travaux", Math.round(FULL * 0.6)), td(fE(travaux), Math.round(FULL * 0.4), { right: true })])] : []),
        ...(mobilier > 0 ? [trow([td("Mobilier", Math.round(FULL * 0.6)), td(fE(mobilier), Math.round(FULL * 0.4), { right: true })])] : []),
        trow([td("Frais de notaire", Math.round(FULL * 0.6)), td(fE(notaire), Math.round(FULL * 0.4), { right: true })]),
        trow([td("Coût total projet", Math.round(FULL * 0.6), { bold: true }), td(fE(investTotal), Math.round(FULL * 0.4), { right: true, bold: true, color: ORANGE })]),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),
    body("Les revenus locatifs et charges", true),
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL * 0.6), Math.round(FULL * 0.4)],
      rows: [
        trow([th("Élément", Math.round(FULL * 0.6)), th("Montant", Math.round(FULL * 0.4), true)]),
        trow([td("Loyer HC mensuel", Math.round(FULL * 0.6)), td(fE(loyerAnnuel / 12) + "/mois", Math.round(FULL * 0.4), { right: true, bold: true, color: ORANGE })]),
        trow([td("Loyer HC annuel", Math.round(FULL * 0.6)), td(fE(loyerAnnuel), Math.round(FULL * 0.4), { right: true })]),
        ...(chargesLoyer > 0 ? [trow([td("Charges locataire/mois", Math.round(FULL * 0.6)), td(fE(chargesLoyer), Math.round(FULL * 0.4), { right: true })])] : []),
        ...(taxeFonciere > 0 ? [trow([td("Taxe foncière", Math.round(FULL * 0.6)), td(fE(taxeFonciere), Math.round(FULL * 0.4), { right: true })])] : []),
        ...(chargesCopro > 0 ? [trow([td("Charges copropriété", Math.round(FULL * 0.6)), td(fE(chargesCopro), Math.round(FULL * 0.4), { right: true })])] : []),
        trow([td("Total charges propriétaire/an", Math.round(FULL * 0.6), { bold: true }), td(fE(chargesAnnuelles), Math.round(FULL * 0.4), { right: true, bold: true })]),
        ...(assuranceEmprunteurAnnuel > 0 ? [trow([td("Assurance emprunteur/an", Math.round(FULL * 0.6)), td(fE(assuranceEmprunteurAnnuel), Math.round(FULL * 0.4), { right: true })])] : []),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),
    body("Le crédit immobilier", true),
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL * 0.5), Math.round(FULL * 0.25), Math.round(FULL * 0.25)],
      rows: [
        trow([th("Financement", Math.round(FULL * 0.5)), th("Montant", Math.round(FULL * 0.25), true), th("Traitement fiscal", Math.round(FULL * 0.25))]),
        trow([td("Apport personnel", Math.round(FULL * 0.5)), td(fE(apport), Math.round(FULL * 0.25), { right: true }), td("Non déductible", Math.round(FULL * 0.25))]),
        trow([td("Montant emprunté", Math.round(FULL * 0.5)), td(fE(montantCredit), Math.round(FULL * 0.25), { right: true }), td("Base du tableau", Math.round(FULL * 0.25))]),
        trow([td("Taux nominal · durée", Math.round(FULL * 0.5)), td(taux + " % · " + duree + " ans", Math.round(FULL * 0.25), { right: true }), td("", Math.round(FULL * 0.25))]),
        trow([td("Mensualité (hors ass.)", Math.round(FULL * 0.5)), td(fE(mensualite) + "/mois", Math.round(FULL * 0.25), { right: true }), td("Non déductible", Math.round(FULL * 0.25))]),
        trow([td("Intérêts année 1", Math.round(FULL * 0.5)), td(fE(interetsAnnee1), Math.round(FULL * 0.25), { right: true }), td(isMicro ? "Non déductibles (Micro-BIC)" : "Déductibles", Math.round(FULL * 0.25))]),
        trow([td("Capital remboursé an. 1", Math.round(FULL * 0.5)), td(fE(capitalRembourseAn1), Math.round(FULL * 0.25), { right: true }), td("Enrichissement patrimonial", Math.round(FULL * 0.25))]),
        ...(coutTotalInteret > 0 ? [trow([td("Coût total des intérêts", Math.round(FULL * 0.5)), td(fE(coutTotalInteret), Math.round(FULL * 0.25), { right: true }), td("Sur " + duree + " ans", Math.round(FULL * 0.25))])] : []),
        ...(assuranceEmprunteurAnnuel > 0 ? [trow([td("Assurance emprunteur", Math.round(FULL * 0.5)), td(fE(assuranceEmprunteurAnnuel) + "/an", Math.round(FULL * 0.25), { right: true }), td(isMicro ? "Non déductible en Micro-BIC" : "Déductible", Math.round(FULL * 0.25))])] : []),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),
    note(isMicro
      ? `À retenir : En Micro-BIC, un abattement forfaitaire de 50 % remplace toutes les déductions. Le remboursement du capital (${fE(capitalRembourseAn1)}/an en année 1) constitue un enrichissement patrimonial.`
      : `À retenir : Seuls les intérêts d'emprunt et l'assurance emprunteur sont déductibles fiscalement. Le remboursement du capital (${fE(capitalRembourseAn1)}/an en année 1) constitue un enrichissement patrimonial.`),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── PAGE 3 — CHAPITRE 2 : RENTABILITÉ ET CASH-FLOW ───────────────────────
  const page3: (Paragraph | Table)[] = [
    heading("2. Rentabilité et calcul du cash-flow", HeadingLevel.HEADING_1),
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL * 0.45), Math.round(FULL * 0.35), Math.round(FULL * 0.2)],
      rows: [
        trow([th("Indicateur", Math.round(FULL * 0.45)), th("Calcul", Math.round(FULL * 0.35)), th("Résultat", Math.round(FULL * 0.2), true)]),
        trow([td("Rentabilité brute sur prix d'achat", Math.round(FULL * 0.45)), td(fE(loyerAnnuel) + " / " + fE(prix) + " × 100", Math.round(FULL * 0.35)), td(fP((loyerAnnuel / prix) * 100), Math.round(FULL * 0.2), { right: true, bold: true })]),
        trow([td("Rentabilité brute acte en main", Math.round(FULL * 0.45)), td(fE(loyerAnnuel) + " / " + fE(investTotal) + " × 100", Math.round(FULL * 0.35)), td(fP(rendementBrut), Math.round(FULL * 0.2), { right: true, bold: true })]),
        trow([td("Rentabilité nette avant financement", Math.round(FULL * 0.45)), td("(" + fE(loyerAnnuel) + " − " + fE(chargesAnnuelles) + ") / " + fE(investTotal), Math.round(FULL * 0.35)), td(fP(rentaNetteAvFinancement), Math.round(FULL * 0.2), { right: true, bold: true })]),
        trow([td("Cash-flow avant impôt", Math.round(FULL * 0.45)), td("Loyers − crédit − charges", Math.round(FULL * 0.35)), td(fE(cashflowAvantImpot) + "/mois", Math.round(FULL * 0.2), { right: true, bold: true, color: cashflowAvantImpot >= 0 ? GREEN : RED })]),
        trow([td("Cash-flow après impôt (an. 1)", Math.round(FULL * 0.45)), td("CF av. impôt − " + fE((isMicro ? impotBIC : impotReel) / 12) + "/mois", Math.round(FULL * 0.35)), td(fE(isMicro ? cashflowBICMensuel : cashflowReelMensuel) + "/mois", Math.round(FULL * 0.2), { right: true, bold: true, color: (isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? GREEN : RED })]),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),
    body("Décomposition du cash-flow", true),
    new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [Math.round(FULL * 0.5), Math.round(FULL * 0.25), Math.round(FULL * 0.25)],
      rows: [
        trow([th("Flux de trésorerie", Math.round(FULL * 0.5)), th("Annuel", Math.round(FULL * 0.25), true), th("Mensuel", Math.round(FULL * 0.25), true)]),
        trow([td("+ Loyers encaissés (HC)", Math.round(FULL * 0.5)), td(fE(loyerAnnuel), Math.round(FULL * 0.25), { right: true, color: GREEN }), td(fE(loyerAnnuel / 12), Math.round(FULL * 0.25), { right: true, color: GREEN })]),
        trow([td("− Charges propriétaire", Math.round(FULL * 0.5)), td("−" + fE(chargesAnnuelles), Math.round(FULL * 0.25), { right: true, color: RED }), td("−" + fE(chargesAnnuelles / 12), Math.round(FULL * 0.25), { right: true, color: RED })]),
        ...(assuranceEmprunteurAnnuel > 0 ? [trow([td("− Assurance emprunteur", Math.round(FULL * 0.5)), td("−" + fE(assuranceEmprunteurAnnuel), Math.round(FULL * 0.25), { right: true, color: RED }), td("−" + fE(assuranceEmprunteurAnnuel / 12), Math.round(FULL * 0.25), { right: true, color: RED })])] : []),
        trow([td("− Mensualités de crédit", Math.round(FULL * 0.5)), td("−" + fE(creditAnnuel), Math.round(FULL * 0.25), { right: true, color: RED }), td("−" + fE(mensualite), Math.round(FULL * 0.25), { right: true, color: RED })]),
        trow([td("− Impôt estimé (année 1)", Math.round(FULL * 0.5)), td("−" + fE(isMicro ? impotBIC : impotReel), Math.round(FULL * 0.25), { right: true, color: RED }), td("−" + fE((isMicro ? impotBIC : impotReel) / 12), Math.round(FULL * 0.25), { right: true, color: RED })]),
        trow([td("= Trésorerie nette", Math.round(FULL * 0.5), { bold: true }), td(fE((isMicro ? cashflowBICMensuel : cashflowReelMensuel) * 12), Math.round(FULL * 0.25), { right: true, bold: true, color: (isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? GREEN : RED }), td(fE(isMicro ? cashflowBICMensuel : cashflowReelMensuel) + "/mois", Math.round(FULL * 0.25), { right: true, bold: true, color: (isMicro ? cashflowBICMensuel : cashflowReelMensuel) >= 0 ? GREEN : RED })]),
      ],
      layout: TableLayoutType.FIXED,
    }),
    blank(),
    note(`Un cash-flow négatif n'est pas nécessairement rédhibitoire. Votre investissement crée simultanément de la valeur patrimoniale : remboursement de capital (${fE(capitalRembourseAn1)}/an en an. 1) et potentielle valorisation du bien.`),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── PAGE 4 — CHAPITRE 3 : FISCALITÉ ──────────────────────────────────────
  const page4: (Paragraph | Table)[] = [
    heading("3. Fiscalité – calcul de l'impôt estimé", HeadingLevel.HEADING_1),
  ];
  if (isMicro) {
    page4.push(
      body("Calcul fiscal – année 1 (Micro-BIC)", true),
      new Table({
        width: { size: FULL, type: WidthType.DXA },
        columnWidths: [Math.round(FULL * 0.65), Math.round(FULL * 0.35)],
        rows: [
          trow([th("Étape", Math.round(FULL * 0.65)), th("Montant", Math.round(FULL * 0.35), true)]),
          trow([td("Revenus locatifs annuels (HC)", Math.round(FULL * 0.65)), td(fE(loyerAnnuel), Math.round(FULL * 0.35), { right: true })]),
          trow([td("− Abattement forfaitaire (50 %)", Math.round(FULL * 0.65)), td("−" + fE(loyerAnnuel * 0.5), Math.round(FULL * 0.35), { right: true, color: RED })]),
          trow([td("= Base imposable", Math.round(FULL * 0.65), { bold: true }), td(fE(baseBIC), Math.round(FULL * 0.35), { right: true, bold: true })]),
          trow([td("Impôt IR estimé (TMI " + tmi + " %)", Math.round(FULL * 0.65)), td(fE(impotBIC * (tmi / (tmi + 18.6))), Math.round(FULL * 0.35), { right: true })]),
          trow([td("Prélèvements sociaux (18,6 %)", Math.round(FULL * 0.65)), td(fE(impotBIC * (18.6 / (tmi + 18.6))), Math.round(FULL * 0.35), { right: true })]),
          trow([td("= Fiscalité totale estimée", Math.round(FULL * 0.65), { bold: true }), td(fE(impotBIC), Math.round(FULL * 0.35), { right: true, bold: true, color: impotBIC === 0 ? GREEN : RED })]),
          trow([td("Cash-flow mensuel", Math.round(FULL * 0.65), { bold: true }), td(fE(cashflowBICMensuel) + "/mois", Math.round(FULL * 0.35), { right: true, bold: true, color: cashflowBICMensuel >= 0 ? GREEN : RED })]),
        ],
        layout: TableLayoutType.FIXED,
      }),
      blank(),
      note(`En Micro-BIC, un abattement forfaitaire de 50 % est appliqué sur vos revenus. La base imposable restante est taxée au taux global TMI + PS = ${(tmi + 18.6).toFixed(1)} %. Ce régime est simple mais ne permet pas de déduire les charges réelles ni les amortissements.`),
    );
  } else {
    const firstTaxRow = rows.find(ro => ro.baseImposable > 0);
    page4.push(
      body("Calcul fiscal – année 1 (Régime réel simplifié)", true),
      new Table({
        width: { size: FULL, type: WidthType.DXA },
        columnWidths: [Math.round(FULL * 0.65), Math.round(FULL * 0.35)],
        rows: [
          trow([th("Étape", Math.round(FULL * 0.65)), th("Montant", Math.round(FULL * 0.35), true)]),
          trow([td("Loyers imposables (HC)", Math.round(FULL * 0.65)), td(fE(loyerAnnuel), Math.round(FULL * 0.35), { right: true })]),
          trow([td("− Charges annuelles déductibles", Math.round(FULL * 0.65)), td("−" + fE(chargesAnnuelles), Math.round(FULL * 0.35), { right: true, color: RED })]),
          trow([td("− Intérêts d'emprunt", Math.round(FULL * 0.65)), td("−" + fE(interetsAnnee1), Math.round(FULL * 0.35), { right: true, color: RED })]),
          ...(assuranceEmprunteurAnnuel > 0 ? [trow([td("− Assurance emprunteur", Math.round(FULL * 0.65)), td("−" + fE(assuranceEmprunteurAnnuel), Math.round(FULL * 0.35), { right: true, color: RED })])] : []),
          trow([td("= Résultat avant amortissement", Math.round(FULL * 0.65), { bold: true }), td(fE(resultatAvantAmort), Math.round(FULL * 0.35), { right: true, bold: true })]),
          trow([td("− Amortissements déduits (an. 1)", Math.round(FULL * 0.65)), td("−" + fE(amortTotalAn1), Math.round(FULL * 0.35), { right: true, color: RED })]),
          trow([td("= Base imposable", Math.round(FULL * 0.65), { bold: true }), td(fE(baseImposableReel), Math.round(FULL * 0.35), { right: true, bold: true, color: baseImposableReel === 0 ? GREEN : RED })]),
          trow([td("Impôt IR estimé (TMI " + tmi + " %)", Math.round(FULL * 0.65)), td(fE(impotReel * (tmi / (tmi + 18.6))), Math.round(FULL * 0.35), { right: true })]),
          trow([td("Prélèvements sociaux (18,6 %)", Math.round(FULL * 0.65)), td(fE(impotReel * (18.6 / (tmi + 18.6))), Math.round(FULL * 0.35), { right: true })]),
          trow([td("= Fiscalité totale estimée", Math.round(FULL * 0.65), { bold: true }), td(fE(impotReel), Math.round(FULL * 0.35), { right: true, bold: true, color: impotReel === 0 ? GREEN : RED })]),
        ],
        layout: TableLayoutType.FIXED,
      }),
      blank(),
      note(`TMI : ${tmi} % – Prélèvements sociaux : 18,6 % – Taux global : ${(tmi + 18.6).toFixed(1)} %.${firstTaxRow ? ` En régime réel, vous commencez à payer de l'impôt à partir de l'année ${firstTaxRow.year} avec une base imposable de ${fE(firstTaxRow.baseImposable)}.` : " Sur toute la période analysée, la base imposable reste à 0 € grâce aux amortissements reportables."}`),
    );
  }
  page4.push(new Paragraph({ children: [new PageBreak()] }));

  // ── PAGE 5 — AMORTISSEMENT (réel uniquement) ──────────────────────────────
  const page5: (Paragraph | Table)[] = [];
  if (!isMicro) {
    page5.push(
      heading("4. L'amortissement, expliqué simplement", HeadingLevel.HEADING_1),
      body("En LMNP au régime réel, vous pouvez déduire chaque année une fraction de la valeur du bien de vos revenus locatifs — c'est l'amortissement. Contrairement aux charges réelles, il ne s'agit pas d'une dépense effective : c'est un avantage fiscal pur. Le terrain (non dégradable) n'est jamais amortissable."),
      blank(),
      new Table({
        width: { size: FULL, type: WidthType.DXA },
        columnWidths: [Math.round(FULL * 0.4), Math.round(FULL * 0.2), Math.round(FULL * 0.2), Math.round(FULL * 0.2)],
        rows: [
          trow([th("Composant", Math.round(FULL * 0.4)), th("Valeur retenue", Math.round(FULL * 0.2), true), th("Durée", Math.round(FULL * 0.2), true), th("Amort./an", Math.round(FULL * 0.2), true)]),
          ...annexeCols.map(c => trow([td(c.label, Math.round(FULL * 0.4)), td(fE(c.initial), Math.round(FULL * 0.2), { right: true }), td(c.duree + " ans", Math.round(FULL * 0.2), { right: true }), td(fE(c.annuel) + "/an", Math.round(FULL * 0.2), { right: true, bold: true, color: ORANGE })])),
          trow([td("Terrain (non amortissable)", Math.round(FULL * 0.4)), td(fE(terrainVal), Math.round(FULL * 0.2), { right: true }), td("—", Math.round(FULL * 0.2), { right: true }), td("0 €", Math.round(FULL * 0.2), { right: true })]),
          trow([td("Total amortissement annuel (an. 1)", Math.round(FULL * 0.4), { bold: true }), td(fE(prix), Math.round(FULL * 0.2), { right: true, bold: true }), td("", Math.round(FULL * 0.2)), td(fE(amortTotalAn1) + "/an", Math.round(FULL * 0.2), { right: true, bold: true, color: ORANGE })]),
        ],
        layout: TableLayoutType.FIXED,
      }),
      blank(),
      note(`Part amortissable : ${amortPct} % du prix d'achat (${fE(valeurAmortissable)}) est amortissable. Les ${100 - amortPct} % restants (${fE(terrainVal)}) représentent le terrain. En cas d'excédent d'amortissement, le surplus est reporté sans limitation de durée sur les exercices suivants.`),
      new Paragraph({ children: [new PageBreak()] }),
    );
  }

  // ── PAGE 6 — ÉVOLUTION DANS LE TEMPS ────────────────────────────────────
  const chNum = isMicro ? 4 : 5;
  const page6: (Paragraph | Table)[] = [
    heading(`${chNum}. Évolution de l'investissement dans le temps`, HeadingLevel.HEADING_1),
  ];
  if (isMicro) {
    const bicBase = loyerAnnuel * 0.50;
    const bicImpot = bicBase * (tmi / 100 + 0.186);
    page6.push(
      new Table({
        width: { size: FULL, type: WidthType.DXA },
        columnWidths: [Math.round(FULL * 0.1), Math.round(FULL * 0.18), Math.round(FULL * 0.18), Math.round(FULL * 0.18), Math.round(FULL * 0.18), Math.round(FULL * 0.18)],
        rows: [
          trow([th("Année", Math.round(FULL * 0.1)), th("Capital restant dû", Math.round(FULL * 0.18), true), th("Intérêts", Math.round(FULL * 0.18), true), th("Base impos. BIC", Math.round(FULL * 0.18), true), th("Impôt", Math.round(FULL * 0.18), true), th("CF/mois", Math.round(FULL * 0.18), true)]),
          ...keyYears.map(yr => {
            const ro = rows.find(r => r.year === yr)!;
            const cfBic = (loyerAnnuel - ro.creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - bicImpot) / 12;
            return trow([
              td("An " + yr, Math.round(FULL * 0.1), { bold: true }),
              td(yr <= duree ? fE(ro.capitalDebut) : "—", Math.round(FULL * 0.18), { right: true }),
              td(yr <= duree ? fE(ro.interetsAnnee) : "—", Math.round(FULL * 0.18), { right: true }),
              td(fE(bicBase), Math.round(FULL * 0.18), { right: true, color: RED }),
              td(fE(bicImpot), Math.round(FULL * 0.18), { right: true, color: bicImpot === 0 ? GREEN : RED }),
              td(fE(cfBic) + "/mois", Math.round(FULL * 0.18), { right: true, bold: true, color: cfBic >= 0 ? GREEN : RED }),
            ]);
          }),
        ],
        layout: TableLayoutType.FIXED,
      }),
    );
  } else {
    page6.push(
      new Table({
        width: { size: FULL, type: WidthType.DXA },
        columnWidths: [Math.round(FULL * 0.1), Math.round(FULL * 0.15), Math.round(FULL * 0.15), Math.round(FULL * 0.15), Math.round(FULL * 0.15), Math.round(FULL * 0.15), Math.round(FULL * 0.15)],
        rows: [
          trow([th("Année", Math.round(FULL * 0.1)), th("Capital dû", Math.round(FULL * 0.15), true), th("Intérêts", Math.round(FULL * 0.15), true), th("Amort.", Math.round(FULL * 0.15), true), th("Base impos.", Math.round(FULL * 0.15), true), th("Impôt", Math.round(FULL * 0.15), true), th("CF/mois", Math.round(FULL * 0.15), true)]),
          ...keyYears.map(yr => {
            const ro = rows.find(r => r.year === yr)!;
            return trow([
              td("An " + yr, Math.round(FULL * 0.1), { bold: true }),
              td(yr <= duree ? fE(ro.capitalDebut) : "—", Math.round(FULL * 0.15), { right: true }),
              td(yr <= duree ? fE(ro.interetsAnnee) : "—", Math.round(FULL * 0.15), { right: true }),
              td(fE(ro.amortTotalA), Math.round(FULL * 0.15), { right: true }),
              td(fE(ro.baseImposable), Math.round(FULL * 0.15), { right: true, color: ro.baseImposable === 0 ? GREEN : RED }),
              td(fE(ro.impot), Math.round(FULL * 0.15), { right: true, color: ro.impot === 0 ? GREEN : RED }),
              td(fE(ro.cashflow) + "/mois", Math.round(FULL * 0.15), { right: true, bold: true, color: ro.cashflow >= 0 ? GREEN : RED }),
            ]);
          }),
        ],
        layout: TableLayoutType.FIXED,
      }),
    );
  }
  page6.push(new Paragraph({ children: [new PageBreak()] }));

  // ── PAGE 7 — SCÉNARIOS DE REVENTE ────────────────────────────────────────
  const reventeYears = [10, 25, 35];
  const growthScenarios = [
    { label: "Valeur stable (0 %/an)", pct: 0 },
    { label: "Revalorisation +1 %/an", pct: 0.01 },
  ];
  const introRevente = isMicro
    ? "Plus-value en Micro-BIC : aucun amortissement réintégré. Plus-value brute = prix de vente − prix d'acquisition. Exonération Impôt sur le Revenu à 22 ans, Prélèvements sociaux à 30 ans."
    : "Plus-value en régime réel (Loi de finances 2025) : les amortissements déduits sont réintégrés dans l'assiette imposable. Plus-value brute = prix de vente − (prix d'acquisition − amortissements cumulés). Exonération Impôt sur le Revenu à 22 ans, Prélèvements sociaux à 30 ans.";
  const colW = [Math.round(FULL * 0.28), Math.round(FULL * 0.13), Math.round(FULL * 0.13), Math.round(FULL * 0.18), Math.round(FULL * 0.15), Math.round(FULL * 0.13)];
  const page7: (Paragraph | Table)[] = [
    heading(`${chNum + 1}. Scénarios de revente`, HeadingLevel.HEADING_1),
    body(introRevente),
    blank(),
    ...reventeYears.flatMap(yr => {
      const ro = rows.find((r: any) => r.year === yr) ?? rows[rows.length - 1];
      const crd = yr <= duree ? (ro?.capitalFin ?? 0) : 0;
      const amortCumulYr = getAmortCumul(yr);
      const exoIR = abattIR(yr) >= 1 ? " [IR exonéré]" : abattIR(yr) > 0 ? ` [Abatt. IR ${Math.round(abattIR(yr) * 100)} %]` : "";
      const exoPS = abattPS(yr) >= 1 ? " [Prél. soc. exonérés]" : "";
      return [
        body(`Revente à ${yr} ans${exoIR}${exoPS}`, true, DARK),
        new Table({
          width: { size: FULL, type: WidthType.DXA },
          columnWidths: colW,
          rows: [
            trow([
              th("Scénario", colW[0]),
              th("Prix de vente", colW[1], true),
              th("Crédit restant dû", colW[2], true),
              th("Impôt plus-value IR (19 %)*", colW[3], true),
              th("Prélèvements sociaux (17,2 %)**", colW[4], true),
              th("Net dans la poche", colW[5], true),
            ]),
            ...growthScenarios.map(sc => {
              const prixVente = investTotal * Math.pow(1 + sc.pct, yr);
              const pvBrute = Math.max(0, prixVente - investTotal + amortCumulYr);
              const taxIR = pvBrute * (1 - abattIR(yr)) * 0.19;
              const taxPS = pvBrute * (1 - abattPS(yr)) * 0.172;
              const net = prixVente - crd - taxIR - taxPS;
              return trow([
                td(sc.label, colW[0]),
                td(fE(prixVente), colW[1], { right: true }),
                td(crd > 0 ? "−" + fE(crd) : "—", colW[2], { right: true, color: crd > 0 ? RED : "888888" }),
                td(taxIR > 0 ? "−" + fE(taxIR) : "0 € ✓", colW[3], { right: true, color: taxIR > 0 ? RED : GREEN }),
                td(taxPS > 0 ? "−" + fE(taxPS) : "0 € ✓", colW[4], { right: true, color: taxPS > 0 ? RED : GREEN }),
                td(fE(net), colW[5], { right: true, bold: true, color: net >= investTotal ? GREEN : net >= 0 ? "B08A2A" : RED }),
              ]);
            }),
          ],
          layout: TableLayoutType.FIXED,
        }),
        blank(),
      ];
    }),
    body("* Impôt sur le Revenu — plus-value immobilière (taux fixe 19 %) : 0 % ans 1–5 · 6 %/an dès an 6 (max 96 %) · +4 % an 22 → 100 % exonéré à 22 ans.", false, "555555", 18),
    body("** Prélèvements sociaux — plus-value immobilière (taux 17,2 %) : 0 % ans 1–5 · 1,65 %/an dès an 6 · 1,6 % an 22 · 9 %/an ans 23–30 → 100 % exonéré à 30 ans.", false, "555555", 18),
    blank(),
    note(`Hypothèses : Base d'acquisition ${fE(investTotal)}.${!isMicro ? " Amortissements cumulés réintégrés (Loi de finances 2025)." : ""} Crédit restant dû déduit si revente avant ${duree} ans. Simulation indicative — consulter un expert-comptable LMNP.`),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── ANNEXE A — PROJECTION DÉTAILLÉE (portrait) ────────────────────────────
  const annexeACols = isMicro
    ? [Math.round(FULL_L * 0.05), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.11), Math.round(FULL_L * 0.18)]
    : [Math.round(FULL_L * 0.04), Math.round(FULL_L * 0.09), Math.round(FULL_L * 0.09), Math.round(FULL_L * 0.09), Math.round(FULL_L * 0.09), Math.round(FULL_L * 0.09), Math.round(FULL_L * 0.10), Math.round(FULL_L * 0.10), Math.round(FULL_L * 0.10), Math.round(FULL_L * 0.10), Math.round(FULL_L * 0.11)];

  const bicBase = loyerAnnuel * 0.50;
  const bicImpot = bicBase * (tmi / 100 + 0.186);

  const annexeAHeaderMicro = [th("An", annexeACols[0]), th("CRD fin", annexeACols[1], true), th("Annuité", annexeACols[2], true), th("Intérêts", annexeACols[3], true), th("Cap. remb.", annexeACols[4], true), th("Charges", annexeACols[5], true), th("Base BIC", annexeACols[6], true), th("Impôt", annexeACols[7], true), th("CF/mois", annexeACols[8], true)];
  const annexeAHeaderReel = [th("An", annexeACols[0]), th("CRD fin", annexeACols[1], true), th("Annuité", annexeACols[2], true), th("Intérêts", annexeACols[3], true), th("Cap.remb.", annexeACols[4], true), th("Charges", annexeACols[5], true), th("Rés.av.amort", annexeACols[6], true), th("Amort.", annexeACols[7], true), th("Base impos.", annexeACols[8], true), th("Impôt", annexeACols[9], true), th("CF/mois", annexeACols[10], true)];

  const annexeARows = rows.map(ro => {
    if (isMicro) {
      const cfBic = (loyerAnnuel - ro.creditAnnuelR - chargesAnnuelles - assuranceEmprunteurAnnuel - bicImpot) / 12;
      return trow([
        td(String(ro.year), annexeACols[0], { bold: true }),
        td(ro.year <= duree ? fE(ro.capitalFin) : "—", annexeACols[1], { right: true }),
        td(ro.year <= duree ? fE(ro.creditAnnuelR) : "—", annexeACols[2], { right: true }),
        td(ro.year <= duree ? fE(ro.interetsAnnee) : "—", annexeACols[3], { right: true }),
        td(ro.year <= duree ? fE(ro.capitalRembourse) : "—", annexeACols[4], { right: true }),
        td(fE(chargesAnnuelles), annexeACols[5], { right: true }),
        td(fE(bicBase), annexeACols[6], { right: true, color: RED }),
        td(fE(bicImpot), annexeACols[7], { right: true, color: bicImpot === 0 ? GREEN : RED }),
        td(fE(cfBic), annexeACols[8], { right: true, bold: true, color: cfBic >= 0 ? GREEN : RED }),
      ]);
    }
    return trow([
      td(String(ro.year), annexeACols[0], { bold: true }),
      td(ro.year <= duree ? fE(ro.capitalFin) : "—", annexeACols[1], { right: true }),
      td(ro.year <= duree ? fE(ro.creditAnnuelR) : "—", annexeACols[2], { right: true }),
      td(ro.year <= duree ? fE(ro.interetsAnnee) : "—", annexeACols[3], { right: true }),
      td(ro.year <= duree ? fE(ro.capitalRembourse) : "—", annexeACols[4], { right: true }),
      td(fE(chargesAnnuelles), annexeACols[5], { right: true }),
      td(fE(ro.resultatAvantAmort), annexeACols[6], { right: true }),
      td(fE(ro.amortDisponible), annexeACols[7], { right: true, bold: true }),
      td(fE(ro.baseImposable), annexeACols[8], { right: true, color: ro.baseImposable === 0 ? GREEN : RED }),
      td(fE(ro.impot), annexeACols[9], { right: true, color: ro.impot === 0 ? GREEN : RED }),
      td(fE(ro.cashflow), annexeACols[10], { right: true, bold: true, color: ro.cashflow >= 0 ? GREEN : RED }),
    ]);
  });

  // ── ANNEXE B — AMORTISSEMENT DÉTAILLÉ (réel uniquement) ──────────────────
  const annexeBSection: (Paragraph | Table)[] = [];
  if (!isMicro && annexeCols.length > 0) {
    const annexeMaxDuree = Math.max(...annexeCols.map(c => c.duree));
    const nCols = annexeCols.length; // each has amort + reste
    const wAn = 300;
    const wTotal = 900;
    const wComp = Math.round((FULL_L - wAn - wTotal) / (nCols * 2));
    annexeBSection.push(
      heading("Annexe B — Amortissement détaillé par composant", HeadingLevel.HEADING_1),
      new Table({
        width: { size: FULL_L, type: WidthType.DXA },
        columnWidths: [wAn, ...annexeCols.flatMap(() => [wComp, wComp]), wTotal],
        rows: [
          trow([th("An", wAn), ...annexeCols.flatMap(c => [th(c.label, wComp, true), th("Reste", wComp, true)]), th("Total/an", wTotal, true)]),
          ...Array.from({ length: annexeMaxDuree }, (_, i) => {
            const year = i + 1;
            let total = 0;
            const cells: TableCell[] = [td(String(year), wAn, { bold: true })];
            for (const c of annexeCols) {
              if (year <= c.duree) {
                const reste = Math.max(0, c.initial - year * c.annuel);
                total += c.annuel;
                cells.push(td(fE(c.annuel), wComp, { right: true }));
                cells.push(td(fE(reste), wComp, { right: true, color: reste <= 0.01 ? GREEN : "888888" }));
              } else {
                cells.push(td("—", wComp, { right: true }));
                cells.push(td("", wComp));
              }
            }
            cells.push(td(fE(total), wTotal, { right: true, bold: true, color: ORANGE }));
            return trow(cells);
          }),
        ],
        layout: TableLayoutType.FIXED,
      }),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSEMBLE DOCUMENT
  // ─────────────────────────────────────────────────────────────────────────
  const allPortraitChildren = [
    ...page1, ...page2, ...page3, ...page4, ...page5, ...page6, ...page7,
  ];

  // Annexe A — landscape
  const annexeASection = [
    heading("Annexe A — Projection détaillée sur " + totalYears + " ans", HeadingLevel.HEADING_1),
    body(isMicro ? "Micro-BIC · Abattement 50 % constant · Loyers et charges supposés constants" : "Régime réel simplifié · Loyers et charges constants · Amortissement variable"),
    blank(),
    new Table({
      width: { size: FULL_L, type: WidthType.DXA },
      columnWidths: isMicro ? annexeACols : annexeACols,
      rows: [
        trow(isMicro ? annexeAHeaderMicro : annexeAHeaderReel),
        ...annexeARows,
      ],
      layout: TableLayoutType.FIXED,
    }),
    ...annexeBSection,
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: "1A1612" },
          paragraph: { spacing: { line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { bold: true, size: pt(14), color: DARK },
          paragraph: { spacing: { before: 200, after: 120 }, border: { bottom: { color: ORANGE, size: 8, style: BorderStyle.SINGLE } } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: { bold: true, size: pt(12), color: DARK },
          paragraph: { spacing: { before: 160, after: 80 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.7), left: convertInchesToTwip(0.8), right: convertInchesToTwip(0.8) },
          },
        },
        children: allPortraitChildren,
      },
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.6), right: convertInchesToTwip(0.6) },
            size: { orientation: PageOrientation.LANDSCAPE, width: convertInchesToTwip(11.69), height: convertInchesToTwip(8.27) },
          },
        },
        children: annexeASection,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

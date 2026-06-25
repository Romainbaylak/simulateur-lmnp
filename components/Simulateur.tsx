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
  interetsAnnuels: number;
  chargesAnnuelles: number;
  loyerAnnuel: number;
  amortBien: number;
  amortMobilier: number;
  amortTotal: number;
  chargesDeductibles: number;
  baseImposableReel: number;
  impotReel: number;
  impotReelMensuel: number;
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

function stripLeadingZeros(val: string): string {
  if (!val) return val;
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toString();
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
  const [rendementTab, setRendementTab] = useState<number>(5);
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
    const prix = parseFloat(form.prix) || 0;
    const travaux = parseFloat(form.travaux) || 0;
    const notaire = parseFloat(form.notaire) || 0;
    const chargesCopro = parseFloat(form.chargesCopro) || 0;
    const apport = parseFloat(form.apport) || 0;
    const taux = parseFloat(form.taux) / 100 || 0;
    const loyerMensuel = loyerSlider > 0 ? loyerSlider : (parseFloat(form.loyer) || 0);
    const taxeFonciere = parseFloat(form.taxeFonciere) || 0;

    if (prix <= 0 || loyerMensuel <= 0) { setResultats(null); return; }

    const investTotal = prix + travaux + notaire;
    const montantCredit = Math.max(0, investTotal - apport);
    const mensualite = calcMensualite(montantCredit, taux, form.duree);
    const creditAnnuel = mensualite * 12;
    const interetsAnnuels = montantCredit * taux;
    const chargesAnnuelles = taxeFonciere + chargesCopro;
    const loyerAnnuel = loyerMensuel * 12;

    const amortBien = (prix * 0.85) / 30;
    const amortMobilier = (prix * 0.15) / 7;
    const amortTotal = amortBien + amortMobilier;

    const chargesDeductibles = chargesAnnuelles + interetsAnnuels;
    const baseImposableReel = Math.max(0, loyerAnnuel - chargesDeductibles - amortTotal);
    const impotReel = baseImposableReel * (form.tmi / 100 + 0.172);
    const impotReelMensuel = impotReel / 12;
    const cashflowReelMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - impotReel) / 12;

    const baseBIC = loyerAnnuel * 0.70;
    const impotBIC = baseBIC * (form.tmi / 100 + 0.172);
    const cashflowBICMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - impotBIC) / 12;

    const rendementBrut = (loyerAnnuel / investTotal) * 100;
    const rendementNet = ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100;

    setResultats({
      investTotal, montantCredit, mensualite, creditAnnuel, interetsAnnuels,
      chargesAnnuelles, loyerAnnuel, amortBien, amortMobilier, amortTotal,
      chargesDeductibles, baseImposableReel, impotReel, impotReelMensuel,
      cashflowReelMensuel, baseBIC, impotBIC, cashflowBICMensuel,
      rendementBrut, rendementNet,
    });
  }, [form, loyerSlider]);

  useEffect(() => {
    const l = parseFloat(form.loyer) || 0;
    if (l > 0 && loyerSlider === 0) setLoyerSlider(l);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loyer]);

  const handleSimuler = () => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const verdict = resultats
    ? resultats.rendementNet > 5 && resultats.cashflowReelMensuel > 0
      ? { label: "Excellent investissement", bg: "#1A7A52", icon: "✓" }
      : resultats.rendementNet > 3
      ? { label: "Investissement correct", bg: "#B08A2A", icon: "~" }
      : { label: "Rentabilité faible", bg: "#B03A2A", icon: "✗" }
    : null;

  const loyerPourRendement = (pct: number) =>
    resultats ? Math.round((pct / 100 * resultats.investTotal) / 12) : 0;

  const anneesZeroImpot = resultats
    ? resultats.baseImposableReel === 0
      ? "Toute la durée du crédit"
      : "Calcul selon votre situation"
    : "-";

  const loyerEffectif = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;
  const sliderMin = Math.max(100, Math.round(loyerBas * 0.7));
  const sliderMax = loyerHaut > 0 ? Math.round(loyerHaut * 1.5) : Math.round((parseFloat(form.loyer) || 500) * 2);

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
                  Ville hors base officielle.{" "}
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
                    { label: "Impôt estimé annuel", val: formatEuro(resultats.impotReel), sub: `TMI ${form.tmi}% + PS 17,2%` },
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
                    <span className="text-lg font-medium" style={{ color: "#C95B2A" }}>{formatEuro(loyerEffectif)}/mois</span>
                  </div>
                  <input type="range"
                    min={sliderMin} max={sliderMax} step={25}
                    value={loyerSlider || parseFloat(form.loyer) || 500}
                    onChange={e => setLoyerSlider(parseFloat(e.target.value))}
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
                          {r.charges !== null && (
                            <div className="flex justify-between">
                              <span style={{ color: "rgba(26,22,18,0.5)" }}>Charges déductibles</span>
                              <span style={{ color: "#B03A2A" }}>−{formatEuro(r.charges)}</span>
                            </div>
                          )}
                          {r.amort !== null && (
                            <div className="flex justify-between">
                              <span style={{ color: "rgba(26,22,18,0.5)" }}>Amortissements</span>
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
                    Nous conseillons le Régime Réel au Régime Micro-BIC, qui permet un amortissement partiel du bien, des charges déductibles, et donc un résultat au bilan comptable nul qui réduit la base imposable.{" "}
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
                    className="w-full flex justify-between items-center p-5 text-left"
                    style={{ color: "#1A1612" }}>
                    <span className="font-medium text-sm">Détail de l&apos;amortissement LMNP</span>
                    <span style={{ color: "rgba(26,22,18,0.4)", fontSize: 12 }}>{showAmort ? "▲" : "▼"}</span>
                  </button>
                  {showAmort && (
                    <div className="px-5 pb-5 space-y-3" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {[
                          { label: "Bâti", val: resultats.amortBien, sub: "85% prix · 30 ans" },
                          { label: "Mobilier", val: resultats.amortMobilier, sub: "15% prix · 7 ans" },
                          { label: "Total", val: resultats.amortTotal, sub: "Déductible/an", accent: true },
                        ].map(({ label, val, sub, accent }) => (
                          <div key={label} className="rounded-lg p-3 text-center"
                            style={{ background: accent ? "rgba(201,91,42,0.08)" : "#F5F0E8" }}>
                            <div className="text-[10px] uppercase tracking-[0.1em] mb-1"
                              style={{ color: accent ? "#C95B2A" : "rgba(26,22,18,0.4)" }}>{label}</div>
                            <div className="font-medium text-sm"
                              style={{ color: accent ? "#C95B2A" : "#1A1612" }}>{formatEuro(val)}/an</div>
                            <div className="text-[10px] mt-0.5" style={{ color: "rgba(26,22,18,0.35)" }}>{sub}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg p-3 text-[12px]"
                        style={{ background: "rgba(201,91,42,0.05)", border: "0.5px solid rgba(201,91,42,0.1)" }}>
                        <div className="font-medium mb-0.5" style={{ color: "#C95B2A" }}>Durée estimée sans impôt</div>
                        <div style={{ color: "rgba(26,22,18,0.65)" }}>{anneesZeroImpot}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loyer cible */}
                <div className="rounded-xl p-5" style={cardStyle}>
                  <h3 className="font-medium text-[#1A1612] mb-4 text-sm">Loyer cible par rendement brut</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {[4, 5, 6, 7, 8].map(p => (
                      <button key={p} onClick={() => setRendementTab(p)}
                        className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
                        style={{
                          background: rendementTab === p ? "#1A1612" : "#F5F0E8",
                          color: rendementTab === p ? "#F5F0E8" : "rgba(26,22,18,0.55)",
                          border: "0.5px solid rgba(26,22,18,0.12)",
                        }}>
                        {p}%
                      </button>
                    ))}
                  </div>
                  <div className="rounded-lg p-4 text-center" style={{ background: "#1A1612" }}>
                    <div className="text-[11px] uppercase tracking-[0.1em] mb-2"
                      style={{ color: "rgba(245,240,232,0.5)" }}>
                      Loyer mensuel pour {rendementTab}% brut
                    </div>
                    <div className="text-3xl font-light" style={{ color: "#F5F0E8", letterSpacing: "-0.025em" }}>
                      {formatEuro(loyerPourRendement(rendementTab))}
                      <span className="text-base font-normal" style={{ color: "rgba(245,240,232,0.5)" }}>/mois</span>
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(245,240,232,0.35)" }}>
                      sur {formatEuro(resultats.investTotal)} investis
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

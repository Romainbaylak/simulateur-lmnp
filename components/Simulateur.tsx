"use client";

import { useState, useEffect, useCallback } from "react";

const villes = {
  paris:       { tf: 0.055, ap: { b: 20, m: 27, h: 35 }, ma: { b: 15, m: 20, h: 26 }, label: "Paris" },
  lyon:        { tf: 0.045, ap: { b: 11, m: 15, h: 20 }, ma: { b: 9,  m: 12, h: 16 }, label: "Lyon" },
  bordeaux:    { tf: 0.040, ap: { b: 10, m: 14, h: 18 }, ma: { b: 8,  m: 11, h: 15 }, label: "Bordeaux" },
  toulouse:    { tf: 0.035, ap: { b: 9,  m: 13, h: 17 }, ma: { b: 7,  m: 10, h: 14 }, label: "Toulouse" },
  nantes:      { tf: 0.038, ap: { b: 10, m: 13, h: 17 }, ma: { b: 8,  m: 11, h: 14 }, label: "Nantes" },
  marseille:   { tf: 0.030, ap: { b: 8,  m: 12, h: 16 }, ma: { b: 7,  m: 10, h: 13 }, label: "Marseille" },
  lille:       { tf: 0.042, ap: { b: 9,  m: 12, h: 16 }, ma: { b: 7,  m: 10, h: 13 }, label: "Lille" },
  montpellier: { tf: 0.036, ap: { b: 10, m: 13, h: 17 }, ma: { b: 8,  m: 11, h: 14 }, label: "Montpellier" },
  rennes:      { tf: 0.037, ap: { b: 10, m: 13, h: 17 }, ma: { b: 8,  m: 11, h: 14 }, label: "Rennes" },
  nice:        { tf: 0.038, ap: { b: 12, m: 17, h: 23 }, ma: { b: 10, m: 14, h: 19 }, label: "Nice" },
  autre:       { tf: 0.038, ap: { b: 7,  m: 11, h: 15 }, ma: { b: 6,  m: 9,  h: 12 }, label: "votre ville" },
} as const;

type VilleKey = keyof typeof villes;
type TypeBien = "ap" | "ma";
type TMI = 0 | 11 | 30 | 41 | 45;
type DureeCredit = 15 | 20 | 25;

interface FormState {
  type: TypeBien;
  surface: string;
  ville: VilleKey;
  prix: string;
  travaux: string;
  notaire: string;
  chargesCopro: string;
  apport: string;
  duree: DureeCredit;
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
  cashflowReelMensuel: number;
  baseBIC: number;
  impotBIC: number;
  cashflowBICMensuel: number;
  rendementBrut: number;
  rendementNet: number;
}

function formatEuro(n: number, decimals = 0): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(n);
}

function formatPct(n: number): string {
  return n.toFixed(2) + " %";
}

function calcMensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  if (capital <= 0 || tauxAnnuel <= 0) return capital / (dureeAns * 12);
  const r = tauxAnnuel / 12;
  const n = dureeAns * 12;
  return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function Simulateur() {
  const [form, setForm] = useState<FormState>({
    type: "ap",
    surface: "",
    ville: "paris",
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

  const [loyerSlider, setLoyerSlider] = useState<number>(0);
  const [showAmort, setShowAmort] = useState(false);
  const [rendementTab, setRendementTab] = useState<number>(5);
  const [resultats, setResultats] = useState<Resultats | null>(null);

  const villeData = villes[form.ville];
  const typeRates = villeData[form.type];

  const surface = parseFloat(form.surface) || 0;
  const loyerBas = surface > 0 ? typeRates.b * surface : 0;
  const loyerMoyen = surface > 0 ? typeRates.m * surface : 0;
  const loyerHaut = surface > 0 ? typeRates.h * surface : 0;
  const showFourchette = surface > 0 && form.ville;

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  // Auto-compute derived fields when prix or ville changes
  useEffect(() => {
    const prix = parseFloat(form.prix) || 0;
    if (prix > 0) {
      const notaire = Math.round(prix * 0.075);
      const taxeFonciere = Math.round(prix * villeData.tf);
      const chargesCopro = form.type === "ap" ? Math.round(prix * 0.01) : 0;
      setForm(prev => ({
        ...prev,
        notaire: notaire.toString(),
        taxeFonciere: taxeFonciere.toString(),
        chargesCopro: chargesCopro.toString(),
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.prix, form.ville, form.type]);

  // Compute results
  useEffect(() => {
    const prix = parseFloat(form.prix) || 0;
    const travaux = parseFloat(form.travaux) || 0;
    const notaire = parseFloat(form.notaire) || 0;
    const chargesCopro = parseFloat(form.chargesCopro) || 0;
    const apport = parseFloat(form.apport) || 0;
    const taux = parseFloat(form.taux) / 100 || 0;
    const loyerMensuel = loyerSlider > 0 ? loyerSlider : (parseFloat(form.loyer) || 0);
    const taxeFonciere = parseFloat(form.taxeFonciere) || 0;

    if (prix <= 0 || loyerMensuel <= 0) {
      setResultats(null);
      return;
    }

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
    const cashflowReelMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - impotReel) / 12;

    const baseBIC = loyerAnnuel * 0.70;
    const impotBIC = baseBIC * (form.tmi / 100 + 0.172);
    const cashflowBICMensuel = (loyerAnnuel - creditAnnuel - chargesAnnuelles - impotBIC) / 12;

    const rendementBrut = (loyerAnnuel / investTotal) * 100;
    const rendementNet = ((loyerAnnuel - chargesAnnuelles) / investTotal) * 100;

    setResultats({
      investTotal, montantCredit, mensualite, creditAnnuel, interetsAnnuels,
      chargesAnnuelles, loyerAnnuel, amortBien, amortMobilier, amortTotal,
      chargesDeductibles, baseImposableReel, impotReel, cashflowReelMensuel,
      baseBIC, impotBIC, cashflowBICMensuel, rendementBrut, rendementNet,
    });
  }, [form, loyerSlider]);

  // Sync slider when loyer field changes
  useEffect(() => {
    const l = parseFloat(form.loyer) || 0;
    if (l > 0 && loyerSlider === 0) setLoyerSlider(l);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.loyer]);

  const verdict = resultats
    ? resultats.rendementNet > 5 && resultats.cashflowReelMensuel > 0
      ? { label: "Excellent investissement", color: "bg-green-500 text-white", icon: "✓" }
      : resultats.rendementNet > 3
      ? { label: "Investissement correct", color: "bg-amber-400 text-white", icon: "~" }
      : { label: "Rentabilité faible", color: "bg-red-500 text-white", icon: "✗" }
    : null;

  const loyerPourRendement = (pct: number) =>
    resultats ? Math.round((pct / 100 * resultats.investTotal) / 12) : 0;

  const anneesZeroImpot = resultats
    ? resultats.baseImposableReel === 0
      ? "Toute la durée du crédit"
      : resultats.amortTotal > resultats.chargesDeductibles
      ? Math.ceil((resultats.amortTotal - (resultats.loyerAnnuel - resultats.chargesDeductibles)) / resultats.amortTotal).toString() + " ans env."
      : "Calcul selon votre situation"
    : "-";

  const loyerEffectif = loyerSlider > 0 ? loyerSlider : parseFloat(form.loyer) || 0;

  return (
    <section id="simulateur" className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#1D9E75]/10 text-[#1D9E75] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Simulateur gratuit
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1B2B4B] mb-4">
            Calculez votre rentabilité LMNP
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Renseignez les informations de votre bien et obtenez une analyse complète en temps réel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="font-semibold text-[#1B2B4B] text-lg">Votre bien</h3>

              {/* Type toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Type de bien</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {(["ap", "ma"] as TypeBien[]).map(t => (
                    <button
                      key={t}
                      onClick={() => updateField("type", t)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.type === t ? "bg-[#1B2B4B] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      {t === "ap" ? "🏢 Appartement" : "🏠 Maison"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Surface (m²)</label>
                <input
                  type="number"
                  value={form.surface}
                  onChange={e => updateField("surface", e.target.value)}
                  placeholder="Ex: 45"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Ville</label>
                <select
                  value={form.ville}
                  onChange={e => updateField("ville", e.target.value as VilleKey)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
                >
                  {(Object.entries(villes) as [VilleKey, typeof villes[VilleKey]][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Prix d&apos;achat (€)</label>
                <input
                  type="number"
                  value={form.prix}
                  onChange={e => updateField("prix", e.target.value)}
                  placeholder="Ex: 250000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              {/* Travaux */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Travaux (€)</label>
                <input
                  type="number"
                  value={form.travaux}
                  onChange={e => updateField("travaux", e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              {/* Auto fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Frais de notaire (auto)</label>
                  <input
                    type="number"
                    value={form.notaire}
                    onChange={e => updateField("notaire", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-amber-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Taxe foncière (auto)</label>
                  <input
                    type="number"
                    value={form.taxeFonciere}
                    onChange={e => updateField("taxeFonciere", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-amber-50"
                  />
                </div>
                {form.type === "ap" && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Charges copropriété/an (auto)</label>
                    <input
                      type="number"
                      value={form.chargesCopro}
                      onChange={e => updateField("chargesCopro", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-amber-50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Financement */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="font-semibold text-[#1B2B4B] text-lg">Financement</h3>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Apport personnel (€)</label>
                <input
                  type="number"
                  value={form.apport}
                  onChange={e => updateField("apport", e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Durée du crédit</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {([15, 20, 25] as DureeCredit[]).map(d => (
                    <button
                      key={d}
                      onClick={() => updateField("duree", d)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.duree === d ? "bg-[#1B2B4B] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      {d} ans
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Taux d&apos;intérêt annuel (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.taux}
                  onChange={e => updateField("taux", e.target.value)}
                  placeholder="3.5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Loyer mensuel cible (€)
                  {showFourchette && (
                    <span className="ml-2 text-xs text-gray-400">Fourchette :</span>
                  )}
                </label>
                {showFourchette && (
                  <div className="flex gap-2 mb-3">
                    {[{ label: "Bas", val: loyerBas }, { label: "Moyen", val: loyerMoyen }, { label: "Haut", val: loyerHaut }].map(({ label, val }) => (
                      <button
                        key={label}
                        onClick={() => { updateField("loyer", Math.round(val).toString()); setLoyerSlider(Math.round(val)); }}
                        className="flex-1 rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/5 hover:bg-[#1D9E75]/10 py-2 text-center transition-colors"
                      >
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="text-sm font-semibold text-[#1D9E75]">{formatEuro(Math.round(val))}</div>
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="number"
                  value={form.loyer}
                  onChange={e => { updateField("loyer", e.target.value); setLoyerSlider(parseFloat(e.target.value) || 0); }}
                  placeholder="Ex: 1200"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tranche marginale d&apos;imposition</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {([0, 11, 30, 41, 45] as TMI[]).map(t => (
                    <button
                      key={t}
                      onClick={() => updateField("tmi", t)}
                      className={`flex-1 py-2.5 text-xs font-medium transition-colors ${form.tmi === t ? "bg-[#1B2B4B] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-5">
            {!resultats ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">🏠</div>
                <p className="text-gray-500 text-lg font-medium mb-2">Renseignez votre bien pour voir les résultats</p>
                <p className="text-gray-400 text-sm">Prix d&apos;achat + loyer mensuel requis</p>
              </div>
            ) : (
              <>
                {/* Verdict */}
                {verdict && (
                  <div className={`rounded-2xl p-4 flex items-center gap-3 ${verdict.color}`}>
                    <span className="text-2xl font-bold">{verdict.icon}</span>
                    <div>
                      <div className="font-bold text-lg">{verdict.label}</div>
                      <div className="text-sm opacity-90">
                        Rendement net {formatPct(resultats.rendementNet)} · Cash-flow {formatEuro(resultats.cashflowReelMensuel)}/mois
                      </div>
                    </div>
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Rendement brut", val: formatPct(resultats.rendementBrut), sub: "loyers / investissement total", icon: "📈" },
                    { label: "Rendement net", val: formatPct(resultats.rendementNet), sub: "après charges, avant impôt", icon: "💰" },
                    { label: "Impôt annuel (réel)", val: formatEuro(resultats.impotReel), sub: `TMI ${form.tmi}% + PS 17,2%`, icon: "🧾" },
                    { label: "Cash-flow mensuel", val: formatEuro(resultats.cashflowReelMensuel), sub: "net après tout (réel)", icon: resultats.cashflowReelMensuel >= 0 ? "✅" : "⚠️" },
                  ].map(({ label, val, sub, icon }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</div>
                      <div className={`text-2xl font-bold mb-1 ${label === "Cash-flow mensuel" ? (resultats.cashflowReelMensuel >= 0 ? "text-[#1D9E75]" : "text-red-500") : "text-[#1B2B4B]"}`}>{val}</div>
                      <div className="text-xs text-gray-400">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Loyer slider */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-[#1B2B4B]">Ajuster le loyer en temps réel</span>
                    <span className="text-lg font-bold text-[#1D9E75]">{formatEuro(loyerEffectif)}/mois</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(100, Math.round(loyerBas * 0.7))}
                    max={Math.round(loyerHaut * 1.5)}
                    step={25}
                    value={loyerSlider || parseFloat(form.loyer) || loyerMoyen}
                    onChange={e => setLoyerSlider(parseFloat(e.target.value))}
                    className="w-full accent-[#1D9E75]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Bas marché</span>
                    <span>Haut marché</span>
                  </div>
                </div>

                {/* Comparaison Réel vs Micro-BIC */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-[#1B2B4B] mb-4">Comparaison des régimes fiscaux</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        regime: "Régime réel simplifié",
                        badge: "Recommandé LMNP",
                        badgeColor: "bg-[#1D9E75]/10 text-[#1D9E75]",
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
                        badgeColor: "bg-gray-100 text-gray-500",
                        loyers: resultats.loyerAnnuel,
                        charges: null,
                        amort: null,
                        base: resultats.baseBIC,
                        impot: resultats.impotBIC,
                        cf: resultats.cashflowBICMensuel,
                        highlight: false,
                      },
                    ].map(r => (
                      <div key={r.regime} className={`rounded-xl p-4 border ${r.highlight ? "border-[#1D9E75]/30 bg-[#1D9E75]/5" : "border-gray-100"}`}>
                        <div className="mb-3">
                          <div className="text-sm font-semibold text-[#1B2B4B] mb-1">{r.regime}</div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.badgeColor}`}>{r.badge}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-gray-500">Loyers</span><span className="font-medium">{formatEuro(r.loyers)}</span></div>
                          {r.charges !== null && <div className="flex justify-between"><span className="text-gray-500">Charges déductibles</span><span className="font-medium text-red-400">-{formatEuro(r.charges)}</span></div>}
                          {r.amort !== null && <div className="flex justify-between"><span className="text-gray-500">Amortissements</span><span className="font-medium text-red-400">-{formatEuro(r.amort)}</span></div>}
                          <div className="flex justify-between border-t pt-2"><span className="text-gray-500">Base imposable</span><span className="font-semibold">{formatEuro(r.base)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Impôt estimé</span><span className="font-medium text-red-400">{formatEuro(r.impot)}</span></div>
                          <div className={`flex justify-between border-t pt-2 ${r.cf >= 0 ? "text-[#1D9E75]" : "text-red-500"}`}>
                            <span className="font-semibold">Cash-flow/mois</span>
                            <span className="font-bold text-sm">{formatEuro(r.cf)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">* Micro-BIC 2025 : abattement ramené à 30% (vs 50% avant). Le régime réel est presque toujours plus avantageux.</p>
                </div>

                {/* Amortissement expandable */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setShowAmort(!showAmort)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-[#1B2B4B]">Détail de l&apos;amortissement LMNP</span>
                    <span className="text-gray-400 text-xl">{showAmort ? "▲" : "▼"}</span>
                  </button>
                  {showAmort && (
                    <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">Amort. bâti</div>
                          <div className="font-bold text-[#1B2B4B]">{formatEuro(resultats.amortBien)}/an</div>
                          <div className="text-xs text-gray-400">85% prix · 30 ans</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">Amort. mobilier</div>
                          <div className="font-bold text-[#1B2B4B]">{formatEuro(resultats.amortMobilier)}/an</div>
                          <div className="text-xs text-gray-400">15% prix · 7 ans</div>
                        </div>
                        <div className="bg-[#1D9E75]/10 rounded-xl p-3 text-center">
                          <div className="text-xs text-[#1D9E75] mb-1">Total amort.</div>
                          <div className="font-bold text-[#1D9E75]">{formatEuro(resultats.amortTotal)}/an</div>
                          <div className="text-xs text-[#1D9E75]/70">Déductible</div>
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3">
                        <div className="text-xs font-semibold text-amber-800 mb-1">⏳ Durée estimée sans impôt</div>
                        <div className="text-amber-700 text-sm">{anneesZeroImpot}</div>
                        <div className="text-xs text-amber-600 mt-1">Tant que les amortissements + charges couvrent vos loyers</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loyer cible */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-[#1B2B4B] mb-4">Loyer cible par rendement brut</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {[4, 5, 6, 7, 8].map(p => (
                      <button
                        key={p}
                        onClick={() => setRendementTab(p)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${rendementTab === p ? "bg-[#1B2B4B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                  <div className="bg-[#1B2B4B] rounded-xl p-4 text-center">
                    <div className="text-white/60 text-sm mb-1">Loyer mensuel nécessaire pour {rendementTab}% brut</div>
                    <div className="text-3xl font-bold text-white">{formatEuro(loyerPourRendement(rendementTab))}<span className="text-lg font-normal text-white/70">/mois</span></div>
                    <div className="text-white/50 text-xs mt-1">sur {formatEuro(resultats.investTotal)} investis</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

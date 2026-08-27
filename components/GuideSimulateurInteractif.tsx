"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

/* ── Palette ───────────────────────────────────────────────────── */
const C = {
  fond: "#F5F0E8",
  brun: "#4E1F12",
  texte: "#1A1612",
  orange: "#C95B2A",
  fondSec: "#EDE7DC",
  vert: "#1A7A52",
  rouge: "#B03A2A",
  bleu: "#2A7080",
};

/* ── Petits utilitaires ─────────────────────────────────────────── */
function Badge({ children, variant = "orange" }: { children?: ReactNode; variant?: "orange" | "vert" | "brun" }) {
  const bg = variant === "vert" ? C.vert : variant === "brun" ? C.brun : C.orange;
  return (
    <span style={{ background: bg, color: "#F5F0E8", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function DemoWrapper({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div style={{ border: `1px solid rgba(201,91,42,0.25)`, borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
      <div style={{ background: C.brun, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <Badge>Aperçu interactif</Badge>
        <span style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.75rem" }}>{title}</span>
      </div>
      <div style={{ background: C.fond, padding: "20px 20px" }}>
        {children}
      </div>
    </div>
  );
}

function DemoStaticWrapper({ children }: { children?: ReactNode }) {
  return (
    <div style={{ border: `1px solid rgba(201,91,42,0.25)`, borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
      <div style={{ background: C.brun, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <Badge>Aperçu du simulateur</Badge>
        <Badge variant="brun">Données d'exemple</Badge>
      </div>
      <div style={{ background: C.fond, padding: "20px 20px" }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 1 — Bien & Financement
══════════════════════════════════════════════════════════════════ */
const fieldExplications: Record<string, { label: string; explication: string }> = {
  prix: { label: "Prix d'achat", explication: "Le prix net vendeur hors frais de notaire. C'est la base de calcul du crédit et des rendements." },
  notaire: { label: "Frais de notaire", explication: "Environ 7-8% dans l'ancien (ici 15 000 €). Ils entrent dans l'investissement total mais ne sont pas financés par le crédit si l'apport est nul." },
  apport: { label: "Apport personnel", explication: "Ce que vous injectez de votre poche. Réduire l'apport maximise l'effet de levier mais augmente la mensualité." },
  duree: { label: "Durée du crédit", explication: "20 ans est la durée la plus courante. Plus la durée est longue, plus la mensualité est basse mais le coût total des intérêts augmente." },
  taux: { label: "Taux d'intérêt", explication: "Taux annuel hors assurance emprunteur. En 2026, les taux oscillent entre 3 % et 4 % selon les profils et les durées." },
  assurance: { label: "Assurance emprunteur", explication: "Exprimée en % du capital emprunté par an. Typiquement 0,15 à 0,40 %. Elle s'ajoute à la mensualité du crédit." },
};

export function Section1Demo() {
  const [activeField, setActiveField] = useState<string | null>(null);
  const fields = [
    { key: "prix", value: "200 000 €" },
    { key: "notaire", value: "15 000 €" },
    { key: "apport", value: "0 €" },
    { key: "duree", value: "20 ans" },
    { key: "taux", value: "3,5 %" },
    { key: "assurance", value: "0,25 %" },
  ];
  return (
    <DemoWrapper title="Bien & Financement">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {fields.map(({ key, value }) => {
          const info = fieldExplications[key];
          const isActive = activeField === key;
          return (
            <button
              key={key}
              onClick={() => setActiveField(isActive ? null : key)}
              aria-pressed={isActive}
              style={{
                background: isActive ? `rgba(201,91,42,0.1)` : C.fondSec,
                border: isActive ? `1.5px solid ${C.orange}` : `1px solid rgba(26,22,18,0.1)`,
                borderRadius: 8,
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 150ms",
                outline: "none",
              }}
              onFocus={e => (e.currentTarget.style.outline = `2px solid ${C.orange}`)}
              onBlur={e => (e.currentTarget.style.outline = "none")}
            >
              <div style={{ fontSize: "0.7rem", color: "rgba(26,22,18,0.5)", marginBottom: 2 }}>{info.label}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: C.texte }}>{value}</div>
            </button>
          );
        })}
      </div>
      {activeField && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: `rgba(201,91,42,0.07)`, borderRadius: 8, border: `1px solid rgba(201,91,42,0.2)`, fontSize: "0.85rem", color: "rgba(26,22,18,0.75)", lineHeight: 1.65, transition: "all 200ms" }}>
          <strong style={{ color: C.orange }}>{fieldExplications[activeField].label} — </strong>
          {fieldExplications[activeField].explication}
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 2 — Revenus & Charges
══════════════════════════════════════════════════════════════════ */
export function Section2Demo() {
  const [saisonnier, setSaisonnier] = useState(false);
  return (
    <DemoWrapper title="Revenus & Charges">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: "0.85rem", color: "rgba(26,22,18,0.65)" }}>Location longue durée</span>
        <button
          role="switch"
          aria-checked={saisonnier}
          onClick={() => setSaisonnier(s => !s)}
          style={{
            width: 44, height: 24, borderRadius: 12,
            background: saisonnier ? C.orange : "rgba(26,22,18,0.15)",
            border: "none", cursor: "pointer", position: "relative", transition: "background 200ms",
            outline: "none",
          }}
          onFocus={e => (e.currentTarget.style.outline = `2px solid ${C.orange}`)}
          onBlur={e => (e.currentTarget.style.outline = "none")}
        >
          <span style={{
            position: "absolute", top: 3, left: saisonnier ? 22 : 3,
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            transition: "left 200ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }} />
        </button>
        <span style={{ fontSize: "0.85rem", color: "rgba(26,22,18,0.65)" }}>Location saisonnière</span>
      </div>

      {!saisonnier ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Loyer HC / mois", value: "900 €" },
            { label: "Charges locataire", value: "80 €" },
            { label: "Taxe foncière", value: "800 €/an" },
            { label: "Charges de copro", value: "700 €/an" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: C.fondSec, borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(26,22,18,0.08)" }}>
              <div style={{ fontSize: "0.7rem", color: "rgba(26,22,18,0.5)", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: C.texte }}>{value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: C.fondSec, borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(26,22,18,0.08)" }}>
              <div style={{ fontSize: "0.7rem", color: "rgba(26,22,18,0.5)", marginBottom: 2 }}>Prix par nuitée</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: C.texte }}>75 €</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[
              { label: "Taux occ. bas", value: "40 %", color: C.rouge },
              { label: "Taux occ. moyen", value: "60 %", color: C.orange },
              { label: "Taux occ. haut", value: "80 %", color: C.vert },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: C.fondSec, borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(26,22,18,0.08)", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "rgba(26,22,18,0.5)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 3 — KPI statiques
══════════════════════════════════════════════════════════════════ */
const kpis = [
  { label: "Rendement brut", value: "4,8 %", color: C.vert, sub: "sur le prix d'achat" },
  { label: "Revenus locatifs", value: "10 800 €/an", color: C.texte, sub: "loyer × 12" },
  { label: "Emprunt (annuel)", value: "14 896 €/an", color: C.rouge, sub: "mensualité × 12" },
  { label: "Charges", value: "1 500 €/an", color: C.texte, sub: "hors emprunt" },
  { label: "Impôt (Réel)", value: "0 €", color: C.vert, sub: "amortissement neutralise" },
  { label: "Cash-flow", value: "−517 €/mois", color: C.rouge, sub: "effort d'épargne" },
];

export function Section3Demo() {
  return (
    <DemoStaticWrapper>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {kpis.map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: C.fondSec, borderRadius: 8, padding: "12px 14px", border: "1px solid rgba(26,22,18,0.08)" }}>
            <div style={{ fontSize: "0.68rem", color: "rgba(26,22,18,0.5)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(26,22,18,0.4)", marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>
    </DemoStaticWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 4 — Slider loyer
══════════════════════════════════════════════════════════════════ */
const sliderValues = [
  { loyer: 850, cf: -567, rend: 5.1 },
  { loyer: 900, cf: -517, rend: 5.4 },
  { loyer: 1000, cf: -417, rend: 6.0 },
  { loyer: 1100, cf: -317, rend: 6.6 },
];

export function Section4Demo() {
  const [idx, setIdx] = useState(1);
  const v = sliderValues[idx];
  return (
    <DemoWrapper title="Testez un autre loyer">
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(26,22,18,0.5)" }}>Loyer HC / mois</span>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: C.texte }}>{v.loyer} €</span>
        </div>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={idx}
          onChange={e => setIdx(Number(e.target.value))}
          style={{ width: "100%", accentColor: C.orange }}
          aria-label="Sélectionner un niveau de loyer"
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "rgba(26,22,18,0.4)", marginTop: 4 }}>
          {sliderValues.map(s => <span key={s.loyer}>{s.loyer} €</span>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={{ background: C.fondSec, borderRadius: 8, padding: "12px", border: "1px solid rgba(26,22,18,0.08)" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(26,22,18,0.5)", marginBottom: 3 }}>Revenus annuels</div>
          <div style={{ fontWeight: 700, color: C.texte }}>{(v.loyer * 12).toLocaleString("fr-FR")} €</div>
        </div>
        <div style={{ background: C.fondSec, borderRadius: 8, padding: "12px", border: "1px solid rgba(26,22,18,0.08)" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(26,22,18,0.5)", marginBottom: 3 }}>Rendement brut</div>
          <div style={{ fontWeight: 700, color: C.vert }}>{v.rend.toFixed(1)} %</div>
        </div>
        <div style={{ background: C.fondSec, borderRadius: 8, padding: "12px", border: "1px solid rgba(26,22,18,0.08)" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(26,22,18,0.5)", marginBottom: 3 }}>Cash-flow</div>
          <div style={{ fontWeight: 700, color: v.cf < 0 ? C.rouge : C.vert }}>{v.cf > 0 ? "+" : ""}{v.cf} €/mois</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: "0.72rem", color: "rgba(26,22,18,0.4)", textAlign: "center" }}>
        Exemple illustratif — utilisez le simulateur pour vos propres chiffres
      </div>
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 5 — Régimes fiscaux
══════════════════════════════════════════════════════════════════ */
export function Section5Demo() {
  const [selected, setSelected] = useState<"reel" | "bic">("reel");
  return (
    <DemoWrapper title="Comparaison des régimes fiscaux">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Réel */}
        <button
          onClick={() => setSelected("reel")}
          aria-pressed={selected === "reel"}
          style={{
            textAlign: "left", cursor: "pointer",
            background: selected === "reel" ? "rgba(201,91,42,0.07)" : C.fondSec,
            border: selected === "reel" ? `2px solid ${C.orange}` : "1px solid rgba(26,22,18,0.1)",
            borderRadius: 10, padding: "14px 16px", transition: "all 150ms", outline: "none",
          }}
          onFocus={e => (e.currentTarget.style.outline = `2px solid ${C.orange}`)}
          onBlur={e => (e.currentTarget.style.outline = "none")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.texte }}>Régime Réel</span>
            <Badge variant="vert">Recommandé</Badge>
          </div>
          {[
            { l: "Base imposable", v: "0 €", c: C.vert },
            { l: "Impôt", v: "0 €", c: C.vert },
            { l: "Cash-flow", v: "−517 €/mois", c: C.rouge },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
              <span style={{ color: "rgba(26,22,18,0.6)" }}>{l}</span>
              <span style={{ fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
        </button>

        {/* Micro-BIC */}
        <button
          onClick={() => setSelected("bic")}
          aria-pressed={selected === "bic"}
          style={{
            textAlign: "left", cursor: "pointer",
            background: selected === "bic" ? "rgba(201,91,42,0.07)" : C.fondSec,
            border: selected === "bic" ? `2px solid ${C.orange}` : "1px solid rgba(26,22,18,0.1)",
            borderRadius: 10, padding: "14px 16px", transition: "all 150ms", outline: "none",
          }}
          onFocus={e => (e.currentTarget.style.outline = `2px solid ${C.orange}`)}
          onBlur={e => (e.currentTarget.style.outline = "none")}
        >
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.texte, marginBottom: 10 }}>Micro-BIC</div>
          {[
            { l: "Base imposable", v: "5 400 €", c: C.rouge },
            { l: "Impôt (TMI 30 %)", v: "2 624 €/an", c: C.rouge },
            { l: "Cash-flow", v: "−735 €/mois", c: C.rouge },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
              <span style={{ color: "rgba(26,22,18,0.6)" }}>{l}</span>
              <span style={{ fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
        </button>
      </div>
      <div style={{ marginTop: 12, padding: "10px 14px", background: `rgba(26,118,82,0.08)`, borderRadius: 8, border: `1px solid rgba(26,118,82,0.2)`, fontSize: "0.82rem", color: C.vert, fontWeight: 600 }}>
        Régime le plus adapté : {selected === "reel" ? "Régime Réel Simplifié" : "Régime Réel (non sélectionné)"}
      </div>
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 6 — Amortissement
══════════════════════════════════════════════════════════════════ */
export function Section6Demo() {
  const [mode, setMode] = useState<"composant" | "global">("composant");
  return (
    <DemoWrapper title="Méthode d'amortissement">
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {(["composant", "global"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: "0.85rem",
              background: mode === m ? C.orange : C.fondSec,
              color: mode === m ? "#F5F0E8" : C.texte,
              border: mode === m ? `1.5px solid ${C.orange}` : "1px solid rgba(26,22,18,0.1)",
              transition: "all 150ms", outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.outline = `2px solid ${C.orange}`)}
            onBlur={e => (e.currentTarget.style.outline = "none")}
          >
            {m === "composant" ? "Par Composant" : "Global Simplifié"}
          </button>
        ))}
      </div>

      {mode === "composant" ? (
        <div style={{ display: "grid", gap: 6 }}>
          {[
            { label: "Bâti (gros œuvre)", pct: "45 %", duree: "40 ans", amt: "2 025 €/an" },
            { label: "Toiture", pct: "15 %", duree: "25 ans", amt: "1 020 €/an" },
            { label: "Aménagements int.", pct: "20 %", duree: "15 ans", amt: "2 267 €/an" },
            { label: "Installation électrique", pct: "10 %", duree: "20 ans", amt: "850 €/an" },
            { label: "Étanchéité", pct: "10 %", duree: "20 ans", amt: "850 €/an" },
          ].map(({ label, pct, duree, amt }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.fondSec, borderRadius: 6, padding: "8px 12px", fontSize: "0.8rem", border: "1px solid rgba(26,22,18,0.07)" }}>
              <span style={{ color: "rgba(26,22,18,0.7)", flex: 2 }}>{label}</span>
              <span style={{ color: C.bleu, fontWeight: 600, flex: 1, textAlign: "center" }}>{pct} / {duree}</span>
              <span style={{ color: C.orange, fontWeight: 700, flex: 1, textAlign: "right" }}>{amt}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {[
            { label: "Valeur amortissable", value: "170 000 €" },
            { label: "Durée", value: "25 ans" },
            { label: "Amortissement annuel", value: "6 800 €/an" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", background: C.fondSec, borderRadius: 6, padding: "8px 12px", fontSize: "0.85rem", border: "1px solid rgba(26,22,18,0.07)" }}>
              <span style={{ color: "rgba(26,22,18,0.7)" }}>{label}</span>
              <span style={{ fontWeight: 700, color: C.orange }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toujours affiché */}
      <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
        <div style={{ opacity: 0.55, fontSize: "0.72rem", color: "rgba(26,22,18,0.6)", marginBottom: 2 }}>Également pris en compte :</div>
        {[
          { label: "Mobilier", value: "0 €/an" },
          { label: "Travaux", value: "0 €/an" },
          { label: "Frais de notaire", value: "450 €/an" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", background: "rgba(26,22,18,0.04)", borderRadius: 6, padding: "7px 12px", fontSize: "0.8rem", border: "1px solid rgba(26,22,18,0.05)" }}>
            <span style={{ color: "rgba(26,22,18,0.5)" }}>{label}</span>
            <span style={{ color: "rgba(26,22,18,0.5)" }}>{value}</span>
          </div>
        ))}
      </div>
    </DemoWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 7 — Récapitulatif statique
══════════════════════════════════════════════════════════════════ */
export function Section7Demo() {
  return (
    <DemoStaticWrapper>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { titre: "Le bien", lignes: ["Prix d'achat : 200 000 €", "Notaire : 15 000 €", "Travaux : 0 €", "Mobilier : 0 €"] },
          { titre: "Financement", lignes: ["Apport : 0 €", "Crédit : 215 000 €", "Durée : 20 ans", "Mensualité : 1 241 €/mois"] },
          { titre: "Charges annuelles", lignes: ["Taxe foncière : 800 €", "Copro : 700 €", "Assurance : 0 €", "Gestion : 0 €"] },
        ].map(({ titre, lignes }) => (
          <div key={titre} style={{ background: C.fondSec, borderRadius: 8, padding: "12px 14px", border: "1px solid rgba(26,22,18,0.08)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", color: C.brun, marginBottom: 8 }}>{titre}</div>
            {lignes.map(l => <div key={l} style={{ fontSize: "0.78rem", color: "rgba(26,22,18,0.65)", marginBottom: 3 }}>{l}</div>)}
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", background: "rgba(26,118,82,0.08)", borderRadius: 8, border: `1px solid rgba(26,118,82,0.2)`, marginBottom: 14, fontSize: "0.85rem", color: C.vert, fontWeight: 700 }}>
        ✓ Régime Réel Simplifié — Cash-flow −517 €/mois — Impôt 0 €
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
        {kpis.map(({ label, value, color }) => (
          <div key={label} style={{ background: C.fondSec, borderRadius: 6, padding: "10px 12px", border: "1px solid rgba(26,22,18,0.07)" }}>
            <div style={{ fontSize: "0.65rem", color: "rgba(26,22,18,0.45)", marginBottom: 3 }}>{label}</div>
            <div style={{ fontWeight: 700, color, fontSize: "0.9rem" }}>{value}</div>
          </div>
        ))}
      </div>
    </DemoStaticWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 8 — Graphique SVG
══════════════════════════════════════════════════════════════════ */
export function Section8Demo() {
  // Cash-flow mensuel : commence à -517, remonte progressivement sur 25 ans
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= 25; i++) {
    const cf = -517 + i * 28; // monte d'env. 700 € sur 25 ans
    points.push({ x: i, y: cf });
  }
  const W = 500, H = 200, PAD = 40;
  const minY = -600, maxY = 250;
  const toSvgX = (i: number) => PAD + (i / 25) * (W - PAD * 2);
  const toSvgY = (cf: number) => PAD + (1 - (cf - minY) / (maxY - minY)) * (H - PAD * 2);
  const zeroY = toSvgY(0);
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`).join(" ");

  return (
    <DemoStaticWrapper>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }} role="img" aria-label="Graphique d'évolution du cash-flow sur 25 ans">
          {/* Zéro line */}
          <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="rgba(26,22,18,0.15)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={PAD - 4} y={zeroY + 4} textAnchor="end" fontSize={9} fill="rgba(26,22,18,0.4)">0 €</text>
          {/* Axes labels */}
          <text x={PAD} y={H - 6} fontSize={9} fill="rgba(26,22,18,0.35)">An 1</text>
          <text x={W - PAD} y={H - 6} fontSize={9} textAnchor="end" fill="rgba(26,22,18,0.35)">An 25</text>
          {/* Area fill */}
          <path d={`${pathD} L ${toSvgX(25)} ${H - PAD} L ${toSvgX(0)} ${H - PAD} Z`} fill={`rgba(201,91,42,0.07)`} />
          {/* Line */}
          <path d={pathD} fill="none" stroke={C.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* Labels */}
          <text x={toSvgX(0) + 4} y={toSvgY(-517) - 6} fontSize={9} fill={C.rouge}>−517 €/mois</text>
          <text x={toSvgX(25) - 4} y={toSvgY(183) - 6} fontSize={9} textAnchor="end" fill={C.vert}>+183 €/mois</text>
        </svg>
      </div>
      <div style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(26,22,18,0.4)", marginTop: 8 }}>
        Projection sans évolution de loyer ni de charges dans le temps
      </div>
    </DemoStaticWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 9 — Scénarios
══════════════════════════════════════════════════════════════════ */
export function Section9Demo() {
  return (
    <DemoStaticWrapper>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {[
          { label: "Prudent", loyer: "820 €/mois", taux: "4,0 %", cf: "−617 €/mois", color: C.rouge },
          { label: "Central", loyer: "900 €/mois", taux: "3,5 %", cf: "−517 €/mois", color: C.orange, active: true },
          { label: "Favorable", loyer: "1 050 €/mois", taux: "3,0 %", cf: "−267 €/mois", color: C.vert },
        ].map(({ label, loyer, taux, cf, color, active }) => (
          <div key={label} style={{ background: active ? `rgba(201,91,42,0.07)` : C.fondSec, border: active ? `1.5px solid ${C.orange}` : "1px solid rgba(26,22,18,0.1)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(26,22,18,0.6)", marginBottom: 3 }}>Loyer : {loyer}</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(26,22,18,0.6)", marginBottom: 3 }}>Taux : {taux}</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color, marginTop: 6 }}>{cf}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: "0.8rem", color: "rgba(26,22,18,0.55)", textAlign: "center" }}>
        Changez une variable à la fois pour tester vos hypothèses
      </div>
    </DemoStaticWrapper>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FAQ — accordéons
══════════════════════════════════════════════════════════════════ */
const faqItems = [
  {
    q: "Quelle différence entre rendement et cash-flow ?",
    a: "Le rendement (brut ou net) est un pourcentage annuel qui mesure le retour sur investissement par rapport au prix d'achat. Le cash-flow est la différence mensuelle entre ce que vous encaissez (loyer) et ce que vous déboursez (mensualité + charges). Un bon rendement peut très bien aller avec un cash-flow négatif si vous avez financé sans apport.",
  },
  {
    q: "Le remboursement du capital est-il une charge LMNP ?",
    a: "Non. Seuls les intérêts d'emprunt sont déductibles, pas le remboursement du capital. C'est pourquoi votre cash-flow peut être négatif alors que votre base imposable est nulle : vous remboursez du capital chaque mois (ce qui enrichit votre patrimoine) sans pouvoir le déduire fiscalement.",
  },
  {
    q: "Quel type d'amortissement choisir ?",
    a: "La méthode par composant est plus précise et généralement plus avantageuse : elle ventile le bien entre ses différents éléments (gros œuvre, toiture, aménagements…), chacun amorti sur sa propre durée. La méthode globale simplifie la comptabilité mais peut être moins optimale. Dans tous les cas, demandez l'avis d'un comptable spécialisé LMNP.",
  },
  {
    q: "Puis-je modifier une simulation après les résultats ?",
    a: "Oui. Le simulateur ToutLMNP vous permet de revenir en arrière à tout moment pour modifier n'importe quel paramètre : loyer, prix d'achat, taux, charges, régime fiscal… Les résultats se recalculent instantanément.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {faqItems.map((item, i) => (
        <div key={i} style={{ background: C.fondSec, borderRadius: 10, border: "1px solid rgba(26,22,18,0.09)", overflow: "hidden" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            style={{
              width: "100%", textAlign: "left", padding: "14px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "none", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.9rem", color: C.texte,
              outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.outline = `2px solid ${C.orange}`)}
            onBlur={e => (e.currentTarget.style.outline = "none")}
          >
            <span>{item.q}</span>
            <span style={{ fontSize: "1.1rem", color: C.orange, flexShrink: 0, marginLeft: 12 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div style={{ padding: "0 18px 16px", fontSize: "0.875rem", color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HERO CTA line
══════════════════════════════════════════════════════════════════ */
export function HeroSteps() {
  const steps = ["1. Renseignez le projet", "2. Comparez", "3. Choisissez", "4. Analysez"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 20 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.82rem", color: "rgba(26,22,18,0.6)", background: C.fondSec, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(26,22,18,0.1)" }}>{s}</span>
          {i < steps.length - 1 && <span style={{ color: "rgba(26,22,18,0.3)", fontSize: "0.8rem" }}>→</span>}
        </div>
      ))}
    </div>
  );
}

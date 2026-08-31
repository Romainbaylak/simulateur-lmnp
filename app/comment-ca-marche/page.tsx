import type { CSSProperties, ReactNode } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";
import {
  SectionBienFinancement,
  SectionLoyer,
  SectionAutresCharges,
  SectionSaisonnier,
  SectionRegimes,
  SectionImpot,
  SectionChoisir,
  SectionAmortissement,
  SectionRecap,
  SectionCashflow,
  SectionRapports,
  FAQ,
} from "@/components/GuideSimulateurInteractif";

export const metadata: Metadata = {
  title: "Guide du simulateur LMNP : rentabilité, cash-flow, amortissement | ToutLMNP",
  description:
    "Maîtrise chaque paramètre du simulateur LMNP ToutLMNP : charges déductibles, régime réel vs micro-BIC, calcul de l'impôt, amortissement par composant et lecture du cash-flow.",
  alternates: { canonical: "/comment-ca-marche" },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment utiliser le simulateur LMNP ToutLMNP",
  description: "Guide complet pour simuler la rentabilité, le cash-flow et la fiscalité d'un investissement LMNP.",
  step: [
    { "@type": "HowToStep", name: "Renseigne le bien et son financement", text: "Saisis le prix d'achat, les frais de notaire, le mobilier, l'apport, la durée, le taux et l'assurance emprunteur." },
    { "@type": "HowToStep", name: "Indique le loyer", text: "Entre le loyer hors charges mensuel et les charges récupérables sur le locataire." },
    { "@type": "HowToStep", name: "Ajoute les autres charges déductibles", text: "Taxe foncière, copropriété, assurance PNO, gestion locative, entretien et comptabilité." },
    { "@type": "HowToStep", name: "Active l'option saisonnière si besoin", text: "Pour une location saisonnière, renseigne le prix par nuitée et les trois taux d'occupation." },
    { "@type": "HowToStep", name: "Choisis ton régime fiscal", text: "Compare le régime réel simplifié et le Micro-BIC pour voir lequel minimise ton impôt." },
    { "@type": "HowToStep", name: "Configure l'amortissement", text: "Choisis entre la méthode par composant (précise) et la méthode globale simplifiée." },
    { "@type": "HowToStep", name: "Lis le récapitulatif et les rapports", text: "Consulte ton résumé complet : rendement, cash-flow, impôt et amortissement, puis télécharge ton rapport PDF." },
  ],
};

/* ── Sommaire ───────────────────────────────────────────── */
const SOMMAIRE = [
  { id: "bien-financement", titre: "Le bien et son financement" },
  { id: "loyer", titre: "Le loyer" },
  { id: "autres-charges", titre: "Les autres charges déductibles" },
  { id: "saisonnier", titre: "L'option Location Saisonnière" },
  { id: "regimes", titre: "Les deux régimes fiscaux LMNP" },
  { id: "impot", titre: "Comment ton impôt est calculé" },
  { id: "choisir", titre: "Quel régime choisir ?" },
  { id: "ajuster", titre: "Ajuster et affiner ta simulation" },
  { id: "amortissement", titre: "L'amortissement — la ligne qui change tout" },
  { id: "composant-global", titre: "Composant ou global : lequel choisir ?" },
  { id: "recapitulatif", titre: "Le récapitulatif que le simulateur te donne" },
  { id: "cash-flow", titre: "Le cash-flow : ton vrai baromètre" },
  { id: "rapports", titre: "Les 3 rapports disponibles" },
];

/* ── Styles ─────────────────────────────────────────────── */
const wrap: CSSProperties = { maxWidth: 860, margin: "0 auto", padding: "0 16px" };
const prose: CSSProperties = { color: "rgba(26,22,18,0.72)", lineHeight: 1.85, fontSize: "1rem" };

function SectionHeading({ num, title, sub }: { num: number; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(1.05rem,2.4vw,1.3rem)", fontWeight: 700, color: "#C95B2A", letterSpacing: "-0.01em", margin: "0 0 6px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, flexShrink: 0 }}>{String(num).padStart(2, "0")}</span>
        <span>{title}</span>
      </h2>
      {sub && <p style={{ margin: 0, paddingLeft: 32, fontSize: 14, color: "rgba(26,22,18,0.5)" }}>{sub}</p>}
    </div>
  );
}

/* Variante claire, pour la section cash-flow sur fond brun */
function SectionHeadingClair({ num, title, sub }: { num: number; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(1.05rem,2.4vw,1.3rem)", fontWeight: 700, color: "#C95B2A", letterSpacing: "-0.01em", margin: "0 0 6px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, flexShrink: 0 }}>{String(num).padStart(2, "0")}</span>
        <span>{title}</span>
      </h2>
      {sub && <p style={{ margin: 0, paddingLeft: 32, fontSize: 14, color: "#F5F0E8", fontWeight: 600 }}>{sub}</p>}
    </div>
  );
}

function InfoBox({ children, color = "#C95B2A" }: { children?: ReactNode; color?: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 16, margin: "20px 0", color: "rgba(26,22,18,0.72)", fontSize: 14, lineHeight: 1.75 }}>
      {children}
    </div>
  );
}

function KeyPoint({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
      <span style={{ background: "#C95B2A", color: "#F5F0E8", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{label}</span>
      <span style={{ fontSize: 14, color: "rgba(26,22,18,0.72)", lineHeight: 1.65 }}>{children}</span>
    </div>
  );
}

export default function GuidePage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F5F0E8" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" style={{ color: "#C95B2A" }}>Guide</Link>
            <Link href="/blog" className="hover:text-[#F5F0E8] transition-colors">Articles</Link>
            <Link href="/tarifs" className="hover:text-[#F5F0E8] transition-colors">Abonnements</Link>
            <Link href="/contact" className="hover:text-[#F5F0E8] transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <HeaderAuth dark={true} />
            <Link href="/#simulateur" className="text-sm font-medium px-4 py-2 rounded transition-opacity hover:opacity-[0.88]" style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
              Simuler maintenant
            </Link>
          </div>
        </div>
        <MobileHeader simulerHref="/#simulateur" />
      </header>

      {/* ─── Hero compact ───────────────────────────────────────── */}
      <section style={{ backgroundColor: "#4E1F12", color: "#F5F0E8", paddingTop: 40, paddingBottom: 44 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C95B2A", marginBottom: 14 }}>Guide complet</div>
          <h1 style={{ fontSize: "clamp(1.7rem,4.5vw,2.8rem)", fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.15, margin: 0 }}>
            Maîtrise le simulateur<br />
            <span style={{ color: "#C95B2A" }}>ToutLMNP</span>
          </h1>
        </div>
      </section>

      {/* ─── Bouton CTA ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#F5F0E8", padding: "28px 16px", textAlign: "center", borderBottom: "1px solid rgba(26,22,18,0.06)" }}>
        <Link href="/#simulateur" style={{ display: "inline-block", backgroundColor: "#C95B2A", color: "#F5F0E8", fontWeight: 700, fontSize: 17, padding: "14px 40px", borderRadius: 8, textDecoration: "none", transition: "opacity 150ms" }}>
          Aller à la simulation →
        </Link>
      </div>

      {/* ─── Intro + Sommaire ───────────────────────────────────── */}
      <section style={{ padding: "44px 0 8px" }}>
        <div style={wrap}>

          {/* Intro */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ ...prose, marginTop: 0 }}>
              ToutLMNP est un simulateur gratuit qui répond à une seule question, mais la plus importante :
              <strong> ton projet de location meublée est-il vraiment rentable ?</strong> Tu saisis ton bien, ton
              financement et tes charges, et le simulateur calcule pour toi tes rendements, ton impôt selon les deux
              régimes fiscaux, ton amortissement, et surtout ton cash-flow réel — ce qui restera vraiment sur ton
              compte à la fin de chaque mois.
            </p>
            <p style={prose}>
              Le problème, c&apos;est que la fiscalité LMNP est technique. Entre l&apos;amortissement par composant, le
              choix entre régime réel et Micro-BIC, et les charges qui se saisissent en pourcentage, il est facile de
              remplir un champ de travers et de se retrouver avec un résultat qui ne veut rien dire.
            </p>
            <p style={prose}>
              C&apos;est exactement à ça que sert cette page. On va parcourir ensemble <strong>toutes les
              fonctionnalités du simulateur</strong>, écran par écran : quoi mettre dans chaque champ et pourquoi,
              comment ton impôt est calculé ligne à ligne, comment fonctionne l&apos;amortissement, comment lire ton
              récapitulatif, et ce que contiennent les trois rapports PDF. Tout est illustré avec un exemple unique
              qu&apos;on suit du début à la fin : un appartement à 250 000 €, loué 1 600 €/mois, avec 40 000 €
              d&apos;apport.
            </p>
          </div>

          {/* Sommaire — même présentation que dans les articles */}
          <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
            <div className="px-6 py-4" style={{ background: "#1A1612" }}>
              <p className="text-xs uppercase tracking-[0.14em] font-medium" style={{ color: "rgba(245,240,232,0.5)" }}>
                Sommaire
              </p>
            </div>
            <div className="px-6 py-5" style={{ background: "#EDE7DC" }}>
              <ol className="space-y-2">
                {SOMMAIRE.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}
                      className="flex items-start gap-3 text-sm transition-opacity hover:opacity-60 group"
                      style={{ color: "#1A1612" }}>
                      <span className="flex-shrink-0 font-mono text-xs mt-0.5 tabular-nums font-semibold"
                        style={{ color: "#C95B2A", minWidth: "1.6rem" }}>
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="group-hover:underline leading-snug">{s.titre}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          1. BIEN & FINANCEMENT
      ═══════════════════════════════════════════════════════════ */}
      <section id="bien-financement" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={1} title="Le bien et son financement" sub="La colonne de gauche du simulateur" />
          <p style={prose}>
            C&apos;est ta première saisie, et la plus structurante. Ces huit champs déterminent combien tu empruntes,
            ce que tu rembourses chaque mois, et la valeur que tu pourras amortir pendant les vingt prochaines années.
            Clique sur n&apos;importe quel champ de l&apos;aperçu ci-dessous : l&apos;explication s&apos;affiche
            juste à côté.
          </p>
          <SectionBienFinancement />
          <div style={{ marginTop: 28 }}>
            <KeyPoint label="Frais de notaire">Ils sont calculés automatiquement, mais tu peux les remplacer par le montant exact de ton notaire. En LMNP réel, tu les amortis sur 25 ans — ils ne sont donc pas perdus.</KeyPoint>
            <KeyPoint label="Apport">C&apos;est ton levier le plus direct sur le cash-flow. Fais deux simulations, une avec ton apport réel et une à 0 €, et compare : tu verras immédiatement ce que ton apport t&apos;achète en confort mensuel.</KeyPoint>
            <KeyPoint label="Durée">Allonger ton crédit de 20 à 25 ans améliore ton cash-flow mensuel mais te coûte plus d&apos;intérêts au total. En LMNP, on privilégie souvent la respiration mensuelle.</KeyPoint>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. LOYER
      ═══════════════════════════════════════════════════════════ */}
      <section id="loyer" style={{ padding: "50px 0", backgroundColor: "#EDE7DC", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={2} title="Le loyer" sub="Ce que ton bien te rapporte réellement" />
          <p style={prose}>
            Deux champs seulement, mais une distinction que beaucoup ratent : le loyer hors charges est ce qui
            t&apos;enrichit, les charges locataire ne font que transiter par ton compte. Seul le premier entre dans le
            calcul de tes rendements.
          </p>
          <SectionLoyer />
          <div style={{ marginTop: 28 }}>
            <InfoBox>
              <strong>Ne gonfle pas ton loyer.</strong> C&apos;est l&apos;erreur la plus fréquente. Prends le loyer
              réellement pratiqué pour un bien équivalent dans le même quartier, pas celui annoncé par le vendeur. Un
              loyer surestimé de 100 €/mois, ce sont 1 200 €/an de cash-flow imaginaire — et une mauvaise surprise à
              la première mise en location.
            </InfoBox>
            <KeyPoint label="Charges locataire">Elles ne sont pas incluses dans ton rendement puisqu&apos;elles ne t&apos;appartiennent pas. Le simulateur les intègre en revanche dans ta base fiscale, comme le fait l&apos;administration.</KeyPoint>
            <KeyPoint label="Vacance locative">Le simulateur raisonne sur douze mois pleins. Si ton bien risque de rester vide un mois par an, retire l&apos;équivalent de ton loyer mensuel pour rester prudent.</KeyPoint>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. AUTRES CHARGES DÉDUCTIBLES
      ═══════════════════════════════════════════════════════════ */}
      <section id="autres-charges" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={3} title="Les autres charges déductibles" sub="Celles qui grignotent ton cash-flow tous les mois" />
          <p style={prose}>
            Ce sont tes charges récurrentes de propriétaire. Au régime réel, tu les déduis intégralement de tes
            revenus — c&apos;est ce qui fait tout l&apos;intérêt de ce régime. Deux d&apos;entre elles se saisissent en
            pourcentage, et ce sont justement les plus souvent sous-estimées.
          </p>
          <SectionAutresCharges />
          <div style={{ marginTop: 28 }}>
            <InfoBox>
              <strong>Attention aux champs exprimés en pourcentage.</strong> Ils paraissent anodins et pèsent lourd.
              Ton assurance PNO + GLI à 3 % de ton loyer annuel, ce sont 576 €/an. Ta gestion locative à 6 %, ce sont
              1 152 €/an. Mis bout à bout, ces deux lignes peuvent te coûter plus de 140 €/mois de cash-flow.
            </InfoBox>
            <div style={{ marginTop: 20 }}>
              <KeyPoint label="Taxe foncière">Demande le montant exact au vendeur avant de faire une offre. Une TF à 2 500 €/an sur un loyer de 1 600 €/mois, c&apos;est un mois et demi de loyer qui part chaque année.</KeyPoint>
              <KeyPoint label="Comptabilité">Obligatoire au régime réel, entre 400 et 800 €/an. Ça peut sembler contraignant — mais c&apos;est ce cabinet qui te sauvera en cas de contrôle fiscal.</KeyPoint>
              <KeyPoint label="Entretien">Beaucoup l&apos;oublient complètement. Provisionne 0,5 à 1 % de ton prix d&apos;achat par an, sinon ton cash-flow réel sera systématiquement moins bon que ta simulation.</KeyPoint>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. OPTION SAISONNIÈRE
      ═══════════════════════════════════════════════════════════ */}
      <section id="saisonnier" style={{ padding: "50px 0", backgroundColor: "#EDE7DC", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={4} title="L'option Location Saisonnière" sub="Airbnb, Booking et autres plateformes" />
          <p style={prose}>
            Si tu coches <strong>Location Saisonnière</strong>, tu remplaces ton loyer mensuel fixe par une estimation
            basée sur ton prix à la nuitée et trois taux d&apos;occupation (bas, moyen, haut). Le simulateur te génère
            alors trois scénarios de rendement en parallèle.
          </p>
          <SectionSaisonnier />
          <div style={{ marginTop: 24 }}>
            <InfoBox color="#26527A">
              <strong>Micro-BIC saisonnier non classé : abattement 30 %</strong> (et non 50 %). La location
              saisonnière est fiscalement moins avantageuse en micro que la location classique. En régime réel, en
              revanche, le calcul reste identique. Le simulateur applique automatiquement le bon abattement selon ton
              choix.
            </InfoBox>
            <div style={{ marginTop: 16 }}>
              <KeyPoint label="Taux moyen">C&apos;est lui qui sert de base à tous tes calculs détaillés. Sois conservateur : mieux vaut calculer sur 50 % d&apos;occupation et être agréablement surpris.</KeyPoint>
              <KeyPoint label="Saisonnalité">Un bien touristique peut osciller entre 20 % en basse saison et 90 % l&apos;été. Ton scénario bas te protège d&apos;une mauvaise année, ton scénario haut mesure ton potentiel maximum.</KeyPoint>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. LES DEUX RÉGIMES FISCAUX
      ═══════════════════════════════════════════════════════════ */}
      <section id="regimes" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={5} title="Les deux régimes fiscaux LMNP" sub="Régime Réel Simplifié ou Micro-BIC" />
          <p style={prose}>
            En LMNP, tu relèves par défaut du Micro-BIC jusqu&apos;à 77 700 €/an de revenus meublés. Au-delà, ou sur
            option, tu bascules au régime réel. Ces deux régimes ne calculent pas ton impôt de la même façon du tout —
            et l&apos;écart peut représenter plusieurs milliers d&apos;euros par an.
          </p>
          <SectionRegimes />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. CALCUL DE L'IMPÔT
      ═══════════════════════════════════════════════════════════ */}
      <section id="impot" style={{ padding: "50px 0", backgroundColor: "#EDE7DC", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={6} title="Comment ton impôt est calculé" sub="Ligne à ligne, avec les chiffres de l'exemple" />
          <p style={prose}>
            Le simulateur t&apos;affiche un tableau fiscal complet — identique à ce que produirait ton
            expert-comptable. Voici comment le lire.
          </p>
          <SectionImpot />
          <div style={{ marginTop: 28, display: "grid", gap: 12 }}>
            <InfoBox>
              <strong>Ton impôt = base imposable × (TMI + prélèvements sociaux).</strong> Les prélèvements sociaux
              s&apos;élèvent à 17,2 % sur les revenus BIC. Avec une TMI à 30 %, ton taux global est donc de 47,2 %.
              Sur une base de 9 900 € en Micro-BIC, tu paies 4 811 €. Tu n&apos;as pas à calculer ça toi-même : tu
              saisis simplement ta TMI, le simulateur intègre les prélèvements sociaux automatiquement.
            </InfoBox>
            <div>
              <KeyPoint label="Ligne clé — Réel">La ligne <strong>Amortissements</strong>, encadrée en bleu dans le tableau, est la plus importante du régime réel. C&apos;est elle qui ramène ta base imposable à 0 € — on y revient en détail plus bas.</KeyPoint>
              <KeyPoint label="Ligne clé — Micro">Ta <strong>base imposable</strong> au Micro-BIC est mécanique : 50 % de tes recettes, quelles que soient tes charges réelles. Si tes charges dépassent la moitié de tes revenus, le réel devient forcément plus avantageux.</KeyPoint>
              <KeyPoint label="Report">Au réel, quand tes amortissements dépassent ton résultat avant amortissement, l&apos;excédent est reporté sur les années suivantes. Ce report est illimité dans le temps : c&apos;est une réserve fiscale que tu te constitues.</KeyPoint>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. QUEL RÉGIME CHOISIR
      ═══════════════════════════════════════════════════════════ */}
      <section id="choisir" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={7} title="Quel régime choisir ?" sub="La comparaison chiffrée sur notre exemple" />
          <p style={prose}>
            Sur notre exemple (appartement 250 000 €, crédit 235 000 €, loyer 1 600 €/mois, TMI 30 %), le tableau
            ci-dessous te montre pourquoi le régime réel l&apos;emporte presque toujours dès que tu as un crédit en
            cours.
          </p>
          <SectionChoisir />
          <div style={{ marginTop: 24 }}>
            <InfoBox color="#1A7A52">
              <strong>Règle simple :</strong> si ton bien est financé à crédit, que tu as de l&apos;amortissement
              disponible et que ta TMI est d&apos;au moins 11 %, le régime réel te sera presque toujours plus
              favorable. Le Micro-BIC ne devient intéressant que si tu es à 0 % de TMI, ou si ton bien est
              intégralement remboursé et très rentable.
            </InfoBox>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. AJUSTER LA SIMULATION
      ═══════════════════════════════════════════════════════════ */}
      <section id="ajuster" style={{ padding: "50px 0", backgroundColor: "#EDE7DC", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={8} title="Ajuster et affiner ta simulation" sub="Modifie, teste, compare" />
          <p style={prose}>
            Une fois tes résultats affichés, tu peux revenir en arrière à tout moment. Chaque paramètre que tu
            modifies recalcule instantanément tous tes indicateurs. Voici les leviers les plus sensibles à tester.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 20 }}>
            {[
              { titre: "Loyer +100 €/mois", impact: "+1 200 €/an de revenus, soit +100 €/mois de cash-flow avant impôt. Sur 20 ans, ce sont 24 000 € de revenus en plus.", color: "#1A7A52" },
              { titre: "Apport +20 000 €", impact: "Ton crédit baisse de 20 000 €, ta mensualité d'environ 115 €/mois — donc +115 €/mois de cash-flow. Mais tu immobilises 20 000 € de liquidités.", color: "#2A7080" },
              { titre: "Taux +0,5 %", impact: "Sur 235 000 € et 20 ans, ta mensualité grimpe d'environ 60 €/mois. Ton cash-flow se dégrade d'autant.", color: "#C95B2A" },
              { titre: "TMI 11 % au lieu de 30 %", impact: "En Micro-BIC, ton impôt est divisé par deux environ. Au réel il est déjà à 0 € — le régime réel reste optimal quelle que soit ta TMI.", color: "#C95B2A" },
              { titre: "Charges +500 €/an", impact: "Impact direct de −42 €/mois sur ton cash-flow. Au réel, ces charges sont déductibles : ton impôt baisse en proportion.", color: "#B03A2A" },
              { titre: "Durée 25 ans au lieu de 20", impact: "Ta mensualité baisse, ton cash-flow mensuel s'améliore — mais tu paies davantage d'intérêts sur la durée totale.", color: "#4E1F12" },
            ].map(({ titre, impact, color }) => (
              <div key={titre} style={{ background: "#F5F0E8", borderRadius: 8, padding: "12px 14px", border: "0.5px solid rgba(26,22,18,0.1)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 6 }}>{titre}</div>
                <div style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", lineHeight: 1.6 }}>{impact}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. L'AMORTISSEMENT LMNP
      ═══════════════════════════════════════════════════════════ */}
      <section id="amortissement" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={9} title="L'amortissement — la ligne qui change tout" sub="Pourquoi c'est le cœur du régime réel" />
          <p style={prose}>
            Au régime réel, tu peux <strong>amortir comptablement</strong> ton bien immobilier : chaque année, tu
            constates une charge représentant sa dépréciation théorique. Cette charge réduit ta base imposable sans
            qu&apos;un seul euro ne quitte ton compte. C&apos;est pour ça que ton impôt peut être à 0 € alors que tu
            encaisses du loyer tous les mois.
          </p>
          <InfoBox color="#2A7080">
            <strong>Amortissement n&apos;est pas dépense.</strong> C&apos;est une charge purement comptable. Tu
            n&apos;envoies d&apos;argent à personne — tu déduis simplement une dépréciation théorique. Ta base
            imposable diminue, ton impôt aussi, et ton compte bancaire ne bouge pas d&apos;un centime sur ce poste.
          </InfoBox>
          <p style={prose}>
            Dans notre exemple, tes amortissements annuels s&apos;élèvent à <strong>9 925 €</strong> pour un résultat
            avant amortissement de 7 512 €. L&apos;amortissement efface donc entièrement ce résultat : ta base
            imposable tombe à 0 €, et l&apos;excédent de 2 413 € est reporté sur l&apos;année suivante.
          </p>
          <div style={{ marginTop: 20 }}>
            <KeyPoint label="Ce qui s'amortit">Ton bien hors terrain (environ 85 % du prix), ton mobilier, tes travaux et tes frais de notaire.</KeyPoint>
            <KeyPoint label="Ce qui ne s'amortit pas">Le terrain, car le sol ne se déprécie pas. En pratique il représente 10 à 20 % du prix.</KeyPoint>
            <KeyPoint label="Durée de l'avantage">Tu amortis tant que ton bien reste en LMNP. Après 10 à 15 ans, ton stock reporté peut être encore très important : l&apos;avantage fiscal dure souvent plus longtemps que ton crédit.</KeyPoint>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. COMPOSANT VS GLOBAL
      ═══════════════════════════════════════════════════════════ */}
      <section id="composant-global" style={{ padding: "50px 0", backgroundColor: "#EDE7DC", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={10} title="Composant ou global : lequel choisir ?" sub="Les deux méthodes d'amortissement" />
          <p style={prose}>
            Le simulateur te propose deux méthodes. La méthode par <strong>composant</strong> ventile ton bien entre
            ses éléments constitutifs — gros œuvre, toiture, aménagements — chacun amorti sur sa propre durée. La
            méthode <strong>globale simplifiée</strong> amortit 85 % du prix sur une durée unique.
          </p>
          <SectionAmortissement />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
            {[
              { titre: "Par Composant", avantages: ["Plus précise et plus avantageuse au début", "Les éléments à courte durée (aménagements, 15 ans) te génèrent plus d'amortissement tôt", "C'est ce que recommandent les experts-comptables LMNP", "Révisable si des travaux modifient un composant"], inconvenients: ["Comptabilité plus complexe", "Nécessite un expert-comptable"], color: "#2A7080" },
              { titre: "Globale Simplifiée", avantages: ["Calcul simple : 85 % du prix sur 25 ans", "Déclaration plus rapide", "Peut suffire si les durées de composants donnent un résultat proche"], inconvenients: ["Moins optimisée sur tes premières années", "Aucune différenciation selon l'état réel du bien"], color: "#C95B2A" },
            ].map(({ titre, avantages, inconvenients, color }) => (
              <div key={titre} style={{ background: "#F5F0E8", borderRadius: 8, border: `1.5px solid ${color}`, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color, marginBottom: 10 }}>{titre}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1A7A52", marginBottom: 4 }}>Avantages</div>
                {avantages.map(a => <div key={a} style={{ fontSize: 12, color: "rgba(26,22,18,0.65)", marginBottom: 3 }}>✓ {a}</div>)}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#B03A2A", marginTop: 8, marginBottom: 4 }}>Points d&apos;attention</div>
                {inconvenients.map(i => <div key={i} style={{ fontSize: 12, color: "rgba(26,22,18,0.55)", marginBottom: 3 }}>· {i}</div>)}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}><InfoBox color="#4E1F12">
            Sur notre exemple, la méthode par composant te génère <strong>9 925 €/an</strong> contre
            <strong> 9 800 €/an</strong> en global — un écart de 125 €/an seulement. Mais si ton bien comporte des
            travaux importants ou un mobilier conséquent, l&apos;écart peut devenir nettement plus significatif en ta
            faveur.
          </InfoBox></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. LE RÉCAPITULATIF
      ═══════════════════════════════════════════════════════════ */}
      <section id="recapitulatif" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={11} title="Le récapitulatif que le simulateur te donne" sub="Quatre parties, de ta saisie au détail de ton amortissement" />
          <p style={prose}>
            Une fois ta simulation validée, le simulateur t&apos;affiche un récapitulatif structuré. Il commence par
            te rappeler ta saisie et te donner tes indicateurs clés — mais il ne s&apos;arrête pas là :
            <strong> il te réaffiche ensuite le tableau fiscal complet du régime que tu as retenu, puis, si tu es au
            réel, le détail de ton amortissement composant par composant.</strong> Tu as ainsi tout le raisonnement
            sous les yeux, sans avoir à remonter dans la page.
          </p>
          <SectionRecap />
          <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
            {[
              { label: "Rendement brut", expl: "Ton loyer HC annuel divisé par ton investissement total. Indicateur grossier : il ignore tes charges et ton impôt. Utile seulement pour comparer plusieurs biens rapidement." },
              { label: "Rendement net (avant impôt)", expl: "Ton loyer HC moins toutes tes charges (hors crédit et impôt), divisé par ton investissement total. Plus pertinent que le brut, mais il ignore encore ton impôt et ton remboursement de crédit." },
              { label: "Cash-flow mensuel", expl: "Ce qui reste vraiment sur ton compte une fois le loyer encaissé et la mensualité, les charges et l'impôt payés. C'est ton indicateur le plus important — on y consacre la section suivante." },
              { label: "Base imposable", expl: "Le montant sur lequel ton impôt est calculé. Au réel elle peut être à 0 € grâce à tes amortissements. En Micro-BIC, elle vaut toujours 50 % de tes recettes." },
              { label: "Amortissement à reporter N+1", expl: "Ton excédent d'amortissement non consommé cette année, reporté sur les suivantes. Ce stock grandit au fil du temps et constitue ta réserve fiscale." },
              { label: "Tableau du régime retenu", expl: "Le tableau fiscal complet du régime que tu as choisi, reproduit ligne à ligne : loyers, emprunt, charges déductibles, amortissements, base imposable et impôt." },
              { label: "Détail de l'amortissement", expl: "Au régime réel, la ventilation de tes amortissements par composant, avec la durée retenue pour chacun. C'est le justificatif de la ligne « Amortissements » de ton tableau fiscal." },
            ].map(({ label, expl }) => (
              <div key={label} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#EDE7DC", borderRadius: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#4E1F12", flexShrink: 0, minWidth: 170 }}>{label}</span>
                <span style={{ fontSize: 13, color: "rgba(26,22,18,0.65)", lineHeight: 1.65, flex: 1, minWidth: 200 }}>{expl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. LE CASH-FLOW
      ═══════════════════════════════════════════════════════════ */}
      <section id="cash-flow" style={{ padding: "50px 0", backgroundColor: "#4E1F12", color: "#F5F0E8", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeadingClair num={12} title="Le cash-flow : ton vrai baromètre" sub="Bien plus important que le rendement" />
          <p style={{ color: "rgba(245,240,232,0.75)", lineHeight: 1.85, fontSize: "1rem", marginBottom: 24 }}>
            Le rendement brut est un outil de comparaison rapide, rien de plus. Ton cash-flow, lui, répond à la vraie
            question : <strong style={{ color: "#F5F0E8" }}>chaque mois, est-ce que ce projet me coûte ou me rapporte
            de l&apos;argent ?</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <div style={{ background: "rgba(245,240,232,0.08)", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#C95B2A", marginBottom: 10 }}>Cash-flow négatif (ici −62 €/mois)</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,0.7)", lineHeight: 1.65 }}>
                Tu sors 62 € de ta poche chaque mois pour financer ton projet. Ce n&apos;est pas un drame si :
                <br />· ton bien prend de la valeur
                <br />· ton amortissement te maintient à 0 € d&apos;impôt
                <br />· ton patrimoine s&apos;enrichit chaque mois du capital remboursé (~680 €/mois ici)
              </div>
            </div>
            <div style={{ background: "rgba(245,240,232,0.08)", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A7A52", marginBottom: 10 }}>Cash-flow positif (ex : +200 €/mois)</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,0.7)", lineHeight: 1.65 }}>
                Ton projet s&apos;autofinance complètement et te dégage un excédent. Idéal, mais rare sur les marchés
                tendus. Tu y arrives avec un apport important, un loyer élevé, ou un bien sans crédit.
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(201,91,42,0.15)", border: "1px solid rgba(201,91,42,0.35)", borderRadius: 10, padding: "16px 20px", marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C95B2A", marginBottom: 8 }}>Ton cash-flow évolue dans le temps</div>
            <div style={{ fontSize: 13, color: "rgba(245,240,232,0.7)", lineHeight: 1.75 }}>
              Chaque mois, tu rembourses un peu moins d&apos;intérêts et un peu plus de capital. Si tes loyers
              augmentent et que tes charges restent stables, ton cash-flow s&apos;améliore progressivement. Et à
              l&apos;an 21 dans notre exemple, ton crédit est soldé : les 1 412 €/mois de mensualité disparaissent
              d&apos;un coup, et ton cash-flow devient massivement positif.
            </div>
          </div>
          <SectionCashflow />
          <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(245,240,232,0.07)", borderRadius: 8, fontSize: 13, color: "rgba(245,240,232,0.65)", lineHeight: 1.75 }}>
            <strong style={{ color: "#F5F0E8" }}>En résumé :</strong> avec un crédit, ton cash-flow sera souvent
            légèrement négatif les premières années. C&apos;est normal et prévisible. Ce qui compte, c&apos;est que
            l&apos;effort mensuel reste supportable pour toi, que la trajectoire sur 20 ans soit bonne, et que ta
            fiscalité soit optimisée — dans notre exemple, sans le régime réel, ton cash-flow serait pire de 400 €
            par mois.
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. LES 3 RAPPORTS
      ═══════════════════════════════════════════════════════════ */}
      <section id="rapports" style={{ padding: "50px 0", scrollMarginTop: 80 }}>
        <div style={wrap}>
          <SectionHeading num={13} title="Les 3 rapports disponibles" sub="Tes documents PDF prêts à l'emploi" />
          <p style={prose}>
            À partir de ta simulation, ToutLMNP te génère trois rapports PDF distincts. Chacun s&apos;adresse à un
            interlocuteur différent : toi, ton expert-comptable, ou ton banquier. Voici le bouton de chacun tel que tu
            le verras, et ce qu&apos;il contient.
          </p>
          <SectionRapports />
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link href="/tarifs" style={{ display: "inline-block", background: "#C95B2A", color: "#F5F0E8", fontWeight: 600, fontSize: 14, padding: "10px 28px", borderRadius: 6, textDecoration: "none" }}>
              Voir les abonnements →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0", backgroundColor: "#EDE7DC" }}>
        <div style={wrap}>
          <h2 style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 600, color: "#4E1F12", marginBottom: 28, letterSpacing: "-0.02em" }}>Questions fréquentes</h2>
          <FAQ />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "60px 16px", backgroundColor: "#4E1F12", textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C95B2A", marginBottom: 14 }}>Prêt à simuler ton investissement ?</p>
        <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 400, color: "#F5F0E8", letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.2 }}>
          Lance ta simulation<br />
          <span style={{ color: "#C95B2A" }}>en 3 minutes chrono</span>
        </h2>
        <Link href="/#simulateur" style={{ display: "inline-block", background: "#C95B2A", color: "#F5F0E8", fontWeight: 700, fontSize: 17, padding: "14px 44px", borderRadius: 8, textDecoration: "none", marginBottom: 16 }}>
          Simuler maintenant →
        </Link>
        <p style={{ fontSize: 12, color: "rgba(245,240,232,0.4)", margin: "12px 0 0" }}>
          Gratuit · Sans inscription · Résultats instantanés · À jour 2026
        </p>
        <p style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", marginTop: 8 }}>
          Les résultats sont fournis à titre indicatif et ne constituent pas un conseil fiscal ou financier. Consulte
          un expert-comptable pour valider ta situation personnelle.
        </p>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)", padding: "40px 16px" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo />
          <nav className="flex flex-col items-center gap-2 text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/comment-ca-marche" className="hover:text-[#1A1612] transition-colors">Guide</Link>
              <Link href="/blog" className="hover:text-[#1A1612] transition-colors">Articles</Link>
              <Link href="/tarifs" className="hover:text-[#1A1612] transition-colors">Abonnements</Link>
              <Link href="/contact" className="hover:text-[#1A1612] transition-colors">Contact</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: "rgba(26,22,18,0.3)" }}>
              <Link href="/legal#mentions" className="hover:text-[#1A1612] transition-colors">Mentions légales</Link>
              <Link href="/legal#confidentialite" className="hover:text-[#1A1612] transition-colors">Confidentialité</Link>
              <Link href="/legal#cgv" className="hover:text-[#1A1612] transition-colors">CGV</Link>
            </div>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp · Outil indicatif, non un conseil fiscal</p>
        </div>
      </footer>
    </main>
  );
}

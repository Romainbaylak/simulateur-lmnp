import type { CSSProperties, ReactNode } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";
import {
  SectionSaisirDonnees,
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
    "Maîtrisez chaque paramètre du simulateur LMNP ToutLMNP : charges déductibles, régime réel vs micro-BIC, calcul de l'impôt, amortissement par composant et lecture du cash-flow.",
  alternates: { canonical: "/comment-ca-marche" },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment utiliser le simulateur LMNP ToutLMNP",
  description: "Guide complet pour simuler la rentabilité, le cash-flow et la fiscalité d'un investissement LMNP.",
  step: [
    { "@type": "HowToStep", name: "Renseignez le bien et son financement", text: "Saisissez le prix d'achat, les frais de notaire, le mobilier, l'apport, la durée, le taux et l'assurance emprunteur." },
    { "@type": "HowToStep", name: "Indiquez le loyer et les charges", text: "Entrez le loyer HC mensuel, les charges locataire, la taxe foncière, la copropriété, l'assurance PNO et la gestion locative." },
    { "@type": "HowToStep", name: "Activez l'option saisonnière si besoin", text: "Pour une location saisonnière, renseignez le prix par nuitée et les trois taux d'occupation (bas, moyen, haut)." },
    { "@type": "HowToStep", name: "Choisissez le régime fiscal", text: "Comparez le régime réel simplifié et le Micro-BIC pour voir lequel minimise votre impôt." },
    { "@type": "HowToStep", name: "Configurez l'amortissement", text: "Choisissez entre la méthode par composant (précise) et la méthode globale simplifiée." },
    { "@type": "HowToStep", name: "Lisez le récapitulatif et les rapports", text: "Consultez le résumé complet : rendement, cash-flow, impôt et amortissement. Téléchargez un rapport PDF selon votre abonnement." },
  ],
};

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
            Maîtrisez le simulateur<br />
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

      {/* ═══════════════════════════════════════════════════════════
          1. SAISIR VOTRE PROJET
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "60px 0 50px" }}>
        <div style={wrap}>
          <SectionHeading num={1} title="Renseignez votre projet" sub="Bien, financement et toutes les charges" />
          <p style={prose}>
            Le simulateur se découpe en deux colonnes : à gauche le bien et son financement, à droite le loyer et les charges. Chaque champ influence directement vos résultats. Cliquez sur un champ ci-dessous pour comprendre son rôle exact.
          </p>
          <SectionSaisirDonnees />
          <div style={{ marginTop: 28 }}>
            <InfoBox>
              <strong>Les champs exprimés en % sont souvent sous-estimés.</strong> L&apos;assurance emprunteur à 0,25 % représente 588 €/an sur 235 000 € empruntés. L&apos;assurance PNO + GLI à 3 % du loyer annuel représente 576 €/an. Ces postes paraissent modestes en pourcentage mais pèsent dans le cash-flow mensuel.
            </InfoBox>
            <div style={{ marginTop: 20 }}>
              <KeyPoint label="Taxe foncière">Demandez le montant exact au vendeur ou au fisc avant toute offre. Une TF à 2 500 €/an sur un loyer à 1 600 €/mois représente un mois et demi de loyer chaque année.</KeyPoint>
              <KeyPoint label="Comptabilité">Obligatoire au régime réel. Budget réaliste : 400 à 800 €/an. Cela peut paraître contraignant — mais c&apos;est ce cabinet qui vous sauvera en cas de contrôle fiscal.</KeyPoint>
              <KeyPoint label="Charges locataire">Les charges récupérées auprès du locataire (eau, ordures, gardien…) ne sont pas incluses dans le calcul de rendement. Elles transitent — le simulateur les intègre dans la base fiscale réelle.</KeyPoint>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. OPTION SAISONNIÈRE
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0", backgroundColor: "#EDE7DC" }}>
        <div style={wrap}>
          <SectionHeading num={2} title="L'option Location Saisonnière" sub="Airbnb, Booking et autres plateformes" />
          <p style={prose}>
            En cochant <strong>Location Saisonnière</strong>, vous remplacez le loyer mensuel fixe par une estimation basée sur le prix par nuitée et trois taux d&apos;occupation (bas / moyen / haut). Le simulateur génère alors trois scénarios de rendement en parallèle.
          </p>
          <SectionSaisonnier />
          <div style={{ marginTop: 24 }}>
            <InfoBox color="#26527A">
              <strong>Micro-BIC saisonnier non classé : abattement 30 %</strong> (et non 50 %). La location saisonnière est fiscalement moins avantageuse en micro que la location classique. En régime réel, le calcul reste identique. Le simulateur applique automatiquement le bon abattement selon votre choix.
            </InfoBox>
            <div style={{ marginTop: 16 }}>
              <KeyPoint label="Taux moyen">C&apos;est lui qui sert de base aux calculs de rentabilité détaillés. Soyez conservateur : mieux vaut calculer sur 50 % d&apos;occupation et être agréablement surpris.</KeyPoint>
              <KeyPoint label="Saisonnalité">Un bien touristique peut osciller entre 20 % (basse saison) et 90 % (été). Le scénario bas vous protège contre une mauvaise saison. Le scénario haut mesure le potentiel maximum.</KeyPoint>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. LES DEUX RÉGIMES FISCAUX
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0" }}>
        <div style={wrap}>
          <SectionHeading num={3} title="Les deux régimes fiscaux LMNP" sub="Régime Réel Simplifié vs Micro-BIC" />
          <p style={prose}>
            En LMNP, vous relevez obligatoirement du Micro-BIC jusqu&apos;à 77 700 €/an de revenus meublés. Au-delà, ou sur option, vous basculez au régime réel. Ces deux régimes ne calculent pas l&apos;impôt de la même façon du tout.
          </p>
          <SectionRegimes />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. CALCUL DE L'IMPÔT
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0", backgroundColor: "#EDE7DC" }}>
        <div style={wrap}>
          <SectionHeading num={4} title="Comment votre impôt est calculé" sub="Ligne à ligne, avec les chiffres de l'exemple" />
          <p style={prose}>
            Le simulateur affiche un tableau fiscal complet — identique à ce que produirait votre expert-comptable. Voici comment lire chaque ligne.
          </p>
          <SectionImpot />
          <div style={{ marginTop: 28, display: "grid", gap: 12 }}>
            <InfoBox>
              <strong>L&apos;impôt = base imposable × (TMI + prélèvements sociaux).</strong> Les prélèvements sociaux (CSG-CRDS) s&apos;élèvent à 17,2 % sur les revenus BIC. Avec une TMI à 30 %, le taux global est 48,2 %. Sur une base de 9 900 € (Micro-BIC), l&apos;impôt est 9 900 × 48,6 % = 4 811 €. Le simulateur intègre automatiquement les 17,2 % de PS dans le calcul — vous saisissez uniquement votre TMI.
            </InfoBox>
            <div>
              <KeyPoint label="Ligne clé — Réel">La ligne <strong>Amortissements</strong> (encadrée en bleu dans le tableau) est souvent la plus importante du régime réel. C&apos;est elle qui ramène la base imposable à 0 € — voir section suivante.</KeyPoint>
              <KeyPoint label="Ligne clé — Micro">La ligne <strong>Base imposable</strong> au Micro-BIC est mécanique : 50 % des recettes, quelles que soient vos charges réelles. Si vos charges dépassent 50 % des revenus, le réel devient obligatoirement plus avantageux.</KeyPoint>
              <KeyPoint label="Amortissement à reporter">En réel, quand les amortissements dépassent le résultat avant amortissement, l&apos;excédent est reporté sur les années suivantes. Ce report est illimité et représente une réserve fiscale précieuse.</KeyPoint>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. QUEL RÉGIME CHOISIR
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0" }}>
        <div style={wrap}>
          <SectionHeading num={5} title="Quel régime choisir ?" sub="Comparaison chiffrée sur l'exemple" />
          <p style={prose}>
            Dans notre exemple (appartement 250 000 €, crédit 235 000 €, loyer 1 600 €/mois, TMI 30 %), le tableau ci-dessous montre pourquoi le régime réel est presque toujours gagnant dès qu&apos;il y a un crédit en cours.
          </p>
          <SectionChoisir />
          <div style={{ marginTop: 24 }}>
            <InfoBox color="#1A7A52">
              <strong>Règle empirique :</strong> si votre bien est financé par crédit, si vous avez de l&apos;amortissement disponible, et si votre TMI est ≥ 11 %, le régime réel sera presque toujours plus favorable. Le Micro-BIC peut être intéressant uniquement si vous êtes en TMI 0 % ou si votre bien est intégralement remboursé et très rentable.
            </InfoBox>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. AJUSTER LA SIMULATION
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0", backgroundColor: "#EDE7DC" }}>
        <div style={wrap}>
          <SectionHeading num={6} title="Ajuster et affiner votre simulation" sub="Modifier, tester des variantes" />
          <p style={prose}>
            Après avoir vu les résultats, le simulateur vous permet de revenir en arrière à tout moment. Chaque paramètre modifié recalcule instantanément tous les indicateurs. Voici les leviers les plus sensibles à tester.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 20 }}>
            {[
              { titre: "Loyer +100 €/mois", impact: "+1 200 €/an de revenus → cash-flow amélioré de +100 €/mois avant impôt. Sur 20 ans : 24 000 € de revenus supplémentaires.", color: "#1A7A52" },
              { titre: "Apport +20 000 €", impact: "Crédit réduit de 20 000 € → mensualité réduite de ~115 €/mois → cash-flow +115 €/mois. Mais 20 000 € de moins en liquidités.", color: "#2A7080" },
              { titre: "Taux 0,5 % de plus", impact: "+0,5 % sur 235 000 € / 20 ans → mensualité +60 €/mois environ → cash-flow dégradé de 60 €/mois.", color: "#C95B2A" },
              { titre: "TMI 11 % au lieu de 30 %", impact: "En Micro-BIC : impôt divisé par ~2. En réel, l'impôt est déjà 0 € — le régime réel reste optimal quelle que soit la TMI.", color: "#C95B2A" },
              { titre: "Charges +500 €/an", impact: "Impact direct de −42 €/mois sur le cash-flow. Au réel, ces charges sont déductibles, donc l'impôt baisse en proportion.", color: "#B03A2A" },
              { titre: "Durée 25 ans vs 20 ans", impact: "Mensualité plus basse → meilleur cash-flow mensuel, mais plus d'intérêts sur la durée totale.", color: "#4E1F12" },
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
          7. L'AMORTISSEMENT LMNP
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0" }}>
        <div style={wrap}>
          <SectionHeading num={7} title="L'amortissement LMNP — la ligne qui change tout" sub="Pourquoi c'est le cœur du régime réel" />
          <p style={prose}>
            En LMNP régime réel, vous pouvez <strong>amortir comptablement</strong> votre bien immobilier — c&apos;est-à-dire constater chaque année une charge fictive représentant la dépréciation théorique du bien. Cette charge réduit votre base imposable sans sortie réelle de trésorerie. C&apos;est la raison pour laquelle l&apos;impôt est souvent 0 € alors que vous encaissez du loyer.
          </p>
          <InfoBox color="#2A7080">
            <strong>Amortissement ≠ dépense réelle.</strong> C&apos;est une charge purement comptable. Vous n&apos;envoyez pas d&apos;argent quelque part — vous déduisez simplement une dépréciation théorique. Résultat : votre base imposable diminue, votre impôt aussi, mais votre compte bancaire ne bouge pas pour autant sur ce poste.
          </InfoBox>
          <p style={prose}>
            Dans notre exemple, les amortissements annuels s&apos;élèvent à <strong>9 925 €/an</strong>. Le résultat avant amortissement est de 7 512 €. L&apos;amortissement efface entièrement ce résultat — la base imposable tombe à 0 €. L&apos;excédent (2 413 €) est reporté sur l&apos;année suivante.
          </p>
          <div style={{ marginTop: 20 }}>
            <KeyPoint label="Ce qui s'amortit">Le bien (hors terrain, soit ~85 % du prix), le mobilier, les travaux, les frais de notaire.</KeyPoint>
            <KeyPoint label="Ce qui ne s'amortit pas">Le terrain (le sol ne se déprécie pas). En pratique, la valeur du terrain représente environ 10 à 20 % du prix.</KeyPoint>
            <KeyPoint label="Durée de l'avantage">L&apos;amortissement est disponible tant que le bien est en LMNP. Après 10 à 15 ans, le cumul reporté peut être encore très important. L&apos;avantage fiscal dure souvent plus longtemps que le crédit.</KeyPoint>
          </div>
          <SectionAmortissement />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. COMPOSANT VS GLOBAL
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0", backgroundColor: "#EDE7DC" }}>
        <div style={wrap}>
          <SectionHeading num={8} title="Composant vs Global : lequel choisir ?" sub="Les deux méthodes d'amortissement" />
          <p style={prose}>
            Le simulateur propose deux méthodes. La méthode par <strong>composant</strong> ventile le bien entre ses éléments constitutifs (gros œuvre, toiture, aménagements…), chacun amorti sur sa propre durée. La méthode <strong>globale simplifiée</strong> amortit 85 % du prix sur une durée unique.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
            {[
              { titre: "Par Composant", avantages: ["Plus précise et plus avantageuse en début de période", "Les éléments à courte durée (aménagements 15 ans) génèrent plus d'amortissements tôt", "Recommandée par les experts-comptables LMNP", "Flexible : révisable si des travaux modifient un composant"], inconvenients: ["Comptabilité plus complexe", "Nécessite un expert-comptable"], color: "#2A7080" },
              { titre: "Globale Simplifiée", avantages: ["Calcul simple : 85 % du prix sur 25 ans", "Déclaration plus rapide", "Peut suffire si les durées de composants donnent un résultat similaire"], inconvenients: ["Moins optimisée sur les premières années", "Pas de différenciation selon l'état réel du bien"], color: "#C95B2A" },
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
            Dans notre exemple (appartement 250 000 €), la méthode par composant génère <strong>9 925 €/an</strong> vs <strong>9 800 €/an</strong> en global — un écart de 125 €/an. Sur des biens avec des travaux importants ou un mobilier élevé, l&apos;écart peut être significativement plus grand.
          </InfoBox></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. LE RÉSUMÉ FINAL
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0" }}>
        <div style={wrap}>
          <SectionHeading num={9} title="Le récapitulatif que le simulateur vous donne" sub="Lire et interpréter chaque indicateur" />
          <p style={prose}>
            Après validation de la simulation, le simulateur affiche un récapitulatif structuré en blocs. Voici ce que contient chaque partie et comment l&apos;interpréter.
          </p>
          <SectionRecap />
          <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
            {[
              { label: "Rendement brut", expl: "Loyer HC annuel ÷ investissement total. Indicateur grossier — ne tient pas compte des charges ni de l'impôt. Utile pour comparer des biens rapidement." },
              { label: "Rendement net (avant impôt)", expl: "Loyer HC − toutes les charges (hors crédit et impôt) ÷ investissement total. Plus pertinent que le brut, mais ignore encore l'impôt et le remboursement du crédit." },
              { label: "Cash-flow mensuel", expl: "Ce qui reste réellement sur votre compte après avoir encaissé le loyer, payé la mensualité, les charges et l'impôt. L'indicateur le plus important — voir section suivante." },
              { label: "Base imposable", expl: "Le montant sur lequel l'impôt est calculé. En réel, elle peut être 0 € grâce aux amortissements. En Micro-BIC, elle est toujours 50 % des recettes." },
              { label: "Amortissement à reporter N+1", expl: "L'excédent d'amortissement non consommé cette année — reporté sur les années suivantes. Ce stock grandit au fil du temps et constitue une réserve fiscale." },
            ].map(({ label, expl }) => (
              <div key={label} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#EDE7DC", borderRadius: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#4E1F12", flexShrink: 0, minWidth: 170 }}>{label}</span>
                <span style={{ fontSize: 13, color: "rgba(26,22,18,0.65)", lineHeight: 1.65 }}>{expl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. LE CASH-FLOW : L'INDICATEUR ESSENTIEL
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0", backgroundColor: "#4E1F12", color: "#F5F0E8" }}>
        <div style={wrap}>
          <SectionHeading num={10} title="Le cash-flow : votre vrai baromètre" sub="Bien plus important que le rendement" />
          <p style={{ color: "rgba(245,240,232,0.75)", lineHeight: 1.85, fontSize: "1rem", marginBottom: 24 }}>
            Le rendement brut est un outil de comparaison rapide. Le cash-flow, lui, répond à la vraie question : <strong style={{ color: "#F5F0E8" }}>chaque mois, est-ce que ce projet me coûte ou me rapporte de l&apos;argent ?</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <div style={{ background: "rgba(245,240,232,0.08)", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#C95B2A", marginBottom: 10 }}>Cash-flow négatif (exemple : −62 €/mois)</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,0.7)", lineHeight: 1.65 }}>
                Vous déboursez 62 € de votre poche chaque mois pour financer le projet. Ce n&apos;est pas un drame si :
                <br />· Le bien prend de la valeur
                <br />· L&apos;amortissement fiscalise 0 €
                <br />· Votre patrimoine s&apos;enrichit chaque mois du capital remboursé (~680 €/mois)
              </div>
            </div>
            <div style={{ background: "rgba(245,240,232,0.08)", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A7A52", marginBottom: 10 }}>Cash-flow positif (ex : +200 €/mois)</div>
              <div style={{ fontSize: 13, color: "rgba(245,240,232,0.7)", lineHeight: 1.65 }}>
                Le projet s&apos;autofinance complètement et génère un excédent. Idéal mais rare sur les marchés tendus. Possible avec un fort apport, un loyer élevé, ou un bien sans crédit.
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(201,91,42,0.15)", border: "1px solid rgba(201,91,42,0.35)", borderRadius: 10, padding: "16px 20px", marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C95B2A", marginBottom: 8 }}>Le cash-flow évolue dans le temps</div>
            <div style={{ fontSize: 13, color: "rgba(245,240,232,0.7)", lineHeight: 1.75 }}>
              Chaque mois, vous remboursez un peu moins d&apos;intérêts et un peu plus de capital. Si les loyers augmentent et que les charges restent stables, le cash-flow s&apos;améliore progressivement. Et à l&apos;an 21 dans l&apos;exemple, le crédit est remboursé — les 1 412 €/mois de mensualité disparaissent d&apos;un coup : le cash-flow devient massivement positif.
            </div>
          </div>
          <SectionCashflow />
          <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(245,240,232,0.07)", borderRadius: 8, fontSize: 13, color: "rgba(245,240,232,0.65)", lineHeight: 1.75 }}>
            <strong style={{ color: "#F5F0E8" }}>En résumé :</strong> Un investissement LMNP avec crédit aura souvent un cash-flow légèrement négatif en début de période. C&apos;est normal et prévu. Ce qui compte c&apos;est l&apos;effort mensuel supportable, la trajectoire sur 20 ans, et l&apos;optimisation fiscale (impôt 0 € = le cash-flow aurait été pire de 400 €/mois en Micro-BIC dans l&apos;exemple).
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. LES 3 RAPPORTS
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "50px 0" }}>
        <div style={wrap}>
          <SectionHeading num={11} title="Les 3 rapports disponibles" sub="Selon votre abonnement" />
          <p style={prose}>
            ToutLMNP génère des rapports PDF à partir de votre simulation. Chaque rapport est un document prêt à l&apos;emploi — pour vous, votre banquier ou votre expert-comptable. Voici ce que contient chacun d&apos;eux.
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
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C95B2A", marginBottom: 14 }}>Prêt à simuler votre investissement ?</p>
        <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 400, color: "#F5F0E8", letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.2 }}>
          Lancez votre simulation<br />
          <span style={{ color: "#C95B2A" }}>en 3 minutes chrono</span>
        </h2>
        <Link href="/#simulateur" style={{ display: "inline-block", background: "#C95B2A", color: "#F5F0E8", fontWeight: 700, fontSize: 17, padding: "14px 44px", borderRadius: 8, textDecoration: "none", marginBottom: 16 }}>
          Simuler maintenant →
        </Link>
        <p style={{ fontSize: 12, color: "rgba(245,240,232,0.4)", margin: "12px 0 0" }}>
          Gratuit · Sans inscription · Résultats instantanés · À jour 2026
        </p>
        <p style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", marginTop: 8 }}>
          Les résultats sont fournis à titre indicatif et ne constituent pas un conseil fiscal ou financier. Consultez un expert-comptable pour valider votre situation personnelle.
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

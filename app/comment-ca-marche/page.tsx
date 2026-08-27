import type { CSSProperties, ReactNode } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";
import {
  Section1Demo,
  Section2Demo,
  Section3Demo,
  Section4Demo,
  Section5Demo,
  Section6Demo,
  Section7Demo,
  Section8Demo,
  Section9Demo,
  FAQ,
  HeroSteps,
} from "@/components/GuideSimulateurInteractif";

export const metadata: Metadata = {
  title: "Simulateur LMNP : comment calculer rentabilité, cash-flow et fiscalité | ToutLMNP",
  description:
    "Découvrez comment utiliser le simulateur ToutLMNP : prix d'achat, crédit, charges, rentabilité, cash-flow, Micro-BIC, régime réel et amortissement expliqués étape par étape.",
  alternates: { canonical: "/comment-ca-marche" },
};

/* ── JSON-LD HowTo ──────────────────────────────────────────────── */
const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment utiliser le simulateur LMNP ToutLMNP",
  description:
    "Guide étape par étape pour simuler la rentabilité, le cash-flow et la fiscalité d'un investissement locatif meublé (LMNP).",
  step: [
    { "@type": "HowToStep", name: "Renseignez le bien et son financement", text: "Saisissez le prix d'achat, les frais de notaire, l'apport, la durée, le taux et l'assurance emprunteur." },
    { "@type": "HowToStep", name: "Indiquez les revenus et les charges", text: "Entrez le loyer mensuel (ou le prix par nuitée pour la location saisonnière) ainsi que les charges annuelles." },
    { "@type": "HowToStep", name: "Lisez les indicateurs essentiels", text: "Le simulateur calcule instantanément le rendement brut, le cash-flow mensuel et l'impôt estimé." },
    { "@type": "HowToStep", name: "Testez un autre niveau de loyer", text: "Utilisez le curseur pour voir l'impact d'une variation de loyer sur la rentabilité." },
    { "@type": "HowToStep", name: "Comparez le Régime Réel et le Micro-BIC", text: "Cliquez sur chaque régime pour voir la base imposable, l'impôt et le cash-flow correspondants." },
    { "@type": "HowToStep", name: "Définissez la méthode d'amortissement", text: "Choisissez entre l'amortissement par composant ou la méthode globale simplifiée." },
    { "@type": "HowToStep", name: "Lisez le compte rendu final", text: "Le simulateur affiche un récapitulatif complet : bien, financement, charges et verdict fiscal." },
    { "@type": "HowToStep", name: "Visualisez l'évolution sur 25 ans", text: "Un graphique montre comment le cash-flow évolue dans le temps à mesure que le crédit se rembourse." },
    { "@type": "HowToStep", name: "Testez plusieurs scénarios", text: "Revenez en arrière et changez une variable à la fois pour comparer les hypothèses." },
  ],
};

/* ── Petites constantes de style ──────────────────────────────────── */
const prose: CSSProperties = { color: "rgba(26,22,18,0.72)", lineHeight: 1.8, fontSize: "1rem" };
const sectionStyle: CSSProperties = { maxWidth: 896, margin: "0 auto", padding: "0 16px" };

function SectionHeading({ num, children }: { num: number; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <span style={{ fontSize: "2.5rem", fontWeight: 300, color: "#C95B2A", letterSpacing: "-0.04em", lineHeight: 1, flexShrink: 0 }}>{num}</span>
      <div style={{ width: 2, alignSelf: "stretch", borderRadius: 2, background: "rgba(201,91,42,0.3)", flexShrink: 0 }} />
      <h2 style={{ fontSize: "clamp(1.15rem,2.5vw,1.4rem)", fontWeight: 300, color: "#4E1F12", letterSpacing: "-0.02em", margin: 0 }}>
        {children}
      </h2>
    </div>
  );
}

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      {/* ── Header ── */}
      <header
        style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }}
        className="sticky top-0 z-50"
      >
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
            <a
              href="/?reset=1#simulateur"
              className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}
            >
              Simuler maintenant
            </a>
          </div>
        </div>
        <MobileHeader />
      </header>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: "#4E1F12", padding: "60px 16px 52px" }}>
        <div style={{ maxWidth: 896, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(1.75rem,4vw,2.8rem)",
              fontWeight: 300,
              color: "#F5F0E8",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Comment utiliser le simulateur LMNP ?
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(245,240,232,0.72)", lineHeight: 1.75, maxWidth: 680, marginBottom: 28 }}>
            Prix d&apos;achat, crédit, charges, rentabilité, cash-flow, fiscalité et amortissement : découvrez comment analyser un investissement locatif avec ToutLMNP, étape par étape.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a
              href="/?reset=1#simulateur"
              style={{
                background: "#C95B2A", color: "#F5F0E8",
                padding: "12px 22px", borderRadius: 8,
                fontWeight: 600, fontSize: "0.95rem",
                textDecoration: "none", transition: "opacity 150ms",
              }}
            >
              Lancer une simulation →
            </a>
            <a
              href="#section-1"
              style={{
                background: "rgba(245,240,232,0.1)", color: "#F5F0E8",
                padding: "12px 22px", borderRadius: 8,
                fontWeight: 500, fontSize: "0.95rem",
                textDecoration: "none", border: "1px solid rgba(245,240,232,0.2)",
                transition: "opacity 150ms",
              }}
            >
              Voir comment ça marche ↓
            </a>
          </div>
          {/* @ts-ignore — Server Component rendering client island */}
          <HeroSteps />
        </div>
      </section>

      {/* ── Contenu ── */}
      <div style={{ paddingBottom: 80 }}>

        {/* ── Section 1 ── */}
        <section id="section-1" style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={1}>Renseignez le bien et son financement</SectionHeading>
            <p style={prose}>
              La première étape consiste à décrire votre opération immobilière. Le simulateur part du <strong style={{ color: "#1A1612" }}>prix d&apos;achat net vendeur</strong>, auquel s&apos;ajoutent les frais de notaire (environ 7–8 % dans l&apos;ancien). Vous indiquez ensuite votre apport personnel : s&apos;il est nul, la totalité du prix + notaire est financée à crédit. Enfin, vous renseignez la durée du prêt, le taux d&apos;intérêt annuel et le taux d&apos;assurance emprunteur. Le simulateur calcule instantanément la mensualité.
            </p>
            <p style={{ ...prose, marginTop: 12, fontSize: "0.9rem", color: "rgba(26,22,18,0.55)" }}>
              Cliquez sur un champ ci-dessous pour comprendre son rôle dans la simulation.
            </p>
            {/* @ts-ignore */}
            <Section1Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 2 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={2}>Indiquez les revenus et les charges</SectionHeading>
            <p style={prose}>
              En location longue durée, vous saisissez le <strong style={{ color: "#1A1612" }}>loyer hors charges</strong> et les charges récupérables. En location saisonnière, activez le mode correspondant : entrez un prix par nuitée et trois hypothèses de taux d&apos;occupation (bas, moyen, haut). Pour les charges, renseignez la taxe foncière, les charges de copropriété, l&apos;assurance propriétaire non-occupant et les éventuels frais de gestion.
            </p>
            {/* @ts-ignore */}
            <Section2Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 3 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 16px" }}>
            <SectionHeading num={3}>Lancez la simulation et lisez les indicateurs essentiels</SectionHeading>
            <p style={{ ...prose, maxWidth: 720 }}>
              Dès que vous avez renseigné les champs, six indicateurs clés apparaissent : le <strong style={{ color: "#1A1612" }}>rendement brut</strong>, les revenus annuels, la charge de crédit annuelle, les autres charges, l&apos;impôt estimé et le <strong style={{ color: "#1A1612" }}>cash-flow mensuel</strong>. Ce dernier est la vraie boussole de l&apos;investisseur : il représente ce que vous déboursez (ou encaissez) chaque mois, après tout.
            </p>
            {/* @ts-ignore */}
            <Section3Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 4 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={4}>Testez immédiatement un autre niveau de loyer</SectionHeading>
            <p style={prose}>
              Le loyer est la variable la plus sensible de votre investissement. Le simulateur vous permet de le faire varier en temps réel : le cash-flow, les revenus annuels et le rendement se mettent à jour instantanément. C&apos;est particulièrement utile pour tester l&apos;écart entre le loyer espéré et un loyer de marché plus conservateur.
            </p>
            {/* @ts-ignore */}
            <Section4Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 5 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={5}>Comparez le Régime Réel et le Micro-BIC</SectionHeading>
            <p style={prose}>
              Le choix du régime fiscal est déterminant. En <strong style={{ color: "#1A1612" }}>Micro-BIC</strong>, l&apos;administration applique un abattement forfaitaire de 30 % sur vos loyers — vous êtes imposé sur 70 % de vos recettes, sans déduire vos vraies charges ni amortir le bien. Au <strong style={{ color: "#1A1612" }}>Régime Réel</strong>, vous déduisez toutes les charges et amortissez le bien : la base imposable est souvent nulle pendant 15–20 ans.
            </p>
            {/* @ts-ignore */}
            <Section5Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 6 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={6}>Si vous choisissez le Réel : définissez l&apos;amortissement</SectionHeading>
            <p style={prose}>
              L&apos;amortissement est le cœur du LMNP au réel. Il représente la dépréciation comptable du bien que vous déduisez chaque année de vos revenus locatifs. Deux méthodes s&apos;offrent à vous : l&apos;<strong style={{ color: "#1A1612" }}>amortissement par composant</strong>, qui ventile le bâti entre ses différents éléments (gros œuvre, toiture, aménagements…), plus précis et souvent plus avantageux ; et l&apos;<strong style={{ color: "#1A1612" }}>amortissement global simplifié</strong>, plus simple comptablement.
            </p>
            {/* @ts-ignore */}
            <Section6Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 7 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 16px" }}>
            <SectionHeading num={7}>Validez puis lisez le compte rendu final</SectionHeading>
            <p style={{ ...prose, maxWidth: 720 }}>
              Après avoir configuré tous les paramètres, le simulateur affiche un récapitulatif complet : les trois blocs synthétiques (le bien, le financement, les charges), un verdict fiscal avec le régime choisi, et les six indicateurs de performance. Vous pouvez l&apos;exporter en PDF ou le sauvegarder dans votre espace.
            </p>
            {/* @ts-ignore */}
            <Section7Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 8 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={8}>Regardez ce qui se passe dans le temps</SectionHeading>
            <p style={prose}>
              À mesure que les années passent, la part des intérêts dans vos mensualités diminue. Votre cash-flow s&apos;améliore progressivement. Le graphique ci-dessous illustre cette évolution sur 25 ans : le bien commence avec un cash-flow négatif (effort d&apos;épargne mensuel), puis remonte vers l&apos;équilibre puis vers le positif à mesure que le crédit se rembourse.
            </p>
            {/* @ts-ignore */}
            <Section8Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── Section 9 ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <SectionHeading num={9}>Revenez en arrière et testez vos hypothèses</SectionHeading>
            <p style={prose}>
              Un investissement locatif s&apos;analyse rarement en une seule simulation. Revenez en arrière à tout moment pour tester différentes hypothèses : loyer plus bas, taux plus élevé, apport différent. Le simulateur propose trois scénarios pré-configurés — prudent, central et favorable — pour cadrer votre analyse.
            </p>
            {/* @ts-ignore */}
            <Section9Demo />
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── PDF & Sauvegarde ── */}
        <section style={{ padding: "48px 0 40px" }}>
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 300, color: "#4E1F12", letterSpacing: "-0.02em", marginBottom: 12 }}>
              Exportez et sauvegardez votre simulation
            </h2>
            <p style={{ ...prose, marginBottom: 20 }}>
              Une fois vos résultats obtenus, vous pouvez télécharger un rapport PDF complet ou sauvegarder la simulation dans votre espace pour la retrouver plus tard.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
              <span style={{ background: "#EDE7DC", border: "1px solid rgba(26,22,18,0.1)", borderRadius: 8, padding: "10px 18px", fontSize: "0.88rem", color: "rgba(26,22,18,0.6)" }}>
                📄 Télécharger le rapport PDF
              </span>
              <span style={{ background: "#EDE7DC", border: "1px solid rgba(26,22,18,0.1)", borderRadius: 8, padding: "10px 18px", fontSize: "0.88rem", color: "rgba(26,22,18,0.6)" }}>
                💾 Sauvegarder la simulation
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href="/blog/amortissement-lmnp" style={{ fontSize: "0.88rem", color: "#C95B2A", textDecoration: "none" }}>
                → Comprendre l&apos;amortissement LMNP
              </Link>
              <Link href="/blog/revente-lmnp-plus-value" style={{ fontSize: "0.88rem", color: "#C95B2A", textDecoration: "none" }}>
                → Plus-value à la revente LMNP
              </Link>
              <Link href="/blog/lmnp-definition-statut-2026" style={{ fontSize: "0.88rem", color: "#C95B2A", textDecoration: "none" }}>
                → Définition du statut LMNP 2026
              </Link>
              <Link href="/blog/actualite-lmnp-2026" style={{ fontSize: "0.88rem", color: "#C95B2A", textDecoration: "none" }}>
                → Actualité LMNP 2026
              </Link>
            </div>
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.07)", margin: "0 16px" }} />

        {/* ── FAQ ── */}
        <section style={{ padding: "64px 0 48px" }}>
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.5rem)", fontWeight: 300, color: "#4E1F12", letterSpacing: "-0.02em", marginBottom: 24 }}>
              Questions fréquentes
            </h2>
            {/* @ts-ignore */}
            <FAQ />
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section style={{ padding: "0 16px 80px" }}>
          <div style={{ maxWidth: 896, margin: "0 auto", background: "#4E1F12", borderRadius: 16, padding: "48px 40px", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 300, color: "#F5F0E8", letterSpacing: "-0.025em", marginBottom: 12 }}>
              Testez maintenant votre investissement
            </h2>
            <p style={{ color: "rgba(245,240,232,0.55)", marginBottom: 28, fontSize: "1rem" }}>
              Gratuit, sans inscription, résultats instantanés.
            </p>
            <a
              href="/?reset=1#simulateur"
              style={{
                display: "inline-block",
                background: "#C95B2A", color: "#F5F0E8",
                padding: "14px 32px", borderRadius: 8,
                fontWeight: 600, fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              Lancer le simulateur →
            </a>
            <p style={{ marginTop: 24, fontSize: "0.75rem", color: "rgba(245,240,232,0.3)", lineHeight: 1.6 }}>
              Les résultats fournis par ToutLMNP sont indicatifs et ne constituent pas un conseil fiscal ou financier. Consultez un expert-comptable pour votre situation personnelle.
            </p>
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <nav className="flex gap-6 text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#1A1612] transition-colors">Guide</Link>
            <Link href="/blog" className="hover:text-[#1A1612] transition-colors">Articles</Link>
            <Link href="/tarifs" className="hover:text-[#1A1612] transition-colors">Abonnements</Link>
            <Link href="/contact" className="hover:text-[#1A1612] transition-colors">Contact</Link>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>
            © 2026 toutlmnp · Outil indicatif, non un conseil fiscal
          </p>
        </div>
      </footer>
    </main>
  );
}

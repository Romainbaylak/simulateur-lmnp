import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";
import BlogTabs from "@/components/BlogTabs";

export const metadata: Metadata = {
  title: "Articles LMNP – Conseils investissement immobilier meublé",
  description: "Articles et guides sur le statut LMNP, la fiscalité, l'amortissement et l'investissement immobilier locatif meublé.",
};

const articlesLmnp = [
  {
    slug: "amortissement-lmnp",
    titre: "Amortissement LMNP : comment fonctionne-t-il et comment le calculer ?",
    extrait: "L'amortissement est l'un des mécanismes fiscaux les plus importants de la location meublée au régime réel. Il permet de répartir comptablement le coût du logement et de ses équipements sur leur durée d'utilisation, réduisant ainsi fortement le bénéfice BIC imposable.",
    date: "Mis à jour en août 2026",
  },
  {
    slug: "csg-prelevements-sociaux-lmnp-2026",
    titre: "2026 : CSG et prélèvements sociaux en LMNP",
    extrait: "Le taux des prélèvements sociaux applicable aux revenus LMNP passe de 17,2 % à 18,6 % en 2026 — une hausse qui s'applique dès les revenus 2025. Comprendre la base de calcul, la CSG déductible, et la différence avec les cotisations sociales et la fiscalité de la plus-value.",
    date: "Mis à jour en août 2026",
  },
  {
    slug: "lmnp-definition-statut-2026",
    titre: "LMNP : Définition et conditions du statut de location meublée (2026)",
    extrait: "Le statut LMNP permet à un particulier de louer un logement meublé dans un cadre fiscal spécifique. Découvrez les conditions à respecter en 2026, les régimes fiscaux disponibles (micro-BIC et régime réel), et les différences avec la location nue ou le statut LMP.",
    date: "Mis à jour en août 2026",
  },
  {
    slug: "revente-lmnp-plus-value",
    titre: "Revente d'un bien LMNP : comment est calculée la plus-value ?",
    extrait: "Depuis le 15 février 2025, les amortissements LMNP admis en déduction viennent réduire le prix d'acquisition retenu pour le calcul de la plus-value. Comprendre ce mécanisme est indispensable pour anticiper la fiscalité à la revente.",
    date: "Mis à jour en août 2026",
  },
];

const articlesActualite: typeof articlesLmnp = [
  {
    slug: "actualite-lmnp-2026",
    titre: "Actualité LMNP 2026 : Ce qui change vraiment pour les bailleurs",
    extrait: "Le statut LMNP reste en vigueur en 2026, mais son environnement fiscal évolue : revalorisation du plafond micro-BIC à 83 600 €, prélèvements sociaux à 18,6 %, réforme de la plus-value, nouveau dispositif Jeanbrun en location nue, et durcissement des règles pour les meublés touristiques.",
    date: "Mis à jour en août 2026",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/"><Logo variant="light" /></Link>
            <div className="pl-5" style={{ borderLeft: "1px solid rgba(245,240,232,0.15)" }}>
              <div className="text-base font-light leading-tight" style={{ color: "#F5F0E8" }}>Articles</div>
              <div className="text-[11px] leading-tight mt-0.5" style={{ color: "rgba(245,240,232,0.45)" }}>Guides et actualités fiscales</div>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80 transition-opacity">LMNP</Link>
            <Link href="/blog" style={{ color: "#C95B2A" }}>Articles</Link>
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

      <div className="py-8 px-4 text-center" style={{ borderBottom: "1px solid rgba(26,22,18,0.07)" }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="font-light mb-2" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
            Articles
          </h1>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            Guides pratiques et analyses fiscales sur le statut LMNP.
          </p>
        </div>
      </div>

      <BlogTabs articlesLmnp={articlesLmnp} articlesActualite={articlesActualite} />

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <nav className="hidden md:flex flex-col items-center gap-2 text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/comment-ca-marche" className="hover:opacity-80">LMNP</Link>
              <Link href="/blog" className="hover:opacity-80">Articles</Link>
              <Link href="/tarifs" className="hover:opacity-80">Abonnements</Link>
              <Link href="/contact" className="hover:opacity-80">Contact</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4" style={{ color: "rgba(26,22,18,0.3)" }}>
              <Link href="/legal#mentions" className="hover:opacity-80">Mentions légales</Link>
              <Link href="/legal#confidentialite" className="hover:opacity-80">Confidentialité</Link>
              <Link href="/legal#cgv" className="hover:opacity-80">CGV</Link>
            </div>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

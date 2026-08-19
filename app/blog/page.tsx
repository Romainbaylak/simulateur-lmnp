import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";

export const metadata: Metadata = {
  title: "Articles LMNP – Conseils investissement immobilier meublé",
  description: "Articles et guides sur le statut LMNP, la fiscalité, l'amortissement et l'investissement immobilier locatif meublé.",
};

const articles = [
  {
    slug: "revente-lmnp-plus-value",
    titre: "Revente d'un bien LMNP : comment est calculée la plus-value ?",
    extrait: "Depuis le 15 février 2025, les amortissements LMNP admis en déduction viennent réduire le prix d'acquisition retenu pour le calcul de la plus-value. Comprendre ce mécanisme est indispensable pour anticiper la fiscalité à la revente.",
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

      {/* Intro */}
      <div className="py-10 px-4 text-center" style={{ borderBottom: "1px solid rgba(26,22,18,0.07)" }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="font-light mb-3" style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
            Articles
          </h1>
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.45)" }}>
            Guides pratiques et analyses fiscales sur le statut LMNP.
          </p>
        </div>
      </div>

      {/* Layout 1/3 + 2/3 */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex gap-12 items-start">

          {/* Colonne gauche — liste des titres */}
          <div className="hidden md:block w-1/3 flex-shrink-0 sticky top-28">
            <p className="text-[10px] uppercase tracking-[0.14em] font-medium mb-4" style={{ color: "rgba(26,22,18,0.35)" }}>
              Tous les articles
            </p>
            <ul className="space-y-1">
              {articles.map(a => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="block text-sm py-2.5 pr-3 transition-colors leading-snug"
                    style={{ color: "#1A1612", borderLeft: "2px solid #C95B2A", paddingLeft: "12px" }}
                  >
                    {a.titre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne droite — cartes articles */}
          <div className="flex-1 space-y-6">
            {articles.map(a => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="block group transition-all"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="rounded-2xl p-8 transition-all"
                  style={{
                    background: "#EDE7DC",
                    border: "0.5px solid rgba(26,22,18,0.1)",
                    boxShadow: "0 2px 16px rgba(26,22,18,0.05)",
                  }}
                >
                  {/* Date */}
                  <div className="text-[11px] uppercase tracking-[0.12em] mb-4 font-medium" style={{ color: "rgba(26,22,18,0.35)" }}>
                    {a.date}
                  </div>

                  {/* Titre */}
                  <h2
                    className="font-light mb-4 leading-snug group-hover:opacity-80 transition-opacity"
                    style={{ fontSize: "clamp(1.2rem,2.5vw,1.55rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}
                  >
                    {a.titre}
                  </h2>

                  {/* Séparateur */}
                  <div className="mb-4" style={{ borderTop: "0.5px solid rgba(26,22,18,0.1)" }} />

                  {/* Extrait */}
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(26,22,18,0.6)" }}>
                    {a.extrait}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#C95B2A" }}>
                    Lire l&apos;article
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>

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

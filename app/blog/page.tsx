import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog LMNP – Conseils investissement immobilier meublé",
  description: "Articles et guides sur le statut LMNP, la fiscalité, l'amortissement et l'investissement immobilier locatif meublé.",
};

const articles = [
  {
    slug: "reforme-micro-bic-2025",
    titre: "Réforme micro-BIC 2025 : ce qui change pour les LMNP",
    extrait: "L'abattement micro-BIC passe de 50 % à 30 % au 1er janvier 2025. Découvrez comment cela impacte votre rentabilité et pourquoi le régime réel devient incontournable.",
    date: "15 janvier 2025",
    tag: "Fiscalité",
  },
  {
    slug: "amortissement-lmnp-explique",
    titre: "L'amortissement LMNP expliqué simplement",
    extrait: "Comment déduire l'usure de votre bien immobilier et meubler sans payer d'impôt pendant 10 à 15 ans ? Tout comprendre en 5 minutes.",
    date: "8 janvier 2025",
    tag: "Guide",
  },
  {
    slug: "regime-reel-vs-micro-bic",
    titre: "Régime réel vs Micro-BIC : quel est le meilleur choix en 2026 ?",
    extrait: "Comparatif chiffré des deux régimes fiscaux LMNP avec des exemples concrets sur des biens de 150 000 € à 400 000 €.",
    date: "2 janvier 2025",
    tag: "Comparatif",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12" }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: "rgba(245,240,232,0.55)" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#F5F0E8] transition-colors">LMNP</Link>
            <Link href="/blog" style={{ color: "#C95B2A" }}>Blog</Link>
            <Link href="/tarifs" className="hover:text-[#F5F0E8] transition-colors">Tarifs</Link>
          </nav>
          <a href="/#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Simuler
          </a>
        </div>
      </header>

      <div style={{ backgroundColor: "#4E1F12" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/#simulateur" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md mb-6 transition-opacity hover:opacity-80" style={{ background: "rgba(201,91,42,0.25)", color: "#F5F0E8", border: "1px solid rgba(201,91,42,0.4)" }}>← Retour à la simulation</Link>
          <h1 className="font-light mb-3" style={{ fontSize: "2.5rem", color: "#F5F0E8", letterSpacing: "-0.025em" }}>
            Blog LMNP
          </h1>
          <p style={{ color: "rgba(245,240,232,0.5)" }}>
            Guides, actualités fiscales et conseils pour optimiser votre investissement locatif meublé.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid gap-4">
          {articles.map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`}
              className="block rounded-xl p-6 transition-opacity hover:opacity-[0.88] group"
              style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block text-[10px] uppercase tracking-[0.12em] font-medium px-2.5 py-0.5 rounded mb-3"
                    style={{ background: "rgba(201,91,42,0.12)", color: "#C95B2A" }}>
                    {a.tag}
                  </span>
                  <h2 className="font-medium text-[#1A1612] mb-2 text-lg leading-snug">{a.titre}</h2>
                  <p className="text-sm" style={{ color: "rgba(26,22,18,0.6)", lineHeight: 1.65 }}>{a.extrait}</p>
                  <div className="text-xs mt-3" style={{ color: "rgba(26,22,18,0.35)" }}>{a.date}</div>
                </div>
                <div className="text-xl mt-1 transition-colors" style={{ color: "rgba(26,22,18,0.25)" }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

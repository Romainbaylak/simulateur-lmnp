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
    extrait: "L'abattement micro-BIC passe de 50% à 30% au 1er janvier 2025. Découvrez comment cela impacte votre rentabilité et pourquoi le régime réel devient incontournable.",
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
    titre: "Régime réel vs Micro-BIC : quel est le meilleur choix en 2025 ?",
    extrait: "Comparatif chiffré des deux régimes fiscaux LMNP avec des exemples concrets sur des biens de 150 000€ à 400 000€.",
    date: "2 janvier 2025",
    tag: "Comparatif",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-[#1B2B4B] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[#1D9E75] text-sm hover:underline mb-4 inline-block">← Retour à l&apos;accueil</Link>
          <h1 className="text-4xl font-bold text-white mb-3">Blog LMNP</h1>
          <p className="text-white/60">Guides, actualités fiscales et conseils pour optimiser votre investissement locatif meublé.</p>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid gap-6">
          {articles.map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block text-xs font-semibold bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-1 rounded-full mb-3">{a.tag}</span>
                  <h2 className="text-xl font-bold text-[#1B2B4B] mb-2 group-hover:text-[#1D9E75] transition-colors">{a.titre}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{a.extrait}</p>
                  <div className="text-xs text-gray-400 mt-3">{a.date}</div>
                </div>
                <div className="text-gray-300 group-hover:text-[#1D9E75] transition-colors text-2xl mt-1">→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

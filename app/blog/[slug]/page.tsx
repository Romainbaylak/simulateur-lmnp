import Link from "next/link";
import { notFound } from "next/navigation";

const articles: Record<string, { titre: string; contenu: string; date: string; tag: string }> = {
  "reforme-micro-bic-2025": {
    titre: "Réforme micro-BIC 2025 : ce qui change pour les LMNP",
    date: "15 janvier 2025",
    tag: "Fiscalité",
    contenu: `
## L'abattement micro-BIC passe à 30%

Depuis le 1er janvier 2025, les loueurs en meublé non professionnels (LMNP) optant pour le régime micro-BIC ne bénéficient plus que d'un abattement de **30%** sur leurs revenus locatifs bruts, contre 50% auparavant.

### Ce que cela signifie concrètement

Pour un bien générant **12 000€ de loyers par an** :

- **Avant 2025** : base imposable = 12 000 × 50% = **6 000€**
- **Après 2025** : base imposable = 12 000 × 70% = **8 400€**

Soit **2 400€ supplémentaires** imposés, qui peuvent représenter plusieurs centaines d'euros d'impôt selon votre TMI.

### Pourquoi le régime réel devient incontournable

Avec le régime réel simplifié, vous déduisez :
- Les **intérêts d'emprunt**
- La **taxe foncière**
- Les **charges de copropriété**
- L'**amortissement** du bien (bâti + mobilier)

Dans la plupart des cas, ces déductions réduisent la base imposable à **0€** pendant 10 à 15 ans. C'est un avantage considérable que le micro-BIC ne peut plus rivaliser.

### Notre recommandation

Utilisez notre simulateur pour comparer les deux régimes avec vos chiffres exacts. La différence est souvent significative.
    `,
  },
  "amortissement-lmnp-explique": {
    titre: "L'amortissement LMNP expliqué simplement",
    date: "8 janvier 2025",
    tag: "Guide",
    contenu: `
## Qu'est-ce que l'amortissement en LMNP ?

En régime réel LMNP, vous pouvez déduire chaque année la **perte de valeur** de votre bien immobilier et de son mobilier. C'est ce qu'on appelle l'amortissement comptable.

### Comment ça marche ?

Le fisc reconnaît que votre bien se déprécie dans le temps. Il vous autorise à déduire cette dépréciation chaque année de vos revenus locatifs.

**Pour le bâti (les murs) :**
- Base : 85% du prix d'achat (le terrain n'est pas amortissable)
- Durée : 30 ans
- Amortissement annuel = prix × 85% / 30

**Pour le mobilier :**
- Base : 15% du prix d'achat (estimation des meubles)
- Durée : 7 ans
- Amortissement annuel = prix × 15% / 7

### Exemple concret

Pour un bien acheté **200 000€** :
- Amortissement bâti : 200 000 × 85% / 30 = **5 667€/an**
- Amortissement mobilier : 200 000 × 15% / 7 = **4 286€/an**
- **Total : 9 952€/an** déductibles

Si vos loyers annuels sont de 10 000€ et vos charges de 3 000€, votre base imposable tombe à : 10 000 - 3 000 - 9 952 = **0€** (avec report possible).

### La règle d'or

Les amortissements non utilisés une année peuvent être **reportés** sur les années suivantes (dans la limite de la durée d'amortissement). Vous ne perdez jamais ces déductions.
    `,
  },
  "regime-reel-vs-micro-bic": {
    titre: "Régime réel vs Micro-BIC : quel est le meilleur choix en 2025 ?",
    date: "2 janvier 2025",
    tag: "Comparatif",
    contenu: `
## Comparatif 2025 : Régime réel vs Micro-BIC

Avec la réforme fiscale de janvier 2025, le choix entre les deux régimes est plus tranché que jamais.

### Le micro-BIC en 2025

- **Abattement** : 30% (contre 50% avant 2025)
- **Simplicité** : pas de comptabilité complexe
- **Limite** : plafond de 77 700€ de recettes
- **Idéal pour** : petits investissements avec peu de charges et sans crédit

### Le régime réel simplifié

- **Déductions** : toutes les charges réelles + amortissements
- **Complexité** : nécessite un expert-comptable (coût ~300-800€/an)
- **Avantage** : impôt souvent nul pendant 10-15 ans
- **Idéal pour** : tout investissement avec crédit immobilier

### Tableau comparatif — Bien à 250 000€, loyer 1 000€/mois, TMI 30%

| | Micro-BIC | Régime réel |
|---|---|---|
| Loyers annuels | 12 000€ | 12 000€ |
| Abattement/déductions | -3 600€ | -11 000€ |
| Base imposable | 8 400€ | 1 000€ |
| Impôt estimé | ~3 990€ | ~474€ |
| Économie | — | **3 516€/an** |

### Conclusion

Dès que vous avez un crédit immobilier et que vous êtes dans une tranche d'imposition ≥ 11%, le régime réel est quasiment toujours plus avantageux. Utilisez notre simulateur pour calculer votre situation précise.
    `,
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map(slug => ({ slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-[#1B2B4B] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-[#1D9E75] text-sm hover:underline mb-4 inline-block">← Retour au blog</Link>
          <span className="inline-block text-xs font-semibold bg-[#1D9E75]/20 text-[#1D9E75] px-3 py-1 rounded-full mb-4">{article.tag}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{article.titre}</h1>
          <div className="text-white/50 text-sm">{article.date}</div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {article.contenu.split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-[#1B2B4B] mt-8 mb-4">{line.slice(3)}</h2>;
            if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-bold text-[#1B2B4B] mt-6 mb-3">{line.slice(4)}</h3>;
            if (line.startsWith("- ")) return <li key={i} className="ml-4 mb-1 text-gray-600">{line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, m) => m)}</li>;
            if (line.startsWith("|")) return null;
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="mb-4 text-gray-600">
                {line.split(/\*\*(.*?)\*\*/).map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className="text-[#1B2B4B] font-semibold">{part}</strong> : part
                )}
              </p>
            );
          })}
        </div>
        <div className="mt-12 bg-[#1B2B4B] rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-xl mb-3">Calculez votre situation personnelle</h3>
          <p className="text-white/60 text-sm mb-5">Utilisez notre simulateur gratuit pour obtenir une analyse précise de votre investissement LMNP.</p>
          <Link href="/#simulateur" className="bg-[#1D9E75] hover:bg-[#178a64] text-white font-semibold px-6 py-3 rounded-xl inline-block transition-colors">
            Lancer le simulateur →
          </Link>
        </div>
      </div>
    </main>
  );
}

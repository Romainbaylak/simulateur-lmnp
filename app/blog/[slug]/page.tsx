import Logo from "@/components/Logo";
import Link from "next/link";
import { notFound } from "next/navigation";

const articles: Record<string, { titre: string; contenu: string; date: string; tag: string }> = {
  "reforme-micro-bic-2025": {
    titre: "Réforme micro-BIC 2025 : ce qui change pour les LMNP",
    date: "15 janvier 2025",
    tag: "Fiscalité",
    contenu: `## L'abattement micro-BIC passe à 30 %

Depuis le 1er janvier 2025, les loueurs en meublé non professionnels (LMNP) optant pour le régime micro-BIC ne bénéficient plus que d'un abattement de **30 %** sur leurs revenus locatifs bruts, contre 50 % auparavant.

### Ce que cela signifie concrètement

Pour un bien générant **12 000 € de loyers par an** :

- **Avant 2025** : base imposable = 12 000 × 50 % = **6 000 €**
- **Après 2025** : base imposable = 12 000 × 70 % = **8 400 €**

Soit **2 400 € supplémentaires** imposés, représentant plusieurs centaines d'euros d'impôt selon votre TMI.

### Pourquoi le régime réel devient incontournable

Avec le régime réel simplifié, vous déduisez :
- Les **intérêts d'emprunt**
- La **taxe foncière**
- Les **charges de copropriété**
- L'**amortissement** du bien (bâti + mobilier)

Dans la plupart des cas, la base imposable tombe à **0 €** pendant 10 à 15 ans.`,
  },
  "amortissement-lmnp-explique": {
    titre: "L'amortissement LMNP expliqué simplement",
    date: "8 janvier 2025",
    tag: "Guide",
    contenu: `## Qu'est-ce que l'amortissement en LMNP ?

En régime réel LMNP, vous pouvez déduire chaque année la **perte de valeur** de votre bien immobilier et de son mobilier.

### Pour le bâti (les murs)

- Base : 85 % du prix d'achat (le terrain n'est pas amortissable)
- Durée : 30 ans

### Pour le mobilier

- Base : 15 % du prix d'achat
- Durée : 7 ans

### Exemple concret

Pour un bien acheté **200 000 €** :
- Bâti : 200 000 × 85 % / 30 = **5 667 €/an**
- Mobilier : 200 000 × 15 % / 7 = **4 286 €/an**
- **Total : 9 952 €/an** déductibles

### La règle d'or

Les amortissements non utilisés une année peuvent être **reportés** sur les années suivantes. Vous ne perdez jamais ces déductions.`,
  },
  "regime-reel-vs-micro-bic": {
    titre: "Régime réel vs Micro-BIC : quel est le meilleur choix en 2026 ?",
    date: "2 janvier 2025",
    tag: "Comparatif",
    contenu: `## Comparatif 2026 : Régime réel vs Micro-BIC

Avec la réforme fiscale de janvier 2025, le choix entre les deux régimes est plus tranché que jamais.

### Le micro-BIC en 2025

- **Abattement** : 30 % (contre 50 % avant 2025)
- **Simplicité** : pas de comptabilité complexe
- **Idéal pour** : petits investissements sans crédit

### Le régime réel simplifié

- **Déductions** : toutes les charges réelles + amortissements
- **Avantage** : impôt souvent nul pendant 10–15 ans
- **Idéal pour** : tout investissement avec crédit immobilier

### Conclusion

Dès que vous avez un crédit immobilier et une TMI ≥ 11 %, le régime réel est quasiment toujours plus avantageux.`,
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
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <a href="/#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Simuler maintenant
          </a>
        </div>
      </header>

      <div style={{ backgroundColor: "#4E1F12" }} className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md mb-4 transition-opacity hover:opacity-80" style={{ background: "rgba(201,91,42,0.25)", color: "#F5F0E8", border: "1px solid rgba(201,91,42,0.4)" }}>
            ← Retour au blog
          </Link>
          <span className="inline-block text-[10px] uppercase tracking-[0.12em] font-medium px-2.5 py-0.5 rounded mb-4"
            style={{ background: "rgba(201,91,42,0.2)", color: "#C95B2A" }}>
            {article.tag}
          </span>
          <h1 className="font-bold mb-3"
            style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", color: "#C95B2A", letterSpacing: "-0.025em" }}>
            {article.titre}
          </h1>
          <div className="text-sm" style={{ color: "rgba(245,240,232,0.4)" }}>{article.date}</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div>
          {article.contenu.split("\n").map((line, i) => {
            if (line.startsWith("## "))
              return <h2 key={i} className="font-light mt-10 mb-4"
                style={{ fontSize: "1.5rem", color: "#1A1612", letterSpacing: "-0.02em" }}>{line.slice(3)}</h2>;
            if (line.startsWith("### "))
              return <h3 key={i} className="font-medium mt-6 mb-3"
                style={{ fontSize: "1.05rem", color: "#1A1612" }}>{line.slice(4)}</h3>;
            if (line.startsWith("- "))
              return <li key={i} className="ml-4 mb-1 text-sm"
                style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.7 }}>
                {line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, m) => m)}
              </li>;
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="mb-4 text-sm" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>
                {line.split(/\*\*(.*?)\*\*/).map((part, j) =>
                  j % 2 === 1
                    ? <strong key={j} style={{ color: "#1A1612", fontWeight: 500 }}>{part}</strong>
                    : part
                )}
              </p>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl p-6 text-center" style={{ background: "#1A1612" }}>
          <h3 className="font-light text-xl mb-3" style={{ color: "#F5F0E8", letterSpacing: "-0.02em" }}>
            Calculez votre situation personnelle
          </h3>
          <p className="text-sm mb-5" style={{ color: "rgba(245,240,232,0.5)" }}>
            Simulateur gratuit, résultats instantanés.
          </p>
          <Link href="/#simulateur"
            className="inline-block font-medium px-6 py-3 transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Lancer le simulateur →
          </Link>
        </div>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

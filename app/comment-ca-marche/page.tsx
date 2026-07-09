import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tout savoir sur le LMNP – Guide complet 2026",
  description: "Comprendre le statut LMNP : conditions, amortissement par composants, régime réel vs micro-BIC, calcul fiscal, revente. Guide mis à jour 2026.",
};

const SectionTitle = ({ num, children }: { num: number; children: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-6">
    <span className="font-light flex-shrink-0 leading-none" style={{ fontSize: "3rem", color: "#C95B2A", letterSpacing: "-0.04em", lineHeight: 1 }}>{num}</span>
    <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background: "rgba(201,91,42,0.3)" }} />
    <h2 className="font-light" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#4E1F12" }}>
      {children}
    </h2>
  </div>
);

export default function GrandesLignesPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="hidden md:flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" style={{ color: "#C95B2A" }}>LMNP</Link>
            <Link href="/blog" className="hover:text-[#F5F0E8] transition-colors">Articles</Link>
            <Link href="/tarifs" className="hover:text-[#F5F0E8] transition-colors">Tarifs</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-80"
              style={{ color: "#F5F0E8", border: "1px solid rgba(245,240,232,0.3)", borderRadius: 6 }}>
              Log in
            </Link>
            <a href="/#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
              Simuler maintenant
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="py-12 px-4" style={{ borderBottom: "1px solid rgba(26,22,18,0.07)" }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/#simulateur"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md mb-6 transition-opacity hover:opacity-80"
            style={{ background: "rgba(201,91,42,0.08)", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.2)" }}>
            ← Retour à la simulation
          </Link>
          <h1 className="font-light mb-4"
            style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
            Tout savoir sur le LMNP
          </h1>
          <p style={{ color: "rgba(26,22,18,0.5)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Conditions, amortissement, régimes fiscaux, revente — tout ce qu&apos;il faut savoir avant d&apos;investir en meublé.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">

        {/* 1 — Qu'est-ce que le LMNP */}
        <section>
          <SectionTitle num={1}>Qu&apos;est-ce que le LMNP ?</SectionTitle>
          <p style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            Le statut de <strong style={{ color: "#1A1612" }}>Loueur Meublé Non Professionnel</strong> permet à un particulier de louer un logement meublé tout en bénéficiant d&apos;une fiscalité avantageuse. Deux conditions suffisent pour en bénéficier : vos revenus locatifs annuels ne dépassent pas <strong style={{ color: "#1A1612" }}>23 000 €</strong>, ou ils représentent moins de la moitié de vos revenus globaux. Si l&apos;une de ces deux conditions est remplie, vous êtes LMNP.
          </p>
        </section>

        {/* 2 — Micro-BIC ou réel */}
        <section>
          <SectionTitle num={2}>Micro-BIC ou régime réel : lequel choisir ?</SectionTitle>
          <p className="mb-6" style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            En LMNP, deux régimes fiscaux coexistent.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl p-6" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
              <h3 className="font-semibold text-base mb-3" style={{ color: "#1A1612" }}>Micro-BIC</h3>
              <p className="text-sm mb-4" style={{ color: "rgba(26,22,18,0.65)", lineHeight: 1.75 }}>
                Le régime par défaut. Il applique un abattement forfaitaire de <strong style={{ color: "#1A1612" }}>30 %</strong> sur vos loyers — vous êtes imposé sur 70 % de vos revenus locatifs, sans pouvoir déduire vos vraies charges. Simple, mais souvent moins avantageux.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "rgba(26,22,18,0.6)" }}>
                <li>✓ Aucune comptabilité</li>
                <li>✓ Abattement forfaitaire 30 %</li>
                <li style={{ color: "#B03A2A" }}>✗ Pas d&apos;amortissement déductible</li>
                <li style={{ color: "#B03A2A" }}>✗ Plafonné à 77 700 € de recettes</li>
              </ul>
            </div>
            <div className="rounded-xl p-6" style={{ background: "rgba(201,91,42,0.06)", border: "1px solid rgba(201,91,42,0.2)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base" style={{ color: "#1A1612" }}>Régime réel simplifié</h3>
                <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded"
                  style={{ background: "#C95B2A", color: "#F5F0E8" }}>Recommandé</span>
              </div>
              <p className="text-sm mb-4" style={{ color: "rgba(26,22,18,0.65)", lineHeight: 1.75 }}>
                Le choix de la quasi-totalité des investisseurs actifs. Il permet de déduire toutes les charges réellement payées et, surtout, d&apos;amortir le bien. C&apos;est ce mécanisme qui fait du LMNP l&apos;un des statuts les plus efficaces fiscalement.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "rgba(26,22,18,0.6)" }}>
                <li>✓ Toutes les charges déductibles</li>
                <li>✓ <strong style={{ color: "#1A1612" }}>Amortissement du bien et du mobilier</strong></li>
                <li>✓ Souvent 0 € d&apos;impôt pendant 15–20 ans</li>
                <li style={{ color: "rgba(26,22,18,0.45)" }}>~ Expert-comptable recommandé (~300–800 €/an)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3 — L'amortissement */}
        <section>
          <SectionTitle num={3}>L&apos;amortissement : le cœur du dispositif</SectionTitle>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            En LMNP au réel, vous pouvez comptabiliser chaque année la perte de valeur de votre bien et la déduire de vos revenus locatifs. C&apos;est ce qu&apos;on appelle l&apos;amortissement — et c&apos;est ce qui permet à la grande majorité des investisseurs de ne payer aucun impôt pendant <strong style={{ color: "#1A1612" }}>15 à 20 ans</strong>.
          </p>
          <div className="space-y-3 mb-6">
            {[
              {
                title: "Le bien immobilier",
                desc: "Hors terrain, qui n'est jamais amortissable. Réparti par composants selon leur durée de vie — gros œuvre sur 75 ans, toiture sur 25 ans, aménagements intérieurs sur 12 ans, électricité sur 30 ans.",
              },
              {
                title: "Le mobilier",
                desc: "Amorti en moyenne sur 5 ans pour l'électroménager, 6 ans pour la literie, 10 ans pour les meubles.",
              },
              {
                title: "Les travaux",
                desc: "Selon leur nature, de 12 ans pour la peinture à 30 ans pour les gros travaux structurels.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4 rounded-xl p-5" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#C95B2A" }} />
                <div>
                  <div className="font-medium text-sm mb-1" style={{ color: "#1A1612" }}>{title}</div>
                  <p className="text-sm" style={{ color: "rgba(26,22,18,0.65)", lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-5" style={{ background: "rgba(201,91,42,0.07)", border: "1px solid rgba(201,91,42,0.18)" }}>
            <div className="font-semibold text-sm mb-2" style={{ color: "#C95B2A" }}>Règle essentielle</div>
            <p className="text-sm" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>
              L&apos;amortissement ne peut pas créer de déficit. Il réduit le résultat imposable jusqu&apos;à zéro, mais jamais en dessous. L&apos;excédent non utilisé est <strong style={{ color: "#1A1612" }}>reporté sans limite de durée</strong> sur les années suivantes.
            </p>
          </div>
        </section>

        {/* 4 — Ce que vous pouvez déduire */}
        <section>
          <SectionTitle num={4}>Ce que vous pouvez déduire au réel</SectionTitle>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            Au régime réel, toutes les charges liées à votre activité viennent réduire votre base imposable :
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Intérêts d'emprunt",
              "Taxe foncière",
              "Charges de copropriété",
              "Frais de gestion et d'agence",
              "Assurance propriétaire non-occupant (PNO)",
              "Honoraires du comptable",
              "Travaux d'entretien et de réparation",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 rounded-lg px-4 py-3"
                style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.07)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#C95B2A" }} />
                <span className="text-sm" style={{ color: "rgba(26,22,18,0.72)" }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5 — Amortissement par composants */}
        <section>
          <SectionTitle num={5}>L&apos;amortissement par composants</SectionTitle>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            Le bien immobilier ne s&apos;amortit pas d&apos;un seul bloc. L&apos;administration fiscale impose de le décomposer en éléments distincts, chacun ayant sa propre durée de vie. On répartit la valeur du bâti (hors terrain, jamais amortissable) entre plusieurs postes, puis on amortit chaque poste de façon linéaire sur sa durée propre. On additionne ensuite les montants pour obtenir la charge annuelle totale déductible.
          </p>

          {/* Tableau composants */}
          <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid rgba(78,31,18,0.15)" }}>
            <div className="px-5 py-3" style={{ background: "#4E1F12" }}>
              <div className="font-semibold text-sm" style={{ color: "#C95B2A" }}>Durées d&apos;amortissement par composant</div>
            </div>
            <div>
              {[
                { composant: "Gros œuvre / Bâti", duree: "75 ans", note: "" },
                { composant: "Toiture", duree: "25 ans", note: "" },
                { composant: "Aménagements intérieurs", duree: "12 ans", note: "" },
                { composant: "Installation électrique", duree: "30 ans", note: "" },
                { composant: "Étanchéité", duree: "25 ans", note: "" },
                { composant: "Terrain", duree: "Non amortissable", note: "jamais déductible" },
              ].map(({ composant, duree, note }, i) => (
                <div key={composant}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    background: i % 2 === 0 ? "#EDE7DC" : "#F5F0E8",
                    borderBottom: i < 5 ? "0.5px solid rgba(26,22,18,0.06)" : "none",
                  }}>
                  <span className="text-sm font-medium" style={{ color: "#1A1612" }}>{composant}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold"
                      style={{ color: duree === "Non amortissable" ? "#B03A2A" : "#C95B2A" }}>
                      {duree}
                    </span>
                    {note && <div className="text-[10px] mt-0.5" style={{ color: "rgba(26,22,18,0.4)" }}>{note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mb-4" style={{ color: "rgba(26,22,18,0.65)", lineHeight: 1.8, fontSize: "0.9rem" }}>
            La ventilation exacte dépend des caractéristiques de votre bien. Un bien neuf n&apos;a pas le même profil qu&apos;un appartement haussmannien. C&apos;est pourquoi un <strong style={{ color: "#1A1612" }}>comptable spécialisé LMNP</strong> est vivement recommandé — il calibre ces pourcentages selon la réalité du bien et les fourchettes admises par l&apos;administration.
          </p>
          <div className="rounded-lg p-4 text-sm" style={{ background: "rgba(201,91,42,0.06)", border: "0.5px solid rgba(201,91,42,0.15)", color: "rgba(26,22,18,0.65)", lineHeight: 1.7 }}>
            <strong style={{ color: "#1A1612" }}>Peut-on simplifier ?</strong> Oui. Une méthode globale qui amortit l&apos;ensemble du bâti sur 25 ou 30 ans sans découpage est tolérée, notamment pour les petits dossiers. C&apos;est plus simple comptablement, mais parfois moins avantageux.
          </div>
        </section>

        {/* 6 — Le résultat fiscal */}
        <section>
          <SectionTitle num={6}>Le résultat fiscal : comment il se calcule</SectionTitle>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            Le calcul suit toujours le même ordre :
          </p>
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid rgba(78,31,18,0.15)" }}>
            <div className="px-5 py-2.5" style={{ background: "#4E1F12" }}>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(245,240,232,0.5)" }}>Formule de calcul</span>
            </div>
            <div className="px-6 py-5 space-y-2" style={{ background: "#EDE7DC", fontFamily: "monospace" }}>
              {[
                { label: "Loyers perçus", op: null, color: "#1A1612" },
                { label: "Charges déductibles (dont intérêts d'emprunt)", op: "−", color: "rgba(26,22,18,0.65)" },
                { label: "Amortissements (dans la limite du résultat)", op: "−", color: "rgba(26,22,18,0.65)" },
                { label: "Base imposable", op: "=", color: "#C95B2A", bold: true },
                { label: "× (TMI + 18,6 % de prélèvements sociaux)", op: null, color: "rgba(26,22,18,0.55)", small: true },
                { label: "Impôt dû", op: "=", color: "#4E1F12", bold: true },
              ].map(({ label, op, color, bold, small }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <span className="w-4 text-right flex-shrink-0 font-bold" style={{ color: "#C95B2A", fontSize: "1rem" }}>{op ?? ""}</span>
                  <span style={{ color, fontWeight: bold ? 700 : 400, fontSize: small ? "0.8rem" : "0.9rem" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ background: "rgba(201,91,42,0.07)", border: "1px solid rgba(201,91,42,0.18)" }}>
            <p className="text-sm" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>
              Grâce à l&apos;amortissement, la base imposable est souvent nulle. <strong style={{ color: "#1A1612" }}>L&apos;impôt également.</strong>
            </p>
          </div>
        </section>

        {/* 7 — À la revente */}
        <section>
          <SectionTitle num={7}>À la revente : attention à la réintégration</SectionTitle>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
            Depuis février 2025, les amortissements déduits pendant la détention sont réintégrés dans le calcul de la plus-value à la revente. Concrètement : plus vous avez amorti, plus la base imposable de votre plus-value augmente lors de la vente.
          </p>
          <div className="rounded-xl p-5 mb-5" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
            <div className="font-medium text-sm mb-3" style={{ color: "#1A1612" }}>Exemple concret</div>
            <div className="space-y-2 text-sm" style={{ color: "rgba(26,22,18,0.65)", lineHeight: 1.7 }}>
              <p>Bien acheté <strong style={{ color: "#1A1612" }}>200 000 €</strong>, revendu <strong style={{ color: "#1A1612" }}>250 000 €</strong> après 20 000 € d&apos;amortissements cumulés.</p>
              <p>La plus-value imposable n&apos;est pas <strong>50 000 €</strong> mais <strong style={{ color: "#B03A2A" }}>70 000 €</strong>.</p>
            </div>
          </div>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.65)", lineHeight: 1.8, fontSize: "0.9rem" }}>
            Les abattements pour durée de détention s&apos;appliquent néanmoins : l&apos;exonération totale d&apos;impôt sur la plus-value intervient après <strong style={{ color: "#1A1612" }}>22 ans</strong> de détention, et après <strong style={{ color: "#1A1612" }}>30 ans</strong> pour les prélèvements sociaux. Conclusion : le LMNP reste très avantageux à long terme, à condition de conserver le bien suffisamment longtemps.
          </p>
          <Link href="/blog/revente-lmnp-plus-value"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "#C95B2A" }}>
            Lire l&apos;article complet sur la revente LMNP →
          </Link>
        </section>

        {/* 8 — LMNP ou LMP */}
        <section>
          <SectionTitle num={8}>LMNP ou LMP ?</SectionTitle>
          <div className="rounded-xl p-6" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
            <p style={{ color: "rgba(26,22,18,0.72)", lineHeight: 1.8 }}>
              Le basculement vers le statut de <strong style={{ color: "#1A1612" }}>Loueur Meublé Professionnel</strong> intervient lorsque deux conditions sont remplies simultanément : vos recettes locatives dépassent <strong style={{ color: "#1A1612" }}>23 000 € par an</strong> ET représentent plus de 50 % de vos revenus d&apos;activité. Le LMP ouvre des droits sociaux supplémentaires mais soumet à des cotisations plus élevées. Un sujet à part entière, traité dans un article dédié.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl p-8 text-center" style={{ background: "#4E1F12" }}>
          <h3 className="font-light text-2xl mb-3" style={{ color: "#F5F0E8", letterSpacing: "-0.025em" }}>
            Prêt à calculer votre rentabilité ?
          </h3>
          <p className="mb-6" style={{ color: "rgba(245,240,232,0.5)" }}>
            Notre simulateur est gratuit et donne des résultats instantanés.
          </p>
          <a href="/#simulateur"
            className="inline-block font-medium px-8 py-3 rounded transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Lancer le simulateur →
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <nav className="flex gap-6 text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#1A1612] transition-colors">LMNP</Link>
            <Link href="/blog" className="hover:text-[#1A1612] transition-colors">Articles</Link>
            <Link href="/tarifs" className="hover:text-[#1A1612] transition-colors">Tarifs</Link>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>
            © 2026 toutlmnp · Outil indicatif, non un conseil fiscal
          </p>
        </div>
      </footer>
    </main>
  );
}

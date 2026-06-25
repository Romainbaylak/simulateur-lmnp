import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grandes Lignes du LMNP – Guide complet 2026",
  description: "Tout comprendre sur le statut LMNP : conditions, avantages fiscaux, amortissement, régime réel vs micro-BIC. Guide mis à jour 2026.",
};

export default function GrandesLignesPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#1A1612" }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: "rgba(245,240,232,0.55)" }}>
            <Link href="/comment-ca-marche" style={{ color: "#C95B2A" }}>Grandes Lignes du LMNP</Link>
            <Link href="/blog" className="hover:text-[#F5F0E8] transition-colors">Blog</Link>
            <Link href="/tarifs" className="hover:text-[#F5F0E8] transition-colors">Tarifs</Link>
          </nav>
          <a href="/#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Simuler maintenant
          </a>
        </div>
      </header>

      {/* Hero */}
      <div style={{ backgroundColor: "#1A1612" }} className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-sm hover:underline mb-4 inline-block transition-colors"
            style={{ color: "#C95B2A" }}>← Accueil</Link>
          <h1 className="font-light mb-3"
            style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#F5F0E8", letterSpacing: "-0.025em" }}>
            Grandes Lignes du LMNP
          </h1>
          <p style={{ color: "rgba(245,240,232,0.5)", maxWidth: 600 }}>
            Comprendre le statut de Loueur Meublé Non Professionnel et ses avantages fiscaux en 2026.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">

        {/* Qu'est-ce que le LMNP */}
        <section>
          <h2 className="font-light mb-6" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#1A1612" }}>
            Qu&apos;est-ce que le LMNP ?
          </h2>
          <p style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }} className="mb-4">
            Le statut de <strong style={{ color: "#1A1612", fontWeight: 500 }}>Loueur Meublé Non Professionnel (LMNP)</strong> permet à tout particulier de louer un bien immobilier équipé et de bénéficier d&apos;un régime fiscal avantageux.
          </p>
          <p style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>
            Pour être éligible, vos revenus locatifs doivent être{" "}
            <strong style={{ color: "#1A1612", fontWeight: 500 }}>inférieurs à 23 000 €/an</strong>{" "}
            OU représenter moins de 50 % de vos revenus globaux. Au-delà, vous passez LMP (Loueur Meublé Professionnel).
          </p>
        </section>

        {/* Pourquoi le régime réel — section déplacée depuis la home */}
        <section>
          <h2 className="font-light mb-8" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#1A1612" }}>
            Pourquoi choisir le régime réel LMNP ?
          </h2>
          <p className="mb-6" style={{ color: "rgba(26,22,18,0.6)", lineHeight: 1.75 }}>
            Depuis la réforme 2025, l&apos;avantage est encore plus marqué par rapport au micro-BIC (abattement ramené de 50 % à 30 %).
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: "Amortissement déductible",
                desc: "Déduisez chaque année l'usure de votre bien (bâti 30 ans, mobilier 7 ans). Résultat : souvent 0 € d'impôt pendant 10 à 15 ans.",
              },
              {
                title: "Charges réelles déductibles",
                desc: "Intérêts d'emprunt, taxe foncière, charges de copropriété, frais de gestion… tout se déduit des loyers perçus.",
              },
              {
                title: "Micro-BIC 2025 : −30 % seulement",
                desc: "Depuis janvier 2025, l'abattement micro-BIC est passé de 50 % à 30 %. Le régime réel devient incontournable pour les investisseurs avisés.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl p-5"
                style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
                <h3 className="font-medium text-[#1A1612] mb-3 text-sm">{title}</h3>
                <p className="text-sm" style={{ color: "rgba(26,22,18,0.6)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Les deux régimes */}
        <section>
          <h2 className="font-light mb-6" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#1A1612" }}>
            Les deux régimes fiscaux
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl p-6" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
              <h3 className="font-medium text-[#1A1612] text-lg mb-4">Micro-BIC</h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(26,22,18,0.65)" }}>
                <li>✓ Simple : pas de comptabilité</li>
                <li>✓ Abattement forfaitaire de 30 % (2025)</li>
                <li style={{ color: "#B03A2A" }}>✗ Moins avantageux depuis la réforme 2025</li>
                <li style={{ color: "#B03A2A" }}>✗ Pas d&apos;amortissement déductible</li>
                <li style={{ color: "#B03A2A" }}>✗ Plafonné à 77 700 € de recettes</li>
              </ul>
            </div>
            <div className="rounded-xl p-6"
              style={{ background: "rgba(201,91,42,0.06)", border: "0.5px solid rgba(201,91,42,0.2)" }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-[#1A1612] text-lg">Régime réel simplifié</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ background: "#C95B2A", color: "#F5F0E8" }}>Recommandé</span>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(26,22,18,0.65)" }}>
                <li>✓ Déduction de toutes les charges réelles</li>
                <li>✓ <strong style={{ color: "#1A1612" }}>Amortissement du bien et du mobilier</strong></li>
                <li>✓ Souvent 0 € d&apos;impôt pendant 10–15 ans</li>
                <li style={{ color: "rgba(26,22,18,0.5)" }}>~ Nécessite un expert-comptable (~300–800 €/an)</li>
                <li>✓ Aucun plafond de revenus</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Comment fonctionne l'amortissement */}
        <section>
          <h2 className="font-light mb-6" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#1A1612" }}>
            Comment fonctionne l&apos;amortissement ?
          </h2>
          <p className="mb-5" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.75 }}>
            En régime réel, le fisc reconnaît que votre bien se déprécie dans le temps. Il vous autorise à déduire cette dépréciation de vos revenus locatifs chaque année.
          </p>
          <div className="rounded-xl p-6" style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.08)" }}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: "rgba(26,22,18,0.4)" }}>
                  Bâti (les murs)
                </div>
                <p className="text-sm" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.7 }}>
                  Base : 85 % du prix d&apos;achat (le terrain n&apos;est pas amortissable)<br />
                  Durée : 30 ans<br />
                  Amortissement annuel = prix × 85 % ÷ 30
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: "rgba(26,22,18,0.4)" }}>
                  Mobilier
                </div>
                <p className="text-sm" style={{ color: "rgba(26,22,18,0.7)", lineHeight: 1.7 }}>
                  Base : 15 % du prix d&apos;achat (estimation des meubles)<br />
                  Durée : 7 ans<br />
                  Amortissement annuel = prix × 15 % ÷ 7
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }}>
              <p className="text-sm" style={{ color: "rgba(26,22,18,0.6)", lineHeight: 1.7 }}>
                <strong style={{ color: "#1A1612" }}>Exemple</strong> — Bien à 200 000 € : amortissement bâti 5 667 €/an + mobilier 4 286 €/an = <strong style={{ color: "#C95B2A" }}>9 952 €/an déductibles</strong>. Si vos loyers annuels sont 10 000 € et vos charges 3 000 €, la base imposable tombe à 0 € (avec report possible des amortissements non utilisés).
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl p-8 text-center"
          style={{ background: "#1A1612" }}>
          <h3 className="font-light text-2xl mb-3" style={{ color: "#F5F0E8", letterSpacing: "-0.025em" }}>
            Prêt à calculer votre rentabilité ?
          </h3>
          <p className="mb-6" style={{ color: "rgba(245,240,232,0.5)" }}>
            Notre simulateur est gratuit et donne des résultats instantanés.
          </p>
          <Link href="/#simulateur"
            className="inline-block font-medium px-8 py-3 rounded transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Lancer le simulateur →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <nav className="flex gap-6 text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#1A1612] transition-colors">Grandes Lignes du LMNP</Link>
            <Link href="/blog" className="hover:text-[#1A1612] transition-colors">Blog</Link>
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

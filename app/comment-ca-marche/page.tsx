import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment fonctionne le LMNP ? Guide complet 2025",
  description: "Tout comprendre sur le statut LMNP : conditions, avantages fiscaux, amortissement, régime réel vs micro-BIC. Guide mis à jour avec la réforme 2025.",
};

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-[#1B2B4B] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[#1D9E75] text-sm hover:underline mb-4 inline-block">← Retour à l&apos;accueil</Link>
          <h1 className="text-4xl font-bold text-white mb-4">Le LMNP expliqué simplement</h1>
          <p className="text-white/60 max-w-2xl">Tout ce que vous devez savoir sur le statut de Loueur Meublé Non Professionnel et ses avantages fiscaux en 2025.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-[#1B2B4B] mb-6">Qu&apos;est-ce que le LMNP ?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Le statut de <strong className="text-[#1B2B4B]">Loueur Meublé Non Professionnel (LMNP)</strong> permet à tout particulier de louer un bien immobilier équipé et de bénéficier d&apos;un régime fiscal avantageux.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Pour être éligible, vos revenus locatifs doivent être <strong className="text-[#1B2B4B]">inférieurs à 23 000€/an</strong> OU représenter moins de 50% de vos revenus globaux. Au-delà, vous passez LMP (Loueur Meublé Professionnel).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1B2B4B] mb-6">Les deux régimes fiscaux</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-[#1B2B4B] mb-3">Micro-BIC</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Simple : pas de comptabilité</li>
                <li>✓ Abattement forfaitaire de 30% (2025)</li>
                <li className="text-red-400">✗ Moins avantageux depuis 2025</li>
                <li className="text-red-400">✗ Pas d&apos;amortissement déductible</li>
                <li className="text-red-400">✗ Plafonné à 77 700€ de recettes</li>
              </ul>
            </div>
            <div className="border border-[#1D9E75]/30 bg-[#1D9E75]/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-[#1B2B4B]">Régime réel simplifié</h3>
                <span className="text-xs bg-[#1D9E75] text-white px-2 py-1 rounded-full">Recommandé</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Déduction de toutes les charges réelles</li>
                <li>✓ <strong>Amortissement du bien et du mobilier</strong></li>
                <li>✓ Souvent 0€ d&apos;impôt pendant 10-15 ans</li>
                <li className="text-amber-600">~ Nécessite un expert-comptable</li>
                <li>✓ Aucun plafond de revenus</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1B2B4B] mb-6">Les 3 étapes pour utiliser notre simulateur</h2>
          <div className="space-y-4">
            {[
              { n: "1", t: "Renseignez votre bien", d: "Type (appartement/maison), surface, ville et prix d'achat. Les frais de notaire (7,5%), la taxe foncière et les charges de copro sont calculés automatiquement." },
              { n: "2", t: "Configurez votre financement", d: "Apport personnel, durée du crédit (15/20/25 ans), taux d'intérêt et loyer mensuel envisagé. Nous vous montrons la fourchette de marché pour votre ville." },
              { n: "3", t: "Analysez et optimisez", d: "Rendement brut/net, cash-flow mensuel, comparaison régime réel vs micro-BIC, tableau d'amortissement et loyer cible pour atteindre votre objectif de rendement." },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-5 p-5 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-[#1D9E75] rounded-xl flex items-center justify-center text-white font-bold shrink-0">{n}</div>
                <div>
                  <h3 className="font-bold text-[#1B2B4B] mb-1">{t}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-[#1B2B4B] rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-2xl mb-3">Prêt à calculer votre rentabilité ?</h3>
          <p className="text-white/60 mb-6">Notre simulateur est gratuit et donne des résultats instantanés.</p>
          <Link href="/#simulateur" className="bg-[#1D9E75] hover:bg-[#178a64] text-white font-semibold px-8 py-4 rounded-2xl inline-block transition-colors text-lg">
            Lancer le simulateur →
          </Link>
        </div>
      </div>
    </main>
  );
}

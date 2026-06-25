import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs – LMNPSimulator Gratuit & Premium",
  description: "Simulez votre LMNP gratuitement. Passez Premium pour des simulations illimitées, l'export PDF et le tableau d'amortissement complet.",
};

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="bg-[#1B2B4B] py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[#1D9E75] text-sm hover:underline mb-4 inline-block">← Retour à l&apos;accueil</Link>
          <h1 className="text-4xl font-bold text-white mb-4">Tarifs simples et transparents</h1>
          <p className="text-white/60">Commencez gratuitement. Passez Premium quand vous en avez besoin.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Gratuit */}
          <div className="border border-gray-200 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1B2B4B] mb-2">Gratuit</h2>
              <div className="text-4xl font-extrabold text-[#1B2B4B] mb-1">0€</div>
              <div className="text-gray-400 text-sm">Pour toujours</div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "2 simulations par jour",
                "Tous les calculs LMNP",
                "Comparaison réel vs micro-BIC",
                "Fourchette de loyers par ville",
                "Curseur loyer interactif",
                "Verdict coloré instantané",
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/#simulateur" className="block w-full text-center border border-[#1B2B4B] text-[#1B2B4B] font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Commencer gratuitement
            </Link>
          </div>

          {/* Premium */}
          <div className="border-2 border-[#1D9E75] rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#1D9E75] text-white text-xs font-bold px-4 py-1 rounded-full">POPULAIRE</span>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1B2B4B] mb-2">Premium</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-[#1D9E75]">9€</span>
                <span className="text-gray-400">/mois</span>
              </div>
              <div className="text-gray-400 text-sm">Résiliable à tout moment</div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Simulations illimitées",
                "Tout le plan Gratuit inclus",
                "Export PDF complet",
                "Tableau d'amortissement détaillé",
                "Historique de vos simulations",
                "Support prioritaire",
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-[#1D9E75]/10 rounded-full flex items-center justify-center text-xs text-[#1D9E75]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="block w-full text-center bg-[#1D9E75] text-white font-semibold py-3 rounded-xl hover:bg-[#178a64] transition-colors">
              Bientôt disponible
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Paiement sécurisé via Stripe · Sans engagement</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-[#1B2B4B] mb-4">Des questions ?</h3>
          <p className="text-gray-500 text-sm">
            Le simulateur est et restera gratuit pour les cas d&apos;usage essentiels. Le plan Premium est pour les investisseurs qui analysent plusieurs biens régulièrement.
          </p>
        </div>
      </div>
    </main>
  );
}

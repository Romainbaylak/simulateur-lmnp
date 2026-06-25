import Simulateur from "@/components/Simulateur";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1B2B4B] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#1D9E75] rounded-lg w-8 h-8 flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="text-white font-bold text-lg tracking-tight">LMNP<span className="text-[#1D9E75]">Simulator</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <Link href="/comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/tarifs" className="hover:text-white transition-colors">Tarifs</Link>
          </nav>
          <a href="#simulateur" className="bg-[#1D9E75] hover:bg-[#178a64] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Simuler maintenant
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1B2B4B] text-white pt-20 pb-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #1D9E75 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#1D9E75]/20 border border-[#1D9E75]/30 rounded-full px-4 py-2 text-sm text-[#1D9E75] font-medium mb-8">
            <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
            Réforme fiscale LMNP 2025 intégrée · Micro-BIC 30%
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Votre investissement LMNP
            <br />
            <span className="text-[#1D9E75]">rentable ou pas ?</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Calculez en 2 minutes votre rendement réel, cash-flow et économies d&apos;impôt grâce aux amortissements LMNP — avec la réforme fiscale 2025 prise en compte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#simulateur" className="bg-[#1D9E75] hover:bg-[#178a64] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-[#1D9E75]/20">
              Lancer le simulateur →
            </a>
            <Link href="/comment-ca-marche" className="border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-2xl text-lg transition-colors">
              Comment ça marche ?
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-white/50">
            <span>✓ Gratuit</span>
            <span>✓ Sans inscription</span>
            <span>✓ Résultats instantanés</span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { val: "12 villes", label: "couvertes" },
            { val: "5 régimes TMI", label: "comparés" },
            { val: "Réforme 2025", label: "intégrée" },
          ].map(({ val, label }) => (
            <div key={val}>
              <div className="text-xl font-bold text-[#1B2B4B]">{val}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator */}
      <Simulateur />

      {/* Pourquoi régime réel */}
      <section className="py-20 bg-[#1B2B4B] text-white px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi choisir le régime réel LMNP ?</h2>
            <p className="text-white/60 max-w-xl mx-auto">Depuis la réforme 2025, l&apos;avantage est encore plus marqué par rapport au micro-BIC.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏗️",
                title: "Amortissement déductible",
                desc: "Déduisez chaque année l'usure de votre bien (bâti 30 ans, mobilier 7 ans). Résultat : souvent 0€ d'impôt pendant 10 à 15 ans.",
              },
              {
                icon: "📉",
                title: "Charges réelles déductibles",
                desc: "Intérêts d'emprunt, taxe foncière, charges de copropriété, frais de gestion… tout se déduit des loyers perçus.",
              },
              {
                icon: "💡",
                title: "Micro-BIC 2025 : -30% seulement",
                desc: "Depuis janvier 2025, l'abattement micro-BIC est passé de 50% à 30%. Le régime réel devient incontournable pour les investisseurs avisés.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-lg mb-3">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2B4B] mb-4">Comment ça marche ?</h2>
            <p className="text-gray-500">3 étapes pour connaître la rentabilité réelle de votre investissement</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Renseignez votre bien", desc: "Surface, ville, prix d'achat, travaux. Les frais de notaire et la taxe foncière sont calculés automatiquement." },
              { step: "02", title: "Paramétrez le financement", desc: "Apport, durée, taux d'intérêt, loyer mensuel envisagé et votre tranche d'imposition." },
              { step: "03", title: "Analysez les résultats", desc: "Rendement brut/net, cash-flow mensuel, comparaison réel vs micro-BIC, et loyer cible pour atteindre vos objectifs." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-[#1D9E75]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-[#1D9E75] font-bold text-lg">{step}</span>
                </div>
                <h3 className="font-bold text-[#1B2B4B] text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="#simulateur" className="bg-[#1B2B4B] hover:bg-[#243a67] text-white font-semibold px-8 py-4 rounded-2xl transition-colors inline-block">
              Commencer maintenant →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#1D9E75] rounded-lg w-7 h-7 flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="font-bold text-[#1B2B4B]">LMNPSimulator</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-400">
            <Link href="/comment-ca-marche" className="hover:text-gray-600">Comment ça marche</Link>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
            <Link href="/tarifs" className="hover:text-gray-600">Tarifs</Link>
          </nav>
          <p className="text-xs text-gray-400">© 2025 LMNPSimulator · Outil indicatif, non un conseil fiscal</p>
        </div>
      </footer>
    </main>
  );
}

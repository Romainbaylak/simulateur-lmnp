import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";
import { InvestisseurButton, ProButton } from "@/components/TarifsButtons";

export const metadata: Metadata = {
  title: "Abonnements – toutlmnp",
  description: "Simulez votre LMNP gratuitement. Évoluez avec Investisseur ou Pro pour des simulations illimitées, l'export PDF et le tableau d'amortissement complet.",
};

export default function TarifsPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#F5F0E8] transition-colors">LMNP</Link>
            <Link href="/blog" className="hover:text-[#F5F0E8] transition-colors">Articles</Link>
            <Link href="/tarifs" style={{ color: "#C95B2A" }}>Abonnements</Link>
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

      <div className="py-10 px-4 text-center" style={{ borderBottom: "1px solid rgba(26,22,18,0.07)" }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/#simulateur" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md mb-6 transition-opacity hover:opacity-80"
            style={{ background: "rgba(201,91,42,0.08)", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.2)" }}>← Retour à la simulation</Link>
          <h1 className="font-light mb-3" style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
            Abonnements simples et transparents
          </h1>
          <p style={{ color: "rgba(26,22,18,0.45)" }}>Commencez gratuitement. Évoluez quand vous en avez besoin.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 items-start">

          {/* Gratuit */}
          <div className="rounded-xl p-8 flex flex-col" style={{ background: "#F5F0E8", border: "0.5px solid rgba(26,22,18,0.12)" }}>
            <div className="mb-6">
              <h2 className="font-light text-2xl text-[#1A1612] mb-2" style={{ letterSpacing: "-0.02em" }}>Gratuit</h2>
              <div className="text-4xl font-light text-[#1A1612] mb-1" style={{ letterSpacing: "-0.03em" }}>0 €</div>
              <div className="text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>Pour toujours</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "2 simulations par jour",
                "Tous les calculs LMNP",
                "Comparaison réel vs micro-BIC",
                "Fourchette de loyers officiels",
                "Curseur loyer interactif",
                "Verdict coloré instantané",
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(26,22,18,0.7)" }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                    style={{ background: "rgba(26,22,18,0.08)", color: "rgba(26,22,18,0.5)" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/#simulateur"
              className="block w-full text-center py-3 rounded font-medium transition-opacity hover:opacity-[0.88]"
              style={{ background: "#EDE7DC", color: "#1A1612", border: "0.5px solid rgba(26,22,18,0.2)", borderRadius: 6 }}>
              Commencer gratuitement
            </Link>
          </div>

          {/* Starter */}
          <div className="rounded-xl p-8 relative flex flex-col"
            style={{ background: "#EDE7DC", border: "1.5px solid rgba(201,91,42,0.45)" }}>
            <div className="absolute -top-3 left-6">
              <span className="text-[10px] uppercase tracking-[0.12em] font-medium px-3 py-1 rounded"
                style={{ background: "#C95B2A", color: "#F5F0E8" }}>POPULAIRE</span>
            </div>
            <div className="mb-6">
              <h2 className="font-light text-2xl text-[#1A1612] mb-2" style={{ letterSpacing: "-0.02em" }}>Investisseur</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-light" style={{ color: "#C95B2A", letterSpacing: "-0.03em" }}>4,99 €</span>
                <span style={{ color: "rgba(26,22,18,0.4)", fontSize: 14 }}>/mois</span>
              </div>
              <div className="text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>Sans engagement</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Simulations illimitées",
                "Tableau d'amortissement ajustable",
                "Export PDF (3 par semaine)",
                "Sauvegarde jusqu'à 6 simulations",
                "Comparaison réel vs micro-BIC détaillée",
                "Tout le plan Gratuit inclus",
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(26,22,18,0.7)" }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                    style={{ background: "rgba(201,91,42,0.15)", color: "#C95B2A" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <InvestisseurButton />
            <p className="text-xs text-center mt-3" style={{ color: "rgba(26,22,18,0.35)" }}>
              Paiement sécurisé via Stripe · Sans engagement
            </p>
          </div>

          {/* Pro */}
          <div className="rounded-xl p-8 flex flex-col"
            style={{ background: "#1A1612", border: "0.5px solid rgba(245,240,232,0.1)" }}>
            <div className="mb-6">
              <h2 className="font-light text-2xl mb-2" style={{ color: "#F5F0E8", letterSpacing: "-0.02em" }}>Pro</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-light" style={{ color: "#C95B2A", letterSpacing: "-0.03em" }}>12,99 €</span>
                <span style={{ color: "rgba(245,240,232,0.35)", fontSize: 14 }}>/mois</span>
              </div>
              <div className="text-sm" style={{ color: "rgba(245,240,232,0.35)" }}>Sans engagement</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Tout le plan Investisseur inclus",
                "Tableau d'amortissement complet et illimité",
                "Simulations et exports illimités",
                "Export Word (modifiable)",
                "Comparaison multi-biens (jusqu'à 5 biens)",
                "Sauvegarde illimitée",
                "Support prioritaire",
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(245,240,232,0.65)" }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                    style={{ background: "rgba(201,91,42,0.25)", color: "#C95B2A" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <ProButton />
            <p className="text-xs text-center mt-3" style={{ color: "rgba(245,240,232,0.25)" }}>
              Paiement sécurisé via Stripe · Sans engagement
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm" style={{ color: "rgba(26,22,18,0.5)", lineHeight: 1.75 }}>
            Le simulateur est et restera gratuit pour les cas d&apos;usage essentiels.<br />
            Les plans Investisseur et Pro sont pour les investisseurs qui analysent plusieurs biens régulièrement.
          </p>
        </div>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6 text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80">LMNP</Link>
            <Link href="/blog" className="hover:opacity-80">Articles</Link>
            <Link href="/tarifs" className="hover:opacity-80">Abonnements</Link>
            <Link href="/contact" className="hover:opacity-80">Contact</Link>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

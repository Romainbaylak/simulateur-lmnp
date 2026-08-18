"use client";
import { useState } from "react";
import Simulateur from "@/components/Simulateur";
import Logo from "@/components/Logo";
import Link from "next/link";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";

export default function Home() {
  const [resultsShown, setResultsShown] = useState(false);
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ─── Header ─── */}
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }}
        className="sticky top-0 z-50">
        {/* Desktop */}
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <Link href="/?reset=1"><Logo variant="light" /></Link>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#F5F0E8] transition-colors">LMNP</Link>
            <Link href="/blog" className="hover:text-[#F5F0E8] transition-colors">Articles</Link>
            <Link href="/tarifs" className="hover:text-[#F5F0E8] transition-colors">Abonnements</Link>
          </nav>
          <div className="flex items-center gap-2">
            <HeaderAuth dark={true} />
            <a href="/?reset=1#simulateur"
              className="text-sm font-medium px-4 py-2 rounded transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
              Simuler maintenant
            </a>
          </div>
        </div>
        {/* Mobile */}
        <MobileHeader simulerHref="/?reset=1#simulateur" />
      </header>

      {/* ─── Hero ─── */}
      <section style={{ backgroundColor: "#4E1F12", color: "#F5F0E8", display: resultsShown ? "none" : undefined }} className="pt-10 pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="mb-4" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.025em", lineHeight: 1.1, fontWeight: 400 }}>
            Votre invest LMNP<br />
            <span style={{ color: "#C95B2A" }}>Rentable ?</span>
          </h1>
          <p className="text-xl mb-3 md:whitespace-nowrap" style={{ color: "rgba(245,240,232,0.75)" }}>
            Calculez en un click votre rentabilité, cash-flow et amortissement.
          </p>
          <p className="text-sm" style={{ color: "#C95B2A" }}>
            ✓ Gratuit&nbsp;&nbsp;✓ Sans inscription&nbsp;&nbsp;✓ Résultats instantanés&nbsp;&nbsp;✓ À jour 2026
          </p>
        </div>
      </section>

      {/* ─── Simulateur ─── */}
      <Simulateur onShowResults={() => setResultsShown(true)} />

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo />
          <nav className="flex flex-col items-center gap-2 text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/comment-ca-marche" className="hover:text-[#1A1612] transition-colors">LMNP</Link>
              <Link href="/blog" className="hover:text-[#1A1612] transition-colors">Articles</Link>
              <Link href="/tarifs" className="hover:text-[#1A1612] transition-colors">Abonnements</Link>
              <Link href="/contact" className="hover:text-[#1A1612] transition-colors">Contact</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: "rgba(26,22,18,0.3)" }}>
              <Link href="/legal#mentions" className="hover:text-[#1A1612] transition-colors">Mentions légales</Link>
              <Link href="/legal#confidentialite" className="hover:text-[#1A1612] transition-colors">Confidentialité</Link>
              <Link href="/legal#cgv" className="hover:text-[#1A1612] transition-colors">CGV</Link>
            </div>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>
            © 2026 toutlmnp · Outil indicatif, non un conseil fiscal
          </p>
        </div>
      </footer>
    </main>
  );
}

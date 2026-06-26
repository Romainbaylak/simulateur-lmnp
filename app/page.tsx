import Simulateur from "@/components/Simulateur";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* ─── Header ─── */}
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }}
        className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="hidden md:flex items-center gap-6 text-base font-semibold" style={{ color: "rgba(245,240,232,0.55)" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#F5F0E8] transition-colors">
              LMNP
            </Link>
            <Link href="/blog" className="hover:text-[#F5F0E8] transition-colors">Articles</Link>
            <Link href="/tarifs" className="hover:text-[#F5F0E8] transition-colors">Tarifs</Link>
          </nav>
          <a href="#simulateur"
            className="text-sm font-medium px-4 py-2 rounded transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Simuler maintenant
          </a>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section style={{ backgroundColor: "#4E1F12", color: "#F5F0E8" }} className="pt-16 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="mb-5" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.025em", lineHeight: 1.1, fontWeight: 400 }}>
            Votre invest LMNP<br />
            <span style={{ color: "#C95B2A" }}>Rentable ?</span>
          </h1>
          <p className="text-xl mb-4" style={{ color: "rgba(245,240,232,0.75)", maxWidth: 560, margin: "0 auto 1rem" }}>
            Calculez en un click votre rentabilité, cash-flow et amortissement.
          </p>
          <p className="text-sm" style={{ color: "#C95B2A" }}>
            ✓ Gratuit&nbsp;&nbsp;✓ Sans inscription&nbsp;&nbsp;✓ Résultats instantanés&nbsp;&nbsp;✓ À jour 2026
          </p>
        </div>
      </section>

      {/* ─── Simulateur ─── */}
      <Simulateur />

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo />
          <nav className="flex gap-6 text-sm" style={{ color: "rgba(26,22,18,0.4)" }}>
            <Link href="/comment-ca-marche" className="hover:text-[#1A1612] transition-colors">
              LMNP
            </Link>
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

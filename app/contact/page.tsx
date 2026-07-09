import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – toutlmnp",
  description: "Contactez l'équipe toutlmnp pour tout retour, avis ou question sur le simulateur LMNP.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="hidden md:flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80 transition-opacity">LMNP</Link>
            <Link href="/blog" className="hover:opacity-80 transition-opacity">Articles</Link>
            <Link href="/tarifs" className="hover:opacity-80 transition-opacity">Tarifs</Link>
            <Link href="/contact" style={{ color: "#C95B2A" }}>Contact</Link>
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

      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-light mb-4" style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
          Contact
        </h1>
        <p className="text-base mb-10" style={{ color: "rgba(26,22,18,0.55)", lineHeight: 1.75 }}>
          Tout type de retour ou d&apos;avis est le bienvenu — que ce soit une suggestion, un bug ou une question sur le simulateur.
          <br />Merci de nous écrire à cet email :
        </p>
        <a href="mailto:toutlmnp@gmail.com"
          className="inline-block font-medium text-xl tracking-wide transition-opacity hover:opacity-80"
          style={{ color: "#C95B2A" }}>
          toutlmnp@gmail.com
        </a>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6 text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80">LMNP</Link>
            <Link href="/blog" className="hover:opacity-80">Articles</Link>
            <Link href="/tarifs" className="hover:opacity-80">Tarifs</Link>
            <Link href="/contact" className="hover:opacity-80">Contact</Link>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

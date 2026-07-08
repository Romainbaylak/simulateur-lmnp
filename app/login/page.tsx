"use client";
import { useState } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [password, setPassword] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setStep("password");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // À connecter à votre backend
  };

  const INPUT = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all";
  const INPUT_STYLE = {
    background: "#EDE7DC",
    border: "1px solid rgba(26,22,18,0.12)",
    color: "#1A1612",
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F0E8" }}>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(26,22,18,0.1)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <a
            href="/#simulateur"
            className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}
          >
            Simuler maintenant
          </a>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1
            className="font-light mb-2"
            style={{ fontSize: "2rem", color: "#4E1F12", letterSpacing: "-0.025em" }}
          >
            {step === "email" ? "Connexion" : "Votre mot de passe"}
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(26,22,18,0.5)" }}>
            {step === "email"
              ? "Entrez votre adresse e-mail pour continuer."
              : `Connectez-vous avec ${email}.`}
          </p>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(26,22,18,0.55)" }}>
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className={INPUT}
                  style={INPUT_STYLE}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-[0.88]"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              >
                Continuer →
              </button>
              <p className="text-center text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
                Pas encore de compte ?{" "}
                <Link href="/register" className="font-medium" style={{ color: "#C95B2A" }}>
                  Créer un profil
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-2 text-xs mb-2 transition-opacity hover:opacity-70"
                style={{ color: "rgba(26,22,18,0.45)" }}
              >
                ← Modifier l&apos;adresse
              </button>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(26,22,18,0.55)" }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT}
                  style={INPUT_STYLE}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-[0.88]"
                style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
              >
                Se connecter
              </button>
              <div className="flex justify-between text-sm">
                <Link href="#" className="transition-opacity hover:opacity-70" style={{ color: "rgba(26,22,18,0.45)" }}>
                  Mot de passe oublié ?
                </Link>
                <Link href="/register" className="font-medium" style={{ color: "#C95B2A" }}>
                  Créer un compte
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

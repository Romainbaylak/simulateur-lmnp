"use client";
import { useState } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // À connecter à votre backend
  };

  const INPUT = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all";
  const INPUT_STYLE = {
    background: "#EDE7DC",
    border: "1px solid rgba(26,22,18,0.12)",
    color: "#1A1612",
  };
  const LABEL = "block text-xs font-medium mb-1.5";
  const LABEL_STYLE = { color: "rgba(26,22,18,0.55)" };

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
            Créer votre profil
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(26,22,18,0.5)" }}>
            Gratuit et sans engagement.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Prénom</label>
                <input
                  type="text"
                  required
                  value={form.prenom}
                  onChange={set("prenom")}
                  placeholder="Jean"
                  className={INPUT}
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Nom</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={set("nom")}
                  placeholder="Dupont"
                  className={INPUT}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            <div>
              <label className={LABEL} style={LABEL_STYLE}>Adresse e-mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="vous@exemple.com"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </div>

            <div>
              <label className={LABEL} style={LABEL_STYLE}>Mot de passe</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={set("password")}
                placeholder="8 caractères minimum"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8" }}
            >
              Créer mon profil →
            </button>

            <p className="text-center text-sm" style={{ color: "rgba(26,22,18,0.5)" }}>
              Déjà un compte ?{" "}
              <Link href="/login" className="font-medium" style={{ color: "#C95B2A" }}>
                Se connecter
              </Link>
            </p>
          </form>
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

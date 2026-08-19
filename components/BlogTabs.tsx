"use client";

import { useState } from "react";
import Link from "next/link";

interface Article {
  slug: string;
  titre: string;
  extrait: string;
  date: string;
}

function ArticleList({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? articles.filter(a => a.titre.toLowerCase().includes(query.toLowerCase()))
    : articles;

  return (
    <div className="flex gap-12 items-start">
      {/* Colonne gauche */}
      <div className="hidden md:block w-1/3 flex-shrink-0 sticky top-28">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: "rgba(26,22,18,0.35)" }}>
            Tous les articles
          </p>
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(26,22,18,0.35)" }}>
              <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C95B2A]"
              style={{ background: "#EDE7DC", border: "0.5px solid rgba(26,22,18,0.12)", color: "#1A1612", width: 140 }}
            />
          </div>
        </div>
        <ul className="space-y-1">
          {filtered.map(a => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}`}
                className="block text-sm py-2.5 pr-3 transition-opacity hover:opacity-70 leading-snug"
                style={{ color: "#1A1612", borderLeft: "2px solid #C95B2A", paddingLeft: "12px" }}
              >
                {a.titre}
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-xs py-2 pl-3" style={{ color: "rgba(26,22,18,0.4)" }}>Aucun résultat</li>
          )}
        </ul>
      </div>

      {/* Colonne droite */}
      <div className="flex-1 space-y-4">
        {filtered.length === 0 && query.trim() && (
          <p className="text-sm py-8" style={{ color: "rgba(26,22,18,0.4)" }}>Aucun article ne correspond à votre recherche.</p>
        )}
        {filtered.length === 0 && !query.trim() && (
          <p className="text-sm py-8" style={{ color: "rgba(26,22,18,0.4)" }}>Aucun article pour le moment. Revenez bientôt.</p>
        )}
        {filtered.map(a => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="block group transition-all"
            style={{ textDecoration: "none" }}
          >
            <div
              className="rounded-xl px-7 py-5 transition-all"
              style={{
                background: "#EDE7DC",
                border: "0.5px solid rgba(26,22,18,0.1)",
                boxShadow: "0 1px 8px rgba(26,22,18,0.04)",
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.14em] font-medium mb-2" style={{ color: "rgba(26,22,18,0.35)" }}>
                {a.date}
              </div>
              <h2
                className="font-light mb-3 leading-snug group-hover:opacity-75 transition-opacity"
                style={{ fontSize: "clamp(1.05rem,2vw,1.25rem)", color: "#4E1F12", letterSpacing: "-0.02em" }}
              >
                {a.titre}
              </h2>
              <div className="mb-3" style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} />
              <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(26,22,18,0.55)" }}>
                {a.extrait}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#C95B2A" }}>
                Lire l&apos;article
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function BlogTabs({
  articlesLmnp,
  articlesActualite,
}: {
  articlesLmnp: Article[];
  articlesActualite: Article[];
}) {
  const [activeTab, setActiveTab] = useState<"lmnp" | "actualite">("lmnp");

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Onglets */}
      <div className="flex gap-2 pt-8 pb-6">
        <button
          onClick={() => setActiveTab("lmnp")}
          className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all"
          style={
            activeTab === "lmnp"
              ? { backgroundColor: "#4E1F12", color: "#F5F0E8" }
              : { backgroundColor: "#EDE7DC", color: "rgba(26,22,18,0.55)", border: "0.5px solid rgba(26,22,18,0.1)" }
          }
        >
          Articles LMNP
        </button>
        <button
          onClick={() => setActiveTab("actualite")}
          className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all"
          style={
            activeTab === "actualite"
              ? { backgroundColor: "#C95B2A", color: "#F5F0E8" }
              : { backgroundColor: "#EDE7DC", color: "rgba(26,22,18,0.55)", border: "0.5px solid rgba(26,22,18,0.1)" }
          }
        >
          L&apos;actualité du LMNP
        </button>
      </div>

      {/* Contenu */}
      <div className="pb-14">
        {activeTab === "lmnp" && <ArticleList articles={articlesLmnp} />}
        {activeTab === "actualite" && <ArticleList articles={articlesActualite} />}
      </div>
    </div>
  );
}

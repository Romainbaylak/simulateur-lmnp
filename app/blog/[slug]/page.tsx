import Logo from "@/components/Logo";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";

interface Section {
  id: string;
  titre: string;
}

interface Article {
  titre: string;
  date: string;
  sections: Section[];
  contenu: Block[];
}

type Block =
  | { type: "h1"; id: string; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" }
  | { type: "formula"; text: string }
  | { type: "note"; text: string };

const articles: Record<string, Article> = {
  "revente-lmnp-plus-value": {
    titre: "Revente d'un bien LMNP : comment est calculée la plus-value ?",
    date: "Mis à jour en août 2026",
    sections: [
      { id: "regime-pv", titre: "La revente LMNP : une fiscalité à bien comprendre" },
      { id: "calcul-pv", titre: "Comment calculer la plus-value d'un bien LMNP ?" },
      { id: "calcul-reel", titre: "Le calcul réel est plus favorable que la formule simplifiée" },
      { id: "abattements-amort", titre: "Les amortissements bénéficient-ils de l'abattement pour durée de détention ?" },
      { id: "abattements-duree", titre: "Comment fonctionnent les abattements pour durée de détention ?" },
      { id: "taux-imposition", titre: "Quel est le taux d'imposition de la plus-value LMNP ?" },
      { id: "surtaxe", titre: "La surtaxe sur les plus-values élevées" },
      { id: "interet-lmnp", titre: "La réintégration supprime-t-elle l'intérêt du LMNP au réel ?" },
      { id: "exemple-jamais-taxe", titre: "Pourquoi les amortissements ne sont pas « toujours taxés »" },
      { id: "cas-particuliers", titre: "Cas particuliers : certains LMNP non concernés" },
      { id: "lmnp-vs-lmp", titre: "LMNP et LMP : deux régimes différents" },
      { id: "a-retenir", titre: "Ce qu'il faut retenir" },
    ],
    contenu: [
      { type: "h1", id: "regime-pv", text: "La revente d'un bien LMNP : une fiscalité à bien comprendre" },
      { type: "p", text: "Lorsqu'un investisseur revend un logement exploité sous le statut de **Loueur en Meublé Non Professionnel (LMNP)**, la plus-value relève en principe du régime des **plus-values immobilières des particuliers**." },
      { type: "p", text: "Depuis le **15 février 2025**, une modification importante concerne toutefois les biens exploités en **LMNP au régime réel** : les amortissements admis en déduction pendant la période de location sont désormais pris en compte dans le calcul de la plus-value lors de la revente." },
      { type: "p", text: "Concrètement, les amortissements LMNP viennent **réduire le prix d'acquisition retenu pour le calcul de la plus-value**, ce qui augmente mécaniquement la plus-value brute." },
      { type: "note", text: "Cette règle résulte de l'article 150 VB du Code général des impôts. Elle concerne les cessions réalisées depuis le 15 février 2025, sous réserve de certaines exceptions, notamment pour certaines résidences-services." },
      { type: "hr" },

      { type: "h1", id: "calcul-pv", text: "Comment calculer la plus-value d'un bien LMNP ?" },
      { type: "p", text: "Dans une présentation simplifiée, le calcul peut être résumé ainsi :" },
      { type: "formula", text: "Plus-value brute LMNP = Prix de vente − (Prix d'achat − Amortissements LMNP réintégrés)" },
      { type: "p", text: "Autrement dit, les amortissements LMNP qui ont été admis en déduction pendant la détention viennent diminuer le prix d'acquisition fiscal retenu lors de la revente." },
      { type: "h2", id: "exemple-simple", text: "Exemple simple" },
      { type: "p", text: "Un investisseur achète un appartement :" },
      { type: "ul", items: ["Prix d'achat : **200 000 €**", "Prix de vente : **250 000 €**", "Amortissements LMNP admis en déduction : **20 000 €**"] },
      { type: "p", text: "Le prix d'acquisition fiscal corrigé devient : **200 000 € − 20 000 € = 180 000 €**" },
      { type: "p", text: "La plus-value brute est donc : **250 000 € − 180 000 € = 70 000 €**" },
      { type: "p", text: "Sans prise en compte des amortissements LMNP, la plus-value aurait été de seulement : **250 000 € − 200 000 € = 50 000 €**" },
      { type: "note", text: "Les 20 000 € d'amortissements LMNP augmentent donc ici la plus-value brute de 20 000 €." },
      { type: "hr" },

      { type: "h1", id: "calcul-reel", text: "Le calcul réel est toutefois plus favorable que cette formule simplifiée" },
      { type: "p", text: "Dans la réalité, le calcul de la plus-value immobilière ne se limite pas au prix d'achat inscrit dans l'acte. Le prix d'acquisition peut notamment être majoré :" },
      { type: "ul", items: [
        "des frais d'acquisition réellement supportés ou, dans certains cas, d'un **forfait de 7,5 % du prix d'achat** ;",
        "de certaines dépenses de construction, reconstruction, agrandissement ou amélioration ;",
        "lorsque le bien est détenu depuis plus de cinq ans, d'un **forfait travaux de 15 % du prix d'acquisition**, sous les conditions prévues par la réglementation.",
      ]},
      { type: "p", text: "Ces éléments peuvent réduire sensiblement la plus-value brute imposable. Le calcul réel est donc plus précisément de la forme :" },
      { type: "formula", text: "Plus-value brute = Prix de cession corrigé − [Prix d'acquisition + frais et majorations admissibles − amortissements à réintégrer]" },
      { type: "hr" },

      { type: "h1", id: "abattements-amort", text: "Les amortissements LMNP réintégrés bénéficient-ils de l'abattement pour durée de détention ?" },
      { type: "note", text: "Oui. C'est un point essentiel." },
      { type: "p", text: "Les amortissements LMNP réintégrés ne constituent pas une catégorie de plus-value séparée qui serait systématiquement taxée jusqu'à la revente. Ils servent d'abord à déterminer la **plus-value brute totale**." },
      { type: "p", text: "Ensuite, les abattements pour durée de détention s'appliquent à cette plus-value brute, **y compris à la fraction provenant de la réintégration des amortissements LMNP**." },
      { type: "p", text: "L'administration fiscale indique expressément que les amortissements LMNP sont réintégrés dans le calcul de la plus-value **avant l'application de l'abattement pour durée de détention**." },
      { type: "p", text: "Il est donc incorrect d'affirmer que : *« La plus-value classique bénéficie des abattements, mais les amortissements réintégrés restent toujours taxables. »* Ce n'est pas le mécanisme applicable au LMNP." },
      { type: "hr" },

      { type: "h1", id: "abattements-duree", text: "Comment fonctionnent les abattements LMNP pour durée de détention ?" },
      { type: "p", text: "La plus-value d'un bien LMNP bénéficie de deux calendriers d'abattement différents : un pour l'impôt sur le revenu, un pour les prélèvements sociaux." },
      { type: "table", head: ["Durée de détention", "Abattement IR", "Abattement PS"], rows: [
        ["Jusqu'à 5 ans", "0 %", "0 %"],
        ["De la 6e à la 21e année", "6 % par année", "1,65 % par année"],
        ["22e année", "+4 %, soit 100 % IR", "+1,60 %, soit 28 % cumulés"],
        ["De la 23e à la 30e année", "IR totalement exonéré", "9 % supplémentaires par année"],
        ["Après 30 ans", "100 % exonéré", "100 % exonéré"],
      ]},
      { type: "p", text: "Ainsi : après **22 ans de détention**, la plus-value LMNP est totalement exonérée d'impôt sur le revenu ; après **30 ans de détention**, elle est également totalement exonérée de prélèvements sociaux." },
      { type: "table", head: ["Durée", "Abattement IR", "Abattement PS"], rows: [
        ["5 ans", "0 %", "0 %"],
        ["10 ans", "30 %", "8,25 %"],
        ["15 ans", "60 %", "16,50 %"],
        ["20 ans", "90 %", "24,75 %"],
        ["22 ans", "100 %", "28 %"],
        ["25 ans", "100 %", "55 %"],
        ["30 ans", "100 %", "100 %"],
      ]},
      { type: "hr" },

      { type: "h2", id: "exemple-10ans", text: "Exemple : revente d'un LMNP après 10 ans" },
      { type: "ul", items: [
        "Achat : **200 000 €**",
        "Vente : **250 000 €**",
        "Amortissements LMNP réintégrés : **20 000 €**",
        "Plus-value brute simplifiée : **70 000 €**",
        "Durée de détention : **10 ans**",
      ]},
      { type: "p", text: "À 10 ans, l'abattement est de **30 % pour l'impôt sur le revenu** et **8,25 % pour les prélèvements sociaux**." },
      { type: "h2", id: "base-ir-ex", text: "Base taxable à l'impôt sur le revenu" },
      { type: "formula", text: "70 000 € × 70 % = 49 000 €" },
      { type: "h2", id: "base-ps-ex", text: "Base taxable aux prélèvements sociaux" },
      { type: "formula", text: "70 000 € × 91,75 % = 64 225 €" },
      { type: "p", text: "On voit donc immédiatement que les 20 000 € d'amortissements réintégrés **ne sont pas taxés séparément et intégralement**. Ils sont incorporés dans les 70 000 € de plus-value brute, puis cette plus-value bénéficie des abattements correspondant aux 10 années de détention." },
      { type: "hr" },

      { type: "h1", id: "taux-imposition", text: "Quel est le taux d'imposition de la plus-value LMNP ?" },
      { type: "p", text: "Après application des abattements pour durée de détention, la plus-value immobilière LMNP est en principe soumise à :" },
      { type: "ul", items: ["**19 %** d'impôt sur le revenu", "**17,2 %** de prélèvements sociaux"] },
      { type: "formula", text: "Taux facial maximal : 36,2 %" },
      { type: "note", text: "Depuis 2026, le taux des prélèvements sociaux a été porté à 18,6 % pour plusieurs catégories de revenus. Toutefois, les plus-values immobilières relevant des articles 150 U à 150 UC du CGI restent soumises à 17,2 %. Ne pas confondre la fiscalité des revenus locatifs LMNP avec celle de la plus-value immobilière à la revente." },
      { type: "hr" },

      { type: "h1", id: "surtaxe", text: "Qu'en est-il de la surtaxe sur les plus-values immobilières élevées ?" },
      { type: "p", text: "Une taxe supplémentaire peut s'appliquer lorsque la **plus-value immobilière nette imposable** dépasse **50 000 €**. Le barème de cette taxe est progressif et peut atteindre **6 %** pour les plus-values les plus élevées, avec des mécanismes de lissage à certains seuils." },
      { type: "p", text: "Il est donc incorrect de présenter la fiscalité comme *36,2 % ou 37,2 % au-delà de 50 000 €*. La situation dépend du montant exact de la plus-value nette imposable." },
      { type: "hr" },

      { type: "h1", id: "interet-lmnp", text: "La réintégration des amortissements supprime-t-elle l'intérêt du LMNP au réel ?" },
      { type: "p", text: "Pas nécessairement, mais il faut désormais raisonner sur l'ensemble de la durée de l'investissement. Pendant la détention, les amortissements LMNP permettent de diminuer le résultat BIC imposable et peuvent réduire fortement la fiscalité sur les revenus locatifs. Plusieurs éléments doivent être mis en balance :" },
      { type: "ul", items: [
        "les économies fiscales obtenues grâce aux amortissements LMNP pendant la détention ;",
        "le montant total des amortissements effectivement admis en déduction ;",
        "la durée de détention du LMNP ;",
        "les abattements pour durée de détention ;",
        "les frais d'acquisition pris en compte ;",
        "les éventuels travaux ou forfaits applicables ;",
        "l'évolution du prix du bien ;",
        "l'éventuelle surtaxe sur les plus-values élevées.",
      ]},
      { type: "p", text: "Il n'est donc pas exact de considérer automatiquement que chaque euro amorti entraîne ultérieurement une taxation fixe de 19 % ou de 36,2 %. **L'imposition réelle dépend notamment de la durée de détention.** À partir de 22 ans, il n'existe plus d'impôt sur le revenu sur la plus-value immobilière. À partir de 30 ans, les prélèvements sociaux sont également totalement exonérés." },
      { type: "hr" },

      { type: "h1", id: "exemple-jamais-taxe", text: "Exemple : pourquoi les amortissements LMNP ne sont pas « toujours taxés »" },
      { type: "p", text: "Supposons un bien LMNP ayant généré **50 000 € d'amortissements admis en déduction**." },
      { type: "p", text: "Si le bien est vendu après seulement **5 ans**, ces amortissements augmentent la plus-value brute de 50 000 € et aucun abattement ne s'applique encore." },
      { type: "p", text: "En revanche, si le même bien est vendu après **20 ans** : l'assiette soumise à l'impôt sur le revenu bénéficie de **90 % d'abattement** ; l'assiette soumise aux prélèvements sociaux bénéficie de **24,75 % d'abattement**." },
      { type: "p", text: "Après **22 ans** : la partie imposée à 19 % est totalement exonérée. Après **30 ans** : la plus-value est également totalement exonérée de prélèvements sociaux." },
      { type: "note", text: "Les amortissements LMNP réintégrés ne sont donc absolument pas une somme qui resterait taxable indéfiniment indépendamment de la durée de détention." },
      { type: "hr" },

      { type: "h1", id: "cas-particuliers", text: "Cas particuliers : certains LMNP ne sont pas concernés par la réintégration" },
      { type: "p", text: "La réglementation prévoit certaines exceptions. Le mécanisme de minoration du prix d'acquisition par les amortissements ne s'applique notamment pas à certains biens situés dans des résidences spécifiques, telles que certaines :" },
      { type: "ul", items: [
        "résidences étudiantes ;",
        "résidences seniors ;",
        "résidences destinées aux personnes handicapées ;",
        "structures médicalisées et établissements visés par les textes.",
      ]},
      { type: "p", text: "Ces exceptions sont précisément définies à l'article 150 VB du CGI. Pour un LMNP classique — appartement ou maison loué meublé au régime réel — la réintégration des amortissements constitue en revanche désormais la règle." },
      { type: "hr" },

      { type: "h1", id: "lmnp-vs-lmp", text: "LMNP et LMP : deux régimes de plus-value différents" },
      { type: "p", text: "En LMNP, la cession relève en principe du régime des **plus-values immobilières des particuliers**. En LMP, lorsque les conditions sont réunies, la cession relève du régime des **plus-values professionnelles**." },
      { type: "p", text: "Le régime LMP peut notamment permettre, sous certaines conditions, de bénéficier de l'exonération prévue à l'article 151 septies du CGI. Pour les loueurs en meublé professionnels, une exonération peut être totale lorsque les recettes remplissent le seuil applicable de **90 000 €**, ou partielle entre **90 000 € et 126 000 €**, sous réserve notamment d'une durée d'exercice d'au moins cinq ans." },
      { type: "note", text: "La fiscalité d'une vente en LMP doit être étudiée séparément : elle ne doit pas être assimilée au calcul de plus-value applicable en LMNP." },
      { type: "hr" },

      { type: "h1", id: "a-retenir", text: "Ce qu'il faut retenir sur la revente d'un LMNP" },
      { type: "ul", items: [
        "**1.** Les amortissements LMNP admis en déduction augmentent désormais la plus-value brute lors de la revente.",
        "**2.** Ils ne constituent pas une plus-value séparée taxée indépendamment du reste.",
        "**3.** Les abattements pour durée de détention s'appliquent à la plus-value brute après réintégration des amortissements LMNP.",
        "**4.** L'exonération d'impôt sur le revenu est totale après 22 ans de détention.",
        "**5.** L'exonération des prélèvements sociaux est totale après 30 ans de détention.",
        "**6.** Les plus-values immobilières LMNP restent soumises, en 2026, à 19 % d'impôt sur le revenu et 17,2 % de prélèvements sociaux avant abattements.",
        "**7.** Une surtaxe spécifique peut s'ajouter lorsque la plus-value nette imposable dépasse 50 000 €, selon un barème progressif pouvant atteindre 6 %.",
      ]},
      { type: "p", text: "La réintégration des amortissements LMNP est un élément important du calcul de la plus-value, mais **elle ne signifie pas que les amortissements seront systématiquement taxés à la revente quelle que soit la durée de détention**. En LMNP, la durée de détention reste déterminante pour mesurer la fiscalité réelle de la revente." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return {};
  return { title: `${article.titre} – toutlmnp`, description: article.contenu.find(b => b.type === "p") ? (article.contenu.find(b => b.type === "p") as { type: "p"; text: string }).text.replace(/\*\*/g, "").slice(0, 160) : "" };
}

function renderInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: "#1A1612", fontWeight: 600 }}>{part}</strong>
      : part
  );
}

// Palette de couleurs pour les titres de section — une par numéro, harmonisée avec la DA du site
const SECTION_COLORS = [
  "#C95B2A", // 01 — rouille (couleur brand)
  "#2A6B55", // 02 — vert sauge
  "#2A4E7A", // 03 — bleu ardoise
  "#7A3A1A", // 04 — ambre profond
  "#5C2A7A", // 05 — prune
  "#1A6B6B", // 06 — canard
  "#6B3A1A", // 07 — terre cuite foncée
  "#3A4E6B", // 08 — marine
  "#6B2A4A", // 09 — bordeaux
  "#2A6B3A", // 10 — émeraude
  "#4E4A1A", // 11 — olive
  "#3A2A6B", // 12 — indigo
];

function renderBlock(block: Block, i: number, sectionNumbers?: Map<string, number>) {
  switch (block.type) {
    case "h1": {
      const num = sectionNumbers?.get(block.id);
      const color = num !== undefined ? (SECTION_COLORS[(num - 1) % SECTION_COLORS.length]) : "#4E1F12";
      return (
        <div key={i} id={block.id} className="mt-12 mb-5 scroll-mt-28 flex items-start gap-4"
          style={{ borderTop: `1.5px solid ${color}30`, paddingTop: "20px" }}>
          {num !== undefined && (
            <span className="flex-shrink-0 text-sm font-mono font-semibold mt-0.5 tabular-nums"
              style={{ color, minWidth: "1.5rem" }}>
              {String(num).padStart(2, "0")}
            </span>
          )}
          <h2 className="font-semibold leading-snug"
            style={{ fontSize: "1.15rem", color, letterSpacing: "-0.02em" }}>
            {block.text}
          </h2>
        </div>
      );
    }
    case "h2":
      return (
        <h3 key={i} id={block.id} className="font-medium mt-6 mb-3 scroll-mt-28"
          style={{ fontSize: "1rem", color: "#1A1612" }}>
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={i} className="mb-4 text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.72)" }}>
          {renderInline(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="mb-5 space-y-2 pl-0">
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-sm" style={{ color: "rgba(26,22,18,0.72)" }}>
              <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#C95B2A" }} />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "formula":
      return (
        <div key={i} className="my-5 px-5 py-4 rounded-xl text-sm font-mono leading-relaxed"
          style={{ background: "rgba(78,31,18,0.06)", borderLeft: "3px solid #C95B2A", color: "#4E1F12" }}>
          {block.text}
        </div>
      );
    case "note":
      return (
        <div key={i} className="my-5 px-5 py-4 rounded-xl text-sm leading-relaxed"
          style={{ background: "rgba(201,91,42,0.07)", border: "0.5px solid rgba(201,91,42,0.2)", color: "rgba(26,22,18,0.72)" }}>
          {renderInline(block.text)}
        </div>
      );
    case "table":
      return (
        <div key={i} className="my-6 overflow-x-auto rounded-xl" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "#1A1612" }}>
                {block.head.map((h, j) => (
                  <th key={j} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider"
                    style={{ color: "rgba(245,240,232,0.7)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} style={{ background: j % 2 === 0 ? "#F5F0E8" : "#EDE7DC", borderTop: "0.5px solid rgba(26,22,18,0.07)" }}>
                  {row.map((cell, k) => (
                    <td key={k} className="px-4 py-3" style={{ color: k === 0 ? "rgba(26,22,18,0.55)" : "#1A1612", fontWeight: k > 0 ? 500 : 400 }}>
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "hr":
      return null; // les h1 ont déjà leur séparateur intégré
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/"><Logo variant="light" /></Link>
            <div className="pl-5" style={{ borderLeft: "1px solid rgba(245,240,232,0.15)" }}>
              <Link href="/blog" className="text-sm font-light leading-tight hover:opacity-80 transition-opacity" style={{ color: "rgba(245,240,232,0.6)" }}>
                ← Articles
              </Link>
            </div>
          </div>
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

      {/* Hero article */}
      <div className="px-4 pt-12 pb-10" style={{ borderBottom: "1px solid rgba(26,22,18,0.07)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-[0.14em] font-medium mb-4" style={{ color: "rgba(26,22,18,0.35)" }}>
            {article.date}
          </div>
          <h1 className="font-light mb-0"
            style={{ fontSize: "clamp(1.5rem,3.5vw,2.4rem)", color: "#4E1F12", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            {article.titre}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Sommaire */}
        {(() => {
          const sectionNumbers = new Map<string, number>();
          article.sections.forEach((s, idx) => sectionNumbers.set(s.id, idx + 1));
          return (
            <>
              <div className="mb-12 rounded-2xl overflow-hidden" style={{ border: "0.5px solid rgba(26,22,18,0.1)" }}>
                <div className="px-6 py-4" style={{ background: "#1A1612" }}>
                  <p className="text-xs uppercase tracking-[0.14em] font-medium" style={{ color: "rgba(245,240,232,0.5)" }}>
                    Sommaire
                  </p>
                </div>
                <div className="px-6 py-5" style={{ background: "#EDE7DC" }}>
                  <ol className="space-y-2">
                    {article.sections.map((s, i) => {
                      const color = SECTION_COLORS[i % SECTION_COLORS.length];
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className="flex items-start gap-3 text-sm transition-opacity hover:opacity-60 group"
                            style={{ color: "#1A1612" }}
                          >
                            <span className="flex-shrink-0 font-mono text-xs mt-0.5 tabular-nums font-semibold"
                              style={{ color, minWidth: "1.6rem" }}>
                              {(i + 1).toString().padStart(2, "0")}
                            </span>
                            <span className="group-hover:underline leading-snug">{s.titre}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              {/* Corps de l'article */}
              <div>
                {article.contenu.map((block, i) => renderBlock(block, i, sectionNumbers))}
              </div>
            </>
          );
        })()}

        {/* CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "#1A1612" }}>
          <div className="text-xs uppercase tracking-[0.14em] font-medium mb-3" style={{ color: "rgba(245,240,232,0.35)" }}>
            Simulateur LMNP
          </div>
          <h3 className="font-light text-xl mb-3" style={{ color: "#F5F0E8", letterSpacing: "-0.02em" }}>
            Calculez votre situation personnelle
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(245,240,232,0.45)" }}>
            Régime réel, micro-BIC, amortissements — simulation gratuite et instantanée.
          </p>
          <Link href="/#simulateur"
            className="inline-block font-medium px-8 py-3 transition-opacity hover:opacity-[0.88]"
            style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
            Lancer le simulateur →
          </Link>
        </div>
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <nav className="hidden md:flex flex-col items-center gap-2 text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/comment-ca-marche" className="hover:opacity-80">LMNP</Link>
              <Link href="/blog" className="hover:opacity-80">Articles</Link>
              <Link href="/tarifs" className="hover:opacity-80">Abonnements</Link>
              <Link href="/contact" className="hover:opacity-80">Contact</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4" style={{ color: "rgba(26,22,18,0.3)" }}>
              <Link href="/legal#mentions" className="hover:opacity-80">Mentions légales</Link>
              <Link href="/legal#confidentialite" className="hover:opacity-80">Confidentialité</Link>
              <Link href="/legal#cgv" className="hover:opacity-80">CGV</Link>
            </div>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}

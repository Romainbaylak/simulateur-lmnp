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
  intro?: string[];
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

  "amortissement-lmnp": {
    titre: "Amortissement LMNP : comment fonctionne-t-il et comment le calculer ?",
    date: "Mis à jour en août 2026",
    intro: [
      "L'amortissement LMNP constitue l'un des mécanismes fiscaux les plus importants de la location meublée au régime réel.",
      "Contrairement à une charge classique, l'amortissement ne correspond pas nécessairement à une somme payée chaque année. Il consiste à répartir comptablement le coût d'un bien ou d'un équipement sur sa durée d'utilisation.",
      "En LMNP au régime réel, il est notamment possible d'amortir le logement (à l'exception de la valeur du terrain), certains travaux, le mobilier, les équipements, et selon leur traitement comptable, certains frais liés à l'acquisition.",
      "Ces amortissements peuvent réduire fortement le bénéfice BIC imposable généré par la location meublée. Leur utilisation répond cependant à plusieurs règles : décomposition du logement en composants, durées d'utilisation cohérentes, plafonnement des amortissements déductibles et, depuis 2025, prise en compte lors du calcul de la plus-value en cas de revente.",
    ],
    sections: [
      { id: "definition", titre: "Qu'est-ce que l'amortissement en LMNP ?" },
      { id: "pourquoi-reel", titre: "Pourquoi le régime réel permet-il d'amortir un bien LMNP ?" },
      { id: "quels-elements", titre: "Quels éléments peut-on amortir en LMNP ?" },
      { id: "valeur-amortissable", titre: "Comment déterminer la valeur amortissable d'un logement LMNP ?" },
      { id: "terrain", titre: "Pourquoi le terrain n'est-il pas amortissable ?" },
      { id: "composants", titre: "Comment fonctionne l'amortissement LMNP par composants ?" },
      { id: "durees", titre: "Quelles durées d'amortissement utiliser en LMNP ?" },
      { id: "calculer", titre: "Comment calculer un amortissement LMNP étape par étape ?" },
      { id: "travaux", titre: "Comment amortir les travaux en LMNP ?" },
      { id: "mobilier", titre: "Comment amortir le mobilier et les équipements ?" },
      { id: "charges-directes", titre: "Peut-on passer directement certains achats en charges ?" },
      { id: "non-utilises", titre: "Que deviennent les amortissements LMNP non utilisés ?" },
      { id: "deficits", titre: "Déficits LMNP et amortissements reportés : quelle différence ?" },
      { id: "obligations", titre: "Quelles sont les obligations comptables du LMNP au régime réel ?" },
      { id: "impact-revente", titre: "Quel est l'impact des amortissements LMNP lors de la revente ?" },
      { id: "faq", titre: "FAQ sur l'amortissement LMNP" },
      { id: "a-retenir", titre: "Ce qu'il faut retenir" },
    ],
    contenu: [
      { type: "h1", id: "definition", text: "Qu'est-ce que l'amortissement en LMNP ?" },
      { type: "p", text: "En comptabilité, un actif destiné à être utilisé pendant plusieurs années n'est généralement pas déduit intégralement du résultat au moment de son acquisition. Son coût est réparti sur sa **durée d'utilisation prévisible**. Cette répartition constitue l'amortissement." },
      { type: "h2", id: "ex-equipement", text: "Un exemple très simple" },
      { type: "p", text: "Un équipement destiné à être utilisé pendant 5 ans est acheté **5 000 €**. Dans un calcul linéaire simplifié :" },
      { type: "formula", text: "5 000 € ÷ 5 ans = 1 000 € d'amortissement annuel" },
      { type: "p", text: "Une charge comptable de 1 000 € est donc enregistrée chaque année pendant la durée retenue." },
      { type: "p", text: "Le même principe existe pour un logement exploité en **LMNP au régime réel**, avec une particularité importante : un immeuble n'est généralement pas amorti en une seule fois sur une durée unique. Le bâti doit être ventilé entre plusieurs composants ayant des durées d'utilisation différentes." },
      { type: "note", text: "L'administration confirme qu'un loueur en meublé relevant d'un régime réel peut déduire l'amortissement des biens inscrits à l'actif, notamment l'immeuble et le mobilier." },

      { type: "h1", id: "pourquoi-reel", text: "Pourquoi le régime réel permet-il d'amortir un bien LMNP ?" },
      { type: "p", text: "Les revenus provenant d'une location meublée sont fiscalement classés dans la catégorie des **Bénéfices Industriels et Commerciaux (BIC)** et non dans celle des revenus fonciers." },
      { type: "h2", id: "micro-bic", text: "Au micro-BIC" },
      { type: "p", text: "Le propriétaire déclare ses recettes et l'administration applique un abattement forfaitaire. Il n'est donc pas possible de déduire séparément les intérêts d'emprunt, la taxe foncière, les assurances, les charges de copropriété, les travaux ou les amortissements LMNP." },
      { type: "h2", id: "regime-reel-detail", text: "Au régime réel" },
      { type: "p", text: "Le résultat fiscal est déterminé à partir des recettes de l'activité LMNP, dont sont retranchées les charges fiscalement déductibles ainsi que, dans certaines limites, les dotations aux amortissements. Schématiquement :" },
      { type: "formula", text: "Résultat LMNP avant amortissements = recettes − charges déductibles\nRésultat LMNP après amortissements = résultat avant amortissements − amortissements déductibles" },
      { type: "p", text: "L'amortissement peut donc considérablement réduire le bénéfice imposable du LMNP." },

      { type: "h1", id: "quels-elements", text: "Quels éléments peut-on amortir en LMNP ?" },
      { type: "p", text: "Plusieurs catégories d'actifs peuvent faire l'objet d'un amortissement lorsqu'elles sont inscrites à l'actif de l'activité LMNP." },
      { type: "h2", id: "bati", text: "Le bâtiment" },
      { type: "p", text: "La construction elle-même constitue généralement la part principale de la base amortissable. En revanche, **le terrain n'est pas amortissable**. Il est donc indispensable de distinguer :" },
      { type: "formula", text: "Valeur totale du bien = valeur du terrain + valeur du bâti" },
      { type: "p", text: "Seule la partie correspondant au bâti entre dans le plan d'amortissement immobilier." },
      { type: "h2", id: "mobilier-detail", text: "Le mobilier" },
      { type: "ul", items: ["lit, canapé, tables, chaises", "armoires, rangements", "tout meuble nécessaire à l'exploitation du logement"] },
      { type: "h2", id: "equipements-detail", text: "Les équipements" },
      { type: "ul", items: ["électroménager", "cuisine équipée", "téléviseur", "matériel informatique", "équipements de chauffage ou de climatisation"] },
      { type: "h2", id: "travaux-types", text: "Les travaux" },
      { type: "p", text: "Les travaux ayant la nature d'une immobilisation peuvent également être amortis. Leur durée dépend de leur nature : refaire une installation électrique n'a pas la même durée d'utilisation qu'une peinture ou qu'un équipement de cuisine." },
      { type: "h2", id: "frais-acq", text: "Les frais d'acquisition" },
      { type: "p", text: "Certains frais directement liés à l'acquisition (droits, honoraires, commissions) peuvent, selon le traitement comptable retenu, être incorporés au coût de l'actif plutôt que déduits immédiatement." },

      { type: "h1", id: "valeur-amortissable", text: "Comment déterminer la valeur amortissable d'un logement LMNP ?" },
      { type: "p", text: "La première étape consiste à déterminer la valeur du bien à inscrire dans la comptabilité LMNP. Deux situations doivent être distinguées." },
      { type: "h2", id: "achat-recent", text: "Le logement vient d'être acheté" },
      { type: "p", text: "Lorsque l'achat et le début de l'activité LMNP sont proches, le coût d'acquisition constitue naturellement le point de départ. Il faut ensuite isoler la valeur du terrain, déterminer la valeur amortissable du bâti, puis répartir le bâti entre différents composants." },
      { type: "h2", id: "achat-ancien", text: "Le logement a été acheté plusieurs années auparavant" },
      { type: "p", text: "Le fait que l'immeuble soit ancien **n'empêche pas son amortissement en LMNP**. Il ne s'agit cependant pas de « rattraper » les amortissements des années où le logement n'était pas exploité en LMNP." },
      { type: "p", text: "Lorsqu'un immeuble appartenant jusque-là au patrimoine privé est inscrit ultérieurement à l'actif d'une activité, sa valeur d'inscription doit correspondre à sa **valeur réelle au moment de cette inscription**. Un appartement acheté 150 000 € vingt ans auparavant et valant désormais 300 000 € doit être valorisé à sa valeur actuelle lors de son entrée dans l'activité LMNP." },
      { type: "note", text: "Une estimation immobilière sérieuse peut alors être particulièrement utile pour documenter la valeur d'inscription." },

      { type: "h1", id: "terrain", text: "Pourquoi le terrain n'est-il pas amortissable ?" },
      { type: "p", text: "L'amortissement suppose qu'un actif ait une durée d'utilisation limitée ou qu'il subisse une consommation progressive de ses avantages économiques. Le terrain ne répond généralement pas à cette logique. Contrairement à la construction, il n'est donc pas amorti." },
      { type: "h2", id: "terrain-exemple", text: "Exemple" },
      { type: "p", text: "Pour un appartement acheté **250 000 €**, il serait incorrect de pratiquer des amortissements sur la totalité des 250 000 €. En retenant une valeur foncière de **45 000 €**, la base amortissable du bâti est :" },
      { type: "formula", text: "250 000 − 45 000 = 205 000 € de base amortissable" },
      { type: "note", text: "Il n'existe pas de pourcentage universel du terrain applicable à tous les LMNP. La valeur foncière dépend de la localisation, du type de construction, de la surface et de la quote-part foncière dans une copropriété. Une ventilation doit pouvoir être justifiée." },

      { type: "h1", id: "composants", text: "Comment fonctionne l'amortissement LMNP par composants ?" },
      { type: "p", text: "Un immeuble rassemble des éléments dont les durées d'utilisation sont très différentes. La structure peut rester exploitable pendant plusieurs décennies tandis que des aménagements intérieurs devront être renouvelés beaucoup plus tôt." },
      { type: "p", text: "La méthode par composants consiste à décomposer le bâtiment. On peut par exemple identifier :" },
      { type: "ul", items: ["le gros œuvre", "la toiture ou l'étanchéité", "les façades", "les installations électriques", "la plomberie", "le chauffage", "les agencements et aménagements intérieurs"] },
      { type: "p", text: "Chaque composant reçoit une fraction de la valeur totale du bâti et une durée d'amortissement correspondant à sa durée d'utilisation." },
      { type: "note", text: "L'administration rappelle que l'amortissement doit traduire la durée d'utilisation du bien ou de son composant et que celle-ci doit être appréciée en fonction des caractéristiques de l'actif." },

      { type: "h1", id: "durees", text: "Quelles durées d'amortissement utiliser en LMNP ?" },
      { type: "p", text: "Il n'existe pas, pour tous les logements LMNP, une grille réglementaire imposant automatiquement des durées fixes. La durée doit rester cohérente avec la **durée normale d'utilisation de l'élément concerné**." },
      { type: "table", head: ["Élément", "Durée indicative"], rows: [
        ["Gros œuvre / structure", "~ 75–100 ans"],
        ["Façade, toiture, étanchéité", "~ 25–40 ans"],
        ["Plomberie, chauffage, électricité", "~ 20–30 ans"],
        ["Aménagements intérieurs", "~ 10–15 ans"],
        ["Cuisine et équipements", "~ 5–10 ans"],
        ["Mobilier", "~ 5–10 ans"],
        ["Informatique / certains appareils", "~ 3–5 ans"],
      ]},
      { type: "note", text: "Ce qui importe est avant tout la cohérence entre la nature de l'élément, sa durée normale d'utilisation, sa proportion dans la valeur du logement et les méthodes comptables appliquées d'un exercice à l'autre." },

      { type: "h1", id: "calculer", text: "Comment calculer un amortissement LMNP étape par étape ?" },
      { type: "p", text: "Prenons un exemple volontairement simplifié. Un appartement destiné au LMNP est inscrit pour une valeur de **240 000 €**." },
      { type: "h2", id: "etape1", text: "Étape 1 : retirer le terrain" },
      { type: "p", text: "En retenant une valeur foncière justifiée de **43 200 €** :" },
      { type: "formula", text: "240 000 − 43 200 = 196 800 € de base amortissable du bâtiment" },
      { type: "h2", id: "etape2", text: "Étape 2 : répartir le bâti entre différents composants" },
      { type: "table", head: ["Composant", "Valeur", "Durée retenue", "Amortissement annuel"], rows: [
        ["Structure / gros œuvre", "98 400 €", "50 ans", "1 968 €"],
        ["Toiture / étanchéité", "29 520 €", "25 ans", "1 181 €"],
        ["Installations techniques", "29 520 €", "20 ans", "1 476 €"],
        ["Aménagements intérieurs", "39 360 €", "15 ans", "2 624 €"],
        ["Total", "196 800 €", "—", "7 249 € / an"],
      ]},
      { type: "note", text: "Il s'agit uniquement d'une illustration pédagogique : les pourcentages et durées doivent être adaptés au bien réel." },
      { type: "h2", id: "etape3", text: "Étape 3 : ajouter les autres immobilisations" },
      { type: "p", text: "En ajoutant un mobilier de **12 000 € sur 6 ans** et des travaux d'aménagement de **18 000 € sur 12 ans** :" },
      { type: "formula", text: "Mobilier : 12 000 ÷ 6 = 2 000 € / an\nTravaux : 18 000 ÷ 12 = 1 500 € / an\nTotal supplémentaire : 3 500 € / an" },
      { type: "h2", id: "etape4", text: "Étape 4 : calculer l'amortissement total" },
      { type: "formula", text: "Bâtiment : 7 249 € + Mobilier et travaux : 3 500 € = 10 749 € d'amortissements théoriques par an" },
      { type: "p", text: "Mais cela ne signifie pas que les **10 749 € seront fiscalement déductibles la même année**. C'est là qu'intervient la règle particulière du plafonnement des amortissements en LMNP." },
      { type: "h2", id: "etape5", text: "Étape 5 : appliquer un prorata la première année" },
      { type: "p", text: "Si l'activité commence en cours d'exercice, l'annuité doit être adaptée à la période d'utilisation effective. Par exemple, pour une demi-année d'utilisation :" },
      { type: "formula", text: "10 749 € × 6 / 12 ≈ 5 375 €" },

      { type: "h1", id: "travaux", text: "Comment amortir les travaux en LMNP ?" },
      { type: "p", text: "Les travaux réalisés dans un LMNP ne sont pas tous traités de la même manière. Il faut notamment distinguer les dépenses pouvant être comptabilisées immédiatement en charges, les dépenses constituant une immobilisation, les travaux rattachés à un composant existant et les travaux créant ou améliorant durablement un élément du logement." },
      { type: "h2", id: "travaux-exemple", text: "Exemple" },
      { type: "p", text: "Des travaux d'aménagement immobilisés pour **15 000 €** avec une durée comptable retenue de 15 ans :" },
      { type: "formula", text: "15 000 ÷ 15 = 1 000 € par an" },
      { type: "h2", id: "travaux-avant", text: "Travaux réalisés avant le début de l'activité LMNP" },
      { type: "p", text: "Le fait qu'une facture soit antérieure à la déclaration de début d'activité ne suffit pas à conclure que la dépense est automatiquement inutilisable. Le traitement dépend notamment de la date des travaux, de leur nature, de leur lien avec l'activité future et de la valorisation du bien lors de son inscription à l'actif." },
      { type: "note", text: "Lorsqu'un propriétaire a réalisé plusieurs années auparavant des travaux dans sa résidence principale et la transforme ensuite en LMNP, ces travaux peuvent déjà être reflétés dans la valeur actuelle du logement. Il serait alors incohérent d'intégrer la valeur actuelle majorée puis d'ajouter une seconde fois l'intégralité des anciennes factures de travaux." },

      { type: "h1", id: "mobilier", text: "Comment amortir le mobilier et les équipements en LMNP ?" },
      { type: "p", text: "Le mobilier et les équipements constituent des immobilisations distinctes du logement. Leur durée d'utilisation est généralement beaucoup plus courte que celle du bâtiment." },
      { type: "table", head: ["Type d'équipement", "Exemple"], rows: [
        ["Mobilier", "lit, canapé, table, armoire"],
        ["Électroménager", "réfrigérateur, lave-linge, lave-vaisselle"],
        ["Cuisine", "meubles et équipements intégrés"],
        ["Électronique", "téléviseur, équipement informatique"],
        ["Équipements divers", "luminaires, certains dispositifs techniques"],
      ]},
      { type: "note", text: "Un ordinateur, un réfrigérateur et une table de salle à manger n'ont aucune raison d'être systématiquement amortis sur la même durée. La durée doit être cohérente avec l'utilisation probable de chaque actif." },

      { type: "h1", id: "charges-directes", text: "Peut-on passer directement certains achats en charges ?" },
      { type: "p", text: "Oui, sous certaines conditions. Une tolérance administrative permet de comptabiliser directement en charges certains matériels et mobiliers de faible valeur lorsque leur prix unitaire **n'excède pas 500 € HT**." },
      { type: "note", text: "Il faut donc éviter la règle fréquemment répétée selon laquelle le seuil serait automatiquement de 600 € TTC. Ce n'est pas le seuil prévu par la doctrine fiscale." },
      { type: "h2", id: "equipement-initial", text: "Attention à l'équipement initial du logement" },
      { type: "p", text: "La règle des petits achats ne doit pas conduire à découper artificiellement l'équipement initial complet d'un logement LMNP pour tout passer immédiatement en charges. L'administration précise que la tolérance ne s'applique normalement pas à l'équipement initial complet ou au renouvellement complet d'un ensemble de mobilier, même lorsque les éléments pris individuellement sont de faible valeur." },
      { type: "formula", text: "Premier ameublement complet → immobilisation généralement appropriée\nRemplacement ponctuel ultérieur d'un petit équipement → charge déductible potentiellement possible" },

      { type: "h1", id: "non-utilises", text: "Que deviennent les amortissements LMNP non utilisés ?" },
      { type: "p", text: "C'est une particularité fondamentale du LMNP. L'amortissement ne peut pas être utilisé librement pour faire basculer le résultat de la location sous zéro. L'article 39 C du CGI limite les amortissements déductibles, pour une location consentie par une personne physique, au montant des loyers diminué des autres charges afférentes aux biens." },
      { type: "formula", text: "Amortissements fiscalement déductibles ≤ loyers − autres charges concernées" },
      { type: "h2", id: "non-utilises-exemple", text: "Exemple" },
      { type: "ul", items: ["Recettes : **12 000 €**", "Charges hors amortissements : **9 000 €**", "Amortissements calculés : **5 000 €**"] },
      { type: "p", text: "Le résultat avant amortissements est de **3 000 €**. L'amortissement utilisable est donc limité à **3 000 €**, ce qui ramène le résultat à **0 €**." },
      { type: "p", text: "Les **2 000 € d'amortissements restants** ne sont pas perdus. Ils sont reportés pour une utilisation ultérieure dans les conditions prévues par l'article 39 C." },

      { type: "h1", id: "deficits", text: "Déficits LMNP et amortissements reportés : quelle différence ?" },
      { type: "p", text: "Il ne faut pas confondre le **déficit LMNP** et l'**amortissement LMNP non déduit**. Ce sont deux mécanismes différents." },
      { type: "h2", id: "deficit-detail", text: "Le déficit LMNP" },
      { type: "p", text: "Un déficit peut apparaître lorsque les charges autres que les amortissements sont supérieures aux recettes. Dans le cadre d'une activité de location meublée non professionnelle, ce déficit n'est pas imputable sur le revenu global du foyer. Il peut en revanche être imputé sur les bénéfices provenant d'activités de location meublée non professionnelle des **dix années suivantes**." },
      { type: "h2", id: "amort-reporte", text: "Les amortissements non déduits" },
      { type: "p", text: "Lorsque le plafond de l'article 39 C empêche de déduire la totalité des amortissements, la fraction restante est conservée et peut être utilisée au cours des exercices suivants dans les mêmes conditions et limites." },
      { type: "table", head: ["Situation", "Durée de report"], rows: [
        ["Déficit LMNP non professionnel", "Jusqu'à 10 ans"],
        ["Amortissement écarté par l'article 39 C", "Report sur les exercices ultérieurs selon l'article 39 C"],
      ]},

      { type: "h1", id: "obligations", text: "Quelles sont les obligations comptables du LMNP au régime réel ?" },
      { type: "p", text: "Choisir le régime réel implique davantage d'obligations comptables que le micro-BIC. Le LMNP doit notamment être capable de justifier ses recettes, dépenses, immobilisations, amortissements, éventuels déficits et amortissements reportés." },
      { type: "p", text: "La déclaration de résultat BIC s'appuie notamment sur la déclaration **2031-SD** et les tableaux **2033-A-SD à 2033-G-SD**. Le résultat fiscal est ensuite reporté dans la déclaration **2042-C-PRO**, dans la rubrique correspondant aux locations meublées non professionnelles au régime réel." },
      { type: "h2", id: "expert-comptable", text: "L'expert-comptable est-il obligatoire ?" },
      { type: "p", text: "Non. Le recours à un expert-comptable n'est pas légalement obligatoire simplement parce qu'un LMNP est imposé au réel. Les obligations comptables et fiscales existent cependant même lorsqu'un propriétaire décide de tenir lui-même sa comptabilité. L'enjeu principal est la **conformité de la comptabilité**, non l'identité de la personne qui l'établit." },

      { type: "h1", id: "impact-revente", text: "Quel est l'impact des amortissements LMNP lors de la revente ?" },
      { type: "p", text: "C'est l'un des changements majeurs intervenus récemment dans la fiscalité du LMNP." },
      { type: "h2", id: "avant-2025", text: "Jusqu'en 2024" },
      { type: "p", text: "Lorsqu'un LMNP revendait son logement en conservant son statut non professionnel, les amortissements pratiqués pendant la location n'augmentaient pas la plus-value immobilière imposable. Cette particularité rendait le régime réel particulièrement favorable : les amortissements réduisaient les revenus imposables sans être repris lors du calcul de la plus-value." },
      { type: "h2", id: "depuis-2025", text: "Depuis le 15 février 2025" },
      { type: "p", text: "La loi de finances pour 2025 a modifié l'article 150 VB du CGI. Pour les cessions réalisées depuis le **15 février 2025**, le prix d'acquisition utilisé pour calculer la plus-value est désormais diminué des amortissements admis en déduction dans les conditions prévues par l'article 39 C." },
      { type: "formula", text: "Plus-value brute LMNP = prix de vente − (prix d'acquisition corrigé − amortissements à réintégrer)" },
      { type: "h2", id: "revente-exemple", text: "Exemple" },
      { type: "ul", items: ["Achat : **200 000 €**", "Revente : **250 000 €**", "Amortissements admis en déduction : **20 000 €**"] },
      { type: "p", text: "Le prix d'acquisition corrigé devient **200 000 − 20 000 = 180 000 €**. La plus-value brute est donc **250 000 − 180 000 = 70 000 €**, au lieu de 50 000 € sans réintégration." },
      { type: "h2", id: "abattements-revente", text: "Les amortissements réintégrés bénéficient-ils des abattements pour durée de détention ?" },
      { type: "note", text: "Oui. Les amortissements réintégrés sont intégrés au calcul de la plus-value avant l'application des abattements pour durée de détention. La plus-value brute globale bénéficie ensuite des abattements du régime des plus-values immobilières des particuliers." },
      { type: "table", head: ["Durée de détention", "Abattement IR", "Abattement prélèvements sociaux"], rows: [
        ["5 ans", "0 %", "0 %"],
        ["10 ans", "30 %", "8,25 %"],
        ["15 ans", "60 %", "16,50 %"],
        ["20 ans", "90 %", "24,75 %"],
        ["22 ans", "100 %", "28 %"],
        ["25 ans", "100 %", "55 %"],
        ["30 ans", "100 %", "100 %"],
      ]},
      { type: "p", text: "Ainsi, même la fraction de plus-value provenant de la réintégration des amortissements voit progressivement son imposition diminuer avec la durée de détention. Les LMNP restent totalement exonérés d'impôt sur la plus-value après **22 ans** et de prélèvements sociaux après **30 ans**." },
      { type: "h2", id: "exceptions-revente", text: "Certaines résidences sont exclues de la nouvelle réintégration" },
      { type: "p", text: "L'article 150 VB prévoit des exceptions pour certaines catégories précises de résidences : certaines résidences destinées aux étudiants, aux personnes âgées ou aux personnes handicapées ainsi que certains établissements médico-sociaux. Il est préférable de vérifier précisément la catégorie juridique de la résidence plutôt que de considérer que toute « résidence services » est automatiquement exonérée." },

      { type: "h1", id: "faq", text: "FAQ sur l'amortissement LMNP" },
      { type: "h2", id: "faq-20ans", text: "Peut-on amortir un logement acheté il y a 20 ans ?" },
      { type: "p", text: "**Oui.** Le fait d'avoir acheté le logement longtemps avant sa mise en location meublée n'empêche pas de l'amortir. L'amortissement débute lorsqu'il est inscrit et mis en service dans le cadre de l'activité LMNP. Lorsqu'un immeuble conservé dans le patrimoine privé est inscrit à l'actif d'une activité, sa valeur d'inscription doit correspondre à sa valeur réelle à cette date." },
      { type: "h2", id: "faq-sans-facture", text: "Je possède déjà des meubles mais je n'ai plus les factures : puis-je les amortir ?" },
      { type: "p", text: "L'absence de facture ne signifie pas qu'un bien ayant une valeur réelle ne peut jamais être inscrit à l'actif. Il faut cependant être capable de **justifier sérieusement sa valeur** : références de prix comparables, photographies, marque et modèle, âge approximatif du mobilier. Une estimation arbitraire sans pièce justificative serait très difficile à défendre." },
      { type: "h2", id: "faq-heritage", text: "J'ai hérité du logement que je loue en LMNP : peut-il être amorti ?" },
      { type: "p", text: "**Oui, sous réserve des règles habituelles.** Le fait qu'un bien ait été reçu par succession n'empêche pas son amortissement. Les actifs acquis à titre gratuit sont valorisés selon leur valeur vénale. Il faudra déterminer correctement la valeur d'entrée, isoler la valeur du terrain, décomposer le bâtiment et appliquer les amortissements correspondants." },
      { type: "h2", id: "faq-usufruit", text: "Je ne possède que l'usufruit du logement : puis-je pratiquer un amortissement ?" },
      { type: "p", text: "La situation est plus technique qu'en pleine propriété. La jurisprudence du Conseil d'État a reconnu qu'un droit d'usufruit limité dans le temps peut présenter un caractère amortissable lorsque sa valeur se déprécie avec le temps. Il ne s'agit toutefois pas de prendre la valeur totale du logement et de l'amortir comme si on en était plein propriétaire. Cette situation mérite une analyse comptable spécifique." },
      { type: "h2", id: "faq-travaux-habitation", text: "J'ai effectué des travaux lorsque j'habitais encore dans le logement. Comment les prendre en compte ?" },
      { type: "p", text: "Lorsque le bien est inscrit dans l'activité LMNP à sa valeur réelle au moment de l'inscription, cette valeur peut déjà refléter les améliorations apportées antérieurement. Il ne faut pas mécaniquement ajouter une seconde fois toutes les factures historiques de travaux, ce qui conduirait à comptabiliser deux fois la même création de valeur." },
      { type: "h2", id: "faq-5ans", text: "Dois-je amortir tous mes meubles sur 5 ans ?" },
      { type: "p", text: "Non. Il n'existe pas de règle imposant automatiquement cinq ans à chaque meuble d'un LMNP. La durée retenue doit être cohérente avec la durée d'utilisation prévisible de l'actif. Un appareil informatique, une literie, un canapé ou un meuble robuste peuvent présenter des durées d'usage différentes." },
      { type: "h2", id: "faq-depense-reelle", text: "Un amortissement LMNP est-il une dépense réelle ?" },
      { type: "p", text: "Pas au moment où il est comptabilisé. L'achat du bien a nécessité une sortie d'argent à un moment donné. L'amortissement consiste ensuite à répartir comptablement le coût correspondant sur plusieurs exercices. Il peut donc diminuer le résultat fiscal **sans entraîner une nouvelle sortie de trésorerie la même année**. C'est la différence essentielle entre le **résultat fiscal LMNP** et le **cash-flow de l'investissement**." },

      { type: "h1", id: "a-retenir", text: "Ce qu'il faut retenir sur l'amortissement LMNP" },
      { type: "ul", items: [
        "**1.** Le régime micro-BIC ne permet pas de déduire individuellement les amortissements LMNP.",
        "**2.** Au régime réel, le logement, le mobilier, certains équipements et certains travaux peuvent être amortis lorsqu'ils sont correctement inscrits à l'actif.",
        "**3.** Le terrain n'est pas amortissable et doit être séparé de la valeur du bâtiment.",
        "**4.** Le bâtiment doit être ventilé entre plusieurs composants ayant des durées d'utilisation différentes.",
        "**5.** Il n'existe pas de tableau universel imposant une durée identique à tous les LMNP : les durées et ventilations doivent être cohérentes et justifiables.",
        "**6.** L'amortissement ne peut pas, dans les conditions de l'article 39 C, être utilisé sans limite pour rendre le résultat négatif.",
        "**7.** Les amortissements non déductibles en raison de cette limitation sont reportés sur les exercices suivants.",
        "**8.** Un déficit LMNP et un stock d'amortissements non utilisés sont deux choses différentes : le déficit LMNP non professionnel est reportable pendant 10 ans, tandis que les amortissements suivent leur propre mécanisme de report.",
        "**9.** La tolérance fiscale applicable aux petits matériels porte sur une valeur de **500 € HT** et ne permet pas de passer artificiellement en charges tout l'équipement initial d'un logement.",
        "**10.** Depuis le 15 février 2025, les amortissements LMNP admis en déduction concernés par l'article 150 VB sont pris en compte lors du calcul de la plus-value immobilière.",
        "**11.** Cette réintégration intervient avant les abattements pour durée de détention : les amortissements réintégrés ne restent donc pas systématiquement taxés quelle que soit la durée de détention.",
        "**12.** Le LMNP bénéficie toujours d'une exonération d'impôt sur le revenu après 22 ans de détention et d'une exonération des prélèvements sociaux après 30 ans.",
      ]},
      { type: "p", text: "L'amortissement LMNP reste un mécanisme particulièrement important pour comprendre la fiscalité d'un investissement meublé. Son impact doit être apprécié sur l'ensemble de la vie de l'investissement : **pendant l'exploitation, lors du calcul du résultat fiscal et désormais également au moment de la revente.**" },
    ],
  },

  "revente-lmnp-2026": {
    titre: "Revente d'un bien LMNP en 2026 : fiscalité, plus-value et amortissements",
    date: "Mis à jour en août 2026",
    intro: [
      "La fiscalité de la revente d'un bien LMNP a profondément évolué depuis 2025. Pendant longtemps, le régime réel LMNP présentait une particularité très favorable : les amortissements utilisés chaque année pour réduire le résultat imposable de la location meublée n'avaient pas d'incidence sur le calcul de la plus-value immobilière lors de la vente.",
      "Cette règle a changé pour les cessions réalisées depuis le 15 février 2025. Pour un LMNP au régime réel, les amortissements admis en déduction doivent désormais être pris en compte dans le calcul de la plus-value. Ils viennent diminuer le prix d'acquisition fiscal du logement, ce qui augmente mécaniquement la plus-value brute.",
      "Cette réforme ne signifie toutefois pas que les amortissements LMNP sont simplement « repris » et taxés intégralement à la revente. Le calcul est plus nuancé : les amortissements augmentent d'abord la plus-value brute, puis les abattements pour durée de détention s'appliquent à l'ensemble de cette plus-value, amortissements réintégrés compris.",
      "En 2026, il faut donc raisonner sur toute la durée de l'investissement LMNP : fiscalité des loyers pendant la détention, amortissements réellement utilisés, durée de conservation du logement et fiscalité de sortie.",
    ],
    sections: [
      { id: "fiscalite-revente", titre: "Quelle fiscalité s'applique lors de la revente d'un LMNP en 2026 ?" },
      { id: "micro-bic-vs-reel", titre: "Micro-BIC ou régime réel : la revente est-elle taxée de la même manière ?" },
      { id: "calcul-pv", titre: "Comment calculer la plus-value d'un bien LMNP en 2026 ?" },
      { id: "impact-amortissements", titre: "Quel impact ont les amortissements LMNP sur la plus-value ?" },
      { id: "frais-deductibles", titre: "Quels frais peuvent réduire la plus-value immobilière ?" },
      { id: "abattements-detention", titre: "Quels abattements s'appliquent selon la durée de détention ?" },
      { id: "exemple-12-ans", titre: "Exemple complet de revente d'un LMNP après 12 ans" },
      { id: "taux-imposition", titre: "Quel taux d'imposition s'applique à la plus-value LMNP ?" },
      { id: "surtaxe", titre: "Existe-t-il une surtaxe sur les plus-values LMNP élevées ?" },
      { id: "amort-toujours-taxes", titre: "Les amortissements LMNP sont-ils toujours taxés à la revente ?" },
      { id: "exonerations", titre: "Quelles exonérations peuvent éviter la taxation de la plus-value ?" },
      { id: "lmnp-vs-jeanbrun-revente", titre: "LMNP et dispositif Jeanbrun : quelle différence à la revente ?" },
      { id: "lmnp-interessant-2026", titre: "Le LMNP reste-t-il fiscalement intéressant en 2026 ?" },
      { id: "faq-revente", titre: "FAQ sur la revente d'un bien LMNP en 2026" },
      { id: "a-retenir-revente", titre: "Ce qu'il faut retenir" },
    ],
    contenu: [
      { type: "h1", id: "fiscalite-revente", text: "Quelle fiscalité s'applique lors de la revente d'un LMNP en 2026 ?" },
      { type: "p", text: "La première règle à comprendre est que la fiscalité applicable à la vente dépend du **statut du propriétaire au moment de la cession**." },
      { type: "p", text: "Si le propriétaire est **Loueur en Meublé Non Professionnel (LMNP)** à la date de la vente, la plus-value relève en principe du régime des **plus-values immobilières des particuliers**. Si le propriétaire est au contraire **Loueur en Meublé Professionnel (LMP)** au moment de la cession, il relève du régime des **plus-values professionnelles**, dont les règles sont différentes." },
      { type: "p", text: "Pour un LMNP classique, le régime applicable à la vente est donc globalement le même que pour la cession d'un logement loué vide, avec depuis 2025 une particularité importante concernant les amortissements du régime réel." },

      { type: "h1", id: "micro-bic-vs-reel", text: "Micro-BIC ou régime réel : la revente est-elle taxée de la même manière ?" },
      { type: "p", text: "Le régime général de plus-value des particuliers s'applique au propriétaire ayant le statut LMNP au jour de la vente, qu'il ait déclaré ses revenus locatifs au micro-BIC ou au réel. Mais le choix du régime fiscal pendant la détention peut désormais avoir un impact direct sur le **montant de la plus-value**." },
      { type: "h2", id: "micro-bic-pv", text: "LMNP au micro-BIC" },
      { type: "p", text: "Au micro-BIC, le propriétaire ne déduit pas individuellement les amortissements du logement. L'administration applique directement un abattement forfaitaire sur les recettes. Il n'existe donc pas d'amortissements LMNP déduits au titre de l'article 39 C à réintégrer dans le calcul de la plus-value." },
      { type: "h2", id: "reel-pv", text: "LMNP au régime réel" },
      { type: "p", text: "Au régime réel, le propriétaire peut pratiquer des amortissements sur le bâtiment, le mobilier et certains autres éléments. Depuis les cessions réalisées à compter du 15 février 2025, les **amortissements admis en déduction** sont pris en compte dans le calcul de la plus-value en diminuant le prix d'acquisition fiscal. Le régime d'imposition des loyers n'est donc pas totalement neutre lors de la revente." },

      { type: "h1", id: "calcul-pv", text: "Comment calculer la plus-value d'un bien LMNP en 2026 ?" },
      { type: "p", text: "Dans une présentation simplifiée, la plus-value immobilière correspond à :" },
      { type: "formula", text: "Plus-value brute = Prix de vente − Prix d'acquisition corrigé" },
      { type: "p", text: "Pour un LMNP au régime réel concerné par la réforme, les amortissements diminuent la valeur fiscale retenue comme prix d'acquisition :" },
      { type: "formula", text: "Plus-value brute LMNP = Prix de vente − (Prix d'acquisition majoré des frais admissibles − amortissements LMNP à réintégrer)" },
      { type: "h2", id: "exemple-simplifie", text: "Exemple simplifié" },
      { type: "p", text: "Un logement acheté **210 000 €**, revendu **270 000 €**, avec **25 000 € d'amortissements LMNP** admis en déduction." },
      { type: "p", text: "Sans réintégration : 270 000 − 210 000 = **60 000 € de plus-value**." },
      { type: "p", text: "Avec le mécanisme actuel : prix d'acquisition fiscal = 210 000 − 25 000 = 185 000 €, puis 270 000 − 185 000 = **85 000 € de plus-value brute**. La réforme augmente ici la plus-value brute de **25 000 €**, soit exactement le montant des amortissements pris en compte." },

      { type: "h1", id: "impact-amortissements", text: "Quel impact ont les amortissements LMNP sur la plus-value ?" },
      { type: "p", text: "L'amortissement permet, pendant l'exploitation du LMNP, de diminuer le résultat BIC imposable. Depuis 2025, les amortissements fiscalement admis réduisent ensuite le prix d'acquisition fiscal lors de la vente. C'est un mécanisme en deux temps." },
      { type: "h2", id: "pendant-detention", text: "Pendant la détention" },
      { type: "p", text: "Les amortissements LMNP peuvent diminuer le bénéfice BIC, réduire l'impôt sur le revenu, et réduire également la base des prélèvements sociaux lorsque ceux-ci sont applicables au bénéfice LMNP." },
      { type: "h2", id: "lors-revente", text: "Lors de la revente" },
      { type: "p", text: "Les amortissements concernés déjà admis en déduction diminuent le prix d'acquisition fiscal et augmentent la plus-value brute, mais **ne sont pas imposés séparément du reste de la plus-value**. Il n'existe pas d'un côté une plus-value classique bénéficiant d'abattements et, de l'autre, une poche d'amortissements qui resterait taxée intégralement. La réintégration intervient **avant l'application de l'abattement pour durée de détention**." },

      { type: "h1", id: "frais-deductibles", text: "Quels frais peuvent réduire la plus-value immobilière ?" },
      { type: "p", text: "Le calcul réel est généralement plus favorable que la formule simplifiée « prix de vente − prix d'achat »." },
      { type: "h2", id: "frais-acq", text: "Les frais d'acquisition" },
      { type: "p", text: "Le prix d'achat peut être majoré des frais d'acquisition pour leur montant réel ou, pour une acquisition à titre onéreux, au moyen d'un **forfait de 7,5 % du prix d'acquisition**. Pour un logement acquis 200 000 €, le forfait représente 200 000 × 7,5 % = **15 000 €**." },
      { type: "h2", id: "travaux", text: "Les travaux" },
      { type: "p", text: "Certaines dépenses de construction, reconstruction, agrandissement ou amélioration peuvent également augmenter le prix d'acquisition. Pour un immeuble bâti détenu depuis plus de **5 ans**, un forfait de **15 % du prix d'acquisition** peut être utilisé dans les conditions prévues, soit 200 000 × 15 % = **30 000 €** dans notre exemple." },
      { type: "h2", id: "frais-vente", text: "Les frais liés à la vente" },
      { type: "p", text: "Certains frais supportés par le vendeur peuvent également réduire le prix de cession pris en compte : frais de diagnostics obligatoires, frais d'agence supportés par le vendeur, frais de mainlevée d'hypothèque. Le calcul définitif d'une plus-value LMNP est donc généralement plus complexe que la formule pédagogique." },

      { type: "h1", id: "abattements-detention", text: "Quels abattements s'appliquent selon la durée de détention ?" },
      { type: "p", text: "Une fois la plus-value brute calculée, des **abattements pour durée de détention** sont appliqués. Ils fonctionnent différemment pour l'impôt sur le revenu et pour les prélèvements sociaux." },
      { type: "h2", id: "abatt-ir", text: "Pour l'impôt sur le revenu" },
      { type: "p", text: "L'abattement est de 0 % pendant les 5 premières années, **6 % par année** de la 6e à la 21e année, puis **4 %** lors de la 22e année. L'exonération totale d'impôt sur le revenu est atteinte après **22 ans de détention**." },
      { type: "h2", id: "abatt-ps", text: "Pour les prélèvements sociaux" },
      { type: "p", text: "L'abattement est de 0 % pendant les 5 premières années, **1,65 % par année** de la 6e à la 21e année, **1,60 %** au titre de la 22e année, puis **9 % par année** de la 23e à la 30e année. L'exonération totale est atteinte après **30 ans de détention**." },
      { type: "table", head: ["Durée de détention", "Abattement IR", "Abattement prélèvements sociaux"], rows: [
        ["5 ans", "0 %", "0 %"],
        ["10 ans", "30 %", "8,25 %"],
        ["12 ans", "42 %", "11,55 %"],
        ["15 ans", "60 %", "16,50 %"],
        ["20 ans", "90 %", "24,75 %"],
        ["22 ans", "**100 %**", "28 %"],
        ["25 ans", "**100 %**", "55 %"],
        ["30 ans", "**100 %**", "**100 %**"],
      ]},

      { type: "h1", id: "exemple-12-ans", text: "Exemple complet de revente d'un LMNP après 12 ans" },
      { type: "p", text: "Prix d'acquisition : **210 000 €**, prix de vente : **270 000 €**, amortissements LMNP réintégrés : **25 000 €**, durée de détention : **12 ans**. Pour faciliter la lecture, les frais d'acquisition, travaux et frais de cession ne sont pas pris en compte ici." },
      { type: "h2", id: "etape1", text: "Étape 1 : calcul de la plus-value brute" },
      { type: "formula", text: "Prix d'acquisition corrigé : 210 000 − 25 000 = 185 000 €\nPlus-value brute : 270 000 − 185 000 = 85 000 €" },
      { type: "h2", id: "etape2", text: "Étape 2 : abattement pour l'impôt sur le revenu" },
      { type: "p", text: "Après 12 années, 7 années ouvrent droit à l'abattement de 6 % : 7 × 6 % = **42 %**. Plus-value taxable à l'IR : 85 000 × 58 % = **49 300 €**. Impôt à 19 % : 49 300 × 19 % = **9 367 €**." },
      { type: "h2", id: "etape3", text: "Étape 3 : prélèvements sociaux" },
      { type: "p", text: "Abattement : 7 × 1,65 % = **11,55 %**. Base taxable : 85 000 × 88,45 % = **75 182,50 €**. Les plus-values immobilières restent soumises à **17,2 % de prélèvements sociaux** en 2026 : 75 182,50 × 17,2 % = **12 931 €**." },
      { type: "h2", id: "total-exemple", text: "Fiscalité simplifiée totale" },
      { type: "p", text: "Impôt sur le revenu : **9 367 €** + prélèvements sociaux : **12 931 €** = environ **22 298 €**. Cette simulation reste volontairement simplifiée — dans une véritable vente, les frais d'acquisition, travaux admissibles et frais de vente peuvent modifier fortement le résultat." },

      { type: "h1", id: "taux-imposition", text: "Quel taux d'imposition s'applique à la plus-value LMNP ?" },
      { type: "p", text: "Après application des abattements pour durée de détention, les taux restent en 2026 : **19 % d'impôt sur le revenu** et **17,2 % de prélèvements sociaux**, soit un taux facial cumulé de **36,2 %** avant prise en compte des abattements, exonérations et éventuelle taxe supplémentaire." },
      { type: "note", text: "Depuis 2026, certains revenus courants de location meublée supportent un taux de 18,6 % de prélèvements sociaux. Mais la plus-value immobilière LMNP relevant du régime des particuliers reste soumise à **17,2 % de prélèvements sociaux**. Les deux fiscalités doivent être distinguées." },

      { type: "h1", id: "surtaxe", text: "Existe-t-il une surtaxe sur les plus-values LMNP élevées ?" },
      { type: "p", text: "Oui. Une taxe supplémentaire peut s'appliquer lorsque la **plus-value immobilière nette imposable à l'impôt sur le revenu** dépasse **50 000 €**. Elle est distincte de l'impôt à 19 % et des prélèvements sociaux. Son taux évolue progressivement et peut atteindre **6 %** pour les plus-values imposables les plus élevées. Le calcul comporte des mécanismes de lissage à certains seuils et dépend du montant exact de la plus-value nette imposable." },

      { type: "h1", id: "amort-toujours-taxes", text: "Les amortissements LMNP sont-ils toujours taxés à la revente ?" },
      { type: "p", text: "**Non.** C'est probablement le point le plus important à comprendre depuis la réforme. Les amortissements réintégrés augmentent la plus-value brute, mais bénéficient ensuite des abattements liés à la durée de détention comme le reste de la plus-value." },
      { type: "ul", items: [
        "Après **20 ans** : 90 % d'abattement pour l'IR, 24,75 % pour les prélèvements sociaux.",
        "Après **22 ans** : plus aucun impôt sur le revenu sur la plus-value.",
        "Après **30 ans** : plus aucun prélèvement social non plus.",
      ]},
      { type: "p", text: "La fraction de plus-value provenant des amortissements LMNP n'est donc pas une somme qui resterait taxable indéfiniment." },

      { type: "h1", id: "exonerations", text: "Quelles exonérations peuvent éviter la taxation de la plus-value ?" },
      { type: "p", text: "La durée de détention n'est pas le seul cas d'exonération. Le régime des plus-values immobilières des particuliers prévoit différentes situations permettant une exonération totale ou partielle. La plus connue concerne la **résidence principale** : la cession de la résidence principale du vendeur est en principe exonérée. D'autres exonérations existent sous conditions pour certaines premières cessions, certaines ventes d'un montant limité, certains contribuables non-résidents, ou certaines opérations particulières prévues par le CGI." },
      { type: "note", text: "Il ne suffit pas de cesser la location LMNP quelques semaines avant la vente pour rendre automatiquement le logement exonéré au titre de la résidence principale : les conditions de l'exonération doivent réellement être remplies." },

      { type: "h1", id: "lmnp-vs-jeanbrun-revente", text: "LMNP et dispositif Jeanbrun : quelle différence à la revente ?" },
      { type: "p", text: "La loi de finances pour 2026 a créé **Relance logement** (dispositif Jeanbrun), réservé à certains logements loués **nus** répondant à des conditions précises : logements collectifs acquis entre le 21 février 2026 et le 31 décembre 2028, travaux représentant au moins 30 % du prix pour l'ancien, location nue comme résidence principale pendant au moins 9 ans, plafonds de loyers à respecter." },
      { type: "table", head: ["Critère", "LMNP au réel", "Relance logement / Jeanbrun"], rows: [
        ["Type de location", "Meublée", "Nue"],
        ["Fiscalité des loyers", "BIC", "Revenus fonciers"],
        ["Amortissement", "Comptable", "Forfaitaire selon le dispositif"],
        ["Plafond de loyer propre au régime", "Non", "Oui"],
        ["Plafond de ressources du locataire", "Non", "Oui"],
        ["Engagement spécifique de location", "Aucun", "9 ans"],
        ["Mobilier obligatoire", "Oui", "Non"],
      ]},
      { type: "p", text: "Il faut noter qu'en 2026, l'article 150 VB prévoit désormais que le prix d'acquisition est minoré non seulement des amortissements LMNP (article 39 C) mais également des amortissements correspondant au nouveau dispositif de location nue. La question de la fiscalité de sortie ne concerne donc plus uniquement le LMNP." },

      { type: "h1", id: "lmnp-interessant-2026", text: "Le LMNP reste-t-il fiscalement intéressant en 2026 ?" },
      { type: "p", text: "La réforme de la plus-value rend le régime réel LMNP **moins favorable à la revente qu'avant le 15 février 2025**, puisqu'un avantage auparavant définitivement acquis peut désormais augmenter la plus-value brute au moment de la vente. Cela ne signifie pas pour autant que l'amortissement ne présente plus d'intérêt. Pour mesurer son effet réel, il faut comparer sur toute la période de détention :" },
      { type: "ul", items: [
        "l'économie d'impôt obtenue chaque année grâce aux amortissements ;",
        "le montant des amortissements réellement admis en déduction ;",
        "la fiscalité supplémentaire potentielle à la revente ;",
        "la durée de détention et les abattements applicables ;",
        "les frais et travaux pouvant augmenter le prix d'acquisition fiscal ;",
        "l'évolution de la valeur du bien.",
      ]},
      { type: "h2", id: "plafond-art39c", text: "L'amortissement LMNP n'est pas sans limite" },
      { type: "p", text: "Au régime réel, l'amortissement d'un bien loué par une personne physique est admis en déduction dans la limite du loyer diminué des autres charges afférentes au bien (article 39 C). Il ne peut donc pas être utilisé librement pour créer un déficit fiscal par les seuls amortissements — la fraction non déductible peut être reportée. Cette règle existait déjà avant la réforme de la plus-value." },
      { type: "h2", id: "souplesse-lmnp", text: "Le LMNP conserve une souplesse locative importante" },
      { type: "p", text: "Le LMNP permet d'utiliser différents types de location meublée selon le logement et la situation : bail meublé classique, bail étudiant, bail mobilité, location saisonnière lorsque la réglementation locale le permet. Les locations meublées à usage de résidence principale peuvent toutefois être concernées par les règles d'**encadrement des loyers** dans les zones tendues — le LMNP ne prévoit pas de plafond national comparable au dispositif Jeanbrun, mais des contraintes locales peuvent s'appliquer." },

      { type: "h1", id: "faq-revente", text: "FAQ sur la revente d'un bien LMNP en 2026" },
      { type: "h2", id: "faq-reintegration", text: "Les amortissements LMNP doivent-ils être réintégrés à la revente ?" },
      { type: "p", text: "Oui, pour les **LMNP relevant d'un régime BIC réel**, concernant les amortissements admis en déduction visés par la réforme. La mesure s'applique aux cessions réalisées à compter du **15 février 2025**." },
      { type: "h2", id: "faq-micro-bic-reint", text: "Un LMNP au micro-BIC doit-il réintégrer des amortissements ?" },
      { type: "p", text: "Le micro-BIC ne permet pas de pratiquer individuellement des amortissements déductibles. La réforme vise les amortissements effectivement admis en déduction, notamment dans le cadre de l'article 39 C. La problématique de réintégration concerne donc essentiellement le **LMNP au réel**." },
      { type: "h2", id: "faq-tous-amort", text: "Tous les amortissements comptabilisés sont-ils nécessairement réintégrés ?" },
      { type: "p", text: "La règle vise les **amortissements admis en déduction** dans les conditions prévues par le CGI. Il faut donc distinguer le montant comptabilisé du montant effectivement fiscalement admis en déduction." },
      { type: "h2", id: "faq-abatt-amort", text: "Les amortissements réintégrés bénéficient-ils de l'abattement pour durée de détention ?" },
      { type: "p", text: "**Oui.** L'administration indique que leur prise en compte intervient avant l'application de l'abattement pour durée de détention." },
      { type: "h2", id: "faq-taux-pv", text: "Quel est le taux de taxation de la plus-value LMNP ?" },
      { type: "p", text: "Après abattement : **19 % d'impôt sur le revenu** et **17,2 % de prélèvements sociaux**. Une taxe supplémentaire peut être due lorsque la plus-value nette imposable dépasse 50 000 €." },
      { type: "h2", id: "faq-186-pv", text: "Le nouveau taux de 18,6 % s'applique-t-il à la plus-value LMNP ?" },
      { type: "p", text: "Non. Le taux de 18,6 % concerne certains revenus courants de location meublée. La plus-value immobilière relevant du régime des particuliers reste soumise à **17,2 % de prélèvements sociaux**." },
      { type: "h2", id: "faq-exo-duree", text: "Au bout de combien de temps la plus-value LMNP est-elle exonérée ?" },
      { type: "p", text: "L'exonération totale intervient après **22 ans** pour l'impôt sur le revenu et après **30 ans** pour les prélèvements sociaux." },
      { type: "h2", id: "faq-30ans", text: "Les amortissements sont-ils encore taxés après 30 ans ?" },
      { type: "p", text: "Non. Après 30 ans de détention, l'abattement est de 100 % pour l'impôt sur le revenu comme pour les prélèvements sociaux. La plus-value est exonérée au titre de la durée de détention, y compris pour la fraction résultant de la prise en compte des amortissements." },
      { type: "h2", id: "faq-forfait-travaux", text: "Peut-on utiliser le forfait travaux de 15 % pour un LMNP ?" },
      { type: "p", text: "Le régime général des plus-values immobilières permet, pour un immeuble bâti détenu depuis plus de cinq ans, d'appliquer sous les conditions prévues un forfait travaux égal à **15 % du prix d'acquisition**. Le calcul doit toutefois tenir compte des règles particulières introduites pour les amortissements afin d'éviter une mauvaise prise en compte d'une même dépense." },
      { type: "h2", id: "faq-notaire", text: "Qui calcule la plus-value lors de la vente ?" },
      { type: "p", text: "Pour une vente immobilière classique soumise à la fiscalité des particuliers, le calcul, la déclaration et le paiement de la plus-value sont généralement réalisés dans le cadre de l'acte de vente, sous la responsabilité du **notaire**. Le propriétaire reçoit donc normalement le prix de vente après prise en compte de l'imposition due." },

      { type: "h1", id: "a-retenir-revente", text: "Ce qu'il faut retenir sur la revente d'un LMNP en 2026" },
      { type: "ul", items: [
        "**1.** Un propriétaire qui est LMNP au moment de la vente relève en principe du régime des plus-values immobilières des particuliers.",
        "**2.** Depuis le 15 février 2025, les amortissements LMNP concernés et admis en déduction au régime réel diminuent le prix d'acquisition fiscal et augmentent donc la plus-value brute.",
        "**3.** La réforme concerne principalement les LMNP au régime réel, puisque le micro-BIC ne repose pas sur la déduction individuelle d'amortissements.",
        "**4.** La formule « prix de vente − prix d'achat + amortissements » est seulement une approximation pédagogique. Le véritable calcul peut intégrer des frais d'acquisition, des travaux admissibles et certains frais de cession.",
        "**5.** Les frais d'acquisition peuvent être retenus pour leur montant réel ou au moyen d'un **forfait de 7,5 %** du prix d'achat.",
        "**6.** Pour un immeuble bâti détenu depuis plus de cinq ans, un **forfait travaux de 15 %** peut être disponible dans les conditions prévues.",
        "**7.** Les amortissements réintégrés bénéficient des **mêmes abattements pour durée de détention** que le reste de la plus-value.",
        "**8.** L'exonération est totale après **22 ans** pour l'impôt sur le revenu et après **30 ans** pour les prélèvements sociaux.",
        "**9.** Le taux de prélèvements sociaux applicable à la plus-value immobilière reste de **17,2 % en 2026**, même si les prélèvements sociaux sur certains revenus courants LMNP sont désormais de 18,6 %.",
        "**10.** Une taxe supplémentaire peut s'appliquer lorsque la plus-value nette imposable dépasse **50 000 €**, selon un barème pouvant atteindre 6 %.",
        "**11.** Le régime réel LMNP conserve son mécanisme d'amortissement, mais celui-ci n'est pas sans limite : l'article 39 C encadre le montant fiscalement déductible chaque année.",
        "**12.** La fiscalité du LMNP doit désormais être analysée sur **l'ensemble de la durée de l'investissement**, et non uniquement à partir de l'économie d'impôt obtenue sur les loyers.",
      ]},
    ],
  },

  "actualite-lmnp-2026": {
    titre: "Actualité LMNP 2026 : Ce qui change vraiment pour les bailleurs",
    date: "Mis à jour en août 2026",
    intro: [
      "L'année 2026 apporte plusieurs évolutions importantes pour les propriétaires qui louent un logement meublé sous le statut LMNP (Loueur en Meublé Non Professionnel). Mais contrairement à certaines annonces laissant penser à une réforme complète du LMNP, le fonctionnement général de la location meublée n'a pas été bouleversé.",
      "Le régime réel LMNP, la possibilité d'amortir le logement et le mobilier, le statut fiscal de Loueur en Meublé Non Professionnel ou encore le principe d'imposition des recettes en BIC sont toujours en place.",
      "En revanche, plusieurs changements méritent réellement l'attention des bailleurs en 2026 : le plafond du micro-BIC est revalorisé pour certaines locations meublées, le taux des prélèvements sociaux applicable aux revenus LMNP a évolué, la réintégration des amortissements dans la plus-value instaurée en 2025 continue de produire ses effets, et la loi de finances pour 2026 crée le dispositif Relance logement (dit dispositif Jeanbrun) permettant désormais dans certaines conditions d'amortir un logement loué vide.",
      "Le point complet sur ce qui change réellement pour le LMNP en 2026, et sur ce qui, au contraire, reste inchangé.",
    ],
    sections: [
      { id: "coup-doeil-2026", titre: "LMNP 2026 : les principaux changements en un coup d'œil" },
      { id: "statut-remis-en-cause", titre: "Le statut LMNP est-il remis en cause en 2026 ?" },
      { id: "micro-bic-plafond", titre: "Micro-BIC LMNP : le plafond passe à 83 600 € en 2026" },
      { id: "prelevements-sociaux", titre: "Prélèvements sociaux : un taux de 18,6 % pour les revenus LMNP" },
      { id: "amortissement-reel-2026", titre: "Régime réel LMNP : l'amortissement reste-t-il possible en 2026 ?" },
      { id: "plus-value-reforme", titre: "Plus-value LMNP : la réforme des amortissements de 2025 reste applicable" },
      { id: "dispositif-jeanbrun", titre: "Dispositif Jeanbrun : la location vide peut désormais bénéficier d'un amortissement" },
      { id: "lmnp-vs-jeanbrun", titre: "LMNP ou dispositif Jeanbrun : quelles différences ?" },
      { id: "location-saisonniere-2026", titre: "Location saisonnière : ce qui évolue en 2026" },
      { id: "enregistrement-tourisme", titre: "Enregistrement national des meublés de tourisme : où en est-on réellement ?" },
      { id: "lmnp-non-resident", titre: "LMNP non-résident : une nouvelle règle en 2026" },
      { id: "echeances-fiscales", titre: "Les échéances fiscales LMNP à retenir en 2026" },
      { id: "faq-lmnp-2026", titre: "FAQ : les principales questions sur le LMNP en 2026" },
      { id: "a-retenir-2026", titre: "Ce qu'il faut retenir du LMNP en 2026" },
    ],
    contenu: [
      { type: "h1", id: "coup-doeil-2026", text: "LMNP 2026 : les principaux changements en un coup d'œil" },
      { type: "p", text: "Voici les principales règles à connaître en 2026." },
      { type: "table", head: ["Sujet", "Situation en 2026"], rows: [
        ["Statut LMNP", "**Maintenu**"],
        ["Seuil LMNP / LMP", "**23 000 € + comparaison avec les autres revenus d'activité : principe maintenu**"],
        ["Micro-BIC location meublée classique", "**Plafond porté à 83 600 € pour les recettes 2026**"],
        ["Micro-BIC meublé de tourisme classé", "**83 600 € / abattement 50 %**"],
        ["Micro-BIC tourisme non classé", "**15 000 € / abattement 30 %**"],
        ["Régime réel LMNP", "**Maintenu**"],
        ["Amortissement LMNP", "**Maintenu**"],
        ["Réintégration des amortissements à la revente", "**Oui, depuis les ventes réalisées à compter du 15 février 2025**"],
        ["Abattements sur la plus-value", "**Maintenus : exonération IR après 22 ans, prélèvements sociaux après 30 ans**"],
        ["Prélèvements sociaux sur revenus LMNP", "**18,6 % dans le cas général en 2026**"],
        ["Nouveau dispositif Jeanbrun", "**Oui, mais réservé à la location nue répondant aux conditions du dispositif**"],
        ["Enregistrement national des meublés touristiques", "**Déploiement prévu au 4e trimestre 2026**"],
        ["Limitation résidence principale en touristique", "**Possibilité pour les communes d'abaisser à 90 jours/an**"],
      ]},
      { type: "p", text: "Ces évolutions montrent que le **LMNP reste bien en vigueur en 2026**, mais que son environnement fiscal et réglementaire continue de se transformer." },

      { type: "h1", id: "statut-remis-en-cause", text: "Le statut LMNP est-il remis en cause en 2026 ?" },
      { type: "p", text: "**Non.** La loi de finances pour 2026 n'a pas supprimé le statut LMNP et n'a pas profondément modifié les deux critères permettant de distinguer un LMNP d'un LMP pour les contribuables résidents en France." },
      { type: "p", text: "La location meublée devient professionnelle lorsque les deux conditions suivantes sont simultanément réunies :" },
      { type: "ul", items: [
        "les recettes annuelles de location meublée du foyer dépassent **23 000 €** ;",
        "ces recettes dépassent également les autres revenus professionnels du foyer fiscal entrant dans les catégories prévues par l'article 155 du CGI.",
      ]},
      { type: "p", text: "Il suffit donc qu'une de ces deux conditions ne soit pas remplie pour que l'activité reste fiscalement **LMNP**." },
      { type: "h2", id: "exemple-seuil", text: "Exemple" },
      { type: "p", text: "Un propriétaire perçoit en 2026 **31 000 € de recettes LMNP** et **52 000 € de salaires**. Les recettes locatives dépassent 23 000 €, mais elles restent inférieures aux autres revenus professionnels. Le propriétaire reste donc **LMNP**." },
      { type: "p", text: "À l'inverse, avec **36 000 € de recettes meublées** et **28 000 € d'autres revenus professionnels**, les deux conditions étant réunies, l'activité devient fiscalement professionnelle. Le seuil de **23 000 € n'est donc pas, à lui seul, un plafond absolu du LMNP**." },

      { type: "h1", id: "micro-bic-plafond", text: "Micro-BIC LMNP : le plafond passe à 83 600 € en 2026" },
      { type: "p", text: "C'est l'une des évolutions concrètes à connaître. Pour les **recettes perçues en 2026**, le plafond général du régime micro-BIC applicable notamment aux locations meublées de longue durée, aux meublés de tourisme classés et aux chambres d'hôtes est désormais fixé à **83 600 €**, contre 77 700 € auparavant. Cette augmentation provient de la revalorisation périodique des seuils du régime micro prévue par l'article 50-0 du CGI." },
      { type: "table", head: ["Type de location meublée", "Plafond 2026", "Abattement"], rows: [
        ["Location meublée longue durée", "83 600 €", "50 %"],
        ["Meublé de tourisme classé", "83 600 €", "50 %"],
        ["Chambre d'hôtes", "83 600 €", "50 %"],
        ["Meublé de tourisme non classé", "15 000 €", "30 %"],
      ]},
      { type: "p", text: "Le plafond de **15 000 €** applicable au meublé de tourisme non classé n'est pas concerné par cette revalorisation. L'article 50-0 prévoit expressément une exception pour ce seuil." },
      { type: "h2", id: "confusion-annees", text: "Attention à ne pas confondre recettes 2025 et recettes 2026" },
      { type: "p", text: "Les revenus perçus en **2025** et déclarés au printemps **2026** restent soumis aux règles correspondant à l'année 2025. Les recettes perçues en **2026** seront déclarées au printemps **2027** et bénéficient des nouveaux seuils applicables à 2026." },

      { type: "h1", id: "prelevements-sociaux", text: "Prélèvements sociaux : un taux de 18,6 % pour les revenus LMNP" },
      { type: "p", text: "Le taux global des prélèvements sociaux applicable aux revenus de **location meublée non professionnelle** est désormais présenté par l'administration fiscale à **18,6 %**, composé de CSG (10,6 %), CRDS (0,5 %) et prélèvement de solidarité (7,5 %). La DGFiP distingue désormais clairement la location nue (17,2 %) et la location meublée (18,6 %). Ces prélèvements sont calculés sur le **revenu net fiscal**." },
      { type: "h2", id: "exemple-micro-bic-ps", text: "Exemple au micro-BIC LMNP" },
      { type: "p", text: "Un appartement loué à l'année génère **20 000 € de recettes**. Avec l'abattement micro-BIC de 50 %, la base taxable est de **10 000 €**. Les prélèvements sociaux à 18,6 % représentent donc **1 860 €**." },
      { type: "note", text: "Il faut distinguer les prélèvements sociaux sur les **revenus locatifs LMNP** (18,6 %) de ceux sur la **plus-value immobilière** à la revente (17,2 %). Il ne faut donc pas appliquer automatiquement le taux de 18,6 % à la plus-value immobilière d'un LMNP." },

      { type: "h1", id: "amortissement-reel-2026", text: "Régime réel LMNP : l'amortissement reste-t-il possible en 2026 ?" },
      { type: "p", text: "**Oui.** Le régime réel LMNP continue en 2026 de permettre la déduction de charges et la comptabilisation d'amortissements. Un LMNP au réel peut notamment prendre en compte, sous réserve des règles fiscales applicables : les intérêts d'emprunt, certaines assurances, les charges de copropriété, la taxe foncière, la CFE, certaines dépenses d'entretien, les frais de gestion et de comptabilité, l'amortissement du bâtiment hors terrain, l'amortissement du mobilier, et l'amortissement de certains équipements et travaux." },
      { type: "h2", id: "pas-plafond-jeanbrun", text: "L'amortissement LMNP n'est pas soumis au plafond du dispositif Jeanbrun" },
      { type: "p", text: "C'est une distinction importante. Le nouveau dispositif créé par la loi de finances 2026 prévoit un amortissement forfaitaire plafonné pour certains logements loués **nus**. Ces règles ne remplacent pas le système d'amortissement comptable applicable au régime réel LMNP. Un propriétaire ne doit donc pas appliquer au LMNP le forfait terrain de 20 %, les taux de 3 % ou 3,5 %, ni le plafond annuel de 8 000 € à 12 000 € : ces règles appartiennent à un dispositif distinct réservé à la **location nue éligible**." },

      { type: "h1", id: "plus-value-reforme", text: "Plus-value LMNP : la réforme des amortissements de 2025 reste applicable" },
      { type: "p", text: "Depuis les cessions réalisées à compter du **15 février 2025**, certains amortissements LMNP admis en déduction doivent être pris en compte dans le calcul de la plus-value immobilière. Le mécanisme consiste à diminuer le prix d'acquisition fiscal du montant des amortissements concernés." },
      { type: "formula", text: "Plus-value brute = Prix de vente − (Prix d'acquisition − amortissements à réintégrer)" },
      { type: "h2", id: "exemple-pv", text: "Exemple" },
      { type: "p", text: "Un investisseur acquiert un appartement **230 000 €** et le revend **290 000 €**. Les amortissements concernés admis en déduction s'élèvent à **26 000 €**. Sans réintégration : 290 000 − 230 000 = **60 000 €**. Avec la règle actuelle : 290 000 − (230 000 − 26 000) = **86 000 €**." },
      { type: "h2", id: "abattements-maintenus", text: "Les abattements pour durée de détention restent applicables" },
      { type: "p", text: "Les amortissements ne forment pas une partie de la plus-value systématiquement taxée sans abattement. Ils interviennent dans le calcul de la plus-value brute, puis les abattements pour durée de détention s'appliquent. Le LMNP conserve donc l'exonération complète d'impôt sur le revenu sur la plus-value après **22 ans** et l'exonération complète des prélèvements sociaux sur la plus-value après **30 ans**." },

      { type: "h1", id: "dispositif-jeanbrun", text: "Dispositif Jeanbrun : la location vide peut désormais bénéficier d'un amortissement" },
      { type: "p", text: "La grande nouveauté immobilière de la loi de finances 2026 ne concerne pas directement le LMNP. Elle concerne la **location nue**. Le dispositif officiellement présenté comme **Relance logement**, souvent appelé dispositif ou statut **Jeanbrun**, permet à certains investisseurs de pratiquer un amortissement sur des logements loués nus sous conditions. Il concerne les investissements éligibles réalisés du **21 février 2026 au 31 décembre 2028**." },
      { type: "h2", id: "conditions-jeanbrun", text: "Quelles sont les conditions principales du dispositif Jeanbrun ?" },
      { type: "p", text: "Le dispositif vise des logements situés dans des **bâtiments d'habitation collectifs**. Le propriétaire doit notamment louer le logement **nu** pour en faire la résidence principale du locataire, respecter des plafonds de loyers et de ressources, prendre un engagement de location d'au moins **9 ans**, et ne pas louer à un membre proche de son foyer fiscal. Pour un logement ancien, les travaux d'amélioration doivent représenter **au moins 30 % du prix d'acquisition**." },
      { type: "h2", id: "taux-jeanbrun", text: "Quel amortissement permet le dispositif Jeanbrun ?" },
      { type: "p", text: "La valeur foncière est fixée forfaitairement à **20 %**, la base amortissable représentant donc **80 %** de la valeur retenue." },
      { type: "table", head: ["Type de logement", "Type de loyer", "Taux annuel"], rows: [
        ["Logement neuf", "Intermédiaire", "3,5 %"],
        ["Logement neuf", "Social", "4,5 %"],
        ["Logement neuf", "Très social", "5,5 %"],
        ["Logement ancien éligible", "Intermédiaire", "3 %"],
        ["Logement ancien éligible", "Social", "3,5 %"],
        ["Logement ancien éligible", "Très social", "4 %"],
      ]},
      { type: "p", text: "La somme des amortissements est plafonnée à **8 000 € par an et par foyer fiscal** dans le cas général, jusqu'à 10 000 € ou 12 000 € sous les conditions prévues pour la location sociale ou très sociale." },

      { type: "h1", id: "lmnp-vs-jeanbrun", text: "LMNP ou dispositif Jeanbrun : quelles différences ?" },
      { type: "p", text: "L'arrivée de Relance logement réduit en partie l'écart fiscal entre location vide et location meublée, mais les deux systèmes restent très différents." },
      { type: "table", head: ["Critère", "LMNP au réel", "Relance logement / Jeanbrun"], rows: [
        ["Type de location", "Meublée", "Nue"],
        ["Catégorie fiscale", "BIC", "Revenus fonciers"],
        ["Amortissement", "Comptable, par actifs/composants", "Forfaitaire selon le dispositif"],
        ["Terrain", "Non amortissable, valorisation à déterminer", "Forfait légal de 20 %"],
        ["Plafond annuel d'amortissement", "Non", "Oui (8 000 € à 12 000 €)"],
        ["Plafond de loyer", "Non, hors réglementation locale", "Oui"],
        ["Ressources du locataire", "Pas de plafond LMNP général", "Plafonds à respecter"],
        ["Engagement minimal", "Non au titre du LMNP lui-même", "9 ans"],
        ["Mobilier", "Obligatoire", "Location nue"],
      ]},
      { type: "p", text: "Le nouveau dispositif ne transforme donc pas le LMNP en régime obsolète. Il crée surtout une **nouvelle alternative fiscale en location nue** pour certains investissements répondant à un cahier des charges précis." },

      { type: "h1", id: "location-saisonniere-2026", text: "Location saisonnière : ce qui évolue en 2026" },
      { type: "p", text: "Les évolutions les plus importantes du marché de la location meublée touristique résultent en grande partie de la loi du **19 novembre 2024** (loi Le Meur), dont plusieurs effets continuent à se déployer en 2026." },
      { type: "h2", id: "pouvoirs-communes", text: "Les communes disposent de davantage de pouvoirs" },
      { type: "p", text: "Elles peuvent notamment instaurer ou renforcer des dispositifs de régulation, fixer des quotas de meublés touristiques dans certaines zones, réserver certaines zones au logement constituant une résidence principale, encadrer davantage les changements d'usage, et réduire le nombre maximal de jours pendant lesquels une résidence principale peut être louée en touristique." },
      { type: "h2", id: "limite-90-jours", text: "Une résidence principale peut être limitée à 90 jours de location touristique" },
      { type: "p", text: "Le principe national reste une limite de **120 jours par année civile** pour la location touristique d'une résidence principale. Mais la commune peut désormais décider, par délibération motivée, d'abaisser cette limite jusqu'à **90 jours par an**. Un propriétaire LMNP en location saisonnière doit vérifier les règles locales applicables au lieu de situation de son bien." },
      { type: "h2", id: "dpe-tourisme", text: "DPE et meublés de tourisme" },
      { type: "p", text: "La loi Le Meur a également rapproché progressivement la réglementation énergétique des meublés de tourisme de celle du parc locatif traditionnel. Pour certains logements touristiques soumis à autorisation de changement d'usage, le DPE intervient désormais dans l'accès à la location. Depuis 2025, les logements classés **G** sont concernés par les restrictions prévues, puis le calendrier se renforce progressivement jusqu'en 2034." },

      { type: "h1", id: "enregistrement-tourisme", text: "Enregistrement national des meublés de tourisme : où en est-on réellement ?" },
      { type: "p", text: "La loi Le Meur prévoyait initialement l'entrée en vigueur du système national d'enregistrement au plus tard le **20 mai 2026**. Cependant, le déploiement pratique du nouveau téléservice national n'est pas encore généralisé à la date de rédaction. La Direction générale des Entreprises indique désormais que le **téléservice national doit être mis en service au quatrième trimestre 2026**." },
      { type: "p", text: "Service-Public précisait encore le 27 juillet 2026 que l'enregistrement n'était à ce stade obligatoire que dans certaines communes et que l'obligation généralisée interviendrait lors de la mise en service du téléservice national." },
      { type: "h2", id: "pratique-aout-2026", text: "Concrètement en août 2026" },
      { type: "p", text: "Un propriétaire exploitant un meublé touristique doit : (1) vérifier immédiatement la procédure applicable dans sa commune, (2) respecter les éventuelles obligations locales déjà existantes, et (3) surveiller la mise en service du téléservice national annoncée pour le quatrième trimestre 2026." },

      { type: "h1", id: "lmnp-non-resident", text: "LMNP non-résident : une nouvelle règle en 2026" },
      { type: "p", text: "La loi de finances 2026 apporte une modification pour les propriétaires qui **ne sont pas résidents fiscaux de France**. Pour déterminer si leur activité de location meublée est professionnelle ou non professionnelle, l'article 155 du CGI prévoit désormais que les recettes de location meublée doivent être comparées aux revenus professionnels de même nature soumis à un impôt équivalent à l'impôt sur le revenu dans **l'État de résidence du contribuable**." },
      { type: "p", text: "En pratique, cette réforme peut permettre à certains contribuables établis à l'étranger de conserver plus facilement leur qualification de **LMNP**. Service-Public présente cette règle comme applicable à partir des revenus **2026**." },

      { type: "h1", id: "echeances-fiscales", text: "Les échéances fiscales LMNP à retenir en 2026" },
      { type: "h2", id: "declaration-reel", text: "Déclaration LMNP au régime réel" },
      { type: "p", text: "Pour les résultats BIC de **2025**, la date professionnelle de référence était fixée au **5 mai 2026**, avec le délai supplémentaire applicable aux téléprocédures. La déclaration de revenus des particuliers est ensuite intervenue selon le calendrier du printemps 2026. Les recettes générées pendant l'année **2026** seront déclarées en **2027**." },
      { type: "h2", id: "cfe-2026", text: "CFE 2026" },
      { type: "p", text: "Lorsque le LMNP est redevable de la CFE, la date limite de paiement du solde est fixée au **15 décembre 2026** pour les contribuables concernés n'ayant pas recours à certains modes de prélèvement. La CFE n'est toutefois pas automatiquement due dans toutes les situations de location meublée." },
      { type: "h2", id: "taxe-habitation-2026", text: "Taxe d'habitation" },
      { type: "p", text: "La taxe d'habitation peut subsister dans certaines situations, notamment lorsqu'un logement reste à la disposition personnelle du propriétaire. La date de paiement dépend de l'avis reçu ; le calendrier fiscal prévoit notamment des échéances en décembre 2026." },

      { type: "h1", id: "faq-lmnp-2026", text: "FAQ : les principales questions sur le LMNP en 2026" },
      { type: "h2", id: "faq-supprime", text: "Le LMNP est-il supprimé en 2026 ?" },
      { type: "p", text: "**Non.** Le statut fiscal LMNP continue d'exister. La location meublée reste imposée en BIC et les propriétaires peuvent toujours relever du micro-BIC ou du régime réel." },
      { type: "h2", id: "faq-seuil-23k", text: "Le seuil LMNP de 23 000 € change-t-il en 2026 ?" },
      { type: "p", text: "Pour les résidents fiscaux français, le seuil reste **23 000 €**. Il ne suffit cependant pas à lui seul à déterminer le passage en LMP : les recettes doivent également dépasser les autres revenus d'activité du foyer." },
      { type: "h2", id: "faq-83600", text: "Le plafond micro-BIC passe-t-il à 83 600 € ?" },
      { type: "p", text: "**Oui, pour les recettes 2026 relevant de la catégorie générale.** Cela concerne notamment la location meublée longue durée, les meublés de tourisme classés et les chambres d'hôtes. Le plafond du meublé de tourisme non classé reste fixé à **15 000 €**." },
      { type: "h2", id: "faq-abattement", text: "L'abattement micro-BIC change-t-il en 2026 ?" },
      { type: "p", text: "Non. Le passage de 77 700 € à 83 600 € correspond à une revalorisation du plafond. Les taux restent **50 %** pour la catégorie générale et **30 %** pour les meublés de tourisme non classés." },
      { type: "h2", id: "faq-8000", text: "Les amortissements LMNP sont-ils plafonnés à 8 000 € en 2026 ?" },
      { type: "p", text: "**Non.** Le plafond de 8 000 € appartient au nouveau dispositif Relance logement applicable à certains logements loués **nus**. Il ne constitue pas un nouveau plafond général d'amortissement du LMNP." },
      { type: "h2", id: "faq-pv-reintegration", text: "La réintégration des amortissements LMNP est-elle supprimée en 2026 ?" },
      { type: "p", text: "Non. La réforme entrée en vigueur pour les cessions réalisées à compter du 15 février 2025 reste applicable. Les abattements pour durée de détention restent applicables après cette réintégration, avec exonération totale d'IR après 22 ans et de prélèvements sociaux après 30 ans." },
      { type: "h2", id: "faq-jeanbrun-remplace", text: "Le dispositif Jeanbrun remplace-t-il le LMNP ?" },
      { type: "p", text: "Non. Relance logement est un dispositif distinct destiné à certains investissements en **location nue**. Le LMNP conserve son propre régime fiscal, ses règles comptables et ses modalités d'amortissement." },
      { type: "h2", id: "faq-enregistrement", text: "Tous les Airbnb doivent-ils déjà avoir un numéro national d'enregistrement en août 2026 ?" },
      { type: "p", text: "Pas encore via le nouveau téléservice national. En août 2026, l'enregistrement reste organisé selon les règles locales déjà applicables. Le téléservice national généralisé est annoncé pour le **quatrième trimestre 2026**." },
      { type: "h2", id: "faq-90-jours", text: "Une commune peut-elle limiter Airbnb à 90 jours par an ?" },
      { type: "p", text: "Oui, lorsqu'il s'agit de la résidence principale du propriétaire. La limite nationale de référence reste 120 jours, mais une commune peut désormais décider de l'abaisser jusqu'à **90 jours par année civile**." },

      { type: "h1", id: "a-retenir-2026", text: "Ce qu'il faut retenir du LMNP en 2026" },
      { type: "ul", items: [
        "**1.** Le statut LMNP n'est pas supprimé en 2026. La location meublée non professionnelle reste imposée dans la catégorie des BIC.",
        "**2.** Le régime réel LMNP reste en place. Les charges et amortissements continuent d'être pris en compte selon les règles habituelles.",
        "**3.** Le plafond général du micro-BIC est revalorisé à **83 600 €** pour les recettes 2026, contre 77 700 € auparavant.",
        "**4.** Le seuil du micro-BIC pour les meublés de tourisme non classés reste fixé à **15 000 €** avec un abattement de 30 %.",
        "**5.** Les prélèvements sociaux appliqués aux revenus LMNP sont désormais de **18,6 %** dans le cas général, alors que les plus-values immobilières des particuliers continuent de relever d'un taux de 17,2 %.",
        "**6.** La réforme de la plus-value LMNP entrée en vigueur en 2025 continue de s'appliquer en 2026 : certains amortissements déduits augmentent désormais la plus-value brute à la revente.",
        "**7.** Les abattements pour durée de détention restent applicables après cette réintégration, avec exonération d'IR après 22 ans et de prélèvements sociaux après 30 ans.",
        "**8.** La loi de finances 2026 crée Relance logement (dispositif Jeanbrun), qui permet désormais un amortissement dans certaines locations nues. Il ne remplace pas l'amortissement LMNP et ne lui impose pas son plafond.",
        "**9.** La réglementation de la location touristique poursuit son durcissement. Certaines communes peuvent notamment réduire de 120 à 90 jours la durée maximale de location touristique d'une résidence principale.",
        "**10.** Le futur téléservice national d'enregistrement des meublés de tourisme n'est pas encore totalement opérationnel en août 2026. Sa mise en service est annoncée pour le quatrième trimestre 2026.",
        "**11.** Les propriétaires LMNP non-résidents bénéficient en 2026 d'une nouvelle méthode de comparaison des revenus pour déterminer leur qualification LMNP ou LMP.",
      ]},
    ],
  },

  "loi-lmnp": {
    titre: "Qu'est-ce que la loi LMNP ?",
    date: "Mis à jour en juin 2026",
    intro: [
      "L'expression « loi LMNP » est très fréquemment utilisée pour désigner les règles applicables aux propriétaires qui louent un logement meublé. Pourtant, juridiquement, il n'existe pas une loi unique appelée « loi LMNP ».",
      "Le LMNP, ou Loueur en Meublé Non Professionnel, correspond avant tout à une qualification fiscale de l'activité de location meublée. Son fonctionnement résulte de plusieurs textes : le Code général des impôts pour la fiscalité et la distinction entre LMNP et LMP, la loi du 6 juillet 1989 pour les locations meublées constituant la résidence principale du locataire, ainsi que différents décrets et textes réglementaires.",
      "En pratique, le LMNP permet à un particulier de percevoir des recettes provenant d'une location meublée et de les déclarer dans la catégorie des Bénéfices Industriels et Commerciaux (BIC). Selon sa situation, le propriétaire peut relever du micro-BIC ou du régime réel LMNP.",
      "Mais les règles ont évolué ces dernières années : fiscalité des meublés de tourisme, prélèvements sociaux, amortissements à la revente, DPE ou encore formalités d'immatriculation. Voici ce que recouvre réellement la « loi LMNP » en 2026.",
    ],
    sections: [
      { id: "vraie-loi", titre: "Existe-t-il réellement une loi LMNP ?" },
      { id: "conditions-lmnp", titre: "Quelles sont les conditions pour être LMNP en 2026 ?" },
      { id: "quels-logements", titre: "Quels logements peuvent être loués en LMNP ?" },
      { id: "logement-meuble", titre: "Qu'est-ce qu'un logement meublé au sens de la loi ?" },
      { id: "decence", titre: "Quelles conditions de décence doit respecter un logement LMNP ?" },
      { id: "types-location", titre: "Quels types de location sont possibles en LMNP ?" },
      { id: "declarer-debut", titre: "Comment déclarer le début d'une activité LMNP ?" },
      { id: "fiscalite-2026", titre: "Quelle fiscalité s'applique au LMNP en 2026 ?" },
      { id: "micro-bic-vs-reel", titre: "Micro-BIC ou régime réel LMNP : quelles différences ?" },
      { id: "amortissement", titre: "Comment fonctionne l'amortissement en LMNP ?" },
      { id: "impots-prelevements", titre: "Quels impôts et prélèvements peut payer un LMNP ?" },
      { id: "revente", titre: "Que se passe-t-il lors de la revente d'un bien LMNP ?" },
      { id: "faq-loi-lmnp", titre: "FAQ sur la loi LMNP" },
      { id: "a-retenir-loi", titre: "Ce qu'il faut retenir" },
    ],
    contenu: [
      { type: "h1", id: "vraie-loi", text: "Existe-t-il réellement une loi LMNP ?" },
      { type: "p", text: "**Non**, il n'existe pas un texte unique intitulé « loi LMNP ». L'expression est utilisée dans le langage courant pour désigner l'ensemble des règles qui encadrent la location meublée non professionnelle." },
      { type: "p", text: "Le fonctionnement du LMNP repose notamment sur plusieurs ensembles de textes. Le **Code général des impôts** définit en particulier les conditions permettant de distinguer la location meublée professionnelle de la location meublée non professionnelle. La **loi du 6 juillet 1989** définit notamment le logement meublé lorsqu'il constitue la résidence principale du locataire — son article 25-4 précise qu'il doit comporter suffisamment de mobilier pour permettre au locataire d'y dormir, manger et vivre normalement. Le **décret du 31 juillet 2015** fixe ensuite la liste minimale des équipements devant être présents." },
      { type: "p", text: "Il est donc plus exact de parler de **statut fiscal LMNP**, de régime LMNP, de fiscalité LMNP ou de réglementation de la location meublée. L'expression « loi LMNP » reste néanmoins couramment recherchée et utilisée." },

      { type: "h1", id: "conditions-lmnp", text: "Quelles sont les conditions pour être LMNP en 2026 ?" },
      { type: "p", text: "Le caractère professionnel ou non professionnel de la location meublée est apprécié au niveau de l'ensemble du foyer fiscal. Pour être considéré comme **Loueur en Meublé Professionnel (LMP)**, deux conditions doivent être réunies simultanément :" },
      { type: "ul", items: [
        "les recettes annuelles de location meublée du foyer fiscal dépassent **23 000 €** ;",
        "ces recettes dépassent également les autres revenus professionnels du foyer pris en compte par l'article 155 du CGI.",
      ]},
      { type: "p", text: "Si l'une de ces deux conditions n'est pas remplie, l'activité reste fiscalement LMNP." },
      { type: "h2", id: "pas-plafond-absolu", text: "Le seuil de 23 000 € n'est donc pas un plafond absolu du LMNP" },
      { type: "p", text: "Un propriétaire peut percevoir plus de 23 000 € de recettes de location meublée et rester LMNP. Exemple : un foyer perçoit **34 000 € de recettes de location meublée** et **55 000 € de salaires**. Les recettes dépassent 23 000 €, mais restent inférieures aux autres revenus professionnels — le propriétaire reste donc LMNP. À l'inverse, avec 34 000 € de recettes et **27 000 € d'autres revenus professionnels**, les deux conditions sont remplies : l'activité relève alors du LMP." },
      { type: "h2", id: "calcul-foyer", text: "Le calcul s'effectue au niveau du foyer fiscal" },
      { type: "p", text: "Si un foyer possède plusieurs logements meublés, leurs recettes doivent être additionnées. Il n'est pas possible de raisonner séparément pour chaque appartement afin de déterminer si l'activité est LMNP ou LMP." },

      { type: "h1", id: "quels-logements", text: "Quels logements peuvent être loués en LMNP ?" },
      { type: "p", text: "Le LMNP concerne principalement la location directe ou indirecte de locaux d'habitation meublés. Il peut notamment s'agir d'un appartement, d'une maison, d'un studio, d'une chambre, d'un logement en location meublée de longue durée, d'un meublé de tourisme ou d'un logement situé dans certaines résidences-services." },
      { type: "p", text: "L'administration fiscale précise également que les revenus provenant de la **sous-location meublée** par une personne locataire relèvent des BIC. Il faut toutefois distinguer la qualification fiscale de location meublée des réglementations propres à chaque mode d'exploitation : chambres d'hôtes, gîtes, résidences de tourisme, établissements avec services ou hébergements mobiles peuvent être soumis à des règles spécifiques différentes." },

      { type: "h1", id: "logement-meuble", text: "Qu'est-ce qu'un logement meublé au sens de la loi ?" },
      { type: "p", text: "Pour une location meublée constituant la résidence principale du locataire, la simple présence d'un lit et d'une table ne suffit pas. La loi définit le logement meublé comme un logement décent disposant d'un mobilier suffisamment complet pour permettre au locataire d'y vivre normalement. Le **décret du 31 juillet 2015** impose au minimum :" },
      { type: "ul", items: [
        "une literie comprenant une couette ou une couverture ;",
        "un système d'occultation des fenêtres dans les chambres ;",
        "des plaques de cuisson ;",
        "un four ou un four à micro-ondes ;",
        "un réfrigérateur et un congélateur (ou compartiment de congélation à -6 °C minimum) ;",
        "de la vaisselle suffisante pour prendre les repas ;",
        "des ustensiles de cuisine ;",
        "une table et des sièges ;",
        "des étagères de rangement ;",
        "des luminaires ;",
        "du matériel d'entretien ménager adapté au logement.",
      ]},
      { type: "p", text: "Cette liste constitue un minimum réglementaire. Un propriétaire LMNP peut naturellement proposer des équipements supplémentaires. Pour les locations soumises à la loi du 6 juillet 1989, un **inventaire et un état détaillé du mobilier** sont établis lors de l'entrée et de la sortie du locataire et annexés au contrat." },

      { type: "h1", id: "decence", text: "Quelles conditions de décence doit respecter un logement LMNP ?" },
      { type: "p", text: "Un logement utilisé comme résidence principale du locataire doit également respecter les critères de décence." },
      { type: "h2", id: "regle-9m2", text: "La règle des 9 m²" },
      { type: "p", text: "Le logement doit disposer d'au moins une pièce principale présentant **soit une surface habitable d'au moins 9 m² avec une hauteur sous plafond d'au moins 2,20 m**, soit un volume habitable d'au moins 20 m³. Il ne s'agit pas d'une condition fiscale propre au statut LMNP, mais d'une condition de décence du logement dans les situations auxquelles cette réglementation s'applique." },
      { type: "h2", id: "dpe-decence", text: "DPE : un logement classé G ne peut plus être loué en résidence principale" },
      { type: "p", text: "En France métropolitaine, pour un bail d'habitation signé, renouvelé ou reconduit entre 2025 et 2027, seuls les logements classés **A à F** remplissent le critère énergétique de décence. Les logements classés G ne peuvent plus être proposés dans les conditions ordinaires de location d'habitation depuis le 1er janvier 2025." },
      { type: "table", head: ["À partir de", "Classes admises au regard du critère énergétique"], rows: [
        ["2025", "A à F"],
        ["2028", "A à E"],
        ["2034", "A à D"],
      ]},
      { type: "p", text: "Cette règle concerne autant une location vide qu'une location meublée LMNP utilisée comme résidence principale." },

      { type: "h1", id: "types-location", text: "Quels types de location sont possibles en LMNP ?" },
      { type: "p", text: "Le LMNP n'impose pas nécessairement de louer le logement à l'année. Plusieurs formes de location meublée sont possibles." },
      { type: "h2", id: "bail-meuble", text: "Le bail meublé classique" },
      { type: "p", text: "Lorsqu'un logement meublé constitue la résidence principale du locataire, le contrat est généralement conclu pour une durée minimale de **1 an**, ou **9 mois** lorsqu'il est loué à un étudiant. Le bail étudiant de neuf mois ne bénéficie pas de la reconduction tacite du bail meublé classique." },
      { type: "h2", id: "bail-mobilite", text: "Le bail mobilité" },
      { type: "p", text: "Le bail mobilité peut être utilisé lorsque le locataire remplit les conditions prévues par la loi : étudiant, stagiaire, salarié en mission temporaire, personne en formation professionnelle. Sa durée est comprise entre **1 et 10 mois**. Il n'est ni renouvelable ni reconductible au-delà de la durée maximale." },
      { type: "h2", id: "location-touristique", text: "La location meublée touristique" },
      { type: "p", text: "Un propriétaire LMNP peut également exploiter un logement en courte durée auprès d'une clientèle qui n'y élit pas domicile. Cette activité possède cependant une réglementation distincte : déclaration ou enregistrement du meublé, éventuel changement d'usage, règles de copropriété, taxe de séjour, limitations locales, fiscalité spécifique des meublés de tourisme. Un logement loué en Airbnb peut donc relever fiscalement du LMNP, mais les règles applicables ne sont pas identiques à celles d'un appartement loué meublé à l'année." },

      { type: "h1", id: "declarer-debut", text: "Comment déclarer le début d'une activité LMNP ?" },
      { type: "p", text: "Il n'est plus nécessaire d'envoyer l'ancien formulaire P0i au greffe du tribunal de commerce. Depuis la mise en place du guichet unique, le début de l'activité doit être déclaré en ligne auprès du **Guichet des formalités des entreprises**. L'administration fiscale indique que cette déclaration doit être réalisée dans les **quinze premiers jours** suivant le début de l'activité. Cette démarche permet notamment d'obtenir un numéro SIRET et de déclarer le régime fiscal retenu." },
      { type: "p", text: "Le propriétaire n'a pas à « demander l'autorisation » de devenir LMNP. Le caractère LMNP résulte de sa situation et des critères fiscaux applicables." },

      { type: "h1", id: "fiscalite-2026", text: "Quelle fiscalité s'applique au LMNP en 2026 ?" },
      { type: "p", text: "Les revenus de location meublée ne sont pas imposés comme des revenus fonciers. Ils relèvent de la catégorie des **Bénéfices Industriels et Commerciaux (BIC)**. Pour déterminer le revenu imposable, deux grands systèmes existent : le micro-BIC ou le régime réel." },
      { type: "p", text: "Il faut surtout comprendre que le LMNP ne constitue pas, à lui seul, une réduction d'impôt. Il organise la manière dont les revenus de location meublée sont fiscalisés. L'avantage fiscal souvent associé provient notamment, au régime réel, de la possibilité de déduire des charges et de comptabiliser des amortissements. L'ancien dispositif Censi-Bouvard, qui accordait une véritable réduction d'impôt, a pris fin pour les nouveaux investissements après le 31 décembre 2022." },

      { type: "h1", id: "micro-bic-vs-reel", text: "Micro-BIC ou régime réel LMNP : quelles différences ?" },
      { type: "h2", id: "micro-bic-loi", text: "Le micro-BIC LMNP" },
      { type: "p", text: "Au micro-BIC, le propriétaire déclare ses recettes brutes et l'administration applique un abattement forfaitaire. Pour les recettes perçues en 2026 :" },
      { type: "table", head: ["Type de location en 2026", "Seuil micro-BIC", "Abattement"], rows: [
        ["Location meublée longue durée", "83 600 €", "50 %"],
        ["Meublé de tourisme classé", "83 600 €", "50 %"],
        ["Meublé de tourisme non classé", "15 000 €", "30 %"],
      ]},
      { type: "p", text: "Au micro-BIC, le propriétaire ne peut pas déduire séparément ses intérêts d'emprunt, sa taxe foncière ou ses autres charges : l'abattement est censé représenter l'ensemble de ces dépenses." },
      { type: "h2", id: "reel-loi", text: "Le régime réel LMNP" },
      { type: "p", text: "Au régime réel, le propriétaire établit un véritable résultat BIC en déduisant les charges déductibles et les amortissements fiscalement déductibles des recettes. Peuvent notamment être pris en compte : intérêts d'emprunt, assurances, frais de gestion, dépenses d'entretien, charges de copropriété, taxe foncière, CFE, certains travaux immobilisés, amortissements du logement hors terrain, amortissements du mobilier et des équipements." },
      { type: "note", text: "Certaines dépenses constituent des immobilisations et doivent être amorties sur plusieurs années plutôt que passées directement en charges. Toutes les dépenses ne sont donc pas automatiquement déductibles immédiatement." },
      { type: "h2", id: "comparaison", text: "Micro-BIC ou régime réel : lequel est le plus intéressant ?" },
      { type: "p", text: "Il n'existe pas de réponse universelle. Avec un logement générant **20 000 € de recettes**, **5 000 € de charges déductibles** et **6 500 € d'amortissements** : au micro-BIC, base imposable = 20 000 × 50 % = **10 000 €** ; au régime réel, base imposable = 20 000 − 5 000 − 6 500 = **8 500 €**. Dans cet exemple, le régime réel produit une base taxable inférieure, mais avec des charges et amortissements plus faibles, le résultat pourrait être différent." },

      { type: "h1", id: "amortissement", text: "Comment fonctionne l'amortissement en LMNP ?" },
      { type: "p", text: "L'amortissement LMNP est l'une des principales particularités du régime réel. Il permet de répartir comptablement la valeur de certains actifs sur leur durée d'utilisation. Peuvent notamment être amortis : le bâtiment hors valeur du terrain, le mobilier, certains équipements et certains travaux immobilisés. L'amortissement constitue une charge comptable qui peut diminuer le bénéfice fiscal **sans correspondre à une nouvelle sortie de trésorerie chaque année**." },
      { type: "note", text: "L'amortissement LMNP est encadré par l'article 39 C du CGI : il ne peut pas être utilisé librement pour créer un déficit fiscal par les seuls amortissements. Les amortissements qui ne peuvent pas être utilisés au cours d'une année peuvent être reportés selon les règles applicables." },

      { type: "h1", id: "impots-prelevements", text: "Quels impôts et prélèvements peut payer un LMNP ?" },
      { type: "h2", id: "ir-lmnp", text: "Impôt sur le revenu" },
      { type: "p", text: "Le bénéfice fiscal LMNP vient s'ajouter aux autres revenus imposables du foyer et est soumis au **barème progressif de l'impôt sur le revenu**." },
      { type: "h2", id: "ps-lmnp", text: "Prélèvements sociaux LMNP en 2026" },
      { type: "p", text: "Lorsque le bénéfice LMNP relève des prélèvements sociaux sur les revenus du patrimoine et n'est pas déjà soumis aux contributions sociales d'activité, le taux applicable est désormais de **18,6 %** (CSG 10,6 %, CRDS 0,5 %, prélèvement de solidarité 7,5 %). Au micro-BIC, ces prélèvements portent sur le revenu après abattement. Au régime réel, ils portent sur le revenu net fiscal concerné." },
      { type: "h2", id: "cfe-lmnp", text: "CFE" },
      { type: "p", text: "La location meublée entre en principe dans le champ de la **Cotisation Foncière des Entreprises**, même lorsqu'elle est exercée sous statut fiscal LMNP. Il existe toutefois différentes exonérations, notamment lorsque les recettes n'excèdent pas 5 000 € ou dans certains cas de location d'une partie de l'habitation personnelle." },
      { type: "h2", id: "cot-soc-lmnp", text: "Cotisations sociales et LMNP" },
      { type: "p", text: "Il faut distinguer le statut fiscal LMNP du régime social. Certaines activités, notamment la location meublée de courte durée dépassant certains seuils, peuvent relever des cotisations sociales auprès des organismes sociaux alors même que la qualification fiscale doit être analysée séparément." },

      { type: "h1", id: "revente", text: "Que se passe-t-il lors de la revente d'un bien LMNP ?" },
      { type: "p", text: "Depuis le **15 février 2025**, la fiscalité de la revente constitue un élément important à intégrer dans un investissement LMNP au régime réel. Lorsque le propriétaire est LMNP au moment de la vente, il relève en principe du régime des **plus-values immobilières des particuliers**. Mais les amortissements admis en déduction au régime réel doivent désormais être réintégrés dans le calcul de la plus-value." },
      { type: "formula", text: "Plus-value brute LMNP = prix de vente − (prix d'acquisition corrigé − amortissements concernés)" },
      { type: "h2", id: "exemple-revente", text: "Exemple simplifié" },
      { type: "p", text: "Achat **220 000 €**, vente **280 000 €**, amortissements concernés **30 000 €**. Sans prise en compte des amortissements : 280 000 − 220 000 = **60 000 €**. Avec la règle actuelle : 280 000 − (220 000 − 30 000) = **90 000 €**. La plus-value brute est augmentée, mais les amortissements sont intégrés à la plus-value **avant les abattements pour durée de détention** — ils ne sont pas taxés séparément sans abattement. Le régime conserve donc : exonération d'IR après **22 ans**, exonération de prélèvements sociaux après **30 ans**." },

      { type: "h1", id: "faq-loi-lmnp", text: "FAQ sur la loi LMNP" },
      { type: "h2", id: "faq-vraie-loi", text: "La loi LMNP est-elle une véritable loi ?" },
      { type: "p", text: "Non. Le terme « loi LMNP » désigne couramment l'ensemble de la réglementation fiscale et locative applicable aux Loueurs en Meublé Non Professionnels. Le LMNP est avant tout une **qualification fiscale**, pas une loi unique ni une forme de société." },
      { type: "h2", id: "faq-23k", text: "Faut-il gagner moins de 23 000 € pour être LMNP ?" },
      { type: "p", text: "Non. Un propriétaire peut dépasser 23 000 € de recettes et rester LMNP si ses recettes de location meublée ne dépassent pas également les autres revenus professionnels concernés de son foyer fiscal." },
      { type: "h2", id: "faq-benefice", text: "Les 23 000 € correspondent-ils au bénéfice ?" },
      { type: "p", text: "Non. Il s'agit des **recettes de location meublée**, et non du bénéfice restant après les charges." },
      { type: "h2", id: "faq-plusieurs", text: "Peut-on avoir plusieurs logements en LMNP ?" },
      { type: "p", text: "Oui. Il n'existe pas de limitation générale à un seul logement LMNP. En revanche, les recettes de toutes les locations meublées du foyer sont prises en compte pour déterminer le caractère professionnel ou non professionnel de l'activité." },
      { type: "h2", id: "faq-maison", text: "Peut-on louer une maison en LMNP ?" },
      { type: "p", text: "Oui. Le LMNP n'est pas réservé aux studios ou appartements. Une maison louée meublée peut parfaitement relever du LMNP dès lors que les conditions fiscales et locatives sont respectées." },
      { type: "h2", id: "faq-9m2", text: "Un logement LMNP doit-il obligatoirement faire 9 m² ?" },
      { type: "p", text: "Pour les logements soumis aux critères de décence concernés, au moins une pièce principale doit disposer soit de 9 m² avec 2,20 m de hauteur sous plafond, soit de 20 m³ de volume habitable. Il ne s'agit pas d'un seuil fiscal propre au LMNP." },
      { type: "h2", id: "faq-saisonnier", text: "Peut-on faire du LMNP en location saisonnière ?" },
      { type: "p", text: "Oui, une activité de location touristique peut fiscalement relever du LMNP. Elle doit toutefois respecter la réglementation spécifique des meublés de tourisme : formalités locales, éventuel changement d'usage, règles de copropriété, régime social, DPE dans certains cas et fiscalité spécifique." },
      { type: "h2", id: "faq-siret", text: "Faut-il attendre son numéro SIRET avant de commencer à louer ?" },
      { type: "p", text: "La réglementation prévoit surtout que le début d'activité doit être déclaré auprès du guichet unique dans les quinze jours suivant le début de l'activité. Il est donc incorrect d'affirmer qu'un propriétaire doit nécessairement avoir reçu son SIRET avant de signer son premier bail." },
      { type: "h2", id: "faq-p0i", text: "Faut-il encore remplir le formulaire P0i ?" },
      { type: "p", text: "Non. La création de l'activité de location meublée s'effectue désormais par voie dématérialisée sur le **Guichet des formalités des entreprises**." },
      { type: "h2", id: "faq-reduction", text: "Le LMNP donne-t-il droit à une réduction d'impôt ?" },
      { type: "p", text: "Pas automatiquement. Le LMNP classique ne constitue pas une réduction d'impôt. Au régime réel, les charges et amortissements permettent de **réduire le résultat BIC imposable**, ce qui peut diminuer l'impôt dû — c'est différent d'une réduction d'impôt directement imputée sur le montant de l'impôt." },
      { type: "h2", id: "faq-amort-micro", text: "Peut-on amortir le bien au micro-BIC ?" },
      { type: "p", text: "Non. L'abattement du micro-BIC est forfaitaire. La déduction individualisée des amortissements concerne le **régime réel LMNP**." },
      { type: "h2", id: "faq-amort-vente", text: "Les amortissements LMNP sont-ils repris lors de la vente ?" },
      { type: "p", text: "Depuis les cessions réalisées à compter du 15 février 2025, les amortissements concernés admis en déduction au régime réel augmentent potentiellement la plus-value immobilière en réduisant le prix d'acquisition fiscal retenu." },
      { type: "h2", id: "faq-interessant", text: "Le LMNP est-il toujours intéressant en 2026 ?" },
      { type: "p", text: "Le LMNP conserve plusieurs particularités, notamment l'imposition en BIC et, au régime réel, la possibilité de comptabiliser charges et amortissements. Son intérêt dépend toutefois du prix du logement, du financement, du niveau de loyer, des charges, du régime fiscal, de la durée de détention, du montant des amortissements et de la fiscalité à la revente. Il n'est pas possible de considérer le LMNP comme systématiquement plus avantageux pour tous les investissements." },

      { type: "h1", id: "a-retenir-loi", text: "Ce qu'il faut retenir sur la loi LMNP" },
      { type: "ul", items: [
        "**1.** Il n'existe pas, juridiquement, une seule « loi LMNP ». Le LMNP résulte de plusieurs règles fiscales et locatives.",
        "**2.** LMNP signifie Loueur en Meublé Non Professionnel. Il s'agit avant tout d'une **qualification fiscale** de l'activité de location meublée.",
        "**3.** Pour devenir LMP, les recettes de location meublée doivent à la fois **dépasser 23 000 € et dépasser les autres revenus professionnels** concernés du foyer. Le dépassement de 23 000 € seul ne suffit pas.",
        "**4.** Les recettes d'une location meublée sont imposées en **BIC**, contrairement à une location vide généralement imposée en revenus fonciers.",
        "**5.** Un logement meublé utilisé comme résidence principale doit comporter la liste minimale d'équipements prévue par le **décret du 31 juillet 2015**.",
        "**6.** Le début de l'activité LMNP doit être déclaré sur le **Guichet des formalités des entreprises** dans les quinze jours suivant son démarrage afin notamment d'obtenir un SIRET.",
        "**7.** Pour les recettes 2026, le plafond général du micro-BIC applicable à la location meublée longue durée est de **83 600 €** avec un abattement de 50 %. Le meublé touristique non classé conserve son régime spécifique à **15 000 €** et 30 %.",
        "**8.** Au régime réel LMNP, les charges et amortissements peuvent réduire le bénéfice imposable, mais toutes les dépenses ne sont pas automatiquement déductibles et l'utilisation des amortissements est encadrée.",
        "**9.** Le LMNP classique ne donne **pas automatiquement droit à une réduction d'impôt**. Son avantage fiscal provient essentiellement du mode de calcul du bénéfice BIC au régime réel.",
        "**10.** En 2026, les revenus LMNP relevant des prélèvements sociaux sur le patrimoine supportent dans le cas général un taux global de **18,6 %**.",
        "**11.** Depuis le 15 février 2025, les amortissements LMNP admis en déduction au réel sont pris en compte dans le calcul de la plus-value lors de la revente.",
        "**12.** Le LMNP doit donc être analysé sur toute la vie de l'investissement : **acquisition, location, fiscalité annuelle, amortissements et revente**.",
      ]},
    ],
  },

  "limites-airbnb-lmnp-2026": {
    titre: "Limites Airbnb en LMNP en 2026 : quelles sont les règles et restrictions ?",
    date: "Mis à jour en août 2026",
    intro: [
      "Louer un logement sur Airbnb peut être compatible avec le statut LMNP, mais cela ne signifie pas qu'un propriétaire est libre de pratiquer la location saisonnière sans restriction.",
      "La fiscalité LMNP et le droit de louer un logement en courte durée sont deux sujets différents. Un propriétaire peut parfaitement remplir les conditions du Loueur en Meublé Non Professionnel tout en étant soumis, dans sa commune, à une limitation du nombre de nuitées, à une obligation d'enregistrement ou encore à une autorisation préalable de changement d'usage.",
      "Depuis la loi du 19 novembre 2024, dite loi Le Meur, les communes disposent en outre de pouvoirs renforcés pour encadrer les meublés de tourisme.",
      "Voici les principales limites Airbnb à connaître en 2026 avant de mettre un logement en location.",
    ],
    sections: [
      { id: "combien-jours", titre: "Combien de jours peut-on louer sur Airbnb ?" },
      { id: "residence-secondaire", titre: "Quelles règles pour une résidence secondaire ?" },
      { id: "enregistrement-2026", titre: "Déclaration et numéro d'enregistrement Airbnb en 2026" },
      { id: "changement-usage", titre: "Le changement d'usage peut-il empêcher une location Airbnb ?" },
      { id: "copropriete", titre: "Quelles règles en copropriété ?" },
      { id: "dpe-airbnb", titre: "Quelles obligations de DPE pour un Airbnb ?" },
      { id: "sanctions", titre: "Quelles sanctions en cas de non-respect ?" },
      { id: "adapter-projet", titre: "Comment adapter son projet lorsque la location Airbnb est limitée ?" },
      { id: "faq-limites", titre: "FAQ sur les limites Airbnb et le LMNP" },
    ],
    contenu: [
      { type: "h1", id: "combien-jours", text: "Combien de jours peut-on louer sur Airbnb ?" },
      { type: "p", text: "La réponse dépend principalement de la nature du logement." },
      { type: "h2", id: "residence-principale-jours", text: "Résidence principale : généralement 120 jours, parfois 90 jours" },
      { type: "p", text: "Lorsqu'un logement constitue la résidence principale du loueur, la limite de référence est de **120 jours de location par année civile**. Depuis la loi Le Meur, une commune peut toutefois décider, par délibération motivée, d'abaisser cette limite jusqu'à **90 jours par an**." },
      { type: "table", head: ["Situation", "Nombre maximal de jours"], rows: [
        ["Commune conservant la règle générale", "120 jours/an"],
        ["Commune ayant abaissé le plafond", "90 jours/an"],
      ]},
      { type: "p", text: "Une résidence principale est, en principe, un logement occupé au moins 8 mois par an, sauf notamment obligation professionnelle, raison de santé ou cas de force majeure. Le propriétaire doit vérifier la réglementation adoptée par sa commune avant de calculer le nombre de jours qu'il peut réellement proposer sur Airbnb. Certaines exceptions peuvent permettre de dépasser le plafond annuel lorsqu'une obligation professionnelle, une raison de santé ou un cas de force majeure empêchent le propriétaire d'occuper normalement sa résidence principale." },
      { type: "h2", id: "meme-voyageur", text: "Un même voyageur ne peut pas rester indéfiniment" },
      { type: "p", text: "Indépendamment du plafond annuel de 90 ou 120 jours, une location en meublé de tourisme correspond à une occupation temporaire par une clientèle de passage. Un même client ne peut notamment pas occuper une résidence principale louée comme meublé de tourisme pendant plus de **90 jours consécutifs** au cours d'une même année civile." },

      { type: "h1", id: "residence-secondaire", text: "Quelles règles pour une résidence secondaire ?" },
      { type: "p", text: "La règle des 90 ou 120 jours par an concerne principalement la résidence principale. Une résidence secondaire consacrée à la location saisonnière n'est donc pas soumise à ce plafond national annuel. Cela ne signifie toutefois pas qu'elle peut automatiquement être louée toute l'année sur Airbnb." },
      { type: "p", text: "Dans certaines communes, notamment dans les secteurs où le marché du logement est particulièrement tendu, le propriétaire peut devoir obtenir une **autorisation de changement d'usage** avant de transformer un logement en meublé de tourisme. Selon les règles locales, cette autorisation peut être temporaire, définitive, soumise à certaines conditions, ou assortie d'une obligation de compensation (transformation parallèle d'un local non destiné à l'habitation en logement)." },
      { type: "h2", id: "pouvoirs-communes", text: "Les communes disposent de pouvoirs importants" },
      { type: "p", text: "Depuis la loi Le Meur, les collectivités peuvent notamment renforcer la régulation des meublés de tourisme, mettre en place des quotas d'autorisations et réserver certains secteurs à la résidence principale dans leurs documents d'urbanisme. Il n'existe donc pas une seule réglementation Airbnb applicable uniformément à tous les investissements LMNP. Deux appartements identiques situés dans deux communes différentes peuvent être soumis à des règles de location touristique très différentes." },

      { type: "h1", id: "enregistrement-2026", text: "Déclaration et numéro d'enregistrement Airbnb en 2026" },
      { type: "p", text: "La procédure d'enregistrement des meublés de tourisme est actuellement en transition. La loi du 19 novembre 2024 prévoyait la généralisation d'un téléservice national d'enregistrement, mais en août 2026, ce téléservice national **n'est pas encore opérationnel**. La Direction générale des Entreprises indique désormais que son ouverture est prévue au **quatrième trimestre 2026**." },
      { type: "h2", id: "en-attendant", text: "Que faut-il faire en attendant ?" },
      { type: "p", text: "Jusqu'à la mise en service du téléservice national, les règles actuellement applicables dans chaque commune continuent de s'appliquer : si la commune impose déjà un enregistrement, le propriétaire doit continuer à utiliser la procédure locale ; si elle impose une simple déclaration, cette obligation demeure ; lorsque la commune ne prévoit actuellement aucun numéro d'enregistrement, une plateforme ne peut pas exiger un numéro qui ne peut pas encore être obtenu localement." },
      { type: "p", text: "Une fois le téléservice national ouvert, l'enregistrement doit être progressivement généralisé. Les propriétaires disposant déjà d'un ancien numéro municipal bénéficieront d'une période transitoire pour effectuer leur nouvel enregistrement." },
      { type: "h2", id: "numero-annonce", text: "Le numéro doit figurer sur l'annonce lorsqu'il est obligatoire" },
      { type: "p", text: "Lorsqu'un numéro d'enregistrement a été attribué au logement, celui-ci doit figurer sur les annonces de location, notamment celles diffusées par une plateforme comme Airbnb. Les plateformes jouent également un rôle dans le contrôle du nombre de jours loués et peuvent être tenues de désactiver une annonce lorsque le plafond applicable à une résidence principale est atteint." },

      { type: "h1", id: "changement-usage", text: "Le changement d'usage peut-il empêcher une location Airbnb ?" },
      { type: "p", text: "**Oui.** C'est même l'une des vérifications les plus importantes avant d'acheter un logement spécifiquement destiné à Airbnb. Le changement d'usage concerne la transformation de l'utilisation d'un local d'habitation vers une activité telle que la location touristique de courte durée." },
      { type: "p", text: "Le simple fait d'être propriétaire du logement, d'avoir créé une activité LMNP, de posséder un numéro SIRET ou d'être fiscalement imposé en BIC **ne remplace pas cette autorisation**. Le LMNP est un statut fiscal. Le changement d'usage relève principalement de la réglementation du logement. Il faut donc toujours vérifier les deux indépendamment." },
      { type: "note", text: "Le changement d'usage et le changement de destination sont deux procédures différentes. Le changement d'usage concerne principalement l'utilisation d'un logement, tandis que le changement de destination relève du droit de l'urbanisme et peut notamment intervenir lors de la transformation d'un local d'une catégorie à une autre." },

      { type: "h1", id: "copropriete", text: "Quelles règles en copropriété ?" },
      { type: "p", text: "Avant de transformer un appartement en Airbnb, il faut également consulter le **règlement de copropriété**. Pour les règlements établis depuis le 21 novembre 2024, celui-ci doit indiquer si les locations en meublé de tourisme sont autorisées ou interdites dans l'immeuble." },
      { type: "p", text: "Pour les règlements plus anciens, certaines clauses peuvent déjà rendre l'activité incompatible avec la destination de l'immeuble. C'est notamment le cas de certaines clauses d'habitation exclusivement bourgeoise, qui peuvent interdire les activités professionnelles ou commerciales." },
      { type: "p", text: "La loi Le Meur a également facilité la modification de certains règlements afin d'interdire la location en meublé de tourisme : une **majorité des deux tiers** des voix peut désormais être suffisante dans les situations concernées, alors que l'unanimité était auparavant généralement nécessaire. Lorsqu'un copropriétaire obtient un numéro d'enregistrement pour exploiter un meublé de tourisme, il doit également en informer le syndic." },

      { type: "h1", id: "dpe-airbnb", text: "Quelles obligations de DPE pour un Airbnb ?" },
      { type: "p", text: "La loi Le Meur a rapproché progressivement les règles énergétiques applicables aux meublés de tourisme de celles applicables à la location classique. En 2026, lorsqu'un logement situé en métropole est nouvellement proposé comme meublé de tourisme et que son exploitation nécessite une autorisation de changement d'usage, son DPE doit être classé entre **A et E**." },
      { type: "p", text: "À compter du **1er janvier 2034**, le dispositif devient plus strict : les meublés de tourisme concernés devront en principe présenter un DPE compris entre **A et D**, avec notamment une exception pour la résidence principale du loueur prévue par le Code du tourisme." },
      { type: "p", text: "Il faut donc éviter une confusion fréquente : tous les logements classés F ou G ne sont pas devenus automatiquement interdits sur Airbnb. Les obligations dépendent notamment de la date, du caractère nouveau ou existant de l'activité, de l'obligation ou non d'obtenir un changement d'usage, et du fait que le logement constitue ou non la résidence principale du loueur." },

      { type: "h1", id: "sanctions", text: "Quelles sanctions en cas de non-respect des limites Airbnb ?" },
      { type: "p", text: "La réglementation des locations touristiques prévoit des sanctions qui peuvent devenir importantes, notamment en cas de changement d'usage irrégulier." },
      { type: "table", head: ["Manquement", "Risque prévu par les textes"], rows: [
        ["Dépassement de la durée annuelle autorisée (résidence principale)", "Jusqu'à 15 000 €"],
        ["Défaut d'enregistrement dans le nouveau dispositif national", "Jusqu'à 10 000 €"],
        ["Fausse déclaration ou faux numéro d'enregistrement", "Jusqu'à 20 000 €"],
        ["Non-respect des règles de changement d'usage", "Jusqu'à 100 000 € + remise en état"],
      ]},
      { type: "p", text: "Il faut néanmoins tenir compte de la **période transitoire actuelle** : tant que le téléservice national n'est pas effectivement déployé, les obligations et procédures locales déjà applicables restent en vigueur. Le changement d'usage constitue un sujet particulièrement sensible : son absence peut exposer le propriétaire à une sanction pouvant atteindre **100 000 €**, ainsi qu'à une obligation de remise en état du logement." },

      { type: "h1", id: "adapter-projet", text: "Comment adapter son projet lorsque la location Airbnb est limitée ?" },
      { type: "p", text: "La limitation de la location touristique ne signifie pas nécessairement que le logement ne peut plus être exploité en meublé. Plusieurs modèles doivent être distingués." },
      { type: "h2", id: "location-longue-duree", text: "Passer à la location meublée longue durée" },
      { type: "p", text: "Un propriétaire peut exploiter son logement avec un **bail meublé classique**, généralement conclu pour un an. Cette activité reste compatible avec le LMNP, mais elle ne constitue plus une location touristique de type Airbnb." },
      { type: "h2", id: "bail-mobilite", text: "Utiliser un bail mobilité lorsque les conditions sont remplies" },
      { type: "p", text: "Le bail mobilité permet de louer un logement meublé pour une durée de **1 à 10 mois** à certaines catégories de locataires (étudiant, personne en formation professionnelle ou en mission temporaire). Il ne doit pas être utilisé artificiellement pour contourner la réglementation des meublés touristiques : ses conditions d'éligibilité doivent être réellement respectées." },
      { type: "h2", id: "residence-secondaire-strategy", text: "Exploiter une résidence secondaire lorsqu'elle est autorisée" },
      { type: "p", text: "Une résidence secondaire n'est pas soumise à la limite nationale de 90 ou 120 jours. Mais dans certaines grandes villes, le changement d'usage et les éventuelles règles de compensation peuvent rendre cette stratégie difficile ou économiquement peu pertinente." },
      { type: "note", text: "Les restrictions Airbnb présentées ici concernent principalement le **droit de louer** un logement en courte durée, indépendamment du régime fiscal du propriétaire. Un propriétaire peut être LMNP fiscalement tout en ne pouvant pas légalement exploiter le logement en Airbnb — et inversement, obtenir toutes les autorisations municipales ne détermine pas le régime d'imposition. Fiscalité LMNP et réglementation Airbnb doivent être analysées séparément." },

      { type: "h1", id: "faq-limites", text: "FAQ : limites Airbnb et LMNP en 2026" },
      { type: "h2", id: "faq-90-jours", text: "Airbnb est-il limité à 90 jours partout en France ?" },
      { type: "p", text: "Non. Le plafond général applicable à une résidence principale est de **120 jours par année civile**, mais une commune peut décider de l'abaisser à 90 jours. Il faut vérifier la réglementation de la commune dans laquelle se situe le logement." },
      { type: "h2", id: "faq-secondaire-120", text: "Peut-on louer une résidence secondaire plus de 120 jours sur Airbnb ?" },
      { type: "p", text: "Il n'existe pas de plafond national de 120 jours comparable à celui applicable à la résidence principale. En revanche, une résidence secondaire peut être soumise à une autorisation de changement d'usage et à d'autres restrictions locales." },
      { type: "h2", id: "faq-lmnp-contourne", text: "Le statut LMNP permet-il de dépasser la limite Airbnb ?" },
      { type: "p", text: "Non. Le statut LMNP est fiscal. Il ne permet pas de contourner une limitation de 90 ou 120 jours, une interdiction prévue par une copropriété ou une obligation de changement d'usage." },
      { type: "h2", id: "faq-plusieurs-comptes", text: "Peut-on ouvrir plusieurs comptes Airbnb pour dépasser la limite ?" },
      { type: "p", text: "Non. La réglementation porte sur le **logement et son exploitation**, et non simplement sur le compte utilisé pour publier l'annonce. Les plateformes transmettent par ailleurs des données permettant aux collectivités de suivre l'activité des meublés de tourisme. Le dispositif API Meublés renforce précisément ces possibilités de contrôle." },
      { type: "h2", id: "faq-numero-2026", text: "Tous les Airbnb doivent-ils avoir un numéro d'enregistrement en 2026 ?" },
      { type: "p", text: "La généralisation du numéro d'enregistrement est prévue, mais le téléservice national n'est pas encore ouvert en août 2026. Son lancement est actuellement annoncé pour le **quatrième trimestre 2026**. En attendant, les procédures déjà applicables dans chaque commune continuent de s'appliquer." },
      { type: "h2", id: "faq-dpe-f", text: "Un DPE F interdit-il forcément Airbnb en 2026 ?" },
      { type: "p", text: "Non, pas dans toutes les situations. En 2026, l'exigence A à E concerne notamment les **nouveaux meublés de tourisme en métropole soumis à autorisation de changement d'usage**. Une généralisation plus large des critères de performance énergétique interviendra progressivement, avec un objectif A à D à compter de 2034 pour les logements concernés." },
      { type: "h2", id: "faq-copro-interdit", text: "Une copropriété peut-elle interdire Airbnb ?" },
      { type: "p", text: "Oui, selon la rédaction du règlement de copropriété et les conditions légales applicables. Les règles ont d'ailleurs été renforcées depuis la loi du 19 novembre 2024 afin de permettre aux copropriétés de mieux encadrer les meublés de tourisme." },
      { type: "h2", id: "a-retenir-limites", text: "Ce qu'il faut retenir" },
      { type: "ul", items: [
        "Airbnb et LMNP sont compatibles, mais le **statut LMNP ne donne pas automatiquement le droit** de pratiquer la location touristique.",
        "Une résidence principale peut généralement être louée **120 jours par an**, mais une commune peut abaisser cette limite à **90 jours**.",
        "Une résidence secondaire n'est pas soumise à ce plafond national, mais elle peut nécessiter une **autorisation de changement d'usage**.",
        "Les réglementations Airbnb peuvent varier fortement d'une commune à l'autre.",
        "Le règlement de copropriété doit être vérifié avant toute mise en location touristique.",
        "En août 2026, le téléservice national d'enregistrement n'est pas encore opérationnel ; son lancement est annoncé pour le **quatrième trimestre 2026**.",
        "Les règles actuelles de déclaration et d'enregistrement de chaque commune restent applicables pendant cette période transitoire.",
        "Les nouvelles locations touristiques soumises à changement d'usage doivent respecter certaines **exigences de performance énergétique** (DPE A–E).",
        "Les sanctions peuvent atteindre plusieurs dizaines de milliers d'euros lorsque les règles de changement d'usage ne sont pas respectées.",
        "**Fiscalité LMNP et réglementation Airbnb doivent être analysées séparément.**",
      ]},
    ],
  },

  "airbnb-lmnp-2026": {
    titre: "Airbnb et LMNP en 2026 : compatibilité, fiscalité, avantages et règles à connaître",
    date: "Mis à jour en août 2026",
    intro: [
      "Louer un logement sur Airbnb est parfaitement compatible avec le statut LMNP. Airbnb n'est en réalité qu'une plateforme de mise en relation : juridiquement et fiscalement, le propriétaire exerce une activité de location meublée de courte durée, généralement qualifiée de meublé de tourisme.",
      "Un propriétaire qui loue ponctuellement ou régulièrement un appartement sur Airbnb peut donc rester Loueur en Meublé Non Professionnel (LMNP), à condition de respecter les critères du statut. Les loyers perçus sont alors imposés dans la catégorie des bénéfices industriels et commerciaux (BIC), avec le choix, selon la situation, entre le micro-BIC et le régime réel LMNP.",
      "La location Airbnb présente néanmoins plusieurs particularités par rapport à une location meublée classique : fiscalité du meublé de tourisme, réglementation locale, limite du nombre de jours de location, cotisations sociales ou encore classement touristique.",
    ],
    sections: [
      { id: "compatibilite", titre: "Airbnb est-il compatible avec le statut LMNP ?" },
      { id: "fiscalite-airbnb", titre: "Quelle fiscalité pour un Airbnb en LMNP en 2026 ?" },
      { id: "micro-bic-vs-reel-airbnb", titre: "Micro-BIC ou régime réel pour un Airbnb ?" },
      { id: "regles-airbnb", titre: "Quelles règles respecter pour louer sur Airbnb ?" },
      { id: "avantages-inconvenients", titre: "Quels sont les avantages et inconvénients d'Airbnb en LMNP ?" },
      { id: "cotisations-tva-cfe", titre: "Airbnb, cotisations sociales, TVA et CFE" },
      { id: "revente-airbnb", titre: "Quelle fiscalité à la revente d'un Airbnb en LMNP ?" },
      { id: "faq-airbnb", titre: "FAQ Airbnb et LMNP" },
    ],
    contenu: [
      { type: "h1", id: "compatibilite", text: "Airbnb est-il compatible avec le statut LMNP ?" },
      { type: "p", text: "**Oui. Airbnb et LMNP sont parfaitement compatibles.** Airbnb est simplement un intermédiaire permettant de proposer un logement à la location. Une location Airbnb correspond généralement à un **meublé de tourisme**, c'est-à-dire un logement meublé proposé à une clientèle de passage qui n'y élit pas domicile, pour des séjours à la journée, à la semaine ou au mois." },
      { type: "p", text: "La location peut être exercée sous le statut LMNP tant que le propriétaire ne remplit pas simultanément les deux conditions permettant de devenir LMP :" },
      { type: "ul", items: [
        "les recettes annuelles de location meublée du foyer fiscal dépassent **23 000 €** ;",
        "ces recettes dépassent également les autres revenus d'activité du foyer fiscal.",
      ]},
      { type: "p", text: "Si l'une de ces deux conditions n'est pas remplie, l'activité reste en principe **LMNP**. Il est possible d'exploiter un logement en location meublée longue durée en LMNP, un logement Airbnb en LMNP, ou plusieurs locations meublées de différents types. Les recettes des différentes locations meublées du foyer doivent cependant être prises en compte ensemble pour apprécier le caractère professionnel ou non de l'activité." },

      { type: "h1", id: "fiscalite-airbnb", text: "Quelle fiscalité pour un Airbnb en LMNP en 2026 ?" },
      { type: "p", text: "Les revenus Airbnb perçus par un LMNP sont imposés dans la catégorie des **BIC**, et non dans celle des revenus fonciers. Deux régimes fiscaux peuvent principalement s'appliquer : le **micro-BIC** ou le **régime réel LMNP**. Une distinction importante doit être faite entre les **meublés de tourisme classés** et les **meublés de tourisme non classés**." },
      { type: "table", head: ["Type de location", "Plafond micro-BIC 2026", "Abattement micro-BIC"], rows: [
        ["Meublé de tourisme non classé", "**15 000 €**", "**30 %**"],
        ["Meublé de tourisme classé", "**83 600 €**", "**50 %**"],
        ["Location meublée classique", "**83 600 €**", "**50 %**"],
      ]},
      { type: "note", text: "Un logement publié sur Airbnb n'est **pas automatiquement un meublé de tourisme classé**. Le classement de 1 à 5 étoiles résulte d'une démarche spécifique réalisée auprès d'un organisme habilité. Cette distinction peut avoir une incidence fiscale importante." },
      { type: "h2", id: "exemple-airbnb-fiscal", text: "Exemple" },
      { type: "p", text: "Un LMNP exploite un appartement Airbnb et réalise **14 000 € de recettes annuelles**. Si l'Airbnb est **non classé** au micro-BIC : 14 000 × 70 % = **9 800 € de bénéfice imposable**. Avec un meublé de tourisme **classé** : 14 000 × 50 % = **7 000 € de bénéfice imposable**." },

      { type: "h1", id: "micro-bic-vs-reel-airbnb", text: "Micro-BIC ou régime réel pour un Airbnb ?" },
      { type: "p", text: "Le **micro-BIC** est simple : le propriétaire déclare ses recettes et l'administration applique automatiquement l'abattement prévu. En contrepartie, aucune charge réelle ne peut être déduite." },
      { type: "p", text: "Le **régime réel LMNP** permet de déduire les dépenses supportées dans l'intérêt de l'activité. Il peut notamment s'agir, selon leur nature et sous réserve des règles fiscales applicables :" },
      { type: "ul", items: [
        "des intérêts d'emprunt et de l'assurance emprunteur ;",
        "des charges de copropriété déductibles ;",
        "de la taxe foncière et des assurances ;",
        "des frais de gestion et commissions de plateforme ;",
        "des frais de ménage supportés par le propriétaire ;",
        "de certaines dépenses d'entretien et de réparation ;",
        "des frais de comptabilité.",
      ]},
      { type: "p", text: "Le LMNP au réel permet également de pratiquer **l'amortissement du logement hors valeur du terrain, du mobilier et de certains équipements**. L'amortissement est toutefois plafonné : il ne peut pas, à lui seul, créer ou augmenter un déficit fiscal provenant de la location meublée. La fraction non déduite peut être reportée conformément aux règles applicables aux amortissements différés." },
      { type: "p", text: "Le régime réel est par ailleurs particulièrement important pour les meublés de tourisme non classés : au-delà du plafond micro-BIC de **15 000 €**, le régime réel devient le régime de référence, sous réserve des règles de dépassement de seuil." },

      { type: "h1", id: "regles-airbnb", text: "Quelles règles respecter pour louer sur Airbnb ?" },
      { type: "p", text: "Avoir le statut LMNP ne donne pas automatiquement le droit de louer un logement sur Airbnb. Il faut distinguer **la fiscalité LMNP** de **la réglementation applicable aux meublés de tourisme**." },
      { type: "h2", id: "declaration-enregistrement", text: "Déclaration et enregistrement du logement" },
      { type: "p", text: "Les règles dépendent de la commune. En août 2026, l'enregistrement des meublés de tourisme reste obligatoire dans certaines communes ayant déjà instauré un dispositif local. La Direction générale des Entreprises indique que le **téléservice national d'enregistrement** est désormais prévu pour le **quatrième trimestre 2026**. Il convient de vérifier les règles applicables dans la commune concernée avant toute mise en location." },
      { type: "h2", id: "limite-jours", text: "Résidence principale : 90 ou 120 jours maximum selon les communes" },
      { type: "p", text: "Pour une résidence principale, la location touristique est normalement limitée à **120 jours par année civile**. Depuis la loi du 19 novembre 2024, les communes peuvent décider de réduire cette limite jusqu'à **90 jours par an**. Le propriétaire doit vérifier la règle effectivement adoptée dans sa commune." },
      { type: "h2", id: "changement-usage", text: "Changement d'usage" },
      { type: "p", text: "Pour une résidence secondaire ou un logement spécifiquement consacré à Airbnb, certaines communes imposent une **autorisation de changement d'usage**. Les règles peuvent être particulièrement strictes dans les grandes villes et les zones connaissant une forte tension sur le logement. Une activité fiscalement éligible au LMNP peut donc être conforme aux règles fiscales tout en étant interdite ou limitée par les règles locales." },
      { type: "h2", id: "copropriete", text: "Copropriété" },
      { type: "p", text: "Le règlement de copropriété doit également être vérifié. Depuis 2025, un copropriétaire déclarant son logement comme meublé de tourisme doit en informer le syndic. La loi permet également, sous certaines conditions, aux copropriétés de modifier leur règlement à la **majorité des deux tiers** pour interdire les locations en meublé de tourisme." },

      { type: "h1", id: "avantages-inconvenients", text: "Quels sont les avantages et inconvénients d'Airbnb en LMNP ?" },
      { type: "h2", id: "avantages", text: "Les avantages" },
      { type: "ul", items: [
        "**Un potentiel de recettes plus élevé** : dans certaines zones touristiques ou grandes villes, la location à la nuitée peut produire davantage de recettes qu'une location meublée longue durée.",
        "**Une tarification flexible** : le prix peut varier selon la saison, les événements, les week-ends ou la demande locale.",
        "**La possibilité d'utiliser le régime réel LMNP** : les charges et amortissements peuvent réduire significativement le bénéfice fiscal.",
        "**Une utilisation plus flexible du logement** : le propriétaire peut conserver davantage de souplesse sur les périodes pendant lesquelles le logement est loué.",
      ]},
      { type: "h2", id: "inconvenients", text: "Les inconvénients" },
      { type: "ul", items: [
        "Rotation fréquente des locataires, ménage et blanchisserie, gestion des arrivées et départs.",
        "Vacance entre deux réservations, commissions des plateformes, revenus plus variables selon la saison.",
        "Réglementation nettement plus contraignante que pour une location meublée classique.",
        "Micro-BIC devenu nettement moins favorable pour les **Airbnb non classés** : abattement de seulement 30 % et seuil fixé à 15 000 € en 2026.",
      ]},

      { type: "h1", id: "cotisations-tva-cfe", text: "Airbnb, cotisations sociales, TVA et CFE" },
      { type: "h2", id: "cotisations-sociales-airbnb", text: "Les cotisations sociales" },
      { type: "p", text: "Il faut distinguer le **statut fiscal LMNP/LMP** de l'assujettissement aux cotisations sociales. En dessous de **23 000 € de recettes annuelles** en location de courte durée, l'activité relève en principe de la gestion du patrimoine privé ; les revenus peuvent supporter les prélèvements sociaux applicables aux revenus du patrimoine. Au-delà de **23 000 €**, des cotisations sociales peuvent devenir dues auprès de l'Urssaf selon le régime applicable. Il est donc possible que la qualification fiscale LMNP et les obligations sociales ne se superposent pas parfaitement." },
      { type: "h2", id: "tva-airbnb", text: "La TVA" },
      { type: "p", text: "Une location Airbnb classique, sans prestations assimilables à celles d'un hôtel, est en principe **exonérée de TVA**. En revanche, une activité proposant **au moins trois des quatre prestations suivantes** peut basculer vers la para-hôtellerie : petit-déjeuner, nettoyage régulier pendant le séjour, fourniture du linge de maison, réception de la clientèle. Dans cette situation, des règles différentes s'appliquent, notamment en matière de TVA. Un simple ménage entre deux locations ou la remise de linge à l'arrivée ne suffit pas nécessairement à transformer automatiquement un Airbnb en activité para-hôtelière." },
      { type: "h2", id: "cfe-airbnb", text: "La CFE" },
      { type: "p", text: "La location meublée est susceptible d'être soumise à la **cotisation foncière des entreprises (CFE)**, y compris lorsque le propriétaire est un particulier LMNP. Il existe toutefois plusieurs exonérations, notamment lorsque les recettes n'excèdent pas **5 000 €**, ainsi que dans certaines situations particulières." },

      { type: "h1", id: "revente-airbnb", text: "Quelle fiscalité à la revente d'un Airbnb en LMNP ?" },
      { type: "p", text: "Lorsqu'un propriétaire revend un logement exploité en Airbnb tout en étant **LMNP au moment de la vente**, il reste en principe soumis au régime des **plus-values immobilières des particuliers**. Cependant, pour les cessions réalisées depuis le **15 février 2025**, les amortissements pratiqués et effectivement déduits dans le cadre du régime réel doivent en principe être réintégrés dans le calcul de la plus-value." },
      { type: "p", text: "Le régime réel LMNP conserve donc son intérêt pendant la période de location, mais l'économie d'impôt obtenue grâce aux amortissements doit désormais être mise en perspective avec son impact potentiel lors de la revente. Cette règle concerne également un appartement exploité en location saisonnière de type Airbnb lorsqu'il relève du LMNP au réel." },

      { type: "h1", id: "faq-airbnb", text: "FAQ Airbnb et LMNP" },
      { type: "h2", id: "faq-compat", text: "Peut-on faire du Airbnb avec le statut LMNP ?" },
      { type: "p", text: "Oui. Une activité de location saisonnière ou de meublé de tourisme peut relever du **LMNP** tant que les conditions permettant de rester loueur non professionnel sont respectées." },
      { type: "h2", id: "faq-auto-lmnp", text: "Airbnb donne-t-il automatiquement droit au statut LMNP ?" },
      { type: "p", text: "Non. Airbnb n'est qu'une plateforme. C'est la situation fiscale du propriétaire et le montant de l'ensemble de ses recettes de location meublée qui déterminent son statut LMNP ou LMP." },
      { type: "h2", id: "faq-abatt-airbnb", text: "Quel est l'abattement LMNP pour Airbnb en 2026 ?" },
      { type: "p", text: "Pour les recettes perçues en 2026 : **30 % pour un meublé de tourisme non classé** (dans la limite de 15 000 €) et **50 % pour un meublé de tourisme classé** (dans la limite de 83 600 €)." },
      { type: "h2", id: "faq-amort-airbnb", text: "Peut-on amortir un Airbnb en LMNP ?" },
      { type: "p", text: "Oui, au **régime réel LMNP**, le logement hors terrain, le mobilier et certains équipements peuvent notamment être amortis selon les règles comptables et fiscales applicables." },
      { type: "h2", id: "faq-classement", text: "Faut-il classer son Airbnb ?" },
      { type: "p", text: "Le classement n'est pas nécessaire pour utiliser Airbnb, mais il peut avoir un intérêt fiscal important. En 2026, le régime micro-BIC est beaucoup plus favorable pour un meublé de tourisme classé que pour un meublé non classé, aussi bien en matière de plafond (83 600 € vs 15 000 €) que d'abattement (50 % vs 30 %)." },
      { type: "h2", id: "faq-dac7", text: "Airbnb transmet-il les revenus aux impôts ?" },
      { type: "p", text: "Oui. Dans le cadre du dispositif européen **DAC7**, les plateformes transmettent à l'administration fiscale des informations relatives aux opérations et aux revenus réalisés par leurs utilisateurs. Ces données peuvent également apparaître dans la déclaration de revenus préremplie." },
      { type: "h2", id: "a-retenir-airbnb", text: "Ce qu'il faut retenir" },
      { type: "ul", items: [
        "**Airbnb et LMNP sont compatibles** : la location saisonnière peut parfaitement être exercée sous le statut LMNP.",
        "Les revenus Airbnb en LMNP sont imposés dans la catégorie des **BIC**.",
        "En 2026, un meublé de tourisme **non classé** bénéficie au micro-BIC d'un abattement de **30 %** avec un plafond de **15 000 €**.",
        "Un meublé de tourisme **classé** bénéficie d'un abattement de **50 %** avec un plafond micro-BIC de **83 600 €** pour les revenus 2026.",
        "Au **régime réel LMNP**, les charges et amortissements peuvent réduire fortement le résultat imposable.",
        "Les règles locales doivent impérativement être vérifiées : déclaration, changement d'usage, limitation à 90 ou 120 jours, copropriété ou réglementation énergétique.",
        "Au-delà de **23 000 € de recettes en location de courte durée**, des cotisations sociales peuvent devenir applicables.",
        "Une activité proposant des prestations proches de l'hôtellerie peut relever de la **para-hôtellerie** et de règles différentes, notamment en matière de TVA.",
        "Depuis le **15 février 2025**, les amortissements LMNP déduits au réel sont en principe réintégrés pour le calcul de la plus-value lors de la revente.",
      ]},
    ],
  },

  "csg-prelevements-sociaux-lmnp-2026": {
    titre: "2026 : CSG et prélèvements sociaux en LMNP",
    date: "Mis à jour en août 2026",
    intro: [
      "La fiscalité du LMNP (Loueur en Meublé Non Professionnel) connaît en 2026 une évolution importante : le taux des prélèvements sociaux applicable aux revenus de location meublée non professionnelle passe, dans le cas général, de 17,2 % à 18,6 %.",
      "Cette hausse provient exclusivement de la CSG, dont le taux applicable aux revenus du patrimoine concernés passe de 9,2 % à 10,6 %. La CRDS reste fixée à 0,5 % et le prélèvement de solidarité à 7,5 %. L'administration fiscale confirme désormais explicitement un taux global de 18,6 % pour les revenus de location meublée, contre 17,2 % pour la location nue.",
      "La date d'application mérite toutefois une attention particulière : cette hausse ne concerne pas uniquement les loyers encaissés à partir du 1er janvier 2026. Le texte prévoit son application dès l'imposition des revenus de l'année 2025, lesquels sont déclarés et imposés en 2026.",
      "Pour un propriétaire LMNP, il est également essentiel de ne pas confondre prélèvements sociaux sur les revenus du patrimoine, cotisations sociales URSSAF et prélèvements sociaux sur la plus-value immobilière. Ces trois mécanismes obéissent à des règles différentes.",
    ],
    sections: [
      { id: "taux-2026", titre: "Quel est le taux des prélèvements sociaux LMNP en 2026 ?" },
      { id: "pourquoi-hausse", titre: "Pourquoi le taux LMNP passe-t-il de 17,2 % à 18,6 % ?" },
      { id: "date-application", titre: "À partir de quelle année la hausse de CSG s'applique-t-elle ?" },
      { id: "base-calcul", titre: "Sur quelle base sont calculés les prélèvements sociaux en LMNP ?" },
      { id: "calcul-micro-bic", titre: "Calcul des prélèvements sociaux au micro-BIC" },
      { id: "calcul-reel", titre: "Calcul des prélèvements sociaux au régime réel LMNP" },
      { id: "csg-deductible", titre: "CSG déductible : peut-on récupérer une partie de la CSG LMNP ?" },
      { id: "ps-vs-cotisations", titre: "Prélèvements sociaux ou cotisations sociales : quelle différence en LMNP ?" },
      { id: "saisonnier-23k", titre: "Location saisonnière : que se passe-t-il au-delà de 23 000 € ?" },
      { id: "plus-value-taux", titre: "Plus-value LMNP : le taux passe-t-il également à 18,6 % ?" },
      { id: "non-resident-csg", titre: "LMNP non-résident : faut-il payer la CSG ?" },
      { id: "impact-concret", titre: "Quel impact concret de la hausse de 17,2 % à 18,6 % ?" },
      { id: "faq-csg-lmnp", titre: "FAQ sur la CSG et les prélèvements sociaux LMNP" },
      { id: "a-retenir-csg", titre: "Ce qu'il faut retenir en 2026" },
    ],
    contenu: [
      { type: "h1", id: "taux-2026", text: "Quel est le taux des prélèvements sociaux LMNP en 2026 ?" },
      { type: "p", text: "Pour les revenus de **location meublée non professionnelle** qui ne sont pas déjà soumis aux cotisations et contributions sociales sur les revenus d'activité, le taux global des prélèvements sociaux est désormais de **18,6 %**." },
      { type: "table", head: ["Prélèvement", "Ancien taux", "Taux applicable"], rows: [
        ["CSG", "9,2 %", "**10,6 %**"],
        ["CRDS", "0,5 %", "**0,5 %**"],
        ["Prélèvement de solidarité", "7,5 %", "**7,5 %**"],
        ["**Total**", "**17,2 %**", "**18,6 %**"],
      ]},
      { type: "p", text: "La hausse représente **1,4 point** et provient entièrement de l'augmentation de la Contribution Sociale Généralisée (CSG). L'article L.136-8 du Code de la sécurité sociale fixe désormais à 10,6 % le taux de CSG applicable aux contributions sur les revenus du patrimoine visées par l'article L.136-6." },

      { type: "h1", id: "pourquoi-hausse", text: "Pourquoi le taux LMNP passe-t-il de 17,2 % à 18,6 % ?" },
      { type: "p", text: "Jusqu'à cette réforme, un LMNP soumis aux prélèvements sociaux sur les revenus du patrimoine supportait 9,2 % de CSG + 0,5 % de CRDS + 7,5 % de prélèvement de solidarité, soit **17,2 %**. La CSG applicable aux revenus du patrimoine concernés est désormais portée à **10,6 %**, portant le total à **18,6 %**." },
      { type: "p", text: "L'administration fiscale distingue désormais explicitement **location nue : 17,2 %** et **location meublée : 18,6 %**. Location nue et location meublée ne supportent donc plus nécessairement le même taux de prélèvements sociaux sur leurs revenus courants." },

      { type: "h1", id: "date-application", text: "À partir de quelle année la hausse de CSG s'applique-t-elle ?" },
      { type: "p", text: "On pourrait penser qu'un nouveau taux applicable en 2026 concerne uniquement les loyers encaissés entre le 1er janvier et le 31 décembre 2026. **Ce n'est pas le cas pour cette mesure.** La modification législative prévoit que le nouveau taux s'applique **à compter de l'imposition des revenus de l'année 2025**." },
      { type: "h2", id: "revenus-2025", text: "Revenus LMNP encaissés en 2025" },
      { type: "p", text: "Ils sont déclarés au printemps 2026. Les prélèvements sociaux correspondants sont calculés lors de l'imposition en 2026. Ils peuvent donc être soumis au nouveau taux de **18,6 %**." },
      { type: "h2", id: "revenus-2026", text: "Revenus LMNP encaissés en 2026" },
      { type: "p", text: "Ils seront déclarés en 2027. Le taux de 18,6 % leur est également applicable dans le cadre juridique actuellement en vigueur. L'administration fiscale mentionne d'ailleurs explicitement, pour les non-résidents percevant des locations meublées françaises, le taux de 18,6 % comme **« nouveau taux applicable à compter des revenus perçus en 2025 »**." },

      { type: "h1", id: "base-calcul", text: "Sur quelle base sont calculés les prélèvements sociaux en LMNP ?" },
      { type: "p", text: "Les 18,6 % ne sont généralement **pas calculés directement sur le montant total des loyers encaissés**. Ils portent sur le revenu fiscal net soumis aux prélèvements sociaux. La base dépend donc du régime fiscal LMNP : micro-BIC ou régime réel." },
      { type: "p", text: "L'administration fiscale confirme que le taux porte : au micro-BIC, sur les recettes après application de l'abattement ; au régime réel, sur le revenu net après prise en compte des dépenses déductibles. Un LMNP encaissant 20 000 € de loyers ne paiera donc pas nécessairement **20 000 × 18,6 % = 3 720 €** de prélèvements sociaux. Il faut d'abord déterminer sa base fiscale LMNP." },

      { type: "h1", id: "calcul-micro-bic", text: "Calcul des prélèvements sociaux au micro-BIC" },
      { type: "p", text: "Prenons un LMNP exploitant un appartement en location meublée longue durée au micro-BIC avec **24 000 € de recettes LMNP**. L'abattement micro-BIC de 50 % donne une base imposable de **12 000 €**." },
      { type: "formula", text: "12 000 × 18,6 % = 2 232 €  (contre 24 000 × 18,6 % = 4 464 € sur recettes brutes)" },
      { type: "p", text: "Comparaison avec l'ancien taux : 12 000 × 17,2 % = 2 064 €, contre 12 000 × 18,6 % = 2 232 €. La réforme entraîne **168 € supplémentaires** pour 12 000 € de base taxable." },
      { type: "h2", id: "meuble-tourisme-nc", text: "Meublé de tourisme non classé" },
      { type: "p", text: "Le principe reste identique, mais l'abattement du micro-BIC est de **30 %** pour un meublé de tourisme non classé. Avec 12 000 € de recettes, la base taxable est de 12 000 × 70 % = **8 400 €**, soit des prélèvements sociaux de 8 400 × 18,6 % = **1 562,40 €**." },

      { type: "h1", id: "calcul-reel", text: "Calcul des prélèvements sociaux au régime réel LMNP" },
      { type: "p", text: "Au régime réel, le LMNP ne bénéficie pas d'un abattement forfaitaire. Il détermine son résultat à partir des recettes, dont sont notamment retranchées les dépenses fiscalement déductibles et, dans les limites prévues, les amortissements." },
      { type: "h2", id: "exemple-reel", text: "Exemple" },
      { type: "p", text: "Un LMNP encaisse **24 000 € de recettes annuelles** et comptabilise : intérêts d'emprunt (3 000 €), charges de copropriété et autres charges déductibles (3 500 €), taxe foncière et assurances (1 500 €), autres frais déductibles (1 000 €), amortissements fiscalement déductibles (8 000 €). Total : 17 000 €. Résultat LMNP : 24 000 − 17 000 = **7 000 €**." },
      { type: "formula", text: "7 000 × 18,6 % = 1 302 €  (et non 24 000 × 18,6 % = 4 464 €)" },
      { type: "h2", id: "resultat-nul", text: "Et si le résultat LMNP est ramené à zéro ?" },
      { type: "p", text: "Lorsque le résultat imposable LMNP est nul après déduction des charges et amortissements fiscalement admis, il n'existe en principe plus de bénéfice sur lequel appliquer les prélèvements sociaux. C'est l'une des différences majeures entre micro-BIC et régime réel. Il faut toutefois rappeler que l'amortissement LMNP est plafonné : il ne peut pas être utilisé pour créer un déficit fiscal provenant de l'amortissement, la fraction non utilisable étant reportée selon les règles applicables." },

      { type: "h1", id: "csg-deductible", text: "CSG déductible : peut-on récupérer une partie de la CSG LMNP ?" },
      { type: "p", text: "**Oui, sous certaines conditions.** Même si le taux de CSG passe à 10,6 %, une fraction de cette CSG peut être déduite du revenu global lorsque les revenus concernés sont soumis au barème progressif de l'impôt sur le revenu. Le montant déductible reste fixé à **6,8 %** de la base concernée." },
      { type: "h2", id: "exemple-csg-ded", text: "Exemple avec un revenu LMNP taxable de 10 000 €" },
      { type: "p", text: "Prélèvements sociaux : 10 000 × 18,6 % = **1 860 €**. Dont CSG totale : 10 000 × 10,6 % = **1 060 €**. Fraction susceptible d'être déduite : 10 000 × 6,8 % = **680 €**. Attention : il ne s'agit pas d'un remboursement — les 680 € sont **déduits du revenu global imposable** de l'année de paiement. À une TMI de 30 %, cela représenterait théoriquement 680 × 30 % = **204 €** d'impôt en moins, toutes choses égales par ailleurs." },
      { type: "h2", id: "decalage-csg", text: "Quand cette CSG est-elle déduite ?" },
      { type: "p", text: "Il existe un décalage temporel. Un revenu LMNP perçu en année N est déclaré en N+1 ; les prélèvements sociaux sont payés en N+1 ; la fraction de CSG déductible est alors déduite des revenus de **N+1**, déclarés en N+2. Le montant est normalement calculé par l'administration et prérempli en **case 6DE de la déclaration n°2042**." },

      { type: "h1", id: "ps-vs-cotisations", text: "Prélèvements sociaux ou cotisations sociales : quelle différence en LMNP ?" },
      { type: "p", text: "C'est probablement la distinction la plus importante de cet article." },
      { type: "h2", id: "les-ps", text: "Les prélèvements sociaux" },
      { type: "p", text: "Ils concernent, dans le cas général, les revenus LMNP considérés comme **revenus du patrimoine**. Ils sont calculés par l'administration fiscale au taux désormais de **18,6 %**." },
      { type: "h2", id: "les-cotisations", text: "Les cotisations sociales" },
      { type: "p", text: "Elles correspondent à un régime social d'activité et peuvent s'appliquer notamment lorsque certaines activités de location meublée franchissent des seuils prévus par le Code de la sécurité sociale. La doctrine fiscale souligne expressément que les critères fiscaux permettant de distinguer LMNP et LMP peuvent être différents de ceux utilisés par le droit social. Autrement dit : **être LMNP fiscalement ne garantit pas automatiquement l'absence de cotisations sociales.**" },

      { type: "h1", id: "saisonnier-23k", text: "Location saisonnière : que se passe-t-il au-delà de 23 000 € ?" },
      { type: "p", text: "Pour une activité de location meublée de courte durée à une clientèle qui n'y élit pas domicile, l'administration indique qu'au-delà de **23 000 € de recettes annuelles**, le loueur est soumis aux **cotisations sociales et contributions sociales sur les revenus d'activité** auprès des organismes de sécurité sociale. Lorsque les revenus sont déjà soumis aux contributions sociales par les organismes de sécurité sociale, ils ne sont pas à nouveau soumis aux prélèvements sociaux de 18,6 % par la DGFiP." },
      { type: "table", head: ["Situation", "Prélèvements applicables"], rows: [
        ["LMNP longue durée classique", "Prélèvements sociaux patrimoniaux : **18,6 %** sur le bénéfice fiscal"],
        ["Location touristique sous le seuil social", "Prélèvements sociaux patrimoniaux : **18,6 %** dans le cas général"],
        ["Location touristique dépassant 23 000 € de recettes", "**Cotisations et contributions sociales d'activité** — ne pas raisonner avec le seul taux de 18,6 %"],
      ]},
      { type: "h2", id: "non-classe-2026", text: "Cas particulier des meublés de tourisme non classés en 2026" },
      { type: "p", text: "Le plafond du micro-BIC pour un meublé de tourisme non classé est de **15 000 €**, alors que le seuil d'affiliation sociale pour la courte durée reste fixé à **23 000 €**. À compter du 1er janvier 2026, ces loueurs ne peuvent donc plus utiliser le régime micro-social spécifique lorsque leurs recettes dépassent 23 000 € : ils sont alors soumis aux cotisations et contributions sociales selon le régime réel des travailleurs indépendants concernés." },

      { type: "h1", id: "plus-value-taux", text: "Plus-value LMNP : le taux passe-t-il également à 18,6 % ?" },
      { type: "p", text: "**Non.** Il faut distinguer la fiscalité des **revenus locatifs LMNP** de celle de la **plus-value réalisée lors de la vente**. La plus-value immobilière d'un LMNP relevant du régime des plus-values immobilières des particuliers continue de supporter **19 % d'impôt sur le revenu** et **17,2 % de prélèvements sociaux**, avant application des abattements pour durée de détention. Il serait donc incorrect d'appliquer automatiquement le taux de 18,6 % à la plus-value LMNP." },
      { type: "h2", id: "rappel-reintegration", text: "Rappel sur la réintégration des amortissements LMNP" },
      { type: "p", text: "Depuis les cessions réalisées à compter du **15 février 2025**, les amortissements LMNP concernés qui ont été admis en déduction au régime réel diminuent le prix d'acquisition fiscal utilisé pour déterminer la plus-value, augmentant donc potentiellement la plus-value brute. Les abattements pour durée de détention continuent cependant de s'appliquer à la plus-value ainsi déterminée. Cette question est donc distincte de la hausse de la CSG applicable aux revenus annuels LMNP." },

      { type: "h1", id: "non-resident-csg", text: "LMNP non-résident : faut-il payer la CSG ?" },
      { type: "p", text: "Les revenus immobiliers français d'un contribuable domicilié hors de France peuvent rester soumis aux prélèvements sociaux français. Toutefois, certaines personnes affiliées au régime d'assurance maladie d'un État de l'Espace économique européen, du Royaume-Uni ou de la Suisse, et qui ne sont pas à la charge d'un régime obligatoire français de sécurité sociale, bénéficient d'une règle particulière : leurs revenus locatifs concernés **ne sont pas soumis à la CSG ni à la CRDS**. Ils restent cependant soumis au **prélèvement de solidarité de 7,5 %**." },
      { type: "h2", id: "exemple-non-resident", text: "Exemple" },
      { type: "p", text: "Un propriétaire répondant à l'ensemble des conditions de cette exonération dispose d'une base taxable LMNP de **15 000 €**. Au lieu de 15 000 × 18,6 % = 2 790 €, le prélèvement de solidarité serait de 15 000 × 7,5 % = **1 125 €**, sous réserve que l'ensemble des conditions soit effectivement satisfait." },

      { type: "h1", id: "impact-concret", text: "Quel impact concret de la hausse de 17,2 % à 18,6 % ?" },
      { type: "p", text: "La différence de taux est de **1,4 point**. L'augmentation peut être facilement estimée à partir du bénéfice fiscal LMNP soumis aux prélèvements sociaux." },
      { type: "table", head: ["Base LMNP taxable", "À 17,2 %", "À 18,6 %", "Hausse annuelle"], rows: [
        ["2 500 €", "430 €", "465 €", "**+35 €**"],
        ["5 000 €", "860 €", "930 €", "**+70 €**"],
        ["10 000 €", "1 720 €", "1 860 €", "**+140 €**"],
        ["20 000 €", "3 440 €", "3 720 €", "**+280 €**"],
        ["30 000 €", "5 160 €", "5 580 €", "**+420 €**"],
      ]},
      { type: "p", text: "La réforme augmente donc la fiscalité LMNP de **14 € supplémentaires pour chaque tranche de 1 000 € de bénéfice taxable**." },
      { type: "h2", id: "impact-micro", text: "Impact au micro-BIC" },
      { type: "p", text: "Le bénéfice taxable correspond à une fraction forfaitaire des recettes après abattement. La hausse de CSG entraîne donc mécaniquement une augmentation du montant dû dès qu'un revenu imposable subsiste." },
      { type: "h2", id: "impact-reel", text: "Impact au régime réel LMNP" },
      { type: "p", text: "Si les charges et amortissements réduisent fortement le bénéfice fiscal, l'augmentation absolue peut être faible. Avec un bénéfice fiscal LMNP de **2 000 €** : ancien taux 2 000 × 17,2 % = 344 €, nouveau taux 2 000 × 18,6 % = 372 €, différence : **28 € par an**. Si le résultat fiscal est nul, la hausse de 1,4 point n'a aucune base positive sur laquelle s'appliquer." },

      { type: "h1", id: "faq-csg-lmnp", text: "FAQ sur la CSG et les prélèvements sociaux LMNP en 2026" },
      { type: "h2", id: "faq-taux-global", text: "Quel est le taux des prélèvements sociaux en LMNP en 2026 ?" },
      { type: "p", text: "Dans le cas général d'un LMNP dont les revenus ne sont pas déjà soumis aux cotisations et contributions sociales d'activité, le taux est désormais de **18,6 %** (CSG 10,6 % + CRDS 0,5 % + prélèvement de solidarité 7,5 %)." },
      { type: "h2", id: "faq-ancien-taux", text: "Le taux LMNP était-il auparavant de 17,2 % ?" },
      { type: "p", text: "Oui. La CSG était auparavant de 9,2 %, ce qui donnait 9,2 % + 0,5 % + 7,5 % = **17,2 %**. La hausse de la CSG à 10,6 % porte le total à 18,6 %." },
      { type: "h2", id: "faq-seulement-2026", text: "La hausse à 18,6 % ne concerne-t-elle que les revenus 2026 ?" },
      { type: "p", text: "Non. Le texte prévoit l'application du nouveau taux **dès l'imposition des revenus de l'année 2025**. Les loyers LMNP encaissés en 2025 et déclarés en 2026 sont donc déjà concernés." },
      { type: "h2", id: "faq-sur-loyers", text: "Les 18,6 % sont-ils calculés sur les loyers encaissés ?" },
      { type: "p", text: "Pas nécessairement. Au micro-BIC, ils sont calculés après l'abattement forfaitaire. Au régime réel LMNP, ils portent sur le revenu fiscal net après prise en compte des éléments déductibles applicables." },
      { type: "h2", id: "faq-charges-locataire", text: "Les charges payées par le locataire sont-elles comprises dans les recettes LMNP ?" },
      { type: "p", text: "Les sommes perçues au titre de la location meublée doivent être déclarées **charges locatives comprises**. Au micro-BIC, l'abattement est ensuite appliqué à la totalité des recettes déclarées. Au régime réel, les sommes perçues sont également comptabilisées, puis les charges réellement supportées sont prises en compte pour déterminer le résultat." },
      { type: "h2", id: "faq-amort-ps", text: "Les amortissements réduisent-ils aussi les prélèvements sociaux LMNP ?" },
      { type: "p", text: "Au régime réel, les amortissements fiscalement admis diminuent le résultat imposable dans les limites propres au LMNP. Une diminution du bénéfice fiscal réduit donc également la base sur laquelle sont calculés les prélèvements sociaux patrimoniaux." },
      { type: "h2", id: "faq-csg-ded", text: "Peut-on déduire la CSG LMNP ?" },
      { type: "p", text: "Une fraction de la CSG sur les revenus du patrimoine soumis au barème progressif est déductible, actuellement à **6,8 %**. Elle est normalement reportée en case **6DE** de la déclaration de revenus de l'année de paiement des prélèvements sociaux." },
      { type: "h2", id: "faq-remboursement", text: "Est-ce que 6,8 % des prélèvements sociaux sont remboursés ?" },
      { type: "p", text: "Non. Il ne s'agit pas d'un remboursement. Le montant correspondant à 6,8 % de la base est **déduit du revenu global imposable**. L'économie fiscale réelle dépend ensuite de la situation du contribuable et notamment de son taux marginal d'imposition." },
      { type: "h2", id: "faq-toujours-186", text: "Un LMNP paie-t-il toujours 18,6 % de prélèvements sociaux ?" },
      { type: "p", text: "Non. Certains revenus de location meublée sont soumis aux **cotisations et contributions sociales d'activité**, notamment dans certaines situations de location saisonnière. Ils ne sont alors pas soumis une seconde fois aux prélèvements sociaux patrimoniaux de 18,6 %." },
      { type: "h2", id: "faq-urssaf", text: "Peut-on être LMNP et payer des cotisations sociales URSSAF ?" },
      { type: "p", text: "**Oui.** La qualification fiscale LMNP/LMP et les règles d'affiliation sociale ne sont pas identiques. Un loueur peut donc être **LMNP fiscalement tout en étant assujetti aux cotisations sociales** dans certaines situations, particulièrement en location meublée de courte durée." },
      { type: "h2", id: "faq-23k-lmp", text: "Le seuil de 23 000 € signifie-t-il toujours que l'on devient LMP ?" },
      { type: "p", text: "Non. Fiscalement, devenir LMP suppose que les deux conditions de l'article 155 du CGI soient réunies : recettes de location meublée supérieures à 23 000 € **et** recettes supérieures aux autres revenus professionnels du foyer. En revanche, les règles sociales applicables à certaines locations touristiques peuvent utiliser le seuil de 23 000 € selon une logique différente — c'est précisément pour cette raison qu'il faut distinguer **LMNP fiscal** et **régime social**." },
      { type: "h2", id: "faq-pv-taux", text: "Quel taux de prélèvements sociaux s'applique à la plus-value LMNP ?" },
      { type: "p", text: "Le taux reste de **17,2 %** dans le régime des plus-values immobilières des particuliers. La hausse à 18,6 % des prélèvements sociaux sur les revenus LMNP ne doit donc pas être appliquée à la plus-value immobilière." },
      { type: "h2", id: "faq-non-resident", text: "Un LMNP non-résident paie-t-il toujours 18,6 % ?" },
      { type: "p", text: "Non. Certaines personnes affiliées à la sécurité sociale d'un État de l'EEE, du Royaume-Uni ou de la Suisse et qui ne sont pas à la charge du régime français peuvent être exonérées de CSG et de CRDS. Elles restent alors redevables du prélèvement de solidarité de **7,5 %**." },

      { type: "h1", id: "a-retenir-csg", text: "Ce qu'il faut retenir sur la CSG et les prélèvements sociaux LMNP en 2026" },
      { type: "ul", items: [
        "**1.** Le taux global des prélèvements sociaux applicable aux revenus LMNP passe de 17,2 % à **18,6 %** dans le cas général.",
        "**2.** Cette hausse provient uniquement de la CSG, qui passe de 9,2 % à **10,6 %**. La CRDS reste à 0,5 % et le prélèvement de solidarité à 7,5 %.",
        "**3.** Le nouveau taux s'applique **dès l'imposition des revenus de l'année 2025**, donc aux revenus LMNP 2025 déclarés et imposés en 2026.",
        "**4.** Les 18,6 % ne sont pas nécessairement appliqués sur le montant brut des loyers. Au micro-BIC, ils portent sur la base restant après abattement ; au régime réel, ils portent sur le résultat fiscal net.",
        "**5.** Au régime réel LMNP, les charges et amortissements fiscalement déductibles peuvent réduire fortement la base des prélèvements sociaux.",
        "**6.** Une fraction de la CSG reste déductible du revenu global : **6,8 %** de la base concernée, sous les conditions prévues pour les revenus soumis au barème progressif.",
        "**7.** Les prélèvements sociaux de 18,6 % ne doivent pas être confondus avec les **cotisations sociales URSSAF**.",
        "**8.** Un propriétaire peut être LMNP fiscalement mais être soumis aux cotisations sociales dans certaines activités, notamment en location meublée de courte durée au-delà des seuils sociaux applicables.",
        "**9.** Lorsqu'un revenu est déjà soumis aux cotisations et contributions sociales d'activité, il n'est pas soumis une seconde fois aux prélèvements sociaux patrimoniaux de 18,6 %.",
        "**10.** Le taux de **18,6 % ne s'applique pas à la plus-value immobilière LMNP** : les prélèvements sociaux sur la plus-value restent fixés à 17,2 % dans le régime des particuliers.",
        "**11.** Certains LMNP non-résidents affiliés à un régime d'assurance maladie de l'EEE, du Royaume-Uni ou de la Suisse peuvent être exonérés de CSG et CRDS et ne supporter que le prélèvement de solidarité de **7,5 %**.",
        "**12.** La hausse de la CSG représente **14 € supplémentaires pour chaque tranche de 1 000 € de bénéfice taxable**. Son impact financier dépend directement de la base taxable et donc du régime fiscal LMNP.",
      ]},
    ],
  },

  "lmnp-definition-statut-2026": {
    titre: "LMNP : Définition et conditions du statut de location meublée (2026)",
    date: "Mis à jour en août 2026",
    intro: [
      "Le statut de Loueur en Meublé Non Professionnel (LMNP) permet à un particulier de louer un logement meublé tout en bénéficiant d'un cadre fiscal spécifique. Il s'applique à la location nue d'un bien équipé du mobilier nécessaire à l'occupation immédiate, que ce soit à titre d'habitation principale, de résidence secondaire ou de logement étudiant.",
      "En 2026, les règles du LMNP restent globalement stables par rapport à 2025, avec deux régimes fiscaux possibles : le micro-BIC, qui applique un abattement forfaitaire sur les recettes, et le régime réel, qui permet de déduire les charges réelles et d'amortir le bien et ses équipements.",
      "Le statut LMNP est accessible à la majorité des propriétaires bailleurs meublés, sous réserve de respecter certaines conditions tenant aux revenus tirés de la location et au logement lui-même.",
      "Depuis le 15 février 2025, les amortissements LMNP déduits au régime réel sont également pris en compte dans le calcul de la plus-value en cas de revente. Ce point modifie la comparaison entre les deux régimes sur le long terme.",
    ],
    sections: [
      { id: "qu-est-ce-lmnp", titre: "Qu'est-ce que le LMNP ?" },
      { id: "conditions-lmnp-2026", titre: "Quelles sont les conditions pour avoir le statut LMNP en 2026 ?" },
      { id: "plafond-revenus", titre: "Quel plafond de revenus faut-il respecter pour rester LMNP ?" },
      { id: "conditions-logement", titre: "Quelles conditions doit respecter un logement meublé ?" },
      { id: "obtenir-declarer", titre: "Comment obtenir le statut LMNP et déclarer son activité ?" },
      { id: "types-location", titre: "Quels types de location et de bail sont possibles en LMNP ?" },
      { id: "lmnp-vs-lmp", titre: "LMNP ou LMP : quelles différences ?" },
      { id: "micro-bic-reel", titre: "Micro-BIC ou régime réel : quelle fiscalité pour le LMNP en 2026 ?" },
      { id: "declarer-revenus", titre: "Comment déclarer les revenus d'un LMNP ?" },
      { id: "taxes-cotisations", titre: "Quelles taxes et cotisations peuvent concerner un LMNP ?" },
      { id: "lmnp-vs-vide", titre: "LMNP et location vide : quelles différences ?" },
      { id: "faq-lmnp", titre: "FAQ sur le statut LMNP en 2026" },
      { id: "a-retenir-lmnp", titre: "Ce qu'il faut retenir sur le LMNP" },
    ],
    contenu: [
      { type: "h1", id: "qu-est-ce-lmnp", text: "Qu'est-ce que le LMNP ?" },
      { type: "p", text: "Le LMNP (Loueur en Meublé Non Professionnel) est un statut fiscal qui s'applique à toute personne physique qui met en location un ou plusieurs logements meublés, sans que cette activité ne remplisse les critères du statut LMP (Loueur en Meublé Professionnel)." },
      { type: "p", text: "Concrètement, un bailleur est LMNP lorsque :" },
      { type: "ul", items: [
        "ses recettes locatives annuelles issues de la location meublée sont inférieures à 23 000 € **ou** inférieures à ses autres revenus professionnels du foyer fiscal,",
        "il n'est pas inscrit au Registre du Commerce et des Sociétés (RCS) comme loueur en meublé professionnel.",
      ]},
      { type: "p", text: "Le LMNP est une activité commerciale au sens fiscal, relevant des bénéfices industriels et commerciaux (BIC), même si le bailleur est un particulier. Cela le distingue fondamentalement de la location nue, qui relève des revenus fonciers." },
      { type: "p", text: "Ce statut est accessible à tout propriétaire d'un logement meublé, qu'il s'agisse d'un appartement, d'une maison, d'une chambre, d'un studio étudiant, d'une résidence de services (résidence étudiante, EHPAD, résidence de tourisme…) ou d'un bien en colocation meublée." },

      { type: "h1", id: "conditions-lmnp-2026", text: "Quelles sont les conditions pour avoir le statut LMNP en 2026 ?" },
      { type: "p", text: "Pour bénéficier du statut LMNP en 2026, deux conditions cumulatives s'appliquent." },
      { type: "h2", id: "condition-recettes", text: "Condition 1 : un plafond de recettes ou un seuil relatif aux revenus professionnels" },
      { type: "p", text: "Les recettes brutes annuelles issues de la location meublée doivent soit :" },
      { type: "ul", items: [
        "être inférieures à **23 000 €** par an (toutes locations meublées confondues),",
        "**ou** représenter moins de la moitié des revenus professionnels du foyer fiscal (salaires, pensions, BIC d'une autre activité…).",
      ]},
      { type: "p", text: "Ces deux conditions sont alternatives : il suffit que l'une des deux soit respectée pour rester LMNP. En revanche, si les recettes dépassent 23 000 € **et** représentent plus de 50 % des revenus du foyer, le bailleur bascule en LMP." },
      { type: "h2", id: "condition-non-rcs", text: "Condition 2 : ne pas être inscrit au RCS comme loueur professionnel" },
      { type: "p", text: "Le bailleur ne doit pas être immatriculé au Registre du Commerce et des Sociétés (RCS) en tant que loueur en meublé professionnel. Dans la pratique, la quasi-totalité des bailleurs meublés non professionnels ne procèdent pas à cette inscription, qui est une démarche volontaire et distincte de la déclaration de début d'activité (P0i)." },

      { type: "h1", id: "plafond-revenus", text: "Quel plafond de revenus faut-il respecter pour rester LMNP ?" },
      { type: "p", text: "Le plafond de 23 000 € s'entend des recettes brutes (loyers charges comprises perçus ou à percevoir) et non du bénéfice ou du revenu net. Il s'apprécie à l'échelle du foyer fiscal, en cumulant les recettes de tous les logements meublés détenus par l'ensemble des membres du foyer." },
      { type: "table", head: ["Situation", "Statut applicable"], rows: [
        ["Recettes < 23 000 € par an", "LMNP (quelle que soit la part dans les revenus du foyer)"],
        ["Recettes ≥ 23 000 € et < 50 % des revenus professionnels du foyer", "LMNP"],
        ["Recettes ≥ 23 000 € et ≥ 50 % des revenus professionnels du foyer", "LMP"],
      ]},
      { type: "p", text: "Pour les bailleurs proches du seuil, il est recommandé de suivre l'évolution des recettes en cours d'année. Le basculement en LMP entraîne des obligations comptables et fiscales différentes, notamment en matière de cotisations sociales." },

      { type: "h1", id: "conditions-logement", text: "Quelles conditions doit respecter un logement meublé ?" },
      { type: "p", text: "Pour être qualifié de meublé au sens fiscal, un logement doit être équipé d'un mobilier en nombre et en qualité suffisants pour permettre au locataire d'y vivre normalement, c'est-à-dire d'y dormir, de s'y nourrir et d'y résider sans avoir à apporter ses propres meubles essentiels." },
      { type: "p", text: "La liste minimale du mobilier obligatoire est fixée par le décret n° 2015-981 du 31 juillet 2015. Elle comprend :" },
      { type: "ul", items: [
        "literie avec couette ou couverture,",
        "volets ou rideaux dans les chambres,",
        "plaques de cuisson,",
        "four ou four à micro-ondes,",
        "réfrigérateur et congélateur ou réfrigérateur avec compartiment de congélation,",
        "vaisselle en nombre suffisant pour les repas,",
        "ustensiles de cuisine,",
        "table et sièges,",
        "étagères de rangement,",
        "luminaires,",
        "matériel d'entretien ménager adapté au logement.",
      ]},
      { type: "p", text: "Un logement dont l'équipement serait insuffisant ou de mauvaise qualité pourrait être requalifié en location nue, avec toutes les conséquences fiscales que cela implique." },

      { type: "h1", id: "obtenir-declarer", text: "Comment obtenir le statut LMNP et déclarer son activité ?" },
      { type: "p", text: "Le statut LMNP n'est pas « demandé » en tant que tel : il découle automatiquement du respect des conditions exposées ci-dessus. En revanche, il existe des obligations déclaratives à respecter." },
      { type: "h2", id: "declaration-debut", text: "Déclaration de début d'activité (formulaire P0i)" },
      { type: "p", text: "Lors de la mise en location du premier bien meublé, le bailleur doit effectuer une déclaration de début d'activité auprès du greffe du tribunal de commerce ou via le guichet unique de l'INPI, en utilisant le formulaire P0i. Cette démarche permet d'obtenir un numéro SIRET, indispensable pour les déclarations fiscales ultérieures." },
      { type: "p", text: "Cette déclaration doit être effectuée dans les 15 jours suivant le début de la location." },
      { type: "h2", id: "declaration-annuelle", text: "Déclaration annuelle des revenus" },
      { type: "p", text: "Chaque année, le bailleur LMNP doit déclarer ses recettes locatives :" },
      { type: "ul", items: [
        "**En micro-BIC** : les recettes brutes sont reportées sur la déclaration complémentaire de revenus (formulaire 2042 C Pro), rubrique « Locations meublées non professionnelles ».",
        "**Au régime réel** : une liasse fiscale doit être déposée (formulaire 2031 et ses annexes), puis le résultat fiscal est reporté sur la déclaration 2042 C Pro.",
      ]},

      { type: "h1", id: "types-location", text: "Quels types de location et de bail sont possibles en LMNP ?" },
      { type: "p", text: "Le LMNP est compatible avec plusieurs formes de location meublée :" },
      { type: "ul", items: [
        "**Location meublée à titre de résidence principale** : bail d'un an minimum (9 mois pour les étudiants), encadré par la loi ALUR. Le locataire bénéficie d'une protection similaire à celle d'une location nue.",
        "**Location saisonnière ou touristique** : location de courte durée (nuitées, semaines), sans bail long terme. Soumise à des règles spécifiques en matière d'enregistrement et, dans certaines communes, de changement d'usage.",
        "**Location en résidence de services** : l'investisseur est propriétaire d'un lot dans une résidence gérée (étudiante, EHPAD, affaires, tourisme) et confie la gestion à un exploitant via un bail commercial.",
        "**Colocation meublée** : location d'une chambre meublée dans un logement partagé, avec un bail par occupant ou un bail collectif.",
      ]},
      { type: "p", text: "Dans tous les cas, c'est la qualification fiscale du logement (meublé vs nu) et le niveau des recettes qui déterminent le statut LMNP ou LMP, indépendamment du type de bail utilisé." },

      { type: "h1", id: "lmnp-vs-lmp", text: "LMNP ou LMP : quelles différences ?" },
      { type: "p", text: "Le LMP (Loueur en Meublé Professionnel) s'applique lorsque les recettes locatives annuelles dépassent 23 000 € **et** représentent plus de 50 % des revenus professionnels du foyer fiscal." },
      { type: "table", head: ["Critère", "LMNP", "LMP"], rows: [
        ["Recettes annuelles", "< 23 000 € ou < 50 % des revenus professionnels", "≥ 23 000 € ET ≥ 50 % des revenus professionnels"],
        ["Régimes fiscaux disponibles", "Micro-BIC ou régime réel", "Régime réel uniquement (micro-BIC possible sous 77 700 €)"],
        ["Déficit imputable", "Sur les revenus de même nature (BIC non pro), 10 ans", "Sur le revenu global, sans limitation"],
        ["Plus-value de cession", "Plus-value des particuliers (abattements pour durée)", "Plus-value professionnelle (exonérations possibles sous conditions)"],
        ["Cotisations sociales", "Non (sauf location de courte durée > 23 000 €)", "Oui (SSI ou régime général selon le cas)"],
        ["IFI", "Bien non exonéré en principe", "Exonération possible si activité principale"],
      ]},
      { type: "p", text: "Le passage en LMP peut représenter un avantage fiscal significatif pour les bailleurs fortement déficitaires (imputation du déficit sur le revenu global), mais il entraîne aussi des obligations sociales et une fiscalité de la plus-value différente." },

      { type: "h1", id: "micro-bic-reel", text: "Micro-BIC ou régime réel : quelle fiscalité pour le LMNP en 2026 ?" },
      { type: "h2", id: "micro-bic", text: "Le micro-BIC" },
      { type: "p", text: "Le micro-BIC s'applique automatiquement si les recettes annuelles ne dépassent pas 77 700 € (seuil 2026 pour la location meublée classique). Un abattement forfaitaire de 50 % est appliqué sur les recettes brutes pour déterminer le bénéfice imposable." },
      { type: "formula", text: "Bénéfice imposable = Recettes brutes × 50 %" },
      { type: "note", text: "Pour les meublés de tourisme classés, le seuil micro-BIC est plus élevé (sous conditions) et l'abattement peut différer. Vérifiez votre situation spécifique." },
      { type: "p", text: "Le micro-BIC est simple et ne nécessite pas de tenir une comptabilité détaillée. Cependant, il est généralement moins avantageux lorsque les charges réelles et les amortissements dépassent 50 % des recettes." },
      { type: "h2", id: "regime-reel", text: "Le régime réel" },
      { type: "p", text: "Au régime réel, le bénéfice imposable est calculé en déduisant les charges réelles des recettes : intérêts d'emprunt, charges de copropriété, taxe foncière, assurances, frais de gestion, et surtout **amortissements** du bien et du mobilier." },
      { type: "formula", text: "Résultat fiscal = Recettes brutes − Charges déductibles − Amortissements" },
      { type: "p", text: "Les amortissements permettent souvent de ramener le résultat fiscal à zéro, voire de générer un déficit BIC non professionnel reportable sur les revenus de même nature pendant 10 ans. C'est l'un des principaux avantages du LMNP au régime réel." },
      { type: "p", text: "Depuis le 15 février 2025, les amortissements déduits au régime réel réduisent le prix d'acquisition retenu pour le calcul de la plus-value à la revente. Cet impact doit être intégré dans l'analyse globale de l'investissement." },

      { type: "h1", id: "declarer-revenus", text: "Comment déclarer les revenus d'un LMNP ?" },
      { type: "p", text: "La déclaration des revenus LMNP dépend du régime fiscal choisi." },
      { type: "table", head: ["Régime", "Formulaires à utiliser", "Délai"], rows: [
        ["Micro-BIC", "2042 C Pro (revenus BIC non professionnels, case 5ND ou 5NG selon le type de meublé)", "Déclaration annuelle des revenus (printemps)"],
        ["Régime réel", "2031 (déclaration de résultats BIC) + annexes 2033-A à 2033-G, puis report sur 2042 C Pro", "Déclaration 2031 : 2e jour ouvré suivant le 1er mai ; déclaration 2042 : délai habituel"],
      ]},
      { type: "p", text: "Pour le régime réel, il est fortement recommandé de faire appel à un expert-comptable ou d'adhérer à un Centre de Gestion Agréé (CGA). L'adhésion à un CGA évite la majoration de 25 % qui s'appliquait historiquement aux non-adhérents sur le bénéfice imposable (cette majoration a été supprimée progressivement, mais vérifiez la situation pour l'année en cours)." },

      { type: "h1", id: "taxes-cotisations", text: "Quelles taxes et cotisations peuvent concerner un LMNP ?" },
      { type: "h2", id: "taxe-fonciere", text: "La taxe foncière" },
      { type: "p", text: "Le propriétaire LMNP est redevable de la taxe foncière, comme tout propriétaire immobilier. Elle est déductible des revenus au régime réel." },
      { type: "h2", id: "cfe", text: "La Cotisation Foncière des Entreprises (CFE)" },
      { type: "p", text: "En tant qu'activité commerciale, la location meublée est en principe soumise à la CFE. Une exonération de CFE s'applique cependant lorsque le loueur loue ou sous-loue **une partie de sa résidence principale** à un prix raisonnable, ou lorsque les recettes sont très faibles. Pour les autres cas, une cotisation minimale est due à partir de la deuxième année d'activité." },
      { type: "h2", id: "cotisations-sociales", text: "Les cotisations sociales" },
      { type: "p", text: "En principe, le LMNP n'est pas soumis aux cotisations sociales (régime SSI ou régime général). Des prélèvements sociaux à 17,2 % s'appliquent cependant sur les revenus BIC (micro-BIC ou régime réel). Pour les locations de courte durée (type Airbnb) dont les recettes dépassent 23 000 €, une affiliation au régime social des indépendants peut être requise." },

      { type: "h1", id: "lmnp-vs-vide", text: "LMNP et location vide : quelles différences ?" },
      { type: "table", head: ["Critère", "Location nue (vide)", "LMNP"], rows: [
        ["Régime fiscal", "Revenus fonciers (micro-foncier ou réel)", "BIC (micro-BIC ou régime réel)"],
        ["Abattement forfaitaire", "30 % (micro-foncier)", "50 % (micro-BIC)"],
        ["Amortissement du bien", "Non", "Oui (régime réel)"],
        ["Déficit imputable", "Sur revenu global jusqu'à 10 700 €/an", "Sur BIC non pro, 10 ans"],
        ["Durée minimale du bail", "3 ans (6 ans pour société)", "1 an (9 mois pour étudiants)"],
        ["Mobilier requis", "Non", "Oui (liste réglementaire)"],
        ["Plus-value", "Plus-value des particuliers", "Plus-value des particuliers (avec réintégration des amortissements depuis 2025)"],
      ]},
      { type: "p", text: "La location meublée est généralement plus avantageuse fiscalement que la location nue, notamment grâce à la possibilité d'amortir le bien au régime réel. Cependant, elle implique des obligations supplémentaires (mobilier, déclaration P0i, CFE) et une gestion potentiellement plus lourde (turn-over plus fréquent des locataires)." },

      { type: "h1", id: "faq-lmnp", text: "FAQ sur le statut LMNP en 2026" },
      { type: "h2", id: "faq-seuil", text: "Le seuil de 23 000 € s'apprécie-t-il par bien ou par foyer fiscal ?" },
      { type: "p", text: "Il s'apprécie par foyer fiscal, en cumulant les recettes de tous les logements meublés détenus par les membres du foyer. Deux conjoints ayant chacun un bien meublé verront leurs recettes additionnées pour apprécier le seuil de 23 000 €." },
      { type: "h2", id: "faq-sci", text: "Peut-on louer en meublé via une SCI ?" },
      { type: "p", text: "Une SCI soumise à l'impôt sur le revenu (IR) ne peut pas exercer d'activité commerciale à titre habituel. La location meublée via une SCI à l'IR peut entraîner sa requalification à l'IS, ce qui modifie profondément sa fiscalité. La location meublée est généralement exercée en direct ou via une SARL de famille." },
      { type: "h2", id: "faq-airbnb", text: "Louer sur Airbnb est-il compatible avec le statut LMNP ?" },
      { type: "p", text: "Oui, la location touristique de courte durée (Airbnb, Booking…) entre dans le champ du LMNP. Des règles spécifiques s'appliquent toutefois : enregistrement en mairie obligatoire dans certaines communes, plafond de 120 jours/an pour la résidence principale, et obligations sociales spécifiques si les recettes dépassent 23 000 €." },
      { type: "h2", id: "faq-charges", text: "Quelles charges sont déductibles au régime réel LMNP ?" },
      { type: "p", text: "Les principales charges déductibles au régime réel sont : intérêts et frais d'emprunt, charges de copropriété (non récupérables sur le locataire), taxe foncière, assurances, honoraires de gestion, frais comptables, amortissements du bien (hors terrain), du mobilier et des travaux de remplacement." },

      { type: "h1", id: "a-retenir-lmnp", text: "Ce qu'il faut retenir sur le LMNP" },
      { type: "ul", items: [
        "**1.** Le LMNP s'applique lorsque les recettes locatives meublées sont inférieures à 23 000 € par an **ou** inférieures à 50 % des revenus professionnels du foyer fiscal.",
        "**2.** Il ne faut pas être inscrit au RCS comme loueur en meublé professionnel.",
        "**3.** Le logement doit être meublé conformément à la liste réglementaire du décret de 2015.",
        "**4.** Une déclaration de début d'activité (formulaire P0i) est obligatoire dans les 15 jours suivant la première mise en location.",
        "**5.** Deux régimes fiscaux sont disponibles : micro-BIC (abattement forfaitaire de 50 %) ou régime réel (déduction des charges réelles et amortissements).",
        "**6.** Le régime réel permet d'amortir le bien et le mobilier, ce qui réduit souvent le bénéfice imposable à zéro.",
        "**7.** Depuis le 15 février 2025, les amortissements déduits au régime réel réduisent le prix d'acquisition retenu pour le calcul de la plus-value à la revente.",
        "**8.** Le LMNP est soumis à la CFE (avec exonérations possibles) et aux prélèvements sociaux (17,2 % sur les revenus BIC).",
        "**9.** Le basculement en LMP intervient lorsque les recettes dépassent 23 000 € ET représentent plus de 50 % des revenus professionnels du foyer.",
        "**10.** La location meublée est fiscalement plus avantageuse que la location nue dans la majorité des situations, notamment grâce à l'amortissement au régime réel.",
      ]},
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
  return { title: `${article.titre} – toutlmnp`, description: article.contenu.find(b => b.type === "p") ? (article.contenu.find(b => b.type === "p") as { type: "p"; text: string }).text.replace(/\*\*/g, "").slice(0, 160) : "", alternates: { canonical: `/blog/${slug}` } };
}

function renderInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: "#1A1612", fontWeight: 600 }}>{part}</strong>
      : part
  );
}

const SECTION_COLOR = "#C95B2A";

function renderBlock(block: Block, i: number, sectionNumbers?: Map<string, number>) {
  switch (block.type) {
    case "h1": {
      const num = sectionNumbers?.get(block.id);
      const color = SECTION_COLOR;
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

        {/* Intro avant sommaire */}
        {article.intro && article.intro.length > 0 && (
          <div className="mb-10 space-y-4">
            {article.intro.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.72)" }}>
                {para}
              </p>
            ))}
          </div>
        )}

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
                      const color = SECTION_COLOR;
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
              <Link href="/comment-ca-marche" className="hover:opacity-80 transition-opacity">Guide</Link>
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

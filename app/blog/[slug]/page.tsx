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
      { type: "table", head: ["Élément", "Horizon indicatif"], rows: [
        ["Gros œuvre / structure", "Très longue durée"],
        ["Façade, toiture, étanchéité", "Longue durée"],
        ["Plomberie, chauffage, électricité", "Durée intermédiaire à longue"],
        ["Aménagements intérieurs", "Durée intermédiaire"],
        ["Cuisine et équipements", "Durée plus courte"],
        ["Mobilier", "Durée plus courte"],
        ["Informatique / certains appareils", "Durée courte"],
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

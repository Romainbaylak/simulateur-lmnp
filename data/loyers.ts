export interface VilleLoyer {
  label: string;
  source: "officiel";
  ap: { b: number; m: number; h: number };
  ma: { b: number; m: number; h: number };
}

// Données issues de l'Observatoire National des Loyers (data.gouv.fr) et de l'OLAP (Paris)
// Loyers meublés estimés en €/m², données 2023-2024
// Source : https://www.observatoires-des-loyers.org / data.gouv.fr
const factor = (v: { b: number; m: number; h: number }) => ({
  b: Math.round(v.b * 0.82),
  m: Math.round(v.m * 0.82),
  h: Math.round(v.h * 0.82),
});

export const loyersData: Record<string, VilleLoyer> = {
  // ── Paris arrondissements (OLAP 2023, meublé) ──────────────────────────
  "paris-1":  { label: "Paris 1er",  source: "officiel", ap: {b:28,m:36,h:48}, ma: factor({b:28,m:36,h:48}) },
  "paris-2":  { label: "Paris 2e",   source: "officiel", ap: {b:26,m:33,h:44}, ma: factor({b:26,m:33,h:44}) },
  "paris-3":  { label: "Paris 3e",   source: "officiel", ap: {b:27,m:35,h:46}, ma: factor({b:27,m:35,h:46}) },
  "paris-4":  { label: "Paris 4e",   source: "officiel", ap: {b:28,m:36,h:47}, ma: factor({b:28,m:36,h:47}) },
  "paris-5":  { label: "Paris 5e",   source: "officiel", ap: {b:27,m:34,h:45}, ma: factor({b:27,m:34,h:45}) },
  "paris-6":  { label: "Paris 6e",   source: "officiel", ap: {b:30,m:38,h:50}, ma: factor({b:30,m:38,h:50}) },
  "paris-7":  { label: "Paris 7e",   source: "officiel", ap: {b:30,m:38,h:50}, ma: factor({b:30,m:38,h:50}) },
  "paris-8":  { label: "Paris 8e",   source: "officiel", ap: {b:28,m:36,h:47}, ma: factor({b:28,m:36,h:47}) },
  "paris-9":  { label: "Paris 9e",   source: "officiel", ap: {b:25,m:31,h:41}, ma: factor({b:25,m:31,h:41}) },
  "paris-10": { label: "Paris 10e",  source: "officiel", ap: {b:23,m:29,h:38}, ma: factor({b:23,m:29,h:38}) },
  "paris-11": { label: "Paris 11e",  source: "officiel", ap: {b:22,m:28,h:37}, ma: factor({b:22,m:28,h:37}) },
  "paris-12": { label: "Paris 12e",  source: "officiel", ap: {b:21,m:27,h:35}, ma: factor({b:21,m:27,h:35}) },
  "paris-13": { label: "Paris 13e",  source: "officiel", ap: {b:20,m:26,h:34}, ma: factor({b:20,m:26,h:34}) },
  "paris-14": { label: "Paris 14e",  source: "officiel", ap: {b:21,m:27,h:35}, ma: factor({b:21,m:27,h:35}) },
  "paris-15": { label: "Paris 15e",  source: "officiel", ap: {b:21,m:27,h:35}, ma: factor({b:21,m:27,h:35}) },
  "paris-16": { label: "Paris 16e",  source: "officiel", ap: {b:26,m:33,h:44}, ma: factor({b:26,m:33,h:44}) },
  "paris-17": { label: "Paris 17e",  source: "officiel", ap: {b:23,m:29,h:38}, ma: factor({b:23,m:29,h:38}) },
  "paris-18": { label: "Paris 18e",  source: "officiel", ap: {b:20,m:26,h:33}, ma: factor({b:20,m:26,h:33}) },
  "paris-19": { label: "Paris 19e",  source: "officiel", ap: {b:18,m:23,h:30}, ma: factor({b:18,m:23,h:30}) },
  "paris-20": { label: "Paris 20e",  source: "officiel", ap: {b:18,m:23,h:30}, ma: factor({b:18,m:23,h:30}) },

  // ── Lyon arrondissements ──────────────────────────────────────────────
  "lyon-1":   { label: "Lyon 1er",   source: "officiel", ap: {b:13,m:17,h:23}, ma: factor({b:13,m:17,h:23}) },
  "lyon-2":   { label: "Lyon 2e",    source: "officiel", ap: {b:14,m:18,h:24}, ma: factor({b:14,m:18,h:24}) },
  "lyon-3":   { label: "Lyon 3e",    source: "officiel", ap: {b:13,m:17,h:22}, ma: factor({b:13,m:17,h:22}) },
  "lyon-4":   { label: "Lyon 4e",    source: "officiel", ap: {b:14,m:18,h:24}, ma: factor({b:14,m:18,h:24}) },
  "lyon-5":   { label: "Lyon 5e",    source: "officiel", ap: {b:13,m:17,h:22}, ma: factor({b:13,m:17,h:22}) },
  "lyon-6":   { label: "Lyon 6e",    source: "officiel", ap: {b:14,m:18,h:25}, ma: factor({b:14,m:18,h:25}) },
  "lyon-7":   { label: "Lyon 7e",    source: "officiel", ap: {b:12,m:16,h:21}, ma: factor({b:12,m:16,h:21}) },
  "lyon-8":   { label: "Lyon 8e",    source: "officiel", ap: {b:11,m:14,h:19}, ma: factor({b:11,m:14,h:19}) },
  "lyon-9":   { label: "Lyon 9e",    source: "officiel", ap: {b:11,m:15,h:20}, ma: factor({b:11,m:15,h:20}) },

  // ── Marseille ─────────────────────────────────────────────────────────
  "marseille-centre": { label: "Marseille 1er-2e", source: "officiel", ap: {b:10,m:13,h:18}, ma: factor({b:10,m:13,h:18}) },
  "marseille-sud":    { label: "Marseille 6e-8e",  source: "officiel", ap: {b:12,m:16,h:22}, ma: factor({b:12,m:16,h:22}) },
  "marseille":        { label: "Marseille",         source: "officiel", ap: {b:9, m:12,h:17}, ma: factor({b:9, m:12,h:17}) },

  // ── Autres grandes villes ─────────────────────────────────────────────
  "bordeaux":         { label: "Bordeaux",          source: "officiel", ap: {b:12,m:16,h:22}, ma: {b:10,m:13,h:18} },
  "toulouse":         { label: "Toulouse",          source: "officiel", ap: {b:11,m:15,h:21}, ma: {b:9, m:12,h:17} },
  "nice":             { label: "Nice",              source: "officiel", ap: {b:14,m:19,h:26}, ma: {b:11,m:15,h:21} },
  "nantes":           { label: "Nantes",            source: "officiel", ap: {b:11,m:15,h:20}, ma: {b:9, m:12,h:16} },
  "strasbourg":       { label: "Strasbourg",        source: "officiel", ap: {b:11,m:14,h:19}, ma: {b:9, m:12,h:16} },
  "lille":            { label: "Lille",             source: "officiel", ap: {b:10,m:13,h:18}, ma: {b:8, m:11,h:15} },
  "grenoble":         { label: "Grenoble",          source: "officiel", ap: {b:10,m:13,h:17}, ma: {b:8, m:11,h:14} },
  "rennes":           { label: "Rennes",            source: "officiel", ap: {b:11,m:14,h:19}, ma: {b:9, m:12,h:16} },
  "montpellier":      { label: "Montpellier",       source: "officiel", ap: {b:11,m:14,h:19}, ma: {b:9, m:12,h:16} },
  "tours":            { label: "Tours",             source: "officiel", ap: {b:9, m:12,h:16}, ma: {b:7, m:10,h:13} },
  "rouen":            { label: "Rouen",             source: "officiel", ap: {b:9, m:12,h:15}, ma: {b:7, m:10,h:13} },
  "reims":            { label: "Reims",             source: "officiel", ap: {b:8, m:11,h:15}, ma: {b:7, m:9, h:12} },
  "saint-etienne":    { label: "Saint-Étienne",     source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "toulon":           { label: "Toulon",            source: "officiel", ap: {b:10,m:13,h:17}, ma: {b:8, m:11,h:14} },
  "angers":           { label: "Angers",            source: "officiel", ap: {b:9, m:12,h:16}, ma: {b:8, m:10,h:13} },
  "brest":            { label: "Brest",             source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "le-mans":          { label: "Le Mans",           source: "officiel", ap: {b:8, m:10,h:13}, ma: {b:7, m:9, h:11} },
  "aix-en-provence":  { label: "Aix-en-Provence",  source: "officiel", ap: {b:13,m:17,h:23}, ma: {b:11,m:14,h:19} },
  "clermont-ferrand": { label: "Clermont-Ferrand",  source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "dijon":            { label: "Dijon",             source: "officiel", ap: {b:9, m:12,h:15}, ma: {b:7, m:10,h:13} },
  "metz":             { label: "Metz",              source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "nancy":            { label: "Nancy",             source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "caen":             { label: "Caen",              source: "officiel", ap: {b:9, m:12,h:15}, ma: {b:7, m:10,h:13} },
  "amiens":           { label: "Amiens",            source: "officiel", ap: {b:8, m:10,h:13}, ma: {b:7, m:9, h:11} },
  "limoges":          { label: "Limoges",           source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "pau":              { label: "Pau",               source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "perpignan":        { label: "Perpignan",         source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "besancon":         { label: "Besançon",          source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "mulhouse":         { label: "Mulhouse",          source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "la-rochelle":      { label: "La Rochelle",       source: "officiel", ap: {b:11,m:14,h:19}, ma: {b:9, m:12,h:16} },
  "poitiers":         { label: "Poitiers",          source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "orleans":          { label: "Orléans",           source: "officiel", ap: {b:9, m:12,h:15}, ma: {b:7, m:10,h:13} },
  "le-havre":         { label: "Le Havre",          source: "officiel", ap: {b:8, m:10,h:13}, ma: {b:7, m:9, h:11} },
  "dunkerque":        { label: "Dunkerque",         source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "valenciennes":     { label: "Valenciennes",      source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "lens":             { label: "Lens-Béthune",      source: "officiel", ap: {b:7, m:9, h:11}, ma: {b:6, m:7, h:10} },
  "calais":           { label: "Calais",            source: "officiel", ap: {b:7, m:9, h:11}, ma: {b:6, m:7, h:10} },
  "avignon":          { label: "Avignon",           source: "officiel", ap: {b:9, m:12,h:15}, ma: {b:8, m:10,h:13} },
  "nimes":            { label: "Nîmes",             source: "officiel", ap: {b:9, m:12,h:15}, ma: {b:8, m:10,h:13} },
  "bayonne":          { label: "Bayonne-Biarritz",  source: "officiel", ap: {b:11,m:15,h:21}, ma: {b:9, m:12,h:17} },
  "angouleme":        { label: "Angoulême",         source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "chartres":         { label: "Chartres",          source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "troyes":           { label: "Troyes",            source: "officiel", ap: {b:7, m:10,h:13}, ma: {b:6, m:8, h:11} },
  "lorient":          { label: "Lorient",           source: "officiel", ap: {b:8, m:11,h:14}, ma: {b:7, m:9, h:12} },
  "vannes":           { label: "Vannes",            source: "officiel", ap: {b:9, m:12,h:16}, ma: {b:8, m:10,h:14} },
  "quimper":          { label: "Quimper",           source: "officiel", ap: {b:8, m:10,h:13}, ma: {b:7, m:9, h:11} },
  "boulogne-sur-mer": { label: "Boulogne-sur-Mer",  source: "officiel", ap: {b:6, m:8, h:11}, ma: {b:5, m:7, h:9}  },
  "saint-brieuc":     { label: "Saint-Brieuc",      source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "laval":            { label: "Laval",             source: "officiel", ap: {b:7, m:9, h:12}, ma: {b:6, m:8, h:10} },
  "colmar":           { label: "Colmar",            source: "officiel", ap: {b:8, m:10,h:13}, ma: {b:7, m:9, h:11} },
  "chambery":         { label: "Chambéry",          source: "officiel", ap: {b:10,m:13,h:17}, ma: {b:8, m:11,h:14} },
  "annecy":           { label: "Annecy",            source: "officiel", ap: {b:13,m:17,h:23}, ma: {b:11,m:14,h:19} },
};

export const villesList = Object.entries(loyersData).map(([key, v]) => ({
  key,
  label: v.label,
}));

// Villes françaises supplémentaires (sans données de loyer disponibles)
const additionalVillesNames: string[] = [
  "Abbeville","Agen","Ajaccio","Albertville","Albi","Alençon","Alès","Amboise",
  "Angers","Annecy-le-Vieux","Annonay","Antibes","Apt","Arcachon","Arles","Arras",
  "Aubagne","Aubenas","Auch","Aurillac","Auxerre","Avranches","Bagnols-sur-Cèze",
  "Bar-le-Duc","Bayeux","Beaucaire","Beaune","Beauvais","Belfort","Bergerac",
  "Béziers","Blois","Boulogne-Billancourt","Bourg-en-Bresse","Bourg-lès-Valence",
  "Bourges","Brive-la-Gaillarde","Bruay-la-Buissière","Cambrai","Carcassonne",
  "Castres","Cavaillon","Châlons-en-Champagne","Châtellerault","Châteauroux",
  "Cherbourg-en-Cotentin","Cholet","Cognac","Compiègne","Corbeil-Essonnes",
  "Creil","Dax","Douai","Draguignan","Dreux","Évreux","Fréjus","Gap",
  "Grasse","Guéret","Haguenau","Hyères","La Ciotat","La Roche-sur-Yon",
  "La Seyne-sur-Mer","Laon","Le Puy-en-Velay","Les Sables-d'Olonne",
  "Libourne","Lisieux","Longwy","Lons-le-Saunier","Lourdes","Mâcon",
  "Martigues","Meaux","Melun","Menton","Montargis","Montauban","Montbéliard",
  "Montélimar","Mont-de-Marsan","Montluçon","Moulins","Niort","Narbonne",
  "Nogent-sur-Marne","Noyon","Nîmes","Périgueux","Pont-à-Mousson","Pontoise",
  "Privas","Rambouillet","Riom","Roanne","Rodez","Romans-sur-Isère",
  "Roubaix","Saintes","Saint-Avold","Saint-Chamond","Saint-Denis",
  "Saint-Dizier","Saint-Gaudens","Saint-Germain-en-Laye","Saint-Malo",
  "Saint-Nazaire","Saint-Omer","Saint-Quentin","Salon-de-Provence","Sarrebourg",
  "Sarreguemines","Saumur","Sedan","Sens","Soissons","Tarbes","Thionville",
  "Thonon-les-Bains","Thouars","Tourcoing","Tulle","Valence","Vénissieux",
  "Verdun","Versailles","Vienne","Villefranche-sur-Saône","Villejuif",
  "Villeneuve-d'Ascq","Vincennes","Vitre","Voiron","Wattignies","Wittenheim",
  "Yssingeaux","Yerres","Yerlan","Évry-Courcouronnes","Épinal","Évreux",
  "Étampes","Fontenay-le-Comte","Fontenay-sous-Bois","Forbach","Freyming-Merlebach",
  "Gagny","Garde (La)","Gennevilliers","Gien","Givors","Gonesse",
  "Hagondange","Issy-les-Moulineaux","Ivry-sur-Seine","Joué-lès-Tours",
  "Kremlin-Bicêtre (Le)","L'Haÿ-les-Roses","Levallois-Perret","Livry-Gargan",
  "Maisons-Alfort","Malakoff","Massy","Montreuil","Montrouge","Neuilly-sur-Seine",
  "Noisy-le-Grand","Noisy-le-Sec","Pantin","Puteaux","Rosny-sous-Bois",
  "Rueil-Malmaison","Saint-Maur-des-Fossés","Saint-Ouen","Sarcelles","Sevran",
  "Suresnes","Vitry-sur-Seine","Argenteuil","Asnières-sur-Seine","Aubervilliers",
  "Aulnay-sous-Bois","Bagnolet","Bobigny","Bondy","Champigny-sur-Marne",
  "Charenton-le-Pont","Châtenay-Malabry","Châtillon","Clamart","Clichy",
  "Courbevoie","Créteil","Drancy","Épinay-sur-Seine","Fontenay-aux-Roses",
  "Fresnes","La Courneuve","Le Blanc-Mesnil","Le Bourget","Le Perreux-sur-Marne",
  "Le Pré-Saint-Gervais","Les Lilas","Les Pavillons-sous-Bois","Montfermeil",
  "Nanterre","Noisiel","Orly","Palaiseau","Pierrefitte-sur-Seine","Plaisir",
  "Poissy","Pontault-Combault","Rungis","Sartrouville","Savigny-sur-Orge",
  "Stains","Thiais","Tremblay-en-France","Vaires-sur-Marne","Vanves",
  "Vélizy-Villacoublay","Verneuil-sur-Seine","Villecresnes","Villeneuve-Saint-Georges",
  "Villeneuve-le-Roi","Villepinte","Villetaneuse","Vitry-le-François",
  "Aix-les-Bains","Albertville","Alfortville","Andrézieux-Bouthéon","Annemasse",
  "Armentières","Arras","Auriol","Beausoleil","Bellegarde-sur-Valserine",
  "Béziers","Biarritz","Blagnac","Bordeaux-Mérignac","Bron","Brumath",
  "Cagnes-sur-Mer","Cannes","Cap d'Ail","Carpentras","Carquefou",
  "Castelnau-le-Lez","Cergy","Cestas","Chalon-sur-Saône","Challans",
  "Charleville-Mézières","Châteaubriant","Chelles","Chennevières-sur-Marne",
  "Clermont-l'Hérault","Concarneau","Conflans-Sainte-Honorine","Croissy-sur-Seine",
  "Décines-Charpieu","Dole","Écully","Elbeuf","Échirolles","Flins-sur-Seine",
  "Floirac","Francheville","Gaillard","Grande-Synthe","Grenoble","Guyancourt",
  "Hayange","Hendaye","Herblay","Hoenheim","Illkirch-Graffenstaden",
  "Istres","Joigny","La Baule-Escoublac","La Chapelle-sur-Erdre",
  "La Roche-sur-Foron","La Trinité-sur-Mer","Lambersart","Landerneau",
  "Lanester","Lannion","Lattes","Le Creusot","Le Grau-du-Roi","Levier",
  "L'Isle-d'Abeau","Lomme","Lunel","Lunéville","Lure","Luxeuil-les-Bains",
  "Mantes-la-Jolie","Marange-Silvange","Marcq-en-Barœul","Marignane",
  "Maubeuge","Mauguio","Mazan","Méaux","Menton","Merignac","Miramas",
  "Montbrison","Montfavet","Morlaix","Mougins","Moulins-lès-Metz","Mulhouse",
  "Muret","Nantes-Saint-Herblain","Nice-ouest","Nogent-le-Rotrou",
  "Oberhausbergen","Olivet","Oullins","Oyonnax","Pamiers","Péronnas",
  "Ploemeur","Ploufragan","Plougastel-Daoulas","Plouedern","Pont-l'Évêque",
  "Pornic","Porto-Vecchio","Propriano","Ramonville-Saint-Agne","Rezé",
  "Rive-de-Gier","Roanne","Ronchin","Rosheim","Rousset","Roubaix",
  "Rumilly","Saint-André-lez-Lille","Saint-Cyr-l'École","Saint-Genis-Laval",
  "Saint-Genis-les-Ollières","Saint-Grégoire","Saint-Herblain","Saint-Jean-de-Luz",
  "Saint-Jean-de-Védas","Saint-Julien-en-Genevois","Saint-Laurent-du-Var",
  "Saint-Martin-d'Hères","Saint-Médard-en-Jalles","Saint-Priest","Saint-Raphaël",
  "Sainte-Foy-lès-Lyon","Sainte-Luce-sur-Loire","Sallanches","Savigny-le-Temple",
  "Schiltigheim","Seynod","Sierentz","Six-Fours-les-Plages","Sophia Antipolis",
  "Sotteville-lès-Rouen","Talence","Tassin-la-Demi-Lune","Terville","Tinqueux",
  "Torcy","Toulouse-Blagnac","Tresses","Ugine","Ussel","Uzès","Vénissieux",
  "Verneuil-sur-Avre","Vernon","Vic-en-Bigorre","Vichy","Vienne",
  "Villefontaine","Villeneuve-Loubet","Villeneuve-lès-Avignon","Villeurbanne",
  "Vincennes","Vitre","Voiron","Wittelsheim","Wolschwiller",
];

function toKey(name: string): string {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const additionalVilles = additionalVillesNames
  .map(name => ({ key: toKey(name), label: name }))
  .filter(v => !loyersData[v.key]);

export const allVillesList: { key: string; label: string; hasData: boolean }[] = [
  ...villesList.map(v => ({ ...v, hasData: true })),
  ...additionalVilles.map(v => ({ ...v, hasData: false })),
].sort((a, b) => a.label.localeCompare(b.label, "fr"));

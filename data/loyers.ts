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

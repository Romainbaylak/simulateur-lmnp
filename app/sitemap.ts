import type { MetadataRoute } from "next";

const BASE = "https://toutlmnp.fr";

const blogSlugs = [
  "amortissement-lmnp",
  "loi-lmnp",
  "limites-airbnb-lmnp-2026",
  "airbnb-lmnp-2026",
  "csg-prelevements-sociaux-lmnp-2026",
  "lmnp-definition-statut-2026",
  "revente-lmnp-plus-value",
  "revente-lmnp-2026",
  "actualite-lmnp-2026",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/comment-ca-marche`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/blog`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/tarifs`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/legal#mentions`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/legal#confidentialite`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/legal#cgv`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const articlePages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...articlePages];
}

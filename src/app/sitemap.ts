import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://mwphockey.ru";
  const products = await getPublishedSlugs();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/tovarnyj-znak`, changeFrequency: "yearly", priority: 0.4 },
    ...products.map((p) => ({
      url: `${base}/catalog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

import { type MetadataRoute } from "next";
import { getPosts, getProducts } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iphonepurple.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/plan-canje`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/reparaciones`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${BASE_URL}/catalogo/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}

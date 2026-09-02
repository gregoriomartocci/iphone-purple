import { type MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iphonepurple.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

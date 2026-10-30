import type { MetadataRoute } from "next";

type RecipeSummary = {
  id: number;
};

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

const apiUrl =
  process.env.API_INTERNAL_URL ||
  "http://backend:8000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  try {
    const response = await fetch(
      `${apiUrl}/recipes?limit=100`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const recipes =
        (await response.json()) as RecipeSummary[];

      for (const recipe of recipes) {
        pages.push({
          url: `${siteUrl}/recipes/${recipe.id}`,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Unable to generate recipe sitemap:", error);
  }

  return pages;
}
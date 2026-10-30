import type { Metadata } from "next";

type Recipe = {
  id: number;
  title: string;
  cuisine: string;
  minutes: number;
  servings: number;
  image_url: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

const apiUrl =
  process.env.API_INTERNAL_URL ||
  "http://backend:8000";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

async function loadRecipe(id: string): Promise<Recipe | null> {
  if (!/^\d+$/.test(id)) return null;

  try {
    const response = await fetch(
      `${apiUrl}/recipes/${id}`,
      { cache: "no-store" }
    );

    if (!response.ok) return null;

    return (await response.json()) as Recipe;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await loadRecipe(id);

  if (!recipe) {
    return {
      title: "Recipe Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    `Make ${recipe.title} in ${recipe.minutes} minutes. ` +
    `Explore ingredients and step-by-step cooking instructions.`;

  return {
    title: recipe.title,
    description,
    alternates: {
      canonical: `/recipes/${recipe.id}`,
    },
    openGraph: {
      type: "article",
      title: recipe.title,
      description,
      url: `${siteUrl}/recipes/${recipe.id}`,
      ...(recipe.image_url &&
      /^https?:\/\//.test(recipe.image_url)
        ? { images: [recipe.image_url] }
        : {}),
    },
  };
}

export default async function RecipeLayout({
  children,
  params,
}: Props) {
  const { id } = await params;
  const recipe = await loadRecipe(id);

  const structuredData = recipe
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.title,
        description:
          `${recipe.title}, ready in ${recipe.minutes} minutes.`,
        recipeCuisine: recipe.cuisine,
        recipeYield: `${recipe.servings} servings`,
        totalTime: `PT${recipe.minutes}M`,
        recipeIngredient: recipe.ingredients.map(
          (ingredient) =>
            `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
        ),
        recipeInstructions: recipe.instructions.map(
          (instruction) => ({
            "@type": "HowToStep",
            text: instruction,
          })
        ),
        ...(recipe.image_url &&
        /^https?:\/\//.test(recipe.image_url)
          ? { image: [recipe.image_url] }
          : {}),
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />
      )}
      {children}
    </>
  );
}
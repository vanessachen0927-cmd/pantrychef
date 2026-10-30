
"use client";

import { use, useEffect, useState } from "react";
import { getRecipe, type Recipe, API, api } from "@/lib/api";
import { accessToken } from "@/lib/supabase";

const conversions: Record<
  string,
  { unit: string; factor: number }
> = {
  g: { unit: "oz", factor: 1 / 28.3495 },
  oz: { unit: "g", factor: 28.3495 },
  ml: { unit: "fl oz", factor: 1 / 29.5735 },
  "fl oz": { unit: "ml", factor: 29.5735 },
  tbsp: { unit: "tsp", factor: 3 },
  tsp: { unit: "tbsp", factor: 1 / 3 },
};

type ShoppingItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
};

export default function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [converted, setConverted] = useState(false);

  const [pantry, setPantry] = useState("");
  const [newItem, setNewItem] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRecipe(id)
      .then((result) => {
        setRecipe(result);
        setServings(result.servings);
      })
      .catch((error) => {
        setStatus(String(error));
      });
  }, [id]);

  // Save the recipe without modifying the shopping list.
  async function save() {
    if (saving) return;

    setSaving(true);
    setStatus("");

    try {
      const token = await accessToken();

      await api(`/me/saved/${id}`, token, "POST");

      setStatus("Recipe saved to your collection!");
    } catch (error) {
      setStatus(String(error));
    } finally {
      setSaving(false);
    }
  }

  // Add only the shopping item entered by the user.
  async function addSingleItem() {
    const name = newItem.trim();

    if (!name || shoppingLoading) return;

    setShoppingLoading(true);
    setStatus("");

    try {
      const token = await accessToken();

      const existing = (await api(
        "/me/shopping",
        token
      )) as ShoppingItem[];

      const alreadyExists = existing.some(
        (item) =>
          item.name.trim().toLowerCase() ===
          name.toLowerCase()
      );

      if (alreadyExists) {
        setStatus(`${name} is already on your shopping list.`);
        return;
      }

      await api("/me/shopping", token, "POST", {
        name,
        quantity: 1,
        unit: "item",
      });

      setNewItem("");
      setStatus(`${name} added to your shopping list.`);
    } catch (error) {
      setStatus(String(error));
    } finally {
      setShoppingLoading(false);
    }
  }

  // Add only missing recipe ingredients.
  async function addMissing() {
    if (!recipe || shoppingLoading) return;

    const availableIngredients = pantry
      .toLowerCase()
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (availableIngredients.length === 0) {
      setStatus(
        "Please enter the ingredients you already have first."
      );
      return;
    }

    const have = new Set(availableIngredients);

    const missing = recipe.ingredients.filter(
      (ingredient) =>
        !have.has(ingredient.name.trim().toLowerCase())
    );

    if (missing.length === 0) {
      setStatus("You already have all the recipe ingredients!");
      return;
    }

    const confirmed = window.confirm(
      `Add ${missing.length} missing ingredient${
        missing.length === 1 ? "" : "s"
      } to your shopping list?\n\n${missing
        .map((ingredient) => ingredient.name)
        .join(", ")}`
    );

    if (!confirmed) return;

    setShoppingLoading(true);
    setStatus("");

    try {
      const token = await accessToken();

      const existing = (await api(
        "/me/shopping",
        token
      )) as ShoppingItem[];

      const existingNames = new Set(
        existing.map((item) =>
          item.name.trim().toLowerCase()
        )
      );

      let count = 0;

      for (const ingredient of missing) {
        const normalizedName =
          ingredient.name.trim().toLowerCase();

        if (existingNames.has(normalizedName)) {
          continue;
        }

        const quantity = Number(
          (
            (ingredient.quantity * servings) /
            recipe.servings
          ).toFixed(2)
        );

        await api("/me/shopping", token, "POST", {
          name: ingredient.name,
          quantity,
          unit: ingredient.unit,
        });

        existingNames.add(normalizedName);
        count++;
      }

      if (count === 0) {
        setStatus(
          "These ingredients are already on your shopping list."
        );
      } else {
        setStatus(
          `${count} missing ingredient${
            count === 1 ? "" : "s"
          } added to your shopping list.`
        );
      }
    } catch (error) {
      setStatus(String(error));
    } finally {
      setShoppingLoading(false);
    }
  }

  // Ask the cooking assistant a recipe-related question.
  async function ask() {
    if (!question.trim() || loading) return;

    setLoading(true);
    setStatus("");
    setAnswer("");

    try {
      const response = await fetch(`${API}/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          recipe_title: recipe?.title || "",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();

      setAnswer(result.answer);
    } catch (error) {
      setStatus(
        `Cooking assistant: ${String(error)}`
      );
    } finally {
      setLoading(false);
    }
  }

  if (!recipe) {
    return <p>{status || "Loading recipe..."}</p>;
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-7">
      <div>
        <p className="text-amber-400">
          {recipe.cuisine} · {recipe.minutes} minutes
        </p>

        <h1 className="text-4xl font-bold my-4">
          {recipe.title}
        </h1>

        <button
          type="button"
          className="secondary mb-5 disabled:opacity-50"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving..." : "♡ Save recipe"}
        </button>

        <section className="panel">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <h2 className="text-2xl font-bold">
              Ingredients
            </h2>

            <label>
              Servings
              <input
                aria-label="Servings"
                type="number"
                min="1"
                max="20"
                className="w-20 ml-2"
                value={servings}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  setServings(
                    Math.max(
                      1,
                      Math.min(20, value || 1)
                    )
                  );
                }}
              />
            </label>
          </div>

          <label className="block mt-3">
            <input
              type="checkbox"
              checked={converted}
              onChange={(event) =>
                setConverted(event.target.checked)
              }
            />
            {" "}Convert compatible units
          </label>

          <ul className="mt-4 space-y-3">
            {recipe.ingredients.map((ingredient) => {
              const conversion = converted
                ? conversions[ingredient.unit]
                : undefined;

              const quantity =
                (ingredient.quantity *
                  servings /
                  recipe.servings) *
                (conversion?.factor || 1);

              return (
                <li
                  className="border-b border-emerald-900 pb-2"
                  key={ingredient.name}
                >
                  {Number(quantity.toFixed(2))}{" "}
                  {conversion?.unit || ingredient.unit}{" "}
                  {ingredient.name}
                </li>
              );
            })}
          </ul>

          <p className="text-slate-400 text-sm mt-3">
            Mass-to-volume conversions depend on ingredient
            density and are intentionally excluded.
          </p>
        </section>

        <section className="panel mt-5">
          <h2 className="text-2xl font-bold mb-4">
            Instructions
          </h2>

          <ol className="list-decimal pl-5 space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="panel">
          <h2 className="text-xl font-bold mb-3">
            Shopping list
          </h2>

          <label
            htmlFor="shopping-item"
            className="block mb-2 font-medium"
          >
            Add an ingredient to buy
          </label>

          <input
            id="shopping-item"
            className="w-full"
            value={newItem}
            onChange={(event) =>
              setNewItem(event.target.value)
            }
            placeholder="e.g. noodles"
          />

          <button
            type="button"
            className="primary mt-3 w-full disabled:opacity-50"
            onClick={addSingleItem}
            disabled={
              !newItem.trim() || shoppingLoading
            }
          >
            {shoppingLoading
              ? "Adding..."
              : "Add this item"}
          </button>

          <div className="border-t border-emerald-900 my-5" />

          <h3 className="font-semibold mb-2">
            Add missing recipe ingredients
          </h3>

          <p className="text-slate-400 text-sm mb-3">
            Enter ingredients you already have,
            separated by commas. PantryChef will
            identify what you still need to buy.
          </p>

          <textarea
            className="w-full"
            rows={3}
            value={pantry}
            onChange={(event) =>
              setPantry(event.target.value)
            }
            placeholder="e.g. pasta, tomato"
          />

          <button
            type="button"
            className="secondary mt-3 w-full disabled:opacity-50"
            onClick={addMissing}
            disabled={shoppingLoading}
          >
            {shoppingLoading
              ? "Adding..."
              : "Add missing recipe ingredients"}
          </button>

          <p className="text-xs mt-3 text-slate-400">
            Sign-in required to save shopping items.
          </p>
        </section>

        <section className="panel">
          <h2 className="text-xl font-bold mb-3">
            AI cooking assistant
          </h2>

          <textarea
            className="w-full"
            rows={3}
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="What can replace basil?"
          />

          <button
            type="button"
            disabled={!question.trim() || loading}
            className="primary mt-3 w-full disabled:opacity-50"
            onClick={ask}
          >
            {loading ? "Thinking..." : "Ask PantryChef"}
          </button>

          {answer && (
            <p className="whitespace-pre-wrap mt-4 text-sm">
              {answer}
            </p>
          )}

          <p className="text-xs text-slate-400 mt-3">
            Check allergy labels and safe cooking
            temperatures independently.
          </p>
        </section>

        {status && (
          <p
            role="status"
            className="text-amber-300"
          >
            {status}
          </p>
        )}
      </aside>
    </div>
  );
}

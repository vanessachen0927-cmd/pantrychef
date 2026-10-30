
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getRecipes, Recipe } from "@/lib/api";
import { accessToken } from "@/lib/supabase";

type Item = {
  id: number;
  name: string;
};

export default function Saved() {
  const [saved, setSaved] = useState<number[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  async function refresh() {
    try {
      const token = await accessToken();

      const [ids, items, all] = await Promise.all([
        api("/me/saved", token),
        api("/me/pantry", token),
        getRecipes(),
      ]);

      setSaved(ids);
      setPantry(items);
      setRecipes(all);
      setStatus("");
    } catch (error) {
      setStatus(String(error));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function removeSavedRecipe(recipeId: number) {
    if (busyId !== null) return;

    setBusyId(recipeId);
    setStatus("");

    try {
      const token = await accessToken();

      await api(`/me/saved/${recipeId}`, token, "DELETE");

      setSaved((previous) =>
        previous.filter((id) => id !== recipeId)
      );

      setStatus("Recipe removed from your saved collection.");
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusyId(null);
    }
  }

  async function addPantryItem() {
    const ingredient = name.trim();
    if (!ingredient || adding) return;

    setAdding(true);

    try {
      await api("/me/pantry", await accessToken(), "POST", {
        name: ingredient,
      });

      setName("");
      await refresh();
    } catch (error) {
      setStatus(String(error));
    } finally {
      setAdding(false);
    }
  }

  async function removePantryItem(id: number) {
    try {
      await api(
        `/me/pantry/${id}`,
        await accessToken(),
        "DELETE"
      );

      await refresh();
    } catch (error) {
      setStatus(String(error));
    }
  }

  const savedRecipes = recipes.filter((recipe) =>
    saved.includes(recipe.id)
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="panel">
        <h1 className="text-2xl font-bold mb-4">
          Saved recipes
        </h1>

        {savedRecipes.length === 0 ? (
          <p className="text-slate-400">
            No saved recipes yet.
          </p>
        ) : (
          <div className="space-y-4">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between gap-3 border-b border-emerald-900 pb-3"
              >
                <Link
                  className="text-amber-400 hover:underline"
                  href={`/recipes/${recipe.id}`}
                >
                  {recipe.title}
                </Link>

                <button
                  type="button"
                  className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                  disabled={busyId !== null}
                  onClick={() => removeSavedRecipe(recipe.id)}
                >
                  {busyId === recipe.id
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="text-2xl font-bold mb-4">
          My pantry
        </h2>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void addPantryItem();
          }}
        >
          <input
            aria-label="Pantry ingredient"
            className="min-w-0 flex-1"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. tomato"
          />

          <button
            type="submit"
            className="primary"
            disabled={!name.trim() || adding}
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </form>

        {pantry.map((item) => (
          <div
            className="flex items-center justify-between mt-4"
            key={item.id}
          >
            <span>{item.name}</span>

            <button
              type="button"
              className="text-amber-400 hover:underline"
              onClick={() => removePantryItem(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {status && (
        <p
          role="status"
          className="text-amber-300 md:col-span-2"
        >
          {status}
        </p>
      )}
    </div>
  );
}

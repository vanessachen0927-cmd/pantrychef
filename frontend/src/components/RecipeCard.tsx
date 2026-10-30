import Link from "next/link";
import type {Recipe} from "@/lib/api";
export default function RecipeCard({recipe}:{recipe:Recipe}){return <Link href={`/recipes/${recipe.id}`} className="panel block overflow-hidden hover:border-amber-400 transition"><div className="text-5xl mb-4">{recipe.cuisine==="Italian"?"🍝":recipe.cuisine==="Asian"?"🍚":"🥗"}</div><h3 className="text-xl font-bold">{recipe.title}</h3><p className="text-slate-400 mt-2">{recipe.cuisine} · {recipe.minutes} min · {recipe.servings} servings</p><p className="text-amber-400 mt-3">View recipe →</p></Link>}

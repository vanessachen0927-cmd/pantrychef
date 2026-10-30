export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export type Ingredient = {name:string;quantity:number;unit:string};
export type Recipe = {id:number;title:string;cuisine:string;minutes:number;servings:number;image_url:string;instructions:string[];ingredients:Ingredient[]};
export async function getRecipes(params = ""):Promise<Recipe[]> {const r=await fetch(`${API}/recipes${params}`,{cache:"no-store"});if(!r.ok)throw Error("Unable to load recipes");return r.json()}
export async function getRecipe(id:string):Promise<Recipe> {const r=await fetch(`${API}/recipes/${id}`,{cache:"no-store"});if(!r.ok)throw Error("Recipe not found");return r.json()}
export async function api(path:string,token:string,method="GET",body?:unknown) {const r=await fetch(`${API}${path}`,{method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error((await r.text()).slice(0,250));return r.json()}

import { createClient, SupabaseClient } from "@supabase/supabase-js";
let client:SupabaseClient | null=null;
export function supabase(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return null;return client??(client=createClient(url,key))}
export async function accessToken(){const s=supabase();if(!s)throw Error("Configure Supabase in frontend/.env.local");const {data}=await s.auth.getSession();if(!data.session)throw Error("Sign in first");return data.session.access_token}

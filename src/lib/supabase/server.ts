import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";

/** Helper para Server Actions y rutas que no pasan cookieStore explícitamente */
export async function createClient() {
  const cookieStore = await cookies();
  return createSupabaseClient(cookieStore);
}

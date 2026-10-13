import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

/**
 * Devuelve el user id de la sesión activa, o redirige a /login si no hay
 * sesión. Único punto de verdad para "quién eres" en Server Components y
 * Server Actions — nunca se confía en un id que venga del cliente.
 */
export async function requireUserId(): Promise<string> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components / Server Actions / Route
 * Handlers. Igual que client.ts: solo se llama cuando isSupabaseConfigured()
 * ya se verificó, nunca incondicionalmente en código que debe seguir
 * funcionando en modo local.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se llama desde un Server Component (no una Action/Route);
            // el middleware se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    },
  );
}

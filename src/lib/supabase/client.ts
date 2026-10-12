import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes de cliente ("use client"). Solo se
 * invoca cuando de verdad se necesita (nunca a nivel de módulo en una página
 * que debe seguir funcionando en modo local sin credenciales) — ver
 * src/lib/supabase/config.ts.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

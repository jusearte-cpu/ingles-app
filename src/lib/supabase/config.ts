/**
 * Único punto de verdad sobre si hay credenciales de Supabase configuradas.
 * Mientras esto sea `false` (caso de hoy, modo local), ninguna ruta de
 * Supabase (middleware, cliente de servidor) se ejecuta — la app local en
 * SQLite sigue funcionando exactamente igual, sin que este código la rompa.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

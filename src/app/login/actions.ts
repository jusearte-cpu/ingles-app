"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Inicio de sesión por enlace mágico (sin contraseña): más simple y más
 * seguro para una app de un solo usuario — nadie, ni esta app, maneja ni
 * guarda una contraseña tuya.
 */
export async function requestMagicLink(email: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase todavía no está configurado (ver docs/SETUP-CLOUD.md)." };
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
}

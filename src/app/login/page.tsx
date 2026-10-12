import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      {isSupabaseConfigured() ? (
        <LoginForm />
      ) : (
        <div className="rounded-md border border-dashed border-black/20 bg-black/5 p-4 text-sm text-ink/60">
          Supabase todavía no está conectado — esta pantalla está lista pero no
          activa. Mientras tanto, la app funciona en modo local de un solo
          usuario (ver <code>docs/SETUP-CLOUD.md</code> para activarla).
        </div>
      )}
    </div>
  );
}

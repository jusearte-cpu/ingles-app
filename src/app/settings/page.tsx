import { loadThresholds } from "@/lib/thresholds";
import { requireUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/profile";
import { DeleteDataButton } from "./DeleteDataButton";
import { SignOutButton } from "./SignOutButton";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const thresholds = loadThresholds();
  const profile = await getOrCreateProfile(userId);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Configuración</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cuenta</h2>
        <p className="text-sm text-ink/60">Conectado como {user?.email}.</p>
        <SignOutButton />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Tu perfil</h2>
        <ProfileForm profile={profile} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Datos</h2>
        <p className="text-sm text-ink/60">
          Tu progreso vive en Supabase (Postgres) y tus grabaciones en un bucket
          privado de Storage — solo accesibles con tu sesión.
        </p>
        <a
          href="/api/export"
          className="inline-block rounded-md bg-ink px-4 py-2 text-sm text-white"
        >
          Exportar mis resultados (JSON)
        </a>
        <div>
          <DeleteDataButton />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Umbrales de evaluación vigentes</h2>
        <p className="text-sm text-ink/60">
          Versión {thresholds.version} — decisión de producto ajustable, no un
          estándar oficial del MCER. Editable en{" "}
          <code>config/thresholds.json</code>. Ver docs/03-progress-and-evaluation-model.md.
        </p>
        <pre className="overflow-x-auto rounded-md bg-black/5 p-3 text-xs">
          {JSON.stringify(thresholds.competency_demonstrated, null, 2)}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Sobre el tutor de IA</h2>
        <p className="text-sm text-ink/60">
          Por decisión tuya, esta app tiene costo cero de forma permanente: el
          tutor usa reglas simples (no un modelo de IA real pagado), y la voz es
          la del navegador. Ver <code>docs/decisions-log.md</code>.
        </p>
      </section>
    </div>
  );
}

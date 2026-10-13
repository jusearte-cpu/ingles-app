import { loadThresholds } from "@/lib/thresholds";
import { requireUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteDataButton } from "./DeleteDataButton";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUserId();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const thresholds = loadThresholds();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Configuración</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cuenta</h2>
        <p className="text-sm text-ink/60">Conectado como {user?.email}.</p>
        <SignOutButton />
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
        <h2 className="text-lg font-medium">Pendiente en esta pantalla</h2>
        <p className="text-sm text-ink/60">
          Perfil editable (objetivo de nivel, tiempo disponible, idioma de apoyo,
          accesibilidad) llega cuando se implemente el modelo de perfil completo —
          ver docs/06-roadmap.md.
        </p>
      </section>
    </div>
  );
}

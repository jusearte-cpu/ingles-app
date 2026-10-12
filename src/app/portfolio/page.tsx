export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { portfolioItems, activities, attempts } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function PortfolioPage() {
  const items = db
    .select({
      item: portfolioItems,
      activity: activities,
      attempt: attempts,
    })
    .from(portfolioItems)
    .leftJoin(activities, eq(portfolioItems.linkedActivityId, activities.id))
    .leftJoin(attempts, eq(portfolioItems.linkedAttemptId, attempts.id))
    .all()
    .sort((a, b) => (a.item.createdAt < b.item.createdAt ? 1 : -1));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Portafolio</h1>
      <p className="text-sm text-ink/60">
        Tus grabaciones y escritos, para comparar trabajos anteriores con los más
        recientes. Guardado localmente en este equipo (<code>data/recordings/</code>) —
        privado mientras no haya despliegue en la nube.
      </p>

      {items.length === 0 && (
        <p className="text-sm text-ink/50">Todavía no tienes nada en el portafolio.</p>
      )}

      <div className="space-y-3">
        {items.map(({ item, activity, attempt }) => (
          <div key={item.id} className="rounded-md border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {activity?.stepName ?? "Actividad"} · {item.kind === "recording" ? "Grabación" : item.kind}
              </p>
              <span className="text-xs text-ink/50">
                {new Date(item.createdAt).toLocaleString("es")}
              </span>
            </div>
            {item.kind === "recording" && item.storagePath && (
              <audio controls className="mt-2 w-full" src={`/api/recordings?path=${encodeURIComponent(item.storagePath)}`}>
                Tu navegador no soporta reproducción de audio.
              </audio>
            )}
            {attempt?.responseText && (
              <p className="mt-2 text-sm text-ink/70">&quot;{attempt.responseText}&quot;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

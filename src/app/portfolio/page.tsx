export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { portfolioItems, activities, attempts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortfolioPage() {
  const userId = await requireUserId();

  const rows = await db
    .select({
      item: portfolioItems,
      activity: activities,
      attempt: attempts,
    })
    .from(portfolioItems)
    .leftJoin(activities, eq(portfolioItems.linkedActivityId, activities.id))
    .leftJoin(attempts, eq(portfolioItems.linkedAttemptId, attempts.id))
    .where(eq(portfolioItems.userId, userId));

  const items = rows.sort((a, b) => (a.item.createdAt < b.item.createdAt ? 1 : -1));

  const supabase = createSupabaseServerClient();
  const withUrls = await Promise.all(
    items.map(async ({ item, activity, attempt }) => {
      let audioUrl: string | null = null;
      if (item.kind === "recording" && item.storagePath) {
        const { data } = await supabase.storage
          .from("recordings")
          .createSignedUrl(item.storagePath, 60 * 60); // 1 hora
        audioUrl = data?.signedUrl ?? null;
      }
      return { item, activity, attempt, audioUrl };
    }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Portafolio</h1>
      <p className="text-sm text-ink/60">
        Tus grabaciones y escritos, para comparar trabajos anteriores con los más
        recientes. Guardado en tu bucket privado de Supabase — solo tú puedes verlo.
      </p>

      {withUrls.length === 0 && (
        <p className="text-sm text-ink/50">Todavía no tienes nada en el portafolio.</p>
      )}

      <div className="space-y-3">
        {withUrls.map(({ item, activity, attempt, audioUrl }) => (
          <div key={item.id} className="rounded-md border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {activity?.stepName ?? "Actividad"} · {item.kind === "recording" ? "Grabación" : item.kind}
              </p>
              <span className="text-xs text-ink/50">
                {new Date(item.createdAt).toLocaleString("es")}
              </span>
            </div>
            {audioUrl && (
              <audio controls className="mt-2 w-full" src={audioUrl}>
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

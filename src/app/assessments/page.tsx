export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { attempts, evidenceRecords } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { getAssessmentActivities } from "@/lib/queries";
import { requireUserId } from "@/lib/auth";
import { AssessmentRunner } from "./AssessmentRunner";

export default async function AssessmentsPage() {
  const userId = await requireUserId();
  const items = await getAssessmentActivities();

  const answeredActivityIds = new Set(
    items.length
      ? (
          await db
            .select({ activityId: attempts.activityId })
            .from(attempts)
            .innerJoin(evidenceRecords, eq(evidenceRecords.attemptId, attempts.id))
            .where(
              and(
                inArray(
                  attempts.activityId,
                  items.map((i) => i.id),
                ),
                eq(attempts.userId, userId),
              ),
            )
        ).map((r) => r.activityId)
      : [],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Evaluaciones</h1>
      <p className="text-sm text-ink/60">
        Banco separado del de práctica (ver docs/03-progress-and-evaluation-model.md,
        sección 3): estos ítems nunca aparecen dentro de una lección. Una sola
        oportunidad registrada por ítem, sin pistas.
      </p>

      {items.length === 0 && (
        <p className="text-sm text-ink/50">Todavía no hay comprobaciones de nivel sembradas.</p>
      )}

      <div className="space-y-3">
        {items.map((item) =>
          answeredActivityIds.has(item.id) ? (
            <div key={item.id} className="rounded-md border border-black/10 bg-black/5 p-4">
              <p className="font-medium">{item.stepName}</p>
              <p className="mt-1 text-sm text-ink/60">
                Ya respondida — ver el resultado en{" "}
                <a href="/progress" className="underline">
                  Progreso
                </a>
                .
              </p>
            </div>
          ) : (
            <AssessmentRunner
              key={item.id}
              item={{
                id: item.id,
                stepName: item.stepName,
                content: item.content as any,
                objectiveIds: item.objectiveIds,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}

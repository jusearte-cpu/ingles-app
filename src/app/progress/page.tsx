export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { attempts, spacedRepetitionItems, spacedRepetitionHistory } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { getAllObjectives, getAllUnitsWithActivities, LEVEL_ORDER } from "@/lib/queries";
import { recomputeObjectiveStatus } from "@/lib/evaluation";
import { loadThresholds } from "@/lib/thresholds";
import { requireUserId } from "@/lib/auth";

const NEEDS_ATTEMPT = new Set([
  "contextualized_input",
  "guided_practice",
  "unaided_retrieval",
  "production",
  "communicative_task",
]);

const STATUS_LABEL: Record<string, string> = {
  demonstrated: "Demostrado",
  not_demonstrated: "No demostrado (fallo crítico reciente)",
  insufficient_evidence: "Evidencia insuficiente",
};

const STATUS_COLOR: Record<string, string> = {
  demonstrated: "bg-accentSoft text-accent border-accent/30",
  not_demonstrated: "bg-warn/10 text-warn border-warn/30",
  insufficient_evidence: "bg-black/5 text-ink/60 border-black/10",
};

export default async function ProgressPage() {
  const userId = await requireUserId();
  const unitsWithActivities = await getAllUnitsWithActivities();
  const objectives = await getAllObjectives();
  const thresholds = loadThresholds().competency_demonstrated;

  const objectiveResults = [];
  for (const o of objectives) {
    objectiveResults.push({ objective: o, ...(await recomputeObjectiveStatus(userId, o.id)) });
  }

  const demonstratedCount = objectiveResults.filter((r) => r.status === "demonstrated").length;
  const competenciasDemostradas =
    objectives.length === 0 ? null : demonstratedCount / objectives.length;

  const allActivities = unitsWithActivities.flatMap((u) => u.activities);
  const interactiveActivityIds = allActivities
    .filter((a) => NEEDS_ATTEMPT.has(a.type))
    .map((a) => a.id);
  const attemptedActivityIds = new Set(
    interactiveActivityIds.length
      ? (
          await db
            .select({ activityId: attempts.activityId })
            .from(attempts)
            .where(and(inArray(attempts.activityId, interactiveActivityIds), eq(attempts.userId, userId)))
        ).map((r) => r.activityId)
      : [],
  );

  let reviewScheduledCount = 0;
  for (const { activities } of unitsWithActivities) {
    const ids = Array.from(new Set(activities.flatMap((a) => a.objectiveIds)));
    if (ids.length === 0) continue;
    let allDone = true;
    for (const id of ids) {
      const [row] = await db
        .select()
        .from(spacedRepetitionItems)
        .where(and(eq(spacedRepetitionItems.userId, userId), eq(spacedRepetitionItems.objectiveId, id)));
      if (!row) {
        allDone = false;
        break;
      }
    }
    if (allDone) reviewScheduledCount += 1;
  }
  const totalObligatory = interactiveActivityIds.length + unitsWithActivities.length; // +1 repaso por unidad
  const completedObligatory = attemptedActivityIds.size + reviewScheduledCount;
  const recorridoCompletado = totalObligatory === 0 ? null : completedObligatory / totalObligatory;

  const historyWindowMs = 8 * 7 * 86_400_000;
  const now = Date.now();
  const allHistory = await db
    .select()
    .from(spacedRepetitionHistory)
    .where(eq(spacedRepetitionHistory.userId, userId));
  const recentHistory = allHistory.filter(
    (h) => now - new Date(h.reviewedAt).getTime() <= historyWindowMs,
  );
  const retentionPassed = recentHistory.filter((h) => h.result !== "failed").length;

  const resultsByLevel = new Map<string, typeof objectiveResults>();
  for (const r of objectiveResults) {
    const list = resultsByLevel.get(r.objective.levelCode) ?? [];
    list.push(r);
    resultsByLevel.set(r.objective.levelCode, list);
  }
  const orderedLevels = Array.from(resultsByLevel.keys()).sort(
    (a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b),
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Progreso</h1>
      <p className="text-sm text-ink/60">
        Estos tres indicadores miden cosas distintas a propósito — ver{" "}
        <code>docs/03-progress-and-evaluation-model.md</code>. Ninguno se infla para
        verse mejor.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <IndicatorCard
          title="Recorrido completado"
          value={recorridoCompletado}
          detail={`${completedObligatory}/${totalObligatory} actividades obligatorias del itinerario vigente`}
        />
        <IndicatorCard
          title="Competencias demostradas"
          value={competenciasDemostradas}
          detail={`${demonstratedCount}/${objectives.length} objetivos del contenido implementado`}
        />
        <IndicatorCard
          title="Retención reciente"
          value={recentHistory.length === 0 ? null : retentionPassed / recentHistory.length}
          detail={
            recentHistory.length === 0
              ? "evidencia insuficiente (0 comprobaciones diferidas en las últimas 8 semanas)"
              : `${retentionPassed}/${recentHistory.length} comprobaciones, última: ${new Date(
                  recentHistory[recentHistory.length - 1].reviewedAt,
                ).toLocaleDateString("es")}`
          }
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-medium">Capacidades demostradas (detalle)</h2>
        {orderedLevels.map((level) => (
          <div key={level} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-ink/50">{level}</h3>
            {(resultsByLevel.get(level) ?? []).map((r) => (
              <div key={r.objective.id} className={`rounded-md border p-3 ${STATUS_COLOR[r.status]}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {r.objective.stableCode} — {r.objective.canDoStatement}
                  </p>
                  <span className="whitespace-nowrap rounded-full bg-white/60 px-2 py-0.5 text-xs">
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                {r.reasons.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {r.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-xs text-ink/50">
        Umbrales vigentes (config/thresholds.json v{loadThresholds().version}):{" "}
        {thresholds.min_satisfactory_evidences} evidencias en {thresholds.min_distinct_activities}{" "}
        actividades distintas, tarea de transferencia sin ayuda, y una comprobación diferida
        ≥ {thresholds.retention_check_min_interval_days} días después. Son una decisión de
        producto ajustable, no un estándar oficial del MCER.
      </p>
    </div>
  );
}

function IndicatorCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: number | null;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-sm text-ink/60">{title}</p>
      <p className="text-3xl font-semibold">
        {value === null ? "—" : `${Math.round(value * 100)}%`}
      </p>
      <p className="mt-1 text-xs text-ink/50">{detail}</p>
    </div>
  );
}

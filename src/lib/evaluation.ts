import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { attempts, evidenceRecords, objectiveStatus } from "@/db/schema";
import { loadThresholds } from "./thresholds";

export type ObjectiveStatusValue =
  | "insufficient_evidence"
  | "demonstrated"
  | "not_demonstrated";

/**
 * Recalcula el estado de un objetivo a partir de SUS evidencias reales.
 * Esta es la implementación concreta de docs/03-progress-and-evaluation-model.md
 * sección 2. No promedia, no redondea a favor: si falta una condición, el
 * resultado es "insufficient_evidence", nunca "demonstrated" por defecto.
 */
export function recomputeObjectiveStatus(objectiveId: string): {
  status: ObjectiveStatusValue;
  reasons: string[];
} {
  const thresholds = loadThresholds().competency_demonstrated;

  const rows = db
    .select({
      evidence: evidenceRecords,
      activityId: attempts.activityId,
    })
    .from(evidenceRecords)
    .innerJoin(attempts, eq(evidenceRecords.attemptId, attempts.id))
    .where(eq(evidenceRecords.objectiveId, objectiveId))
    .all();

  const reasons: string[] = [];

  if (rows.length === 0) {
    return { status: "insufficient_evidence", reasons: ["sin evidencia todavía"] };
  }

  const satisfactory = rows.filter((r) => r.evidence.satisfactory);
  const distinctActivities = new Set(satisfactory.map((r) => r.activityId));
  const hasUnaidedTransfer = satisfactory.some(
    (r) => r.evidence.isUnaided && r.evidence.isTransferTask,
  );
  const hasRetentionCheck = satisfactory.some((r) => {
    if (!r.evidence.isUnaided) return false;
    const earliest = satisfactory
      .map((e) => new Date(e.evidence.createdAt).getTime())
      .reduce((a, b) => Math.min(a, b), Infinity);
    const days =
      (new Date(r.evidence.createdAt).getTime() - earliest) / 86_400_000;
    return days >= thresholds.retention_check_min_interval_days;
  });

  const recentEvidence = [...rows]
    .sort(
      (a, b) =>
        new Date(b.evidence.createdAt).getTime() -
        new Date(a.evidence.createdAt).getTime(),
    )
    .slice(0, thresholds.critical_failure_lookback_evidences);
  const hasRecentCriticalFailure = recentEvidence.some(
    (r) => r.evidence.criticalFailure,
  );

  const meetsRepetition =
    satisfactory.length >= thresholds.min_satisfactory_evidences &&
    distinctActivities.size >= thresholds.min_distinct_activities;
  if (!meetsRepetition) {
    reasons.push(
      `necesita ${thresholds.min_satisfactory_evidences} evidencias satisfactorias en ${thresholds.min_distinct_activities} actividades distintas (hay ${satisfactory.length} en ${distinctActivities.size})`,
    );
  }
  if (thresholds.requires_unaided_transfer_task && !hasUnaidedTransfer) {
    reasons.push("falta una tarea de transferencia sin ayuda");
  }
  if (!hasRetentionCheck) {
    reasons.push(
      `falta una comprobación diferida (>= ${thresholds.retention_check_min_interval_days} días después de la primera evidencia)`,
    );
  }
  if (hasRecentCriticalFailure) {
    reasons.push("hay un fallo crítico reciente que impide el objetivo comunicativo");
  }

  const status: ObjectiveStatusValue =
    reasons.length === 0
      ? "demonstrated"
      : hasRecentCriticalFailure
        ? "not_demonstrated"
        : "insufficient_evidence";

  db.insert(objectiveStatus)
    .values({ objectiveId, status, lastEvaluatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: objectiveStatus.objectiveId,
      set: { status, lastEvaluatedAt: new Date().toISOString() },
    })
    .run();

  return { status, reasons };
}

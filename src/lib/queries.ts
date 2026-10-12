import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  units,
  activities,
  objectives,
  objectiveStatus,
  attempts,
  evidenceRecords,
  spacedRepetitionItems,
} from "@/db/schema";

export function getUnitWithActivities(unitId: string) {
  const unit = db.select().from(units).where(eq(units.id, unitId)).get();
  if (!unit) return null;
  const acts = db
    .select()
    .from(activities)
    .where(eq(activities.unitId, unitId))
    .orderBy(activities.stepNumber)
    .all();
  return { unit, activities: acts };
}

export function getObjectivesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(objectives).where(inArray(objectives.id, ids)).all();
}

export function getAllObjectives() {
  return db.select().from(objectives).all();
}

export function getObjectiveStatusMap() {
  const rows = db.select().from(objectiveStatus).all();
  return new Map(rows.map((r) => [r.objectiveId, r]));
}

export function getEvidenceForActivity(activityId: string) {
  return db
    .select({ evidence: evidenceRecords, attempt: attempts })
    .from(attempts)
    .innerJoin(evidenceRecords, eq(evidenceRecords.attemptId, attempts.id))
    .where(eq(attempts.activityId, activityId))
    .all();
}

export function getLatestAttemptForActivity(activityId: string) {
  const rows = db
    .select()
    .from(attempts)
    .where(eq(attempts.activityId, activityId))
    .all();
  return rows.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0] ?? null;
}

export function getDueReviews(nowIso: string) {
  const rows = db.select().from(spacedRepetitionItems).all();
  return rows.filter((r) => r.dueAt <= nowIso);
}

export function getUpcomingReviews(nowIso: string) {
  const rows = db.select().from(spacedRepetitionItems).all();
  return rows.filter((r) => r.dueAt > nowIso);
}

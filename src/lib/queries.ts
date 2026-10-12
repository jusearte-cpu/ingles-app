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

export const LEVEL_ORDER = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export function levelRank(levelCode: string) {
  const i = LEVEL_ORDER.indexOf(levelCode);
  return i === -1 ? LEVEL_ORDER.length : i;
}

export function getAllUnitsWithActivities() {
  const allUnits = db.select().from(units).all();
  const allActivities = db.select().from(activities).all();
  const sortedUnits = [...allUnits].sort((a, b) => {
    const levelDiff = levelRank(a.levelCode) - levelRank(b.levelCode);
    if (levelDiff !== 0) return levelDiff;
    return a.sortOrder - b.sortOrder;
  });
  return sortedUnits.map((unit) => ({
    unit,
    activities: allActivities
      .filter((a) => a.unitId === unit.id && a.type !== "spaced_review" && a.pool !== "assessment")
      .sort((a, b) => a.stepNumber - b.stepNumber),
  }));
}

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

export function getAssessmentActivities() {
  return db
    .select()
    .from(activities)
    .where(eq(activities.pool, "assessment"))
    .orderBy(activities.stepNumber)
    .all();
}

export function getUpcomingReviews(nowIso: string) {
  const rows = db.select().from(spacedRepetitionItems).all();
  return rows.filter((r) => r.dueAt > nowIso);
}

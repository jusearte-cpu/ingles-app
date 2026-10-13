import { eq, inArray, and } from "drizzle-orm";
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

/** Currículo — compartido entre usuarios, sin userId. */
export async function getAllUnitsWithActivities() {
  const allUnits = await db.select().from(units);
  const allActivities = await db.select().from(activities);
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

export async function getUnitWithActivities(unitId: string) {
  const [unit] = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
  if (!unit) return null;
  const acts = await db
    .select()
    .from(activities)
    .where(eq(activities.unitId, unitId))
    .orderBy(activities.stepNumber);
  return { unit, activities: acts };
}

export async function getObjectivesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(objectives).where(inArray(objectives.id, ids));
}

export async function getAllObjectives() {
  return db.select().from(objectives);
}

export async function getAssessmentActivities() {
  return db
    .select()
    .from(activities)
    .where(eq(activities.pool, "assessment"))
    .orderBy(activities.stepNumber);
}

/** A partir de aquí, todo es por usuario (ver Row Level Security en Supabase). */

export async function getObjectiveStatusMap(userId: string) {
  const rows = await db.select().from(objectiveStatus).where(eq(objectiveStatus.userId, userId));
  return new Map(rows.map((r) => [r.objectiveId, r]));
}

export async function getEvidenceForActivity(userId: string, activityId: string) {
  return db
    .select({ evidence: evidenceRecords, attempt: attempts })
    .from(attempts)
    .innerJoin(evidenceRecords, eq(evidenceRecords.attemptId, attempts.id))
    .where(and(eq(attempts.activityId, activityId), eq(attempts.userId, userId)));
}

export async function getLatestAttemptForActivity(userId: string, activityId: string) {
  const rows = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.activityId, activityId), eq(attempts.userId, userId)));
  return rows.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0] ?? null;
}

export async function getDueReviews(userId: string, nowIso: string) {
  const rows = await db.select().from(spacedRepetitionItems).where(eq(spacedRepetitionItems.userId, userId));
  return rows.filter((r) => r.dueAt.toISOString() <= nowIso);
}

export async function getUpcomingReviews(userId: string, nowIso: string) {
  const rows = await db.select().from(spacedRepetitionItems).where(eq(spacedRepetitionItems.userId, userId));
  return rows.filter((r) => r.dueAt.toISOString() > nowIso);
}

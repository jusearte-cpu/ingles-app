import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { spacedRepetitionItems, spacedRepetitionHistory } from "@/db/schema";
import { loadThresholds } from "./thresholds";
import { nanoid } from "nanoid";

export type ReviewResult = "recalled_easily" | "recalled_with_effort" | "failed";

/**
 * Programa el primer repaso de un objetivo recién trabajado (paso 10 de la
 * unidad), sin registrar un resultado todavía — el resultado se registra
 * cuando ese repaso realmente ocurra, vía scheduleReview().
 */
export function initializeSpacedRepetition(objectiveId: string, firstIntervalDays = 3) {
  const cfg = loadThresholds().spaced_repetition;
  const existing = db
    .select()
    .from(spacedRepetitionItems)
    .where(eq(spacedRepetitionItems.objectiveId, objectiveId))
    .get();
  if (existing) return existing;

  const dueAt = new Date(
    Date.now() + firstIntervalDays * 86_400_000,
  ).toISOString();
  db.insert(spacedRepetitionItems)
    .values({
      objectiveId,
      easeFactor: cfg.initial_ease_factor,
      intervalDays: firstIntervalDays,
      dueAt,
    })
    .onConflictDoNothing()
    .run();
  return { easeFactor: cfg.initial_ease_factor, intervalDays: firstIntervalDays, dueAt };
}

/** SM-2 simplificado — ver docs/03-progress-and-evaluation-model.md, sección 4. */
export function scheduleReview(objectiveId: string, result: ReviewResult) {
  const cfg = loadThresholds().spaced_repetition;
  const now = new Date();

  const existing = db
    .select()
    .from(spacedRepetitionItems)
    .where(eq(spacedRepetitionItems.objectiveId, objectiveId))
    .get();

  let easeFactor = existing?.easeFactor ?? cfg.initial_ease_factor;
  let intervalDays = existing?.intervalDays ?? 1;

  if (result === "failed") {
    easeFactor = Math.max(cfg.min_ease_factor, easeFactor - 0.2);
    intervalDays = cfg.fail_reset_interval_days;
  } else if (result === "recalled_with_effort") {
    intervalDays = Math.max(1, intervalDays * 1.3);
  } else {
    easeFactor = easeFactor + 0.1;
    intervalDays = Math.max(1, intervalDays * easeFactor);
  }

  const dueAt = new Date(now.getTime() + intervalDays * 86_400_000).toISOString();

  db.insert(spacedRepetitionItems)
    .values({ objectiveId, easeFactor, intervalDays, dueAt })
    .onConflictDoUpdate({
      target: spacedRepetitionItems.objectiveId,
      set: { easeFactor, intervalDays, dueAt },
    })
    .run();

  db.insert(spacedRepetitionHistory)
    .values({
      id: nanoid(),
      objectiveId,
      result,
      reviewedAt: now.toISOString(),
    })
    .run();

  return { easeFactor, intervalDays, dueAt };
}

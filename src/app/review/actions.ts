"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { activities } from "@/db/schema";
import { keywordGrade } from "@/lib/graders";
import { recordAttemptAndEvidence } from "@/lib/record-evidence";
import { scheduleReview, type ReviewResult } from "@/lib/spaced-repetition";
import { REVIEW_PROMPTS } from "@/lib/review-prompts";
import { requireUserId } from "@/lib/auth";

/**
 * Cada unidad tiene su propia actividad-fantasma "spaced_review" (no aparece
 * en el stepper, ver scripts/seed.ts) que sirve de ancla FK para los
 * intentos de repaso. Un objetivo puede pertenecer a varias unidades (p. ej.
 * "pedir repetición" se recicla en 4), así que se usa la primera que lo
 * referencie — el ancla es solo técnica, no cambia qué se pregunta.
 */
async function findReviewActivityId(objectiveId: string): Promise<string | null> {
  const reviewActivities = await db.select().from(activities).where(eq(activities.type, "spaced_review"));
  const match = reviewActivities.find((a) => (a.objectiveIds as string[]).includes(objectiveId));
  return match?.id ?? null;
}

export async function submitReview(objectiveId: string, responseText: string) {
  const userId = await requireUserId();
  const prompt = REVIEW_PROMPTS[objectiveId];
  const { satisfactory, matched } = prompt
    ? keywordGrade(responseText, prompt.expectedKeywords, 1)
    : { satisfactory: false, matched: [] };

  const activityId = await findReviewActivityId(objectiveId);
  if (!activityId) {
    return { satisfactory: false, matched: [], result: "failed" as ReviewResult, error: "sin actividad de repaso asociada" };
  }

  await recordAttemptAndEvidence({
    userId,
    activityId,
    responseText,
    evidence: [
      {
        objectiveId,
        rubricId: "review.v1",
        satisfactory,
        isUnaided: true,
        isTransferTask: false,
      },
    ],
  });

  const result: ReviewResult = satisfactory
    ? "recalled_easily"
    : responseText.trim().length === 0
      ? "failed"
      : "recalled_with_effort";

  await scheduleReview(userId, objectiveId, result);

  revalidatePath("/review");
  revalidatePath("/progress");
  revalidatePath("/today");

  return { satisfactory, matched, result };
}

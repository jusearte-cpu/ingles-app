"use server";

import { revalidatePath } from "next/cache";
import { keywordGrade } from "@/lib/graders";
import { recordAttemptAndEvidence } from "@/lib/record-evidence";

/**
 * Evidencia de evaluación formal: is_assessment = true, is_unaided = true
 * (una comprobación siempre es sin ayuda por definición). Viene de un banco
 * separado del de práctica — ver docs/03-progress-and-evaluation-model.md.
 */
export async function submitAssessmentItem(
  activityId: string,
  objectiveId: string,
  responseText: string,
  expectedKeywords: string[],
) {
  const { satisfactory, matched } = keywordGrade(responseText, expectedKeywords, 1);

  recordAttemptAndEvidence({
    activityId,
    responseText,
    evidence: [
      {
        objectiveId,
        rubricId: "assessment.v1",
        satisfactory,
        isUnaided: true,
        isAssessment: true,
      },
    ],
  });

  revalidatePath("/assessments");
  revalidatePath("/progress");

  return { satisfactory, matched };
}

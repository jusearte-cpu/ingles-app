"use server";

import { revalidatePath } from "next/cache";
import { keywordGrade } from "@/lib/graders";
import { recordAttemptAndEvidence } from "@/lib/record-evidence";
import { scheduleReview, type ReviewResult } from "@/lib/spaced-repetition";
import { REVIEW_PROMPTS } from "@/lib/review-prompts";

const REVIEW_ACTIVITY_ID = "act-review";

export async function submitReview(objectiveId: string, responseText: string) {
  const prompt = REVIEW_PROMPTS[objectiveId];
  const { satisfactory, matched } = prompt
    ? keywordGrade(responseText, prompt.expectedKeywords, 1)
    : { satisfactory: false, matched: [] };

  recordAttemptAndEvidence({
    activityId: REVIEW_ACTIVITY_ID,
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

  scheduleReview(objectiveId, result);

  revalidatePath("/review");
  revalidatePath("/progress");
  revalidatePath("/today");

  return { satisfactory, matched, result };
}

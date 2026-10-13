"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { keywordGrade, exactGrade } from "@/lib/graders";
import { recordAttemptAndEvidence } from "@/lib/record-evidence";
import { initializeSpacedRepetition } from "@/lib/spaced-repetition";
import { getTutorProvider } from "@/lib/ai";
import { requireUserId } from "@/lib/auth";
import { db } from "@/db/client";
import { portfolioItems, attempts } from "@/db/schema";

function revalidateUnit(unitId: string) {
  revalidatePath(`/lesson/${unitId}`);
  revalidatePath("/today");
  revalidatePath("/map");
  revalidatePath("/progress");
}

export async function submitListeningAnswers(
  unitId: string,
  activityId: string,
  objectiveId: string,
  answers: { questionId: string; response: string; expectedKeywords: string[] }[],
) {
  const userId = await requireUserId();
  const graded = answers.map((a) => keywordGrade(a.response, a.expectedKeywords, 1));
  const satisfactory = graded.every((g) => g.satisfactory);
  const combinedText = answers.map((a) => `${a.questionId}: ${a.response}`).join(" | ");

  const result = await recordAttemptAndEvidence({
    userId,
    activityId,
    responseText: combinedText,
    evidence: [
      {
        objectiveId,
        rubricId: "listening.a1.v1",
        satisfactory,
        usedTranscript: false,
      },
    ],
  });
  revalidateUnit(unitId);
  return { satisfactory, graded, result };
}

export async function submitGuidedPractice(
  unitId: string,
  activityId: string,
  objectiveId: string,
  answers: { sentenceId: string; response: string; answer: string }[],
) {
  const userId = await requireUserId();
  const correctCount = answers.filter((a) => exactGrade(a.response, a.answer)).length;
  const satisfactory = correctCount === answers.length;
  const combinedText = answers.map((a) => `${a.sentenceId}: ${a.response}`).join(" | ");

  const result = await recordAttemptAndEvidence({
    userId,
    activityId,
    responseText: combinedText,
    evidence: [
      {
        objectiveId,
        rubricId: "grammar.a1.v1",
        satisfactory,
        isUnaided: false,
      },
    ],
  });
  revalidateUnit(unitId);
  return { satisfactory, correctCount, total: answers.length, result };
}

export async function submitUnaidedRetrieval(
  unitId: string,
  activityId: string,
  objectiveIds: string[],
  responseText: string,
  expectedKeywords: string[],
) {
  const userId = await requireUserId();
  const { satisfactory, matched } = keywordGrade(responseText, expectedKeywords, 2);

  const result = await recordAttemptAndEvidence({
    userId,
    activityId,
    responseText,
    evidence: objectiveIds.map((objectiveId) => ({
      objectiveId,
      rubricId: "speaking.a1.v1",
      satisfactory,
      isUnaided: true,
    })),
  });
  revalidateUnit(unitId);
  return { satisfactory, matched, result };
}

export async function submitProduction(
  unitId: string,
  activityId: string,
  objectiveIds: string[],
  responseText: string,
  audioPath?: string,
) {
  const userId = await requireUserId();

  // Sin texto: no hay forma fiable de evaluar contenido/pronunciación sin una
  // transcripción conectada (no hay una en modo local/mock). Se guarda la
  // grabación en el portafolio para comparar más adelante, pero NO se inventa
  // una evidencia de competencia — ver docs/01-architecture.md, limitación de
  // pronunciación/STT.
  if (!responseText.trim() && audioPath) {
    const attemptId = nanoid();
    await db.insert(attempts).values({
      id: attemptId,
      userId,
      activityId,
      responseAudioPath: audioPath,
      clientIdempotencyKey: nanoid(),
    });
    await db.insert(portfolioItems).values({
      id: nanoid(),
      userId,
      kind: "recording",
      storagePath: audioPath,
      linkedActivityId: activityId,
      linkedAttemptId: attemptId,
    });
    revalidateUnit(unitId);
    revalidatePath("/portfolio");
    return {
      feedback: null,
      audioOnly: true,
      message:
        "Grabación guardada en tu portafolio. Como no hay transcripción conectada todavía, esto no cuenta automáticamente como evidencia de progreso — queda ahí para que la compares con futuras grabaciones.",
    };
  }

  const provider = getTutorProvider();
  const feedback = await provider.giveFeedback({
    unitTitle: "Nice to meet you",
    stepName: "Producción",
    learnerResponse: responseText,
    objectiveStatements: [],
  });

  const satisfactory = feedback.taskFulfilled && feedback.meaningErrors.length === 0;

  const result = await recordAttemptAndEvidence({
    userId,
    activityId,
    responseText,
    responseAudioPath: audioPath,
    evidence: objectiveIds.map((objectiveId) => ({
      objectiveId,
      rubricId: "writing.a1.v1",
      satisfactory,
      isUnaided: true,
      criticalFailure: !feedback.taskFulfilled,
    })),
  });

  if (audioPath) {
    await db.insert(portfolioItems).values({
      id: nanoid(),
      userId,
      kind: "recording",
      storagePath: audioPath,
      linkedActivityId: activityId,
      linkedAttemptId: result.attemptId,
    });
    revalidatePath("/portfolio");
  }

  revalidateUnit(unitId);
  return { feedback, audioOnly: false, result };
}

export async function submitCommunicativeTask(
  unitId: string,
  activityId: string,
  originObjectiveId: string,
  repetitionObjectiveId: string,
  originResponse: string,
  repetitionResponse: string,
  expectedOriginKeywords: string[],
  expectedRepetitionKeywords: string[],
) {
  const userId = await requireUserId();
  const originGrade = keywordGrade(originResponse, expectedOriginKeywords, 1);
  const repetitionGrade = keywordGrade(repetitionResponse, expectedRepetitionKeywords, 1);

  const result = await recordAttemptAndEvidence({
    userId,
    activityId,
    responseText: `origin: ${originResponse} | repetition: ${repetitionResponse}`,
    evidence: [
      {
        objectiveId: originObjectiveId,
        rubricId: "speaking.a1.v1",
        satisfactory: originGrade.satisfactory,
        isUnaided: true,
        isTransferTask: true,
      },
      {
        objectiveId: repetitionObjectiveId,
        rubricId: "speaking.a1.v1",
        satisfactory: repetitionGrade.satisfactory,
        isUnaided: true,
        isTransferTask: true,
        criticalFailure: repetitionResponse.trim().length === 0,
      },
    ],
  });
  revalidateUnit(unitId);
  return { originGrade, repetitionGrade, result };
}

export async function completeReviewScheduling(
  unitId: string,
  objectiveIds: string[],
  intervalDays: number,
) {
  const userId = await requireUserId();
  for (const id of objectiveIds) {
    await initializeSpacedRepetition(userId, id, intervalDays);
  }
  revalidateUnit(unitId);
  revalidatePath("/review");
}

import { nanoid } from "nanoid";
import { db } from "@/db/client";
import { attempts, evidenceRecords } from "@/db/schema";
import { recomputeObjectiveStatus } from "./evaluation";

export interface EvidenceInput {
  objectiveId: string;
  rubricId: string;
  satisfactory: boolean;
  isUnaided?: boolean;
  isTransferTask?: boolean;
  isAssessment?: boolean;
  criticalFailure?: boolean;
  usedTranscript?: boolean;
}

/**
 * Registra UN intento (append-only) y una o más evidencias derivadas de él,
 * luego recalcula el estado de cada objetivo afectado. Este es el único
 * camino de escritura para progreso real en la app — nunca se escribe
 * "demonstrated" a mano desde la interfaz.
 */
export async function recordAttemptAndEvidence(params: {
  userId: string;
  activityId: string;
  responseText?: string;
  responseAudioPath?: string;
  evidence: EvidenceInput[];
}) {
  const attemptId = nanoid();

  await db.insert(attempts).values({
    id: attemptId,
    userId: params.userId,
    activityId: params.activityId,
    responseText: params.responseText,
    responseAudioPath: params.responseAudioPath,
    clientIdempotencyKey: nanoid(),
  });

  const results = [];
  for (const e of params.evidence) {
    const evidenceId = nanoid();
    await db.insert(evidenceRecords).values({
      id: evidenceId,
      userId: params.userId,
      attemptId,
      objectiveId: e.objectiveId,
      rubricId: e.rubricId,
      satisfactory: e.satisfactory,
      isUnaided: e.isUnaided ?? false,
      isTransferTask: e.isTransferTask ?? false,
      isAssessment: e.isAssessment ?? false,
      criticalFailure: e.criticalFailure ?? false,
      usedTranscript: e.usedTranscript ?? false,
    });
    const { status, reasons } = await recomputeObjectiveStatus(params.userId, e.objectiveId);
    results.push({ objectiveId: e.objectiveId, status, reasons });
  }

  return { attemptId, results };
}

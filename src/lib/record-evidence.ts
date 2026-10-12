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
export function recordAttemptAndEvidence(params: {
  activityId: string;
  responseText?: string;
  responseAudioPath?: string;
  evidence: EvidenceInput[];
}) {
  const attemptId = nanoid();
  const now = new Date().toISOString();

  db.insert(attempts)
    .values({
      id: attemptId,
      activityId: params.activityId,
      submittedAt: now,
      responseText: params.responseText,
      responseAudioPath: params.responseAudioPath,
      clientIdempotencyKey: nanoid(),
    })
    .run();

  const results = params.evidence.map((e) => {
    const evidenceId = nanoid();
    db.insert(evidenceRecords)
      .values({
        id: evidenceId,
        attemptId,
        objectiveId: e.objectiveId,
        rubricId: e.rubricId,
        satisfactory: e.satisfactory,
        isUnaided: e.isUnaided ?? false,
        isTransferTask: e.isTransferTask ?? false,
        isAssessment: e.isAssessment ?? false,
        criticalFailure: e.criticalFailure ?? false,
        usedTranscript: e.usedTranscript ?? false,
        createdAt: now,
      })
      .run();
    const { status, reasons } = recomputeObjectiveStatus(e.objectiveId);
    return { objectiveId: e.objectiveId, status, reasons };
  });

  return { attemptId, results };
}

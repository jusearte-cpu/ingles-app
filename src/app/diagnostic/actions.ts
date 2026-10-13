"use server";

import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { diagnosticSessions, diagnosticItems, diagnosticResponses } from "@/db/schema";
import { keywordGrade, exactGrade } from "@/lib/graders";
import { getTutorProvider } from "@/lib/ai";
import { requireUserId } from "@/lib/auth";

export async function startDiagnostic() {
  const userId = await requireUserId();
  const id = nanoid();
  await db.insert(diagnosticSessions).values({ id, userId, kind: "quick", status: "in_progress" });
  return { sessionId: id };
}

export interface SkillSummary {
  skill: string;
  total: number;
  satisfactory: number;
  suggestion: string;
}

export async function submitDiagnosticBatch(
  sessionId: string,
  answers: Record<string, string>,
) {
  const userId = await requireUserId();
  const items = await db.select().from(diagnosticItems);
  const provider = getTutorProvider();
  const now = new Date();

  const bySkill = new Map<string, { total: number; satisfactory: number }>();

  for (const item of items) {
    const content = item.content as any;
    const response = answers[item.id] ?? "";
    let satisfactory = false;

    if (content.type === "grammar_fill") {
      satisfactory = exactGrade(response, content.answer);
    } else if (content.type === "writing_prompt") {
      const feedback = await provider.giveFeedback({
        unitTitle: "Diagnóstico",
        stepName: "Writing",
        learnerResponse: response,
        objectiveStatements: [],
      });
      satisfactory = feedback.taskFulfilled && feedback.meaningErrors.length === 0;
    } else {
      satisfactory = keywordGrade(response, content.expectedKeywords ?? [], 1).satisfactory;
    }

    await db.insert(diagnosticResponses).values({
      id: nanoid(),
      userId,
      sessionId,
      itemId: item.id,
      responseText: response,
      satisfactory,
      createdAt: now,
    });

    const bucket = bySkill.get(item.skill) ?? { total: 0, satisfactory: 0 };
    bucket.total += 1;
    if (satisfactory) bucket.satisfactory += 1;
    bySkill.set(item.skill, bucket);
  }

  await db
    .update(diagnosticSessions)
    .set({ status: "completed", completedAt: now })
    .where(eq(diagnosticSessions.id, sessionId));

  const SKILL_LABEL: Record<string, string> = {
    reading: "Reading",
    listening: "Listening",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    writing: "Writing",
  };

  const summaries: SkillSummary[] = Array.from(bySkill.entries()).map(([skill, v]) => {
    const ratio = v.satisfactory / v.total;
    const suggestion =
      ratio === 1
        ? "Las respuestas de esta muestra breve sugieren que ya tienes una base sólida en A1 para esta habilidad — probablemente puedas empezar más adelante en el recorrido (esto es orientativo, no un nivel oficial del MCER)."
        : ratio > 0
          ? "Las respuestas sugieren que A1 es un buen punto de partida para esta habilidad."
          : "Las respuestas sugieren empezar desde Pre-A1 en esta habilidad.";
    return { skill: SKILL_LABEL[skill] ?? skill, total: v.total, satisfactory: v.satisfactory, suggestion };
  });

  summaries.push({
    skill: "Speaking",
    total: 0,
    satisfactory: 0,
    suggestion:
      "Pendiente de evaluar — este diagnóstico rápido no incluye producción oral libre todavía. No se infiere tu nivel de speaking a partir de respuestas escritas.",
  });

  return { summaries };
}

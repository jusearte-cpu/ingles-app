"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  attempts,
  evidenceRecords,
  objectiveStatus,
  spacedRepetitionItems,
  spacedRepetitionHistory,
  portfolioItems,
  diagnosticSessions,
  diagnosticResponses,
} from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Elimina TUS datos (evidencia, intentos, progreso, portafolio, diagnósticos)
 * pero no el currículo (objetivos/unidades/actividades) — eso es contenido de
 * la app, no datos tuyos. Criterio de aceptación: "puedo eliminar mis datos".
 */
export async function deleteAllMyData() {
  const userId = await requireUserId();
  const supabase = createSupabaseServerClient();

  const { data: files } = await supabase.storage.from("recordings").list(userId);
  if (files && files.length > 0) {
    await supabase.storage.from("recordings").remove(files.map((f) => `${userId}/${f.name}`));
  }

  await db.delete(evidenceRecords).where(eq(evidenceRecords.userId, userId));
  await db.delete(portfolioItems).where(eq(portfolioItems.userId, userId));
  await db.delete(attempts).where(eq(attempts.userId, userId));
  await db.delete(objectiveStatus).where(eq(objectiveStatus.userId, userId));
  await db.delete(spacedRepetitionHistory).where(eq(spacedRepetitionHistory.userId, userId));
  await db.delete(spacedRepetitionItems).where(eq(spacedRepetitionItems.userId, userId));
  await db.delete(diagnosticResponses).where(eq(diagnosticResponses.userId, userId));
  await db.delete(diagnosticSessions).where(eq(diagnosticSessions.userId, userId));

  revalidatePath("/today");
  revalidatePath("/map");
  revalidatePath("/progress");
  revalidatePath("/review");
  revalidatePath("/portfolio");

  return { done: true };
}

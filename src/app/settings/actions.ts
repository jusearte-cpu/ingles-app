"use server";

import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
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

/**
 * Elimina TUS datos (evidencia, intentos, progreso, portafolio, diagnósticos)
 * pero no el currículo (objetivos/unidades/actividades) — eso es contenido de
 * la app, no datos tuyos. Criterio de aceptación: "puedo eliminar mis datos".
 */
export async function deleteAllMyData() {
  const recordingsDir = path.join(process.cwd(), "data", "recordings");
  if (fs.existsSync(recordingsDir)) {
    for (const file of fs.readdirSync(recordingsDir)) {
      fs.unlinkSync(path.join(recordingsDir, file));
    }
  }

  db.delete(evidenceRecords).run();
  db.delete(portfolioItems).run();
  db.delete(attempts).run();
  db.delete(objectiveStatus).run();
  db.delete(spacedRepetitionHistory).run();
  db.delete(spacedRepetitionItems).run();
  db.delete(diagnosticResponses).run();
  db.delete(diagnosticSessions).run();

  revalidatePath("/today");
  revalidatePath("/map");
  revalidatePath("/progress");
  revalidatePath("/review");
  revalidatePath("/portfolio");

  return { done: true };
}

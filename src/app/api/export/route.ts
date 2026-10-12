import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/db/client";
import {
  objectives,
  units,
  activities,
  attempts,
  evidenceRecords,
  objectiveStatus,
  spacedRepetitionItems,
  spacedRepetitionHistory,
  portfolioItems,
  diagnosticSessions,
  diagnosticItems,
  diagnosticResponses,
} from "@/db/schema";

/**
 * Exportación completa de los datos locales — criterio de aceptación 12 del
 * encargo ("puedo exportar mis resultados"). Incluye currículo + evidencia
 * para que el archivo sea auto-contenido y legible sin la app.
 */
export async function GET() {
  const payload = {
    exported_at: new Date().toISOString(),
    note: "Exportación local (Etapa 2). No incluye archivos de audio — están en data/recordings/.",
    curriculum: {
      objectives: db.select().from(objectives).all(),
      units: db.select().from(units).all(),
      activities: db.select().from(activities).all(),
      diagnostic_items: db.select().from(diagnosticItems).all(),
    },
    progress: {
      attempts: db.select().from(attempts).all(),
      evidence_records: db.select().from(evidenceRecords).all(),
      objective_status: db.select().from(objectiveStatus).all(),
      spaced_repetition_items: db.select().from(spacedRepetitionItems).all(),
      spaced_repetition_history: db.select().from(spacedRepetitionHistory).all(),
      portfolio_items: db.select().from(portfolioItems).all(),
      diagnostic_sessions: db.select().from(diagnosticSessions).all(),
      diagnostic_responses: db.select().from(diagnosticResponses).all(),
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ingles-app-export-${Date.now()}.json"`,
    },
  });
}

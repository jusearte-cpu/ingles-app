import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
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
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Exportación completa de TUS datos — criterio de aceptación 12 del encargo
 * ("puedo exportar mis resultados"). Incluye currículo (compartido) +
 * evidencia (solo la tuya) para que el archivo sea auto-contenido y legible
 * sin la app.
 */
export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = user.id;

  const payload = {
    exported_at: new Date().toISOString(),
    user_email: user.email,
    note: "Las grabaciones de audio no están incluidas aquí — viven en el bucket privado 'recordings' de Supabase Storage.",
    curriculum: {
      objectives: await db.select().from(objectives),
      units: await db.select().from(units),
      activities: await db.select().from(activities),
      diagnostic_items: await db.select().from(diagnosticItems),
    },
    progress: {
      attempts: await db.select().from(attempts).where(eq(attempts.userId, userId)),
      evidence_records: await db.select().from(evidenceRecords).where(eq(evidenceRecords.userId, userId)),
      objective_status: await db.select().from(objectiveStatus).where(eq(objectiveStatus.userId, userId)),
      spaced_repetition_items: await db
        .select()
        .from(spacedRepetitionItems)
        .where(eq(spacedRepetitionItems.userId, userId)),
      spaced_repetition_history: await db
        .select()
        .from(spacedRepetitionHistory)
        .where(eq(spacedRepetitionHistory.userId, userId)),
      portfolio_items: await db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId)),
      diagnostic_sessions: await db
        .select()
        .from(diagnosticSessions)
        .where(eq(diagnosticSessions.userId, userId)),
      diagnostic_responses: await db
        .select()
        .from(diagnosticResponses)
        .where(eq(diagnosticResponses.userId, userId)),
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ingles-app-export-${Date.now()}.json"`,
    },
  });
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db/client";
import { attempts, spacedRepetitionItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getUnitWithActivities, getAllObjectives } from "@/lib/queries";

const UNIT_ID = "unit-a1-1-1";

const NEEDS_ATTEMPT = new Set([
  "contextualized_input",
  "guided_practice",
  "unaided_retrieval",
  "production",
  "communicative_task",
]);

export default function MapPage() {
  const data = getUnitWithActivities(UNIT_ID);
  if (!data) {
    return <p>Todavía no hay contenido sembrado. Corre `npm run db:seed`.</p>;
  }
  const { unit } = data;
  const activities = data.activities.filter((a) => a.type !== "spaced_review");
  const objectives = getAllObjectives();

  const interactiveIds = activities.filter((a) => NEEDS_ATTEMPT.has(a.type)).map((a) => a.id);
  const attemptedIds = new Set(
    interactiveIds.length
      ? db
          .select({ activityId: attempts.activityId })
          .from(attempts)
          .where(inArray(attempts.activityId, interactiveIds))
          .all()
          .map((r) => r.activityId)
      : [],
  );
  const reviewDone = objectives.every((o) =>
    db
      .select()
      .from(spacedRepetitionItems)
      .where(eq(spacedRepetitionItems.objectiveId, o.id))
      .get(),
  );
  const completedSteps = attemptedIds.size + (reviewDone ? 1 : 0);
  const totalSteps = interactiveIds.length + 1;

  const status =
    completedSteps === 0
      ? "no iniciado"
      : completedSteps < totalSteps
        ? "en curso"
        : "pasos completados (ver Progreso para evidencia real)";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mapa del curso</h1>
      <p className="text-sm text-ink/60">
        Etapa 2 (local): solo existe Nivel A1 · Módulo 1 con esta unidad de ejemplo. El
        resto de Pre-A1 a C1 está diseñado en{" "}
        <code>docs/02-curriculum-matrix.md</code> pero aún no implementado — se
        construye en las Etapas 3-5.
      </p>

      <div className="rounded-lg border border-black/10 bg-white">
        <div className="border-b border-black/10 px-4 py-2 text-sm font-medium text-ink/60">
          Nivel A1 — Módulo 1: Vida diaria mínima
        </div>
        <Link
          href={`/lesson/${unit.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-accentSoft/40"
        >
          <span>{unit.title}</span>
          <span className="text-xs text-ink/50">{status}</span>
        </Link>
      </div>

      <div className="rounded-lg border border-dashed border-black/20 bg-black/5 px-4 py-3 text-sm text-ink/50">
        Pre-A1, resto de A1, A2, B1, B2, C1 (y C2 opcional) — pendientes, ver hoja de
        ruta.
      </div>
    </div>
  );
}

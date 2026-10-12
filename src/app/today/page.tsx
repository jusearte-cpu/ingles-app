export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db/client";
import { attempts, spacedRepetitionItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAllUnitsWithActivities, getDueReviews } from "@/lib/queries";

const NEEDS_ATTEMPT = new Set([
  "contextualized_input",
  "guided_practice",
  "unaided_retrieval",
  "production",
  "communicative_task",
]);

const STEP_MINUTES: Record<string, number> = {
  info: 1,
  worked_example: 2,
  contextualized_input: 5,
  language_observation: 2,
  guided_practice: 4,
  unaided_retrieval: 4,
  production: 5,
  communicative_task: 6,
  feedback: 2,
  review_scheduling: 1,
};

export default function TodayPage() {
  const unitsWithActivities = getAllUnitsWithActivities();

  if (unitsWithActivities.length === 0) {
    return <p>Todavía no hay contenido sembrado. Corre `npm run db:seed`.</p>;
  }

  const allActivityIds = unitsWithActivities.flatMap(({ activities }) =>
    activities.map((a) => a.id),
  );
  const attemptedIds = new Set(
    allActivityIds.length
      ? db
          .select({ activityId: attempts.activityId })
          .from(attempts)
          .where(inArray(attempts.activityId, allActivityIds))
          .all()
          .map((r) => r.activityId)
      : [],
  );

  let recommended: { unit: (typeof unitsWithActivities)[number]["unit"]; stepNumber: number; stepName: string; type: string } | null =
    null;

  for (const { unit, activities } of unitsWithActivities) {
    const unitObjectiveIds = Array.from(new Set(activities.flatMap((a) => a.objectiveIds)));
    const reviewDone =
      unitObjectiveIds.length > 0 &&
      unitObjectiveIds.every((id) =>
        db.select().from(spacedRepetitionItems).where(eq(spacedRepetitionItems.objectiveId, id)).get(),
      );

    const nextStep = activities.find(
      (a) =>
        (NEEDS_ATTEMPT.has(a.type) && !attemptedIds.has(a.id)) ||
        (a.type === "review_scheduling" && !reviewDone),
    );
    if (nextStep) {
      recommended = { unit, stepNumber: nextStep.stepNumber, stepName: nextStep.stepName, type: nextStep.type };
      break;
    }
  }

  const dueReviews = getDueReviews(new Date().toISOString());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hoy</h1>

      <Link
        href="/diagnostic"
        className="block rounded-lg border border-dashed border-black/20 px-4 py-2 text-sm text-ink/60 hover:border-accent/40"
      >
        ¿Primera vez? Haz el diagnóstico rápido (10-15 min) →
      </Link>

      {dueReviews.length > 0 && (
        <Link
          href="/review"
          className="block rounded-lg border border-accent/30 bg-accentSoft p-4 hover:bg-accentSoft/80"
        >
          <p className="font-medium text-accent">{dueReviews.length} repaso(s) vencido(s)</p>
          <p className="text-sm text-ink/70">
            Repasar antes de contenido nuevo — así no se acumula indefinidamente.
          </p>
        </Link>
      )}

      {recommended ? (
        <Link
          href={`/lesson/${recommended.unit.id}?step=${recommended.stepNumber}`}
          className="block rounded-lg border border-black/10 bg-white p-4 hover:border-accent/40"
        >
          <p className="text-sm text-ink/60">
            {recommended.unit.levelCode} · {recommended.unit.moduleTitle} · {recommended.unit.title}
          </p>
          <p className="mt-1 text-lg font-medium">
            Paso {recommended.stepNumber}: {recommended.stepName}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink/70 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase text-ink/40">Para qué</dt>
              <dd>objetivo comunicativo de este paso (ver detalle en la lección)</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-ink/40">Tiempo aprox.</dt>
              <dd>{STEP_MINUTES[recommended.type] ?? 3} min</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-ink/40">Evidencia</dt>
              <dd>{NEEDS_ATTEMPT.has(recommended.type) ? "un intento registrado" : "repaso programado"}</dd>
            </div>
          </dl>
        </Link>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <p className="font-medium">Completaste todos los pasos del contenido disponible.</p>
          <p className="mt-1 text-sm text-ink/60">
            Revisa <Link href="/progress" className="underline">Progreso</Link> para ver
            qué quedó demostrado y qué todavía necesita más evidencia — completar los
            pasos no es lo mismo que demostrar la competencia. El resto del currículo
            (ver <code>docs/02-curriculum-matrix.md</code>) todavía se está construyendo.
          </p>
        </div>
      )}

      <p className="text-xs text-ink/50">
        Etapa 2/3 (local): {unitsWithActivities.length} unidades reales en Pre-A1, A1 y
        A2. El resto del currículo se construye en las próximas etapas (ver
        docs/06-roadmap.md).
      </p>
    </div>
  );
}

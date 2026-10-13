export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db/client";
import { attempts, spacedRepetitionItems } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { getAllUnitsWithActivities } from "@/lib/queries";
import { requireUserId } from "@/lib/auth";

const NEEDS_ATTEMPT = new Set([
  "contextualized_input",
  "guided_practice",
  "unaided_retrieval",
  "production",
  "communicative_task",
]);

async function unitStatus(
  userId: string,
  activities: { id: string; type: string; objectiveIds: string[] }[],
) {
  const interactiveIds = activities.filter((a) => NEEDS_ATTEMPT.has(a.type)).map((a) => a.id);
  const attemptedIds = new Set(
    interactiveIds.length
      ? (
          await db
            .select({ activityId: attempts.activityId })
            .from(attempts)
            .where(and(inArray(attempts.activityId, interactiveIds), eq(attempts.userId, userId)))
        ).map((r) => r.activityId)
      : [],
  );
  const objectiveIds = Array.from(new Set(activities.flatMap((a) => a.objectiveIds)));
  let reviewDone = objectiveIds.length > 0;
  for (const id of objectiveIds) {
    const [row] = await db
      .select()
      .from(spacedRepetitionItems)
      .where(and(eq(spacedRepetitionItems.userId, userId), eq(spacedRepetitionItems.objectiveId, id)));
    if (!row) {
      reviewDone = false;
      break;
    }
  }
  const completedSteps = attemptedIds.size + (reviewDone ? 1 : 0);
  const totalSteps = interactiveIds.length + 1;

  if (completedSteps === 0) return "no iniciado";
  if (completedSteps < totalSteps) return "en curso";
  return "pasos completados (ver Progreso)";
}

export default async function MapPage() {
  const userId = await requireUserId();
  const unitsWithActivities = await getAllUnitsWithActivities();

  if (unitsWithActivities.length === 0) {
    return <p>Todavía no hay contenido sembrado. Corre `npm run db:seed`.</p>;
  }

  const groups = new Map<string, { unit: (typeof unitsWithActivities)[number]["unit"]; status: string }[]>();
  for (const { unit, activities } of unitsWithActivities) {
    const key = `${unit.levelCode} — ${unit.moduleTitle}`;
    const list = groups.get(key) ?? [];
    list.push({ unit, status: await unitStatus(userId, activities) });
    groups.set(key, list);
  }

  const implementedLevels = new Set(unitsWithActivities.map((u) => u.unit.levelCode));
  const emptyLevels = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].filter(
    (l) => !implementedLevels.has(l),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mapa del curso</h1>
      <p className="text-sm text-ink/60">
        {unitsWithActivities.length} unidades reales implementadas, a modo de prueba del
        sistema en 3 niveles. El diseño completo Pre-A1 → C1 está en{" "}
        <code>docs/02-curriculum-matrix.md</code>; la mayoría todavía no tiene código —
        ver <code>docs/06-roadmap.md</code> para el estado honesto, nivel por nivel.
      </p>

      {Array.from(groups.entries()).map(([groupTitle, unitList]) => (
        <div key={groupTitle} className="rounded-lg border border-black/10 bg-white">
          <div className="border-b border-black/10 px-4 py-2 text-sm font-medium text-ink/60">
            {groupTitle}
          </div>
          {unitList.map(({ unit, status }) => (
            <Link
              key={unit.id}
              href={`/lesson/${unit.id}`}
              className="flex items-center justify-between border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-accentSoft/40"
            >
              <span>{unit.title}</span>
              <span className="text-xs text-ink/50">{status}</span>
            </Link>
          ))}
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-black/20 bg-black/5 px-4 py-3 text-sm text-ink/50">
        Niveles sin ninguna unidad todavía: {emptyLevels.join(", ")}. Pre-A1, A1 y A2
        tienen solo una muestra (1-2 unidades de varios módulos planeados) — ni esos
        tres niveles están completos. Ver docs/06-roadmap.md para el detalle exacto.
      </div>
    </div>
  );
}

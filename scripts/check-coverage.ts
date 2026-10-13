/**
 * Verifica que todo objetivo del currículo tenga al menos una actividad de
 * práctica asociada, y marca por separado los que todavía no tienen ninguna
 * comprobación en el banco de evaluación — tal como prometido en
 * docs/02-curriculum-matrix.md ("detecta objetivos sin actividades o
 * evaluaciones"). No falla el build; es una herramienta de auditoría para
 * correr a mano o en CI antes de dar por "cubierto" un nivel.
 *
 * Uso: npm run check:coverage
 */
import { db } from "../src/db/client";
import { objectives, activities } from "../src/db/schema";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

async function main() {
  const allObjectives = await db.select().from(objectives);
  const allActivities = await db.select().from(activities);

  let noActivity = 0;
  let noAssessment = 0;

  console.log(`\nRevisando ${allObjectives.length} objetivos...\n`);

  for (const o of allObjectives) {
    const linked = allActivities.filter((a) =>
      (a.objectiveIds as string[]).includes(o.id),
    );
    const practiceLinked = linked.filter((a) => a.pool !== "assessment");
    const assessmentLinked = linked.filter((a) => a.pool === "assessment");

    if (practiceLinked.length === 0) {
      noActivity += 1;
      console.log(
        `${RED}✗ SIN ACTIVIDAD${RESET} ${o.stableCode} (${o.levelCode}) — "${o.canDoStatement}"`,
      );
    } else if (assessmentLinked.length === 0) {
      noAssessment += 1;
      console.log(
        `${YELLOW}⚠ sin evaluación formal${RESET} ${o.stableCode} (${o.levelCode}) — tiene ${practiceLinked.length} actividad(es) de práctica, 0 de evaluación`,
      );
    } else {
      console.log(
        `${GREEN}✓${RESET} ${o.stableCode} — ${practiceLinked.length} práctica(s), ${assessmentLinked.length} evaluación(es)`,
      );
    }
  }

  console.log(
    `\nResumen: ${allObjectives.length} objetivos · ${noActivity} sin ninguna actividad · ${noAssessment} sin evaluación formal (pero con práctica).\n`,
  );

  if (noActivity > 0) {
    console.log(
      `${RED}Hay objetivos sin ninguna actividad — eso es un objetivo "de papel", nunca se puede demostrar.${RESET}\n`,
    );
    process.exit(1);
  }
}

main().then(() => process.exit(0));

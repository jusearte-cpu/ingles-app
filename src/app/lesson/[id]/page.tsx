import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnitWithActivities } from "@/lib/queries";
import { StepRenderer } from "./StepRenderer";

export default function LessonPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { step?: string };
}) {
  const data = getUnitWithActivities(params.id);
  if (!data) notFound();

  const { unit } = data;
  const activities = data.activities.filter((a) => a.type !== "spaced_review");
  const totalSteps = activities.length;
  const currentStep = Math.min(
    Math.max(parseInt(searchParams.step ?? "1", 10) || 1, 1),
    totalSteps,
  );
  const activity = activities[currentStep - 1];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink/60">{unit.moduleTitle} · Nivel {unit.levelCode}</p>
        <h1 className="text-2xl font-semibold">{unit.title}</h1>
      </div>

      <div className="flex items-center gap-2 text-sm text-ink/60">
        <span>
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="font-medium text-ink">— {activity.stepName}</span>
      </div>

      <div className="flex gap-1">
        {activities.map((a) => (
          <Link
            key={a.id}
            href={`/lesson/${unit.id}?step=${a.stepNumber}`}
            className={`h-1.5 flex-1 rounded-full ${
              a.stepNumber === currentStep ? "bg-accent" : "bg-black/10"
            }`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-black/10 bg-white/50 p-4">
        <StepRenderer
          unitId={unit.id}
          activity={{
            id: activity.id,
            stepNumber: activity.stepNumber,
            stepName: activity.stepName,
            type: activity.type,
            content: activity.content as any,
            objectiveIds: activity.objectiveIds,
          }}
        />
      </div>

      <div className="flex justify-between">
        <Link
          href={`/lesson/${unit.id}?step=${currentStep - 1}`}
          aria-disabled={currentStep === 1}
          className={`rounded-md px-4 py-2 text-sm ${
            currentStep === 1
              ? "pointer-events-none opacity-30"
              : "bg-black/5 hover:bg-black/10"
          }`}
        >
          ← Anterior
        </Link>
        <Link
          href={`/lesson/${unit.id}?step=${currentStep + 1}`}
          aria-disabled={currentStep === totalSteps}
          className={`rounded-md px-4 py-2 text-sm ${
            currentStep === totalSteps
              ? "pointer-events-none opacity-30"
              : "bg-black/5 hover:bg-black/10"
          }`}
        >
          Siguiente →
        </Link>
      </div>
    </div>
  );
}

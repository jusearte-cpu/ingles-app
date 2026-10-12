export const dynamic = "force-dynamic";

import { getDueReviews, getUpcomingReviews, getObjectivesByIds } from "@/lib/queries";
import { REVIEW_PROMPTS } from "@/lib/review-prompts";
import { loadThresholds } from "@/lib/thresholds";
import { ReviewCard } from "./ReviewCard";

export default function ReviewPage() {
  const now = new Date().toISOString();
  const due = getDueReviews(now);
  const upcoming = getUpcomingReviews(now);
  const cap = loadThresholds().spaced_repetition.daily_review_cap;

  const dueToShow = due.slice(0, cap);
  const overflow = due.length - dueToShow.length;

  const objectives = getObjectivesByIds(dueToShow.map((d) => d.objectiveId));
  const objectiveById = new Map(objectives.map((o) => [o.id, o]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Repaso</h1>

      {dueToShow.length === 0 && upcoming.length === 0 && (
        <p className="text-sm text-ink/60">
          Todavía no hay repasos programados — se programan al terminar el paso 10 de
          una unidad.
        </p>
      )}

      {dueToShow.length === 0 && upcoming.length > 0 && (
        <p className="text-sm text-ink/60">
          No tienes repasos vencidos hoy. Próximo repaso:{" "}
          {new Date(
            upcoming.sort((a, b) => (a.dueAt < b.dueAt ? -1 : 1))[0].dueAt,
          ).toLocaleDateString("es")}
          .
        </p>
      )}

      <div className="space-y-3">
        {dueToShow.map((item) => {
          const objective = objectiveById.get(item.objectiveId);
          const prompt = REVIEW_PROMPTS[item.objectiveId];
          if (!objective || !prompt) return null;
          return (
            <ReviewCard
              key={item.objectiveId}
              objectiveId={item.objectiveId}
              canDoStatement={objective.canDoStatement}
              prompt={prompt.prompt}
            />
          );
        })}
      </div>

      {overflow > 0 && (
        <p className="text-sm text-ink/60">
          Tienes {overflow} repaso(s) más en espera (techo diario: {cap}) — no se
          muestran hoy para no bloquear contenido nuevo.
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  submitListeningAnswers,
  submitGuidedPractice,
  submitUnaidedRetrieval,
  submitProduction,
  submitCommunicativeTask,
  completeReviewScheduling,
} from "../actions";

type Activity = {
  id: string;
  stepNumber: number;
  stepName: string;
  type: string;
  content: any;
  objectiveIds: string[];
};

function speak(lines: { speaker: string; text: string }[]) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  lines.forEach((line, i) => {
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    setTimeout(() => window.speechSynthesis.speak(utterance), i * 50);
  });
}

function ResultBanner({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`mt-3 rounded-md border px-3 py-2 text-sm ${
        ok
          ? "border-accent/30 bg-accentSoft text-accent"
          : "border-warn/30 bg-warn/10 text-warn"
      }`}
    >
      {children}
    </div>
  );
}

function InfoStep({ activity }: { activity: Activity }) {
  return <p className="text-base leading-relaxed">{activity.content.body}</p>;
}

function WorkedExampleStep({ activity }: { activity: Activity }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md bg-white p-4 shadow-sm">
        {activity.content.dialogue.map((l: any, i: number) => (
          <p key={i}>
            <span className="font-semibold text-accent">{l.speaker}:</span> {l.text}
          </p>
        ))}
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-ink/80">
        {activity.content.notes.map((n: string, i: number) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

function LanguageObservationStep({ activity }: { activity: Activity }) {
  return (
    <div className="space-y-2">
      {activity.content.highlights.map((h: any, i: number) => (
        <div key={i} className="rounded-md bg-white p-3 shadow-sm">
          <p className="font-medium text-accent">{h.phrase}</p>
          <p className="text-sm text-ink/70">{h.note}</p>
        </div>
      ))}
    </div>
  );
}

function ContextualizedInputStep({
  unitId,
  activity,
}: {
  unitId: string;
  activity: Activity;
}) {
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState<null | { ok: boolean; detail: string }>(null);

  return (
    <div className="space-y-4">
      <button
        onClick={() => speak(activity.content.dialogue)}
        className="rounded-md bg-accent px-4 py-2 text-white"
      >
        ▶ Reproducir diálogo (voz del navegador)
      </button>
      <p className="text-xs text-ink/60">
        Condiciones de esta escucha: puedes reproducirlo las veces que quieras, no hay
        transcripción visible abajo (es a propósito).
      </p>
      {activity.content.questions.map((q: any) => (
        <div key={q.id}>
          <label className="block text-sm font-medium">{q.prompt}</label>
          <input
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        </div>
      ))}
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const payload = activity.content.questions.map((q: any) => ({
              questionId: q.id,
              response: answers[q.id] ?? "",
              expectedKeywords: q.expectedKeywords,
            }));
            const r = await submitListeningAnswers(
              unitId,
              activity.id,
              activity.content.questions[0].objectiveId,
              payload,
            );
            setDone({
              ok: r.satisfactory,
              detail: r.satisfactory
                ? "Respondiste correctamente los datos clave del diálogo."
                : "Al menos una respuesta no coincide con lo que dice el audio — puedes volver a escuchar e intentarlo de nuevo.",
            });
          })
        }
        className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
      >
        Comprobar
      </button>
      {done && <ResultBanner ok={done.ok}>{done.detail}</ResultBanner>}
    </div>
  );
}

function GuidedPracticeStep({ unitId, activity }: { unitId: string; activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<null | { ok: boolean; detail: string }>(null);

  return (
    <div className="space-y-4">
      {activity.content.sentences.map((s: any) => (
        <div key={s.id}>
          <p className="font-mono text-sm">{s.template}</p>
          <input
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            placeholder="tu respuesta"
            value={answers[s.id] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [s.id]: e.target.value })}
          />
          <button
            className="mt-1 text-xs text-accent underline"
            onClick={() => setShowHints({ ...showHints, [s.id]: true })}
          >
            pista
          </button>
          {showHints[s.id] && <p className="text-xs text-ink/60">{s.hint}</p>}
        </div>
      ))}
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const payload = activity.content.sentences.map((s: any) => ({
              sentenceId: s.id,
              response: answers[s.id] ?? "",
              answer: s.answer,
            }));
            const r = await submitGuidedPractice(
              unitId,
              activity.id,
              activity.objectiveIds[0],
              payload,
            );
            setDone({ ok: r.satisfactory, detail: `Correctas: ${r.correctCount}/${r.total}.` });
          })
        }
        className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
      >
        Comprobar
      </button>
      {done && <ResultBanner ok={done.ok}>{done.detail}</ResultBanner>}
    </div>
  );
}

function UnaidedRetrievalStep({ unitId, activity }: { unitId: string; activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [response, setResponse] = useState("");
  const [done, setDone] = useState<null | { ok: boolean; detail: string }>(null);

  return (
    <div className="space-y-3">
      <p>{activity.content.prompt}</p>
      <textarea
        className="w-full rounded border border-black/20 px-3 py-2"
        rows={4}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await submitUnaidedRetrieval(
              unitId,
              activity.id,
              activity.objectiveIds,
              response,
              activity.content.expectedKeywords,
            );
            setDone({
              ok: r.satisfactory,
              detail: r.satisfactory
                ? "Reconstruiste los elementos clave sin mirar el texto."
                : `Te faltaron elementos clave (encontrados: ${r.matched.join(", ") || "ninguno"}).`,
            });
          })
        }
        className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
      >
        Enviar
      </button>
      {done && <ResultBanner ok={done.ok}>{done.detail}</ResultBanner>}
    </div>
  );
}

function ProductionStep({ unitId, activity }: { unitId: string; activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState<any>(null);

  return (
    <div className="space-y-3">
      <p>{activity.content.prompt}</p>
      <textarea
        className="w-full rounded border border-black/20 px-3 py-2"
        rows={3}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await submitProduction(unitId, activity.id, activity.objectiveIds, response);
            setFeedback(r.feedback);
          })
        }
        className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
      >
        Enviar
      </button>
      {feedback && (
        <ResultBanner ok={feedback.taskFulfilled}>
          <p className="font-medium">
            {feedback.isMock ? "⚠ " : ""}
            {feedback.summary}
          </p>
          {feedback.meaningErrors.length > 0 && (
            <p className="mt-1">Significado: {feedback.meaningErrors.join(" ")}</p>
          )}
          {feedback.formErrors.length > 0 && (
            <p className="mt-1">Forma: {feedback.formErrors.join(" ")}</p>
          )}
          {feedback.styleSuggestions.length > 0 && (
            <p className="mt-1">Estilo: {feedback.styleSuggestions.join(" ")}</p>
          )}
        </ResultBanner>
      )}
    </div>
  );
}

function CommunicativeTaskStep({ unitId, activity }: { unitId: string; activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<"origin" | "repetition" | "done">("origin");
  const [originResponse, setOriginResponse] = useState("");
  const [repetitionResponse, setRepetitionResponse] = useState("");
  const [result, setResult] = useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white p-4 shadow-sm">
        <p>
          <span className="font-semibold text-accent">Tutor:</span> {activity.content.tutorLine}
        </p>
      </div>
      {stage === "origin" && (
        <>
          <input
            className="w-full rounded border border-black/20 px-3 py-2"
            placeholder="Tu respuesta..."
            value={originResponse}
            onChange={(e) => setOriginResponse(e.target.value)}
          />
          <button onClick={() => setStage("repetition")} className="rounded-md bg-ink px-4 py-2 text-white">
            Enviar
          </button>
        </>
      )}
      {stage !== "origin" && (
        <div className="rounded-md bg-white p-4 shadow-sm">
          <p>
            <span className="font-semibold text-accent">Tú:</span> {originResponse}
          </p>
          <p className="mt-2">
            <span className="font-semibold text-accent">Tutor:</span> {activity.content.secondTutorLine}
          </p>
          <p className="mt-2 text-sm text-ink/60">{activity.content.instructions}</p>
        </div>
      )}
      {stage === "repetition" && (
        <>
          <input
            className="w-full rounded border border-black/20 px-3 py-2"
            placeholder="Pide que te repitan, en inglés..."
            value={repetitionResponse}
            onChange={(e) => setRepetitionResponse(e.target.value)}
          />
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await submitCommunicativeTask(
                  unitId,
                  activity.id,
                  activity.objectiveIds[0],
                  activity.objectiveIds[1],
                  originResponse,
                  repetitionResponse,
                  activity.content.expectedOriginKeywords,
                  activity.content.expectedRepetitionKeywords,
                );
                setResult(r);
                setStage("done");
              })
            }
            className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
          >
            Enviar
          </button>
        </>
      )}
      {stage === "done" && result && (
        <ResultBanner ok={result.originGrade.satisfactory && result.repetitionGrade.satisfactory}>
          <p>Decir tu origen: {result.originGrade.satisfactory ? "logrado" : "no quedó claro"}.</p>
          <p>
            Pedir repetición:{" "}
            {result.repetitionGrade.satisfactory ? "logrado" : "no se detectó una petición clara de repetición"}.
          </p>
        </ResultBanner>
      )}
    </div>
  );
}

function FeedbackStep() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink/70">
        Este resumen se arma a partir de las evidencias que acabas de generar en esta
        unidad (sin IA real evaluando — ver pasos anteriores, cada uno marcó su propio
        resultado con reglas transparentes).
      </p>
      <p>
        Revisa la pantalla de Progreso para ver qué objetivos de esta unidad ya tienen
        evidencia suficiente y cuáles todavía no — completar los 9 pasos previos no
        implica automáticamente que un objetivo quede &quot;demostrado&quot;.
      </p>
    </div>
  );
}

function ReviewSchedulingStep({ unitId, activity }: { unitId: string; activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<null | { ok: boolean; detail: string }>(null);

  return (
    <div className="space-y-3">
      <p>
        Se va a programar un repaso de los objetivos de esta unidad en{" "}
        {activity.content.intervalDays} días. Ese repaso futuro es lo que de verdad
        empieza a contar como evidencia de retención.
      </p>
      <button
        disabled={pending || done !== null}
        onClick={() =>
          startTransition(async () => {
            await completeReviewScheduling(unitId, activity.objectiveIds, activity.content.intervalDays);
            setDone({ ok: true, detail: "Repaso programado. Lo verás en la pestaña Repaso cuando venza." });
          })
        }
        className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
      >
        Programar repaso
      </button>
      {done && <ResultBanner ok={done.ok}>{done.detail}</ResultBanner>}
    </div>
  );
}

export function StepRenderer({ unitId, activity }: { unitId: string; activity: Activity }) {
  switch (activity.type) {
    case "info":
      return <InfoStep activity={activity} />;
    case "worked_example":
      return <WorkedExampleStep activity={activity} />;
    case "language_observation":
      return <LanguageObservationStep activity={activity} />;
    case "contextualized_input":
      return <ContextualizedInputStep unitId={unitId} activity={activity} />;
    case "guided_practice":
      return <GuidedPracticeStep unitId={unitId} activity={activity} />;
    case "unaided_retrieval":
      return <UnaidedRetrievalStep unitId={unitId} activity={activity} />;
    case "production":
      return <ProductionStep unitId={unitId} activity={activity} />;
    case "communicative_task":
      return <CommunicativeTaskStep unitId={unitId} activity={activity} />;
    case "feedback":
      return <FeedbackStep />;
    case "review_scheduling":
      return <ReviewSchedulingStep unitId={unitId} activity={activity} />;
    default:
      return <p>Tipo de paso no reconocido: {activity.type}</p>;
  }
}

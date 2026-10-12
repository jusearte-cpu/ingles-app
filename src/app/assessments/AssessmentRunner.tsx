"use client";

import { useState, useTransition } from "react";
import { submitAssessmentItem } from "./actions";

type Item = {
  id: string;
  stepName: string;
  content: { prompt: string; expectedKeywords: string[]; conditions?: string };
  objectiveIds: string[];
};

export function AssessmentRunner({ item }: { item: Item }) {
  const [pending, startTransition] = useTransition();
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<null | { satisfactory: boolean }>(null);

  return (
    <div className="rounded-md border border-black/10 bg-white p-4">
      <p className="font-medium">{item.stepName}</p>
      <p className="mt-1 text-sm">{item.content.prompt}</p>
      {item.content.conditions && (
        <p className="mt-1 text-xs text-ink/50">Condiciones: {item.content.conditions}</p>
      )}
      {result ? (
        <p className={`mt-2 text-sm ${result.satisfactory ? "text-accent" : "text-warn"}`}>
          {result.satisfactory ? "Correcto." : "No cumple lo esperado todavía."} Registrado como
          evidencia de evaluación (no de práctica).
        </p>
      ) : (
        <>
          <textarea
            className="mt-2 w-full rounded border border-black/20 px-3 py-2"
            rows={2}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await submitAssessmentItem(
                  item.id,
                  item.objectiveIds[0],
                  response,
                  item.content.expectedKeywords,
                );
                setResult({ satisfactory: r.satisfactory });
              })
            }
            className="mt-2 rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Enviar (una sola vez)
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { submitReview } from "./actions";

export function ReviewCard({
  objectiveId,
  canDoStatement,
  prompt,
}: {
  objectiveId: string;
  canDoStatement: string;
  prompt: string;
}) {
  const [pending, startTransition] = useTransition();
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<null | { satisfactory: boolean }>(null);

  if (result) {
    return (
      <div
        className={`rounded-md border p-4 ${
          result.satisfactory
            ? "border-accent/30 bg-accentSoft"
            : "border-warn/30 bg-warn/10"
        }`}
      >
        <p className="font-medium">{canDoStatement}</p>
        <p className="mt-1 text-sm">
          {result.satisfactory
            ? "Recordado. Se reprograma más adelante."
            : "No se logró del todo — se reprograma pronto, con apoyo."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-black/10 bg-white p-4">
      <p className="font-medium">{canDoStatement}</p>
      <p className="mt-1 text-sm text-ink/70">{prompt}</p>
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
            const r = await submitReview(objectiveId, response);
            setResult({ satisfactory: r.satisfactory });
          })
        }
        className="mt-2 rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Comprobar
      </button>
    </div>
  );
}

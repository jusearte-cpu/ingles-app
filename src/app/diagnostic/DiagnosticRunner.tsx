"use client";

import { useState, useTransition } from "react";
import { startDiagnostic, submitDiagnosticBatch, type SkillSummary } from "./actions";

type Item = {
  id: string;
  skill: string;
  content: any;
};

function speak(lines: { speaker: string; text: string }[]) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line.text);
    u.lang = "en-US";
    u.rate = 0.95;
    setTimeout(() => window.speechSynthesis.speak(u), i * 50);
  });
}

function ItemCard({
  item,
  value,
  onChange,
}: {
  item: Item;
  value: string;
  onChange: (v: string) => void;
}) {
  const c = item.content;
  return (
    <div className="rounded-md border border-black/10 bg-white p-4">
      {c.type === "reading_question" && (
        <>
          <p className="rounded bg-black/5 p-3 text-sm italic">{c.passage}</p>
          <p className="mt-2 font-medium">{c.question}</p>
        </>
      )}
      {c.type === "listening_question" && (
        <>
          <button
            onClick={() => speak(c.dialogue)}
            className="rounded-md bg-accent px-3 py-1.5 text-sm text-white"
          >
            ▶ Reproducir
          </button>
          <p className="mt-2 font-medium">{c.question}</p>
        </>
      )}
      {c.type === "grammar_fill" && <p className="font-mono">{c.template}</p>}
      {c.type === "vocabulary_question" && <p className="font-medium">{c.prompt}</p>}
      {c.type === "writing_prompt" && <p className="font-medium">{c.prompt}</p>}
      <input
        className="mt-2 w-full rounded border border-black/20 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function DiagnosticRunner({ items }: { items: Item[] }) {
  const [pending, startTransition] = useTransition();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [summaries, setSummaries] = useState<SkillSummary[] | null>(null);

  if (summaries) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink/60">
          Resultado orientativo de una muestra breve (7 ítems). No es un nivel
          oficial del MCER ni reemplaza el diagnóstico completo — ver
          docs/00-interpretation-and-scope.md.
        </p>
        {summaries.map((s) => (
          <div key={s.skill} className="rounded-md border border-black/10 bg-white p-4">
            <p className="font-medium">
              {s.skill}
              {s.total > 0 && (
                <span className="ml-2 text-sm text-ink/50">
                  ({s.satisfactory}/{s.total})
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-ink/70">{s.suggestion}</p>
          </div>
        ))}
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink/70">
          7 preguntas breves (reading, listening, grammar, vocabulary, writing). Toma
          unos 10-15 minutos. El speaking queda explícitamente pendiente de evaluar —
          no se infiere de respuestas escritas.
        </p>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await startDiagnostic();
              setSessionId(r.sessionId);
            })
          }
          className="rounded-md bg-accent px-4 py-2 text-white disabled:opacity-50"
        >
          Empezar diagnóstico rápido
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          value={answers[item.id] ?? ""}
          onChange={(v) => setAnswers({ ...answers, [item.id]: v })}
        />
      ))}
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await submitDiagnosticBatch(sessionId, answers);
            setSummaries(r.summaries);
          })
        }
        className="rounded-md bg-ink px-4 py-2 text-white disabled:opacity-50"
      >
        Terminar y ver resultado
      </button>
    </div>
  );
}

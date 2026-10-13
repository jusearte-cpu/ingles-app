"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./profile-actions";
import type { Profile } from "@/lib/profile";

const LEVELS = ["A2", "B1", "B2", "C1", "C2"];
const SUPPORT_OPTIONS = [
  { value: 1, label: "Mayormente en español" },
  { value: 0.6, label: "Equilibrado, más español" },
  { value: 0.3, label: "Equilibrado, más inglés" },
  { value: 0, label: "Mayormente en inglés" },
];
const VARIETY_OPTIONS = [
  { value: "general_american", label: "Inglés general americano" },
  { value: "british", label: "Inglés británico" },
  { value: "no_preference", label: "Sin preferencia (exposición variada)" },
];
const TEXT_SIZE_OPTIONS = [
  { value: "default", label: "Normal" },
  { value: "large", label: "Grande" },
  { value: "extra_large", label: "Extra grande" },
];

export function ProfileForm({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    targetLevel: profile.targetLevel,
    weeklyMinutesTarget: profile.weeklyMinutesTarget,
    studyDaysPerWeek: profile.studyDaysPerWeek,
    supportLanguageRatio: profile.supportLanguageRatio,
    englishVarietyPreference: profile.englishVarietyPreference,
    textSize: profile.textSize,
    reducedMotion: profile.reducedMotion,
  });

  function save() {
    startTransition(async () => {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Objetivo de nivel</label>
        <p className="text-xs text-ink/50">
          B2 es el hito de autonomía comunicativa; C1 es el objetivo principal del
          programa. Cambiarlo no borra tu evidencia pasada, solo ajusta la ruta
          recomendada hacia adelante.
        </p>
        <select
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          value={form.targetLevel}
          onChange={(e) => setForm({ ...form, targetLevel: e.target.value })}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Tiempo disponible por semana</label>
        <p className="text-xs text-ink/50">
          Punto de partida editable, no una promesa de velocidad de aprendizaje.
        </p>
        <div className="mt-1 flex gap-3">
          <input
            type="number"
            min={15}
            step={15}
            className="w-28 rounded border border-black/20 px-3 py-2"
            value={form.weeklyMinutesTarget}
            onChange={(e) =>
              setForm({ ...form, weeklyMinutesTarget: Number(e.target.value) })
            }
          />
          <span className="self-center text-sm text-ink/60">min/semana</span>
          <input
            type="number"
            min={1}
            max={7}
            className="w-20 rounded border border-black/20 px-3 py-2"
            value={form.studyDaysPerWeek}
            onChange={(e) =>
              setForm({ ...form, studyDaysPerWeek: Number(e.target.value) })
            }
          />
          <span className="self-center text-sm text-ink/60">días/semana</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Idioma de apoyo en la interfaz</label>
        <select
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          value={form.supportLanguageRatio}
          onChange={(e) =>
            setForm({ ...form, supportLanguageRatio: Number(e.target.value) })
          }
        >
          {SUPPORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Variedad de inglés preferida</label>
        <p className="text-xs text-ink/50">
          Afecta la voz usada al reproducir diálogos. La exposición a otras
          variedades en el contenido de lectura/escucha ocurre igual, sin importar
          esta preferencia.
        </p>
        <select
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          value={form.englishVarietyPreference}
          onChange={(e) => setForm({ ...form, englishVarietyPreference: e.target.value })}
        >
          {VARIETY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Accesibilidad</label>
        <select
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          value={form.textSize}
          onChange={(e) => setForm({ ...form, textSize: e.target.value })}
        >
          {TEXT_SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Tamaño de texto: {o.label}
            </option>
          ))}
        </select>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.reducedMotion}
            onChange={(e) => setForm({ ...form, reducedMotion: e.target.checked })}
          />
          Reducir animaciones/movimiento
        </label>
      </div>

      <button
        disabled={pending}
        onClick={save}
        className="rounded-md bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Guardar perfil
      </button>
      {saved && <span className="ml-2 text-sm text-accent">Guardado.</span>}
    </div>
  );
}

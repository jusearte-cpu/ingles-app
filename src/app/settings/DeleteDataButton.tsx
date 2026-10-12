"use client";

import { useState, useTransition } from "react";
import { deleteAllMyData } from "./actions";

export function DeleteDataButton() {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-sm text-accent">Tus datos de progreso fueron eliminados.</p>;
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-warn/40 px-4 py-2 text-sm text-warn hover:bg-warn/10"
      >
        Eliminar mis datos
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-warn/40 bg-warn/5 p-3">
      <p className="text-sm">
        Esto borra TODO tu progreso (intentos, evidencia, portafolio, repasos,
        diagnósticos) de forma permanente. El contenido del curso no se borra. No
        se puede deshacer. ¿Seguro?
      </p>
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteAllMyData();
              setDone(true);
            })
          }
          className="rounded-md bg-warn px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Sí, eliminar todo
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md px-3 py-1.5 text-sm hover:bg-black/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

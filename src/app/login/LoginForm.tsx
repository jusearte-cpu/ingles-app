"use client";

import { useState, useTransition } from "react";
import { requestMagicLink } from "./actions";

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  return (
    <div className="space-y-3">
      <input
        type="email"
        placeholder="tu@correo.com"
        className="w-full rounded border border-black/20 px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        disabled={pending || !email}
        onClick={() =>
          startTransition(async () => {
            const r = await requestMagicLink(email);
            setStatus(
              r.error
                ? { ok: false, message: r.error }
                : { ok: true, message: "Revisa tu correo: te enviamos un enlace para entrar." },
            );
          })
        }
        className="rounded-md bg-accent px-4 py-2 text-white disabled:opacity-50"
      >
        Enviar enlace de acceso
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? "text-accent" : "text-warn"}`}>{status.message}</p>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

export function AudioRecorder({
  onSaved,
}: {
  onSaved: (path: string, previewUrl: string) => void;
}) {
  const [state, setState] = useState<"idle" | "recording" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no tiene acceso a micrófono, o no hay uno conectado.");
      setState("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setState("uploading");
        try {
          const res = await fetch("/api/recordings", {
            method: "POST",
            headers: { "Content-Type": "audio/webm" },
            body: blob,
          });
          if (!res.ok) throw new Error((await res.json()).error ?? "Error al subir");
          const { path } = await res.json();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setState("idle");
          onSaved(path, url);
        } catch (e: any) {
          setError(e.message ?? "No se pudo guardar la grabación.");
          setState("error");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setError("No se pudo acceder al micrófono (¿diste permiso al navegador?).");
      setState("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {state !== "recording" ? (
          <button
            onClick={startRecording}
            disabled={state === "uploading"}
            className="rounded-md bg-accent px-4 py-2 text-white disabled:opacity-50"
          >
            🎙 {previewUrl ? "Grabar de nuevo" : "Grabar"}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="rounded-md bg-warn px-4 py-2 text-white"
          >
            ⏹ Detener
          </button>
        )}
        {state === "uploading" && <span className="text-sm text-ink/60">Guardando...</span>}
        {state === "recording" && <span className="text-sm text-warn">Grabando...</span>}
      </div>
      {error && <p className="text-sm text-warn">{error}</p>}
      {previewUrl && (
        <audio controls src={previewUrl} className="w-full">
          Tu navegador no soporta reproducción de audio.
        </audio>
      )}
    </div>
  );
}

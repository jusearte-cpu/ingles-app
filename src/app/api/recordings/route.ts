import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sube una grabación de audio al bucket privado "recordings" de Supabase
 * Storage, en la carpeta del usuario autenticado (recordings/<user_id>/...),
 * que es justo lo que exige la política de acceso (ver
 * db/schema.supabase.sql) — nadie más puede leerla.
 */
const MAX_BYTES = 10 * 1024 * 1024; // 10MB, ~varios minutos de audio comprimido
const ALLOWED_TYPES = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/wav"]);

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "audio/webm";
  const baseType = contentType.split(";")[0].trim();
  if (!ALLOWED_TYPES.has(baseType)) {
    return NextResponse.json({ error: "Tipo de audio no soportado." }, { status: 400 });
  }

  const buffer = Buffer.from(await req.arrayBuffer());
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Grabación vacía." }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Grabación demasiado grande." }, { status: 413 });
  }

  const ext = baseType.split("/")[1] ?? "webm";
  const path = `${user.id}/${nanoid()}.${ext}`;

  const { error } = await supabase.storage.from("recordings").upload(path, buffer, {
    contentType: baseType,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path });
}

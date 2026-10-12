import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

/**
 * Guarda una grabación de audio en almacenamiento privado local (filesystem
 * del servidor, fuera de /public — nunca servido directamente sin pasar por
 * la ruta GET de abajo). Cuando se conecte Supabase, esto se reemplaza por
 * un bucket privado con URL firmada (ver docs/01-architecture.md), sin tocar
 * el resto de la app: el contrato (recibe bytes, devuelve una ruta) es igual.
 */
const MAX_BYTES = 10 * 1024 * 1024; // 10MB, ~varios minutos de audio comprimido
const ALLOWED_TYPES = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/wav"]);

export async function POST(req: NextRequest) {
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
  const id = nanoid();
  const dir = path.join(process.cwd(), "data", "recordings");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${id}.${ext}`);
  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({ path: `recordings/${id}.${ext}` });
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("path");
  if (!file || file.includes("..")) {
    return NextResponse.json({ error: "Ruta inválida." }, { status: 400 });
  }
  const fullPath = path.join(process.cwd(), "data", file);
  if (!fullPath.startsWith(path.join(process.cwd(), "data", "recordings"))) {
    return NextResponse.json({ error: "Ruta inválida." }, { status: 400 });
  }
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).slice(1);
  return new NextResponse(buffer, {
    headers: { "Content-Type": `audio/${ext === "webm" ? "webm" : ext}` },
  });
}

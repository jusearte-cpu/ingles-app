/**
 * Migración de un solo uso: copia todo lo que hay en data/local.db (SQLite)
 * hacia un proyecto de Supabase ya creado con db/schema.supabase.sql
 * aplicado. No es necesaria para empezar a usar Supabase desde cero — solo
 * para llevarte el progreso que ya generaste en modo local.
 *
 * SIN PROBAR CONTRA UN PROYECTO REAL (no hay credenciales en este entorno) —
 * revisar con calma antes de correr. Es segura de reintentar (upsert), pero
 * aun así, antes de correrla, exporta un respaldo desde /settings.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... MIGRATE_USER_ID=... \
 *     npx tsx scripts/migrate-to-supabase.ts
 *
 * MIGRATE_USER_ID: tu propio user id de Supabase Auth (Dashboard →
 * Authentication → Users), después de haber entrado una vez con el enlace
 * mágico en /login.
 */
import Database from "better-sqlite3";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.env.MIGRATE_USER_ID;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !USER_ID) {
  console.error(
    "Faltan variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MIGRATE_USER_ID.",
  );
  process.exit(1);
}

const sqlite = new Database(path.join(process.cwd(), "data", "local.db"), {
  readonly: true,
});
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function rows(table: string): Record<string, unknown>[] {
  return sqlite.prepare(`select * from ${table}`).all() as Record<string, unknown>[];
}

// SQLite guarda booleans como 0/1 y JSON como texto; Postgres quiere
// boolean/jsonb nativos. snake_case se mantiene igual en ambos lados.
function toPg(row: Record<string, unknown>, boolCols: string[], jsonCols: string[]) {
  const out = { ...row };
  for (const c of boolCols) if (c in out) out[c] = Boolean(out[c]);
  for (const c of jsonCols) if (c in out && typeof out[c] === "string") out[c] = JSON.parse(out[c] as string);
  return out;
}

async function upsert(table: string, data: Record<string, unknown>[], conflictCols: string) {
  if (data.length === 0) return;
  const { error } = await supabase.from(table).upsert(data, { onConflict: conflictCols });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: ${data.length} filas`);
}

async function main() {
  // Currículo (sin user_id)
  await upsert("objectives", rows("objectives"), "id");
  await upsert("units", rows("units"), "id");
  await upsert(
    "activities",
    rows("activities").map((r) => toPg(r, [], ["content", "objective_ids"])),
    "id",
  );
  await upsert(
    "diagnostic_items",
    rows("diagnostic_items").map((r) => toPg(r, [], ["content"])),
    "id",
  );

  // Datos personales (+ user_id)
  const withUser = (r: Record<string, unknown>) => ({ ...r, user_id: USER_ID });

  await upsert("attempts", rows("attempts").map(withUser), "id");
  await upsert(
    "evidence_records",
    rows("evidence_records")
      .map((r) => toPg(r, ["satisfactory", "is_unaided", "is_transfer_task", "is_assessment", "critical_failure", "used_transcript"], ["ai_eval", "human_override"]))
      .map(withUser),
    "id",
  );
  await upsert(
    "objective_status",
    rows("objective_status").map(withUser),
    "user_id,objective_id",
  );
  await upsert(
    "spaced_repetition_items",
    rows("spaced_repetition_items").map(withUser),
    "user_id,objective_id",
  );
  await upsert("spaced_repetition_history", rows("spaced_repetition_history").map(withUser), "id");
  await upsert("portfolio_items", rows("portfolio_items").map(withUser), "id");
  await upsert("diagnostic_sessions", rows("diagnostic_sessions").map(withUser), "id");
  await upsert(
    "diagnostic_responses",
    rows("diagnostic_responses").map((r) => toPg(r, ["satisfactory"], [])).map(withUser),
    "id",
  );

  console.log("Migración completa. Los archivos de data/recordings/ se suben aparte (ver docs/SETUP-CLOUD.md).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

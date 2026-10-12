/**
 * drizzle-kit push tiene un bug conocido contra better-sqlite3 en esta
 * combinación de versiones (falla con "This statement does not return
 * data"). Para no bloquear el desarrollo local en la Etapa 2, el DDL se
 * aplica a mano aquí — mismo esquema que src/db/schema.ts, en SQL sqlite.
 * Es idempotente (CREATE TABLE IF NOT EXISTS).
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const sqlite = new Database(path.join(dataDir, "local.db"));
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
create table if not exists objectives (
  id text primary key,
  stable_code text not null unique,
  skill text not null,
  can_do_statement text not null,
  level_code text not null
);

create table if not exists units (
  id text primary key,
  title text not null,
  module_title text not null,
  level_code text not null,
  sort_order integer not null default 0
);

create table if not exists activities (
  id text primary key,
  unit_id text not null references units(id),
  step_number integer not null,
  step_name text not null,
  type text not null,
  skill text not null,
  pool text not null default 'practice',
  base_item_id text not null,
  content text not null,
  objective_ids text not null
);

create table if not exists attempts (
  id text primary key,
  activity_id text not null references activities(id),
  submitted_at text not null,
  response_text text,
  response_audio_path text,
  client_idempotency_key text not null unique
);

create table if not exists evidence_records (
  id text primary key,
  attempt_id text not null references attempts(id),
  objective_id text not null references objectives(id),
  rubric_id text not null,
  satisfactory integer not null,
  is_unaided integer not null default 0,
  is_transfer_task integer not null default 0,
  is_assessment integer not null default 0,
  critical_failure integer not null default 0,
  used_transcript integer not null default 0,
  ai_eval text,
  human_override text,
  created_at text not null
);

create table if not exists objective_status (
  objective_id text primary key references objectives(id),
  status text not null default 'insufficient_evidence',
  last_evaluated_at text
);

create table if not exists spaced_repetition_items (
  objective_id text primary key references objectives(id),
  ease_factor real not null default 2.5,
  interval_days real not null default 1,
  due_at text not null
);

create table if not exists spaced_repetition_history (
  id text primary key,
  objective_id text not null references objectives(id),
  result text not null,
  reviewed_at text not null
);

create table if not exists portfolio_items (
  id text primary key,
  kind text not null,
  storage_path text,
  linked_activity_id text references activities(id),
  linked_attempt_id text references attempts(id),
  created_at text not null
);
`);

console.log("Esquema local (SQLite) aplicado en data/local.db");
sqlite.close();

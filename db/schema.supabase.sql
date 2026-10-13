-- Esquema para Supabase (Postgres) — Etapa 2/3 tal como está REALMENTE
-- implementada hoy (ver src/db/schema.ts), no el diseño aspiracional completo
-- de Etapa 1 (ese sigue en db/schema.sql: profiles, materials, ai_sessions,
-- levels/modules/lessons como jerarquía separada, etc. — tablas para
-- funcionalidad que todavía no existe en código). Cuando se construya esa
-- funcionalidad, se amplía este esquema; no se adelanta tablas vacías ahora.
--
-- Cómo aplicar: pegar este archivo completo en el SQL Editor de tu proyecto
-- de Supabase (Dashboard → SQL Editor → New query → Run). Es seguro de
-- correr una sola vez en un proyecto nuevo.
--
-- Diferencias deliberadas frente al esquema local (src/db/schema.ts):
--   - Cada tabla de datos personales gana `user_id` (referencia a
--     auth.users) + Row Level Security, porque Supabase sí tiene usuarios
--     reales. El currículo (objectives/units/activities/diagnostic_items)
--     es compartido, sin user_id: es contenido de la app, no datos tuyos.
--   - IDs siguen siendo `text` (generados con nanoid() en la app, igual que
--     hoy) en vez de uuid — así el código de la app no cambia al migrar.
--   - jsonb en vez de texto con JSON serializado; boolean nativo en vez de
--     integer 0/1; timestamptz en vez de texto ISO.

create extension if not exists "pgcrypto";

-- ===================== Currículo (compartido, sin user_id) =====================

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
  content jsonb not null,
  objective_ids jsonb not null default '[]'
);

create table if not exists diagnostic_items (
  id text primary key,
  skill text not null,
  sort_order integer not null default 0,
  content jsonb not null
);

-- ===================== Datos personales (user_id + RLS) =====================

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_level text not null default 'C1'
    check (target_level in ('A2','B1','B2','C1','C2')),
  weekly_minutes_target integer not null default 225,
  study_days_per_week integer not null default 5,
  support_language_ratio numeric not null default 1.0
    check (support_language_ratio >= 0 and support_language_ratio <= 1),
  english_variety_preference text not null default 'general_american',
  text_size text not null default 'default' check (text_size in ('default','large','extra_large')),
  reduced_motion boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id text not null references activities(id),
  submitted_at timestamptz not null default now(),
  response_text text,
  response_audio_path text,
  client_idempotency_key text not null,
  unique (user_id, client_idempotency_key)
);

create table if not exists evidence_records (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id text not null references attempts(id) on delete cascade,
  objective_id text not null references objectives(id),
  rubric_id text not null,
  satisfactory boolean not null,
  is_unaided boolean not null default false,
  is_transfer_task boolean not null default false,
  is_assessment boolean not null default false,
  critical_failure boolean not null default false,
  used_transcript boolean not null default false,
  ai_eval jsonb,
  human_override jsonb,
  created_at timestamptz not null default now()
);

create table if not exists objective_status (
  user_id uuid not null references auth.users(id) on delete cascade,
  objective_id text not null references objectives(id),
  status text not null default 'insufficient_evidence',
  last_evaluated_at timestamptz,
  primary key (user_id, objective_id)
);

create table if not exists spaced_repetition_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  objective_id text not null references objectives(id),
  ease_factor real not null default 2.5,
  interval_days real not null default 1,
  due_at timestamptz not null default now(),
  primary key (user_id, objective_id)
);

create table if not exists spaced_repetition_history (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  objective_id text not null references objectives(id),
  result text not null,
  reviewed_at timestamptz not null default now()
);

create table if not exists portfolio_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  storage_path text,
  linked_activity_id text references activities(id),
  linked_attempt_id text references attempts(id),
  created_at timestamptz not null default now()
);

create table if not exists diagnostic_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'quick',
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists diagnostic_responses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null references diagnostic_sessions(id) on delete cascade,
  item_id text not null references diagnostic_items(id),
  response_text text not null,
  satisfactory boolean not null,
  created_at timestamptz not null default now()
);

-- ===================== Row Level Security =====================
-- El currículo (objectives/units/activities/diagnostic_items) es de lectura
-- pública para cualquier usuario autenticado (es contenido de la app, no
-- datos privados). Los datos personales solo son visibles/editables por su
-- propio dueño.

alter table objectives enable row level security;
alter table units enable row level security;
alter table activities enable row level security;
alter table diagnostic_items enable row level security;

create policy "curriculum readable by authenticated users" on objectives
  for select using (auth.role() = 'authenticated');
create policy "curriculum readable by authenticated users" on units
  for select using (auth.role() = 'authenticated');
create policy "curriculum readable by authenticated users" on activities
  for select using (auth.role() = 'authenticated');
create policy "curriculum readable by authenticated users" on diagnostic_items
  for select using (auth.role() = 'authenticated');

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles', 'attempts', 'evidence_records', 'objective_status',
    'spaced_repetition_items', 'spaced_repetition_history',
    'portfolio_items', 'diagnostic_sessions', 'diagnostic_responses'
  ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "own rows" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;

-- ===================== Storage (grabaciones de audio) =====================
-- Crear manualmente en el Dashboard (Storage → New bucket): nombre
-- "recordings", privado (no público). Política sugerida (Storage → Policies):
-- solo el dueño del archivo puede leer/escribir, usando el primer segmento
-- de la ruta como user_id, por ejemplo recordings/<user_id>/<archivo>.webm:
--
-- create policy "own recordings" on storage.objects
--   for all using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text)
--   with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);

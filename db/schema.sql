-- Esquema inicial (Postgres / Supabase) — Etapa 1 (diseño) / aplicado en Etapa 2.
-- Ver docs/04-data-model.md para la justificación de cada grupo de tablas.
-- Convención: *_at en timestamptz, ids en uuid, jsonb para estructuras flexibles
-- versionadas (rúbricas, evaluaciones de IA, config).

create extension if not exists "pgcrypto";

-- ===================== Identidad y perfil =====================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  native_language text not null default 'es',
  goals jsonb not null default '[]',
  interests jsonb not null default '[]',
  weekly_minutes_target int not null default 225, -- 45 min x 5 dias, editable
  study_days_per_week int not null default 5,
  target_date date,
  target_level text not null default 'C1'
    check (target_level in ('A2','B1','B2','C1','C2')),
  english_variety_preference text default 'general_american',
  accessibility_needs jsonb not null default '{}',
  has_microphone boolean,
  has_speaking_practice_opportunities boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  support_language_ratio numeric not null default 1.0, -- 1.0 = todo en ES, baja con el tiempo
  text_size text not null default 'default',
  reduced_motion boolean not null default false,
  daily_review_cap int not null default 30,
  monthly_ai_budget_usd numeric not null default 10.0,
  updated_at timestamptz not null default now()
);

-- ===================== Currículo (versionado) =====================

create table curriculum_versions (
  id uuid primary key default gen_random_uuid(),
  label text not null,              -- p.ej. 'v1-etapa1'
  published_at timestamptz,
  notes text
);

create table levels (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references curriculum_versions(id),
  code text not null,                -- 'pre-a1','a1','a2','b1','b2','c1','c2'
  name text not null,
  sort_order int not null
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references levels(id),
  title text not null,
  sort_order int not null
);

create table units (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id),
  title text not null,
  sort_order int not null
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id),
  title text not null,
  sort_order int not null
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id),
  type text not null,  -- 'guided_practice','unaided_retrieval','production','transfer_task',...
  skill text not null check (skill in
    ('listening','reading','writing','speaking','grammar','vocabulary','pronunciation')),
  pool text not null default 'practice' check (pool in ('practice','assessment')),
  base_item_id text not null,   -- dedup de variantes superficiales
  variant_id text not null default 'default',
  content jsonb not null,       -- enunciado, audio/texto, opciones, rubrica aplicable
  sort_order int not null
);

create table objectives (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references curriculum_versions(id),
  stable_code text not null,     -- 'A1.1.3'
  skill text not null check (skill in
    ('listening','reading','writing','speaking','grammar','vocabulary','pronunciation')),
  can_do_statement text not null,
  level_id uuid not null references levels(id),
  unique (curriculum_version_id, stable_code)
);

create table activity_objectives (
  activity_id uuid not null references activities(id) on delete cascade,
  objective_id uuid not null references objectives(id) on delete cascade,
  primary key (activity_id, objective_id)
);

-- ===================== Diagnóstico =====================

create table diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('quick','full')),
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table diagnostic_items (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id),
  skill text not null check (skill in
    ('listening','reading','writing','speaking','grammar','vocabulary','pronunciation')),
  content jsonb not null
);

create table diagnostic_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references diagnostic_sessions(id) on delete cascade,
  item_id uuid not null references diagnostic_items(id),
  response jsonb not null,
  created_at timestamptz not null default now()
);

-- ===================== Intentos y evidencia (append-only) =====================

create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id),
  submitted_at timestamptz not null default now(),
  response_text text,
  response_audio_path text,   -- ruta en bucket privado de Storage
  client_idempotency_key text not null, -- evita duplicados por reintento de sync
  unique (user_id, client_idempotency_key)
);

create table evidence_records (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  objective_id uuid not null references objectives(id),
  rubric_id text not null,
  is_unaided boolean not null default false,
  is_transfer_task boolean not null default false,
  is_assessment boolean not null default false,
  critical_failure boolean not null default false,
  used_transcript boolean not null default false,
  listening_conditions jsonb,     -- {listens_allowed, speed, transcript_available}
  ai_eval jsonb,                  -- {provider, model_version, confidence, justification}
  human_override jsonb,
  created_at timestamptz not null default now()
);

-- Vista/tabla derivada: estado por objetivo (recalculada por job de Etapa 2,
-- aplicando config_thresholds vigente). Se modela como tabla, no vista, para
-- poder registrar explícitamente 'insufficient_evidence' como estado propio.
create table objective_status (
  user_id uuid not null references profiles(id) on delete cascade,
  objective_id uuid not null references objectives(id),
  status text not null default 'insufficient_evidence'
    check (status in ('insufficient_evidence','demonstrated','not_demonstrated')),
  last_evaluated_at timestamptz,
  primary key (user_id, objective_id)
);

-- ===================== Repetición espaciada =====================

create table spaced_repetition_items (
  user_id uuid not null references profiles(id) on delete cascade,
  objective_id uuid not null references objectives(id),
  ease_factor numeric not null default 2.5,
  interval_days numeric not null default 1,
  due_at timestamptz not null default now(),
  primary key (user_id, objective_id)
);

create table spaced_repetition_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  objective_id uuid not null references objectives(id),
  result text not null check (result in ('recalled_easily','recalled_with_effort','failed')),
  reviewed_at timestamptz not null default now()
);

-- ===================== Evaluaciones de nivel =====================

create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  level_id uuid references levels(id),
  kind text not null, -- 'milestone','level_check'
  conditions jsonb not null, -- condiciones declaradas de antemano
  scheduled_at timestamptz,
  completed_at timestamptz
);

create table level_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill text not null check (skill in
    ('listening','reading','writing','speaking','grammar','vocabulary','pronunciation')),
  estimated_level text, -- null = pendiente de evaluar
  confidence text check (confidence in ('low','medium','high')),
  based_on_evidence_ids uuid[] not null default '{}',
  computed_at timestamptz not null default now()
);

create table external_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  exam_name text not null,
  result text,
  taken_at date,
  notes text
);

-- ===================== Portafolio y materiales propios =====================

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('recording','writing','corrected_version','project')),
  storage_path text,
  linked_activity_id uuid references activities(id),
  linked_attempt_id uuid references attempts(id),
  created_at timestamptz not null default now()
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source_type text not null check (source_type in ('pdf','doc','audio','url','text')),
  storage_path text,
  source_url text,
  extraction_status text not null default 'pending'
    check (extraction_status in ('pending','success','failed_inaccessible','failed_unsupported')),
  extracted_text text,
  created_at timestamptz not null default now()
);

create table generated_content (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials(id) on delete cascade,
  kind text not null check (kind in ('adapted_reading','vocabulary','questions','exercise','summary_task')),
  is_adaptation boolean not null default true,
  content jsonb not null,
  created_at timestamptz not null default now()
);

-- ===================== Tutor de IA =====================

create table ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mode text not null check (mode in ('learn','practice','assess')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references ai_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ===================== Configuración y cumplimiento =====================

create table config_thresholds (
  id uuid primary key default gen_random_uuid(),
  version int not null,
  payload jsonb not null,  -- ver docs/03-progress-and-evaluation-model.md
  activated_at timestamptz not null default now()
);

create table usage_counters (
  user_id uuid not null references profiles(id) on delete cascade,
  period text not null, -- 'YYYY-MM'
  call_type text not null check (call_type in ('llm_tutor','llm_generation','tts','stt')),
  count int not null default 0,
  estimated_cost_usd numeric not null default 0,
  primary key (user_id, period, call_type)
);

create table export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','ready','failed')),
  file_path text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ===================== Row Level Security =====================
-- Aplicar a toda tabla con user_id: solo el dueño puede leer/escribir sus filas.
-- Ejemplo (repetir por tabla en la migración real de Etapa 2):
--
-- alter table attempts enable row level security;
-- create policy "own rows" on attempts
--   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

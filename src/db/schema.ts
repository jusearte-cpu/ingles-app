import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";

/**
 * Esquema de desarrollo local (SQLite vía Drizzle), Etapa 2.
 *
 * Simplificaciones deliberadas frente a db/schema.sql (el diseño completo
 * Postgres/Supabase de Etapa 1):
 *  - Un solo usuario implícito (sin columnas user_id, sin tablas de auth):
 *    la app corre localmente para una persona. Al conectar Supabase, se migra
 *    a db/schema.sql y se recupera el aislamiento por usuario con RLS.
 *  - Jerarquía currículo→nivel→módulo reducida a lo que existe hoy (una
 *    unidad real). Se amplía en la Etapa 3 sin cambiar la forma del modelo.
 *  - jsonb -> columnas `text` con JSON serializado (SQLite no tiene jsonb).
 */

export const objectives = sqliteTable("objectives", {
  id: text("id").primaryKey(),
  stableCode: text("stable_code").notNull().unique(),
  skill: text("skill").notNull(),
  canDoStatement: text("can_do_statement").notNull(),
  levelCode: text("level_code").notNull(),
});

export const units = sqliteTable("units", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  moduleTitle: text("module_title").notNull(),
  levelCode: text("level_code").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  unitId: text("unit_id")
    .notNull()
    .references(() => units.id),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(),
  type: text("type").notNull(),
  skill: text("skill").notNull(),
  pool: text("pool").notNull().default("practice"),
  baseItemId: text("base_item_id").notNull(),
  content: text("content", { mode: "json" }).notNull(),
  objectiveIds: text("objective_ids", { mode: "json" })
    .notNull()
    .$type<string[]>(),
});

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  activityId: text("activity_id")
    .notNull()
    .references(() => activities.id),
  submittedAt: text("submitted_at").notNull(),
  responseText: text("response_text"),
  responseAudioPath: text("response_audio_path"),
  clientIdempotencyKey: text("client_idempotency_key").notNull().unique(),
});

export const evidenceRecords = sqliteTable("evidence_records", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempts.id),
  objectiveId: text("objective_id")
    .notNull()
    .references(() => objectives.id),
  rubricId: text("rubric_id").notNull(),
  // Simplificación de la Etapa 2: en el esquema completo (db/schema.sql) esto
  // se deriva del puntaje ponderado de la rúbrica dentro de ai_eval. Aquí,
  // mientras la evaluación es por reglas/mock (sin IA real conectada), se
  // guarda explícito para que el cálculo de competencia sea trazable.
  satisfactory: integer("satisfactory", { mode: "boolean" }).notNull(),
  isUnaided: integer("is_unaided", { mode: "boolean" }).notNull().default(false),
  isTransferTask: integer("is_transfer_task", { mode: "boolean" })
    .notNull()
    .default(false),
  isAssessment: integer("is_assessment", { mode: "boolean" })
    .notNull()
    .default(false),
  criticalFailure: integer("critical_failure", { mode: "boolean" })
    .notNull()
    .default(false),
  usedTranscript: integer("used_transcript", { mode: "boolean" })
    .notNull()
    .default(false),
  aiEval: text("ai_eval", { mode: "json" }),
  humanOverride: text("human_override", { mode: "json" }),
  createdAt: text("created_at").notNull(),
});

export const objectiveStatus = sqliteTable("objective_status", {
  objectiveId: text("objective_id")
    .primaryKey()
    .references(() => objectives.id),
  status: text("status").notNull().default("insufficient_evidence"),
  lastEvaluatedAt: text("last_evaluated_at"),
});

export const spacedRepetitionItems = sqliteTable("spaced_repetition_items", {
  objectiveId: text("objective_id")
    .primaryKey()
    .references(() => objectives.id),
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: real("interval_days").notNull().default(1),
  dueAt: text("due_at").notNull(),
});

export const spacedRepetitionHistory = sqliteTable(
  "spaced_repetition_history",
  {
    id: text("id").primaryKey(),
    objectiveId: text("objective_id")
      .notNull()
      .references(() => objectives.id),
    result: text("result").notNull(),
    reviewedAt: text("reviewed_at").notNull(),
  },
);

export const diagnosticSessions = sqliteTable("diagnostic_sessions", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull().default("quick"),
  status: text("status").notNull().default("in_progress"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
});

export const diagnosticItems = sqliteTable("diagnostic_items", {
  id: text("id").primaryKey(),
  skill: text("skill").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  content: text("content", { mode: "json" }).notNull(),
});

export const diagnosticResponses = sqliteTable("diagnostic_responses", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => diagnosticSessions.id),
  itemId: text("item_id")
    .notNull()
    .references(() => diagnosticItems.id),
  responseText: text("response_text").notNull(),
  satisfactory: integer("satisfactory", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const portfolioItems = sqliteTable("portfolio_items", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  storagePath: text("storage_path"),
  linkedActivityId: text("linked_activity_id").references(() => activities.id),
  linkedAttemptId: text("linked_attempt_id").references(() => attempts.id),
  createdAt: text("created_at").notNull(),
});

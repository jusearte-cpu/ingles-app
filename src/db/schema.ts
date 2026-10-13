import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  uuid,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Esquema real contra Supabase (Postgres) — reemplaza la versión SQLite de
 * desarrollo local de la Etapa 2. Debe coincidir exactamente con
 * db/schema.supabase.sql (esa es la fuente que se aplica en el SQL Editor de
 * Supabase; este archivo es lo que la app usa en tiempo de ejecución).
 *
 * Frente a la versión SQLite anterior: las tablas de datos personales ganan
 * `userId` (uuid, referencia implícita a auth.users — Drizzle no modela
 * auth.users porque Supabase lo gestiona aparte) y Row Level Security real
 * (aplicada en SQL, no aquí). El currículo (objectives/units/activities/
 * diagnosticItems) sigue sin userId: es contenido compartido, no datos tuyos.
 */

export const objectives = pgTable("objectives", {
  id: text("id").primaryKey(),
  stableCode: text("stable_code").notNull().unique(),
  skill: text("skill").notNull(),
  canDoStatement: text("can_do_statement").notNull(),
  levelCode: text("level_code").notNull(),
});

export const units = pgTable("units", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  moduleTitle: text("module_title").notNull(),
  levelCode: text("level_code").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const activities = pgTable("activities", {
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
  content: jsonb("content").notNull(),
  objectiveIds: jsonb("objective_ids").notNull().default([]).$type<string[]>(),
});

export const attempts = pgTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    responseText: text("response_text"),
    responseAudioPath: text("response_audio_path"),
    clientIdempotencyKey: text("client_idempotency_key").notNull(),
  },
  (t) => ({
    uniqueIdempotency: unique().on(t.userId, t.clientIdempotencyKey),
  }),
);

export const evidenceRecords = pgTable("evidence_records", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempts.id),
  objectiveId: text("objective_id")
    .notNull()
    .references(() => objectives.id),
  rubricId: text("rubric_id").notNull(),
  satisfactory: boolean("satisfactory").notNull(),
  isUnaided: boolean("is_unaided").notNull().default(false),
  isTransferTask: boolean("is_transfer_task").notNull().default(false),
  isAssessment: boolean("is_assessment").notNull().default(false),
  criticalFailure: boolean("critical_failure").notNull().default(false),
  usedTranscript: boolean("used_transcript").notNull().default(false),
  aiEval: jsonb("ai_eval"),
  humanOverride: jsonb("human_override"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const objectiveStatus = pgTable(
  "objective_status",
  {
    userId: uuid("user_id").notNull(),
    objectiveId: text("objective_id")
      .notNull()
      .references(() => objectives.id),
    status: text("status").notNull().default("insufficient_evidence"),
    lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.objectiveId] }) }),
);

export const spacedRepetitionItems = pgTable(
  "spaced_repetition_items",
  {
    userId: uuid("user_id").notNull(),
    objectiveId: text("objective_id")
      .notNull()
      .references(() => objectives.id),
    easeFactor: real("ease_factor").notNull().default(2.5),
    intervalDays: real("interval_days").notNull().default(1),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.objectiveId] }) }),
);

export const spacedRepetitionHistory = pgTable("spaced_repetition_history", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  objectiveId: text("objective_id")
    .notNull()
    .references(() => objectives.id),
  result: text("result").notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const diagnosticSessions = pgTable("diagnostic_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull().default("quick"),
  status: text("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const diagnosticItems = pgTable("diagnostic_items", {
  id: text("id").primaryKey(),
  skill: text("skill").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  content: jsonb("content").notNull(),
});

export const diagnosticResponses = pgTable("diagnostic_responses", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  sessionId: text("session_id")
    .notNull()
    .references(() => diagnosticSessions.id),
  itemId: text("item_id")
    .notNull()
    .references(() => diagnosticItems.id),
  responseText: text("response_text").notNull(),
  satisfactory: boolean("satisfactory").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull(),
  storagePath: text("storage_path"),
  linkedActivityId: text("linked_activity_id").references(() => activities.id),
  linkedAttemptId: text("linked_attempt_id").references(() => attempts.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

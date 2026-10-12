# 04 — Modelo de datos

Esquema relacional (Postgres / Supabase). El SQL ejecutable está en
[`db/schema.sql`](../db/schema.sql); aquí se explica el *por qué* de cada grupo de
tablas y cómo se relacionan con el modelo de progreso (`03-progress-and-evaluation-model.md`).

## Grupos de entidades

### Identidad y perfil

- `profiles` — un registro por usuario (hoy, solo tú). Guarda idioma principal,
  objetivos, intereses, tiempo disponible, fecha objetivo, variedad de inglés
  preferida, necesidades de accesibilidad, nivel meta actual (editable).
- `user_settings` — idioma de apoyo (ES↔EN, gradual), tamaño de texto, modo
  reducido de movimiento, techo diario de repasos, techo de gasto de IA.

### Currículo (versionado)

- `curriculum_versions` — cada publicación de la matriz curricular es una versión
  inmutable. Un `enrollment` queda fijado a una versión para que el denominador de
  "recorrido completado" no cambie silenciosamente.
- `levels`, `modules`, `units`, `lessons`, `activities` — jerarquía 1→N completa,
  cada una con `curriculum_version_id`.
- `objectives` — los "can-do" de `02-curriculum-matrix.md`, con `skill` (listening,
  reading, writing, speaking, grammar, vocabulary, pronunciation) y
  `stable_code` (p. ej. `A1.1.3`).
- `activity_objectives` — tabla puente N:N (una actividad puede trabajar varios
  objetivos; un objetivo se trabaja en varias actividades, incluidas las de
  repaso).

### Diagnóstico

- `diagnostic_sessions` — tipo (`quick`/`full`), estado, fecha.
- `diagnostic_items`, `diagnostic_responses` — ítems y respuestas, ligados a
  `objectives` y `skill`, para que el diagnóstico alimente el mismo modelo de
  evidencia que el resto de la app (no un sistema paralelo).

### Intentos y evidencia (el corazón del modelo de progreso)

- `attempts` — **append-only**. Cada envío (respuesta, grabación, texto) es una fila
  nueva, nunca se sobreescribe. Referencia `activity_id`, `objective_id` (vía
  `activity_objectives`), archivo o texto crudo.
- `evidence_records` — el resultado evaluado de un `attempt`: `rubric_id`,
  `is_unaided`, `is_transfer_task`, `is_assessment` (banco de evaluación vs.
  práctica), `critical_failure`, `used_transcript` (listening), `ai_eval` (JSON:
  proveedor, versión, confianza, justificación), `human_override`.
- `objective_status` — tabla derivada/calculada (o vista materializada) con
  `demonstrated`, `insufficient_evidence`, `last_evaluated_at` por objetivo y
  usuario, recalculada según los umbrales de `config/thresholds.json`.

### Repetición espaciada

- `spaced_repetition_items` — uno por objetivo o ítem de vocabulario:
  `ease_factor`, `interval_days`, `due_at`.
- `spaced_repetition_history` — cada repaso hecho (append-only), para poder auditar
  "intentos y fechas" tal como pide el encargo.

### Evaluaciones de nivel y estimación

- `assessments` — evaluaciones formales (de nivel o de hito), con condiciones
  declaradas (escuchas permitidas, transcripción disponible, tiempo límite).
- `level_estimates` — una fila por habilidad y fecha de cálculo: `skill`,
  `estimated_level`, `confidence`, `based_on_evidence_ids[]`.
- `external_certifications` — registro opcional de resultados externos (sección 7
  del encargo), independiente del cálculo interno.

### Portafolio y materiales propios

- `portfolio_items` — grabaciones, escritos y versiones corregidas, enlazadas a la
  actividad/evaluación de origen, para poder "comparar trabajos anteriores y
  recientes".
- `materials` — documentos/audio subidos por ti: `source_type`, `extraction_status`
  (si no se pudo acceder/procesar, se registra así explícitamente, nunca se asume
  éxito), `extracted_text` (visible para verificación).
- `generated_content` — lo derivado de `materials` (lecturas adaptadas, preguntas,
  vocabulario contextual), marcado `is_adaptation = true` y enlazado al material
  original, para distinguir siempre original de generado.

### Tutor de IA

- `ai_sessions` — una por conversación con el tutor, con `mode`
  (`learn`/`practice`/`assess`) — en modo `assess` las ayudas quedan
  deshabilitadas por diseño.
- `ai_messages` — mensajes de la conversación (saneados antes de registrar: nunca
  se guardan claves ni datos sensibles).

### Configuración y cumplimiento

- `config_thresholds` — versión activa de los umbrales de `03-progress-and-evaluation-model.md`,
  como JSON versionado.
- `usage_counters` — consumo mensual de IA por tipo de llamada, para el techo de
  gasto.
- `export_requests`, `deletion_requests` — solicitudes de exportación/borrado de
  datos, con estado y fecha, cumpliendo la sección 12 del encargo.

## Reglas de integridad clave

- Ninguna tabla de evidencia (`attempts`, `evidence_records`,
  `spaced_repetition_history`) permite `UPDATE` ni `DELETE` de filas existentes a
  nivel de aplicación (solo `INSERT`) — es la base técnica de "el progreso sobrevive
  y no se pisa entre dispositivos" (`01-architecture.md`).
- Row Level Security en todas las tablas de usuario: cada fila solo es visible para
  su `user_id` (preparado para más de un perfil en el futuro, aunque hoy solo exista
  el tuyo).
- Todo archivo (`materials`, `portfolio_items`) guarda `storage_path` a un bucket
  privado, nunca una URL pública directa.

# 06 — Hoja de ruta por etapas

Las etapas son una **estrategia de construcción**, no un permiso para declarar el
proyecto terminado tras el prototipo. Ningún nivel se marca como completo hasta que
tenga contenido real, evaluaciones reales y haya pasado los criterios de aceptación
de la sección 15 del encargo. Niveles aún no implementados se marcan explícitamente
como **pendientes** en la interfaz — nunca con pantallas vacías, cifras ficticias o
botones sin función.

## Etapa 1 — Diseño verificable (✅ completa en esta sesión)

Entregables: `01-architecture.md`, `02-curriculum-matrix.md`,
`03-progress-and-evaluation-model.md`, `04-data-model.md` + `db/schema.sql`,
`05-screens-and-ux.md`, este documento. Verificación: cada documento es consistente
con los demás (mismos nombres de entidades, mismos indicadores); la unidad de
ejemplo en `02-curriculum-matrix.md` prueba que el modelo de 10 pasos es
implementable con el esquema de `04-data-model.md`.

## Etapa 2 — Recorrido funcional de una unidad

**Estado: 🟡 en curso.** Lo siguiente ya funciona de extremo a extremo en local
(probado manualmente paso a paso en el navegador, con reinicio del servidor para
confirmar persistencia real en `data/local.db`):

- ✅ Proyecto Next.js + TypeScript + Tailwind, corriendo local (`npm run dev`).
- ✅ Una unidad completa (A1.1.1 "Nice to meet you") con los 10 pasos, cubriendo
  listening (TTS del navegador), reading/writing, grammar, y speaking por texto.
- ✅ Entrega de evidencias reales (`attempts` + `evidence_records`, append-only) y
  cálculo honesto de estado por objetivo (`insufficient_evidence` / `demonstrated` /
  `not_demonstrated`) — verificado: completar los 10 pasos dio 100% de "recorrido
  completado" pero 0% de "competencias demostradas", exactamente como exige el
  encargo.
- ✅ Repaso programado (SM-2 simplificado) y pantalla de Repaso con techo diario.
- ✅ Progreso persistente: sobrevive a un reinicio del servidor (SQLite en disco).
- ✅ Adaptador de IA en modo mock, etiquetado explícitamente en pantalla ("⚠
  Revisión automática por reglas (sin IA real)").

**Añadido en una segunda pasada de la Etapa 2** (probado en el navegador):
- ✅ Diagnóstico rápido (7 ítems: reading, listening, grammar, vocabulary,
  writing), banco separado del de práctica/evaluación de la unidad. Speaking
  queda explícitamente "pendiente de evaluar" — nunca inferido de respuestas
  escritas. Entrada desde `/today` y ruta `/diagnostic`.
- ✅ Grabación de audio real (speaking) vía `MediaRecorder` + ruta
  `/api/recordings`, con reproducción para auto-comparación. Si se envía solo
  audio (sin texto), se guarda en el portafolio pero **no** se crea evidencia
  automática de competencia — no hay transcripción conectada para evaluarlo de
  forma fiable (ver `docs/01-architecture.md`). Nota: el entorno de pruebas de
  este asistente bloquea el acceso real al micrófono, así que esta función se
  probó por código y por el camino de error (sin micrófono); falta que el
  propio usuario la pruebe con un micrófono real.
- ✅ Pantalla de Portafolio (`/portfolio`) listando grabaciones guardadas.
- ✅ Exportar datos (`/api/export`, JSON con currículo + evidencia + progreso) y
  eliminar datos (`/settings`, borra evidencia/intentos/portafolio/diagnósticos
  pero no el contenido del curso) — ambos probados en el navegador.

**Pendiente dentro de la Etapa 2** (no bloquea lo anterior, pero falta para
considerarla terminada):
- Diagnóstico **completo** (versión larga en varias sesiones) — solo existe la
  versión rápida.
- Autenticación real — hoy es de un solo usuario implícito, sin pantalla de login
  (ver nota de alcance en `docs/decisions-log.md`). Llega con la conexión a
  Supabase Auth.
- Evaluación de nivel mínima formal (hoy solo hay práctica, no un banco de
  evaluación separado para esta unidad — el diagnóstico sí usa un banco propio).
- Migración de `drizzle-kit push` real: se detectó un bug de `drizzle-kit@0.24.2`
  contra `better-sqlite3` en este entorno (falla con "This statement does not
  return data"); se resolvió con DDL manual en `src/db/migrate.ts`. Si se actualiza
  `drizzle-kit` más adelante, vale la pena reintentar `db:push` y simplificar.

**Dependencias:** ninguna externa obligatoria (modo local/mock, ya construido). Para
sincronización real entre dispositivos y tutor de IA real se necesita lo descrito en
`docs/decisions-log.md` (cuentas de Supabase/Vercel, clave de Anthropic).

**Criterios de aceptación de la sección 15 ya verificados:** 2 (persistencia tras
reinicio), 3 (actividades reales, no de relleno), 4 (grabaciones se guardan y
recuperan — portafolio probado), 5 (porcentajes de registros reales), 6 (completado
≠ demostrado, verificado explícitamente), 7 (sin evidencia oral automática no se
inventa nivel de speaking, ni en el diagnóstico ni en la unidad), 8 (repasos desde
intentos reales), 9 (condiciones de escucha declaradas, banco de diagnóstico
separado del de práctica), 12 (exportar probado), 13 (progreso explicado con
evidencia, no inventado). Pendientes: 1 (multi-dispositivo real — necesita
Supabase), 10 (privacidad de archivos — hoy el filesystem local no tiene control de
acceso propio, depende de que el servidor sea solo tuyo; con Supabase Storage se
resuelve con URLs firmadas), 11 (manejo de errores de red/servicios externos — no
se ha probado con un proveedor de IA real todavía).

## Etapa 3 — Fundamentos, A1 y A2

Contenido y evaluaciones completas de Pre-A1, A1 y A2 según
`02-curriculum-matrix.md`, probando cobertura (script de verificación de objetivos
sin actividad/evaluación) y funcionamiento real con usuarios de prueba (tú).

## Etapa 4 — B1 y B2

Amplía escenarios, complejidad y práctica comunicativa. B2 se entrega con especial
atención porque es el **hito de autonomía** del programa: todos los criterios de
evidencia de B2 deben estar implementados y probados, no solo el contenido.

## Etapa 5 — C1 y consolidación

Completa el **objetivo principal** del programa. Incluye portafolio maduro, tareas
avanzadas de mediación/argumentación, y el ciclo completo de comprobaciones de
retención (no solo evaluación inmediata).

## Etapa 6 — Ampliaciones (opcional, a tu decisión)

C2 y/o rutas profesionales (inglés técnico, de negocios, académico) como módulos
electivos sobre la base C1. Se activa solo si decides extender el objetivo más allá
de C1 (`profiles.target_level`).

## Dependencias entre etapas

```
Etapa 1 (diseño) ──> Etapa 2 (una unidad funcional) ──> Etapa 3 (A1-A2)
                                                      └─> Etapa 4 (B1-B2) ──> Etapa 5 (C1) ──> Etapa 6 (opcional)
```

Etapa 2 es el bloqueo real: hasta que el recorrido de una unidad funcione de extremo
a extremo (incluida la sincronización entre dispositivos si ya tienes cuenta de
Supabase), no tiene sentido producir contenido en volumen para A1-C1 — se
replicaría cualquier defecto estructural a cientos de unidades.

## Qué hacer si el trabajo cruza varias sesiones

Este repositorio **es** la memoria del proyecto. Antes de cerrar cualquier sesión de
trabajo sobre esta app, se actualiza:

- Este archivo (`06-roadmap.md`): qué etapa está en curso, qué quedó a medias.
- `decisions-log.md`: cualquier supuesto nuevo tomado o decisión pendiente que haya
  surgido.
- Si hay código: el estado debe quedar en un estado que corra (`npm run build` sin
  errores) antes de parar, o explícitamente marcado como roto con la razón.

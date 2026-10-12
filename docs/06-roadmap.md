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

**Añadido en una tercera pasada** (probado en el navegador):
- ✅ Banco de evaluación separado del de práctica: 3 ítems de "Comprobación de
  nivel A1.1" (`pool = 'assessment'`), con enunciados nuevos (no los mismos ítems
  de práctica con nombres cambiados), una sola oportunidad por ítem, condiciones
  declaradas, y evidencia marcada `is_assessment = true`. Pantalla nueva
  `/assessments`. Corregí de paso un bug real: `isAssessment` estaba *hardcodeado*
  a `false` en `record-evidence.ts` — nunca se habría distinguido evaluación de
  práctica hasta ahora.
- ✅ El motor dejó de estar atado a una sola unidad (`UNIT_ID` hardcodeado): Hoy,
  Mapa y Progreso ahora recorren todas las unidades sembradas, agrupan por
  nivel/módulo, y recomiendan el siguiente paso pendiente en orden de nivel.
- ✅ Corregido un problema real de layout: con más de 4 pantallas, la barra
  inferior en móvil se desbordaba y "Portafolio"/"Config" quedaban inaccesibles.
  Ahora hay 4 accesos fijos + un menú "Más" (tal como estaba diseñado en
  `05-screens-and-ux.md`, sección de navegación, pero no implementado hasta ahora).

**Pendiente dentro de la Etapa 2** (no bloquea lo anterior, pero falta para
considerarla terminada):
- Diagnóstico **completo** (versión larga en varias sesiones) — solo existe la
  versión rápida.
- Autenticación real — hoy es de un solo usuario implícito, sin pantalla de login
  (ver nota de alcance en `docs/decisions-log.md`). Llega con la conexión a
  Supabase Auth.
- Migración de `drizzle-kit push` real: se detectó un bug de `drizzle-kit@0.24.2`
  contra `better-sqlite3` en este entorno (falla con "This statement does not
  return data"); se resolvió con DDL manual en `src/db/migrate.ts`. Si se actualiza
  `drizzle-kit` más adelante, vale la pena reintentar `db:push` y simplificar.

**Dependencias:** ninguna externa obligatoria (modo local/mock, ya construido). Para
sincronización real entre dispositivos y tutor de IA real se necesita lo descrito en
`docs/decisions-log.md` (cuentas de Supabase/Vercel, clave de Anthropic).

## Preparación de nube (adelantado de Etapa 2, no bloqueado por cuentas)

Todo lo que se podía construir sin credenciales reales ya está listo, probado en
cuanto a que no rompe el modo local (build limpio, middleware es no-op sin
Supabase configurado):

- `db/schema.supabase.sql` — esquema Postgres real (con `user_id` + Row Level
  Security) derivado exactamente del esquema SQLite actual, no del diseño
  aspiracional de Etapa 1.
- `src/lib/supabase/` (cliente de navegador y de servidor) + `src/middleware.ts`
  (refresca sesión, no-op sin credenciales) + `/login` (enlace mágico, sin
  contraseña) + `/auth/callback`.
- `scripts/migrate-to-supabase.ts` — lleva el progreso local a Supabase una vez
  exista el proyecto. **Sin probar contra un proyecto real** (no hay forma de
  probarlo sin credenciales) — revisar antes de correr.
- `docs/SETUP-CLOUD.md` — guía paso a paso de lo único que falta: las cuentas.

**Explícitamente NO hecho todavía:** mover la lectura/escritura de datos de
SQLite a Postgres. Es un cambio mecánico pero que necesita un proyecto real
contra el cual probarse antes de darse por bueno — escribirlo a ciegas sería
aparentar una integración que no se verificó, justo lo que este proyecto existe
para evitar.

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

**Estado: 🟡 iniciada, lejos de completa.** La matriz curricular completa de
`02-curriculum-matrix.md` para Pre-A1, A1 y A2 pide, en total, 11 módulos con
varias unidades cada uno. Lo que existe hoy, con contenido real (no relleno) y
probado en el navegador:

- Pre-A1 · Módulo 1 · Unidad 1 — "Hello! Spelling and numbers" (alfabeto,
  deletreo, números 0-20, saludos, primera introducción de "pedir repetición").
- A1 · Módulo 1 · Unidad 1 — "Nice to meet you" (presentarse, origen).
- A1 · Módulo 1 · Unidad 2 — "My daily routine" (presente simple, rutinas,
  frecuencia).
- A2 · Módulo 1 · Unidad 1 — "Last weekend" (pasado simple, narración,
  conectores).

Eso es **4 unidades de las ~20-30 que tendría Pre-A1-A2 completo** según la
matriz. Las unidades reciclan deliberadamente el objetivo "pedir que me
repitan" (introducido en Pre-A1, retomado como transferencia en las otras 3
unidades, en contextos distintos cada vez) — es una prueba real de que el
reciclaje y la complejidad creciente que pide el encargo funcionan con el motor
actual, no solo una promesa de diseño.

**Lo que falta para que la Etapa 3 esté realmente completa** (no es poco —
dimensiona la magnitud real del trabajo, no una lista corta):
- El resto del Módulo 1 y los Módulos 2-4 de A1 (vivienda, comida, tecnología
  cotidiana, trabajo simple, según `02-curriculum-matrix.md`).
- Los Módulos 2-5 de A2 (viajes, salud, restaurante, planes, tecnología).
- El resto de Pre-A1 (Módulo 2).
- Evaluaciones de nivel formales por módulo/nivel (hoy solo existe una
  comprobación de ejemplo para A1.1).
- El script de verificación de cobertura (`docs/02-curriculum-matrix.md`
  promete uno que detecte objetivos sin actividad/evaluación) — todavía no
  existe como script ejecutable, solo como mecanismo de diseño.

Autoría de contenido de este tipo (diálogos, gramática en contexto,
pronunciación, tareas) es trabajo genuinamente artesanal — no se puede generar
en bloque sin revisar cada unidad. A este ritmo, completar Pre-A1-A2 es muchas
sesiones más de trabajo, no algo que quepa en una sola continuación.

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

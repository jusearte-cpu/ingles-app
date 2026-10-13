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

## Nube: desplegado y verificado en producción

**Estado: ✅ completo**, no solo preparado. El motor se migró por completo de
SQLite local a Postgres/Supabase, con autenticación real, y quedó desplegado
en una dirección pública:

- Base de datos: Supabase (Postgres), esquema `db/schema.supabase.sql` (con
  `user_id` + Row Level Security) aplicado y en uso real.
- Autenticación: enlace mágico (sin contraseña) vía `src/lib/supabase/`,
  `src/middleware.ts`, `/login`, `/auth/callback` — **probado con éxito en
  producción**, no solo en local.
- Todas las páginas protegidas (`/today`, `/map`, `/progress`, `/review`,
  `/assessments`, `/portfolio`, `/settings`, `/diagnostic`, `/lesson/[id]`) y
  sus server actions escriben y leen con el `user_id` real de la sesión
  (`src/lib/auth.ts`, `requireUserId()`), no de un usuario implícito.
- Grabaciones de audio: bucket privado de Supabase Storage, URLs firmadas para
  reproducir en el portafolio.
- App en vivo: **https://ingles-app-chi.vercel.app**, desplegada desde
  `github.com/jusearte-cpu/ingles-app` vía Vercel.
- `scripts/migrate-to-supabase.ts` se retiró: no había progreso real de
  usuario en SQLite que mereciera migrarse (solo datos de prueba generados
  durante el desarrollo), así que no tenía sentido mantener un script sin usar.

Varios problemas reales aparecieron en el camino (conexión IPv6 vs. pooler,
ubicación de `middleware.ts`, ejecución de código en tiempo de build de
Vercel, límite de envío de correos de Supabase, entre otros) — documentados
en detalle en [`docs/SETUP-CLOUD.md`](SETUP-CLOUD.md) para no repetir la
misma depuración si se hace de nuevo en otro proyecto.

**Criterios de aceptación de la sección 15 ya verificados:** 2 (persistencia tras
reinicio), 3 (actividades reales, no de relleno), 4 (grabaciones se guardan y
recuperan — portafolio probado), 5 (porcentajes de registros reales), 6 (completado
≠ demostrado, verificado explícitamente), 7 (sin evidencia oral automática no se
inventa nivel de speaking, ni en el diagnóstico ni en la unidad), 8 (repasos desde
intentos reales), 9 (condiciones de escucha declaradas, banco de diagnóstico
separado del de práctica), 12 (exportar probado), 13 (progreso explicado con
evidencia, no inventado), 1 (multi-dispositivo real: app desplegada en
https://ingles-app-chi.vercel.app, login probado con éxito desde el navegador,
no solo en local), 10 (privacidad de archivos: grabaciones en bucket privado
de Supabase Storage con URLs firmadas, ya no en un filesystem local sin
control de acceso propio). Pendiente: 11 (manejo de errores de red/servicios
externos — no se ha probado con un proveedor de IA real todavía, solo con
Supabase, que sí se probó incluyendo sus fallos reales: límite de envío de
correos, IPv6, etc. — ver docs/SETUP-CLOUD.md).

## Etapas 3-5 — Hito: los 31 módulos de Pre-A1 a C1 tienen contenido real

**Estado: ✅ cobertura completa de amplitud · 🟡 profundidad parcial.**

`02-curriculum-matrix.md` diseña 31 módulos en total (Pre-A1: 2, A1: 4, A2: 5,
B1: 6, B2: 7, C1: 7). A partir de esta sesión, **los 31 tienen al menos una
unidad real** (10 pasos, diálogos propios, gramática en contexto, tarea
comunicativa, evidencia evaluable) — no solo el primer módulo de cada nivel.
32 unidades en total (A1 Módulo 1 tiene 2), 130 objetivos, 355 actividades.

El objetivo "pedir que me repitan/aclaren" se recicló **32 veces** cruzando
los 6 niveles: empieza como "Can you repeat that?" en Pre-A1 y termina como
"Could you clarify/elaborate/rephrase?" en C1 — mismo objetivo comunicativo
subyacente, registro y naturalidad creciendo con el nivel. Es la prueba más
directa de que el reciclaje y la complejidad creciente que pide el encargo
funcionan con el motor real, no son solo una promesa de diseño.

**Qué significa exactamente "cobertura completa de amplitud, profundidad
parcial"** — para que quede clarísimo y no se confunda con "curso completo":
cada uno de los 31 módulos tiene 1 unidad; un módulo maduro según la matriz
curricular tendría 2-4. Es la diferencia entre un mapa con todas las ciudades
marcadas (amplitud) y carreteras pavimentadas entre todas ellas (profundidad).
Lo primero ya está. Lo segundo es, honestamente, muchas sesiones más de
autoría — no algo que cupiera en esta continuación sin sacrificar calidad.

**Lo que falta para "completo" en el sentido pleno:**
- 2-3 unidades adicionales por módulo (de las 31) para alcanzar la densidad
  real de la matriz — el trabajo más grande y más lento, porque es autoría
  genuina, no generación en bloque (eso es justo lo que el encargo pide
  evitar en su sección 13).
- Evaluaciones de nivel formales por módulo (hoy solo hay 3 ítems de ejemplo
  para A1.1 — `npm run check:coverage` lo confirma: 127 de 130 objetivos
  todavía sin evaluación formal, aunque sí con práctica real).
- Portafolio maduro y comprobaciones de retención reales — estas últimas
  necesitan que pase tiempo de verdad usándola (el intervalo de 10+ días
  entre evidencia y comprobación diferida no se puede simular honestamente).

**Herramienta nueva:** [`scripts/check-coverage.ts`](../scripts/check-coverage.ts)
(`npm run check:coverage`) — el script de verificación de cobertura prometido
en `02-curriculum-matrix.md`, ya construido y corrido contra la base real
después de cada lote de unidades: 0 objetivos sin ninguna actividad, en los
130 que existen hoy.

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

# Inglés — app personal de aprendizaje integral

Aplicación personal (un solo usuario: Sebastián) para aprender inglés de Pre-A1 a C1,
con ampliación opcional a C2. Prioriza evidencia real de comprensión, producción e
interacción por encima de puntos, rachas o porcentajes de "contenido visto".

## Estado del proyecto

- **Etapa 1** — diseño verificable: ✅ completa (ver `docs/`).
- **Etapa 2** — recorrido funcional: ✅ esencialmente completa.
  Diagnóstico rápido, grabación de audio, portafolio, banco de evaluación
  separado del de práctica, exportar/eliminar datos — todo probado. Pendiente:
  diagnóstico largo (varias sesiones).
- **Conexión a la nube (Supabase + Vercel):** ✅ **desplegado y verificado en
  producción** — ya no es solo código preparado. Base de datos real en
  Supabase (Postgres), login por enlace mágico funcionando, app pública en
  **https://ingles-app-chi.vercel.app**. Ver [`docs/SETUP-CLOUD.md`](docs/SETUP-CLOUD.md)
  para el detalle de cómo quedó configurado y los problemas reales que
  aparecieron en el camino (vale la pena leerlo antes de repetir esto en otro
  proyecto).
- **12 unidades reales en 6 niveles** (Pre-A1 → C1), 50 objetivos, 135
  actividades — el arco completo del programa existe en forma de muestra, de
  lo más básico (deletrear, colores) hasta lo más avanzado construido hasta
  ahora (matización, ironía, estructuras de énfasis en C1). El objetivo
  "pedir que me repitan/aclaren" se recicla **12 veces** cruzando los 6
  niveles, con el registro subiendo de "repeat that" (Pre-A1) a "could you
  clarify/elaborate" (B2-C1) — prueba real de reciclaje y complejidad
  creciente, no solo diseño.
  - **Etapa 3** (Pre-A1/A1/A2): 7 unidades en 2-3 módulos cada nivel.
  - **Etapa 4** (B1/B2): 2 unidades de B1, 1 de B2 (el hito de autonomía).
  - **Etapa 5** (C1): 1 unidad (el objetivo principal del programa).
  - **Etapa 6** (C2): sin empezar (es la ampliación opcional).
  - Sigue siendo una fracción pequeña de cada nivel completo según
    `02-curriculum-matrix.md` (cada nivel real tendría 20-30+ unidades) — ver
    `docs/06-roadmap.md` para el detalle exacto, sin inflar.
- **Costo:** ✅ cero, de forma permanente y por decisión explícita — ver
  `docs/decisions-log.md`. El tutor de IA es un simulador basado en reglas
  (no un modelo de pago), la voz es la del navegador, sin transcripción ni
  evaluación de pronunciación automáticas.
- Ver [`docs/06-roadmap.md`](docs/06-roadmap.md) para el plan completo por etapas y
  [`docs/decisions-log.md`](docs/decisions-log.md) para supuestos tomados y decisiones
  pendientes.

## Cómo correr en local

Requiere un `.env.local` con las credenciales de Supabase (ver
`docs/SETUP-CLOUD.md` y `.env.example`) — la app ya no corre contra SQLite,
lee y escribe directo en Postgres (Supabase).

```bash
npm install
npm run db:seed   # siembra las unidades de ejemplo + banco de diagnóstico/evaluación en Postgres
npm run dev       # http://localhost:3000
```

Sin `ANTHROPIC_API_KEY` configurada, el tutor de IA usa un proveedor *mock* basado
en reglas, siempre etiquetado como tal en pantalla (nunca se presenta como una
evaluación de IA real). Ver `.env.example` y `docs/01-architecture.md`.

**Notas operativas:**
- No corras `npm run build` mientras `npm run dev` está activo en este mismo
  proyecto — ambos escriben en `.next/` y pueden corromper el caché (síntoma:
  500 "Cannot find module './vendor-chunks/...'"). Si pasa, `rm -rf .next` y
  reinicia `npm run dev`.
- Los scripts (`db:seed`) corren con `tsx --env-file=.env.local`, no con
  `next`, así que necesitan ese flag para cargar las variables de entorno —
  ya está así en `package.json`.

## Mapa de la documentación de diseño

| Documento | Contenido |
|---|---|
| [`docs/00-interpretation-and-scope.md`](docs/00-interpretation-and-scope.md) | Interpretación del encargo, alcance, qué mide la app y qué NO promete |
| [`docs/01-architecture.md`](docs/01-architecture.md) | Stack técnico, integraciones de IA, privacidad, offline/sync |
| [`docs/02-curriculum-matrix.md`](docs/02-curriculum-matrix.md) | Matriz curricular Pre-A1 → C1, estructura módulo/unidad, ejemplo de unidad completa |
| [`docs/03-progress-and-evaluation-model.md`](docs/03-progress-and-evaluation-model.md) | Fórmulas de progreso, umbrales de competencia, repetición espaciada, rúbricas |
| [`docs/04-data-model.md`](docs/04-data-model.md) | Modelo de datos y esquema SQL (`db/schema.sql`) |
| [`docs/05-screens-and-ux.md`](docs/05-screens-and-ux.md) | Pantallas, navegación, accesibilidad, idioma de apoyo |
| [`docs/06-roadmap.md`](docs/06-roadmap.md) | Etapas 1–6, dependencias, criterios de aceptación |
| [`docs/decisions-log.md`](docs/decisions-log.md) | Supuestos reversibles tomados y decisiones que sí requieren tu input |
| [`docs/SETUP-CLOUD.md`](docs/SETUP-CLOUD.md) | Pasos exactos para activar Supabase + Vercel (10-15 min de tu parte) |

## Cómo retomar el trabajo en una sesión nueva

Todo el estado de diseño vive en archivos de este repositorio, no en la conversación.
Para continuar: lee `docs/06-roadmap.md` (qué sigue) y `docs/decisions-log.md`
(qué está pendiente de decidir), y continúa desde ahí.

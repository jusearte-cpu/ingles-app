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

**Qué incluye:**
- Proyecto Next.js + TypeScript inicializado, conectado a Supabase (local o
  proyecto gratuito).
- Autenticación (un usuario).
- Diagnóstico rápido (versión corta, ~15-20 min) funcionando de principio a fin.
- Una unidad completa (la de ejemplo: A1.1.1 "Nice to meet you") con las cuatro
  habilidades principales, los 10 pasos, entrega de evidencias reales.
- Corrección (rúbrica real para esa unidad), repaso programado, una evaluación de
  nivel mínima.
- Progreso persistente: cerrar sesión y volver desde otro navegador/dispositivo
  debe mostrar el mismo estado.
- Adaptadores de IA en modo mock si no hay credenciales, claramente etiquetado en
  pantalla.

**Dependencias:** ninguna externa obligatoria para empezar (modo local/mock). Para
probar sincronización real entre dispositivos vas a necesitar el proyecto de
Supabase creado por ti (ver `01-architecture.md`).

**Criterios de aceptación específicos (subconjunto de la sección 15 del encargo):**
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13.

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

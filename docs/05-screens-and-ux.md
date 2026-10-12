# 05 — Pantallas y experiencia de uso

## Principio de reuso

Las pantallas de habilidad (Listening, Speaking, Reading, Writing, Gramática y
vocabulario) **no tienen contenido propio**: son vistas filtradas sobre las mismas
`activities`/`objectives` del mapa del curso, filtradas por `skill`. Esto evita el
riesgo explícito del encargo: "duplicaciones inconsistentes" entre el curso y las
áreas de habilidad. Una actividad de listening dentro de una lección del mapa es *la
misma fila* que aparece si entras por la pestaña Listening.

## Inventario de pantallas

| Pantalla | Ruta (Etapa 2+) | Responsabilidad |
|---|---|---|
| Inicio / Hoy | `/today` | Responde qué, para qué, cuánto tiempo, qué evidencia — ver abajo |
| Diagnóstico y perfil | `/onboarding`, `/diagnostic` | Alta inicial, diagnóstico corto/completo |
| Mapa del curso | `/map` | Nivel → módulo → unidad, con estado (no iniciado/en curso/completado/demostrado) |
| Lecciones | `/lesson/[id]` | Los 10 pasos de la unidad (ver `02-curriculum-matrix.md`) |
| Listening | `/skills/listening` | Vista filtrada por skill |
| Speaking y conversación | `/skills/speaking` | Vista filtrada + tutor de IA en modo conversación |
| Reading | `/skills/reading` | Vista filtrada |
| Writing | `/skills/writing` | Vista filtrada + ciclo borrador→feedback→revisión |
| Gramática y vocabulario | `/skills/grammar-vocab` | Vista filtrada |
| Repasos | `/review` | Cola de repetición espaciada del día, con techo diario visible |
| Evaluaciones | `/assessments` | Comprobaciones diferidas, evaluaciones de nivel, condiciones declaradas |
| Capacidades demostradas | `/can-do` | Lista de objetivos `demonstrated` con la evidencia que los respalda |
| Progreso | `/progress` | Los 5 indicadores de `03-progress-and-evaluation-model.md`, explicados |
| Biblioteca | `/library` | Materiales propios cargados + contenido derivado |
| Portafolio | `/portfolio` | Grabaciones/escritos comparables en el tiempo |
| Configuración | `/settings` | Perfil, objetivo de nivel, idioma de apoyo, accesibilidad, exportar/eliminar datos |

## "Hoy": el contrato con cada sesión

Toda tarjeta en `/today` responde, sin excepción, estas cuatro preguntas antes de
que el usuario la abra:

1. **Qué debo hacer** (título claro de la actividad/tarea).
2. **Para qué me sirve** (objetivo comunicativo en una línea, p. ej. "para poder
   explicar un malentendido en una llamada").
3. **Cuánto tiempo aproximadamente** (duración estimada en minutos).
4. **Qué evidencia produciré** (p. ej. "una grabación de 1 minuto" / "un repaso
   registrado").

Duraciones de sesión disponibles: **15 / 30 / 45 / 60 / 90 minutos**. Una sesión
corta puede ser la continuación de una secuencia ya empezada; nunca se presenta como
si cubriera todo lo pendiente.

### Orden de prioridad del contenido del día

1. Repasos vencidos (hasta el techo diario configurado).
2. Necesidades detectadas (errores recurrentes, habilidad rezagada).
3. Avance curricular nuevo.

Si el repaso pendiente excede el tiempo disponible, se muestra explícitamente cuánto
queda en cola — nunca bloquea el 100% del tiempo disponible para contenido nuevo (ver
regla de techo diario en `03-progress-and-evaluation-model.md`).

## Navegación

- **Móvil:** barra inferior con 4 accesos (Hoy, Mapa, Progreso, Más) + menú "Más"
  para el resto de pantallas. Controles táctiles de tamaño cómodo (mínimo 44×44pt),
  texto legible sin zoom.
- **Escritorio/tablet:** barra lateral con todas las pantallas visibles.
- El mapa del curso y las pantallas de habilidad comparten los mismos componentes de
  "tarjeta de actividad" y "estado de objetivo" — un solo componente, no una copia
  por pantalla.

## Idioma de apoyo

- Arranca con instrucciones de interfaz y del tutor mayoritariamente en español.
- `user_settings.support_language_ratio` baja gradualmente según el nivel estimado
  (regla simple en Etapa 2: cada hito de nivel superado reduce el español de
  interfaz un escalón), y es **ajustable manualmente en cualquier momento** desde
  Configuración — nunca una progresión forzada.

## Accesibilidad

- Tamaño de texto ajustable, independiente del zoom del sistema.
- Subtítulos/transcripción disponibles en todo audio (sujeto a las condiciones
  declaradas en evaluaciones, ver `03-progress-and-evaluation-model.md`).
- Contraste mínimo AA, modo de movimiento reducido.
- Navegable por teclado en la versión web de escritorio.
- Los apoyos usados (velocidad, transcripción, repeticiones) quedan registrados como
  parte de la evidencia, no ocultos.

## Gamificación: secundaria, nunca al centro

Si existen rachas o puntos, aparecen en una esquina pequeña de `/today`, nunca en la
pantalla de Progreso ni compitiendo visualmente con las "capacidades demostradas". La
jerarquía visual de `/progress` siempre pone primero: capacidades demostradas →
retención → recorrido completado. Nunca al revés.

## Qué pasa si falta evidencia (regla de interfaz, no solo de datos)

Ninguna pantalla muestra un número inventado. Si falta evidencia para un cálculo, el
texto literal es **"evidencia insuficiente"** o **"pendiente de evaluar"** (según
corresponda), con un enlace a "¿cómo consigo evidencia para esto?" que lleva a la
actividad relevante.

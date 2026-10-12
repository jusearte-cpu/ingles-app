# 03 — Modelo de progreso y evaluación

Este documento define, con fórmulas concretas, los cinco indicadores de la sección 7
del encargo, los umbrales de "competencia demostrada" de la sección 8, el algoritmo de
repetición espaciada de la sección 6, y la separación entre banco de práctica y banco
de evaluación.

**Regla general:** todo umbral aquí es una **decisión de producto ajustable**, versionada
en `config/thresholds.json`, y se presenta siempre como tal en la interfaz — nunca como
un punto de corte oficial del MCER.

## 1. Los cinco indicadores

### 1.1 Recorrido completado

```
recorrido_completado = actividades_obligatorias_completadas / actividades_obligatorias_del_itinerario_vigente
```

- "Itinerario vigente" = la ruta curricular que corresponde a tu objetivo de nivel
  actual, fijada a una versión de currículo (`curriculum_version_id`) en el momento de
  inscribirte en ese itinerario.
- Si el currículo cambia de versión después, tu denominador **no cambia
  silenciosamente**: se te ofrece explícitamente "migrar" al itinerario nuevo (lo que
  sí recalcula el denominador, con aviso) o seguir en el vigente.

### 1.2 Competencias demostradas

```
competencias_demostradas = objetivos_del_nivel_que_cumplen_criterio_de_evidencia / objetivos_totales_del_nivel
```

- "Cumplen criterio de evidencia" = pasan los umbrales de la sección 2 de este
  documento. Esto es intencionalmente más exigente que "actividad completada".

### 1.3 Retención reciente

```
retención_reciente = resultado_de_comprobaciones_diferidas_en_ventana / comprobaciones_diferidas_programadas_en_ventana
```

- Ventana configurable (por defecto, últimas 8 semanas).
- Se muestra siempre junto a **n** (cuántas comprobaciones hay) y la **fecha** de la
  más reciente.
- Si `n = 0`: la interfaz muestra literalmente **"evidencia insuficiente"**, nunca un
  0% ni un guion que sugiera "cero retención".

### 1.4 Nivel estimado por habilidad

Se calcula **independientemente** para: listening, reading, writing, speaking,
grammar, vocabulary, pronunciation. Para cada habilidad:

```
nivel_estimado[habilidad] = nivel MCER más alto cuyos objetivos de esa habilidad
                             cumplen el criterio de "demostrado" (sección 2),
                             con el nivel inmediatamente superior en progreso
```

- Se muestra con una **banda de confianza** derivada de la cantidad de evidencia:
  - ≥ 3 evidencias por objetivo relevante, incluyendo ≥1 de transferencia y ≥1
    diferida → "confianza alta".
  - Evidencia parcial → "confianza media" o "confianza baja", explícito en pantalla.
  - Sin evidencia de una habilidad (típicamente speaking si no hay micrófono) →
    **"pendiente de evaluar"**, nunca un nivel inventado por inferencia desde otra
    habilidad.
- Nunca se promedian habilidades para dar "un nivel único": si reading está en C1 y
  speaking está "pendiente de evaluar", el perfil muestra ambos datos, no un promedio
  que los oculte.

### 1.5 Certificación externa

Campo informativo, vacío por defecto. Si en el futuro rindes un examen externo
(Cambridge, EOI, IELTS, etc.), se registra como un dato aparte — nunca lo calcula ni
lo simula la aplicación.

## 2. Umbrales de "competencia demostrada" (ajustables, no oficiales)

Un objetivo del currículo se marca `demonstrated = true` cuando se cumplen **las
cuatro** condiciones siguientes (configurables en `config/thresholds.json`):

1. **Repetición:** ≥ 2 evidencias satisfactorias en ≥ 2 actividades/contextos
   distintos (no la misma pregunta repetida).
2. **Transferencia sin ayuda:** ≥ 1 evidencia marcada `is_unaided = true` **y**
   `is_transfer_task = true` (contexto nuevo, no el mismo de la práctica guiada).
3. **Retención:** ≥ 1 comprobación diferida aprobada, aplicada ≥ 10 días después de
   la evidencia más reciente (intervalo configurable).
4. **Sin fallos críticos recientes:** ninguna evidencia de las últimas 2 relacionadas
   con este objetivo tiene `critical_failure = true` (definido por rúbrica como "el
   objetivo comunicativo no se cumplió", no cualquier error de forma).

Si falta evidencia para evaluar alguna condición, el objetivo se queda en
`insufficient_evidence`, **no** en `false`. Esto evita que "no he practicado esto
todavía" se vea igual que "lo intenté y no lo logré".

## 3. Banco de práctica vs. banco de evaluación

- Todo ítem tiene un `base_item_id` (el "núcleo" de la pregunta/tarea) y un
  `variant_id` (superficie: nombres, números, contexto cambiado).
- **Cambiar solo nombres o números no crea un ítem nuevo** a efectos de evaluación:
  el sistema deduplica por `base_item_id`.
- Los ítems marcados `pool = assessment` nunca aparecen en modo práctica ni en el
  tutor de IA en modo "aprender"/"practicar" — solo en modo "evaluar" (ver
  `01-architecture.md` y la sección 9 del encargo sobre separar modos).
- Las tareas abiertas (writing/speaking) no tienen "una" respuesta modelo única: la
  rúbrica evalúa criterios (cumplimiento del objetivo, organización, recursos
  lingüísticos, etc.), no coincidencia con un texto de referencia.

## 4. Repetición espaciada

Algoritmo tipo SM-2 simplificado, aplicado por objetivo/ítem de vocabulario:

- Cada ítem tiene `ease_factor` (inicial 2.5), `interval_days`, `due_at`,
  `history[]`.
- Resultado "lo recordé con facilidad" → `interval` crece (× `ease_factor`,
  `ease_factor` sube levemente).
- Resultado "fallé" → `interval` se resetea a 1 día, `ease_factor` baja (piso 1.3),
  se ofrece una microlección puntual sobre ese punto antes del siguiente intento.
- Si el mismo tipo de error se repite ≥ 2 veces en objetivos relacionados → se genera
  una tarea de transferencia adicional (regla de la sección 6 del encargo), no solo
  más repetición mecánica.
- **Techo diario de repasos mostrados** (configurable, por defecto 30 ítems/día): el
  resto queda en cola, priorizado por vencimiento y criticidad, con aviso explícito
  de "tienes N repasos más en espera" — así el repaso acumulado no bloquea
  indefinidamente el contenido nuevo (regla explícita del encargo, sección 6).
- Si hay abandono de varios días: al volver, el primer repaso ofrecido es una versión
  reducida ("regreso manejable"), no la cola completa de golpe.
- La programación de repasos **registra intentos y fechas**, pero por sí sola no
  equivale a competencia demostrada — eso requiere además los 4 criterios de la
  sección 2.

## 5. Rúbricas (marco general — rúbricas completas en `config/rubrics/`)

Cada habilidad tiene una rúbrica versionada con criterios explícitos, publicados
**antes** de evaluar (no después, para evitar ajustar criterios a modo). Estructura
común:

```json
{
  "rubric_id": "speaking.b1.v1",
  "version": 1,
  "criteria": [
    {"name": "task_fulfillment", "weight": 0.35, "critical": true},
    {"name": "comprehensibility", "weight": 0.25, "critical": true},
    {"name": "fluency", "weight": 0.15},
    {"name": "range_and_accuracy", "weight": 0.15},
    {"name": "interaction_management", "weight": 0.10}
  ]
}
```

- Un criterio `critical: true` en falla automática produce `critical_failure = true`
  en la evidencia, independientemente del puntaje ponderado total.
- **Speaking:** se evalúa cumplimiento de la tarea, comprensibilidad, fluidez,
  recursos lingüísticos y manejo de la interacción — **nunca pronunciación a partir
  solo de la transcripción**. Si no hay análisis de audio fiable disponible (ver
  limitación de `01-architecture.md`), el criterio de pronunciación se omite y se
  marca `pronunciation: not_assessed`, no se inventa un puntaje. El objetivo es
  inteligibilidad, no eliminar el acento.
- **Writing:** se separan explícitamente (a) errores que afectan el significado, (b)
  errores de forma, (c) sugerencias de estilo — en campos distintos de la
  retroalimentación, nunca mezclados en una sola lista. El sistema no reescribe el
  texto completo antes de que el usuario intente mejorarlo: primero pistas, el
  usuario reintenta, y solo al final (si se pide) se muestra una versión mejorada de
  referencia.
- **Listening:** toda evaluación declara de antemano número de escuchas permitidas,
  velocidad y disponibilidad de transcripción. Usar transcripción se registra en la
  evidencia (`used_transcript = true`) y esa evidencia **no cuenta** como prueba de
  comprensión puramente auditiva para el umbral de la sección 2.

## 6. Registro de evaluación por IA

Cada evidencia evaluada por IA guarda:

```json
{
  "rubric_id": "writing.b2.v2",
  "model_provider": "anthropic",
  "model_version": "claude-...",
  "confidence": "medium",
  "justification": "texto explicando la calificación",
  "human_override": null,
  "created_at": "..."
}
```

- `confidence` permite que el sistema reconozca incertidumbre explícitamente.
- `human_override` permite corregir manualmente un veredicto de IA (por ti, o tras
  contraste con un docente externo) sin perder el registro original — ambos quedan
  guardados.

## 7. Vía de contraste externo

Para hitos importantes (fin de B2, fin de C1), la app genera un **paquete de
exportación** (portafolio reciente + autoevaluación + evidencias clave) pensado para
que un docente o examinador externo lo revise. Es opcional: la app sigue siendo
plenamente funcional sin usar esta vía. El resultado externo, si se registra, se
guarda como dato aparte (sección 1.5), nunca sustituye ni recalcula el nivel estimado
interno.

## 8. Mensajes de progreso: siempre basados en datos guardados

Ejemplo de mensaje válido (debe poder reconstruirse desde `evidence_records`):

> "Has demostrado que puedes pedir información básica y responder preguntas sobre tu
> rutina (evidencia: 3 tareas, la más reciente hace 12 días, incluye 1 comprobación
> diferida aprobada). Todavía necesitas práctica para comprender respuestas
> imprevistas (0 evidencias de tarea de transferencia en este objetivo)."

Ningún mensaje de progreso se redacta "a mano" de forma genérica: se genera a partir
de los campos reales de `evidence_records`, incluyendo las condiciones de la prueba
cuando aplica (número de escuchas, uso de transcripción, etc.).

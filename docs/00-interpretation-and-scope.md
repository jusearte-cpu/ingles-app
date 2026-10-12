# 00 — Interpretación, alcance y qué mide esta app

## Interpretación del encargo

Esto no es un curso de inglés con lecciones sueltas: es un **sistema de aprendizaje y
medición** para una sola persona (Sebastián), con dos compromisos simultáneos:

1. **Enseñar** inglés de forma integral (comprensión, producción, interacción,
   conocimiento explícito de la lengua, fluidez) desde Pre-A1 hasta C1, con C2 como
   ampliación opcional.
2. **Medir honestamente** qué tanto de eso se ha logrado, sin inflar el progreso y sin
   convertir "lecciones completadas" en una promesa de nivel.

El segundo compromiso es tan importante como el primero. Por eso el modelo de datos
(`04-data-model.md`) y el modelo de progreso (`03-progress-and-evaluation-model.md`)
separan explícitamente cinco cosas que casi todas las apps de idiomas mezclan:

| Indicador | Qué responde | Qué NO responde |
|---|---|---|
| Contenido completado | ¿Hiciste las actividades? | ¿Aprendiste algo de ellas? |
| Competencias demostradas | ¿Mostraste evidencia de que puedes hacer X? | ¿Lo recordarás en un mes? |
| Retención comprobada | ¿Sigues pudiendo hacer X después de un intervalo? | Tu nivel general |
| Nivel estimado por habilidad | ¿Qué nivel MCER sugiere tu evidencia acumulada, por habilidad? | Un nivel "oficial" |
| Certificación externa | ¿Lo reconoce un tercero (Cambridge, EOI, etc.)? | Nada de lo anterior la sustituye |

La app puede emitir un **informe interno de resultados**. Ese informe, en cada
exportación y en la pantalla de progreso, llevará una nota explícita: *"Este es un
estimado interno de la aplicación, no una certificación oficial."*

## Alcance

- **Recorrido:** Pre-A1 → A1 → A2 → B1 → B2 → C1, con C2 y rutas profesionales como
  Etapa 6 opcional (ver `06-roadmap.md`).
- **Hito de autonomía:** B2. **Objetivo principal del programa:** C1.
- **Objetivo editable:** el nivel meta y la fecha objetivo son configurables en
  cualquier momento desde Configuración; cambiarlos no borra evidencia pasada, solo
  cambia la ruta recomendada hacia adelante.
- **Sin relleno artificial:** el número de módulos/unidades por nivel se define por
  cobertura de objetivos comunicativos necesarios (ver `02-curriculum-matrix.md`), no
  por una meta fija de "N lecciones". Si un nivel necesita menos o más unidades que
  otro, así quedará.
- **Diagnóstico:** una versión corta (orientativa, ~15-20 min) y una versión completa
  (varias sesiones), evaluando listening, reading, writing, speaking, vocabulario,
  gramática y pronunciación **por separado**. El speaking nunca se infiere de una
  prueba escrita: si no hay evidencia oral, el perfil mostrará explícitamente
  "pendiente de evaluar", nunca un nivel inventado.
- **Perfil de usuario:** idioma principal, experiencia previa, objetivos, intereses,
  tiempo disponible, fecha objetivo, acceso a micrófono/audífonos, oportunidades de
  conversación, necesidades de accesibilidad y preferencia de variedad del inglés se
  recogen en el onboarding de la app (no en esta conversación). Si el usuario no
  completa el perfil, la app arranca con una configuración provisional y editable de
  **45 minutos, 5 días por semana**, marcada explícitamente como punto de partida, no
  como promesa de velocidad de aprendizaje.

## Principios pedagógicos: qué es investigación y qué es decisión de producto

La app combina diez componentes pedidos en el encargo. Para cada uno, distingo lo que
tiene respaldo amplio en investigación de adquisición de segundas lenguas de lo que es
una decisión de producto (configurable, no universal):

| Componente | Base | Nota |
|---|---|---|
| Comprensión (input) de nivel adecuado (*comprehensible input*) | Ampliamente respaldado | No determina por sí solo el ritmo de producción oral |
| Producción temprana (output) | Respaldado como complemento al input, no sustituto | La proporción input/output es decisión de producto, ajustable por mí (`06-roadmap.md`, ritmo diario) |
| Interacción con objetivo comunicativo | Respaldado (hipótesis de interacción) | El "compañero" suele ser IA, no persona real — limitación reconocida, ver `01-architecture.md` |
| Recuperación activa (*retrieval practice*) antes de revelar respuesta | Fuerte respaldo empírico | Aplica a vocabulario y gramática; en tareas abiertas (writing/speaking) se adapta como "intento antes de ejemplo" |
| Repetición espaciada | Fuerte respaldo empírico | El algoritmo concreto (intervalos, umbrales) es decisión de producto — ver `03-progress-and-evaluation-model.md` |
| Transferencia a contextos nuevos | Respaldado, difícil de medir bien | Se opera mediante "tareas de transferencia" explícitas, distintas de práctica guiada |
| Explicaciones explícitas breves de gramática/pronunciación | Respaldado como complemento a la exposición, no como método único | Se mantienen cortas a propósito |
| Corrección con oportunidad de reintento | Respaldado, especialmente corrección selectiva (no exhaustiva) | Qué se corrige y cuándo es decisión de producto |
| Tareas integradoras reales (*task-based*) | Respaldado | No reemplaza el estudio explícito de la lengua — se combinan |
| Evaluación con material nuevo + comprobación diferida | Es la definición operativa de "aprendido" que usa este proyecto | Decisión de producto explícita, no un estándar externo |

Ninguna técnica se presenta aquí como superior para toda persona u objetivo: por
ejemplo, alguien que solo necesita sobrevivir turísticamente no necesita el mismo
énfasis en escritura formal que alguien preparando C1 académico. La distribución entre
comprensión, producción, estudio de la lengua y fluidez es ajustable (ver "Hoy" en
`05-screens-and-ux.md`), con un mínimo garantizado por habilidad para que ninguna quede
abandonada.

Explícitamente **no** se usa como motor principal: selección múltiple aislada,
traducción de frases sueltas sin contexto, o acumulación de puntos. Esas técnicas
pueden aparecer como *apoyo puntual* (p. ej. opción múltiple dentro de un ejercicio de
listening de comprensión general), nunca como la actividad que define si "aprendiste".

## Fuente de referencia del MCER

Los descriptores de nivel se basan en el *Common European Framework of Reference for
Languages* (Consejo de Europa, 2001) y su *CEFR Companion Volume* (2020), ambos de
acceso público. La app **no inventa códigos oficiales de descriptores**: cuando cita un
"can-do", lo redacta en lenguaje propio inspirado en esas fuentes y lo marca como
*adaptación interna*, no como cita textual certificada.

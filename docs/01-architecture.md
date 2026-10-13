# 01 — Arquitectura técnica

## Resumen de decisiones

| Capa | Elección | Por qué |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript, React) | Un solo código para web + PWA instalable; SSR para carga rápida en móvil con datos limitados |
| Estilos/UI | Tailwind CSS + componentes propios | Control fino de lectura en celular y controles táctiles grandes, sin el peso de una librería completa |
| Backend/datos | Supabase (Postgres administrado + Auth + Storage + Realtime) | Un solo proveedor cubre persistencia, autenticación, archivos privados y sincronización entre dispositivos, con *Row Level Security* nativo |
| Hosting frontend | Vercel | HTTPS automático, despliegue desde git, apto para Next.js |
| IA (tutor, feedback, generación) | Adaptador `LLMProvider`; **decisión firme: se queda en modo mock (reglas) permanentemente** | Costo cero es un requisito del producto, no una fase transitoria — ver `docs/decisions-log.md`. El adaptador sigue existiendo por si esto cambia algún día, pero no hay plan de conectar un proveedor real |
| Texto-a-voz (TTS) | Web Speech API del navegador, **única voz, permanente** | Gratis, sin cuenta ni clave. No se conecta una API de voz de pago |
| Voz-a-texto (STT) | **No conectado, decisión permanente** | Transcribir audio con un proveedor real tiene costo; sin esto, no hay feedback automático de contenido en grabaciones — limitación aceptada explícitamente |
| Evaluación de pronunciación | **No implementado, decisión permanente** | Requeriría un proveedor especializado de pago (p. ej. Azure); descartado por la misma razón que STT |

Todas las integraciones de IA están detrás de interfaces (`LLMProvider`, `TTSProvider`,
`STTProvider`) para que cambiar de proveedor sea un cambio de configuración, no una
reescritura. Esto responde directamente al pedido de "integraciones sustituibles".

**Construido en Etapa 2 (local):** grabación de audio real vía `MediaRecorder` del
navegador (`src/app/lesson/[id]/AudioRecorder.tsx`), subida a una ruta propia
(`src/app/api/recordings/route.ts`) que guarda el archivo en el filesystem del
servidor (`data/recordings/`) y lo sirve de vuelta solo por esa misma ruta — nunca
una URL pública directa. Es el equivalente funcional de un bucket privado, a escala
de un servidor local de un solo usuario. Limitación honesta: el filesystem local no
tiene control de acceso propio más allá de "quién puede llegar a este servidor" —
con Supabase Storage esto se vuelve un control de acceso real por usuario (URLs
firmadas), sin cambiar el contrato de la ruta (recibe bytes, devuelve una ruta).

## Por qué Supabase y no una base casera

El requisito "mismo progreso en computador, celular y tablet" exige una base de datos
remota real, no almacenamiento local por dispositivo. Supabase da Postgres (modelo
relacional, adecuado para el modelo de evidencias/objetivos de `04-data-model.md`),
autenticación lista, almacenamiento de archivos privados con URLs firmadas (grabaciones
de audio, PDFs subidos) y *Row Level Security* para que, aunque hoy seas el único
usuario, los datos ya queden aislados por cuenta desde el primer día.

Alternativa considerada y descartada por ahora: backend a medida (Node/Express +
Postgres propio). Más control, pero más mantenimiento para un proyecto de una sola
persona — se revisita solo si Supabase impone una limitación real.

## Cuentas que vas a necesitar crear (yo no puedo crearlas por ti)

Para pasar de "funciona en mi máquina" a "accesible desde una dirección segura y
sincronizada entre dispositivos", se necesitan cuentas externas. **No puedo crear
cuentas en tu nombre** (es una acción que tengo prohibida); esto es trabajo tuyo cuando
quieras avanzar a despliegue real. El código del lado de la app ya está escrito y
esperando — ver [`docs/SETUP-CLOUD.md`](SETUP-CLOUD.md) para los pasos exactos:

1. Cuenta en Supabase (proyecto gratuito alcanza de sobra para un usuario). Ya existe
   [`db/schema.supabase.sql`](../db/schema.supabase.sql) listo para pegar en su SQL
   Editor, y login por enlace mágico (`/login`, `src/lib/supabase/`,
   `src/middleware.ts`) ya implementado — hoy inactivo porque no hay credenciales,
   no porque falte código.
2. Cuenta en Vercel (plan gratuito alcanza) + cuenta en GitHub si no tienes una ya
   (Vercel despliega desde un repositorio git).
3. Clave de API de Anthropic (para el tutor de IA) y, si decides usar voz de calidad,
   clave de OpenAI o el proveedor de TTS/STT que prefieras.

**Lo que el código nuevo todavía NO hace:** leer/escribir en Postgres en vez de
SQLite. Eso es un cambio mecánico (mismo modelo de datos, mismo `drizzle-orm`, distinto
driver) pero deliberadamente no lo hice a ciegas sin un proyecto real contra el cual
probarlo — sería fingir una integración "completa" sin verificarla, justo lo que este
proyecto existe para evitar. Se hace en cuanto haya credenciales.

Mientras tanto, la Etapa 2 se construye y se prueba en **modo local**: Next.js corriendo
en tu máquina. **Ajuste frente al plan original:** en vez de Postgres local vía Docker,
la Etapa 2 usa SQLite (vía Drizzle ORM) — cero dependencias externas, arranca al
instante, y el modelo de datos es el mismo (ver `src/db/schema.ts` vs `db/schema.sql`).
Al conectar Supabase, se migra a Postgres sin cambiar la forma del modelo. Los
adaptadores de IA quedan en modo *mock* (respuestas de ejemplo, claramente marcadas como
tales en pantalla) cuando no hay clave configurada. Esto cumple el requisito de la
sección 9: *"Si no hay conexión o credenciales, informa qué funciones están disponibles.
Nunca simules que una respuesta fue analizada por IA."*

## Control de costo de IA

- Contador de uso mensual por tipo de llamada (tutor, TTS, STT, generación de
  contenido), con un techo configurable en `config/thresholds.json`.
- Al llegar al techo, la función se deshabilita con un mensaje explícito (no se
  degrada silenciosamente ni se cobra de más).
- El contenido generado por IA a partir de materiales propios (lecturas adaptadas,
  preguntas) se cachea y reutiliza — no se regenera cada vez que abres la misma
  lectura.

## Offline y sincronización

**Qué funciona sin conexión:**
- Ver lecciones y audio ya descargados en la sesión actual.
- Redactar respuestas de writing y grabar audio de speaking (se guardan localmente en
  cola).
- Ver tu cola de repaso ya cargada.

**Qué requiere conexión:**
- Descargar contenido nuevo no visitado antes.
- Cualquier corrección o evaluación de IA.
- Enviar una evidencia para que cuente en tu progreso (hasta que sincronice).

**Resolución de conflictos:**
- Los registros de evidencia/intentos son **append-only** (nunca se sobreescriben):
  cada intento es una fila nueva, así que dos dispositivos no pueden "pisarse" el
  progreso — en el peor caso llega duplicado y se descarta por *id* idempotente.
- Los documentos editables (p. ej. un borrador de writing) usan un contador de versión;
  si dos dispositivos editraron el mismo borrador offline, se conserva ambas versiones
  y se muestra un aviso para elegir cuál mantener — nunca se pierde contenido
  silenciosamente.

## Privacidad y seguridad

- Las claves de API (Anthropic, proveedor de TTS/STT) viven solo como variables de
  entorno del servidor; nunca llegan al cliente.
- Archivos (grabaciones, documentos subidos) en buckets privados de Storage, servidos
  por URL firmada de corta duración, nunca públicos.
- Validación de tipo MIME y tamaño en toda carga de archivo.
- Exportación de datos: un endpoint que genera un paquete (JSON + archivos) con todo tu
  progreso y portafolio.
- Eliminación de cuenta: borrado real (hard delete) en cascada, con confirmación
  explícita antes de ejecutar.
- Errores de red o de servicios externos se comunican con un mensaje claro y **nunca**
  descartan trabajo ya guardado localmente.

## Pruebas

- Pruebas automatizadas (Vitest) para la lógica de progreso, repetición espaciada y
  umbrales de competencia — es la parte más fácil de romper silenciosamente y la más
  importante de proteger.
- Pruebas end-to-end (Playwright) para los flujos críticos de la sección 15 de
  criterios de aceptación: login → diagnóstico → lección → evidencia guardada →
  progreso persistente tras cerrar sesión.
- Lo que depende de servicios externos (IA real, voz real) se prueba con los
  adaptadores *mock* en CI, y manualmente contra el proveedor real antes de cada
  entrega de etapa — documentado en cada entrega qué se probó con proveedor real y qué
  solo con mock.

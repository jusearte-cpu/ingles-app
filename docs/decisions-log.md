# Registro de decisiones

## Supuestos razonables y reversibles que tomé para poder avanzar

Estos no bloquean el trabajo; si quieres cambiarlos, dímelo y se ajustan sin rehacer
nada de fondo.

| Decisión | Qué asumí | Por qué | Qué tan reversible |
|---|---|---|---|
| Ubicación del proyecto | `~/Code/ingles-app`, fuera de la carpeta de Google Drive | Un proyecto Next.js genera miles de archivos (`node_modules`) que Google Drive intentaría sincronizar constantemente — lento y propenso a conflictos | Alta — es solo una carpeta, se puede mover |
| Stack técnico | Next.js + Supabase + Vercel | Cubre persistencia, auth, storage y sync entre dispositivos con un solo proveedor administrado, mantenible por una persona | Media — las integraciones de IA y el frontend quedan igual; cambiar de Supabase implicaría migrar datos, no rediseñar |
| Proveedor de IA por defecto | Anthropic (tutor/texto), adaptador genérico para TTS/STT | Intercambiable por diseño (`LLMProvider`/`TTSProvider`/`STTProvider`) | Alta — es config, no arquitectura |
| Configuración inicial | 45 min, 5 días/semana | Es el valor de respaldo que el propio encargo define si no completas el perfil | Alta — editable en Configuración en cualquier momento |
| Variedad de inglés por defecto (audio generado) | Inglés general americano | Es la opción más disponible por defecto en la mayoría de motores de voz; la exposición gradual a otras variedades (incluida británica) está en el currículo igual, independientemente de la voz de producción | Alta — configurable, y el onboarding te pregunta tu preferencia real |
| Idioma de apoyo inicial | Mayoritariamente español, decreciente con el nivel | Pedido explícito del encargo | Alta — ajustable manualmente en todo momento |

## Nube: ya está hecho (Supabase + Vercel + GitHub)

Tú creaste las 3 cuentas (Supabase, GitHub, Vercel) — eso era lo único que yo
no podía hacer por ti — y entre los dos desplegamos la app completa en
**https://ingles-app-chi.vercel.app**, con base de datos real y login por
enlace mágico funcionando en producción. Ver `docs/SETUP-CLOUD.md` para el
detalle de cómo quedó armado y los problemas reales que resolvimos en el
camino.

Lo único que queda pendiente de esta lista original:

1. **Clave de API de Anthropic** (tutor de IA real) y, si quieres voz de
   calidad en vez del sintetizador del navegador, una clave del proveedor de
   TTS/STT que prefieras.
2. **Un techo de gasto mensual con el que te sientas cómodo** para el punto 1
   (hoy asumo un valor conservador en `config/thresholds.json`, editable).

## Supuesto adicional tomado durante la Etapa 2

| Decisión | Qué asumí | Por qué | Qué tan reversible |
|---|---|---|---|
| "Acceso" en la Etapa 2 local | Sin pantalla de login todavía: un solo usuario implícito en el esquema SQLite (sin columnas `user_id`) | Construir una autenticación local propia que luego se descarta al conectar Supabase Auth sería trabajo desechable; mejor esperar e implementar auth real una sola vez | Alta — no hay nada que migrar "desde" un sistema de auth falso, porque no se construyó uno |
| SQLite en vez de Postgres/Docker para Etapa 2 | `drizzle-kit push` tiene un bug confirmado contra `better-sqlite3` en este entorno; se aplicó el DDL a mano en `src/db/migrate.ts` | Desbloquear el desarrollo sin perder tiempo depurando una herramienta de terceros | Alta — incluso así, el modelo de datos es el mismo; migrar a Postgres es cambiar el driver, no el diseño |

## Dos bugs reales encontrados y corregidos en esta sesión

No son decisiones de diseño, pero quedan documentados porque son el tipo de cosa
que vale la pena que sepas que pasó:

1. **`isAssessment` quedaba hardcodeado a `false`** en `src/lib/record-evidence.ts`
   desde la primera versión del motor — ninguna evidencia se habría marcado nunca
   como "de evaluación" hasta que se corrigió al construir el banco de
   evaluación separado. No afectó datos ya guardados porque el banco de
   evaluación no existía todavía.
2. **La barra de navegación en móvil se desbordaba** al llegar a 7 pantallas
   (Portafolio y Configuración quedaban fuera de la pantalla, inaccesibles sin
   scroll). Se corrigió implementando el menú "Más" que ya estaba diseñado en
   `05-screens-and-ux.md` pero no se había construido. Lección: con 4-5
   pantallas no se notaba; apareció al escalar.
3. **La conexión a Postgres se creaba al importar el módulo, no al usarla** —
   funcionaba en local (build y dev) pero rompía el build de Vercel con un
   error críptico (`TypeError: Invalid URL`) porque Next.js ejecuta el código
   de nivel superior de los módulos importados por las Route Handlers durante
   el build. Se corrigió con un patrón perezoso (Proxy) en `src/db/client.ts`.
   Ver `docs/SETUP-CLOUD.md` para esta y el resto de sorpresas reales del
   despliegue (pooler vs. conexión directa, ubicación de `middleware.ts`,
   límite de correos de Supabase).

## Alcance real de "completar el currículo": el cuello de botella es contenido, no código

El motor (modelo de datos, cálculo de progreso, repetición espaciada, UI) ya
generaliza a cualquier número de unidades/niveles — agregar una unidad más no
requiere cambios de arquitectura. Lo que no escala automáticamente es **redactar
cada unidad**: diálogos naturales, progresión gramatical con sentido, reciclaje
deliberado de objetivos previos, rúbricas coherentes. Eso es trabajo de autoría,
unidad por unidad, y es genuinamente lento si se quiere mantener la calidad (no
generar contenido en bloque sin revisión, que es justo lo que el encargo pide
evitar en la sección 13). Dimensiona esto al decidir cuánto seguir invirtiendo
en Etapa 3 vs. otras prioridades.

## Cómo cambiar un supuesto

Dímelo en cualquier momento ("cambia la ubicación del proyecto a X", "no quiero usar
Supabase, prefiero Y"). Como nada de Etapa 2 en adelante depende de forma
irreversible de estos supuestos, el costo de cambiarlos ahora es bajo.

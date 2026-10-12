# Guía de activación: Supabase + Vercel

Todo el código de este documento ya está escrito y en el repositorio — lo único
que falta son las cuentas, que **tengo prohibido crear en tu nombre**. Esta
guía es la lista mínima de pasos tuyos; cada uno tiene una marca de si es
obligatorio o si puede esperar.

Nada de esto rompe el modo local actual: mientras no completes el paso 1,
`npm run dev` sigue funcionando exactamente igual que hoy, en SQLite.

## 1. Crear el proyecto de Supabase (obligatorio para sincronizar entre dispositivos)

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta (plan
   gratuito alcanza de sobra para un usuario).
2. "New project" — elige una contraseña de base de datos (guárdala en un
   gestor de contraseñas, no la necesitas para el día a día).
3. Cuando el proyecto esté listo: **SQL Editor → New query**, pega el
   contenido completo de [`db/schema.supabase.sql`](../db/schema.supabase.sql)
   y dale "Run". Esto crea las tablas, activa Row Level Security y las
   políticas de acceso (cada quien ve solo lo suyo).
4. **Storage → New bucket**: nombre `recordings`, márcalo como **privado**
   (no público). Luego en **Storage → Policies** agrega la política que está
   comentada al final de `db/schema.supabase.sql`.
5. **Project Settings → API**: copia `Project URL` y la clave `anon public` a
   un archivo `.env.local` en la raíz del proyecto (nunca lo subas a git — ya
   está en `.gitignore`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

6. Reinicia `npm run dev`. Ve a `/login`, pide un enlace mágico con tu correo,
   ábrelo — deberías volver a la app ya con sesión. (El resto de la app
   todavía no exige sesión para usarse — eso es el siguiente paso de
   desarrollo, no de configuración tuya.)

## 2. Llevar tu progreso local a Supabase (opcional)

Solo si quieres conservar lo que ya generaste en modo local (las unidades que
probé yo durante esta sesión, por ejemplo).

1. Con sesión iniciada una vez (paso 1.6), ve a **Authentication → Users** en
   el Dashboard de Supabase y copia tu `User UID`.
2. **Project Settings → API**: copia la clave `service_role` (secreta — nunca
   la pongas en una variable `NEXT_PUBLIC_*` ni la subas a git).
3. Corre:

   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
   MIGRATE_USER_ID=tu-user-uid \
   npx tsx scripts/migrate-to-supabase.ts
   ```

   Revisa [`scripts/migrate-to-supabase.ts`](../scripts/migrate-to-supabase.ts)
   antes de correrlo — está escrito pero no probado contra un proyecto real
   (no tengo cómo probarlo sin tus credenciales). Si algo falla, dime el
   mensaje de error exacto y lo arreglamos.

## 3. Desplegar en Vercel (obligatorio para una dirección HTTPS real)

1. Si el código todavía no está en GitHub: crea un repositorio ahí y haz
   `git push` desde `~/Code/ingles-app` (puedo ayudarte con los comandos
   cuando quieras, pero crear el repo en GitHub.com también requiere tu
   cuenta).
2. Entra a [vercel.com](https://vercel.com), conecta tu cuenta de GitHub,
   "Add New Project" → selecciona el repositorio.
3. En "Environment Variables" agrega `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (las mismas del paso 1.5), más
   `NEXT_PUBLIC_SITE_URL` con la URL que Vercel te asigne (algo como
   `https://ingles-app-tuusuario.vercel.app` — Vercel te la muestra después
   del primer deploy; puedes actualizarla y redeployar).
4. Deploy. Si falla por SQLite/`better-sqlite3` (es un driver nativo, no
   pensado para correr en el runtime serverless de Vercel), es la señal de
   que toca el paso de desarrollo pendiente: mover `src/db/client.ts` de
   SQLite a Postgres (ver nota abajo) — avísame y lo hacemos en una sesión.

## 4. Clave de IA real (opcional, cuando quieras tutor con IA de verdad)

En **Project Settings → API Keys** de [console.anthropic.com](https://console.anthropic.com),
crea una clave y agrégala como `ANTHROPIC_API_KEY` en `.env.local` y en Vercel.
Define también un techo de gasto en la consola de Anthropic — no hay freno
automático en este lado todavía más allá de `config/thresholds.json`
(contadores de uso, sin bloqueo automático real conectado a un proveedor real
todavía).

## Qué NO hace automáticamente completar los pasos de arriba

Importante para que no haya sorpresas: crear el proyecto de Supabase (paso 1)
te da login funcional y las tablas listas, pero **la app todavía lee y escribe
en SQLite local**, no en Supabase — eso es intencional por ahora (ver
`docs/decisions-log.md`): mover `src/db/client.ts` de SQLite a Postgres es un
cambio mecánico pero que necesito poder probar contra tu proyecto real antes
de darlo por bueno, así que lo dejamos como el siguiente paso de desarrollo
una vez tengas las credenciales, no como "ya debería funcionar solo".

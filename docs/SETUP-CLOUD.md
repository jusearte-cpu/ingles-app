# Despliegue en la nube — estado y referencia

**Estado: ✅ desplegado y verificado en producción**, no solo preparado.

- Repositorio: `github.com/jusearte-cpu/ingles-app`
- Base de datos: Supabase (Postgres), proyecto `ybtqdhfkljewelkrfwtu`
- App en vivo: **https://ingles-app-chi.vercel.app**
- Login por enlace mágico probado con éxito en producción (no solo local).

Este documento ya no es una guía de "cómo activarlo" (eso ya pasó) — queda como
referencia de cómo se hizo y, sobre todo, de los problemas reales que
aparecieron al desplegar, para la próxima vez (otro proyecto, otra máquina,
reconstruir desde cero).

## Qué hay que configurar, en orden

1. **Supabase**: proyecto nuevo → correr [`db/schema.supabase.sql`](../db/schema.supabase.sql)
   completo en el SQL Editor → crear bucket privado `recordings` en Storage →
   agregar la política de acceso (comentada al final de ese mismo archivo).
2. **Variables de entorno** (`.env.local` en local, Environment Variables en
   Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `DATABASE_URL` (ver advertencia del pooler más abajo), `NEXT_PUBLIC_SITE_URL`.
3. **GitHub + Vercel**: repo privado en GitHub, importar en Vercel, pegar las
   4 variables, deploy.
4. **Supabase → Authentication → URL Configuration**: Site URL y Redirect URLs
   deben apuntar a la dirección real de Vercel (`https://tu-app.vercel.app/**`),
   no solo a `localhost`.

## Problemas reales que aparecieron (y cómo se resolvieron)

Vale la pena leer esto antes de repetir el proceso en otro lado — ninguno fue
obvio a la primera:

1. **La conexión directa a Postgres (puerto 5432, `db.<ref>.supabase.co`) no
   funciona** desde redes/entornos sin salida IPv6 — da `EHOSTUNREACH`. Hay que
   usar el **"Transaction pooler"** de Supabase (puerto 6543,
   `aws-0-<region>.pooler.supabase.com`, usuario `postgres.<project-ref>` en
   vez de solo `postgres`). Este es el que funciona y el que quedó configurado.
2. **La contraseña con `@` necesita percent-encoding** en la cadena de
   conexión (`@` → `%40`), porque si no el parser de la URL no sabe dónde
   termina la contraseña y empieza el host.
3. **`middleware.ts` tiene que vivir en `src/middleware.ts`**, no en la raíz
   del proyecto, cuando el proyecto usa una carpeta `src/` — si no, Next.js lo
   ignora en silencio (sin error, simplemente nunca corre). El build local no
   avisa de esto; solo se nota si revisas que el build liste "ƒ Middleware".
4. **El build de Vercel ejecuta el código de nivel superior de los módulos
   importados por las Route Handlers** durante "Collecting page data" — si
   algo ahí (como crear la conexión de Postgres) depende de variables de
   entorno, puede fallar con errores crípticos (`TypeError: Invalid URL`) que
   no tienen nada que ver con que las variables estén mal configuradas. La
   solución fue hacer la conexión perezosa (`src/db/client.ts`, patrón Proxy):
   no se crea nada hasta el primer uso real dentro de una request.
5. **El botón "Redeploy" del panel de Vercel se quedó colgado** (sin avanzar,
   sin error) en más de una ocasión durante este despliegue. La solución que
   funcionó siempre fue disparar el deploy con un `git push` normal (incluso
   un commit vacío) en vez de usar ese botón.
6. **Las variables `NEXT_PUBLIC_*` creadas como tipo "Secret" no se pueden
   convertir a "Config" después** (Vercel lo bloquea: "saved secrets are
   write-only"). Si quieres que una variable pública quede como "Config"
   (recomendado, ya que de todas formas `NEXT_PUBLIC_*` se expone al
   navegador), bórrala y créala de nuevo eligiendo el tipo correcto desde el
   inicio — no se puede cambiar editando.
7. **`DATABASE_URL` sí debe quedar como "Secret"** (nunca "Config") — a
   diferencia de las `NEXT_PUBLIC_*`, esta contiene la contraseña real de la
   base de datos y nunca debe exponerse al navegador.
8. **Límite de envío de correos de Supabase**: el servicio de correo gratuito
   por defecto (usado para los enlaces mágicos) tiene un límite bajo de envíos
   por hora. Probarlo muchas veces seguidas agota la cuota y da "email rate
   limit exceeded" — no es un error de configuración, solo toca esperar
   (se resetea solo) o configurar un proveedor SMTP propio si hace falta más
   volumen.
9. **Los scripts que corren con `tsx` no cargan `.env.local` automáticamente**
   (a diferencia de `next dev`/`next build`, que sí lo hacen). Hay que correrlos
   con `tsx --env-file=.env.local <script>` — ya está así en `npm run db:seed`.

## Pendiente (no bloquea el uso diario)

- `ANTHROPIC_API_KEY` para el tutor de IA real — ver `docs/decisions-log.md`.
- Revisar si quieres migrar algún dato que hayas generado en modo local antes
  de esta migración (quedó en `data/local.db`, sin usarse ya) — dado que era
  solo contenido de prueba, no se migró automáticamente (ver
  `docs/decisions-log.md`).

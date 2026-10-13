import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * La conexión se crea perezosamente (solo en el primer uso real), no al
 * importar este archivo. Next.js ejecuta el código de nivel superior de los
 * módulos importados por una Route Handler durante "Collecting page data" en
 * el build — si `postgres(...)` se llamaba ahí directamente, el build de
 * Vercel fallaba antes de que las variables de entorno de runtime estuvieran
 * disponibles en esa fase. Con esto, importar `db` no hace nada hasta que de
 * verdad se ejecuta una consulta dentro de una request.
 */
type Db = PostgresJsDatabase<typeof schema>;
let _db: Db | null = null;

function getDb(): Db {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Falta DATABASE_URL — ver docs/SETUP-CLOUD.md para obtenerla (cadena del 'Transaction pooler' de Supabase, no la de conexión directa: esta última necesita IPv6).",
    );
  }
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  _db = drizzle(client, { schema });
  return _db;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

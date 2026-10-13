import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Falta DATABASE_URL en .env.local — ver docs/SETUP-CLOUD.md para obtenerla (cadena del 'Transaction pooler' de Supabase, no la de conexión directa: esta última necesita IPv6).",
  );
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });

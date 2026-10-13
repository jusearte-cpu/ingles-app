import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";

export type Profile = typeof profiles.$inferSelect;

/** Crea el perfil con valores de respaldo (45 min, 5 días/semana) si no existe. */
export async function getOrCreateProfile(userId: string): Promise<Profile> {
  const [existing] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  if (existing) return existing;

  const [created] = await db.insert(profiles).values({ userId }).returning();
  return created;
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

export async function updateProfile(input: {
  targetLevel: string;
  weeklyMinutesTarget: number;
  studyDaysPerWeek: number;
  supportLanguageRatio: number;
  englishVarietyPreference: string;
  textSize: string;
  reducedMotion: boolean;
}) {
  const userId = await requireUserId();

  await db
    .insert(profiles)
    .values({ userId, ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { ...input, updatedAt: new Date() },
    });

  revalidatePath("/settings");
  revalidatePath("/today");
  return { done: true };
}

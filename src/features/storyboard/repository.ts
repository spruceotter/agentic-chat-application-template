import { desc, eq } from "drizzle-orm";

import { db } from "@/core/database/client";

import type { NewScene, Scene } from "./models";
import { storyboardScenes } from "./models";

export async function createScene(data: NewScene): Promise<Scene> {
  const [scene] = await db.insert(storyboardScenes).values(data).returning();
  return scene as Scene;
}

export async function findSceneById(id: string): Promise<Scene | undefined> {
  const results = await db
    .select()
    .from(storyboardScenes)
    .where(eq(storyboardScenes.id, id))
    .limit(1);
  return results[0];
}

export async function findLatestSceneByConversationId(
  conversationId: string,
): Promise<Scene | undefined> {
  const results = await db
    .select()
    .from(storyboardScenes)
    .where(eq(storyboardScenes.conversationId, conversationId))
    .orderBy(desc(storyboardScenes.createdAt))
    .limit(1);
  return results[0];
}

export async function updateScene(
  id: string,
  data: Partial<Pick<Scene, "imageUrl" | "leonardoGenerationId" | "status">>,
): Promise<Scene | undefined> {
  const results = await db
    .update(storyboardScenes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(storyboardScenes.id, id))
    .returning();
  return results[0];
}

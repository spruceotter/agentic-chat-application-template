import { getLogger } from "@/core/logging";

import type { Archetype, MoodKey } from "./constants";
import { ARCHETYPES, MOODS } from "./constants";
import { ImageGenerationError, SceneNotFoundError } from "./errors";
import * as leonardo from "./leonardo";
import type { Scene } from "./models";
import * as repository from "./repository";

const logger = getLogger("storyboard.service");

export interface SceneMetadata {
  dialogue: string;
  scene: string | null;
  mood: string | null;
  thought: string | null;
}

export function parseSceneMetadata(content: string): SceneMetadata {
  let dialogue = content;
  let scene: string | null = null;
  let mood: string | null = null;
  let thought: string | null = null;

  const sceneMatch = content.match(/\[SCENE:\s*([\s\S]*?)\]/);
  if (sceneMatch) {
    scene = sceneMatch[1]?.trim() ?? null;
    dialogue = dialogue.replace(sceneMatch[0], "");
  }

  const moodMatch = content.match(/\[MOOD:\s*([\s\S]*?)\]/);
  if (moodMatch) {
    const rawMood = moodMatch[1]?.trim().toLowerCase() ?? "";
    mood = rawMood in MOODS ? rawMood : null;
    dialogue = dialogue.replace(moodMatch[0], "");
  }

  const thoughtMatch = content.match(/\[THOUGHT:\s*([\s\S]*?)\]/);
  if (thoughtMatch) {
    thought = thoughtMatch[1]?.trim() ?? null;
    dialogue = dialogue.replace(thoughtMatch[0], "");
  }

  dialogue = dialogue.trim();

  return { dialogue, scene, mood, thought };
}

export function getArchetypeById(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}

export function isValidMood(mood: string): mood is MoodKey {
  return mood in MOODS;
}

export async function createScene(
  conversationId: string,
  messageId: string | null,
  metadata: SceneMetadata,
  archetypeId: string,
): Promise<Scene> {
  logger.info({ conversationId, archetypeId }, "scene.create_started");

  if (!metadata.scene) {
    throw new ImageGenerationError("No scene description in metadata");
  }

  const archetype = getArchetypeById(archetypeId);
  if (!archetype) {
    throw new ImageGenerationError(`Unknown archetype: ${archetypeId}`);
  }

  // Create the scene record in pending state
  const scene = await repository.createScene({
    conversationId,
    messageId,
    sceneDescription: metadata.scene,
    mood: metadata.mood ?? "happy",
    thought: metadata.thought,
    status: "generating",
  });

  // Fire off Leonardo generation (don't await the full result)
  try {
    const generationId = await leonardo.createGeneration(metadata.scene, archetype);
    await repository.updateScene(scene.id, {
      leonardoGenerationId: generationId,
      status: "generating",
    });
    logger.info({ sceneId: scene.id, generationId }, "scene.create_completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ sceneId: scene.id, error: message }, "scene.create_failed");
    await repository.updateScene(scene.id, { status: "failed" });
  }

  return scene;
}

export async function pollAndUpdateScene(sceneId: string): Promise<Scene> {
  logger.info({ sceneId }, "scene.poll_started");

  const scene = await repository.findSceneById(sceneId);
  if (!scene) {
    throw new SceneNotFoundError(sceneId);
  }

  if (scene.status === "complete" || scene.status === "failed") {
    return scene;
  }

  if (!scene.leonardoGenerationId) {
    return scene;
  }

  try {
    const result = await leonardo.getGenerationResult(scene.leonardoGenerationId);
    const updateData: Parameters<typeof repository.updateScene>[1] = {
      status: result.status,
    };
    if (result.imageUrl) {
      updateData.imageUrl = result.imageUrl;
    }
    const updated = await repository.updateScene(sceneId, updateData);
    logger.info({ sceneId, status: result.status }, "scene.poll_completed");
    return updated ?? scene;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ sceneId, error: message }, "scene.poll_failed");
    await repository.updateScene(sceneId, { status: "failed" });
    return { ...scene, status: "failed" };
  }
}

export async function getLatestScene(conversationId: string): Promise<Scene | null> {
  const scene = await repository.findLatestSceneByConversationId(conversationId);
  return scene ?? null;
}

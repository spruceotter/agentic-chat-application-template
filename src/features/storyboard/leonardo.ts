import { env } from "@/core/config/env";
import { getLogger } from "@/core/logging";

import type { Archetype } from "./constants";
import { IMAGE_NEGATIVE_PROMPT, IMAGE_STYLE_PREFIX } from "./constants";
import { LeonardoApiError } from "./errors";

const logger = getLogger("storyboard.leonardo");

const LEONARDO_BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";
const FLUX_DEV_MODEL_ID = "b2614463-296c-462a-9586-aafdb8f00e36";
const ILLUSTRATION_STYLE_UUID = "645e4195-f63d-4715-a3f2-3fb1e6eb8c70";

function buildImagePrompt(sceneDescription: string, archetype: Archetype): string {
  return `${IMAGE_STYLE_PREFIX} ${archetype.visualHint}, ${sceneDescription}`;
}

export async function createGeneration(
  sceneDescription: string,
  archetype: Archetype,
): Promise<string> {
  const prompt = buildImagePrompt(sceneDescription, archetype);
  logger.info({ prompt: prompt.substring(0, 100) }, "leonardo.generation_started");

  let response: Response;
  try {
    response = await fetch(`${LEONARDO_BASE_URL}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEONARDO_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        modelId: FLUX_DEV_MODEL_ID,
        styleUUID: ILLUSTRATION_STYLE_UUID,
        contrast: 4,
        width: 1024,
        height: 768,
        num_images: 1,
        guidance_scale: 7,
        negative_prompt: IMAGE_NEGATIVE_PROMPT,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    logger.error({ error: message }, "leonardo.fetch_failed");
    throw new LeonardoApiError(`Failed to connect: ${message}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    logger.error({ status: response.status, body: text }, "leonardo.api_error");
    throw new LeonardoApiError(`API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    sdGenerationJob?: { generationId?: string };
  };

  const generationId = data.sdGenerationJob?.generationId;
  if (!generationId) {
    throw new LeonardoApiError("No generationId returned");
  }

  logger.info({ generationId }, "leonardo.generation_created");
  return generationId;
}

export async function getGenerationResult(
  generationId: string,
): Promise<{ status: string; imageUrl?: string }> {
  logger.debug({ generationId }, "leonardo.poll_started");

  let response: Response;
  try {
    response = await fetch(`${LEONARDO_BASE_URL}/generations/${generationId}`, {
      headers: {
        Authorization: `Bearer ${env.LEONARDO_AI_API_KEY}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";
    logger.error({ generationId, error: message }, "leonardo.poll_fetch_failed");
    throw new LeonardoApiError(`Failed to poll: ${message}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    logger.error({ generationId, status: response.status }, "leonardo.poll_error");
    throw new LeonardoApiError(`Poll error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    generations_by_pk?: {
      status?: string;
      generated_images?: Array<{ url?: string }>;
    };
  };

  const gen = data.generations_by_pk;
  const status = gen?.status ?? "PENDING";
  const imageUrl = gen?.generated_images?.[0]?.url;

  logger.debug({ generationId, status, hasImage: !!imageUrl }, "leonardo.poll_completed");

  const result: { status: string; imageUrl?: string } = {
    status: status === "COMPLETE" ? "complete" : status === "FAILED" ? "failed" : "generating",
  };
  if (imageUrl) {
    result.imageUrl = imageUrl;
  }
  return result;
}

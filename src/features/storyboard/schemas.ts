import { z } from "zod/v4";

export const GetLatestSceneSchema = z.object({
  conversationId: z.string().uuid(),
});

export const PollSceneSchema = z.object({
  sceneId: z.string().uuid(),
});

export type GetLatestSceneInput = z.infer<typeof GetLatestSceneSchema>;
export type PollSceneInput = z.infer<typeof PollSceneSchema>;

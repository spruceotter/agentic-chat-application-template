import { NextResponse } from "next/server";

import { handleApiError } from "@/core/api/errors";
import { getLatestScene } from "@/features/storyboard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const scene = await getLatestScene(conversationId);

    if (!scene) {
      return NextResponse.json({ scene: null });
    }

    return NextResponse.json({
      scene: {
        id: scene.id,
        mood: scene.mood,
        thought: scene.thought,
        imageUrl: scene.imageUrl,
        status: scene.status,
        sceneDescription: scene.sceneDescription,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

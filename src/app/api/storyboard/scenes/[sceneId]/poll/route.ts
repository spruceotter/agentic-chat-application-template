import { NextResponse } from "next/server";

import { handleApiError } from "@/core/api/errors";
import { pollAndUpdateScene } from "@/features/storyboard";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sceneId: string }> },
) {
  try {
    const { sceneId } = await params;
    const scene = await pollAndUpdateScene(sceneId);

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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface StoryboardScene {
  id: string;
  mood: string;
  thought: string | null;
  imageUrl: string | null;
  status: string;
  sceneDescription: string;
}

export function useStoryboard(conversationId: string | null) {
  const [currentScene, setCurrentScene] = useState<StoryboardScene | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  // Poll Leonardo for image completion
  const pollForImage = useCallback(
    async (sceneId: string) => {
      try {
        const res = await fetch(`/api/storyboard/scenes/${sceneId}/poll`, {
          method: "POST",
        });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { scene: StoryboardScene };
        setCurrentScene(data.scene);

        if (data.scene.status === "complete" || data.scene.status === "failed") {
          stopPolling();
        }
      } catch {
        // Silently retry on next interval
      }
    },
    [stopPolling],
  );

  // Start polling for a specific scene
  const startPolling = useCallback(
    (sceneId: string) => {
      stopPolling();
      setIsGenerating(true);

      // Poll immediately, then every 3 seconds
      void pollForImage(sceneId);
      pollIntervalRef.current = setInterval(() => {
        void pollForImage(sceneId);
      }, 3000);
    },
    [stopPolling, pollForImage],
  );

  // Fetch latest scene when conversation changes
  const refreshScene = useCallback(async () => {
    if (!conversationId) {
      setCurrentScene(null);
      stopPolling();
      return;
    }

    try {
      const res = await fetch(`/api/storyboard/conversations/${conversationId}/latest`);
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { scene: StoryboardScene | null };
      if (data.scene) {
        setCurrentScene(data.scene);
        if (data.scene.status === "generating") {
          startPolling(data.scene.id);
        }
      }
    } catch {
      // Ignore fetch errors
    }
  }, [conversationId, stopPolling, startPolling]);

  // Fetch latest scene when conversation changes
  useEffect(() => {
    if (conversationId) {
      void refreshScene();
    } else {
      setCurrentScene(null);
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [conversationId, refreshScene, stopPolling]);

  // Handle new scene from SSE done event
  const handleNewScene = useCallback(
    (sceneData: { sceneId?: string; mood?: string; thought?: string }) => {
      if (sceneData.sceneId) {
        // Set initial scene state from SSE data
        const sceneId = sceneData.sceneId;
        setCurrentScene((prev) => ({
          id: sceneId,
          mood: sceneData.mood ?? prev?.mood ?? "happy",
          thought: sceneData.thought ?? null,
          imageUrl: null,
          status: "generating",
          sceneDescription: prev?.sceneDescription ?? "",
        }));
        startPolling(sceneData.sceneId);
      } else if (sceneData.mood) {
        // Update mood/thought even without a new scene image
        setCurrentScene((prev) =>
          prev
            ? {
                ...prev,
                mood: sceneData.mood ?? prev.mood,
                thought: sceneData.thought ?? prev.thought,
              }
            : null,
        );
      }
    },
    [startPolling],
  );

  return {
    currentScene,
    isGenerating,
    refreshScene,
    handleNewScene,
  };
}

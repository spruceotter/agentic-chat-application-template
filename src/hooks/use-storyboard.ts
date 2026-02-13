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

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40; // ~2 minutes max

export function useStoryboard(conversationId: string | null) {
  const [currentScene, setCurrentScene] = useState<StoryboardScene | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use refs to avoid stale closures and track active state
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const activeConversationRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Keep activeConversationRef in sync
  useEffect(() => {
    activeConversationRef.current = conversationId;
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollCountRef.current = 0;
    setIsGenerating(false);
  }, []);

  // Poll Leonardo for image completion
  const pollForImage = useCallback(
    async (sceneId: string, forConversationId: string) => {
      try {
        const res = await fetch(`/api/storyboard/scenes/${sceneId}/poll`, {
          method: "POST",
        });

        // Guard: don't update state if conversation changed or component unmounted
        if (!mountedRef.current || activeConversationRef.current !== forConversationId) {
          return;
        }

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
    (sceneId: string, forConversationId: string) => {
      // Always stop any existing poll first
      stopPolling();
      setIsGenerating(true);
      pollCountRef.current = 0;

      // Poll immediately
      void pollForImage(sceneId, forConversationId);

      // Then poll on interval with max attempts
      pollIntervalRef.current = setInterval(() => {
        pollCountRef.current += 1;
        if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
          stopPolling();
          return;
        }
        void pollForImage(sceneId, forConversationId);
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, pollForImage],
  );

  // Fetch latest scene when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setCurrentScene(null);
      stopPolling();
      return;
    }

    const fetchConversationId = conversationId;

    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/storyboard/conversations/${fetchConversationId}/latest`);

        // Guard against stale fetch
        if (!mountedRef.current || activeConversationRef.current !== fetchConversationId) {
          return;
        }

        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { scene: StoryboardScene | null };
        if (data.scene) {
          setCurrentScene(data.scene);
          if (data.scene.status === "generating") {
            startPolling(data.scene.id, fetchConversationId);
          }
        } else {
          setCurrentScene(null);
        }
      } catch {
        // Ignore fetch errors
      }
    };

    void fetchLatest();

    return () => {
      stopPolling();
    };
  }, [conversationId, startPolling, stopPolling]);

  // Handle new scene from SSE done event
  const handleNewScene = useCallback(
    (sceneData: { sceneId?: string; mood?: string; thought?: string }) => {
      const currentConvId = activeConversationRef.current;
      if (!currentConvId) {
        return;
      }

      if (sceneData.sceneId) {
        const sceneId = sceneData.sceneId;
        setCurrentScene((prev) => ({
          id: sceneId,
          mood: sceneData.mood ?? prev?.mood ?? "happy",
          thought: sceneData.thought ?? null,
          imageUrl: null,
          status: "generating",
          sceneDescription: prev?.sceneDescription ?? "",
        }));
        startPolling(sceneId, currentConvId);
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
    handleNewScene,
  };
}

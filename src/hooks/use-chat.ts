"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ARCHETYPES } from "@/features/storyboard/constants";

import { useLocalStorage } from "./use-local-storage";

interface ChatMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SceneEvent {
  sceneId?: string;
  mood?: string;
  thought?: string;
}

async function readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (accumulated: string) => void,
  onScene?: (scene: SceneEvent) => void,
): Promise<string> {
  const decoder = new TextDecoder();
  let accumulated = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) {
        continue;
      }
      const data = line.slice(6);
      if (data === "[DONE]") {
        // Don't return yet — keep reading for our custom done event with scene data
        continue;
      }
      try {
        const parsed = JSON.parse(data) as {
          content?: string;
          type?: string;
          message?: string;
          scene?: SceneEvent;
        };
        if (parsed.type === "error") {
          toast.error(parsed.message ?? "Response may not have been saved");
          continue;
        }
        if (parsed.type === "done") {
          // Capture scene data from the done event
          if (parsed.scene && onScene) {
            onScene(parsed.scene);
          }
          continue;
        }
        if (parsed.content) {
          accumulated += parsed.content;
          onChunk(accumulated);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  return accumulated;
}

function makeTempMessage(conversationId: string, role: string, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}`,
    conversationId,
    role,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Strip [SCENE: ...], [MOOD: ...], [THOUGHT: ...] metadata tags from content for display.
 */
function stripMetadataTags(content: string): string {
  return content
    .replace(/\[SCENE:\s*[\s\S]*?\]/g, "")
    .replace(/\[MOOD:\s*[\s\S]*?\]/g, "")
    .replace(/\[THOUGHT:\s*[\s\S]*?\]/g, "")
    .trim();
}

export function useChat() {
  const {
    items: conversations,
    addItem,
    removeItem,
    updateItem,
  } = useLocalStorage("chat-conversations");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [archetypeId, setArchetypeId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipNextFetchRef = useRef(false);
  const onSceneRef = useRef<((scene: SceneEvent) => void) | null>(null);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/conversations/${activeConversationId}/messages`);
        if (res.ok) {
          const data = (await res.json()) as { messages: ChatMessage[] };
          setMessages(data.messages);
        }
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void fetchMessages();
  }, [activeConversationId]);

  const sendMessage = useCallback(
    async (content: string, overrideArchetypeId?: string) => {
      if (isStreaming || !content.trim()) {
        return;
      }

      const effectiveArchetypeId = overrideArchetypeId ?? archetypeId;

      setIsStreaming(true);
      setStreamingContent("");

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const tempUserMessage = makeTempMessage(activeConversationId ?? "", "user", content);
      setMessages((prev) => [...prev, tempUserMessage]);

      try {
        const res = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            conversationId: activeConversationId ?? undefined,
            archetypeId: effectiveArchetypeId ?? undefined,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        const conversationId = res.headers.get("X-Conversation-Id");

        if (!activeConversationId && conversationId) {
          skipNextFetchRef.current = true;
          setActiveConversationId(conversationId);
          const matchedArchetype = effectiveArchetypeId
            ? ARCHETYPES.find((a) => a.id === effectiveArchetypeId)
            : undefined;
          const title = matchedArchetype
            ? `Date: ${matchedArchetype.name}`
            : content.length > 50
              ? `${content.substring(0, 50)}...`
              : content;
          addItem({ id: conversationId, title, updatedAt: new Date().toISOString() });
          setMessages((prev) =>
            prev.map((m) => (m.id === tempUserMessage.id ? { ...m, conversationId } : m)),
          );
        } else if (activeConversationId) {
          updateItem(activeConversationId, { updatedAt: new Date().toISOString() });
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("No reader");
        }

        const accumulated = await readSSEStream(
          reader,
          (text) => {
            // Strip metadata tags from streaming content for display
            setStreamingContent(effectiveArchetypeId ? stripMetadataTags(text) : text);
          },
          (scene) => {
            // Forward scene events to the storyboard
            onSceneRef.current?.(scene);
          },
        );

        if (accumulated) {
          const cleanContent = effectiveArchetypeId ? stripMetadataTags(accumulated) : accumulated;
          const assistantMessage = makeTempMessage(
            conversationId ?? activeConversationId ?? "",
            "assistant",
            cleanContent,
          );
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // Intentional abort — no toast needed
        } else {
          toast.error("Failed to send message");
        }
      } finally {
        abortControllerRef.current = null;
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [activeConversationId, isStreaming, archetypeId, addItem, updateItem],
  );

  const selectConversation = useCallback((id: string) => {
    abortControllerRef.current?.abort();
    setActiveConversationId(id);
    setStreamingContent("");
  }, []);

  const createNewChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent("");
    setArchetypeId(null);
  }, []);

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        const res = await fetch(`/api/chat/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          updateItem(id, { title });
        }
      } catch {
        toast.error("Failed to rename conversation");
      }
    },
    [updateItem],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
        removeItem(id);
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
          setArchetypeId(null);
        }
      } catch {
        toast.error("Failed to delete conversation");
      }
    },
    [activeConversationId, removeItem],
  );

  const setOnSceneCallback = useCallback((cb: ((scene: SceneEvent) => void) | null) => {
    onSceneRef.current = cb;
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    isLoadingMessages,
    streamingContent,
    archetypeId,
    sendMessage,
    selectConversation,
    createNewChat,
    renameConversation,
    deleteConversation,
    setArchetypeId,
    setOnSceneCallback,
  };
}

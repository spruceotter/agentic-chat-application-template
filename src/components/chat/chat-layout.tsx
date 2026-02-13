"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ARCHETYPES } from "@/features/storyboard/constants";
import { useChat } from "@/hooks/use-chat";
import { useStoryboard } from "@/hooks/use-storyboard";

import { ArchetypeSelector } from "../storyboard/archetype-selector";
import { StoryboardViewport } from "../storyboard/storyboard-viewport";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { MessageList } from "./message-list";

export function ChatLayout() {
  const {
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
  } = useChat();

  const { currentScene, isGenerating, handleNewScene } = useStoryboard(activeConversationId);

  // Restore archetypeId when switching to a Date Night conversation
  useEffect(() => {
    if (!activeConversationId) {
      return;
    }
    const convo = conversations.find((c) => c.id === activeConversationId);
    if (!convo) {
      return;
    }
    // Date Night conversations are titled "Date: <Name>"
    if (convo.title.startsWith("Date: ")) {
      const name = convo.title.slice(6);
      const archetype = ARCHETYPES.find((a) => a.name === name);
      if (archetype) {
        setArchetypeId(archetype.id);
        return;
      }
    }
    // Not a Date Night conversation — clear archetype
    setArchetypeId(null);
  }, [activeConversationId, conversations, setArchetypeId]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Look up the selected archetype for its preview image
  const selectedArchetype = useMemo(
    () => ARCHETYPES.find((a) => a.id === archetypeId),
    [archetypeId],
  );

  // Wire up the scene callback so useChat can forward scene events to useStoryboard
  useEffect(() => {
    setOnSceneCallback(handleNewScene);
    return () => {
      setOnSceneCallback(null);
    };
  }, [setOnSceneCallback, handleNewScene]);

  const activeTitle = conversations.find((c) => c.id === activeConversationId)?.title ?? null;

  const toggleSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleArchetypeSelect = useCallback(
    (id: string) => {
      setArchetypeId(id);
      // Send an opening message to kick off the date
      void sendMessage("Hey! Nice to meet you. So... what brings you here tonight?", id);
    },
    [setArchetypeId, sendMessage],
  );

  const hasMessages = messages.length > 0 || isStreaming;
  const isDateNightMode = !!archetypeId || !!currentScene;

  // Build a fallback scene from the archetype preview image if no scene exists yet
  const displayScene =
    currentScene ??
    (selectedArchetype
      ? {
          id: "preview",
          mood: "happy",
          thought: null,
          imageUrl: selectedArchetype.previewImageUrl,
          status: "complete",
          sceneDescription: `Meet ${selectedArchetype.name}`,
        }
      : null);

  return (
    <div className="flex h-screen">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={createNewChat}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        isMobileOpen={isMobileOpen}
        onMobileClose={closeMobile}
      />

      <div className="chat-gradient-bg flex flex-1 flex-col">
        <ChatHeader title={activeTitle} onToggleSidebar={toggleSidebar} />

        {isLoadingMessages && activeConversationId ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-4 py-4">
              <div className="flex gap-3 px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
              </div>
              <div className="flex flex-row-reverse gap-3 px-4 py-3">
                <Skeleton className="h-10 w-1/2 rounded-2xl" />
              </div>
            </div>
          </div>
        ) : hasMessages ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Chat panel */}
            <div className={`flex flex-col ${isDateNightMode ? "w-[55%]" : "flex-1"}`}>
              <MessageList
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
              />
              <ChatInput onSend={sendMessage} disabled={isStreaming} />
            </div>

            {/* Storyboard viewport — only in Date Night mode */}
            {isDateNightMode && (
              <div className="border-border hidden w-[45%] border-l md:block">
                <StoryboardViewport scene={displayScene} isGenerating={isGenerating} />
              </div>
            )}
          </div>
        ) : (
          <ArchetypeSelector onSelect={handleArchetypeSelect} />
        )}

        {/* Show input at bottom when no messages and not in loading state */}
        {!hasMessages && !isLoadingMessages && (
          <div className="p-4">
            <ChatInput onSend={sendMessage} disabled={isStreaming} />
          </div>
        )}
      </div>
    </div>
  );
}

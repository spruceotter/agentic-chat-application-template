import type { NextRequest } from "next/server";

import { handleApiError } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import {
  addMessage,
  createConversation,
  generateTitleFromMessage,
  getMessages,
  SendMessageSchema,
  streamChatCompletion,
} from "@/features/chat";
import {
  buildDateNightPrompt,
  createScene,
  getArchetypeById,
  parseSceneMetadata,
} from "@/features/storyboard";

const logger = getLogger("api.chat.send");

/**
 * POST /api/chat/send
 * Send a message and stream the AI response via SSE.
 * Supports optional archetypeId for Date Night mode.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      conversationId: existingConversationId,
      archetypeId,
    } = SendMessageSchema.parse(body);

    // Create conversation if needed
    let conversationId = existingConversationId;
    if (!conversationId) {
      const archetype = archetypeId ? getArchetypeById(archetypeId) : undefined;
      const title = archetype ? `Date: ${archetype.name}` : generateTitleFromMessage(content);
      const conversation = await createConversation(title);
      conversationId = conversation.id;
      logger.info({ conversationId, archetypeId }, "chat.conversation_created");
    }

    // Save user message
    await addMessage(conversationId, "user", content);

    // Get history for context
    const history = await getMessages(conversationId);

    // Build custom system prompt for Date Night mode
    const archetype = archetypeId ? getArchetypeById(archetypeId) : undefined;
    const systemPrompt = archetype ? buildDateNightPrompt(archetype) : undefined;

    // Stream completion
    const { stream, fullResponse } = await streamChatCompletion(history, undefined, systemPrompt);

    // Wrap the stream to save assistant message after completion
    const reader = stream.getReader();
    const wrappedStream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (!done) {
          controller.enqueue(value);
          return;
        }
        // Stream finished — save assistant message and create scene
        const encoder = new TextEncoder();
        try {
          const fullText = await fullResponse;

          // Parse scene metadata if in Date Night mode
          const metadata = archetypeId ? parseSceneMetadata(fullText) : null;
          const dialogueToSave = metadata ? metadata.dialogue : fullText;

          // Save clean dialogue as assistant message
          await addMessage(conversationId, "assistant", dialogueToSave);
          logger.info({ conversationId }, "chat.assistant_message_saved");

          // Trigger scene generation if metadata found (or fallback for first scene)
          let sceneId: string | undefined;
          if (metadata && archetypeId) {
            // If AI didn't include a scene description, create a default first-date scene
            if (!metadata.scene && archetype) {
              metadata.scene = `A cozy coffee shop with warm lighting, two drinks on a small table, ${archetype.visualHint}`;
            }
          }
          if (metadata?.scene && archetypeId) {
            try {
              const scene = await createScene(conversationId, null, metadata, archetypeId);
              sceneId = scene.id;
              logger.info({ conversationId, sceneId }, "chat.scene_created");
            } catch (sceneErr) {
              logger.error({ conversationId, error: sceneErr }, "chat.scene_creation_failed");
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                saved: true,
                scene: metadata
                  ? { mood: metadata.mood, thought: metadata.thought, sceneId }
                  : undefined,
              })}\n\n`,
            ),
          );
        } catch (err) {
          logger.error({ conversationId, error: err }, "chat.assistant_message_save_failed");
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Failed to save response" })}\n\n`,
            ),
          );
        }
        controller.close();
      },
    });

    // Return SSE response
    return new Response(wrappedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": conversationId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

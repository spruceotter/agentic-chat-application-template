import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "@/core/config/env";
import { getLogger } from "@/core/logging";
import { creditPurchasedTokens, TOKEN_PACKS } from "@/features/billing";

const logger = getLogger("api.webhooks.chargebee");

/** In-memory set for idempotency. */
const processedEventIds = new Set<string>();

interface LineItem {
  entity_id?: string;
  quantity?: number;
}

interface ChargebeeEvent {
  id: string;
  event_type: string;
  content: {
    invoice?: {
      id?: string;
      customer_id?: string;
      line_items?: LineItem[];
    };
    customer?: { id?: string };
  };
}

function verifyBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice(6);
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const [username, password] = decoded.split(":");
  return username === env.CHARGEBEE_WEBHOOK_USERNAME && password === env.CHARGEBEE_WEBHOOK_PASSWORD;
}

/**
 * Resolve the token pack from Chargebee invoice line items.
 */
function resolvePackFromLineItems(lineItems: LineItem[]): (typeof TOKEN_PACKS)[number] | undefined {
  for (const item of lineItems) {
    const pack = TOKEN_PACKS.find((p) => p.chargebeeItemPriceId === item.entity_id);
    if (pack) {
      return pack;
    }
  }
  return undefined;
}

/**
 * POST /api/webhooks/chargebee
 * Handle Chargebee webhook events.
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifyBasicAuth(request)) {
      logger.warn("webhook.auth_failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = (await request.json()) as ChargebeeEvent;
    logger.info({ eventId: event.id, eventType: event.event_type }, "webhook.received");

    // Idempotency check
    if (processedEventIds.has(event.id)) {
      logger.info({ eventId: event.id }, "webhook.duplicate_skipped");
      return NextResponse.json({ status: "ok" });
    }

    if (event.event_type === "payment_succeeded") {
      const invoice = event.content.invoice;
      const userId = invoice?.customer_id ?? event.content.customer?.id;
      const invoiceId = invoice?.id ?? event.id;
      const lineItems = invoice?.line_items ?? [];

      const pack = resolvePackFromLineItems(lineItems);

      if (userId && pack) {
        await creditPurchasedTokens(userId, pack.id, invoiceId);
        logger.info(
          { userId, packId: pack.id, invoiceId, tokens: pack.tokens },
          "webhook.tokens_credited",
        );
      } else if (userId && lineItems.length === 0) {
        // Free subscription activation — no tokens to credit
        logger.info({ userId, eventId: event.id }, "webhook.free_subscription_payment");
      } else {
        logger.warn(
          { eventId: event.id, userId, lineItemCount: lineItems.length },
          "webhook.no_matching_pack",
        );
      }
    }

    processedEventIds.add(event.id);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message }, "webhook.processing_failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

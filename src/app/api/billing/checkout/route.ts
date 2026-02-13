import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleApiError, unauthorizedResponse } from "@/core/api/errors";
import { env } from "@/core/config/env";
import { getLogger } from "@/core/logging";
import { createClient } from "@/core/supabase/server";
import {
  CHARGEBEE_FREE_PLAN_PRICE_ID,
  PurchaseTokensSchema,
  TOKEN_PACKS,
} from "@/features/billing";

const logger = getLogger("api.billing.checkout");

interface ChargebeeHostedPageResponse {
  hosted_page: {
    id: string;
    url: string;
    state: string;
  };
}

interface ChargebeeErrorResponse {
  api_error_code: string;
  error_code: string;
  error_msg: string;
  http_status_code: number;
}

/**
 * POST /api/billing/checkout
 * Create a Chargebee checkout session for a token pack purchase.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { packId } = PurchaseTokensSchema.parse(body);

    const pack = TOKEN_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    logger.info({ userId: user.id, packId }, "billing.checkout_started");

    const origin = request.nextUrl.origin;

    const formData = new URLSearchParams();
    formData.append("subscription_items[item_price_id][0]", CHARGEBEE_FREE_PLAN_PRICE_ID);
    formData.append("subscription_items[quantity][0]", "1");
    formData.append("subscription_items[item_price_id][1]", pack.chargebeeItemPriceId);
    formData.append("subscription_items[quantity][1]", "1");
    formData.append("subscription_items[charge_once][1]", "true");
    formData.append("customer[id]", user.id);
    if (user.email) {
      formData.append("customer[email]", user.email);
    }
    formData.append("redirect_url", `${origin}/billing/success`);
    formData.append("cancel_url", `${origin}/billing/cancel`);
    formData.append("pass_thru_content", JSON.stringify({ packId, userId: user.id }));

    const apiUrl = `https://${env.CHARGEBEE_SITE}.chargebee.com/api/v2/hosted_pages/checkout_new_for_items`;
    const authHeader = `Basic ${Buffer.from(`${env.CHARGEBEE_API_KEY}:`).toString("base64")}`;

    const cbResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!cbResponse.ok) {
      const errorData = (await cbResponse.json()) as ChargebeeErrorResponse;
      logger.error(
        { error: errorData.error_msg, code: errorData.error_code },
        "billing.checkout_failed",
      );
      return NextResponse.json(
        { error: errorData.error_msg ?? "Chargebee error", code: "CHARGEBEE_ERROR" },
        { status: 502 },
      );
    }

    const data = (await cbResponse.json()) as ChargebeeHostedPageResponse;
    const url = data.hosted_page.url;
    logger.info({ userId: user.id, packId }, "billing.checkout_completed");

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}

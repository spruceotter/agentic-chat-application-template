import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleApiError, unauthorizedResponse } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { createClient } from "@/core/supabase/server";
import { getChargebee } from "@/features/billing/chargebee";

const logger = getLogger("api.billing.portal");

/**
 * POST /api/billing/portal
 * Create a Chargebee portal session for the authenticated user.
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

    logger.info({ userId: user.id }, "billing.portal_started");

    const origin = request.nextUrl.origin;

    const response = await getChargebee().portalSession.create({
      customer: { id: user.id },
      redirect_url: `${origin}/billing`,
    });

    const url = response.portal_session.access_url;
    logger.info({ userId: user.id }, "billing.portal_completed");

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}

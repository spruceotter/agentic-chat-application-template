import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleApiError, unauthorizedResponse } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { createClient } from "@/core/supabase/server";
import { getTransactionHistory } from "@/features/billing";

const logger = getLogger("api.billing.transactions");

/**
 * GET /api/billing/transactions
 * Return paginated transaction history for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));

    logger.info({ userId: user.id, page, pageSize }, "billing.transactions_list_started");

    const result = await getTransactionHistory(user.id, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

import { getLogger } from "@/core/logging";

import { FREE_SIGNUP_TOKENS, TOKEN_PACKS } from "./constants";
import { InsufficientTokensError, InvalidPackError } from "./errors";
import type { TokenTransaction } from "./models";
import * as repository from "./repository";

const logger = getLogger("billing.service");

export async function grantSignupTokens(userId: string): Promise<void> {
  logger.info({ userId }, "billing.signup_tokens_started");

  const balance = await repository.initializeBalance(userId, FREE_SIGNUP_TOKENS);

  await repository.recordTransaction({
    userId,
    amount: FREE_SIGNUP_TOKENS,
    type: "signup_bonus",
    referenceId: null,
    description: "Free signup tokens",
    balanceAfter: balance.balance,
  });

  logger.info({ userId, balance: balance.balance }, "billing.signup_tokens_completed");
}

export async function getTokenBalance(userId: string): Promise<number> {
  const balance = await repository.getBalance(userId);
  if (balance !== undefined) {
    return balance;
  }
  // User has no balance row — create one with 0
  const newBalance = await repository.initializeBalance(userId, 0);
  return newBalance.balance;
}

export async function consumeToken(userId: string, conversationId: string): Promise<number> {
  logger.info({ userId, conversationId }, "billing.consume_started");

  const newBalance = await repository.debitToken(userId);
  if (newBalance === null) {
    logger.warn({ userId, conversationId }, "billing.consume_insufficient");
    throw new InsufficientTokensError();
  }

  await repository.recordTransaction({
    userId,
    amount: -1,
    type: "consumption",
    referenceId: conversationId,
    description: "AI conversation turn",
    balanceAfter: newBalance,
  });

  logger.info({ userId, conversationId, balance: newBalance }, "billing.consume_completed");
  return newBalance;
}

export async function refundToken(userId: string, conversationId: string): Promise<number> {
  logger.info({ userId, conversationId }, "billing.refund_started");

  const newBalance = await repository.creditTokens(userId, 1);

  await repository.recordTransaction({
    userId,
    amount: 1,
    type: "refund",
    referenceId: conversationId,
    description: "Token refunded — AI response failed",
    balanceAfter: newBalance,
  });

  logger.info({ userId, conversationId, balance: newBalance }, "billing.refund_completed");
  return newBalance;
}

export async function creditPurchasedTokens(
  userId: string,
  packId: string,
  chargebeeInvoiceId: string,
): Promise<number> {
  logger.info({ userId, packId, chargebeeInvoiceId }, "billing.purchase_credit_started");

  const pack = TOKEN_PACKS.find((p) => p.id === packId);
  if (!pack) {
    throw new InvalidPackError(packId);
  }

  // Ensure balance row exists
  const existingBalance = await repository.getBalance(userId);
  if (existingBalance === undefined) {
    await repository.initializeBalance(userId, 0);
  }

  const newBalance = await repository.creditTokens(userId, pack.tokens);

  await repository.recordTransaction({
    userId,
    amount: pack.tokens,
    type: "purchase",
    referenceId: chargebeeInvoiceId,
    description: `Purchased ${pack.name}`,
    balanceAfter: newBalance,
  });

  logger.info(
    { userId, packId, tokens: pack.tokens, balance: newBalance },
    "billing.purchase_credit_completed",
  );
  return newBalance;
}

export interface TransactionPage {
  transactions: TokenTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getTransactionHistory(
  userId: string,
  page: number,
  pageSize: number,
): Promise<TransactionPage> {
  logger.info({ userId, page, pageSize }, "billing.transactions_started");

  const offset = (page - 1) * pageSize;
  const [txns, total] = await Promise.all([
    repository.getTransactions(userId, pageSize, offset),
    repository.getTransactionCount(userId),
  ]);

  logger.info({ userId, count: txns.length, total }, "billing.transactions_completed");
  return {
    transactions: txns,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

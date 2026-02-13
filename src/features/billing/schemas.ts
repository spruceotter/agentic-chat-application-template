import { z } from "zod/v4";

export const PurchaseTokensSchema = z.object({
  packId: z.enum(["pack-50", "pack-150", "pack-500"]),
});

export type PurchaseTokensInput = z.infer<typeof PurchaseTokensSchema>;

export const TokenBalanceResponseSchema = z.object({
  balance: z.number().int().min(0),
});

export type TokenBalanceResponse = z.infer<typeof TokenBalanceResponseSchema>;

export const TokenTransactionResponseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().int(),
  type: z.string(),
  referenceId: z.string().nullable(),
  description: z.string().nullable(),
  balanceAfter: z.number().int(),
  createdAt: z.date(),
});

export type TokenTransactionResponse = z.infer<typeof TokenTransactionResponseSchema>;

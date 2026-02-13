import { beforeEach, describe, expect, it, mock } from "bun:test";

import type { TokenBalance, TokenTransaction } from "../models";

const mockRepository = {
  getBalance: mock<(userId: string) => Promise<number | undefined>>(() =>
    Promise.resolve(undefined),
  ),
  initializeBalance: mock<(userId: string, initialBalance: number) => Promise<TokenBalance>>(() =>
    Promise.resolve({} as TokenBalance),
  ),
  creditTokens: mock<(userId: string, amount: number) => Promise<number>>(() => Promise.resolve(0)),
  debitToken: mock<(userId: string) => Promise<number | null>>(() => Promise.resolve(null)),
  recordTransaction: mock<(data: unknown) => Promise<TokenTransaction>>(() =>
    Promise.resolve({} as TokenTransaction),
  ),
  getTransactions: mock<
    (userId: string, limit: number, offset: number) => Promise<TokenTransaction[]>
  >(() => Promise.resolve([])),
  getTransactionCount: mock<(userId: string) => Promise<number>>(() => Promise.resolve(0)),
};

mock.module("../repository", () => mockRepository);

const {
  consumeToken,
  creditPurchasedTokens,
  getTokenBalance,
  getTransactionHistory,
  grantSignupTokens,
  refundToken,
} = await import("../service");

const userId = "550e8400-e29b-41d4-a716-446655440001";
const conversationId = "550e8400-e29b-41d4-a716-446655440010";

describe("grantSignupTokens", () => {
  beforeEach(() => {
    mockRepository.initializeBalance.mockReset();
    mockRepository.recordTransaction.mockReset();
  });

  it("initializes balance with 10 tokens and records transaction", async () => {
    mockRepository.initializeBalance.mockResolvedValue({
      userId,
      balance: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepository.recordTransaction.mockResolvedValue({} as TokenTransaction);

    await grantSignupTokens(userId);

    expect(mockRepository.initializeBalance).toHaveBeenCalledWith(userId, 10);
    expect(mockRepository.recordTransaction).toHaveBeenCalledTimes(1);
  });
});

describe("getTokenBalance", () => {
  beforeEach(() => {
    mockRepository.getBalance.mockReset();
    mockRepository.initializeBalance.mockReset();
  });

  it("returns existing balance", async () => {
    mockRepository.getBalance.mockResolvedValue(5);

    const result = await getTokenBalance(userId);

    expect(result).toBe(5);
  });

  it("creates balance row with 0 if missing", async () => {
    mockRepository.getBalance.mockResolvedValue(undefined);
    mockRepository.initializeBalance.mockResolvedValue({
      userId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getTokenBalance(userId);

    expect(result).toBe(0);
    expect(mockRepository.initializeBalance).toHaveBeenCalledWith(userId, 0);
  });
});

describe("consumeToken", () => {
  beforeEach(() => {
    mockRepository.debitToken.mockReset();
    mockRepository.recordTransaction.mockReset();
  });

  it("debits token and records transaction on success", async () => {
    mockRepository.debitToken.mockResolvedValue(9);
    mockRepository.recordTransaction.mockResolvedValue({} as TokenTransaction);

    const result = await consumeToken(userId, conversationId);

    expect(result).toBe(9);
    expect(mockRepository.debitToken).toHaveBeenCalledWith(userId);
    expect(mockRepository.recordTransaction).toHaveBeenCalledTimes(1);
  });

  it("throws InsufficientTokensError when debit returns null", async () => {
    mockRepository.debitToken.mockResolvedValue(null);

    await expect(consumeToken(userId, conversationId)).rejects.toThrow("Insufficient tokens");
  });
});

describe("refundToken", () => {
  beforeEach(() => {
    mockRepository.creditTokens.mockReset();
    mockRepository.recordTransaction.mockReset();
  });

  it("credits 1 token and records refund transaction", async () => {
    mockRepository.creditTokens.mockResolvedValue(10);
    mockRepository.recordTransaction.mockResolvedValue({} as TokenTransaction);

    const result = await refundToken(userId, conversationId);

    expect(result).toBe(10);
    expect(mockRepository.creditTokens).toHaveBeenCalledWith(userId, 1);
    expect(mockRepository.recordTransaction).toHaveBeenCalledTimes(1);
  });
});

describe("creditPurchasedTokens", () => {
  beforeEach(() => {
    mockRepository.getBalance.mockReset();
    mockRepository.initializeBalance.mockReset();
    mockRepository.creditTokens.mockReset();
    mockRepository.recordTransaction.mockReset();
  });

  it("credits correct amount for valid pack", async () => {
    mockRepository.getBalance.mockResolvedValue(0);
    mockRepository.creditTokens.mockResolvedValue(50);
    mockRepository.recordTransaction.mockResolvedValue({} as TokenTransaction);

    const result = await creditPurchasedTokens(userId, "pack-50", "inv_123");

    expect(result).toBe(50);
    expect(mockRepository.creditTokens).toHaveBeenCalledWith(userId, 50);
  });

  it("creates balance row if missing", async () => {
    mockRepository.getBalance.mockResolvedValue(undefined);
    mockRepository.initializeBalance.mockResolvedValue({
      userId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepository.creditTokens.mockResolvedValue(150);
    mockRepository.recordTransaction.mockResolvedValue({} as TokenTransaction);

    const result = await creditPurchasedTokens(userId, "pack-150", "inv_456");

    expect(result).toBe(150);
    expect(mockRepository.initializeBalance).toHaveBeenCalledWith(userId, 0);
  });

  it("throws InvalidPackError for invalid pack", async () => {
    await expect(creditPurchasedTokens(userId, "pack-999", "inv_789")).rejects.toThrow(
      "Invalid token pack",
    );
  });
});

describe("getTransactionHistory", () => {
  beforeEach(() => {
    mockRepository.getTransactions.mockReset();
    mockRepository.getTransactionCount.mockReset();
  });

  it("returns paginated transactions", async () => {
    const mockTxns = [{ id: "tx-1" } as TokenTransaction];
    mockRepository.getTransactions.mockResolvedValue(mockTxns);
    mockRepository.getTransactionCount.mockResolvedValue(1);

    const result = await getTransactionHistory(userId, 1, 10);

    expect(result.transactions).toEqual(mockTxns);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it("returns empty page when no transactions", async () => {
    mockRepository.getTransactions.mockResolvedValue([]);
    mockRepository.getTransactionCount.mockResolvedValue(0);

    const result = await getTransactionHistory(userId, 1, 10);

    expect(result.transactions).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

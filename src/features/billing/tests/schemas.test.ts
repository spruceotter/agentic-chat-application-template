import { describe, expect, it } from "bun:test";

import { PurchaseTokensSchema, TokenBalanceResponseSchema } from "../schemas";

describe("PurchaseTokensSchema", () => {
  it("validates pack-50", () => {
    const result = PurchaseTokensSchema.parse({ packId: "pack-50" });
    expect(result.packId).toBe("pack-50");
  });

  it("validates pack-150", () => {
    const result = PurchaseTokensSchema.parse({ packId: "pack-150" });
    expect(result.packId).toBe("pack-150");
  });

  it("validates pack-500", () => {
    const result = PurchaseTokensSchema.parse({ packId: "pack-500" });
    expect(result.packId).toBe("pack-500");
  });

  it("rejects invalid pack ID", () => {
    expect(() => PurchaseTokensSchema.parse({ packId: "pack-999" })).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => PurchaseTokensSchema.parse({ packId: "" })).toThrow();
  });

  it("rejects missing packId", () => {
    expect(() => PurchaseTokensSchema.parse({})).toThrow();
  });
});

describe("TokenBalanceResponseSchema", () => {
  it("validates valid balance", () => {
    const result = TokenBalanceResponseSchema.parse({ balance: 10 });
    expect(result.balance).toBe(10);
  });

  it("validates zero balance", () => {
    const result = TokenBalanceResponseSchema.parse({ balance: 0 });
    expect(result.balance).toBe(0);
  });

  it("rejects negative balance", () => {
    expect(() => TokenBalanceResponseSchema.parse({ balance: -1 })).toThrow();
  });

  it("rejects non-integer balance", () => {
    expect(() => TokenBalanceResponseSchema.parse({ balance: 1.5 })).toThrow();
  });
});

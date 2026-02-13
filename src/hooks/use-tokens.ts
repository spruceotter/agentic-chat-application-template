"use client";

import { useCallback, useEffect, useState } from "react";

import { LOW_BALANCE_THRESHOLD } from "@/features/billing/constants";

export function useTokens() {
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/balance");
      if (res.ok) {
        const data = (await res.json()) as { balance: number };
        setBalance(data.balance);
      }
    } catch {
      // Silently fail — balance will show as loading
    }
  }, []);

  const decrementBalance = useCallback(() => {
    setBalance((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const refreshBalance = useCallback(() => {
    void fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  const isLowBalance = balance !== null && balance <= LOW_BALANCE_THRESHOLD;
  const hasTokens = balance !== null && balance > 0;

  return {
    balance,
    isLowBalance,
    hasTokens,
    decrementBalance,
    refreshBalance,
  };
}

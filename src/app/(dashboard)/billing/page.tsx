"use client";

import { Coins, ExternalLink, History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TOKEN_PACKS } from "@/features/billing/constants";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  referenceId: string | null;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
}

interface TransactionPage {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function BillingPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TransactionPage | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [txPage, setTxPage] = useState(1);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/balance");
      if (res.ok) {
        const data = (await res.json()) as { balance: number };
        setBalance(data.balance);
      }
    } catch {
      toast.error("Failed to load balance");
    }
  }, []);

  const fetchTransactions = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/billing/transactions?page=${page}&pageSize=10`);
      if (res.ok) {
        const data = (await res.json()) as TransactionPage;
        setTransactions(data);
      }
    } catch {
      toast.error("Failed to load transactions");
    }
  }, []);

  useEffect(() => {
    void fetchBalance();
    void fetchTransactions(1);
  }, [fetchBalance, fetchTransactions]);

  const handleBuyPack = useCallback(async (packId: string) => {
    setLoadingPack(packId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        window.location.href = data.url;
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Failed to create checkout session");
      }
    } catch {
      toast.error("Failed to create checkout session");
    } finally {
      setLoadingPack(null);
    }
  }, []);

  const handleManageBilling = useCallback(async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        window.open(data.url, "_blank");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Failed to open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setLoadingPortal(false);
    }
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setTxPage(page);
      void fetchTransactions(page);
    },
    [fetchTransactions],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your tokens and purchases</p>
      </div>

      {/* Balance Display */}
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Coins className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Token Balance</p>
            {balance === null ? (
              <Skeleton className="mt-1 h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold tabular-nums">{balance}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Packs */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Buy Tokens</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOKEN_PACKS.map((pack) => (
            <Card key={pack.id}>
              <CardHeader>
                <CardTitle>{pack.name}</CardTitle>
                <CardDescription>{pack.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-2xl font-bold">${(pack.priceInCents / 100).toFixed(2)}</span>
                <Button
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={loadingPack !== null}
                  data-testid={`buy-${pack.id}`}
                >
                  {loadingPack === pack.id ? "Loading..." : "Buy"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Manage Billing */}
      <div>
        <Button variant="outline" onClick={handleManageBilling} disabled={loadingPortal}>
          <ExternalLink className="size-4" />
          {loadingPortal ? "Loading..." : "Manage Billing"}
        </Button>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <History className="size-5" />
          Transaction History
        </h2>
        {transactions === null ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : transactions.transactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No transactions yet
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Description</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{tx.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(txPage - 1)}
                  disabled={txPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {txPage} of {transactions.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(txPage + 1)}
                  disabled={txPage >= transactions.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

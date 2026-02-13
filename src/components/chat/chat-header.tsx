"use client";

import { Coins, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  title: string | null;
  onToggleSidebar: () => void;
  tokenBalance: number | null;
  isLowBalance: boolean;
}

export function ChatHeader({
  title,
  onToggleSidebar,
  tokenBalance,
  isLowBalance,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="truncate text-lg font-semibold">{title ?? "New Chat"}</h1>
      </div>
      <div className="flex items-center gap-3">
        {tokenBalance === null ? (
          <Skeleton className="h-6 w-16 rounded-full" />
        ) : (
          <Badge
            variant={isLowBalance ? "destructive" : "secondary"}
            className={cn("flex items-center gap-1 tabular-nums")}
            data-testid="token-balance"
          >
            <Coins className="size-3.5" />
            {tokenBalance}
          </Badge>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

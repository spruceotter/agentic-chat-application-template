"use client";

import { cn } from "@/lib/utils";

interface ThoughtBubbleProps {
  thought: string;
  className?: string;
}

export function ThoughtBubble({ thought, className }: ThoughtBubbleProps) {
  return (
    <div className={cn("relative max-w-[280px]", className)}>
      {/* Main bubble */}
      <div className="rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm italic text-white shadow-xl backdrop-blur-md">
        <span className="mr-1 not-italic opacity-70">{"\u{1F4AD}"}</span>
        {thought}
      </div>
      {/* Bubble tail dots */}
      <div className="ml-6 flex flex-col items-start gap-1 pt-1">
        <div className="size-2.5 rounded-full bg-black/40 backdrop-blur-sm" />
        <div className="ml-1 size-1.5 rounded-full bg-black/30 backdrop-blur-sm" />
      </div>
    </div>
  );
}

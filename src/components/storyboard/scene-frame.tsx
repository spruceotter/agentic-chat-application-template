"use client";

import { cn } from "@/lib/utils";

interface SceneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function SceneFrame({ children, className }: SceneFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      {/* Halftone corner decoration - top left */}
      <div className="pointer-events-none absolute top-0 left-0 z-10 size-16 opacity-20">
        <div
          className="size-full"
          style={{
            background: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "4px 4px",
          }}
        />
      </div>
      {/* Halftone corner decoration - bottom right */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-10 size-16 opacity-20">
        <div
          className="size-full"
          style={{
            background: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "4px 4px",
          }}
        />
      </div>
      {children}
    </div>
  );
}

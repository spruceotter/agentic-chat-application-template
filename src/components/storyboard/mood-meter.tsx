"use client";

import { MOODS } from "@/features/storyboard/constants";
import { cn } from "@/lib/utils";

const DEFAULT_MOOD = { emoji: "\u{1F60A}", color: "#ffb347", label: "Vibing" };

interface MoodMeterProps {
  mood: string;
  className?: string;
}

export function MoodMeter({ mood, className }: MoodMeterProps) {
  const moodData =
    (MOODS as Record<string, { emoji: string; color: string; label: string }>)[mood] ??
    DEFAULT_MOOD;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-sm transition-all duration-300",
        className,
      )}
      style={{
        backgroundColor: `${moodData.color}20`,
        borderColor: `${moodData.color}40`,
        borderWidth: "1px",
        color: moodData.color,
      }}
    >
      <span className="animate-bounce text-lg">{moodData.emoji}</span>
      <span>{moodData.label}</span>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

const MOODS: Record<string, { emoji: string; color: string; label: string }> = {
  excited: { emoji: "\u{1F60D}", color: "#ff69b4", label: "Smitten" },
  flirty: { emoji: "\u{1F60F}", color: "#ff1493", label: "Flirty" },
  happy: { emoji: "\u{1F60A}", color: "#ffb347", label: "Vibing" },
  laughing: { emoji: "\u{1F602}", color: "#ffd700", label: "Dying" },
  nervous: { emoji: "\u{1F605}", color: "#87ceeb", label: "Nervous" },
  impressed: { emoji: "\u{1F929}", color: "#9b59b6", label: "Impressed" },
  bored: { emoji: "\u{1F610}", color: "#95a5a6", label: "Bored" },
  annoyed: { emoji: "\u{1F624}", color: "#e74c3c", label: "Annoyed" },
  awkward: { emoji: "\u{1F62C}", color: "#f39c12", label: "Awkward" },
  charmed: { emoji: "\u{1F970}", color: "#e91e63", label: "Charmed" },
};

interface MoodMeterProps {
  mood: string;
  className?: string;
}

export function MoodMeter({ mood, className }: MoodMeterProps) {
  const moodData = MOODS[mood] ?? { emoji: "\u{1F60A}", color: "#ffb347", label: "Vibing" };

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

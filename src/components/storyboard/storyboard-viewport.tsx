"use client";

import { ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import type { StoryboardScene } from "@/hooks/use-storyboard";

import { MoodMeter } from "./mood-meter";
import { SceneFrame } from "./scene-frame";
import { ThoughtBubble } from "./thought-bubble";

interface StoryboardViewportProps {
  scene: StoryboardScene | null;
  isGenerating: boolean;
}

export function StoryboardViewport({ scene, isGenerating }: StoryboardViewportProps) {
  // No scene yet — show placeholder
  if (!scene) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="bg-primary/10 flex size-20 items-center justify-center rounded-2xl">
          <Sparkles className="text-primary size-10" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Your date awaits...</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Pick a date and start chatting to see the story unfold!
          </p>
        </div>
      </div>
    );
  }

  // Scene is generating — show skeleton
  if (scene.status === "generating" || (isGenerating && !scene.imageUrl)) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        {/* Mood meter at top */}
        <div className="flex justify-center">
          <MoodMeter mood={scene.mood} />
        </div>

        {/* Generating skeleton */}
        <SceneFrame className="flex-1">
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8">
            <Skeleton className="aspect-video w-full rounded-md" />
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon className="text-muted-foreground size-4 animate-pulse" />
              <span className="text-muted-foreground italic">Setting the scene...</span>
            </div>
          </div>
        </SceneFrame>

        {/* Thought bubble */}
        {scene.thought && (
          <div className="flex justify-end">
            <ThoughtBubble thought={scene.thought} />
          </div>
        )}
      </div>
    );
  }

  // Scene complete (or failed) — show image
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Mood meter at top */}
      <div className="flex justify-center">
        <MoodMeter mood={scene.mood} />
      </div>

      {/* Scene image */}
      <SceneFrame className="flex-1">
        {scene.imageUrl ? (
          <Image
            src={scene.imageUrl}
            alt={scene.sceneDescription}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-8">
            <ImageIcon className="text-muted-foreground size-8" />
            <span className="text-muted-foreground text-sm">
              {scene.status === "failed" ? "Scene generation failed" : "No image available"}
            </span>
          </div>
        )}
      </SceneFrame>

      {/* Thought bubble */}
      {scene.thought && (
        <div className="flex justify-end">
          <ThoughtBubble thought={scene.thought} />
        </div>
      )}
    </div>
  );
}

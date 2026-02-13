"use client";

import { Camera, ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

import type { StoryboardScene } from "@/hooks/use-storyboard";

import { MoodMeter } from "./mood-meter";
import { SceneFrame } from "./scene-frame";
import { ThoughtBubble } from "./thought-bubble";

interface StoryboardViewportProps {
  scene: StoryboardScene | null;
  isGenerating: boolean;
}

function GeneratingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Animated camera icon */}
      <div className="relative mb-3">
        <div className="absolute inset-0 animate-ping rounded-full bg-pink-500/30" />
        <div className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30">
          <Camera className="size-6 text-white" />
        </div>
      </div>

      <p className="text-sm font-semibold text-white">Generating scene...</p>

      {/* Animated dots */}
      <div className="mt-2 flex gap-1.5">
        <div
          className="size-2 animate-bounce rounded-full bg-pink-400"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="size-2 animate-bounce rounded-full bg-purple-400"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="size-2 animate-bounce rounded-full bg-pink-400"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
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

  const showGenerating = scene.status === "generating" || (isGenerating && !scene.imageUrl);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Mood meter at top */}
      <div className="flex justify-center">
        <MoodMeter mood={scene.mood} />
      </div>

      {/* Scene image with optional generating overlay */}
      <SceneFrame className="flex-1">
        {scene.imageUrl ? (
          <>
            <Image
              src={scene.imageUrl}
              alt={scene.sceneDescription}
              fill
              unoptimized
              className="object-cover"
            />
            {/* Overlay while next scene generates (keeps previous image visible) */}
            {showGenerating && <GeneratingOverlay />}
          </>
        ) : showGenerating ? (
          <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <GeneratingOverlay />
          </div>
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

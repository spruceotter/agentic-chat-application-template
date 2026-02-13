"use client";

import { Camera, ChevronUp, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { StoryboardScene } from "@/hooks/use-storyboard";

import { MoodMeter } from "./mood-meter";
import { SceneFrame } from "./scene-frame";
import { ThoughtBubble } from "./thought-bubble";

interface MobileSceneStripProps {
  scene: StoryboardScene;
  isGenerating: boolean;
}

function MiniGeneratingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-pink-500/20 px-2.5 py-1 text-xs font-medium text-pink-400">
      <Camera className="size-3 animate-pulse" />
      <span>Generating...</span>
    </div>
  );
}

export function MobileSceneStrip({ scene, isGenerating }: MobileSceneStripProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const showGenerating = scene.status === "generating" || (isGenerating && !scene.imageUrl);

  return (
    <>
      {/* Compact strip — tappable */}
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="relative flex w-full items-center gap-3 border-b border-border/50 bg-black/40 px-3 py-2 backdrop-blur-sm"
      >
        {/* Thumbnail */}
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border-2 border-foreground">
          {scene.imageUrl ? (
            <Image
              src={scene.imageUrl}
              alt={scene.sceneDescription}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Camera className="size-5 text-pink-400/60" />
            </div>
          )}
        </div>

        {/* Mood + thought preview */}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <div className="flex items-center gap-2">
            <MoodMeter mood={scene.mood} className="scale-75 origin-left" />
            {showGenerating && <MiniGeneratingIndicator />}
          </div>
          {scene.thought && (
            <p className="w-full truncate text-left text-xs italic text-white/50">
              {scene.thought}
            </p>
          )}
        </div>

        {/* Expand hint */}
        <ChevronUp className="size-4 shrink-0 text-white/30" />
      </button>

      {/* Expanded overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
          {/* Close button */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-white/60">Scene View</span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex size-8 items-center justify-center rounded-full bg-white/10"
            >
              <X className="size-4 text-white" />
            </button>
          </div>

          {/* Full scene */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6">
            {/* Mood */}
            <div className="flex justify-center">
              <MoodMeter mood={scene.mood} />
            </div>

            {/* Scene image */}
            <SceneFrame className="relative aspect-[4/3] w-full">
              {scene.imageUrl ? (
                <>
                  <Image
                    src={scene.imageUrl}
                    alt={scene.sceneDescription}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {showGenerating && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="size-8 animate-pulse text-pink-400" />
                        <p className="text-sm font-medium text-white">Generating scene...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : showGenerating ? (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="size-8 animate-pulse text-pink-400" />
                    <p className="text-sm font-medium text-white">Generating scene...</p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-red-500/10 to-orange-500/10">
                  <span className="text-sm text-white/50">
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

            {/* Scene description */}
            <p className="text-center text-xs text-white/30">{scene.sceneDescription}</p>
          </div>

          {/* Tap to close hint */}
          <div className="px-4 pb-4 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/20"
            >
              Back to Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
}

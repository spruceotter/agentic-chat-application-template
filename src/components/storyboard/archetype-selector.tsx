"use client";

import Image from "next/image";
import { useState } from "react";

import type { Archetype, Gender } from "@/features/storyboard/constants";
import { ARCHETYPES } from "@/features/storyboard/constants";

interface ArchetypeSelectorProps {
  onSelect: (archetypeId: string) => void;
}

function CharacterCard({ archetype, onSelect }: { archetype: Archetype; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]"
    >
      {/* Character image */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={archetype.previewImageUrl}
          alt={archetype.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Emoji badge */}
        <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-lg backdrop-blur-sm">
          {archetype.emoji}
        </div>
      </div>

      {/* Character info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-bold tracking-wide text-white">{archetype.name}</h3>
        <p className="text-[11px] leading-snug text-white/50">{archetype.tagline}</p>
      </div>

      {/* Hover CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-pink-500/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
        <span className="rounded-full bg-pink-500 px-5 py-2 text-sm font-bold text-white shadow-lg">
          Go on a Date
        </span>
      </div>
    </button>
  );
}

export function ArchetypeSelector({ onSelect }: ArchetypeSelectorProps) {
  const [gender, setGender] = useState<Gender>("female");

  const filtered = ARCHETYPES.filter((a) => a.gender === gender);

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto">
      {/* Hero header */}
      <div className="relative w-full bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent px-4 pt-6 pb-4 sm:pt-10 sm:pb-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
            Date Night
          </h1>
          <p className="mt-2 text-xs text-white/40 sm:mt-3 sm:text-sm">
            Choose your date. Survive the evening. Try not to fall in love.
          </p>
        </div>

        {/* Gender toggle */}
        <div className="mx-auto mt-6 flex w-fit rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
              gender === "female"
                ? "bg-pink-500 text-white shadow-lg"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Women
          </button>
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
              gender === "male"
                ? "bg-blue-500 text-white shadow-lg"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Men
          </button>
        </div>
      </div>

      {/* Character grid */}
      <div className="w-full max-w-3xl px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-4">
          {filtered.map((archetype) => (
            <CharacterCard
              key={archetype.id}
              archetype={archetype}
              onSelect={() => onSelect(archetype.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

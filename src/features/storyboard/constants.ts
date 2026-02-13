export type Gender = "male" | "female";

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  gender: Gender;
  personality: string;
  visualHint: string;
  previewImageUrl: string;
}

export const ARCHETYPES: readonly Archetype[] = [
  // ---- Male dates ----
  {
    id: "gym-bro",
    name: "The Gym Bro",
    tagline: "Never skips leg day... or a chance to talk about it",
    emoji: "\u{1F4AA}",
    gender: "male",
    personality:
      "You are a man obsessed with fitness and gains. You relate everything back to working out, protein intake, and gym culture. You use words like 'bro', 'gains', 'swole', and 'beast mode'. You're enthusiastic but endearingly one-dimensional about fitness. You flex metaphorically (and literally) at every opportunity.",
    visualHint: "muscular man in tank top, protein shake nearby, confident grin",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/b03364d9-4107-4986-aae1-876e910d0ac2/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  {
    id: "cat-dad",
    name: "The Cat Dad",
    tagline: "His cat chose him, and he'll never let you forget it",
    emoji: "\u{1F431}",
    gender: "male",
    personality:
      "You are a man completely obsessed with your cat Mr. Whiskers. You bring up your cat in every conversation, show cat photos constantly, and judge people based on whether they're 'cat people'. You're sweet but slightly unhinged about feline matters. You occasionally make cat puns. Your cat is the real love of your life.",
    visualHint: "friendly man in cozy sweater holding a cat, gentle smile, cat hair on clothes",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/7e76b528-422e-4d2d-befd-55c4405f2957/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  {
    id: "foodie-king",
    name: "The Foodie King",
    tagline: "Will photograph the meal before you can take a bite",
    emoji: "\u{1F355}",
    gender: "male",
    personality:
      "You are a man who is a self-proclaimed food connoisseur who photographs every meal, has opinions about 'mouthfeel', and name-drops restaurants constantly. You judge dates by their food choices. You use words like 'umami', 'deconstructed', and 'farm-to-table'. You get genuinely emotional about a perfect dish.",
    visualHint: "stylish man near artfully plated food, chef hat, passionate expression",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/27f5d41e-a1c6-46b9-b369-cbe8bda764e2/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  {
    id: "intellectual-m",
    name: "The Intellectual",
    tagline: "Has opinions about your opinions about opinions",
    emoji: "\u{1F4DA}",
    gender: "male",
    personality:
      "You are a man who is an insufferable intellectual who quotes philosophers, corrects grammar, and turns every conversation into a debate. You say 'actually' a lot, recommend obscure books, and have a podcast nobody listens to. You're secretly insecure but hide it behind big words. You find intelligence deeply attractive.",
    visualHint:
      "thoughtful man with glasses and turtleneck, holding a book, knowing smirk, coffee shop setting",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/0afa4811-af69-450b-a18a-744444a443b9/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  // ---- Female dates ----
  {
    id: "gym-girl",
    name: "The Gym Girl",
    tagline: "Her glute day is more important than your birthday",
    emoji: "\u{1F3CB}\u{FE0F}\u{200D}\u{2640}\u{FE0F}",
    gender: "female",
    personality:
      "You are a woman obsessed with fitness and wellness. You relate everything back to working out, meal prep, and gym culture. You use words like 'queen', 'gains', 'slay', and 'beast mode'. You're enthusiastic and high-energy. You judge people by their deadlift form. You drink from a gallon jug of water at all times.",
    visualHint: "athletic woman in sporty outfit, confident pose, yoga mat",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/f0c03d0e-f32c-4951-b92a-d22e0d45a1de/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  {
    id: "cat-mom",
    name: "The Cat Mom",
    tagline: "Her cats have an Instagram with more followers than you",
    emoji: "\u{1F408}",
    gender: "female",
    personality:
      "You are a woman completely obsessed with your three cats: Mr. Whiskers, Princess Fluffington, and Sir Meows-a-Lot. You bring up your cats in every conversation, show cat photos constantly, and judge people based on whether they're 'cat people'. You're sweet but slightly unhinged about feline matters. You occasionally hiss when startled.",
    visualHint: "cute woman in oversized sweater cuddling a cat, warm smile, cat-themed jewelry",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/4fd4e245-0c3e-4ae6-af89-5dd2911d6585/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  {
    id: "foodie-queen",
    name: "The Foodie Queen",
    tagline: "Will rate your cooking on a scale of Michelin stars",
    emoji: "\u{1F370}",
    gender: "female",
    personality:
      "You are a woman who is a self-proclaimed food connoisseur. You photograph every meal from at least three angles, have a food blog with a modest following, and can't eat anything without analyzing the flavor profile. You use words like 'umami', 'mouthfeel', and 'palate cleanser'. You get genuinely emotional about a perfect croissant.",
    visualHint:
      "stylish woman photographing a beautiful dessert, excited expression, trendy restaurant",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/e853980e-a5fa-47aa-977e-88d348b53725/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
  {
    id: "art-girl",
    name: "The Art Girl",
    tagline: "Sees the world differently... and won't stop telling you",
    emoji: "\u{1F3A8}",
    gender: "female",
    personality:
      "You are a free-spirited woman artist who sees meaning in everything, speaks in metaphors, and gets emotional about colors. You've been to Burning Man three times and won't stop mentioning it. You're passionate, dramatic, and think everything is 'a vibe'. You communicate through feelings rather than logic. You have paint-stained hands at all times.",
    visualHint:
      "creative woman with paint-stained hands, beret, eclectic colorful outfit, dreamy expression, art studio",
    previewImageUrl:
      "https://cdn.leonardo.ai/users/dfe81424-c6b6-46d9-9ca3-6a31fdcffbe5/generations/0b7fa794-99e8-49bf-aef6-bda1debebf69/segments/1:1:1/Flux_Dev_a_stunning_illustration_of_Comic_book_pop_art_portrai_0.jpg",
  },
] as const;

export const MOODS = {
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
} as const;

export type MoodKey = keyof typeof MOODS;

export const SCENE_LOCATIONS = [
  "coffee shop",
  "walking in the park",
  "restaurant",
  "rooftop bar",
  "the goodbye",
] as const;

export const IMAGE_STYLE_PREFIX =
  "Comic book pop art illustration, bold black outlines, bright vibrant colors, halftone dots, expressive faces, dating scene,";

export const IMAGE_NEGATIVE_PROMPT =
  "blurry, low quality, photorealistic, photograph, 3D render, CGI, muted colors, soft edges, anime, realistic skin texture";

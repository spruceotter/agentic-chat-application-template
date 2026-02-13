import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { storyboardScenes } from "@/core/database/schema";

export { storyboardScenes };

export type Scene = InferSelectModel<typeof storyboardScenes>;
export type NewScene = InferInsertModel<typeof storyboardScenes>;

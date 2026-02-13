type StoryboardErrorCode =
  | "SCENE_NOT_FOUND"
  | "IMAGE_GENERATION_FAILED"
  | "LEONARDO_API_ERROR"
  | "METADATA_PARSE_ERROR";

type HttpStatusCode = 400 | 404 | 500 | 502;

export class StoryboardError extends Error {
  readonly code: StoryboardErrorCode;
  readonly statusCode: HttpStatusCode;

  constructor(message: string, code: StoryboardErrorCode, statusCode: HttpStatusCode) {
    super(message);
    this.name = "StoryboardError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class SceneNotFoundError extends StoryboardError {
  constructor(id: string) {
    super(`Scene not found: ${id}`, "SCENE_NOT_FOUND", 404);
  }
}

export class ImageGenerationError extends StoryboardError {
  constructor(message: string) {
    super(message, "IMAGE_GENERATION_FAILED", 500);
  }
}

export class LeonardoApiError extends StoryboardError {
  constructor(message: string) {
    super(`Leonardo API error: ${message}`, "LEONARDO_API_ERROR", 502);
  }
}

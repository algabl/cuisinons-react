import type { db } from "@cuisinons/db/client";

import type { RecipeApiData } from "../schemas";

export type ImportErrorType =
  | "VALIDATION_FAILED"
  | "EXTRACTION_ERROR"
  | "PARSING_ERROR"
  | "NO_RECIPE_FOUND"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR";

export class ImportError extends Error {
  constructor(
    message: string,
    public readonly type: ImportErrorType,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "ImportError";
  }
}

export interface ImportContext {
  userId: string;
  db: typeof db;
}

export interface ImportResult {
  status: "success" | "partial" | "manual_required" | "failed";
  recipe?: Partial<RecipeApiData>;
  extractionMethod?: "schema_org" | "html_scraping" | "llm" | "manual";
  warnings?: string[];
  sourceUrl?: string;
  confidence?: number; // 0-100% confidence in extraction quality
  missingFields?: string[];
  recipeId?: string; // ID of created recipe if successful
}

export interface ExtractorResult {
  status: "success" | "failed";
  recipe?: Partial<RecipeApiData>;
  warnings?: string[];
  confidence?: number;
  missingFields?: string[];
}

export interface ExtractorInput {
  html?: string;
  content?: string;
  url: string;
  options?: ExtractorOptions;
}

export interface ExtractorOptions {
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  [key: string]: any;
}

export interface RecipeExtractor {
  readonly name: string;
  readonly priority: number;
  readonly options?: Record<string, any>;
  canHandle(input: ExtractorInput): boolean;
  extract(input: ExtractorInput): Promise<ExtractorResult>;
}

export interface LLMExtractor extends RecipeExtractor {
  provider?: "openai" | "anthropic" | "local";
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ImportOptions {
  url: string;
  userId: string;
  db: typeof db;
  skipDirectFetch?: boolean;
}

export interface TextImportOptions {
  content: string;
  sourceUrl?: string;
  userId: string;
  db: typeof db;
}

// Constants
export const USER_AGENT =
  "CuisinonsBot/1.0 (Personal Recipe Manager; +https://cuisinons.app/bot)";
export const IMPORT_TIMEOUT = 30000; // 30 seconds
export const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB

import type { recipes } from "@cuisinons/db/schema";

import type { Context } from "../trpc";

export interface ImportOptions {
  url: string;
  skipDirectFetch?: boolean;
  ctx: Context;
}

export interface TextImportOptions {
  content?: string;
  sourceUrl?: string;
  ctx: Context;
}

export interface ImportResult {
  status: "success" | "failed" | "manual_required";
  recipeId?: string;
  recipe?: Partial<typeof recipes.$inferInsert>; // Replace with actual Recipe type
  sourceUrl?: string;
  warnings?: string[];
}

export interface ExtractorInput {
  html?: string;
  content?: string;
  url: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}
export interface ExtractorResult {
  status: "success" | "failed";
  recipe?: Partial<typeof recipes.$inferInsert>; // Replace with actual Recipe type
  confidence: number;
  extractionMethod?: string;
  sourceUrl?: string;
  warnings?: string[];
  missingFields?: string[];
}

export interface RecipeExtractor {
  readonly name: string;
  canHandle(input: ExtractorInput): boolean;
  extract(input: ExtractorInput): Promise<ExtractorResult>;
}

export const IMPORT_TIMEOUT_MS = 45000;
export const USER_AGENT =
  "CuisinonsBot/1.0 (+https://cuisinons.imalexblack.dev)";
export const MAX_CONTENT_LENGTH = 1000000; // 100 KB
export const CONFIDENCE_THRESHOLD = 0.6;

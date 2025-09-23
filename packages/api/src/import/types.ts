import type { db } from "@cuisinons/db/client";

import type { RecipeApiData } from "../schemas";

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

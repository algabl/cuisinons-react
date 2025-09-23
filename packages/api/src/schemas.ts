import { z } from "zod/v4";

import { UNIT_DEFINITIONS } from "./units";

const validUnitIds = Object.keys(UNIT_DEFINITIONS);

// Base recipe validation schema that can be used both on client and server
export const baseRecipeSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Recipe name is required" })
    .max(255, { message: "Recipe name must be less than 255 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional(),
  imageId: z.string().optional(), // For staged file uploads
  stageId: z.string().optional(), // For staged file uploads
  // Time fields (in minutes)
  cookingTime: z.coerce
    .number()
    .int({ message: "Cooking time must be a whole number" })
    .min(0, { message: "Cooking time cannot be negative" })
    .max(1440, {
      message: "Cooking time cannot exceed 24 hours (1440 minutes)",
    })
    .optional(),
  preparationTime: z.coerce
    .number()
    .int({ message: "Preparation time must be a whole number" })
    .min(0, { message: "Preparation time cannot be negative" })
    .max(1440, {
      message: "Preparation time cannot exceed 24 hours (1440 minutes)",
    })
    .optional(),
  totalTime: z.coerce
    .number()
    .int({ message: "Total time must be a whole number" })
    .min(0, { message: "Total time cannot be negative" })
    .max(2880, { message: "Total time cannot exceed 48 hours (2880 minutes)" })
    .optional(),

  // Yield
  servings: z.coerce
    .number()
    .int({ message: "Servings must be a whole number" })
    .min(1, { message: "Recipe must serve at least 1 person" })
    .max(100, { message: "Servings cannot exceed 100" })
    .optional(),

  // Nutrition information
  calories: z.coerce
    .number()
    .int({ message: "Calories must be a whole number" })
    .min(0, { message: "Calories cannot be negative" })
    .max(10000, { message: "Calories per serving seems too high (max 10,000)" })
    .optional(),
  fat: z.coerce
    .number()
    .min(0, { message: "Fat content cannot be negative" })
    .max(500, { message: "Fat content seems too high (max 500g)" })
    .optional(),
  protein: z.coerce
    .number()
    .min(0, { message: "Protein content cannot be negative" })
    .max(500, { message: "Protein content seems too high (max 500g)" })
    .optional(),
  carbohydrates: z.coerce
    .number()
    .min(0, { message: "Carbohydrate content cannot be negative" })
    .max(1000, { message: "Carbohydrate content seems too high (max 1000g)" })
    .optional(),
  fiber: z.coerce
    .number()
    .min(0, { message: "Fiber content cannot be negative" })
    .max(100, { message: "Fiber content seems too high (max 100g)" })
    .optional(),
  sugar: z.coerce
    .number()
    .min(0, { message: "Sugar content cannot be negative" })
    .max(500, { message: "Sugar content seems too high (max 500g)" })
    .optional(),
  sodium: z.coerce
    .number()
    .min(0, { message: "Sodium content cannot be negative" })
    .max(50, { message: "Sodium content seems too high (max 50g)" })
    .optional(),

  // Category and classification
  recipeCategory: z.string().optional(),
  recipeCuisine: z.string().optional(),
  keywords: z
    .array(z.string().min(1, { message: "Keyword cannot be empty" }))
    .max(20, { message: "Too many keywords (max 20)" })
    .default([]),

  // Difficulty and skill
  difficulty: z.string().optional(),
  skillLevel: z.string().optional(),

  // Dietary information
  suitableForDiet: z
    .array(z.string().min(1, { message: "Diet restriction cannot be empty" }))
    .max(15, { message: "Too many dietary restrictions (max 15)" })
    .default([]),

  // Equipment
  recipeEquipment: z
    .array(z.string().min(1, { message: "Equipment item cannot be empty" }))
    .max(30, { message: "Too many equipment items (max 30)" })
    .default([]),

  // Cost
  estimatedCost: z.coerce
    .number()
    .min(0, { message: "Cost cannot be negative" })
    .max(1000, { message: "Cost seems too high (max $1000)" })
    .optional(),

  // Recipe content
  instructions: z
    .array(z.string().min(1, { message: "Instruction step cannot be empty" }))
    .min(1, { message: "At least one instruction step is required" })
    .max(50, { message: "Too many instruction steps (max 50)" })
    .default([]),
  isPrivate: z.boolean().default(true),
});

// Recipe ingredient validation
export const recipeIngredientSchema = z.object({
  ingredientId: z
    .string()
    .min(1, { message: "Please select an ingredient" })
    .uuid({ message: "Invalid ingredient selection" }),
  quantity: z.coerce
    .number()
    .positive({ message: "Quantity must be greater than 0" })
    .max(1000, { message: "Quantity seems too high (max 1000)" }),
  unit: z
    .string()
    .refine((val) => validUnitIds.includes(val), {
      message: "Please select a valid unit",
    })
    .optional(),
});

// For client-side forms (allows string inputs that will be coerced)
export const recipeFormSchema = baseRecipeSchema.extend({
  stageId: z.string().optional(), // For staged file uploads
  recipeIngredients: z
    .array(
      recipeIngredientSchema.extend({
        name: z.string().optional(), // For display purposes in forms
      }),
    )
    .min(1, { message: "At least one ingredient is required" })
    .max(50, { message: "Too many ingredients (max 50)" })
    .default([]),
});

// For server-side API (strict validation)
export const recipeApiSchema = baseRecipeSchema.extend({
  recipeIngredients: z.array(recipeIngredientSchema).optional(),
});

// Update schema (extends create with id)
export const recipeUpdateSchema = recipeApiSchema.extend({
  id: z.uuid("Recipe ID must be a valid UUID"),
});

// Other validation schemas

// Ingredient validation
export const ingredientSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  emoji: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Allow empty/undefined
        // Check if it's a single emoji character
        const emojiRegex =
          /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]$/u;
        return emojiRegex.test(val);
      },
      { message: "Must be a single emoji character" },
    ),
});

export const ingredientFormSchema = ingredientSchema;

export const ingredientUpdateSchema = ingredientSchema.extend({
  id: z.uuid("Ingredient ID must be a valid UUID"),
});

// Group validation
export const groupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export const groupFormSchema = groupSchema;

// User search validation
export const userSearchSchema = z.object({
  email: z.string(),
  groupId: z.string().optional(),
  role: z.enum(["admin", "member"]).optional(),
});

// Recipe ingredient relationship validation
export const recipeIngredientRelationSchema = z.object({
  recipeId: z.string().uuid("Recipe ID must be a valid UUID"),
  ingredientId: z.string().uuid("Ingredient ID must be a valid UUID"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().optional(),
});

// Import-specific validation schemas
export const importUrlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please provide a valid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, "Only HTTP and HTTPS URLs are supported")
    .refine((url) => {
      try {
        const hostname = new URL(url).hostname.toLowerCase();
        return !(
          hostname === "localhost" ||
          hostname.startsWith("127.") ||
          hostname.startsWith("192.168.") ||
          hostname.startsWith("10.") ||
          hostname.includes("localhost")
        );
      } catch {
        return false;
      }
    }, "Cannot import from local or private network addresses")
    .refine((url) => {
      const blockedDomains = [
        "instagram.com",
        "facebook.com",
        "tiktok.com",
        "twitter.com",
        "x.com",
      ];
      try {
        const domain = new URL(url).hostname.toLowerCase();
        return !blockedDomains.some((blocked) => domain.includes(blocked));
      } catch {
        return false;
      }
    }, "This website typically blocks automated access"),
  userConsent: z.boolean().refine((val) => val === true, {
    message: "You must confirm you have permission to import this content",
  }),
  skipDirectFetch: z.boolean().default(false),
});

export const importTextSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(50000, "Content is too large (max 50,000 characters)"),
  sourceUrl: z.string().url("Source URL must be valid").optional(),
});

export const importResultSchema = z.object({
  status: z.enum(["success", "partial", "manual_required", "failed"]),
  recipe: recipeApiSchema.partial().optional(),
  extractionMethod: z
    .enum(["schema_org", "html_scraping", "llm", "manual"])
    .optional(),
  warnings: z.array(z.string()).default([]),
  sourceUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(100).optional(),
  missingFields: z.array(z.string()).default([]),
  recipeId: z.string().optional(),
});

export const previewImportSchema = z.object({
  url: z.string().url(),
});

export const validateImportDataSchema = z.object({
  recipeData: recipeApiSchema.partial(),
  sourceUrl: z.string().url().optional(),
});

// Export types for TypeScript
export type RecipeFormData = z.infer<typeof recipeFormSchema>;
export type RecipeApiData = z.infer<typeof recipeApiSchema>;
export type RecipeUpdateData = z.infer<typeof recipeUpdateSchema>;
export type IngredientFormData = z.infer<typeof ingredientFormSchema>;
export type IngredientData = z.infer<typeof ingredientSchema>;
export type GroupData = z.infer<typeof groupSchema>;
export type RecipeIngredientData = z.infer<typeof recipeIngredientSchema>;
export type UserSearchData = z.infer<typeof userSearchSchema>;


// Import types
export type ImportUrlData = z.infer<typeof importUrlSchema>;
export type ImportTextData = z.infer<typeof importTextSchema>;
export type ImportResultData = z.infer<typeof importResultSchema>;
export type PreviewImportData = z.infer<typeof previewImportSchema>;
export type ValidateImportDataInput = z.infer<typeof validateImportDataSchema>;

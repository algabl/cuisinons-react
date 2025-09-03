import { z } from "zod/v4";

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
  image: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL (e.g., https://example.com/image.jpg)",
    }),

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
  unit: z.string().min(1, { message: "Please select a unit" }).optional(),
});

// For client-side forms (allows string inputs that will be coerced)
export const recipeFormSchema = baseRecipeSchema.extend({
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
  id: z.string().uuid("Recipe ID must be a valid UUID"),
});

// Other validation schemas

// Ingredient validation
export const ingredientSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
});

export const ingredientFormSchema = ingredientSchema;

// Group validation
export const groupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export const groupFormSchema = groupSchema;

// User search validation
export const userSearchSchema = z.object({
  query: z.string().min(1, { message: "Search query is required" }),
});

// Recipe ingredient relationship validation
export const recipeIngredientRelationSchema = z.object({
  recipeId: z.string().uuid("Recipe ID must be a valid UUID"),
  ingredientId: z.string().uuid("Ingredient ID must be a valid UUID"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().optional(),
});

// Export types for TypeScript
export type RecipeFormData = z.infer<typeof recipeFormSchema>;
export type RecipeApiData = z.infer<typeof recipeApiSchema>;
export type RecipeUpdateData = z.infer<typeof recipeUpdateSchema>;
export type IngredientData = z.infer<typeof ingredientSchema>;
export type GroupData = z.infer<typeof groupSchema>;
export type RecipeIngredientData = z.infer<typeof recipeIngredientSchema>;

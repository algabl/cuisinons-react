import type { ingredients, recipes } from "@cuisinons/db/schema";

// Types for schema.org Recipe structured data
export interface SchemaOrgRecipe {
  "@context": "https://schema.org";
  "@type": "Recipe";
  name: string;
  description?: string;
  image?: string;
  author?: {
    "@type": "Person";
    name: string;
  };
  prepTime?: string; // ISO 8601 duration format
  cookTime?: string; // ISO 8601 duration format
  totalTime?: string; // ISO 8601 duration format
  recipeYield?: string | number;
  recipeCategory?: string;
  recipeCuisine?: string;
  keywords?: string[];
  suitableForDiet?: string[];
  recipeIngredient?: string[];
  recipeInstructions?: {
    "@type": "HowToStep";
    text: string;
  }[];
  nutrition?: {
    "@type": "NutritionInformation";
    calories?: string;
    fatContent?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fiberContent?: string;
    sugarContent?: string;
    sodiumContent?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    ratingCount: number;
  };
  tool?: string[];
  estimatedCost?: {
    "@type": "MonetaryAmount";
    currency: "USD";
    value: number;
  };
}

// Helper function to convert minutes to ISO 8601 duration
function minutesToISO8601(minutes: number): string {
  if (minutes < 60) {
    return `PT${minutes}M`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `PT${hours}H${remainingMinutes > 0 ? `${remainingMinutes}M` : ""}`;
}

function iso8601ToMinutes(duration: string): number | undefined {
  try {
    const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?$/;
    const match = regex.exec(duration);
    // Handle ISO 8601 duration format (PT30M, PT1H30M, etc.)
    if (match) {
      const hours = parseInt(match[1] || "0", 10);
      const minutes = parseInt(match[2] || "0", 10);
      return hours * 60 + minutes;
    }

    // Handle simple number (assume minutes)
    const simpleNumber = parseInt(duration.replace(/\D/g, ""), 10);
    if (!isNaN(simpleNumber) && simpleNumber > 0) {
      return simpleNumber;
    }
  } catch {
    // Fall through to undefined
  }

  return undefined;
}

// Convert your database recipe to schema.org Recipe
export function recipeToSchemaOrg(
  recipe: typeof recipes.$inferSelect,
  recipeIngredients: {
    ingredient: typeof ingredients.$inferSelect;
    quantity?: number | null;
    unit?: string | null;
  }[],
  authorName?: string,
): SchemaOrgRecipe {
  const schemaRecipe: SchemaOrgRecipe = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
  };

  // Optional fields
  if (recipe.description) {
    schemaRecipe.description = recipe.description;
  }

  if (recipe.image) {
    schemaRecipe.image = recipe.image;
  }

  if (authorName) {
    schemaRecipe.author = {
      "@type": "Person",
      name: authorName,
    };
  }

  // Time fields
  if (recipe.preparationTime) {
    schemaRecipe.prepTime = minutesToISO8601(recipe.preparationTime);
  }

  if (recipe.cookingTime) {
    schemaRecipe.cookTime = minutesToISO8601(recipe.cookingTime);
  }

  if (recipe.totalTime) {
    schemaRecipe.totalTime = minutesToISO8601(recipe.totalTime);
  }

  // Yield
  if (recipe.servings) {
    schemaRecipe.recipeYield = recipe.servings;
  }

  // Categories and cuisine
  if (recipe.recipeCategory) {
    schemaRecipe.recipeCategory = recipe.recipeCategory;
  }

  if (recipe.recipeCuisine) {
    schemaRecipe.recipeCuisine = recipe.recipeCuisine;
  }

  // Keywords and dietary info
  if (recipe.keywords && recipe.keywords.length > 0) {
    schemaRecipe.keywords = recipe.keywords;
  }

  if (recipe.suitableForDiet && recipe.suitableForDiet.length > 0) {
    schemaRecipe.suitableForDiet = recipe.suitableForDiet;
  }

  // Ingredients
  if (recipeIngredients.length > 0) {
    schemaRecipe.recipeIngredient = recipeIngredients.map((ri) => {
      let ingredientText = ri.ingredient.name;
      if (ri.quantity && ri.unit) {
        ingredientText = `${ri.quantity} ${ri.unit} ${ri.ingredient.name}`;
      } else if (ri.quantity) {
        ingredientText = `${ri.quantity} ${ri.ingredient.name}`;
      }
      return ingredientText;
    });
  }

  // Instructions
  if (recipe.instructions && recipe.instructions.length > 0) {
    schemaRecipe.recipeInstructions = recipe.instructions.map(
      (instruction) => ({
        "@type": "HowToStep",
        text: instruction,
      }),
    );
  }

  // Nutrition
  const hasNutrition =
    recipe.calories ||
    recipe.fat ||
    recipe.protein ||
    recipe.carbohydrates ||
    recipe.fiber ||
    recipe.sugar ||
    recipe.sodium;

  if (hasNutrition) {
    schemaRecipe.nutrition = {
      "@type": "NutritionInformation",
    };

    if (recipe.calories) {
      schemaRecipe.nutrition.calories = `${recipe.calories} calories`;
    }
    if (recipe.fat) {
      schemaRecipe.nutrition.fatContent = `${recipe.fat} grams`;
    }
    if (recipe.protein) {
      schemaRecipe.nutrition.proteinContent = `${recipe.protein} grams`;
    }
    if (recipe.carbohydrates) {
      schemaRecipe.nutrition.carbohydrateContent = `${recipe.carbohydrates} grams`;
    }
    if (recipe.fiber) {
      schemaRecipe.nutrition.fiberContent = `${recipe.fiber} grams`;
    }
    if (recipe.sugar) {
      schemaRecipe.nutrition.sugarContent = `${recipe.sugar} grams`;
    }
    if (recipe.sodium) {
      schemaRecipe.nutrition.sodiumContent = `${recipe.sodium} grams`;
    }
  }

  // Ratings
  if (recipe.aggregateRating && recipe.ratingCount) {
    schemaRecipe.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: recipe.aggregateRating,
      ratingCount: recipe.ratingCount,
    };
  }

  // Equipment
  if (recipe.recipeEquipment && recipe.recipeEquipment.length > 0) {
    schemaRecipe.tool = recipe.recipeEquipment;
  }

  // Cost
  if (recipe.estimatedCost) {
    schemaRecipe.estimatedCost = {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: recipe.estimatedCost,
    };
  }

  return schemaRecipe;
}

// Type for flexible schema.org Recipe data that can come from various sources
export interface FlexibleSchemaOrgRecipe {
  "@context"?: string;
  "@type": "Recipe";
  name: string;
  description?: string;
  image?:
    | string
    | string[]
    | { url?: string; "@type"?: string; [key: string]: any }[];
  author?:
    | string
    | { "@type"?: string; name: string; [key: string]: any }
    | { "@type"?: string; name: string; [key: string]: any }[];
  prepTime?: string | number;
  cookTime?: string | number;
  totalTime?: string | number;
  recipeYield?:
    | string
    | number
    | string[]
    | number[]
    | {
        "@type"?: string;
        name?: string;
        value?: string | number;
        [key: string]: any;
      }[];
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string | string[];
  suitableForDiet?: string | string[];
  recipeIngredient?: string | string[];
  recipeInstructions?:
    | string
    | string[]
    | {
        "@type"?: string;
        text?: string;
        name?: string;
        [key: string]: any;
      }[];
  nutrition?: {
    "@type"?: string;
    calories?: string | number;
    fatContent?: string | number;
    proteinContent?: string | number;
    carbohydrateContent?: string | number;
    fiberContent?: string | number;
    sugarContent?: string | number;
    sodiumContent?: string | number;
    [key: string]: any;
  };
  aggregateRating?: {
    "@type"?: string;
    ratingValue: number;
    ratingCount: number;
    [key: string]: any;
  };
  tool?: string | string[];
  estimatedCost?:
    | number
    | string
    | {
        "@type"?: string;
        currency?: string;
        value: number | string;
        [key: string]: any;
      };
  [key: string]: any; // Allow for any additional properties
}

// Helper functions to extract data from flexible formats
function extractString(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") return value;
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "string"
  ) {
    return value[0];
  }
  return undefined;
}

function extractStringArray(
  value: string | string[] | undefined,
): string[] | undefined {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return undefined;
}

function extractImageUrl(
  image: FlexibleSchemaOrgRecipe["image"],
): string | undefined {
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    // Handle array of strings
    const firstString = image.find(
      (item): item is string => typeof item === "string",
    );
    if (firstString) return firstString;

    // Handle array of objects with url property
    const firstWithUrl = image.find(
      (item) => typeof item === "object" && item !== null && "url" in item,
    );
    if (
      firstWithUrl &&
      typeof firstWithUrl === "object" &&
      "url" in firstWithUrl &&
      typeof firstWithUrl.url === "string"
    ) {
      return firstWithUrl.url;
    }
  }
  return undefined;
}

function extractAuthorName(
  author: FlexibleSchemaOrgRecipe["author"],
): string | undefined {
  if (typeof author === "string") return author;
  if (typeof author === "object" && author !== null && !Array.isArray(author)) {
    return author.name;
  }
  if (Array.isArray(author) && author.length > 0) {
    const firstAuthor = author[0];
    if (
      typeof firstAuthor === "object" &&
      firstAuthor !== null &&
      "name" in firstAuthor
    ) {
      return firstAuthor.name;
    }
  }
  return undefined;
}

function extractRecipeYield(
  recipeYield: FlexibleSchemaOrgRecipe["recipeYield"],
): number | undefined {
  if (typeof recipeYield === "number") return recipeYield;
  if (typeof recipeYield === "string") {
    // Extract numbers from string like "4 servings" or "Makes 6"
    const match = recipeYield.match(/\d+/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  if (Array.isArray(recipeYield)) {
    // Handle array - take first valid number
    for (const item of recipeYield) {
      if (typeof item === "number") return item;
      if (typeof item === "string") {
        const match = item.match(/\d+/);
        if (match) {
          const parsed = parseInt(match[0], 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      }
      if (typeof item === "object" && item !== null && "value" in item) {
        const value = item.value;
        if (typeof value === "number") return value;
        if (typeof value === "string") {
          const parsed = parseInt(value, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      }
    }
  }
  return undefined;
}

function extractInstructions(
  instructions: FlexibleSchemaOrgRecipe["recipeInstructions"],
): string[] | undefined {
  if (typeof instructions === "string") return [instructions];
  if (Array.isArray(instructions)) {
    const extractedInstructions: string[] = [];

    for (const instruction of instructions) {
      if (typeof instruction === "string") {
        extractedInstructions.push(instruction);
      } else if (typeof instruction === "object" && instruction !== null) {
        // Try to extract text from common properties
        const text =
          instruction.text || instruction.name || instruction.description;
        if (typeof text === "string") {
          extractedInstructions.push(text);
        }
      }
    }

    return extractedInstructions.length > 0 ? extractedInstructions : undefined;
  }
  return undefined;
}

function extractNutritionValue(
  value: string | number | undefined,
): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Extract numeric value from strings like "250 calories" or "10g"
    const numericMatch = value.match(/[\d.]+/);
    if (numericMatch) {
      const parsed = parseFloat(numericMatch[0]);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return undefined;
}

function extractEstimatedCost(
  cost: FlexibleSchemaOrgRecipe["estimatedCost"],
): number | undefined {
  if (typeof cost === "number") return cost;
  if (typeof cost === "string") {
    // Extract numeric value from strings like "$12.50" or "12.50 USD"
    const numericMatch = cost.match(/[\d.]+/);
    if (numericMatch) {
      const parsed = parseFloat(numericMatch[0]);
      if (!isNaN(parsed)) return parsed;
    }
  }
  if (typeof cost === "object" && cost !== null && "value" in cost) {
    const value = cost.value;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return undefined;
}

export function flexibleSchemaOrgToRecipe(schema: FlexibleSchemaOrgRecipe): {
  recipe: Partial<typeof recipes.$inferInsert>;
  missingFields: string[];
  ingredients: string[];
} {
  const recipe: Partial<typeof recipes.$inferInsert> = {
    name: schema.name,
  };

  // Extract description
  if (schema.description) {
    recipe.description = schema.description;
  }

  // Extract image URL
  const imageUrl = extractImageUrl(schema.image);
  if (imageUrl) {
    recipe.image = imageUrl;
  }

  // Extract time fields
  if (schema.prepTime) {
    recipe.preparationTime = iso8601ToMinutes(String(schema.prepTime));
  }

  if (schema.cookTime) {
    recipe.cookingTime = iso8601ToMinutes(String(schema.cookTime));
  }

  if (schema.totalTime) {
    recipe.totalTime = iso8601ToMinutes(String(schema.totalTime));
  }

  // Extract yield/servings
  const yield_ = extractRecipeYield(schema.recipeYield);
  if (yield_) {
    recipe.servings = yield_;
  }

  // Extract categories and cuisine
  const category = extractString(schema.recipeCategory);
  if (category) {
    recipe.recipeCategory = category;
  }

  const cuisine = extractString(schema.recipeCuisine);
  if (cuisine) {
    recipe.recipeCuisine = cuisine;
  }

  // Extract keywords
  const keywords = extractStringArray(schema.keywords);
  if (keywords) {
    recipe.keywords = keywords;
  }

  // Extract dietary information
  const dietaryInfo = extractStringArray(schema.suitableForDiet);
  if (dietaryInfo) {
    recipe.suitableForDiet = dietaryInfo;
  }

  // Extract instructions
  const instructions = extractInstructions(schema.recipeInstructions);
  if (instructions) {
    recipe.instructions = instructions;
  }

  // Extract nutrition information
  if (schema.nutrition) {
    const calories = extractNutritionValue(schema.nutrition.calories);
    if (calories) recipe.calories = Math.round(calories);

    const fat = extractNutritionValue(schema.nutrition.fatContent);
    if (fat) recipe.fat = fat;

    const protein = extractNutritionValue(schema.nutrition.proteinContent);
    if (protein) recipe.protein = protein;

    const carbs = extractNutritionValue(schema.nutrition.carbohydrateContent);
    if (carbs) recipe.carbohydrates = carbs;

    const fiber = extractNutritionValue(schema.nutrition.fiberContent);
    if (fiber) recipe.fiber = fiber;

    const sugar = extractNutritionValue(schema.nutrition.sugarContent);
    if (sugar) recipe.sugar = sugar;

    const sodium = extractNutritionValue(schema.nutrition.sodiumContent);
    if (sodium) recipe.sodium = sodium;
  }

  // Extract rating information
  if (schema.aggregateRating) {
    if (typeof schema.aggregateRating.ratingValue === "number") {
      recipe.aggregateRating = schema.aggregateRating.ratingValue;
    }
    if (typeof schema.aggregateRating.ratingCount === "number") {
      recipe.ratingCount = schema.aggregateRating.ratingCount;
    }
  }

  // Extract equipment/tools
  const tools = extractStringArray(schema.tool);
  if (tools) {
    recipe.recipeEquipment = tools;
  }

  // Extract estimated cost
  const cost = extractEstimatedCost(schema.estimatedCost);
  if (cost) {
    recipe.estimatedCost = cost;
  }

  // Extract ingredients list
  const ingredients = extractStringArray(schema.recipeIngredient) ?? [];

  return {
    recipe,
    missingFields: findMissingFields(recipe),
    ingredients,
  };
}

export function schemaOrgToRecipe(schema: SchemaOrgRecipe): {
  recipe: Partial<typeof recipes.$inferInsert>;
  missingFields: string[];
} {
  const recipe: Partial<typeof recipes.$inferInsert> = {
    name: schema.name,
  };

  if (schema.description) {
    recipe.description = schema.description;
  }

  if (schema.image) {
    recipe.image = schema.image;
  }

  // Time fields
  if (schema.prepTime) {
    recipe.preparationTime = iso8601ToMinutes(schema.prepTime);
  }

  if (schema.cookTime) {
    recipe.cookingTime = iso8601ToMinutes(schema.cookTime);
  }

  if (schema.totalTime) {
    recipe.totalTime = iso8601ToMinutes(schema.totalTime);
  }

  // Yield
  if (schema.recipeYield) {
    if (typeof schema.recipeYield === "number") {
      recipe.servings = schema.recipeYield;
    } else if (typeof schema.recipeYield === "string") {
      const parsedYield = parseInt(schema.recipeYield.replace(/\D/g, ""), 10);
      if (!isNaN(parsedYield) && parsedYield > 0) {
        recipe.servings = parsedYield;
      }
    }
  }

  // Categories and cuisine
  if (schema.recipeCategory) {
    recipe.recipeCategory = schema.recipeCategory;
  }

  if (schema.recipeCuisine) {
    recipe.recipeCuisine = schema.recipeCuisine;
  }

  // Keywords and dietary info
  if (schema.keywords && schema.keywords.length > 0) {
    recipe.keywords = schema.keywords;
  }

  if (schema.suitableForDiet && schema.suitableForDiet.length > 0) {
    recipe.suitableForDiet = schema.suitableForDiet;
  }

  // Instructions
  if (schema.recipeInstructions && schema.recipeInstructions.length > 0) {
    recipe.instructions = schema.recipeInstructions
      .map((instruction) => {
        return instruction.text.trim();
      })
      .filter(Boolean);
  }

  // Nutrition
  if (schema.nutrition) {
    const nutrition = schema.nutrition;

    if (nutrition.calories) {
      const calories = parseInt(nutrition.calories.replace(/\D/g, ""), 10);
      if (!isNaN(calories)) {
        recipe.calories = calories;
      }
    }

    if (nutrition.fatContent) {
      const fat = parseInt(nutrition.fatContent.replace(/\D/g, ""), 10);
      if (!isNaN(fat)) {
        recipe.fat = fat;
      }
    }

    if (nutrition.proteinContent) {
      const protein = parseInt(nutrition.proteinContent.replace(/\D/g, ""), 10);
      if (!isNaN(protein)) {
        recipe.protein = protein;
      }
    }

    if (nutrition.carbohydrateContent) {
      const carbs = parseInt(
        nutrition.carbohydrateContent.replace(/\D/g, ""),
        10,
      );
      if (!isNaN(carbs)) {
        recipe.carbohydrates = carbs;
      }
    }

    if (nutrition.fiberContent) {
      const fiber = parseInt(nutrition.fiberContent.replace(/\D/g, ""), 10);
      if (!isNaN(fiber)) {
        recipe.fiber = fiber;
      }
    }

    if (nutrition.sugarContent) {
      const sugar = parseInt(nutrition.sugarContent.replace(/\D/g, ""), 10);
      if (!isNaN(sugar)) {
        recipe.sugar = sugar;
      }
    }

    if (nutrition.sodiumContent) {
      const sodium = parseInt(nutrition.sodiumContent.replace(/\D/g, ""), 10);
      if (!isNaN(sodium)) {
        recipe.sodium = sodium;
      }
    }
  }

  // Equipment
  if (schema.tool && schema.tool.length > 0) {
    recipe.recipeEquipment = schema.tool;
  }

  // Cost
  if (schema.estimatedCost && typeof schema.estimatedCost.value === "number") {
    recipe.estimatedCost = schema.estimatedCost.value;
  }

  return {
    recipe,
    missingFields: findMissingFields(recipe),
  };
}

// Helper to generate the JSON-LD script tag
export function generateRecipeJsonLd(schemaRecipe: SchemaOrgRecipe): string {
  return `<script type="application/ld+json">${JSON.stringify(schemaRecipe, null, 2)}</script>`;
}

function findMissingFields(
  recipe: Partial<typeof recipes.$inferInsert>,
): string[] {
  const missing: string[] = [];

  const optionalFieldsToCheck = [
    "description",
    "image",
    "cookingTime",
    "preparationTime",
    "servings",
    "recipeCategory",
    "recipeCuisine",
    "calories",
  ];

  for (const field of optionalFieldsToCheck) {
    const value = recipe[field as keyof typeof recipe];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }

  return missing;
}

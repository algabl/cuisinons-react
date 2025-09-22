import { relations, sql } from "drizzle-orm";
import { index, pgEnum, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `cuisinons_${name}`);

export const recipes = createTable(
  "recipe",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Basic Recipe Info (schema.org compatible)
    name: d.varchar({ length: 255 }).notNull(), // schema.org: name
    description: d.text(), // schema.org: description
    imageId: d.varchar({ length: 255 }), // Foreign key to stagedFiles.id
    image: d.varchar({ length: 255 }), // schema.org: image

    // Timing (schema.org compatible)
    cookingTime: d.integer(), // schema.org: cookTime (in minutes)
    preparationTime: d.integer(), // schema.org: prepTime (in minutes)
    totalTime: d.integer(), // schema.org: totalTime (in minutes)

    // Yield and Servings (schema.org compatible)
    servings: d.integer(), // schema.org: recipeYield

    // Instructions (schema.org compatible)
    instructions: d.text().array(), // schema.org: recipeInstructions

    // Nutrition (schema.org compatible)
    calories: d.integer(), // schema.org: nutrition.calories
    fat: d.real(), // schema.org: nutrition.fatContent (in grams)
    protein: d.real(), // schema.org: nutrition.proteinContent (in grams)
    carbohydrates: d.real(), // schema.org: nutrition.carbohydrateContent (in grams)
    fiber: d.real(), // schema.org: nutrition.fiberContent (in grams)
    sugar: d.real(), // schema.org: nutrition.sugarContent (in grams)
    sodium: d.real(), // schema.org: nutrition.sodiumContent (in grams)

    // Category and Classification (schema.org compatible)
    recipeCategory: d.varchar({ length: 255 }), // schema.org: recipeCategory (e.g., "appetizer", "entree", "dessert")
    recipeCuisine: d.varchar({ length: 255 }), // schema.org: recipeCuisine (e.g., "French", "Italian", "Thai")
    keywords: d.text().array(), // schema.org: keywords

    // Difficulty and Skill Level
    difficulty: d.varchar({ length: 50 }), // "easy", "medium", "hard"
    skillLevel: d.varchar({ length: 50 }), // "beginner", "intermediate", "advanced"

    // Dietary Information (schema.org compatible)
    suitableForDiet: d.text().array(), // schema.org: suitableForDiet (e.g., ["vegan", "gluten-free"])

    // Equipment and Tools
    recipeEquipment: d.text().array(), // schema.org: tool (cooking equipment needed)

    // Rating and Reviews
    aggregateRating: d.real(), // schema.org: aggregateRating.ratingValue
    ratingCount: d.integer(), // schema.org: aggregateRating.ratingCount

    // Cost and Budget
    estimatedCost: d.real(), // schema.org: estimatedCost (in dollars)

    // System fields
    createdById: d.varchar({ length: 255 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    isPrivate: d.boolean().default(true),
  }),
  (t) => [
    index("recipe_created_at_index").on(t.createdAt),
    index("recipe_created_by_id_index").on(t.createdById),
  ],
);

export const recipesRelations = relations(recipes, ({ many, one }) => ({
  recipeIngredients: many(recipeIngredients),
  recipeSharings: many(recipeSharings),
  stagedFile: one(stagedFiles),
}));

export const ingredientTypeEnum = pgEnum("type", ["global", "user"]);

export const unitCategoryEnum = pgEnum("unit_category", [
  "volume",
  "weight",
  "count",
  "special",
]);

export const ingredients = createTable("ingredient", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  description: d.text(),
  emoji: d.varchar({ length: 10 }), // Stores single emoji character
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  type: ingredientTypeEnum(),
  createdById: d.varchar({ length: 255 }),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
}));

export const recipeIngredients = createTable(
  "recipe_ingredient",
  (d) => ({
    recipeId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => recipes.id),
    ingredientId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => ingredients.id),
    quantity: d.real(), // Null meaning no quantity
    unit: d.varchar({ length: 255 }), // Null meaning no unit
    unitCategory: unitCategoryEnum(), // Category of the unit for conversion validation
    userId: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.recipeId, t.ingredientId] }),
    index("recipe_ingredient_user_id_index").on(t.userId),
  ],
);

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    ingredient: one(ingredients, {
      fields: [recipeIngredients.ingredientId],
      references: [ingredients.id],
    }),
  }),
);

export const groups = createTable("group", (d) => {
  return {
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  };
});

export const groupsRelations = relations(groups, ({ many }) => ({
  groupMembers: many(groupMembers),
  recipeSharings: many(recipeSharings),
}));

export const roleEnum = pgEnum("role", ["admin", "member", "owner"]);

export const groupMembers = createTable(
  "group_member",
  (d) => {
    return {
      groupId: d
        .varchar({ length: 255 })
        .notNull()
        .references(() => groups.id),
      userId: d.varchar({ length: 255 }).notNull(),
      role: roleEnum(),
    };
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] })],
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));

export const recipeSharings = createTable(
  "recipe_sharing",
  (d) => {
    return {
      recipeId: d
        .varchar({ length: 255 })
        .notNull()
        .references(() => recipes.id),
      groupId: d
        .varchar({ length: 255 })
        .notNull()
        .references(() => groups.id),
    };
  },
  (t) => [primaryKey({ columns: [t.recipeId, t.groupId] })],
);

export const recipeSharingsRelations = relations(recipeSharings, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeSharings.recipeId],
    references: [recipes.id],
  }),
  group: one(groups, {
    fields: [recipeSharings.groupId],
    references: [groups.id],
  }),
}));

export const statusEnum = pgEnum("status", ["staged", "published", "deleted"]);
export const fileTypeEnum = pgEnum("file_type", [
  "image",
  "document",
  "video",
  "audio",
  "other",
]);

export const stagedFiles = createTable(
  "staged_file",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    url: d.varchar({ length: 255 }).notNull(),
    key: d.varchar({ length: 255 }).notNull(), // Unique file identifier in blob storage
    filename: d.varchar({ length: 255 }),
    size: d.integer(),
    mimeType: d.varchar({ length: 100 }),
    fileType: fileTypeEnum().notNull().default("other"),
    stageId: d.varchar({ length: 255 }).notNull(), // Links multiple files to one session
    userId: d.varchar({ length: 255 }).notNull(),
    // metadata: d.jsonb(), // For additional file-specific metadata
    entityId: d.varchar({ length: 255 }), // Links file to a specific entity (e.g., recipeId)
    entityType: d.varchar({ length: 100 }), // Type of entity (e.g., "recipe", "profile")
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    status: statusEnum().default("staged"),
  }),
  (t) => [
    // Indexes to optimize queries based on common access patterns
    index("staged_files_expires_at_index").on(t.expiresAt),
    index("staged_files_stage_id_index").on(t.stageId),
    index("staged_files_user_id_index").on(t.userId),
    index("staged_files_file_type_index").on(t.fileType),
  ],
);

export const stagedFilesRelations = relations(stagedFiles, ({ one }) => ({
  recipes: one(recipes, {
    fields: [stagedFiles.id],
    references: [recipes.imageId],
  }),
}));

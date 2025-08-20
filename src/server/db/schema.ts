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
  (t) => {
    return {
      createdAtIndex: index("created_at_index").on(t.createdAt),
      createdByIdIndex: index("created_by_id_index").on(t.createdById),
    };
  },
);

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  recipeSharings: many(recipeSharings),
}));

export const ingredientTypeEnum = pgEnum("type", ["global", "user"]);

export const ingredients = createTable("ingredient", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  description: d.text(),
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
    userId: d.varchar({ length: 255 }),
  }),
  (t) => {
    return {
      primaryKey: primaryKey({ columns: [t.recipeId, t.ingredientId] }),
      userIdIndex: index("recipe_ingredient_user_id_index").on(t.userId),
    };
  },
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
  (t) => {
    return {
      primaryKey: primaryKey({ columns: [t.groupId, t.userId] }),
    };
  },
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
  (t) => {
    return {
      primaryKey: primaryKey({ columns: [t.recipeId, t.groupId] }),
    };
  },
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

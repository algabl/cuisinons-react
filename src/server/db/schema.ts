import { relations, sql } from "drizzle-orm";
import { index, pgEnum, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `cuisinons_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  recipes: many(recipes),
  ingredients: many(ingredients),
  groupMembers: many(groupMembers),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const recipes = createTable(
  "recipe",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    description: d.text(),
    image: d.varchar({ length: 255 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    cookingTime: d.integer(),
    preparationTime: d.integer(),
    servings: d.integer(),
    calories: d.integer(),
    instructions: d.text().array(),
    isPrivate: d.boolean().default(true),
  }),
  (t) => {
    return {
      createdAtIndex: index("created_at_index").on(t.createdAt),
    };
  },
);

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, { fields: [recipes.createdById], references: [users.id] }),
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

export const ingredientsRelations = relations(ingredients, ({ one, many }) => ({
  user: one(users, {
    fields: [ingredients.createdById],
    references: [users.id],
  }),
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
  }),
  (t) => {
    return {
      primaryKey: primaryKey({ columns: [t.recipeId, t.ingredientId] }),
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
      userId: d
        .varchar({ length: 255 })
        .notNull()
        .references(() => users.id),
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
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
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

// Re-export all validation schemas for shared use
export * from "./schemas";

// For now, use a generic type until we can properly reference the AppRouter
// This will be updated once the shared package dependency is properly resolved
export type AppRouter = {
  recipe: {
    getAll: any;
    getById: any;
    create: any;
    update: any;
    delete: any;
    getByUserId: any;
    getLatest: any;
    shareWithGroup: any;
    addIngredient: any;
  };
  group: any;
  user: any;
  sharing: any;
  ingredient: any;
};

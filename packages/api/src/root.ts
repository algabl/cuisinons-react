import { groupRouter } from "./routers/group";
import { ingredientRouter } from "./routers/ingredient";
import { recipeRouter } from "./routers/recipe";
import { sharingRouter } from "./routers/sharing";
import { uploadRouter } from "./routers/upload";
import { userRouter } from "./routers/user";
import { createCallerFactory, createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  group: groupRouter,
  user: userRouter,
  sharing: sharingRouter,
  ingredient: ingredientRouter,
  upload: uploadRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

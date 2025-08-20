import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../root";

export type Group = NonNullable<
  inferRouterOutputs<AppRouter>["group"]["getById"]
>;

export type User = NonNullable<
  inferRouterOutputs<AppRouter>["group"]["getMemberById"]
>;

export type Ingredient = NonNullable<
  inferRouterOutputs<AppRouter>["ingredient"]["getById"]
>;

export type Recipe = NonNullable<
  inferRouterOutputs<AppRouter>["recipe"]["getById"]
>;

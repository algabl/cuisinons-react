import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./root";

// Re-export all validation schemas for shared use
export * from "./schemas";

// Export the actual router and types
export { appRouter, createCaller } from "./root";
export type { AppRouter } from "./root";

// Export tRPC input/output types
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

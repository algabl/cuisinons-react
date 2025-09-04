import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { headers } from "next/headers";

import type { AppRouter } from "@cuisinons/api/root";
import { createCaller } from "@cuisinons/api/root";
import { createTRPCContext } from "@cuisinons/api/trpc";

import { createQueryClient } from "./query-client";
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);

// Create the caller with proper context
const caller = createCaller(createContext);

// Use the standard RSC pattern with proper type inference
export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);

// const caller = createCaller(createContext);

// export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
//   caller,
//   getQueryClient,
// );

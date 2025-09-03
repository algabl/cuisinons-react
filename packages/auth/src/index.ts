// packages/auth/src/index.ts
// This file should only export types and client-safe utilities

// Export types (safe for both client and server)
export type { AuthUser, User } from "./server";

// Don't export server functions from here!
// They should be imported directly from "./server"
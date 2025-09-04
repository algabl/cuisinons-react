// packages/auth/src/client.ts
"use client";

// Client-side components and hooks only
export {
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/nextjs";

// Re-export the AuthUser interface for client use
export type { AuthUser } from "./server";
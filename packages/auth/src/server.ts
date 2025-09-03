import "server-only";

import {
  auth as clerkAuth,
  clerkClient,
  currentUser,
} from "@clerk/nextjs/server";

// Re-export types
export type { User } from "@clerk/nextjs/server";


// Your custom auth interface
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}


export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    name: user.fullName,
    imageUrl: user.imageUrl,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}


// Server utilities
export { clerkClient };

// Server components
export { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";

export const auth = async () => {
  return await clerkAuth();
}

export type Context = Awaited<ReturnType<typeof auth>>;
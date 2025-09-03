import { useAuth } from "@clerk/clerk-expo";

// Re-export Clerk hooks for easy access throughout the app
export { useAuth, useUser } from "@clerk/clerk-expo";

// Helper function to check if user is authenticated
export const useIsAuthenticated = () => {
  const { isSignedIn } = useAuth();
  return isSignedIn;
};

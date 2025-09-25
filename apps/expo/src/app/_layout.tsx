import { useEffect } from "react";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";

import { queryClient, setAuthTokenGetter } from "~/utils/api";

import "../styles.css";

import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClientProvider } from "@tanstack/react-query";

function AuthSetup() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the auth token getter for tRPC
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error("Error getting token in AuthSetup:", error);
        return null;
      }
    });
  }, [getToken]);

  return null;
}

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const publishableKey = Constants.expoConfig?.extra
    ?.clerkPublishableKey as string;

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <AuthSetup />
        {/*
          The Stack component displays the current page.
          It also allows you to configure your screens
        */}
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#f472b6",
              },
              contentStyle: {
                backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
              },
            }}
          >
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
        <StatusBar />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

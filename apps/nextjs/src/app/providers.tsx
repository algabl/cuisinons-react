"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

import { env } from "~/env";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Since we're in a client component, we can safely use process.env.NODE_ENV
    // as it's automatically available in client-side code
    // eslint-disable-next-line no-restricted-properties
    const isDevelopment = process.env.NODE_ENV === "development";
    
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: isDevelopment ? "/ingest" : (env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest"),
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      defaults: "2025-05-24",
      debug: isDevelopment,
      // In development, capture fewer events to reduce noise
      autocapture: !isDevelopment,
      capture_pageview: true,
      capture_pageleave: !isDevelopment,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

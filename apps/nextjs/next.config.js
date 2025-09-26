import { resolve } from "path";
import { withSentryConfig } from "@sentry/nextjs";
import { config as dotenvConfig } from "dotenv";
import { createJiti } from "jiti";

// Load environment variables from root .env.local
dotenvConfig({ path: resolve(process.cwd(), "../../.env.local") });

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = withSentryConfig(
  {
    /** Enables hot reloading for local packages without a build step */
    transpilePackages: [
      "@cuisinons/api",
      "@cuisinons/auth",
      "@cuisinons/db",
      "@cuisinons/validators",
    ],

    /** We already do linting and typechecking as separate tasks in CI */
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    experimental: {
      authInterrupts: true,
    },

    images: {
      remotePatterns: [
        { protocol: "https", hostname: "posthog.com" },
        { protocol: "https", hostname: "us-assets.i.posthog.com" },
        { protocol: "https", hostname: "img.clerk.com" },
        { protocol: "https", hostname: "jbfmbt1l40.ufs.sh", pathname: "/**" },
      ],
    },

    async rewrites() {
      return [
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
      ];
    },

    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
  },
  {
    org: "alex-black-lz",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);

export default config;

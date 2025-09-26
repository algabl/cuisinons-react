# Agent Guidelines for Cuisinons

## Commands

- **Build**: `pnpm build` (all packages) | `turbo -F @cuisinons/nextjs build` (single app)
- **Dev**: `pnpm dev` (watch mode) | `pnpm dev:next` (NextJS only)
- **Lint**: `pnpm lint` (check) | `pnpm lint:fix` (auto-fix)
- **Format**: `pnpm format` (check) | `pnpm format:fix` (auto-fix)
- **Typecheck**: `pnpm typecheck`
- **Database**: `pnpm db:push` (schema) | `pnpm db:studio` (GUI)

## Code Style

- **TypeScript**: Strict mode, consistent type imports (`import type`)
- **Imports**: Use `import type` for types, prefer top-level type specifiers
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error handling**: Use Zod for validation, avoid non-null assertions
- **File structure**: Monorepo with `packages/` (shared) and `apps/` (applications)

## Import Order (auto-sorted by Prettier)

1. Type imports
2. React/Next.js
3. Third-party modules
4. @cuisinons/\* packages
5. Relative imports (~/, ../, ./)

## Key Rules

- Use `import { z } from 'zod/v4'` (not bare 'zod')
- Use `import { env } from '~/env'` for environment variables
- Prefix unused variables with underscore (`_unused`)
- Always run lint/typecheck after changes

These examples should be used as guidance when configuring Sentry functionality within a project.

# Exception Catching

Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry.
Use this in try catch blocks or areas where exceptions are expected

# Tracing Examples

Spans should be created for meaningful actions within an applications like button clicks, API calls, and function calls
Use the `Sentry.startSpan` function to create a span
Child spans can exist within a parent span

## Custom Span instrumentation in component actions

The `name` and `op` properties should be meaninful for the activities in the call.
Attach attributes based on relevant information and metrics from the request

```javascript
function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        doSomething();
      },
    );
  };

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  );
}
```

## Custom span instrumentation in API calls

The `name` and `op` properties should be meaninful for the activities in the call.
Attach attributes based on relevant information and metrics from the request

```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
  );
}
```

# Logs

Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/nextjs"`
Enable logging in Sentry using `Sentry.init({ _experiments: { enableLogs: true } })`
Reference the logger using `const { logger } = Sentry`
Sentry offers a consoleLoggingIntegration that can be used to log specific console error types automatically without instrumenting the individual logger calls

## Configuration

In NextJS the client side Sentry initialization is in `instrumentation-client.ts`, the server initialization is in `sentry.server.config.ts` and the edge initialization is in `sentry.edge.config.ts`
Initialization does not need to be repeated in other files, it only needs to happen the files mentioned above. You should use `import * as Sentry from "@sentry/nextjs"` to reference Sentry functionality

### Baseline

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5631ba23ecfec4aa40d5466943104dba@o4510086341787648.ingest.us.sentry.io/4510086391463936",

  _experiments: {
    enableLogs: true,
  },
});
```

### Logger Integration

```javascript
Sentry.init({
  dsn: "https://5631ba23ecfec4aa40d5466943104dba@o4510086341787648.ingest.us.sentry.io/4510086391463936",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```

## Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the structured logs.

```javascript
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```
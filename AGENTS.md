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
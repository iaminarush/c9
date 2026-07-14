# AGENTS.md

## Commands

```
pnpm dev          # Next.js dev server (port 3000)
pnpm build        # production build (ignores TS/ESLint errors — see Gotchas)
pnpm lint         # next lint
pnpm typecheck    # tsc --noEmit
pnpm push         # drizzle-kit push (schema → DB, no migrations)
pnpm pull         # drizzle-kit introspect (DB → schema)
pnpm studio       # Drizzle Studio
```

Regenerate `schema.dbml` from Drizzle schema:

```bash
npx ts-node dbml.ts
```

## Architecture

- **Hybrid routing**: App Router (`src/app/`) serves pages; the ts-rest API lives in the Pages Router at `src/pages/api/[...ts-rest].tsx`. Do not put API routes under `src/app/api/`.
- **API layer**: ts-rest contracts in `src/contracts/`, routers in `src/pages/api/`, client (with auto-detected base URL) defined in `src/contracts/contract.ts`.
- **Database**: Neon serverless Postgres, Drizzle ORM via `drizzle-orm/neon-http`. Schemas in `src/server/db/schema/*.ts`, barrel-exported from `src/server/db/schema.ts`.
- **UI**: Mantine v7, TanStack React Query v4, react-hook-form.
- **Auth**: next-auth v4 with `@auth/drizzle-adapter`.

## Gotchas

- **Build does not block on type or lint errors**: `next.config.mjs` has `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. CI runs `pnpm typecheck` then `pnpm lint` as separate steps. Always run those before pushing.
- **reactStrictMode is off** (`next.config.mjs:10`).
- **typedRoutes enabled** (`next.config.mjs:33`): route strings in `next/link` and `next/navigation` are type-checked. Use the typed variants.
- **@total-typescript/ts-reset** is imported globally via `src/reset.d.ts` — alters built-in TypeScript behavior (e.g., `array.includes`, `fetch` response).
- **pnpm required**: `packageManager` is pinned to `pnpm@10.25.0`. No npm/yarn.
- **Env validation at runtime**: `@t3-oss/env-nextjs` in `src/env.mjs` validates `DATABASE_URL`, `NEXTAUTH_SECRET`, `UPLOADTHING_TOKEN`. `next.config.mjs` imports this file first, so invalid env crashes import-time. CI provides fake values for these.
- **Drizzle uses `push`, not migrate**: schema changes are pushed directly. The `drizzle/` directory holds Drizzle Kit metadata, not migration files.

## Code Conventions

- `@/*` → `./src/*`
- Prettier: `printWidth: 80` (no other overrides)
- ESLint: extends `next/core-web-vitals` + `@typescript-eslint/recommended` + `prettier`. `no-unused-vars` is a warning.
- No test suite exists.

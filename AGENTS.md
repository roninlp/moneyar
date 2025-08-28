# AGENTS.md

## Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm lint` - Run Biome linter/formatter checks
- `pnpm format` - Format code with Biome
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Drizzle database studio
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage report

## Architecture

- **Stack**: Next.js 15 + React 19, TypeScript, Tailwind CSS, Drizzle ORM + Turso SQLite
- **Auth**: Better Auth with email/password + verification (src/lib/auth.ts, src/lib/auth-client.ts)
- **Database**: Drizzle ORM with Turso (LibSQL), schema in src/lib/db/schema/auth.ts
- **UI**: Radix UI components, shadcn/ui pattern, Sonner toasts, next-themes
- **Email**: Resend integration for verification emails
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library React + jsdom (vitest.config.ts, src/test/setup.ts)

## Code Style

- **Linting**: Biome (configured in biome.json) with React/Next.js rules
- **Formatting**: 2 spaces, sorted Tailwind classes via useSortedClasses rule
- **Imports**: Absolute paths using `@/` prefix, auto-organized imports
- **Types**: Strict TypeScript, Zod schemas for validation
- **Components**: Client components marked with "use client", UI components in components/ui/
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Utils**: cn() utility for class merging (clsx + tailwind-merge)
- **Testing**: Vitest with vi globals, comprehensive React component testing with Testing Library

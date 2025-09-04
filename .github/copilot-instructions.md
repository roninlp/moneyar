# Moneyar - GitHub Copilot Instructions

## Architecture Overview

This is a Persian RTL personal finance management app built with Next.js 17 + React 19, featuring multi-user authentication and account/transaction management.

**Core Stack**: Next.js App Router + TypeScript + Tailwind CSS + Drizzle ORM + Turso SQLite + Better Auth + Resend

**Data Model**: User → Accounts (checking/savings/credit/etc) → Transactions (income/expense with categories)

## Key Development Patterns

### Database & Schema
- **Drizzle ORM** with Turso SQLite: schemas in `src/lib/db/schema/` (auth.ts, accounts.ts, transactions.ts)
- Use `integer({ mode: "timestamp" })` for dates, always include `userId` foreign keys for multi-tenancy
- Run `pnpm db:push` to sync schema changes, `pnpm db:studio` for database GUI

### Authentication & Authorization
- **Better Auth** with email/password + verification: `src/lib/auth.ts` (server), `src/lib/auth-client.ts` (client)
- Server actions use `auth.api.getSession({ headers: await headers() })` for auth checks
- Route groups: `(auth)` for public, `(dashboard)` for authenticated pages
- All database operations must filter by `userId` for security

### Forms & Validation
- **React Hook Form + Zod**: schemas in `src/lib/types/` directory
- Pattern: `{entity}FormSchema` for validation, `{Entity}FormData` for TypeScript types
- All forms use `zodResolver`, display errors via shadcn/ui `FormMessage` components
- Server actions return `{ success: boolean, error?: string, data?: T }` format

### Server Actions & Data Flow
- **Server actions** in `src/lib/actions/` with "use server" directive
- Always call `revalidatePath()` after mutations to update cached data
- Use `generateId()` from utils.ts (UUID v9) for primary keys
- Pattern: validate input → check auth → perform operation → revalidate path → return result

### UI Components & Styling
- **shadcn/ui** components in `components/ui/`, custom components at root level
- Use `cn()` utility for conditional classes (clsx + tailwind-merge)
- RTL layout: `dir="rtl"` in layout.tsx, Persian text throughout
- Biome auto-sorts Tailwind classes via `useSortedClasses` rule

### Testing Strategy
- **Vitest + Testing Library React**: test files alongside components with `.test.tsx`
- Global test setup in `src/test/setup.ts` mocks Next.js router, sonner, auth client
- Run `pnpm test` for watch mode, `pnpm test:run` for CI, `pnpm test:coverage` for coverage

### Environment & Configuration
- **T5 Env**: type-safe environment variables in `src/env.ts`
- Database: Turso SQLite with `DATABASE_URL` + `DATABASE_AUTH_TOKEN`
- Email: Resend for verification emails with custom Persian templates
- **Biome**: unified linter/formatter (replaces ESLint + Prettier)

## Critical Commands

### Dont run dev or build commands at all costs, the developer is already running a dev server and it corrupts the developer's workflow and dev server. whenever you need to run dev or build commands just dont do it.

```bash
# Development
pnpm dev                 # Start with Turbopack
pnpm build               # Production build with Turbopack
pnpm lint                # Biome checks
pnpm format              # Biome formatting

# Database
pnpm db:push             # Deploy schema changes
pnpm db:studio           # Open Drizzle Studio

# Testing
pnpm test                # Watch mode
pnpm test:run            # Single run
pnpm test:coverage       # With coverage
```

## File Organization

- `/src/app/` - Next.js App Router with route groups for auth state
- `/src/lib/db/schema/` - Drizzle schemas (auth, accounts, transactions)
- `/src/lib/actions/` - Server actions for data mutations
- `/src/lib/types/` - Zod schemas and TypeScript types
- `/src/components/` - React components (UI components in /ui subdirectory)
- `/src/test/` - Global test configuration and mocks

## Important Conventions

3. **Persian/RTL First**: All text in Persian, `dir="rtl"` layout, appropriate icon directions
4. **Multi-tenant**: Always filter by `userId` in database operations for security
5. **Type Safety**: Zod schemas for all forms/APIs, strict TypeScript configuration
6. **Consistent Patterns**: Server actions follow validate → auth → operate → revalidate flow
7. **Modern React**: Use React 19 features, Next.js 15 App Router patterns exclusively

## Tooling for shell interactions 
- Is it about finding FILES? use 'fd' 
- Is it about finding TEXT/strings? use 'rg' 
- Is it about finding CODE STRUCTURE? use 'ast-grep'
- Is it about SELECTING from multiple results? pipe to 'fzf' 
- Is it about interacting with JSON? use 'jq' 

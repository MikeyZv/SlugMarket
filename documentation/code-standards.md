# SlugMarket Coding Standards

These standards reflect the conventions already used across `slugmarket_next/`.
Follow them for consistency. When in doubt, match the surrounding code.

> ⚠️ **Next.js version notice** — see `slugmarket_next/AGENTS.md`. This Next.js
> release has breaking changes vs. older docs. Read the relevant guide under
> `node_modules/next/dist/docs/` before writing framework code.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5** (`strict: true`)
- **Tailwind CSS v4** for styling · **lucide-react** for icons
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) for data, auth, storage
- **Vitest** + **Testing Library** for tests

## Project layout

- `app/` — routes (App Router). Route groups: `(auth)` and `(main)`.
- `app/components/` — shared React components, with colocated `__tests__/`.
- `app/actions/` — server actions (e.g. `revalidateListings`).
- `app/api/` — route handlers.
- `lib/` — framework-agnostic helpers, types, and the Supabase client.
- Use the `@/*` path alias for imports from the project root
  (e.g. `@/lib/supabase`, `@/app/actions/listings`) instead of long relative paths.
  Sibling files may use relative imports (e.g. `./AuthProvider`).

## TypeScript

- `strict` mode is on — no implicit `any`, handle `null`/`undefined` explicitly.
- Type component props with a local `type XProps = { ... }` declaration; mark
  optional props with `?` (e.g. `className?: string`).
- Prefer precise types over `any`. Use type guards for narrowing, e.g.
  `.filter((p): p is string => p !== null)`.
- Access required env vars through `process.env.NAME!` only in trusted setup
  modules (see `lib/supabase.ts`). Never hard-code secrets.

## Components

- Add `"use client";` as the first line of any component using hooks, state,
  browser APIs, or event handlers. Leave it off for server components.
- One component per file; **default export** the component. Name the file after
  the component in PascalCase (`DeleteButton.tsx`).
- Import the shared client from `@/lib/supabase` — do not create new clients.
- Get the current user via the `useAuth()` hook from `AuthProvider`.
- Guard authorization in the UI where appropriate (e.g.
  `if (user?.id !== sellerId) return null;`).
- Manage async UI state with `useState` loading flags; disable buttons and show
  progress labels ("Deleting...") while a request is in flight.
- After mutations, call the relevant server action (e.g. `revalidateListings()`)
  and navigate with `useRouter()` from `next/navigation`.

## Styling

- Use Tailwind utility classes inline. Allow a `className?` prop to override
  defaults, falling back with `className ?? "<defaults>"`.
- Reuse the existing visual language (rounded-xl/2xl, gray-based borders,
  `transition hover:` states, `disabled:opacity-50`, `cursor-pointer`).

## Error handling

- Check Supabase responses for `error` before proceeding; bail out and reset
  loading state on failure rather than navigating away.
- Log unexpected errors with a bracketed component tag:
  `console.error("[DeleteButton] storage removal error:", error);`

## Naming & exports

- Components & files: PascalCase. Hooks: `useThing`. Helpers/vars: camelCase.
- Module-level constants: `UPPER_SNAKE_CASE` (e.g. `BUCKET`).
- **Default export** for components; **named exports** for utilities, types,
  and server actions.

## Testing

- Colocate tests in `__tests__/` next to the code, named `<Name>.test.tsx`.
- Use Vitest (`describe` / `it` / `expect`) with Testing Library.
- Mock modules with `vi.mock`, and hoist shared mock fns via `vi.hoisted`.
- Reset mocks in `beforeEach`; query by role/text the way a user would
  (`getByRole("button", { name: /.../i })`).
- Wrap state-updating interactions in `act(async () => { ... })`.
- Group related cases with section comments (`// --- Deletion flow ---`).
- Test behavior and edge cases: visibility, success, failure, and loading states.

## Before committing

- `npm run lint` — ESLint (`eslint-config-next`, core-web-vitals + TS) must pass.
- `npm run test:run` — the Vitest suite must pass.
- `npm run build` — should succeed for production-affecting changes.

# TEST PLAN

## Purpose

This document describes how SlugMarket is tested: the tools we use, the
conventions every test follows, what we cover, and what we deliberately leave
out. It is the strategy behind the suites in `slugmarket_next/**/__tests__/`.

## Scope

- **In scope:** Client-side React components and page components — their
  rendering, conditional/branching UI, user interactions (clicks, typing, form
  submission), and the calls they make to external services (Supabase,
  Next.js navigation).
- **Out of scope (for now):** End-to-end browser flows, the Supabase backend and
  its row-level-security rules, database schema/migrations, and visual/CSS
  regression. These are validated manually during sprint review.

## Tooling

| Concern | Choice |
|---|---|
| Test runner | [Vitest](https://vitest.dev) (`globals: true`) |
| DOM environment | `jsdom` |
| Rendering / queries | `@testing-library/react` |
| Custom matchers | `@testing-library/jest-dom` (loaded in `vitest.setup.ts`) |
| Path alias | `@` → the `slugmarket_next/` root |

Configuration lives in [vitest.config.ts](../slugmarket_next/vitest.config.ts).

### Running the tests

Tests **must** be run from the Next.js project directory, not the repo root:

```bash
cd slugmarket_next
npx vitest run          # run the whole suite once
npx vitest              # watch mode
npx vitest run EditProfile   # run a single file by name fragment
```

## Conventions

Every suite follows the same shape so they stay readable and predictable:

1. **One suite per component**, colocated under a sibling `__tests__/` folder
   (e.g. `app/components/__tests__/EditProfile.test.tsx`).
2. **`describe` names the component; each `it` describes one observable
   behavior** in plain English (e.g. *"closes the modal via the Cancel button
   without saving"*). The `it` names double as living documentation of what the
   component does.
3. **Mock at the boundary, not the internals.** We mock external dependencies
   the component reaches out to — never the component's own logic:
   - `@/lib/supabase` — replaced with a chainable mock matching the exact call
     shape the component uses (e.g. `from().update().eq()` for EditProfile,
     `from().insert()` for ReportButton, `auth.signUp()` for sign-up).
   - `next/navigation` — `useRouter().push` is replaced with a spy so we can
     assert (or assert the absence of) redirects.
   - `../AuthProvider` — `useAuth` is mocked per-test to control the current
     user and ownership branches.
   - `next/link` — stubbed to a plain `<a>` where needed.
   - Real, jsdom-friendly child components (e.g. `Dropdown`) are used un-mocked
     so we test integration rather than a stand-in.
4. **Shared mock functions** referenced inside a `vi.mock()` factory are created
   with `vi.hoisted()`; mocks are reset in `beforeEach` so tests don't leak
   state.
5. **Query by what the user perceives** — role, label, placeholder, visible
   text — rather than test IDs or class names. When the same text appears more
   than once (e.g. a value shown in both the page and a modal), scope the query
   to a subtree with `within(...)`.
6. **Async UI is awaited**, not guessed at: `waitFor`, `findBy*`, or `act()`
   around interactions that trigger state updates.

## What we test for each component

For every component we walk through the same checklist and write a case for each
item that applies:

- **Rendering:** the right content appears for the given props.
- **Conditional branches:** each `if`/ternary that changes the UI — ownership
  gating, empty vs. populated states, loading vs. loaded, error vs. success.
- **Interactions:** clicks, typing, toggles, and form submission produce the
  expected UI change.
- **Side effects:** the correct external call is made with the correct
  arguments (and *not* made when it shouldn't be).
- **Async states:** loading indicators appear and disabled controls disable
  while a request is in flight; success and failure paths each render correctly.
- **Input handling:** validation messages, trimming, character limits, and
  draft-vs-committed state where relevant.

## Current coverage

Suites currently exist for the following (see `slugmarket_next/**/__tests__/`):

**Auth pages** — sign-in, sign-up, forgot-password, reset-password.

**Components** — EditProfile, EditButton, DeleteButton, ReportButton,
ShareButton, MakeOfferButton, MessageButton, ListingCard, ListingManageModal,
ProductListingForm, ProfileTabs.

**Pages** — messages.

### Example: EditProfile

A representative breakdown of how the checklist maps to cases for one component
([EditProfile.test.tsx](../slugmarket_next/app/components/__tests__/EditProfile.test.tsx)):

- **Display:** formatted college + bio render; `"College Nine"` is not suffixed
  with "College".
- **Ownership:** the owner sees the edit pencil and an "Add a bio…" prompt;
  non-owners and logged-out viewers see neither.
- **Modal open/close:** opens on click; fields seed from the current values;
  Cancel, backdrop click, and the X all close it, while clicking inside the
  panel does not.
- **Character counter:** updates live as the bio is typed.
- **Saving:** the bio is trimmed and `{ bio, college }` is persisted via
  `update(...).eq("id", profileId)`; empty values persist as `null`; Save
  disables and shows "Saving…" while the request is in flight; the displayed
  profile reflects the new values afterward.
- **Draft isolation:** edits that are cancelled are discarded, and reopening
  re-seeds from the saved value.

## When is a feature "tested enough"

A component-level feature meets the testing bar when:

- Every conditional UI branch has at least one case.
- Each external call it makes is asserted with its arguments, and its
  not-called cases are covered.
- Loading, success, and error states each have a case where applicable.
- The full suite (`npx vitest run`) passes green.

This is the testing slice of the broader
[Definition of Done](definition-of-done.md), which also covers review, merging,
and end-to-end behavior.

SlugMarket Coding Standards
1. Purpose
This document defines the coding standards for SlugMarket. Its purpose is to keep the codebase consistent, readable, secure, and maintainable as multiple team members contribute to the project.
2. General Principles
Prefer simple, readable solutions.
Do not duplicate functionality that already exists in a library, helper, or reusable component.
Do not swallow errors or fail silently; handle errors clearly and log useful information.
Do not write code for imagined future features unless there is a clear current need.
Keep components, functions, and files focused on one responsibility.
3. Language and Framework Standards
New code should be written in TypeScript.
Use Next.js App Router conventions for pages, layouts, and route groups.
Use functional React components only.
Use "use client" only when interactivity, hooks, or browser APIs are required.
4. File and Naming Conventions
4.1 Components
Use PascalCase for component names and filenames.
Examples:
ListingCard.tsx
ProductImageGallery.tsx
4.2 Variables and Functions
Use camelCase for variables and functions.
Examples:
fetchBookmarkedProducts
handleSignOut
4.3 Types, Interfaces, and Enums
Use PascalCase for all type aliases, interfaces, and enums.
Examples:
type OfferStatus = "pending" | "accepted" | "declined" | "withdrawn";

interface MessageProps {
 body: string;
 senderId: string;
}
4.4 Boolean Variables
Boolean variables should start with is, has, or can.
Examples:
isLoading
hasError
canEdit
4.5 Routes
Follow Next.js route naming conventions.
Example:
app/(main)/products/[id]/page.tsx
4.6 Database Helpers
Put Supabase fetch/query helpers in lib/.
Example:
lib/fetchProducts.ts
5. Type Annotation Standards
5.1 General Rules
Always annotate function parameter and return types explicitly.
Let TypeScript infer simple local variable types where the type is obvious.
Avoid any. Use unknown when the type is truly unknown and narrow it before use.
Avoid as type casts unless there is no alternative. Document why when used.
Good:
async function fetchOffer(id: string): Promise<Offer | null> {
 // ...
}
Avoid:
async function fetchOffer(id) {
 // ...
}
5.2 Null and Undefined
Use T | null when null is a valid, expected state.
Use T | undefined only for optional function parameters or missing object fields.
Do not use non-null assertion ! unless you are certain the value cannot be null at that point.
Good:
const profile: Profile | null = null;
Avoid unless justified:
const profile = data!;
5.3 Props
Always define a type or interface for component props. Do not use inline prop types for non-trivial components.
Example:
type Props = {
 listingId: string;
 listingPrice: number;
 sellerId: string;
};

export default function MakeOfferButton({
 listingId,
 listingPrice,
 sellerId,
}: Props) {
 // ...
}
5.4 Avoid Overly Broad Types
Prefer specific union types over string when the set of values is known.
Good:
status: "pending" | "accepted" | "declined" | "withdrawn";
Avoid:
status: string;
5.5 Importing Types
Use import type when importing types only, to keep runtime imports clean.
Example:
import type { Listing } from "@/lib/types";
6. Component Standards
Prefer small, reusable components with a single responsibility.
Avoid deeply nested JSX when possible.
Shared UI belongs in app/components/.
Page files should primarily handle layout and data flow, not large amounts of UI duplication.
7. State Management
Use local state for local UI behavior.
Use shared providers only when state truly needs to be shared across multiple areas.
Keep state as close as possible to where it is used.
Do not introduce global state unnecessarily.
8. Styling Standards
Use Tailwind CSS for styling.
Keep spacing, typography, and button styles consistent across the app.
Reuse existing class patterns where possible.
Avoid inline styles unless necessary.
UI should be responsive on desktop.
9. Environment Variables and Secrets
Secrets must never be hardcoded in source files.
Supabase URL and keys must be stored in .env.local.
.env.local must not be committed unless explicitly approved by the team.
Missing configuration should fail clearly with a useful error message.
10. Error Handling
Catch and handle errors for all async database operations.
Log useful technical errors for debugging.
Show user-friendly fallback UI when possible.
Network failures, missing auth, and empty data should be handled gracefully.
11. Security Standards
Validate and sanitize user input.
Do not trust form data or query parameters.
Restrict access to user-specific data such as bookmarks, messages, and profiles.
Review Supabase row-level security policies carefully.
Use HTTPS links for external assets.
Consider common web security risks: XSS, CSRF, SQL injection, SSRF, IDOR, and open redirects.
12. Testing Standards
Use both unit tests and integration tests when possible.
Prioritize tests for:
Search logic
Bookmark save/remove behavior
Listing creation validation
Profile/bookmark fetch helpers
Auth-dependent UI states
Do not test private implementation details unnecessarily.
Put important debugging information in tests rather than leaving debug logs in production code.
13. Git and Collaboration Standards
Pull the latest changes before starting new work.
Write clear, focused commit messages.
Use code review before merging to main.
Main branch should require passing tests and review.
Keep commits scoped to one feature or fix when possible.
Assign yourself to a task before starting work.
When a task is finished, move it to done/closed in the team tracker right away.
Commit message examples:
Add bookmarked items page
Refine product page layout
Connect navbar search to URL query
14. CI/CD and Tooling
Keep package-lock.json committed.
Avoid overly complex shell scripts; move complex automation into TypeScript.
Run linting and tests before merging.
15. Code Review Checklist
Before submitting code, ask:
Does this duplicate logic that already exists?
Is the code readable and consistent with the rest of the app?
Are errors handled clearly?
Are security and authentication concerns considered?
Does this work with the current Supabase schema and policies?
Is the UI consistent with the rest of SlugMarket?





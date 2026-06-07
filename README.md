# SlugMarket
An exclusive marketplace for UCSC students

## Project Structure

```
SlugMarket/
├── README.md
├── documentation/                   # Sprint plans, reports, and burnup charts
│   ├── images/
│   ├── release-plan.md
│   └── sprint-{1..4}-{plan,report}.md
└── slugmarket_next/                 # Next.js (App Router) application
    ├── CLAUDE.md, AGENTS.md, README.md
    ├── eslint.config.mjs            # Config: ESLint, Next, PostCSS,
    ├── next.config.ts               #   TypeScript, Vitest, package.json
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── vitest.config.ts, vitest.setup.ts
    ├── app/
    │   ├── (auth)/                  # forgot-password, reset-password, signin, signup
    │   ├── (main)/                  # home, [username], bookmarks, messages,
    │   │                            #   products (+create/edit/[id]), search
    │   ├── actions/                 # Server actions (listings.ts)
    │   ├── api/                     # Route handlers (products)
    │   ├── auth/callback/           # OAuth callback route
    │   ├── components/              # React components (+ __tests__/)
    │   ├── layout.tsx, globals.css, favicon.ico
    ├── lib/                         # supabase, types, utils, fetchProducts,
    │                                #   uploadImages, useUnreadMessageCount (+ __tests__/)
    └── public/                      # Static assets (logos)
```

The application lives in [slugmarket_next/](slugmarket_next/) — a Next.js App Router project
backed by Supabase, with route groups for auth and main flows and colocated `__tests__/`
directories run by Vitest.

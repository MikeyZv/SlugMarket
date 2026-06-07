# DEFINITION OF DONE

A shared checklist for when work is truly "done" — not just "it runs on my
machine." It applies at three levels: an individual **task**, a **user story**,
and a **sprint**. A higher level isn't done until everything beneath it is.

The goal is a consistent bar everyone on the team can point to during review, so
"done" means the same thing whether it's said by Andrew, Kenny, Luis, or Miguel.

## Task level

A task on the scrum board may move to **Done** when:

- The code implements what the task describes, and nothing more (no unrelated
  changes bundled in).
- It builds with no new errors or warnings (`npm run build` / `npm run lint`).
- New or changed UI behavior is covered by tests that follow the
  [test plan](test-plan.md) — every conditional branch, interaction, and
  external call has a case.
- The full test suite passes green (`cd slugmarket_next && npx vitest run`).
- The code matches the conventions of the surrounding code (naming, structure,
  formatting) and any project rules in `AGENTS.md` / `CLAUDE.md`.
- It is committed with a clear message and pushed to the branch.

## User story level

A user story is **Done** when all of its tasks are done **and**:

- Every acceptance criterion implied by the story ("As a user, I want… so
  that…") is satisfied and has been demonstrated working end-to-end in the
  running app, not just in unit tests.
- The happy path **and** the obvious error/empty states behave sensibly
  (e.g. invalid input, no results, not-logged-in, not-the-owner).
- It works for the intended audience — a UCSC student using the app in a normal
  browser — including a reasonable mobile layout where the story has UI.
- Any backend pieces the story needs (Supabase tables, columns, policies)
  exist and are wired up, and the feature respects access rules (users can only
  edit their own data).
- The change has been reviewed by at least one other team member and merged to
  `main` without breaking existing features.
- Supporting documentation is updated if the story changed how something works.

## Sprint level

A sprint is **Done** when:

- Every user story committed to in the sprint plan meets the user-story
  definition above, **or** any unfinished story is explicitly carried over and
  noted in the sprint report.
- `main` is in a working, demoable state — the app runs and the sprint's
  features can be shown live during sprint review.
- The full test suite passes on `main`.
- The sprint report and burnup chart are updated to reflect what was actually
  completed.

## What "done" does NOT mean

- It does **not** mean "the code is written." Untested or unreviewed code is not
  done.
- It does **not** mean "it works on my branch." It has to work on `main` for the
  story to be done.
- It does **not** mean "I'll add tests later." Tests are part of the task, not a
  follow-up.

## Related documents

- [test-plan.md](test-plan.md) — how we test and what coverage a task needs.
- [release-plan.md](release-plan.md) — the product backlog and sprint breakdown.

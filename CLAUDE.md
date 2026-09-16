# Project AI Instructions

## Project

[Short description]

## Architecture

See:

- docs/ai/project-overview.md
- docs/ai/architecture.md

## Business Logic

See:

- docs/ai/business-flows.md

## Rules

Before modifying existing functionality:

1. Inspect the current implementation.
2. Trace affected callers and dependencies.
3. Identify side effects.
4. Propose a minimal implementation plan.
5. Do not refactor unrelated code.

## Important Constraints

- Do not change API contracts without approval.
- Do not modify database schema without migration.
- Do not introduce dependencies without justification.
- Do not rewrite existing modules unless explicitly requested.
- Preserve existing behavior unless the requirement explicitly changes it.

## Existing Codebase Rule

When working on an existing feature:

DO NOT assume the documentation is correct.

Use this priority:

1. Actual source code
2. Tests
3. Database/schema
4. Recent Git history
5. Documentation
6. Your assumptions

If documentation conflicts with implementation, report the discrepancy.

## Development

Before completing a task:

- run relevant tests
- run typecheck
- run lint
- review git diff
- report changed files
- report remaining risks

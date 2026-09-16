# Testing

> Current implementation. References point to actual source files.

## Summary

**There are no application tests.** Application code coverage is effectively **0%**.

## Evidence

- No `test` script in `package.json` (`package.json:5-10`).
- No test framework configured: no `jest`, `vitest`, `playwright`, or `cypress` config in the project root.
- The only `*.test.*` files present are inside `node_modules` (dependencies' own test suites — e.g. `@tanstack/react-query`, `livekit-client`), not project code.
- No `__tests__`, `e2e/`, or `cypress/` directories in application source.

## Test types present

- Unit tests: **None.**
- Integration tests: **None.**
- E2E tests: **None.**

## Highest-risk untested areas

- **Authorization logic** embedded in Prisma `where` clauses (servers/channels/members handlers) — security-critical, no tests.
- **Realtime broadcast + cache-mutation path** (`pages/api/socket/*`, `hooks/use-chat-socket.ts`).
- **Message soft-delete / edit permissions** (`pages/api/socket/direct-messages/[directMessageId].ts`).

## Notes for adding tests later

- Any test that exercises the DB needs a MySQL instance (schema via `prisma db push`; no migrations exist).
- Auth is Clerk-based, so integration tests need Clerk mocking or test keys (approach **UNKNOWN**).

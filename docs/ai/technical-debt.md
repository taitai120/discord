# Technical Debt

> Current implementation. Categorized by risk. No refactors implied — descriptive only.

## High risk

1. **Committed `.gitconfig` + credential-shaped env names.**
   - `.gitconfig` is committed (commit `c5c46f3` "add git config"); `.env.example` includes `USERNAME`/`PASSWORD`.
   - Why: potential credential leakage / accidental secret commit. **Contents of `.gitconfig` not fully inspected — flag for review.**

2. **Socket.IO ↔ hosting mismatch + hardcoded CORS.**
   - `pages/api/socket/io.ts:23` — CORS origin hardcoded to `http://localhost:3000`.
   - Socket.IO attaches to a persistent Node HTTP server; serverless hosts (Vercel) don't keep persistent WebSockets.
   - Impact: realtime breaks in production / non-local deploys.

3. **No database migrations.**
   - No `prisma/migrations` directory; schema applied via `db push`.
   - Impact: unversioned, irreversible schema changes; no audit trail.

4. **Zero test coverage of security-critical logic** (see `testing.md`).
   - Impact: silent regressions in authorization / realtime paths.

## Medium risk

5. **`GET /api/servers` returns ALL servers to any authenticated user.**
   - `app/api/servers/route.ts:24-31` — `findMany` with no membership `where`, includes `members` + `channels`.
   - Impact: data exposure + unbounded query cost. (May be intentional for a "browse servers" feature — intent **UNKNOWN**; `(setup)/page.tsx:19` also does unfiltered `findMany`.)

6. **Realtime broadcasts are not authorization-scoped.**
   - `io.emit(channelKey, message)` broadcasts to all sockets; the handshake has no auth (`pages/api/socket/io.ts`).
   - Impact: a client subscribing to another channel/server's key can receive its messages.

7. **Swallowed client errors.**
   - `console.log(error)` in catch blocks (`chat-input.tsx:52`, `chat-item.tsx:104`); `Toaster` not wired in.
   - Impact: users get no feedback on failed sends/edits.

8. **Debug artifacts in shipped code.**
   - `socket-provider.tsx:35` (`"connect ne"`), `socket-provider.tsx:32` (dead `socketInstance;`), `chat-input.tsx:42-49` (perf timing logs), `pages/api/socket/io.ts:31-40` (`sayhi` no-op handler).

9. **Duplicated join-server logic.**
   - `PUT /api/servers` (`app/api/servers/route.ts:71-117`) vs `invite/[inviteCode]/page.tsx:32-49`.
   - Impact: must be kept in sync.

## Low risk

10. **`keydown` listener leak** — removed with wrong event name `"keyDown"` (`components/chat/chat-item.tsx:79-81`).
11. **Hardcoded placeholder image URLs** in metadata (`app/layout.tsx:38,53` — freepik).
12. **`extractInviteCode` regex** assumes a specific URL shape, falls back to raw input (`lib/utils.ts:8-12`).
13. **Suspicious runtime deps** likely installed by accident: `add`, `dropdown-menu`, `shadcn-ui` (`package.json`).
14. **Overlapping refresh mechanisms** — socket cache update + `router.refresh()` + React Query for the same data (`chat-input.tsx:47-51`).

## Structural inconsistencies (documented, not defects per se)

- Two auth helpers (`current-profile` vs `current-profile-pages`) for the two routers.
- Message reads in App Router, writes in Pages Router.
- Validation: Zod on client, manual checks on server (not shared).
- Some routes validate pagination/inputs; most don't.

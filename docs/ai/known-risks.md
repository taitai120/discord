# Known Risks & Open Questions

> Current implementation. Areas where future changes are likely to be risky, plus unresolved unknowns.

## Risky areas for future changes

1. **Dual-router message system.**
   - Reads in `app/api/messages` + `app/api/direct-messages`; writes in `pages/api/socket/messages` + `.../direct-messages`.
   - Any message change must be made in two places with matching socket key conventions (`chat:<id>:messages`, `chat:<id>:messages:update`). Easy to desync.

2. **Realtime cache mutation** (`hooks/use-chat-socket.ts`).
   - Directly mutates React Query's paginated cache shape `{ pages: [{ items: [] }] }`. Fragile to any response-structure change.

3. **Authorization encoded in Prisma `where` clauses.**
   - Security depends on subtle filters (`profileId: { not: profile.id }`, `role: { in: [...] }`). A query simplification can silently drop an auth check — and there are **no tests** to catch it.

4. **Socket.IO server lifecycle & CORS.**
   - Singleton attach (`if (!res.socket.server.io)`) + hardcoded localhost CORS (`pages/api/socket/io.ts:23`). Environment-sensitive; changes here can break all realtime.

5. **`relationMode = "prisma"`.**
   - Cascade deletes are app-emulated, not DB-enforced (`prisma/schema.prisma:11`). New relations require remembering `@@index` and that DB-level FK integrity does not exist.

6. **Unscoped data exposure hotspots.**
   - `GET /api/servers` (all servers) and unscoped realtime broadcasts are the two most likely places for a data-leak bug when adding features.

7. **Deep Clerk coupling.**
   - Auth woven in via three helpers (`current-profile`, `current-profile-pages`, `initial-profile`) + middleware. Swapping providers touches every route.

## Specific authorization gaps to verify before extending

- **Socket handshake has no auth** (`pages/api/socket/io.ts`); broadcasts not membership-scoped.
- **LiveKit token endpoint** mints a token for any authenticated caller with any `room`/`username`; no channel-membership check (`app/api/livekit/route.ts:4-34`). Intent **UNKNOWN**.

## Open questions / UNKNOWNs

- **Package manager / lockfile** — none surfaced. Which is authoritative?
- **`USERNAME` / `PASSWORD` env vars** — not referenced in traced app code. Purpose unknown.
- **`.gitconfig` contents** — committed; needs review for sensitive data.
- **Deployment host** — is realtime actually working in production given the Vercel/Socket.IO tension? Where is it hosted?
- **DB provisioning / migration process** — how is the MySQL schema applied/evolved without a `migrations` folder?
- **`pages/api/socket/messages/[messageId].ts`** — channel message edit/delete handler not read in full; assumed symmetric with the DM handler. Confirm before modifying message-edit logic.
- **`GET /api/servers` intent** — deliberate "browse all servers" (feeds `InitialModal`) or an oversight? It exposes every server's members/channels.

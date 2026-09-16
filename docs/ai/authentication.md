# Authentication & Authorization

> Current implementation. References point to actual source files.

## Provider

**Clerk, entirely.** No local password/session logic in traced app code. `.env.example` lists `USERNAME`/`PASSWORD`, but these are **not referenced by traced app code — purpose UNKNOWN** (possibly DB creds or deploy basic-auth).

## Login / registration

- Clerk-hosted flows at `app/(auth)/(routes)/sign-in/[[...sign-in]]/page.tsx` and `.../sign-up/[[...sign-up]]/page.tsx` (catch-all routes).
- Redirect targets come from env: `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (`.env.example`).
- Registration side effect: local `Profile` created lazily on first authenticated visit — `lib/initial-profile.ts:21-28`.

## Session / tokens

- Managed by Clerk cookies; the app never handles tokens directly.
- **No custom refresh-token or logout logic** in app code (delegated to Clerk).

## Middleware / guard

- `middleware.ts` — `authMiddleware({ publicRoutes: ["/api/uploadthing", "/"] })`.
- **Public:** `/` (landing) and `/api/uploadthing`. **Everything else requires a Clerk session.**
- Matcher (`middleware.ts:11`) excludes static files and `_next`, includes `(api|trpc)(.*)`.

## Identity resolution helpers (three variants)

| Helper | Context | Mechanism | File |
|---|---|---|---|
| `currentProfile()` | RSC + App Router handlers | `auth()` → Prisma | `lib/current-profile.ts` |
| `currentProfilePages()` | Pages API routes | `getAuth(req)` → Prisma | `lib/current-profile-pages.ts` |
| `initialProfile()` | Setup / registration | `currentUser()` + create-if-missing | `lib/initial-profile.ts` |

Standard pattern at top of every handler: `const profile = await currentProfile(); if (!profile) return 401`.

## Roles

- `MemberRole = ADMIN | MODERATOR | GUEST`, **scoped per server** (a user may be ADMIN in one server, GUEST in another). `prisma/schema.prisma:47-51`.
- No global roles or permission tables.

## Where authorization decisions are made

**Inline in each handler, largely inside the Prisma `where` clause:**

- Server owner-only ops (edit/delete/invite-code): `where: { id, profileId: profile.id }` — `app/api/servers/[serverId]/route.ts:23-33,50-55`, `.../invite-code/route.ts:31-39`.
- Channel create/edit/delete: caller must be a member with `role in [ADMIN, MODERATOR]` — `app/api/channels/route.ts:26-32`, `app/api/channels/[channelId]/route.ts:36-40,89-99`. `"general"` name protected.
- Member kick / role change: server owned by caller AND target `profileId: { not: profile.id }` — `app/api/members/[memberId]/route.ts:36-42,96-102`.
- Leave server: member self-removal, non-owner only — `app/api/servers/[serverId]/leave/route.ts:21-40`.
- Channel message write: caller must be a `Member` of the server — `pages/api/socket/messages/index.ts:36-71`.
- Message delete: owner/admin/mod; edit: owner only — `pages/api/socket/direct-messages/[directMessageId].ts:90-123` (channel equivalent assumed, **UNKNOWN**).

## Frontend auth state

- Derived from Clerk `ClerkProvider` (`app/layout.tsx:66`).
- Role-based UI gating: `role` computed in server components and passed down (`components/server/server-sidebar.tsx:79-81`).
- `components/chat/chat-item.tsx:117-121` recomputes `canEdit`/`canDelete` client-side (defense-in-depth; enforcement is server-side).

## Known gaps (see `known-risks.md`)

- Socket.IO handshake carries no auth; broadcasts are not membership-scoped.
- `GET /api/servers` returns all servers to any authenticated user (`app/api/servers/route.ts:24-31`).
- LiveKit token endpoint does not verify channel membership (`app/api/livekit/route.ts`).

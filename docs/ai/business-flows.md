# Business Flows

> Current implementation, traced through source. Only flows that actually exist.

## A. Registration / Profile bootstrap

1. Entry: visiting `/web` → `app/(web)/web/(setup)/page.tsx:6`.
2. `initialProfile()` (`lib/initial-profile.ts`): `currentUser()` from Clerk; if no local `Profile`, creates one from Clerk user fields (`name = firstName + lastName`, `imageUrl`, `email`) — `lib/initial-profile.ts:21-28`.
3. If the user already belongs to a server → redirect to it (`(setup)/page.tsx:21-23`); else render `InitialModal` with **all** servers (`findMany()`, `(setup)/page.tsx:19`).
4. Side effect: first login lazily materializes the `Profile` row.

## B. Create server

1. Entry: `components/modals/create-server-modal.tsx` (opened via Zustand `onOpen("createServer")`).
2. Form: react-hook-form + Zod; image via UploadThing.
3. API: `POST /api/servers` (`app/api/servers/route.ts:40`).
4. Prisma nested write (`route.ts:49-62`): creates `Server` + default `#general` `Channel` + `Member` with role `ADMIN`; `inviteCode = uuidv4()`.
5. Side effect: creator becomes ADMIN; `general` seeded.

## C. Join server (two paths)

- **Invite link:** `app/(web)/web/(invite)/(routes)/invite/[inviteCode]/page.tsx` — RSC. If already a member → redirect (`:19-30`); else `db.server.update` adds a `Member` (default GUEST) and redirects (`:32-49`).
- **Join modal / paste code:** `PUT /api/servers` (`app/api/servers/route.ts:71`) → `extractInviteCode()` (`lib/utils.ts:8`, regex extracts UUID from `/invite/<uuid>`) → adds member.
- ⚠ Join logic is **duplicated** across these two paths.

## D. Send channel message (realtime)

1. Entry: `components/chat/chat-input.tsx:40` `onSubmit` → axios `POST /api/socket/messages?channelId&serverId`.
2. Handler `pages/api/socket/messages/index.ts`: auth via `currentProfilePages`; verifies caller is a `Member` of the server (`:36-48`) and the channel exists (`:54-59`); creates `Message` (`:73-87`); `io.emit('chat:<channelId>:messages', message)` (`:89-91`).
3. Client receipt: `hooks/use-chat-socket.ts:54` prepends message to React Query page 0. `chat-input.tsx:51` also calls `router.refresh()`.
4. Side effects: broadcast to **all** connected sockets (no per-subscriber membership re-check — see `known-risks.md`).

## E. Edit / delete message

- Channel: `pages/api/socket/messages/[messageId].ts` — **not read in full; assumed symmetric with the DM handler. UNKNOWN if identical.**
- DM: `pages/api/socket/direct-messages/[directMessageId].ts` (fully traced).
  - Auth: caller must be a member of the conversation (`:29-70`).
  - Delete (DELETE): allowed for owner OR admin OR moderator (`:90-97`); soft delete → `content = "This message has been deleted."`, `deleted = true`, `fileUrl = null` (`:99-117`).
  - Edit (PATCH): **owner only** (`:119-123`).
  - Broadcast on `chat:<conversationId>:messages:update` (`:141-143`).
- Client mirrors permissions in `components/chat/chat-item.tsx:117-121` (`canDeleteMessage`, `canEditMessage`) — UI gating only; real enforcement is server-side.

## F. Direct messages

- Conversation resolved/created by `lib/conversation.ts` `getOrCreateConversation` — tries both member orderings due to `@@unique([memberOneId, memberTwoId])` (`conversation.ts:7-16`).
- Read: `GET /api/direct-messages` (`app/api/direct-messages/route.ts`), cursor pagination, batch 10.
- Write: `pages/api/socket/direct-messages/index.ts`.

## G. Member management (roles / kick)

- `PATCH /api/members/[memberId]?serverId=` — change role (`app/api/members/[memberId]/route.ts:5-66`).
- `DELETE /api/members/[memberId]?serverId=` — kick (`:68-123`).
- Authorization is in the Prisma `where`: server owned by caller (`profileId: profile.id`) AND target member not the owner (`profileId: { not: profile.id }`) — `:36-42`, `:96-102`.

## H. Voice / video

- `components/media-room.tsx` fetches a LiveKit token from `GET /api/livekit?room&username` (`app/api/livekit/route.ts`), then connects to LiveKit cloud directly.
- ⚠ Token endpoint mints a token for **any authenticated caller** with any `room`/`username`; no channel-membership check (`livekit/route.ts:4-34`). See `known-risks.md`.

## I. Server admin operations

- Edit server: `PATCH /api/servers/[serverId]` — owner only (`profileId: profile.id`), `app/api/servers/[serverId]/route.ts:5-39`.
- Delete server: `DELETE /api/servers/[serverId]` — owner only (`:41-62`).
- Regenerate invite code: `PATCH /api/servers/[serverId]/invite-code` — owner only (`app/api/servers/[serverId]/invite-code/route.ts`).
- Leave server: `PATCH /api/servers/[serverId]/leave` — non-owner member removes self (`profileId: { not: profile.id }` + member self-delete), `app/api/servers/[serverId]/leave/route.ts:21-40`.
- Create/edit/delete channel: `app/api/channels/route.ts`, `app/api/channels/[channelId]/route.ts` — require role in `[ADMIN, MODERATOR]`; name `"general"` is protected (cannot be created/renamed/deleted as such).

# Backend

> Current implementation. References point to actual source files.

## Routing

File-based, split across two routers:
- **App Router route handlers** (`app/api/**/route.ts`) — reads + non-realtime CRUD.
- **Pages API** (`pages/api/socket/**`) — message writes + Socket.IO server.

Endpoints:
- `app/api/servers/route.ts` — `GET` (list, paginated), `POST` (create), `PUT` (join by invite).
- `app/api/servers/[serverId]/route.ts` — `PATCH` (edit), `DELETE`.
- `app/api/servers/[serverId]/invite-code/route.ts` — `PATCH` (regenerate).
- `app/api/servers/[serverId]/leave/route.ts` — `PATCH` (leave).
- `app/api/channels/route.ts` — `POST`. `app/api/channels/[channelId]/route.ts` — `DELETE`, `PATCH`.
- `app/api/members/[memberId]/route.ts` — `PATCH` (role), `DELETE` (kick).
- `app/api/messages/route.ts` — `GET` (paginated). `app/api/direct-messages/route.ts` — `GET`.
- `app/api/livekit/route.ts` — `GET` (mint token).
- `app/api/uploadthing/{core,route}.ts` — upload file router.
- `pages/api/socket/io.ts` — Socket.IO bootstrap.
- `pages/api/socket/messages/{index,[messageId]}.ts` — channel message create/edit/delete.
- `pages/api/socket/direct-messages/{index,[directMessageId]}.ts` — DM create/edit/delete.

## Handlers

- Functions exported per HTTP method (App Router) or a single `default handler` switching on `req.method` (Pages API). **No controller classes.**

## Services / repositories

- **None.** Prisma (`lib/db.ts`) is called directly in handlers.
- `lib/db.ts` uses the global-singleton pattern to avoid connection exhaustion in dev (`:7-9`).
- Only logic helper: `lib/conversation.ts` (`getOrCreateConversation`).

## Validation

- **Manual presence checks** only (e.g. `if (!content) return 400`). No Zod on the backend.
- Pagination validated only in `app/api/servers/route.ts:13-18`; message routes parse `cursor`/`channelId` without deep validation.
- `"general"` channel-name guard in channel create/edit (`app/api/channels/route.ts:19-20`, `[channelId]/route.ts:85-86`).

## Error handling

- Uniform: `try { ... } catch (error) { console.log("[TAG]", error); return 500 }`.
- Consistent log tags: `[SERVERS_POST]`, `[SERVER_DELETE]`, `[MESSAGES_POST]`, `[CHANNEL_ID_PATCH]`, `[MEMBERS_ID_DELETE]`, etc.
- Pages API returns JSON error objects (`{ error: "..." }`); App Router returns `NextResponse` text bodies.

## Middleware

- Only Clerk global auth (`middleware.ts`). **No** per-route middleware, rate limiting, CSRF, or input sanitization.

## Logging

- `console.log` only. No structured logging, log levels, or request tracing.
- Debug artifacts left in: `pages/api/socket/io.ts:31-40` (`sayhi` handler + connect/disconnect logs); `components/providers/socket-provider.tsx:35`.

## Configuration

- Env vars read directly via `process.env` at call sites (e.g. `app/api/livekit/route.ts:19-21`).
- LiveKit handler validates config presence (`:23-28`); most other handlers assume env is set.
- Env names (`.env.example`): `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, Clerk keys, `LIVEKIT_API_KEY/SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`, `UPLOADTHING_APP_ID/SECRET`, `USERNAME`, `PASSWORD` (last two purpose **UNKNOWN**).

## External integrations

- **Clerk** — auth.
- **UploadThing** (`app/api/uploadthing/core.ts`) — auth-gated file router: `serverImage` (image, 4MB, 1 file), `messageFile` (image/pdf). `onUploadComplete` is a no-op.
- **LiveKit** — token minted server-side; client connects to cloud.
- **Socket.IO** — realtime broadcast.

## Response conventions

- Success: `NextResponse.json(entity)` (App Router) / `res.status(200).json(entity)` (Pages API).
- Realtime writes also `io.emit(<key>, entity)` before responding.

# Architecture

> Current implementation. References point to actual source files.

## Two coexisting backends

The app runs **two routers at once**:

1. **App Router route handlers** (`app/api/**/route.ts`) — used for **reads** and **non-realtime writes** (server/channel/member CRUD, message pagination). Node runtime.
2. **Pages Router API routes** (`pages/api/socket/**`) — used for **message writes** because they need the raw Node HTTP server to attach Socket.IO (`res.socket.server.io`). App Router handlers cannot expose the underlying socket, so message create/update/delete live here.
   - `pages/api/socket/io.ts:13-45` — attaches `ServerIO` to `res.socket.server` on first hit.

**There is no service or repository layer.** Route handlers call Prisma (`db`) directly. The only logic abstraction is `lib/conversation.ts` (`getOrCreateConversation`).

## Layer maps

### Read / CRUD (App Router)
```
User (browser)
 → React client component (axios / fetch)
 → Next route handler (app/api/**/route.ts)   [auth: currentProfile()]
 → Prisma (lib/db.ts)
 → MySQL
```

### Realtime message write (Pages Router + Socket.IO)
```
User → ChatInput (axios POST)
 → pages/api/socket/messages/index.ts   [auth: currentProfilePages(req)]
 → Prisma → MySQL
 → io.emit("chat:<channelId>:messages", message)      (side effect)
 → clients' useChatSocket → React Query cache update → UI re-render
```

### Server-rendered data (RSC)
```
User → Server Component (server-sidebar.tsx, layouts, pages)
 → currentProfile() (Clerk auth() + Prisma)
 → Prisma → MySQL → HTML
```

## Component communication

- **Auth:** Clerk middleware (`middleware.ts`) wraps all routes. `auth()`/`currentUser()` (RSC + route handlers) and `getAuth(req)` (pages API) resolve the Clerk `userId`, mapped to a local `Profile`.
- **Realtime:** one global Socket.IO server (`pages/api/socket/io.ts`); one client singleton (`components/providers/socket-provider.tsx`). Clients subscribe by channel/conversation key; writes broadcast via `io.emit`.
- **Caching:** TanStack React Query holds message pages in-memory (`hooks/use-chat-query.ts`). **No server-side cache (no Redis).**
- **Background jobs/workers:** **None.**
- **File storage:** UploadThing (external); returns URLs stored as `fileUrl` / `imageUrl` strings (`app/api/uploadthing/core.ts`).
- **Voice/Video:** LiveKit; token minted by `app/api/livekit/route.ts`; client connects to LiveKit cloud directly (`components/media-room.tsx`).

## Realtime event keys

- Add: `chat:<id>:messages` — `pages/api/socket/messages/index.ts:89`, `direct-messages/index.ts:91`
- Update/delete: `chat:<id>:messages:update` — `pages/api/socket/direct-messages/[directMessageId].ts:141`
- Client subscribes to both via `hooks/use-chat-socket.ts:30,54`.

## Socket.IO server config (`pages/api/socket/io.ts`)

- Path `/api/socket/io`, `bodyParser: false`.
- `transports: ["websocket", "polling"]`.
- **CORS origin hardcoded to `http://localhost:3000`** (`io.ts:23`) — breaks realtime in non-local deployments.
- Handshake carries **no authentication**; contains a debug `sayhi` no-op handler (`io.ts:32`).

## Client socket (`components/providers/socket-provider.tsx`)

- Connects to `process.env.NEXT_PUBLIC_SITE_URL` at path `/api/socket/io`.
- Exposes `{ socket, isConnected }` via React Context.
- When disconnected, `use-chat-query.ts:43` falls back to polling every 1000ms.

## Deployment tension

The Socket.IO server assumes a **persistent Node HTTP server**. Serverless hosts (e.g. Vercel) do not maintain persistent WebSocket connections, so this pattern typically fails / degrades on such hosts. See `known-risks.md`.

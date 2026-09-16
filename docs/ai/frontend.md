# Frontend

> Current implementation. References point to actual source files.

## Routing (App Router)

- Route groups with unusual double-nesting: `app/(web)/web/(main)/(routes)/servers/[serverId]/...` — a literal `web` segment plus several pathless groups.
- Public landing `/` is a separate page (`app/page.tsx`, `"use client"`, framer-motion).
- Auth pages: `app/(auth)/(routes)/sign-in|sign-up/[[...]]/page.tsx`.
- Key routes: `servers/[serverId]/channels/[channelId]/page.tsx`, `servers/[serverId]/conversations/[memberId]/page.tsx`, `invite/[inviteCode]/page.tsx`, `(setup)/page.tsx`.

## Layouts

- `app/layout.tsx` — root; wraps all providers.
- `app/(web)/web/(main)/layout.tsx` — navigation rail.
- `app/(web)/web/(main)/(routes)/servers/[serverId]/layout.tsx` — server sidebar + membership guard (redirects to `/web` if not a member, `:22-35`).

## Server vs client components

- Data-heavy shells are **RSC** and query Prisma directly (sidebars, layouts, channel/conversation pages).
- Interactive pieces are `"use client"` (chat input/item, modals, providers).

## State management

- **Server data:** React Query infinite queries for messages — `hooks/use-chat-query.ts`.
- **UI/modal state:** single Zustand store for all 13 modal types — `hooks/use-modal-store.ts` (`type` + `data` bag + `onOpen`/`onClose`).
- **Realtime:** React Context (`components/providers/socket-provider.tsx`) mutating React Query cache (`hooks/use-chat-socket.ts`).
- **RSC data:** direct Prisma; refreshed via `router.refresh()`.

## Providers (`app/layout.tsx:60-84`)

`ClerkProvider` → `ThemeProvider` (default **dark**, `enableSystem={false}`, storageKey `discord-theme`) → `SocketProvider` → `ModalProvider` + `Toaster` + `QueryProvider`.

## API layer

- **Ad-hoc, not centralized.** `axios` for writes; `fetch` for React Query reads (`use-chat-query.ts:34`); `query-string` to build URLs.
- Message reads hit App Router (`/api/messages`, `/api/direct-messages`); message writes hit Pages API (`/api/socket/messages`, `/api/socket/direct-messages`) — see `channels/[channelId]/page.tsx:57-73`.

## Forms & validation

- react-hook-form + Zod, schemas defined **inline per component** (e.g. `chat-input.tsx:23-25`, `chat-item.tsx:43-45`).
- No shared/reused validation schema between client and server.

## Realtime cache handling (`hooks/use-chat-socket.ts`)

- On `addKey`: prepend message to page 0 of the infinite-query cache (`:54-78`).
- On `updateKey`: map over all pages/items and replace by `id` (`:30-52`).
- **Fragile:** directly assumes cache shape `{ pages: [{ items: [] }] }`.

## Loading & error states

- Loading: React Query `status`, `form.formState.isSubmitting` disables inputs.
- **Errors are largely swallowed:** most catch blocks are `console.log(error)` (`chat-input.tsx:52`, `chat-item.tsx:104`). A `Toaster` exists (`app/layout.tsx:77`) but is not wired into message send/edit failures.
- Offline fallback: `use-chat-query.ts:43` polls every 1000ms when socket disconnected.

## Reusable UI

- shadcn/ui under `components/ui/` (button, dialog, form, dropdown-menu, select, command, scroll-area, sheet, toast, tooltip, avatar, badge, etc.).
- Shared helpers: `components/action-tooltip.tsx`, `components/user-avatar.tsx`, `components/emoji-picker.tsx`, `components/file-upload.tsx`.

## Conventions

- Files kebab-case; components PascalCase; hooks `use-*`.
- Feature-grouped folders: `chat/`, `server/`, `navigation/`, `modals/`, `providers/`, `ui/`.
- Icon maps for channel type / role reused across `server-sidebar.tsx` and `chat-item.tsx`.

## Known frontend defects (see `technical-debt.md`)

- `chat-item.tsx:81` removes `keydown` listener with wrong event name `"keyDown"` (listener leak).
- Debug logs left in (`socket-provider.tsx:35` "connect ne"; `chat-input.tsx:42-49` perf timing).
- Three overlapping refresh mechanisms for the same data (socket update + `router.refresh()` + React Query).

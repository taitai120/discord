# Data Model

> Source of truth: `prisma/schema.prisma`. Current implementation.

## Database

- **MySQL** (`prisma/schema.prisma:8-12`).
- `relationMode = "prisma"` (`:11`) — **referential integrity / cascade deletes are enforced by Prisma at the app layer, NOT by DB foreign keys.** This is why every relation carries an explicit `@@index`.
- **No `prisma/migrations` directory** — schema is applied via `prisma db push` (schema-drift model), not versioned migrations. No migration history / audit trail. See `technical-debt.md`.

## Entities

| Model | Key fields | Notes | Lines |
|---|---|---|---|
| **Profile** | `id`, `userId @unique`, `name`, `imageUrl`, `email` | One per Clerk user; `userId` = Clerk id | `:14-27` |
| **Server** | `id`, `name`, `imageUrl`, `inviteCode @unique`, `profileId` | `profileId` = owner | `:29-45` |
| **Member** | `id`, `role` (`MemberRole`, default `GUEST`), `profileId`, `serverId` | Join of Profile↔Server; owns messages & both conversation sides | `:53-74` |
| **Channel** | `id`, `name`, `type` (`ChannelType`, default `TEXT`), `profileId`, `serverId` | | `:82-100` |
| **Message** | `id`, `content` (Text), `fileUrl?`, `deleted` (bool), `memberId`, `channelId` | Soft-delete via `deleted` | `:102-121` |
| **Conversation** | `id`, `memberOneId`, `memberTwoId` | 1:1; `@@unique([memberOneId, memberTwoId])` | `:123-136` |
| **DirectMessage** | `id`, `content`, `fileUrl?`, `deleted`, `memberId`, `conversationId` | | `:138-156` |

## Enums

- `MemberRole = ADMIN | MODERATOR | GUEST` (default `GUEST`) — `:47-51`.
- `ChannelType = TEXT | AUDIO | VIDEO` (default `TEXT`) — `:76-80`.

## Relationships

```
Profile 1─* Server     Profile 1─* Member     Profile 1─* Channel
Server  1─* Member      Server  1─* Channel
Channel 1─* Message     Member  1─* Message
Member  1─* DirectMessage
Conversation 1─* DirectMessage
Conversation.memberOne / memberTwo → Member   (self-relation on Member)
```

- All relations use `onDelete: Cascade` in the schema, but cascade is **Prisma-emulated** (see `relationMode`).

## Indexes

Every FK is indexed (required by `relationMode="prisma"`):
- `Server @@index([profileId])`; `Member @@index([profileId]) @@index([serverId])`; `Channel @@index([profileId]) @@index([serverId])`; `Message @@index([channelId]) @@index([memberId])`; `Conversation @@unique([memberOneId, memberTwoId]) @@index([memberTwoId])`; `DirectMessage @@index([memberId]) @@index([conversationId])`.
- **No composite / query-tuning indexes** beyond uniques.

## Important queries

- Message pagination: cursor-based, batch 10, `orderBy createdAt desc` — `app/api/messages/route.ts:6-74`, `app/api/direct-messages/route.ts:6-79`.
- Server sidebar: single query with nested includes for channels + members(+profile), ordered — `components/server/server-sidebar.tsx:41-60`.
- Get-or-create conversation: two `findFirst` attempts (both orderings) then `create` — `lib/conversation.ts`.

## Data ownership

`Profile.userId` ties every row's ultimate ownership to a Clerk identity. Server ownership = `Server.profileId`. Message authorship = `Message.memberId` → `Member` → `Profile`.

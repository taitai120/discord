# Project Overview

> Describes the **current** implementation. References point to actual source files.
> Statements that could not be verified from code are marked **UNKNOWN**.

## What this is

A **Discord clone** ("Shadow Discord") — a real-time chat/community app built on **Next.js 13.4 App Router**. Features: servers, channels (text/audio/video), per-server roles (Admin/Moderator/Guest), invites, direct messages, real-time messaging (Socket.IO), voice/video rooms (LiveKit), and file uploads (UploadThing). Auth is fully delegated to **Clerk**.

- `package.json:2` — `"name": "discord-clone"`
- `app/layout.tsx:17-18` — product metadata ("Discord Clone - Chat, Voice & Community App")
- `app/page.tsx` — public marketing landing page ("Shadow Discord")

It is recognizably derived from the "Fullstack Discord Clone" tutorial but customized (landing page, nested `web/` route group, `joinServer` modal, server-list pagination). Despite production-style metadata, the code contains debug artifacts and unfinished areas (see `technical-debt.md`). Treat as **learning/portfolio-grade**, not hardened production.

## Technology stack (versions from `package.json`)

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router + a `pages/` island) | `13.4.12` |
| Language | TypeScript | `5.2.2` |
| UI runtime | React | `18.2.0` |
| Auth | Clerk (`@clerk/nextjs`) | `^4.23.2` |
| ORM | Prisma (`@prisma/client`) | `^5.2.0` |
| DB | **MySQL**, `relationMode = "prisma"` | `prisma/schema.prisma:9-11` |
| Realtime | Socket.IO server + client | `^4.7.2` |
| Voice/Video | LiveKit (`livekit-client`, `livekit-server-sdk`, `@livekit/components-react`) | `^1.x` |
| Uploads | UploadThing | `^5.5.x` |
| Data fetching | TanStack React Query | `^4.36.1` |
| Client state | Zustand | `^4.4.1` |
| Forms/validation | react-hook-form + Zod | `^7.46` / `^3.22` |
| UI kit | shadcn/ui (Radix) + Tailwind | Tailwind `3.3.3` |
| HTTP | axios | `^1.5.0` |

- **Package manager: UNKNOWN** — no lockfile surfaced in the repo listing.

## Scripts (`package.json:5-10`)

- `dev` → `next dev`
- `build` → `prisma generate && next build`
- `start` → `next start`
- `lint` → `next lint`
- **No test script.**

## Entry points

- `app/layout.tsx` — root providers (Clerk → Theme → Socket → Modal/Toaster/Query).
- `middleware.ts` — Clerk auth gate for all non-public routes.
- `pages/api/socket/io.ts` — Socket.IO server bootstrap.
- `app/page.tsx` — public landing (`/`).
- `app/(web)/web/(setup)/page.tsx` — authenticated entry / lazy Profile creation.

## Config files

- `next.config.js` — image domains (`uploadthing.com`, `utfs.io`, `www.google.com`) + webpack externals for `ws`.
- `.eslintrc.json`, `components.json` (shadcn), `tailwind.config` (referenced by `components.json`).
- `.env.example` — env var names (see `authentication.md` / `backend.md`).
- `.gitconfig` — **committed to the repo** (commit `c5c46f3`); contents need review.

## Notable structural facts

- Uses **both** App Router (`app/`) and Pages Router (`pages/api/socket/`) simultaneously — see `architecture.md`.
- **No** `docs/`-driven build, Docker, or CI config found.
- **No** `prisma/migrations` directory — schema applied via `db push` (schema-drift), not versioned migrations.

## Companion docs

`architecture.md`, `business-flows.md`, `data-model.md`, `authentication.md`, `frontend.md`, `backend.md`, `testing.md`, `technical-debt.md`, `known-risks.md`.

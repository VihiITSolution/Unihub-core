# Chat Feature — Server-Side Setup Guide

This document explains how to set up and deploy the **server side** of the in-app chat feature (implemented in `Unihub-backend`). It covers student↔tutor, student↔student, user↔vendor, vendor↔vendor, and user↔administration messaging, with attachment sharing, a contact-info filter, and full admin oversight.

It lives in this frontend repo (`Unihub-core`) so that whoever is deploying the frontend also has the backend checklist in front of them — the actual code changes are all in `Unihub-backend`.

## Table of Contents
1. [What was added](#what-was-added)
2. [Prerequisites](#prerequisites)
3. [Environment variables](#environment-variables)
4. [Install dependencies](#install-dependencies)
5. [Database migration](#database-migration)
6. [Running the server](#running-the-server)
7. [Nginx configuration (production)](#nginx-configuration-production)
8. [API reference](#api-reference)
9. [Socket.io event reference](#socketio-event-reference)
10. [Verifying the deployment](#verifying-the-deployment)
11. [Known limitations](#known-limitations)

## What was added

In `Unihub-backend`:

- **Models**: `Conversation`, `Message`, `MessageAttachment`, `BlockedMessageLog` (`src/models/`)
- **REST API**: `src/routes/chatRoutes.js` (`/api/chat/*`) and `src/routes/adminChatRoutes.js` (`/api/admin/chat/*`)
- **Real-time**: Socket.io attached to the existing Express server (`src/server.js`, `src/socket/`)
- **Contact-info filter**: `src/utils/contentFilter.js` — blocks phone numbers, emails, and off-platform app mentions in message text, server-side, at send time
- **Authorization**: `src/utils/conversationPolicy.js` — data-driven role-pair matrix
- **Attachments**: `src/config/chatUpload.js` — Cloudinary + multer, folder `unihub/chat-attachments`

No changes are required in this repo (`Unihub-core`) to make the backend work — the frontend chat UI, service, and Socket.io client were already wired up against these endpoints. This guide is purely about getting `Unihub-backend` configured and running.

## Prerequisites

- Node.js and npm (matching whatever version `Unihub-backend` already targets)
- MySQL database already reachable (same one the rest of the platform uses — chat adds tables to it, it does not need a separate database)
- Existing `Unihub-backend/.env` already configured for auth (`JWT_SECRET`) and file uploads (`CLOUDINARY_*`) — chat reuses these, it does not need new secrets for those

## Environment variables

All chat-relevant env vars are ones the backend already uses for other features, plus one new optional one:

| Variable | Required | Notes |
|---|---|---|
| `JWT_SECRET` | Yes (already set) | Reused as-is for Socket.io handshake auth |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Yes (already set) | Reused for chat attachment uploads |
| `ALLOWED_FRONTEND_ORIGINS` | Yes (already set) | Same allow-list now also governs Socket.io's CORS config, so both stay in sync automatically |
| `DO_HOST` | Only in production (already set) | Same as above |
| `NODE_ENV` | Yes (already set) | `production` skips `sequelize.sync()` — see [Database migration](#database-migration) |
| `SUPPORT_ADMIN_USER_ID` | No (optional) | The specific admin user id that `user → administration` ("Contact Support") conversations get routed to. If unset, the backend picks the first active user with `primaryRole = admin` automatically. Only set this if you want support conversations to always land with a specific admin account. |

No `.env` changes are strictly required unless you want to pin `SUPPORT_ADMIN_USER_ID`.

## Install dependencies

The chat feature adds one new backend dependency: `socket.io`.

```bash
cd Unihub-backend
npm install
```

(`socket.io` is already listed in `package.json` — a plain `npm install` picks it up.)

## Database migration

Chat adds four tables: `conversations`, `messages`, `message_attachments`, `blocked_message_logs`.

**Option A — explicit migration (recommended for a first deploy):**

```bash
cd Unihub-backend
npm run migrate:chat
```

This runs `src/migrations/create-chat-tables.js`, which creates all four tables with `CREATE TABLE IF NOT EXISTS` (safe to re-run).

**Option B — automatic on server start:**

The same table-creation logic is also baked into `runCriticalMigrations()` in `src/server.js`, which runs on **every** server boot regardless of environment. This exists because production skips Sequelize's `sync({ alter: true })` entirely (dev-only), so this is the actual safety net that guarantees the tables exist in production even if `npm run migrate:chat` is never run manually. In practice this means the tables will self-create the first time you start the server after pulling this change — Option A is just a way to do it explicitly/ahead of time.

## Running the server

No change to how you start the backend:

```bash
npm run dev     # development
npm start       # production
```

On boot you should see, alongside the existing log lines:

```
✓ Chat tables ready.
```

Socket.io is attached automatically inside `server.js` (an `http.Server` now wraps the Express `app`, with `socket.io` listening on the same port at the default path `/socket.io`). There is no separate process or port to run.

## Nginx configuration (production)

If the backend sits behind Nginx (as in the current Digital Ocean droplet setup), it needs a WebSocket-aware location block, since the existing `/api` block has `proxy_buffering off` tuned for large file uploads, not WebSocket upgrades.

The required changes are already written out in `Unihub-backend/nginx-5gb-config.conf`:

1. A `map $http_upgrade $connection_upgrade { ... }` directive in the `http {}` block (Socket.io's handshake starts as plain HTTP before upgrading, so `Connection` must vary per-request).
2. A dedicated `location /socket.io/ { ... }` block (separate from `/api`) with the `Upgrade`/`Connection` headers and a long `proxy_read_timeout` (86400s) to keep long-lived WebSocket connections open.

To apply on the server:

```bash
sudo nano /etc/nginx/sites-available/unihub   # add the map + location block
sudo nginx -t                                  # validate config
sudo systemctl reload nginx
```

Verify the upgrade works:

```bash
curl -I "https://unihub.lk/socket.io/?EIO=4&transport=polling"
# should return 200, not 502/404
```

## API reference

**User-facing** (`/api/chat`, JWT auth required):

| Method | Path | Purpose |
|---|---|---|
| GET | `/conversations` | List the current user's conversations (paginated, sorted by last message) |
| POST | `/conversations` | Start (or reuse) a conversation — `{ recipientId, contextType?, contextId? }` |
| POST | `/support` | Start (or reuse) a support conversation with an admin — no recipientId needed |
| GET | `/conversations/:id` | Fetch one conversation's metadata |
| GET | `/conversations/:id/messages` | Paginated message history |
| POST | `/conversations/:id/messages` | Send a message — multipart form, `body` text field + up to 5 `attachments` files |
| PUT | `/conversations/:id/read` | Mark the conversation as read |
| GET | `/unread-count` | Total unread message count across all conversations |

**Admin oversight** (`/api/admin/chat`, JWT auth + `admin` role required):

| Method | Path | Purpose |
|---|---|---|
| GET | `/conversations` | ALL conversations platform-wide, filterable by email/contextType/flagged |
| GET | `/conversations/:id/messages` | Full history of **any** conversation, no participant check |
| PUT | `/conversations/:id/flag` | Flag/unflag a conversation for follow-up |
| GET | `/blocked-messages` | Review log of rejected contact-info-sharing attempts |

## Socket.io event reference

Client connects with `io(BACKEND_URL, { path: "/socket.io", auth: { token } })`.

**Client → server**: `conversation:join`, `conversation:leave`, `message:send` (text only — attachments always go through the REST endpoint), `typing:start`, `typing:stop`, `presence:subscribe`, `message:read`

**Server → client**: `message:new`, `message:rejected` (contact-info blocked), `conversation:updated`, `typing:update`, `message:read`, `presence:update`

## Verifying the deployment

1. Start the backend and confirm `✓ Chat tables ready.` appears in the logs.
2. `curl https://your-api-host/api/chat/unread-count -H "Authorization: Bearer <token>"` → should return `{"success":true,"data":{"count":0}}` for a valid user.
3. From the frontend, open `/chat`, message another user, and confirm delivery is instant (Socket.io) rather than requiring a refresh.
4. Try sending a message containing a phone number or email — it should be rejected inline, not delivered.
5. As an admin, open `/moderation/conversations` in `Unihub-admin` and confirm any conversation is readable immediately (no prior flag/report needed).

## Known limitations

- The contact-info filter scans **message text only** — it does not OCR-scan images or PDFs for embedded contact details.
- Online-presence tracking is in-memory on the single backend instance. If the backend is ever scaled to multiple instances, presence and Socket.io broadcasting would need a shared adapter (e.g. `@socket.io/redis-adapter`) — not required at current scale.

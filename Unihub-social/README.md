# Unihub-social

The **social service** for UniHub: wall posts, likes, comments, follows, and
profile picture uploads. It is a standalone microservice, deployed and
scaled independently from `Unihub-backend` (which keeps ownership of
courses, marketplace, boarding, payments, notifications, and chat).

It lives nested inside the `Unihub-core` repo (`Unihub-core/Unihub-social`)
for convenience, but is not part of the Next.js app - it has its own
`package.json`, `Dockerfile`, and deploy workflow
(`../.github/workflows/deploy-social.yml`, scoped to this subfolder via a
`paths:` filter so pushes here don't trigger a frontend redeploy and vice
versa). `Unihub-core`'s own `.dockerignore` excludes this folder from the
frontend's image build.

## Why a separate service

- Posting/following/avatars are a distinct product surface from the LMS/marketplace core, and were requested to live in their own deployable unit from day one.
- File handling (avatar + post image uploads) is expected to move to a dedicated file-storage service later. Keeping it here now, behind this service's own upload endpoints, means that migration only touches this codebase, not `Unihub-backend`.

## Architecture

- **Database**: connects to the *same* MySQL database as `Unihub-backend` (same `DB_*` values). It owns four new tables (`posts`, `post_likes`, `post_comments`, `follows`) and only reads/updates a few existing columns on `users` (never runs `sync`/`alter` against that table — `Unihub-backend` owns its schema).
- **Auth**: verifies JWTs itself with the same `JWT_SECRET` `Unihub-backend` issues them with (see `src/middleware/auth.js`). No network call to `Unihub-backend` per request.
- **File storage**: profile pictures and post images are saved to disk under `UPLOADS_DIR` (see below) and served by **`Unihub-backend`'s** `/uploads` static route — this service does not serve static files itself. `UPLOADS_PUBLIC_BASE_URL` is used to build the absolute URLs returned to clients.

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Notes |
|---|---|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Same values as `Unihub-backend/.env` |
| `JWT_SECRET` | **Must match** `Unihub-backend`'s `JWT_SECRET` exactly |
| `ALLOWED_FRONTEND_ORIGINS` / `DO_HOST` | Same values as `Unihub-backend/.env` |
| `UPLOADS_DIR` | Filesystem path this service writes avatars/post images into. Must resolve to the same physical folder `Unihub-backend` serves `/uploads` from (see below) |
| `UPLOADS_PUBLIC_BASE_URL` | The origin `Unihub-backend` is reachable at, used to build public image URLs, e.g. `https://unihub.lk` or `http://localhost:5000` |

### Local development

With the standard layout (`Unihub-backend`, `Unihub-core` as siblings, this service at `Unihub-core/Unihub-social`), the default `UPLOADS_DIR=../../Unihub-backend/uploads` just works - files land directly in the folder `Unihub-backend` already serves.

### Production (Docker)

`Unihub-backend` and `Unihub-social` run as separate containers, so a shared **named Docker volume** is required for the local-disk hand-off to work:

The production deployment expects a running `unihub-backend` container on the
same host and Docker network. The Social workflow copies `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET` from that container after
validating the required values. This keeps the shared credentials synchronized
without duplicating them as secrets in the Core repository.

```bash
docker volume create unihub-uploads

# Unihub-backend container
docker run -d --name unihub-backend --network unihub-network \
  -v unihub-uploads:/app/uploads \
  ... unihub-backend:latest

# Unihub-social container
docker run -d --name unihub-social --network unihub-network \
  -e UPLOADS_DIR=/app/uploads \
  -v unihub-uploads:/app/uploads \
  ... unihub-social:latest
```

Both `Unihub-backend/.github/workflows/deploy-backend.yml` and `Unihub-core/.github/workflows/deploy-social.yml` mount this same volume.

### Nginx

Add one more `location` block alongside the existing `/api` and `/socket.io/` blocks documented in `Unihub-backend/nginx-5gb-config.conf`:

```nginx
upstream social {
    server localhost:5001;
    keepalive 32;
}

location /api/social/ {
    proxy_pass http://social;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Install & run

```bash
npm install
npm run migrate   # optional explicit first run - also runs automatically on every boot
npm run dev        # development
npm start           # production
```

On boot you should see:

```
✓ Database connection has been established successfully.
✓ Social tables ready.
Unihub Social Service is running on http://0.0.0.0:5001
```

## API reference

All routes are namespaced under `/api/social`. JWT auth (`Authorization: Bearer <token>`) is the same token issued by `Unihub-backend`'s login.

**Posts**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/posts` | required | Create a post - multipart, `body` text field + up to 4 `media` image files |
| GET | `/posts/feed` | required | Paginated feed: own posts + posts from followed users |
| GET | `/posts/user/:userId` | optional | A user's wall (visibility-filtered) |
| GET | `/posts/:postId` | optional | Single post |
| DELETE | `/posts/:postId` | required | Soft-delete (author only) |
| POST/DELETE | `/posts/:postId/like` | required | Like / unlike |
| GET | `/posts/:postId/comments` | optional | Paginated comments |
| POST | `/posts/:postId/comments` | required | Add a comment |
| DELETE | `/comments/:commentId` | required | Delete own comment |

**Follow**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST/DELETE | `/follow/:userId` | required | Follow / unfollow |
| GET | `/follow/:userId/followers` | none | Paginated followers list |
| GET | `/follow/:userId/following` | none | Paginated following list |
| GET | `/follow/:userId/status` | required | `{ isFollowing, isFollowedBy }` for the current user |

**Profile**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| PUT | `/profile/picture` | required | Upload avatar - multipart, single `avatar` file. Updates `users.profile_image` |
| GET | `/profile/:userId` | optional | Public profile summary + post/follower/following counts |

## Known limitations

- Post/comment moderation tooling in `Unihub-admin` is not built yet (chat has this; social does not, as a deliberate scope cut for the first version).
- No Redis/shared cache - fine at current scale since this service, like `Unihub-backend`, runs as a single instance.

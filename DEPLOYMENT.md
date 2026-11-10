# Deployment guide (Render)

This is the checklist for deploying the **existing** Render services by pushing
to git. Service names and URLs do not change.

## 1. Before you push: check the backend's environment variables

Open the **backend** service on Render → **Environment**. Render sets
`NODE_ENV=production` for Node services, which turns on stricter startup checks.
If a required value is missing or weak, the backend refuses to start and your
site goes down. Check every row below first.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **Yes** | Your Postgres/Neon URL. Without it the backend falls back to SQLite on Render's disk, which is **wiped on every deploy**, so scores would vanish. |
| `JWT_SECRET` | **Yes, 32+ characters** | The backend now exits at startup if this is missing or shorter than 32 characters. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Changing it logs everyone out once (their tokens stop validating), which is fine. |
| `ADMIN_PASS` | Recommended | In production the admin account is only created if this is set to something other than the placeholder. An existing admin is not affected. |
| `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_NAME` | Optional | Used only when creating the admin the first time. |
| `CORS_ORIGINS` | Recommended | Your frontend URL, e.g. `https://your-frontend.onrender.com` (no trailing slash; several allowed, comma-separated). If unset, any website can call your API (a warning is logged). |
| `TRUST_PROXY` | Optional | Defaults to `1`, which is right for Render. It makes rate limiting use the real visitor IP. |
| `REDIS_URL` | Optional | Without it an in-memory cache is used. |
| `DATABASE_SSL_NO_VERIFY` | Only if needed | Postgres certificates are now verified by default. Neon and Render Postgres work as-is. If the backend logs a certificate error on boot, set this to `true` as a temporary workaround. |
| `LOG_LEVEL` | Optional | `info` (default), `debug`, `warn` or `error`. |

Frontend (static site) → **Environment**:

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | The backend's full URL, e.g. `https://your-backend.onrender.com`, no trailing slash. It is baked in **at build time**, so changing it needs a rebuild. If it is missing, the frontend calls its own domain, which only returns `index.html`. The app now reports that as an error instead of pretending the save worked. |

## 2. Rotate the leaked database password (do this first)

The Neon connection string was committed in `docker-compose.yml` in earlier
commits. Removing it from the current files does **not** remove it from git
history, so treat it as public.

1. Neon dashboard → your project → **Roles** → reset the password for the role in the old URL (or create a new role and drop the old one).
2. Copy the new connection string.
3. Render → backend → Environment → update `DATABASE_URL` → save (this redeploys).
4. Check `https://<your-backend>/api/health` returns `{"status":"ok"}`.
5. If the repository is or was ever public, also consider the old password compromised even after rotation; the rotation is what protects you, not deleting history.

## 3. Deploy

```bash
git add -A
git commit -m "Server-side scores/XP, security hardening, tests"
git push
```

Render rebuilds both services. Watch the backend logs on the first boot:

- `Database initialization complete` then `Backend listening on …` = healthy.
- `JWT_SECRET must be set …` = fix the variable (section 1).
- `CORS_ORIGINS is not set …` = a warning only; set it when convenient.

## 4. After deploying: quick manual check

1. Open the site, log in, play one game to the end.
2. Reload the page: your XP is still there.
3. Log in from a different browser or device: the same XP shows.
4. Leaderboard shows your run.
5. Network tab: the `POST /api/astrogames/leaderboard` call returns `201`.

## What changes for existing data

- Existing score rows are kept. The new columns and indexes are added on startup.
- Old runs from **guests** (no account) still appear in per-game leaderboards but do not count toward global XP rankings, because there is no account to credit.
- XP that was only ever stored in someone's browser (`localStorage`) is not on the server and cannot be recovered; only runs that reached the database count.
- The old unused `/api/astrogames/quiz-results` endpoints were removed; their tables are untouched.

## Rollback

Render → backend → **Deploys** → pick the previous deploy → **Rollback**. The
database changes are additive (new columns/tables/indexes), so the old code
keeps working against the upgraded database.

---
description: How to deploy the self-hosted CyberSkill stack (app + Postgres) to production
---

# 🚀 Deployment Guide — CyberSkill (self-hosted stack)

The live chat runs on a fully self-hosted stack — **no external SaaS except Telegram** (outbound notifications):

- **App** — Next.js 15 (standalone) container, fronted by the existing **Traefik** edge proxy.
- **Database** — self-hosted **PostgreSQL** container (`cyberskill-db`), on a private docker network, published only on `127.0.0.1:5432` (never public).
- **Auth** — NextAuth v5 (Credentials provider) against the `admin_users` table.
- **Realtime** — Server-Sent Events + Postgres `LISTEN/NOTIFY` (no Ably).

Everything is wired through `docker-compose.yml` + `.env` (gitignored).

---

## One-time setup (fresh server)

```bash
cd /root/workspace/cyberskill
cp .env.example .env            # fill: POSTGRES_PASSWORD, AUTH_SECRET, ADMIN_EMAIL/PASSWORD, …
docker compose up -d --build    # builds the app image, starts db + app
```

`database/schema.sql` is applied automatically on first DB init (via `docker-entrypoint-initdb.d`).

### Seed / rotate the first admin (idempotent)

```bash
set -a; . ./.env; set +a
DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@127.0.0.1:5432/$POSTGRES_DB" \
  node scripts/seed-admin.mjs
```

Re-running rotates the password to the current `ADMIN_PASSWORD`; it never duplicates the account.

---

## Deploying an update

```bash
cd /root/workspace/cyberskill
git pull origin <branch>
docker compose up -d --build    # rebuilds app + recreates it; the db keeps running
docker compose ps
docker compose logs -f --tail=100 app
```

> Only `NEXT_PUBLIC_SITE_URL` is a build-time arg now (compose passes it from `.env`).
> `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, Telegram, etc. are all runtime env.

---

## Database operations

```bash
./scripts/db-init.sh                                   # re-apply schema (idempotent)
docker exec -it cyberskill-db psql -U cyberskill -d cyberskill   # manual psql
./scripts/backup-db.sh                                 # pg_dump backup (keeps 14 days)
```

Recommended daily backup cron (a user with docker access):

```cron
15 3 * * * /root/workspace/cyberskill/scripts/backup-db.sh >> /root/workspace/cyberskill/backups/backup.log 2>&1
```

---

## Realtime (SSE) behind Traefik

SSE works through Traefik with **no extra config** — Traefik streams responses and does not buffer.
The stream routes (`/api/chat/stream`, `/api/admin/chat/stream`) already set
`Cache-Control: no-cache, no-transform` + `X-Accel-Buffering: no` and emit heartbeat comments every 20s.
If you ever front the app with nginx instead, add for those two paths:
`proxy_buffering off;`, `proxy_cache off;`, and a long `proxy_read_timeout` (e.g. `1h`).

---

## Troubleshooting

- **App can't reach DB** → `DATABASE_URL` host must be `db` (the compose service alias); `docker compose ps` should show `cyberskill-db` healthy.
- **Admin can't log in** → re-seed via `scripts/seed-admin.mjs`; confirm `AUTH_SECRET` and `AUTH_TRUST_HOST=true` are set.
- **Chat not updating live** → check the `/api/chat/stream` EventSource in the browser Network tab and `docker compose logs app` for `[realtime]` errors.
- **Container won't start** → `docker compose logs app`; verify `.env` is present and complete.

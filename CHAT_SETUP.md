# Online Chat System — Setup Guide (self-hosted stack)

The live chat is **fully self-hosted** — no external SaaS except Telegram (outbound notifications):

| Concern   | Implementation                                                        |
| --------- | --------------------------------------------------------------------- |
| Database  | Self-hosted **PostgreSQL** (`pg` driver, typed data layer `src/lib/db.ts`) |
| Admin auth| **NextAuth v5** Credentials provider against `admin_users` (bcrypt)   |
| Realtime  | **SSE + Postgres `LISTEN/NOTIFY`** (`src/lib/realtime.ts`)            |
| Notify    | **Telegram** (outbound only, optional)                               |

## Quick Start (Docker — production parity)

```bash
cp .env.example .env          # fill POSTGRES_PASSWORD, AUTH_SECRET, ADMIN_EMAIL/PASSWORD, …
docker compose up -d --build  # starts Postgres (db) + the Next.js app
```

`database/schema.sql` is auto-applied on first DB init. Then seed the first admin:

```bash
set -a; . ./.env; set +a
DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@127.0.0.1:5432/$POSTGRES_DB" \
  node scripts/seed-admin.mjs
```

- **Main site**: chat widget appears bottom-right on every page.
- **Admin dashboard**: `/admin/login` → sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Local development

```bash
npm install
# point DATABASE_URL at a local/dev Postgres, set AUTH_SECRET + ADMIN_* in .env.local
node scripts/seed-admin.mjs
npm run dev
```

## Environment variables

See `.env.example`. Key vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `TELEGRAM_*`, `AI_CHAT_ENABLED` (keep `false`).
There are **no** Supabase or Ably variables anymore.

## Using the Chat System

### For Visitors
- Widget appears automatically on all pages; messages persist in Postgres.
- Replies arrive in real time over an SSE stream (`EventSource`), which auto-reconnects.

### For Admins
1. Log in at `/admin/login` (NextAuth session cookie).
2. View conversations, reply, and "Close Conversation" to finish.
3. Admin actions are written to the `admin_actions` audit table.

## Security Features

- ✅ **HttpOnly visitor cookie** for visitor tracking (set in middleware)
- ✅ **Rate limiting** (10 messages/min, 3 conversations/hour)
- ✅ **SSE authorization** — visitor stream gated by `visitor_id` + conversation ownership; admin stream by NextAuth session
- ✅ **Admin auth** via NextAuth Credentials (bcrypt-hashed passwords, JWT session)
- ✅ **Admin route protection** via middleware (`/admin/*`, `/api/admin/*`)
- ✅ **Action logging** for compliance
- ✅ **Data retention** cleanup endpoint (`/api/cron/cleanup`, guarded by `CRON_SECRET`)

## Architecture

```
Client (Browser)
  │  EventSource (SSE)            POST /api/chat/*
  ▼                                   │
/api/chat/stream  ◄── NOTIFY ──┐      ▼
                                │   API routes ──► PostgreSQL (pg Pool)
Admin Dashboard                 │      │              │
  │  EventSource (SSE)          │      │   pg_notify('chat_events', …)
  ▼                             └──────┘              │
/api/admin/chat/stream  ◄── dedicated LISTEN client ─┘
                                 (src/lib/realtime.ts Hub)
```

A message write issues `NOTIFY chat_events` (id-only payload); a single per-process `LISTEN`
client fetches the row and fans it out to the SSE connections subscribed to that conversation.

## Cron cleanup (self-hosted)

`vercel.json` cron is not used. Run retention cleanup via a host cron hitting the endpoint:

```cron
0 2 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://cyberskill.online/api/cron/cleanup
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/{send,conversation,stream}/   # visitor endpoints (stream = SSE)
│   │   ├── admin/chat/{send,conversations,messages,assign,close,stream}/
│   │   ├── auth/[...nextauth]/                # NextAuth handlers
│   │   └── cron/cleanup/                      # data retention
│   └── admin/{login,chat,providers}/          # admin UI + SessionProvider
├── auth.ts, auth.config.ts                    # NextAuth v5 (node + edge-safe split)
├── middleware.ts                              # visitor cookie + /admin protection
├── hooks/useChat.ts                           # chat hook (EventSource client)
└── lib/
    ├── db.ts                                  # PostgreSQL (pg) typed data layer
    ├── realtime.ts                            # SSE + LISTEN/NOTIFY hub
    ├── auth.ts                                # requireAdmin() (session)
    ├── validation.ts, ratelimit.ts, telegram.ts
```

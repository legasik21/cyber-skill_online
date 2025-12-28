# Online Chat System - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the schema from `database/schema.sql`
3. Go to Settings → API to get your keys:

   - `https://your-project.supabase.co`
   - `your-anon-key`
   - `your-service-role-key` (found in "service_role" secret)

4. Create your first admin user:
   - Go to Authentication → Users → Add User
   - After creating, go to Users → Click on user → Raw Data
   - Update `user_metadata` or `app_metadata` to include: `{"role": "admin"}`

### 3. Set Up Ably

1. Go to [https://ably.com](https://ably.com) and create a free account
2. Create a new app
3. Go to API Keys tab and copy:
   - Root API Key for `your-ably-root-key`
   - Create a new publishable key for `your-ably-publishable-key`

### 4. Configure Environment Variables

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ably
ABLY_API_KEY=your-root-api-key
NEXT_PUBLIC_ABLY_KEY=your-publishable-key

# Security (generate random string)
CRON_SECRET=your-random-secret-minimum-32-chars

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Visit:

- **Main site**: http://localhost:3000 (chat widget appears bottom-right)
- **Admin dashboard**: http://localhost:3000/admin/login

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.local`
4. Update `NEXT_PUBLIC_SITE_URL` to your production domain
5. Deploy!

The cron job (`vercel.json`) will automatically run daily at 2 AM to clean old conversations.

## Using the Chat System

### For Visitors

- Chat widget appears automatically on all pages
- Click to start conversation
- Messages are delivered in real-time
- Works offline (reconnects automatically)

### For Admins

1. Login at `/admin/login`
2. View all active conversations
3. Click a conversation to start chatting
4. Use "Close Conversation" to mark as complete
5. All actions are logged in audit table

## Security Features

✅ **HttpOnly cookies** for visitor tracking  
✅ **Rate limiting** (10 messages/min, 3 conversations/hour)  
✅ **Channel restrictions** via Ably tokens  
✅ **Admin authentication** via Supabase Auth  
✅ **Action logging** for compliance  
✅ **30-day data retention** automatic cleanup

## Troubleshooting

**Chat widget not appearing?**

- Check browser console for errors
- Verify environment variables are set
- Ensure ChatWidget is imported in `layout.tsx`

**Messages not sending?**

- Check Ably API key is correct
- Verify Supabase connection
- Check rate limits in browser network tab

**Admin can't login?**

- Verify user has `role: "admin"` in metadata
- Check Supabase Auth is configured
- Ensure credentials are correct

**Cron job not running?**

- Verify `vercel.json` is deployed
- Check Vercel Dashboard → Settings → Cron Jobs
- Test manually: `curl https://your-domain.com/api/cron/cleanup`

## Architecture

```
Client (Browser)
  ↓
ChatWidget → Ably (WebSocket) → Admin Dashboard
  ↓                                ↓
API Routes ←→ Supabase PostgreSQL ←
  ↓
Rate Limit Check
Validation (Zod)
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Client chat endpoints
│   │   ├── admin/chat/    # Admin endpoints
│   │   └── cron/cleanup/  # Data retention
│   └── admin/
│       ├── login/         # Admin auth
│       └── chat/          # Admin dashboard
├── components/
│   ├── ChatWidget.tsx     # Client chat UI
│   └── admin/             # Admin components
├── hooks/
│   └── useChat.ts         # Chat logic hook
└── lib/
    ├── db.ts              # Supabase client
    ├── ably.ts            # Ably client
    ├── validation.ts      # Zod schemas
    ├── ratelimit.ts       # Rate limiting
    └── auth.ts            # Admin auth
```

## Need Help?

Check the implementation plan for detailed architecture and API documentation.

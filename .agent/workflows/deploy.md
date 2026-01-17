---
description: How to deploy changes to production server
---

# 🚀 Deployment Guide - CyberSkill Website

## Overview

This guide explains how to update the live website after making local changes.

---

## Step 1: Commit & Push to GitHub (Local Machine)

Run these commands in your local project folder:

```bash
# 1. Check what files have changed
git status

# 2. Add all changes to staging
git add .

# 3. Commit with a descriptive message
git commit -m "Your description of changes here"

# 4. Push to GitHub
git push origin main
```

> 💡 **Tip**: Replace `main` with your branch name if different (e.g., `master`)

---

## Step 2: SSH into Your Server

```bash
# Connect to your VPS/server
ssh your-username@your-server-ip
```

---

## Step 3: Pull Latest Changes from GitHub (On Server)

Navigate to your project folder on the server and pull the latest code:

```bash
# Navigate to project folder
cd /path/to/your/project

# Pull latest changes from GitHub
git pull origin main
```

---

## Step 4: Rebuild & Restart Docker (On Server)

⚠️ **IMPORTANT**: Next.js requires `NEXT_PUBLIC_*` variables at BUILD time, not just runtime!

**Full Rebuild with Build Args** (recommended):

```bash
# Navigate to project folder
cd ~/cyber-skill_online

# Pull latest code
git pull origin main

# Build with NEXT_PUBLIC_* variables from .env file
docker build --network=host \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_ABLY_KEY="$(grep NEXT_PUBLIC_ABLY_KEY .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SITE_URL="$(grep NEXT_PUBLIC_SITE_URL .env | cut -d '=' -f2)" \
  -t cyber-skill .

# Stop old container and start new one
docker stop cyber-skill && docker rm cyber-skill && \
docker run -d \
  --name cyber-skill \
  --restart always \
  --network n8n_default \
  --env-file .env \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.cyberskill.rule=Host(\`cyberskill.pro\`) || Host(\`cyberskill.online\`)" \
  --label "traefik.http.routers.cyberskill.entrypoints=websecure" \
  --label "traefik.http.routers.cyberskill.tls=true" \
  --label "traefik.http.routers.cyberskill.tls.certresolver=mytlschallenge" \
  --label "traefik.http.services.cyberskill.loadbalancer.server.port=3000" \
  cyber-skill
```

**Force Fresh Build** (if having cache issues):

```bash
docker build --network=host --no-cache \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_ABLY_KEY="$(grep NEXT_PUBLIC_ABLY_KEY .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SITE_URL="$(grep NEXT_PUBLIC_SITE_URL .env | cut -d '=' -f2)" \
  -t cyber-skill .
```

---

## Step 5: Verify Deployment

1. Check if containers are running:

   ```bash
   docker compose ps
   ```

2. Check logs for errors:

   ```bash
   docker compose logs -f --tail=100
   ```

3. Open your website in browser and verify changes are live

---

## 📋 Quick Cheatsheet (Copy-Paste Version)

### On Local Machine:

```bash
git add .
git commit -m "Update description"
git push origin main
```

### On Server:

```bash
# 1-liner to update and redeploy
cd ~/cyber-skill_online && \
git pull origin main && \
docker build --network=host \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_ABLY_KEY="$(grep NEXT_PUBLIC_ABLY_KEY .env | cut -d '=' -f2)" \
  --build-arg NEXT_PUBLIC_SITE_URL="$(grep NEXT_PUBLIC_SITE_URL .env | cut -d '=' -f2)" \
  -t cyber-skill . && \
docker stop cyber-skill && docker rm cyber-skill && \
docker run -d \
  --name cyber-skill \
  --restart always \
  --network n8n_default \
  --env-file .env \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.cyberskill.rule=Host(\`cyberskill.pro\`) || Host(\`cyberskill.online\`)" \
  --label "traefik.http.routers.cyberskill.entrypoints=websecure" \
  --label "traefik.http.routers.cyberskill.tls=true" \
  --label "traefik.http.routers.cyberskill.tls.certresolver=mytlschallenge" \
  --label "traefik.http.services.cyberskill.loadbalancer.server.port=3000" \
  cyber-skill
```

---

## 🔧 Troubleshooting

### Changes not showing?

- Clear browser cache (Ctrl+Shift+R)
- Check if git pull was successful
- Verify Docker rebuild completed

### Docker build errors?

- Check logs: `docker logs cyber-skill`
- Try no-cache build: add `--no-cache` to build command

### Container won't start?

- Check what's using the port: `lsof -i :3000`
- Kill stuck containers: `docker rm -f cyber-skill`

---

## 🔄 Environment Variables

If you updated `.env.local` locally, remember:

1. The `.env.local` file is usually in `.gitignore` (not pushed to GitHub)
2. You need to manually update it on the server:
   ```bash
   nano /path/to/your/project/.env.local
   # or
   vim /path/to/your/project/.env.local
   ```
3. Then rebuild and restart Docker (follow Step 4)

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

Option A: **Quick Restart** (if only code changes, no new dependencies):

```bash
docker compose restart
```

Option B: **Full Rebuild** (recommended for safety):

```bash
# Stop all containers
docker compose down

# Rebuild and start with latest code
docker compose up -d --build
```

Option C: **Force Fresh Build** (if having cache issues):

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
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
cd /path/to/your/project
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🔧 Troubleshooting

### Changes not showing?

- Clear browser cache (Ctrl+Shift+R)
- Check if git pull was successful
- Verify Docker rebuild completed

### Docker build errors?

- Check logs: `docker compose logs`
- Try no-cache build: `docker compose build --no-cache`

### Container won't start?

- Check what's using the port: `lsof -i :3000`
- Kill stuck containers: `docker compose down --remove-orphans`

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
3. Then restart Docker: `docker compose restart`

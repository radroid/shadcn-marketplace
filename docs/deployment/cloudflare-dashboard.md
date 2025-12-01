# Cloudflare Dashboard Deployment Guide

This guide explains how to deploy via the Cloudflare dashboard (Cloudflare Pages or Workers).

## Important: Build Command Configuration

⚠️ **CRITICAL:** When deploying via Cloudflare dashboard, you MUST configure the build command to include both the build and deploy steps.

## Cloudflare Workers Deployment

### Build Settings

In your Cloudflare Workers project settings:

**Build Command:**
```bash
pnpm install && pnpm run deploy
```

**OR:**
```bash
opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

**Deploy Command:**
- Leave this **EMPTY** - the build command handles both building and deploying

**Why:** The `deploy` script in `package.json` runs both `opennextjs-cloudflare build` (which generates `.open-next/worker.js`) and `opennextjs-cloudflare deploy` (which deploys to Cloudflare). If you only run `wrangler deploy`, it will fail because the build output doesn't exist yet.

### Environment Variables

⚠️ **IMPORTANT:** Environment variables must be set in two places:

**Build Variables** (Settings → Build & deployments → Environment variables):
- `NEXT_PUBLIC_CONVEX_URL` - **Must be a BUILD variable**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - **Must be a BUILD variable**

These are needed during the build process because they get embedded into the client bundle.

**Runtime Variables** (Settings → Variables and Secrets):
- `CLERK_SECRET_KEY` - Set as a **secret** (via dashboard or `wrangler secret put`)
- `CLERK_JWT_ISSUER_DOMAIN` - Set as a **secret** (via dashboard or `wrangler secret put`)

These are only needed when the Worker runs, not during build.

📖 **See [Environment Variables Guide](environment-variables.md) for detailed explanation.**

### Common Mistakes

❌ **Wrong:** Build command = `pnpm build` and Deploy command = `npx wrangler deploy`
- This will fail with "entry-point file at '.open-next/worker.js' was not found"
- Reason: `pnpm build` only runs Next.js build, not OpenNext build

❌ **Wrong:** Build command = `pnpm install` and Deploy command = `npx wrangler deploy`
- This will also fail - no OpenNext build step

✅ **Correct:** Build command = `pnpm install && pnpm run deploy`
- This runs the full OpenNext build and deploy process
- Deploy command should be empty

## Alternative: Separate Build and Deploy

If you need to separate build and deploy:

**Build Command:**
```bash
pnpm install && opennextjs-cloudflare build
```

**Deploy Command:**
```bash
opennextjs-cloudflare deploy
```

This works, but using `pnpm deploy` is simpler and recommended.

## Verification

After deployment, verify:
1. Your app is accessible at `your-project-name.workers.dev`
2. Check Cloudflare dashboard logs for any errors
3. Test authentication flow
4. Verify Convex connection


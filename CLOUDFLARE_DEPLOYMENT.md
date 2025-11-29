# Cloudflare Pages Deployment Guide

## Prerequisites Checklist

Before deploying, ensure you have:
- [x] Cloudflare account created
- [x] Repository connected to Cloudflare Pages
- [x] Convex deployment URL ready
- [x] Clerk application configured
- [x] All environment variable values ready

## Step-by-Step Deployment

### Step 1: Configure Build Settings in Cloudflare Pages Dashboard

1. Go to your Cloudflare Pages project settings
2. Navigate to **Settings → Build & deployments**
3. Cloudflare will auto-detect Next.js - use the default settings:
   - **Framework preset:** Next.js (auto-detected)
   - **Build command:** `pnpm build` (default)
   - **Build output directory:** `.next` (auto-detected - don't change)
   - **Root directory:** (leave empty)
   - **Node version:** 18 or higher (default)

### Step 2: Add Environment Variables

**CRITICAL:** You must add environment variables BEFORE triggering a build.

1. Go to **Settings → Environment variables**
2. Add the following variables for **Production AND Preview** environments:

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxx
CLERK_JWT_ISSUER_DOMAIN=your-app.clerk.accounts.dev
```

**Important Notes:**
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- `CLERK_SECRET_KEY` is server-side only
- Make sure there are no trailing spaces in values
- Click "Save" after adding each variable

### Step 3: Get Your Environment Variable Values

#### Convex URL
1. Go to https://dashboard.convex.dev
2. Select your project
3. Copy the deployment URL from the dashboard
4. Format: `https://[your-deployment].convex.cloud`

#### Clerk Keys
1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to **API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
5. For JWT Issuer Domain:
   - Go to **JWT Templates** → **convex** template
   - Copy the Issuer URL (format: `your-app.clerk.accounts.dev`)

### Step 4: Trigger Deployment

After setting environment variables:

1. **Option A: Automatic Deployment**
   - Push to your connected Git branch
   - Cloudflare will automatically build and deploy

2. **Option B: Manual Deployment**
   - Go to **Deployments** tab
   - Click **Retry deployment** on the failed build
   - Or click **Create deployment** for a new one

### Step 5: Verify Deployment

Once deployed:
1. Visit your `*.pages.dev` URL
2. Test authentication (sign in/sign up)
3. Test component browsing
4. Test component editing
5. Check browser console for any errors

## Troubleshooting Common Issues

### Error: "Missing publishableKey"

**Cause:** Environment variables not set in Cloudflare dashboard

**Solution:**
1. Add all environment variables in Cloudflare Pages dashboard
2. Make sure they're set for both Production and Preview
3. Retry the deployment

### Error: "Build command failed"

**Cause:** Wrong build command or missing dependencies

**Solution:**
1. Verify build command is `pnpm pages:build`
2. Check that `@cloudflare/next-on-pages` is in devDependencies
3. Ensure Node version is 18 or higher

### Error: "Module not found"

**Cause:** Missing dependencies or incorrect build

**Solution:**
1. Clear build cache in Cloudflare dashboard
2. Retry deployment
3. Check that all dependencies are in package.json

### Build succeeds but site doesn't work

**Cause:** Runtime environment variable issues

**Solution:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_*` variables are accessible
3. Test API connections (Convex, Clerk)

## Local Development with Cloudflare Environment

To test locally with the Cloudflare Workers runtime:

1. **Create `.dev.vars` file:**
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. **Fill in your values** in `.dev.vars`

3. **Run local preview:**
   ```bash
   pnpm pages:dev
   ```

4. **Access at:** http://localhost:8788

## Performance Optimization

After successful deployment:

1. **Enable Cloudflare Speed Features:**
   - Go to **Speed** tab in Cloudflare dashboard
   - Enable "Auto Minify" for JS, CSS, HTML
   - Enable "Brotli" compression

2. **Configure Custom Domain** (optional):
   - Go to **Custom domains** tab
   - Add your domain
   - Cloudflare will automatically set up SSL

3. **Monitor Analytics:**
   - Check **Analytics** tab for performance metrics
   - Monitor error rates and response times

## Updating Environment Variables

To update variables after deployment:

1. Go to **Settings → Environment variables**
2. Find the variable to update
3. Click **Edit**
4. Update the value
5. Click **Save**
6. **Redeploy** your application for changes to take effect

## CI/CD with GitHub

For automated deployments:

1. Connect your GitHub repository in Cloudflare Pages
2. Set up branch deployments:
   - **Production branch:** `main` or `master`
   - **Preview branches:** All other branches
3. Each push will automatically trigger a deployment

## Getting Help

If you encounter issues:

1. Check Cloudflare Pages build logs
2. Review Next.js build output
3. Check browser console for runtime errors
4. Visit Cloudflare Community: https://community.cloudflare.com
5. Review Next.js + Cloudflare docs: https://developers.cloudflare.com/pages/framework-guides/nextjs

## Quick Reference

| Setting | Value |
|---------|-------|
| Build command | `pnpm build` (default) |
| Build output | `.next` (auto-detected) |
| Node version | 18+ (default) |
| Framework | Next.js (auto-detected) |
| Package manager | pnpm |

## Security Checklist

- [ ] Use `sk_live_*` keys for production (not `sk_test_*`)
- [ ] Use `pk_live_*` keys for production (not `pk_test_*`)
- [ ] Never commit `.dev.vars` to Git
- [ ] Rotate keys if accidentally exposed
- [ ] Enable Clerk security features (2FA, session management)
- [ ] Monitor Cloudflare security logs

---

**Status:** Ready to deploy ✅
**Est. Build Time:** 2-5 minutes
**Est. Total Deployment Time:** 5-10 minutes



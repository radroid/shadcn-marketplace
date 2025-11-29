# Simplified Cloudflare Pages Deployment

## Overview
This project now uses **standard Next.js deployment** on Cloudflare Pages with auto-detection and default settings - no custom configuration needed!

## Quick Start

### 1. Connect Repository to Cloudflare Pages
1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your repository

### 2. Use Default Build Settings
Cloudflare will automatically detect Next.js! Just verify these defaults:
- ✅ **Framework preset:** Next.js (auto-detected)
- ✅ **Build command:** `pnpm build` (default)
- ✅ **Build output directory:** `.next` (auto-detected)
- ✅ **Node version:** 18+ (default)

**No changes needed - use the defaults!**

### 3. Add Environment Variables
Go to **Settings → Environment variables** and add:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain
```

**Important:** Add for both "Production" and "Preview" environments.

### 4. Deploy!
Click "Save and Deploy" - that's it! 🚀

## What Changed

### Simplified Configuration
- ✅ Removed custom build scripts (`pages:build`, `pages:dev`, etc.)
- ✅ Removed `output: 'standalone'` from next.config.ts
- ✅ Using standard `pnpm build` command
- ✅ Cloudflare auto-detects Next.js and configures everything

### Standard Next.js Build
```bash
# That's all you need!
pnpm build
```

### Files Modified
- `package.json` - Removed custom Cloudflare scripts
- `next.config.ts` - Removed standalone output (using default)
- `README.md` - Updated with simplified deployment steps
- `CLOUDFLARE_DEPLOYMENT.md` - Updated with default settings

## Build Configuration

### Standard Next.js Build Output
- **Output directory:** `.next` (standard Next.js build)
- **Build command:** `pnpm build`
- **Framework:** Next.js (auto-detected by Cloudflare)

### No Custom Adapters Needed
- Cloudflare Pages has built-in Next.js support
- No need for OpenNext or custom adapters
- Works with standard Next.js output

## Environment Variables Required

Make sure these are set in Cloudflare Pages dashboard:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Convex Dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer | Clerk Dashboard → JWT Templates |

## Deployment Checklist

- [ ] Repository connected to Cloudflare Pages
- [ ] Build settings use defaults (auto-detected)
- [ ] All environment variables added
- [ ] Variables added for both Production and Preview
- [ ] Deploy button clicked

## Troubleshooting

### Build Fails with Missing Environment Variables
**Solution:** Add all required environment variables before deploying

### Build Succeeds but Site Shows Errors
**Solution:** Check browser console and verify:
- Environment variables are set correctly
- Convex URL is accessible
- Clerk keys are valid

### Auto-detection Doesn't Work
**Solution:** Manually select "Next.js" framework preset in build settings

## Benefits of Simplified Approach

1. ✅ **Zero Configuration** - Just connect and deploy
2. ✅ **Standard Next.js** - Works exactly like local builds
3. ✅ **Auto-updates** - Cloudflare handles Next.js updates
4. ✅ **Easy Debugging** - Standard build output is easier to debug
5. ✅ **No Custom Scripts** - Less complexity, fewer things to break

## What's Still Included

The following packages are still in devDependencies but not required:
- `@opennextjs/cloudflare` - Available if you need custom Cloudflare features later
- `wrangler` - Available for local testing with `wrangler pages dev .next`

These don't affect the standard build process and can be removed if desired.

---

**Deployment Status:** ✅ Simplified and Ready
**Build Command:** `pnpm build` (standard)
**Output:** `.next` (standard Next.js)
**Settings:** Use Cloudflare defaults


# Cloudflare Workers Deployment Guide

## Overview

This document outlines the changes needed to deploy this Next.js app as a **Cloudflare Worker** instead of **Cloudflare Pages**.

## Key Differences: Pages vs Workers

| Aspect | Cloudflare Pages | Cloudflare Workers |
|--------|------------------|-------------------|
| **Deployment** | Automatic via Git | Manual via `wrangler deploy` |
| **Build Output** | `.next` (standard Next.js) | `.open-next/worker` (OpenNext) |
| **Build Command** | `pnpm build` | `pnpm worker:build` |
| **Deploy Command** | Automatic (no command) | `wrangler deploy` |
| **Configuration** | Dashboard settings | `wrangler.toml` |
| **Environment Variables** | Dashboard UI | `wrangler.toml` or CLI |
| **Runtime** | Pages runtime | Workers runtime |

## Required Changes

### 1. Update `package.json` Scripts

Add Worker-specific build and deploy scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "deploy-to-convex": "tsx scripts/deploy-to-convex.ts",
    
    // Add these for Worker deployment:
    "worker:build": "opennextjs-cloudflare",
    "worker:dev": "wrangler dev",
    "worker:deploy": "wrangler deploy"
  }
}
```

### 2. Update `next.config.ts`

Configure Next.js to use OpenNext adapter for Workers:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['convex'],
  skipTrailingSlashRedirect: true,
  
  // Add this for Workers deployment:
  experimental: {
    // OpenNext adapter configuration
    outputFileTracingIncludes: {
      '/': ['./node_modules/**/*'],
    },
  },
};

export default nextConfig;
```

### 3. Update `wrangler.toml`

Change from Pages configuration to Workers configuration:

```toml
# Cloudflare Workers configuration
name = 'shadcn-marketplace'
compatibility_date = "2024-11-29"
compatibility_flags = ["nodejs_compat"]

# Workers build output directory (OpenNext)
main = ".open-next/worker/index.js"

# Environment variables (for production)
[vars]
# Public variables (exposed to client)
NEXT_PUBLIC_CONVEX_URL = "https://your-deployment.convex.cloud"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_xxxxxxxxxxxx"

# Secrets (set via wrangler CLI or dashboard)
# CLERK_SECRET_KEY = "sk_live_xxxxxxxxxxxx"  # Set via: wrangler secret put CLERK_SECRET_KEY
# CLERK_JWT_ISSUER_DOMAIN = "your-app.clerk.accounts.dev"

# Local development settings
[dev]
port = 8788
local_protocol = "http"

# Production environment
[env.production]
vars = { }

# Preview/staging environment
[env.preview]
vars = { }
```

**Important Notes:**
- Remove `pages_build_output_dir` (Pages-specific)
- Add `main` pointing to OpenNext worker output
- Use `[vars]` for public environment variables
- Use `wrangler secret put` for sensitive variables

### 4. Update `proxy.ts` (Middleware)

Ensure middleware is compatible with Workers runtime:

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'

const clerk = clerkMiddleware()

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerk(request, event)
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
```

**Note:** The current `proxy.ts` should work, but verify Clerk compatibility with Workers runtime.

### 5. Environment Variables Setup

#### For Local Development

Create `.dev.vars` file (already in .gitignore):

```bash
# .dev.vars
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_JWT_ISSUER_DOMAIN=your-app.clerk.accounts.dev
```

#### For Production Deployment

Set secrets via Wrangler CLI:

```bash
# Set secret variables (not in wrangler.toml)
wrangler secret put CLERK_SECRET_KEY
wrangler secret put CLERK_JWT_ISSUER_DOMAIN

# Public variables go in wrangler.toml [vars] section
```

Or use Cloudflare Dashboard:
1. Go to Workers & Pages → Your Worker → Settings → Variables
2. Add environment variables there

### 6. Build and Deploy Process

#### Build for Workers

```bash
# Build using OpenNext adapter
pnpm worker:build
```

This creates `.open-next/worker/` directory with the Worker-compatible build.

#### Deploy to Workers

```bash
# Deploy to production
pnpm worker:deploy

# Or with specific environment
wrangler deploy --env production
wrangler deploy --env preview
```

### 7. Update `.gitignore`

Ensure OpenNext build output is ignored:

```
# Add if not already present
/.open-next/
```

## Deployment Workflow

### Initial Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build for Workers:**
   ```bash
   pnpm worker:build
   ```

3. **Set secrets:**
   ```bash
   wrangler secret put CLERK_SECRET_KEY
   wrangler secret put CLERK_JWT_ISSUER_DOMAIN
   ```

4. **Deploy:**
   ```bash
   pnpm worker:deploy
   ```

### CI/CD Integration

For automated deployments, add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Build for Workers
  run: pnpm worker:build

- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: deploy
```

## Differences in Runtime Behavior

### Workers Runtime Limitations

1. **CPU Time Limits:**
   - Free plan: 10ms CPU time per request
   - Paid plans: 50ms CPU time per request
   - May need to optimize heavy operations

2. **Memory Limits:**
   - 128MB memory limit
   - Ensure efficient memory usage

3. **Request Size Limits:**
   - 100MB request body limit
   - 100MB response body limit

4. **Execution Time:**
   - 30 seconds max execution time (free)
   - 15 minutes (paid plans)

### Compatibility Considerations

1. **Node.js APIs:**
   - Workers runtime has limited Node.js compatibility
   - Use `nodejs_compat` flag (already in wrangler.toml)
   - Some Node.js modules may not work

2. **File System:**
   - No file system access
   - Use KV, R2, or D1 for storage

3. **Native Modules:**
   - May not work in Workers runtime
   - Test thoroughly

## Testing Locally

```bash
# Start local Workers dev server
pnpm worker:dev

# Access at http://localhost:8788
```

## Troubleshooting

### Build Fails

**Error:** `Cannot find module '@opennextjs/cloudflare'`
- **Solution:** Ensure `@opennextjs/cloudflare` is in `devDependencies`

### Deployment Fails

**Error:** `No such file or directory: .open-next/worker/index.js`
- **Solution:** Run `pnpm worker:build` before deploying

### Runtime Errors

**Error:** `Module not found` or `Cannot use Node.js module`
- **Solution:** 
  - Check `nodejs_compat` flag in wrangler.toml
  - Verify module compatibility with Workers runtime
  - Consider using Workers-compatible alternatives

### Environment Variables Not Working

**Issue:** Variables not accessible at runtime
- **Solution:**
  - Public vars: Add to `wrangler.toml [vars]`
  - Secrets: Use `wrangler secret put` or dashboard
  - Verify variable names match exactly

## Migration Checklist

- [ ] Update `package.json` with Worker scripts
- [ ] Update `next.config.ts` for OpenNext
- [ ] Update `wrangler.toml` for Workers (remove Pages config)
- [ ] Create `.dev.vars` for local development
- [ ] Set production secrets via `wrangler secret put`
- [ ] Test local build: `pnpm worker:build`
- [ ] Test local dev: `pnpm worker:dev`
- [ ] Deploy to Workers: `pnpm worker:deploy`
- [ ] Verify deployment works
- [ ] Test all features (auth, Convex, etc.)
- [ ] Update CI/CD if applicable

## When to Use Workers vs Pages

### Use Cloudflare Pages When:
- ✅ You want automatic Git-based deployments
- ✅ You prefer dashboard-based configuration
- ✅ You want simpler setup and maintenance
- ✅ Standard Next.js deployment is sufficient

### Use Cloudflare Workers When:
- ✅ You need more control over deployment
- ✅ You want to use Workers-specific features (KV, D1, R2)
- ✅ You need edge computing capabilities
- ✅ You want programmatic deployment control
- ✅ You need custom routing logic

## Summary

To deploy as a Worker instead of Pages:

1. **Build:** Use `opennextjs-cloudflare` instead of standard Next.js build
2. **Config:** Update `wrangler.toml` for Workers (not Pages)
3. **Deploy:** Use `wrangler deploy` instead of automatic Pages deployment
4. **Secrets:** Use `wrangler secret put` or dashboard instead of Pages UI
5. **Runtime:** Workers runtime has different limitations than Pages

The main trade-off is **simplicity vs control** - Pages is simpler, Workers gives more control.


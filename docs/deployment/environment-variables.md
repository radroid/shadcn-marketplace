# Environment Variables Configuration Guide

This guide explains how to configure environment variables for Cloudflare Workers deployment.

## Build Variables vs Runtime Variables

### Build Variables (Required During Build)

These variables are embedded into the client bundle during the build process and **must** be available when running `opennextjs-cloudflare build`:

- ✅ `NEXT_PUBLIC_CONVEX_URL` - **BUILD variable**
  - Used in client-side code (`ConvexClientProvider.tsx`)
  - Gets embedded into the JavaScript bundle
  - Must be available during build

- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - **BUILD variable**
  - Used in client-side Clerk components
  - Gets embedded into the JavaScript bundle
  - Must be available during build

### Runtime Variables (Required When Worker Runs)

These variables are only needed when the Worker is executing:

- ✅ `CLERK_SECRET_KEY` - **RUNTIME variable (Secret)**
  - Server-side only, never exposed to client
  - Used for server-side Clerk operations
  - Set as a **secret** in Cloudflare

- ✅ `CLERK_JWT_ISSUER_DOMAIN` - **RUNTIME variable (Secret)**
  - Used in server-side Convex auth configuration
  - Set as a **secret** in Cloudflare

## Configuration in Cloudflare Dashboard

### For Cloudflare Workers

#### Build Variables (in Build Settings)

In **Settings → Build & deployments → Environment variables**:

Add these as **Build environment variables**:
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
```

⚠️ **Important:** These must be set as **Build** variables, not Runtime variables, because they're needed during the build process.

#### Runtime Variables (in Worker Settings)

In **Settings → Variables and Secrets**:

**Secrets** (set via dashboard UI or CLI):
```
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxx
CLERK_JWT_ISSUER_DOMAIN=your-app.clerk.accounts.dev
```

**OR** set via Wrangler CLI:
```bash
pnpm wrangler secret put CLERK_SECRET_KEY
pnpm wrangler secret put CLERK_JWT_ISSUER_DOMAIN
```

### For Local Development

Create `.dev.vars` file (gitignored):
```bash
NEXTJS_ENV=development
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_JWT_ISSUER_DOMAIN=your-app.clerk.accounts.dev
```

## Why This Matters

### Build Variables

`NEXT_PUBLIC_*` variables are:
1. Read during the Next.js build process
2. Embedded directly into the client-side JavaScript bundle
3. Accessible in the browser (they're public by design)
4. **Required during build** - if missing, the build will fail or the app won't work

### Runtime Variables

Server-side secrets are:
1. Only available when the Worker executes
2. Never exposed to the client
3. Used for server-side operations (API calls, authentication, etc.)
4. **Not needed during build** - only needed at runtime

## Common Mistakes

❌ **Wrong:** Setting `NEXT_PUBLIC_*` as runtime variables only
- The build will succeed, but the client bundle won't have these values
- The app will fail at runtime because the variables are undefined

❌ **Wrong:** Setting secrets as build variables
- Secrets will be exposed in build logs
- Security risk

✅ **Correct:** 
- `NEXT_PUBLIC_*` = Build variables
- Secrets = Runtime variables (set as secrets)

## Verification

After setting variables:

1. **Check build logs** - `NEXT_PUBLIC_*` variables should be available during build
2. **Check runtime** - Secrets should be available when Worker runs
3. **Test the app** - Verify Convex connection and Clerk authentication work

## Summary Table

| Variable | Type | When Needed | Where to Set |
|----------|------|-------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | Build | During build | Build environment variables |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Build | During build | Build environment variables |
| `CLERK_SECRET_KEY` | Runtime (Secret) | At runtime | Worker secrets |
| `CLERK_JWT_ISSUER_DOMAIN` | Runtime (Secret) | At runtime | Worker secrets |


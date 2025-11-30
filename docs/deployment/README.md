# Deployment Guide

This application is configured for **Cloudflare Workers** deployment using OpenNext.

## Quick Start

### Prerequisites

- Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))
- Wrangler CLI installed (`pnpm add -D wrangler`)
- Environment variables configured

### Deploy to Cloudflare Workers

1. **Set up environment variables**

   Create a `.dev.vars` file for local development (see `.dev.vars.example`):
   ```bash
   NEXTJS_ENV=development
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain
   ```

   For production, set secrets via Wrangler CLI:
   ```bash
   pnpm wrangler secret put CLERK_SECRET_KEY
   pnpm wrangler secret put CLERK_JWT_ISSUER_DOMAIN
   ```

   And set public variables in `wrangler.jsonc` or via dashboard.

2. **Build and deploy**

   ```bash
   # Build and deploy to Cloudflare
   pnpm deploy

   # Or build and preview locally first
   pnpm preview
   ```

3. **Your app is live!**

   Your application will be available at `your-project-name.workers.dev`

## Available Commands

- `pnpm deploy` - Build and deploy to Cloudflare Workers
- `pnpm preview` - Build and preview locally with Wrangler
- `pnpm upload` - Build and upload to Cloudflare (without deploying)
- `pnpm cf-typegen` - Generate Cloudflare environment types

## Configuration Files

- `wrangler.jsonc` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext Cloudflare adapter configuration
- `.dev.vars` - Local development environment variables (gitignored)

## Important Notes

### Middleware

This application does **not** use Next.js middleware/proxy files because:
- OpenNext for Cloudflare Workers doesn't support Node.js middleware
- Authentication is handled client-side via Clerk hooks
- Server-side authentication is handled by Convex via JWT tokens

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key (set as secret)
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain (set as secret)

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Ensure all dependencies are installed: `pnpm install`
2. Check that environment variables are set correctly
3. Verify `wrangler.jsonc` configuration is valid

### Authentication Issues

- Verify Clerk keys are correct
- Check that `CLERK_JWT_ISSUER_DOMAIN` matches your Clerk JWT template
- Ensure Convex auth is configured with the same issuer domain

## Additional Resources

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Archive

Previous deployment documentation (for reference):
- `cloudflare-pages-archive.md` - Old Cloudflare Pages deployment guide
- `simplified-archive.md` - Simplified deployment approach
- `summary-archive.md` - Deployment summary
- `opennext-migration-archive.md` - OpenNext migration notes


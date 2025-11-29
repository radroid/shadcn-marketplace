# Shadcn Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A beautiful marketplace for discovering and previewing Shadcn UI components with live code editing.

![Shadcn Marketplace](./public/screenshot.png)

## Overview

**Shadcn Marketplace** helps developers and designers quickly preview and evaluate Shadcn UI components before copying the code to their codebase. Instead of browsing through documentation or demos, you can:

- 🎨 **Preview components instantly** with live rendering
- ✏️ **Edit code in real-time** using an integrated code editor
- 🎭 **Test different themes** to see how components adapt
- 📦 **Browse by category** to find exactly what you need
- 🚀 **Copy and use** components in your projects immediately

Built with modern web technologies for a smooth, fast experience.

## Tech Stack

- **[Next.js](https://nextjs.org)** - React framework for production
- **[Shadcn UI](https://ui.shadcn.com)** - Beautiful, accessible component system
- **[Convex](https://convex.dev)** - Backend and database
- **[Sandpack](https://sandpack.codesandbox.io)** - Live code editing and preview
- **[Clerk](https://clerk.com)** - Authentication and user management

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Convex account ([sign up free](https://convex.dev))
- Clerk account ([sign up free](https://clerk.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/shadcn-marketplace.git
   cd shadcn-marketplace
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploying to Cloudflare Pages

This application is optimized for deployment on Cloudflare Pages with full support for Edge runtime.

#### Prerequisites

- Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))
- Wrangler CLI installed (included in dev dependencies)
- Environment variables configured

#### Method 1: Cloudflare Dashboard (Recommended)

1. **Connect your repository**
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
   - Click "Create a project" → "Connect to Git"
   - Select your repository

2. **Configure build settings**
   ```
   Build command: pnpm pages:build
   Build output directory: .vercel/output/static
   ```

3. **Set environment variables**
   
   In the Cloudflare Pages dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain
   ```

4. **Deploy**
   - Click "Save and Deploy"
   - Your site will be available at `your-project.pages.dev`

#### Method 2: Wrangler CLI

1. **Build for Cloudflare Pages**
   ```bash
   pnpm pages:build
   ```

2. **Deploy using Wrangler**
   ```bash
   pnpm pages:deploy
   ```

3. **Set environment variables via CLI**
   ```bash
   wrangler pages project create shadcn-marketplace
   
   # Set each environment variable
   wrangler pages secret put NEXT_PUBLIC_CONVEX_URL
   wrangler pages secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   wrangler pages secret put CLERK_SECRET_KEY
   wrangler pages secret put CLERK_JWT_ISSUER_DOMAIN
   ```

#### Local Preview with Cloudflare Environment

Test your deployment locally before pushing:

```bash
# Build and preview locally with Cloudflare Workers runtime
pnpm pages:dev
```

This starts a local development server using Wrangler that simulates the Cloudflare Pages environment.

#### Important Notes

- **Image Optimization**: Configured with `unoptimized: true` for Cloudflare compatibility
- **Middleware**: Clerk middleware works seamlessly with Cloudflare Edge runtime
- **External Services**: Convex and Clerk are external services that work perfectly with Cloudflare Pages
- **Build Output**: The `@cloudflare/next-on-pages` adapter automatically optimizes the Next.js build for Cloudflare

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable API key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret API key (server-side) | Yes |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer domain for Convex auth | Yes |

## Contributing

We welcome contributions! Whether you want to fix bugs, add features, or submit new components to the marketplace, please read our [Contributing Guide](CONTRIBUTING.md) to get started.

Component submissions go through a manual QC process to ensure quality and consistency.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with ❤️ using [Shadcn UI](https://ui.shadcn.com) components and inspired by the amazing work of [@shadcn](https://twitter.com/shadcn).

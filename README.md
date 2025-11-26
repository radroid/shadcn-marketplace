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

## Contributing

We welcome contributions! Whether you want to fix bugs, add features, or submit new components to the marketplace, please read our [Contributing Guide](CONTRIBUTING.md) to get started.

Component submissions go through a manual QC process to ensure quality and consistency.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with ❤️ using [Shadcn UI](https://ui.shadcn.com) components and inspired by the amazing work of [@shadcn](https://twitter.com/shadcn).

# Contributing

Thanks for your interest in contributing to Shadcn Marketplace. We're happy to have you here.

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

## About this repository

This repository is a marketplace for Shadcn UI components built with Next.js, Convex, and Sandpack.

- We use [pnpm](https://pnpm.io) for package management.
- We use [Next.js](https://nextjs.org) for the web application.
- We use [Convex](https://convex.dev) for the backend.
- We use [Sandpack](https://sandpack.codesandbox.io) for live code editing.

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/your-username/shadcn-marketplace.git
```

### Navigate to project directory

```bash
cd shadcn-marketplace
```

### Create a new Branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

```bash
pnpm install
```

### Set up environment variables

Create a `.env.local` file in the root directory and add your Convex deployment URL and Clerk authentication keys:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### Run the development server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Component Submissions

We welcome component submissions to the marketplace! Here's how the process works:

1. **Create Your Component**: Build your Shadcn UI component with proper documentation and examples.

2. **Submit via Pull Request**: Submit your component through a pull request with:
   - Component code and dependencies
   - Clear description and usage examples
   - Screenshots or demo GIFs
   - Proper tags and categorization

3. **Manual QC Process**: Our team will review your submission for:
   - Code quality and best practices
   - Accessibility standards
   - Visual consistency
   - Documentation completeness
   - Proper Shadcn UI integration

4. **Publication**: Once approved, your component will be published to the marketplace and made available to all users.

> [!NOTE]
> The component submission process is currently flexible and evolving. We appreciate your patience as we refine the workflow.

## Commit Convention

Before you create a pull request, please check whether your commits comply with the commit conventions used in this repository.

When you create a commit, we kindly ask you to follow the convention `category(scope or module): message` in your commit message while using one of the following categories:

- `feat / feature`: all changes that introduce completely new code or new features
- `fix`: changes that fix a bug (ideally you will additionally reference an issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for usage)
- `build`: all changes regarding the build of the software, changes to dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e. GitHub actions, CI system)
- `chore`: all changes to the repository that do not fit into any of the above categories

**Examples:**
- `feat(components): add pricing card component`
- `fix(editor): resolve theme generation bug`
- `docs(readme): update installation instructions`

If you are interested in the detailed specification, you can visit [Conventional Commits](https://www.conventionalcommits.org/).

## Pull Requests

### Before Submitting

- Ensure your code follows the project's coding standards
- Test your changes thoroughly
- Update documentation if necessary
- Make sure all existing tests pass

### PR Guidelines

- Keep pull requests focused on a single feature or fix
- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Be responsive to feedback and reviews

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a community that values:

- **Respect**: Treat everyone with kindness and consideration
- **Collaboration**: Work together to build something amazing
- **Quality**: Strive for excellence in code and design
- **Openness**: Share knowledge and help others learn

## Questions?

If you have questions or need help, feel free to:

- Open a [discussion](https://github.com/your-username/shadcn-marketplace/discussions)
- Create an [issue](https://github.com/your-username/shadcn-marketplace/issues)
- Reach out to the maintainers

Thank you for contributing to Shadcn Marketplace! 🎉

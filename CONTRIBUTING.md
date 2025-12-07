# Contributing to Mapitals

Thank you for your interest in contributing to Mapitals! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20 or higher
- npm
- Git

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mapitals-v2.git
   cd mapitals-v2
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/mjprude/mapitals-v2.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Branch

Create a new branch for your work from the latest main:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Use descriptive branch names that reflect the work being done, such as `feature/add-new-region`, `fix/map-zoom-issue`, or `docs/update-readme`.

### Making Changes

When making changes, please follow these guidelines:

1. Write clear, readable code that follows the existing code style
2. Keep commits focused and atomic - each commit should represent a single logical change
3. Write meaningful commit messages that describe what changed and why

### Code Style

The project uses ESLint for code quality. Before committing, always run:

```bash
npm run lint
```

Fix any linting errors before submitting your changes. The CI pipeline will fail if linting errors are present.

### Testing

The project uses Vitest for testing. When adding new features or fixing bugs, please include appropriate tests.

Run the test suite:

```bash
npm run test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

All tests must pass before your changes can be merged. The CI pipeline runs tests automatically on all pull requests.

### Building

Ensure your changes build successfully:

```bash
npm run build
```

This runs TypeScript type checking followed by the Vite production build.

## Submitting Changes

### Pull Request Process

1. Ensure all tests pass and linting is clean
2. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a pull request against the `main` branch of the upstream repository
4. Fill out the pull request template with a clear description of your changes
5. Wait for CI checks to pass
6. Address any feedback from reviewers

### Pull Request Guidelines

When submitting a pull request:

- Provide a clear title that summarizes the change
- Include a description of what the PR does and why
- Reference any related issues using GitHub's issue linking (e.g., "Fixes #123")
- Keep PRs focused - if you have multiple unrelated changes, submit them as separate PRs
- Be responsive to feedback and make requested changes promptly

## Types of Contributions

### Bug Reports

If you find a bug, please open an issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Browser and OS information if relevant
- Screenshots if applicable

### Feature Requests

Feature requests are welcome! Please open an issue describing:

- The feature you'd like to see
- Why it would be useful
- Any implementation ideas you have

### Code Contributions

We welcome code contributions including:

- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Test coverage improvements

### Adding New Capitals

If you'd like to add or correct capital city data:

1. Edit `src/capitals.ts`
2. Ensure the data follows the existing structure:
   - For world capitals: `{ city, country, lat, lng, region }`
   - For US state capitals: `{ city, state, lat, lng }`
3. Add appropriate tests in `src/capitals.test.ts`
4. Verify coordinates are accurate using a mapping service

## Project Architecture

The source code lives in the `src/` directory. The main game logic is in `App.tsx`, with capital city data and types defined in `capitals.ts`. UI components are organized under `src/components/`, with game-specific components separate from the reusable shadcn/ui component library.

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.

## License

By contributing to Mapitals, you agree that your contributions will be licensed under the MIT License.

# Contributing to 12-Step Recovery Companion

Thank you for your interest in contributing to the 12-Step Recovery Companion! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project is a **recovery tool** used by people in vulnerable states. Every contribution must:
- Prioritize user privacy and data security
- Respect recovery principles and traditions
- Never include copyrighted NA/AA literature verbatim
- Maintain empathy and compassion in all code and documentation

## Getting Started

### Prerequisites

- **Node.js**: >=20.0.0 <21.0.0
- **pnpm**: >=8.0.0
- **Git**: Latest version

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/12-Step-Companion.git
   cd 12-Step-Companion
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (optional for local dev)
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

## Project Structure

```
12-Step-Companion/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── web/             # Next.js 14 web app
├── packages/
│   ├── api/             # tRPC routers
│   ├── types/           # Shared TypeScript types
│   └── ui/              # Shared UI components
├── server/              # Express backend
└── shared/              # Shared utilities
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow the existing code style
- Write TypeScript with strict mode
- Add tests for new features
- Update documentation as needed

### 3. Commit Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
git commit -m "refactor: improve code structure"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript

- Use strict mode
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use Zod schemas for runtime validation

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Trailing commas in multi-line objects/arrays
- Format code with Prettier (runs on save)

### Testing

- Write unit tests for business logic
- Write integration tests for critical flows
- Aim for 70%+ test coverage for business logic

### Accessibility

- WCAG 2.2 AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support

## Copyright Guidelines

### ⚠️ CRITICAL: NA/AA Literature

- **NEVER** include copyrighted NA/AA text verbatim
- **NEVER** quote from Basic Text, Step Working Guide, or other copyrighted materials
- **DO** create neutral, paraphrased prompts that guide step work
- **DO** link out to official NA/AA resources when appropriate

### Example: Good ✅
```
"Reflect on your relationship with substances. What patterns do you notice?"
```

### Example: Bad ❌
```
"Step One: We admitted we were powerless over our addiction..."
```

## Pull Request Process

1. **Update Documentation**: Update README.md or relevant docs if needed
2. **Add Tests**: Add tests for new features or bug fixes
3. **Run Tests**: Ensure all tests pass (`pnpm test`)
4. **Check Linting**: Ensure no linting errors (`pnpm lint`)
5. **Type Check**: Ensure TypeScript compiles (`pnpm check`)
6. **Describe Changes**: Clearly describe what your PR does and why

## Review Process

- All PRs require at least one review
- Reviews focus on:
  - Code quality and maintainability
  - Privacy and security implications
  - Recovery principles compliance
  - Test coverage
- Address review comments promptly

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.


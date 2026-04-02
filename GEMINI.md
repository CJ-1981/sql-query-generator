# GEMINI.md - SQL Query Generator

## Project Overview

**SQL Query Generator** is a modern Next.js application designed to convert natural language questions into accurate SQL queries. It leverages various AI models and a user-provided database schema to generate results.

### Core Features
- **Natural Language to SQL:** Uses advanced AI models to translate user questions into SQL statements.
- **Schema Management:** Provides a dedicated panel for users to input or load example database schemas (e.g., E-Commerce, Blog, HR).
- **Multi-Provider AI Support:** Integrates with several AI providers including:
  - Google Gemini
  - Anthropic Claude
  - Groq
  - Cerebras
  - OpenRouter (Meta Llama 3)
- **Interactive UI:** Built with a resizable split-pane interface using `react-resizable-panels`, `Tailwind CSS 4`, and `Shadcn UI` components.
- **Client-Side Configuration:** API keys and model preferences are stored securely in the browser's local storage.

### Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn UI (Radix UI based)
- **Icons:** Lucide React
- **ORM:** Prisma (configured with SQLite)
- **State Management:** Zustand and React Hook Form
- **Runtime:** Bun (recommended)

---

## Building and Running

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js
- Access to at least one supported AI API (Gemini, Anthropic, etc.)

### Installation
```bash
bun install
```

### Database Setup
```bash
# Push the schema to your local SQLite database
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Development
```bash
# Start the development server on port 3000
bun run dev
```

### Production Build
```bash
# Build the application
bun run build

# Start the production server
bun run start
```

### Linting
```bash
bun run lint
```

---

## Development Conventions

### Project Structure
- `src/app/`: Next.js App Router pages and API routes.
- `src/components/sql-generator/`: Core application components (SchemaPanel, QueryPanel, etc.).
- `src/components/ui/`: Reusable UI components from Shadcn.
- `src/lib/`: Shared utilities and AI provider logic (`ai-providers.ts`).
- `prisma/`: Database schema and migrations.

### Coding Guidelines
- **Type Safety:** Use TypeScript for all new code. Define interfaces for API responses and component props.
- **UI Consistency:** Use existing Shadcn components and Tailwind CSS for styling. Follow the established color scheme (primarily Emerald and Gray).
- **AI Integration:** When adding a new AI provider, update `src/lib/ai-providers.ts` and the `SettingsDialog` in `src/components/sql-generator/settings-dialog.tsx`.
- **Validation:** Use `zod` for validating API requests and form data.
- **State Management:** For complex UI state, prefer `zustand` stores. Local component state should use `useState`.

### Testing
- No explicit test framework is currently configured in `package.json`. When adding tests, consider using `Vitest` or `Playwright`.

---

## Key Files
- `src/app/page.tsx`: Main entry point for the SQL Generator UI.
- `src/app/api/sql-generate/route.ts`: API endpoint that orchestrates the AI generation.
- `src/lib/ai-providers.ts`: Logic for interacting with various AI model APIs.
- `prisma/schema.prisma`: Defines the SQLite database structure (User and Post models).

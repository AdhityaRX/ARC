# ARC — AI-Powered Project Architect

## Project Overview
ARC is a web application that helps users ideate, refine, and architect projects
using Claude AI. Built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL,
and the Anthropic API.

## Tech Stack
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4
- Custom UI components (Button, Input, Badge, Card)
- Prisma ORM with PostgreSQL
- Anthropic SDK (@anthropic-ai/sdk) for Claude API
- NextAuth.js v5 for authentication
- Zustand for state management
- SSE streaming for real-time chat

## Architecture
- /src/app — Next.js App Router pages and layouts
- /src/app/api — API route handlers
- /src/components — React components (ui/, chat/, admin/, layout/)
- /src/lib — Utilities, API clients, database helpers
- /src/stores — Zustand state stores
- /src/styles — Global CSS with ARC theme variables
- /prisma — Schema and migrations

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run db:migrate` — Run database migrations
- `npm run db:generate` — Generate Prisma client
- `npm run db:seed` — Seed admin user
- `npm run lint` — ESLint check

## Code Conventions
- Use TypeScript strict mode everywhere
- Functional components only, no class components
- Use `async/await` over `.then()` chains
- All API routes return typed responses
- Use Zod for input validation on all API routes
- Error handling: always catch and return structured error responses
- Component files: PascalCase (ChatWindow.tsx)
- Utility files: camelCase (apiClient.ts)
- CSS: Tailwind utility classes + CSS variables for theme

## Design Rules
- ALL backgrounds are dark (--arc-bg-primary/secondary/tertiary)
- Crimson (#DC2626) ONLY for primary actions, active states, accent borders
- <10% crimson visual presence
- Every interactive element has a transition
- Code blocks use custom dark syntax theme

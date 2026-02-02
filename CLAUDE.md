# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

# Testing
npm run test         # Vitest watch mode
npm run test:run     # Run all unit/integration tests once
npm run test:unit    # Unit tests only (tests/unit/)
npm run test:integration  # Integration tests only (tests/integration/)
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:headed   # E2E with visible browser

# Database
npx prisma migrate dev     # Apply migrations in development
npx prisma generate        # Regenerate Prisma client after schema changes
```

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + Prisma + PostgreSQL + Supabase Auth + TipTap editor

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/` - REST API endpoints (notes, notebooks, tags, attachments, import)
- `src/components/` - React components organized by feature (ui/, layout/, notes/, editor/)
- `src/hooks/` - SWR-based data fetching hooks (useNotes, useNotebooks, useTags, useAppData)
- `src/lib/` - Core utilities:
  - `db/prisma.ts` - Prisma client singleton
  - `supabase/` - Auth client and middleware
  - `storage/` - Abstracted file storage (local, S3, Supabase Storage)
  - `import/` - ENEX file parsing and import pipeline
- `src/types/` - TypeScript domain types
- `prisma/schema.prisma` - Database schema

### Key Patterns
- **Data hooks** use SWR for caching and real-time updates
- **Storage service** uses factory pattern - `getStorageService()` returns configured backend based on `STORAGE_TYPE` env var
- **ENEX import** pipeline: `enex-parser.ts` → `enml-converter.ts` → `resource-extractor.ts` → `import-orchestrator.ts`
- All API routes validate with Zod and check Supabase auth

### Database Models
Core entities: User → Notebook → Note → (Tags via NoteTag, Attachments)
Notes store HTML content with optional original ENML preservation. ImportJob tracks async ENEX imports.

## Environment Setup

Copy `.env.example` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `STORAGE_TYPE` - "local", "s3", or "supabase"
- Supabase credentials for auth

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run check` - TypeScript type checking
- `npm run db:push` - Update database schema with Drizzle ORM

## Code Styles & Conventions
- **TypeScript**: Strict mode, with types in shared/schema.ts (Drizzle ORM + Zod)
- **Formatting**: 2-space indentation, no explicit formatter
- **Naming**: camelCase for variables, PascalCase for components/types
- **Components**: React components use .tsx extension
- **Imports**: Use path aliases: `@/*` for client, `@shared/*` for shared code
- **UI**: Shadcn UI with Tailwind CSS, use `cn()` utility for classnames
- **Error Handling**: try/catch with appropriate status codes
- **API**: RESTful endpoints with JSON responses

## Project Structure
- `/client/src` - Frontend React code
- `/server` - Express backend
- `/shared` - Shared types and schemas
- Component files should be in `/client/src/components`
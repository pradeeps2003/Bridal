# Glow with Rubi

Premium bridal and occasion makeup booking platform.

## Stack

Next.js 15 · TypeScript · Tailwind CSS v4 · Supabase · Razorpay · Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run check` | Lint + typecheck + build |

## Environment

See `.env.example` for all variables. Never commit `.env.local`.

## Database

Migrations live in `supabase/migrations/`. Apply via Supabase CLI or dashboard SQL editor.

## Architecture

See [docs/architecture.md](docs/architecture.md) for full system design and phase roadmap.

## Design System

UI tokens and rules: `design-system/glow-with-rubi/MASTER.md`

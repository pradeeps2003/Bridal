# Glow with Rubi — Architecture

Premium makeup booking platform. The website is the **source of truth** for bookings, availability, pricing, and payment state. WhatsApp is a notification channel only.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + shadcn-style components |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth + Row Level Security |
| Storage | Supabase Storage |
| Payments | Razorpay (server-verified webhooks) |
| Messaging | WhatsApp Business API (notifications) |
| Hosting | Vercel free tier |

## Principles

1. **Server-side truth** — All booking, pricing, availability, and payment operations are validated and recalculated on the server. Never trust browser-supplied prices or statuses.
2. **No hard-coded business rules** — Services, packages, pricing, availability rules, hold duration, and notification templates live in the database and admin settings.
3. **Secrets stay server-side** — Service role keys, payment secrets, and WhatsApp tokens are never exposed to the browser.
4. **Free-first deployment** — Vercel + Supabase free tiers until usage justifies upgrade.
5. **Phase-by-phase delivery** — One phase at a time with acceptance checks before proceeding.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (public)/           # Customer-facing pages
│   ├── admin/              # Protected admin dashboard
│   └── api/                # Server-side API handlers
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Header, footer, navigation
│   └── sections/           # Page sections (hero, services, etc.)
├── lib/
│   ├── env.ts              # Validated environment variables
│   ├── supabase/           # Supabase client factories
│   ├── booking/            # Booking state machine & validation
│   ├── pricing/            # Server-side price calculation
│   └── availability/       # Slot calculation engine
├── types/                  # Shared TypeScript types
└── middleware.ts           # Auth & route protection

supabase/
└── migrations/             # SQL migrations (version controlled)

docs/
└── architecture.md         # This file

design-system/
└── glow-with-rubi/         # UI/UX design tokens & rules
```

## Booking State Machine

```
REQUESTED → HELD → ADMIN_APPROVED → PAYMENT_PENDING → CONFIRMED
```

Alternative paths:
- `REQUESTED → REJECTED`
- `HELD → EXPIRED`
- `CONFIRMED → CANCELLED → COMPLETED`

A customer request does **not** permanently block the calendar until admin approval and payment conditions are met. Temporary holds expire (default 15 minutes, admin-configurable).

## Security Model

- **Public routes** — Read-only access to published services, packages, portfolio via RLS.
- **Customer actions** — Booking requests via server API; no direct DB writes from browser.
- **Admin routes** — Protected by Supabase Auth session + middleware; RLS policies enforce admin role.
- **Payment webhooks** — Cryptographically verified; booking status updated only after server confirmation.
- **Audit log** — Sensitive admin actions recorded in `audit_logs` table.

## API Design

All mutation endpoints:
1. Validate input with Zod schemas
2. Recalculate prices/availability from database
3. Use database transactions for conflict prevention
4. Return structured error responses

## Environment Variables

See `.env.example` for the full list. Required for production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_APP_URL`

Payment and WhatsApp variables are optional until Phases 9–10.

## Deployment

1. Push to GitHub
2. Connect Vercel project
3. Create Supabase project (free tier)
4. Run migrations via Supabase CLI or dashboard
5. Configure environment variables in Vercel
6. Verify booking flow in production

## Phase Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Project foundation | ✅ |
| 1 | Database schema | ✅ |
| 2 | Admin auth | ✅ |
| 3 | Services & pricing admin | ✅ |
| 4 | Premium public website | ✅ |
| 5 | Booking wizard | ✅ |
| 6 | Availability engine | ✅ |
| 7 | Temporary holds | ✅ |
| 8 | Admin calendar | ✅ |
| 9 | Razorpay payments | ✅ |
| 10 | WhatsApp notifications | ✅ |
| 11 | Custom quotes | ✅ |
| 12 | Portfolio management | ✅ |
| 13 | Business settings | ✅ |
| 14 | Security hardening | ✅ |
| 15 | Testing | ✅ |
| 16 | Deployment | Pending |
| 17 | Production QA | Pending |

# HomeTutor

A two-sided marketplace connecting parents/students with verified tutors for **in-home** and **online** tutoring — search by subject/grade, book a session, chat, and leave a review.

| Actor | Core job |
|---|---|
| Parent / Student | Find a tutor, book a session, message, review |
| Tutor | Publish a profile, get verified, set subjects/rates/availability, accept bookings |
| Admin | Verify tutors, moderate users/bookings/reviews, read the audit log |

This is the **basic build** — deliberately scoped to a frontend and a backend and nothing else.

### Not in this build (future features)

- **Payments and payouts** — no Stripe/Razorpay, no earnings ledger, no commission. `CONFIRM` on a booking is a plain state transition.
- **Geographic search** — no PostGIS, no tutor home location, no travel radius, no "tutors near me". Search filters on subject / grade / mode / price only.
- **Notifications** — no in-app bell, no SMS/push/email on booking events.
- **Progress reports** and **admin analytics**.
- **Automated tests** — no unit, integration, or e2e suite. Verification is manual.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo, plain JavaScript (no TypeScript)
- **API** (`apps/api`): Express 5, MVC per module (`*.controller.js` / `*.service.js` / `*.model.js`), REST, Zod validation at the boundary
- **Web** (`apps/web`): Vite + React 18 SPA, `react-router`, hand-written data-fetching hooks (no TanStack Query)
- **DB**: PostgreSQL 16 via Prisma. `btree_gist` is the only extension — it backs the double-booking `EXCLUDE` constraint
- **Shared packages**: `packages/types` (Zod schemas), `packages/api-client` (fetch wrappers), `packages/ui` (components)

Email/OTP/storage are stubbed behind swappable interfaces (dev-log providers, local disk) — see `apps/api/src/common/providers/`.

## Repo layout

```
apps/
  api/          Express REST API, MVC per module
  web/          Vite + React SPA
packages/
  types/        shared Zod schemas
  api-client/   fetch wrappers per API resource
  ui/           shared UI components
prisma/         schema.prisma + migrations + seed
config/         docker-compose.yml, env template, postgres init
```

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Docker (for Postgres)

## Setup

```bash
pnpm install
cp config/.env.example .env
cp apps/web/.env.example apps/web/.env
```

Replace `FIELD_ENCRYPTION_KEY` in `.env` with a real 32-byte key:

```bash
openssl rand -hex 32
```

Start Postgres:

```bash
docker compose -f config/docker-compose.yml up -d
```

> Postgres is exposed on host port **5433**, not 5432, to avoid clashing with a native install. `DATABASE_URL` already points at 5433.

Apply migrations and seed:

```bash
pnpm db:migrate
pnpm db:seed
```

## Running the app

```bash
pnpm dev
```

Runs the API (`:4000`) and the web app (`:5173`) together via Turborepo. Open **http://localhost:5173**.

To run them separately:

```bash
cd apps/api && pnpm dev   # API on :4000
cd apps/web && pnpm dev   # Web on :5173
```

## Seeded accounts

All seeded users share the password `password123`:

| Email | Role |
|---|---|
| `admin@hometutoring.test` | Admin |
| `asha.rao@hometutoring.test` | Tutor (verified — Mathematics) |
| `ravi.kumar@hometutoring.test` | Tutor (verified — Physics) |
| `meera.iyer@hometutoring.test` | Tutor (verified — English) |
| `sanjay.unverified@hometutoring.test` | Tutor (unverified — sits in the admin queue) |
| `priya.parent@hometutoring.test` | Parent (child: Aarav Sharma) |
| `kiran.parent@hometutoring.test` | Parent (child: Diya Nair) |

Plus bookings covering every status, a few chat messages, and a review.

### Forgot password (dev flow)

No real email provider is wired up. Submit the forgot-password form, then check the **API server's terminal** for:

```
[dev-email] password reset for someone@example.com: http://localhost:5173/reset-password?token=...
```

Open that link to set a new password.

## Domain rules (non-negotiable)

- Booking lifecycle: `REQUESTED → ACCEPTED → CONFIRMED → IN_PROGRESS → COMPLETED`, with `DECLINED` / `CANCELLED` / `NO_SHOW` / `REFUNDED` side exits — enforced by a single `BookingStateMachine`.
- Money is always an integer (paise), never a float.
- Double-booking is prevented at the database level (Postgres `EXCLUDE` constraint on `(tutorId, timeRange)`), not just in application code.
- Unverified tutors never appear in public search results.
- Chat messages mask contact details until a booking is confirmed.
- Every admin read of a tutor's verification documents is audit-logged.
- PII (parent address, tutor phone) is encrypted at rest with AES-256-GCM.

## Verifying a change

There is no test suite in this build, so check by hand after any change:

1. `docker compose -f config/docker-compose.yml up -d && pnpm db:migrate && pnpm db:seed`
2. `pnpm dev`
3. Sign up or log in, search a tutor, book a session, accept it as the tutor, confirm, start, complete, and leave a review.
4. Confirm an overlapping booking for the same tutor is rejected with a 409.

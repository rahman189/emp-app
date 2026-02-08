# Employee App

Next.js app with a wizard flow, employee table, and mock APIs served by `json-server`.

## Prerequisites

- Node.js `20.x` (recommended: latest Node 20 LTS)
- npm `10.x+`
- pnpm `9.x` (project package manager)
- Docker + Docker Compose (optional, for containerized run)

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create/update `.env.local`:

```env
NEXT_PUBLIC_BASIC=http://localhost:4001
NEXT_PUBLIC_DETAIL=http://localhost:4002
```

3. Run the app and mock servers:

```bash
pnpm dev
```

This starts:

- Next.js app at `http://localhost:3000`
- json-server step 1 at `http://localhost:4001`
- json-server step 2 at `http://localhost:4002`

## Run Scripts

- `pnpm dev`: app + both mock servers
- `pnpm build`: production build
- `pnpm start`: run production server
- `pnpm lint`: run ESLint
- `pnpm test`: run Jest tests

## Docker Setup (Next.js + json-server)

Files included:

- `Dockerfile` (Next.js production)
- `Dockerfile.mock` (`json-server`)
- `docker-compose.yml` (all services)

Build and run:

```bash
docker compose build
docker compose up
```

If your environment uses legacy Compose:

```bash
docker-compose build
docker-compose up
```

Services:

- App: `http://localhost:3000`
- Mock API step 1: `http://localhost:4001`
- Mock API step 2: `http://localhost:4002`

## Testing Notes

- Test framework: Jest + Testing Library.
- Run all tests:

```bash
pnpm test -- --bail
```

- Pre-commit hook runs tests and blocks commit on failure.
- Some tests use mocked components/APIs; ensure mock JSON files are present in `mocks/`.

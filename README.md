## Multi-Tenant Tasks App (Next.js + Postgres + Prisma)

### Stack
- Next.js (App Router) for web + API routes (middleware layer)
- PostgreSQL + Prisma
- Auth: email+password (bcrypt), JWT in httpOnly cookie
- Multi-tenancy via `Tenant` and `Membership` models

### Quick Start
1) Start Postgres (Docker or local)
```bash
docker compose up -d
```
Or use your local Postgres (recommended if you already have it). Set `DATABASE_URL` accordingly.

2) Set env vars
- Copy `env.example` to `.env` and fill values
- At minimum:
  - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tasksapp?schema=public"`
  - `JWT_SECRET="replace-me-with-a-strong-secret"`
  - `APP_URL="http://localhost:3000"`

### Environment Variables
- `DATABASE_URL` (required): Postgres connection string
- `JWT_SECRET` (required): secret for JWT signing
- `APP_URL` (required): base URL used for invite links

3) Install deps
```bash
pnpm install
# or npm install / yarn install
```

4) Run migrations and generate Prisma client
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5) Run the app
```bash
pnpm dev
# or npm run dev / yarn dev
```

### Auth, Tenants & Tasks
- Auth: Signup or login with password, sets an `auth` cookie (JWT)
- Tenants: Create and switch tenants (tenant selection sets `tenantId` cookie)
- Tasks: Create, view and assign tasks within a tenant

### API Endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/switch-tenant`
- `GET /api/tenants`, `POST /api/tenants`
- `POST /api/tenants/:id/invite`
- `POST /api/invites/:token/accept`
- `GET /api/members` — list members in current tenant (for assignee dropdown)
- `GET /api/tasks`
  - query: `page`, `pageSize`, `status`, `search`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Architecture Notes
- Frontend talks only to Next API routes (middleware) which talk to DB
- Multi-tenancy enforced by checking `tenantId` cookie + membership on every protected route
- JWT only stores `userId` (tenantId is managed via separate cookie)
- Roles via `Membership.role` (ADMIN/MEMBER). Invites restricted to ADMINs
- Middleware-based auth redirect in `middleware.ts` (excludes public and assets)

### Tradeoffs / Future Improvements
- Email delivery for invites (currently returns accept URL only)
- More robust session management and token rotation
- Granular task permissions; richer task fields
- Better UI/UX and styling (Tailwind)
- Form libraries and tighter validation + error display

### CI
- GitHub Actions workflow `.github/workflows/ci.yml`:
  - Launches Postgres
  - Installs deps
  - `prisma generate` + `prisma db push`
  - Typecheck, lint, build




# PantryChef 🍳

Full-stack recipe discovery and cooking assistant built with **Next.js 15 / React 19 / TypeScript / Tailwind CSS 4**, **Python FastAPI**, **PostgreSQL**, **Supabase Auth**, and an optional **OpenAI cooking assistant**.

## Features

- Responsive dark-themed recipe discovery and detail pages
- Search by recipe name, cuisine, cooking time; rank by pantry ingredient matches
- Adjustable servings and explicit compatible unit conversions
- Sign-up/sign-in, saved recipes, personal pantry and persistent shopping list
- Generate missing ingredients from a recipe into the shopping list
- Optional AI substitutions and cooking tips (server-side API key)
- API docs at `/docs`, health endpoint, pytest, Playwright, GitHub Actions
- Metadata, robots.txt, sitemap, accessible form labels

## Quick start (Mac)

Prerequisites: Node 22 LTS, Python 3.12+, Git, Docker Desktop (for local PostgreSQL).

```bash
unzip PantryChef-Fullstack.zip
cd pantrychef
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up -d db
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In a **second Terminal**:

```bash
cd pantrychef/frontend  # from the parent directory containing pantrychef
npm install
npm run dev
```

Open http://localhost:3000 and http://localhost:8000/docs. For a simpler demo without Docker, set `DATABASE_URL=sqlite:///./pantrychef.db` in `backend/.env`.

## Configuration

**Supabase:** Create a project at https://supabase.com. In Project Settings / API, copy the project URL and publishable/anon key into `frontend/.env.local`. Set the same project URL in `backend/.env`. Enable Email authentication. **Important:** This backend validates Supabase asymmetric JWTs using the project's JWKS; configure Supabase to issue RS256 or ES256 access tokens. Legacy HS256 projects require changing signing algorithm in Supabase settings before account features will work. The publishable key is safe in the frontend; never put the service role key there. For local email confirmation, set your Supabase Auth Site URL to http://localhost:3000 and configure redirect URLs. Signup may require email confirmation.

**AI:** Add your private `OPENAI_API_KEY` in `backend/.env`. The app uses the Chat Completions endpoint and defaults to `gpt-4.1-mini`; verify your account has access or change `OPENAI_MODEL`. Usage is billed. The key is never exposed in the browser. The demo AI route is public: **add authentication, rate limiting, budget limits, and abuse controls before exposing it publicly**, or disable it for public deployment.

**PostgreSQL:** The included Compose service uses local demo credentials. Change credentials and use a managed database in production. Tables are auto-created for quick start; use Alembic migrations for long-term schema changes.

**Production:** Deploy frontend on Vercel (root directory `frontend`), backend on Render (root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`), and database on managed Postgres (Supabase/Render). Configure `DATABASE_URL`, `FRONTEND_ORIGIN=https://your-vercel-domain`, `SUPABASE_URL`, `OPENAI_API_KEY` in Render; `NEXT_PUBLIC_API_URL=https://your-render-api`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` in Vercel. Redeploy after changes. HTTPS is required for production. Set Supabase Auth Site URL and redirect allowlist to production URL.

## Testing

```bash
cd backend && source .venv/bin/activate && python -m pytest -q
cd ../frontend && npm run lint && npm run build
# Optional: npm exec playwright install chromium && npm run test:e2e
```

Playwright browser tests expect a running API at localhost:8000 for recipe data. GitHub CI runs backend tests and frontend lint/build, not Playwright, by default.

## API endpoints

- `GET /health`
- `GET /recipes?q=&cuisine=&max_minutes=&pantry=`
- `GET /recipes/{id}`
- `GET/POST/DELETE /me/saved` (with recipe ID for writes)
- `GET/POST/DELETE /me/pantry`
- `GET/POST/PATCH/DELETE /me/shopping`
- `POST /ai/ask` (optional, server-side AI key)

## GitHub upload

1. Create an empty public repository named `pantrychef` at https://github.com/new (do **not** initialize with a README).
2. From the extracted `pantrychef` folder:

```bash
git init
git branch -M main
git add .
git commit -m "feat: initialize PantryChef full-stack application"
git remote add origin https://github.com/YOUR_USERNAME/pantrychef.git
git push -u origin main
```

Use your own GitHub username. Never commit `.env` or `.env.local`.

## Known limitations / next steps

- Recipe catalog contains four **seed examples**; add licensed content and attribution before commercial use.
- Search is title/cuisine/time filtering and exact-name pantry ranking, not semantic search.
- Unit conversions cover compatible units (g/oz, ml/fl oz, tbsp/tsp) only; ingredient density conversions are deliberately excluded.
- Shopping list creation adds separate entries; aggregation and offline sync are not implemented.
- Supabase session is client-side; the backend verifies JWT signatures and isolates user-owned records.
- Authentication and AI require your own external accounts and configuration.
- The public AI endpoint needs abuse protection before production.
- Add API rate limiting, structured monitoring, database migrations, and security hardening for a real production service.

**Status:** Starter repository with implementation code. Deployments, external account configuration, and integration tests must be completed by the developer. Do not claim unverified production functionality on a resume.

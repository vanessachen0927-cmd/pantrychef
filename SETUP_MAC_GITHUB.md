# Detailed MacBook setup and GitHub instructions

## 1. Install tools

- Install **Node.js 22 LTS** from https://nodejs.org
- Install **Python 3.12 or newer** from https://python.org (or Homebrew)
- Install **VS Code** from https://code.visualstudio.com
- Install **Git** (run `git --version`, macOS may offer Command Line Tools)
- Install **Docker Desktop** from https://docker.com/products/docker-desktop and start it

Verify in Terminal:

```bash
node -v
npm -v
python3 --version
git --version
docker --version
```

## 2. Extract and open

Download ZIP, unzip it in Downloads, then move `pantrychef` to Desktop. In Terminal:

```bash
cd ~/Desktop/pantrychef
code .
```

If `code` isn't found, open VS Code → File → Open Folder → `pantrychef`.

## 3. Start PostgreSQL

```bash
cd ~/Desktop/pantrychef
docker compose up -d db
docker compose ps
```

Copy configuration:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

For a database-free quick test, edit `backend/.env` and replace DATABASE_URL with `sqlite:///./pantrychef.db`.

## 4. Run Python backend (Terminal A)

```bash
cd ~/Desktop/pantrychef/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs. Test `GET /recipes` using the interactive docs.

## 5. Run Next.js (Terminal B)

```bash
cd ~/Desktop/pantrychef/frontend
npm install
npm run dev
```

Open http://localhost:3000. Search for `pasta`, open a recipe, change servings, and try the conversion toggle.

## 6. Enable user accounts

Create a free Supabase project. Copy its Project URL and anon/publishable key into `frontend/.env.local`. Put the Project URL into `backend/.env`. Configure JWT signing to **RS256 or ES256** (not legacy HS256) so FastAPI can verify tokens through JWKS. Enable email/password authentication and set local site/redirect URLs. Restart both servers. Create an account at `/signup`, confirm your email if required, then log in at `/login`. Save a recipe, add pantry items, and test the shopping list. A 401 usually means missing or incompatible JWT configuration; a 503 means Supabase URL isn't configured.

## 7. Enable AI

Create an OpenAI API key with billing enabled. Put it in **backend/.env only** as `OPENAI_API_KEY=...`. Restart FastAPI. Open a recipe and ask a substitution question. If you see a 503, the key isn't configured. If you see a 502, check backend logs and API billing/model access. Do not deploy the AI endpoint publicly without authentication and rate limiting.

## 8. Run checks

```bash
cd ~/Desktop/pantrychef/backend
source .venv/bin/activate
python -m pytest -q
cd ../frontend
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

For Playwright, keep backend running in another terminal.

## 9. Push to GitHub

Create empty public repo `pantrychef` on https://github.com/new. Then:

```bash
cd ~/Desktop/pantrychef
git init
git branch -M main
git status
git add .
git commit -m "feat: PantryChef full-stack starter"
git remote add origin https://github.com/YOUR_USERNAME/pantrychef.git
git push -u origin main
```

GitHub may open browser authentication. Never upload your real `.env` files. After every update: `git add . && git commit -m "describe change" && git push`.

## 10. Deploy

1. Create a managed PostgreSQL database and copy its secure connection URL into Render's `DATABASE_URL`.
2. Connect GitHub repo to Render Web Service. Root directory `backend`. Build: `pip install -r requirements.txt`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Set Render variables `DATABASE_URL`, `FRONTEND_ORIGIN`, `SUPABASE_URL`, and optionally `OPENAI_API_KEY`. Start with AI disabled publicly until rate limiting and auth are added.
4. Connect GitHub repo to Vercel. Set root directory to `frontend` and environment variables `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
5. Set `FRONTEND_ORIGIN` in Render to the exact deployed Vercel URL. Redeploy.
6. Update Supabase Auth Site URL and allowed redirect URLs for the Vercel domain.
7. Visit the deployed homepage, open recipes, test login, save, pantry and shopping features. Confirm no API secrets appear in GitHub or browser network requests.

## 11. Interview preparation

Explain the Next.js client components, FastAPI route design, SQLAlchemy models, JWT verification, user data isolation, API error handling, and deployment. Only claim features you have personally verified. Keep screenshots and GitHub commit history as evidence.

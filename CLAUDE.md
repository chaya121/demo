# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Apparel Creations" — a Thai-language garment production tracking app. Factory staff (Mer / production / sales) fill out a "production step sheet" (ใบขั้นตอนการผลิต) per job, print/share it as PDF, and manage master data (brands, sewing steps, machines, etc.) used as dropdown options. There is no authentication — anyone with the URL can read/edit/delete everything.

## Commands

```bash
npm install              # install deps (root package.json covers frontend + backend)
npm run dev               # runs frontend (Vite, :5173) and backend (Express, :3001) concurrently
npm run dev:client        # frontend only
npm run dev:server        # backend only (node --env-file=backend/.env backend/index.js)
npm run build              # vite build -> frontend/dist
npm start                  # NODE_ENV=production node backend/index.js (serves frontend/dist + /api)
npm run preview            # build then start, i.e. a local production smoke test
```

There is no test suite. `npm run lint` is currently broken — the repo has no `eslint.config.js` (ESLint 10 requires flat config; the old-style config is missing), so lint will fail with "couldn't find an eslint.config.js file" until one is added.

Local dev needs `backend/.env` (see `.env.example`) with at minimum `DATABASE_TYPE` and, if using Postgres locally, `DATABASE_URL`. Without `DATABASE_URL`, the backend falls back to a local SQLite file at `database/app.db` (via sql.js).

## Architecture

**Two deploy targets share one Express app.** `backend/index.js` exports the Express `app`. Locally (`npm start`) it calls `app.listen()` directly and also serves the built `frontend/dist` as static files for any non-`/api` route. On Vercel, `api/index.js` just re-exports the same `app` as a serverless function, and `vercel.json` rewrites `/api/*` → the function and everything else → `frontend/dist/index.html`. Any change to request handling in `backend/index.js` applies to both paths automatically — there's no separate Vercel-specific handler.

**Dual database backend, chosen by `DATABASE_TYPE` env var**, implemented entirely in `backend/db.js`:
- `postgresql` (Supabase) — required in production/Vercel. `db.js` throws at import time if `VERCEL=1` and `DATABASE_TYPE !== 'postgresql'` or `DATABASE_URL` is missing — this is a hard guard against silently using SQLite (which is stateless/read-only on serverless) in production.
- `sqlite` (via `sql.js`, an in-memory WASM engine) — local dev fallback. The whole DB is a single file (`database/app.db`) that gets fully re-serialized to disk (`persist()`) after every write. This does not scale and is not meant to run in production.

Every exported function in `db.js` (`getAllRecords`, `createRecord`, `updateRecord`, etc.) branches internally on `databaseType`/`pgPool` to do the Postgres thing or the SQLite thing — when changing data-access logic, both branches need the equivalent change, including matching SQL semantics (e.g. JSONB vs TEXT+JSON.parse, `NOW()` vs `datetime('now')`).

**Two tables, no foreign keys**: `records` (one row per production job, `data` is a JSON blob of the whole form) and `master` (a single row, `id=1`, whose `data` JSON holds the arrays of dropdown options: mers, brands, clothingTypes, parts, steps, machines). The frontend's "type a new option and hit ➕ เพิ่ม" flow writes directly into this `master.data` JSON via `PUT /api/master` — it does not require visiting the Master Data tab first.

**Job numbers are generated server-side**, never client-side: `buildJobNoParts` + `generateJobNumberPg`/`generateJobNumberSqlite` in `db.js` produce `DDMMYYYY<merCode><runNumber>` (e.g. `11082026J004`), where the running number is a per-calendar-year counter stored in a separate `job_counters` table and incremented atomically via `INSERT ... ON CONFLICT DO UPDATE` (no advisory locks, no scanning existing rows).

**List vs. detail responses differ in shape.** `GET /api/records` (used for the history table) strips the `imgs` field and adds a `hasImages` boolean via `stripImages()`, to avoid shipping potentially large base64 image blobs on every list load. `GET /api/records/:id` returns the full record including `imgs`. The frontend (`App.jsx`'s `withHasImages`) re-derives `hasImages` locally after create/update calls (which return the full record) so the in-memory `records` array stays consistently shaped whichever endpoint populated it.

**Frontend is one big stateful `App.jsx`** (~550 lines) holding all records/master data/form state in React state (no Redux/Context/router library), and switching between tabs by rendering `FormPage` / `DownloadPage` / `StatsPage` / `MasterPage` conditionally based on `activeTab`. `frontend/src/api/client.js` is a thin fetch wrapper (`API_BASE` defaults to `/api`, overridable via `VITE_API_URL` for split frontend/backend deploys) plus a one-time `migrateFromLocalStorage()` used to import data from an older localStorage-only version of the app into the server DB.

**PWA**: configured via `vite-plugin-pwa` in `vite.config.js` (manifest, icons, `registerType: 'autoUpdate'`). `index.html` sets `viewport-fit=cover`, so any fixed/sticky top-of-page UI must reserve `env(safe-area-inset-top)` padding itself — nothing does this globally.

**No Supabase client in the frontend.** `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` exist as env vars but are currently unused in frontend code — the frontend only ever talks to the Express backend's `/api/*` routes, which in turn uses `DATABASE_URL` (a plain Postgres connection string) to reach Supabase's Postgres. Don't assume a `@supabase/supabase-js` client exists anywhere.

## Git workflow for this repo

Every fix should be pushed, opened as a PR against `master`, and merged into `master` immediately (per standing user instruction) — don't leave PRs open waiting for review in this repo.

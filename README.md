# Cyphertrade App

Next.js 14 UI for Cyphertrade. It authenticates against the API, manages trading accounts / bots, and displays dashboard, screener, trades, and orders.

It does **not** run trading crons or talk to Upstox. All of that is [cyphertrade-api](../cyphertrade-api).

---

## 1. Introduction

| Item | Value |
|---|---|
| Stack | Next.js 14, React 18, TypeScript, Tailwind, TanStack Query, Zustand |
| Default local URL | `http://localhost:3000` |
| API it calls | `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`) |

Browser storage holds the Sanctum token. Every API request sends `Authorization: Bearer …`.

---

## 2. Application flow

1. Open `/` → redirect to `/dashboard` if already signed in, else `/login`.
2. Sign in → `POST {API}/auth/login`.
3. Create or select a **trading account** → **Connect terminal** (Upstox OAuth). Until this succeeds, the dashboard shows a terminal-off banner and the API skips order jobs.
4. Create an **active bot** (strategy, `per_trade_limit`, `max_investment_limit`).
5. Use the rest of the UI while the API crons run the session:

| Route | Purpose |
|---|---|
| `/dashboard` | KPIs, market status, OAuth banner. “Live Market” polls the API every 3s; those prices come from the API’s once-a-minute REST cron and are display only. Entry uses a separate REST quote at place time. |
| `/trading-accounts` | Broker accounts + OAuth |
| `/bots` | Strategy bots and capital limits |
| `/screener` | Scan output |
| `/instruments` | Instrument list |
| `/orders` / `/trades` | Today’s activity |
| `/strategies` | Strategy catalogue |
| `/users` / `/roles` | Admin |

---

## 3. Dependent project

This app **requires a running API**.

| Repo | Role |
|---|---|
| [`cyphertrade-api`](../cyphertrade-api) | Laravel API, MySQL, Redis, Horizon, crons |
| **This repo** (`cyphertrade-app`) | UI only |

Keep the folders as siblings:

```text
parent/
  cyphertrade-api/
  cyphertrade-app/     ← you are here
```

**Setup of the API (DB, migrate, seed, Horizon, crons)** is documented in [cyphertrade-api/README.md](../cyphertrade-api/README.md). Start the API first, or use `cyphertrade-api/setup.sh`, which also starts this app.

This repo’s `./setup.sh` is a wrapper: it runs `../cyphertrade-api/setup.sh` with the same arguments.

Set the API URL in `.env.local` (and `.env.docker` for compose):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

`NEXT_PUBLIC_*` is baked in at **dev-server / build** time. Change it, then restart (or rebuild) the web container.

---

## 4. Installation

### 4.1 Podman or Docker (local recommended)

**Need:** Podman **or** Docker, plus compose. Install the **API stack first** (or run install from the API repo).

From **either** repo:

```bash
# from cyphertrade-api (starts API + this app)
./setup.sh install

# equivalent, from this repo
./setup.sh install
```

After that:

```bash
./setup.sh start | stop | restart | status
./setup.sh rebuild app    # after Dockerfile.dev / dependency changes
./setup.sh logs app
```

Dev container name: `cyphertrade-web-dev`. Port: **3000** (`WEB_PORT` in `.env.docker`).

Copy `.env.docker.example` → `.env.docker` if it was not created automatically.

### 4.2 Without Podman / Docker

**Need:** Node.js 20, a running Cyphertrade API on a URL the browser can reach.

```bash
cd cyphertrade-app
cp .env.docker.example .env.local   # or create .env.local yourself
# .env.local must contain:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

npm install
npm run dev
```

Open http://localhost:3000.

**Production-style on a VM (still no Docker):**

```bash
npm ci
npm run build
NODE_ENV=production PORT=3000 npm run start
```

Put Nginx/Caddy in front if you need TLS. The browser must be allowed to call the API origin (API CORS currently allows all origins).

---

## 5. Cron list

**None in this repo.** Scheduler, Horizon, and order jobs run in `cyphertrade-api`.

See [cyphertrade-api/README.md](../cyphertrade-api/README.md) sections **Cron list** and **How to run a cron**.

If the UI looks empty in the morning: terminal off, scanner not run, or bot inactive — those are API/ops issues, not Next.js.

---

## 6. Daily useful commands

```bash
# From this repo (delegates to API setup.sh)
./setup.sh status
./setup.sh logs app

# Inside the web container
podman exec -it cyphertrade-web-dev sh
podman exec cyphertrade-web-dev npm run lint

# On the host (no Docker)
npm run dev
npm run lint
npm run build
```

Sign-in after API seed: `test@example.com` / `password` — the API user still needs an `admin` or `trader` role (see API README).

---

## 7. How to run a cron

Not applicable here. From the API container:

```bash
podman exec --user www-data cyphertrade-api-dev php artisan cron:run "app:sync-market-data LiveMarketQuotes"
```

Full list and `./crons.sh`: [cyphertrade-api/README.md](../cyphertrade-api/README.md#7-how-to-run-a-cron).

---

## 8. Also worth knowing

- **Terminal off:** dashboard banner “Connect terminal” → `/trading-accounts/{id}/edit` (or the accounts list). Complete OAuth before 09:15 IST.
- **Account switcher** in the top bar scopes dashboard/bots to one account or all accounts.
- If the UI loads but every request 401s: token expired or API down. Sign in again; confirm `NEXT_PUBLIC_API_URL` matches the running API.
- If the UI loads but data is empty: API is up, but scanners/bots/OAuth may not be.

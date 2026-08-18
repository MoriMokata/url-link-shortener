# gul.fy — URL Link Shortener

A full-stack URL shortener: create short links (auto-generated or custom alias), redirect visitors to a platform-aware destination (iOS/Android overrides), track click stats, and disable/delete links. Backend is ASP.NET Core (.NET 8, layered/clean-lite architecture); frontend is React + TypeScript (Vite).

See [`ai-logs/DESIGN.md`](ai-logs/DESIGN.md) for the requirement summary and design rationale, [`ai-logs/ARCHITECTURE.md`](ai-logs/ARCHITECTURE.md) for diagrams (sequence, ER, component, deployment), and [`TASKS.md`](TASKS.md) for the implementation task board. An AI session log is at [`ai-logs/session-log.md`](ai-logs/session-log.md).

## Project structure

```
backend/
  Gulfy.Api/             ASP.NET Core Web API — controllers, Program.cs, DI wiring
  Gulfy.Application/     Use-cases (ShortLinkService), DTOs, ports (interfaces), validation
  Gulfy.Domain/          ShortLink entity, Platform/ShortCodeSource enums — no framework deps
  Gulfy.Infrastructure/  In-memory repository, short-code generators, platform resolver
  Gulfy.Tests/           xUnit unit tests (79 tests) covering Domain/Application/Infrastructure
frontend/
  src/
    api/                 Typed fetch client (apiClient.ts, links.ts)
    components/          LinkForm, LinkTable, StatTile, CopyButton, QrCodeButton/Panel, ...
    hooks/                useLinkMutations (disable/enable/delete + React Query cache invalidation)
    pages/                CreateLinkPage, DashboardPage, LinkDetailPage
    types/                ShortLink, CreateShortLinkRequest
ai-logs/                 Design docs, UI mockups, and the AI session log
```

## Prerequisites

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm

## Running locally

Two terminals — backend and frontend each run their own dev server.

**Backend** (Kestrel on `http://localhost:5001`):

```bash
cd backend
dotnet run --project Gulfy.Api
```

Swagger UI is available at `http://localhost:5001/swagger` in Development.

**Frontend** (Vite dev server on `http://localhost:5173`, proxies `/api/*` to the backend):

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Data is stored **in-memory** in the backend process — it resets whenever the API restarts (see [Known limitations](#known-limitations)).

## Running tests

**Backend** (xUnit):

```bash
cd backend
dotnet test
```

**Frontend** (Vitest + React Testing Library, component tests for `LinkForm` and `LinkTable`):

```bash
cd frontend
npm test
```

Frontend build/lint checks:

```bash
cd frontend
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## API contract

Base URL: `http://localhost:5001`. Errors follow [RFC 7807 ProblemDetails](https://www.rfc-editor.org/rfc/rfc7807) (`{ title, status, detail, instance }`).

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/links` | `{ originalUrl, customAlias?, platformDestinations?: { ios?, android? } }` | Create a short link. `400` on invalid URL/alias, `409` if the alias is taken. |
| `GET` | `/api/links` | — | List all (non-deleted) links. |
| `GET` | `/api/links/{code}` | — | Get one link's detail/stats. `404` if missing or deleted. |
| `PATCH` | `/api/links/{code}/disable` | — | Disable (stops redirecting; data kept). |
| `PATCH` | `/api/links/{code}/enable` | — | Re-enable a disabled link. |
| `DELETE` | `/api/links/{code}` | — | Permanently delete (disappears from list/detail too). |
| `GET` | `/{code}` | — | **Root-level** redirect. `302` to the resolved destination, `404` if missing/disabled/deleted. Records the click. |

Example response (`POST /api/links`):

```json
{
  "shortCode": "HsQy5",
  "shortUrl": "http://localhost:5001/HsQy5",
  "originalUrl": "https://www.google.co.th",
  "customAlias": null,
  "source": "Auto",
  "isDisabled": false,
  "clickCount": 0,
  "createdAt": "2026-08-18T07:00:00Z",
  "lastAccessedAt": null,
  "platformDestinations": {}
}
```

## Key design decisions

- **Layered/clean-lite architecture** — `Domain` has no dependencies; `Application` defines ports (`IShortLinkRepository`, `IShortCodeGenerator`, `ICustomAliasGenerator`, `IPlatformResolver`) and the `ShortLinkService` use-case; `Infrastructure` is the only layer that knows concrete implementations; `Api` controllers stay thin. See `ai-logs/ARCHITECTURE.md` §2.
- **Pluggable short-code generation (Strategy pattern)** — `RandomBase62ShortCodeGenerator` (7-char base62, retries on collision) and `CustomAliasShortCodeGenerator` (format + uniqueness validation) both implement small, single-purpose interfaces. A third strategy (e.g. dictionary words) is a new class, not a change to existing code.
- **Server-side platform resolution** — `IPlatformResolver` reads the `User-Agent` header at redirect time (not a client-supplied query param), so the decision can't be spoofed by the browser and needs no client-side JS.
- **Repository abstraction over in-memory storage** — `IShortLinkRepository` is implemented today by `InMemoryShortLinkRepository` (`ConcurrentDictionary`); a DB-backed implementation (EF Core/Postgres) can satisfy the same interface with zero changes to `Application`/`Domain`.
- **Thread-safe click counting** — concurrent redirects for the same code are serialized via a per-link lock in `RecordVisitAsync`, so increments are never lost under load (covered by a concurrency test in `InMemoryShortLinkRepositoryTests`).
- **Deletion is permanent and visible** — a deleted link is filtered out of `GetAll`/`GetByCode` (not just redirect resolution), so it actually disappears from the dashboard, not just stops redirecting.
- **ProblemDetails error convention** — a single `IExceptionHandler` (`ApplicationExceptionHandler`) maps three typed Application exceptions to `400`/`404`/`409`, keeping controllers free of try/catch.

## Known limitations

- **In-memory storage** — link data lives only in the API process's memory; it is lost on restart and does not scale beyond a single instance. The repository seam (`IShortLinkRepository`) is designed so swapping in a real database later doesn't touch business logic.
- **No authentication** — all links are visible/manageable by anyone who can reach the API (out of scope per the assignment).
- **Simple UA-based platform detection** — substring matching on `User-Agent`, not a full device-detection library; easy to swap behind `IPlatformResolver` if needed.

## Possible next steps

Auth + per-user link ownership, rate limiting on link creation, link expiration, a real database (Postgres via EF Core) behind `IShortLinkRepository`, richer analytics (geo/referrer), and a caching layer in front of the hot redirect-lookup path.

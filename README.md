# gul.fy — URL Link Shortener

Full-stack take-home assignment: a URL shortener where a user submits a long URL
(optionally with a custom alias and per-platform destinations), gets back a short
link, and can track clicks / disable / delete it from a dashboard.

- **Backend**: .NET 8, layered/clean-lite architecture (Domain/Application/Infrastructure/Api), in-memory storage
- **Frontend**: React 19 + TypeScript (Vite), React Router, React Query

## Quick start

```bash
# Backend (needs .NET 8 SDK)
cd backend
dotnet run --project Gulfy.Api            # serves API + Swagger at /swagger, http://localhost:5001

# Frontend (needs Node 20+), in a second terminal
cd frontend
npm install
npm run dev                                # http://localhost:5173
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for architecture, the full API contract, design decisions, and test commands. Design notes and architecture diagrams live in [`ai-logs/DESIGN.md`](ai-logs/DESIGN.md) and [`ai-logs/ARCHITECTURE.md`](ai-logs/ARCHITECTURE.md); the AI session log is at [`ai-logs/session-log.md`](ai-logs/session-log.md); the task board is [`TASKS.md`](TASKS.md).

## Test

```bash
# Backend — xUnit (79 specs)
cd backend
dotnet test

# Frontend — Vitest + React Testing Library (9 specs), in a second terminal
cd frontend
npm test
```

## Data model

One entity, `ShortLink`, with an optional per-platform override map:

- **ShortLink**: `Id`, `ShortCode` (unique), `OriginalUrl` (default destination), `CustomAlias` (nullable), `Source` (`Auto` | `CustomAlias`), `IsDisabled`, `IsDeleted`, `ClickCount`, `CreatedAt`, `LastAccessedAt` (nullable)
- **PlatformDestinations**: `Dictionary<Platform, string>` on the entity — `Platform` is `Default` | `Ios` | `Android`; only `Ios`/`Android` overrides are stored, `Default` always falls back to `OriginalUrl`

Storage is in-memory (`ConcurrentDictionary`, process lifetime only) behind `IShortLinkRepository`, so a real database can be swapped in later without touching `Application`/`Domain` — see [`ai-logs/ARCHITECTURE.md`](ai-logs/ARCHITECTURE.md) §5 for the normalized ER shape this is designed to map onto.

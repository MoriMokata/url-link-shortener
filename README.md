# gul.fy — URL Link Shortener

Full-stack take-home assignment: a URL shortener where a user submits a long URL
(optionally with a custom alias and per-platform destinations), gets back a short
link, and can track clicks / disable / delete it from a dashboard.

- **Backend**: .NET 8, layered/clean-lite architecture (Domain/Application/Infrastructure/Api), in-memory storage
- **Frontend**: React 19 + TypeScript (Vite), React Router, React Query

## Quick start

```bash
# Backend (needs .NET 8 SDK) — generated short links point at https://gul.fy:5001,
# see "Local domain mapping" below to make that actually resolve on your machine.
cd backend
dotnet run --project Gulfy.Api --launch-profile https   # API + Swagger at /swagger

# Frontend (needs Node 20+), in a second terminal
cd frontend
npm install
npm run dev                                # http://localhost:5173
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for architecture, the full API contract, design decisions, and test commands. Design notes and architecture diagrams live in [`ai-logs/DESIGN.md`](ai-logs/DESIGN.md) and [`ai-logs/ARCHITECTURE.md`](ai-logs/ARCHITECTURE.md); the AI session log is at [`ai-logs/session-log.md`](ai-logs/session-log.md); the task board is [`TASKS.md`](TASKS.md).

## Local domain mapping (`gul.fy`)

The backend's `ShortUrl:BaseUrl` (`backend/Gulfy.Api/appsettings.json`) is set to
`https://gul.fy:5001`, so every generated short link is displayed as
`https://gul.fy:5001/{code}`. That hostname isn't a real DNS record — it only
resolves on a machine that's been set up for it:

1. **Map the hostname to loopback** — edit the hosts file **as Administrator**
   (`C:\Windows\System32\drivers\etc\hosts` on Windows) and add:
   ```
   127.0.0.1   gul.fy
   ```
2. **Trust the local HTTPS dev certificate** (once per machine):
   ```bash
   dotnet dev-certs https --trust
   ```
3. **Run the backend with the `https` launch profile** (binds both
   `https://gul.fy:5001` and `https://localhost:5001` — see Quick start above).

The dev certificate's CN is `localhost`, not `gul.fy`, so the browser will still
show a certificate warning when you open a `gul.fy` link — click through
"Advanced → Proceed" (this is expected, not a bug; see `backend/README.md`
for how to get a warning-free cert with `mkcert`).

**None of this is required to run or grade the project** — the API, Swagger,
and every feature work identically over plain `http://localhost:5001` (use
`dotnet run --project Gulfy.Api --launch-profile http`, or revert
`ShortUrl:BaseUrl` to `http://localhost:5001`). The `gul.fy` mapping is purely
cosmetic, to make short links display and open like the ones in the original
UI mockups (`ai-logs/UI/`).

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

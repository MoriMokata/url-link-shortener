# Backend — gul.fy API

.NET 8 Web API implementing the URL shortener's core journeys: create a short
link (auto-generated or custom alias), redirect visitors to a platform-aware
destination while tracking clicks, and disable/delete links.

## Architecture

Layered/clean-lite architecture, 4 layers + tests:

```
Gulfy.Domain            ShortLink entity, Platform/ShortCodeSource enums — no framework deps
Gulfy.Application       DTOs, service interfaces (ports), ShortLinkService, validation, exceptions
Gulfy.Infrastructure    In-memory repository, short-code generators, User-Agent platform resolver
Gulfy.Api               Controllers, DI wiring, ProblemDetails exception handling, Swagger, CORS
Gulfy.Tests             xUnit unit tests (79 specs) covering Domain/Application/Infrastructure
```

`Domain` has no dependencies; `Application` only sees interfaces
(`IShortLinkRepository`, `IShortCodeGenerator`, `ICustomAliasGenerator`,
`IPlatformResolver`); `Infrastructure` is the only layer that knows concrete
implementations. See [`../ai-logs/ARCHITECTURE.md`](../ai-logs/ARCHITECTURE.md)
for diagrams.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)

## Run

```bash
cd backend
dotnet run --project Gulfy.Api
```

The API starts on `http://localhost:5001` (see
`Gulfy.Api/Properties/launchSettings.json`) and serves Swagger UI at
`/swagger`. Storage is in-memory — data resets whenever the process restarts.

By default the API allows CORS requests from `http://localhost:5173` (the
Vite dev server). Override via the `Cors:AllowedOrigins` setting in
`appsettings.json` if needed. The `shortUrl` returned in responses is built
from `ShortUrl:BaseUrl` in the same file.

## Test

```bash
cd backend
dotnet test
```

## Endpoints

Errors follow [RFC 7807 ProblemDetails](https://www.rfc-editor.org/rfc/rfc7807) (`{ title, status, detail, instance }`).

| Method | Route | Description |
|---|---|---|
| POST | `/api/links` | Create a short link — `{ originalUrl, customAlias?, platformDestinations?: { ios?, android? } }`. `400` invalid URL/alias, `409` alias taken |
| GET | `/api/links` | List all (non-deleted) links |
| GET | `/api/links/{code}` | Get one link's detail/stats. `404` if missing or deleted |
| PATCH | `/api/links/{code}/disable` | Disable — stops redirecting, data kept |
| PATCH | `/api/links/{code}/enable` | Re-enable a disabled link |
| DELETE | `/api/links/{code}` | Permanently delete — also disappears from list/detail |
| GET | `/{code}` | **Root-level** redirect. `302` to the resolved destination, `404` if missing/disabled/deleted. Records the click |

## Design decisions

- **Pluggable short-code generation (Strategy pattern)** — `RandomBase62ShortCodeGenerator` (7-char base62, retries on collision) and `CustomAliasShortCodeGenerator` (format + uniqueness validation) each implement a small, single-purpose interface. A new strategy (e.g. dictionary words) is a new class, not a change to existing code.
- **Server-side platform resolution** — `IPlatformResolver` reads the `User-Agent` header at redirect time rather than trusting a client-supplied value, so the decision can't be spoofed and needs no client-side JS.
- **Repository abstraction over in-memory storage** — `IShortLinkRepository` is implemented today by `InMemoryShortLinkRepository` (`ConcurrentDictionary`); a DB-backed implementation (EF Core/Postgres) can satisfy the same interface with zero changes to `Application`/`Domain`.
- **Thread-safe click counting** — concurrent redirects for the same code are serialized via a per-link lock in `RecordVisitAsync`, so increments are never lost under load (covered by a concurrency test).
- **Deletion is permanent and visible** — a deleted link is filtered out of list/get, not just redirect resolution, so it actually disappears from the dashboard.

## Known limitations

- In-memory storage only — no persistence across restarts, single instance only.
- No authentication — out of scope for this assignment.
- Platform detection is substring-matching on `User-Agent`, not a full device-detection library.

## Possible next steps

Auth + per-user link ownership, rate limiting on link creation, link
expiration, a real database (Postgres via EF Core) behind
`IShortLinkRepository`, richer analytics (geo/referrer), and a caching layer
in front of the hot redirect-lookup path.

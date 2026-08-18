# Frontend — gul.fy

React 19 + TypeScript (Vite) app for the URL shortener: create a short link,
browse/search all links on a dashboard with stats, and view/manage a single
link's detail (disable, delete, QR code).

## Prerequisites

- Node.js 20+ and npm
- The backend API running (see `../backend/README.md`)

## Setup

```bash
cd frontend
npm install
```

If your backend runs on a different origin than `http://localhost:5001`,
update the proxy target in `vite.config.ts`.

## Run

```bash
npm run dev
```

Opens the dev server at `http://localhost:5173` (proxies `/api/*` to the backend).

## Test

```bash
npm test
```

Runs the Vitest + React Testing Library component tests (`LinkForm`
validation, `LinkTable` rendering).

## Build

```bash
npm run build   # tsc -b && vite build
npm run lint    # oxlint
```

## Structure

```
src/
├── api/                  apiClient.ts (fetch wrapper + ProblemDetails errors), links.ts (typed calls)
├── types/                ShortLink, CreateShortLinkRequest
├── hooks/                useLinkMutations — disable/enable/delete + React Query cache invalidation
├── components/
│   ├── LinkForm.tsx           originalUrl / customAlias / platform overrides, client-side validation
│   ├── LinkTable.tsx          desktop table + mobile card list, row actions
│   ├── StatTile.tsx           stat tile used on the dashboard and detail page
│   ├── CopyButton.tsx         copy-to-clipboard with a toast
│   ├── QrCodeButton.tsx       popover QR code (table rows)
│   ├── QrCodePanel.tsx        permanent QR panel with PNG download (detail page)
│   └── AppHeader.tsx          nav bar
├── pages/
│   ├── CreateLinkPage.tsx     form + post-create result panel
│   ├── DashboardPage.tsx      stat tiles, search/filter, link table, mobile FAB
│   └── LinkDetailPage.tsx     stats, detail card, platform destinations, QR panel
└── App.tsx                    React Router: "/", "/dashboard", "/links/:code"
```

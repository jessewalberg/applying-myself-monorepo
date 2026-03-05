# Extension Development Guide

## Daily workflow

### 1. Start dev server
```bash
bun run dev
```

WXT dev mode handles rebuild/reload for extension entrypoints.

### 2. Load unpacked extension
In Chrome, load:
- `apps/extension/dist/chrome-mv3-dev`

### 3. Validate before PR
```bash
bun run lint
bun run type-check
bun run build:dev
bun run build:staging
bun run build:prod
```

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | WXT dev mode (`development`) |
| `bun run build:dev` | Build dev artifact |
| `bun run build:staging` | Build staging artifact |
| `bun run build:prod` | Build production artifact |
| `bun run zip` | Build + zip production |
| `bun run check-config` | Show shared runtime config status |
| `bun run update-config <url> <env>` | Update shared Convex URL mapping |

## Structure

- Entrypoints: `entrypoints/`
- UI/features: `src/features/`
- Contracts + adapters: `src/core/`
- Shared app services: `src/services/`

## Environment behavior

Build mode drives runtime config selection:
- `development`
- `staging`
- `production`

Manifest name/title, host permissions, and endpoints are mode-aware via `wxt.config.ts` + `src/config.ts`.

## Common troubleshooting

### Build can’t resolve alias imports
Run:
```bash
bun run type-check
```
and verify imports use configured aliases or relative paths.

### Auth errors in popup
- Confirm Convex URL in shared runtime config.
- Rebuild target environment.
- Reload extension in Chrome.

### Content extraction fails on site
- Ensure host page is HTTPS.
- Check content script logs in Chrome extension inspector.

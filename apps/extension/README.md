# Applying Myself Chrome Extension

AI-powered cover letter generator Chrome extension backed by Convex.

## Stack
- Runtime/UI: React + TypeScript
- Build/dev tooling: WXT (Vite-powered)
- Package manager: Bun
- Shared contracts/config: `@app/convex-client`, `@app/runtime-config`

## Setup

### 1. Install dependencies
```bash
bun install
```

### 2. Verify runtime config
```bash
bun run check-config
```

### 3. Build by environment
```bash
bun run build:dev
bun run build:staging
bun run build:prod
```

### 4. Load extension in Chrome
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click Load unpacked
4. Select one of:
- `apps/extension/dist/chrome-mv3-dev`
- `apps/extension/dist/chrome-mv3-staging`
- `apps/extension/dist/chrome-mv3`

## Development

### Start dev mode
```bash
bun run dev
# or
bun start
```

### Quality checks
```bash
bun run lint
bun run type-check
bun run build:dev
```

### Packaging
```bash
bun run zip
bun run zip:staging
bun run zip:prod
```

Zips are emitted into `apps/extension/dist/`.

## Architecture

### Entrypoints
- `entrypoints/popup/*`
- `entrypoints/background.ts`
- `entrypoints/content.ts`

### Core modules
- `src/core/contracts` for message contracts
- `src/core/storage` for typed storage schema/access
- `src/core/chrome` for browser API adapters
- `src/core/convex` for domain API clients

### Feature modules
- `src/features/auth`
- `src/features/generate`
- `src/features/history`
- `src/features/settings`

## Runtime config
Use shared runtime config update script:
```bash
bun run update-config <convex-url> <development|staging|production>
```

## Notes
- Options page surface was removed.
- Manifest is generated from `wxt.config.ts`.
- Backend API remains sourced from monorepo Convex app.

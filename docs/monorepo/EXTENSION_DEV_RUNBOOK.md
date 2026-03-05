# Extension Dev Runbook

This runbook is the single source for running, testing, and developing the Chrome extension in this monorepo, including how to keep Convex in sync across backend, web, and extension.

## What lives where

- Convex backend functions: `apps/convex/convex`
- Web app: `apps/web`
- Chrome extension (WXT): `apps/extension`
- Shared runtime URLs/env mapping: `packages/runtime-config`
- Shared Convex API entrypoint for clients: `packages/convex-client`

## Prerequisites

- Bun `1.3.10+`
- Convex account + CLI auth (`bunx convex login`)
- Clerk application configured for web + extension origins
- Chrome browser with Developer Mode enabled

## One-time setup

From repo root:

```bash
bun install
```

Sanity check extension runtime config:

```bash
bun run --cwd apps/extension check-config
```

Required auth env vars (web + extension + Convex):

```bash
# Web + extension frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Web server
CLERK_SECRET_KEY=sk_...

# Convex auth provider mapping
CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-domain>
CLERK_JWT_AUDIENCE=convex

# Extension Clerk sync/host settings
EXTENSION_CLERK_SYNC_HOST=https://applyingmyself.com
EXTENSION_CLERK_FRONTEND_API_URL=https://<your-clerk-frontend-api>
EXTENSION_CLERK_JWT_TEMPLATE=convex
```

## Daily local development

Run these from repo root in separate terminals.

Terminal 1, start Convex:

```bash
bun run --cwd apps/convex dev
```

Terminal 2, start web app:

```bash
bun run --cwd apps/web dev
```

Terminal 3, start extension dev build:

```bash
bun run --cwd apps/extension dev
```

Load extension in Chrome:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select `apps/extension/dist/chrome-mv3-dev`

If the folder was already loaded, use `Reload` after code changes.

## Build and package extension

From repo root:

```bash
bun run --cwd apps/extension build:dev
bun run --cwd apps/extension build:staging
bun run --cwd apps/extension build:prod
```

Build output:

- Development: `apps/extension/dist/chrome-mv3-dev`
- Staging: `apps/extension/dist/chrome-mv3-staging`
- Production: `apps/extension/dist/chrome-mv3`

Zip packages:

```bash
bun run --cwd apps/extension zip:staging
bun run --cwd apps/extension zip:prod
```

## Testing and quality checks

Repo-level checks:

```bash
bun run check:api-contract
bun run lint
bun run typecheck
bun run build
```

Notes:

- `check:api-contract` validates `api.module.function` usage in web/extension against `apps/convex/convex`.
- `typecheck` includes web, extension, and convex.
- `build` includes web, extension, and convex (`apps/convex build` runs optional codegen based on `CONVEX_DEPLOYMENT`).

Extension-focused checks:

```bash
bun run --cwd apps/extension lint
bun run --cwd apps/extension type-check
bun run --cwd apps/extension build:prod
```

Convex tests:

```bash
bun run --cwd apps/convex test
```

Current state:

- There are no dedicated automated extension unit/e2e tests in this repo yet.
- Functional coverage for extension release is currently manual smoke testing.

## Convex sync flow for backend + web + extension

Use this whenever you change Convex functions, schema, or shared client contracts.

1. Update backend code in `apps/convex/convex`.
2. Run Convex codegen/dev in backend:

```bash
bun run --cwd apps/convex dev
# or one-off
bun run --cwd apps/convex codegen
```

3. Regenerate shared client shim:

```bash
bun run sync:convex-client
```

4. Validate client/backend contract references:

```bash
bun run check:api-contract
```

5. Re-run typechecks:

```bash
bun run typecheck
```

6. Rebuild apps that consume Convex:

```bash
bun run --cwd apps/web build
bun run --cwd apps/extension build:dev
```

## Keeping Convex URL aligned between web and extension

This repo has two URL paths to keep aligned:

- Web reads `NEXT_PUBLIC_CONVEX_URL` when set, otherwise falls back to `@app/runtime-config`.
- Extension reads `@app/runtime-config` based on build mode (`development`, `staging`, `production`).
- `apps/web/convex.json` and `apps/extension/convex.json` are CLI defaults only and are not the source of truth for deployed web runtime routing.

Update shared runtime URL mapping for extension and fallback web config:

```bash
bun run --cwd apps/extension update-config <convex-url> development
bun run --cwd apps/extension update-config <convex-url> staging
bun run --cwd apps/extension update-config <convex-url> production
```

Then verify:

```bash
bun run --cwd apps/extension check-config
```

For web, set `NEXT_PUBLIC_CONVEX_URL` in your local env when needed so web explicitly targets the same deployment as extension.

Staging reminder:
- If `NEXT_PUBLIC_CONVEX_URL` is not set in the staging deploy, staging will use the `staging` entry in `packages/runtime-config/src/index.js`.
- Keep that `staging` mapping pointed at a real Convex deployment and make sure that deployment has Clerk env configured (`CLERK_JWT_ISSUER_DOMAIN`, `CLERK_JWT_AUDIENCE`).

Current production deployment is `oceanic-retriever-344`:
- `https://oceanic-retriever-344.convex.site`

## Clerk auth + sync-host model

- Web and extension both authenticate with Clerk.
- Extension popup is wrapped with `@clerk/chrome-extension` `ClerkProvider`.
- Extension retrieves Clerk JWT template token (`convex`) and sets Convex auth from that token.
- Cross-surface SSO relies on Clerk sync-host configuration (`EXTENSION_CLERK_SYNC_HOST`).
- Legacy `/api/auth/extension-token` bridge route has been removed.

## Historical cutover scripts

The one-time Clerk cutover scripts were removed after migration completion.
Operational backups and resets should now be done with ad hoc, explicitly reviewed commands instead of reusable destructive scripts.

## Manual smoke checklist (recommended before release)

- Sign in/sign out in extension
- Extract job from a real job posting tab
- Upload resume and verify retrieval/download behavior
- Generate cover letter and verify content/history
- Open settings and verify account/profile flows

Optional smoke report script:

```bash
bun run smoke
```

This writes `docs/monorepo/SMOKE_REPORT.md`. The script references `docs/monorepo/SMOKE_CHECKLIST.md`, which is currently not present and should be added if you want a full scripted/manual hybrid checklist.

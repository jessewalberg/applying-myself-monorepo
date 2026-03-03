# Applying Myself Extension Setup Guide

## Quick setup

```bash
bun install
bun run check-config
bun run build:dev
```

Load unpacked from:
- `apps/extension/dist/chrome-mv3-dev`

## Development mode

```bash
bun run dev
# or
bun start
```

WXT handles rebuild and extension reload flow.

## Environment config updates

```bash
# Development
bun run update-config https://your-dev.convex.cloud development

# Staging
bun run update-config https://your-staging.convex.cloud staging

# Production
bun run update-config https://your-prod.convex.site production
```

## Build and package

```bash
bun run build:staging
bun run build:prod
bun run zip:staging
bun run zip:prod
```

## Validation before release

```bash
bun run lint
bun run type-check
bun run build:prod
```

Then verify in Chrome:
- login/logout
- extraction from active tab
- resume upload/download
- cover letter generation and download
- history/settings tabs

## Troubleshooting

### Build failures
- Run `bun install`.
- Run `bun run type-check` to regenerate WXT types and validate TS.

### Runtime/API failures
- Verify `bun run check-config` output.
- Rebuild target env and reload extension.

### Content extraction failures
- Ensure the page is HTTPS and fully loaded.
- Check content script logs via Chrome extension inspector.

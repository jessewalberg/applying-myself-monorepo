# Chrome Extension Deployment Checklist (WXT)

## Pre-deploy
- [ ] `bun install` completed
- [ ] Shared runtime config verified (`bun run check-config`)
- [ ] Production Convex URL set in shared runtime config
- [ ] `bun run lint` passes
- [ ] `bun run type-check` passes
- [ ] `bun run build:prod` passes
- [ ] Manual smoke checks pass in production build

## Package build
- [ ] Run `bun run zip:prod`
- [ ] Confirm zip exists under `apps/extension/dist/*.zip`
- [ ] (Optional) run `bun scripts/deploy.js production --zip`

## Chrome Web Store submission
- [ ] Upload production zip
- [ ] Verify listing metadata and screenshots
- [ ] Verify permissions justification
- [ ] Submit for review

## Functional smoke checklist
- [ ] Auth: sign in / sign out
- [ ] Extraction: active job page extraction works
- [ ] Resume: upload + download URL path works
- [ ] Cover letter: generation + copy/download works
- [ ] History: cover letters and jobs render
- [ ] Settings: profile load + logout
- [ ] Background analytics events are emitted

## Post-release
- [ ] Validate extension in fresh Chrome profile
- [ ] Monitor logs/feedback for extraction/auth regressions
- [ ] Update docs/changelog with version

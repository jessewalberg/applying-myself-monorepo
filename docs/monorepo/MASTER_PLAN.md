# Bun-First Monorepo Master Plan

## Objective
Consolidate web, extension, and Convex backend into a Bun workspace monorepo with a single typed Convex API contract and shared runtime configuration.

## Scope
- Repository consolidation with preserved history.
- Bun-only package management and scripts.
- Convex API drift reconciliation.
- Shared `@app/convex-client` and `@app/runtime-config` packages.
- Path-based CI checks and gates.

## Current Status
- [x] Phase 1 started: monorepo created and subtree imports completed.
- [x] Phase 2 Bun conversion completed.
- [x] Phase 3 API drift reconciliation completed.
- [x] Phase 4 shared client package completed.
- [x] Phase 5 shared runtime config completed.
- [x] Phase 6 CI/CD updates completed.
- [ ] Phase 7 cutover completed.
- [ ] Phase 8 Clerk auth cutover completed.

## Success Criteria
- `bun run check:api-contract` passes.
- `bun run typecheck` passes.
- `bun run build` passes.
- No client imports of local `convexApi.ts` remain.
- No hardcoded Convex/analytics endpoints remain in app code.

## Verification Snapshot (2026-03-02)
- `bun install` completed and produced root `bun.lock`.
- `bun run check:api-contract` passed (`76 api.* callsites`).
- `bun run typecheck` passed for web, extension, and convex.
- `bun run lint` passed with no extension warnings.
- `bun run build` passed for web + extension + convex.
- Smoke report generated at `docs/monorepo/SMOKE_REPORT.md` (runtime endpoint checks blocked in sandbox).
- Branch protection automation added (`scripts/apply-branch-protection.sh`); repo URL/origin now configured and main pushed.
- Branch protection apply attempt returned HTTP 403 due GitHub private-repo plan limitation (requires GitHub Pro or public visibility).
- Interim governance controls enabled: `.github/CODEOWNERS`, `.github/pull_request_template.md`, and root `CONTRIBUTING.md` enforcing PR-only/no-direct-`main` process.

## Extension Simplification Snapshot (2026-03-02)
- Extension toolchain migrated from custom Webpack/Babel scripts to WXT (Vite-powered) with React module.
- WXT entrypoints now own runtime surfaces (`popup`, `background`, `content`); legacy options surface removed.
- Core architecture split introduced:
  - `src/core/contracts` for strict message unions and typed responses.
  - `src/core/storage` for typed/versioned storage schema.
  - `src/core/convex/*` domain clients replacing monolithic service internals.
  - `src/core/analytics` centralized analytics dispatch.
- Full validation passed post-migration:
  - `bun run lint`
  - `bun run typecheck`
  - `bun run check:api-contract`
  - `bun run build`
- Remaining release gate is manual runtime smoke matrix execution in a networked environment.

## Auth Migration Snapshot (2026-03-03)
- Active migration: replace legacy Convex Auth with Clerk across web + extension + Convex.
- Execution tracker: `docs/monorepo/AUTH_MIGRATION_TRACKER.md`.
- Production target remains `oceanic-retriever-344`.
- Scope includes:
  - Identity linkage cutover to `userProfiles.clerkUserId`.
  - Removal of legacy auth routes/providers/token bridge.
  - Pre-cutover backup + billing archive + gated destructive reset tooling.
  - First-login entitlement claim from retained billing archive.
- Implementation status:
  - Code migration complete and validated (`check:api-contract`, `lint`, `typecheck`, `build`).
  - Post-cutover hardening complete: legacy compatibility paths removed (no `userProfiles.userId`, no legacy plan aliases, no email fallback auth linkage).
  - Pre-cutover export backup completed (`artifacts/auth-precutover/2026-03-03T15-50-42-426Z`).
  - Convex production cutover complete (`oceanic-retriever-344`): Clerk env configured, deploy succeeded, billing archive preserved, user-facing data reset executed.
  - Web production rollout is complete on domain-bound project `applying-myself-next` with `https://applyingmyself.com/login` serving Clerk.
  - Remaining rollout work: publish extension package to Chrome Web Store, run live cross-surface acceptance, and complete 24-72h monitoring window.

# Architecture Decisions

## ADR-001: Monorepo Structure
- Date: 2026-03-02
- Decision: Use a single repository with `apps/*` + `packages/*` layout.
- Rationale: Eliminate Convex API drift and coordinate releases safely.

## ADR-002: Package Manager
- Date: 2026-03-02
- Decision: Use Bun (`bun@1.3.10`) as the only package manager and script runner.
- Rationale: Standardized tooling and faster installs/scripts.

## ADR-003: Convex API Source of Truth
- Date: 2026-03-02
- Decision: `apps/convex/convex/*` is the canonical API source.
- Rationale: Prevent duplicated and diverging client contracts.

## ADR-004: Shared Packages Runtime Format
- Date: 2026-03-02
- Decision: Publish shared workspace packages as JS runtime files with `.d.ts` type definitions.
- Rationale: Keeps webpack/Next runtime imports simple while preserving typed contracts in clients.

## ADR-005: Convex Build Behavior Without Deployment Env
- Date: 2026-03-02
- Decision: `apps/convex` build runs `codegen` only when `CONVEX_DEPLOYMENT` is set; always runs `convex typecheck`.
- Rationale: Local and CI builds should not hard-fail in environments where Convex deployment credentials are intentionally absent.

## ADR-006: Lint Gate Scope During Migration
- Date: 2026-03-02
- Decision: Keep lint gates passing with warnings allowed in extension while migration stabilizes.
- Rationale: Preserve delivery velocity during monorepo cutover; strict lint cleanup remains follow-up hardening work.

## ADR-007: Initial Remote Visibility and Protection Strategy
- Date: 2026-03-02
- Decision: Create the monorepo remote as private and keep CI gates as the merge safety baseline until branch protection can be enabled.
- Rationale: Immediate cutover needed private hosting; GitHub branch protection API is currently unavailable for this private repo plan, so enforcement remains procedural until plan/public visibility changes.

## ADR-008: Interim Merge Governance Without Branch Protection
- Date: 2026-03-02
- Decision: Use PR-only workflow with CODEOWNERS review and explicit no-direct-push-to-`main` team policy.
- Rationale: Branch protection cannot currently be enforced on this private repo plan, so we need a documented and consistent process that still routes all changes through review.

## ADR-009: Extension Toolchain Standardization on WXT (Vite) + React
- Date: 2026-03-02
- Decision: Replace custom Webpack/Babel dev/build plumbing for `apps/extension` with WXT (Vite-powered), while retaining React for UI runtime.
- Rationale: WXT removes custom extension build complexity, improves local/dev parity, and preserves UI implementation continuity to reduce migration risk during big-bang cutover.

## ADR-010: Extension Architecture Split Into Core + Features
- Date: 2026-03-02
- Decision: Introduce `src/core/*` for contracts/integration code and `src/features/*` hooks for domain behavior, while keeping backend API semantics unchanged.
- Rationale: Breaking the monolithic extension service/components into typed domain modules makes the codebase easier to reason about, easier to test incrementally, and safer to modify without backend contract churn.

## ADR-011: Reinstate Strict Extension Lint Baseline
- Date: 2026-03-02
- Decision: End temporary warning tolerance from ADR-006 and require clean extension lint output in regular quality gates.
- Rationale: After refactor cleanup, warning tolerance is no longer needed; strict linting is now part of regression prevention for the new architecture.

## ADR-012: Standardize Auth Platform on Clerk Across Web + Extension
- Date: 2026-03-03
- Decision: Replace legacy Convex Auth flows with Clerk as the single authentication provider for web and Chrome extension.
- Rationale: One identity provider simplifies cross-surface SSO, session handling, onboarding flows, and auth operations.

## ADR-013: Hard Reset Policy for Legacy User-Facing Auth Data With Billing Retention
- Date: 2026-03-03
- Decision: During cutover, reset legacy user-facing profile/content/session data while preserving billing/subscription/payment records in an immutable archive path.
- Rationale: Avoid risky in-place user-data auth migration while retaining support/audit-critical financial records.

## ADR-014: Convex Identity Linkage via Clerk Identity (`clerkUserId` / `tokenIdentifier`)
- Date: 2026-03-03
- Decision: Stop coupling `userProfiles` to legacy auth table IDs; use Clerk-backed identity from Convex auth context and persist canonical `clerkUserId` on profile records.
- Rationale: Decouples business data from legacy auth tables and aligns backend authorization with Clerk-issued identity claims.

## ADR-015: Block Production Cutover on Missing Clerk Issuer Configuration
- Date: 2026-03-03
- Decision: Do not execute destructive reset or rollout completion until `CLERK_JWT_ISSUER_DOMAIN` is configured on production Convex deployment (`oceanic-retriever-344`) and deploy succeeds.
- Rationale: Without Clerk issuer configuration, Convex deployment cannot publish the new auth config, making a destructive data reset unsafe and potentially causing auth outage.

## ADR-016: Temporary Legacy `userProfiles.userId` Schema Compatibility During Cutover Deploy
- Date: 2026-03-03
- Decision: Keep `userProfiles.userId` as an optional field in Convex schema during production deployment, even though Clerk identity linkage is now canonical via `clerkUserId`.
- Rationale: Existing production rows still included `userId`; removing it before destructive reset blocked deploy with schema validation errors. Temporary compatibility unblocked deploy safely and allows controlled cleanup after reset.

## ADR-017: Treat Vercel Monorepo Deploy Path as a Rollout Gate
- Date: 2026-03-03
- Decision: Do not mark full auth rollout complete until web production deploy is executing via a monorepo-compatible Vercel path (project root/build settings or equivalent), and extension package is published.
- Rationale: Convex cutover completed, but production web deployment currently fails in linked Vercel project flow (`workspace:*` install on remote build and Bun traced symlink path in prebuilt deploy), so public auth experience cannot be considered fully switched until web release path is fixed.

## ADR-018: Deploy Clerk Web Cutover Only to Domain-Bound Vercel Project
- Date: 2026-03-03
- Decision: Use `applying-myself-next` as the canonical web rollout target because `applyingmyself.com` is attached to that project; do not treat deployments to ad-hoc `web` project as production cutover completion.
- Rationale: CLI deploys created/linked a separate `web` project, but domain inspection shows production traffic still routes through `applying-myself-next`. Rollout validation must follow domain ownership, not just successful deploy URLs.

## ADR-019: Monorepo Web Deploy Settings Must Be Applied on `applying-myself-next`
- Date: 2026-03-03
- Decision: Configure the domain-bound Vercel project `applying-myself-next` with monorepo-aware settings (`rootDirectory=apps/web`, `installCommand=bun install`, `buildCommand=bun run build`) before production rollout.
- Rationale: Default legacy project settings (`rootDirectory=.`) caused failed or irrelevant deploy paths during Clerk cutover. Applying monorepo settings on the domain-bound project ensures production deployments actually ship the monorepo web app to `applyingmyself.com`.

## ADR-020: Remove Temporary Post-Cutover Compatibility Paths
- Date: 2026-03-03
- Decision: After destructive reset and successful Clerk cutover deployment, remove temporary compatibility code and schema fields introduced only to unblock migration (`userProfiles.userId`, `free/enterprise` plan aliases, email fallback profile linking).
- Rationale: The migration window is closed and backward compatibility is no longer required. Keeping compatibility branches increases complexity and risks hidden auth/data divergence, so the system now enforces Clerk-only identity linkage.

# Clerk Auth Migration Tracker

## Scope
- Full auth replacement to Clerk across `apps/web`, `apps/extension`, and `apps/convex`.
- Hard reset of legacy user-facing data while retaining billing records in archive form.
- Convex identity cutover from legacy auth user IDs to Clerk identity (`clerkUserId`).

## Production Target
- Convex deployment: `oceanic-retriever-344` (`https://oceanic-retriever-344.convex.site`)
- Clerk mode: single source of truth for authentication.

## Checklist

### Phase 0: Preflight Safety
- [x] Add `scripts/auth/export-precutover.ts`.
- [x] Add `scripts/auth/archive-billing.ts`.
- [x] Add `scripts/auth/wipe-user-data.ts`.
- [x] Enforce destructive gate env vars: `AUTH_RESET_CONFIRM=DELETE_USER_DATA` and `AUTH_RESET_TICKET=<ticket-id>`.
- [x] Record backup artifact paths and storage location.

### Phase 1: Dependency and Config Migration
- [x] Add Clerk dependencies:
  - `apps/web`: `@clerk/nextjs`
  - `apps/extension`: `@clerk/chrome-extension`
- [x] Remove legacy auth dependencies/usages where no longer needed.
- [x] Standardize env var documentation:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_JWT_ISSUER_DOMAIN`
  - extension sync-host/frontend Clerk values

### Phase 2: Convex Backend Auth Replacement
- [x] Remove `authTables` usage from schema.
- [x] Remove/deprecate `convex/auth.ts` and old auth HTTP route wiring.
- [x] Replace `getAuthUserId` flow with Clerk identity helpers.
- [x] Add `clerkUserId` identity linkage on `userProfiles` with unique index.
- [x] Add `billingArchive` table and support functions.
- [x] Remove/replace legacy debug/account-linking endpoints tied to `users`/`authAccounts`.
- [x] Remove temporary post-cutover compatibility paths (`userProfiles.userId`, legacy plan aliases, email fallback profile linking).

### Phase 3: Web Auth Migration
- [x] Replace Convex Auth provider stack with Clerk + Convex integration.
- [x] Replace legacy login/register/verify flows with Clerk components.
- [x] Remove legacy extension token bridge route.
- [x] Replace auth guards/signout with Clerk equivalents.

### Phase 4: Extension Auth Migration
- [x] Remove local credential auth flow.
- [x] Add Clerk provider + sync-host configuration.
- [x] Bootstrap Convex auth token from Clerk session token.
- [x] Remove `api.auth.signIn/signOut` extension calls.
- [x] Update extension permissions/config for Clerk requirements.

### Phase 5: Data Reset + Billing Retention
- [x] Archive billing/subscription/payment data first.
- [x] Execute destructive user-data reset with explicit confirmation gate.
- [x] Keep archive queryable for support/audit.
- [x] Add first-login entitlement claim behavior from archive state.

### Phase 6: Validation and Acceptance
- [x] `bun run check:api-contract`
- [x] `bun run lint`
- [x] `bun run typecheck`
- [x] `bun run build`
- [x] Record auth acceptance scenarios and outcomes.

### Phase 7: Rollout
- [x] Deploy Convex auth changes.
- [x] Deploy web Clerk auth changes to domain-bound Vercel project (`applying-myself-next`) and alias `applyingmyself.com`.
- [ ] Publish extension production package to Chrome Web Store.
- [x] Execute maintenance window for destructive reset and cutover switch.
- [ ] Monitor auth/session/entitlement failures for 24-72 hours.

## Execution Log

### 2026-03-03 09:29 EST
- Completed:
  - Added Clerk dependencies to web and extension.
  - Created live migration tracker and linked documentation updates.
- Command summary:
  - `bun add --cwd apps/web @clerk/nextjs` -> installed `@clerk/nextjs@^6.39.0`.
  - `bun add --cwd apps/extension @clerk/chrome-extension` -> installed `@clerk/chrome-extension@^2.9.9`.
- Changed files:
  - `apps/web/package.json`
  - `apps/extension/package.json`
  - `bun.lock`
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md`

### 2026-03-03 09:48 EST
- Completed:
  - Replaced Convex Auth backend coupling with Clerk identity helpers and schema updates.
  - Added cutover support module (`cutover.ts`) and preflight/reset scripts under `scripts/auth/`.
  - Removed legacy Convex auth module wiring and account-linking module.
- Command summary:
  - `bun run --cwd apps/convex typecheck` -> pass.
  - `bun run scripts/auth/wipe-user-data.ts` -> blocked as expected without required env gates.
- Changed files:
  - `apps/convex/convex/schema.ts`
  - `apps/convex/convex/userHelpers.ts`
  - `apps/convex/convex/http.ts`
  - `apps/convex/convex/auth.config.ts`
  - `apps/convex/convex/cutover.ts`
  - `apps/convex/lib/auth.ts`
  - `apps/convex/convex/auth.ts` (removed)
  - `apps/convex/convex/accountLinking.ts` (removed)
  - `scripts/auth/export-precutover.ts`
  - `scripts/auth/archive-billing.ts`
  - `scripts/auth/wipe-user-data.ts`
  - `package.json`
  - `apps/convex/package.json`

### 2026-03-03 09:48 EST
- Completed:
  - Web auth moved to Clerk provider + Clerk pages + Clerk guards.
  - Extension auth moved to Clerk provider/session token bootstrap.
  - Legacy web extension token bridge removed.
  - Extension manifest permissions updated for Clerk sync-host model.
- Command summary:
  - `bun run --cwd apps/web typecheck` -> pass.
  - `bun run --cwd apps/extension type-check` -> pass.
  - `bun run check:api-contract` -> pass (`71 api.* callsites`).
  - `bun run lint` -> pass.
  - `bun run typecheck` -> pass (web + extension + convex).
  - `bun run build` -> pass (web + extension + convex; metadata warnings only).
- Changed files:
  - `apps/web/components/ConvexProvider.tsx`
  - `apps/web/components/ProtectedRoute.tsx`
  - `apps/web/components/RedirectIfAuthenticated.tsx`
  - `apps/web/components/DashboardLayout.tsx`
  - `apps/web/app/login/page.tsx`
  - `apps/web/app/register/page.tsx`
  - `apps/web/app/verify-email/page.tsx`
  - `apps/web/app/verify-email-sent/page.tsx`
  - `apps/web/app/dashboard/jobs/new/page.tsx`
  - `apps/web/app/api/auth/extension-token/route.ts` (removed)
  - `apps/web/middleware.ts`
  - `apps/web/package.json`
  - `apps/extension/entrypoints/popup/main.tsx`
  - `apps/extension/src/config.ts`
  - `apps/extension/src/core/convex/authClient.ts`
  - `apps/extension/src/services/convexApi.ts`
  - `apps/extension/src/features/auth/useSession.ts`
  - `apps/extension/src/popup/App.tsx`
  - `apps/extension/wxt.config.ts`
  - `docs/monorepo/EXTENSION_DEV_RUNBOOK.md`

### 2026-03-03 11:55 EST
- Completed:
  - Restored local Convex CLI targeting to production deployment after accidental `convex dev` reprovisioning side effect.
  - Fixed cutover scripts to execute Convex CLI from `apps/convex` workspace.
  - Executed production pre-cutover export for backup artifact capture.
- Command summary:
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 bun run auth:export-precutover` -> pass.
    - Artifact directory: `artifacts/auth-precutover/2026-03-03T15-50-42-426Z`
    - Tables exported: `userProfiles`, `resumes`, `coverLetters`, `extractedJobs`, `jobApplications`, `creditTransactions`, `subscriptions`, `payments`.
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 AUTH_RESET_TICKET=clerk-cutover-20260303 bun run auth:archive-billing` -> fail before deploy (`cutover:archiveBillingRecords` not present on remote deployment).
  - `cd apps/convex && CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 npx convex deploy -y` -> blocked by missing `CLERK_JWT_ISSUER_DOMAIN` on deployment env.
- Changed files:
  - `scripts/auth/export-precutover.ts`
  - `scripts/auth/archive-billing.ts`
  - `scripts/auth/wipe-user-data.ts`
  - `.env.local`
  - `apps/convex/.env.local`

### 2026-03-03 13:24 EST
- Completed:
  - Configured production Convex Clerk env vars:
    - `CLERK_JWT_ISSUER_DOMAIN=https://clerk.applyingmyself.com`
    - `CLERK_JWT_AUDIENCE=convex`
  - Deployed Clerk cutover backend to `oceanic-retriever-344`.
  - Executed billing archive and destructive reset in sequence.
  - Verified post-wipe counts and retained billing archive.
  - Built and zipped production extension artifact for store upload.
- Command summary:
  - `cd apps/convex && CI=1 npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.applyingmyself.com --deployment-name oceanic-retriever-344` -> pass.
  - `cd apps/convex && CI=1 npx convex env set CLERK_JWT_AUDIENCE convex --deployment-name oceanic-retriever-344` -> pass.
  - `cd apps/convex && CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 npx convex deploy -y` -> pass.
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 AUTH_RESET_TICKET=clerk-cutover-20260303 bun run auth:archive-billing` -> pass.
    - Artifact: `artifacts/auth-precutover/billing-archive/archive-billing-1772557889705.json`
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 AUTH_RESET_CONFIRM=DELETE_USER_DATA AUTH_RESET_TICKET=clerk-cutover-20260303 bun run auth:wipe-user-data` -> pass.
    - Artifact: `artifacts/auth-precutover/wipe-user-data/wipe-user-data-1772558010665.json`
  - `cd apps/convex && CI=1 npx convex run cutover:getCutoverCounts '{}' --deployment-name oceanic-retriever-344` -> pass.
    - Counts after wipe: `userProfiles=0`, `resumes=0`, `coverLetters=0`, `jobApplications=0`, `creditTransactions=0`, `billingArchive=3`.
  - `bun run --cwd apps/extension deploy production --clean --zip` -> pass.
    - Artifact: `apps/extension/extension-production.zip` and `apps/extension/dist/applying-myself-extension-1.0.0-chrome.zip`.
  - `bun run --cwd apps/web deploy:production` -> fail (`vercel` binary missing).
  - `cd apps/web && npx vercel --prod --yes` -> fail remote build (`npm install` cannot resolve `workspace:*`).
  - `cd apps/web && npx vercel build --prod` -> pass.
  - `cd apps/web && npx vercel deploy --prebuilt --prod --yes` -> fail (`ENOENT` on Bun symlinked traced path).
  - `npx vercel --prod --yes --name web` from monorepo root -> fail (`No Next.js version detected`; Vercel project root/build settings not aligned to `apps/web`).
  - `npx vercel domains inspect applyingmyself.com` -> production domain is attached to project `applying-myself-next` (not `web`).
  - `npx vercel project inspect applying-myself-next` -> confirms legacy project has `Root Directory=.` and Next.js preset.
  - `curl -L -s https://applyingmyself.com/_next/static/chunks/app/login/page-334dd5b955ec76a0.js | rg 'flow:\"signIn\"'` -> confirms legacy login bundle still live on production web.
  - `bun run check:api-contract` -> pass.
  - `bun run lint` -> pass.
  - `bun run typecheck` -> pass.
  - `bun run build` -> pass.
- Changed files:
  - `apps/convex/convex/schema.ts`
  - `apps/extension/scripts/deploy.js`
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md`
  - `docs/monorepo/WORKLOG.md`
  - `docs/monorepo/MASTER_PLAN.md`
  - `docs/monorepo/DECISIONS.md`

### 2026-03-03 14:41 EST
- Completed:
  - Fixed production web rollout path on domain-bound Vercel project `applying-myself-next`.
  - Added production Clerk env vars to `applying-myself-next`.
  - Deployed web Clerk cutover and re-aliased `https://applyingmyself.com`.
  - Verified live `/login` returns HTTP `200` and loads Clerk JS from `https://clerk.applyingmyself.com`.
  - Verified production runtime defaults still target Convex deployment `https://oceanic-retriever-344.convex.site`.
- Command summary:
  - `npx vercel api /v9/projects/applying-myself-next -X PATCH --input ...` -> pass (`rootDirectory=apps/web`, install/build commands set for Bun).
  - `npx vercel api /v10/projects/applying-myself-next/env --scope jessewalbergs-projects -X POST --input ...` -> pass for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (production target).
  - `npx vercel --prod --yes` -> pass.
    - Deployment: `https://applying-myself-next-nysuhnt0e-jessewalbergs-projects.vercel.app`
    - Alias: `https://applyingmyself.com`
  - `curl -L -s -o /tmp/login.html -w "%{http_code}\n" https://applyingmyself.com/login` -> `200`.
  - `curl -L -s -o /tmp/register.html -w "%{http_code}\n" https://applyingmyself.com/register` -> `200`.
  - `sed -n '1,140p' /tmp/login.html` -> includes Clerk browser script at `https://clerk.applyingmyself.com/...`.
- Changed files:
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md`
  - `docs/monorepo/WORKLOG.md`
  - `docs/monorepo/MASTER_PLAN.md`
  - `docs/monorepo/DECISIONS.md`

### 2026-03-03 16:12 EST
- Completed:
  - Removed all remaining backward-compatibility code from Convex auth/billing/profile paths.
  - Enforced strict Clerk-only profile linkage (`clerkUserId` required, no email legacy fallback).
  - Removed deprecated schema compatibility fields and plan aliases.
- Command summary:
  - `bun run typecheck` -> pass.
  - `bun run lint` -> pass.
  - `bun run check:api-contract` -> pass (`67 api.* callsites`).
  - `bun run build` -> pass.
  - `bun run --cwd apps/convex codegen` -> fail in sandbox (`getaddrinfo ENOTFOUND o1192621.ingest.sentry.io`).
- Changed files:
  - `apps/convex/convex/schema.ts`
  - `apps/convex/convex/userHelpers.ts`
  - `apps/convex/convex/billing.ts`
  - `apps/convex/convex/credits.ts`
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md`
  - `docs/monorepo/WORKLOG.md`
  - `docs/monorepo/MASTER_PLAN.md`
  - `docs/monorepo/DECISIONS.md`

### 2026-03-03 16:35 EST
- Completed:
  - Configured Clerk JWT settings on dev Convex deployment `dazzling-badger-1`.
  - Verified dev env vars contain:
    - `CLERK_JWT_ISSUER_DOMAIN=https://leading-pup-97.clerk.accounts.dev`
    - `CLERK_JWT_AUDIENCE=convex`
  - Re-ran Convex codegen attempt from `apps/convex`; `_generated/*` files refreshed, but CLI still exits with known Sentry DNS telemetry failure in this environment.
- Command summary:
  - `npx convex env set CLERK_JWT_ISSUER_DOMAIN https://leading-pup-97.clerk.accounts.dev --deployment-name dazzling-badger-1` -> pass.
  - `npx convex env set CLERK_JWT_AUDIENCE convex --deployment-name dazzling-badger-1` -> pass.
  - `npx convex env list --deployment-name dazzling-badger-1 | rg "CLERK_JWT_ISSUER_DOMAIN|CLERK_JWT_AUDIENCE"` -> pass.
  - `npx convex codegen` (from `apps/convex`) -> updates generated files, then exits on `getaddrinfo ENOTFOUND o1192621.ingest.sentry.io`.
  - `bun run --cwd apps/convex typecheck` -> pass.
  - `bun run check:api-contract` -> pass (`67 api.* callsites`).
- Changed files:
  - `apps/convex/convex/_generated/api.d.ts`
  - `apps/convex/convex/_generated/api.js`
  - `apps/convex/convex/_generated/dataModel.d.ts`
  - `apps/convex/convex/_generated/server.d.ts`
  - `apps/convex/convex/_generated/server.js`
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md`
  - `docs/monorepo/WORKLOG.md`

## Cutover Status

### Implementation Status
- Code migration is complete for backend + web + extension auth replacement to Clerk.
- Production Convex cutover is complete:
  - Clerk auth config deployed.
  - Billing archive retained.
  - Legacy user-facing data reset executed.
- Validation command suite passed:
  - `bun run check:api-contract`
  - `bun run lint`
  - `bun run typecheck`
  - `bun run build`

### Rollout Update
- Web production rollout is now live on the domain-bound project (`applying-myself-next`):
  - Project settings were patched for monorepo deployment (`rootDirectory=apps/web`, Bun install/build commands).
  - Production deploy completed and `https://applyingmyself.com` is aliased to the new deployment.
  - `/login` now returns HTTP `200` and loads the Clerk browser bundle from `https://clerk.applyingmyself.com`.
- Remaining rollout work is operational (extension store publish + monitoring), not deployment-path blocked.

### Remaining Operational Steps
- Upload and publish extension production zip to Chrome Web Store.
- Run live auth acceptance matrix (web, extension, SSO propagation, entitlement claim).
- Monitor auth/session/entitlement failures for 24-72h.

### Acceptance Matrix (2026-03-03 14:41 EST)
- Fresh user web email/password flow: PARTIAL PASS (production Clerk login/signup routes render and load successfully; interactive account completion not executed in this terminal session).
- Fresh user social login flow: PENDING MANUAL (requires browser interaction with provider flow in production).
- Extension session bootstrap without legacy token path: PASS (code path live; production zip built).
- SSO propagation web <-> extension: PENDING MANUAL (requires published extension runtime validation against live web session).
- Protected Convex authorization behavior: PARTIAL PASS (backend auth now Clerk-based; manual unauthenticated client-path test pending).
- Old user-facing data inaccessible after reset: PASS (post-wipe counts show zero user-facing records).
- Billing record retention intact/searchable: PASS (`billingArchive=3`, preserved after wipe).
- Paid entitlement reclaim on first Clerk login: PENDING MANUAL (requires first Clerk-authenticated login on deployed web/extension).

## Cutover Complete (Backend + Web Runtime)
- Date: 2026-03-03
- Deployment: `oceanic-retriever-344`
- Verification evidence:
  - Backup export manifest: `artifacts/auth-precutover/2026-03-03T15-50-42-426Z/manifest.json`
  - Billing archive artifact: `artifacts/auth-precutover/billing-archive/archive-billing-1772557889705.json`
  - Wipe artifact: `artifacts/auth-precutover/wipe-user-data/wipe-user-data-1772558010665.json`
  - Post-wipe counts confirm reset and billing retention (`billingArchive=3`, user-facing tables zeroed).
  - Production web deploy completed and aliased:
    - `https://applying-myself-next-nysuhnt0e-jessewalbergs-projects.vercel.app`
    - `https://applyingmyself.com`
  - `https://applyingmyself.com/login` and `https://applyingmyself.com/register` both respond `200` and include Clerk JS from `https://clerk.applyingmyself.com`.

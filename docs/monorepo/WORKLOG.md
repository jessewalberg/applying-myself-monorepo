# Monorepo Worklog

## 2026-03-02
- Initialized `applying-myself-monorepo` git repository.
- Imported source repositories with history using `git subtree`:
  - `apps/web` from `applying-myself-next`
  - `apps/extension` from `applying-myself-chrome-extension`
  - `apps/convex` from `applying-myself-convex`
- Added Bun workspace root scaffolding (`package.json`, `tsconfig.base.json`, `.gitignore`).
- Created required planning docs in `docs/monorepo/`.
- Implemented Convex backend reconciliation:
  - Added modules `jobApplications`, `emailResend`, `adminSetup`, `accountLinking`.
  - Added missing functions including `coverLetters.generateFromForm`, `billing.reactivateSubscription`, `resumes.setDefault`, `resumes.getDefaultResume`, and admin/debug helpers in `userHelpers`.
  - Added schema support for `jobApplications`, `resumes.isDefault`, and `userProfiles.isAdmin`.
  - Normalized plan handling with compatibility mapping.
- Migrated client contract usage:
  - Replaced client imports with `@app/convex-client`.
  - Removed duplicated local client contract artifacts (`convexApi.ts`, local `convex/_generated` in web and extension).
  - Added shared contract check script (`scripts/check-api-contract.ts`) and validated pass.
- Implemented shared runtime configuration:
  - Added `@app/runtime-config` and wired it into extension config/background and web Convex/auth token paths.
  - Removed hardcoded extension analytics endpoint in `background/index.ts`.
- Completed Bun-first tooling conversion:
  - Removed all `package-lock.json` files and generated root `bun.lock`.
  - Updated scripts/docs from npm/npx to Bun command equivalents.
  - Updated extension helper scripts to operate against shared runtime config package.
- Added Bun-first CI workflow:
  - Created `.github/workflows/ci.yml` with path-based jobs for web, extension, convex, and shared changes.
  - Added quality gate job running `check:api-contract`, `lint`, and `typecheck`.
- Validation results from this session:
  - `bun run check:api-contract` passed.
  - `bun run typecheck` passed (web, extension, convex).
  - `bun run lint` passed (extension warnings remain, no lint errors).
  - `bun run build` passed (web + extension + convex).
- Added operational scripts:
  - `scripts/apply-branch-protection.sh` to enforce required checks and branch protection via GitHub API.
  - `scripts/run-smoke-checklist.sh` to generate a reproducible smoke report.
- Added smoke docs:
  - `docs/monorepo/SMOKE_CHECKLIST.md`
  - `docs/monorepo/SMOKE_REPORT.md`
- Branch protection execution is currently blocked in this environment:
  - no `origin` remote configured for the new monorepo.
  - `gh` is unauthenticated (`gh auth login` required).
- Runtime dev/staging endpoint smoke checks are blocked in this sandbox due DNS/network restrictions.

## 2026-03-02 13:59 EST
- Verified authenticated `gh` session outside sandbox (`jessewalberg` account, repo scope available).
- Created GitHub repository: `jessewalberg/applying-myself-monorepo` (private).
- Added and verified `origin` remote: `git@github.com:jessewalberg/applying-myself-monorepo.git`.
- Pushed local `main` branch to initialize remote and set upstream tracking.
- Attempted to enforce branch protection with `scripts/apply-branch-protection.sh`.
- Branch protection call returned HTTP 403 for private repository on current GitHub plan (requires GitHub Pro or public visibility).

## 2026-03-02 15:03 EST
- Added `.github/CODEOWNERS` with repo-wide ownership to auto-request reviewer(s) on PRs.
- Added `.github/pull_request_template.md` with required Bun validation checklist and explicit PR-only/no-direct-`main` acknowledgements.
- Added root `CONTRIBUTING.md` documenting team workflow policy: branch-per-change, PR to `main`, and no direct pushes to `main`.
- Recorded interim governance approach in ADR-008 while branch protection remains unavailable on current private-repo plan.

## 2026-03-02 15:10 EST
- Executed full monorepo validation pass for requested type/error cleanup.
- Fixed all extension lint warnings by removing dead code, tightening React prop/type contracts, and replacing `any` usages with typed `unknown`/domain unions.
- Updated extension typings and components (`background`, popup tabs/components, `convexApi` service, shared extension `types`) to keep lint + typecheck strictness without suppressions.
- Validation after fixes:
  - `bun run lint` passed with no extension warnings.
  - `bun run typecheck` passed across web, extension, and convex.
  - `bun run build` passed across web, extension, and convex.
  - `bun run check:api-contract` passed.

## 2026-03-02 16:32 EST
- Executed big-bang extension simplification cutover on branch `codex/extension-wxt-rebuild`.
- Tagged rollback anchor `extension-pre-wxt-rebuild`.
- Migrated extension toolchain to WXT/Vite:
  - Added `apps/extension/wxt.config.ts`.
  - Replaced extension scripts with Bun + WXT (`dev`, `build:*`, `zip:*`, `type-check`, `postinstall`).
  - Removed obsolete Webpack/Babel stack and build files (`webpack.config.js`, `scripts/dev.js`, `.babelrc`).
- Added WXT entrypoints:
  - `entrypoints/popup/main.tsx`
  - `entrypoints/background.ts`
  - `entrypoints/content.ts`
- Removed extension options surface and legacy manifests:
  - deleted `src/options/*`
  - deleted `src/manifest.*.json`
  - removed legacy popup HTML/bootstrap files.
- Implemented core architecture split:
  - strict message contracts in `src/core/contracts/messages.ts`
  - typed storage schema and adapters in `src/core/storage/*`
  - Chrome adapters in `src/core/chrome/*`
  - modular Convex clients in `src/core/convex/*`
  - analytics adapter in `src/core/analytics/track.ts`
- Introduced feature hooks for popup behavior:
  - `useSession`, `useExtractJob`, `useGenerateCoverLetter`, `useResumeLibrary`, `useHistoryData`
- Split popup stylesheet into feature-oriented files under `src/popup/styles/*`.
- Updated extension docs and deploy script for WXT artifact flow.
- Validation after WXT migration:
  - `bun run --cwd apps/extension lint` passed.
  - `bun run --cwd apps/extension type-check` passed.
  - `bun run --cwd apps/extension build:dev` passed.
  - `bun run --cwd apps/extension build:staging` passed.
  - `bun run --cwd apps/extension build:prod` passed.
  - `bun run --cwd apps/extension zip:prod` passed and produced `apps/extension/dist/applying-myself-extension-1.0.0-chrome.zip`.
  - `bun run lint` passed at monorepo root.
  - `bun run typecheck` passed at monorepo root.
  - `bun run check:api-contract` passed at monorepo root.
  - `bun run build` passed at monorepo root.
- Updated monorepo tracking docs (`MASTER_PLAN`, `DECISIONS`, `RISKS`, `CHECKLIST`, `ROLLBACK`) to capture WXT migration status, rollback anchor, and current open risks.

## 2026-03-03 07:41 EST
- Re-ran smoke baseline via `bun run smoke`.
- Re-ran smoke baseline outside sandbox to validate external reachability.
- Updated `docs/monorepo/SMOKE_REPORT.md` with current results:
  - Web prod reachability: PASS (`https://applyingmyself.com`)
  - Web dev reachability: PASS (`https://dev.applyingmyself.com`)
  - Convex reachability: PASS (`https://oceanic-retriever-344.convex.site`)
  - Auth/runtime matrix scenarios remain pending/manual (credentials and interactive Chrome extension flow required).

## 2026-03-03 08:02 EST
- Investigated extension bundle-size risk (R9) and implemented optimization + enforcement pass.
- Optimizations:
  - Code-split popup tabs using `React.lazy` + `Suspense` in `apps/extension/src/popup/App.tsx` (Generate/History/Settings load on demand).
  - Removed local Inter variable TTF embedding from popup base CSS to eliminate ~1.7 MB of bundled font assets.
- Added CI bundle budget gate:
  - New script `scripts/check-extension-bundle-size.ts`.
  - New root command `bun run check:bundle-size:extension`.
  - Added workflow step `Extension bundle budget` in `.github/workflows/ci.yml` after extension prod build.
- Validation:
  - `bun run --cwd apps/extension lint` passed.
  - `bun run --cwd apps/extension type-check` passed.
  - `bun run --cwd apps/extension build:prod` passed.
  - `bun run check:bundle-size:extension` passed.
  - `bun run lint` passed.
  - `bun run typecheck` passed.
- Measured production bundle impact:
  - WXT total output size decreased from ~3.42 MB to ~1.64 MB.
  - Popup chunk reduced from ~260.69 KB to ~231.74 KB.

## 2026-03-03 09:29 EST
- Started full Clerk auth cutover execution.
- Added live migration tracker: `docs/monorepo/AUTH_MIGRATION_TRACKER.md`.
- Added auth cutover planning status to `docs/monorepo/MASTER_PLAN.md`.
- Added ADR-012/013/014 in `docs/monorepo/DECISIONS.md`.
- Installed Clerk dependencies:
  - `bun add --cwd apps/web @clerk/nextjs`
  - `bun add --cwd apps/extension @clerk/chrome-extension`
- Confirmed production Convex target for migration remains `oceanic-retriever-344`.

## 2026-03-03 09:48 EST
- Implemented full Clerk auth replacement across Convex backend, web app, and extension runtime.
- Convex backend auth cutover:
  - Removed legacy Convex Auth coupling from schema/helpers/http (`authTables`, `getAuthUserId`, auth route wiring).
  - Deleted deprecated modules: `apps/convex/convex/auth.ts`, `apps/convex/convex/accountLinking.ts`.
  - Added Clerk identity linkage (`clerkUserId`) and entitlement-claim flow in `userHelpers`.
  - Added `billingArchive` schema + indexes and new cutover module `apps/convex/convex/cutover.ts`.
  - Updated `auth.config.ts` for Clerk issuer/audience mapping.
- Preflight/reset tooling:
  - Added `scripts/auth/export-precutover.ts`.
  - Added `scripts/auth/archive-billing.ts`.
  - Added `scripts/auth/wipe-user-data.ts` with mandatory gates:
    - `AUTH_RESET_CONFIRM=DELETE_USER_DATA`
    - `AUTH_RESET_TICKET=<ticket-id>`
  - Added root script aliases:
    - `auth:export-precutover`
    - `auth:archive-billing`
    - `auth:wipe-user-data`
- Web auth migration:
  - Replaced provider stack with Clerk + `ConvexProviderWithClerk`.
  - Replaced login/register flows with Clerk `SignIn`/`SignUp`.
  - Replaced verify routes with Clerk redirects.
  - Replaced auth guards/signout to Clerk hooks and added `apps/web/middleware.ts` for protected routes.
  - Removed legacy bridge route `apps/web/app/api/auth/extension-token/route.ts`.
- Extension auth migration:
  - Added `@clerk/chrome-extension` provider to popup entrypoint with sync-host listener.
  - Removed local credential auth UI and switched to Clerk SignIn component.
  - Reworked session bootstrap to obtain Clerk JWT template token and set Convex auth from it.
  - Removed extension `api.auth.signIn/signOut` path usage.
  - Updated manifest permissions/host permissions for Clerk sync mode.
- Updated runbook + tracker docs:
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md` (live checkoff + evidence + cutover status).
  - `docs/monorepo/EXTENSION_DEV_RUNBOOK.md` (Clerk env/sync-host/cutover scripts).
- Validation results:
  - `bun run check:api-contract` passed (`71 api.* callsites`).
  - `bun run lint` passed.
  - `bun run typecheck` passed (web + extension + convex).
  - `bun run build` passed (web + extension + convex; non-blocking metadata warnings remain).
  - `bun run scripts/auth/wipe-user-data.ts` correctly blocked without required destructive env gates.

## 2026-03-03 11:55 EST
- Executed production pre-cutover backup export against `oceanic-retriever-344`:
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 bun run auth:export-precutover`
  - Artifact root: `artifacts/auth-precutover/2026-03-03T15-50-42-426Z`
- Fixed cutover script execution context so Convex CLI runs from `apps/convex` workspace:
  - `scripts/auth/export-precutover.ts`
  - `scripts/auth/archive-billing.ts`
  - `scripts/auth/wipe-user-data.ts`
- Restored local Convex CLI defaults after accidental `convex dev` reprovisioning:
  - `.env.local`
  - `apps/convex/.env.local`
  - both now target `oceanic-retriever-344`.
- Attempted production archive and deploy:
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 AUTH_RESET_TICKET=clerk-cutover-20260303 bun run auth:archive-billing` failed because `cutover:*` functions are not on remote yet.
  - `cd apps/convex && CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 npx convex deploy -y` blocked by missing deployment env var `CLERK_JWT_ISSUER_DOMAIN`.
- Current cutover status:
  - Code migration complete.
  - Operational cutover paused pending production Clerk issuer env configuration on Convex.

## 2026-03-03 13:24 EST
- Received production Clerk issuer value and applied deployment env updates:
  - `cd apps/convex && CI=1 npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.applyingmyself.com --deployment-name oceanic-retriever-344`
  - `cd apps/convex && CI=1 npx convex env set CLERK_JWT_AUDIENCE convex --deployment-name oceanic-retriever-344`
- Production Convex deploy completed:
  - `cd apps/convex && CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 npx convex deploy -y`
  - Deploy required a schema compatibility adjustment for legacy `userProfiles.userId` field; added temporary optional `userId` back to validator.
- Billing retention + destructive reset execution completed:
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 AUTH_RESET_TICKET=clerk-cutover-20260303 bun run auth:archive-billing`
    - artifact: `artifacts/auth-precutover/billing-archive/archive-billing-1772557889705.json`
  - `CI=1 CONVEX_DEPLOYMENT=oceanic-retriever-344 AUTH_RESET_CONFIRM=DELETE_USER_DATA AUTH_RESET_TICKET=clerk-cutover-20260303 bun run auth:wipe-user-data`
    - artifact: `artifacts/auth-precutover/wipe-user-data/wipe-user-data-1772558010665.json`
  - `cd apps/convex && CI=1 npx convex run cutover:getCutoverCounts '{}' --deployment-name oceanic-retriever-344`
    - post-wipe counts: `billingArchive=3`, `userProfiles=0`, `resumes=0`, `coverLetters=0`, `jobApplications=0`, `creditTransactions=0`.
- Rollout execution updates:
  - Extension production release artifact generated:
    - fixed `apps/extension/scripts/deploy.js` env->script mapping bug (`build:production`/`zip:production` mismatch).
    - `bun run --cwd apps/extension deploy production --clean --zip` -> pass.
    - artifacts: `apps/extension/extension-production.zip`, `apps/extension/dist/applying-myself-extension-1.0.0-chrome.zip`.
  - Web deployment attempts:
    - `bun run --cwd apps/web deploy:production` -> fail (`vercel` binary missing).
    - `cd apps/web && npx vercel --prod --yes` -> fail (remote `npm install` cannot resolve `workspace:*`).
    - `cd apps/web && npx vercel build --prod` -> pass (local prebuild).
    - `cd apps/web && npx vercel deploy --prebuilt --prod --yes` -> fail (`ENOENT` on Bun symlinked traced dependency path).
    - `npx vercel --prod --yes --name web` from monorepo root -> fail (`No Next.js version detected`; project build context/root settings mismatch).
    - `npx vercel domains inspect applyingmyself.com` -> production domain maps to project `applying-myself-next`.
    - `npx vercel project inspect applying-myself-next` -> root directory is `.` (legacy single-app expectation), not monorepo-aware.
    - Production web still serves legacy login bundle (`flow:"signIn"` path confirmed in current `/login` chunk).
- Re-ran full validation suite after cutover/deploy-script updates:
  - `bun run check:api-contract` -> pass.
  - `bun run lint` -> pass.
  - `bun run typecheck` -> pass.
  - `bun run build` -> pass (existing non-blocking metadata/chunk-size warnings only).
- Current status:
  - Convex production auth/data cutover complete.
  - Web/extension final public rollout remains pending: web deploy path fix + Chrome Web Store publish step.

## 2026-03-03 14:41 EST
- Resolved production web rollout path and completed Clerk web deployment on domain-bound Vercel project `applying-myself-next`.
- Updated `applying-myself-next` build settings for monorepo deployment:
  - `rootDirectory=apps/web`
  - `installCommand=bun install`
  - `buildCommand=bun run build`
- Added production Clerk environment variables on `applying-myself-next` and redeployed production:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production target)
  - `CLERK_SECRET_KEY` (production target)
  - `npx vercel --prod --yes` -> pass.
  - Deployment URL: `https://applying-myself-next-nysuhnt0e-jessewalbergs-projects.vercel.app`
  - Domain alias: `https://applyingmyself.com`
- Production verification:
  - `curl -L -s -o /tmp/login.html -w "%{http_code}\n" https://applyingmyself.com/login` -> `200`.
  - `curl -L -s -o /tmp/register.html -w "%{http_code}\n" https://applyingmyself.com/register` -> `200`.
  - Login HTML includes Clerk browser bundle from `https://clerk.applyingmyself.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`.
- Convex targeting verification:
  - `packages/runtime-config/src/index.js` production runtime remains pinned to `https://oceanic-retriever-344.convex.site`.

## 2026-03-03 16:12 EST
- Removed remaining backward-compatibility auth paths after cutover:
  - `apps/convex/convex/schema.ts`: made `userProfiles.clerkUserId` required, removed legacy `userProfiles.userId`, removed `free/enterprise` plan literals, and removed legacy `creditTransactions.userId` with required `userProfileId`.
  - `apps/convex/convex/userHelpers.ts`: removed email-based legacy profile fallback and Clerk-link patchup path; profile resolution is now Clerk ID only.
  - `apps/convex/convex/billing.ts` and `apps/convex/convex/credits.ts`: removed legacy plan normalization branches for `free` and `enterprise`.
- Validation after strict cleanup:
  - `bun run typecheck` -> pass.
  - `bun run lint` -> pass.
  - `bun run check:api-contract` -> pass (`67 api.* callsites`).
  - `bun run build` -> pass.
- Tooling note:
  - `bun run --cwd apps/convex codegen` failed in this sandbox due external DNS resolution to Sentry ingest host (`getaddrinfo ENOTFOUND o1192621.ingest.sentry.io`), so Convex generated artifacts were not refreshed in this run.
  - Web and extension configs continue to resolve Convex URL via shared runtime config defaults in production.
- Updated migration records:
  - `docs/monorepo/AUTH_MIGRATION_TRACKER.md`
  - `docs/monorepo/MASTER_PLAN.md`
  - `docs/monorepo/DECISIONS.md`

## 2026-03-03 16:35 EST
- Configured dev Clerk JWT env vars on Convex deployment `dazzling-badger-1`:
  - `npx convex env set CLERK_JWT_ISSUER_DOMAIN https://leading-pup-97.clerk.accounts.dev --deployment-name dazzling-badger-1`
  - `npx convex env set CLERK_JWT_AUDIENCE convex --deployment-name dazzling-badger-1`
  - Verified with `npx convex env list --deployment-name dazzling-badger-1 | rg "CLERK_JWT_ISSUER_DOMAIN|CLERK_JWT_AUDIENCE"`.
- Re-ran codegen from `apps/convex`:
  - `npx convex codegen` refreshed `apps/convex/convex/_generated/*` files.
  - CLI exits after generation due known environment DNS issue reaching Sentry ingest (`getaddrinfo ENOTFOUND o1192621.ingest.sentry.io`).
- Verification:
  - `bun run --cwd apps/convex typecheck` -> pass.
  - `bun run check:api-contract` -> pass (`67 api.* callsites`).

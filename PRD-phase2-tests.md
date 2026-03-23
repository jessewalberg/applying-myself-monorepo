## PRD: ApplyingMyself Phase 2 — Handler Logic Extraction + Unit Tests
Date: 2026-03-23
Priority: P1
Branch: feature/phase2-handler-tests
Base: feature/convex-unit-tests (has Phase 1 work)

### Context
Phase 1 (PR #7) shipped 60 tests covering pure helpers in `lib/` and exported constants.
Phase 2 extracts testable business logic FROM Convex handler files INTO `lib/` modules,
then writes unit tests for the extracted functions + the existing `lib/stripe.ts` and `lib/ai.ts`.

The handler files (credits.ts, billing.ts, coverLetters.ts, jobApplications.ts, users.ts)
contain inline business logic that can't be tested without a Convex runtime. We extract
the pure logic into `lib/` so it becomes testable with plain Vitest.

### Architecture Decision
- Extract pure business logic from handler files → new `lib/` modules
- Keep handler files thin (they call lib functions + do DB operations)
- Mock external APIs (OpenAI, Stripe) for lib/ai.ts and lib/stripe.ts tests
- Do NOT test Convex handlers directly (requires Convex test runtime, out of scope)

### Tasks
- [ ] Create `lib/credits.ts` — extract `CREDIT_COSTS`, `getDailyUsageBreakdown`, credit math helpers from `convex/credits.ts`. Update `convex/credits.ts` to import from lib.
- [ ] Create `lib/billing.ts` — extract `PRICING_PLANS`, `CREDIT_PACKAGES`, `normalizePlan` from `convex/billing.ts`. NOTE: `lib/plans.ts` already has PRICING_PLANS and CREDIT_PACKAGES — check for duplication. Deduplicate: handler should import from lib, not define its own copy.
- [ ] Write `tests/billing.test.ts` — test PRICING_PLANS structure, CREDIT_PACKAGES, normalizePlan, plan lookup functions already in lib/plans.ts
- [ ] Write `tests/stripe.test.ts` — test `lib/stripe.ts` functions with mocked fetch/Stripe SDK. Test createCustomer, createCheckoutSession, retrieveCustomer, cancelSubscription, constructWebhookEvent with mock responses.
- [ ] Write `tests/ai.test.ts` — test `lib/ai.ts` functions with mocked OpenAI API. Test extractJobFromHTML, generateCoverLetter, extractTextFromResume with mock responses.
- [ ] Verify no duplicate exports between `convex/billing.ts` and `lib/plans.ts` — if PRICING_PLANS/CREDIT_PACKAGES are defined in both, remove from handler and re-export from lib.
- [ ] Run full test suite — all tests pass (Phase 1 + Phase 2)
- [ ] Run linter (`bun run lint` or `npx tsc --noEmit`) — zero errors
- [ ] Total test count should be >= 100 (Phase 1 had 60, Phase 2 adds 40+)

### TDD Requirements
Write failing tests first that define expected behavior,
then implement code to make them pass. Run the test suite
before committing. All tests must pass.

### Acceptance Criteria
- All existing Phase 1 tests still pass (no regressions)
- New tests cover: billing plans, stripe operations (mocked), AI operations (mocked), credit math
- Handler files import from lib/ instead of defining logic inline
- Total test count >= 100
- `cd apps/convex && npx vitest run` exits 0

### Estimated Iterations
1-2 Ralph loop cycles

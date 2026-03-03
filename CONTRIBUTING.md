# Contributing

## Workflow Policy
- Do not push directly to `main`.
- Create a branch for every change (for agent-created branches, use `codex/*`).
- Open a pull request targeting `main`.
- Request review from CODEOWNERS before merge.

## Local Validation Before PR
Run these from repo root:

```bash
bun run check:api-contract
bun run typecheck
bun run lint
bun run build
```

## Merge Policy
- Merge through pull requests only.
- Keep commits to `main` attributable to merged PRs.
- If an emergency fix is applied, follow up immediately with a PR that documents the change and rationale.

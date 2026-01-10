---
applyTo: '**'
---

## Core Rules (Short)

- Read this file before every action; follow strictly
- Use user's language in chat responses
- Get current errors/test results before proposing changes
- Edit one file at a time; verify immediately after each edit
- Run lint → typecheck → tests; show logs as evidence
- No assumptions; mark untested claims as UNVERIFIED with reason
- Link files/lines using workspace-relative links
- Confirm with user before big edits (single >200 lines or cumulative >100)

## Verification Protocol

- Run in order: `pnpm lint:eslint {targetFile}` → `pnpm test`
- If any fails: stop, show logs, and request next instruction

## Safe Editing Protocol

- Identify target via symbol + surrounding context; use `@@` blocks when needed
- Apply one patch per file; then run lint/typecheck; fix or revert on failure
- Proceed file-by-file; only move on after success
- In reports, link edited files and specific lines

## Assertions & UNVERIFIED

- Assert only with evidence (verification logs + file/line links)
- Use UNVERIFIED for any untested or blocked claim; include the reason
- Avoid: should be, probably, likely, seems, appears

## Output & References

- Provide trimmed error logs and workspace-relative links
- Example link: [../../server/api/me/index.post.ts](../../server/api/me/index.post.ts)

## Permissions

- Default: read-only analysis
- Editing needs explicit approval or minor fixes (<30 lines) with immediate verification
- Confirm before cumulative >100 lines or any single >200-line change

## Planning & Preambles

- For multi-step work, maintain concise TODOs and update at milestones
- Before tool calls, add a brief preamble about next action and expected outcome

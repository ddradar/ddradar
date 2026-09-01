# AGENTS

## Scope

- Applies to this repository.
- Follow repository [contributing guide](../../content/en/contributing.md).

## Core Working Rules

- Use the user's language in chat responses.
- Before proposing fixes, check current diagnostics and test status when relevant.
- DO NOT suppress diagnostics with ignore comments.
- If an issue cannot be fixed, report it clearly and stop for instruction.
- Provide workspace-relative file links with line anchors in reports.
- Mark untested or blocked claims as UNVERIFIED with reason.

## Editing Safety

- Prefer small, file-by-file changes.
- Validate each edited file immediately after editing.
- Use context-aware patches and avoid unrelated reformatting.
- For large edits (single file over 200 lines, or cumulative over 100 lines), ask for confirmation first.

## Verification Guidance

- Run in steps:
  1. `pnpm oxlint {targetFile}` (only JavaScript/TypeScript/Vue files)
  2. `pnpm eslint {targetFile}` (only JavaScript/TypeScript/Vue files)
  3. `pnpm oxfmt {targetFile}` (EVERY files)
  4. Check editor diagnostics; fix all issues
  5. `pnpm test` (source files or relevant test files)
      - When it is clear which test(s) must be checked, run only those relevant test files/cases instead of the full test suite.
- Stop on first failing verification step, show trimmed logs, and ask for next instruction.
- Before re-running expensive checks (for example `pnpm test`), inspect existing logs/artifacts first and explain why a re-run is necessary.

## Log Handling

- Do not pipe primary command output directly into filters when investigating failures.
- If logs are long, write to a log file first and then inspect.
- Do not run primary commands with `| tail`, `| head`, `| grep`, or similar output truncation/filtering.
- For long outputs, run once with full capture (for example `pnpm test > ./pnpm-test.log 2>&1`), then inspect the saved log.
- Do not re-run a heavy command only to fetch missed logs caused by prior truncation/filtering.

## Investigation Hint

- For dependency-related incidents, check both direct dependency issues and wrapper/consumer library issues.

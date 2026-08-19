---
name: token-tracking
description: Track and report token usage across both collaborators, on Claude Code and Codex. Trigger: "cuántos tokens usamos", token report, usage tracking.
---

## What This Is

A Stop hook (fires after every agent turn) reads the session transcript,
sums token usage, and appends a snapshot to a global, per-machine log at
`~/.token-tracking/token-usage.jsonl`. The log never touches git — it's
personal machine data. A separate script reads that log and regenerates
a markdown report on demand.

Tokens are logged as **totals per turn**, not per tool — the API bills a
whole request (system prompt + history + tool results) together, so
"tokens Read used" isn't a real number. What IS tracked: total input/output/
cache tokens per session, and how many times each tool was called.

## Components

| File | Purpose |
|---|---|
| `.claude/scripts/token-log.mjs` | Claude Code Stop hook — reads this session's transcript, appends a snapshot |
| `.agents/scripts/token-log-codex.mjs` | Same, for Codex — **unverified**, see caveat below |
| `.claude/scripts/token-report.mjs` | Reads the log, regenerates `docs/token-usage-report.md` |

## Activation

**Claude Code**: the hook lives in `.claude/settings.local.json` (personal,
gitignored — each collaborator opts in on their own machine). If you don't
have it yet, add a `Stop` hook entry running
`node "${CLAUDE_PROJECT_DIR}/.claude/scripts/token-log.mjs"`. After adding
it, open `/hooks` once (or restart) so Claude Code picks up the change.

**Codex**: already committed in `.codex/hooks.json`, runs automatically —
no action needed.

## Generating the Report

```bash
node .claude/scripts/token-report.mjs
```

Writes `docs/token-usage-report.md`. Regenerated fully each run (not
appended), safe to commit whenever you want to share a snapshot.

## Codex Caveat

`token-log-codex.mjs` was written from public docs on Codex's session log
format (`~/.codex/sessions/YYYY/MM/DD/rollout-<id>.jsonl`), not verified
against a real Codex run. If the report shows 0 tokens for the Codex user,
open a recent rollout file, find a line with a `usage` object, and check
the field names against what the script expects (`input_tokens`/
`output_tokens` or `prompt_tokens`/`completion_tokens`) — adjust
`summarize()` in the script to match.

---
name: project-board
description: Track work on the Kairo GitHub Project. Trigger: creating issues, moving work through Todo/In Progress/Done, checking what's next.
---

## When to Use

- After creating an issue with the `issue-creation` skill — add it to the board
- When starting work on an issue — move it to `In Progress`
- When a linked PR merges — GitHub auto-moves the issue to `Done` (see Automation below)
- When asked "what's next" or "what are we working on"

## The Board

[Kairo Project #1](https://github.com/users/GonzaloAsencio/projects/1) — linked to `GonzaloAsencio/Kairo`.

Columns (Status field): `Todo` → `In Progress` → `Done`

## Workflow

```
1. Issue created (status:needs-review) → add to project, Status: Todo
2. Maintainer adds status:approved → still Todo, now unblocked
3. Maintainer verifies the Definition of Ready and adds agent-ready → workable
4. Work starts, branch created → move to In Progress
5. PR opened with "Closes #N" → stays In Progress
6. PR merged (by the OTHER person) → issue auto-closes → auto-moves to Done
```

## The `agent-ready` gate

`agent-ready` is applied by **the maintainer only** (@GonzaloAsencio), and only
once the Definition of Ready in `CONTRIBUTING.md` is fully met: module assigned,
file-level scope declared, verifiable acceptance criteria, test level declared,
ADR linked if relevant, and `status:approved` present.

It is the single label that authorises an agent to work an issue unattended.
**If you are an agent and the issue does not carry it, stop and report** — do
not start work and do not apply the label yourself.

Full label reference: `.github/labels.md`.

## Automation

GitHub auto-moves an item to `Done` when its linked issue closes — this already works because every PR must contain `Closes #N` (enforced by `branch-pr` skill). No extra config needed.

Moving Todo → In Progress is manual — no clean trigger for "someone started working on it."

## Commands

```bash
# Add an issue to the project
gh project item-add 1 --owner GonzaloAsencio --url https://github.com/GonzaloAsencio/Kairo/issues/<N>

# List items and their status
gh project item-list 1 --owner GonzaloAsencio

# Move an item to In Progress (needs item-id from item-list and the Status field-id)
gh project item-edit --id <item-id> --field-id PVTSSF_lAHOAxHGdM4Bg35Hzhf1zbQ --project-id PVT_kwHOAxHGdM4Bg35H --single-select-option-id 47fc9ee4
```

Status option ids: `Todo` = `f75ad846`, `In Progress` = `47fc9ee4`, `Done` = `98236657`.

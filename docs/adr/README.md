# Architecture Decision Records

Decisions that are expensive to reverse live here. Nothing else does.

## Format

One file per decision: `NNNN-kebab-case-title.md`. Short MADR:

```markdown
# NNNN. Title

- Status: Proposed | Accepted | Superseded by ADR-NNNN
- Date: YYYY-MM-DD
- Deciders: <names>

## Context
What forces are at play. What problem we are solving.

## Decision
What we are doing. Present tense, active voice.

## Consequences
What this makes easy, what it makes hard, what it costs.
```

## What warrants an ADR

Anything expensive to reverse: stack, persistence, sync strategy, auth,
schema-migration policy, export format, module boundaries, deploy target.

## What does not

Naming a component, picking a utility function, moving a file. Those live in
the PR description.

## The hard rule

**What matters goes into an ADR, not into agent memory.**

Engram is scratch space for a single session. If a decision survives the
session, it becomes an ADR in this directory. A decision that only lives in one
agent's memory is a decision the other collaborator cannot read, cannot
challenge, and will accidentally violate.

Never edit an accepted ADR to change its decision. Write a new one and mark the
old one `Superseded by ADR-NNNN`. The trail is the point.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-stack-vite-react-typescript.md) | Stack: Vite + React + TypeScript | Accepted |
| [0002](0002-local-first-with-supabase-sync.md) | Local-first with Supabase as sync destination | Accepted |
| [0003](0003-persistence-behind-a-port.md) | Persistence behind a port, outbox for writes | Accepted |
| [0004](0004-schema-versioning-and-migrations.md) | Schema versioning and migration policy | Accepted |
| [0005](0005-auth-and-privacy-model.md) | Auth and privacy model | Accepted |
| [0006](0006-testing-strategy.md) | Testing strategy and what we do not test | Accepted |
| [0007](0007-module-boundaries-and-owners.md) | Module boundaries and owners | Accepted |
| [0008](0008-export-import-format.md) | Export/import format | Accepted |
| [0009](0009-conflict-resolution-last-write-wins.md) | Conflict resolution: last-write-wins | Accepted |

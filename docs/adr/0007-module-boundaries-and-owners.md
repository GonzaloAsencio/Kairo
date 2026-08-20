# 0007. Module boundaries and owners

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Two people work on this repo, each driving an AI agent. Agents are fast and have
no instinct for territory: given an unclear boundary, they will refactor across
it, and two agents refactoring the same files in parallel produces conflicts
faster than either produces features.

Boundaries that are not enforced by tooling are suggestions.

## Decision

**Four feature modules, one fixed owner each, boundaries enforced in CI.**

```
src/
  core/       domain types, ports, schema + migrations, pure logic
  infra/      IndexedDB, Supabase, sync, auth
  ui/         design tokens, primitives
  modules/    session | match | review | triggers
  app/        shell, routing, nav, providers
```

| Module | Tab | Owner | Scope |
|---|---|---|---|
| `match` | P — Partida | **A** (@GonzaloAsencio) | Post-match entry form, Coded Seal, 90-second budget |
| `session` | S — Sesión | **A** (@GonzaloAsencio) | Mantra, daily goal, closing the session |
| `review` | R — Revisión | **B** (_TODO: handle_) | Decision × result matrix, tag frequency, emotion × quality, full log |
| `triggers` | G — Gatillos | **B** (_TODO: handle_) | Filter question, three editable triggers, four analysis questions |

Each owner takes one heavy module and one light one. Swapping is fine — it is one
line in this file plus the labels.

**Dependency rules, enforced by ESLint and checked in CI:**

```
modules/*  →  core/*, ui/*             allowed
modules/*  →  infra/*                  FORBIDDEN — go through core/ports
modules/A  →  modules/B                FORBIDDEN
core/*     →  infra/*, ui/*, modules/* FORBIDDEN
ui/*       →  core/domain              allowed (types only)
ui/*       →  infra/*, modules/*       FORBIDDEN
app/*      →  anything                 allowed (composition root)
```

**Boundary rule:** if a module needs something that lives in another module, it
does not import it. The shared piece moves up into `core/` or `ui/` in its own
PR, reviewed by both owners.

**Core is shared territory.** Changes to `core/`, `infra/` or `ui/primitives`
require review by both people, always. Changes inside your own module require
review by the other person — the usual rule, nobody merges their own work.

`core/`, `infra/` and `ui/` are frozen before the feature modules open. That
sequencing is what makes parallel work possible; skipping it means both agents
inventing the same types twice.

## Consequences

- An accidental cross-module import fails the build instead of landing.
- The scope-check CI job compares the files a PR touched against the scope
  declared on the linked issue, which makes ownership mechanical rather than
  social.
- Phase 1 is a bottleneck by design. Both people work on the shared core before
  either starts a feature.
- Some duplication between modules is tolerated. Two similar components in
  `match` and `review` are cheaper than a premature abstraction in `ui/` that
  both owners then fight over.

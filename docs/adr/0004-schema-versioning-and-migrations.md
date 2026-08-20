# 0004. Schema versioning and migration policy

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

The product's value compounds over time — a year of entries is worth far more
than a week of them. That makes stored data the most valuable asset in the
project and a bad deploy the most expensive failure. A journal that corrupts on
a schema change kills the product outright.

Data now lives in two places (ADR-0002), so it needs two migration stories that
cannot drift apart.

## Decision

**Every record carries its own `schemaVersion`. Migrations are pure functions.**

Local (`src/core/schema/`):

- `CURRENT_SCHEMA_VERSION` is a single exported constant.
- `migrations/NNN-description.ts` exports `(record: unknown) => unknown`, pure,
  no I/O, no clock, no randomness.
- On read, any record below the current version runs forward through the
  remaining migrations before it reaches domain code. Domain code only ever sees
  the current shape.
- The IndexedDB `upgrade` callback handles store and index changes only, never
  record shape.

Remote: `supabase/migrations/*.sql`, versioned through the Supabase CLI, applied
by a human (ADR-0005).

**Rules, non-negotiable:**

1. A published migration is never edited. Ever. Write a new one.
2. A migration is never deleted, even when no record could still need it.
3. A migration never throws away data it does not understand. Fields being
   removed are carried in a `_legacy` bag for one version before they go.
4. Every new version ships with a fixture of the *previous* version.

**The test that protects the journal:**

`src/core/schema/__tests__/migrations.test.ts` loads a fixture at every
historical version, runs the full migration chain, and asserts the final shape.
It grows by one fixture per published version and it is never allowed to be
skipped. If it is red, no deploy happens.

## Consequences

- Reads pay a small per-record migration cost until data is rewritten. Cheap at
  this scale.
- Local and remote schema changes must ship in the same PR, or a synced device
  will pull rows it cannot read.
- The migrations directory grows forever. That is the intended trade.

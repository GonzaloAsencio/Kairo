# 0003. Persistence behind a port, outbox for writes

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Persistence is the layer most likely to change: it went from "local only" to
"local plus Supabase sync" before a single line was written (ADR-0002). Whatever
it becomes next, the four feature modules must not care.

## Decision

**Modules talk to ports, never to a database.**

`src/core/ports/` owns the interfaces:

```ts
interface EntryRepository {
  list(): Promise<Entry[]>
  getById(id: Uuid): Promise<Entry | null>
  save(entry: Entry): Promise<void>
  softDelete(id: Uuid): Promise<void>
}
```

Same shape for `SessionRepository` and `TriggerRepository`. Plus `SyncQueue` for
the outbox.

Every method is `async`, including the ones IndexedDB could answer
synchronously. A sync signature that later turns async touches every consumer.

Implementations live in `src/infra/`:

- `infra/local/` — IndexedDB via `idb`
- `infra/remote/` — Supabase
- `infra/sync/` — outbox drain, backoff, conflict resolution
- an in-memory fake, used by every unit and component test

A module importing from `infra/` is a lint error, not a code review comment.

**Write path (outbox):**

1. Write the record to IndexedDB.
2. Append `{ id, entity, op, payload, queuedAt, attempts }` to `outbox`.
3. Return. The user sees success.
4. The sync engine drains the outbox: on success, remove the op; on failure,
   increment `attempts` and retry with exponential backoff.

## Consequences

- Unit tests run against the in-memory fake: no browser, no database, fast.
- Swapping or adding a backend is a new folder in `infra/` and one wiring
  change. Nothing in `modules/` moves.
- The outbox is durable state with its own failure modes (poison messages,
  unbounded growth). An op that exceeds a retry ceiling is parked and surfaced
  to the user rather than retried forever.
- Everything is async, so every module deals with loading states. Accepted.

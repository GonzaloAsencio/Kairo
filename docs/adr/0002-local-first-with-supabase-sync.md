# 0002. Local-first with Supabase as sync destination

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator
- Supersedes: `PRODUCT.md` "Datos solo locales" constraint and Product Principle 5

## Context

`PRODUCT.md` originally froze V1 as local-only: no account, no sync, no backend.
That constraint existed to protect the product's central promise — an entry must
be loadable in under 90 seconds, at a tournament, phone in hand, possibly with
no signal. Success is defined as eight continuous weeks of use; the documented
failure mode is gaps of more than three days by week four.

Two real risks pushed against local-only:

1. **Durability.** Safari evicts IndexedDB after seven days without interaction
   unless the PWA is installed to the home screen. A year of journal can vanish.
2. **Two devices.** The user plays physical games (phone) and digital games
   (desktop browser). Entries are loaded on one and reviewed on the other.

The decision was to add a backend in V1. The unresolved question was whether
Supabase becomes the source of truth at write time.

It cannot. A network write at a tournament with no signal is a lost entry, and a
lost entry is the exact event that kills the habit before week eight.

## Decision

**IndexedDB is the local source of truth. Supabase is the sync destination.**

- Every mutation writes to IndexedDB first and completes there. Saving an entry
  never awaits the network and never fails because of it.
- Every mutation also appends an operation to a local `outbox` store.
- A sync engine drains the outbox when the network is available, with
  exponential backoff (ADR-0003).
- Reads always come from IndexedDB. The UI never blocks on Supabase.
- Pull happens on app start and on window focus, for rows newer than
  `lastPulledAt`.
- Conflicts resolve last-write-wins by `updatedAt` (ADR-0009).

Offline is a hard V1 requirement, not an enhancement. The PWA is installable.

## Consequences

- `PRODUCT.md` line about local-only data and Product Principle 5 are rewritten.
  This ADR is the record of that reversal.
- Privacy enters V1 scope. These are notes about a person's mental state living
  on a third-party server; ADR-0005 defines what is stored and who can read it.
- Auth enters V1 scope. Magic link only, no password, no profile — the minimum
  that does not violate the "no onboarding" constraint.
- Roughly four extra work items exist that local-only would not have needed:
  outbox, sync engine, conflict resolution, sync status indicator.
- The data model carries client-generated UUIDv7 ids, `createdAt`/`updatedAt`
  and soft deletes from day one. These are cheap now and very expensive to
  retrofit.
- The 90-second entry budget is unaffected, because the network is never in the
  save path.

# 0009. Conflict resolution: last-write-wins

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Two devices write to the same dataset (ADR-0002): a phone at the tournament and
a desktop browser during review. Both can be offline. Both queue writes. When
they sync, the same record can arrive twice with different contents.

Conflict resolution options span from last-write-wins to CRDTs. The cost gap
between them is enormous, so the right question is what the actual conflict
surface looks like.

Here it is very small: one human, who is not in two places at once, editing a
per-match journal. Entries are written once, right after a match, and rarely
edited afterwards.

## Decision

**Last-write-wins by `updatedAt`. Whole record, not per field.**

- Every write sets `updatedAt` to the client clock at mutation time.
- On sync, the record with the greater `updatedAt` wins outright.
- Exact ties keep the local record and log the collision. Ties require
  millisecond-identical clocks on two devices and are not worth code.
- Deletes are soft (`deletedAt`) and are ordinary updates, so a delete competes
  with an edit under the same rule. No resurrection.
- No merging of individual fields. A partially merged reflection would be
  gibberish that reads as if the user wrote it, which is worse than losing an
  edit.

The known cost is accepted: **an edit made on a device with a lagging clock can
be silently discarded.** Given one user and near-zero concurrent editing, this
is the correct trade.

## Consequences

- Resolution is a pure function — `(local, remote) => winner` — with unit tests.
  No I/O, no ambiguity.
- Client clock skew is now correctness-relevant. If it ever bites, the fix is a
  server-assigned `updatedAt` on the Supabase side, and that is a new ADR.
- Import (ADR-0008) reuses the same function, so restoring a backup cannot
  silently overwrite newer data.
- If the product ever gains a second real user on shared data, this ADR is
  superseded. LWW is right for one person and wrong for a team.

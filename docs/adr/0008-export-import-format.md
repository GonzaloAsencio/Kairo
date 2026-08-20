# 0008. Export/import format

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Export serves three purposes at once, and they are usually confused:

1. The user's own backup, on their own machine.
2. Recovery when local storage is evicted or a device is lost.
3. **The exit plan.** If this project is abandoned (see `PRODUCT.md`), or if
   Supabase disappears, the data has to remain readable without our code.

The third purpose is the one that sets the requirements: the format must be
plain, self-describing, and documented outside the codebase.

## Decision

**A single JSON file, versioned, containing everything.**

```jsonc
{
  "format": "kairo-export",
  "formatVersion": 1,
  "schemaVersion": 3,          // domain schema at export time (ADR-0004)
  "exportedAt": "2026-08-20T14:03:11.482Z",
  "sessions": [ /* full Session records */ ],
  "entries":  [ /* full Entry records  */ ],
  "triggers": [ /* full Trigger records */ ]
}
```

- Full records, no partials, no references to resolve. Soft-deleted records are
  included with their `deletedAt` intact.
- `userId` is stripped on export and reassigned on import. The file belongs to
  a person, not to an account.
- Filename: `kairo-export-YYYY-MM-DD.json`.
- Import merges by `id` using last-write-wins on `updatedAt` (ADR-0009). It is
  never destructive: an import can add and update, never wipe.
- Import runs incoming records through the migration chain, so an old export
  restores into a newer app.
- Import validates `format` and rejects anything else with a plain message
  rather than a stack trace.

Export is available offline. It reads IndexedDB, not Supabase.

## Consequences

- Export/import round-trip is one of the three E2E flows (ADR-0006). It is
  tested on every PR, because a backup nobody verified is not a backup.
- The file is unencrypted plain text containing personal reflections. The user
  is told this at the moment of export, in one sentence.
- `formatVersion` is independent from `schemaVersion`: the envelope can change
  without the records changing, and vice versa.

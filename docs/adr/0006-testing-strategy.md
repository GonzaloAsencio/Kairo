# 0006. Testing strategy and what we do not test

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Strict TDD is enabled for this project and two AI agents will be writing code.
An agent told to "write tests" with no boundary writes tests for getters,
snapshots of markup, and assertions that React renders. Those tests cost real
time, break on every refactor, and catch nothing.

The line about what we *do not* test is more useful than the line about what we
do.

## Decision

| Level | Covers | Tool |
|---|---|---|
| Unit | `core/logic` (matrix classification, blind spot, tag frequency), migrations, outbox reducer, conflict resolution | Vitest |
| Component | Entry form validation, chip selection, Coded Seal reveal, matrix rendering | Vitest + Testing Library |
| Integration | Adapters against real IndexedDB (`fake-indexeddb`) and against local Supabase, including RLS isolation | Vitest |
| E2E | Exactly three flows | Playwright |

The three E2E flows, and only these three:

1. Load a complete entry end to end.
2. Go offline, save an entry, go online, confirm it synced.
3. Export, wipe local storage, import, confirm the data is identical.

**We do not test:**

- Getters, setters, DTOs, or any type without behaviour.
- Design token values or CSS. `DESIGN.md` is the source of truth; a test that
  asserts a hex code just duplicates it.
- Third-party libraries — `idb`, `supabase-js`, React Router.
- Layout snapshots. They fail on every intentional change and pass on every
  real regression.
- RLS via unit tests. It is covered once, properly, by an integration test.

Strict TDD applies to `core/` and `infra/sync/` — the parts with real logic and
real consequences. It does not apply to layout or styling, where the feedback
loop is visual.

Coverage threshold is enforced on `core/` only. A global percentage target
rewards testing the wrong things.

## Consequences

- Presentational components are largely untested by design. They are covered
  transitively by component tests on their containers and by the E2E flows.
- A visual regression will not be caught by CI. Accepted for V1; the reviewer
  opens the Vercel preview.
- The blind-spot rule (`decisionQuality === 'bad' && result === 'win'`) is a
  pure function with dedicated tests. It is the product's core mechanism and the
  one piece of logic that is never allowed to be wrong.

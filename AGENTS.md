# Agent Instructions

Read this before touching anything. It is the contract for both humans and
agents working in this repository.

**If this file and your instinct disagree, this file wins. If this file and an
ADR disagree, the ADR wins — and this file is out of date, so say so.**

---

## 1. What Kairo is

A post-match decision journal for competitive turn-based strategy players. After
each match the player records what they *thought and felt* at the critical turn —
not what they played.

The mechanism the whole product exists for is the **blind spot**: a decision the
player marked as bad that still won. Win rate gives exactly the opposite signal,
which is why the player cannot see it on their own.

Two documents own product truth. Do not contradict them:

- `PRODUCT.md` — scope, users, constraints, what is explicitly out of V1.
- `DESIGN.md` — the visual system. Tokens, rules, components.

The governing principle, from `PRODUCT.md`:

> **Fast ugly input, slow valuable output.**

Anything that adds friction to logging an entry gets cut. Anything that adds
value to review is allowed. An entry must be completable in **90 seconds**. That
is a hard budget, not an aspiration — if a change makes entry slower, it is a
product bug regardless of how good it looks.

---

## 2. Architecture

```
src/
  core/            NO dependencies on anything below. Pure.
    domain/        Entry, Session, Trigger, enums, invariants
    ports/         EntryRepository, SessionRepository, TriggerRepository, SyncQueue
    schema/        CURRENT_SCHEMA_VERSION + migrations/
    logic/         matrix classification, blind spot, tag frequency
  infra/
    local/         IndexedDB adapters (idb) + in-memory fake
    remote/        Supabase adapters
    sync/          outbox, sync engine, backoff, conflict resolution
    auth/          Supabase Auth session
  ui/
    tokens/        DESIGN.md rendered as CSS custom properties
    primitives/    Chip, Field, Button, Rule, DisplayNumber, CodedSeal
  modules/
    session/       tab S
    match/         tab P
    review/        tab R
    triggers/      tab G
  app/             shell, routing, nav, providers — the composition root
```

### Dependency rules — enforced by ESLint, not by good intentions

```
modules/*  ->  core/*, ui/*              allowed
modules/*  ->  infra/*                   FORBIDDEN  (go through core/ports)
modules/A  ->  modules/B                 FORBIDDEN
core/*     ->  infra/*, ui/*, modules/*  FORBIDDEN
ui/*       ->  core/domain               allowed (types only)
ui/*       ->  infra/*, modules/*        FORBIDDEN
app/*      ->  anything                  allowed
```

If module X needs something from module Y: **do not import it.** Lift the shared
piece into `core/` or `ui/` in its own PR, reviewed by both owners.

### Data flow

Writes go to IndexedDB and complete there. Supabase is the sync destination, not
the source of truth. **Saving never awaits the network and never fails because
of it** (ADR-0002, ADR-0003).

Components never touch `infra/`. They use ports.

### Non-obvious rules that will bite you

- `entryNumber` (the `Nº047` display) is **derived at read time**, ordered by
  `createdAt`. Never persist a counter — it collides across devices.
- Every id is a **client-generated UUIDv7**. No autoincrement, anywhere.
- Deletes are **soft** (`deletedAt`). Nothing is ever hard-deleted.
- Every record carries `schemaVersion`. Domain code only ever sees the current
  shape; migrations run on read (ADR-0004).
- Every port method is `async`, even where the underlying store is synchronous.
- **Blind spot** is `decisionQuality === 'bad' && result === 'win'`. One pure
  function in `core/logic`. This is the product. Do not scatter the rule.

---

## 3. Module ownership

| Module | Tab | Owner |
|---|---|---|
| `match` | P — Partida | A (@GonzaloAsencio) |
| `session` | S — Sesión | A (@GonzaloAsencio) |
| `review` | R — Revisión | B |
| `triggers` | G — Gatillos | B |

`core/`, `infra/`, `ui/` and `app/` are **shared territory**: every change there
needs review from both people.

**Nobody merges their own PR.** No exceptions, not even for typos.

---

## 4. Commands

```bash
npm run dev            # Vite dev server
npm run build          # production build
npm run preview        # serve the built bundle

npm run typecheck      # tsc --noEmit
npm run lint           # ESLint, includes dependency boundary rules
npm run format         # Prettier

npm test               # Vitest, watch
npm run test:unit      # unit + component, single run
npm run test:integration
npm run test:coverage  # threshold applies to core/ only
npm run e2e            # Playwright, the three flows

npm run supabase:start # local Supabase
npm run supabase:diff  # generate a migration from local schema changes
```

Before opening any PR:

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build
```

---

## 5. Conventions

### Language

- All **code** — identifiers, comments, filenames, commit messages, and all
  UI-visible copy — is written in **English**, from 2026-08-19 onward.
- Repository documentation that agents consume (`AGENTS.md`, `CONTRIBUTING.md`,
  `docs/adr/*`) is **English**.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/mocks/*` and the GitHub issue and PR
  templates are **Spanish** and stay that way. Do not translate them unless
  asked.
- Conversation with collaborators happens in whatever language they use. This
  rule is about what lands in the repo.

### Code

- TypeScript `strict`. No `any`. No `@ts-ignore` without a comment naming the
  reason and an issue number.
- Container / presentational split. Presentational components take props and
  render; they never know about ports, Supabase or routing.
- Styling uses the CSS custom properties in `ui/tokens`. **Never hardcode a hex
  value** — `DESIGN.md` is the source of truth.
- `DESIGN.md` rules that are easy to violate by accident:
  - **One Amber Rule** — `#f4a623` serves at most one function per screen.
  - **No-Shadow Rule** — no `box-shadow` anywhere. Separation is a 1px rule or
    a tonal step.
  - Border radius is `3px` everywhere. No pills, no soft cards.
  - No emoji or Unicode glyphs as icons. SVG with the system's thin stroke.
  - Result and attribution are never shown in the same glance as the process.
    They live behind the Coded Seal reveal.

### Testing

Strict TDD applies to `core/` and `infra/sync/` — write the failing test first.
It does not apply to layout or styling.

See ADR-0006 for what we test and, more importantly, what we do not. Do not
write tests for getters, DTOs, token values, third-party libraries, or layout
snapshots. They cost time and catch nothing.

### Git

- Branch: `type/issue-number-slug`, for example `feat/12-entry-form`
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
- **Never add `Co-Authored-By` or any AI attribution to commits.**
- One PR = one issue. Always `Closes #N`.
- Diff budget: **400 lines and 10 files maximum**. Over budget, split into
  chained PRs.

---

## 6. Working from issues

Work starts from an issue, never from a hunch.

An issue is ready to be worked (`agent-ready`) only when it has:

- a **Module** assigned
- a **file-level scope** — the paths this change is allowed to touch
- **verifiable acceptance criteria**
- the **test level** expected
- a linked ADR, if it changes an architectural decision
- the `status:approved` label

CI compares the files your PR touched against the declared scope. Touching a
file outside it fails the build. That is intentional.

Done means: acceptance criteria met, tests at the declared level, CI green, docs
or ADR updated if behaviour changed, reviewed by the other person, board item in
`Done`.

---

## 7. Stop and report

**Stop working, report, and hand control back. Do not improvise.**

Trigger conditions:

1. You need to touch a file outside the scope declared on the issue.
2. A schema migration is required, local or Supabase.
3. A new dependency is needed.
4. The diff budget is exceeded.
5. A test fails for a reason unrelated to your change.
6. The issue has no acceptance criteria, or they are not verifiable.
7. The change would contradict `PRODUCT.md`, `DESIGN.md`, or an ADR.
8. The change touches auth, RLS policies, or anything that deletes user data.

When you stop, report: what you were doing, what you hit, and the options you
see. Do not pick one and proceed.

**Never automated, under any circumstance:**

- Applying schema migrations to production
- Writing or modifying RLS policies without human review
- Merging a PR
- Deleting user data
- Committing secrets, or moving the Supabase `service_role` key anywhere

---

## 8. Decisions and memory

Decisions live in `docs/adr/`. See `docs/adr/README.md` for the format and what
qualifies.

**What matters goes into an ADR, not into agent memory.**

Engram is scratch space for one session. A decision that only lives there is one
the other collaborator cannot read, cannot challenge, and will violate by
accident. If a decision survives the session, write the ADR.

Never edit an accepted ADR to change its decision. Write a new one and mark the
old one superseded.

---

## 9. Secrets

- `.env.local` is gitignored. `.env.example` is committed and lists every
  variable with a dummy value.
- The Supabase `anon` key ships to the browser. That is by design — RLS is the
  security boundary (ADR-0005).
- The `service_role` key never enters the repo, the client bundle, or CI.
- CI and production read from GitHub Secrets and Vercel environment variables.
- MCP tooling is interactive-only. CI uses `gh` with `GITHUB_TOKEN` and nothing
  else.

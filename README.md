# Kairo

A post-match decision journal for competitive turn-based strategy players.

After each match the player records what they **thought and felt** at the
critical turn — not what they played. The product exists for one thing: the
**blind spot**, a decision the player marked as bad that won anyway. Win rate
gives exactly the opposite signal, which is why nobody catches it alone.

Governing principle: **fast ugly input, slow valuable output.** An entry must be
completable in 90 seconds, at a tournament, on a phone, with no signal.

---

## Read this first, in this order

Do not write code before finishing this list. It takes about 25 minutes and it
is the difference between working in parallel and working on top of each other.

| # | Document | What it gives you |
|---|---|---|
| 1 | [`PRODUCT.md`](PRODUCT.md) | What we are building, what is explicitly **not** in V1, and when we abandon the project |
| 2 | [`DESIGN.md`](DESIGN.md) | The visual system. Tokens, named rules, components |
| 3 | [`AGENTS.md`](AGENTS.md) | **The working contract.** Architecture, dependency rules, module ownership, commands, stop-and-report |
| 4 | [`CONTRIBUTING.md`](CONTRIBUTING.md) | Definition of Ready, Definition of Done, git, CI, review rhythm |
| 5 | [`docs/adr/`](docs/adr/) | Nine records of why each decision is what it is. Start with [ADR-0002](docs/adr/0002-local-first-with-supabase-sync.md) |

**Board:** [Kairo Project #1](https://github.com/users/GonzaloAsencio/projects/1)
· **Issues:** [open work](https://github.com/GonzaloAsencio/Kairo/issues)

---

## Setup

### 1. On your machine

| Tool | Why | Install |
|---|---|---|
| **Node 20+** | Runtime and toolchain | [nodejs.org](https://nodejs.org) |
| **git** | — | — |
| **GitHub CLI** | Issues, PRs and the board are driven from the terminal | [cli.github.com](https://cli.github.com) — then `gh auth login` |
| **Supabase CLI** | Only needed from issue #8 onward | [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli) |

### 2. Your coding agent

Claude Code or Codex — either works. The repository is configured for both.

### 3. The Gentle AI skill bundle

This installs the shared workflow skills into your agent globally: `branch-pr`,
`issue-creation`, `chained-pr`, `work-unit-commits`, `judgment-day`,
`skill-registry`, `cognitive-doc-design`, `comment-writer` and the `sdd-*` set.

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.sh | bash

# Windows (PowerShell) — Scoop distribution is paused pending code signing
go install github.com/gentleman-programming/gentle-ai/v2/cmd/gentle-ai@latest
```

Then run `gentle-ai install` and pick your agents. It configures runtimes you
already have; it never installs an agent for you.

### 4. Engram — persistent memory

A Claude Code plugin. Memory that survives across sessions.

```
/plugin marketplace add Gentleman-Programming/engram
/plugin install engram@engram
```

> Engram is scratch space, not a record. **What matters goes into an ADR**, not
> into your agent's memory. A decision that only lives in Engram is one the
> other person cannot read and will violate by accident.

### 5. Clone and go

```bash
git clone git@github.com:GonzaloAsencio/Kairo.git
cd Kairo
```

There is **no `npm install` yet** — the project has not been scaffolded. That is
[issue #3](https://github.com/GonzaloAsencio/Kairo/issues/3), the first ticket in
Phase 1.

---

## Skills

### Already in the repository — you get these by cloning

No action needed. They live in `.claude/skills/` (Claude Code) and
`.agents/skills/` (Codex).

| Skill | What it does | When it fires |
|---|---|---|
| **`react-doctor`** | Scans React code for correctness, performance, security, accessibility and architecture issues. Outputs a 0–100 health score | Finishing a feature, before committing React code, or `/doctor` |
| **`impeccable`** | Frontend design system work — audit, polish, shape, critique against `DESIGN.md` | Any UI work |
| **`project-board`** | Moving work through Todo → In Progress → Done on Project #1 | Creating issues, starting work, asking what is next |
| **`token-tracking`** | Token usage across both collaborators, Claude Code and Codex | Asking about usage |

### Install yourself — global, not in the repo

| Skill / plugin | Source |
|---|---|
| The Gentle AI bundle (`branch-pr`, `issue-creation`, `chained-pr`, `work-unit-commits`, `judgment-day`, `skill-registry`, `sdd-*`, …) | `gentle-ai install` — step 3 above |
| **Engram** (memory) | Step 4 above |
| **Vercel** (deploy — needed from Phase 4) | `/plugin install vercel@claude-plugins-official` |
| **ui-ux-pro-max** (optional — UI/UX reference database) | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` |

### React Doctor — one manual step

The skill and the CI workflow are committed. The **pre-commit hook is not** —
git hooks live in `.git/hooks/`, which git does not track. Run this once after
cloning:

```bash
npx react-doctor@latest install --yes
```

Then delete the directories it creates for agents we do not use (`.continue/`,
`.kiro/`, and anything for Cursor / Copilot / OpenCode). We only keep
`.claude/` and `.agents/`.

Scanning manually:

```bash
npx react-doctor@latest                            # full project
npx react-doctor@latest --verbose --scope changed  # only what you touched
```

CI runs it on every PR in **advisory mode** — it comments with the score and the
new findings, and never fails your build. We graduate it to blocking once we
trust the signal.

---

## How work flows

```
Issue created (status:needs-review)
  -> board: Todo
  -> maintainer adds status:approved
  -> maintainer verifies the DoR and adds agent-ready
  -> branch: type/issue-number-slug
  -> board: In Progress
  -> PR with "Closes #N"
  -> reviewed by the OTHER person
  -> merged -> board: Done automatically
```

Five rules that are not negotiable. The rest is in `CONTRIBUTING.md`.

1. **Nothing starts without an issue.** Not a refactor, not a typo.
2. **Nobody merges their own PR.** It is the one check CI cannot do.
3. **Stay inside the declared file scope.** CI compares your diff against it and
   fails if you drifted.
4. **400 lines and 10 files per PR.** Over that, chain them.
5. **Stop and report** instead of improvising — the eight trigger conditions are
   in `AGENTS.md` §7.

---

## Architecture in thirty seconds

```
src/
  core/       domain types, ports, schema + migrations, pure logic
  infra/      IndexedDB, Supabase, sync, auth
  ui/         design tokens, primitives
  modules/    session | match | review | triggers
  app/        shell, routing, nav — the composition root
```

Writes go to **IndexedDB and complete there**. Supabase is the sync destination,
never the source of truth at write time. Saving an entry must never wait on the
network and must never fail because of it — the whole product lives or dies on
that ([ADR-0002](docs/adr/0002-local-first-with-supabase-sync.md)).

Modules talk to **ports**, never to a database. A `modules/*` → `infra/*` import
fails the build, and so does `modules/A` → `modules/B`.

### Who owns what

| Module | Tab | Owner |
|---|---|---|
| `match` | P — Partida | A (@GonzaloAsencio) |
| `session` | S — Sesión | A (@GonzaloAsencio) |
| `review` | R — Revisión | B |
| `triggers` | G — Gatillos | B |

`core/`, `infra/`, `ui/` and `app/` are shared territory — **both of us review
every change there.**

---

## Where we are

**Phase 0 — decisions and documents.** Done. [#1](https://github.com/GonzaloAsencio/Kairo/issues/1)

**Phase 1 — shared core.** Open, and **blocking**: no feature module starts
until it closes. Thirteen issues, [#3 through
#15](https://github.com/GonzaloAsencio/Kairo/issues).

Unblocked right now: [#3](https://github.com/GonzaloAsencio/Kairo/issues/3)
scaffold · [#8](https://github.com/GonzaloAsencio/Kairo/issues/8) Supabase +
RLS · [#11](https://github.com/GonzaloAsencio/Kairo/issues/11) design tokens ·
[#13](https://github.com/GonzaloAsencio/Kairo/issues/13) CI ·
[#15](https://github.com/GonzaloAsencio/Kairo/issues/15) PWA

Phases 2 (feature modules), 3 (export/import, offline hardening, e2e) and 4
(release plus the eight-week trial) come after.

---

## Two things we need from you

1. **Your GitHub handle.** It is a placeholder in
   [ADR-0007](docs/adr/0007-module-boundaries-and-owners.md) and `AGENTS.md` §3,
   and four issues are unassigned because of it.
2. **Confirm the module split.** You get `review` and `triggers` — one heavy
   module and one light one, same as A. Say so if you want them swapped; it is
   one line in each file.

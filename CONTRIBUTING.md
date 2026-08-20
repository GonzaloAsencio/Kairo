# Contributing

Two people work on this repository, each driving an AI agent. Everything here
exists to make that possible without the two of you overwriting each other.

Architecture, module boundaries and code conventions live in
[`AGENTS.md`](AGENTS.md). This file covers process.

---

## The loop

```
Issue created (status:needs-review)
  -> added to the board, Status: Todo
  -> maintainer reviews, adds status:approved
  -> Definition of Ready met, maintainer adds agent-ready
  -> work starts, branch created, board item -> In Progress
  -> PR opened with "Closes #N"
  -> reviewed by the OTHER person
  -> merged -> issue auto-closes -> board item -> Done
```

Nothing starts without an issue. Not a refactor, not a typo fix, not "while I
was in there".

---

## Definition of Ready

An issue may carry `agent-ready` only when **all** of these are true:

- [ ] **Module** assigned (`match`, `session`, `review`, `triggers`, or `core`)
- [ ] **File-level scope** declared — the exact paths this change may touch
- [ ] **Acceptance criteria** written and verifiable (a person can say yes or no)
- [ ] **Test level** declared (unit / component / integration / e2e / none)
- [ ] **ADR linked**, if the change alters an architectural decision
- [ ] `status:approved` present

`agent-ready` is applied by **the maintainer only** (@GonzaloAsencio). It is the
single label that authorises an agent to work unattended. If you are an agent and
the issue lacks it, stop and report.

## Definition of Done

- [ ] Every acceptance criterion met
- [ ] Tests written at the declared level, and passing
- [ ] CI green — all jobs, including `scope-check`
- [ ] Docs or ADR updated if behaviour changed
- [ ] Reviewed and approved by **the other person**
- [ ] Board item in `Done`

---

## Git

**Branches**

```
type/issue-number-slug
```

`feat/12-entry-form`, `fix/31-outbox-retry`, `docs/4-adr-sync`.

**Commits**

Conventional commits. `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`.

**Never add `Co-Authored-By` or any AI attribution.**

**Pull requests**

- One PR = one issue. Always `Closes #N`.
- **Diff budget: 400 lines and 10 files.** Over budget, split into chained PRs.
  A review that takes an hour is a review nobody does properly.
- Exceeding the budget requires an explicit `size:exception` label from the
  maintainer, justified in the PR description.
- **Nobody merges their own PR.** No exceptions, not even for typos. This is the
  one rule that catches what CI cannot.

---

## CI

Every PR runs:

| Job | What it does |
|---|---|
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint, including the dependency boundary rules from ADR-0007 |
| `test` | Unit, component and integration. Coverage threshold on `core/` only. |
| `build` | Production build must succeed |
| `e2e` | The three Playwright flows from ADR-0006 |
| `scope-check` | Compares changed files against the scope declared on the linked issue |

### About `scope-check`

It reads the **file-level scope** from the linked issue, runs
`git diff --name-only origin/main...HEAD`, and fails if any changed file falls
outside that scope.

This is what makes module ownership mechanical instead of social. Without it,
boundaries are a suggestion and two agents will cross them within a week.

If it fails, the answer is almost never "widen the scope". It is either: you
drifted and should revert the extra files, or the work genuinely needs a second
issue.

---

## Review

- Review the other person's open PRs **before** the sync meeting, not during it.
- Changes to `core/`, `infra/` or `ui/primitives` need **both** people.
- Changes inside your own module need the other person, asynchronously.
- Reviewing means reading the diff and opening the Vercel preview. CI does not
  catch visual regressions (ADR-0006) — you do.

## Rhythm

- **Two syncs per week, 30 minutes.** Open PRs are already reviewed by then; the
  meeting is for decisions, not for reading code.
- Anything decided in a sync that is expensive to reverse becomes an ADR the
  same day. If it only lives in chat or in agent memory, it did not happen.

---

## Automation boundaries

| Category | Rule |
|---|---|
| Scaffolding, boilerplate, tests from a spec | Agent, unattended |
| Refactor inside one module, docs, changelog | Agent, unattended |
| Changes to `core/` — types, ports, schema | Agent proposes, **human approves before merge** |
| Schema migrations applied to production | **Never automated** |
| RLS policies and auth | **Never automated** |
| Merging PRs | **Never automated** |
| Deleting user data | **Never automated** |

## MCP

| Profile | Tools |
|---|---|
| Interactive | `engram`, `vercel`, `supabase`, `gh` CLI |
| CI | None. `gh` with `GITHUB_TOKEN` and nothing else. |

Credentials never enter the repository. Local development uses `.env.local`
(gitignored); CI and production read GitHub Secrets and Vercel environment
variables. See `AGENTS.md` section 9.

---

## Releases

- SemVer, `v0.x.y` through V1.
- Preview deploy per PR (Vercel). Production deploy on tag.
- `CHANGELOG.md` generated from conventional commits.

## Backup

Three layers, deliberately different:

1. **User** — manual JSON export from the app (ADR-0008). Their copy, their
   machine.
2. **Database** — weekly `pg_dump` via GitHub Action to a private artifact. The
   Supabase free tier does not give you point-in-time recovery.
3. **Exit** — the export format is documented in ADR-0008. If this project dies
   or Supabase disappears, the data stays readable.

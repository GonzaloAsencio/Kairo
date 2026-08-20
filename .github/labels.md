# Labels

The label set for this repository, as it actually exists. If you change a label
on GitHub, change it here in the same PR.

## `type:*` — exactly one per PR

| Label | Colour | Meaning |
|---|---|---|
| `type:feature` | `#A2EEEF` | New user-facing capability |
| `type:bug` | `#D73A4A` | Something is broken |
| `type:docs` | `#0075CA` | Documentation only |
| `type:refactor` | `#CFD3D7` | Behaviour unchanged, structure changed |
| `type:chore` | `#EDEDED` | Tooling, CI, dependencies |
| `type:breaking-change` | `#E11D21` | Breaks stored data or a public contract |

## `status:*` — the gate

| Label | Colour | Meaning |
|---|---|---|
| `status:needs-review` | `#FBCA04` | Filed, not yet triaged. Applied automatically by the issue templates. |
| `status:approved` | `#0E8A16` | Maintainer agrees this should be built. Required before a PR is opened. |
| `status:blocked` | `#D93F0B` | Waiting on another issue or an outside decision |

## `priority:*`

| Label | Colour | Meaning |
|---|---|---|
| `priority:high` | `#B60205` | Critical bug or urgent feature |
| `priority:medium` | `#D93F0B` | Important but not blocking |
| `priority:low` | `#C2E0C6` | Nice to have |

## `module:*` — who owns it

Ownership is defined in ADR-0007 and `AGENTS.md` §3.

| Label | Colour | Owner |
|---|---|---|
| `module:match` | `#F4A623` | A |
| `module:session` | `#F4A623` | A |
| `module:review` | `#F4A623` | B |
| `module:triggers` | `#F4A623` | B |
| `module:core` | `#43413A` | Both — shared territory, both must review |
| `module:app` | `#43413A` | Both |
| `module:tooling` | `#43413A` | Either |

## The special ones

| Label | Colour | Meaning |
|---|---|---|
| `agent-ready` | `#1D76DB` | **Applied by the maintainer only** (@GonzaloAsencio). Means the Definition of Ready in `CONTRIBUTING.md` is fully met and an agent may work this issue unattended. It is the single label that authorises unsupervised work. |
| `size:exception` | `#E99695` | Maintainer-approved permission to exceed the 400-line / 10-file diff budget. Requires a justification in the PR description. |
| `data-risk` | `#B60205` | Touches stored user data, migrations, sync, or export. Never automated; always reviewed by both people. |

## Create the labels that do not exist yet

`type:*`, `status:needs-review`, `status:approved` and `priority:*` are already
on the repository. These are the ones this plan adds:

```bash
gh label create "status:blocked"  --color D93F0B --description "Waiting on another issue or an outside decision"
gh label create "module:match"    --color F4A623 --description "Tab P - Partida"
gh label create "module:session"  --color F4A623 --description "Tab S - Sesion"
gh label create "module:review"   --color F4A623 --description "Tab R - Revision"
gh label create "module:triggers" --color F4A623 --description "Tab G - Gatillos"
gh label create "module:core"     --color 43413A --description "Shared territory - both must review"
gh label create "module:app"      --color 43413A --description "Shell, routing, nav"
gh label create "module:tooling"  --color 43413A --description "CI, scripts, config"
gh label create "agent-ready"     --color 1D76DB --description "DoR met - an agent may work this unattended"
gh label create "size:exception"  --color E99695 --description "Approved to exceed the diff budget"
gh label create "data-risk"       --color B60205 --description "Touches stored user data - never automated"
```

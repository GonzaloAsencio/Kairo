# 0005. Auth and privacy model

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Adding Supabase (ADR-0002) put the user's data on a third-party server. The
content is not neutral: `PRODUCT.md` describes entries as what the player
*thought and felt* at the critical turn. These are personal notes about
somebody's mental state.

At the same time `PRODUCT.md` forbids onboarding, profile completion, and any
field that adds friction. Auth must exist and must be nearly invisible.

## Decision

**Magic link only. RLS is the security boundary. Nothing else is collected.**

Auth:

- Supabase Auth, email magic link. No password, no OAuth, no profile.
- One screen, one field, one button. Session persists; re-auth is rare.
- The app is usable offline while the session is valid; expiry never blocks a
  local write, only sync.

Authorization:

- RLS is enabled on `sessions`, `entries` and `triggers`. No exceptions.
- Every table gets `select`, `insert`, `update`, `delete` policies of the form
  `auth.uid() = user_id`.
- There is no admin role, no service-role client, and no code path that reads
  another user's rows.
- The `service_role` key never enters the repo, the client bundle, or CI.
- The `anon` key ships to the browser. It is public by design; RLS is what
  protects the data.

What is stored: exactly the fields in `src/core/domain`. Session, entry,
trigger. Nothing more.

What is never stored or transmitted:

- No analytics, no telemetry, no error reporting that carries entry content.
- No third-party scripts of any kind.
- No logging of `reflection` text, anywhere, at any level.

## Consequences

- A forgotten RLS policy is a full data breach. Therefore: RLS policies are
  never written or modified by an agent without human review, and a dedicated
  integration test asserts that a second user cannot read the first user's rows.
- Losing access to the email address means losing the account. Accepted for a
  single-user V1; export (ADR-0008) is the mitigation.
- Debugging production is limited by design. We cannot look at a user's entries,
  and we do not want to be able to.

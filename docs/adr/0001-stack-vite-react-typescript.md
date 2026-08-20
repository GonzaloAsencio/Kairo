# 0001. Stack: Vite + React + TypeScript

- Status: Accepted
- Date: 2026-08-20
- Deciders: Gonzalo Asencio, collaborator

## Context

Kairo is a client-side journal app. `PRODUCT.md` describes a four-screen V1 with
no server-rendered content, no SEO surface, and no public pages. The write path
must work offline (ADR-0002), which means a service worker owns the network
layer.

`PRODUCT.md` left the stack undecided, leaning React but not committed. Leaving
it undecided means the first collaborator to start coding decides it for both.

Options considered: Vite + React, Next.js, SvelteKit, Astro.

## Decision

**Vite + React + TypeScript**, built as a static SPA.

- Build: Vite
- Language: TypeScript, `strict: true`
- Package manager: npm (lockfile committed)
- Router: React Router
- PWA: `vite-plugin-pwa`
- Tests: Vitest + Testing Library + Playwright

Next.js is rejected: SSR and RSC add real conceptual weight and fight the
service worker, and we render nothing on the server. SvelteKit is rejected for
ecosystem and shared-familiarity reasons, not technical ones. Astro is rejected
outright — it optimizes for content pages, and Kairo is four tabs over one
shared client-side data store.

## Consequences

- No server. Deploy is a static bundle; hosting is interchangeable.
- The Supabase anon key ships to the browser. That is by design; RLS is the
  security boundary (ADR-0005), not key secrecy.
- Auth session lives in browser storage rather than an httpOnly cookie. This is
  the concrete cost of choosing an SPA over Next.js, and it is accepted because
  the session is scoped to a single user's own journal.
- No route-level code splitting comes for free; if the bundle grows past budget
  we add it deliberately.

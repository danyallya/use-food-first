# Use Food First

A household food list that helps people use ingredients before they expire.

Planned outcome: track quantities and printed date labels, then suggest recipes using ingredients the household wants to use soon.

> Status: the local food-item entry, review and inventory lifecycle are implemented on a feature PR; they are not merged or released.

## Start locally

- Node.js 24 LTS and Docker Desktop with Compose.
- Copy .env.example to .env and set a development password.
- Install with npm ci.
- Start with docker compose up --build.
- App: http://localhost:3107 · PostgreSQL: localhost:5547

For lower-bandwidth installs, use [Offline Dev Vault](https://github.com/danyallya/offline-dev-vault); see docs/DEPENDENCIES.md.

## Foundation

Next.js App Router, TypeScript, React, Tailwind CSS, React Icons, PostgreSQL, Docker Compose, PWA manifest, conservative offline shell, Dexie food-item drafts and records with an unused outbox, health endpoint, unit tests and CI. English interface.

The service worker caches only the public shell and versioned static files. The food-item form saves records and drafts to this browser's IndexedDB and does not send them to the server. Accounts and sync are not configured. Dates and user-entered plans are not food-safety assessments; allergen notes are not verified.

Read AGENTS.md, TASK.md and docs/PROGRESS.md before work.

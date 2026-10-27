# Architecture

- Web: Next.js App Router and server-only route handlers.
- UI: React, Tailwind CSS, React Icons, semantic HTML and explicit status.
- Offline: service worker for public shell; Dexie/outbox is starter code only.
- Database: PostgreSQL 18 in Compose; ordered SQL migrations under db/migrations.
- Domain belongs in src/domain; server access in src/server; view code in app.
- External providers use server-side adapters and environment-only secrets.
- Docker multi-stage build; isolated web/database services per project.

First product record: food-items. Implement local flow, PostgreSQL mapping and sync policy in one vertical slice.

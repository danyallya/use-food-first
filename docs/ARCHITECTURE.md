# Architecture

- Web: Next.js App Router and server-only route handlers.
- UI: React, Tailwind CSS, React Icons, semantic HTML and explicit status.
- Offline: service worker for public shell; Dexie v2 stores local food items, the active draft and the existing unused outbox. The entry flow makes no server request and does not sync.
- Database: PostgreSQL 18 in Compose; ordered SQL migrations under db/migrations.
- Domain belongs in src/domain; server access in src/server; view code in app.
- External providers use server-side adapters and environment-only secrets.
- Docker multi-stage build; isolated web/database services per project.

First product record: food-items. FOOD-FIRST-001/002 add local validation, draft/review/save/delete, and an inventory lifecycle in src/domain/food-item.ts and src/client-db.ts. PostgreSQL mapping and repository tests are next in FOOD-FIRST-003; conflict, retry and sync rules remain separate work in FOOD-FIRST-004.

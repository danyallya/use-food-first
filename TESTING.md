# Test strategy

- Unit: domain validation, date/order boundaries, idempotency and serialization.
- Component: accessible labels, keyboard flow and loading/empty/error states.
- Integration: PostgreSQL migrations, repository behavior and sync conflicts.
- End-to-end: primary flow online, offline, refresh and reconnection.
- Release gate: typecheck, lint, unit tests and production build via npm run verify.

## Manual acceptance

Install the PWA, load once online, disconnect and confirm only public shell is available. Test keyboard, screen-reader labels, zoom, narrow screens, locale, database recovery and privacy-safe logs. FOOD-FIRST-001/002 add unit tests for food-item validation, calendar dates, lifecycle and serialization. Browser save/reload, keyboard-only and screen-reader acceptance remain pending.

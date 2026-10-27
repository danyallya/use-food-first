# Offline behavior

PWA stores the public entry page, offline notice, icon and versioned static assets after the first visit. It never caches API responses or personalized records. Dexie/outbox is a starter; product writes, sync, conflicts, encryption and retry UX are not implemented. Do not promise offline business flows until those tasks and reconnection tests pass.

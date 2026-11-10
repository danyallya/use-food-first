# Offline behavior

PWA stores the public entry page, offline notice, icon and versioned static assets after the first visit. It never caches API responses or personalized records. FOOD-FIRST-001/002 save a food-item draft and local record in this browser's IndexedDB without a server round-trip. The app reports that records are not synced. Browser storage may be cleared or unavailable; records are not encrypted or backed up. The outbox remains unused. Cross-device sync, conflicts, retry and reconnection behavior are not implemented.

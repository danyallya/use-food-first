# Dependency cache

This repository supports [Offline Dev Vault](https://github.com/danyallya/offline-dev-vault), the public npm cache.

1. Start the local clone at Documents/ChatGPT/miror or clone it from GitHub.
2. Run its scripts/use-registry.ps1 with this repository path. The .npmrc it creates is local and ignored.
3. Start the cache before Docker builds; BuildKit uses one stable npm cache key across all products.
4. Use npm ci when a lockfile exists. Cached packages are reused; an uncached package needs a first online fetch.
5. NPM_REGISTRY may be changed to the public npm registry if the mirror is unavailable.

No private package or credential belongs in the public mirror.

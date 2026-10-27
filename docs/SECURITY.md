# Security and data policy

- Collect the minimum data; treat user content as private by default.
- No authentication, authorization, encryption-at-rest or production backup policy exists yet. Do not enter real sensitive data.
- Keep secrets in untracked .env; never expose DB/provider keys to browsers.
- Never cache APIs, authenticated pages or personal records in the service worker.
- Food inventory and allergen notes may reveal household or health context. Use a private device and mock data during development; this product has no account access control, encryption, sync or backup.
- Use-by and best-before labels remain distinct, but dates and user-entered plans never determine food safety. Allergen notes are not verified; an empty note does not mean allergen-free.
- Define export, deletion, retention, access logs and incident response before launch.
- Domain guardrail: Do not infer food safety from date alone; distinguish use-by from best-before and handle allergens.
- Review threat model, roles and offline-device recovery before launch.

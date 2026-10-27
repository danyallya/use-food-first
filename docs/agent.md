# Agent guide

This is an independent product repository. Preserve its domain-specific workflow and policy.

1. Read TASK.md, BACKLOG.md, docs/PROGRESS.md, docs/DECISIONS.md and docs/SECURITY.md.
2. Work one item per branch: food/<task>-<short-description>.
3. Implement the smallest complete slice and never claim unfinished work is shipped.
4. Add tests; keep private values out of fixtures, logs and screenshots.
5. Run npm run verify where dependencies are available and record exact output.
6. Update TASK.md, BACKLOG.md and docs/PROGRESS.md with evidence and the exact next action.
7. Commit style: feat(food): establish expiry-aware household inventory records. Do not mention the coding tool in commit subjects.
8. Open one focused PR into main with tests, migration, offline and privacy effects.
9. Keep .env, .npmrc and secrets out of Git. Only edit this repository unless asked otherwise.

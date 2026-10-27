# Agent guide

This is an independent product repository. Preserve its domain-specific workflow and policy.

1. Read TASK.md, BACKLOG.md, docs/PROGRESS.md, docs/DECISIONS.md and docs/SECURITY.md.
2. Work one item per branch: food/<task>-<short-description>.
3. Implement coherent, reviewable domain slices and advance as much useful work as feasible during this product turn. Never claim unfinished work is shipped.
4. Add meaningful tests when behavior changes; use checks proportionate to documentation/config risk. Keep private values out of fixtures, logs and screenshots.
5. Run npm run verify where dependencies are available and record exact output.
6. Update TASK.md, BACKLOG.md and docs/PROGRESS.md with evidence and the exact next action.
7. Commit style: feat(food): establish expiry-aware household inventory records. Do not mention the coding tool in commit subjects.
8. Open a focused PR into main, or a documented prerequisite branch for a stacked PR, with tests, migration, offline and privacy effects.
9. Keep .env, .npmrc and secrets out of Git. Only edit this repository unless asked otherwise.

<!-- daily-cycle-v1 -->
## Turn in the full daily round

Read docs/DAILY.md before work. This is project 7 of 30; work only on this product and continue to the next after recording its handoff. Document blockers without marking unfinished tasks complete. Store the local daily report in docs/days/day-NNN.md and final SHA/PR in the central day ledger. Start or resume days only from the control state and user announcement.

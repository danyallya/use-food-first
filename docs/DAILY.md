# Daily turn: Use Food First

This is project **7 of 30**. Each user-announced day visits products 1 through 30 in exact order. Enter after the preceding visit is recorded, finish a reviewable handoff, then move to the next product. Product work is never parallel.

Workspace protocol: ../portfolio-ops/docs/DAILY_WORKFLOW.fa.md. State: ../portfolio-ops/docs/daily/STATE.json. If cloned independently, follow this document and local task records; the control repository is not needed to run the application.

Initial focus: Add an item with quantity, date type and discard decision.

Read TASK.md, BACKLOG.md, docs/PROGRESS.md, the agent guide and latest docs/days report. Inspect the current task branch and open PR. Make as much useful, cohesive progress as feasible in this product; several related tasks may be completed in its turn. Commit count and messages reflect actual domain work.

Run meaningful checks appropriate to changed behavior, offline state, accessibility and data impact. Record only checks actually run. A lockfile-free skipped CI run is not passed verification. Use a draft PR for unverified work and state the exact blocker.

Follow BRANCHING.md, including day/task identity in task branch names. Do not push features directly to main. If the preparation PR is still unmerged, branch from its head and target the dependent feature PR at that preparation branch; explain the dependency and retarget main after merge. Merging requires separate authorization.

Before committing, create docs/days/day-NNN.md from TEMPLATE.md and document the change, acceptance status, check results, blocker/next-day needs and next action. Commit it with the work. Capture the final commit SHA and PR URL in the central ledger after push.

If blocked, leave the task open. Do independent useful work, document the precise failure and required action, record the visit with its true outcome and continue to the next numbered product. This protocol does not automatically start day 1 or the following day.

<!-- governance-v1 -->

Review and issues: follow docs/REVIEW_AND_ISSUES.md. The daily report must include previous issue links, next actions, reviewed SHA, review kind, findings and actual GitHub review/comment URLs. In the control repository, run prepare-governance.ps1 after begin and complete its evidence before record.

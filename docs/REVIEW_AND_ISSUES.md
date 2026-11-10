# Code review and issue follow-up — Use Food First

At the start of each visit, fetch yesterday's issues, PRs, review comments and CI, together with older unresolved carryovers. Day 1 starts with preparation PRs and the existing backlog. Record state, priority, blocker and next action. Initial focus: Add an item with quantity, date type and discard decision.

Search before opening an issue; link existing reports instead of duplicating them. Real defects need impact, reproduction and acceptance criteria. Task issues need scope and acceptance criteria. Never manufacture issues or commits to create activity.

After changes, review the final HEAD diff and relevant tests. Cover security, privacy, offline behavior, accessibility and data changes as applicable. New commits invalidate stale review evidence. Identify your own inspection as self-review; never invent an independent reviewer or approve your own PR.

Publish the result on GitHub as a COMMENT review or PR conversation comment, including SHA, scope, findings and checks actually run. Link each open finding to a new or existing issue with priority P1/P2/P3. A no-findings statement applies only to the inspected scope. Reuse existing evidence for an unchanged SHA instead of posting duplicate comments.

Use Refs #N for association and Closes #N only for a fixing PR. Do not close unresolved issues; record completion after merge and acceptance verification. Merge requires separate authorization. If GitHub is unavailable, record the exact error and prerequisite; keep unverified PRs draft.

# Active task

**ID:** FOOD-FIRST-001  
**Title:** Add an item with quantity, date type and discard decision.

## Context

The technical shell exists; the product workflow does not. Build the first safe, end-to-end domain slice for Use Food First.

## Acceptance criteria

- Type the food-items domain record, validation rules and lifecycle.
- Add a create/review flow that works without a server round-trip.
- Persist a draft with Dexie and show saved, unsaved and sync state truthfully.
- Test valid/invalid input, date/order boundaries and serialization.
- Document retention, deletion and limitations of the offline slice.
- Respect this guardrail: Do not infer food safety from date alone; distinguish use-by from best-before and handle allergens.

## Status

Not started. Use food/001-food-first. After acceptance passes, update progress and set the next task.

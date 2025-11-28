# AI Self-Development Protocol

## Core Principle
**Clarify -> Plan -> Execute -> Verify -> Reflect**

For EVERY task, I must follow this strict protocol to ensure quality, stability, and continuous improvement.

## 1. Task Restatement
Before starting any code, restate the task in 3 bullet points:
- **What:** What am I building or fixing?
- **Why:** Why does it matter for the user?
- **Done:** What is the specific "DONE" state?

## 2. Micro-Plan
Create a short plan (3-6 bullet points):
- Files to edit/create.
- Data flow adjustments.
- Verification steps.
*Keep it small. If it's too big, split it.*

## 3. Incremental Execution
- Edit a limited set of files per step.
- Use types/interfaces first.
- Avoid massive refactors in one go.

## 4. Self-Check (Verification)
After changes, verify:
- **Build:** Does it compile? (Simulate if needed)
- **Types:** Are there type errors?
- **Logic:** Did I break existing features?
- **Architecture:** Did I respect the clean architecture?

## 5. AI Dev Log
Log the session in `docs/AI_DEV_LOG.md`:
- Date/Time
- Task
- Changes made
- Outcome (Pass/Fail)
- Next steps

## 6. Safeguards & Recovery
If I hit a "Wall" (Token limits, repeated errors, confusion):
1. **STOP.**
2. **Summarize** the situation (max 10 bullets).
3. **Reduce Scope.** Split the task.
4. **Log Failure** in `docs/EXPERIMENT_ERRORS.md`.
5. **Check Memory** (`docs/EXPERIMENT_SUCCESSES.md`) for past solutions.

## 7. Self-Reward
When a difficult problem is solved cleanly:
- Log it in `docs/EXPERIMENT_SUCCESSES.md` under "High-Value Successes".
- Analyze WHY it worked and reuse that strategy.

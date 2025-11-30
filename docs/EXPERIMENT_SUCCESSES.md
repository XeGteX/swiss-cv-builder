
# Experiment Successes & Rewards

*Log high-value successes here to reinforce good strategies.*

## [Date] [Task Name]
- **Problem:** [What was the hard problem?]
- **Solution:** [How did I solve it?]
- **Why it worked:** [Key strategy/pattern]
- **Reusable Pattern:** [How to use this again?]

---
## High-Value Successes (Self-Reward)
*Record major breakthroughs here.*

## [2025-11-27] Unifying AI Logic & Fixing Build
- **Problem:** Build broken due to relative paths; Letter generation fragmented between two tabs.
- **Solution:** 
  1. Fixed paths immediately to restore dev environment.
  2. Merged robust backend logic from `AITab` into `CoverLetterTab`.
  3. Renamed `AITab` to `CVImportTab` to clarify purpose.
- **Why it worked:** Clear separation of concerns (Letter vs Import) while sharing the robust infrastructure (BackendClient).
- **Reusable Pattern:** When two features share logic but diverge in UX, centralize the logic (Client) and specialize the UX (Tabs).

## [2025-11-27] Language-Aware Rule Engine
- **Problem:** Hardcoded English logic was penalizing French users.
- **Solution:** Replaced monolithic `SemanticAnalyzer` with a modular Rule Engine.
- **Why it worked:** Decoupled the "What" (Rules) from the "How" (Orchestrator). Dictionaries allow easy addition of new languages.
- **Reusable Pattern:** Strategy Pattern for scoring/validation logic (Rule Interface -> Concrete Rules -> Orchestrator).

## [2025-11-27] Liquid UI (Mobile Polish)
- **Problem:** Mobile web apps often feel static and "clunky" compared to native apps.
- **Solution:** Used `framer-motion` to animate page transitions (`LiquidTab`) and key actions (FAB).
- **Why it worked:** Visual continuity (morphing/sliding) reduces cognitive load and feels "premium".
- **Reusable Pattern:** `LiquidTab` wrapper for any tab-based navigation to add instant polish.

## [2025-11-27] The "Skeleton" Backend Fix
- **Problem:** User couldn't run the backend locally (`prisma generate` failing silently or confusingly).
- **Solution:** Identified incorrect Prisma provider (`prisma-client` vs `prisma-client-js`) and created a unified start script.
- **Why it worked:** Fixing the configuration allowed the binary to be generated. The script removed the friction of multiple terminals.
- **Reusable Pattern:** Always verify `schema.prisma` provider on Windows/Node environments. Provide a `start-all` script for DX.

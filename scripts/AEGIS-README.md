# 🛡️ AEGIS SENTINEL

**AI Guardian System** - Protects your codebase from AI-induced regressions.

## What is It?

AEGIS Sentinel is a **defensive validation layer** that runs before committing changes. It performs three critical checks:

1. **Import Validation** 🔍 - Detects broken imports (dead links)
2. **Type Checking** ✅ - Validates TypeScript compilation
3. **Circular Dependencies** 🔄 - Detects dependency cycles

## Quick Start

```bash
# Run the guardian
npm run sentinel
```

## Output

```
🛡️  AEGIS SENTINEL - Guardian Awakens

📦 STEP 1: Validating Imports...
✅ Scanned 142 imports
✅ All imports are valid!

🔍 STEP 2: Type Checking...
✅ Type checking passed (1234ms)

🔄 STEP 3: Circular Dependency Check...
✅ No circular dependencies detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SENTINEL REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Import Validation: ✅ PASS
   Files scanned: 47
   Imports checked: 142
   Broken imports: 0

🔍 Type Checking: ✅ PASS
   Type errors: 0
   Duration: 1234ms

🔍 Circular Dependencies: ✅ PASS
   Cycles detected: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  SYSTEM STATUS: ✅ HEALTHY
⏱️  Total duration: 2456ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 System health written to: .ai/system-health.json
```

## System Health JSON

After each run, Sentinel writes `.ai/system-health.json`:

```json
{
  "status": "HEALTHY",
  "timestamp": 1713456789000,
  "checks": {
    "imports": {
      "passed": true,
      "totalFiles": 47,
      "totalImports": 142,
      "brokenCount": 0
    },
    "types": {
      "passed": true,
      "errorCount": 0,
      "duration": 1234
    },
    "circularDeps": {
      "passed": true,
      "cycleCount": 0
    }
  },
  "summary": "✅ All checks passed. System is healthy."
}
```

## Exit Codes

- `0` - All checks passed (HEALTHY)
- `1` - One or more checks failed (BROKEN)

## Integration

### Git Hooks (Recommended)

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run sentinel || (echo "❌ Sentinel checks failed. Fix errors before committing." && exit 1)
```

### CI/CD

```yaml
# .github/workflows/test.yml
- name: Run Sentinel
  run: npm run sentinel
```

## Files Created

```
.ai/
├── system-health.json     # Current system state
├── history/
│   └── 2024-01-15.json    # Daily snapshots
└── reports/               # Future: QA Agent reports

scripts/
├── sentinel.ts            # Main orchestrator
└── utils/
    ├── import-scanner.ts  # Dead link detection
    ├── type-checker.ts    # TS validation
    └── dep-graph.ts       # Circular dep detection
```

## What It Protects Against

### ❌ Before Sentinel
```typescript
// AI modifies App.tsx
import { Toto } from './components/Toto'; // ❌ File deleted!

// Builds fail later...
Module not found: Can't resolve './components/Toto'
```

### ✅ After Sentinel
```bash
$ npm run sentinel

❌ Found 1 broken imports
   src/App.tsx:42 - import './components/Toto' (not found)

🛡️  SYSTEM STATUS: ❌ BROKEN
```

## Architecture

```
┌─────────────────────────────────────────┐
│          AEGIS SENTINEL                 │
├─────────────────────────────────────────┤
│                                         │
│  1. Import Scanner (Dead Link Hunter)  │
│     ↓                                   │
│  2. Type Checker (Compiler Judge)      │
│     ↓                                   │
│  3. Dep Graph (Cycle Breaker)          │
│     ↓                                   │
│  4. Health Reporter                    │
│                                         │
└─────────────────────────────────────────┘
```

## Future: AEGIS Phases

- [x] **Phase 1: Sentinel** (Guardian) - Validate integrity
- [ ] **Phase 2: Recorder** (Witness) - Capture errors
- [ ] **Phase 3: QA Agent** (Healer) - Auto-diagnosis

## Philosophy

> "Our baby deserves protection. We build the walls that keep chaos out."

This is OUR project. Sentinel ensures AI modifications never break what we've built with love.

---

**Built with ❤️ for resilient codebases.**

# 🧹 AEGIS Cleaner Agent

**Intelligent Technical Debt Hunter** - Identifies dead code without deleting anything.

## What It Does

The Cleaner Agent performs **3 types of scans**:

### 1. 🔍 Orphan Detection (Dead Code)
- Builds dependency graph from entry points
- Identifies files never imported
- High confidence detection

### 2. 👻 Legacy Pattern Detection
- Detects versioning patterns: `*.v1.*`, `*.v2.*`
- Finds backup files: `*.old.*`, `*.backup.*`
- Identifies temp files: `temp_*`, `copy_of_*`

### 3. 🗑️ Empty Shell Detection
- Files < 50 bytes
- Files with only comments/imports

## Usage

```bash
# Run the cleaner agent
tsx scripts/test-cleaner.ts
```

## Output

The agent generates `.ai/cleanup-manifest.json`:

```json
{
  "timestamp": 1730000000000,
  "totalScanned": 147,
  "candidates": [
    {
      "path": "src/components/OldHeader.tsx",
      "reason": "ORPHAN",
      "confidence": "HIGH",
      "description": "File is never imported in the dependency graph."
    },
    {
      "path": "src/utils/date-helper.v1.ts",
      "reason": "LEGACY_PATTERN",
      "confidence": "HIGH",
      "description": "Detected legacy pattern while modern version exists: date-helper.ts"
    },
    {
      "path": "src/temp_test.tsx",
      "reason": "EMPTY_SHELL",
      "confidence": "HIGH",
      "description": "File is only 12 bytes.",
      "fileSize": 12
    }
  ],
  "summary": {
    "orphans": 3,
    "legacy": 2,
    "empty": 1,
    "duplicates": 0
  }
}
```

## How It Works

### Dependency Graph
1. Starts from entry points:
   - `src/main.tsx`
   - `server/index.ts`
   - `server/app.ts`

2. Builds import graph recursively

3. Marks all reachable files

4. Reports unreachable = orphans

### Legacy Detection
Scans for patterns:
- `/\.old\./i`
- `/\.backup\./i`
- `/_v\d+\./i`
- `/\.v\d+\./i`
- `/^temp_/i`
- `/^copy_of_/i`

### Empty Shell Detection
1. Check file size < 50 bytes
2. Strip comments & imports
3. If remaining content < 20 chars → empty

## Safety

✅ **NEVER deletes files**  
✅ Only generates reports  
✅ Human review required  
✅ Confidence levels provided  

## Integration with Git

```bash
# Before major refactor
npm run cleaner

# Review cleanup-manifest.json
cat .ai/cleanup-manifest.json

# Manually delete confirmed orphans
```

## Exclusions

The agent **automatically excludes**:
- `node_modules/`
- `.git/`
- `dist/`, `build/`
- `__tests__/`, `*.test.*`, `*.spec.*`
- Config files (`vite.config`, `tsconfig`, `eslint`)

## Future Enhancements

- [ ] Duplicate file detection (same content, different paths)
- [ ] Large file warnings (>1MB)
- [ ] Unused export detection
- [ ] Auto-fix mode (with confirmation)

---

**Part of Project AEGIS 🛡️**

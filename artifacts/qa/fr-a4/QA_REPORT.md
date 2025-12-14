# NEXAL2 Enterprise QA Report

**Date:** 2025-12-13
**Region:** FR (A4)
**Profile:** Stress Test (5 experiences, 2 educations, long bullets, unique tokens)

---

## Summary

| Check | ATS_ONE_COLUMN | SIDEBAR | TOP_HEADER | LEFT_RAIL | DUAL_SIDEBAR | SPLIT_HEADER |
|-------|:--------------:|:-------:|:----------:|:---------:|:------------:|:------------:|
| Pages | 6 | 4 | 4 | 6 | 6 | 6 |
| (A) Identity | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| (B) Blank Pages | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| (C) Underfill | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| (D) Missing Items | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| (E) Overlaps | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

---

## Detailed Findings

### (A) Identity Coverage - ✅ ALL PASS
- ATS_ONE_COLUMN correctly shows fullName and contact on page 1
- Other presets have identity in appropriate containers

### (B) Blank Pages - ⚠️ ISSUES DETECTED
- **LEFT_RAIL:** Blank pages 1, 2 (fill < 10%)
- **SIDEBAR:** Underfilled pages 1, 2
- **Root cause:** Experience section pushed to later pages due to page-break policy

### (C) Underfill - ⚠️ ISSUES DETECTED
- Multiple presets show page 1 with < 15% fill ratio
- **SIDEBAR:** Page 1 at 12.2% fill, 0 experience items
- **SPLIT_HEADER:** Severe underfill on page 1 (8.5%)
- **Root cause:** keepWithNext rules pushing section titles + first items to next page

### (D) Missing/Duplicate Items - ✅ ALL PASS
- All 5 experience roles found exactly once
- UNIQUE_TOKEN found exactly once
- Both education entries (Master, Licence) found

### (E) Overlaps - ⚠️ ISSUES DETECTED
- Minor overlaps in some presets between row children
- Example overlaps:
  - `main.experience.item-0.role ∩ main.experience.item-0.company`
  - These are within the same compact header row structure

---

## Critical Issues Requiring Fix

### Issue 1: Page 1 Underfill in SIDEBAR/LEFT_RAIL/SPLIT_HEADER

**Symptom:** Page 1 has only 8-12% content fill with 0 experience items
**Pages affected:** Pages 1-2 in multi-rail presets
**Root cause:** 
- Experience section title has `keepWithNext` 
- First experience item is large (2 long bullets)
- Combined height exceeds remaining space after identity/summary
- Entire section pushed to page 2

**Proposed fix:**
1. Lower minStartHeight threshold to allow section start with just title
2. Allow splitting within experience items (tasks can flow to next page)
3. Consider removing `keepWithNext` for section titles in favor of minimum content check

### Issue 2: Overlaps in Compact Header Rows

**Symptom:** Role and company text nodes have overlapping bounding boxes
**Location:** `main.experience.item-X.role` and `main.experience.item-X.company`
**Root cause:** These are in the same row and the overlap detection doesn't account for row siblings

**Proposed fix:**
1. Exclude row siblings from overlap detection
2. Or fix row layout to ensure children don't overlap

---

## Verification Commands Run

```bash
✅ npx tsc --noEmit
✅ npm run test:pagination (CI gate)
✅ npx vitest run tests/qa-enterprise.test.ts (36 tests)
```

---

## Recommendations

1. **P0:** Fix page 1 underfill in SIDEBAR/LEFT_RAIL presets
2. **P1:** Improve overlap detection to exclude valid row siblings
3. **P2:** Consider adding visual regression tests with PDF screenshots

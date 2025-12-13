# NEXAL2 Worklog

**Project**: SceneGraph Architecture  
**Start Date**: 2025-12-12

---

## Log Format

Each entry follows:
```
## [DATE] - [PHASE] - [TITLE]
- Files: list
- Reason: why
- Tests: how verified
- Screenshot: path (if visual)
```

---

## 2025-12-12 - Phase 0 - Specification Created

**Files Modified**:
- `docs/nexal-scenegraph-spec.md` (NEW)
- `docs/nexal-worklog.md` (NEW)

**Reason**:
Established clear contracts before writing code. Types, rules, and visual checklist defined.

**Tests**:
- N/A (documentation only)

**Next Step**:
Create `src/nexal2/` folder structure and implement types.

---

## 2025-12-12 - Phase 1 - Folder Structure + Stubs

**Files Created**:
- `src/nexal2/types.ts` - All type definitions
- `src/nexal2/index.ts` - Public barrel export
- `src/nexal2/scenegraph/buildScene.ts` - Scene graph builder
- `src/nexal2/scenegraph/index.ts` - Barrel
- `src/nexal2/layout/computeLayout.ts` - Layout engine
- `src/nexal2/layout/index.ts` - Barrel
- `src/nexal2/renderers/html/HTMLRenderer.tsx` - HTML renderer
- `src/nexal2/renderers/html/index.ts` - Barrel
- `src/nexal2/renderers/pdf/PDFRenderer.tsx` - PDF renderer
- `src/nexal2/renderers/pdf/index.ts` - Barrel

**Reason**:
Phase 1 baseline: isolated NEXAL2 module with no imports from existing renderers.

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

**Next Step**:
Phase 3 integration with feature flag in PreviewPane.

---

## 2025-12-12 - Phase 2 - MVP HTML Renderer

**Files Created**:
- `src/nexal2/test/fixtures.ts` - Mock profile A4/LETTER
- `src/nexal2/test/Nexal2TestPage.tsx` - Visual test page
- `src/nexal2/test/index.ts` - Barrel

**Files Modified**:
- `src/nexal2/scenegraph/buildScene.ts` - Full implementation (sidebar + main + sections)
- `src/App.tsx` - Added route /nexal2-test

**Reason**:
Phase 2 MVP: visible HTML renderer with deterministic layout.

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

**Next Step**:
Visual validation at http://localhost:5173/nexal2-test

---

## 2025-12-12 - Phase 2.1 - Fix Layout Issues

**Files Modified**:
- `src/nexal2/scenegraph/buildScene.ts` - Photo placeholder, white text colors
- `src/nexal2/renderers/html/HTMLRenderer.tsx` - Image rendering, bullet rendering
- `src/nexal2/test/Nexal2TestPage.tsx` - Stress test controls

**Fixes**:
- Photo toggle now shows placeholder (👤) when no photo URL
- Sidebar text now white (#FFFFFF) for readability
- List items render with bullet prefix (•)
- Images render as circular with placeholder or actual photo
- Stress test: skill count (1-20), experience count (1-8), regenerate button

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

**Next Step**:
Visual validation at http://localhost:5173/nexal2-test

---

## 2025-12-12 - Phase 2.2 - PDF Renderer

**Files Modified**:
- `src/nexal2/renderers/pdf/PDFRenderer.tsx` - Complete rewrite with image/bullet matching HTML
- `src/nexal2/test/Nexal2TestPage.tsx` - Added Download PDF button with pdf().toBlob()

**Features**:
- PDFRenderer reads same LayoutTree as HTMLRenderer
- Image placeholder (👤) for photos
- Bullet prefix (•) for list items
- Absolute positioning matching HTML
- Download button generates client-side PDF blob

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

**Next Step**:
Visual comparison HTML vs PDF at http://localhost:5173/nexal2-test

---

## 2025-12-12 - Phase 2.3 - NodeType + Style Inheritance

**Files Modified**:
- `src/nexal2/types.ts` - Added `nodeType: SceneNodeType` to LayoutNode, `letterSpacing` to ComputedStyle
- `src/nexal2/layout/computeLayout.ts` - Complete rewrite with nodeType propagation + style inheritance
- `src/nexal2/renderers/html/HTMLRenderer.tsx` - nodeType branching + SVG placeholder (no emoji)
- `src/nexal2/renderers/pdf/PDFRenderer.tsx` - nodeType branching + SVG placeholder (no emoji)

**Changes**:
- **nodeType**: Every LayoutNode now has `nodeType: SceneNodeType` matching the source SceneNode
- **Style Inheritance**: `color`, `fontFamily`, `fontSize`, `lineHeight`, `fontWeight`, `textAlign`, `textTransform`, `letterSpacing` now inherit from parent to child unless explicitly overridden
- **Renderers**: Removed all `nodeId.includes(...)` heuristics, branch strictly on `nodeType`
- **Photo Placeholder**: Replaced emoji 👤 with deterministic SVG icon (circle + head/shoulders)

**Impact**:
- Sidebar email/phone/skills text now correctly inherits white color from sidebar container
- Bullets only appear for `nodeType === 'listItem'`, not for role/company/dates
- PDF placeholder no longer shows "=d" or broken emoji

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

---

## 2025-12-12 - Phase 2.4 - Unit Normalization + Parity Lock

**Files Modified**:
- `src/nexal2/renderers/html/HTMLRenderer.tsx` - PT_TO_PX conversion (96/72) for all geometry
- `src/nexal2/renderers/pdf/PDFRenderer.tsx` - Added layoutSignature footer
- `src/nexal2/test/Nexal2TestPage.tsx` - layoutSignature computation and display

**Changes**:
- **PT_TO_PX = 96/72**: All HTML frame values (x, y, width, height, fontSize, marginRight) now converted from pt to px
- **lineHeight fix**: Now outputs `${fontSize * lineHeight * scale * PT_TO_PX}px` for perfect PDF match
- **layoutSignature**: 8-char hex hash of all frame data, displayed in HTML stats and PDF footer
- **Parity proof**: HTML and PDF show identical layoutSignature → same underlying LayoutTree

**Impact**:
- HTML with scale=1 now matches PDF dimensions visually
- Text sizes and spacing identical between HTML and PDF
- Signature proves both renderers use identical layout data

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

---

## 2025-12-12 - Phase 2.5 - Layout Inheritance Fix + Compare Mode

**Files Modified**:
- `src/nexal2/layout/computeLayout.ts` - Fixed inheritance bug + BULLET_INDENT_PT
- `src/nexal2/scenegraph/buildScene.ts` - Sidebar root typographic style
- `src/nexal2/test/Nexal2TestPage.tsx` - Side-by-side compare mode with PDF iframe

**Bugs Fixed**:
- **Inheritance bug**: `container/section/list` were passing `parentStyle` instead of `computedStyle` → children couldn't inherit from their immediate parent
- **BULLET_INDENT_PT=10**: List item measurement now accounts for bullet+gap space, matching renderer wrapping

**Changes**:
- **Sidebar root style**: `color: #FFFFFF`, `fontFamily: sans`, `fontSize: 10`, `lineHeight: 1.4` → children inherit white text without explicit overrides
- **Compare mode**: Side-by-side HTML and PDF preview with iframe, same size (PT_TO_PX applied)
- **Refresh PDF Preview button**: Generates blob and displays inline for visual comparison

**Tests**:
- `npx tsc --noEmit` → PASS (0 errors)
- `npm run build` → PASS (exit code 0)

---

## Template for Future Entries

```markdown
## YYYY-MM-DD - Phase X - Title

**Files Modified**:
- 

**Reason**:


**Tests**:
- Command: `npm run test:nexal2`
- Result: PASS/FAIL

**Screenshot**:
![description](path/to/screenshot.png)

**Notes**:

```

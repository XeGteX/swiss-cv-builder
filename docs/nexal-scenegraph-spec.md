# NEXAL2 SceneGraph Architecture Specification

**Version**: 1.0  
**Date**: 2025-12-12  
**Status**: Draft

---

## 1. Overview

NEXAL2 is a parallel architecture (feature-flagged) that introduces a **SceneGraph-based rendering pipeline** for the CV builder. It aims to achieve:

- **Single source of truth** for layout geometry
- **Deterministic rendering** across HTML and PDF
- **Future-proof** for inline editing and drag & drop

### Design Principles

1. **No magic numbers** - All geometry comes from `computeLayout()`
2. **No CSS layout** - HTML uses absolute positioning from `LayoutTree`
3. **No flexbox auto** - PDF renderer places elements at computed coordinates
4. **Profile stays untouched** - Uses existing `CVProfile` and `DesignConfig` types

---

## 2. Type Definitions

### 2.1 SceneNode

Basic building block of the scene graph.

```typescript
type SceneNodeType = 
  | 'document'    // Root
  | 'page'        // A4 or Letter page
  | 'container'   // Generic container (sidebar, main)
  | 'section'     // CV section (experience, education)
  | 'text'        // Text block
  | 'image'       // Photo
  | 'list'        // Bullet list
  | 'listItem'    // Single bullet
  | 'spacer';     // Explicit spacing

interface SceneNode {
  id: string;                    // Unique identifier (e.g., "sidebar.contact.email")
  type: SceneNodeType;
  children?: SceneNode[];
  
  // Content (only for leaf nodes)
  content?: string;
  
  // Source field path (for inline editing)
  fieldPath?: string;            // e.g., "personal.contact.email"
  
  // Style intent (NOT CSS - semantic)
  style?: SceneStyle;
}
```

### 2.2 SceneStyle

Semantic styling properties (not CSS).

```typescript
interface SceneStyle {
  // Typography
  fontSize?: number;             // In points (pt)
  fontWeight?: 'normal' | 'bold';
  fontFamily?: 'sans' | 'serif' | 'mono';
  lineHeight?: number;           // Multiplier (1.2, 1.4, etc.)
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase';
  letterSpacing?: number;        // In pt
  
  // Colors
  color?: string;                // Hex or rgba
  backgroundColor?: string;
  
  // Spacing (all in pt)
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  gap?: number;                  // For containers
  
  // Borders
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  
  // Layout hints
  direction?: 'row' | 'column';
  width?: number | 'auto';       // In pt
  height?: number | 'auto';
  minHeight?: number;
  maxWidth?: number;
}
```

### 2.3 SceneDocument

The complete scene graph for a CV.

```typescript
interface SceneDocument {
  version: '1.0';
  paperFormat: 'A4' | 'LETTER';
  pageCount: number;
  pages: SceneNode[];            // Array of page nodes
  metadata: {
    generatedAt: string;
    profileId: string;
    designHash: string;
  };
}
```

### 2.4 LayoutFrame

Computed absolute position for a node.

```typescript
interface LayoutFrame {
  x: number;      // Left position in pt
  y: number;      // Top position in pt
  width: number;  // Width in pt
  height: number; // Height in pt
}
```

### 2.5 LayoutNode

A node with computed layout.

```typescript
interface LayoutNode {
  nodeId: string;
  frame: LayoutFrame;
  children?: LayoutNode[];
  
  // Computed style values (resolved)
  computedStyle: {
    fontSize: number;
    lineHeight: number;
    color: string;
    backgroundColor?: string;
  };
}
```

### 2.6 LayoutTree

The complete layout result.

```typescript
interface LayoutTree {
  pages: LayoutNode[];
  bounds: {
    width: number;   // Paper width in pt
    height: number;  // Paper height in pt
  };
  constraints: LayoutConstraints;
}

interface LayoutConstraints {
  paperFormat: 'A4' | 'LETTER';
  margins: { top: number; right: number; bottom: number; left: number };
  sidebarWidth: number;
  sidebarPosition: 'left' | 'right';
}
```

---

## 3. Core Contracts

### 3.1 buildScene()

Transforms profile + design into a SceneDocument.

```typescript
function buildScene(
  profile: CVProfile,
  design: DesignConfig
): SceneDocument;
```

**Rules**:
- Pure function (no side effects)
- Uses `showPhoto` flag from design
- Uses `targetCountry` for region-specific logic
- Creates hierarchical structure: page → [sidebar, main]

### 3.2 computeLayout()

Transforms SceneDocument into LayoutTree.

```typescript
function computeLayout(
  scene: SceneDocument,
  constraints: LayoutConstraints
): LayoutTree;
```

**Rules**:
- Pure function
- Text measurement via `measureText()` helper
- Single-page for MVP (no automatic pagination)
- Gap/margin/padding all computed deterministically

### 3.3 Renderers

#### HTML Renderer

```typescript
function renderHTML(layoutTree: LayoutTree): React.ReactElement;
```

**Rules**:
- All elements use `position: absolute`
- `left`, `top`, `width`, `height` from LayoutFrame
- NO CSS flexbox, grid, or flow layout
- Colors/fonts applied as inline styles

#### PDF Renderer

```typescript
function renderPDF(layoutTree: LayoutTree): React.ReactElement;
```

**Rules**:
- Uses @react-pdf/renderer primitives
- `View` with absolute positioning
- `Text` with explicit dimensions
- NO wrap-based layout (all pre-computed)

---

## 4. Supported Style Properties

| Property | Unit | HTML | PDF | Notes |
|----------|------|------|-----|-------|
| fontSize | pt | ✓ | ✓ | |
| fontWeight | - | ✓ | ✓ | |
| fontFamily | - | ✓ | ✓ | Mapped to system fonts |
| lineHeight | multiplier | ✓ | ✓ | |
| textAlign | - | ✓ | ✓ | |
| textTransform | - | ✓ | ✓ | |
| letterSpacing | pt | ✓ | ✓ | |
| color | hex/rgba | ✓ | ✓ | |
| backgroundColor | hex/rgba | ✓ | ✓ | |
| marginTop/Bottom/Left/Right | pt | ✓ | ✓ | |
| paddingTop/Bottom/Left/Right | pt | ✓ | ✓ | |
| gap | pt | ✓ | ✓ | |
| borderWidth | pt | ✓ | ✓ | |
| borderColor | hex/rgba | ✓ | ✓ | |
| borderStyle | - | ✓ | ✓ | |
| borderRadius | pt | ✓ | ✓ | |
| width | pt | ✓ | ✓ | |
| height | pt | ✓ | ✓ | |

---

## 5. Text Measurement

```typescript
interface TextMeasurement {
  width: number;
  height: number;
  lineCount: number;
}

function measureText(
  text: string,
  style: { fontSize: number; fontFamily: string; lineHeight: number },
  maxWidth: number
): TextMeasurement;
```

**Implementation Options**:
1. Canvas `measureText()` (client-side)
2. Pre-computed font metrics table (deterministic)
3. Server-side measurement (if needed)

**MVP**: Use approximate character-based calculation:
```
avgCharWidth = fontSize * 0.5
charsPerLine = maxWidth / avgCharWidth
lines = ceil(text.length / charsPerLine)
height = lines * fontSize * lineHeight
```

---

## 6. Pagination Rules

### MVP (v1): Single Page
- No automatic page breaks
- Content may overflow (visible in debug)
- User must manage content length

### Future (v2): Multi-Page
- Page break before orphaned section titles
- Keep experience items together
- Footer handling

---

## 7. Compatibility Rules

### HTML Renderer

❌ **FORBIDDEN**:
- `display: flex` / `display: grid`
- `float`
- `margin: auto`
- `position: relative` with offset
- Any CSS that affects layout

✅ **ALLOWED**:
- `position: absolute`
- `left`, `top`, `width`, `height` (from LayoutFrame)
- `font-*`, `color`, `background-*` (styling only)
- `border-*` (styling only)
- `overflow: hidden` (clipping only)

### PDF Renderer

❌ **FORBIDDEN**:
- React-PDF flexbox (`flex: 1`, `flexDirection` on View)
- Auto-sizing
- Wrap-based layouts

✅ **ALLOWED**:
- `position: 'absolute'`
- Explicit dimensions
- `wrap={false}` on all containers

---

## 8. Definition of Done (Visual)

### Checklist for Each Phase

- [ ] No element overlaps another element
- [ ] Padding visible on all sides (not collapsed)
- [ ] Section titles aligned consistently
- [ ] Text does not overflow container bounds
- [ ] Sidebar width matches design config
- [ ] Main content starts after sidebar gap
- [ ] Font sizes match theme config
- [ ] Colors match accent color from design
- [ ] Same visual output in HTML and PDF
- [ ] Fixture profile renders identically on refresh

---

## 9. File Structure

```
src/nexal2/
├── index.ts                    # Public exports
├── types.ts                    # All type definitions
├── scenegraph/
│   ├── index.ts
│   ├── buildScene.ts           # buildScene() implementation
│   └── nodes/
│       ├── createTextNode.ts
│       ├── createSectionNode.ts
│       └── createContainerNode.ts
├── layout/
│   ├── index.ts
│   ├── computeLayout.ts        # computeLayout() implementation
│   ├── measureText.ts          # Text measurement
│   └── constraints.ts          # Paper constraints
└── renderers/
    ├── html/
    │   ├── index.ts
    │   ├── HTMLRenderer.tsx    # renderHTML()
    │   └── components/
    │       ├── LayoutBox.tsx
    │       └── TextBox.tsx
    └── pdf/
        ├── index.ts
        ├── PDFRenderer.tsx     # renderPDF()
        └── components/
            ├── PDFBox.tsx
            └── PDFText.tsx
```

---

## 10. Integration

### Feature Flag

```env
VITE_NEXAL2=1
```

### PreviewPane Integration

```tsx
// In PreviewPane.tsx
const useNexal2 = import.meta.env.VITE_NEXAL2 === '1';

if (useNexal2) {
  const scene = buildScene(profile, design);
  const layout = computeLayout(scene, constraints);
  return <HTMLRenderer layout={layout} />;
} else {
  // Existing React-PDF preview
}
```

---

## Appendix A: Paper Dimensions

| Format | Width (pt) | Height (pt) | Width (mm) | Height (mm) |
|--------|------------|-------------|------------|-------------|
| A4     | 595.28     | 841.89      | 210        | 297         |
| Letter | 612        | 792         | 215.9      | 279.4       |

---

## Appendix B: Default Theme Values

```typescript
const DEFAULT_THEME = {
  margins: { top: 40, right: 40, bottom: 40, left: 40 },
  sidebarWidth: 170,
  sidebarGap: 20,
  fontSize: {
    name: 18,
    title: 12,
    sectionTitle: 11,
    body: 10,
    small: 9,
  },
  lineHeight: 1.4,
  spacing: {
    sectionMargin: 16,
    itemMargin: 8,
    subsectionMargin: 6,
  },
};
```

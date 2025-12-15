# CHANGELOG - Premium Pack v1

## [1.1.0] - 2025-12-15

### Frame Coordinate Fix

**Problem:** Inspector showed huge DOM vs Layout deltas (Δy ~150px) because frames used local coordinates.

**Solution:** Added `getAbsoluteFrame()` utility that traverses parent chain to compute page-absolute coordinates.

| File | Change |
|------|--------|
| `LayoutInspectorPanel.tsx` | Added `getAbsoluteFrame()`, `layoutTree` prop |
| `HTMLRenderer.tsx` | Passes `layoutTree` to inspector |

### New Element Variants

**Skills:**
| Variant | ID | Description |
|---------|-----|-------------|
| ATS-Friendly | `ats-text` | Comma-separated plain text, no decorations |

**Languages:**
| Variant | ID | Description |
|---------|-----|-------------|
| ATS-Friendly | `text-only` | Names only, comma-separated |
| Premium Pills | `pills` | Name + level badge |

### UI Location

**Design Tab → "Styles d'éléments"** section:
- Expand "Compétences" → select "ATS-Friendly"
- Expand "Langues" → select "ATS-Friendly" or "Pilules de Niveau"

---

## [1.0.0] - 2025-12-15

### New DesignConfig Properties

| Property | Type | Default | Location in UI |
|----------|------|---------|----------------|
| `sectionTitleVariant` | `'line' \| 'minimal' \| 'accent'` | `'line'` | Design > Détails visuels > Style des titres |
| `density` | `'compact' \| 'normal' \| 'airy'` | `'normal'` | Design > Détails visuels > Densité |

### UI Location

**Design Tab → "Détails visuels" section** (marked with PREMIUM badge):

1. **Style des titres de section** (NEW)
   - `line` = Classic underline separator
   - `minimal` = Text only, no decoration  
   - `accent` = **Premium pill** with accent background

2. **Densité du contenu** (NEW)
   - `compact` = Dense layout
   - `normal` = Balanced
   - `airy` = Spacious

### Debug & Inspector

**Enable debug mode:**
```
http://localhost:5173/?debugLayout=1
```

**Using Layout Inspector:**
1. Click any element in the CV preview
2. Inspector panel appears (bottom-right)
3. Shows: nodeId, nodeType, iconName (for icons), frame coordinates
4. **DOM vs Layout Δ should now be < 2px** (green)
5. Press **ESC** to close inspector

### Icon Nodes

Icon nodes now have `iconName` field:
- `email` → Envelope icon
- `phone` → Handset icon  
- `location` → Pin icon
- `linkedin` → LinkedIn logo
- `github` → GitHub logo

### Tests

```bash
npx vitest run tests/premium-pack-qa.test.ts
```

Expected: **19 tests pass ✓**

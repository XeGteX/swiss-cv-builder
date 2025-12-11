# 🧠 CHAMELEON V2 - PROJECT CONSCIOUSNESS
> **Last Updated**: 2025-12-11T02:37:00
> **Stability Score**: 72/100 🟡
> **Status**: OPERATIONAL - Minor issues

---

## 📜 L'ADN DU PROJET (RÈGLES INVIOLABLES)

### Architecture Core
| Règle | Description | Pourquoi |
|-------|-------------|----------|
| **PDF = React-PDF ONLY** | `@react-pdf/renderer` côté client | Puppeteer supprimé, pas de serveur |
| **Store = Zustand V2** | Single source of truth | `useCVStoreV2` pour tout |
| **No localStorage duplex** | `targetCountry` → store only | Évite 2 sources de vérité |

### International Rules (Country Logic)
| Pays | Photo | Format | Date |
|------|-------|--------|------|
| 🇺🇸 US / 🇨🇦 CA | ❌ Non | LETTER | MM/DD/YYYY |
| 🇬🇧 UK / 🇮🇪 IE | ❌ Non | A4 | DD/MM/YYYY |
| 🇫🇷 FR / 🇩🇪 DE / 🇨🇭 CH | ✅ Oui | A4 | DD/MM/YYYY |
| 🇯🇵 JP / 🇨🇳 CN / 🇰🇷 KR | ✅ Oui | A4 | YYYY/MM/DD |
| **Default (reste du monde)** | ✅ Oui | A4 | DD/MM/YYYY |

### PDF Rendering Rules
| Règle | Code | Impact |
|-------|------|--------|
| `wrap={false}` sur sections | `<SafeSection>` | Évite orphan titles |
| `minPresenceAhead` | `minHeight={60}` | Titre + 1 item ensemble |
| `scale=1.5` + CSS zoom | `PDFPageViewer.tsx:298` | Instant zoom, no re-render |
| Image validation | `isValidImageUrl()` | Crash prevention |

---

## ⚰️ LE CIMETIÈRE DES ERREURS (NE JAMAIS REFAIRE)

### ❌ Erreur #1: Puppeteer Server-Side PDF
- **Date**: Avant 2025-12-10
- **Symptôme**: PDF différent du preview, lent, dépendance serveur
- **Solution**: Migration vers `@react-pdf/renderer` client-side
- **Status**: ✅ Résolu définitivement

### ❌ Erreur #2: Scale natif react-pdf pour zoom
- **Date**: 2025-12-11
- **Code cassé**: `<Page scale={scale} />`
- **Symptôme**: Re-render à chaque zoom = flou, lag
- **Solution**: `<Page scale={1.5} />` + CSS transform
- **Status**: ✅ Résolu

### ❌ Erreur #3: fontSize undefined from localStorage
- **Date**: 2025-12-11
- **Symptôme**: Texte minuscule, pages multipliées
- **Cause**: Old persisted data missing new fields
- **Solution**: Null-safe fallbacks avec `??` pour chaque field
- **Status**: ✅ Résolu

### ❌ Erreur #4: InfinityRenderer orphelin
- **Date**: Existait avant, supprimé 2025-12-11
- **Symptôme**: Code mort causant confusion
- **Solution**: Suppression complète de `/infrastructure/pdf/infinity/`
- **Status**: ✅ Supprimé

### ❌ Erreur #5: origin-top-left au lieu de origin-top
- **Date**: 2025-12-11
- **Symptôme**: CV collé à gauche au lieu de centré
- **Solution**: `origin-top` pour centrage horizontal
- **Status**: ✅ Résolu

---

## 🏗️ ARCHITECTURE ACTUELLE

```
src/
├── application/store/v2/
│   ├── cv-store-v2.ts          # Zustand store principal
│   ├── cv-store-v2.types.ts    # Types + DEFAULT_DESIGN
│   └── useSyncRegionToStore.ts # Sync localStorage → store
├── data/
│   └── countryRules.ts         # Règles pays (Default + Exceptions)
├── domain/
│   ├── cv-limits.ts            # Limites caractères/items
│   └── cv/v2/types.ts          # CVProfile types
├── presentation/
│   ├── cv-templates/pdf/
│   │   ├── CVDocument.tsx      # 🎯 SEUL moteur PDF
│   │   └── SafeSection.tsx     # Phase 3: wrapper components
│   ├── components/
│   │   ├── PDFPageViewer.tsx   # Viewer avec wave animation
│   │   └── LayoutBudgetIndicator.tsx # Phase 2: visual feedback
│   ├── features/preview/
│   │   └── PreviewPane.tsx     # Double-buffer + layout budget
│   └── hooks/
│       └── useLayoutBudget.ts  # Phase 2: height estimation
```

---

## 📊 ÉTAT DE STABILITÉ

| Composant | Score | Notes |
|-----------|-------|-------|
| PDF Rendering | 80/100 | SafeSection + wrap={false} |
| Zoom System | 85/100 | CSS transform stable |
| Country Rules | 90/100 | Pattern Default+Exceptions clean |
| Layout Budget | 60/100 | Estimations approximatives |
| Store Sync | 75/100 | Hook créé, UI selector à faire |
| i18n Labels | 30/100 | ⚠️ French hardcoded |

### Score Global: **72/100** 🟡

---

## 🎯 PROCHAINES ÉTAPES (BACKLOG)

### Priorité Haute
- [ ] Ajouter sélecteur pays dans UI (SettingsModal ou DesignStudioPanel)
- [ ] Implémenter `dateFormat` dans les dates du CV
- [ ] Améliorer précision de `useLayoutBudget`

### Priorité Moyenne
- [ ] i18n pour labels PDF (Contact, Expérience, Formation...)
- [ ] Structurer `ContactInfo.address` (street, city, postalCode)
- [ ] Phase 4: Auto-truncate sur overflow détecté

### Priorité Basse
- [ ] Supprimer le fichier `mapper.ts` (legacy SCV)
- [ ] Tests unitaires pour countryRules
- [ ] Debug mode toggle pour SafeSection

---

## 🚨 ALERTES ACTIVES

| Niveau | Message | Action |
|--------|---------|--------|
| 🟡 WARN | Labels hardcodés en français | Implémenter i18n |
| 🟡 WARN | LayoutBudget = estimations | Affiner les calculs |
| ⚪ INFO | mapper.ts est legacy | Supprimer quand possible |

---

## 💡 NOTES DE SESSION

### Session 2025-12-11
- Implémenté Phase 1-3 du hardening PDF
- Supprimé InfinityRenderer (code mort)
- Créé système SafeSection pour page breaks
- Ajouté indicateur de remplissage page
- Corrigé régression zoom (CSS transform)
- Câblé setTargetCountry → country rules → design

---

*Ce fichier est la mémoire du projet. Consulte-le avant toute modification majeure.*

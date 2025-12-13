# AUDIT REPORT - Swiss CV Builder

**Date**: 2025-12-12  
**Verdict**: **STABILISABLE** (avec refactoring ciblé)  
**Analyse par**: Directeur d'ingénierie produit

---

## A. Résumé Exécutif

Le produit est **stabilisable sans reset complet**. L'architecture V2 est cohérente conceptuellement, avec un Theme Engine partagé entre le PDF et l'overlay interactif. Le chaos provient de **deux causes racines**:

1. **Double chemin de rendu PDF**: Le client utilise `@react-pdf/renderer` (CVDocumentV2), tandis que le serveur Puppeteer attend une page HTML `/pdf-render/{id}` **qui n'existe pas**.

2. **Code mort accumulé**: 9 fichiers .bak, CVDocument.tsx dupliqué, vestiges de pagination V1/V2 jamais nettoyés.

**Décision**: Stabilisation en supprimant le serveur Puppeteer (inutile) et en nettoyant le code mort. Le moteur client-side @react-pdf est fonctionnel.

---

## B. Architecture Réelle

### B.1 Diagramme du Pipeline Actuel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT-SIDE (ACTIF)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  useCVStoreV2 ──┬──> useProfile() ──> PreviewPane.tsx                       │
│  (Zustand)      │                         │                                 │
│                 │                         ▼                                 │
│                 └──> useDesign() ───> CVDocumentV2.tsx                      │
│                                              │                              │
│                                    mapDesignToTheme()                       │
│                                              │                              │
│                                              ▼                              │
│                                    calculateLayout()                        │
│                                              │                              │
│                                              ▼                              │
│                                    @react-pdf/renderer                      │
│                                              │                              │
│                                              ▼                              │
│                                    PDFPageViewer.tsx (pdf.js canvas)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER-SIDE (MORT)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  puppeteer-pdf.service.ts                                                   │
│         │                                                                   │
│         ▼                                                                   │
│  navigate to /pdf-render/{profileId}  ← ROUTE N'EXISTE PAS                  │
│         │                                                                   │
│         ▼                                                                   │
│  waitForSelector('#cv-template')      ← TIMEOUT GARANTI                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### B.2 Fichiers Clés

| Module | Fichier | Statut | Description |
|--------|---------|--------|-------------|
| **Store** | `src/application/store/v2/cv-store-v2.ts` | ✅ ACTIF | Source unique de vérité pour profile + design |
| **PDF Engine** | `src/application/pdf-engine/CVDocumentV2.tsx` | ✅ ACTIF | Renderer @react-pdf principal |
| **Theme Engine** | `src/application/pdf-engine/theme/layout.calculator.ts` | ✅ ACTIF | Calcul géométrique partagé |
| **Preview** | `src/presentation/features/preview/PreviewPane.tsx` | ✅ ACTIF | Double-buffer PDF viewer |
| **Overlay** | `src/presentation/cv-templates/overlay/InteractiveOverlay.tsx` | ✅ ACTIF | Edition inline sync avec PDF |
| **PDF Legacy** | `src/presentation/cv-templates/pdf/CVDocument.tsx` | ⚠️ MORT | Dupliqué, non référencé |
| **Puppeteer** | `server/services/puppeteer-pdf.service.ts` | ❌ CASSÉ | Route cible inexistante |

### B.3 Flux de Données

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   User Edits     │ -> │  useCVStoreV2    │ -> │  CVDocumentV2    │
│   (Sidebar)      │    │  updateField()   │    │  Theme Engine    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                 │                       │
                                 │                       ▼
                                 │              ┌──────────────────┐
                                 └─────────────>│ InteractiveOverlay│
                                                │ (Same Theme API) │
                                                └──────────────────┘
```

---

## C. Constat des Problèmes

### P0 - BLOQUANT (0 items)

Aucun problème P0 actuel. Le rendu PDF fonctionne côté client.

---

### P1 - DÉGRADATION UX (3 items)

#### P1.1 - Puppeteer Server Route Inexistante

**Preuve**: 
- `server/services/puppeteer-pdf.service.ts:413` appelle `/pdf-render/{profileId}`
- `src/App.tsx` ne définit aucune route `/pdf-render/*`

**Impact utilisateur**: Si l'export PDF serveur est appelé, timeout garanti. L'utilisateur attend indéfiniment.

**Cause racine**: Migration incomplète. Le renderer HTML (ChameleonTemplate) a été supprimé, mais Puppeteer n'a pas été retiré.

---

#### P1.2 - Double PDF Component

**Preuve**:
- `src/application/pdf-engine/CVDocumentV2.tsx` (566 lignes) - ACTIF
- `src/presentation/cv-templates/pdf/CVDocument.tsx` (403 lignes) - MORT

**Impact utilisateur**: Confusion pour les développeurs. Risque de maintenir le mauvais fichier.

**Cause racine**: Refactoring incomplet. CVDocument est l'ancienne version, CVDocumentV2 est la nouvelle.

---

#### P1.3 - InteractiveOverlay Positionnement Imprécis

**Preuve**: 
- `src/presentation/cv-templates/overlay/InteractiveOverlay.tsx:35-37` utilise des constantes `GLOBAL_OFFSET_X/Y` à 0
- Commentaire ligne 32: "Adjust these if overlay zones are shifted from actual PDF content"

**Impact utilisateur**: Les zones cliquables peuvent ne pas correspondre exactement au texte PDF.

**Cause racine**: L'overlay utilise `calculateLayout()` mais le rendu PDF utilise des offsets internes supplémentaires (paddingTop: +10pt ligne 158 de CVDocumentV2).

---

### P2 - DETTE TECHNIQUE (5 items)

#### P2.1 - Fichiers .bak Accumulés

**Preuve**: 9 fichiers .bak dans src/presentation/:
```
presentation/components/FloatingCV.tsx.bak
presentation/components/MagicParticle.tsx.bak
presentation/components/PageStack.tsx.bak
presentation/components/RippleEffect.tsx.bak
presentation/features/editor/tabs/ImpactHeatmap.tsx.bak
presentation/features/preview/PreviewPane.CLEAN.tsx.bak
presentation/features/preview/PreviewPane.simple.tsx.bak
presentation/hooks/useParticleTrail.ts.bak
presentation/layouts/Footer.tsx.bak
```

**Impact**: Bruit dans le codebase, confusion Git.

---

#### P2.2 - Vestiges Pagination V1/V2

**Preuve**: `src/presentation/components/pagination/CVPaginationWrapper.tsx:14` mentionne "usePaginationV2"

**Impact**: Code inutilisé si @react-pdf gère la pagination nativement.

---

#### P2.3 - Server Routes Non Utilisées

**Preuve**: `server/routes/puppeteer-pdf.ts` (5475 bytes), `server/routes/pdf.ts` (21294 bytes)

**Impact**: Code serveur maintenu inutilement si le PDF est généré client-side.

---

#### P2.4 - Types Dupliqués

**Preuve**: 
- `src/application/store/v2/cv-store-v2.types.ts` définit `DesignConfig`
- `src/application/pdf-engine/theme/theme.config.ts` définit `ThemeConfig`

**Impact**: Deux systèmes de types parallèles pour la même chose.

---

#### P2.5 - Fichiers Backup à la Racine

**Preuve**: 
- `temp_mobile_extract.txt`
- `temp_preview_clean.tsx`
- `pdf-error-*.png` (6 fichiers)
- `pdf-store-debug.log`
- `tsc-errors.txt`

**Impact**: Pollution du repo.

---

## D. Qualité Produit

### D.1 Ce Qui Est Vendable Aujourd'hui

| Feature | Statut | Notes |
|---------|--------|-------|
| Edition CV temps réel | ✅ | Store V2 + PreviewPane fonctionnels |
| Export PDF local | ✅ | @react-pdf via bouton download |
| Design personnalisable | ✅ | Theme Engine complet |
| Multi-langue | ✅ | i18n présent |
| Mobile responsive | ⚠️ | MobileEditor.tsx existe |

### D.2 Ce Qui Empêche la Vente

1. **Export serveur cassé** - Si vous promettiez une API REST de génération PDF, elle ne fonctionne pas.
2. **Inline editing désaligné** - L'overlay ne correspond pas toujours pixel-perfect au PDF.

### D.3 Compromis Pour v1 Vendable

1. **Supprimer Puppeteer** - Utiliser uniquement @react-pdf client-side
2. **Désactiver InteractiveOverlay** - Revenir à l'édition via sidebar uniquement
3. **Nettoyer les .bak** - 30 minutes de travail

---

## E. Décision: Stabilisation

### Option Retenue: **STABILISATION**

L'architecture V2 est saine conceptuellement. Le Theme Engine est bien conçu. Le store Zustand est propre.

### E.1 Étapes Concrètes

| # | Action | Fichiers | Complexité |
|---|--------|----------|------------|
| 1 | Supprimer CVDocument.tsx dupliqué | `src/presentation/cv-templates/pdf/CVDocument.tsx` | Faible |
| 2 | Supprimer tous les .bak | 9 fichiers listés | Faible |
| 3 | Supprimer Puppeteer service | `server/services/puppeteer-pdf.service.ts` | Moyenne |
| 4 | Supprimer routes PDF serveur | `server/routes/puppeteer-pdf.ts`, `server/routes/pdf.ts` | Moyenne |
| 5 | Calibrer InteractiveOverlay | `src/presentation/cv-templates/overlay/InteractiveOverlay.tsx` | Élevée |
| 6 | Nettoyer fichiers racine | 10+ fichiers temp/debug | Faible |

### E.2 Risques

- **Si API PDF serveur nécessaire**: Il faudra recréer une page `/pdf-render` avec le template HTML.
- **Overlay désactivé**: Perte temporaire de l'inline editing.

### E.3 Temps Estimé

- Nettoyage code mort: **Faible** (1-2 heures)
- Suppression Puppeteer: **Moyenne** (2-4 heures, vérifier dépendances)
- Calibration overlay: **Élevée** (4-8 heures, debugging pixel-perfect)

---

## F. Plan d'Exécution 7 Jours

### Jour 1: Nettoyage Immédiat

| Tâche | Fichiers | Critère Done |
|-------|----------|--------------|
| Supprimer 9 fichiers .bak | `src/presentation/**/*.bak` | Git status clean |
| Supprimer fichiers temp racine | `temp_*.txt`, `pdf-error-*.png`, `*.log` | Racine propre |
| Supprimer CVDocument dupliqué | `src/presentation/cv-templates/pdf/CVDocument.tsx` | Aucune référence cassée |

### Jour 2: Audit Puppeteer

| Tâche | Fichiers | Critère Done |
|-------|----------|--------------|
| Lister tous les imports de puppeteer-pdf.service | Grep dans /server | Liste exhaustive |
| Supprimer routes si non critiques | `server/routes/puppeteer-pdf.ts` | Build serveur OK |

### Jour 3: Consolidation Store

| Tâche | Fichiers | Critère Done |
|-------|----------|--------------|
| Vérifier unicité DesignConfig | `cv-store-v2.types.ts` vs `theme.config.ts` | Un seul type source |
| Documenter flux data | Ajouter README dans /store/v2 | Documentation claire |

### Jour 4-5: Calibration Overlay

| Tâche | Fichiers | Critère Done |
|-------|----------|--------------|
| Mesurer décalages actuels | InteractiveOverlay.tsx + CVDocumentV2.tsx | Delta documenté |
| Ajuster GLOBAL_OFFSET constants | InteractiveOverlay.tsx:35-37 | Zones alignées visuellement |
| Tester avec différents contenus | Browser DevTools | Click correspond au texte |

### Jour 6: Tests Manuels

| Tâche | Critère Done |
|-------|--------------|
| Edition via sidebar | Modifications reflétées dans PDF |
| Download PDF | Fichier valide, contenu correct |
| Mobile view | Pas de crash, layout acceptable |

### Jour 7: Documentation & Release

| Tâche | Fichiers | Critère Done |
|-------|----------|--------------|
| Mettre à jour README | README.md | Architecture claire |
| Créer CHANGELOG | CHANGELOG.md | v1.0-stable documenté |

---

## Annexes

### Annexe A: Sources de Vérité

| Donnée | Fichier Source | Autres Copies |
|--------|----------------|---------------|
| Profile (content) | `cv-store-v2.ts` → `profile` | Aucune |
| Design (style) | `cv-store-v2.ts` → `design` | mappé vers ThemeConfig |
| Geometry (layout) | `layout.calculator.ts` → ComputedLayout | Utilisé par PDF + Overlay |

### Annexe B: Point de Divergence HTML/PDF

**Réponse**: Il n'y a PLUS de rendu HTML. Le système est 100% @react-pdf côté client. La divergence historique venait de Puppeteer qui rendait une page HTML (ChameleonTemplate) - cette page a été supprimée sans retirer Puppeteer.

### Annexe C: Point de Double Source Overlay/Studio

**Réponse**: Le store V2 EST la source unique. Le "studio" (sidebar) modifie le store, l'overlay LIT le store + utilise calculateLayout() pour positionner les zones. Pas de double source - juste un décalage de calibration.

### Annexe D: Non-Déterminisme Layout

**Réponse**: Le layout EST déterministe. `calculateLayout()` est une fonction pure:
```
ThemeConfig + Optional[Profile] → ComputedLayout
```
Aucun état externe. Le résultat est toujours identique pour les mêmes inputs.

---

*Fin du rapport d'audit.*

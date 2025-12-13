# STABILIZATION PLAN - Swiss CV Builder

**Verdict**: Stabilisation recommandée (pas de reset nécessaire)

---

## KEEP (À Conserver Absolument)

### Core Architecture
| Fichier | Raison |
|---------|--------|
| `src/application/store/v2/cv-store-v2.ts` | Store Zustand propre, source unique de vérité |
| `src/application/store/v2/cv-store-v2.types.ts` | Types bien définis |
| `src/application/store/v2/cv-store-v2.helpers.ts` | Helpers utilitaires |
| `src/application/store/v2/selectors.ts` | Sélecteurs memoizés |
| `src/application/store/v2/index.ts` | Barrel export |

### PDF Engine V2
| Fichier | Raison |
|---------|--------|
| `src/application/pdf-engine/CVDocumentV2.tsx` | Renderer @react-pdf fonctionnel |
| `src/application/pdf-engine/index.ts` | Export propre |
| `src/application/pdf-engine/theme/layout.calculator.ts` | Calcul géométrique partagé |
| `src/application/pdf-engine/theme/theme.config.ts` | Configuration thème |
| `src/application/pdf-engine/theme/theme.mapper.ts` | Mapping DesignConfig → ThemeConfig |
| `src/application/pdf-engine/theme/layout.guard.ts` | Validation |
| `src/application/pdf-engine/theme/index.ts` | Barrel export |

### Preview System
| Fichier | Raison |
|---------|--------|
| `src/presentation/features/preview/PreviewPane.tsx` | Double-buffer PDF viewer |
| `src/presentation/components/PDFPageViewer.tsx` | Canvas pdf.js |

### Interactive Overlay (À calibrer)
| Fichier | Raison |
|---------|--------|
| `src/presentation/cv-templates/overlay/InteractiveOverlay.tsx` | Inline editing |
| `src/presentation/cv-templates/overlay/GhostField.tsx` | Champs fantômes |
| `src/presentation/cv-templates/overlay/index.ts` | Export |

### Domain & Types
| Fichier | Raison |
|---------|--------|
| `src/domain/cv/v2/types.ts` | Types CVProfile |
| `src/domain/cv-limits.ts` | Contraintes CV |

### Pages & App
| Fichier | Raison |
|---------|--------|
| `src/App.tsx` | Router principal |
| `src/presentation/pages/CVPageV2.tsx` | Page éditeur |
| `src/presentation/features/editor/*` | Sidebar & tabs |

---

## DELETE (À Supprimer Sans Regret)

### Code Mort - Fichiers .bak
```
src/presentation/components/FloatingCV.tsx.bak
src/presentation/components/MagicParticle.tsx.bak
src/presentation/components/PageStack.tsx.bak
src/presentation/components/RippleEffect.tsx.bak
src/presentation/features/editor/tabs/ImpactHeatmap.tsx.bak
src/presentation/features/preview/PreviewPane.CLEAN.tsx.bak
src/presentation/features/preview/PreviewPane.simple.tsx.bak
src/presentation/hooks/useParticleTrail.ts.bak
src/presentation/layouts/Footer.tsx.bak
```

### Code Mort - Dupliqués
```
src/presentation/cv-templates/pdf/CVDocument.tsx  ← Ancienne version, remplacée par CVDocumentV2
src/presentation/cv-templates/pdf/SafeSection.tsx ← Associé à l'ancienne version
```

### Code Mort - Preview Backups
```
src/presentation/features/preview/PreviewPane.tsx.backup
```

### Serveur Puppeteer (Cassé)
```
server/services/puppeteer-pdf.service.ts      ← Route cible n'existe pas
server/routes/puppeteer-pdf.ts                ← Non utilisable
```

### Évaluer pour suppression - Routes PDF serveur
```
server/routes/pdf.ts                          ← À vérifier si utilisé
server/routes/pdf-profile.ts                  ← À vérifier si utilisé
```

### Fichiers Temporaires Racine
```
temp_mobile_extract.txt
temp_preview_clean.tsx
pdf-error-1764944178904.png
pdf-error-1764944381868.png
pdf-error-1764944659562.png
pdf-error-1764944805011.png
pdf-error-1764945160538.png
pdf-error-1764945561807.png
pdf-store-debug.log
tsc-errors.txt
build_output.txt
lint-output.json                              ← 1.2MB de lint output
ubgfyu.txt
repomix-output.txt                            ← 3.6MB
repomix-output.xml                            ← 7.3MB
```

---

## REBUILD (Ordre de Reconstruction)

**Note**: Pas de reconstruction nécessaire. L'architecture V2 est fonctionnelle.

### Si déploiement API PDF serveur requis:

1. **Créer page `/pdf-render`**
   ```tsx
   // src/presentation/pages/PDFRenderPage.tsx
   // Page minimaliste qui:
   // - Lit profileId depuis URL
   // - Charge le store
   // - Render le template HTML pour Puppeteer
   ```

2. **Ajouter route dans App.tsx**
   ```tsx
   <Route path="/pdf-render/:profileId" element={<PDFRenderPage />} />
   ```

3. **Réparer puppeteer-pdf.service.ts**
   - Mettre à jour l'URL et les sélecteurs attendus

### Si calibration overlay requise:

1. **Mesurer décalages**
   - Activer mode debug (props `debug={true}`)
   - Comparer visuellement zones overlay vs texte PDF

2. **Ajuster constantes**
   ```tsx
   // InteractiveOverlay.tsx:35-37
   const GLOBAL_OFFSET_X = ???;  // Mesurer
   const GLOBAL_OFFSET_Y = ???;  // Mesurer
   ```

3. **Synchroniser padding**
   - CVDocumentV2 utilise `paddingTop: geometry.sidebarPadding + 10`
   - InteractiveOverlay doit utiliser le même offset

---

## Exécution Immédiate

### Commandes de Nettoyage

```powershell
# Supprimer tous les .bak
Remove-Item -Path "src/presentation/**/*.bak" -Recurse

# Supprimer fichiers temp racine
Remove-Item -Path "temp_*.txt", "pdf-error-*.png", "*.log", "tsc-errors.txt", "build_output.txt", "ubgfyu.txt"

# Supprimer gros fichiers de dump
Remove-Item -Path "lint-output.json", "repomix-output.txt", "repomix-output.xml"

# Supprimer preview backup
Remove-Item -Path "src/presentation/features/preview/PreviewPane.tsx.backup"

# Supprimer CVDocument dupliqué
Remove-Item -Path "src/presentation/cv-templates/pdf/CVDocument.tsx"
Remove-Item -Path "src/presentation/cv-templates/pdf/SafeSection.tsx"
```

### Vérification Post-Nettoyage

```powershell
# Build doit passer
npm run build

# Dev doit démarrer
npm run dev

# Aucune erreur TypeScript
npx tsc --noEmit
```

---

## Conclusion

Ce projet n'a PAS besoin d'un reset. L'architecture V2 est cohérente:

- **Store**: Zustand avec persist, actions bien typées ✓
- **PDF Engine**: @react-pdf avec Theme Engine partagé ✓
- **Preview**: Double-buffer canvas rendering ✓
- **Overlay**: Synced via calculateLayout() ✓

Le chaos vient du code mort accumulé et d'un chemin Puppeteer abandonné. Nettoyer = stabiliser.

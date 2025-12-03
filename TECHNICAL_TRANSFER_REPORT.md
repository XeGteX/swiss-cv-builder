# 📋 Rapport de Transfert Technique - Swiss CV Builder (v2.1)

**Date :** 03/12/2025
**Statut :** Transition Critique
**Priorité :** Stabilisation & Debugging Profond

---

## 1. État des Lieux (Ce qui a été fait)
L'architecture v2 est en place avec une séparation claire des responsabilités (Layouts vs Templates).
*   **Nouveaux Templates Intégrés :**
    *   `ClassicTemplate` (ATS-friendly, Serif)
    *   `CreativeTemplate` (Sidebar, Bold)
    *   `ExecutiveTemplate` (Header sombre, Premium)
    *   *Note :* Ils sont tous câblés dans `CVRenderer` et sélectionnables depuis la Galerie 3D.
*   **Galerie 3D :** Fonctionnelle, format A4 forcé visuellement (`h-full w-full`), navigation fluide.
*   **Moteur de Rendu :** `CVRenderer` bascule dynamiquement entre les templates selon `metadata.templateId`.

---

## 2. 🚨 Zones Rouges (Bugs Structurels & UX à Corriger)
*L'analyse doit être impitoyable sur ces points.*

### A. Le Mode Structure (Le "Boss Final")
*   **Symptôme Critique :** Le Drag & Drop est instable. Déplacer une section sur la Page 1 peut la faire atterrir sur la Page 2, ou la faire disparaître, ou casser l'ordre.
*   **Hypothèse :** Conflit d'IDs entre les items sortables ou mauvaise gestion des contextes `dnd-kit` quand plusieurs pages sont rendues (même si virtuellement séparées).
*   **Action Requise :** Audit complet de la logique de tri (`useSectionOrder`, `SortableContext`). Vérifier si le `DragOverlay` ne perturbe pas le DOM. **Il faut que ça soit solide comme du roc.**

### B. Pagination & Respect du A4
*   **Symptôme :** Le système de pagination (`usePagination`) est "bête". Il coupe parfois au mauvais endroit ou laisse la Page 1 se casser quand la Page 2 apparaît.
*   **Risque Nouveaux Templates :** Chaque template a des paddings/marges différents. La logique de calcul de hauteur (1123px) est peut-être trop rigide ou mal calibrée pour `Creative` (sidebar) ou `Executive` (gros header).
*   **Action Requise :**
    1.  Vérifier si les templates respectent *strictement* le A4.
    2.  Améliorer l'intelligence de la césure (ne pas couper un bloc expérience en deux si possible, ou le faire proprement).
    3.  Empêcher le "bloat" visuel (icônes trop grosses, marges inutiles) qui pousse le contenu hors page.

### C. Sidebar, Sync & Inputs
*   **Symptôme :** L'utilisateur signale des bugs d'inputs et de sync.
*   **Pistes :**
    *   Perte de focus sur les `EditableField` lors de la frappe (re-render trop fréquent ?).
    *   Désynchronisation entre la Sidebar (formulaire) et la Preview (rendu).
    *   Boutons "morts" ou liens cassés dans l'interface admin ou wizard.

---

## 3. 🕵️‍♂️ Plan de Test "Crash Test" (Mode Tester Relou)
*À exécuter dès le début de la nouvelle session.*

1.  **Test de Surcharge :**
    *   Remplir "Expériences" avec 10 items longs. Voir comment la Page 2 se crée.
    *   Est-ce que le header de la Page 2 est correct (Mini header vs Full header) ?
    *   Est-ce que la Page 1 reste intacte ?

2.  **Test de Torture Structure :**
    *   Aller en mode Structure.
    *   Prendre le dernier bloc de la Page 1 et tenter de le mettre en premier.
    *   Prendre un bloc de la Page 2 et le ramener en Page 1 (si place disponible).
    *   *Critère de succès :* Aucun saut visuel, persistance immédiate.

3.  **Test "Template Switch" :**
    *   Remplir un CV complet.
    *   Changer de template (Modern -> Creative -> Classic).
    *   Vérifier si des données sont perdues ou si la mise en page explose (texte blanc sur fond blanc, débordements).

4.  **Audit des Assets :**
    *   Vérifier les imports d'icônes dans les nouveaux templates. Sont-ils optimisés ?
    *   Y a-t-il des erreurs console (React keys, DOM nesting validation) ?

---

## 4. Fichiers à Scanner en Priorité
*   `src/presentation/layouts/templates/v2/*` (Les 4 templates)
*   `src/presentation/hooks/usePagination.ts` (Le cerveau de la pagination)
*   `src/application/store/v2/cv-store-v2.ts` (La gestion d'état)
*   `src/presentation/components/lego/SortableSection.tsx` (La brique élémentaire du DnD)

---

**Message pour le prochain Agent :**
"Ne te laisse pas amadouer par le design joli. Cherche la petite bête. Le mode Structure est ta priorité n°1, suivi de près par la pagination intelligente. Le but est une UX *irréprochable*."

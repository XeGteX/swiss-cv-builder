/**
 * NEXAL2 - SceneGraph Architecture
 *
 * Parallel rendering pipeline (feature flag: VITE_NEXAL2=1)
 *
 * Usage:
 *   const constraints = createConstraints({ regionId: 'FR', presetId: 'SIDEBAR' });
 *   const scene = buildScene(profile, design);
 *   const layout = computeLayout(scene, constraints);
 *   <HTMLRenderer layout={layout} /> // or <PDFRenderer layout={layout} />
 */

// Types
export * from './types';

// Constraints (CV Chameleon)
export * from './constraints';

// SceneGraph
export { buildScene } from './scenegraph';

// Layout
export { computeLayout, measureText, paginateLayout } from './layout';

// Renderers
export { HTMLRenderer, EditableHTMLRenderer } from './renderers/html';
export { PDFRenderer, MatrixPDFRenderer } from './renderers/pdf';

// Hooks
export { useNexal2 } from './hooks';

// Adapters
export { mapAppToNexal2, mapProfileToNexal2, mapDesignToNexal2 } from './adapters';

// Components
export { NEXAL2PreviewPane } from './components';

// Dev tools (validation, matrix runner)
export * from './dev';


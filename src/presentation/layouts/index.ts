/**
 * Layout Registry - Minimal after Tabula Rasa
 */

import { layoutRegistry } from './registry';

export const initializeLayouts = () => {
    // All layouts now use CVDocument directly via React-PDF
    // No HTML templates in registry
    layoutRegistry.register({
        id: 'chameleon',
        name: 'Chameleon (Universal)',
        component: () => null, // Placeholder - PDF rendering is handled via CVDocument
        isATS: false,
    });
};

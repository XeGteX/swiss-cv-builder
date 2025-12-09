/**
 * Layout Registry - Nexal Studio V2
 * 
 * Single template architecture: ChameleonTemplateV2
 * All customization is done via design config, not separate templates.
 */

import { layoutRegistry } from './registry';
import ChameleonTemplateV2 from '../cv-templates/templates/ChameleonTemplateV2';

export const initializeLayouts = () => {
    // Single unified template - all customization via design config
    layoutRegistry.register({
        id: 'chameleon',
        name: 'Chameleon (Universal)',
        component: ChameleonTemplateV2,
        isATS: false,
    });
};

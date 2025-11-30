
import { layoutRegistry } from './registry';
import ModernTemplate from './templates/ModernTemplate';
import ATSTemplate from './templates/ATSTemplate';

export const initializeLayouts = () => {
    layoutRegistry.register({
        id: 'modern',
        name: 'Modern Swiss',
        component: ModernTemplate,
        isATS: false,
    });

    layoutRegistry.register({
        id: 'ats',
        name: 'ATS Optimized',
        component: ATSTemplate,
        isATS: true,
    });
};

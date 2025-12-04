/**
 * CVRenderer - Unified CV Rendering Component
 * Single source of truth for CV display across all modes
 */

import React from 'react';
import { useProfile } from '../../application/store/v2';
import { ModernTemplateV2 } from '../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../layouts/templates/v2/ClassicTemplate';
import { CreativeTemplate } from '../layouts/templates/v2/CreativeTemplate';
import { ExecutiveTemplate } from '../layouts/templates/v2/ExecutiveTemplate';

export interface CVRendererProps {
    language?: 'en' | 'fr';
}

export const CVRenderer: React.FC<CVRendererProps> = React.memo(({
    language = 'fr',
}) => {
    const profile = useProfile();

    if (!profile || !profile.metadata) {
        return null;
    }

    const { metadata } = profile;
    const templateId = metadata.templateId || 'modern';

    switch (templateId) {
        case 'classic':
            return <ClassicTemplate language={language} />;
        case 'creative':
            return <CreativeTemplate language={language} />;
        case 'executive':
            return <ExecutiveTemplate language={language} />;
        case 'modern':
        default:
            return <ModernTemplateV2 language={language} />;
    }
});

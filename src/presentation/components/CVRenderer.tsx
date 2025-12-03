/**
 * CVRenderer - Unified CV Rendering Component
 * Single source of truth for CV display across all modes
 */

import React from 'react';
import { ModernTemplateV2 } from '../layouts/templates/v2/ModernTemplate.v2';

export interface CVRendererProps {
    language?: 'en' | 'fr';
}

export const CVRenderer: React.FC<CVRendererProps> = ({
    language = 'fr',
}) => {
    return (
        <ModernTemplateV2
            language={language}
        />
    );
};

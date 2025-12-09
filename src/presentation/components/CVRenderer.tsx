/**
 * CV Renderer Component
 * 
 * Renders the selected CV template with the current profile data.
 * Chameleon Mode - Only premium templates
 */

import React, { useMemo } from 'react';
import { useProfile, useTemplateId } from '../../application/store/v2';

// Premium Templates Only
import { ChameleonTemplateV2 } from '../cv-templates/templates/ChameleonTemplateV2';
import { TemplateHarvard } from '../cv-templates/templates/TemplateHarvard';
import { TemplateSilicon } from '../cv-templates/templates/TemplateSilicon';
import { TemplateExecutive as TemplateExecutiveNew } from '../cv-templates/templates/TemplateExecutiveNew';

export interface CVRendererProps {
    language?: 'en' | 'fr';
    forceMode?: 'modele' | 'edition' | 'structure';
    className?: string;
    forceTemplateId?: string;
}

/**
 * Template mapping - Chameleon Mode (only premium)
 */
const TEMPLATES: Record<string, React.ComponentType<any>> = {
    // Chameleon Multi-Page (default)
    'chameleon': ChameleonTemplateV2,

    // Premium Templates
    'harvard': TemplateHarvard,
    'silicon': TemplateSilicon,
    'executive-new': TemplateExecutiveNew,

    // Legacy fallbacks (redirect to Chameleon V2)
    'modern': ChameleonTemplateV2,
    'classic': ChameleonTemplateV2,
    'executive': ChameleonTemplateV2,
    'ats-classic': ChameleonTemplateV2,
    'ats-modern': ChameleonTemplateV2,
    'ats-minimal': ChameleonTemplateV2
};

export const CVRenderer: React.FC<CVRendererProps> = React.memo(({
    language,
    forceMode,
    className,
    forceTemplateId
}) => {
    const profile = useProfile();
    const storeTemplateId = useTemplateId();

    const templateId = forceTemplateId || storeTemplateId || 'chameleon';

    const TemplateComponent = useMemo(() => {
        return TEMPLATES[templateId] || ChameleonTemplateV2;
    }, [templateId]);

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className={`cv-renderer ${className || ''}`} data-template={templateId}>
            <TemplateComponent
                profile={profile}
                language={language}
                forceMode={forceMode}
            />
        </div>
    );
});

CVRenderer.displayName = 'CVRenderer';

export default CVRenderer;

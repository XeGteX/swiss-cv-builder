/**
 * CVRenderer - Unified CV Rendering Component
 * 
 * Supports both:
 * - Legacy templates (from carousel at /templates)
 * - Dynamic templates (from gallery at /gallery using TemplateFactory)
 */

import React from 'react';
import { useProfile } from '../../application/store/v2';
import { useSettingsStore } from '../../application/store/settings-store';
import { DynamicTemplate } from '../cv-templates/factory/DynamicTemplateRenderer';
import { TEMPLATE_BY_ID, CURATED_TEMPLATES } from '../cv-templates/factory/TemplateFactory';

// Legacy Templates (from carousel)
import { ModernTemplateV2 } from '../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../layouts/templates/v2/ClassicTemplate';
import { ExecutiveTemplate } from '../layouts/templates/v2/ExecutiveTemplate';
import { ATSClassicTemplate } from '../cv-templates/templates/ATSClassicTemplate';
import { ATSModernTemplate } from '../cv-templates/templates/ATSModernTemplate';
import { ATSMinimalTemplate } from '../cv-templates/templates/ATSMinimalTemplate';
import { SwissExecutiveTemplate } from '../cv-templates/templates/SwissExecutiveTemplate';
import { ConsultantTemplate } from '../cv-templates/templates/ConsultantTemplate';
import { BankerTemplate } from '../cv-templates/templates/BankerTemplate';
import { LegalTemplate } from '../cv-templates/templates/LegalTemplate';
import { CreativePortfolioTemplate } from '../cv-templates/templates/CreativePortfolioTemplate';
import { DevStackTemplate } from '../cv-templates/templates/DevStackTemplate';
import { StartupFounderTemplate } from '../cv-templates/templates/StartupFounderTemplate';
import { HealthcareProTemplate } from '../cv-templates/templates/HealthcareProTemplate';
import { AcademicCVTemplate } from '../cv-templates/templates/AcademicCVTemplate';

export interface CVRendererProps {
    language?: 'en' | 'fr';
    forceMode?: 'modele' | 'edition' | 'structure';
}

// Legacy template ID to Component mapping
const LEGACY_TEMPLATES: Record<string, React.ComponentType<{ language?: 'en' | 'fr'; forceMode?: 'modele' | 'edition' | 'structure' }>> = {
    // ATS Templates
    'ats-classic': ATSClassicTemplate,
    'ats-modern': ATSModernTemplate,
    'ats-minimal': ATSMinimalTemplate,

    // Business Templates
    'swiss-executive': SwissExecutiveTemplate,
    'consultant': ConsultantTemplate,
    'banker': BankerTemplate,
    'legal': LegalTemplate,

    // Creative & Tech
    'creative-portfolio': CreativePortfolioTemplate,
    'devstack': DevStackTemplate,
    'startup-founder': StartupFounderTemplate,

    // Specialized
    'healthcare-pro': HealthcareProTemplate,
    'academic-cv': AcademicCVTemplate,

    // Legacy core templates
    'modern': ModernTemplateV2,
    'classic': ClassicTemplate,
    'executive': ExecutiveTemplate,
};

export const CVRenderer: React.FC<CVRendererProps> = React.memo(({
    language = 'fr',
    forceMode
}) => {
    const profile = useProfile();
    const { selectedTemplateId } = useSettingsStore();

    if (!profile || !profile.metadata) {
        return null;
    }

    // Get template from store or profile metadata
    const templateId = selectedTemplateId || profile.metadata?.templateId || 'modern';

    // 1. First check if it's a legacy template (from carousel)
    const LegacyComponent = LEGACY_TEMPLATES[templateId];
    if (LegacyComponent) {
        return <LegacyComponent language={language} forceMode={forceMode} />;
    }

    // 2. Then check if it's a curated dynamic template (from gallery)
    const curatedTemplate = TEMPLATE_BY_ID.get(templateId);
    if (curatedTemplate) {
        return <DynamicTemplate config={curatedTemplate} forceMode={forceMode} />;
    }

    // 3. Fallback: use first curated template
    if (CURATED_TEMPLATES.length > 0) {
        return <DynamicTemplate config={CURATED_TEMPLATES[0]} forceMode={forceMode} />;
    }

    // 4. Ultimate fallback to Modern
    return <ModernTemplateV2 language={language} />;
});

CVRenderer.displayName = 'CVRenderer';

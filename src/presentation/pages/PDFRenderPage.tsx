/**
 * PDFRenderPage - Standalone page for PDF generation
 * Chameleon Mode - Only premium templates
 * REGION-AWARE: Respects country-specific rules (photo visibility, etc.)
 * 
 * Route: /pdf-render/:id?template=chameleon&region=us
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCVStoreV2 } from '../../application/store/v2';
import { RegionProvider } from '../contexts/RegionContext';
import type { RegionId } from '../../domain/region/types';

// Premium Templates Only
import { ChameleonTemplate } from '../cv-templates/templates/ChameleonTemplate';
import { ChameleonTemplateV2 } from '../cv-templates/templates/ChameleonTemplateV2';
import { TemplateHarvard } from '../cv-templates/templates/TemplateHarvard';
import { TemplateSilicon } from '../cv-templates/templates/TemplateSilicon';
import { TemplateExecutive } from '../cv-templates/templates/TemplateExecutiveNew';

// Template Registry - Chameleon Mode
const TEMPLATE_REGISTRY: Record<string, React.ComponentType<any>> = {
    // Premium Templates - Multi-Page
    'chameleon': ChameleonTemplateV2,
    'harvard': TemplateHarvard,
    'silicon': TemplateSilicon,
    'executive-new': TemplateExecutive,

    // Legacy fallbacks -> Chameleon
    'modern': ChameleonTemplate,
    'classic': ChameleonTemplate,
    'executive': ChameleonTemplate,
    'ats-classic': ChameleonTemplate,
    'ats-modern': ChameleonTemplate,
    'ats-minimal': ChameleonTemplate,
    'swiss-executive': ChameleonTemplate,
    'consultant': ChameleonTemplate,
    'banker': ChameleonTemplate,
    'legal': ChameleonTemplate,
    'creative-portfolio': ChameleonTemplate,
    'devstack': ChameleonTemplate,
    'startup-founder': ChameleonTemplate,
    'healthcare-pro': ChameleonTemplate,
    'academic-cv': ChameleonTemplate
};

// Map country codes to region IDs (must match RegionId in types.ts)
const COUNTRY_TO_REGION: Record<string, RegionId> = {
    // Country codes (uppercase)
    'CH': 'dach',
    'FR': 'france',
    'DE': 'dach',
    'AT': 'dach',
    'US': 'usa',
    'UK': 'uk',
    'GB': 'uk',
    'CA': 'usa',
    'JP': 'japan',
    // Country codes (lowercase)
    'ch': 'dach',
    'fr': 'france',
    'de': 'dach',
    'at': 'dach',
    'us': 'usa',
    'gb': 'uk',
    'ca': 'usa',
    'jp': 'japan',
    // Direct region IDs (for pass-through)
    'usa': 'usa',
    'dach': 'dach',
    'france': 'france',
    'uk': 'uk',
    'japan': 'japan',
    'global': 'global'
};

const PDFRenderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('template') || 'chameleon';
    const regionParam = searchParams.get('region') || 'ch';  // Region from URL
    const setFullProfile = useCVStoreV2((state) => state.setFullProfile);
    const storeProfile = useCVStoreV2((state) => state.profile);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Resolve region ID from parameter
    const regionId: RegionId = COUNTRY_TO_REGION[regionParam] || 'global';

    console.log(`[PDFRenderPage] 🌍 Region: ${regionParam} -> ${regionId}`);

    useEffect(() => {
        const fetchProfile = async () => {
            console.log(`[PDFRenderPage] === STARTING FETCH ===`);
            console.log(`[PDFRenderPage] ID: ${id}, Template: ${templateId}, Region: ${regionId}`);

            try {
                const url = `http://localhost:3000/api/puppeteer-pdf/profile/${id}`;
                const response = await fetch(url);
                console.log(`[PDFRenderPage] Response status: ${response.status}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch profile: ${response.status}`);
                }

                const data = await response.json();
                console.log('[PDFRenderPage] Profile loaded:', data?.personal?.firstName);
                setFullProfile(data);
                setLoading(false);
            } catch (err) {
                console.error('[PDFRenderPage] Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        };

        if (id) fetchProfile();
        else { setError('No profile ID provided'); setLoading(false); }
    }, [id, templateId, regionId, setFullProfile]);

    const TemplateComponent = TEMPLATE_REGISTRY[templateId] || ChameleonTemplateV2;
    const hasValidProfile = storeProfile?.personal?.firstName || storeProfile?.personal?.lastName;
    const isReady = !loading && !error && hasValidProfile;

    return (
        <div id="cv-template" data-ready={isReady ? 'true' : 'false'} data-state={loading ? 'loading' : error ? 'error' : hasValidProfile ? 'ready' : 'waiting'} data-region={regionId} style={{ margin: 0, padding: 0, background: 'white' }}>
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '297mm', fontFamily: 'Inter, sans-serif' }}><div>Loading CV...</div></div>
            ) : error ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '297mm', fontFamily: 'Inter, sans-serif', color: '#ef4444' }}><div>Error: {error}</div></div>
            ) : !hasValidProfile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '297mm', fontFamily: 'Inter, sans-serif' }}><div>Waiting for profile data...</div></div>
            ) : (
                /* Wrap template with RegionProvider to enable region-aware rendering */
                <RegionProvider initialRegion={regionId}>
                    <TemplateComponent language="fr" forceMode="modele" />
                </RegionProvider>
            )}
        </div>
    );
};

export default PDFRenderPage;


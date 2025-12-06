/**
 * PDFRenderPage - Standalone page for PDF generation
 * Displays ONLY the CV template without any UI chrome
 * Used by Puppeteer to capture pixel-perfect PDF
 * 
 * Route: /pdf-render/:id?template=modern
 * 
 * CRITICAL: The #cv-template element MUST always render for Puppeteer to capture it.
 * Loading states are handled INSIDE the #cv-template container.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCVStoreV2 } from '../../application/store/v2';

// Template imports (V2 templates for consistency)
import ModernTemplateV2 from '../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../layouts/templates/v2/ClassicTemplate';
import { ExecutiveTemplate } from '../layouts/templates/v2/ExecutiveTemplate';

// ATS-First Templates
import { ATSClassicTemplate } from '../cv-templates/templates/ATSClassicTemplate';
import { ATSModernTemplate } from '../cv-templates/templates/ATSModernTemplate';
import { ATSMinimalTemplate } from '../cv-templates/templates/ATSMinimalTemplate';

// Business Templates
import { SwissExecutiveTemplate } from '../cv-templates/templates/SwissExecutiveTemplate';
import { ConsultantTemplate } from '../cv-templates/templates/ConsultantTemplate';
import { BankerTemplate } from '../cv-templates/templates/BankerTemplate';
import { LegalTemplate } from '../cv-templates/templates/LegalTemplate';

// Creative & Tech Templates
import { CreativePortfolioTemplate } from '../cv-templates/templates/CreativePortfolioTemplate';
import { DevStackTemplate } from '../cv-templates/templates/DevStackTemplate';
import { StartupFounderTemplate } from '../cv-templates/templates/StartupFounderTemplate';

// Specialized Templates
import { HealthcareProTemplate } from '../cv-templates/templates/HealthcareProTemplate';
import { AcademicCVTemplate } from '../cv-templates/templates/AcademicCVTemplate';

// Template Registry - Maps template IDs to components
const TEMPLATE_REGISTRY: Record<string, React.ComponentType<any>> = {
    // ATS-First
    'ats-classic': ATSClassicTemplate,
    'ats-modern': ATSModernTemplate,
    'ats-minimal': ATSMinimalTemplate,
    // Business
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
    // Legacy
    modern: ModernTemplateV2,
    classic: ClassicTemplate,
    executive: ExecutiveTemplate,
};

const PDFRenderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('template') || 'modern';

    // Get setFullProfile action to inject fetched profile into store
    const setFullProfile = useCVStoreV2((state) => state.setFullProfile);
    const storeProfile = useCVStoreV2((state) => state.profile);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            console.log(`[PDFRenderPage] === STARTING FETCH ===`);
            console.log(`[PDFRenderPage] ID from params: ${id}`);
            console.log(`[PDFRenderPage] Template: ${templateId}`);

            try {
                const url = `http://localhost:3000/api/puppeteer-pdf/profile/${id}`;
                console.log(`[PDFRenderPage] Fetching from: ${url}`);

                const response = await fetch(url);
                console.log(`[PDFRenderPage] Response status: ${response.status}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[PDFRenderPage] Error response body:`, errorText);
                    throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('[PDFRenderPage] Profile loaded:', !!data, data?.personal?.firstName);

                // CRITICAL: Set the profile into the store so templates can access it via useProfile()
                console.log('[PDFRenderPage] Calling setFullProfile...');
                setFullProfile(data);
                console.log('[PDFRenderPage] setFullProfile completed');

                // Mark loading complete
                setLoading(false);
                console.log('[PDFRenderPage] Loading marked as false');

            } catch (err) {
                console.error('[PDFRenderPage] === FETCH ERROR ===');
                console.error('[PDFRenderPage] Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        } else {
            console.error('[PDFRenderPage] === NO ID IN PARAMS ===');
            setError('No profile ID provided');
            setLoading(false);
        }
    }, [id, templateId, setFullProfile]);

    // Log store profile changes for debugging
    useEffect(() => {
        console.log('[PDFRenderPage] Store profile updated:', {
            hasProfile: !!storeProfile,
            firstName: storeProfile?.personal?.firstName
        });
    }, [storeProfile]);

    // Get template component from registry
    const TemplateComponent = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY.modern;

    // Check if we have valid profile data
    const hasValidProfile = storeProfile?.personal?.firstName || storeProfile?.personal?.lastName;

    console.log('[PDFRenderPage] Render:', { loading, error, hasValidProfile, firstName: storeProfile?.personal?.firstName });

    // ALWAYS render #cv-template - Puppeteer needs this element!
    // Contents change based on state
    // data-ready attribute tells Puppeteer when template is fully rendered
    const isReady = !loading && !error && hasValidProfile;

    return (
        <div
            id="cv-template"
            data-ready={isReady ? 'true' : 'false'}
            data-state={loading ? 'loading' : error ? 'error' : hasValidProfile ? 'ready' : 'waiting'}
            style={{
                margin: 0,
                padding: 0,
                background: 'white',
            }}
        >
            {loading ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '297mm',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <div>Loading CV...</div>
                </div>
            ) : error ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '297mm',
                    fontFamily: 'Inter, sans-serif',
                    color: '#ef4444'
                }}>
                    <div>Error: {error}</div>
                </div>
            ) : !hasValidProfile ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '297mm',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <div>Waiting for profile data...</div>
                </div>
            ) : (
                <TemplateComponent
                    language="fr"
                    forceMode="modele"
                />
            )}
        </div>
    );
};

export default PDFRenderPage;

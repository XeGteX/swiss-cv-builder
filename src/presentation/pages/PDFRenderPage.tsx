/**
 * PDFRenderPage - Standalone page for PDF generation
 * Displays ONLY the CV template without any UI chrome
 * Used by Puppeteer to capture pixel-perfect PDF
 * 
 * Route: /pdf-render/:id?template=modern
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { CVProfile } from '../../domain/entities/cv';

// Template imports (V2 templates for consistency)
import ModernTemplateV2 from '../layouts/templates/v2/ModernTemplate.v2';
import { ClassicTemplate } from '../layouts/templates/v2/ClassicTemplate';
import { CreativeTemplate } from '../layouts/templates/v2/CreativeTemplate';
import { ExecutiveTemplate } from '../layouts/templates/v2/ExecutiveTemplate';

// Template Registry - Maps template IDs to components
const TEMPLATE_REGISTRY: Record<string, React.ComponentType<any>> = {
    modern: ModernTemplateV2,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    executive: ExecutiveTemplate,
};

const PDFRenderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('template') || 'modern';

    const [profile, setProfile] = useState<CVProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log(`[PDFRenderPage] Fetching profile ${id} with template ${templateId}`);
                const response = await fetch(`http://localhost:3000/api/puppeteer-pdf/profile/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch profile: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('[PDFRenderPage] Profile loaded successfully');
                setProfile(data);
            } catch (err) {
                console.error('[PDFRenderPage] Error loading profile:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id, templateId]);

    // Get template component from registry
    const TemplateComponent = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY.modern;

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div>Loading CV...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'Inter, sans-serif',
                color: '#ef4444'
            }}>
                <div>Error: {error || 'Profile not found'}</div>
            </div>
        );
    }

    // Render the CV template in print-optimized mode
    return (
        <div
            id="cv-template"
            style={{
                width: '210mm',
                minHeight: '297mm',
                margin: 0,
                padding: 0,
                background: 'white',
                overflow: 'hidden'
            }}
        >
            <TemplateComponent
                language="fr"
                forceMode="modele"
            />
        </div>
    );
};

export default PDFRenderPage;

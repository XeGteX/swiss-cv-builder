import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ModernTemplate from '../layouts/templates/ModernTemplate';
import type { CVProfile } from '../../domain/entities/cv';

/**
 * PDFRenderPage - Standalone page for PDF generation
 * Displays ONLY the CV template without any UI chrome
 * Used by Puppeteer to capture pixel-perfect PDF
 */
const PDFRenderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<CVProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log(`[PDFRenderPage] Fetching profile ${id}`);
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
    }, [id]);

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
            style={{
                width: '100%',
                minHeight: '100vh',
                margin: 0,
                padding: 0,
                background: 'white'
            }}
        >
            <ModernTemplate
                data={profile}
                densityStyles={{}}
                accentColor={profile.metadata?.accentColor || '#6366f1'}
                fontFamily={profile.metadata?.fontFamily || 'sans'}
                language="en"
            />
        </div>
    );
};

export default PDFRenderPage;

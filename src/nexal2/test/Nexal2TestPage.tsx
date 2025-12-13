/**
 * NEXAL2 - Test Page Component
 *
 * Visual testing page for the NEXAL2 rendering pipeline.
 * Renders the fixture profile using buildScene + computeLayout + HTMLRenderer.
 *
 * Access via: /nexal2-test (when route is added)
 */

import React, { useMemo, useState, useCallback } from 'react';
import { buildScene } from '../scenegraph';
import { computeLayout } from '../layout';
import { HTMLRenderer } from '../renderers/html';
import { PDFRenderer } from '../renderers/pdf';
import { pdf } from '@react-pdf/renderer';
import { createDefaultConstraints, PAPER_DIMENSIONS } from '../';
import { FIXTURE_PROFILE, FIXTURE_DESIGN_A4, FIXTURE_DESIGN_LETTER } from './fixtures';
import type { LayoutConstraints, LayoutNode } from '../types';

export const Nexal2TestPage: React.FC = () => {
    const [format, setFormat] = useState<'A4' | 'LETTER'>('A4');
    const [showPhoto, setShowPhoto] = useState(true);
    const [debug, setDebug] = useState(true);
    const [scale, setScale] = useState(0.7);

    // Stress test controls
    const [skillCount, setSkillCount] = useState(8);
    const [experienceCount, setExperienceCount] = useState(2);
    const [seed, setSeed] = useState(1);

    // Generate stress-modified profile
    const stressProfile = useMemo(() => {
        // Generate extra skills
        const extraSkills = Array.from({ length: skillCount }, (_, i) =>
            i < FIXTURE_PROFILE.skills.length
                ? FIXTURE_PROFILE.skills[i]
                : `Skill ${i + 1}`
        );

        // Generate extra experiences
        const baseExp = FIXTURE_PROFILE.experiences[0];
        const extraExperiences = Array.from({ length: experienceCount }, (_, i) =>
            i < FIXTURE_PROFILE.experiences.length
                ? FIXTURE_PROFILE.experiences[i]
                : {
                    id: `exp-${i + 1}`,
                    role: `${['Senior', 'Lead', 'Junior'][i % 3]} Developer`,
                    company: `Company ${i + 1}`,
                    dates: `202${9 - i} - 202${9 - i + 1}`,
                    dateRange: { displayString: `202${9 - i} - 202${9 - i + 1}` },
                    location: 'Paris',
                    tasks: [
                        'Task description line 1',
                        'Task description line 2',
                    ],
                }
        );

        return {
            ...FIXTURE_PROFILE,
            skills: extraSkills,
            experiences: extraExperiences,
            // Use seed to force rebuild
            _seed: seed,
        };
    }, [skillCount, experienceCount, seed]);

    // Select design based on format
    const design = useMemo(() => {
        const base = format === 'A4' ? FIXTURE_DESIGN_A4 : FIXTURE_DESIGN_LETTER;
        return { ...base, showPhoto };
    }, [format, showPhoto]);

    // Build scene
    const scene = useMemo(() => {
        return buildScene(stressProfile, design);
    }, [stressProfile, design]);

    // Compute layout
    const constraints: LayoutConstraints = useMemo(() => {
        return createDefaultConstraints(format, 'left');
    }, [format]);

    const layout = useMemo(() => {
        return computeLayout(scene, constraints);
    }, [scene, constraints]);

    // Paper dimensions for display
    const paper = PAPER_DIMENSIONS[format];

    // Layout signature for parity proof (HTML = PDF)
    const layoutSignature = useMemo(() => {
        const flat: Array<[string, number, number, number, number, string]> = [];
        const walk = (n: LayoutNode) => {
            flat.push([
                n.nodeId,
                Math.round(n.frame.x), Math.round(n.frame.y),
                Math.round(n.frame.width), Math.round(n.frame.height),
                n.nodeType
            ]);
            n.children?.forEach(walk);
        };
        layout.pages.forEach(walk);
        // Create a short hash from the layout data
        const json = JSON.stringify(flat);
        let hash = 0;
        for (let i = 0; i < json.length; i++) {
            const char = json.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
    }, [layout]);

    // PDF download handler
    const [isDownloading, setIsDownloading] = useState(false);
    const handleDownloadPDF = useCallback(async () => {
        setIsDownloading(true);
        try {
            const pdfDoc = <PDFRenderer layout={layout} title="NEXAL2-CV" layoutSignature={layoutSignature} />;
            const blob = await pdf(pdfDoc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CV-NEXAL2-${format}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[NEXAL2] PDF download error:', error);
            alert('PDF generation failed. Check console for details.');
        } finally {
            setIsDownloading(false);
        }
    }, [layout, format, layoutSignature]);

    // PDF preview inline (compare mode)
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refreshPdfPreview = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const pdfDoc = <PDFRenderer layout={layout} title="NEXAL2-CV" layoutSignature={layoutSignature} />;
            const blob = await pdf(pdfDoc).toBlob();
            const url = URL.createObjectURL(blob);
            setPdfPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        } catch (error) {
            console.error('[NEXAL2] PDF preview error:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [layout, layoutSignature]);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#1a1a2e',
            padding: 32,
            fontFamily: 'system-ui, sans-serif',
        }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 8 }}>
                    🧪 NEXAL2 Test Page
                </h1>
                <p style={{ color: '#888', fontSize: 14 }}>
                    SceneGraph → Layout → HTML Renderer
                </p>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: 16,
                marginBottom: 24,
                flexWrap: 'wrap',
            }}>
                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Format:
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as 'A4' | 'LETTER')}
                        style={{ padding: '4px 8px', borderRadius: 4 }}
                    >
                        <option value="A4">A4 (595×842 pt)</option>
                        <option value="LETTER">Letter (612×792 pt)</option>
                    </select>
                </label>

                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={showPhoto}
                        onChange={(e) => setShowPhoto(e.target.checked)}
                    />
                    Show Photo
                </label>

                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={debug}
                        onChange={(e) => setDebug(e.target.checked)}
                    />
                    Debug Borders
                </label>

                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Scale:
                    <input
                        type="range"
                        min="0.3"
                        max="1"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                    />
                    {(scale * 100).toFixed(0)}%
                </label>
            </div>

            {/* Stress Test Controls */}
            <div style={{
                display: 'flex',
                gap: 16,
                marginBottom: 24,
                flexWrap: 'wrap',
                padding: 12,
                backgroundColor: 'rgba(255,100,100,0.1)',
                borderRadius: 8,
                border: '1px solid rgba(255,100,100,0.3)',
            }}>
                <span style={{ color: '#f77', fontWeight: 'bold', fontSize: 12 }}>🧪 STRESS TEST:</span>

                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    Skills:
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={skillCount}
                        onChange={(e) => setSkillCount(parseInt(e.target.value))}
                        style={{ width: 60 }}
                    />
                    {skillCount}
                </label>

                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    Experiences:
                    <input
                        type="range"
                        min="1"
                        max="8"
                        value={experienceCount}
                        onChange={(e) => setExperienceCount(parseInt(e.target.value))}
                        style={{ width: 60 }}
                    />
                    {experienceCount}
                </label>

                <button
                    onClick={() => setSeed(s => s + 1)}
                    style={{
                        padding: '4px 12px',
                        borderRadius: 4,
                        backgroundColor: '#f77',
                        color: '#000',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 'bold',
                    }}
                >
                    🔄 Regenerate
                </button>

                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    style={{
                        padding: '4px 12px',
                        borderRadius: 4,
                        backgroundColor: isDownloading ? '#666' : '#4F46E5',
                        color: '#fff',
                        border: 'none',
                        cursor: isDownloading ? 'wait' : 'pointer',
                        fontSize: 12,
                        fontWeight: 'bold',
                    }}
                >
                    {isDownloading ? '⏳ Generating...' : '📥 Download PDF (NEXAL2)'}
                </button>

                <button
                    onClick={refreshPdfPreview}
                    disabled={isRefreshing}
                    style={{
                        padding: '4px 12px',
                        borderRadius: 4,
                        backgroundColor: isRefreshing ? '#666' : '#10B981',
                        color: '#fff',
                        border: 'none',
                        cursor: isRefreshing ? 'wait' : 'pointer',
                        fontSize: 12,
                        fontWeight: 'bold',
                    }}
                >
                    {isRefreshing ? '⏳ Loading...' : '🔄 Refresh PDF Preview'}
                </button>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: 24,
                marginBottom: 24,
                color: '#888',
                fontSize: 12,
            }}>
                <span>📄 Paper: {format} ({paper.width.toFixed(0)}×{paper.height.toFixed(0)} pt)</span>
                <span>📊 Nodes: {countNodes(scene.pages[0])}</span>
                <span>📐 Scale: {(scale * 100).toFixed(0)}%</span>
                <span style={{ color: '#4F46E5', fontFamily: 'monospace' }}>🔒 LayoutSig: {layoutSignature}</span>
            </div>

            {/* Visual Checklist */}
            <div style={{
                marginBottom: 24,
                padding: 16,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
            }}>
                <h3 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>
                    ✅ Visual Checklist
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, color: '#aaa', fontSize: 12 }}>
                    <div>☐ No element overlaps</div>
                    <div>☐ Padding visible on all sides</div>
                    <div>☐ Section titles aligned</div>
                    <div>☐ Sidebar width correct (170pt)</div>
                    <div>☐ Text does not overflow</div>
                    <div>☐ Same output on refresh</div>
                </div>
            </div>

            {/* Compare Mode: HTML vs PDF */}
            <div style={{
                display: 'flex',
                gap: 24,
                justifyContent: 'center',
                backgroundColor: '#0f0f1a',
                padding: 32,
                borderRadius: 8,
                overflow: 'auto',
            }}>
                {/* HTML Preview */}
                <div>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
                        HTML Renderer
                    </div>
                    <div style={{
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        borderRadius: 4,
                        overflow: 'hidden',
                    }}>
                        <HTMLRenderer
                            layout={layout}
                            scale={scale}
                            debug={debug}
                            layoutSignature={layoutSignature}
                        />
                    </div>
                </div>

                {/* PDF Preview */}
                <div>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
                        PDF Preview {!pdfPreviewUrl && '(click Refresh)'}
                    </div>
                    <div style={{
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        width: paper.width * scale * (96 / 72),
                        height: paper.height * scale * (96 / 72),
                        backgroundColor: '#fff',
                    }}>
                        {pdfPreviewUrl ? (
                            <iframe
                                src={pdfPreviewUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                                title="PDF Preview"
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: '#888',
                                fontSize: 14,
                            }}>
                                Click "🔄 Refresh PDF Preview" to load
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Debug: Scene JSON */}
            <details style={{ marginTop: 24, color: '#888' }}>
                <summary style={{ cursor: 'pointer', marginBottom: 8 }}>
                    🔍 Scene JSON (debug)
                </summary>
                <pre style={{
                    fontSize: 10,
                    backgroundColor: '#0f0f1a',
                    padding: 16,
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 400,
                }}>
                    {JSON.stringify(scene, null, 2)}
                </pre>
            </details>
        </div >
    );
};

/**
 * Count total nodes in scene recursively.
 */
function countNodes(node: { children?: unknown[] }): number {
    let count = 1;
    if (node.children) {
        for (const child of node.children) {
            count += countNodes(child as { children?: unknown[] });
        }
    }
    return count;
}

export default Nexal2TestPage;

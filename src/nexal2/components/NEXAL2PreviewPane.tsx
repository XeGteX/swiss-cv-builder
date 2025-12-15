/**
 * NEXAL2 Preview Pane
 *
 * Drop-in replacement for PreviewPane when NEXAL2 engine is enabled.
 * Uses the NEXAL2 rendering pipeline:
 * - createConstraints(region, preset, options)
 * - buildScene(profile, design)
 * - computeLayout(scene, constraints)
 * - HTMLRenderer for preview
 * - PDFRenderer for export
 * 
 * Phase 4.1: CV Chameleon with region/preset controls.
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
    Loader2, RefreshCw, Download, AlertTriangle,
    Camera, CameraOff, PanelLeft, PanelRight,
    ZoomIn, ZoomOut, Maximize, Globe, Layout
} from 'lucide-react';
import { useProfile, useDesign, useCVStoreV2 } from '@/application/store/v2';
import { useUIStore } from '@/application/store/ui-store';
import { useToastStore } from '@/application/store/toast-store';
import {
    buildScene,
    computeLayout,
    createConstraints,
    getRegionIds,
    getPresetIds,
    HTMLRenderer,
    EditableHTMLRenderer,
    PDFRenderer,
    MatrixPDFRenderer,
    mapAppToNexal2,
    runAndLogMatrix,
    runAndLogLongProfileTests,
    runAndLogPaginationMatrix,
    type RegionId,
    type PresetId,
    type ChameleonConstraints,
    type LayoutTree,
} from '@/nexal2';
import { StructurePanel } from './StructurePanel';
import type { LayoutNode } from '../types';

// PT to PX conversion for sizing
const PT_TO_PX = 96 / 72;

interface NEXAL2PreviewPaneProps {
    initialScale?: number;
}

export const NEXAL2PreviewPane: React.FC<NEXAL2PreviewPaneProps> = ({
    initialScale = 0.6,
}) => {
    const profile = useProfile();
    const design = useDesign();
    const { setGeneratingPDF } = useUIStore();
    const { addToast } = useToastStore();

    // Store actions for toggles
    const setShowPhoto = useCVStoreV2((state) => state.setShowPhoto);
    const setDesign = useCVStoreV2((state) => state.setDesign);

    // State
    const [isDownloading, setIsDownloading] = useState(false);
    const [scale, setScale] = useState(initialScale);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Chameleon state (region + preset)
    const [regionId, setRegionId] = useState<RegionId>('FR');
    const [presetId, setPresetId] = useState<PresetId>('SIDEBAR');

    // Create constraints from region + preset FIRST
    const constraints: ChameleonConstraints = useMemo(() => {
        const c = createConstraints({
            regionId,
            presetId,
            sidebarPosition: design?.sidebarPosition || 'left',
        });

        // DEBUG: Frame gap instrumentation
        if (c.frames.sidebar) {
            const sb = c.frames.sidebar;
            const delta = c.paper.width - (sb.x + sb.width);
            console.log('[NEXAL2 GAP DEBUG]', {
                preset: presetId,
                sidebarPosition: c.sidebarPosition,
                paperWidth: c.paper.width,
                sidebarX: sb.x,
                sidebarWidth: sb.width,
                sidebarRightEdge: sb.x + sb.width,
                deltaPt: delta,
                gapPx: delta * (96 / 72),
            });
            if (Math.abs(delta) > 0.01) {
                console.warn('[NEXAL2] SIDEBAR FRAME GAP DETECTED:', delta, 'pt');
            }
        }

        return c;
    }, [regionId, presetId, design?.sidebarPosition]);

    // Paper dimensions from constraints
    const paper = constraints.paper;

    // Photo policy enforcement based on region + preset
    const photoPolicy = useMemo(() => {
        // Use supportsPhoto from constraints (set by preset)
        const isPhotoDiscouraged = constraints.atsMode;
        const presetSupportsPhoto = constraints.supportsPhoto;
        const canShowPhoto = presetSupportsPhoto && !isPhotoDiscouraged;
        return {
            canShowPhoto,
            isDiscouraged: isPhotoDiscouraged,
            presetSupportsPhoto,
        };
    }, [constraints.atsMode, constraints.supportsPhoto]);

    // Effective showPhoto (respects policy)
    const effectiveShowPhoto = useMemo(() => {
        if (!photoPolicy.canShowPhoto) return false;
        return design?.showPhoto ?? true;
    }, [photoPolicy.canShowPhoto, design?.showPhoto]);

    // Map app data to NEXAL2 format (with synced paperFormat and photo policy)
    const { profile: nexal2Profile, design: nexal2Design } = useMemo(() => {
        const mapped = mapAppToNexal2(profile, design);
        // SYNC: override paperFormat from constraints (region) to prevent mismatch
        // P1 FIX: Include layoutPreset so buildScene knows where to put content
        const syncedDesign = {
            ...mapped.design,
            paperFormat: constraints.paperFormat,
            showPhoto: effectiveShowPhoto,
            layoutPreset: presetId, // Critical: tells buildScene which container to use
        };
        console.log('[NEXAL2] regionId=', regionId, 'presetId=', presetId, 'paperFormat=', syncedDesign.paperFormat);
        console.log('[NEXAL2] effectiveShowPhoto=', effectiveShowPhoto, '(policy:', photoPolicy, ')');
        return { profile: mapped.profile, design: syncedDesign };
    }, [profile, design, constraints.paperFormat, effectiveShowPhoto, regionId, presetId, photoPolicy]);

    // Build scene with synced design
    const scene = useMemo(() => {
        return buildScene(nexal2Profile, nexal2Design);
    }, [nexal2Profile, nexal2Design]);

    // Compute layout using constraints with P1 auto font scaling
    const layout = useMemo(() => {
        const MIN_FONT_SCALE = 0.85; // Never go below 85% of original size
        const MAX_FONT_SCALE = 1.10; // Can increase up to 110% if room
        const FILL_RATIO_MIN = 0.85; // Target minimum fill ratio
        const FILL_RATIO_TARGET = 0.92; // Ideal fill ratio
        const MAX_ITERATIONS = 5;

        // First pass: compute with default fontScale
        let currentScale = constraints.fontScale ?? 1.0;
        let currentLayout = computeLayout(scene, { ...constraints, fontScale: currentScale } as any);

        // Check if auto-scaling could help
        const meta = currentLayout.paginationMeta;
        if (!meta) return currentLayout;

        const fillRatio = meta.page1FillRatio ?? 1.0;
        const pageCount = meta.pageCount;

        // Case 1: Underfill - page 1 has too much white space AND content on next pages
        if (fillRatio < FILL_RATIO_MIN && pageCount > 1) {
            console.log(`[NEXAL2 AutoScale] P1: Underfill detected (${(fillRatio * 100).toFixed(1)}%), trying to reduce font...`);

            // Binary search for optimal scale
            let low = MIN_FONT_SCALE;
            let high = currentScale;
            let bestLayout = currentLayout;
            let bestFillRatio = fillRatio;

            for (let i = 0; i < MAX_ITERATIONS && high - low > 0.01; i++) {
                const mid = (low + high) / 2;
                const testLayout = computeLayout(scene, { ...constraints, fontScale: mid } as any);
                const testMeta = testLayout.paginationMeta;
                const testFillRatio = testMeta?.page1FillRatio ?? 1.0;

                console.log(`[NEXAL2 AutoScale] Iter ${i}: scale=${mid.toFixed(3)}, fillRatio=${(testFillRatio * 100).toFixed(1)}%`);

                if (testFillRatio > bestFillRatio && testFillRatio <= 0.98) {
                    bestLayout = testLayout;
                    bestFillRatio = testFillRatio;
                }

                if (testFillRatio < FILL_RATIO_TARGET) {
                    // Still underfilled, try smaller font
                    high = mid;
                } else {
                    // Good fill or overfilled, try larger font
                    low = mid;
                }
            }

            if (bestFillRatio > fillRatio) {
                console.log(`[NEXAL2 AutoScale] ✓ Improved fill: ${(fillRatio * 100).toFixed(1)}% → ${(bestFillRatio * 100).toFixed(1)}%`);
                return bestLayout;
            }
        }

        // Case 2: Overfill potential - page 1 is full but tight, could increase font slightly
        // (Future enhancement: check if increasing font would still fit)

        return currentLayout;
    }, [scene, constraints]);

    // Overflow detection - P0 FIX: Only show overflow if pagination DID NOT fix it
    const overflowInfo = useMemo(() => {
        const margins = constraints.margins;
        const didPaginate = layout.paginationMeta?.didPaginate ?? false;
        const pageCount = layout.pages.length;

        // If we have multiple pages, content was successfully paginated - no overflow
        if (didPaginate && pageCount > 1) {
            return { isOverflowing: false, overflowAmount: 0, maxY: 0 };
        }

        // Single page - check if content exceeds page bounds
        let maxY = 0;
        const walk = (n: LayoutNode) => {
            const nodeBottom = n.frame.y + n.frame.height;
            if (nodeBottom > maxY) maxY = nodeBottom;
            n.children?.forEach(walk);
        };
        layout.pages[0]?.children?.forEach(walk); // Only check first page content

        const isOverflowing = maxY > paper.height - margins.bottom;
        const overflowAmount = maxY - (paper.height - margins.bottom);

        if (isOverflowing) {
            console.warn(`[NEXAL2] OVERFLOW: content=${maxY.toFixed(0)}pt, max=${(paper.height - margins.bottom).toFixed(0)}pt`);
        }

        return { isOverflowing, overflowAmount, maxY };
    }, [layout, paper, constraints.margins]);

    // Compute layout signature (independent of scale)
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
        const json = JSON.stringify(flat);
        let hash = 0;
        for (let i = 0; i < json.length; i++) {
            const char = json.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
    }, [layout]);

    // Zoom handlers
    const handleZoomIn = useCallback(() => setScale(s => Math.min(s + 0.1, 1.5)), []);
    const handleZoomOut = useCallback(() => setScale(s => Math.max(s - 0.1, 0.3)), []);
    const handleZoomReset = useCallback(() => setScale(0.6), []);
    const handleFitWidth = useCallback(() => {
        if (scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.clientWidth - 32;
            const pageWidthPx = paper.width * PT_TO_PX;
            const newScale = Math.min(containerWidth / pageWidthPx, 1.0);
            setScale(Math.max(0.3, newScale));
        }
    }, [paper.width]);

    // Toggle handlers
    const handleTogglePhoto = useCallback(() => {
        const newValue = !design?.showPhoto;
        console.log('[NEXAL2] Toggling showPhoto to:', newValue);
        setShowPhoto(newValue);
    }, [design?.showPhoto, setShowPhoto]);

    const handleToggleSidebar = useCallback(() => {
        const newPos = design?.sidebarPosition === 'left' ? 'right' : 'left';
        console.log('[NEXAL2] Toggling sidebarPosition to:', newPos);
        setDesign({ sidebarPosition: newPos });
    }, [design?.sidebarPosition, setDesign]);

    // Region/Preset cycle handlers
    const handleCycleRegion = useCallback(() => {
        const regions = getRegionIds();
        const idx = regions.indexOf(regionId);
        const next = regions[(idx + 1) % regions.length];
        console.log(`[NEXAL2] Region: ${regionId} → ${next}`);
        setRegionId(next);
    }, [regionId]);

    const handleCyclePreset = useCallback(() => {
        const presets = getPresetIds();
        const idx = presets.indexOf(presetId);
        const next = presets[(idx + 1) % presets.length];
        console.log(`[NEXAL2] Preset: ${presetId} → ${next}`);
        setPresetId(next);
    }, [presetId]);

    // Dev: Run validation matrix
    const handleRunMatrix = useCallback(() => {
        const summary = runAndLogMatrix(profile, design);
        if (summary.failed > 0) {
            addToast(`Matrix: ${summary.failed}/${summary.total} failed`, 'error');
        } else {
            addToast(`Matrix: ${summary.passed}/${summary.total} passed ✓`, 'success');
        }
    }, [profile, design, addToast]);

    // Dev: Run pagination tests with long profile
    const handleRunPaginationTests = useCallback(() => {
        runAndLogLongProfileTests();
        addToast('Pagination tests completed - see console', 'success');
    }, [addToast]);

    // Dev: Run full pagination matrix (Phase 4.8)
    const handleRunPaginationMatrix = useCallback(() => {
        runAndLogPaginationMatrix();
        addToast('Pagination matrix completed - see console', 'success');
    }, [addToast]);

    // Download PDF handler (SINGLE EXPORT)
    const handleDownloadPDF = useCallback(async () => {
        setIsDownloading(true);
        setGeneratingPDF(true);
        try {
            const pdfDoc = <PDFRenderer layout={layout} title="CV-NEXAL2" layoutSignature={layoutSignature} margins={constraints.margins} bulletStyle={design?.bulletStyle || 'disc'} />;
            const blob = await pdf(pdfDoc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const firstName = profile?.personal?.firstName || 'CV';
            const lastName = profile?.personal?.lastName || '';
            link.download = `${firstName}_${lastName}_CV.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast('PDF téléchargé avec succès', 'success');
        } catch (error) {
            console.error('[NEXAL2] PDF download error:', error);
            addToast('Erreur de téléchargement PDF', 'error');
        } finally {
            setIsDownloading(false);
            setGeneratingPDF(false);
        }
    }, [layout, layoutSignature, profile, regionId, presetId, addToast, setGeneratingPDF, constraints.margins, design]);

    // Download ALL PDFs as a single multi-page PDF (Matrix Export)
    const [batchProgress, setBatchProgress] = useState<string | null>(null);
    const handleDownloadAllPDFs = useCallback(async () => {
        const allPresets = getPresetIds();
        const allRegions = getRegionIds();
        const total = allPresets.length * allRegions.length;

        setIsDownloading(true);
        setGeneratingPDF(true);
        setBatchProgress(`Generating layouts...`);

        const firstName = profile?.personal?.firstName || 'CV';
        const lastName = profile?.personal?.lastName || '';

        try {
            console.log(`[NEXAL2] Matrix export: ${allPresets.length} presets × ${allRegions.length} regions = ${total} combinations`);

            // Step 1: Generate all layouts first
            const entries: Array<{ layout: LayoutTree; presetId: string; regionId: string }> = [];
            let count = 0;

            for (const preset of allPresets) {
                for (const region of allRegions) {
                    count++;
                    setBatchProgress(`${count}/${total} layouts`);

                    try {
                        const batchConstraints = createConstraints({
                            regionId: region,
                            presetId: preset,
                            sidebarPosition: design?.sidebarPosition || 'left',
                        });

                        const { profile: nexalProfile, design: nexalDesign } = mapAppToNexal2(profile || {}, design);
                        const batchScene = buildScene(nexalProfile, nexalDesign);
                        const batchLayout = computeLayout(batchScene, batchConstraints);

                        entries.push({
                            layout: batchLayout,
                            presetId: preset,
                            regionId: region,
                        });
                    } catch (err) {
                        console.error(`[NEXAL2 Matrix] Failed ${preset}×${region}:`, err);
                    }
                }
            }

            // Step 2: Generate single PDF with all layouts
            setBatchProgress(`Rendering PDF...`);
            console.log(`[NEXAL2 Matrix] Generating PDF with ${entries.length} entries...`);

            const matrixDoc = <MatrixPDFRenderer entries={entries} title={`CV-Matrix-${firstName}_${lastName}`} />;
            const blob = await pdf(matrixDoc).toBlob();

            // Step 3: Download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${firstName}_${lastName}_MATRIX_${total}combinations.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            addToast(`PDF Matrix téléchargé (${entries.length} pages) !`, 'success');
        } catch (error) {
            console.error('[NEXAL2] Matrix export error:', error);
            addToast('Erreur lors du téléchargement matrix', 'error');
        } finally {
            setIsDownloading(false);
            setGeneratingPDF(false);
            setBatchProgress(null);
        }
    }, [profile, design, addToast, setGeneratingPDF]);

    // Loading state
    if (!profile) {
        return (
            <div className="w-full h-full min-h-0 flex items-center justify-center bg-slate-800/50 rounded-xl">
                <div className="text-slate-400 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    <span>Chargement du profil...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-0 flex flex-col relative">
            {/* Toolbar - Top Right */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
                {/* Engine Badge */}
                <div className="px-2 py-1 bg-indigo-600/80 backdrop-blur-sm text-white text-[10px] rounded-full">
                    NEXAL2
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 px-1 py-0.5 bg-slate-700/80 backdrop-blur-sm rounded-full border border-slate-600">
                    <button onClick={handleZoomOut} className="p-1 hover:bg-slate-600 rounded" title="Zoom Out">
                        <ZoomOut size={12} className="text-slate-300" />
                    </button>
                    <span className="text-[10px] text-slate-300 w-8 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1 hover:bg-slate-600 rounded" title="Zoom In">
                        <ZoomIn size={12} className="text-slate-300" />
                    </button>
                    <button onClick={handleFitWidth} className="p-1 hover:bg-slate-600 rounded border-l border-slate-600" title="Fit Width">
                        <Maximize size={12} className="text-slate-300" />
                    </button>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-600/80 backdrop-blur-sm text-white text-[10px] rounded-full hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isDownloading ? (
                        <RefreshCw className="animate-spin" size={10} />
                    ) : (
                        <Download size={10} />
                    )}
                    PDF
                </button>
            </div>

            {/* Dev Controls - Bottom Left */}
            <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1">
                {/* Region Toggle */}
                <button
                    onClick={handleCycleRegion}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-[10px] rounded-full border border-purple-500 hover:bg-purple-500"
                    title={`Region: ${regionId}`}
                >
                    <Globe size={10} />
                    {regionId} ({constraints.paperFormat})
                </button>

                {/* Preset Toggle */}
                <button
                    onClick={handleCyclePreset}
                    className="flex items-center gap-1 px-2 py-1 bg-orange-600/80 backdrop-blur-sm text-white text-[10px] rounded-full border border-orange-500 hover:bg-orange-500"
                    title={`Preset: ${presetId}`}
                >
                    <Layout size={10} />
                    {presetId}
                </button>

                {/* Photo Toggle - disabled when preset doesn't support photo */}
                <button
                    onClick={photoPolicy.canShowPhoto ? handleTogglePhoto : undefined}
                    disabled={!photoPolicy.canShowPhoto}
                    className={`flex items-center gap-1 px-2 py-1 backdrop-blur-sm text-[10px] rounded-full border ${!photoPolicy.canShowPhoto
                        ? 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                        : effectiveShowPhoto
                            ? 'bg-blue-600/80 text-white border-blue-500 hover:bg-blue-500'
                            : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
                        }`}
                    title={
                        !photoPolicy.canShowPhoto
                            ? `Photo disabled: ${photoPolicy.isDiscouraged ? 'ATS/US region discourages photos' : 'This preset does not support photo placement'}`
                            : `Photo: ${effectiveShowPhoto ? 'ON' : 'OFF'} (click to toggle)`
                    }
                >
                    {effectiveShowPhoto && photoPolicy.canShowPhoto ? <Camera size={10} /> : <CameraOff size={10} />}
                    Photo {!photoPolicy.canShowPhoto && '⊘'}
                </button>

                {/* Sidebar Position Toggle (only for SIDEBAR preset) */}
                {presetId === 'SIDEBAR' && (
                    <button
                        onClick={handleToggleSidebar}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-700/80 backdrop-blur-sm text-slate-300 text-[10px] rounded-full border border-slate-600 hover:bg-slate-600"
                        title={`Sidebar: ${design?.sidebarPosition?.toUpperCase()}`}
                    >
                        {design?.sidebarPosition === 'left' ? <PanelLeft size={10} /> : <PanelRight size={10} />}
                        {design?.sidebarPosition?.toUpperCase()}
                    </button>
                )}

                {/* Matrix Validation Button */}
                <button
                    onClick={handleRunMatrix}
                    className="flex items-center gap-1 px-2 py-1 bg-cyan-600/80 backdrop-blur-sm text-white text-[10px] rounded-full border border-cyan-500 hover:bg-cyan-500"
                    title="Run validation matrix on all region/preset combinations"
                >
                    ⚡ Matrix
                </button>

                {/* Pagination Test Button */}
                <button
                    onClick={handleRunPaginationTests}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-600/80 backdrop-blur-sm text-white text-[10px] rounded-full border border-emerald-500 hover:bg-emerald-500"
                    title="Run pagination tests with long profile"
                >
                    📄 Pagination
                </button>

                {/* Phase 4.8: Pagination Matrix Button */}
                <button
                    onClick={handleRunPaginationMatrix}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-[10px] rounded-full border border-purple-500 hover:bg-purple-500"
                    title="Run full pagination matrix (6 regions × 6 presets × 3 profiles)"
                >
                    📄⚡ Matrix+Paginate
                </button>

                {/* Batch PDF Export Button */}
                <button
                    onClick={handleDownloadAllPDFs}
                    disabled={isDownloading}
                    className="flex items-center gap-1 px-2 py-1 bg-rose-600/80 backdrop-blur-sm text-white text-[10px] rounded-full border border-rose-500 hover:bg-rose-500 disabled:opacity-50"
                    title="Download ALL PDFs (6 presets × 6 regions = 36 files)"
                >
                    {batchProgress ? (
                        <>📦 {batchProgress}</>
                    ) : (
                        <>📦 Export All PDFs</>
                    )}
                </button>
            </div>

            {/* Overflow Warning - Top Left */}
            {overflowInfo.isOverflowing && (
                <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-600/90 backdrop-blur-sm text-white text-[10px] rounded-full animate-pulse">
                        <AlertTriangle size={10} />
                        Overflow: +{Math.round(overflowInfo.overflowAmount)}pt
                    </div>
                </div>
            )}

            {/* Signature + Constraints Badge - Bottom Right */}
            <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1 items-end">
                <div className="px-2 py-1 bg-slate-800/80 backdrop-blur-sm text-slate-400 text-[9px] rounded font-mono">
                    Sig: {layoutSignature}
                </div>
                <div className="px-2 py-1 bg-slate-800/80 backdrop-blur-sm text-slate-500 text-[8px] rounded">
                    {paper.width}×{paper.height}pt • {constraints.density}
                </div>
            </div>

            {/* STRUCTURE MODE PANEL - Phase 7.1 */}
            {/* TASK B: Consolidated Dev Dock - Single container with vertical stacking */}
            <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-2 max-w-xs">
                {/* Structure Panel */}
                <StructurePanel />

                {/* DEBUG PANEL (dev only) - Collapsible profile inspector */}
                {import.meta.env.DEV && (
                    <details className="max-h-48 overflow-auto text-[9px] bg-slate-900/95 border border-slate-700 rounded p-2">
                        <summary className="cursor-pointer text-amber-400 font-bold">Debug Profile</summary>
                        <div className="mt-1 text-slate-300 space-y-1">
                            <div><strong>personal.firstName:</strong> {profile?.personal?.firstName || '∅'}</div>
                            <div><strong>personal.lastName:</strong> {profile?.personal?.lastName || '∅'}</div>
                            <div><strong>personal.title:</strong> {profile?.personal?.title || '∅'}</div>
                            <div><strong>personal.contact.email:</strong> {profile?.personal?.contact?.email || '∅'}</div>
                            <div><strong>personal.contact.phone:</strong> {profile?.personal?.contact?.phone || '∅'}</div>
                            <div><strong>personal.contact.address:</strong> {String(profile?.personal?.contact?.address || '∅')}</div>
                            <div><strong>experiences.length:</strong> {profile?.experiences?.length || 0}</div>
                            <div><strong>educations.length:</strong> {profile?.educations?.length || 0}</div>
                            <div><strong>skills.length:</strong> {profile?.skills?.length || 0}</div>
                            <div><strong>languages.length:</strong> {profile?.languages?.length || 0}</div>

                            {/* RAW education data (before adapter) */}
                            {profile?.educations?.[0] && (
                                <div className="border-t border-slate-700 pt-1">
                                    <strong className="text-orange-400">RAW educations[0] keys:</strong> {Object.keys(profile.educations[0]).join(', ')}
                                    <div className="text-[8px] text-slate-400">
                                        {JSON.stringify(profile.educations[0], null, 0).slice(0, 150)}...
                                    </div>
                                </div>
                            )}

                            {/* MAPPED education data (after adapter) */}
                            {nexal2Profile?.educations?.[0] && (
                                <div className="border-t border-slate-700 pt-1">
                                    <strong className="text-green-400">MAPPED edu[0]:</strong>
                                    degree="{nexal2Profile.educations[0].degree || '∅'}"
                                    school="{nexal2Profile.educations[0].school || '∅'}"
                                    year="{nexal2Profile.educations[0].year || '∅'}"
                                </div>
                            )}

                            <div><strong>layout.pages.length:</strong> {layout?.pages?.length || 0}</div>
                        </div>
                    </details>
                )}
            </div>

            {/* CV Preview - Multi-page stacking */}
            <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-auto p-4 bg-slate-900/50"
            >
                <div className="mx-auto w-fit">
                    <div
                        style={{
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            borderRadius: 4,
                            // REMOVED overflow: hidden - was clipping multi-page content
                        }}
                    >
                        <EditableHTMLRenderer
                            layout={layout}
                            scale={scale}
                            debug={false}
                            layoutSignature={layoutSignature}
                            margins={constraints.margins}
                            bulletStyle={design?.bulletStyle || 'disc'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NEXAL2PreviewPane;

/**
 * ExportTab - Multi-format export hub
 * 
 * Beautiful UI for exporting CV to multiple formats:
 * PDF, Word, LinkedIn, Text, JSON
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    FileDown,
    Linkedin,
    AlignLeft,
    Database,
    Download,
    Check,
    Loader2,
    Sparkles
} from 'lucide-react';

import { useProfile, useDesign, useSectionOrder } from '../../../../application/store/v2';
import { MultiFormatExportService, type ExportFormat } from '../../../../application/services/export/MultiFormatExportService';

// ============================================================================
// EXPORT FORMATS CONFIG
// ============================================================================

interface ExportFormatConfig {
    id: ExportFormat;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
}

const EXPORT_FORMATS: ExportFormatConfig[] = [
    {
        id: 'pdf',
        name: 'PDF',
        description: 'Format classique pour envoi',
        icon: <FileText className="w-5 h-5" />,
        color: 'text-red-400',
        gradient: 'from-red-500 to-orange-500'
    },
    {
        id: 'docx',
        name: 'Word',
        description: 'Éditable dans Microsoft Word',
        icon: <FileDown className="w-5 h-5" />,
        color: 'text-blue-400',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Optimisé pour ton profil LinkedIn',
        icon: <Linkedin className="w-5 h-5" />,
        color: 'text-sky-400',
        gradient: 'from-sky-500 to-blue-600'
    },
    {
        id: 'txt',
        name: 'Texte',
        description: 'Format texte simple',
        icon: <AlignLeft className="w-5 h-5" />,
        color: 'text-slate-400',
        gradient: 'from-slate-500 to-gray-600'
    },
    {
        id: 'json',
        name: 'Backup',
        description: 'Sauvegarde complète (JSON)',
        icon: <Database className="w-5 h-5" />,
        color: 'text-green-400',
        gradient: 'from-green-500 to-emerald-500'
    }
];

// ============================================================================
// EXPORT BUTTON COMPONENT
// ============================================================================

interface ExportButtonProps {
    format: ExportFormatConfig;
    onExport: (format: ExportFormat) => void;
    isExporting: boolean;
    isSuccess: boolean;
}

function ExportButton({ format, onExport, isExporting, isSuccess }: ExportButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onExport(format.id)}
            disabled={isExporting}
            className="relative w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left group overflow-hidden"
        >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${format.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

            <div className="relative flex items-center gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${format.gradient} flex items-center justify-center text-white`}>
                    {isExporting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSuccess ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        format.icon
                    )}
                </div>

                {/* Text */}
                <div className="flex-1">
                    <div className="font-medium text-white">{format.name}</div>
                    <div className="text-xs text-slate-400">{format.description}</div>
                </div>

                {/* Download icon */}
                <Download className={`w-4 h-4 ${format.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
        </motion.button>
    );
}

// ============================================================================
// MAIN EXPORT TAB
// ============================================================================

export function ExportTab() {
    const profile = useProfile();
    const design = useDesign();
    const sectionOrder = useSectionOrder();
    const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
    const [successFormat, setSuccessFormat] = useState<ExportFormat | null>(null);

    const handleExport = async (format: ExportFormat) => {
        if (format === 'pdf') {
            // Use same reliable method as PreviewPane (POST with profile)
            setExportingFormat('pdf');
            setSuccessFormat(null);

            try {
                const currentRegionId = localStorage.getItem('nexal_region_preference') || 'dach';
                const paperFormat = (currentRegionId === 'usa') ? 'LETTER' : 'A4';
                const templateId = profile?.metadata?.templateId || 'chameleon';

                const response = await fetch('/api/puppeteer-pdf/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profile,
                        design,
                        sectionOrder,  // Include section order for consistent rendering
                        language: 'fr',
                        paperFormat,
                        regionId: currentRegionId,
                        templateId
                    }),
                });

                if (!response.ok) throw new Error('PDF generation failed');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${profile?.personal?.firstName || 'CV'}_${profile?.personal?.lastName || ''}_CV.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setSuccessFormat('pdf');
                setTimeout(() => setSuccessFormat(null), 2000);
            } catch (error) {
                console.error('PDF generation error:', error);
            } finally {
                setExportingFormat(null);
            }
            return;
        }

        setExportingFormat(format);
        setSuccessFormat(null);

        try {
            // Small delay for UX
            await new Promise(r => setTimeout(r, 500));

            const result = await MultiFormatExportService.export(profile as any, { format });

            if (result.success) {
                MultiFormatExportService.download(result);
                setSuccessFormat(format);
                // Clear success after 2s
                setTimeout(() => setSuccessFormat(null), 2000);
            } else {
                console.error('Export failed:', result.error);
            }
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setExportingFormat(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Export Multi-Format</h2>
                    <p className="text-xs text-slate-400">Télécharge ton CV dans le format de ton choix</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                    <div className="text-lg font-bold text-white">{profile?.experiences?.length || 0}</div>
                    <div className="text-[10px] text-slate-400">Expériences</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                    <div className="text-lg font-bold text-white">{profile?.skills?.length || 0}</div>
                    <div className="text-[10px] text-slate-400">Compétences</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                    <div className="text-lg font-bold text-white">{profile?.educations?.length || 0}</div>
                    <div className="text-[10px] text-slate-400">Formations</div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2">
                {EXPORT_FORMATS.map((format) => (
                    <ExportButton
                        key={format.id}
                        format={format}
                        onExport={handleExport}
                        isExporting={exportingFormat === format.id}
                        isSuccess={successFormat === format.id}
                    />
                ))}
            </div>

            {/* Pro Tip */}
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 text-xs text-purple-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Pro tip: Utilise le format LinkedIn pour optimiser ton profil !</span>
                </div>
            </div>
        </div>
    );
}

export default ExportTab;

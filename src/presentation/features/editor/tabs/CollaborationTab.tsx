/**
 * CollaborationTab - Share, collaborate, and version history
 * 
 * Beautiful UI for collaboration features:
 * - Share with link
 * - Comments
 * - Version history
 * - Export to Notion/Obsidian
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users2,
    Link2,
    History,
    Copy,
    Check,
    Trash2,
    ExternalLink,
    FileDown,
    Plus
} from 'lucide-react';

import { useProfile } from '../../../../application/store/v2';
import { CollaborationService, type ShareLink, type CVVersion } from '../../../../application/services/collaboration/CollaborationService';

// ============================================================================
// SHARE SECTION
// ============================================================================

function ShareSection() {
    const _profile = useProfile(); // Keep for future use
    const [links, setLinks] = useState<ShareLink[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        setLinks(CollaborationService.getShareLinks('current'));
    }, []);

    const createLink = (permission: ShareLink['permission']) => {
        const link = CollaborationService.createShareLink('current', permission);
        setLinks(prev => [...prev, link]);
    };

    const deleteLink = (linkId: string) => {
        CollaborationService.deleteShareLink('current', linkId);
        setLinks(prev => prev.filter(l => l.id !== linkId));
    };

    const copyLink = async (link: ShareLink) => {
        await navigator.clipboard.writeText(link.url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-400" />
                    Liens de partage
                </h3>
                <div className="flex gap-1">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => createLink('view')}
                        className="px-2 py-1 text-[10px] bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                    >
                        + Lecture
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => createLink('comment')}
                        className="px-2 py-1 text-[10px] bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                    >
                        + Commentaire
                    </motion.button>
                </div>
            </div>

            <div className="space-y-2">
                <AnimatePresence>
                    {links.map(link => (
                        <motion.div
                            key={link.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className={`px-1.5 py-0.5 rounded text-[10px] ${link.permission === 'view'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : link.permission === 'comment'
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-orange-500/20 text-orange-300'
                                }`}>
                                {link.permission}
                            </div>
                            <div className="flex-1 text-xs text-slate-400 truncate font-mono">
                                {link.url.slice(-20)}
                            </div>
                            <span className="text-[10px] text-slate-500">{link.viewCount} vues</span>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => copyLink(link)}
                                className="p-1 text-slate-400 hover:text-white"
                            >
                                {copiedId === link.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteLink(link.id)}
                                className="p-1 text-slate-400 hover:text-red-400"
                            >
                                <Trash2 className="w-3 h-3" />
                            </motion.button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {links.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500">
                        Aucun lien de partage créé
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// VERSION HISTORY SECTION
// ============================================================================

function VersionSection() {
    const profile = useProfile();
    const [versions, setVersions] = useState<CVVersion[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [versionName, setVersionName] = useState('');

    useEffect(() => {
        setVersions(CollaborationService.getVersions('current'));
    }, []);

    const saveVersion = () => {
        if (!versionName.trim() || !profile) return;

        const version = CollaborationService.saveVersion(
            'current',
            profile as any,
            versionName,
            'Moi'
        );
        setVersions(prev => [version, ...prev]);
        setVersionName('');
        setShowInput(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    Historique des versions
                </h3>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInput(!showInput)}
                    className="p-1 text-slate-400 hover:text-white"
                >
                    <Plus className="w-4 h-4" />
                </motion.button>
            </div>

            <AnimatePresence>
                {showInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={versionName}
                            onChange={e => setVersionName(e.target.value)}
                            placeholder="Nom de la version..."
                            className="flex-1 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveVersion}
                            disabled={!versionName.trim()}
                            className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg disabled:opacity-50"
                        >
                            Sauver
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {versions.slice(0, 5).map(version => (
                    <div
                        key={version.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                        <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs">
                            v{versions.indexOf(version) + 1}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-medium text-white">{version.name}</div>
                            <div className="text-[10px] text-slate-500">
                                {new Date(version.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>
                ))}

                {versions.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500">
                        Aucune version sauvegardée
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// EXPORT SECTION
// ============================================================================

function ExportNotionSection() {
    const profile = useProfile();

    const exportToFormat = (format: 'markdown' | 'notion' | 'obsidian') => {
        if (!profile) return;

        let content: string;
        let filename: string;

        switch (format) {
            case 'notion':
                content = CollaborationService.exportToNotion(profile as any);
                filename = 'cv-notion.md';
                break;
            case 'obsidian':
                content = CollaborationService.exportToObsidian(profile as any);
                filename = 'cv-obsidian.md';
                break;
            default:
                content = CollaborationService.exportToMarkdown(profile as any);
                filename = 'cv.md';
        }

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-orange-400" />
                Export Avancé
            </h3>

            <div className="grid grid-cols-3 gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportToFormat('markdown')}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-center"
                >
                    <FileDown className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                    <div className="text-[10px] text-slate-300">Markdown</div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportToFormat('notion')}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-center"
                >
                    <div className="w-5 h-5 mx-auto mb-1 text-lg">📝</div>
                    <div className="text-[10px] text-slate-300">Notion</div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportToFormat('obsidian')}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-center"
                >
                    <div className="w-5 h-5 mx-auto mb-1 text-lg">💎</div>
                    <div className="text-[10px] text-slate-300">Obsidian</div>
                </motion.button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN COLLABORATION TAB
// ============================================================================

export function CollaborationTab() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Users2 className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">Collaboration</h2>
                    <p className="text-xs text-slate-400">Partage, versions & export</p>
                </div>
            </div>

            {/* Sections */}
            <ShareSection />

            <div className="border-t border-white/10" />

            <VersionSection />

            <div className="border-t border-white/10" />

            <ExportNotionSection />
        </div>
    );
}

export default CollaborationTab;

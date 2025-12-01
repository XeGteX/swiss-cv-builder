/**
 * Zone de Quarantaine - Dead Code Modal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, FileCode, Calendar, HardDrive, Loader } from 'lucide-react';

interface DeadFile {
    path: string;
    relativePath: string;
    size: number;
    lastModified: Date;
    reason: string;
}

interface KairosReport {
    scanDate: Date;
    filesScanned: number;
    orphansFound: number;
    deadFiles: DeadFile[];
    totalWasteBytes: number;
}

interface QuarantineModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: KairosReport | null;
    onPurge: (files?: string[]) => Promise<void>;
    onRescan: () => void;
}

export const QuarantineModal: React.FC<QuarantineModalProps> = ({
    isOpen,
    onClose,
    report,
    onPurge,
    onRescan
}) => {
    const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
    const [isPurging, setIsPurging] = useState(false);

    if (!isOpen) return null;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDeleteFile = async (filePath: string) => {
        setDeletingFiles(prev => new Set(prev).add(filePath));
        try {
            await onPurge([filePath]);
        } finally {
            setDeletingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(filePath);
                return newSet;
            });
        }
    };

    const handlePurgeAll = async () => {
        setIsPurging(true);
        try {
            await onPurge();
        } finally {
            setIsPurging(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-red-500/30 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertTriangle className="text-red-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Zone de Quarantaine</h2>
                                    <p className="text-sm text-slate-400">
                                        KAIROS - Détection de Code Mort
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="text-slate-400" size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {report && (
                        <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-slate-500 mb-1">Fichiers Analysés</p>
                                <p className="text-2xl font-bold text-white">{report.filesScanned}</p>
                            </div>
                            <div className="bg-red-500/10 rounded-xl p-4">
                                <p className="text-xs text-slate-500 mb-1">Orphelins Détectés</p>
                                <p className="text-2xl font-bold text-red-400">{report.orphansFound}</p>
                            </div>
                            <div className="bg-orange-500/10 rounded-xl p-4">
                                <p className="text-xs text-slate-500 mb-1">Espace Gaspillé</p>
                                <p className="text-2xl font-bold text-orange-400">
                                    {formatBytes(report.totalWasteBytes)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    <div className="p-6 overflow-y-auto max-h-96">
                        {!report ? (
                            <div className="text-center py-12 text-slate-500">
                                Aucun rapport disponible. Lancez un scan.
                            </div>
                        ) : report.deadFiles.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
                                    <FileCode className="text-green-400" size={48} />
                                </div>
                                <p className="text-lg font-semibold text-white">Projet Propre !</p>
                                <p className="text-sm text-slate-400 mt-2">
                                    Aucun fichier orphelin détecté
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {report.deadFiles.map((file, index) => {
                                    const isDeleting = deletingFiles.has(file.path);
                                    return (
                                        <motion.div
                                            key={file.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <FileCode className="text-red-400 mt-1 shrink-0" size={20} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-mono text-white truncate">
                                                            {file.relativePath}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <HardDrive size={12} />
                                                                {formatBytes(file.size)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {formatDate(file.lastModified)}
                                                            </span>
                                                            <span className="text-red-400">
                                                                {file.reason}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteFile(file.path)}
                                                    disabled={isDeleting}
                                                    className="shrink-0 p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Supprimer ce fichier"
                                                >
                                                    {isDeleting ? (
                                                        <Loader className="text-red-400 animate-spin" size={16} />
                                                    ) : (
                                                        <Trash2 className="text-red-400" size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-white/10 px-6 py-4 bg-slate-950/50">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={onRescan}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                🔄 Re-scanner
                            </button>

                            <div className="flex items-center gap-3">
                                {report && report.deadFiles.length > 0 && (
                                    <button
                                        onClick={handlePurgeAll}
                                        disabled={isPurging}
                                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPurging ? (
                                            <>
                                                <Loader className="animate-spin" size={18} />
                                                PURGE EN COURS...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={18} />
                                                TOUT PURGER ({report.deadFiles.length})
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

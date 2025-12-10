import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Copy, Check, Clock, Crown, ExternalLink } from 'lucide-react';
import { useGate, useUpsellModalStore } from '../../../application/hooks/useGate';
import { useCVStoreV2 as useCVStore } from '@/application/store/v2/cv-store-v2';
import { cn } from '../../design-system/atoms/Button';
import { create } from 'zustand';

// Store for ShareModal visibility
interface ShareModalState {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useShareModalStore = create<ShareModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false })
}));

export const ShareModal: React.FC = () => {
    const { isOpen, closeModal } = useShareModalStore();
    const { openModal: openUpsellModal } = useUpsellModalStore();
    const gate = useGate();
    const { profile } = useCVStore();

    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [expiryTime, setExpiryTime] = useState<Date | null>(null);

    // Check if user has permanent link access
    const { allowed: hasPermanentAccess } = gate.checkGate('PUBLISH_LINK');

    // Generate share link on open
    useEffect(() => {
        if (isOpen) {
            // Generate a unique share link
            const uniqueId = `${profile.id || 'cv'}-${Date.now().toString(36)}`;
            const link = `${window.location.origin}/cv/${uniqueId}`;
            setShareLink(link);

            // Set expiry for free users (24h from now)
            if (!hasPermanentAccess) {
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 24);
                setExpiryTime(expiry);
            } else {
                setExpiryTime(null);
            }
        }
    }, [isOpen, profile.id, hasPermanentAccess]);

    // Copy to clipboard
    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Trigger upsell for permanent link
    const handleUnlockPermanent = () => {
        openUpsellModal('publish_link');
    };

    // Calculate remaining time
    const getRemainingTime = () => {
        if (!expiryTime) return null;
        const now = new Date();
        const diff = expiryTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}min`;
    };

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeModal]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
                        >
                            <X size={18} />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                                    <Link2 className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Partager votre CV
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        Obtenez un lien public pour partager
                                    </p>
                                </div>
                            </div>

                            {/* Demo Badge for Free Users */}
                            {!hasPermanentAccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                                >
                                    <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                                        <Clock size={16} />
                                        <span>Mode Démo - Expire dans {getRemainingTime() || '24h'}</span>
                                    </div>
                                    <p className="text-xs text-amber-400/70 mt-1">
                                        Le lien sera désactivé après 24 heures
                                    </p>
                                </motion.div>
                            )}

                            {/* Permanent Link Badge */}
                            {hasPermanentAccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                                >
                                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                        <Crown size={16} />
                                        <span>Lien Permanent Activé</span>
                                    </div>
                                    <p className="text-xs text-emerald-400/70 mt-1">
                                        Ce lien n'expire jamais
                                    </p>
                                </motion.div>
                            )}

                            {/* Share Link Input */}
                            <div className="mb-4">
                                <label className="text-xs font-medium text-slate-400 mb-2 block">
                                    Votre lien de partage
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 px-3 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCopy}
                                        className={cn(
                                            "px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2",
                                            copied
                                                ? "bg-emerald-600 text-white"
                                                : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                        )}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={16} />
                                                Copié!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                Copier
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Open Link Button */}
                            <a
                                href={shareLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors mb-4"
                            >
                                <ExternalLink size={16} />
                                Ouvrir dans un nouvel onglet
                            </a>

                            {/* Unlock Permanent Link CTA (Free Users) */}
                            {!hasPermanentAccess && (
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleUnlockPermanent}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Crown size={18} />
                                    Activer le lien permanent
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;

/**
 * HardwareAlert - Performance Warning Banner
 * 
 * PR5: Shows non-blocking alert when software rendering is detected.
 * Persists "don't show again" preference in localStorage.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import {
    detectHardwareAcceleration,
    shouldShowHardwareWarning,
    dismissHardwareWarning,
    type HardwareAccelerationResult
} from '../../infrastructure/hardware/hardwareAcceleration';

export const HardwareAlert: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hwResult, setHwResult] = useState<HardwareAccelerationResult | null>(null);

    useEffect(() => {
        // Check on mount
        if (!shouldShowHardwareWarning()) {
            return;
        }

        const result = detectHardwareAcceleration();
        setHwResult(result);

        // Only show if software rendering detected
        if (result.isSoftwareRendering) {
            // Delay slightly so it doesn't flash on load
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleDontShowAgain = () => {
        dismissHardwareWarning();
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-full mx-4"
                >
                    <div className="bg-gradient-to-r from-amber-900/95 to-orange-900/95 backdrop-blur-xl rounded-xl border border-amber-500/30 shadow-2xl shadow-amber-500/20 p-4">
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-amber-100 text-sm">
                                    Performances réduites détectées
                                </h3>
                                <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                                    L'accélération matérielle semble désactivée. Nexal fonctionne,
                                    mais peut fortement ralentir. Activez l'accélération matérielle
                                    dans les paramètres de votre navigateur pour de meilleures performances.
                                </p>

                                {/* Renderer info (dev) */}
                                {hwResult && import.meta.env.DEV && (
                                    <p className="text-[10px] text-amber-300/50 mt-2 font-mono truncate">
                                        {hwResult.renderer}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-1.5 text-xs font-medium text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
                                    >
                                        Compris
                                    </button>
                                    <button
                                        onClick={handleDontShowAgain}
                                        className="px-3 py-1.5 text-xs text-amber-300/70 hover:text-amber-100 transition-colors flex items-center gap-1"
                                    >
                                        Ne plus afficher
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="shrink-0 p-1 text-amber-400/60 hover:text-amber-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HardwareAlert;

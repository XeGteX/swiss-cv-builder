import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { useSmartReview } from '../../application/hooks/useGate';
import { create } from 'zustand';

// Store for managing review toast visibility
interface ReviewToastState {
    isVisible: boolean;
    showToast: () => void;
    hideToast: () => void;
}

export const useReviewToastStore = create<ReviewToastState>((set) => ({
    isVisible: false,
    showToast: () => set({ isVisible: true }),
    hideToast: () => set({ isVisible: false })
}));

// Hook to trigger review toast after save
export const useSmartReviewTrigger = () => {
    const { incrementSaveCount, shouldShowReviewPrompt, markAsRated } = useSmartReview();
    const { showToast, hideToast } = useReviewToastStore();

    const onSave = () => {
        incrementSaveCount();

        // Check if we should show review prompt 3 seconds after save
        if (shouldShowReviewPrompt()) {
            setTimeout(() => {
                showToast();
            }, 3000);
        }
    };

    return { onSave, markAsRated, hideToast };
};

// The Smart Review Toast component
export const SmartReviewToast: React.FC = () => {
    const { isVisible, hideToast } = useReviewToastStore();
    const { markAsRated } = useSmartReview();

    // Auto-hide after 8 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                hideToast();
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, hideToast]);

    const handleRate = () => {
        markAsRated();
        hideToast();
        // Open rating page
        window.open('https://www.trustpilot.com/review/nexal.ch', '_blank');
    };

    const handleDismiss = () => {
        hideToast();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-6 right-6 z-[90] max-w-sm"
                >
                    <div className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-purple-900/30 rounded-2xl border border-white/10 shadow-2xl p-5 backdrop-blur-xl">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={14} />
                        </button>

                        {/* Content */}
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-400/30 flex items-center justify-center">
                                <Star className="text-amber-400" size={24} fill="currentColor" />
                            </div>

                            {/* Text */}
                            <div className="flex-1 pr-4">
                                <h4 className="text-white font-semibold mb-1">
                                    Satisfait ?
                                </h4>
                                <p className="text-slate-400 text-sm mb-3">
                                    Votre avis nous aide à améliorer Nexal
                                </p>

                                {/* CTA */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRate}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-medium rounded-lg shadow-lg transition-all"
                                >
                                    <Star size={14} fill="currentColor" />
                                    Notez-nous ⭐
                                </motion.button>
                            </div>
                        </div>

                        {/* Decorative gradient */}
                        <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SmartReviewToast;

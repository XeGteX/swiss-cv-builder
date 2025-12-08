/**
 * DebugBar - Barre flottante affichée quand le mode debug est actif
 * Permet de voir le résumé des issues et de désactiver le mode
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { useDebugStore, getSeverityColor } from '../../../application/store/debug-store';

export const DebugBar: React.FC = () => {
    const isDebugMode = useDebugStore(s => s.isDebugMode);
    const issues = useDebugStore(s => s.issues);
    const disableDebugMode = useDebugStore(s => s.disableDebugMode);

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const improvementCount = issues.filter(i => i.severity === 'improvement').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    return (
        <AnimatePresence>
            {isDebugMode && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 20, 45, 0.95))',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Icon */}
                    <div className="flex items-center gap-2">
                        <Bug size={20} className="text-orange-400 animate-pulse" />
                        <span className="text-white font-semibold">Mode Debug</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-white/20" />

                    {/* Issue counts */}
                    <div className="flex items-center gap-3">
                        {criticalCount > 0 && (
                            <div className="flex items-center gap-1.5" style={{ color: getSeverityColor('critical').border }}>
                                <XCircle size={16} />
                                <span className="text-sm font-medium">{criticalCount}</span>
                            </div>
                        )}
                        {warningCount > 0 && (
                            <div className="flex items-center gap-1.5" style={{ color: getSeverityColor('warning').border }}>
                                <AlertTriangle size={16} />
                                <span className="text-sm font-medium">{warningCount}</span>
                            </div>
                        )}
                        {improvementCount > 0 && (
                            <div className="flex items-center gap-1.5" style={{ color: getSeverityColor('improvement').border }}>
                                <AlertCircle size={16} />
                                <span className="text-sm font-medium">{improvementCount}</span>
                            </div>
                        )}
                        {infoCount > 0 && (
                            <div className="flex items-center gap-1.5" style={{ color: getSeverityColor('info').border }}>
                                <Info size={16} />
                                <span className="text-sm font-medium">{infoCount}</span>
                            </div>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={disableDebugMode}
                        className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={18} className="text-slate-400 hover:text-white" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DebugBar;

/**
 * DebugHighlight - Composant wrapper qui affiche les issues NanoBrain
 * Utilisé pour entourer les champs du CV d'un highlight coloré
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFieldIssues, getSeverityColor, type DebugIssue } from '../../../application/store/debug-store';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';

interface DebugHighlightProps {
    field: string;
    children: React.ReactNode;
    className?: string;
}

const SeverityIcon: React.FC<{ severity: DebugIssue['severity'] }> = ({ severity }) => {
    const size = 14;
    switch (severity) {
        case 'critical': return <XCircle size={size} />;
        case 'warning': return <AlertTriangle size={size} />;
        case 'improvement': return <AlertCircle size={size} />;
        case 'info': return <Info size={size} />;
    }
};

export const DebugHighlight: React.FC<DebugHighlightProps> = ({ field, children, className = '' }) => {
    const issues = useFieldIssues(field);
    const [showTooltip, setShowTooltip] = React.useState(false);

    if (issues.length === 0) {
        return <>{children}</>;
    }

    // Prendre la sévérité la plus haute
    const highestSeverity = issues.reduce<DebugIssue['severity']>((acc, i) => {
        const order = { critical: 4, warning: 3, improvement: 2, info: 1 };
        return order[i.severity] > order[acc] ? i.severity : acc;
    }, 'info');

    const colors = getSeverityColor(highestSeverity);

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none rounded"
                style={{
                    backgroundColor: colors.bg,
                    border: `2px dashed ${colors.border}`,
                    zIndex: 10,
                }}
            />

            {/* Badge count */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-20"
                style={{ backgroundColor: colors.border, color: 'white' }}
            >
                {issues.length}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-50 min-w-[280px] p-3 rounded-lg shadow-xl"
                        style={{
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '8px',
                            backgroundColor: 'rgba(15, 23, 42, 0.98)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <div className="space-y-2">
                            {issues.map((issue, i) => {
                                const c = getSeverityColor(issue.severity);
                                return (
                                    <div key={i} className="flex items-start gap-2">
                                        <div style={{ color: c.border }} className="mt-0.5">
                                            <SeverityIcon severity={issue.severity} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white">{issue.message}</p>
                                            {issue.suggestion && (
                                                <p className="text-xs text-slate-400 mt-1">→ {issue.suggestion}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Arrow */}
                        <div
                            className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
                            style={{
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderBottom: '8px solid rgba(15, 23, 42, 0.98)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {children}
        </div>
    );
};

export default DebugHighlight;

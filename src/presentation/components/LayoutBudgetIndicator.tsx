/**
 * LayoutBudgetIndicator - Visual Feedback for Page Layout
 * 
 * Shows:
 * - Content fill percentage (like a battery meter)
 * - Warning when approaching overflow
 * - Suggested action when overflowing
 */

import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import type { LayoutBudget } from '../hooks/useLayoutBudget';

interface LayoutBudgetIndicatorProps {
    budget: LayoutBudget;
    onApplySuggestedScale?: (scale: number) => void;
    compact?: boolean;
}

export const LayoutBudgetIndicator: React.FC<LayoutBudgetIndicatorProps> = ({
    budget,
    onApplySuggestedScale,
    compact = false,
}) => {
    const {
        estimatedContentHeight,
        availableHeight,
        willOverflow,
        overflowPercent,
        suggestedScale,
        needsSecondPage,
    } = budget;

    // Calculate fill percentage (capped at 100 for display)
    const fillPercent = Math.min(100, (estimatedContentHeight / availableHeight) * 100);

    // Determine status
    const status = needsSecondPage
        ? 'error'
        : willOverflow
            ? 'warning'
            : fillPercent > 85
                ? 'caution'
                : 'ok';

    const colors = {
        ok: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        caution: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
        warning: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' },
        error: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
    };

    const color = colors[status];

    if (compact) {
        return (
            <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 border ${color.border}`}
                title={`Page fill: ${Math.round(fillPercent)}%${willOverflow ? ' (overflow!)' : ''}`}
            >
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color.bg} transition-all duration-300`}
                        style={{ width: `${Math.min(100, fillPercent)}%` }}
                    />
                </div>
                <span className={`text-xs font-mono ${color.text}`}>
                    {Math.round(fillPercent)}%
                </span>
            </div>
        );
    }

    return (
        <div className={`p-3 rounded-lg bg-slate-800/50 border ${color.border}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">Page Layout</span>
                <div className="flex items-center gap-1">
                    {status === 'ok' && <CheckCircle size={12} className="text-emerald-400" />}
                    {status === 'caution' && <AlertCircle size={12} className="text-amber-400" />}
                    {(status === 'warning' || status === 'error') && (
                        <AlertTriangle size={12} className="text-orange-400" />
                    )}
                    <span className={`text-xs font-mono ${color.text}`}>
                        {Math.round(fillPercent)}%
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full ${color.bg} transition-all duration-300`}
                    style={{ width: `${Math.min(100, fillPercent)}%` }}
                />
            </div>

            {/* Status message */}
            {status === 'ok' && (
                <p className="text-xs text-slate-400">✓ Contenu optimal</p>
            )}
            {status === 'caution' && (
                <p className="text-xs text-amber-400/80">Page presque pleine</p>
            )}
            {status === 'warning' && (
                <div className="space-y-1">
                    <p className="text-xs text-orange-400">
                        ⚠ Débordement +{overflowPercent}%
                    </p>
                    {onApplySuggestedScale && suggestedScale < 1 && (
                        <button
                            onClick={() => onApplySuggestedScale(suggestedScale)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                        >
                            Auto-ajuster taille ({Math.round(suggestedScale * 100)}%)
                        </button>
                    )}
                </div>
            )}
            {status === 'error' && (
                <p className="text-xs text-red-400">
                    ⛔ 2 pages nécessaires - Réduisez le contenu
                </p>
            )}
        </div>
    );
};

export default LayoutBudgetIndicator;

/**
 * SmartDateRange - Region-aware date formatting
 * 
 * Formats date ranges according to regional conventions:
 * - USA: MM/YYYY - MM/YYYY or Present
 * - DACH: DD.MM.YYYY - DD.MM.YYYY oder Heute
 * - France: Janv. 2024 - Présent
 * - Japan: YYYY/MM - YYYY/MM or 現在
 */

import React from 'react';
import { useDateRangeFormatter } from '../../hooks/useRegion';

interface SmartDateRangeProps {
    startDate: string;
    endDate?: string | null;
    className?: string;
    showIcon?: boolean;
}

export const SmartDateRange: React.FC<SmartDateRangeProps> = ({
    startDate,
    endDate,
    className = '',
    showIcon = false
}) => {
    const formatRange = useDateRangeFormatter();

    const formattedRange = formatRange(startDate, endDate);

    return (
        <span className={`smart-date-range text-sm text-gray-500 ${className}`}>
            {showIcon && (
                <svg
                    className="inline-block w-4 h-4 mr-1 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            )}
            {formattedRange}
        </span>
    );
};

export default SmartDateRange;

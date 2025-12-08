/**
 * EditableDateRange - Editable date range for experiences
 * 
 * Wraps SmartDateRange with click-to-edit functionality
 * Uses InlineDatePicker for start and end dates
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useFieldValue, useUpdateField } from '../../../application/store/v2';
import { useMode } from '../../../application/store/v2';
import { InlineDatePicker } from './InlineDatePicker';
import { useDateRangeFormatter } from '../../hooks/useRegion';

interface EditableDateRangeProps {
    experienceIndex: number;
    className?: string;
}

export const EditableDateRange: React.FC<EditableDateRangeProps> = ({
    experienceIndex,
    className = ''
}) => {
    const mode = useMode();
    const updateField = useUpdateField();
    const formatRange = useDateRangeFormatter();

    // Get the dates string from store
    const dates = useFieldValue<string>(`experiences.${experienceIndex}.dates`) || '';

    // Parse dates string into start and end
    const parts = dates.split(' - ');
    const startDate = parts[0] || '';
    const endDate = parts[1] || '';

    const [isEditingStart, setIsEditingStart] = useState(false);
    const [isEditingEnd, setIsEditingEnd] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

    // Format for display
    const displayText = formatRange(startDate, endDate || undefined);

    // In modele mode, just show text
    if (mode === 'modele') {
        return (
            <span className={`text-sm text-gray-500 ${className}`}>
                {displayText}
            </span>
        );
    }

    const handleStartDateChange = (newStart: string) => {
        const newDates = endDate ? `${newStart} - ${endDate}` : `${newStart} - Présent`;
        updateField(`experiences.${experienceIndex}.dates`, newDates);
    };

    const handleEndDateChange = (newEnd: string) => {
        const newDates = `${startDate} - ${newEnd}`;
        updateField(`experiences.${experienceIndex}.dates`, newDates);
    };

    const handleStartClick = (e: React.MouseEvent) => {
        setClickPosition({ x: e.clientX, y: e.clientY });
        setIsEditingStart(true);
    };

    const handleEndClick = (e: React.MouseEvent) => {
        setClickPosition({ x: e.clientX, y: e.clientY });
        setIsEditingEnd(true);
    };

    return (
        <div className={`relative flex items-center gap-1 text-sm text-gray-500 ${className}`}>
            {/* Start Date */}
            <span
                onClick={handleStartClick}
                className="cursor-pointer hover:text-purple-600 hover:underline transition-colors"
                title="Cliquer pour modifier la date de début"
            >
                {startDate || 'Date début'}
            </span>

            <span className="text-gray-400">-</span>

            {/* End Date */}
            <span
                onClick={handleEndClick}
                className="cursor-pointer hover:text-purple-600 hover:underline transition-colors"
                title="Cliquer pour modifier la date de fin"
            >
                {endDate || 'Présent'}
            </span>

            {/* Date Pickers */}
            <AnimatePresence>
                {isEditingStart && (
                    <InlineDatePicker
                        path={`experiences.${experienceIndex}.startDate`}
                        label="Date de début"
                        value={startDate}
                        showPresent={false}
                        onClose={() => setIsEditingStart(false)}
                        onSave={handleStartDateChange}
                        anchorPosition={clickPosition}
                    />
                )}

                {isEditingEnd && (
                    <InlineDatePicker
                        path={`experiences.${experienceIndex}.endDate`}
                        label="Date de fin"
                        value={endDate}
                        showPresent={true}
                        onClose={() => setIsEditingEnd(false)}
                        onSave={handleEndDateChange}
                        anchorPosition={clickPosition}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditableDateRange;

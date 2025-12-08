/**
 * EditableYear - Single year picker for education
 * 
 * Features:
 * - Click to open year selector popup
 * - Smart positioning near click point
 * - Compact dropdown with max-height scroll
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useFieldValue, useUpdateField, useMode } from '../../../application/store/v2';
import { createPortal } from 'react-dom';

interface EditableYearProps {
    educationIndex: number;
    className?: string;
}

// Generate years from current year to 50 years ago
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 51 }, (_, i) => currentYear - i);

const POPUP_WIDTH = 200;
const POPUP_HEIGHT = 200;

// Custom compact dropdown component
const CompactDropdown: React.FC<{
    value: number;
    options: { value: number; label: string }[];
    onChange: (value: number) => void;
    placeholder: string;
}> = ({ value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 text-white border border-white/10 hover:border-white/20 flex items-center justify-between transition-colors"
            >
                <span>{selectedOption?.label || placeholder}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 right-0 mt-1 max-h-32 overflow-y-auto rounded-lg border border-white/10 z-10 scrollbar-thin scrollbar-thumb-white/20"
                    style={{ background: 'rgba(30,30,40,0.98)' }}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${value === option.value
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const EditableYear: React.FC<EditableYearProps> = ({
    educationIndex,
    className = ''
}) => {
    const mode = useMode();
    const updateField = useUpdateField();

    // Get the year from store
    const year = useFieldValue<string>(`educations.${educationIndex}.year`) || '';

    const [isEditing, setIsEditing] = useState(false);
    const [selectedYear, setSelectedYear] = useState(parseInt(year) || currentYear);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // In modele mode, just show text
    if (mode === 'modele') {
        return (
            <span className={`text-sm text-gray-500 ${className}`}>
                {year}
            </span>
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        setClickPosition({ x: e.clientX, y: e.clientY });
        setSelectedYear(parseInt(year) || currentYear);
        setIsEditing(true);
    };

    const handleSave = () => {
        updateField(`educations.${educationIndex}.year`, String(selectedYear));
        setIsEditing(false);
    };

    // Calculate smart position based on anchor and screen bounds
    const position = useMemo(() => {
        const { x, y } = clickPosition;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let finalX = x;
        let finalY = y + 10;

        // Adjust if would overflow right edge
        if (x + POPUP_WIDTH > windowWidth - 20) {
            finalX = windowWidth - POPUP_WIDTH - 20;
        }

        // Adjust if would overflow left edge
        if (finalX < 20) {
            finalX = 20;
        }

        // Adjust if would overflow bottom edge
        if (y + POPUP_HEIGHT + 10 > windowHeight - 20) {
            finalY = Math.max(20, y - POPUP_HEIGHT - 10);
        }

        return {
            top: `${finalY}px`,
            left: `${finalX}px`,
        };
    }, [clickPosition]);

    const yearOptions = YEARS.map(y => ({ value: y, label: String(y) }));

    return (
        <>
            <span
                onClick={handleClick}
                className={`cursor-pointer hover:text-purple-600 hover:underline transition-colors ${className}`}
                title="Cliquer pour modifier l'année"
            >
                {year || 'Année'}
            </span>

            {isEditing && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-[999]"
                        onClick={() => setIsEditing(false)}
                    />

                    {/* Popup */}
                    <motion.div
                        ref={containerRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-[1000]"
                        style={{
                            ...position,
                            background: 'linear-gradient(145deg, rgba(30,30,40,0.98), rgba(20,20,30,0.98))',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            padding: '16px',
                            width: `${POPUP_WIDTH}px`
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                            <Calendar size={14} className="text-purple-400" />
                            <span className="text-sm font-medium text-white">Année</span>
                        </div>

                        {/* Year Selector - Compact Dropdown */}
                        <div className="mb-3">
                            <CompactDropdown
                                value={selectedYear}
                                options={yearOptions}
                                onChange={(v) => setSelectedYear(v)}
                                placeholder="Année"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-purple-500 hover:bg-purple-600 text-white transition-all flex items-center justify-center gap-1"
                            >
                                <Check size={12} />
                                OK
                            </button>
                        </div>
                    </motion.div>
                </>,
                document.body
            )}
        </>
    );
};

export default EditableYear;

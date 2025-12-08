/**
 * InlineDatePicker - Month/Year picker for experience dates
 * 
 * Features:
 * - Compact custom dropdowns with max-height scroll
 * - "Present" toggle for ongoing positions
 * - Smart positioning near click point
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useUpdateField } from '../../../application/store/v2';
import { createPortal } from 'react-dom';

interface InlineDatePickerProps {
    path: string;
    label: string;
    value: string;
    showPresent?: boolean;
    onClose?: () => void;
    onSave?: (formattedDate: string) => void;
    anchorPosition?: { x: number; y: number };
}

const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTHS_SHORT_FR = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
];

// Generate years from current year to 50 years ago
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 51 }, (_, i) => currentYear - i);

const POPUP_WIDTH = 300;
const POPUP_HEIGHT = 280;

// Custom dropdown component
const CompactDropdown: React.FC<{
    value: number | string;
    options: { value: number | string; label: string }[];
    onChange: (value: number | string) => void;
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

export const InlineDatePicker: React.FC<InlineDatePickerProps> = ({
    path,
    label,
    value,
    showPresent = false,
    onClose,
    onSave,
    anchorPosition
}) => {
    const updateField = useUpdateField();
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate smart position based on anchor and screen bounds
    const position = useMemo(() => {
        if (!anchorPosition) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const { x, y } = anchorPosition;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let finalX = x;
        let finalY = y + 10;

        if (x + POPUP_WIDTH > windowWidth - 20) {
            finalX = windowWidth - POPUP_WIDTH - 20;
        }
        if (finalX < 20) {
            finalX = 20;
        }
        if (y + POPUP_HEIGHT + 10 > windowHeight - 20) {
            finalY = Math.max(20, y - POPUP_HEIGHT - 10);
        }

        return {
            top: `${finalY}px`,
            left: `${finalX}px`,
            transform: 'none'
        };
    }, [anchorPosition]);

    // Parse existing value
    const parseDate = (dateStr: string): { month: number; year: number; isPresent: boolean } => {
        if (!dateStr || dateStr === 'Présent' || dateStr === 'Present' || dateStr === 'Aujourd\'hui') {
            return { month: new Date().getMonth(), year: currentYear, isPresent: true };
        }

        const parts = dateStr.split(' ');
        if (parts.length === 2) {
            const monthStr = parts[0];
            const yearNum = parseInt(parts[1]);

            let monthIdx = MONTHS_FR.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase()));
            if (monthIdx === -1) {
                monthIdx = MONTHS_SHORT_FR.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase()));
            }

            if (monthIdx !== -1 && !isNaN(yearNum)) {
                return { month: monthIdx, year: yearNum, isPresent: false };
            }
        }

        return { month: new Date().getMonth(), year: currentYear, isPresent: false };
    };

    const parsed = parseDate(value);
    const [month, setMonth] = useState(parsed.month);
    const [year, setYear] = useState(parsed.year);
    const [isPresent, setIsPresent] = useState(parsed.isPresent);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSave = () => {
        const formattedDate = isPresent
            ? 'Présent'
            : `${MONTHS_SHORT_FR[month]} ${year}`;

        if (onSave) {
            onSave(formattedDate);
        } else {
            updateField(path, formattedDate);
        }
        onClose?.();
    };

    const monthOptions = MONTHS_FR.map((m, i) => ({ value: i, label: m }));
    const yearOptions = YEARS.map(y => ({ value: y, label: String(y) }));

    const content = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-[999]"
                onClick={onClose}
            />

            {/* Modal */}
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
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <Calendar size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-white">{label}</span>
                </div>

                {/* Present Toggle */}
                {showPresent && (
                    <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                        <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isPresent
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-white/30 group-hover:border-purple-400'
                                }`}
                            onClick={() => setIsPresent(!isPresent)}
                        >
                            {isPresent && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm text-slate-300">Poste actuel (Présent)</span>
                    </label>
                )}

                {/* Month/Year Selectors - Compact custom dropdowns */}
                {!isPresent && (
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="text-xs text-slate-400 mb-1 block">Mois</label>
                            <CompactDropdown
                                value={month}
                                options={monthOptions}
                                onChange={(v) => setMonth(v as number)}
                                placeholder="Mois"
                            />
                        </div>

                        <div className="w-24">
                            <label className="text-xs text-slate-400 mb-1 block">Année</label>
                            <CompactDropdown
                                value={year}
                                options={yearOptions}
                                onChange={(v) => setYear(v as number)}
                                placeholder="Année"
                            />
                        </div>
                    </div>
                )}

                {/* Preview */}
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-slate-400">Aperçu: </span>
                    <span className="text-sm text-white font-medium">
                        {isPresent ? 'Présent' : `${MONTHS_SHORT_FR[month]} ${year}`}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={14} />
                        Appliquer
                    </button>
                </div>
            </motion.div>
        </>
    );

    return createPortal(content, document.body);
};

export default InlineDatePicker;

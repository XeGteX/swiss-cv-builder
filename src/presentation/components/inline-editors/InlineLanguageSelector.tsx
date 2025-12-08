/**
 * InlineLanguageSelector - Smart Language Selection with Adaptive Levels
 * 
 * Features:
 * - Autocomplete language search with flags
 * - Level options adapt based on selected language (JLPT for Japanese, HSK for Chinese, etc.)
 * - Reuses LANGUAGES_DB from LanguageEditor
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, Search, ChevronDown } from 'lucide-react';
import { useUpdateField } from '../../../application/store/v2';

// Language database with specific level systems
const LANGUAGES_DB: Record<string, { name: string; flag: string; levels: { value: string; label: string }[] }> = {
    'français': {
        name: 'Français',
        flag: '🇫🇷',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - Maîtrise / DALF C2' },
            { value: 'c1', label: 'C1 - Autonome / DALF C1' },
            { value: 'b2', label: 'B2 - Avancé / DELF B2' },
            { value: 'b1', label: 'B1 - Intermédiaire / DELF B1' },
            { value: 'a2', label: 'A2 - Élémentaire / DELF A2' },
            { value: 'a1', label: 'A1 - Découverte / DELF A1' },
        ]
    },
    'anglais': {
        name: 'Anglais',
        flag: '🇬🇧',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - Maîtrise / Cambridge CPE' },
            { value: 'c1', label: 'C1 - Autonome / TOEFL 110+' },
            { value: 'b2', label: 'B2 - Avancé / TOEIC 785+' },
            { value: 'b1', label: 'B1 - Intermédiaire / TOEIC 550+' },
            { value: 'a2', label: 'A2 - Élémentaire' },
            { value: 'a1', label: 'A1 - Découverte' },
        ]
    },
    'allemand': {
        name: 'Allemand',
        flag: '🇩🇪',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - Goethe C2' },
            { value: 'c1', label: 'C1 - Goethe C1' },
            { value: 'b2', label: 'B2 - Goethe B2' },
            { value: 'b1', label: 'B1 - Goethe B1' },
            { value: 'a2', label: 'A2 - Goethe A2' },
            { value: 'a1', label: 'A1 - Start Deutsch' },
        ]
    },
    'espagnol': {
        name: 'Espagnol',
        flag: '🇪🇸',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - DELE C2' },
            { value: 'c1', label: 'C1 - DELE C1' },
            { value: 'b2', label: 'B2 - DELE B2' },
            { value: 'b1', label: 'B1 - DELE B1' },
            { value: 'a2', label: 'A2 - DELE A2' },
            { value: 'a1', label: 'A1 - DELE A1' },
        ]
    },
    'italien': {
        name: 'Italien',
        flag: '🇮🇹',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - CILS C2' },
            { value: 'c1', label: 'C1 - CILS C1' },
            { value: 'b2', label: 'B2 - CILS B2' },
            { value: 'b1', label: 'B1 - CILS B1' },
            { value: 'a2', label: 'A2 - CILS A2' },
            { value: 'a1', label: 'A1 - CILS A1' },
        ]
    },
    'japonais': {
        name: 'Japonais',
        flag: '🇯🇵',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'n1', label: 'JLPT N1 - Avancé' },
            { value: 'n2', label: 'JLPT N2' },
            { value: 'n3', label: 'JLPT N3' },
            { value: 'n4', label: 'JLPT N4' },
            { value: 'n5', label: 'JLPT N5 - Débutant' },
        ]
    },
    'chinois': {
        name: 'Chinois (Mandarin)',
        flag: '🇨🇳',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'hsk6', label: 'HSK 6 - Maîtrise' },
            { value: 'hsk5', label: 'HSK 5 - Avancé' },
            { value: 'hsk4', label: 'HSK 4 - Intermédiaire+' },
            { value: 'hsk3', label: 'HSK 3 - Intermédiaire' },
            { value: 'hsk2', label: 'HSK 2 - Élémentaire' },
            { value: 'hsk1', label: 'HSK 1 - Débutant' },
        ]
    },
    'coréen': {
        name: 'Coréen',
        flag: '🇰🇷',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'topik6', label: 'TOPIK 6 - Avancé' },
            { value: 'topik5', label: 'TOPIK 5' },
            { value: 'topik4', label: 'TOPIK 4' },
            { value: 'topik3', label: 'TOPIK 3' },
            { value: 'topik2', label: 'TOPIK 2' },
            { value: 'topik1', label: 'TOPIK 1 - Débutant' },
        ]
    },
    'portugais': {
        name: 'Portugais',
        flag: '🇵🇹',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - Maîtrise' },
            { value: 'c1', label: 'C1 - Autonome' },
            { value: 'b2', label: 'B2 - Avancé' },
            { value: 'b1', label: 'B1 - Intermédiaire' },
            { value: 'a2', label: 'A2 - Élémentaire' },
            { value: 'a1', label: 'A1 - Découverte' },
        ]
    },
    'arabe': {
        name: 'Arabe',
        flag: '🇸🇦',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - Maîtrise' },
            { value: 'c1', label: 'C1 - Autonome' },
            { value: 'b2', label: 'B2 - Avancé' },
            { value: 'b1', label: 'B1 - Intermédiaire' },
            { value: 'a2', label: 'A2 - Élémentaire' },
            { value: 'a1', label: 'A1 - Découverte' },
        ]
    },
    'russe': {
        name: 'Russe',
        flag: '🇷🇺',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - TRKI-4' },
            { value: 'c1', label: 'C1 - TRKI-3' },
            { value: 'b2', label: 'B2 - TRKI-2' },
            { value: 'b1', label: 'B1 - TRKI-1' },
            { value: 'a2', label: 'A2 - TBU' },
            { value: 'a1', label: 'A1 - TEU' },
        ]
    },
    'néerlandais': {
        name: 'Néerlandais',
        flag: '🇳🇱',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - CNaVT' },
            { value: 'c1', label: 'C1 - CNaVT' },
            { value: 'b2', label: 'B2 - CNaVT' },
            { value: 'b1', label: 'B1 - CNaVT' },
            { value: 'a2', label: 'A2 - CNaVT' },
            { value: 'a1', label: 'A1 - Débutant' },
        ]
    },
};

const DEFAULT_LEVELS = [
    { value: 'native', label: 'Langue maternelle' },
    { value: 'c2', label: 'C2 - Maîtrise' },
    { value: 'c1', label: 'C1 - Autonome' },
    { value: 'b2', label: 'B2 - Avancé' },
    { value: 'b1', label: 'B1 - Intermédiaire' },
    { value: 'a2', label: 'A2 - Élémentaire' },
    { value: 'a1', label: 'A1 - Découverte' },
];

const ALL_LANGUAGES = Object.entries(LANGUAGES_DB).map(([key, data]) => ({
    key,
    name: data.name,
    flag: data.flag
}));

interface InlineLanguageSelectorProps {
    namePath: string;
    levelPath: string;
    currentName: string;
    currentLevel: string;
    onClose?: () => void;
}

export const InlineLanguageSelector: React.FC<InlineLanguageSelectorProps> = ({
    namePath,
    levelPath,
    currentName,
    currentLevel,
    onClose
}) => {
    const updateField = useUpdateField();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [searchValue, setSearchValue] = useState(currentName);
    const [selectedLanguageKey, setSelectedLanguageKey] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState(currentLevel);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);

    // Find current language key from name
    useEffect(() => {
        const found = Object.entries(LANGUAGES_DB).find(
            ([_, data]) => data.name.toLowerCase() === currentName.toLowerCase()
        );
        if (found) {
            setSelectedLanguageKey(found[0]);
        }
    }, [currentName]);

    // Get levels for selected language
    const currentLevels = useMemo(() => {
        if (selectedLanguageKey && LANGUAGES_DB[selectedLanguageKey]) {
            return LANGUAGES_DB[selectedLanguageKey].levels;
        }
        return DEFAULT_LEVELS;
    }, [selectedLanguageKey]);

    // Filter suggestions based on search
    const suggestions = useMemo(() => {
        if (!searchValue.trim()) return ALL_LANGUAGES;
        const search = searchValue.toLowerCase();
        return ALL_LANGUAGES.filter(lang =>
            lang.name.toLowerCase().includes(search) ||
            lang.key.toLowerCase().includes(search)
        );
    }, [searchValue]);

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

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSelectLanguage = (lang: typeof ALL_LANGUAGES[0]) => {
        setSearchValue(lang.name);
        setSelectedLanguageKey(lang.key);
        setShowSuggestions(false);
        // Reset level to first option for this language
        const levels = LANGUAGES_DB[lang.key]?.levels || DEFAULT_LEVELS;
        setSelectedLevel(levels[0].label);
    };

    const handleSelectLevel = (level: { value: string; label: string }) => {
        setSelectedLevel(level.label);
        setShowLevelDropdown(false);
    };

    const handleSave = () => {
        const languageName = selectedLanguageKey
            ? LANGUAGES_DB[selectedLanguageKey].name
            : searchValue.trim();

        if (languageName) {
            updateField(namePath, languageName);
            updateField(levelPath, selectedLevel);
        }
        onClose?.();
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 mt-1"
            style={{
                background: 'linear-gradient(145deg, rgba(30,30,40,0.98), rgba(20,20,30,0.98))',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                padding: '16px',
                minWidth: '320px'
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <Globe size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">Modifier la langue</span>
            </div>

            {/* Language Search */}
            <div className="mb-4 relative">
                <label className="text-xs text-slate-400 mb-1 block">Langue</label>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            setShowSuggestions(true);
                            setSelectedLanguageKey(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Rechercher une langue..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-white/5 text-white border border-white/10 focus:border-purple-500 outline-none"
                    />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        className="absolute w-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 z-10"
                        style={{ background: 'rgba(30,30,40,0.98)' }}
                    >
                        {suggestions.map((lang) => (
                            <button
                                key={lang.key}
                                onClick={() => handleSelectLanguage(lang)}
                                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm text-white">{lang.name}</span>
                                {selectedLanguageKey === lang.key && (
                                    <Check size={14} className="ml-auto text-purple-400" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Level Selector */}
            <div className="mb-4 relative">
                <label className="text-xs text-slate-400 mb-1 block">Niveau</label>
                <button
                    onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 text-white border border-white/10 hover:border-white/20 flex items-center justify-between transition-colors"
                >
                    <span>{selectedLevel || 'Sélectionner un niveau'}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Level Dropdown */}
                {showLevelDropdown && (
                    <div
                        className="absolute w-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 z-10"
                        style={{ background: 'rgba(30,30,40,0.98)' }}
                    >
                        {currentLevels.map((level) => (
                            <button
                                key={level.value}
                                onClick={() => handleSelectLevel(level)}
                                className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-colors text-left"
                            >
                                <span className="text-sm text-white">{level.label}</span>
                                {selectedLevel === level.label && (
                                    <Check size={14} className="text-purple-400" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
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
    );
};

export default InlineLanguageSelector;

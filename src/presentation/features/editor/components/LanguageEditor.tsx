/**
 * LanguageEditor - Smart Language Input with Autocomplete & Adaptive Levels
 * 
 * Features:
 * - Autocomplete suggestions as you type
 * - Level options adapt based on selected language
 * - Common languages with specific certifications (TOEFL, DELF, JLPT, etc.)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Button } from '../../../design-system/atoms/Button';
import { Plus, X, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            { value: 'c1', label: 'C1 - Autonome / TOEFL 110+ / IELTS 7.5+' },
            { value: 'b2', label: 'B2 - Avancé / TOEIC 785+ / FCE' },
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
            { value: 'c2', label: 'C2 - Goethe-Zertifikat C2' },
            { value: 'c1', label: 'C1 - Goethe-Zertifikat C1' },
            { value: 'b2', label: 'B2 - Goethe-Zertifikat B2' },
            { value: 'b1', label: 'B1 - Goethe-Zertifikat B1' },
            { value: 'a2', label: 'A2 - Goethe-Zertifikat A2' },
            { value: 'a1', label: 'A1 - Start Deutsch 1' },
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
    'portugais': {
        name: 'Portugais',
        flag: '🇵🇹',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'c2', label: 'C2 - CAPLE DUPLE' },
            { value: 'c1', label: 'C1 - CAPLE DAPLE' },
            { value: 'b2', label: 'B2 - CAPLE DIPLE' },
            { value: 'b1', label: 'B1 - CAPLE CIPLE' },
            { value: 'a2', label: 'A2 - CAPLE ACESSO' },
            { value: 'a1', label: 'A1 - Débutant' },
        ]
    },
    'japonais': {
        name: 'Japonais',
        flag: '🇯🇵',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'n1', label: 'N1 - JLPT N1 (Avancé)' },
            { value: 'n2', label: 'N2 - JLPT N2' },
            { value: 'n3', label: 'N3 - JLPT N3' },
            { value: 'n4', label: 'N4 - JLPT N4' },
            { value: 'n5', label: 'N5 - JLPT N5 (Débutant)' },
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
            { value: 'c2', label: 'C2 - CNaVT Educatief Professioneel' },
            { value: 'c1', label: 'C1 - CNaVT STRT' },
            { value: 'b2', label: 'B2 - CNaVT PTHO' },
            { value: 'b1', label: 'B1 - CNaVT PMT' },
            { value: 'a2', label: 'A2 - CNaVT PTIT' },
            { value: 'a1', label: 'A1 - Débutant' },
        ]
    },
    'coréen': {
        name: 'Coréen',
        flag: '🇰🇷',
        levels: [
            { value: 'native', label: 'Langue maternelle' },
            { value: 'topik6', label: 'TOPIK II Niveau 6' },
            { value: 'topik5', label: 'TOPIK II Niveau 5' },
            { value: 'topik4', label: 'TOPIK II Niveau 4' },
            { value: 'topik3', label: 'TOPIK II Niveau 3' },
            { value: 'topik2', label: 'TOPIK I Niveau 2' },
            { value: 'topik1', label: 'TOPIK I Niveau 1' },
        ]
    },
};

// Default levels for languages not in the database
const DEFAULT_LEVELS = [
    { value: 'native', label: 'Langue maternelle' },
    { value: 'c2', label: 'C2 - Maîtrise' },
    { value: 'c1', label: 'C1 - Autonome' },
    { value: 'b2', label: 'B2 - Avancé' },
    { value: 'b1', label: 'B1 - Intermédiaire' },
    { value: 'a2', label: 'A2 - Élémentaire' },
    { value: 'a1', label: 'A1 - Découverte' },
];

// All language names for autocomplete
const ALL_LANGUAGES = Object.entries(LANGUAGES_DB).map(([key, data]) => ({
    key,
    name: data.name,
    flag: data.flag
}));

export const LanguageEditor: React.FC = () => {
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);
    const addLanguage = useCVStoreV2((state) => state.addLanguage);

    const [inputValue, setInputValue] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [newLevel, setNewLevel] = useState('b2');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Get suggestions based on input
    const suggestions = inputValue.length > 0
        ? ALL_LANGUAGES.filter(lang =>
            lang.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            lang.key.toLowerCase().includes(inputValue.toLowerCase())
        )
        : ALL_LANGUAGES;

    // Get levels for selected language
    const getLevelsForLanguage = (langKey: string | null) => {
        if (!langKey) return DEFAULT_LEVELS;
        const langData = LANGUAGES_DB[langKey.toLowerCase()];
        return langData ? langData.levels : DEFAULT_LEVELS;
    };

    const currentLevels = getLevelsForLanguage(selectedLanguage);

    // Handle suggestion click
    const handleSelectSuggestion = (lang: typeof ALL_LANGUAGES[0]) => {
        setInputValue(lang.name);
        setSelectedLanguage(lang.key);
        setShowSuggestions(false);
        setNewLevel('b2'); // Reset level when changing language
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestions[highlightedIndex]) {
                    handleSelectSuggestion(suggestions[highlightedIndex]);
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        } else if (e.key === 'Enter' && selectedLanguage) {
            e.preventDefault();
            handleAdd();
        }
    };

    // Handle adding language
    const handleAdd = () => {
        const languageName = selectedLanguage
            ? LANGUAGES_DB[selectedLanguage]?.name || inputValue.trim()
            : inputValue.trim();

        if (!languageName) return;

        const levelLabel = currentLevels.find(l => l.value === newLevel)?.label || newLevel;
        addLanguage({ name: languageName, level: levelLabel });

        setInputValue('');
        setSelectedLanguage(null);
        setNewLevel('b2');
    };

    const handleRemove = (index: number) => {
        const updatedLanguages = profile.languages.filter((_, i) => i !== index);
        updateField('languages', updatedLanguages);
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!profile || !profile.languages) {
        return <div className="p-4 text-slate-400">Chargement...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Add Language Form */}
            <div className="flex flex-col gap-3">
                {/* Language input with autocomplete */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setSelectedLanguage(null);
                            setShowSuggestions(true);
                            setHighlightedIndex(0);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tapez pour rechercher une langue..."
                        className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-900/50 text-slate-200 border border-white/10 focus:border-purple-500 outline-none"
                    />

                    {/* Selected language indicator */}
                    {selectedLanguage && LANGUAGES_DB[selectedLanguage] && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                            {LANGUAGES_DB[selectedLanguage].flag}
                        </span>
                    )}

                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                ref={suggestionsRef}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto"
                            >
                                {suggestions.slice(0, 8).map((lang, idx) => (
                                    <button
                                        key={lang.key}
                                        onClick={() => handleSelectSuggestion(lang)}
                                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${idx === highlightedIndex
                                                ? 'bg-purple-600 text-white'
                                                : 'text-slate-200 hover:bg-slate-700'
                                            }`}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="font-medium">{lang.name}</span>
                                        {selectedLanguage === lang.key && (
                                            <Check size={16} className="ml-auto text-green-400" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Level + Add button row */}
                <div className="flex gap-2">
                    <select
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-lg text-sm bg-slate-900/50 text-slate-200 border border-white/10 focus:border-purple-500 outline-none min-w-0"
                    >
                        {currentLevels.map((level) => (
                            <option key={level.value} value={level.value} className="bg-slate-900">
                                {level.label}
                            </option>
                        ))}
                    </select>
                    <Button
                        onClick={handleAdd}
                        leftIcon={<Plus size={16} />}
                        className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 whitespace-nowrap"
                    >
                        Ajouter
                    </Button>
                </div>
            </div>

            {/* Languages List */}
            <div className="space-y-2">
                {profile.languages.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        <Globe size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Aucune langue ajoutée</p>
                        <p className="text-xs mt-1">Commencez à taper pour voir les suggestions</p>
                    </div>
                ) : (
                    profile.languages.map((lang, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3 group hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Globe size={16} className="text-slate-400" />
                                <div>
                                    <span className="text-slate-200 font-medium">{lang.name}</span>
                                    <span className="text-slate-400 text-sm ml-2">— {lang.level}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(index)}
                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Supprimer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

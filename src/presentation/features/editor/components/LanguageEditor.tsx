/**
 * LanguageEditor - CRUD Component for CV Languages
 * 
 * Allows adding, editing, and removing languages with proficiency levels.
 */

import React, { useState } from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { Plus, X, Globe } from 'lucide-react';

const PROFICIENCY_LEVELS = [
    { value: 'native', label: 'Langue maternelle' },
    { value: 'fluent', label: 'Courant (C1-C2)' },
    { value: 'advanced', label: 'Avancé (B2)' },
    { value: 'intermediate', label: 'Intermédiaire (B1)' },
    { value: 'basic', label: 'Notions (A1-A2)' },
];

export const LanguageEditor: React.FC = () => {
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);
    const addLanguage = useCVStoreV2((state) => state.addLanguage);
    const removeLanguage = useCVStoreV2((state) => state.removeLanguage);

    const [newLanguage, setNewLanguage] = useState('');
    const [newLevel, setNewLevel] = useState('fluent');

    if (!profile || !profile.languages) {
        return <div className="p-4 text-slate-400">Chargement...</div>;
    }

    const handleAdd = () => {
        if (!newLanguage.trim()) return;
        addLanguage({ name: newLanguage.trim(), level: getLevelLabel(newLevel) });
        setNewLanguage('');
        setNewLevel('fluent');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const getLevelLabel = (value: string): string => {
        const level = PROFICIENCY_LEVELS.find(l => l.value === value);
        return level ? level.label : value;
    };

    const handleRemove = (index: number) => {
        // Use updateField to remove by filtering the array
        const updatedLanguages = profile.languages.filter((_, i) => i !== index);
        updateField('languages', updatedLanguages);
    };

    return (
        <div className="space-y-4">
            {/* Add Language Form */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: Français, Anglais, Allemand..."
                        variant="glass"
                    />
                </div>
                <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="glass-input px-3 py-2 rounded-lg text-sm bg-slate-900/50 text-slate-200 border border-white/10 focus:border-brand-500 outline-none"
                >
                    {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value} className="bg-slate-900">
                            {level.label}
                        </option>
                    ))}
                </select>
                <Button
                    onClick={handleAdd}
                    leftIcon={<Plus size={16} />}
                    className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
                >
                    Ajouter
                </Button>
            </div>

            {/* Languages List */}
            <div className="space-y-2">
                {profile.languages.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        <Globe size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Aucune langue ajoutée</p>
                        <p className="text-xs mt-1">Ajoutez vos compétences linguistiques ci-dessus</p>
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

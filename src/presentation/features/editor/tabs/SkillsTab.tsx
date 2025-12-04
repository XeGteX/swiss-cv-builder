
import React, { useState } from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import { Plus, X } from 'lucide-react';
import { LanguageEditor } from '../components/LanguageEditor';

export const SkillsTab: React.FC = () => {
    const profile = useCVStoreV2((state) => state.profile);
    const updateField = useCVStoreV2((state) => state.updateField);

    if (!profile || !profile.skills) {
        return <div className="p-4 text-slate-400">Chargement...</div>;
    }
    const [newSkill, setNewSkill] = useState('');

    const addSkill = () => {
        if (!newSkill.trim()) return;
        updateField('skills', [...profile.skills, newSkill.trim()]);
        setNewSkill('');
    };

    const removeSkill = (index: number) => {
        const updatedSkills = profile.skills.filter((_, i) => i !== index);
        updateField('skills', updatedSkills);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    return (
        <div className="space-y-6">
            <Card variant="glass">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Compétences Techniques</h3>

                <div className="flex gap-2 mb-4">
                    <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: React, TypeScript, Gestion de projet..."
                        variant="glass"
                    />
                    <Button onClick={addSkill} leftIcon={<Plus size={16} />} className="bg-brand-600 hover:bg-brand-700 text-white">
                        Ajouter
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                        <div
                            key={index}
                            className="bg-white/10 border border-white/10 text-slate-200 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(index)}
                                className="text-slate-400 hover:text-red-400"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>

            <Card variant="glass">
                <h3 className="text-sm font-bold text-slate-200 mb-4">Langues</h3>
                <LanguageEditor />
            </Card>
        </div>
    );
};

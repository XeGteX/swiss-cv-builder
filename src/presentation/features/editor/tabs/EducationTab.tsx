
import React from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import { Plus, Trash2 } from 'lucide-react';

export const EducationTab: React.FC = () => {
    const profile = useCVStoreV2((state) => state.profile);
    const addEducation = useCVStoreV2((state) => state.addEducation);
    const removeEducation = useCVStoreV2((state) => state.removeEducation);
    const updateField = useCVStoreV2((state) => state.updateField);

    return (
        <div className="space-y-6">
            {profile.educations.map((edu, index) => (
                <Card key={edu.id} className="relative group">
                    <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>

                    <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                        Formation {index + 1}
                    </h4>

                    <div className="space-y-3">
                        <Input
                            label="Diplôme"
                            value={edu.degree}
                            onChange={(e) => updateField(`educations.${index}.degree`, e.target.value)}
                            className="font-semibold"
                            maxLength={100}
                            debounceTime={300}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="École / Université"
                                value={edu.school}
                                onChange={(e) => updateField(`educations.${index}.school`, e.target.value)}
                                maxLength={100}
                                debounceTime={300}
                            />
                            <Input
                                label="Année"
                                value={edu.year}
                                onChange={(e) => updateField(`educations.${index}.year`, e.target.value)}
                            />
                        </div>
                    </div>
                </Card>
            ))}

            <Button
                variant="outline"
                className="w-full border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                onClick={addEducation}
                leftIcon={<Plus size={16} />}
            >
                Ajouter une formation
            </Button>
        </div>
    );
};

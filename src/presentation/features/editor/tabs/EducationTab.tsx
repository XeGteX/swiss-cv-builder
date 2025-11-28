import React from 'react';
import { useCVStore } from '../../../../application/store/cv-store';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import { Plus, Trash2 } from 'lucide-react';

export const EducationTab: React.FC = () => {
    const { profile, addEducation, updateEducation, removeEducation } = useCVStore();

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
                            label="Diplôme / Certificat"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                            className="font-semibold"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="École / Institution"
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                            />
                            <Input
                                label="Année"
                                value={edu.year}
                                onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Description (Optionnel)"
                            value={edu.description || ''}
                            onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                        />
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

import React from 'react';
import { useCVStore } from '../../../../application/store/cv-store';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import { Plus, Trash2 } from 'lucide-react';

export const ExperienceTab: React.FC = () => {
    const { profile, addExperience, updateExperience, removeExperience } = useCVStore();

    const handleTaskChange = (expId: string, taskIndex: number, value: string) => {
        const exp = profile.experiences.find(e => e.id === expId);
        if (!exp) return;
        const newTasks = [...exp.tasks];
        newTasks[taskIndex] = value;
        updateExperience(expId, { tasks: newTasks });
    };

    const addTask = (expId: string) => {
        const exp = profile.experiences.find(e => e.id === expId);
        if (!exp) return;
        updateExperience(expId, { tasks: [...exp.tasks, ''] });
    };

    const removeTask = (expId: string, taskIndex: number) => {
        const exp = profile.experiences.find(e => e.id === expId);
        if (!exp) return;
        const newTasks = exp.tasks.filter((_, i) => i !== taskIndex);
        updateExperience(expId, { tasks: newTasks });
    };

    return (
        <div className="space-y-6">
            {profile.experiences.map((exp, index) => (
                <Card key={exp.id} className="relative group">
                    <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>

                    <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                        Expérience {index + 1}
                    </h4>

                    <div className="space-y-3">
                        <Input
                            label="Poste"
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                            className="font-semibold"
                            maxLength={100}
                            debounceTime={300}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Entreprise"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                maxLength={100}
                                debounceTime={300}
                            />
                            <Input
                                label="Dates"
                                value={exp.dates}
                                onChange={(e) => updateExperience(exp.id, { dates: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Lieu"
                            value={exp.location || ''}
                            onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                        />

                        <div className="pt-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-2">Tâches & Réalisations</label>
                            <div className="space-y-2">
                                {exp.tasks.map((task, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input
                                            value={task}
                                            onChange={(e) => handleTaskChange(exp.id, i, e.target.value)}
                                            className="flex-1"
                                            maxLength={300}
                                            debounceTime={300}
                                        />
                                        <button
                                            onClick={() => removeTask(exp.id, i)}
                                            className="text-slate-300 hover:text-red-500 px-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addTask(exp.id)}
                                    leftIcon={<Plus size={14} />}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                >
                                    Ajouter une tâche
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}

            <Button
                variant="outline"
                className="w-full border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                onClick={addExperience}
                leftIcon={<Plus size={16} />}
            >
                Ajouter une expérience
            </Button>
        </div>
    );
};

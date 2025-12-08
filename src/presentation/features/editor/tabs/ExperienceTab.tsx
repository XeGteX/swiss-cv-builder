
import React from 'react';
import { useCVStoreV2 } from '../../../../application/store/v2';
import { Input } from '../../../design-system/atoms/Input';
import { TextArea } from '../../../design-system/atoms/TextArea';
import { Button } from '../../../design-system/atoms/Button';
import { Card } from '../../../design-system/atoms/Card';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export const ExperienceTab: React.FC = () => {
    const { t } = useTranslation();
    const profile = useCVStoreV2((state) => state.profile);
    const addExperience = useCVStoreV2((state) => state.addExperience);
    const removeExperience = useCVStoreV2((state) => state.removeExperience);
    const updateField = useCVStoreV2((state) => state.updateField);

    if (!profile || !profile.experiences) {
        return <div className="p-4 text-slate-400">{t('common.loading')}</div>;
    }

    const handleTaskChange = (expIndex: number, taskIndex: number, value: string) => {
        updateField(`experiences.${expIndex}.tasks.${taskIndex}`, value);
    };

    const addTask = (expIndex: number) => {
        const exp = profile.experiences[expIndex];
        updateField(`experiences.${expIndex}.tasks`, [...exp.tasks, '']);
    };

    const removeTask = (expIndex: number, taskIndex: number) => {
        const exp = profile.experiences[expIndex];
        const newTasks = exp.tasks.filter((_, i) => i !== taskIndex);
        updateField(`experiences.${expIndex}.tasks`, newTasks);
    };

    return (
        <div className="space-y-6">
            {profile.experiences.map((exp, index) => (
                <Card key={exp.id} className="relative group" variant="glass">
                    <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>

                    <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        {t('sections.experience')} {index + 1}
                    </h4>

                    <div className="space-y-3">
                        <Input
                            label={t('experience.position')}
                            value={exp.role}
                            onChange={(e) => updateField(`experiences.${index}.role`, e.target.value)}
                            className="font-semibold"
                            maxLength={100}
                            debounceTime={300}
                            variant="glass"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label={t('experience.company')}
                                value={exp.company}
                                onChange={(e) => updateField(`experiences.${index}.company`, e.target.value)}
                                maxLength={100}
                                debounceTime={300}
                                variant="glass"
                            />
                            <Input
                                label={t('experience.startDate')}
                                value={exp.dates}
                                onChange={(e) => updateField(`experiences.${index}.dates`, e.target.value)}
                                variant="glass"
                            />
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-semibold text-slate-400 mb-2">{t('experience.achievements')}</label>
                            <div className="space-y-2">
                                {exp.tasks.map((task, i) => (
                                    <div key={i} className="flex gap-2">
                                        <TextArea
                                            value={task}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTaskChange(index, i, e.target.value)}
                                            className="flex-1 min-h-[60px]"
                                            maxLength={300}
                                            debounceTime={300}
                                            enableAI={true}
                                            label={`${t('experience.description')} ${i + 1}`}
                                            variant="glass"
                                        />
                                        <button
                                            onClick={() => removeTask(index, i)}
                                            className="text-slate-400 hover:text-red-400 px-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addTask(index)}
                                    leftIcon={<Plus size={14} />}
                                    className="text-brand-400 hover:text-brand-300 hover:bg-white/5"
                                >
                                    {t('common.add')}
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
                {t('experience.add')}
            </Button>
        </div>
    );
};

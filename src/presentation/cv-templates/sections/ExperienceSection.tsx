import React from 'react';
import { EditableField } from '@/presentation/components/atomic-editor';
import { EditableDateRange } from '@/presentation/components/inline-editors';
import type { ExperienceSectionProps } from './types';

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
    experiences,
    accentColor,
    headingFont
}) => {
    if (!experiences?.length) return null;

    return (
        <section id="section-experience" data-section-id="experience" className="cv-section experience mb-4">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor, fontFamily: headingFont }}
            >
                Expérience Professionnelle
            </h2>
            <div className="space-y-4">
                {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="experience-item break-inside-avoid">
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField path={`experiences.${idx}.role`} label="Poste" className="font-medium text-gray-900">
                                    {(value) => <h3>{value}</h3>}
                                </EditableField>
                                <EditableField path={`experiences.${idx}.company`} label="Entreprise" className="text-gray-600">
                                    {(value) => <p>{value}</p>}
                                </EditableField>
                            </div>
                            <EditableDateRange experienceIndex={idx} className="text-gray-500" />
                        </div>
                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {exp.tasks.map((_task, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={{ color: accentColor }}>•</span>
                                        <EditableField path={`experiences.${idx}.tasks.${i}`} label={`Tâche ${i + 1}`}>
                                            {(value) => <span>{value}</span>}
                                        </EditableField>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

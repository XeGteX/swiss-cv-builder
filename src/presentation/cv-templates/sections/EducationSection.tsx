import React from 'react';
import { EditableField } from '@/presentation/components/atomic-editor';
import { EditableYear } from '@/presentation/components/inline-editors';
import type { EducationSectionProps } from './types';

export const EducationSection: React.FC<EducationSectionProps> = ({
    educations,
    accentColor,
    headingFont
}) => {
    if (!educations?.length) return null;

    return (
        <section id="section-education" data-section-id="education" className="cv-section education mb-4">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor, fontFamily: headingFont }}
            >
                Formation
            </h2>
            <div className="space-y-3">
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="education-item break-inside-avoid">
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField path={`educations.${idx}.degree`} label="Diplôme" className="font-medium text-gray-900">
                                    {(value) => <h3>{value}</h3>}
                                </EditableField>
                                <EditableField path={`educations.${idx}.school`} label="École" className="text-gray-600">
                                    {(value) => <p>{value}</p>}
                                </EditableField>
                            </div>
                            <EditableYear educationIndex={idx} className="text-sm text-gray-500" />
                        </div>
                        <EditableField path={`educations.${idx}.description`} label="Description" multiline className="mt-1 text-sm text-gray-600">
                            {(value) => value ? <p>{value}</p> : null}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );
};

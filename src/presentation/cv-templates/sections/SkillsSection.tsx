import React from 'react';
import { EditableField } from '@/presentation/components/atomic-editor';
import type { SkillsSectionProps } from './types';

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, accentColor, headingFont, compact, textColor }) => {
    if (!skills?.length) return null;

    return (
        <section id="section-skills" data-section-id="skills" className="cv-section skills mb-4">
            <h2
                className={`font-semibold border-b-2 pb-1 mb-3 ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ borderColor: accentColor, color: textColor || accentColor, fontFamily: headingFont }}
            >
                Compétences
            </h2>
            <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : ''}`}>
                {skills.map((_skill, idx) => (
                    <EditableField key={`skill-${idx}`} path={`skills.${idx}`} label={`Compétence ${idx + 1}`}>
                        {(value) => (
                            <span
                                className={`px-3 py-1 text-white rounded-full ${compact ? 'text-xs px-2' : 'text-sm'}`}
                                style={{ backgroundColor: accentColor }}
                            >
                                {value}
                            </span>
                        )}
                    </EditableField>
                ))}
            </div>
        </section>
    );
};

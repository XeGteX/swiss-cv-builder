import React from 'react';
import { EditableField } from '@/presentation/components/atomic-editor';
import type { LanguagesSectionProps } from './types';

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
    languages,
    accentColor,
    headingFont,
    compact,
    textColor
}) => {
    if (!languages?.length) return null;

    return (
        <section id="section-languages" data-section-id="languages" className="cv-section languages mb-4">
            <h2
                className={`font-semibold border-b-2 pb-1 mb-3 ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ borderColor: accentColor, color: textColor || accentColor, fontFamily: headingFont }}
            >
                Langues
            </h2>
            <div className={`flex flex-wrap gap-3 ${compact ? 'flex-col gap-1' : ''}`}>
                {languages.map((_lang, idx) => (
                    <div key={idx} className={`flex items-center gap-2 ${compact ? 'gap-1' : ''}`}>
                        <EditableField path={`languages.${idx}.name`} label="Langue" className="font-medium text-gray-800">
                            {(value) => <span style={{ color: textColor }}>{value}</span>}
                        </EditableField>
                        <EditableField path={`languages.${idx}.level`} label="Niveau" className="text-sm text-gray-500">
                            {(value) => <span style={{ color: textColor ? `${textColor}99` : undefined }}>({value})</span>}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );
};

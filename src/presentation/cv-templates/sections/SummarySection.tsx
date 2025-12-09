import React from 'react';
import { EditableField } from '@/presentation/components/atomic-editor';
import type { SectionProps } from './types';

export const SummarySection: React.FC<SectionProps> = ({ accentColor, headingFont }) => (
    <section id="section-summary" data-section-id="summary" className="cv-section summary mb-4">
        <h2
            className="text-lg font-semibold border-b-2 pb-1 mb-3"
            style={{ borderColor: accentColor, color: accentColor, fontFamily: headingFont }}
        >
            Profil
        </h2>
        <EditableField path="summary" label="Résumé" multiline className="text-gray-700 leading-relaxed">
            {(value) => <p>{value || 'Cliquez pour ajouter un résumé...'}</p>}
        </EditableField>
    </section>
);

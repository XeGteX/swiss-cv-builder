import React from 'react';
import type { CVProfile } from '@/domain/cv/v2/types';
import { SmartSignature } from '@/presentation/cv-templates/smart';
import { SummarySection } from './SummarySection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { LanguagesSection } from './LanguagesSection';
import type { SectionProps } from './types';

interface SectionRendererProps extends SectionProps {
    sectionId: string;
    profile: CVProfile;
    showSignature?: boolean;
    compact?: boolean; // For sidebar mode
}

export const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
    const { sectionId, profile, showSignature, accentColor, headingFont, bodyFont, compact, textColor } = props;

    // Common props for sections
    const commonProps: SectionProps = {
        accentColor,
        headingFont,
        bodyFont,
        textColor
    };

    switch (sectionId) {
        case 'summary':
            return <SummarySection {...commonProps} />;
        case 'experience':
            return <ExperienceSection experiences={profile.experiences} {...commonProps} />;
        case 'education':
            return <EducationSection educations={profile.educations} {...commonProps} />;
        case 'skills':
            return <SkillsSection skills={profile.skills} {...commonProps} compact={compact} />;
        case 'languages':
            return <LanguagesSection languages={profile.languages} {...commonProps} compact={compact} />;
        case 'signature':
            return showSignature ? (
                <SmartSignature
                    name={`${profile.personal.firstName} ${profile.personal.lastName}`}
                    city={profile.personal.contact?.address}
                />
            ) : null;
        default:
            return null;
    }
};

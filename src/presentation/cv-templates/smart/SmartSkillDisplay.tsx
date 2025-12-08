/**
 * SmartSkillDisplay - Region-aware skill visualization
 * 
 * - USA/UK: Text tags only (ATS-friendly)
 * - DACH/EU: Visual gauges (acceptable)
 */

import React from 'react';
import { useShouldShowSkillGauges, useAtsOptimized } from '../../hooks/useRegion';

interface SkillLevel {
    name: string;
    level?: number;  // 0-100
}

interface SmartSkillDisplayProps {
    skills: (string | SkillLevel)[];
    variant?: 'compact' | 'detailed';
    className?: string;
    accentColor?: string;
}

export const SmartSkillDisplay: React.FC<SmartSkillDisplayProps> = ({
    skills,
    variant = 'compact',
    className = '',
    accentColor = '#3b82f6'
}) => {
    const showGauges = useShouldShowSkillGauges();
    const atsOptimized = useAtsOptimized();

    // Normalize skills to SkillLevel[]
    const normalizedSkills: SkillLevel[] = skills.map(skill =>
        typeof skill === 'string' ? { name: skill, level: 75 } : skill
    );

    // ATS-optimized regions: Always use text tags
    if (atsOptimized || !showGauges) {
        return (
            <div className={`smart-skills-tags flex flex-wrap gap-2 ${className}`}>
                {normalizedSkills.map((skill, idx) => (
                    <span
                        key={idx}
                        className="
              px-3 py-1 
              text-sm 
              bg-gray-100 
              text-gray-700 
              rounded-full
              border border-gray-200
            "
                    >
                        {skill.name}
                    </span>
                ))}
            </div>
        );
    }

    // Visual gauges for DACH/EU regions
    if (variant === 'detailed') {
        return (
            <div className={`smart-skills-gauges space-y-3 ${className}`}>
                {normalizedSkills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <span className="w-28 text-sm text-gray-700 truncate">
                            {skill.name}
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${skill.level || 75}%`,
                                    backgroundColor: accentColor
                                }}
                            />
                        </div>
                        <span className="w-10 text-xs text-gray-500 text-right">
                            {skill.level || 75}%
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    // Compact gauges (dots/circles)
    return (
        <div className={`smart-skills-compact space-y-2 ${className}`}>
            {normalizedSkills.map((skill, idx) => {
                const filledDots = Math.round((skill.level || 75) / 20); // 5 dots max
                return (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="w-24 text-sm text-gray-700 truncate">
                            {skill.name}
                        </span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(dot => (
                                <div
                                    key={dot}
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: dot <= filledDots ? accentColor : '#e5e7eb'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SmartSkillDisplay;

/**
 * NEXAL Platform - Element Renderers
 * 
 * Specialized renderers for each element variant.
 */

import React from 'react';
import { type ElementType } from './ElementVariants';

// ============================================================================
// RENDER PROPS
// ============================================================================

export interface SkillItem {
    name: string;
    level?: number; // 0-100
}

export interface LanguageItem {
    name: string;
    level: string;
    code?: string; // ISO code for flags
}

export interface CommonRenderProps {
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    scale: number;
}

// ============================================================================
// SKILLS RENDERERS
// ============================================================================

export function renderSkillsChips(
    skills: SkillItem[],
    props: CommonRenderProps & { chipStyle?: 'filled' | 'outlined' | 'subtle'; chipShape?: 'rounded' | 'square' | 'pill' }
): React.ReactNode {
    const { accentColor, fontSize, scale, chipStyle = 'filled', chipShape = 'rounded' } = props;

    const chipStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${2 * scale}px ${8 * scale}px`,
        margin: `${2 * scale}px`,
        fontSize: fontSize * scale,
        borderRadius: chipShape === 'pill' ? '100px' : chipShape === 'rounded' ? `${4 * scale}px` : 0,
        backgroundColor: chipStyle === 'filled' ? accentColor : chipStyle === 'subtle' ? `${accentColor}20` : 'transparent',
        color: chipStyle === 'filled' ? '#FFFFFF' : accentColor,
        border: chipStyle === 'outlined' ? `1px solid ${accentColor}` : 'none',
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: `${-2 * scale}px` }}>
            {skills.map((skill, i) => (
                <span key={i} style={chipStyles}>
                    {skill.name}
                </span>
            ))}
        </div>
    );
}

export function renderSkillsHorizontal(
    skills: SkillItem[],
    props: CommonRenderProps
): React.ReactNode {
    const { fontSize, scale, fontFamily } = props;

    return (
        <div style={{
            fontSize: fontSize * scale,
            fontFamily,
            lineHeight: 1.4,
        }}>
            {skills.map(s => s.name).join(' • ')}
        </div>
    );
}

export function renderSkillsProgress(
    skills: SkillItem[],
    props: CommonRenderProps & { showPercentage?: boolean }
): React.ReactNode {
    const { accentColor, fontSize, scale, showPercentage = false } = props;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * scale}px` }}>
            {skills.map((skill, i) => (
                <div key={i}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: fontSize * scale,
                        marginBottom: `${2 * scale}px`,
                    }}>
                        <span>{skill.name}</span>
                        {showPercentage && <span>{skill.level || 80}%</span>}
                    </div>
                    <div style={{
                        height: `${6 * scale}px`,
                        backgroundColor: '#E5E7EB',
                        borderRadius: `${3 * scale}px`,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${skill.level || 80}%`,
                            height: '100%',
                            backgroundColor: accentColor,
                            borderRadius: `${3 * scale}px`,
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// LANGUAGES RENDERERS
// ============================================================================

export function renderLanguagesDots(
    languages: LanguageItem[],
    props: CommonRenderProps & { maxDots?: number }
): React.ReactNode {
    const { accentColor, fontSize, scale, maxDots = 5 } = props;

    const levelToNumber = (level: string): number => {
        const map: Record<string, number> = {
            'Natif': 5, 'Native': 5, 'Courant': 4, 'Fluent': 4,
            'Avancé': 3, 'Advanced': 3, 'Intermédiaire': 2, 'Intermediate': 2,
            'Débutant': 1, 'Beginner': 1, 'A1': 1, 'A2': 2, 'B1': 2, 'B2': 3, 'C1': 4, 'C2': 5,
        };
        return map[level] || 3;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * scale}px` }}>
            {languages.map((lang, i) => {
                const filled = levelToNumber(lang.level);
                return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: fontSize * scale }}>{lang.name}</span>
                        <div style={{ display: 'flex', gap: `${3 * scale}px` }}>
                            {Array.from({ length: maxDots }).map((_, j) => (
                                <div
                                    key={j}
                                    style={{
                                        width: `${8 * scale}px`,
                                        height: `${8 * scale}px`,
                                        borderRadius: '50%',
                                        backgroundColor: j < filled ? accentColor : '#E5E7EB',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function renderLanguagesBars(
    languages: LanguageItem[],
    props: CommonRenderProps
): React.ReactNode {
    const { accentColor, fontSize, scale } = props;

    const levelToPercent = (level: string): number => {
        const map: Record<string, number> = {
            'Natif': 100, 'Native': 100, 'Courant': 85, 'Fluent': 85,
            'Avancé': 70, 'Advanced': 70, 'Intermédiaire': 50, 'Intermediate': 50,
            'Débutant': 25, 'Beginner': 25, 'A1': 20, 'A2': 35, 'B1': 50, 'B2': 65, 'C1': 80, 'C2': 95,
        };
        return map[level] || 50;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * scale}px` }}>
            {languages.map((lang, i) => (
                <div key={i}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: fontSize * scale,
                        marginBottom: `${3 * scale}px`,
                    }}>
                        <span>{lang.name}</span>
                        <span style={{ color: '#6B7280', fontSize: fontSize * 0.85 * scale }}>{lang.level}</span>
                    </div>
                    <div style={{
                        height: `${5 * scale}px`,
                        backgroundColor: '#E5E7EB',
                        borderRadius: `${2 * scale}px`,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${levelToPercent(lang.level)}%`,
                            height: '100%',
                            backgroundColor: accentColor,
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function renderLanguagesFlags(
    languages: LanguageItem[],
    props: CommonRenderProps
): React.ReactNode {
    const { fontSize, scale } = props;

    const getFlag = (code?: string): string => {
        const flags: Record<string, string> = {
            'fr': '🇫🇷', 'en': '🇬🇧', 'de': '🇩🇪', 'it': '🇮🇹', 'es': '🇪🇸',
            'pt': '🇵🇹', 'nl': '🇳🇱', 'ru': '🇷🇺', 'zh': '🇨🇳', 'ja': '🇯🇵',
            'ko': '🇰🇷', 'ar': '🇸🇦',
        };
        return flags[code || ''] || '🌐';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * scale}px` }}>
            {languages.map((lang, i) => (
                <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${8 * scale}px`,
                    fontSize: fontSize * scale,
                }}>
                    <span style={{ fontSize: fontSize * 1.2 * scale }}>{getFlag(lang.code)}</span>
                    <span>{lang.name}</span>
                    <span style={{ color: '#6B7280' }}>— {lang.level}</span>
                </div>
            ))}
        </div>
    );
}

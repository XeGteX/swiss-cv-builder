/**
 * Dynamic Template Renderer v2
 * 
 * Renders CV templates dynamically from TemplateConfig
 * Supports: Inline Editing (EditableField) + Structure Mode (SortableItem)
 * Each gene combination produces a UNIQUE visual design
 */

import React from 'react';
import type { TemplateConfig, ColorSchemeGene, TypographyGene, HeaderGene, SectionStyleGene } from './TemplateFactory';
import { useProfile, useMode, useReorderExperiences, useReorderEducations } from '../../../application/store/v2';
import { EditableField } from '../../components/atomic-editor/EditableField';
import { SortableItem } from '../../components/lego/SortableItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CVMode } from '../../../application/store/v2/cv-store-v2.types';

// ============================================================================
// COLOR SCHEMES (20 unique palettes)
// ============================================================================

const COLOR_PALETTES: Record<ColorSchemeGene, { primary: string; secondary: string; text: string; bg: string; accent: string }> = {
    'mono-black': { primary: '#000000', secondary: '#374151', text: '#1f2937', bg: '#ffffff', accent: '#111827' },
    'mono-gray': { primary: '#4b5563', secondary: '#6b7280', text: '#374151', bg: '#ffffff', accent: '#9ca3af' },
    'mono-navy': { primary: '#1e3a5f', secondary: '#2d4a6f', text: '#1e293b', bg: '#ffffff', accent: '#3b82f6' },
    'accent-blue': { primary: '#2563eb', secondary: '#3b82f6', text: '#1f2937', bg: '#ffffff', accent: '#1d4ed8' },
    'accent-teal': { primary: '#0d9488', secondary: '#14b8a6', text: '#1f2937', bg: '#ffffff', accent: '#0f766e' },
    'accent-green': { primary: '#16a34a', secondary: '#22c55e', text: '#1f2937', bg: '#ffffff', accent: '#15803d' },
    'accent-purple': { primary: '#7c3aed', secondary: '#8b5cf6', text: '#1f2937', bg: '#ffffff', accent: '#6d28d9' },
    'accent-red': { primary: '#dc2626', secondary: '#ef4444', text: '#1f2937', bg: '#ffffff', accent: '#b91c1c' },
    'accent-orange': { primary: '#ea580c', secondary: '#f97316', text: '#1f2937', bg: '#ffffff', accent: '#c2410c' },
    'accent-gold': { primary: '#b45309', secondary: '#d97706', text: '#1f2937', bg: '#ffffff', accent: '#92400e' },
    'gradient-blue-cyan': { primary: '#2563eb', secondary: '#06b6d4', text: '#1f2937', bg: '#ffffff', accent: '#0891b2' },
    'gradient-purple-pink': { primary: '#7c3aed', secondary: '#ec4899', text: '#1f2937', bg: '#ffffff', accent: '#a855f7' },
    'gradient-green-teal': { primary: '#16a34a', secondary: '#14b8a6', text: '#1f2937', bg: '#ffffff', accent: '#059669' },
    'gradient-orange-red': { primary: '#ea580c', secondary: '#dc2626', text: '#1f2937', bg: '#ffffff', accent: '#f97316' },
    'dark-mode': { primary: '#60a5fa', secondary: '#818cf8', text: '#f1f5f9', bg: '#0f172a', accent: '#38bdf8' },
    'warm-earth': { primary: '#92400e', secondary: '#b45309', text: '#422006', bg: '#fffbeb', accent: '#a16207' },
    'cool-ocean': { primary: '#0369a1', secondary: '#0284c7', text: '#0c4a6e', bg: '#f0f9ff', accent: '#0ea5e9' },
    'swiss-red': { primary: '#dc2626', secondary: '#ef4444', text: '#1f2937', bg: '#ffffff', accent: '#b91c1c' },
    'corporate-navy': { primary: '#1e3a8a', secondary: '#1d4ed8', text: '#1e293b', bg: '#ffffff', accent: '#3730a3' },
    'vibrant-creative': { primary: '#c026d3', secondary: '#e879f9', text: '#1f2937', bg: '#ffffff', accent: '#a21caf' }
};

// ============================================================================
// TYPOGRAPHY (10 unique font combos)
// ============================================================================

const FONT_STACKS: Record<TypographyGene, { heading: string; body: string; size: string }> = {
    'classic-times': { heading: "'Times New Roman', Georgia, serif", body: "'Times New Roman', serif", size: '12px' },
    'classic-georgia': { heading: "Georgia, 'Times New Roman', serif", body: "Georgia, serif", size: '12px' },
    'modern-inter': { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif", size: '13px' },
    'modern-roboto': { heading: "Roboto, system-ui, sans-serif", body: "Roboto, sans-serif", size: '13px' },
    'elegant-playfair': { heading: "'Playfair Display', Georgia, serif", body: "Inter, sans-serif", size: '12px' },
    'tech-jetbrains': { heading: "'JetBrains Mono', 'Fira Code', monospace", body: "'JetBrains Mono', monospace", size: '11px' },
    'bold-poppins': { heading: "Poppins, sans-serif", body: "Poppins, sans-serif", size: '13px' },
    'clean-opensans': { heading: "'Open Sans', sans-serif", body: "'Open Sans', sans-serif", size: '12px' },
    'swiss-helvetica': { heading: "'Helvetica Neue', Arial, sans-serif", body: "'Helvetica Neue', sans-serif", size: '12px' },
    'creative-montserrat': { heading: "Montserrat, sans-serif", body: "Inter, sans-serif", size: '12px' }
};

// ============================================================================
// STYLE TYPES
// ============================================================================

type ColorPalette = typeof COLOR_PALETTES['mono-black'];
type FontStack = typeof FONT_STACKS['modern-inter'];

// ============================================================================
// HEADER COMPONENTS (20 unique styles)
// ============================================================================

interface HeaderProps {
    headerType: HeaderGene;
    colors: ColorPalette;
    fonts: FontStack;
    mode: CVMode;
}

const DynamicHeader: React.FC<HeaderProps> = ({ headerType, colors, fonts, mode }) => {
    const isModele = mode === 'modele';

    // Separate name fields - avoid nesting EditableField
    const renderFirstName = (style?: React.CSSProperties) => (
        <EditableField path="personal.firstName" label="Prénom" disabled={isModele}>
            {(value) => <span style={{ ...style, display: 'inline' }}>{value}</span>}
        </EditableField>
    );

    const renderLastName = (style?: React.CSSProperties) => (
        <EditableField path="personal.lastName" label="Nom" disabled={isModele}>
            {(value) => <span style={{ ...style, display: 'inline' }}>{value}</span>}
        </EditableField>
    );

    // Combined name with separate editable fields
    const renderName = (style: React.CSSProperties) => (
        <div style={{ ...style, display: 'inline-flex', gap: '0.25em', flexWrap: 'wrap' }}>
            {renderFirstName()}
            {renderLastName()}
        </div>
    );

    const renderTitle = (style: React.CSSProperties) => (
        <EditableField path="personal.title" label="Titre professionnel" disabled={isModele}>
            {(value) => <span style={style}>{value}</span>}
        </EditableField>
    );

    const renderContact = (style: React.CSSProperties, separator: string = ' | ') => (
        <div style={style}>
            <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                {(value) => <span>{value}</span>}
            </EditableField>
            <span>{separator}</span>
            <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                {(value) => <span>{value}</span>}
            </EditableField>
            <span>{separator}</span>
            <EditableField path="personal.contact.address" label="Adresse" disabled={isModele}>
                {(value) => <span>{value}</span>}
            </EditableField>
        </div>
    );

    switch (headerType) {
        case 'minimal-left':
            return (
                <header style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 400, color: colors.primary, margin: '4px 0 10px 0' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary, display: 'flex', gap: '10px', flexWrap: 'wrap' }, ' • ')}
                </header>
            );

        case 'minimal-center':
            return (
                <header style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, color: colors.text, fontFamily: fonts.heading, margin: 0, letterSpacing: '1px' }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '13px', fontWeight: 500, color: colors.primary, margin: '8px 0 12px 0', textTransform: 'uppercase', letterSpacing: '3px' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary, display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' })}
                </header>
            );

        case 'minimal-right':
            return (
                <header style={{ marginBottom: '20px', textAlign: 'right' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 600, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 400, color: colors.primary, margin: '4px 0 10px 0' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary })}
                </header>
            );

        case 'bold-gradient':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '20mm 20mm 20px 20mm',
                    color: 'white'
                }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, fontFamily: fonts.heading }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '6px 0 12px 0', opacity: 0.9 }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', opacity: 0.85, display: 'flex', gap: '12px', flexWrap: 'wrap' }, ' • ')}
                </header>
            );

        case 'bold-solid':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: colors.primary,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '20mm 20mm 20px 20mm',
                    color: 'white'
                }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 800, margin: 0, fontFamily: fonts.heading, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 400, margin: '8px 0 12px 0', opacity: 0.9, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', opacity: 0.85 })}
                </header>
            );

        case 'classic-underline':
            return (
                <header style={{ marginBottom: '20px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '14px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 400, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '13px', fontWeight: 400, color: colors.primary, margin: '4px 0 10px 0', fontStyle: 'italic' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary })}
                </header>
            );

        case 'classic-border':
            return (
                <header style={{ marginBottom: '20px', border: `2px solid ${colors.primary}`, padding: '16px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: colors.primary, fontFamily: fonts.heading, margin: 0 }}>
                        {renderName({})}
                    </h1>
                    <div style={{ width: '40px', height: '2px', background: colors.primary, margin: '10px auto' }} />
                    <h2 style={{ fontSize: '13px', fontWeight: 400, color: colors.text, margin: '0 0 10px 0' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '10px', color: colors.secondary }, ' • ')}
                </header>
            );

        case 'code-terminal':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: '#1e1e1e',
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '15mm 20mm 16px 20mm',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    color: '#d4d4d4',
                    borderRadius: '0 0 4px 4px'
                }}>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#569cd6' }}>const</span>{' '}
                        <span style={{ color: '#4ec9b0' }}>developer</span>{' '}
                        <span style={{ color: '#d4d4d4' }}>=</span>{' '}
                        <span style={{ color: '#d4d4d4' }}>{'{'}</span>
                    </div>
                    <div style={{ paddingLeft: '20px', fontSize: '12px' }}>
                        <div>
                            <span style={{ color: '#9cdcfe' }}>name</span>:{' '}
                            <span style={{ color: '#ce9178' }}>"
                                <EditableField path="personal.firstName" label="Prénom" disabled={isModele}>
                                    {(first) => <span>{first}</span>}
                                </EditableField>
                                {' '}
                                <EditableField path="personal.lastName" label="Nom" disabled={isModele}>
                                    {(last) => <span>{last}</span>}
                                </EditableField>
                                "</span>,
                        </div>
                        <div>
                            <span style={{ color: '#9cdcfe' }}>role</span>:{' '}
                            <span style={{ color: '#ce9178' }}>"
                                <EditableField path="personal.title" label="Titre" disabled={isModele}>
                                    {(val) => <span>{val}</span>}
                                </EditableField>
                                "</span>,
                        </div>
                        <div>
                            <span style={{ color: '#9cdcfe' }}>email</span>:{' '}
                            <span style={{ color: '#ce9178' }}>"
                                <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                                    {(val) => <span>{val}</span>}
                                </EditableField>
                                "</span>
                        </div>
                    </div>
                    <div style={{ color: '#d4d4d4' }}>{'};'}</div>
                </header>
            );

        case 'executive-serif':
            return (
                <header style={{ marginBottom: '24px', textAlign: 'center', paddingBottom: '16px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 400, color: colors.primary, fontFamily: fonts.heading, margin: 0, letterSpacing: '3px', textTransform: 'uppercase' }}>
                        {renderName({})}
                    </h1>
                    <div style={{ width: '60px', height: '2px', background: colors.primary, margin: '12px auto' }} />
                    <h2 style={{ fontSize: '13px', fontWeight: 400, color: colors.text, margin: '0 0 14px 0', fontStyle: 'italic' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '10px', color: colors.secondary }, ' • ')}
                </header>
            );

        case 'banner-full':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '15mm 20mm 16px 20mm',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, fontFamily: fonts.heading }}>
                            {renderName({})}
                        </h1>
                        <h2 style={{ fontSize: '14px', fontWeight: 400, margin: '4px 0 0 0', opacity: 0.9 }}>
                            {renderTitle({})}
                        </h2>
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.85, textAlign: 'right' }}>
                        <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                        <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                    </div>
                </header>
            );

        case 'banner-accent':
            return (
                <header style={{ marginBottom: '20px' }}>
                    <div style={{ background: colors.primary, height: '8px', margin: '-15mm -20mm 16px -20mm' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 500, color: colors.primary, margin: '4px 0 12px 0' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary, display: 'flex', gap: '12px' }, ' • ')}
                </header>
            );

        case 'sidebar-left':
        case 'sidebar-right':
            return (
                <header style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', fontFamily: fonts.heading, margin: 0 }}>
                        <EditableField path="personal.firstName" label="Prénom" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                    </h1>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', fontFamily: fonts.heading, margin: '0 0 8px 0' }}>
                        <EditableField path="personal.lastName" label="Nom" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                    </h1>
                    <div style={{ width: '40px', height: '3px', background: colors.secondary, margin: '8px 0' }} />
                    <h2 style={{ fontSize: '11px', fontWeight: 500, color: colors.secondary, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {renderTitle({})}
                    </h2>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                        <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                        <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                        <EditableField path="personal.contact.address" label="Adresse" disabled={isModele}>
                            {(val) => <div>{val}</div>}
                        </EditableField>
                    </div>
                </header>
            );

        case 'split-twocolor':
            return (
                <header style={{ marginBottom: '24px', display: 'flex', margin: '-15mm -20mm 24px -20mm' }}>
                    <div style={{ flex: 1, background: colors.primary, padding: '20mm 20px 20px 20mm', color: 'white' }}>
                        <EditableField path="personal.firstName" label="Prénom" disabled={isModele}>
                            {(val) => <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, fontFamily: fonts.heading }}>{val}</h1>}
                        </EditableField>
                        <EditableField path="personal.lastName" label="Nom" disabled={isModele}>
                            {(val) => <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, fontFamily: fonts.heading }}>{val}</h1>}
                        </EditableField>
                    </div>
                    <div style={{ flex: 1, background: colors.secondary, padding: '20mm 20mm 20px 20px', color: 'white' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 8px 0' }}>
                            {renderTitle({})}
                        </h2>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>
                            <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                                {(val) => <div>{val}</div>}
                            </EditableField>
                            <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                                {(val) => <div>{val}</div>}
                            </EditableField>
                        </div>
                    </div>
                </header>
            );

        case 'creative-diagonal':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 60%, ${colors.secondary} 60%, ${colors.secondary} 100%)`,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '15mm 20mm 20px 20mm',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <h1 style={{ fontSize: '30px', fontWeight: 800, margin: 0, fontFamily: fonts.heading, position: 'relative', zIndex: 1 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 500, margin: '6px 0 12px 0', opacity: 0.9, position: 'relative', zIndex: 1 }}>
                        {renderTitle({})}
                    </h2>
                    <div style={{ fontSize: '10px', opacity: 0.85, position: 'relative', zIndex: 1 }}>
                        <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                            {(val) => <span>{val}</span>}
                        </EditableField>
                        {' | '}
                        <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                            {(val) => <span>{val}</span>}
                        </EditableField>
                    </div>
                </header>
            );

        case 'modern-geometric':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: colors.bg,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '15mm 20mm 20px 20mm',
                    position: 'relative',
                    borderBottom: `4px solid ${colors.primary}`
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: colors.primary, opacity: 0.1 }} />
                    <div style={{ position: 'absolute', top: '20px', right: '20px', width: '60px', height: '60px', background: colors.secondary, opacity: 0.1 }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.text, fontFamily: fonts.heading, margin: 0, position: 'relative', zIndex: 1 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 500, color: colors.primary, margin: '6px 0 12px 0', position: 'relative', zIndex: 1 }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary, position: 'relative', zIndex: 1 }, ' • ')}
                </header>
            );

        case 'elegant-line':
            return (
                <header style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ flex: 1, height: '1px', background: colors.primary }} />
                        <h1 style={{ fontSize: '24px', fontWeight: 400, color: colors.text, fontFamily: fonts.heading, margin: 0, whiteSpace: 'nowrap' }}>
                            {renderName({})}
                        </h1>
                        <div style={{ flex: 1, height: '1px', background: colors.primary }} />
                    </div>
                    <h2 style={{ fontSize: '12px', fontWeight: 500, color: colors.primary, margin: '0 0 12px 0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '10px', color: colors.secondary, textAlign: 'center' })}
                </header>
            );

        case 'swiss-clean':
            return (
                <header style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
                            {renderName({})}
                        </h1>
                        <div style={{ width: '40px', height: '3px', background: colors.primary, marginBottom: '6px' }} />
                    </div>
                    <h2 style={{ fontSize: '12px', fontWeight: 500, color: colors.primary, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary, display: 'flex', gap: '12px' })}
                </header>
            );

        case 'corporate-boxed':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: colors.primary,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '15mm 20mm 16px 20mm',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: fonts.heading }}>
                                {renderName({})}
                            </h1>
                            <h2 style={{ fontSize: '13px', fontWeight: 400, margin: '4px 0 0 0', opacity: 0.9 }}>
                                {renderTitle({})}
                            </h2>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '10px', opacity: 0.85 }}>
                            <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                                {(val) => <div>{val}</div>}
                            </EditableField>
                            <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                                {(val) => <div>{val}</div>}
                            </EditableField>
                            <EditableField path="personal.contact.address" label="Adresse" disabled={isModele}>
                                {(val) => <div>{val}</div>}
                            </EditableField>
                        </div>
                    </div>
                </header>
            );

        case 'startup-bold':
            return (
                <header style={{
                    marginBottom: '24px',
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                    margin: '-15mm -20mm 24px -20mm',
                    padding: '15mm 20mm 24px 20mm',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, margin: 0, fontFamily: fonts.heading, textTransform: 'uppercase', letterSpacing: '-1px' }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, margin: '8px 0 16px 0', opacity: 0.9, letterSpacing: '3px', textTransform: 'uppercase' }}>
                        {renderTitle({})}
                    </h2>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>
                        <EditableField path="personal.contact.email" label="Email" disabled={isModele}>
                            {(val) => <span>{val}</span>}
                        </EditableField>
                        {' • '}
                        <EditableField path="personal.contact.phone" label="Téléphone" disabled={isModele}>
                            {(val) => <span>{val}</span>}
                        </EditableField>
                    </div>
                </header>
            );

        default:
            return (
                <header style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
                        {renderName({})}
                    </h1>
                    <h2 style={{ fontSize: '14px', fontWeight: 500, color: colors.primary, margin: '4px 0 10px 0' }}>
                        {renderTitle({})}
                    </h2>
                    {renderContact({ fontSize: '11px', color: colors.secondary })}
                </header>
            );
    }
};

// ============================================================================
// SECTION HEADER STYLES (5 variants)
// ============================================================================

interface SectionHeaderProps {
    title: string;
    style: SectionStyleGene;
    colors: ColorPalette;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, style, colors }) => {
    switch (style) {
        case 'minimal-line':
            return (
                <h3 style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text,
                    borderBottom: `1px solid ${colors.secondary}`,
                    paddingBottom: '4px',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {title}
                </h3>
            );
        case 'bold-caps':
            return (
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: colors.primary,
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>
                    {title}
                </h3>
            );
        case 'icon-prefix':
            return (
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text,
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ width: '20px', height: '20px', background: colors.primary, borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                        ★
                    </span>
                    {title}
                </h3>
            );
        case 'boxed-header':
            return (
                <h3 style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'white',
                    background: colors.primary,
                    padding: '6px 12px',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {title}
                </h3>
            );
        case 'underline-accent':
        default:
            return (
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: colors.text,
                    borderBottom: `2px solid ${colors.primary}`,
                    paddingBottom: '6px',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {title}
                </h3>
            );
    }
};

// ============================================================================
// MAIN TEMPLATE COMPONENT
// ============================================================================

interface DynamicTemplateProps {
    config: TemplateConfig;
    language?: 'en' | 'fr';
    forceMode?: 'edition' | 'structure' | 'modele';
}

export const DynamicTemplate: React.FC<DynamicTemplateProps> = ({
    config,
    forceMode
}) => {
    const profile = useProfile();
    const storeMode = useMode();
    const mode = forceMode || storeMode;
    const reorderExperiences = useReorderExperiences();
    const reorderEducations = useReorderEducations();

    const colors = COLOR_PALETTES[config.genes.colorScheme];
    const fonts = FONT_STACKS[config.genes.typography];
    const isSidebar = config.genes.layout.includes('sidebar');
    const isDarkMode = config.genes.colorScheme === 'dark-mode';
    const isModele = mode === 'modele';

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Density settings
    const getDensityStyle = (): { gap: string; padding: string } => {
        switch (config.genes.density) {
            case 'spacious': return { gap: '24px', padding: '20mm' };
            case 'comfortable': return { gap: '16px', padding: '15mm' };
            case 'compact': return { gap: '12px', padding: '12mm' };
            case 'dense': return { gap: '8px', padding: '10mm' };
            default: return { gap: '16px', padding: '15mm' };
        }
    };

    const densityStyle = getDensityStyle();

    // Handle experience drag end
    const handleExperienceDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = profile.experiences.findIndex(e => e.id === active.id);
            const newIndex = profile.experiences.findIndex(e => e.id === over.id);
            reorderExperiences(oldIndex, newIndex);
        }
    };

    // Handle education drag end
    const handleEducationDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = profile.educations.findIndex(e => e.id === active.id);
            const newIndex = profile.educations.findIndex(e => e.id === over.id);
            reorderEducations(oldIndex, newIndex);
        }
    };

    // =========== SECTION RENDERERS ===========

    const renderExperiences = () => (
        <section>
            <SectionHeader title="Expérience" style={config.genes.sectionStyle} colors={colors} />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExperienceDragEnd}>
                <SortableContext items={profile.experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: densityStyle.gap }}>
                        {profile.experiences.map((exp, index) => (
                            <SortableItem key={exp.id} id={exp.id} mode={mode}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                                        <div>
                                            <EditableField path={`experiences.${index}.role`} label="Poste" disabled={isModele}>
                                                {(value) => <span style={{ fontWeight: 700, color: colors.text, fontSize: fonts.size }}>{value}</span>}
                                            </EditableField>
                                            <EditableField path={`experiences.${index}.company`} label="Entreprise" disabled={isModele}>
                                                {(value) => <span style={{ color: colors.primary, marginLeft: '8px', fontWeight: 500, fontSize: fonts.size }}>{value}</span>}
                                            </EditableField>
                                        </div>
                                        <EditableField path={`experiences.${index}.dates`} label="Période" disabled={isModele}>
                                            {(value) => <span style={{ color: colors.secondary, fontSize: '11px', fontStyle: 'italic' }}>{value}</span>}
                                        </EditableField>
                                    </div>
                                    {exp.tasks && exp.tasks.length > 0 && (
                                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: colors.text, fontSize: fonts.size, lineHeight: 1.5 }}>
                                            {exp.tasks.map((_, taskIndex) => (
                                                <li key={taskIndex} style={{ marginBottom: '3px' }}>
                                                    <EditableField
                                                        path={`experiences.${index}.tasks.${taskIndex}`}
                                                        label={`Tâche ${taskIndex + 1}`}
                                                        multiline
                                                        disabled={isModele}
                                                    >
                                                        {(value) => <span>{value}</span>}
                                                    </EditableField>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </section>
    );

    const renderEducation = () => (
        <section>
            <SectionHeader title="Formation" style={config.genes.sectionStyle} colors={colors} />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEducationDragEnd}>
                <SortableContext items={profile.educations.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {profile.educations.map((edu, index) => (
                            <SortableItem key={edu.id} id={edu.id} mode={mode}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div>
                                        <EditableField path={`educations.${index}.degree`} label="Diplôme" disabled={isModele}>
                                            {(value) => <span style={{ fontWeight: 700, color: colors.text, fontSize: fonts.size }}>{value}</span>}
                                        </EditableField>
                                        <EditableField path={`educations.${index}.school`} label="École" disabled={isModele}>
                                            {(value) => <span style={{ color: colors.primary, marginLeft: '8px', fontSize: fonts.size }}>{value}</span>}
                                        </EditableField>
                                    </div>
                                    <EditableField path={`educations.${index}.year`} label="Année" disabled={isModele}>
                                        {(value) => <span style={{ color: colors.secondary, fontSize: '11px' }}>{value}</span>}
                                    </EditableField>
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </section>
    );

    const renderSkills = () => {
        const variant = config.genes.sectionStyle === 'icon-prefix' || config.genes.sectionStyle === 'boxed-header' ? 'pills' : 'inline';

        return (
            <section>
                <SectionHeader title="Compétences" style={config.genes.sectionStyle} colors={colors} />
                {variant === 'pills' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {profile.skills.map((skill, i) => (
                            <span key={i} style={{
                                padding: '4px 10px',
                                background: `${colors.primary}15`,
                                color: colors.primary,
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 500
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p style={{ margin: 0, color: colors.text, fontSize: fonts.size, lineHeight: 1.6 }}>
                        {profile.skills.join(' • ')}
                    </p>
                )}
            </section>
        );
    };

    const renderLanguages = () => (
        <section>
            <SectionHeader title="Langues" style={config.genes.sectionStyle} colors={colors} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {profile.languages.map((_, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: fonts.size }}>
                        <EditableField path={`languages.${index}.name`} label="Langue" disabled={isModele}>
                            {(value) => <span style={{ fontWeight: 600, color: colors.text }}>{value}</span>}
                        </EditableField>
                        <EditableField path={`languages.${index}.level`} label="Niveau" disabled={isModele}>
                            {(value) => <span style={{ color: colors.secondary, fontStyle: 'italic' }}>{value}</span>}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );

    const renderSummary = () => profile.summary ? (
        <section>
            <SectionHeader title="Profil" style={config.genes.sectionStyle} colors={colors} />
            <EditableField path="summary" label="Résumé professionnel" multiline disabled={isModele}>
                {(value) => <p style={{ margin: 0, color: colors.text, fontSize: fonts.size, lineHeight: 1.6, textAlign: 'justify' }}>{value}</p>}
            </EditableField>
        </section>
    ) : null;

    // =========== SIDEBAR LAYOUTS ===========

    if (isSidebar) {
        const isRight = config.genes.layout === 'sidebar-right-25';
        const sidebarContent = (
            <div style={{
                background: colors.primary,
                padding: densityStyle.padding,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: densityStyle.gap
            }}>
                <DynamicHeader headerType={config.genes.header} colors={colors} fonts={fonts} mode={mode} />
                {renderSkills()}
                {renderLanguages()}
            </div>
        );

        const mainContent = (
            <div style={{
                background: colors.bg,
                padding: densityStyle.padding,
                display: 'flex',
                flexDirection: 'column',
                gap: densityStyle.gap
            }}>
                {renderSummary()}
                {renderExperiences()}
                {renderEducation()}
            </div>
        );

        return (
            <div style={{
                width: '210mm',
                height: '297mm',
                maxHeight: '297mm',
                overflow: 'hidden',
                background: colors.bg,
                fontFamily: fonts.body,
                fontSize: fonts.size,
                color: colors.text,
                display: 'grid',
                gridTemplateColumns: isRight ? '75% 25%' : '25% 75%',
                boxSizing: 'border-box'
            }}>
                {isRight ? <>{mainContent}{sidebarContent}</> : <>{sidebarContent}{mainContent}</>}
            </div>
        );
    }

    // =========== STANDARD LAYOUTS ===========

    return (
        <div style={{
            width: '210mm',
            height: '297mm',
            maxHeight: '297mm',
            overflow: 'hidden',
            padding: densityStyle.padding,
            background: isDarkMode ? colors.bg : '#ffffff',
            fontFamily: fonts.body,
            fontSize: fonts.size,
            color: colors.text,
            boxSizing: 'border-box'
        }}>
            <DynamicHeader headerType={config.genes.header} colors={colors} fonts={fonts} mode={mode} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: densityStyle.gap }}>
                {renderSummary()}
                {renderExperiences()}
                {renderEducation()}
                {renderSkills()}
                {renderLanguages()}
            </div>
        </div>
    );
};

export default DynamicTemplate;
